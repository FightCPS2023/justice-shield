"""Case sub-data routes - violations, timeline, strategies, evidence, communications, etc."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from auth import get_current_user
from utils.credits import get_case_with_ownership, require_tier
from models.schemas import ViolationCreate, TimelineEventCreate, StrategyCreate, EvidenceItemCreate, CommunicationLogCreate, ServiceRecordCreate, CourtFilingCreate, CriminalCaseCreate, JudgeResearchCreate


router = APIRouter()

# ============== VIOLATIONS ENDPOINTS ==============

VIOLATION_TYPES = {
    "fourth_amendment": "Fourth Amendment (Illegal Search/Seizure)",
    "fourteenth_amendment": "Fourteenth Amendment (Due Process)",
    "first_amendment": "First Amendment (Free Speech/Religion)",
    "fifth_amendment": "Fifth Amendment (Self-Incrimination)",
    "sixth_amendment": "Sixth Amendment (Right to Counsel)",
    "no_written_notice": "No Written Notice Provided",
    "improper_investigation": "Improper Investigation",
    "missed_deadlines": "Missed Legal Deadlines",
    "no_safety_plan": "No Safety Plan Offered",
    "no_reasonable_efforts": "No Reasonable Efforts",
    "falsified_reports": "Falsified Reports",
    "hearsay_evidence": "Hearsay Evidence",
    "no_physical_evidence": "No Physical Evidence",
    "biased_investigation": "Biased Investigation",
    "cherry_picked_evidence": "Cherry-Picked Evidence",
    "denied_legal_counsel": "Denied Legal Counsel",
    "forced_to_sign": "Forced to Sign Documents",
    "denied_visitation": "Denied Visitation",
    "no_interpreter": "No Interpreter Provided",
    "no_services_offered": "No Services Offered",
    "inappropriate_placement": "Inappropriate Placement",
    "separated_siblings": "Separated Siblings",
    "no_relative_placement": "No Relative Placement",
    "icwa_violation": "ICWA Violation",
    "asfa_violation": "ASFA Violation",
    "capta_violation": "CAPTA Violation",
}

@router.get("/api/violations/types")
async def get_violation_types():
    """Get all available violation types"""
    return {"violation_types": VIOLATION_TYPES}

@router.post("/api/violations")
async def create_violation(violation_data: ViolationCreate, current_user: dict = Depends(get_current_user)):
    """Add a violation to a case"""
    db = get_db()
    await get_case_with_ownership(violation_data.case_id, current_user["user_id"])
    
    violation_id = str(uuid.uuid4())
    violation = {
        "_id": violation_id,
        "case_id": violation_data.case_id,
        "user_id": current_user["user_id"],
        "violation_type": violation_data.violation_type,
        "description": violation_data.description,
        "severity": violation_data.severity,
        "date": violation_data.date,
        "statute_reference": violation_data.statute_reference,
        "constitutional_basis": violation_data.constitutional_basis,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.violations.insert_one(violation)
    violation["id"] = violation.pop("_id")
    return violation

@router.get("/api/violations/{case_id}")
async def list_violations(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all violations for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        v["id"] = v.pop("_id")
        violations.append(v)
    return {"violations": violations}

@router.delete("/api/violations/{violation_id}")
async def delete_violation(violation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a violation"""
    db = get_db()
    violation = await db.violations.find_one({"_id": violation_id, "user_id": current_user["user_id"]})
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    await db.violations.delete_one({"_id": violation_id})
    return {"message": "Violation deleted"}


# ============== TIMELINE ENDPOINTS ==============

