"""Section 1983 routes"""
import uuid
import json
import re
import asyncio
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY
from .courtlistener_routes import STATES_INFO
from .legal_routes import SECTION_1983_SYSTEM_PROMPT
from utils.credits import (
    get_case_with_ownership, require_tier, check_ai_credits,
    increment_ai_credits, save_ai_response_to_case
)

router = APIRouter()

@router.post("/api/section-1983/generate")
async def generate_section_1983_complaint(
    case_id: str = Body(...),
    defendants: list = Body(default=[]),
    constitutional_violations: list = Body(default=[]),
    relief_sought: list = Body(default=[]),
    include_monell: bool = Body(default=True),
    include_conspiracy: bool = Body(default=False),
    current_user: dict = Depends(require_tier("attorney"))
):
    """
    Generate a comprehensive Section 1983 Civil Rights Complaint.
    This is THE MOST POWERFUL feature - turns CPS violations into federal lawsuits.
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Get all violations for this case
    violations = await db.violations.find({"case_id": case_id}).to_list(100)
    
    # Get timeline events
    timeline = await db.timeline_events.find({"case_id": case_id}).to_list(100)
    
    # Get evidence
    evidence = await db.evidence.find({"case_id": case_id}).to_list(50)
    
    # Get communications
    communications = await db.communications.find({"case_id": case_id}).to_list(50)
    
    state = case.get("state", "TX")
    state_name = STATES_INFO.get(state, state)
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"1983-{case_id}-{uuid.uuid4().hex[:8]}",
        system_message=SECTION_1983_SYSTEM_PROMPT
    ).with_model("openai", "gpt-5.2")
    
    violations_text = "\n".join([
        f"- {v.get('violation_type', 'Unknown')}: {v.get('description', '')}" 
        for v in violations
    ]) if violations else "No violations documented yet"
    
    timeline_text = "\n".join([
        f"- {e.get('date', 'Unknown')}: {e.get('title', '')} - {e.get('description', '')}"
        for e in timeline
    ]) if timeline else "No timeline events"
    
    defendants_text = "\n".join([f"- {d}" for d in defendants]) if defendants else "Defendants to be named"
    
    prompt = f"""Generate a COMPLETE Section 1983 Civil Rights Complaint for filing in the United States District Court.

CASE INFORMATION:
- State: {state_name}
- Case Title: {case.get('title', 'CPS Case')}
- Case Description: {case.get('description', '')}

DOCUMENTED CONSTITUTIONAL VIOLATIONS:
{violations_text}

TIMELINE OF EVENTS:
{timeline_text}

PROPOSED DEFENDANTS:
{defendants_text}

SPECIFIC CONSTITUTIONAL CLAIMS TO INCLUDE:
{', '.join(constitutional_violations) if constitutional_violations else 'Fourth Amendment, Fourteenth Amendment Due Process'}

RELIEF SOUGHT:
{', '.join(relief_sought) if relief_sought else 'Compensatory damages, Punitive damages, Declaratory relief, Injunctive relief, Attorney fees'}

ADDITIONAL CLAIMS:
- Include Monell Claim: {"YES - Agency/Municipal liability" if include_monell else "NO"}
- Include Conspiracy Claim (§1985): {"YES" if include_conspiracy else "NO"}

Generate the COMPLETE complaint including:
1. Caption with proper court, parties, case number placeholder
2. Jurisdiction and Venue
3. Parties (detailed description of each defendant)
4. Statement of Facts (detailed chronological narrative)
5. Causes of Action:
   - Count I: Fourth Amendment Violation (if applicable)
   - Count II: Fourteenth Amendment Due Process (substantive)
   - Count III: Fourteenth Amendment Due Process (procedural)
   - Count IV: Fourteenth Amendment Equal Protection (if applicable)
   - Count V: Monell Claim against Agency (if requested)
   - Count VI: Conspiracy under § 1985 (if requested)
6. Prayer for Relief (specific damages and injunctive relief)
7. Jury Demand
8. Signature block

