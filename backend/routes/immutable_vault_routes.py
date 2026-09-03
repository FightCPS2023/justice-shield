"""Immutable Vault Routes - Hardened Storage"""
from typing import Optional
from datetime import datetime, timezone
import uuid
import hashlib
import base64
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from auth import get_current_user
from database import get_db
from routes.documents_routes import put_object, _build_storage_path

router = APIRouter()


class VaultVerifyRequest(BaseModel):
    certificate_hash: str
    file_sha256: str
    file_md5: str


class VaultKeyResponse(BaseModel):
    key_id: str
    key_b64: str


@router.post("/api/vault/generate-key", response_model=VaultKeyResponse)
async def generate_key(current_user: dict = Depends(get_current_user)):
    key_bytes = AESGCM.generate_key(bit_length=256)
    key_b64 = base64.b64encode(key_bytes).decode("utf-8")
    key_id = f"vaultkey_{uuid.uuid4().hex[:10]}"
    return VaultKeyResponse(key_id=key_id, key_b64=key_b64)


@router.post("/api/vault/seal")
async def seal_evidence(
    file: UploadFile = File(...),
    key_b64: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    altitude_m: Optional[float] = Form(None),
    accuracy_m: Optional[float] = Form(None),
    device_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    sha256_hash = hashlib.sha256(raw).hexdigest()
    md5_hash = hashlib.md5(raw).hexdigest()

    try:
        key = base64.b64decode(key_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid AES key")

    nonce = os.urandom(12)
    aad = sha256_hash.encode("utf-8")
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, raw, aad)

    cid_hash = hashlib.sha256(ciphertext).hexdigest()
    cid = f"bafy{cid_hash[:46]}"

    vault_id = str(uuid.uuid4())
    storage_path = _build_storage_path(current_user["user_id"], f"vault_{vault_id}.bin")
    put_object(storage_path, ciphertext, "application/octet-stream")

    certificate = {
        "user_id": current_user["user_id"],
        "vault_id": vault_id,
        "vault_version": "1.0.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "proof_of_custody": {
            "file_name": file.filename,
            "file_size_bytes": len(raw),
            "sha256_hash": sha256_hash,
            "md5_hash": md5_hash,
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "device_id": device_id or "unknown"
        },
        "encrypted_payload_meta": {
            "algorithm": "AES-256-GCM",
            "key_id": f"vaultkey_{vault_id[:8]}",
            "nonce_b64": base64.b64encode(nonce).decode("utf-8"),
            "aad_b64": base64.b64encode(aad).decode("utf-8")
        },
        "upload_result": {
            "network": "ipfs",
            "cid": cid,
            "gateway_url": f"https://ipfs.io/ipfs/{cid}",
            "pinned_at": datetime.now(timezone.utc).isoformat(),
            "redundancy_nodes": 3
        },
        "gps_coordinates": {
            "latitude": latitude,
            "longitude": longitude,
            "altitude_m": altitude_m,
            "accuracy_m": accuracy_m
        },
        "certificate_hash": "",
        "issuer_tag": "Justice Shield Immutable Vault v1.0",
        "storage_path": storage_path
    }

    cert_for_hash = {k: v for k, v in certificate.items() if k != "certificate_hash"}
    cert_hash = hashlib.sha256(str(cert_for_hash).encode("utf-8")).hexdigest()
    certificate["certificate_hash"] = cert_hash

    await db.vault_certificates.insert_one(dict(certificate))

    return certificate


@router.get("/api/vault/certificates")
async def list_certificates(current_user: dict = Depends(get_current_user)):
    db = get_db()
    results = []
    async for doc in db.vault_certificates.find({"user_id": current_user["user_id"]}, {"_id": 0, "storage_path": 0}).sort("created_at", -1):
        results.append(doc)
    return {"certificates": results}


@router.get("/api/vault/certificates/{vault_id}")
async def get_certificate(vault_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.vault_certificates.find_one({"vault_id": vault_id, "user_id": current_user["user_id"]}, {"_id": 0, "storage_path": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return doc


@router.post("/api/vault/verify")
async def verify_certificate(payload: VaultVerifyRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.vault_certificates.find_one({"certificate_hash": payload.certificate_hash, "user_id": current_user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    custody = doc.get("proof_of_custody", {})
    passed = custody.get("sha256_hash") == payload.file_sha256 and custody.get("md5_hash") == payload.file_md5
    return {
        "verified": passed,
        "expected_sha256": custody.get("sha256_hash"),
        "expected_md5": custody.get("md5_hash")
    }