@router.post("/api/timeline")
async def create_timeline_event(event_data: TimelineEventCreate, current_user: dict = Depends(get_current_user)):
    """Add a timeline event"""
    db = get_db()
    await get_case_with_ownership(event_data.case_id, current_user["user_id"])
    
    event_id = str(uuid.uuid4())
    event = {
        "_id": event_id,
        "case_id": event_data.case_id,
        "user_id": current_user["user_id"],
        "title": event_data.title,
        "description": event_data.description,
        "date": event_data.date,
        "event_type": event_data.event_type,
        "importance": event_data.importance,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.timeline_events.insert_one(event)
    event["id"] = event.pop("_id")
    return event

@router.get("/api/timeline/{case_id}")
async def list_timeline_events(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all timeline events"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    events = []
    async for e in db.timeline_events.find({"case_id": case_id}).sort("date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events}


# ============== STRATEGIES ENDPOINTS ==============

@router.post("/api/strategies")
async def create_strategy(strategy_data: StrategyCreate, current_user: dict = Depends(get_current_user)):
    """Add a defense strategy"""
    db = get_db()
    await get_case_with_ownership(strategy_data.case_id, current_user["user_id"])
    
    strategy_id = str(uuid.uuid4())
    strategy = {
        "_id": strategy_id,
        "case_id": strategy_data.case_id,
        "user_id": current_user["user_id"],
        "title": strategy_data.title,
        "description": strategy_data.description,
        "priority": strategy_data.priority,
        "legal_basis": strategy_data.legal_basis,
        "case_law_support": strategy_data.case_law_support,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.strategies.insert_one(strategy)
    strategy["id"] = strategy.pop("_id")
    return strategy

@router.get("/api/strategies/{case_id}")
async def list_strategies(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all strategies"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}):
        s["id"] = s.pop("_id")
        strategies.append(s)
    return {"strategies": strategies}


# ============== EVIDENCE ENDPOINTS ==============

@router.post("/api/evidence")
async def create_evidence(evidence_data: EvidenceItemCreate, current_user: dict = Depends(get_current_user)):
    """Add evidence item"""
    db = get_db()
    await get_case_with_ownership(evidence_data.case_id, current_user["user_id"])
    
    evidence_id = str(uuid.uuid4())
    evidence = {
        "_id": evidence_id,
        "case_id": evidence_data.case_id,
        "user_id": current_user["user_id"],
        "title": evidence_data.title,
        "description": evidence_data.description,
        "evidence_type": evidence_data.evidence_type,
        "date_obtained": evidence_data.date_obtained,
        "source": evidence_data.source,
        "supports_defense": evidence_data.supports_defense,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.evidence_items.insert_one(evidence)
    evidence["id"] = evidence.pop("_id")
    return evidence

@router.get("/api/evidence/{case_id}")
async def list_evidence(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all evidence"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}):
        e["id"] = e.pop("_id")
        evidence.append(e)
    return {"evidence": evidence}


# ============== COMMUNICATIONS LOG ENDPOINTS ==============

@router.post("/api/communications")
async def create_communication(comm_data: CommunicationLogCreate, current_user: dict = Depends(get_current_user)):
    """Log a communication"""
    db = get_db()
    await get_case_with_ownership(comm_data.case_id, current_user["user_id"])
    
    comm_id = str(uuid.uuid4())
    comm = {
        "_id": comm_id,
        "case_id": comm_data.case_id,
        "user_id": current_user["user_id"],
        "contact_type": comm_data.contact_type,
        "contact_with": comm_data.contact_with,
        "date": comm_data.date,
        "summary": comm_data.summary,
        "favorable": comm_data.favorable,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.communications.insert_one(comm)
    comm["id"] = comm.pop("_id")
    return comm

@router.get("/api/communications/{case_id}")
async def list_communications(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all communications"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    comms = []
    async for c in db.communications.find({"case_id": case_id}).sort("date", -1):
        c["id"] = c.pop("_id")
        comms.append(c)
    return {"communications": comms}


# ============== SERVICE RECORDS ENDPOINTS ==============

@router.post("/api/services")
async def create_service(service_data: ServiceRecordCreate, current_user: dict = Depends(get_current_user)):
    """Add service record"""
    db = get_db()
    await get_case_with_ownership(service_data.case_id, current_user["user_id"])
    
    service_id = str(uuid.uuid4())
    service = {
        "_id": service_id,
        "case_id": service_data.case_id,
        "user_id": current_user["user_id"],
        "service_type": service_data.service_type,
        "provider": service_data.provider,
        "start_date": service_data.start_date,
        "end_date": service_data.end_date,
        "status": service_data.status,
        "notes": service_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.service_records.insert_one(service)
    service["id"] = service.pop("_id")
    return service

@router.get("/api/services/{case_id}")
async def list_services(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all services"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    services = []
    async for s in db.service_records.find({"case_id": case_id}):
        s["id"] = s.pop("_id")
        services.append(s)
    return {"services": services}


# ============== COURT FILINGS ENDPOINTS ==============

@router.post("/api/court-filings")
async def create_court_filing(filing_data: CourtFilingCreate, current_user: dict = Depends(get_current_user)):
    """Add court filing"""
    db = get_db()
    await get_case_with_ownership(filing_data.case_id, current_user["user_id"])
    
    filing_id = str(uuid.uuid4())
    filing = {
        "_id": filing_id,
        "case_id": filing_data.case_id,
        "user_id": current_user["user_id"],
        "filing_type": filing_data.filing_type,
        "title": filing_data.title,
        "date_filed": filing_data.date_filed,
        "status": filing_data.status,
        "content": filing_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.court_filings.insert_one(filing)
    filing["id"] = filing.pop("_id")
    return filing

@router.get("/api/court-filings/{case_id}")
async def list_court_filings(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all court filings"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    filings = []
    async for f in db.court_filings.find({"case_id": case_id}).sort("date_filed", -1):
        f["id"] = f.pop("_id")
        filings.append(f)
    return {"filings": filings}


# ============== CRIMINAL CASE COMPONENT ==============

@router.post("/api/criminal-case")
async def create_criminal_case(criminal_data: CriminalCaseCreate, current_user: dict = Depends(require_tier("attorney", feature_key="criminal_case"))):
    """Add criminal case linked to CPS case"""
    db = get_db()
    await get_case_with_ownership(criminal_data.case_id, current_user["user_id"])
    
    criminal_id = str(uuid.uuid4())
    criminal = {
        "_id": criminal_id,
        "case_id": criminal_data.case_id,
        "user_id": current_user["user_id"],
        "criminal_case_number": criminal_data.criminal_case_number,
        "charges": criminal_data.charges,
        "court": criminal_data.court,
        "prosecutor": criminal_data.prosecutor,
        "defense_attorney": criminal_data.defense_attorney,
        "bond_status": criminal_data.bond_status,
        "next_court_date": criminal_data.next_court_date,
        "relation_to_cps": criminal_data.relation_to_cps,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.criminal_cases.insert_one(criminal)
    criminal["id"] = criminal.pop("_id")
    return criminal

@router.get("/api/criminal-case/{case_id}")
async def get_criminal_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get criminal case info"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    criminal = await db.criminal_cases.find_one({"case_id": case_id})
    if criminal:
        criminal["id"] = criminal.pop("_id")
    return {"criminal_case": criminal}


# ============== JUDGE RESEARCH ==============

@router.post("/api/judge-research")
async def create_judge_research(judge_data: JudgeResearchCreate, current_user: dict = Depends(require_tier("professional", feature_key="judge_research"))):
    """Add judge research"""
    db = get_db()
    await get_case_with_ownership(judge_data.case_id, current_user["user_id"])
    
    research_id = str(uuid.uuid4())
    research = {
        "_id": research_id,
        "case_id": judge_data.case_id,
        "user_id": current_user["user_id"],
        "judge_name": judge_data.judge_name,
        "court": judge_data.court,
        "research_notes": judge_data.research_notes,
        "known_rulings": judge_data.known_rulings,
        "judicial_philosophy": judge_data.judicial_philosophy,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.judge_research.insert_one(research)
    research["id"] = research.pop("_id")
    return research

@router.get("/api/judge-research/{case_id}")
async def get_judge_research(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get judge research"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    research = await db.judge_research.find_one({"case_id": case_id})
    if research:
        research["id"] = research.pop("_id")
    return {"judge_research": research}


# ============== CALENDAR ENDPOINTS ==============


