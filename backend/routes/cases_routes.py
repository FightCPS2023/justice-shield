"""Case routes - CRUD, summaries, AI notes"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from auth import get_current_user
from utils.credits import get_user_tier, check_case_limit, get_case_with_ownership
from models.schemas import CaseCreate, CaseUpdate


router = APIRouter()

# ============== AI CASE NOTES SYSTEM ==============
# Automatically saves AI responses to case files for reference

async def save_ai_response_to_case(
    case_id: str,
    user_id: str,
    feature_type: str,
    prompt: str,
    response: str,
    metadata: dict = None
):
    """Helper to save AI responses to a case"""
    db = get_db()
    if not case_id:
        return None
    
    note_id = str(uuid.uuid4())
    ai_note = {
        "_id": note_id,
        "case_id": case_id,
        "user_id": user_id,
        "feature_type": feature_type,  # chat, analysis, strategy, research, document, forensic
        "prompt": prompt[:2000] if prompt else "",  # Truncate long prompts
        "response": response,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.ai_case_notes.insert_one(ai_note)
    return note_id

@router.get("/api/cases/{case_id}/ai-notes")
async def get_case_ai_notes(
    case_id: str,
    feature_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get all AI-generated notes for a case"""
    db = get_db()
    # Verify case ownership
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    query = {"case_id": case_id, "user_id": current_user["user_id"]}
    if feature_type:
        query["feature_type"] = feature_type
    
    notes = []
    async for note in db.ai_case_notes.find(query).sort("created_at", -1).skip(skip).limit(limit):
        notes.append({
            "id": note["_id"],
            "feature_type": note.get("feature_type"),
            "prompt": note.get("prompt"),
            "response": note.get("response"),
            "metadata": note.get("metadata", {}),
            "created_at": note.get("created_at")
        })
    
    total = await db.ai_case_notes.count_documents(query)
    
    # Get feature type counts
    feature_counts = {}
    async for fc in db.ai_case_notes.aggregate([
        {"$match": {"case_id": case_id, "user_id": current_user["user_id"]}},
        {"$group": {"_id": "$feature_type", "count": {"$sum": 1}}}
    ]):
        feature_counts[fc["_id"]] = fc["count"]
    
    return {
        "notes": notes,
        "total": total,
        "feature_counts": feature_counts,
        "skip": skip,
        "limit": limit
    }

@router.delete("/api/cases/{case_id}/ai-notes/{note_id}")
async def delete_ai_note(case_id: str, note_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a specific AI note from a case"""
    db = get_db()
    result = await db.ai_case_notes.delete_one({
        "_id": note_id,
        "case_id": case_id,
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"success": True, "message": "AI note deleted"}

# ============== CASES ENDPOINTS ==============

@router.post("/api/cases")
async def create_case(case_data: CaseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new CPS case"""
    db = get_db()
    # Enforce case limit
    user_tier = await get_user_tier(current_user["user_id"])
    if not await check_case_limit(current_user["user_id"], user_tier):
        raise HTTPException(status_code=403, detail="Case limit reached for your plan. Please upgrade to create more cases.")
    case_id = str(uuid.uuid4())
    case_doc = {
        "_id": case_id,
        "user_id": current_user["user_id"],
        "title": case_data.title,
        "description": case_data.description,
        "state": case_data.state,
        "county": case_data.county,
        "children_names": case_data.children_names,
        "case_number": case_data.case_number,
        "caseworker_name": case_data.caseworker_name,
        "attorney_name": case_data.attorney_name,
        "judge_name": case_data.judge_name,
        "court_name": case_data.court_name,
        "date_opened": case_data.date_opened,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cases.insert_one(case_doc)
    case_doc["id"] = case_doc.pop("_id")
    return case_doc

@router.get("/api/cases")
async def list_cases(current_user: dict = Depends(get_current_user)):
    """List all cases for the current user"""
    db = get_db()
    cases = []
    async for case in db.cases.find({"user_id": current_user["user_id"]}).sort("created_at", -1).limit(100):
        case["id"] = case.pop("_id")
        del case["user_id"]
        
        # Get counts for each case
        case["violation_count"] = await db.violations.count_documents({"case_id": case["id"]})
        case["document_count"] = await db.documents.count_documents({"case_id": case["id"]})
        case["event_count"] = await db.timeline_events.count_documents({"case_id": case["id"]})
        
        cases.append(case)
    return {"cases": cases}

@router.get("/api/cases/{case_id}")
async def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific case with all related data"""
    db = get_db()
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    case["id"] = case.pop("_id")
    
    # Get related data counts
    case["violation_count"] = await db.violations.count_documents({"case_id": case_id})
    case["document_count"] = await db.documents.count_documents({"case_id": case_id})
    case["event_count"] = await db.timeline_events.count_documents({"case_id": case_id})
    case["evidence_count"] = await db.evidence_items.count_documents({"case_id": case_id})
    case["strategy_count"] = await db.strategies.count_documents({"case_id": case_id})
    
    return case

@router.put("/api/cases/{case_id}")
async def update_case(case_id: str, case_data: CaseUpdate, current_user: dict = Depends(get_current_user)):
    """Update a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    update_data = {k: v for k, v in case_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.cases.update_one({"_id": case_id}, {"$set": update_data})
    return {"message": "Case updated successfully"}

@router.delete("/api/cases/{case_id}")
async def delete_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a case and all related data"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Delete all related data
    collections_to_clean = [
        "documents", "violations", "timeline_events", "strategies",
        "evidence_items", "communications", "service_records",
        "court_filings", "case_law_citations", "judge_research",
        "criminal_cases", "generated_documents"
    ]
    
    for collection in collections_to_clean:
        await db[collection].delete_many({"case_id": case_id})
    
    await db.cases.delete_one({"_id": case_id})
    return {"message": "Case and all related data deleted"}

@router.get("/api/cases/{case_id}/summary")
async def get_case_summary(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get comprehensive case summary for AI analysis"""
    db = get_db()
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Gather all case data with limits for performance
    violations = []
    async for v in db.violations.find({"case_id": case_id}).limit(500):
        v["id"] = v.pop("_id")
        violations.append(v)
    
    timeline = []
    async for e in db.timeline_events.find({"case_id": case_id}).sort("date", 1).limit(500):
        e["id"] = e.pop("_id")
        timeline.append(e)
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}).limit(500):
        e["id"] = e.pop("_id")
        evidence.append(e)
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}).limit(200):
        s["id"] = s.pop("_id")
        strategies.append(s)
    
    case["id"] = case.pop("_id")
    
    return {
        "case": case,
        "violations": violations,
        "timeline": timeline,
        "evidence": evidence,
        "strategies": strategies,
        "stats": {
            "total_violations": len(violations),
            "total_events": len(timeline),
            "total_evidence": len(evidence),
            "total_strategies": len(strategies)
        }
    }


