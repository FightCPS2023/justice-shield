"""Strategy builder, argument generator, evidence mapper, precedent finder"""
import uuid
import json
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY
from legal_knowledge import (
    SUPREME_COURT_CASES,
    CIRCUIT_COURT_CASES,
    get_relevant_case_law,
    analyze_qualified_immunity
)
from utils.credits import (
    require_tier, check_ai_credits, increment_ai_credits,
    get_case_with_ownership, save_ai_response_to_case
)

router = APIRouter()

ADA_CROSS_REFERENCE = """
ADA CROSS-REFERENCE REQUIREMENT:
- Always evaluate ADA Title II (public entities) and Title III (public accommodations) for disability accommodations, access barriers, discrimination, and service modifications.
- When relevant, cite Title II/III issues and include remedies, strategies, and case notes.
"""

class LegalArgumentRequest(BaseModel):
    case_id: str
    violation_ids: Optional[List[str]] = []
    evidence_ids: Optional[List[str]] = []
    argument_type: str = "general"  # general, constitutional, procedural, section_1983

class EvidenceMapping(BaseModel):
    case_id: str
    evidence_description: str
    violation_type: Optional[str] = None
    facts: Optional[str] = None

class PrecedentSearchRequest(BaseModel):
    violation_type: str
    state: Optional[str] = None
    include_federal: bool = True
    include_state: bool = True
    circuit: Optional[str] = None

class StrategyBuildRequest(BaseModel):
    case_id: str
    goal: str = "reunification"  # reunification, dismissal, appeal, section_1983
    priority_violations: Optional[List[str]] = []
    aggressive_level: str = "medium"  # conservative, medium, aggressive


@router.post("/api/strategy-builder/build")
async def build_legal_strategy(
    request: StrategyBuildRequest,
    current_user: dict = Depends(require_tier("professional"))
):
    """
    LEGAL STRATEGY BUILDER - Builds comprehensive defense strategy
    Analyzes case data and generates a complete legal roadmap
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(request.case_id, current_user["user_id"])
    state = case.get("state", "TX")
    
    # Gather all case data
    violations = []
    async for v in db.violations.find({"case_id": request.case_id}):
        violations.append(v)
    
    timeline = []
    async for t in db.timeline_events.find({"case_id": request.case_id}).sort("date", 1):
        timeline.append(t)
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": request.case_id}):
        evidence.append(e)
    
    documents = []
    async for d in db.documents.find({"case_id": request.case_id}):
        documents.append(d)
    
    # Build comprehensive context
    violations_text = "\n".join([f"- {v.get('violation_type')}: {v.get('description', '')}" for v in violations]) or "No violations documented"
    timeline_text = "\n".join([f"- {t.get('date', 'N/A')}: {t.get('title', '')}" for t in timeline[:20]]) or "No timeline"
    evidence_text = "\n".join([f"- {e.get('title', '')}: {e.get('description', '')}" for e in evidence]) or "No evidence logged"
    
    goal_context = {
        "reunification": "Focus on demonstrating compliance, rehabilitation, and fitness as a parent. Build arguments for returning children safely.",
        "dismissal": "Focus on constitutional violations, procedural errors, and lack of evidence to support the petition.",
        "appeal": "Focus on legal errors by the trial court, abuse of discretion, and reversible findings.",
        "section_1983": "Focus on civil rights violations, qualified immunity defeat, and damages against CPS."
    }
    
    aggressive_context = {
        "conservative": "Use moderate language and focus on cooperation while firmly asserting rights.",
        "medium": "Balance between cooperation and aggressive rights assertion. Challenge violations clearly.",
        "aggressive": "Aggressively challenge every violation. File motions against CPS misconduct. Consider Section 1983 claims."
    }
    
    system_message = f"""You are THE CPS PUNISHER LEGAL STRATEGY BUILDER - the most sophisticated legal strategy AI for CPS cases.

