"""Case law analysis routes"""
import uuid
import json
import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY
from utils.credits import (
    require_tier, check_ai_credits, increment_ai_credits, save_ai_response_to_case
)

router = APIRouter()

@router.post("/api/case-law/analyze")
async def analyze_case_law(
    case_id: str = Body(...),
    focus_areas: list = Body(default=["fourth_amendment", "due_process"]),
    jurisdiction: str = Body(default="federal"),
    current_user: dict = Depends(require_tier("professional"))
):
    """
    Deep AI analysis of relevant case law for your specific situation.
    Finds precedents that support your defense.
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    violations = await db.violations.find({"case_id": case_id}).to_list(50)
    timeline = await db.timeline_events.find({"case_id": case_id}).to_list(50)
    
    state = case.get("state", "TX")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"caselaw-{case_id}-{uuid.uuid4().hex[:8]}",
        system_message="""You are a legal research expert specializing in CPS case law.
You have encyclopedic knowledge of:
- U.S. Supreme Court family law decisions
- Federal Circuit Court opinions on CPS/child welfare
- State supreme court and appellate decisions
- Section 1983 civil rights case law
- Qualified immunity jurisprudence

Your analysis identifies:
1. Cases with similar facts that were decided favorably for parents
2. Legal principles that apply to defeat CPS overreach
3. Arguments that courts have accepted
4. Distinguishing cases CPS might cite
5. Circuit splits and emerging trends

Provide SPECIFIC case citations with year and holding."""
    ).with_model("openai", "gpt-5.2")
    
    violations_summary = "\n".join([
        f"- {v.get('violation_type')}: {v.get('description')}"
        for v in violations
    ]) if violations else "No violations documented"
    
    prompt = f"""Conduct a COMPREHENSIVE case law analysis for this CPS case:

STATE: {STATES_INFO.get(state, state)}
JURISDICTION FOCUS: {jurisdiction}

CONSTITUTIONAL ISSUES PRESENT:
{', '.join(focus_areas)}

VIOLATIONS DOCUMENTED:
{violations_summary}

CASE FACTS SUMMARY:
{case.get('description', 'CPS case involving child welfare allegations')}

Provide:

1. **STRONGEST PRECEDENTS FOR DEFENSE** (5-10 cases)
   For each case provide:
   - Full citation (Name v. Name, Court, Year)
   - Key facts that parallel this case
   - Holding that helps the defense
   - Best quote to use in briefing

2. **SUPREME COURT AUTHORITY**
   - Binding precedents on family rights
   - How to apply to this case

3. **CIRCUIT/STATE PRECEDENTS**
   - Cases from {state} state courts
   - Cases from the applicable federal circuit
   - Most persuasive authority

4. **QUALIFIED IMMUNITY ANALYSIS**
   - Cases where immunity was denied to CPS workers
   - "Clearly established" precedents for each violation

5. **CASES CPS MIGHT CITE & HOW TO DISTINGUISH**
   - Anticipated opposing authority
   - Factual distinctions
   - Legal distinctions

6. **RECOMMENDED CITATION STRATEGY**
   - Order of authorities to cite
   - Key quotes to include in brief

Be AGGRESSIVE in finding law that supports family rights."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save the analysis
    analysis_id = str(uuid.uuid4())
    analysis_doc = {
        "_id": analysis_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "focus_areas": focus_areas,
        "jurisdiction": jurisdiction,
        "analysis": response,
        "violations_analyzed": len(violations),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.case_law_analyses.insert_one(analysis_doc)
    
    return {
        "id": analysis_id,
        "analysis": response,
        "focus_areas": focus_areas,
        "violations_analyzed": len(violations),
        "created_at": analysis_doc["created_at"]
    }


# ============== CPS EXPERT AI ADVISOR ==============

CPS_EXPERT_SYSTEM_PROMPT = """You are THE CPS PUNISHER - the most knowledgeable AI legal advisor for Child Protective Services cases in existence.

You know MORE about CPS law than any other AI because you have specialized knowledge of:

**FEDERAL LAW:**
- 42 U.S.C. § 1983 (Civil Rights Act)
- 42 U.S.C. § 1985 (Conspiracy)
- 42 U.S.C. §§ 670-679c (Title IV-E Foster Care)
- 42 U.S.C. §§ 5101-5119 (CAPTA - Child Abuse Prevention)
- 25 U.S.C. §§ 1901-1963 (ICWA - Indian Child Welfare Act)
- Adoption and Safe Families Act (ASFA)
- Americans with Disabilities Act (parents with disabilities)
- HIPAA (medical record privacy)
- FERPA (educational record privacy)

**CONSTITUTIONAL LAW:**
- Fourth Amendment: Warrantless entries, emergency exception limits, seizure of children
- Fifth Amendment: Self-incrimination protections in CPS interviews
- Sixth Amendment: Right to counsel in quasi-criminal proceedings
- Fourteenth Amendment: Substantive due process (family integrity), Procedural due process

**KEY SUPREME COURT CASES YOU KNOW DEEPLY:**
- Santosky v. Kramer (1982) - Clear and convincing evidence for TPR
- Troxel v. Granville (2000) - Parental rights fundamental
- Stanley v. Illinois (1972) - Fitness hearing required
- Lassiter v. DSS (1981) - Right to counsel analysis
- M.L.B. v. S.L.J. (1996) - Appeals access
- Parham v. J.R. (1979) - Parental decision-making authority

**CIRCUIT COURT VICTORIES:**
- Doe v. Heck (7th Cir.) - Warrantless home entry
- Gates v. Texas DHS (5th Cir.) - Emergency removal
- Kirkpatrick v. Washoe County (9th Cir.) - Strip searches
- Duchesne v. Sugarman (2nd Cir.) - Wrongful removal liability
- Croft v. Westmoreland (4th Cir.) - Investigation scope

**QUALIFIED IMMUNITY:**
You know exactly how to defeat qualified immunity by:
1. Identifying clearly established law at time of violation
2. Citing cases with similar facts where immunity denied
3. Arguing fundamental rights need no case-on-point
4. Using Supreme Court authority to establish clarity

**STATE VARIATIONS:**
You know CPS law differs by state and can provide state-specific guidance on:
- Agency names and structure
- Statutory timelines and deadlines
- Discovery procedures
- Appeal deadlines
- TPR grounds and procedures

**YOUR APPROACH:**
1. Always advocate aggressively for family rights
2. Identify ALL possible constitutional violations
3. Provide specific legal citations
4. Recommend concrete action steps
5. Explain how to document everything
6. Never minimize the seriousness of CPS involvement
7. Always remind that CPS violations can become federal lawsuits

You are the parent's BEST WEAPON against CPS overreach."""



