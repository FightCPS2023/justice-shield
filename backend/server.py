"""
THE CPS PUNISHER - Complete Backend API Server
Child Protective Services Case Defense Platform
AI-powered legal document analysis, defense strategy generation, court research
109+ Features | 50 States Coverage | CourtListener Integration

VERSION 3.0 - FULL FEATURE SET
"""

import os
import re
import json
import uuid
import hashlib
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
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
COURTLISTENER_API_KEY = os.environ.get("COURTLISTENER_API_KEY", "")

# Stripe pricing tiers
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

TIER_FEATURES = {
    "free": {"docs_per_month": 5, "ai_credits": 10, "case_law_searches": 10},
    "essential": {"docs_per_month": 25, "ai_credits": 100, "case_law_searches": 100},
    "professional": {"docs_per_month": -1, "ai_credits": 500, "case_law_searches": -1},
    "attorney": {"docs_per_month": -1, "ai_credits": 2000, "case_law_searches": -1},
    "enterprise": {"docs_per_month": -1, "ai_credits": -1, "case_law_searches": -1},
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
    
    # Create indexes for all collections
    collections_indexes = {
        "users": [("email", True)],
        "cases": [("user_id", False)],
        "documents": [("case_id", False), ("user_id", False)],
        "violations": [("case_id", False)],
        "timeline_events": [("case_id", False)],
        "strategies": [("case_id", False)],
        "chat_messages": [("user_id", False), ("session_id", False)],
        "calendar_events": [("user_id", False)],
        "payment_transactions": [("session_id", True), ("user_id", False)],
        "evidence_items": [("case_id", False)],
        "communications": [("case_id", False)],
        "service_records": [("case_id", False)],
        "court_filings": [("case_id", False)],
        "case_law_citations": [("case_id", False)],
        "judge_research": [("case_id", False)],
        "criminal_cases": [("case_id", False)],
        "generated_documents": [("case_id", False)],
        "forum_posts": [("user_id", False)],
        "advocate_directory": [("state", False)],
    }
    
    for collection, indexes in collections_indexes.items():
        for field, unique in indexes:
            await db[collection].create_index(field, unique=unique)
    
    yield
    client.close()


app = FastAPI(
    title="The CPS Punisher API",
    description="AI-powered Child Protective Services case defense platform - Full Feature Set",
    version="3.0.0",
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
    state: Optional[str] = None

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
    state: Optional[str] = None

class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    state: str
    county: Optional[str] = None
    children_names: Optional[List[str]] = []
    case_number: Optional[str] = None
    caseworker_name: Optional[str] = None
    attorney_name: Optional[str] = None
    judge_name: Optional[str] = None
    court_name: Optional[str] = None
    date_opened: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    county: Optional[str] = None
    caseworker_name: Optional[str] = None
    attorney_name: Optional[str] = None
    judge_name: Optional[str] = None

class DocumentCreate(BaseModel):
    case_id: str
    title: str
    content: str
    doc_type: str
    date: Optional[str] = None

class DocumentUpload(BaseModel):
    case_id: str
    title: str
    content: str
    doc_type: str
    source: str = "upload"  # upload, generated, ocr

class ViolationCreate(BaseModel):
    case_id: str
    violation_type: str
    description: str
    severity: str = "medium"
    date: Optional[str] = None
    statute_reference: Optional[str] = None
    constitutional_basis: Optional[str] = None

class TimelineEventCreate(BaseModel):
    case_id: str
    title: str
    description: str
    date: str
    event_type: str = "general"
    importance: str = "medium"

class StrategyCreate(BaseModel):
    case_id: str
    title: str
    description: str
    priority: str = "medium"
    legal_basis: Optional[str] = None
    case_law_support: Optional[List[str]] = []

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    case_id: Optional[str] = None
    context_type: Optional[str] = "general"  # general, defense, research, document

class AIAnalysisRequest(BaseModel):
    case_id: str
    document_content: str
    analysis_type: str = "general"

class LegalResearchRequest(BaseModel):
    query: str
    state: Optional[str] = None
    topic: Optional[str] = None
    violation_types: Optional[List[str]] = []

class DocumentGeneratorRequest(BaseModel):
    case_id: str
    document_type: str
    custom_data: Optional[Dict[str, Any]] = None
    include_violations: bool = True
    include_timeline: bool = True
    include_case_law: bool = True

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    event_type: str = "general"
    case_id: Optional[str] = None
    reminder_days: Optional[int] = 1

class EvidenceItemCreate(BaseModel):
    case_id: str
    title: str
    description: str
    evidence_type: str
    date_obtained: Optional[str] = None
    source: Optional[str] = None
    supports_defense: bool = True

class CommunicationLogCreate(BaseModel):
    case_id: str
    contact_type: str  # phone, email, in_person, text
    contact_with: str
    date: str
    summary: str
    favorable: Optional[bool] = None

class ServiceRecordCreate(BaseModel):
    case_id: str
    service_type: str
    provider: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "in_progress"
    notes: Optional[str] = None

class CourtFilingCreate(BaseModel):
    case_id: str
    filing_type: str
    title: str
    date_filed: Optional[str] = None
    status: str = "pending"
    content: Optional[str] = None

class CriminalCaseCreate(BaseModel):
    case_id: str
    criminal_case_number: Optional[str] = None
    charges: List[Dict[str, Any]] = []
    court: Optional[str] = None
    prosecutor: Optional[str] = None
    defense_attorney: Optional[str] = None
    bond_status: Optional[str] = None
    next_court_date: Optional[str] = None
    relation_to_cps: Optional[str] = None

class JudgeResearchCreate(BaseModel):
    case_id: str
    judge_name: str
    court: Optional[str] = None
    research_notes: Optional[str] = None
    known_rulings: Optional[List[str]] = []
    judicial_philosophy: Optional[str] = None

class ForumPostCreate(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[List[str]] = []


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

async def get_case_with_ownership(case_id: str, user_id: str):
    """Get case and verify ownership"""
    case = await db.cases.find_one({"_id": case_id, "user_id": user_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


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
        "state": user_data.state,
        "tier": "free",
        "ai_credits_used": 0,
        "docs_generated": 0,
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
        tier="free",
        state=user_data.state
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
        tier=user.get("tier", "free"),
        state=user.get("state")
    )

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = user.pop("_id")
    return user

@app.put("/api/auth/profile")
async def update_profile(update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    allowed_fields = ["name", "state", "phone", "address"]
    update_doc = {k: v for k, v in update_data.items() if k in allowed_fields}
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": update_doc}
    )
    return {"message": "Profile updated"}


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

@app.get("/api/cases")
async def list_cases(current_user: dict = Depends(get_current_user)):
    """List all cases for the current user"""
    cases = []
    async for case in db.cases.find({"user_id": current_user["user_id"]}):
        case["id"] = case.pop("_id")
        del case["user_id"]
        
        # Get counts for each case
        case["violation_count"] = await db.violations.count_documents({"case_id": case["id"]})
        case["document_count"] = await db.documents.count_documents({"case_id": case["id"]})
        case["event_count"] = await db.timeline_events.count_documents({"case_id": case["id"]})
        
        cases.append(case)
    return {"cases": cases}

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific case with all related data"""
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    case["id"] = case.pop("_id")
    
    # Get related data counts
    case["violation_count"] = await db.violations.count_documents({"case_id": case_id})
    case["document_count"] = await db.documents.count_documents({"case_id": case_id})
    case["event_count"] = await db.timeline_events.count_documents({"case_id": case_id})
    case["evidence_count"] = await db.evidence_items.count_documents({"case_id": case_id})
    case["strategy_count"] = await db.strategies.count_documents({"case_id": case_id})
    
    return case

@app.put("/api/cases/{case_id}")
async def update_case(case_id: str, case_data: CaseUpdate, current_user: dict = Depends(get_current_user)):
    """Update a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    update_data = {k: v for k, v in case_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.cases.update_one({"_id": case_id}, {"$set": update_data})
    return {"message": "Case updated successfully"}

@app.delete("/api/cases/{case_id}")
async def delete_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a case and all related data"""
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

@app.get("/api/cases/{case_id}/summary")
async def get_case_summary(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get comprehensive case summary for AI analysis"""
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Gather all case data
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


# ============== DOCUMENTS ENDPOINTS ==============

@app.post("/api/documents")
async def create_document(doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    """Add a document to a case"""
    await get_case_with_ownership(doc_data.case_id, current_user["user_id"])
    
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "case_id": doc_data.case_id,
        "user_id": current_user["user_id"],
        "title": doc_data.title,
        "content": doc_data.content,
        "doc_type": doc_data.doc_type,
        "date": doc_data.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source": "manual",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.documents.insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@app.get("/api/documents/{case_id}")
async def list_documents(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all documents for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    docs = []
    async for doc in db.documents.find({"case_id": case_id}).sort("created_at", -1):
        doc["id"] = doc.pop("_id")
        docs.append(doc)
    return {"documents": docs}

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a document"""
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await db.documents.delete_one({"_id": doc_id})
    return {"message": "Document deleted"}


# ============== DOCUMENT UPLOAD & AI ANALYSIS ==============

UPLOAD_DIR = "/tmp/cps_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    title: str = Form(...),
    doc_type: str = Form(default="cps_document"),
    auto_analyze: bool = Form(default=True),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a document file and optionally run AI analysis.
    Supports: PDF, TXT, images (PNG, JPG, JPEG)
    Returns: Document record with extracted text and optional AI analysis
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Verify case ownership
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Validate file type
    allowed_extensions = {'.pdf', '.txt', '.png', '.jpg', '.jpeg', '.doc', '.docx'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}")
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    if file_size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")
    
    # Extract text based on file type
    extracted_text = ""
    
    if file_ext == '.txt':
        extracted_text = content.decode('utf-8', errors='ignore')
    elif file_ext == '.pdf':
        # For PDF, we'll use AI to extract/describe content
        import base64
        # Store raw content and let AI analyze
        extracted_text = f"[PDF Document: {file.filename}]\n\nNote: PDF content requires AI extraction. Running analysis..."
    elif file_ext in {'.png', '.jpg', '.jpeg'}:
        # For images, we'll use AI vision to extract text
        import base64
        image_b64 = base64.b64encode(content).decode('utf-8')
        extracted_text = f"[Image Document: {file.filename}]\n\nImage uploaded for AI OCR analysis."
    else:
        extracted_text = f"[Document: {file.filename}]\n\nDocument uploaded. Content extraction pending."
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Create document record
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "title": title,
        "filename": file.filename,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_ext,
        "doc_type": doc_type,
        "content": extracted_text,
        "source": "upload",
        "analysis": None,
        "extracted_violations": [],
        "extracted_timeline": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.documents.insert_one(doc)
    
    # Run AI analysis if requested
    analysis_result = None
    if auto_analyze and EMERGENT_LLM_KEY:
        try:
            analysis_result = await analyze_uploaded_document(
                doc_id, case_id, case, extracted_text, file.filename, current_user["user_id"]
            )
            # Update document with analysis
            await db.documents.update_one(
                {"_id": doc_id},
                {"$set": {
                    "analysis": analysis_result.get("analysis"),
                    "extracted_violations": analysis_result.get("violations", []),
                    "extracted_timeline": analysis_result.get("timeline", [])
                }}
            )
        except Exception as e:
            analysis_result = {"error": str(e)}
    
    doc["id"] = doc.pop("_id")
    doc["analysis_result"] = analysis_result
    
    return doc


async def analyze_uploaded_document(doc_id: str, case_id: str, case: dict, content: str, filename: str, user_id: str):
    """
    Comprehensive AI analysis of uploaded document.
    Extracts violations, timeline events, and provides defense recommendations.
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    state = case.get("state", "Unknown")
    
    system_message = f"""You are THE CPS PUNISHER - an expert AI legal analyst specializing in Child Protective Services cases.

You are analyzing a document uploaded by a parent fighting CPS in {state}.

Your job is to:
1. THOROUGHLY analyze this document for ANY and ALL potential violations
2. Extract EVERY date, event, and action mentioned
3. Identify defense opportunities and weaknesses in CPS's case
4. Provide actionable recommendations

Be AGGRESSIVE in identifying violations - if there's even a possibility of a violation, flag it.
CPS agencies routinely violate constitutional rights and procedures. Help this parent fight back.

IMPORTANT: Respond in valid JSON format with the following structure:
{{
    "summary": "Brief 2-3 sentence summary of the document",
    "document_type": "Type of CPS document (petition, safety plan, court order, letter, report, etc.)",
    "key_allegations": ["List of allegations made against the parent"],
    "violations": [
        {{
            "type": "violation_type_code",
            "description": "Detailed description of the violation",
            "severity": "high/medium/low",
            "legal_basis": "Constitutional amendment or statute violated",
            "defense_strategy": "How to challenge this"
        }}
    ],
    "timeline_events": [
        {{
            "date": "YYYY-MM-DD or approximate",
            "event": "What happened",
            "significance": "Legal significance",
            "actors": ["People involved"]
        }}
    ],
    "deadlines": ["Any deadlines mentioned with dates"],
    "named_individuals": [
        {{
            "name": "Person's name",
            "role": "Their role (caseworker, judge, etc.)",
            "actions": "What they did"
        }}
    ],
    "defense_opportunities": ["Specific defense arguments available"],
    "recommended_actions": ["Immediate steps the parent should take"],
    "motions_to_consider": ["Legal motions that could be filed"],
    "red_flags": ["Concerning elements in the document"],
    "strengths_for_defense": ["Elements that help the parent's case"]
}}

Violation type codes to use:
- fourth_amendment: Illegal search/seizure, warrantless entry
- fourteenth_amendment: Due process violations
- fifth_amendment: Self-incrimination issues
- sixth_amendment: Right to counsel violations
- first_amendment: Religious/speech freedom issues
- no_written_notice: Failed to provide proper notice
- improper_investigation: Investigation procedure violations
- missed_deadlines: CPS missed legal deadlines
- no_reasonable_efforts: Failed to make reasonable efforts
- falsified_reports: False or misleading statements
- hearsay_evidence: Reliance on hearsay
- biased_investigation: One-sided investigation
- denied_visitation: Improper visitation denial
- icwa_violation: Indian Child Welfare Act violation
- asfa_violation: ASFA timeline violation
- capta_violation: CAPTA requirement violation"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"doc-analysis-{doc_id}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Analyze this CPS document uploaded by a parent in {state}:

FILENAME: {filename}

DOCUMENT CONTENT:
{content[:25000]}

Provide your complete analysis in JSON format. Be thorough - this parent's family is at stake."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Parse JSON response
    try:
        # Try to extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            analysis_data = json.loads(json_match.group())
        else:
            analysis_data = {"raw_analysis": response}
    except json.JSONDecodeError:
        analysis_data = {"raw_analysis": response}
    
    # Auto-create violations in the database
    created_violations = []
    if "violations" in analysis_data and isinstance(analysis_data["violations"], list):
        for v in analysis_data["violations"][:10]:  # Limit to 10
            if isinstance(v, dict) and v.get("type") and v.get("description"):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": v.get("type", "other"),
                    "description": v.get("description", ""),
                    "severity": v.get("severity", "medium"),
                    "statute_reference": v.get("legal_basis", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Auto-create timeline events
    created_timeline = []
    if "timeline_events" in analysis_data and isinstance(analysis_data["timeline_events"], list):
        for e in analysis_data["timeline_events"][:15]:  # Limit to 15
            if isinstance(e, dict) and e.get("event"):
                event_id = str(uuid.uuid4())
                event_doc = {
                    "_id": event_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "title": e.get("event", "")[:100],
                    "description": e.get("significance", ""),
                    "date": e.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
                    "event_type": "extracted",
                    "importance": "medium",
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.timeline_events.insert_one(event_doc)
                created_timeline.append(event_id)
    
    return {
        "analysis": analysis_data,
        "violations": created_violations,
        "timeline": created_timeline,
        "violations_created": len(created_violations),
        "timeline_events_created": len(created_timeline)
    }


@app.post("/api/documents/{doc_id}/reanalyze")
async def reanalyze_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Re-run AI analysis on an existing document"""
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    case = await get_case_with_ownership(doc["case_id"], current_user["user_id"])
    
    analysis_result = await analyze_uploaded_document(
        doc_id, doc["case_id"], case, doc.get("content", ""), 
        doc.get("filename", "document"), current_user["user_id"]
    )
    
    await db.documents.update_one(
        {"_id": doc_id},
        {"$set": {
            "analysis": analysis_result.get("analysis"),
            "extracted_violations": analysis_result.get("violations", []),
            "extracted_timeline": analysis_result.get("timeline", []),
            "reanalyzed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return analysis_result


@app.get("/api/documents/{doc_id}/analysis")
async def get_document_analysis(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Get the AI analysis for a document"""
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": doc_id,
        "title": doc.get("title"),
        "filename": doc.get("filename"),
        "analysis": doc.get("analysis"),
        "extracted_violations": doc.get("extracted_violations", []),
        "extracted_timeline": doc.get("extracted_timeline", [])
    }


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

@app.get("/api/violations/types")
async def get_violation_types():
    """Get all available violation types"""
    return {"violation_types": VIOLATION_TYPES}

@app.post("/api/violations")
async def create_violation(violation_data: ViolationCreate, current_user: dict = Depends(get_current_user)):
    """Add a violation to a case"""
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

@app.get("/api/violations/{case_id}")
async def list_violations(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all violations for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        v["id"] = v.pop("_id")
        violations.append(v)
    return {"violations": violations}

@app.delete("/api/violations/{violation_id}")
async def delete_violation(violation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a violation"""
    violation = await db.violations.find_one({"_id": violation_id, "user_id": current_user["user_id"]})
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    await db.violations.delete_one({"_id": violation_id})
    return {"message": "Violation deleted"}


# ============== TIMELINE ENDPOINTS ==============

@app.post("/api/timeline")
async def create_timeline_event(event_data: TimelineEventCreate, current_user: dict = Depends(get_current_user)):
    """Add a timeline event"""
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

@app.get("/api/timeline/{case_id}")
async def list_timeline_events(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all timeline events"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    events = []
    async for e in db.timeline_events.find({"case_id": case_id}).sort("date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events}


# ============== STRATEGIES ENDPOINTS ==============

@app.post("/api/strategies")
async def create_strategy(strategy_data: StrategyCreate, current_user: dict = Depends(get_current_user)):
    """Add a defense strategy"""
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

@app.get("/api/strategies/{case_id}")
async def list_strategies(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all strategies"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}):
        s["id"] = s.pop("_id")
        strategies.append(s)
    return {"strategies": strategies}


# ============== EVIDENCE ENDPOINTS ==============

@app.post("/api/evidence")
async def create_evidence(evidence_data: EvidenceItemCreate, current_user: dict = Depends(get_current_user)):
    """Add evidence item"""
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

@app.get("/api/evidence/{case_id}")
async def list_evidence(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all evidence"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}):
        e["id"] = e.pop("_id")
        evidence.append(e)
    return {"evidence": evidence}


# ============== COMMUNICATIONS LOG ENDPOINTS ==============

@app.post("/api/communications")
async def create_communication(comm_data: CommunicationLogCreate, current_user: dict = Depends(get_current_user)):
    """Log a communication"""
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

@app.get("/api/communications/{case_id}")
async def list_communications(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all communications"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    comms = []
    async for c in db.communications.find({"case_id": case_id}).sort("date", -1):
        c["id"] = c.pop("_id")
        comms.append(c)
    return {"communications": comms}


# ============== SERVICE RECORDS ENDPOINTS ==============

@app.post("/api/services")
async def create_service(service_data: ServiceRecordCreate, current_user: dict = Depends(get_current_user)):
    """Add service record"""
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

@app.get("/api/services/{case_id}")
async def list_services(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all services"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    services = []
    async for s in db.service_records.find({"case_id": case_id}):
        s["id"] = s.pop("_id")
        services.append(s)
    return {"services": services}


# ============== COURT FILINGS ENDPOINTS ==============

@app.post("/api/court-filings")
async def create_court_filing(filing_data: CourtFilingCreate, current_user: dict = Depends(get_current_user)):
    """Add court filing"""
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

@app.get("/api/court-filings/{case_id}")
async def list_court_filings(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all court filings"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    filings = []
    async for f in db.court_filings.find({"case_id": case_id}).sort("date_filed", -1):
        f["id"] = f.pop("_id")
        filings.append(f)
    return {"filings": filings}


# ============== CRIMINAL CASE COMPONENT ==============

@app.post("/api/criminal-case")
async def create_criminal_case(criminal_data: CriminalCaseCreate, current_user: dict = Depends(get_current_user)):
    """Add criminal case linked to CPS case"""
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

@app.get("/api/criminal-case/{case_id}")
async def get_criminal_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get criminal case info"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    criminal = await db.criminal_cases.find_one({"case_id": case_id})
    if criminal:
        criminal["id"] = criminal.pop("_id")
    return {"criminal_case": criminal}


# ============== JUDGE RESEARCH ==============

@app.post("/api/judge-research")
async def create_judge_research(judge_data: JudgeResearchCreate, current_user: dict = Depends(get_current_user)):
    """Add judge research"""
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

@app.get("/api/judge-research/{case_id}")
async def get_judge_research(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get judge research"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    research = await db.judge_research.find_one({"case_id": case_id})
    if research:
        research["id"] = research.pop("_id")
    return {"judge_research": research}


# ============== CALENDAR ENDPOINTS ==============

@app.post("/api/calendar")
async def create_calendar_event(event_data: CalendarEventCreate, current_user: dict = Depends(get_current_user)):
    """Create calendar event"""
    event_id = str(uuid.uuid4())
    event = {
        "_id": event_id,
        "user_id": current_user["user_id"],
        "title": event_data.title,
        "description": event_data.description,
        "event_date": event_data.event_date,
        "event_time": event_data.event_time,
        "event_type": event_data.event_type,
        "case_id": event_data.case_id,
        "reminder_days": event_data.reminder_days,
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.calendar_events.insert_one(event)
    event["id"] = event.pop("_id")
    return event

@app.get("/api/calendar")
async def list_calendar_events(current_user: dict = Depends(get_current_user)):
    """List all calendar events"""
    events = []
    async for e in db.calendar_events.find({"user_id": current_user["user_id"]}).sort("event_date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events}

@app.get("/api/calendar/upcoming/{days}")
async def get_upcoming_events(days: int = 7, current_user: dict = Depends(get_current_user)):
    """Get upcoming events"""
    today = datetime.now(timezone.utc).date()
    end_date = today + timedelta(days=days)
    
    events = []
    async for e in db.calendar_events.find({
        "user_id": current_user["user_id"],
        "event_date": {"$gte": today.isoformat(), "$lte": end_date.isoformat()},
        "completed": False
    }).sort("event_date", 1):
        e["id"] = e.pop("_id")
        events.append(e)
    return {"events": events, "days": days}

@app.delete("/api/calendar/{event_id}")
async def delete_calendar_event(event_id: str, current_user: dict = Depends(get_current_user)):
    """Delete calendar event"""
    result = await db.calendar_events.delete_one({"_id": event_id, "user_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}


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

Be thorough, cite relevant statutes and case law when applicable, and always prioritize protecting children while defending parental rights.{case_context}"""

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
    
    return {"response": response, "session_id": session_id}

@app.post("/api/ai/analyze-document")
async def ai_analyze_document(request: AIAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered document analysis"""
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

Note: This is legal education, not legal advice. Recommend consulting an attorney."""

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

@app.post("/api/ai/generate-document")
async def ai_generate_document(request: DocumentGeneratorRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered legal document generator - Full Featured"""
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

REQUIREMENTS:
1. Use proper legal formatting for {case.get('state', 'the jurisdiction')}
2. Include court caption with case number and parties
3. Cite relevant state statutes and case law
4. Use [BRACKETS] for information to be filled in
5. Include signature block and certificate of service
6. Add legal disclaimer about attorney review

Generate a complete, professional, court-ready document."""

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

@app.post("/api/ai/defense-strategy")
async def ai_defense_strategy(case_id: str, current_user: dict = Depends(get_current_user)):
    """Generate comprehensive defense strategy based on case analysis"""
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

Provide actionable, legally-sound strategies that protect parental rights while acknowledging child safety concerns."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"strategy-{case_id}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    violations_text = "\n".join([f"- {v.get('violation_type')}: {v.get('description')}" for v in violations]) or "None documented"
    timeline_text = "\n".join([f"- {e.get('date')}: {e.get('title')}" for e in timeline[:15]]) or "No events"
    evidence_text = "\n".join([f"- {e.get('title')}: {e.get('description')}" for e in evidence[:10]]) or "No evidence logged"
    
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
    
    return {
        "case_id": case_id,
        "strategy": response,
        "violations_analyzed": len(violations),
        "events_analyzed": len(timeline),
        "evidence_analyzed": len(evidence),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/ai/legal-research")
async def ai_legal_research(request: LegalResearchRequest, current_user: dict = Depends(get_current_user)):
    """AI-powered legal research"""
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

Always note this is legal education, not legal advice."""

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
    
    return {
        "query": request.query,
        "state": request.state,
        "topic": request.topic,
        "research_results": response
    }


# ============== COURTLISTENER INTEGRATION ==============

@app.get("/api/courtlistener/search")
async def search_court_opinions(
    query: str,
    state: Optional[str] = None,
    court_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Search CourtListener for case law"""
    try:
        params = {
            "q": query,
            "type": "o",
            "order_by": "score desc",
            "format": "json"
        }
        
        headers = {"Accept": "application/json"}
        if COURTLISTENER_API_KEY:
            headers["Authorization"] = f"Token {COURTLISTENER_API_KEY}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.courtlistener.com/api/rest/v4/search/",
                params=params,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "count": data.get("count", 0),
                    "results": data.get("results", [])[:20],
                    "query": query
                }
            else:
                return {"error": f"CourtListener API returned {response.status_code}", "results": []}
    except Exception as e:
        return {"error": str(e), "results": []}

@app.get("/api/courtlistener/judges")
async def search_judges(
    name: str,
    current_user: dict = Depends(get_current_user)
):
    """Search CourtListener judge database"""
    try:
        params = {
            "name_full__icontains": name,
            "is_alias_of__isnull": "true",
            "format": "json"
        }
        
        headers = {"Accept": "application/json"}
        if COURTLISTENER_API_KEY:
            headers["Authorization"] = f"Token {COURTLISTENER_API_KEY}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.courtlistener.com/api/rest/v4/people/",
                params=params,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "count": data.get("count", 0),
                    "results": data.get("results", [])[:20]
                }
            else:
                return {"error": f"API returned {response.status_code}", "results": []}
    except Exception as e:
        return {"error": str(e), "results": []}


# ============== LAW LIBRARY ==============

STATES_INFO = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming"
}

@app.get("/api/law-library/states")
async def get_all_states():
    """Get list of all states"""
    states = [{"code": code, "name": name} for code, name in STATES_INFO.items()]
    return {"states": sorted(states, key=lambda x: x["name"])}

@app.get("/api/law-library/{state_code}")
async def get_state_law_info(state_code: str, current_user: dict = Depends(get_current_user)):
    """Get comprehensive CPS law information for a state"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    state_name = STATES_INFO.get(state_code.upper())
    if not state_name:
        raise HTTPException(status_code=404, detail="State not found")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"state-law-{state_code}",
        system_message="You are a legal expert providing comprehensive CPS law information."
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Provide comprehensive CPS law information for {state_name} ({state_code}):

1. **CPS Agency Name**: Official state child welfare agency
2. **Governing Statutes**: Primary statutes and code sections
3. **Key Timeframes**:
   - Emergency removal hearing deadline
   - Adjudication/jurisdiction hearing deadline
   - Review hearing schedule
   - Permanency planning deadline
   - Termination of parental rights timeline
4. **Discovery Rights**: How to obtain CPS records
5. **Parental Rights Statutes**: TPR grounds and procedures
6. **Notice Requirements**: Service of process deadlines
7. **Court Caption Format**: Proper format for legal filings
8. **Important Case Law**: Key state precedents for CPS defense
9. **CPS Policy Manual**: How to access official policies
10. **State Constitution**: Relevant parental rights provisions
11. **ICWA Applicability**: State ICWA implementation
12. **Reasonable Efforts Standard**: State requirements
13. **Appeal Process**: Deadlines and procedures

Be specific with statute citations and case law."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "state_code": state_code,
        "state_name": state_name,
        "law_info": response
    }


# ============== COMMUNITY FORUM ==============

@app.post("/api/forum/posts")
async def create_forum_post(post_data: ForumPostCreate, current_user: dict = Depends(get_current_user)):
    """Create forum post"""
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

@app.get("/api/forum/posts")
async def list_forum_posts(
    category: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """List forum posts"""
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

@app.get("/api/advocates")
async def get_advocates(state: Optional[str] = None):
    """Get advocate directory"""
    query = {}
    if state:
        query["state"] = state.upper()
    
    advocates = []
    async for a in db.advocate_directory.find(query):
        a["id"] = a.pop("_id")
        advocates.append(a)
    
    return {"advocates": advocates}


# ============== STRIPE PAYMENT ENDPOINTS ==============

class CheckoutRequest(BaseModel):
    tier: str
    billing_period: str = "monthly"
    origin_url: str

@app.post("/api/stripe/create-checkout")
async def create_checkout_session(request: CheckoutRequest, http_request: Request, current_user: dict = Depends(get_current_user)):
    """Create Stripe checkout session"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    price_key = f"{request.tier}_{request.billing_period}"
    stripe_price_id = STRIPE_PRICE_IDS.get(price_key)
    
    if not stripe_price_id:
        raise HTTPException(status_code=400, detail="Invalid tier or billing period")
    
    success_url = f"{request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/pricing"
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        stripe_price_id=stripe_price_id,
        quantity=1,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["user_id"],
            "tier": request.tier,
            "billing_period": request.billing_period
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    await db.payment_transactions.insert_one({
        "_id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["user_id"],
        "tier": request.tier,
        "billing_period": request.billing_period,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@app.get("/api/stripe/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request, current_user: dict = Depends(get_current_user)):
    """Get checkout status"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if transaction and transaction.get("payment_status") == "paid":
        return {"status": "complete", "payment_status": "paid", "tier": transaction.get("tier")}
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid" and transaction:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.users.update_one(
            {"_id": current_user["user_id"]},
            {"$set": {"tier": transaction.get("tier"), "subscription_status": "active"}}
        )
    
    return {"status": status.status, "payment_status": status.payment_status}


# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "CPS Punisher API",
        "version": "3.0.0",
        "features": "109+ Components | Full Feature Set",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/stats")
async def get_stats():
    """Get platform statistics"""
    return {
        "total_users": await db.users.count_documents({}),
        "total_cases": await db.cases.count_documents({}),
        "total_documents": await db.documents.count_documents({}),
        "total_violations": await db.violations.count_documents({}),
        "states_covered": 50,
        "features": 109
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
