"""Political Strike Routes - Mass Escalation"""
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import json
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import get_current_user
from database import get_db

router = APIRouter()

CONTACTS_SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "seed_political_contacts.json")


class DossierRequest(BaseModel):
    case_title: str
    caseworker_name: str
    agency: Optional[str] = None
    violations: List[str] = Field(default_factory=list)
    vault_refs: List[str] = Field(default_factory=list)
    foia_status: Optional[str] = None
    section_1983_status: Optional[str] = None
    narrative: Optional[str] = None


class DispatchRequest(BaseModel):
    dossier_id: str
    target_ids: List[str]


def _render_dossier(payload: DossierRequest) -> str:
    violations_block = "\n".join([f"{idx+1}. {v}" for idx, v in enumerate(payload.violations)]) or "1. [No violations provided]"
    vault_block = "\n".join([f"- {ref}" for ref in payload.vault_refs]) or "- None"

    return f"""JUSTICE SHIELD — POLITICAL STRIKE ENGINE
CLASSIFICATION: URGENT — CONSTITUTIONAL RIGHTS EMERGENCY

SECTION I: SUBJECT
Case Title: {payload.case_title}
Caseworker: {payload.caseworker_name}
Agency: {payload.agency or '[AGENCY]'}

SECTION II: DOCUMENTED CONSTITUTIONAL VIOLATIONS
{violations_block}

SECTION III: IMMUTABLE VAULT EVIDENCE REFERENCES
{vault_block}

SECTION IV: LEGAL STATUS
FOIA Filed: {payload.foia_status or 'Unknown'}
§1983 Served: {payload.section_1983_status or 'Unknown'}

SECTION V: CALL TO ACTION
- Investigate immediate constitutional violations
- Require public response from agency leadership
- Initiate legislative oversight or emergency hearing
- Preserve evidence and contact affected families

SECTION VI: CERTIFICATION & PRESERVATION NOTICE
This dossier is issued to preserve evidence of systemic misconduct and to request immediate oversight.

{payload.narrative or ''}
"""


async def _seed_contacts(db):
    existing = await db.political_contacts.count_documents({})
    if existing > 0:
        return
    if not os.path.exists(CONTACTS_SEED_PATH):
        return
    with open(CONTACTS_SEED_PATH, "r") as f:
        data = json.load(f)
    for item in data:
        item["contact_id"] = f"contact_{uuid.uuid4().hex[:10]}"
    if data:
        await db.political_contacts.insert_many(data)


@router.get("/api/political-strike/contacts")
async def get_contacts(state: Optional[str] = Query(None), role: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    db = get_db()
    await _seed_contacts(db)
    query = {}
    if state:
        query["state"] = state.upper()
    if role:
        query["role"] = role
    contacts = []
    async for doc in db.political_contacts.find(query, {"_id": 0}).sort("role", 1):
        contacts.append(doc)
    return {"contacts": contacts}


@router.post("/api/political-strike/generate-dossier")
async def generate_dossier(payload: DossierRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    dossier_id = str(uuid.uuid4())
    document = _render_dossier(payload)
    doc = {
        "user_id": current_user["user_id"],
        "dossier_id": dossier_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "payload": payload.model_dump(),
        "document": document
    }
    await db.corruption_dossiers.insert_one(doc)
    return {"dossier_id": dossier_id, "document": document}


@router.get("/api/political-strike/dossiers")
async def list_dossiers(current_user: dict = Depends(get_current_user)):
    db = get_db()
    dossiers = []
    async for doc in db.corruption_dossiers.find({"user_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1):
        dossiers.append(doc)
    return {"dossiers": dossiers}


@router.get("/api/political-strike/dossiers/{dossier_id}")
async def get_dossier(dossier_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.corruption_dossiers.find_one({"dossier_id": dossier_id, "user_id": current_user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Dossier not found")
    return doc


@router.post("/api/political-strike/dispatch")
async def dispatch_dossier(payload: DispatchRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    dossier = await db.corruption_dossiers.find_one({"dossier_id": payload.dossier_id, "user_id": current_user["user_id"]})
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")

    await _seed_contacts(db)
    contacts = await db.political_contacts.find({"contact_id": {"$in": payload.target_ids}}, {"_id": 0}).to_list(100)
    report_id = str(uuid.uuid4())
    report = {
        "report_id": report_id,
        "user_id": current_user["user_id"],
        "dossier_id": payload.dossier_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "SIMULATED",
        "targets": [
            {
                "contact_id": c.get("contact_id"),
                "name": c.get("name"),
                "role": c.get("role"),
                "status": "SIMULATED",
                "transport": "SIMULATED"
            }
            for c in contacts
        ]
    }
    await db.dispatch_reports.insert_one(report)
    return report


@router.get("/api/political-strike/dispatch-reports/{report_id}")
async def get_dispatch_report(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.dispatch_reports.find_one({"report_id": report_id, "user_id": current_user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Dispatch report not found")
    return doc
