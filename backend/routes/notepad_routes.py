"""
CPS Punisher - Notepad Routes
Legal notepad CRUD and PDF export
"""
import uuid
from io import BytesIO
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import StreamingResponse

from database import get_db
from auth import get_current_user
from models.schemas import NotepadEntryCreate, NotepadEntryUpdate

router = APIRouter(prefix="/api/notepad", tags=["Notepad"])


@router.post("")
async def create_notepad_entry(entry: NotepadEntryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new notepad entry"""
    db = get_db()
    entry_id = str(uuid.uuid4())
    
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": entry.case_id,
        "title": entry.title,
        "content": entry.content,
        "category": entry.category,
        "state": entry.state,
        "source_type": entry.source_type,
        "source_reference": entry.source_reference,
        "tags": entry.tags or [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notepad_entries.insert_one(notepad_entry)
    notepad_entry["id"] = notepad_entry.pop("_id")
    return notepad_entry


@router.get("")
async def list_notepad_entries(
    case_id: Optional[str] = None,
    category: Optional[str] = None,
    global_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """List notepad entries"""
    db = get_db()
    query = {"user_id": current_user["user_id"]}
    
    if global_only:
        query["case_id"] = None
    elif case_id:
        query["case_id"] = case_id
    
    if category:
        query["category"] = category
    
    entries = []
    async for entry in db.notepad_entries.find(query).sort("created_at", -1):
        entry["id"] = entry.pop("_id")
        entries.append(entry)
    
    return {"entries": entries, "total": len(entries)}


@router.get("/{entry_id}")
async def get_notepad_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific notepad entry"""
    db = get_db()
    entry = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not entry:
        raise HTTPException(status_code=404, detail="Note not found")
    
    entry["id"] = entry.pop("_id")
    return entry


@router.put("/{entry_id}")
async def update_notepad_entry(
    entry_id: str,
    update: NotepadEntryUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a notepad entry"""
    db = get_db()
    existing = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.notepad_entries.update_one({"_id": entry_id}, {"$set": update_data})
    
    updated = await db.notepad_entries.find_one({"_id": entry_id})
    updated["id"] = updated.pop("_id")
    return updated


@router.delete("/{entry_id}")
async def delete_notepad_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a notepad entry"""
    db = get_db()
    result = await db.notepad_entries.delete_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"status": "deleted", "id": entry_id}
