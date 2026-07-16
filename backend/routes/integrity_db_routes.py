"""Integrity Database Routes - Caseworker Integrity Database"""
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import get_current_user
from database import get_db

router = APIRouter()

VIOLATION_TYPES = [
    "Unlawful Home Entry (4th)",
    "Warrantless Child Removal (4th/14th)",
    "Coerced Consent",
    "Denial of Counsel (6th)",
    "False Report",
    "Failure to Identify",
    "Retaliation (1st)",
    "Due Process Violation (14th)",
    "Equal Protection (14th)",
    "Perjury",
    "Evidence Tampering",
    "Privacy Violation (4th)",
    "Bond Default",
    "§1983 Notice Ignored",
    "Other",
]


class ViolationLog(BaseModel):
    violation_type: str
    incident_date: str
    description: str
    section_1983_link: Optional[str] = None
    evidence_hash: Optional[str] = None
    reported_by: Optional[str] = None


class CaseworkerProfileCreate(BaseModel):
    name: str
    badge_number: Optional[str] = None
    agency: Optional[str] = None
    region: Optional[str] = None
    supervisor: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None


class CaseworkerProfileUpdate(BaseModel):
    name: Optional[str] = None
    badge_number: Optional[str] = None
    agency: Optional[str] = None
    region: Optional[str] = None
    supervisor: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None


@router.post("/api/integrity-db/profiles")
async def create_profile(payload: CaseworkerProfileCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    profile_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": current_user["user_id"],
        "profile_id": profile_id,
        "created_at": now,
        "updated_at": now,
        "name": payload.name,
        "badge_number": payload.badge_number,
        "agency": payload.agency,
        "region": payload.region,
        "supervisor": payload.supervisor,
        "phone": payload.phone,
        "email": payload.email,
        "notes": payload.notes,
        "violations": []
    }
    await db.caseworker_profiles.insert_one(doc)
    return {"profile_id": profile_id, "profile": doc}


@router.get("/api/integrity-db/profiles")
async def list_profiles(current_user: dict = Depends(get_current_user)):
    db = get_db()
    profiles = []
    async for doc in db.caseworker_profiles.find({"user_id": current_user["user_id"]}, {"_id": 0}).sort("updated_at", -1):
        profiles.append(doc)
    return {"profiles": profiles}


@router.get("/api/integrity-db/profiles/{profile_id}")
async def get_profile(profile_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.caseworker_profiles.find_one({"profile_id": profile_id, "user_id": current_user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Profile not found")
    return doc


@router.put("/api/integrity-db/profiles/{profile_id}")
async def update_profile(profile_id: str, payload: CaseworkerProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        return {"success": True, "message": "No changes"}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.caseworker_profiles.update_one(
        {"profile_id": profile_id, "user_id": current_user["user_id"]},
        {"$set": update_fields}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    doc = await db.caseworker_profiles.find_one({"profile_id": profile_id, "user_id": current_user["user_id"]}, {"_id": 0})
    return {"success": True, "profile": doc}


@router.delete("/api/integrity-db/profiles/{profile_id}")
async def delete_profile(profile_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.caseworker_profiles.delete_one({"profile_id": profile_id, "user_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"success": True}


@router.post("/api/integrity-db/profiles/{profile_id}/violations")
async def log_violation(profile_id: str, payload: ViolationLog, current_user: dict = Depends(get_current_user)):
    db = get_db()
    profile = await db.caseworker_profiles.find_one({"profile_id": profile_id, "user_id": current_user["user_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    violation_id = str(uuid.uuid4())
    violation = {
        "violation_id": violation_id,
        "violation_type": payload.violation_type,
        "incident_date": payload.incident_date,
        "description": payload.description,
        "section_1983_link": payload.section_1983_link,
        "evidence_hash": payload.evidence_hash,
        "reported_by": payload.reported_by or current_user.get("email"),
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.caseworker_profiles.update_one(
        {"profile_id": profile_id},
        {"$push": {"violations": violation}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "violation": violation}


@router.put("/api/integrity-db/violations/{violation_id}/verify")
async def verify_violation(violation_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.caseworker_profiles.update_one(
        {"user_id": current_user["user_id"], "violations.violation_id": violation_id},
        {"$set": {"violations.$.verified": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Violation not found")
    return {"success": True}


@router.get("/api/integrity-db/profiles/{profile_id}/risk-metrics")
async def get_risk_metrics(profile_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    profile = await db.caseworker_profiles.find_one({"profile_id": profile_id, "user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    violations = profile.get("violations", [])
    total = len(violations)
    verified = len([v for v in violations if v.get("verified")])
    section_1983 = len([v for v in violations if v.get("violation_type") == "§1983 Notice Ignored"])

    constitutional_tags = ["4th", "14th", "1st", "6th"]
    constitutional_violations = len([
        v for v in violations
        if any(tag in v.get("violation_type", "") for tag in constitutional_tags)
    ])

    recency = 0
    now = datetime.now(timezone.utc)
    for v in violations:
        try:
            dt = datetime.fromisoformat(v.get("incident_date"))
        except Exception:
            dt = None
        if dt and (now - dt).days <= 365:
            recency += 1
    recency_score = (recency / total) if total else 0

    if total <= 1:
        risk_level = "LOW"
    elif total <= 3:
        risk_level = "MODERATE"
    elif total <= 6:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    strike_rate = (constitutional_violations / total * 100) if total else 0

    return {
        "total_violations": total,
        "constitutional_violations": constitutional_violations,
        "constitutional_strike_rate": round(strike_rate, 2),
        "verified_violations": verified,
        "section_1983_notices": section_1983,
        "recency_score": round(recency_score, 2),
        "risk_level": risk_level
    }


@router.get("/api/integrity-db/search")
async def search_profiles(q: str = Query(""), current_user: dict = Depends(get_current_user)):
    db = get_db()
    query = {"user_id": current_user["user_id"]}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"badge_number": {"$regex": q, "$options": "i"}},
            {"agency": {"$regex": q, "$options": "i"}}
        ]
    profiles = []
    async for doc in db.caseworker_profiles.find(query, {"_id": 0}).sort("updated_at", -1):
        profiles.append(doc)
    return {"profiles": profiles}
