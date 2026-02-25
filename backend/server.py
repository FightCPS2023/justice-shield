"""
THE CPS PUNISHER - Backend API Server
Child Protective Services Case Defense Platform
AI-powered legal document analysis and defense strategy generation
"""

import os
import re
import json
import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import jwt, JWTError

load_dotenv()

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cps_punisher")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")

# Stripe pricing tiers (price IDs from existing Stripe products)
STRIPE_PRICE_IDS = {
    "essential_monthly": "price_1SZChVLer5ye2GBih8C2Cn8U",
    "essential_annual": "price_1SZDqXLer5ye2GBi27cH4jsS",
    "professional_monthly": "price_1SZDlfLer5ye2GBidSCef53l",
    "professional_annual": "price_1SZDwnLer5ye2GBiqEl9SAba",
    "attorney_monthly": "price_1SZDnkLer5ye2GBisGCQtncE",
    "attorney_annual": "price_1SZDsSLer5ye2GBieHTotLLO",
    "enterprise_monthly": "price_1SZDpeLer5ye2GBi9gT16zyW",
    "enterprise_annual": "price_1SZDueLer5ye2GBiRifVwAeC",
}

TIER_PRICES = {
    "essential": {"monthly": 39.00, "annual": 390.00},
    "professional": {"monthly": 79.00, "annual": 790.00},
    "attorney": {"monthly": 299.00, "annual": 2990.00},
    "enterprise": {"monthly": 999.00, "annual": 9990.00},
}

# JWT Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "cps-punisher-secret-key-2024-secure-random-string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

# Database client
client: AsyncIOMotorClient = None
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.cases.create_index("user_id")
    await db.documents.create_index("case_id")
    await db.violations.create_index("case_id")
    await db.timeline_events.create_index("case_id")
    await db.strategies.create_index("case_id")
    await db.chat_messages.create_index([("user_id", 1), ("session_id", 1)])
    
    yield
    client.close()


