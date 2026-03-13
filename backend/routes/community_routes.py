"""Community routes - forum, visitation, court hearings"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel

from database import get_db
from auth import get_current_user
from utils.credits import get_case_with_ownership, require_tier
from models.schemas import ForumPostCreate, NotepadEntryCreate, NotepadEntryUpdate, VisitationCreate, CourtHearingCreate


router = APIRouter()

@router.post("/api/forum/posts")
async def create_forum_post(post_data: ForumPostCreate, current_user: dict = Depends(get_current_user)):
    """Create forum post"""
    db = get_db()
    post_id = str(uuid.uuid4())
    
    user = await db.users.find_one({"_id": current_user["user_id"]})
    
    post = {
        "_id": post_id,
        "user_id": current_user["user_id"],
        "author_name": user.get("name", "Anonymous"),
        "title": post_data.title,
        "content": post_data.content,
        "category": post_data.category,
        "tags": post_data.tags,
        "replies": [],
        "likes": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.forum_posts.insert_one(post)
    post["id"] = post.pop("_id")
    return post

@router.get("/api/forum/posts")
async def list_forum_posts(
    category: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """List forum posts"""
    db = get_db()
    query = {}
    if category:
        query["category"] = category
    
    posts = []
    async for post in db.forum_posts.find(query).sort("created_at", -1).skip(skip).limit(limit):
        post["id"] = post.pop("_id")
        posts.append(post)
    
    total = await db.forum_posts.count_documents(query)
    
    return {"posts": posts, "total": total}


# ============== ADVOCATE DIRECTORY ==============

@router.get("/api/advocates")
async def get_advocates(state: Optional[str] = None):
    """Get advocate directory"""
    db = get_db()
    query = {}
    if state:
        query["state"] = state.upper()
    
    advocates = []
    async for a in db.advocate_directory.find(query):
        a["id"] = a.pop("_id")
        advocates.append(a)
    
    return {"advocates": advocates}


# ============== LEGAL NOTEPAD ==============

@router.post("/api/notepad")
async def create_notepad_entry(entry: NotepadEntryCreate, current_user: dict = Depends(require_tier("essential", feature_key="ai_chat"))):
    """Create a new notepad entry - can be global or case-specific"""
    db = get_db()
    entry_id = str(uuid.uuid4())
    
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": entry.case_id,  # None for global notes
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

@router.get("/api/notepad")
async def list_notepad_entries(
    case_id: Optional[str] = None,
    category: Optional[str] = None,
    global_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """List notepad entries - filter by case or get global notes"""
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

@router.get("/api/notepad/{entry_id}")
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

@router.put("/api/notepad/{entry_id}")
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
    
    await db.notepad_entries.update_one(
        {"_id": entry_id},
        {"$set": update_data}
    )
    
    updated = await db.notepad_entries.find_one({"_id": entry_id})
    updated["id"] = updated.pop("_id")
    return updated

@router.delete("/api/notepad/{entry_id}")
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

@router.post("/api/notepad/save-from-library")
async def save_from_law_library(
    state_code: str = Body(...),
    case_id: Optional[str] = Body(None),
    title: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """Quick save state law info to notepad"""
    db = get_db()
    state_code = state_code.upper()
    state_name = STATES_INFO.get(state_code)
    
    if not state_name:
        raise HTTPException(status_code=404, detail="State not found")
    
    state_data = STATE_CPS_DATABASE.get(state_code)
    if state_data:
        content = format_state_law_info(state_code, state_name, state_data)
    else:
        content = get_generic_state_info(state_code, state_name)
    
    entry_id = str(uuid.uuid4())
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": case_id,
        "title": title or f"{state_name} CPS Law Reference",
        "content": content,
        "category": "statute",
        "state": state_code,
        "source_type": "law_library",
        "source_reference": f"/api/law-library/{state_code}",
        "tags": ["cps_law", state_code.lower(), "state_statute"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notepad_entries.insert_one(notepad_entry)
    notepad_entry["id"] = notepad_entry.pop("_id")
    return notepad_entry

@router.post("/api/notepad/save-from-courtlistener")
async def save_from_courtlistener(
    case_name: str = Body(...),
    citation: str = Body(...),
    court: str = Body(...),
    date_filed: str = Body(...),
    snippet: str = Body(...),
    url: str = Body(...),
    case_id: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """Save CourtListener case to notepad"""
    db = get_db()
    entry_id = str(uuid.uuid4())
    
    content = f"""