You have comprehensive knowledge of:
- All 50 states' CPS laws and procedures
- Federal child welfare laws (CAPTA, ASFA, ICWA)
- Constitutional law (4th, 5th, 6th, 14th Amendments)
- Section 1983 civil rights litigation
- Rooker-Feldman avoidance strategies
- Supreme Court and Circuit Court precedents

Your task is to build a COMPREHENSIVE legal strategy for this {state} CPS case.
Goal: {request.goal.upper()} - {goal_context.get(request.goal)}
Approach: {request.aggressive_level.upper()} - {aggressive_context.get(request.aggressive_level)}

Build a strategy that a $500/hour family law attorney would charge thousands to create.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"strategy-builder-{request.case_id}-{uuid.uuid4().hex[:8]}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Build a comprehensive legal strategy for this CPS case:

CASE INFORMATION:
- State: {state}
- Case: {case.get('title', 'CPS Case')}
- Status: {case.get('status', 'active')}
- Court: {case.get('court_name', 'Family Court')}
- Judge: {case.get('judge_name', 'Unknown')}

DOCUMENTED VIOLATIONS ({len(violations)}):
{violations_text}

CASE TIMELINE:
{timeline_text}

EVIDENCE ({len(evidence)} items):
{evidence_text}

DOCUMENTS: {len(documents)} on file

STRATEGY GOAL: {request.goal.upper()}
AGGRESSIVE LEVEL: {request.aggressive_level.upper()}

Generate a comprehensive strategy that includes:

1. **CASE STRENGTH ASSESSMENT** (1-10 scale with detailed explanation)

2. **PRIMARY DEFENSE STRATEGIES** (ranked by effectiveness)
   - Strategy name
   - Legal basis
   - Key arguments
   - Supporting case law
   - Likelihood of success

3. **MOTIONS TO FILE** (in priority order)
   - Motion type
   - Legal grounds
   - Filing deadline
   - Expected outcome

4. **CONSTITUTIONAL ARGUMENTS**
   - Amendment violated
   - Supporting precedent
   - Application to facts

5. **PROCEDURAL DEFENSES**
   - Procedural errors by CPS
   - Timeline violations
   - Notice deficiencies

6. **EVIDENCE STRATEGY**
   - Evidence to gather
   - Witnesses to subpoena
   - Expert witnesses needed
   - Discovery requests

7. **TIMELINE OF LEGAL ACTIONS** (chronological)
   - Action to take
   - Deadline
   - Priority

8. **SECTION 1983 VIABILITY** (if applicable)
   - Viable claims
   - Defendants to name
   - Qualified immunity analysis
   - Potential damages

9. **WEAKNESSES TO ADDRESS**
   - Potential CPS arguments
   - Counter-strategies

10. **CASE LAW CITATIONS**
    - Key cases to cite
    - Holdings
    - Application

