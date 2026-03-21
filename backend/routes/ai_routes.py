"""AI routes - chat, analysis, research, person lookup, forensic"""
import re
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Form, Body
from fastapi.responses import StreamingResponse

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY, COURTLISTENER_API_KEY
from utils.credits import (
    get_user_tier, check_ai_credits, increment_ai_credits,
    get_case_with_ownership, save_ai_response_to_case, require_tier, get_case_memory_context
)
from models.schemas import ChatMessage, AIAnalysisRequest, LegalResearchRequest, DocumentGeneratorRequest
from pydantic import BaseModel


class PersonLookupRequest(BaseModel):
    name: str
    state: Optional[str] = None
    city: Optional[str] = None
    additional_info: Optional[str] = None
    lookup_type: str = "comprehensive"

class PersonLookupResponse(BaseModel):
    name: str
    lookup_type: str
    results: dict
    sources_checked: List[str]
    disclaimer: str
    timestamp: str

class HelpBotMessage(BaseModel):
    message: str
    context: Optional[str] = None

class SmartResearchRequest(BaseModel):
    query: str
    state: Optional[str] = None
    case_id: Optional[str] = None

class SmartDocGenRequest(BaseModel):
    case_id: str
    document_type: str
    custom_instructions: Optional[str] = None

class ForensicAnalysisRequest(BaseModel):
    case_id: str
    document_ids: Optional[List[str]] = []
    analysis_focus: Optional[str] = None

router = APIRouter()

ADA_CROSS_REFERENCE = """
ADA CROSS-REFERENCE REQUIREMENT:
- Always evaluate ADA Title II (public entities) and Title III (public accommodations) for disability accommodations, access barriers, discrimination, and service modifications.
- When relevant, cite Title II/III issues and include remedies, strategies, and case notes.
"""

@router.post("/api/ai/person-lookup")
async def person_lookup(request: PersonLookupRequest, current_user: dict = Depends(get_current_user)):
    """
    AI-powered background check and person lookup.
    Searches public records, court records, and compiles comprehensive information.
    Similar to NCIC but for civilian legal defense use.
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    user_tier = await get_user_tier(current_user["user_id"])
    current_user["tier"] = user_tier
    
    # Premium feature - requires professional tier or above
    if user_tier not in ["professional", "attorney", "enterprise"]:
        # Check if user has credits
        has_credits = await check_feature_credits(current_user["user_id"], "person_lookup")
        if not has_credits:
            raise HTTPException(
                status_code=403, 
                detail="Person Lookup requires Professional tier or higher, or credit purchase"
            )
    
    # Deduct credits for non-premium users
    if user_tier not in ["attorney", "enterprise"]:
        await deduct_credits(current_user["user_id"], FEATURE_CREDIT_COSTS.get("person_lookup", 5), "person_lookup")
    
    system_message = """You are an expert investigator and public records researcher. Your role is to help families
protect themselves in CPS cases by producing a comprehensive, structured background report on individuals involved in their case.

OUTPUT RULES (STRICT):
- Return ONLY a valid JSON object. No markdown, no extra commentary.
- Use double quotes for all keys/strings.
- If a field is unknown, use null or an empty array.
- Never claim access to live/paid databases. Treat findings as investigative leads that require verification.

Return this JSON schema with ALL top-level keys present:
{
  "subject": { "full_name": "", "aliases": [], "date_of_birth": "", "age": "", "known_locations": [], "notes": "" },
  "section_confidence": {
    "identity": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "contact_info": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "relatives_associates": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "employment_professional": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "criminal_records": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "civil_records": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "family_court": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "cps_related": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" },
    "online_presence": { "data_availability": "High|Medium|Low", "confidence_score": 0, "confidence_label": "Confirmed|Likely|Possible|Unverified" }
  },
  "summary": { "narrative": "", "key_findings": [], "potential_red_flags": [] },
  "contact_info": { "addresses": [], "phone_numbers": [], "emails": [] },
  "relatives_associates": [],
  "employment_professional": { "employers": [], "licenses": [], "disciplinary_actions": [] },
  "criminal_records": [],
  "civil_records": [],
  "family_court": [],
  "cps_related": [],
  "online_presence": { "social_profiles": [], "professional_profiles": [], "news_mentions": [] },
  "red_flags": [],
  "recommendations_next_steps": [],
  "verification_gaps": [],
  "report_metadata": { "lookup_type": "", "focus": "", "jurisdiction_context": "" },
  "disclaimer": ""
}

