from dataclasses import asdict
from fastapi import APIRouter, HTTPException, Depends
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
    return {**asdict(response), "citation_log": citation_log}
