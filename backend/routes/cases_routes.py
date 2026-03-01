"""
CPS Punisher - Cases Routes
Case CRUD operations and case summary
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from auth import get_current_user
from models.schemas import CaseCreate, CaseUpdate

router = APIRouter(prefix="/api/cases", tags=["Cases"])


async def get_case_with_ownership(case_id: str, user_id: str):
    """Helper to get case and verify ownership"""
    db = get_db()
    case = await db.cases.find_one({"_id": case_id, "user_id": user_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post("")
async def create_case(case_data: CaseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new CPS case"""
    db = get_db()
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


@router.get("")
async def list_cases(current_user: dict = Depends(get_current_user)):
    """List all cases for the current user"""
    db = get_db()
    cases = []
    async for case in db.cases.find({"user_id": current_user["user_id"]}):
        case["id"] = case.pop("_id")
        del case["user_id"]
        
        case["violation_count"] = await db.violations.count_documents({"case_id": case["id"]})
        case["document_count"] = await db.documents.count_documents({"case_id": case["id"]})
        case["event_count"] = await db.timeline_events.count_documents({"case_id": case["id"]})
        
        cases.append(case)
    return {"cases": cases}


@router.get("/{case_id}")
async def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific case with all related data"""
    db = get_db()
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    case["id"] = case.pop("_id")
    
    case["violation_count"] = await db.violations.count_documents({"case_id": case_id})
    case["document_count"] = await db.documents.count_documents({"case_id": case_id})
    case["event_count"] = await db.timeline_events.count_documents({"case_id": case_id})
    case["evidence_count"] = await db.evidence_items.count_documents({"case_id": case_id})
    case["strategy_count"] = await db.strategies.count_documents({"case_id": case_id})
    
    return case


@router.put("/{case_id}")
async def update_case(case_id: str, case_data: CaseUpdate, current_user: dict = Depends(get_current_user)):
    """Update a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    update_data = {k: v for k, v in case_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.cases.update_one({"_id": case_id}, {"$set": update_data})
    return {"message": "Case updated successfully"}


@router.delete("/{case_id}")
async def delete_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a case and all related data"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
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


@router.get("/{case_id}/summary")
async def get_case_summary(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get comprehensive case summary for AI analysis"""
    db = get_db()
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        v["id"] = v.pop("_id")
        violations.append(v)
    
    timeline = []
    async for e in db.timeline_events.find({"case_id": case_id}).sort("date", 1):
        e["id"] = e.pop("_id")
        timeline.append(e)
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}):
        e["id"] = e.pop("_id")
        evidence.append(e)
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}):
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
