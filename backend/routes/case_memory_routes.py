"""Case memory routes"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
from database import get_db
from utils.credits import get_case_with_ownership, save_case_memory

router = APIRouter()


class CaseMemoryCreate(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []


@router.get("/api/cases/{case_id}/memory")
async def list_case_memory(case_id: str, current_user: dict = Depends(get_current_user)):
    """List memory entries for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    db = get_db()
    memories = []
    async for entry in db.case_memory.find({"case_id": case_id, "user_id": current_user["user_id"]}).sort("created_at", -1):
        entry["id"] = entry.pop("_id")
        memories.append(entry)
    return {"memory": memories}


@router.post("/api/cases/{case_id}/memory")
async def create_case_memory(case_id: str, payload: CaseMemoryCreate, current_user: dict = Depends(get_current_user)):
    """Add a memory entry to a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    memory_id = await save_case_memory(
        case_id=case_id,
        user_id=current_user["user_id"],
        title=payload.title,
        content=payload.content,
        tags=payload.tags or [],
        source="manual",
        metadata={"created_by": "user"}
    )
    return {
        "id": memory_id,
        "case_id": case_id,
        "title": payload.title,
        "content": payload.content,
        "tags": payload.tags or [],
        "source": "manual",
        "created_at": datetime.now(timezone.utc).isoformat()
    }


@router.delete("/api/cases/{case_id}/memory/{memory_id}")
async def delete_case_memory(case_id: str, memory_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a memory entry"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    db = get_db()
    result = await db.case_memory.delete_one({"_id": memory_id, "case_id": case_id, "user_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    return {"success": True, "id": memory_id}