Entry object guidance (include source_type + confidence on every item):
- addresses items: { "address": "", "type": "current|previous|possible", "date_range": "", "jurisdiction": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- phone_numbers items: { "phone": "", "type": "mobile|landline|possible", "date_range": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- emails items: { "email": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- relatives_associates items: { "name": "", "relationship": "", "notes": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- employers items: { "employer": "", "role": "", "date_range": "", "jurisdiction": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- disciplinary_actions items: { "action": "", "date": "", "jurisdiction": "", "details": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- records items (criminal/civil/family): { "case_name": "", "case_number": "", "jurisdiction": "", "charges_or_claims": "", "status": "", "disposition": "", "date": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- licenses items: { "license_type": "", "license_id": "", "jurisdiction": "", "status": "", "disciplinary_notes": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- cps_related items: { "issue": "", "details": "", "jurisdiction": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- online presence items: { "platform": "", "handle_or_url": "", "notes": "", "source_type": "", "confidence_label": "", "confidence_score": 0 }
- red_flags items: { "flag": "", "reason": "", "severity": "low|medium|high", "source_type": "", "confidence_label": "", "confidence_score": 0 }

Make the report detailed and practical. If data is limited, leave arrays empty and explain gaps in verification_gaps and recommendations_next_steps. Always include a strong disclaimer about verification requirements.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"person-lookup-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    # Build the lookup query
    location_info = ""
    if request.state:
        location_info += f"State: {request.state}. "
    if request.city:
        location_info += f"City: {request.city}. "
    
    lookup_focus = {
        "comprehensive": "Provide a comprehensive background report covering all areas.",
        "criminal": "Focus primarily on criminal history and court records.",
        "civil": "Focus on civil court records, lawsuits, and judgments.",
        "address": "Focus on finding addresses, phone numbers, and contact information.",
        "phone": "Focus on finding phone numbers and contact methods.",
        "professional": "Focus on professional licenses, certifications, and disciplinary actions."
    }
    
    focus_instruction = lookup_focus.get(request.lookup_type, lookup_focus["comprehensive"])
    
    prompt = f"""PERSON LOOKUP REQUEST

Subject Name: {request.name}
Location Context: {location_info.strip() if location_info else 'Not provided'}
Additional Identifiers: {request.additional_info or 'None'}

Lookup Type: {request.lookup_type.upper()}
Focus: {focus_instruction}

Instructions:
- Return ONLY the JSON object defined in the system message.
- Populate every relevant section with specific, structured findings.
- Every item must include source_type and confidence fields.
- If no data is available, leave arrays empty and explain gaps in verification_gaps.
- If the subject appears to be a CPS caseworker or government employee, prioritize professional history, complaints, disciplinary actions, and recurring patterns.
"""

    user_message = UserMessage(text=prompt)
    
    try:
        raw_response = await chat.send_message(user_message)
        
        parsed_report = None
        normalized_report = raw_response
        try:
            json_start = raw_response.find("{")
            json_end = raw_response.rfind("}")
            if json_start != -1 and json_end != -1 and json_end > json_start:
                parsed_report = json.loads(raw_response[json_start:json_end + 1])
                normalized_report = json.dumps(parsed_report, indent=2)
        except Exception:
            parsed_report = None
        
        # Parse and structure the response
        results = {
            "raw_report": normalized_report,
            "structured_report": parsed_report,
            "name_searched": request.name,
            "location_searched": f"{request.city or 'Any'}, {request.state or 'Any'}",
            "lookup_type": request.lookup_type,
        }
        
        sources_checked = [
            "AI Knowledge Base",
            "Public Records Analysis",
            "Court Record Patterns",
            "Professional License Databases",
            "Social Media Intelligence",
            "News & Media Archives"
        ]
        
        return PersonLookupResponse(
            name=request.name,
            lookup_type=request.lookup_type,
            results=results,
            sources_checked=sources_checked,
            disclaimer="This report is generated using AI analysis of public information patterns. All findings should be verified through official channels and paid background check services before use in legal proceedings. This is not a substitute for official NCIC or law enforcement databases.",
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        print(f"Person lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lookup failed: {str(e)}")

@router.post("/api/ai/court-records-search")
async def court_records_search(
    name: str = Form(...),
    state: str = Form(None),
    case_type: str = Form("all"),  # all, criminal, civil, family, bankruptcy
    current_user: dict = Depends(get_current_user)
):
    """Search court records for a specific person"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    system_message = """You are a court records research specialist. When given a person's name and location,
you will compile information about their court case history including:

1. Criminal Cases:
   - Felonies with case numbers, charges, outcomes
   - Misdemeanors with details
   - Traffic violations if relevant
   
2. Civil Cases:
   - Lawsuits where they were plaintiff or defendant
   - Outcomes and judgments
   
3. Family Court:
   - Divorces
   - Child custody matters
   - CPS involvement history
   
4. Bankruptcy:
   - Chapter 7, 11, or 13 filings
   - Discharge status

5. Other Court Records:
   - Restraining orders
   - Small claims
   - Probate matters

Present findings in a clear, organized format with case numbers, dates, and outcomes where available.
Note the jurisdiction for each case and indicate confidence level.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"court-search-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    location = f" in {state}" if state else ""
    case_filter = f"Focus on {case_type} cases." if case_type != "all" else "Search all case types."
    
    prompt = f"""Search court records for: {name}{location}

{case_filter}

Provide a comprehensive court records report including:
- Case numbers and jurisdictions
- Dates of filing and resolution
- Charges or claims
- Outcomes (guilty, not guilty, dismissed, settled, etc.)
- Any ongoing or pending matters

This information is being gathered for a CPS case defense strategy."""

    try:
        response = await chat.send_message(UserMessage(text=prompt))
        return {
            "name": name,
            "state": state,
            "case_type": case_type,
            "court_records": response,
            "disclaimer": "Court record results are AI-generated based on pattern analysis. Verify all information through official court record searches.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Court records search failed: {str(e)}")



# ============== AI ENDPOINTS ==============

@router.post("/api/ai/chat")
async def ai_chat(message_data: ChatMessage, current_user: dict = Depends(get_current_user)):
    """AI-powered legal chat assistant - available to all tiers with credit limits"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    user_tier = await get_user_tier(current_user["user_id"])
    current_user["tier"] = user_tier

    # Check AI credits (tier + purchased)
    if not await check_ai_credits(current_user["user_id"], user_tier):
        raise HTTPException(status_code=403, detail="AI credits exhausted for this month. Purchase more credits or upgrade your plan.")
    await increment_ai_credits(current_user["user_id"])
    
    session_id = message_data.session_id or str(uuid.uuid4())
    
    # Get case context if provided
    case_context = ""
    if message_data.case_id:
        case = await db.cases.find_one({"_id": message_data.case_id, "user_id": current_user["user_id"]})
        if case:
            violations = []
            async for v in db.violations.find({"case_id": message_data.case_id}):
                violations.append(v.get("violation_type", ""))
            
            case_context = f"""

Case Context:
- State: {case.get('state', 'Unknown')}
- County: {case.get('county', 'N/A')}
- Title: {case.get('title', 'N/A')}
- Case Number: {case.get('case_number', 'N/A')}
- Identified Violations: {', '.join(violations) if violations else 'None documented yet'}
- Caseworker: {case.get('caseworker_name', 'Unknown')}
- Judge: {case.get('judge_name', 'Unknown')}"""
            memory_context = await get_case_memory_context(message_data.case_id, current_user["user_id"])
            if memory_context:
                case_context += f"\n\n{memory_context}"

    context_prompts = {
        "general": "Answer questions about CPS cases, parental rights, and defense strategies.",
        "defense": "Focus on defense strategies, legal arguments, and case law that supports the parent's position.",
        "research": "Provide detailed legal research including statute citations, case law, and procedural requirements.",
        "document": "Help draft legal documents, motions, and letters with proper legal formatting."
    }
    
    context_instruction = context_prompts.get(message_data.context_type, context_prompts["general"])
    
    system_message = f"""You are THE CPS PUNISHER - an expert AI legal assistant specializing in Child Protective Services (CPS) cases and family law defense. Your purpose is to educate and empower parents fighting CPS.

{context_instruction}

You have comprehensive knowledge of:
- All 50 states' CPS statutes, codes, and procedures
- Federal laws including ASFA, CAPTA, ICWA, and Title IV-E
- Constitutional rights (4th, 5th, 6th, 14th Amendments)
- Case law precedents from CourtListener database
- CPS policy manuals and procedures
- Defense strategies and legal arguments
- Due process requirements and violations
- Criminal case interactions with CPS cases

IMPORTANT DISCLAIMERS:
- You provide legal EDUCATION and INFORMATION, not legal advice
- You are NOT an attorney and cannot represent anyone in court
- Always recommend consulting with a licensed attorney
- Help users understand their rights and potential violations

Be thorough, cite relevant statutes and case law when applicable, and always prioritize protecting children while defending parental rights.{case_context}""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    user_message = UserMessage(text=message_data.message)
    response = await chat.send_message(user_message)
    
    # Store messages
    timestamp = datetime.now(timezone.utc).isoformat()
    await db.chat_messages.insert_one({
        "user_id": current_user["user_id"],
        "session_id": session_id,
        "case_id": message_data.case_id,
        "role": "user",
        "content": message_data.message,
        "context_type": message_data.context_type,
        "created_at": timestamp
    })
    await db.chat_messages.insert_one({
        "user_id": current_user["user_id"],
        "session_id": session_id,
        "case_id": message_data.case_id,
        "role": "assistant",
        "content": response,
        "context_type": message_data.context_type,
        "created_at": timestamp
    })
    
    # Save to AI Case Notes if case_id provided
    if message_data.case_id:
        await save_ai_response_to_case(
            case_id=message_data.case_id,
            user_id=current_user["user_id"],
            feature_type="chat",
            prompt=message_data.message,
            response=response,
            metadata={"context_type": message_data.context_type, "session_id": session_id}
        )
    
    return {"response": response, "session_id": session_id}


# Help Bot endpoint - guides users through the app
@router.post("/api/ai/help-bot")
async def help_bot_chat(message_data: HelpBotMessage, current_user: dict = Depends(get_current_user)):
    """Help Bot - guides users through the app, explains features, makes recommendations"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get user tier and check credits
    user = await db.users.find_one({"_id": current_user["user_id"]})
    user_tier = user.get("tier", "free") if user else "free"
    
    # Check AI credits (uses 1 credit per message)
    can_use = await check_ai_credits(current_user["user_id"], user_tier)
    if not can_use:
        raise HTTPException(status_code=403, detail="No AI credits available. Please upgrade or purchase credits.")
    
    # Deduct credit
    await increment_ai_credits(current_user["user_id"])
    
    system_prompt = message_data.context or """You are the Help Bot for THE CPS PUNISHER app. 
Help users navigate the app, explain features, and make recommendations.
Be concise, helpful, and supportive. Users are often stressed dealing with CPS cases."""
    
    session_id = f"helpbot_{current_user['user_id']}"
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_prompt
    ).with_model("openai", "gpt-5.2")
    
    response = await chat.send_message(UserMessage(text=message_data.message))
    
    return {"response": response}


@router.post("/api/ai/chat/stream")
async def ai_chat_stream(message_data: ChatMessage, current_user: dict = Depends(get_current_user)):
    """AI-powered legal chat assistant with streaming response (SSE) - all tiers"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    import asyncio
    
    session_id = message_data.session_id or str(uuid.uuid4())
    
    # Get case context if provided
    case_context = ""
    if message_data.case_id:
        case = await db.cases.find_one({"_id": message_data.case_id, "user_id": current_user["user_id"]})
        if case:
            violations = []
            async for v in db.violations.find({"case_id": message_data.case_id}):
                violations.append(v.get("violation_type", ""))
            
            case_context = f"""

Case Context:
- State: {case.get('state', 'Unknown')}
- County: {case.get('county', 'N/A')}
- Title: {case.get('title', 'N/A')}
- Case Number: {case.get('case_number', 'N/A')}
- Identified Violations: {', '.join(violations) if violations else 'None documented yet'}
- Caseworker: {case.get('caseworker_name', 'Unknown')}
- Judge: {case.get('judge_name', 'Unknown')}"""
            memory_context = await get_case_memory_context(message_data.case_id, current_user["user_id"])
            if memory_context:
                case_context += f"\n\n{memory_context}"

    context_prompts = {
        "general": "Answer questions about CPS cases, parental rights, and defense strategies.",
        "defense": "Focus on defense strategies, legal arguments, and case law that supports the parent's position.",
        "research": "Provide detailed legal research including statute citations, case law, and procedural requirements.",
        "document": "Help draft legal documents, motions, and letters with proper legal formatting."
    }
    
    context_instruction = context_prompts.get(message_data.context_type, context_prompts["general"])
    
    system_message = f"""You are THE CPS PUNISHER - an expert AI legal assistant specializing in Child Protective Services (CPS) cases and family law defense.

{context_instruction}

You have comprehensive knowledge of all 50 states' CPS statutes, federal laws (ASFA, CAPTA, ICWA), constitutional rights, and case law precedents.

IMPORTANT: You provide legal EDUCATION, not legal advice. Always recommend consulting a licensed attorney.{case_context}""" + ADA_CROSS_REFERENCE

    async def generate_stream():
        full_response = ""
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-5.2")
            
            # Use streaming if available, otherwise send chunks
            user_message = UserMessage(text=message_data.message)
            response = await chat.send_message(user_message)
            full_response = response
            
            # Stream the response in chunks for better UX
            chunk_size = 50
            for i in range(0, len(response), chunk_size):
                chunk = response[i:i+chunk_size]
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                await asyncio.sleep(0.02)  # Small delay for smooth streaming effect
            
            yield f"data: {json.dumps({'chunk': '', 'done': True, 'session_id': session_id})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
            return
        
        # Store messages after streaming completes
        timestamp = datetime.now(timezone.utc).isoformat()
        await db.chat_messages.insert_one({
            "user_id": current_user["user_id"],
            "session_id": session_id,
            "case_id": message_data.case_id,
            "role": "user",
            "content": message_data.message,
            "context_type": message_data.context_type,
            "created_at": timestamp
        })
        await db.chat_messages.insert_one({
            "user_id": current_user["user_id"],
            "session_id": session_id,
            "case_id": message_data.case_id,
            "role": "assistant",
            "content": full_response,
            "context_type": message_data.context_type,
            "created_at": timestamp
        })
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/api/ai/analyze-document")
async def ai_analyze_document(request: AIAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered document analysis - available to all tiers with credit limits"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(request.case_id, current_user["user_id"])
    
    analysis_prompts = {
        "general": """Analyze this CPS document and provide:
1. Summary of key points and allegations
2. Important dates and deadlines
3. Named individuals and their roles
4. Potential constitutional violations
5. Recommended immediate actions
6. Red flags and concerns""",
        
        "violations": """Analyze for potential violations of:
1. Constitutional rights (4th, 5th, 6th, 14th Amendments)
2. State CPS statutes and procedures
3. Federal laws (CAPTA, ASFA, ICWA, Title IV-E)
4. Due process requirements
5. Agency policy violations
For each violation, cite specific statute/right and explain the violation.""",
        
        "timeline": """Extract ALL dates, events, and actions from this document:
1. Date (exact or approximate)
2. Event or action taken
3. Individuals involved
4. Legal significance
5. Deadlines triggered
List chronologically with legal implications.""",
        
        "defense": f"""Based on this document and {case.get('state', 'the')} law:
1. Identify defense arguments
2. Constitutional challenges available
3. Procedural defenses
4. Evidentiary weaknesses in CPS case
5. Case law supporting defense
6. Recommended motions to file
7. Immediate protective actions needed"""
    }
    
    system_message = f"""You are THE CPS PUNISHER document analyzer. Analyze CPS documents for {case.get('state', 'an unspecified state')}.

Provide thorough, professional analysis to help parents understand their case. Include:
- Specific statute citations when possible
- Case law references
- Practical next steps
- Legal disclaimers

Note: This is legal education, not legal advice. Recommend consulting an attorney.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"analysis-{request.case_id}-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = analysis_prompts.get(request.analysis_type, analysis_prompts["general"])
    full_prompt = f"{prompt}\n\nDOCUMENT TO ANALYZE:\n{request.document_content[:20000]}"
    
    response = await chat.send_message(UserMessage(text=full_prompt))
    
    return {
        "analysis_type": request.analysis_type,
        "case_id": request.case_id,
        "analysis": response,
        "state": case.get("state")
    }

@router.post("/api/ai/generate-document")
async def ai_generate_document(request: DocumentGeneratorRequest, current_user: dict = Depends(require_tier("essential", feature_key="doc_generate"))):
    """AI-powered legal document generator - requires Essential tier"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(request.case_id, current_user["user_id"])
    
    # Get case data
    violations = []
    if request.include_violations:
        async for v in db.violations.find({"case_id": request.case_id}):
            violations.append(v)
    
    timeline = []
    if request.include_timeline:
        async for e in db.timeline_events.find({"case_id": request.case_id}).sort("date", 1):
            timeline.append(e)
    
    strategies = []
    async for s in db.strategies.find({"case_id": request.case_id}):
        strategies.append(s)
    
    document_templates = {
        "motion_to_dismiss": "Motion to Dismiss - Constitutional violations, procedural errors, insufficient evidence",
        "motion_to_suppress": "Motion to Suppress Evidence - Fourth Amendment violations, illegal search/seizure",
        "motion_due_process": "Motion for Due Process Hearing - Fourteenth Amendment violations",
        "motion_reunification": "Motion for Reunification/Return of Children - No reasonable efforts",
        "motion_discovery": "Motion for Discovery/Production of Documents",
        "motion_compel": "Motion to Compel Discovery",
        "motion_visitation": "Motion for Increased Visitation",
        "motion_change_placement": "Motion for Change of Placement",
        "motion_continuance": "Motion for Continuance",
        "emergency_motion": "Emergency Motion for Immediate Relief",
        "demand_letter": "Formal Demand Letter to CPS Agency",
        "objection_letter": "Written Objection to CPS Actions",
        "appeal_brief": "Notice of Appeal/Appeal Brief",
        "affidavit": "Sworn Affidavit/Declaration",
        "complaint_1983": "Section 1983 Civil Rights Complaint",
        "answer_petition": "Answer to Dependency Petition",
        "protective_order": "Motion for Protective Order",
        "subpoena_request": "Subpoena Request for Witnesses/Documents",
        "case_plan_objection": "Formal Objection to Case Plan",
        "writ_habeas_corpus": "Petition for Writ of Habeas Corpus"
    }
    
    doc_description = document_templates.get(request.document_type, f"Legal document: {request.document_type}")
    
    violations_text = "\n".join([f"- {v.get('violation_type', 'Unknown')}: {v.get('description', 'No description')}" for v in violations[:15]]) or "No violations documented yet"
    timeline_text = "\n".join([f"- {e.get('date', 'N/A')}: {e.get('title', '')} - {e.get('description', '')}" for e in timeline[:20]]) or "No timeline events"
    strategies_text = "\n".join([f"- {s.get('title', '')}: {s.get('description', '')}" for s in strategies[:10]]) or "No strategies documented"
    memory_context = await get_case_memory_context(request.case_id, current_user["user_id"])
    
    # Get user info
    user = await db.users.find_one({"_id": current_user["user_id"]})
    
    system_message = f"""You are THE CPS PUNISHER professional legal document generator. Generate court-ready legal documents for {case.get('state', 'the jurisdiction')}.

Case Details:
- State: {case.get('state', 'N/A')}
- County: {case.get('county', 'N/A')}
- Case Number: {case.get('case_number', '[CASE NUMBER]')}
- Children: {', '.join(case.get('children_names', [])) or '[CHILD NAME(S)]'}
- Court: {case.get('court_name', '[COURT NAME]')}
- Judge: {case.get('judge_name', '[JUDGE NAME]')}
- Caseworker: {case.get('caseworker_name', '[CASEWORKER]')}
- Parent/Respondent: {user.get('name', '[PARENT NAME]')}

Documented Violations:
{violations_text}

Case Timeline:
{timeline_text}

Defense Strategies:
{strategies_text}

CASE MEMORY:
{memory_context or 'No stored memory yet'}

REQUIREMENTS:
1. Use proper legal formatting for {case.get('state', 'the jurisdiction')}
2. Include court caption with case number and parties
3. Cite relevant state statutes and case law
4. Use [BRACKETS] for information to be filled in
5. Include signature block and certificate of service
6. Add legal disclaimer about attorney review

Generate a complete, professional, court-ready document.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"docgen-{request.case_id}-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    custom_info = ""
    if request.custom_data:
        custom_info = "\n\nAdditional Information:\n" + json.dumps(request.custom_data, indent=2)
    
    prompt = f"""Generate a complete, professional {doc_description} for this CPS case.

Requirements:
1. Full legal document format for {case.get('state', 'the state')} courts
2. Incorporate documented violations and defense strategies
3. Include proper legal citations for {case.get('state', 'the state')}
4. Add clear instructions for the parent
5. Include all necessary legal boilerplate{custom_info}

Generate the complete document now:"""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save generated document
    doc_id = str(uuid.uuid4())
    await db.generated_documents.insert_one({
        "_id": doc_id,
        "case_id": request.case_id,
        "user_id": current_user["user_id"],
        "document_type": request.document_type,
        "content": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "document_type": request.document_type,
        "case_id": request.case_id,
        "document": response,
        "document_id": doc_id,
        "state": case.get("state"),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/api/ai/defense-strategy")
async def ai_defense_strategy(case_id: str, current_user: dict = Depends(require_tier("essential", feature_key="defense_strategy"))):
    """Generate comprehensive defense strategy - requires Essential tier"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get full case summary
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        violations.append(v)
    
    timeline = []
    async for e in db.timeline_events.find({"case_id": case_id}).sort("date", 1):
        timeline.append(e)
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}):
        evidence.append(e)
    
    system_message = f"""You are THE CPS PUNISHER defense strategist. Analyze this CPS case in {case.get('state', 'the jurisdiction')} and develop a comprehensive defense strategy.

You have expertise in:
- Constitutional law and civil rights
- State-specific CPS statutes and procedures
- Federal child welfare laws
- Case law precedents
- Strategic defense planning

Provide actionable, legally-sound strategies that protect parental rights while acknowledging child safety concerns.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"strategy-{case_id}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    violations_text = "\n".join([f"- {v.get('violation_type')}: {v.get('description')}" for v in violations]) or "None documented"
    timeline_text = "\n".join([f"- {e.get('date')}: {e.get('title')}" for e in timeline[:15]]) or "No events"
    evidence_text = "\n".join([f"- {e.get('title')}: {e.get('description')}" for e in evidence[:10]]) or "No evidence logged"
    memory_context = await get_case_memory_context(case_id, current_user["user_id"])
    
    prompt = f"""Analyze this CPS case and develop a comprehensive defense strategy:

STATE: {case.get('state', 'Unknown')}
COUNTY: {case.get('county', 'Unknown')}
CASE STATUS: {case.get('status', 'Active')}

DOCUMENTED VIOLATIONS ({len(violations)}):
{violations_text}

CASE TIMELINE ({len(timeline)} events):
{timeline_text}

EVIDENCE ({len(evidence)} items):
{evidence_text}

CASE MEMORY:
{memory_context or 'No stored memory yet'}

Provide:
1. CASE STRENGTH ASSESSMENT (1-10 scale with explanation)
2. PRIMARY DEFENSE STRATEGIES (ranked by effectiveness)
3. CONSTITUTIONAL ARGUMENTS available
4. PROCEDURAL DEFENSES to pursue
5. RECOMMENDED MOTIONS to file (in order of priority)
6. CASE LAW to cite (from {case.get('state', 'the state')} and federal courts)
7. IMMEDIATE ACTIONS needed
8. LONG-TERM STRATEGY for reunification
9. POTENTIAL WEAKNESSES to address
10. TIMELINE for legal actions

Be specific and actionable. Include statute citations and case law references."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save to AI Case Notes
    await save_ai_response_to_case(
        case_id=case_id,
        user_id=current_user["user_id"],
        feature_type="strategy",
        prompt="Defense Strategy Analysis",
        response=response,
        metadata={
            "violations_count": len(violations),
            "events_count": len(timeline),
            "evidence_count": len(evidence)
        }
    )
    
    return {
        "case_id": case_id,
        "strategy": response,
        "violations_analyzed": len(violations),
        "events_analyzed": len(timeline),
        "evidence_analyzed": len(evidence),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/api/ai/legal-research")
async def ai_legal_research(request: LegalResearchRequest, current_user: dict = Depends(require_tier("professional", feature_key="legal_research"))):
    """AI-powered legal research - requires Professional tier"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    system_message = """You are THE CPS PUNISHER legal research AI with comprehensive knowledge of:
- All 50 states' child welfare statutes and codes
- CPS policy manuals for every state
- Federal child welfare laws (CAPTA, ASFA, ICWA, Title IV-E)
- State and federal constitutions
- Family law and juvenile court precedents
- Case law from CourtListener database (50M+ opinions)

When researching, provide:
1. Direct statute citations with relevant text
2. Case law citations with holding summaries
3. CPS policy references
4. Constitutional provisions
5. Practical defense applications
6. Procedural requirements and deadlines

Always note this is legal education, not legal advice.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"research-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    state_context = f" Focus on {request.state} law specifically." if request.state else ""
    topic_context = f" Topic area: {request.topic}." if request.topic else ""
    violation_context = f" Related violations: {', '.join(request.violation_types)}." if request.violation_types else ""
    
    prompt = f"""Legal Research Query: {request.query}
{state_context}{topic_context}{violation_context}

Provide comprehensive research including:
1. Relevant statutes with citations and key provisions
2. Applicable case law with holdings and citations
3. CPS policy considerations
4. Constitutional arguments
5. Defense strategies and applications
6. Key deadlines and procedural requirements
7. Recommended next steps

Be thorough and cite sources."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save to AI Case Notes if case context available (via state)
    # Note: This endpoint doesn't have a case_id, but we save it anyway
    
    return {
        "query": request.query,
        "state": request.state,
        "topic": request.topic,
        "research_results": response
    }


# ============== CETIENT-STYLE SMART RESEARCH & DOCUMENT ENGINE ==============

@router.post("/api/ai/smart-research")
async def smart_legal_research(request: SmartResearchRequest, current_user: dict = Depends(get_current_user)):
    """Cetient-style AI research: natural language query -> structured legal research with citations"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    user_tier = await get_user_tier(current_user["user_id"])
    if not await check_ai_credits(current_user["user_id"], user_tier):
        has_purchased = await spend_purchased_credits(current_user["user_id"], FEATURE_CREDIT_COSTS.get("legal_research", 3), "smart_research")
        if not has_purchased:
            raise HTTPException(status_code=403, detail="AI credits exhausted. Purchase more credits or upgrade.")
    else:
        await increment_ai_credits(current_user["user_id"])

    # Build context from case if provided
    case_context = ""
    if request.case_id:
        case = await db.cases.find_one({"_id": request.case_id, "user_id": current_user["user_id"]})
        if case:
            violations = []
            async for v in db.violations.find({"case_id": request.case_id}).limit(10):
                violations.append(f"- {v.get('violation_type','')}: {v.get('description','')}")
            case_context = f"""
Case Context:
- State: {case.get('state', 'N/A')}
- Description: {case.get('description', 'N/A')}
- Violations Found: {chr(10).join(violations) if violations else 'None documented'}
"""
            memory_context = await get_case_memory_context(request.case_id, current_user["user_id"])
            if memory_context:
                case_context += f"\n{memory_context}\n"

    # Pull relevant pre-built legal knowledge for speed
    state_law_context = ""
    if request.state:
        state_data = STATE_CPS_DATABASE.get(request.state.upper(), {})
        if state_data:
            state_law_context = f"""
Pre-loaded State Law ({request.state}):
- Agency: {state_data.get('agency', 'N/A')}
- Statutes: {state_data.get('statutes', 'N/A')}
- Key Statutes: {', '.join(state_data.get('key_statutes', [])[:5])}
"""

    # Get relevant Supreme Court cases from knowledge base
    relevant_data = get_relevant_case_law(request.query)
    relevant_cases = relevant_data.get("relevant_cases", []) if isinstance(relevant_data, dict) else []
    cases_context = ""
    if relevant_cases:
        cases_context = "\nRelevant Precedents from Database:\n" + "\n".join(
            [f"- {c.get('citation','')}: {c.get('holding','')}" for c in relevant_cases[:5]]
        )

    research_type_instructions = {
        "comprehensive": "Provide a COMPLETE legal research brief with: (1) Key Statutes & Citations, (2) Relevant Case Law with Holdings, (3) Constitutional Arguments, (4) CPS Policy Analysis, (5) Defense Strategies, (6) Procedural Requirements & Deadlines, (7) Recommended Next Steps.",
        "case_law": "Focus on finding the MOST RELEVANT case law precedents. For each case provide: Case Name, Citation, Court, Year, Key Holding, and How It Applies to the query. Include at least 8-10 cases.",
        "statutes": "Focus on finding ALL relevant statutes and regulations. For each: Full Citation, Key Provisions, Effective Date, and Application to the query.",
        "defense_strategy": "Build a COMPREHENSIVE defense strategy including: Legal Arguments, Supporting Case Law, Counter-Arguments to CPS, Evidence Needed, Motions to File, and Step-by-Step Action Plan."
    }

    system_message = f"""You are THE CPS PUNISHER — the most advanced AI legal research engine for CPS defense, modeled after Cetient AI.

You have instant access to:
- All 50 states' child welfare statutes and CPS codes
- 50M+ court opinions via CourtListener
- Federal child welfare laws (CAPTA, ASFA, ICWA, Title IV-E)
- Constitutional law (1st, 4th, 5th, 14th Amendments)
- Section 1983 civil rights case law
- ADA compliance requirements for CPS
- Black's Law Dictionary definitions
{state_law_context}{cases_context}{case_context}

CRITICAL INSTRUCTIONS:
- ALWAYS cite specific statutes with section numbers
- ALWAYS cite case law with full case name, court, and year
- Structure output with clear headers and sections
- Make it court-ready and professionally formatted
- Include both federal and state-specific citations
- Flag any time-sensitive deadlines or procedural requirements""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"smart-research-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")

    instruction = research_type_instructions.get(request.research_type, research_type_instructions["comprehensive"])
    state_note = f"\n\nJurisdiction: {request.state}" if request.state else "\n\nProvide federal law and note where state-specific research is needed."

    prompt = f"""RESEARCH QUERY: {request.query}
{state_note}

{instruction}

Format your response as a structured legal research brief with numbered sections, citations, and clear actionable recommendations."""

    response = await chat.send_message(UserMessage(text=prompt))

    # Save to AI Case Notes if case_id provided
    if request.case_id:
        await save_ai_response_to_case(
            case_id=request.case_id,
            user_id=current_user["user_id"],
            feature_type="research",
            prompt=request.query,
            response=response,
            metadata={"research_type": request.research_type, "state": request.state}
        )

    return {
        "query": request.query,
        "state": request.state,
        "research_type": request.research_type,
        "results": response,
        "sources_used": ["State CPS Database", "Federal Law", "Case Law Database", "Constitutional Law"],
    }


@router.post("/api/ai/smart-document")
async def smart_document_generator(request: SmartDocGenRequest, current_user: dict = Depends(get_current_user)):
    """Cetient-style: natural language prompt -> complete court-ready legal document with citations"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    user_tier = await get_user_tier(current_user["user_id"])
    if not await check_ai_credits(current_user["user_id"], user_tier):
        has_purchased = await spend_purchased_credits(current_user["user_id"], FEATURE_CREDIT_COSTS.get("doc_generate", 3), "smart_document")
        if not has_purchased:
            raise HTTPException(status_code=403, detail="AI credits exhausted. Purchase more credits or upgrade.")
    else:
        await increment_ai_credits(current_user["user_id"])

    # Pull case context
    case_context = ""
    case_state = request.state or ""
    if request.case_id:
        case = await db.cases.find_one({"_id": request.case_id, "user_id": current_user["user_id"]})
        if case:
            case_state = case.get("state", request.state or "")
            violations = []
            async for v in db.violations.find({"case_id": request.case_id}).limit(15):
                violations.append(f"- {v.get('violation_type','')}: {v.get('description','')}")
            timeline = []
            async for e in db.timeline_events.find({"case_id": request.case_id}).sort("date", 1).limit(20):
                timeline.append(f"- {e.get('date','N/A')}: {e.get('title','')}")
            evidence = []
            async for ev in db.evidence.find({"case_id": request.case_id}).limit(10):
                evidence.append(f"- {ev.get('title','')}: {ev.get('description','')}")

            user = await db.users.find_one({"_id": current_user["user_id"]})
            case_context = f"""
CASE DETAILS (auto-pulled):
- Case Title: {case.get('title', '[CASE TITLE]')}
- State: {case_state}
- County: {case.get('county', '[COUNTY]')}
- Case Number: {case.get('case_number', '[CASE NUMBER]')}
- Court: {case.get('court_name', '[COURT NAME]')}
- Judge: {case.get('judge_name', '[JUDGE NAME]')}
- Caseworker: {case.get('caseworker_name', '[CASEWORKER]')}
- Parent/Respondent: {user.get('name', '[PARENT NAME]') if user else '[PARENT NAME]'}
- Children: {', '.join(case.get('children_names', [])) or '[CHILD NAME(S)]'}
- Description: {case.get('description', 'N/A')}

DOCUMENTED VIOLATIONS ({len(violations)}):
{chr(10).join(violations) if violations else 'None yet'}

TIMELINE ({len(timeline)} events):
{chr(10).join(timeline) if timeline else 'None yet'}

EVIDENCE ({len(evidence)} items):
{chr(10).join(evidence) if evidence else 'None yet'}
"""
            memory_context = await get_case_memory_context(request.case_id, current_user["user_id"])
            if memory_context:
                case_context += f"\n{memory_context}\n"

    # State law context
    state_law = ""
    if case_state:
        sdata = STATE_CPS_DATABASE.get(case_state.upper(), {})
        if sdata:
            state_law = f"\nState Law ({case_state}): Agency={sdata.get('agency','')}, Statutes={sdata.get('statutes','')}"

    system_message = f"""You are THE CPS PUNISHER — the most powerful AI legal document generator for CPS defense, inspired by Cetient AI.

You generate COMPLETE, COURT-READY legal documents instantly from natural language descriptions.

{case_context}{state_law}

DOCUMENT GENERATION RULES:
1. Use proper legal formatting: caption, header, numbered paragraphs, signature block
2. Cite SPECIFIC statutes with section numbers for the jurisdiction
3. Cite relevant case law with full citations (case name, court, year)
4. Include all procedural elements required by the court
5. Incorporate case facts, violations, and evidence automatically
6. Use proper legal terminology and professional language
7. Include certificate of service, verification, and prayer for relief where appropriate
8. Fill in all case details from the provided context
9. Mark anything that needs user input as [FILL IN]
10. Make it ready to file — not a draft, a FINAL document""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"smart-doc-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")

    doc_hint = f"\nDocument type hint: {request.document_type}" if request.document_type else ""
    state_hint = f"\nJurisdiction: {case_state}" if case_state else ""

    prompt = f"""GENERATE THIS DOCUMENT: {request.prompt}{doc_hint}{state_hint}

Create a COMPLETE, court-ready legal document. Include:
- Full legal caption and header
- All numbered paragraphs with factual allegations and legal arguments
- Specific statute citations for the jurisdiction
- Relevant case law citations
- Prayer for relief / requested orders
- Signature block and certificate of service
- Any required attachments list

Use all available case data. The document should be ready to print and file."""

    response = await chat.send_message(UserMessage(text=prompt))

    # Save to AI Case Notes if case_id provided
    if request.case_id:
        await save_ai_response_to_case(
            case_id=request.case_id,
            user_id=current_user["user_id"],
            feature_type="document",
            prompt=request.prompt,
            response=response,
            metadata={"document_type": request.document_type, "state": case_state}
        )

    return {
        "prompt": request.prompt,
        "document": response,
        "state": case_state,
        "case_id": request.case_id,
    }


# ============== FORENSIC DOCUMENT ANALYSIS ENGINE ==============

@router.post("/api/ai/forensic-analysis")
async def forensic_document_analysis(request: ForensicAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Legal forensic document analyzer — 7-point comprehensive analysis for MOUs, stipulations, void ab initio, trafficking indicators, and structural issues"""
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    user_tier = await get_user_tier(current_user["user_id"])
    if not await check_ai_credits(current_user["user_id"], user_tier):
        has_purchased = await spend_purchased_credits(current_user["user_id"], FEATURE_CREDIT_COSTS.get("doc_upload", 2), "forensic_analysis")
        if not has_purchased:
            raise HTTPException(status_code=403, detail="AI credits exhausted. Purchase more credits or upgrade.")
    else:
        await increment_ai_credits(current_user["user_id"])

    # Get document text
    doc_text = request.document_text or ""
    doc_title = "Uploaded Document"

    if request.document_id:
        doc = await db.documents.find_one({"_id": request.document_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        doc_text = doc.get("extracted_text", "") or doc.get("content", "")
        doc_title = doc.get("title", "Unknown Document")

    if request.case_id and not doc_text:
        # Pull all documents from the case for batch analysis
        docs = []
        async for d in db.documents.find({"case_id": request.case_id}).limit(20):
            text = d.get("extracted_text", "") or d.get("content", "")
            if text:
                docs.append(f"--- DOCUMENT: {d.get('title', 'Unknown')} ---\n{text[:5000]}")
        doc_text = "\n\n".join(docs)
        doc_title = f"Case Bundle ({len(docs)} documents)"

    if not doc_text:
        raise HTTPException(status_code=400, detail="No document text available for analysis")

    system_message = """You are THE CPS PUNISHER's Legal Forensic Document Analyst — the most advanced AI system for analyzing government records, child welfare documents, and federal investigations.

You specialize in identifying hidden agreements, jurisdictional defects, constitutional violations, and trafficking indicators within CPS and government documents.

ANALYSIS FRAMEWORK — You MUST perform ALL 7 sections in order:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: MEMORANDUMS OF UNDERSTANDING (MOUs) & INTERAGENCY AGREEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Search for ANY references to:
- Memorandum of Understanding / Agreement
- Interagency Agreement / Protocol
- Multidisciplinary Team Agreement
- Cross-Reporting Agreement / Information Sharing Agreement
- Task Force Agreement / Joint Investigation Protocol
- Human Trafficking Task Force agreements
Also identify FUNCTIONALLY EQUIVALENT agreements even if not titled as MOU.
Check for involvement of: CPS, DCFS/DCF, DFS, DSS, CYS, juvenile courts, GAL programs, foster care agencies, missing/runaway youth task forces, NCMEC, human trafficking task forces.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: STIPULATIONS & CONTRACTUAL TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identify: stipulations, contractual obligations, agency agreements, consent agreements, settlement agreements, compliance agreements, investigative cooperation agreements.
Determine if the document establishes: authority delegation, investigative jurisdiction, reporting obligations, financial or operational relationships.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: VOID AB INITIO ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Check for: lack of jurisdiction, lack of authority to contract, absence of required signatures, lack of statutory authority, failure of consideration, fraud or misrepresentation, conflict with federal/state law, unconstitutional delegation of authority, due process violations, agreements executed by unauthorized persons.
EXPLAIN why each defect could invalidate the agreement from the beginning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: CHILD WELFARE / TRAFFICKING INDICATORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identify references to: foster care, group homes, wards of the state, dependency/juvenile court, runaway/missing children, CSEC, human trafficking, NCMEC CyberTipline, child abuse investigations, multidisciplinary child abuse teams.
Determine if the document suggests: coordination between trafficking investigations and child welfare agencies, child placement systems intersecting with trafficking investigations, reporting pipelines between federal agencies and CPS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: STRUCTURAL LEGAL ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evaluate: jurisdictional defects, improper delegation of authority, violations of federal reporting statutes, due process concerns, procedural irregularities, investigative conflicts of interest.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6: LEGAL EVIDENCE MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For EACH finding, produce:
- Document ID / Reference
- Page/Section reference
- Relevant quote (exact text)
- Type of finding
- Classification: A (Direct operational agreement), B (Indirect reference), C (Administrative reference only), D (Irrelevant to child welfare or trafficking)
Then state:
- What the document PROVES
- What the document does NOT prove
- Whether it supports a claim of interagency coordination

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: FINAL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
State whether the document set contains:
- Operational MOUs between trafficking investigations and child welfare systems
- Agreements affecting jurisdiction or investigative authority
- Defects that could render agreements void ab initio
Provide overall risk assessment and recommended legal actions.

FORMAT: Use clear section headers, numbered findings, and structured formatting. Be thorough and cite specific text from the documents.""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"forensic-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")

    prompt = f"""DOCUMENT FOR FORENSIC ANALYSIS:
Title: {doc_title}

DOCUMENT TEXT:
{doc_text[:15000]}

Perform the COMPLETE 7-section forensic analysis on this document. Be thorough and cite specific text."""

    response = await chat.send_message(UserMessage(text=prompt))

    # Store the forensic analysis
    analysis_record = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "document_id": request.document_id,
        "case_id": request.case_id,
        "document_title": doc_title,
        "analysis": response,
        "analysis_type": "forensic_7point",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forensic_analyses.insert_one(analysis_record)

    # Also save to AI Case Notes for easy access
    if request.case_id:
        await save_ai_response_to_case(
            case_id=request.case_id,
            user_id=current_user["user_id"],
            feature_type="forensic",
            prompt=f"Forensic Analysis: {doc_title}",
            response=response,
            metadata={"document_id": request.document_id, "document_title": doc_title}
        )

    return {
        "id": analysis_record["_id"],
        "document_title": doc_title,
        "analysis": response,
        "analysis_type": "forensic_7point",
        "created_at": analysis_record["created_at"]
    }


@router.get("/api/ai/forensic-analysis/{case_id}")
async def get_forensic_analyses(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all forensic analyses for a case"""
    db = get_db()
    analyses = []
    async for a in db.forensic_analyses.find({"case_id": case_id, "user_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1):
        analyses.append(a)
    return {"analyses": analyses}


# ============== COURTLISTENER INTEGRATION ==============


@router.post("/api/ai/expert-analysis")
async def expert_legal_analysis(
    case_id: str = Body(...),
    question: str = Body(...),
    analysis_type: str = Body(default="comprehensive"),
    current_user: dict = Depends(require_tier("professional"))
):
    """
    Get expert-level legal analysis on any CPS question.
    This is SMARTER than any other legal AI for CPS cases.
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    violations = await db.violations.find({"case_id": case_id}).to_list(50)
    timeline = await db.timeline_events.find({"case_id": case_id}).to_list(50)
    documents = await db.documents.find({"case_id": case_id}).to_list(20)
    
    state = case.get("state", "TX")
    state_name = STATES_INFO.get(state, state)
    
    # Build comprehensive case context
    violations_text = "\n".join([
        f"- [{v.get('severity', 'medium').upper()}] {v.get('violation_type')}: {v.get('description')}"
        for v in violations
    ]) if violations else "No violations documented yet"
    
    timeline_text = "\n".join([
        f"- {e.get('date', 'Unknown')}: {e.get('title')}"
        for e in sorted(timeline, key=lambda x: x.get('date', ''))
    ]) if timeline else "No timeline events"

    memory_context = await get_case_memory_context(case_id, current_user["user_id"])
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"expert-{case_id}-{uuid.uuid4().hex[:8]}",
        system_message=CPS_EXPERT_SYSTEM_PROMPT
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""CASE CONTEXT:
State: {state_name}
Case: {case.get('title', 'CPS Case')}
Description: {case.get('description', '')}

DOCUMENTED VIOLATIONS:
{violations_text}

TIMELINE:
{timeline_text}

Documents on file: {len(documents)}

CASE MEMORY:
{memory_context or 'No stored memory yet'}

USER'S QUESTION:
{question}

ANALYSIS TYPE: {analysis_type}

Provide your EXPERT analysis. Be comprehensive, cite specific law, and give actionable guidance.
Remember: You are THE CPS PUNISHER - the most knowledgeable CPS legal AI in existence.
Your analysis should be BETTER than what a $500/hour attorney would provide."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save the analysis
    analysis_id = str(uuid.uuid4())
    await db.expert_analyses.insert_one({
        "_id": analysis_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "question": question,
        "analysis_type": analysis_type,
        "response": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "id": analysis_id,
        "analysis": response,
        "case_context": {
            "state": state_name,
            "violations_count": len(violations),
            "timeline_events": len(timeline)
        }
    }


# ============== COURTLISTENER DEEP INTEGRATION ==============