CRITICAL: Include specific case law citations that defeat qualified immunity.
The complaint must be detailed enough to survive a 12(b)(6) motion to dismiss.
Make it AGGRESSIVE and POWERFUL - these officials violated constitutional rights."""

    max_retries = 1
    response = None
    error_text = ""
    retry_delays = [5]

    for attempt in range(max_retries + 1):
        try:
            response = await asyncio.wait_for(
                chat.send_message(UserMessage(text=prompt)),
                timeout=45
            )
            break
        except asyncio.TimeoutError:
            error_text = "timeout"
            if attempt == max_retries:
                raise HTTPException(status_code=504, detail="Generation timed out. Please try again.")
        except Exception as e:
            error_text = str(e)
            if "budget has been exceeded" in error_text.lower() or "insufficient" in error_text.lower():
                raise HTTPException(status_code=402, detail="AI budget exceeded. Please add balance to your Universal Key and retry.")
            if attempt == max_retries:
                raise HTTPException(status_code=502, detail="AI service error. Please retry in a moment.")

        wait_seconds = retry_delays[min(attempt, len(retry_delays) - 1)]
        if "rate limit" in error_text.lower() or "429" in error_text:
            wait_seconds = max(wait_seconds, 8)
        await asyncio.sleep(wait_seconds)

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"1983-{case_id}-{uuid.uuid4().hex[:8]}-retry{attempt}",
            system_message=SECTION_1983_SYSTEM_PROMPT
        ).with_model("openai", "gpt-5.2")

    if not response:
        raise HTTPException(status_code=502, detail="AI service unavailable. Please try again.")
    
    # Save the generated complaint
    complaint_id = str(uuid.uuid4())
    complaint_doc = {
        "_id": complaint_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "complaint_type": "section_1983",
        "defendants": defendants,
        "constitutional_violations": constitutional_violations,
        "relief_sought": relief_sought,
        "include_monell": include_monell,
        "include_conspiracy": include_conspiracy,
        "complaint_text": response,
        "violations_count": len(violations),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.section_1983_complaints.insert_one(complaint_doc)
    
    return {
        "id": complaint_id,
        "complaint": response,
        "violations_analyzed": len(violations),
        "timeline_events_analyzed": len(timeline),
        "defendants": defendants,
        "generated_at": complaint_doc["generated_at"]
    }


@router.get("/api/section-1983/templates")
async def get_section_1983_templates():
    """Get Section 1983 claim templates and guidance"""
    return {
        "claim_types": [
            {
                "id": "fourth_amendment",
                "name": "Fourth Amendment - Unreasonable Search/Seizure",
                "description": "Warrantless home entry, illegal child removal, strip searches",
                "elements": [
                    "Government action (state actor)",
                    "Search or seizure occurred",
                    "No warrant or valid exception",
                    "Caused constitutional injury"
                ],
                "key_cases": [
                    "Gates v. Texas DHS - Emergency removal standards",
                    "Doe v. Heck - Warrantless home entry by CPS",
                    "Kirkpatrick v. County of Washoe - Strip search of children"
                ]
            },
            {
                "id": "fourteenth_substantive_dp",
                "name": "Fourteenth Amendment - Substantive Due Process",
                "description": "Violation of fundamental right to family integrity",
                "elements": [
                    "Fundamental right involved (family integrity)",
                    "Government action infringed that right",
                    "Action shocks the conscience OR",
                    "No legitimate government interest"
                ],
                "key_cases": [
                    "Troxel v. Granville - Parental rights fundamental",
                    "Santosky v. Kramer - Clear and convincing standard",
                    "Stanley v. Illinois - Parental fitness presumption"
                ]
            },
            {
                "id": "fourteenth_procedural_dp",
                "name": "Fourteenth Amendment - Procedural Due Process",
                "description": "Denial of notice, hearing, or fair process",
                "elements": [
                    "Protected liberty or property interest",
                    "Government deprived plaintiff of that interest",
                    "Inadequate procedures (notice, hearing, impartial tribunal)"
                ],
                "key_cases": [
                    "Mathews v. Eldridge - Due process balancing test",
                    "Cleveland Board of Education v. Loudermill - Pre-deprivation hearing"
                ]
            },
            {
                "id": "monell",
                "name": "Monell Liability - Municipal/Agency",
                "description": "Agency liable for unconstitutional policies or customs",
                "elements": [
                    "Constitutional violation occurred",
                    "Violation resulted from official policy, custom, or practice",
                    "Policy was moving force behind violation",
                    "Deliberate indifference by policymakers"
                ],
                "key_cases": [
                    "Monell v. Department of Social Services",
                    "City of Canton v. Harris - Failure to train",
                    "Board of County Commissioners v. Brown - Single incident liability"
                ]
            }
        ],
        "qualified_immunity_defeaters": [
            "Clearly established law at time of violation",
            "Reasonable official would have known conduct violated rights",
            "Prior court decisions with similar facts",
            "Basic constitutional principles that apply obviously",
            "Egregious conduct that no reasonable official could believe lawful"
        ],
        "common_defendants": [
            "Individual CPS caseworkers (individual capacity)",
            "CPS supervisors who approved actions",
            "Agency directors (policy decisions)",
            "County/State agency (Monell liability)",
            "Law enforcement who assisted removal",
            "Contracted service providers acting under color of law"
        ]
    }


@router.get("/api/section-1983/{case_id}")
async def get_section_1983_complaints(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all Section 1983 complaints for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    complaints = await db.section_1983_complaints.find(
        {"case_id": case_id},
        {"_id": 1, "defendants": 1, "constitutional_violations": 1, "generated_at": 1}
    ).to_list(50)
    
    for c in complaints:
        c["id"] = c.pop("_id")
    
    return {"complaints": complaints}


# ============== PODCAST CREATOR ==============


