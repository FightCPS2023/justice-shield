from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth import get_current_user
from engines.foia_bot_engine import get_available_states, generate_foia_package
from utils.credits import save_ai_response_to_case

router = APIRouter()

class FoiaRequest(BaseModel):
    user_name: str
    state: str
    caseworker_name: str
    agency_name: str
    case_id: str | None = None


@router.get('/api/foia/states')
async def foia_states(current_user: dict = Depends(get_current_user)):
    return {"states": get_available_states()}


@router.post('/api/foia/generate')
async def foia_generate(payload: FoiaRequest, current_user: dict = Depends(get_current_user)):
    if not payload.user_name.strip():
        raise HTTPException(status_code=400, detail='Your name is required')
    if not payload.caseworker_name.strip():
        raise HTTPException(status_code=400, detail='Caseworker name is required')
    if not payload.agency_name.strip():
        raise HTTPException(status_code=400, detail='Agency name is required')

    try:
        package = generate_foia_package(
            user_name=payload.user_name,
            state=payload.state,
            caseworker_name=payload.caseworker_name,
            agency_name=payload.agency_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if payload.case_id:
        await save_ai_response_to_case(
            case_id=payload.case_id,
            user_id=current_user["user_id"],
            feature_type="foia_request",
            prompt=f"FOIA request for {payload.caseworker_name} ({payload.agency_name})",
            response=package.get("document_markdown", ""),
            metadata={"state": package.get("state"), "statute": package.get("statute")}
        )

    return package