═══════════════════════════════════════════════════════════════════
                    COURT OPINION REFERENCE
═══════════════════════════════════════════════════════════════════

📋 CASE NAME
   {case_name}

📚 CITATION
   {citation}

🏛️ COURT
   {court}

📅 DATE FILED
   {date_filed}

📝 RELEVANT EXCERPT
   {snippet}

🔗 FULL OPINION
   {url}

═══════════════════════════════════════════════════════════════════
"""
    
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": case_id,
        "title": case_name,
        "content": content,
        "category": "case_law",
        "state": None,
        "source_type": "courtlistener",
        "source_reference": url,
        "tags": ["case_law", "courtlistener", court.lower().replace(" ", "_")],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notepad_entries.insert_one(notepad_entry)
    notepad_entry["id"] = notepad_entry.pop("_id")
    return notepad_entry


# ============== PDF EXPORT ==============

# IMPORTANT: /all/pdf route must come BEFORE /{entry_id}/pdf to avoid route matching issues

@router.post("/api/visitation")
async def create_visitation(
    case_id: str = Body(...),
    date: str = Body(...),
    time: str = Body(default="10:00"),
    duration: int = Body(default=60),
    location: str = Body(default=""),
    supervisor: str = Body(default=""),
    child_emotional_state: str = Body(default="happy"),
    what_happened: str = Body(default=""),
    child_quotes: str = Body(default=""),
    supervisor_issues: str = Body(default=""),
    visit_allowed: bool = Body(default=True),
    reason_denied: str = Body(default=""),
    notes: str = Body(default=""),
    current_user: dict = Depends(get_current_user)
):
    """Log a visitation with your children"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    visit_id = str(uuid.uuid4())
    visit = {
        "_id": visit_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "date": date,
        "time": time,
        "duration": duration,
        "location": location,
        "supervisor": supervisor,
        "child_emotional_state": child_emotional_state,
        "what_happened": what_happened,
        "child_quotes": child_quotes,
        "supervisor_issues": supervisor_issues,
        "visit_allowed": visit_allowed,
        "reason_denied": reason_denied,
        "notes": notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.visitations.insert_one(visit)
    visit["id"] = visit.pop("_id")
    return visit

@router.get("/api/visitation/{case_id}")
async def get_visitations(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all visitation logs for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    visits = await db.visitations.find({"case_id": case_id}).sort("date", -1).to_list(200)
    for v in visits:
        v["id"] = v.pop("_id")
    
    # Calculate stats
    total_visits = len(visits)
    denied_visits = len([v for v in visits if not v.get("visit_allowed", True)])
    total_hours = sum(v.get("duration", 0) for v in visits) / 60
    
    return {
        "visits": visits,
        "stats": {
            "total_visits": total_visits,
            "denied_visits": denied_visits,
            "total_hours": round(total_hours, 1),
            "denial_rate": round((denied_visits / total_visits * 100) if total_visits > 0 else 0, 1)
        }
    }


# ============== COURT HEARINGS & COUNTDOWN ==============

HEARING_TYPES = [
    {"value": "detention", "label": "Detention Hearing (Emergency Removal)", "color": "red", "prep_days": 1},
    {"value": "adjudication", "label": "Adjudication Hearing (Did abuse/neglect occur?)", "color": "orange", "prep_days": 14},
    {"value": "disposition", "label": "Disposition Hearing (What happens next?)", "color": "yellow", "prep_days": 14},
    {"value": "review_6", "label": "6-Month Review Hearing", "color": "blue", "prep_days": 7},
    {"value": "review_12", "label": "12-Month Permanency Hearing", "color": "indigo", "prep_days": 14},
    {"value": "review_18", "label": "18-Month Review", "color": "purple", "prep_days": 14},
    {"value": "termination", "label": "Termination of Parental Rights Trial", "color": "red", "prep_days": 30},
    {"value": "appeal", "label": "Appeal Hearing", "color": "gray", "prep_days": 14},
    {"value": "other", "label": "Other Hearing", "color": "gray", "prep_days": 7}
]

DEFAULT_PREP_CHECKLIST = [
    "Review all case documents",
    "Meet with attorney 3+ days before hearing",
    "Prepare testimony and practice answers",
    "Gather all evidence and certificates",
    "Arrange childcare/transportation",
    "Plan professional outfit",
    "Get good night sleep before hearing",
    "Arrive 30 minutes early",
    "Turn off cell phone"
]

WHAT_TO_BRING = [
    "All service completion certificates",
    "Drug test results",
    "Visitation logs",
    "Communication records",
    "Witness list and contact info",
    "Pen and notepad",
    "Copy of case plan",
    "Evidence photos/documents",
    "Character reference letters"
]


@router.get("/api/court-hearings/types")
async def get_hearing_types():
    """Get all hearing types with preparation info"""
    return {
        "hearing_types": HEARING_TYPES,
        "default_checklist": DEFAULT_PREP_CHECKLIST,
        "what_to_bring": WHAT_TO_BRING
    }

@router.post("/api/court-hearings")
async def create_court_hearing(
    case_id: str = Body(...),
    date: str = Body(...),
    time: str = Body(default="09:00"),
    hearing_type: str = Body(...),
    judge: str = Body(default=""),
    location: str = Body(default=""),
    notes: str = Body(default=""),
    current_user: dict = Depends(get_current_user)
):
    """Create a court hearing with countdown and preparation checklist"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    hearing_id = str(uuid.uuid4())
    hearing = {
        "_id": hearing_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "date": date,
        "time": time,
        "hearing_type": hearing_type,
        "judge": judge,
        "location": location,
        "notes": notes,
        "prep_checklist": [{"id": str(i), "text": item, "completed": False} for i, item in enumerate(DEFAULT_PREP_CHECKLIST)],
        "what_to_bring": WHAT_TO_BRING,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.court_hearings.insert_one(hearing)
    hearing["id"] = hearing.pop("_id")
    
    # Calculate countdown
    hearing_date = datetime.strptime(date, "%Y-%m-%d")
    days_until = (hearing_date - datetime.now()).days
    hearing["days_until"] = max(0, days_until)
    
    return hearing

@router.get("/api/court-hearings/{case_id}")
async def get_court_hearings(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all court hearings for a case with countdowns"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    hearings = await db.court_hearings.find({"case_id": case_id}).sort("date", 1).to_list(50)
    
    for h in hearings:
        h["id"] = h.pop("_id")
        # Calculate countdown
        try:
            hearing_date = datetime.strptime(h["date"], "%Y-%m-%d")
            h["days_until"] = max(0, (hearing_date - datetime.now()).days)
        except:
            h["days_until"] = 0
    
    # Get next upcoming hearing
    upcoming = [h for h in hearings if h["days_until"] > 0]
    next_hearing = upcoming[0] if upcoming else None
    
    return {
        "hearings": hearings,
        "next_hearing": next_hearing
    }

@router.put("/api/court-hearings/{hearing_id}/checklist")
async def update_hearing_checklist(
    hearing_id: str,
    checklist: list = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update hearing preparation checklist"""
    db = get_db()
    hearing = await db.court_hearings.find_one({"_id": hearing_id, "user_id": current_user["user_id"]})
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    await db.court_hearings.update_one(
        {"_id": hearing_id},
        {"$set": {"prep_checklist": checklist}}
    )
    
    return {"message": "Checklist updated", "checklist": checklist}


# ============== RIGHTS GUIDE ==============


