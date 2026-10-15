import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query
from database import get_db
from pydantic import BaseModel
from auth import get_current_user
from engines.porch_mode_engine import generate_response
from utils.credits import save_ai_response_to_case
from ai_mission import build_citation_log

router = APIRouter()

class PorchModeRequest(BaseModel):
    transcription: str
    officer_name: str | None = None
    agency: str | None = None
    incident_location: str | None = None
    case_id: str | None = None


@router.post('/api/porch-mode/analyze')
async def analyze_porch_mode(payload: PorchModeRequest, current_user: dict = Depends(get_current_user)):
    if not payload.transcription or not payload.transcription.strip():
        raise HTTPException(status_code=400, detail='Transcription is required')

    response = generate_response(
        raw_transcription=payload.transcription,
        officer_name=payload.officer_name or 'the officer/caseworker identified at this address',
        agency=payload.agency or 'your employing agency',
        incident_location=payload.incident_location or 'this address'
    )

    if payload.case_id:
        await save_ai_response_to_case(
            case_id=payload.case_id,
            user_id=current_user["user_id"],
            feature_type="porch_mode",
            prompt=payload.transcription,
            response=response.summary,
            metadata={
                "flagged": response.flagged,
                "detections": [d.matched_phrase for d in response.detections],
                "location": payload.incident_location,
                "agency": payload.agency
            }
        )

    cites = []
    for d in response.detections:
        cites.extend(d.legal_citations or [])
    citation_log = await build_citation_log("\n".join(cites), check_courtlistener=True)

    db = get_db()
    session_id = str(uuid.uuid4())
    transcript = payload.transcription.strip()
    session_doc = {
        "_id": session_id,
        "session_id": session_id,
        "user_id": current_user["user_id"],
        "case_id": payload.case_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "flagged" if response.flagged else "clear",
        "summary": (response.summary or "")[:400],
        "violation_count": len(response.detections),
        "detections": [d.matched_phrase for d in response.detections],
        "transcript_snippet": transcript[:280],
        "officer_name": payload.officer_name,
        "agency": payload.agency,
        "incident_location": payload.incident_location,
        "citation_counts": citation_log.get("counts", {}),
    }
    await db.porch_mode_sessions.insert_one(dict(session_doc))
    session_doc.pop("_id", None)
    return {**asdict(response), "citation_log": citation_log, "session": session_doc}


@router.get('/api/porch-mode/sessions')
async def list_porch_sessions(
    case_id: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    query = {"user_id": current_user["user_id"]}
    if case_id:
        query["case_id"] = case_id
    total = await db.porch_mode_sessions.count_documents(query)
    cursor = db.porch_mode_sessions.find(query, {"_id": 0}).sort("created_at", -1).skip(offset).limit(limit)
    sessions = [doc async for doc in cursor]
    return {"sessions": sessions, "total": total, "limit": limit, "offset": offset}
