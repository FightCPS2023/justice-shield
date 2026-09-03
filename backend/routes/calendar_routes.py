"""Calendar routes"""
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from auth import get_current_user
from models.schemas import CalendarEventCreate


router = APIRouter()

@router.post("/api/calendar")
async def create_calendar_event(event_data: CalendarEventCreate, current_user: dict = Depends(get_current_user)):
    """Create calendar event"""
    db = get_db()
    event_id = str(uuid.uuid4())
    event = {
        "_id": event_id,
        "user_id": current_user["user_id"],
        "title": event_data.title,
        "description": event_data.description,
        "event_date": event_data.event_date,
        "event_time": event_data.event_time,
        "event_type": event_data.event_type,
        "case_id": event_data.case_id,
        "reminder_days": event_data.reminder_days,
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.calendar_events.insert_one(event)
    event["id"] = event.pop("_id")
    return event

@router.get("/api/calendar")
async def list_calendar_events(current_user: dict = Depends(get_current_user)):
    """List all calendar events"""
    db = get_db()
    events = []
    async for e in db.calendar_events.find({"user_id": current_user["user_id"]}).sort("event_date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events}

@router.get("/api/calendar/upcoming/{days}")
async def get_upcoming_events(days: int = 7, current_user: dict = Depends(get_current_user)):
    """Get upcoming events"""
    db = get_db()
    today = datetime.now(timezone.utc).date()
    end_date = today + timedelta(days=days)
    
    events = []
    async for e in db.calendar_events.find({
        "user_id": current_user["user_id"],
        "event_date": {"$gte": today.isoformat(), "$lte": end_date.isoformat()},
        "completed": False
    }).sort("event_date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events, "days": days}

@router.delete("/api/calendar/{event_id}")
async def delete_calendar_event(event_id: str, current_user: dict = Depends(get_current_user)):
    """Delete calendar event"""
    db = get_db()
    result = await db.calendar_events.delete_one({"_id": event_id, "user_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}