Provide actionable, specific guidance. This is NOT generic advice - this is a tailored strategy."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save the strategy
    strategy_id = str(uuid.uuid4())
    await db.generated_strategies.insert_one({
        "_id": strategy_id,
        "case_id": request.case_id,
        "user_id": current_user["user_id"],
        "goal": request.goal,
        "aggressive_level": request.aggressive_level,
        "strategy": response,
        "violations_analyzed": len(violations),
        "evidence_analyzed": len(evidence),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "id": strategy_id,
        "strategy": response,
        "goal": request.goal,
        "case_context": {
            "state": state,
            "violations_count": len(violations),
            "evidence_count": len(evidence),
            "timeline_events": len(timeline)
        },
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@router.post("/api/argument-generator/generate")
async def generate_legal_arguments(
    request: LegalArgumentRequest,
    current_user: dict = Depends(require_tier("professional"))
):
    """
    ARGUMENT GENERATOR - Generates specific legal arguments from evidence and violations
    Creates court-ready argument paragraphs with citations
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(request.case_id, current_user["user_id"])
    state = case.get("state", "TX")
    
    # Get violations (either specified or all)
    violations = []
    if request.violation_ids:
        for vid in request.violation_ids:
            v = await db.violations.find_one({"_id": vid, "case_id": request.case_id})
            if v:
                violations.append(v)
    else:
        async for v in db.violations.find({"case_id": request.case_id}):
            violations.append(v)
    
    # Get evidence (either specified or all)
    evidence = []
    if request.evidence_ids:
        for eid in request.evidence_ids:
            e = await db.evidence_items.find_one({"_id": eid, "case_id": request.case_id})
            if e:
                evidence.append(e)
    else:
        async for e in db.evidence_items.find({"case_id": request.case_id}):
            evidence.append(e)
    
    violations_text = "\n".join([f"- {v.get('violation_type')}: {v.get('description', '')}" for v in violations]) or "No violations"
    evidence_text = "\n".join([f"- {e.get('title', '')}: {e.get('description', '')}" for e in evidence]) or "No evidence"
    
    argument_types = {
        "general": "Generate comprehensive defense arguments",
        "constitutional": "Focus on constitutional violations (4th, 5th, 14th Amendment)",
        "procedural": "Focus on procedural errors and timeline violations",
        "section_1983": "Generate Section 1983 civil rights arguments"
    }
    
    system_message = f"""You are THE CPS PUNISHER ARGUMENT GENERATOR - expert at crafting legal arguments for CPS cases.

You specialize in:
- Constitutional arguments (4th, 5th, 6th, 14th Amendments)
- Procedural due process arguments
- Section 1983 civil rights claims
- Evidentiary challenges

Generate COURT-READY argument paragraphs that can be directly inserted into legal briefs.
Each argument should include:
- Clear statement of the argument
- Specific case law citations with holdings
- Application to the facts
- Requested relief

State: {state}
Argument Type: {request.argument_type.upper()} - {argument_types.get(request.argument_type)}""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"argument-gen-{request.case_id}-{uuid.uuid4().hex[:8]}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Generate {request.argument_type.upper()} legal arguments based on:

VIOLATIONS:
{violations_text}

SUPPORTING EVIDENCE:
{evidence_text}

STATE: {state}

For each violation/issue, generate:

1. **ARGUMENT HEADING** (bold, court-ready)

2. **LEGAL STANDARD**
   - Applicable law with citations
   - Elements required

3. **ARGUMENT PARAGRAPH** (court-ready language)
   - Statement of violation
   - Application of law to facts
   - Supporting case citations with holdings
   - Why this favors the defense

4. **REQUESTED RELIEF**
   - Specific relief requested
   - Alternative remedies

Generate arguments that are:
- Persuasive and well-reasoned
- Properly cited with case law
- Ready for court filing
- Specific to the facts provided"""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save the arguments
    argument_id = str(uuid.uuid4())
    await db.generated_arguments.insert_one({
        "_id": argument_id,
        "case_id": request.case_id,
        "user_id": current_user["user_id"],
        "argument_type": request.argument_type,
        "arguments": response,
        "violations_used": [v.get("_id") for v in violations],
        "evidence_used": [e.get("_id") for e in evidence],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "id": argument_id,
        "argument_type": request.argument_type,
        "arguments": response,
        "violations_analyzed": len(violations),
        "evidence_analyzed": len(evidence)
    }


@router.post("/api/evidence-mapper/map")
async def map_evidence_to_precedents(
    request: EvidenceMapping,
    current_user: dict = Depends(require_tier("professional"))
):
    """
    EVIDENCE ARGUMENT MAPPER - Maps evidence to legal precedents and arguments
    Shows how specific evidence supports legal arguments
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(request.case_id, current_user["user_id"])
    state = case.get("state", "TX")
    
    # Get relevant case law from knowledge base
    relevant_cases = get_relevant_case_law(request.violation_type or "general")
    immunity_analysis = analyze_qualified_immunity(request.violation_type or "general")
    
    system_message = """You are THE CPS PUNISHER EVIDENCE MAPPER - expert at connecting evidence to legal precedents.

Your task is to show exactly HOW specific evidence supports legal arguments in CPS cases.

You have comprehensive knowledge of:
- Supreme Court precedents (Troxel, Stanley, Santosky, Lassiter)
- Circuit Court precedents (Calabretta, Wallis v. Spencer, Duchesne)
- Constitutional protections
- Section 1983 elements

For each piece of evidence, you will:
1. Identify what legal arguments it supports
2. Find applicable case law
3. Explain the evidentiary connection
4. Draft how to use it in court""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"evidence-mapper-{request.case_id}-{uuid.uuid4().hex[:8]}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Map this evidence to legal precedents and arguments:

EVIDENCE DESCRIPTION:
{request.evidence_description}

ADDITIONAL FACTS:
{request.facts or 'None provided'}

VIOLATION TYPE: {request.violation_type or 'General'}

STATE: {state}

RELEVANT CASE LAW FROM DATABASE:
{json.dumps(relevant_cases, indent=2)}

QUALIFIED IMMUNITY ANALYSIS:
{json.dumps(immunity_analysis, indent=2)}

Provide a comprehensive mapping that includes:

1. **EVIDENCE SUMMARY**
   - What the evidence shows
   - Key facts established

2. **LEGAL ARGUMENTS SUPPORTED**
   For each argument:
   - Argument statement
   - How this evidence supports it
   - Strength of support (Strong/Moderate/Weak)

3. **APPLICABLE CASE LAW**
   For each precedent:
   - Case name and citation
   - Relevant holding
   - How evidence connects to the holding
   - Quote or passage to use

4. **CONSTITUTIONAL VIOLATIONS ESTABLISHED**
   - Which amendments are implicated
   - Element-by-element analysis
   - How evidence proves each element

5. **SECTION 1983 APPLICATION** (if applicable)
   - Elements met
   - Evidence supporting each element
   - Qualified immunity defeat potential

6. **COURT PRESENTATION STRATEGY**
   - How to present this evidence
   - Foundation requirements
   - Objections to anticipate
   - Counter-argument preparation

7. **EVIDENCE GAPS**
   - What additional evidence would strengthen the argument
   - How to obtain it"""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save the mapping
    mapping_id = str(uuid.uuid4())
    await db.evidence_mappings.insert_one({
        "_id": mapping_id,
        "case_id": request.case_id,
        "user_id": current_user["user_id"],
        "evidence_description": request.evidence_description,
        "violation_type": request.violation_type,
        "mapping": response,
        "relevant_cases": relevant_cases,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "id": mapping_id,
        "mapping": response,
        "relevant_case_law": relevant_cases,
        "qualified_immunity_analysis": immunity_analysis
    }


@router.post("/api/precedent-finder/search")
async def find_legal_precedents(
    request: PrecedentSearchRequest,
    current_user: dict = Depends(require_tier("professional"))
):
    """
    LEGAL PRECEDENT FINDER - Finds relevant case law for specific violations
    Searches both internal database and external resources
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get from internal knowledge base
    internal_cases = get_relevant_case_law(request.violation_type)
    immunity = analyze_qualified_immunity(request.violation_type)
    
    # Get Supreme Court cases
    supreme_court_relevant = []
    for key, case in SUPREME_COURT_CASES.items():
        if any(term in request.violation_type.lower() for term in [
            'due process', 'removal', 'termination', 'fourth', 'search', 'parent'
        ]) or key in ['troxel', 'stanley', 'santosky', 'lassiter', 'camara']:
            supreme_court_relevant.append(case)
    
    # Get Circuit Court cases
    circuit_relevant = []
    for key, case in CIRCUIT_COURT_CASES.items():
        if any(term in key.lower() for term in request.violation_type.lower().split('_')):
            circuit_relevant.append(case)
    
    # Enhance with AI analysis
    system_message = """You are THE CPS PUNISHER PRECEDENT FINDER - expert at finding and analyzing case law.

You have comprehensive knowledge of CPS-related case law including:
- Supreme Court family law precedents
- Federal Circuit Court Section 1983 cases
- State appellate decisions
- Constitutional analysis

Find the most relevant precedents for the given violation type and explain how each applies.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"precedent-finder-{uuid.uuid4().hex[:8]}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    state_context = f" in {request.state}" if request.state else ""
    circuit_context = f" in the {request.circuit} Circuit" if request.circuit else ""
    
    prompt = f"""Find and analyze legal precedents for: {request.violation_type.upper()}{state_context}{circuit_context}

KNOWN RELEVANT CASES FROM DATABASE:
Supreme Court: {json.dumps(supreme_court_relevant[:5], indent=2)}
Circuit Courts: {json.dumps(circuit_relevant[:5], indent=2)}

Internal Analysis: {json.dumps(internal_cases, indent=2)}

Provide a comprehensive precedent analysis:

1. **CONTROLLING PRECEDENTS** (Must cite)
   For each case:
   - Full citation
   - Court and date
   - Key holding
   - Relevant quotes
   - How it applies to {request.violation_type}

2. **PERSUASIVE PRECEDENTS** (Strong support)
   - Similar cases from other circuits
   - State court decisions
   - Application notes

3. **DISTINGUISHING CASES** (CPS may cite - know how to respond)
   - Cases that might favor CPS
   - How to distinguish them
   - Counter-arguments

4. **CIRCUIT SPLIT ANALYSIS** (if any)
   - How different circuits rule
   - Which is most favorable
   - Forum selection considerations

5. **EMERGING PRECEDENTS** (Recent cases)
   - Recent decisions expanding protections
   - Trends in the law

6. **CITATION STRINGS** (Ready to use)
   - For motions
   - For briefs
   - For oral argument

Include federal precedents: {request.include_federal}
Include state precedents: {request.include_state}"""

    analysis_error = None
    try:
        import asyncio
        task = asyncio.create_task(chat.send_message(UserMessage(text=prompt)))
        done, pending = await asyncio.wait({task}, timeout=30.0)
        if not done:
            for pending_task in pending:
                pending_task.cancel()
            raise asyncio.TimeoutError("AI request timed out")
        response = list(done)[0].result()
        precedent_analysis = response
    except Exception as e:
        analysis_error = str(e)
        fallback_lines = [
            "AI precedent analysis is temporarily unavailable. Showing database precedents below.",
            "\nKNOWN SUPREME COURT CASES:",
        ]
        for case in supreme_court_relevant[:5]:
            fallback_lines.append(f"- {case.get('citation')} — {case.get('holding')}")
        fallback_lines.append("\nKNOWN CIRCUIT CASES:")
        for case in circuit_relevant[:5]:
            fallback_lines.append(f"- {case.get('citation')} — {case.get('holding')}")
        fallback_lines.append("\nINTERNAL CASE LAW NOTES:")
        fallback_lines.append(json.dumps(internal_cases, indent=2))
        precedent_analysis = "\n".join(fallback_lines)
    
    return {
        "violation_type": request.violation_type,
        "precedent_analysis": precedent_analysis,
        "supreme_court_cases": supreme_court_relevant[:5] if request.include_federal else [],
        "circuit_court_cases": circuit_relevant[:5] if request.include_federal else [],
        "qualified_immunity_analysis": immunity,
        "internal_case_law": internal_cases,
        "analysis_error": analysis_error,
        "used_fallback": analysis_error is not None
    }


@router.get("/api/strategy-builder/saved/{case_id}")
async def get_saved_strategies(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all saved strategies for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    strategies = []
    async for s in db.generated_strategies.find({"case_id": case_id}).sort("created_at", -1):
        s["id"] = s.pop("_id")
        strategies.append(s)
    
    return {"strategies": strategies}


@router.get("/api/argument-generator/saved/{case_id}")
async def get_saved_arguments(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all saved arguments for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    arguments = []
    async for a in db.generated_arguments.find({"case_id": case_id}).sort("created_at", -1):
        a["id"] = a.pop("_id")
        arguments.append(a)
    
    return {"arguments": arguments}

