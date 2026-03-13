"""ADA compliance routes"""
import uuid
import json
import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY
from utils.credits import require_tier, get_case_with_ownership, save_ai_response_to_case
from ada_knowledge import (
    ADA_FEDERAL_LAW, CPS_ADA_REQUIREMENTS, ADA_CASE_LAW, FALSE_CLAIMS_ACT,
    CIVIL_GUARDIAN_ADA, STATE_ADA_CPS_DATABASE, ADA_COMPLIANCE_CHECKLIST,
    COMMON_ADA_VIOLATIONS, analyze_case_for_ada_violations
)

router = APIRouter()

@router.post("/api/courtlistener/deep-search")
async def deep_case_law_search(
    query: str = Body(...),
    court_type: str = Body(default="all"),
    date_range: str = Body(default="all"),
    case_type: str = Body(default="cps"),
    current_user: dict = Depends(require_tier("attorney"))
):
    """
    Deep search of CourtListener database with CPS-focused filtering.
    Searches 50M+ court opinions for relevant precedents.
    """
    # Build specialized CPS search query
    cps_terms = {
        "cps": "child protective services OR CPS OR DCFS OR DHS OR child welfare",
        "removal": "emergency removal OR child seizure OR removal of children",
        "tpr": "termination parental rights OR TPR OR parental termination",
        "fourth_amendment": "fourth amendment AND (CPS OR child protective OR home entry)",
        "due_process": "due process AND (child welfare OR dependency OR parental rights)",
        "1983": "section 1983 AND (CPS OR caseworker OR social worker OR child welfare)"
    }
    
    enhanced_query = f"{query} ({cps_terms.get(case_type, cps_terms['cps'])})"
    
    courts = {
        "all": "",
        "scotus": "court=scotus",
        "circuit": "court__jurisdiction=F",
        "state_supreme": "court__jurisdiction=S"
    }
    
    try:
        headers = {"User-Agent": "CPS-Punisher-Legal-Research/1.0"}
        if COURTLISTENER_API_KEY:
            headers["Authorization"] = f"Token {COURTLISTENER_API_KEY}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.courtlistener.com/api/rest/v4/search/",
                params={
                    "q": enhanced_query,
                    "type": "o",
                    "order_by": "score desc",
                    "stat_Precedential": "on"
                },
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                results = []
                for r in data.get("results", [])[:20]:
                    results.append({
                        "case_name": r.get("caseName"),
                        "citation": r.get("citation", [None])[0] if r.get("citation") else None,
                        "court": r.get("court"),
                        "date_filed": r.get("dateFiled"),
                        "snippet": r.get("snippet"),
                        "absolute_url": f"https://www.courtlistener.com{r.get('absolute_url', '')}"
                    })
                return {"results": results, "count": len(results), "query": enhanced_query}
            else:
                return {"error": f"Search failed: {response.status_code}", "results": []}
    except Exception as e:
        return {"error": str(e), "results": []}


# ============== ADA ACCOMMODATIONS & COMPLIANCE ==============