app = FastAPI(
    title="The CPS Punisher API",
    description="AI-powered Child Protective Services case defense platform",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str
    tier: str

class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    state: str
    children_names: Optional[List[str]] = []
    case_number: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None

class DocumentCreate(BaseModel):
    case_id: str
    title: str
    content: str
    doc_type: str
    date: Optional[str] = None

class ViolationCreate(BaseModel):
    case_id: str
    violation_type: str
    description: str
    severity: str = "medium"
    date: Optional[str] = None
    statute_reference: Optional[str] = None

class TimelineEventCreate(BaseModel):
    case_id: str
    title: str
    description: str
    date: str
    event_type: str = "general"

class StrategyCreate(BaseModel):
    case_id: str
    title: str
    description: str
    priority: str = "medium"
    legal_basis: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    case_id: Optional[str] = None

class AIAnalysisRequest(BaseModel):
    case_id: str
    document_content: str
    analysis_type: str = "general"  # general, violations, timeline, strategy

class LegalResearchRequest(BaseModel):
    query: str
    state: Optional[str] = None
    topic: Optional[str] = None

class DocumentGeneratorRequest(BaseModel):
    case_id: str
    document_type: str
    custom_data: Optional[Dict[str, Any]] = None


# ============== HELPERS ==============

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Register a new user"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "name": user_data.name,
        "tier": "free",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token({"user_id": user_id, "email": user_data.email})
    
    return TokenResponse(
        access_token=access_token,
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        tier="free"
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Login and get access token"""
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"user_id": user["_id"], "email": user["email"]})
    
    return TokenResponse(
        access_token=access_token,
        user_id=user["_id"],
        email=user["email"],
        name=user.get("name", "User"),
        tier=user.get("tier", "free")
    )

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = user.pop("_id")
    return user


# ============== CASES ENDPOINTS ==============

@app.post("/api/cases")
async def create_case(case_data: CaseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new CPS case"""
    case_id = str(uuid.uuid4())
    case_doc = {
        "_id": case_id,
        "user_id": current_user["user_id"],
        "title": case_data.title,
        "description": case_data.description,
        "state": case_data.state,
        "children_names": case_data.children_names,
        "case_number": case_data.case_number,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cases.insert_one(case_doc)
    case_doc["id"] = case_doc.pop("_id")
    return case_doc

@app.get("/api/cases")
async def list_cases(current_user: dict = Depends(get_current_user)):
    """List all cases for the current user"""
    cases = []
    async for case in db.cases.find({"user_id": current_user["user_id"]}):
        case["id"] = case.pop("_id")
        del case["user_id"]
        cases.append(case)
    return {"cases": cases}

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific case"""
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case["id"] = case.pop("_id")
    return case

@app.put("/api/cases/{case_id}")
async def update_case(case_id: str, case_data: CaseUpdate, current_user: dict = Depends(get_current_user)):
    """Update a case"""
    update_data = {k: v for k, v in case_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cases.update_one(
        {"_id": case_id, "user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return {"message": "Case updated successfully"}


# ============== DOCUMENTS ENDPOINTS ==============

@app.post("/api/documents")
async def create_document(doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    """Add a document to a case"""
    # Verify case ownership
    case = await db.cases.find_one({"_id": doc_data.case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "case_id": doc_data.case_id,
        "user_id": current_user["user_id"],
        "title": doc_data.title,
        "content": doc_data.content,
        "doc_type": doc_data.doc_type,
        "date": doc_data.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.documents.insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@app.get("/api/documents/{case_id}")
async def list_documents(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all documents for a case"""
    # Verify case ownership
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    docs = []
    async for doc in db.documents.find({"case_id": case_id}):
        doc["id"] = doc.pop("_id")
        docs.append(doc)
    return {"documents": docs}


# ============== VIOLATIONS ENDPOINTS ==============

@app.post("/api/violations")
async def create_violation(violation_data: ViolationCreate, current_user: dict = Depends(get_current_user)):
    """Add a violation to a case"""
    case = await db.cases.find_one({"_id": violation_data.case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
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
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.violations.insert_one(violation)
    violation["id"] = violation.pop("_id")
    return violation

@app.get("/api/violations/{case_id}")
async def list_violations(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all violations for a case"""
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        v["id"] = v.pop("_id")
        violations.append(v)
    return {"violations": violations}


# ============== TIMELINE ENDPOINTS ==============

@app.post("/api/timeline")
async def create_timeline_event(event_data: TimelineEventCreate, current_user: dict = Depends(get_current_user)):
    """Add a timeline event to a case"""
    case = await db.cases.find_one({"_id": event_data.case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    event_id = str(uuid.uuid4())
    event = {
        "_id": event_id,
        "case_id": event_data.case_id,
        "user_id": current_user["user_id"],
        "title": event_data.title,
        "description": event_data.description,
        "date": event_data.date,
        "event_type": event_data.event_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.timeline_events.insert_one(event)
    event["id"] = event.pop("_id")
    return event

@app.get("/api/timeline/{case_id}")
async def list_timeline_events(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all timeline events for a case"""
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    events = []
    async for e in db.timeline_events.find({"case_id": case_id}).sort("date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events}


# ============== STRATEGIES ENDPOINTS ==============

@app.post("/api/strategies")
async def create_strategy(strategy_data: StrategyCreate, current_user: dict = Depends(get_current_user)):
    """Add a defense strategy to a case"""
    case = await db.cases.find_one({"_id": strategy_data.case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    strategy_id = str(uuid.uuid4())
    strategy = {
        "_id": strategy_id,
        "case_id": strategy_data.case_id,
        "user_id": current_user["user_id"],
        "title": strategy_data.title,
        "description": strategy_data.description,
        "priority": strategy_data.priority,
        "legal_basis": strategy_data.legal_basis,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.strategies.insert_one(strategy)
    strategy["id"] = strategy.pop("_id")
    return strategy

@app.get("/api/strategies/{case_id}")
async def list_strategies(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all strategies for a case"""
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}):
        s["id"] = s.pop("_id")
        strategies.append(s)
    return {"strategies": strategies}


# ============== AI ENDPOINTS ==============

@app.post("/api/ai/chat")
async def ai_chat(message_data: ChatMessage, current_user: dict = Depends(get_current_user)):
    """AI-powered legal chat assistant"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    session_id = message_data.session_id or str(uuid.uuid4())
    
    # Get case context if provided
    case_context = ""
    if message_data.case_id:
        case = await db.cases.find_one({"_id": message_data.case_id, "user_id": current_user["user_id"]})
        if case:
            case_context = f"\n\nCase Context: State: {case.get('state', 'Unknown')}, Title: {case.get('title', 'N/A')}"
    
    system_message = f"""You are THE CPS PUNISHER - an expert AI legal assistant specializing in Child Protective Services (CPS) cases and family law defense. Your purpose is to educate and empower parents fighting CPS.

You have comprehensive knowledge of:
- All 50 states' CPS statutes, codes, and procedures
- Federal laws including ASFA, CAPTA, and Title IV-E
- Constitutional rights (4th, 5th, 6th, 14th Amendments)
- Case law precedents in family and juvenile court
- CPS policy manuals and procedures
- Defense strategies and legal arguments
- Due process requirements and violations

IMPORTANT DISCLAIMERS:
- You provide legal EDUCATION and INFORMATION, not legal advice
- You are NOT an attorney and cannot represent anyone in court
- Always recommend consulting with a licensed attorney
- Help users understand their rights and potential violations

Be thorough, cite relevant statutes when applicable, and always prioritize protecting children while defending parental rights.{case_context}"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    # Get chat history for context
    history = []
    async for msg in db.chat_messages.find(
        {"user_id": current_user["user_id"], "session_id": session_id}
    ).sort("created_at", 1).limit(10):
        history.append({"role": msg["role"], "content": msg["content"]})
    
    # Add message history to chat context
    for hist_msg in history:
        if hist_msg["role"] == "user":
            await chat.send_message(UserMessage(text=hist_msg["content"]))
        # Note: assistant responses are handled by the chat object internally
    
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
        "created_at": timestamp
    })
    await db.chat_messages.insert_one({
        "user_id": current_user["user_id"],
        "session_id": session_id,
        "case_id": message_data.case_id,
        "role": "assistant",
        "content": response,
        "created_at": timestamp
    })
    
    return {
        "response": response,
        "session_id": session_id
    }

@app.post("/api/ai/analyze")
async def ai_analyze(request: AIAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered document and case analysis"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await db.cases.find_one({"_id": request.case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    analysis_prompts = {
        "general": """Analyze this CPS document and provide:
1. Summary of key points
2. Important dates and deadlines mentioned
3. Named individuals and their roles
4. Allegations or claims made
5. Potential issues or red flags
6. Recommended follow-up actions""",
        
        "violations": """Analyze this CPS document for potential violations of:
1. Constitutional rights (4th, 5th, 6th, 14th Amendments)
2. State CPS statutes and procedures
3. Federal laws (CAPTA, ASFA, Title IV-E)
4. Due process requirements
5. Agency policy violations
For each violation found, cite the specific statute or right violated and explain why.""",
        
        "timeline": """Extract ALL dates, events, and actions from this document to create a case timeline. For each entry provide:
1. Date (exact or approximate)
2. Event or action
3. Individuals involved
4. Significance to the case
List in chronological order.""",
        
        "strategy": f"""Based on this document and the case being in {case.get('state', 'the')}, develop defense strategies that address:
1. Constitutional challenges
2. Procedural defenses
3. Evidentiary issues
4. Witness credibility
5. Alternative explanations
6. Reunification arguments
Cite relevant case law and statutes for {case.get('state', 'the state')}."""
    }
    
    system_message = f"""You are THE CPS PUNISHER legal analysis AI. You are analyzing documents for a CPS case in {case.get('state', 'an unspecified state')}.

Provide thorough, professional analysis that would help a parent understand their case and prepare for court. Always note:
- This is legal education, not legal advice
- Recommend consulting with a licensed attorney
- Be specific with statute citations when possible
- Focus on protecting parental rights while acknowledging child safety concerns"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"analysis-{request.case_id}-{request.analysis_type}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = analysis_prompts.get(request.analysis_type, analysis_prompts["general"])
    full_prompt = f"{prompt}\n\nDOCUMENT TO ANALYZE:\n{request.document_content[:15000]}"  # Limit content length
    
    response = await chat.send_message(UserMessage(text=full_prompt))
    
    return {
        "analysis_type": request.analysis_type,
        "case_id": request.case_id,
        "analysis": response,
        "state": case.get("state")
    }

@app.post("/api/ai/generate-document")
async def ai_generate_document(request: DocumentGeneratorRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered legal document generator"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case = await db.cases.find_one({"_id": request.case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get case data
    violations = []
    async for v in db.violations.find({"case_id": request.case_id}):
        violations.append(v)
    
    strategies = []
    async for s in db.strategies.find({"case_id": request.case_id}):
        strategies.append(s)
    
    document_templates = {
        "motion_to_dismiss": "Motion to Dismiss with specific grounds based on constitutional violations, procedural errors, or insufficient evidence",
        "motion_discovery": "Motion for Discovery/Production of Documents requesting all CPS records, communications, and evidence",
        "motion_due_process": "Motion for Due Process Hearing asserting constitutional right violations",
        "demand_letter": "Formal demand letter to CPS agency documenting violations and demanding compliance with law",
        "objection_letter": "Written objection to CPS actions with legal citations and constitutional arguments",
        "appeal_brief": "Appeal brief challenging lower court ruling with legal arguments and case law citations",
        "affidavit": "Affidavit/Declaration documenting facts and sworn statements",
        "complaint_civil_rights": "Civil rights complaint under 42 USC 1983 for constitutional violations",
        "subpoena_request": "Subpoena request for witnesses and documents",
        "case_plan_objection": "Formal objection to proposed case plan with alternative proposals"
    }
    
    doc_description = document_templates.get(request.document_type, f"Legal document: {request.document_type}")
    
    violations_text = "\n".join([f"- {v['violation_type']}: {v['description']}" for v in violations[:10]]) or "No violations documented yet"
    strategies_text = "\n".join([f"- {s['title']}: {s['description']}" for s in strategies[:5]]) or "No strategies documented yet"
    
    system_message = f"""You are THE CPS PUNISHER legal document generator. Generate professional, court-ready legal documents.

Case Details:
- State: {case.get('state', 'N/A')}
- Case Title: {case.get('title', 'N/A')}
- Case Number: {case.get('case_number', '[CASE NUMBER]')}
- Children: {', '.join(case.get('children_names', [])) or '[CHILD NAME(S)]'}

Documented Violations:
{violations_text}

Defense Strategies:
{strategies_text}

IMPORTANT:
1. Use proper legal formatting for {case.get('state', 'the jurisdiction')}
2. Include all required headers, captions, and certifications
3. Cite relevant state statutes and case law
4. Use [BRACKETS] for information the parent needs to fill in
5. Include signature lines and date fields
6. Add disclaimer that this is a template requiring attorney review"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"docgen-{request.case_id}-{request.document_type}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    custom_info = ""
    if request.custom_data:
        custom_info = "\n\nAdditional Information Provided:\n" + json.dumps(request.custom_data, indent=2)
    
    prompt = f"""Generate a complete, professional {doc_description} for this CPS case.

Requirements:
1. Full legal document format appropriate for {case.get('state', 'the state')} courts
2. Incorporate the documented violations and defense strategies
3. Include proper legal citations for {case.get('state', 'the state')}
4. Add clear instructions for the parent on how to use this document
5. Include all necessary legal boilerplate and certifications{custom_info}

Generate the complete document now:"""

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "document_type": request.document_type,
        "case_id": request.case_id,
        "document": response,
        "state": case.get("state"),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/ai/legal-research")
async def ai_legal_research(request: LegalResearchRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered legal research assistant"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    system_message = """You are THE CPS PUNISHER legal research AI with comprehensive knowledge of:
- All 50 states' child welfare statutes and codes
- CPS policy manuals for every state
- Federal child welfare laws (CAPTA, ASFA, ICWA, Title IV-E)
- State constitutions and Bill of Rights
- Federal Constitution (especially 4th, 5th, 6th, 14th Amendments)
- Family law and juvenile court precedents
- Case law from state and federal courts

When researching, provide:
1. Direct statute citations with full text when relevant
2. Case law citations with holding summaries
3. CPS policy references
4. Constitutional provisions
5. Practical application to CPS defense

Always note this is legal education, not legal advice."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"research-{uuid.uuid4()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    state_context = f" Focus on {request.state} law specifically." if request.state else " Cover federal law and general state law principles."
    topic_context = f" Topic area: {request.topic}." if request.topic else ""
    
    prompt = f"""Legal Research Query: {request.query}
{state_context}{topic_context}

Provide comprehensive legal research results including:
1. Relevant statutes with citations
2. Applicable case law with holdings
3. CPS policy considerations
4. Constitutional arguments
5. Practical defense applications
6. Key deadlines or procedural requirements

Be thorough and cite your sources."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "query": request.query,
        "state": request.state,
        "topic": request.topic,
        "research_results": response
    }


# ============== STATE LAW LIBRARY ==============

@app.get("/api/law-library/states")
async def get_all_states():
    """Get list of all states with CPS information"""
    states = [
        {"code": "AL", "name": "Alabama"}, {"code": "AK", "name": "Alaska"},
        {"code": "AZ", "name": "Arizona"}, {"code": "AR", "name": "Arkansas"},
        {"code": "CA", "name": "California"}, {"code": "CO", "name": "Colorado"},
        {"code": "CT", "name": "Connecticut"}, {"code": "DE", "name": "Delaware"},
        {"code": "FL", "name": "Florida"}, {"code": "GA", "name": "Georgia"},
        {"code": "HI", "name": "Hawaii"}, {"code": "ID", "name": "Idaho"},
        {"code": "IL", "name": "Illinois"}, {"code": "IN", "name": "Indiana"},
        {"code": "IA", "name": "Iowa"}, {"code": "KS", "name": "Kansas"},
        {"code": "KY", "name": "Kentucky"}, {"code": "LA", "name": "Louisiana"},
        {"code": "ME", "name": "Maine"}, {"code": "MD", "name": "Maryland"},
        {"code": "MA", "name": "Massachusetts"}, {"code": "MI", "name": "Michigan"},
        {"code": "MN", "name": "Minnesota"}, {"code": "MS", "name": "Mississippi"},
        {"code": "MO", "name": "Missouri"}, {"code": "MT", "name": "Montana"},
        {"code": "NE", "name": "Nebraska"}, {"code": "NV", "name": "Nevada"},
        {"code": "NH", "name": "New Hampshire"}, {"code": "NJ", "name": "New Jersey"},
        {"code": "NM", "name": "New Mexico"}, {"code": "NY", "name": "New York"},
        {"code": "NC", "name": "North Carolina"}, {"code": "ND", "name": "North Dakota"},
        {"code": "OH", "name": "Ohio"}, {"code": "OK", "name": "Oklahoma"},
        {"code": "OR", "name": "Oregon"}, {"code": "PA", "name": "Pennsylvania"},
        {"code": "RI", "name": "Rhode Island"}, {"code": "SC", "name": "South Carolina"},
        {"code": "SD", "name": "South Dakota"}, {"code": "TN", "name": "Tennessee"},
        {"code": "TX", "name": "Texas"}, {"code": "UT", "name": "Utah"},
        {"code": "VT", "name": "Vermont"}, {"code": "VA", "name": "Virginia"},
        {"code": "WA", "name": "Washington"}, {"code": "WV", "name": "West Virginia"},
        {"code": "WI", "name": "Wisconsin"}, {"code": "WY", "name": "Wyoming"}
    ]
    return {"states": states}

@app.get("/api/law-library/{state_code}")
async def get_state_law_info(state_code: str):
    """Get CPS law information for a specific state"""
    # This would typically load from the state-cps-config.json
    # For now, using AI to provide comprehensive information
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"state-law-{state_code}",
        system_message="You are a legal expert providing comprehensive CPS law information for US states."
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Provide comprehensive CPS law information for {state_code} including:

1. **Agency Name**: Official name of the child welfare agency
2. **Governing Statutes**: Primary state codes and chapters
3. **Key Timeframes**:
   - Emergency removal hearing deadline
   - Adjudication hearing deadline
   - Review hearing schedule
4. **Discovery Rights**: Statute citations for records access
5. **Parental Rights Statutes**: Termination of parental rights provisions
6. **Notice Requirements**: Deadlines for service of process
7. **Court Caption Format**: Proper format for legal filings
8. **Important Case Law**: Key precedents for CPS cases
9. **CPS Policy Manual**: Where to access official policies
10. **State Constitution Provisions**: Relevant parental rights protections

Format as a structured response with citations."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "state_code": state_code,
        "law_info": response
    }


# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CPS Punisher API",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
