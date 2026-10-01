"""Cite-Guard citation verification API"""
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import get_db
from auth import get_current_user
from ai_mission import citation_log_for, library_authorities

router = APIRouter()


class CitationLogRequest(BaseModel):
    text: str
    case_id: Optional[str] = None
    check_courtlistener: bool = True


@router.post("/api/citations/log")
async def create_citation_log(payload: CitationLogRequest, current_user: dict = Depends(get_current_user)):
    return await citation_log_for(get_db(), payload.text, payload.case_id, current_user["user_id"], payload.check_courtlistener)


@router.get("/api/citations/library")
async def get_verified_library(current_user: dict = Depends(get_current_user)):
    items = library_authorities()
    return {"authorities": items, "total": len(items)}