@router.get("/api/ada/federal-law")
async def get_ada_federal_law(current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Get federal ADA law framework"""
    return {
        "federal_law": ADA_FEDERAL_LAW,
        "cps_requirements": CPS_ADA_REQUIREMENTS,
        "compliance_checklist": ADA_COMPLIANCE_CHECKLIST
    }

@router.get("/api/ada/case-law")
async def get_ada_case_law(current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Get ADA case law relevant to CPS cases"""
    return {
        "supreme_court": ADA_CASE_LAW["supreme_court"],
        "circuit_courts": ADA_CASE_LAW["circuit_courts"],
        "settlements": ADA_CASE_LAW["landmark_settlements"]
    }

@router.get("/api/ada/false-claims-act")
async def get_false_claims_act(state: Optional[str] = None, current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Get False Claims Act information for federal and state level"""
    result = {
        "federal": FALSE_CLAIMS_ACT["federal"]
    }
    
    if state:
        state = state.upper()
        state_fca = FALSE_CLAIMS_ACT["state_fca_laws"].get(state)
        if state_fca:
            result["state"] = {state: state_fca}
    else:
        result["state_laws"] = FALSE_CLAIMS_ACT["state_fca_laws"]
    
    return result

@router.get("/api/ada/civil-guardian")
async def get_civil_guardian_requirements(current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Get civil guardian/GAL ADA requirements"""
    return CIVIL_GUARDIAN_ADA

@router.get("/api/ada/state/{state_code}")
async def get_state_ada_info(state_code: str, current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Get state-specific ADA + CPS information"""
    state_code = state_code.upper()
    state_data = STATE_ADA_CPS_DATABASE.get(state_code)
    
    if not state_data:
        # Return generic info for states not in database
        return {
            "state": state_code,
            "message": "State-specific ADA data not yet available. Federal ADA law applies.",
            "federal_law": ADA_FEDERAL_LAW,
            "cps_requirements": CPS_ADA_REQUIREMENTS,
            "common_violations": COMMON_ADA_VIOLATIONS
        }
    
    return {
        "state": state_code,
        "data": state_data,
        "federal_law": ADA_FEDERAL_LAW,
        "common_violations": COMMON_ADA_VIOLATIONS
    }

@router.get("/api/ada/violations")
async def get_common_ada_violations(current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Get common ADA violations in CPS cases"""
    return {
        "violations": COMMON_ADA_VIOLATIONS,
        "checklist": ADA_COMPLIANCE_CHECKLIST
    }

@router.post("/api/ada/analyze-case/{case_id}")
async def analyze_case_ada_compliance(case_id: str, current_user: dict = Depends(require_tier("professional", feature_key="ada_compliance"))):
    """Analyze a case for ADA compliance violations"""
    db = get_db()
    # Get case data
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get violations
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        violations.append(v)
    
    # Get timeline
    timeline = []
    async for t in db.timeline_events.find({"case_id": case_id}):
        timeline.append(t)
    
    # Get documents
    documents = []
    async for d in db.documents.find({"case_id": case_id}):
        documents.append(d)
    
    # Run ADA analysis
    analysis = analyze_case_for_ada_violations(case, violations, timeline)
    
    # Add AI-powered deeper analysis
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"ada-analysis-{case_id}",
            system_message="""You are an ADA compliance expert specializing in CPS/child welfare cases. 
            Analyze the provided case information for Americans with Disabilities Act violations.
            Focus on: accommodation failures, discriminatory treatment, inaccessible services, 
            and bias against parents with disabilities. Cite specific ADA provisions and case law."""
        ).with_model("openai", "gpt-5.2")
        
        case_summary = f"""
        Case: {case.get('title', 'Unknown')}
        State: {case.get('state', 'Unknown')}
        Description: {case.get('description', 'N/A')}
        
        Violations Found: {len(violations)}
        {chr(10).join([f"- {v.get('violation_type')}: {v.get('description', '')[:200]}" for v in violations[:10]])}
        
        Timeline Events: {len(timeline)}
        {chr(10).join([f"- {t.get('event_date')}: {t.get('title')}" for t in timeline[:10]])}
        
        Documents: {len(documents)}
        {chr(10).join([f"- {d.get('filename', d.get('title', 'Doc'))}" for d in documents[:5]])}
        """
        
        ai_prompt = f"""Analyze this CPS case for ADA compliance issues:

{case_summary}

Provide:
1. Potential ADA violations identified
2. Specific accommodations that should have been provided
3. Relevant case law citations
4. Recommended actions to assert ADA rights
5. False Claims Act applicability (if federal funding misused)
"""
        
        ai_analysis = await chat.send_message(UserMessage(text=ai_prompt))
        analysis["ai_analysis"] = ai_analysis
    except Exception as e:
        analysis["ai_analysis"] = f"AI analysis unavailable: {str(e)}"
    
    # Save analysis to database
    analysis_record = {
        "_id": str(uuid.uuid4()),
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "analysis_type": "ada_compliance",
        "results": analysis,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.case_analyses.insert_one(analysis_record)
    
    return analysis

@router.get("/api/ada/search")
async def search_ada_resources(
    query: str,
    category: Optional[str] = None,
    state: Optional[str] = None,
    current_user: dict = Depends(require_tier("professional"))
):
    """Search ADA resources - case law, regulations, state laws"""
    results = {
        "federal_law": [],
        "case_law": [],
        "state_specific": [],
        "violations": []
    }
    
    query_lower = query.lower()
    
    # Search federal law
    for key, law in ADA_FEDERAL_LAW.items():
        if query_lower in str(law).lower():
            results["federal_law"].append({"key": key, "data": law})
    
    # Search case law
    for case in ADA_CASE_LAW["supreme_court"]:
        if query_lower in str(case).lower():
            results["case_law"].append({"type": "supreme_court", "case": case})
    
    for case in ADA_CASE_LAW["circuit_courts"]:
        if query_lower in str(case).lower():
            results["case_law"].append({"type": "circuit_court", "case": case})
    
    # Search state-specific
    if state:
        state = state.upper()
        state_data = STATE_ADA_CPS_DATABASE.get(state)
        if state_data and query_lower in str(state_data).lower():
            results["state_specific"].append({"state": state, "data": state_data})
    else:
        for st, data in STATE_ADA_CPS_DATABASE.items():
            if query_lower in str(data).lower():
                results["state_specific"].append({"state": st, "data": data})
    
    # Search violations
    for violation in COMMON_ADA_VIOLATIONS:
        if query_lower in str(violation).lower():
            results["violations"].append(violation)
    
    return {
        "query": query,
        "results": results,
        "total_results": sum(len(v) for v in results.values())
    }

@router.post("/api/ada/generate-complaint")
async def generate_ada_complaint(
    case_id: str = Body(...),
    violation_type: str = Body(...),
    description: str = Body(...),
    current_user: dict = Depends(require_tier("professional"))
):
    """Generate an ADA complaint document"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get case data
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    state_data = STATE_ADA_CPS_DATABASE.get(case.get("state", "").upper(), {})
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"ada-complaint-{case_id}",
        system_message="""You are an ADA compliance attorney specializing in disability rights in CPS cases.
        Generate formal ADA complaints that can be filed with HHS Office for Civil Rights or state agencies."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Generate a formal ADA complaint for the following situation:

CASE INFORMATION:
- Case: {case.get('title', 'N/A')}
- State: {case.get('state', 'N/A')}
- County: {case.get('county', 'N/A')}
- Agency: {state_data.get('agency', 'State CPS Agency')}

VIOLATION TYPE: {violation_type}
DESCRIPTION: {description}

Generate a complete ADA complaint including:
1. Complainant information section (to be filled in)
2. Respondent (agency) information
3. Basis for complaint (ADA Title II and Section 504)
4. Factual allegations
5. Specific ADA/504 provisions violated with citations
6. Relief requested
7. Supporting case law citations

Format as a formal legal document ready for filing."""

    complaint = await chat.send_message(UserMessage(text=prompt))
    
    # Save complaint
    doc_id = str(uuid.uuid4())
    await db.generated_documents.insert_one({
        "_id": doc_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "document_type": "ada_complaint",
        "title": f"ADA Complaint - {violation_type}",
        "content": complaint,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "document_id": doc_id,
        "title": f"ADA Complaint - {violation_type}",
        "content": complaint
    }


# ============== ADVANCED LEGAL STRATEGY COMPONENTS ==============
# LegalStrategyBuilder, ArgumentGenerator, EvidenceArgumentMapper, LegalPrecedentFinder


