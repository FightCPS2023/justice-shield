"""
THE CPS PUNISHER - Complete Backend API Server
Child Protective Services Case Defense Platform
AI-powered legal document analysis, defense strategy generation, court research
150+ Features | 50 States Coverage | CourtListener Integration | Full Legal Knowledge Base

VERSION 4.0 - UNTOUCHABLE LEGAL AI
Now with comprehensive legal knowledge base, Black's Law definitions,
Supreme Court and Circuit Court precedents, and Rooker-Feldman avoidance.
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

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Query, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import jwt, JWTError

# Import comprehensive legal knowledge base
from legal_knowledge import (
    SUPREME_COURT_CASES, CIRCUIT_COURT_CASES, ROOKER_FELDMAN,
    BLACKS_LAW_DEFINITIONS, CONSTITUTIONAL_RIGHTS, VIOLATION_ANALYSIS,
    SECTION_1983, FEDERAL_STATUTES, get_relevant_case_law, analyze_qualified_immunity
)

load_dotenv()

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cps_punisher")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")
COURTLISTENER_API_KEY = os.environ.get("COURTLISTENER_API_KEY", "")
FULL_ACCESS_PASSCODE = os.environ.get("FULL_ACCESS_PASSCODE", "PUNISHER2024")

# Stripe pricing tiers - Using amount-based checkout (more flexible)
TIER_PRICING = {
    "essential": {"monthly": 49.00, "annual": 490.00, "name": "Essential"},
    "professional": {"monthly": 99.00, "annual": 990.00, "name": "Professional"},
    "attorney": {"monthly": 299.00, "annual": 2990.00, "name": "Attorney Suite"},
    "enterprise": {"monthly": 999.00, "annual": 9990.00, "name": "Enterprise"},
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
        "notepad_entries": [("user_id", False), ("case_id", False)],
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

# Legal Notepad Models
class NotepadEntryCreate(BaseModel):
    case_id: Optional[str] = None  # None for global notes
    title: str
    content: str
    category: str = "general"  # general, statute, case_law, strategy, timeline
    state: Optional[str] = None
    source_type: Optional[str] = None  # law_library, courtlistener, manual
    source_reference: Optional[str] = None
    tags: Optional[List[str]] = []

class NotepadEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None


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


# ============== HEALTH & API INFO ENDPOINTS ==============

@app.get("/api")
@app.post("/api")
async def api_root():
    """Root API endpoint for health probes"""
    return {
        "service": "CPS Punisher API",
        "status": "operational",
        "version": "4.0.0",
        "docs": "/docs"
    }

@app.get("/api/user/")
async def api_user_root():
    """User API root for health probes"""
    return {"status": "ok", "endpoint": "user"}

@app.get("/api-docs/swagger.json")
async def swagger_json_docs():
    """Return OpenAPI schema for api-docs"""
    return app.openapi()

@app.get("/api/swagger.json")
async def api_swagger_json():
    """Return OpenAPI schema"""
    return app.openapi()

# GraphQL probe endpoints (return info that this is a REST API)
@app.post("/api/graphql")
@app.post("/api/gql")
async def graphql_not_supported():
    """Return info that this is a REST API, not GraphQL"""
    return {
        "error": "GraphQL not supported",
        "message": "This is a REST API. See /docs for available endpoints.",
        "docs": "/docs"
    }


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


# ============== FULL ACCESS PASSCODE ==============

class PasscodeRequest(BaseModel):
    passcode: str

@app.post("/api/auth/redeem-passcode")
async def redeem_passcode(request: PasscodeRequest, current_user: dict = Depends(get_current_user)):
    """
    Redeem a passcode for full enterprise access to all features.
    This grants the user enterprise tier permanently.
    """
    if request.passcode != FULL_ACCESS_PASSCODE:
        raise HTTPException(status_code=400, detail="Invalid passcode")
    
    # Upgrade user to enterprise tier
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {
            "tier": "enterprise",
            "tier_source": "passcode",
            "passcode_redeemed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log the redemption
    await db.passcode_redemptions.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "email": current_user.get("email"),
        "passcode_used": "***REDACTED***",
        "tier_granted": "enterprise",
        "redeemed_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": "Full access granted! You now have Enterprise tier access to all features.",
        "new_tier": "enterprise"
    }


# ============== GOOGLE OAUTH ENDPOINTS ==============

@app.post("/api/auth/google/session")
async def process_google_session(request: Request):
    """
    Process Google OAuth session_id from Emergent Auth
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Exchange session_id for user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    
    email = auth_data.get("email")
    name = auth_data.get("name", "User")
    picture = auth_data.get("picture", "")
    session_token = auth_data.get("session_token")
    
    if not email or not session_token:
        raise HTTPException(status_code=400, detail="Invalid auth response")
    
    # Check if user exists, if not create
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        user_id = existing_user["_id"]
        # Update user info if needed
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "name": name,
                "picture": picture,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new user
        user_id = str(uuid.uuid4())
        await db.users.insert_one({
            "_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "tier": "free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {"$set": {
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    # Create JWT token for the user (compatible with existing auth)
    access_token = create_access_token({"user_id": user_id, "email": email})
    
    # Create response with cookie
    response_data = {
        "access_token": access_token,
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "tier": "free"
    }
    
    from fastapi.responses import JSONResponse
    response = JSONResponse(content=response_data)
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7*24*60*60,  # 7 days
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )
    
    return response


@app.post("/api/auth/google/logout")
async def google_logout(request: Request):
    """Logout and clear Google OAuth session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    from fastapi.responses import JSONResponse
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response


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
        # Extract text from PDF using pypdf
        try:
            from pypdf import PdfReader
            import io
            
            pdf_reader = PdfReader(io.BytesIO(content))
            pdf_text_parts = []
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    pdf_text_parts.append(f"--- Page {page_num} ---\n{page_text}")
            
            if pdf_text_parts:
                extracted_text = f"[PDF Document: {file.filename}]\n\n" + "\n\n".join(pdf_text_parts)
            else:
                # PDF might be scanned/image-based
                extracted_text = f"[PDF Document: {file.filename}]\n\nNote: This PDF appears to be image-based or has no extractable text. AI analysis will attempt to process it."
        except Exception as e:
            extracted_text = f"[PDF Document: {file.filename}]\n\nPDF text extraction failed: {str(e)}. AI analysis will attempt to process it."
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


@app.post("/api/ai/chat/stream")
async def ai_chat_stream(message_data: ChatMessage, current_user: dict = Depends(get_current_user)):
    """AI-powered legal chat assistant with streaming response (SSE)"""
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

IMPORTANT: You provide legal EDUCATION, not legal advice. Always recommend consulting a licensed attorney.{case_context}"""

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
    q: str = Query(..., description="Search query"),
    court: Optional[str] = None,
    filed_after: Optional[str] = None,
    filed_before: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Search CourtListener for case law"""
    try:
        params = {
            "q": q,
            "type": "o",
            "order_by": "score desc",
            "format": "json"
        }
        
        if court:
            params["court"] = court
        if filed_after:
            params["filed_after"] = filed_after
        if filed_before:
            params["filed_before"] = filed_before
        
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
                # Format results for frontend
                formatted_results = []
                for r in data.get("results", [])[:20]:
                    # Handle citation - it can be a list of strings
                    citation = r.get("citation", [])
                    if isinstance(citation, list) and len(citation) > 0:
                        citation_str = citation[0] if isinstance(citation[0], str) else str(citation[0])
                    else:
                        citation_str = str(citation) if citation else ""
                    
                    formatted_results.append({
                        "caseName": r.get("caseName", "Unknown Case"),
                        "citation": citation_str,
                        "court": r.get("court", r.get("court_id", "Unknown Court")),
                        "court_id": r.get("court_id", ""),
                        "dateFiled": r.get("dateFiled", "Unknown"),
                        "docketNumber": r.get("docketNumber", ""),
                        "snippet": r.get("syllabus", "") or r.get("posture", "") or f"Case: {r.get('caseName', '')}",
                        "absolute_url": f"https://www.courtlistener.com{r.get('absolute_url', '')}",
                        "judge": r.get("judge", ""),
                        "citeCount": r.get("citeCount", 0)
                    })
                return {
                    "count": data.get("count", 0),
                    "results": formatted_results,
                    "query": q
                }
            else:
                return {"error": f"CourtListener API returned {response.status_code}", "results": [], "count": 0}
    except Exception as e:
        return {"error": str(e), "results": [], "count": 0}

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

# Comprehensive pre-built state CPS law database - INSTANT LOADING
STATE_CPS_DATABASE = {
    "TX": {
        "agency": "Texas Department of Family and Protective Services (DFPS)",
        "statutes": "Texas Family Code, Chapters 261-266",
        "timeframes": {
            "Emergency Removal Hearing": "14 days (adversary hearing)",
            "Status Hearing": "60 days from temporary order",
            "Permanency Hearing": "12 months from removal",
            "Dismissal Deadline": "12 months (18 with extension)"
        },
        "key_statutes": [
            "§261.001 - Definitions of abuse and neglect",
            "§262.101 - Filing suit without prior investigation",
            "§262.102 - Emergency removal without court order",
            "§262.201 - Full adversary hearing requirements",
            "§263.401 - Dismissal date and extensions",
            "§161.001 - Grounds for TPR"
        ],
        "discovery": "Texas Rules of Civil Procedure; DFPS must produce case file within 30 days of motion",
        "key_cases": ["In re E.R., 385 S.W.3d 552 (Tex. 2012)", "In re J.F.C., 96 S.W.3d 256 (Tex. 2002)"],
        "constitution": "Texas Constitution Art. I, §19 - Due process"
    },
    "CA": {
        "agency": "California Department of Social Services (CDSS)",
        "statutes": "Welfare & Institutions Code §300-395",
        "timeframes": {
            "Detention Hearing": "48 hours (court days)",
            "Jurisdiction Hearing": "15 court days from detention",
            "Disposition Hearing": "10 court days from jurisdiction",
            "Review Hearing": "Every 6 months",
            "Permanency Hearing": "12 months from removal"
        },
        "key_statutes": [
            "WIC §300 - Definitions of dependent child",
            "WIC §306 - Emergency removal authority",
            "WIC §319 - Detention hearing procedures",
            "WIC §361 - Removal (clear and convincing)",
            "WIC §366.26 - TPR procedures"
        ],
        "discovery": "WIC §827; petition juvenile court for case access",
        "key_cases": ["In re Jasmon O. (1994) 8 Cal.4th 398", "In re Malinda S. (1990) 51 Cal.3d 368"],
        "constitution": "California Constitution Art. I, §7 - Due process"
    },
    "NY": {
        "agency": "Office of Children and Family Services (OCFS)",
        "statutes": "Family Court Act Article 10",
        "timeframes": {
            "Initial Hearing": "24 hours of removal",
            "Fact-Finding": "60 days from filing",
            "Disposition": "50 days from fact-finding",
            "Permanency Hearing": "12 months maximum"
        },
        "key_statutes": [
            "FCA §1012 - Definitions",
            "FCA §1024 - Emergency removal",
            "FCA §1028 - Return of child hearing",
            "FCA §1046 - Evidence rules",
            "FCA §1052 - Dispositional alternatives"
        ],
        "discovery": "FCA §1038; records available to respondent",
        "key_cases": ["Nicholson v. Scoppetta (2004)", "In re Marino S. (1993)"],
        "constitution": "NY Constitution Art. I, §6 - Due process"
    },
    "FL": {
        "agency": "Department of Children and Families (DCF)",
        "statutes": "Florida Statutes Chapter 39",
        "timeframes": {
            "Shelter Hearing": "24 hours",
            "Arraignment": "28 days",
            "Adjudication": "30 days of arraignment",
            "Disposition": "15 days of adjudication",
            "Judicial Review": "Every 6 months"
        },
        "key_statutes": [
            "§39.01 - Definitions",
            "§39.401 - Taking child into custody",
            "§39.402 - Shelter placement",
            "§39.521 - Disposition hearing",
            "§39.806 - TPR grounds"
        ],
        "discovery": "Florida Rules of Juvenile Procedure 8.245",
        "key_cases": ["Padgett v. Dept. of HRS (1991)", "In re D.A.D. (2006)"],
        "constitution": "Florida Constitution Art. I, §9 - Due process"
    },
    "IL": {
        "agency": "Department of Children and Family Services (DCFS)",
        "statutes": "705 ILCS 405 (Juvenile Court Act)",
        "timeframes": {
            "Temporary Custody Hearing": "48 hours",
            "Adjudicatory Hearing": "90 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "705 ILCS 405/2-3 - Neglected/abused minor",
            "705 ILCS 405/2-10 - Temporary custody",
            "705 ILCS 405/2-21 - Adjudicatory hearing",
            "705 ILCS 405/2-28 - TPR"
        ],
        "discovery": "Illinois Supreme Court Rule 411",
        "key_cases": ["In re D.T. (2008)", "In re M.M. (2016)"],
        "constitution": "Illinois Constitution Art. I, §2 - Due process"
    },
    "PA": {
        "agency": "Department of Human Services",
        "statutes": "42 Pa.C.S. Chapter 63 (Juvenile Act)",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Adjudicatory Hearing": "10 days (child in care)",
            "Dispositional Hearing": "20 days",
            "Permanency Hearing": "6 months"
        },
        "key_statutes": [
            "23 Pa.C.S. §6303 - Definitions",
            "42 Pa.C.S. §6324 - Taking into custody",
            "42 Pa.C.S. §6341 - Adjudicatory hearing"
        ],
        "discovery": "Pa.R.J.C.P. 340",
        "key_cases": ["In re L.M. (2011)", "In re Adoption of R.B.F. (2002)"],
        "constitution": "Pennsylvania Constitution Art. I, §9 - Due process"
    },
    "OH": {
        "agency": "Ohio Department of Job and Family Services",
        "statutes": "Ohio Revised Code Chapter 2151",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Adjudicatory Hearing": "30 days (90 if continued)",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 12 months"
        },
        "key_statutes": [
            "ORC §2151.03 - Neglected child",
            "ORC §2151.031 - Abused child",
            "ORC §2151.414 - TPR"
        ],
        "discovery": "Ohio Juv. R. 24",
        "key_cases": ["In re C.F. (2007)", "In re Adoption of Masa (2001)"],
        "constitution": "Ohio Constitution Art. I, §16 - Due process"
    },
    "GA": {
        "agency": "Division of Family and Children Services (DFCS)",
        "statutes": "O.C.G.A. Title 15, Chapter 11",
        "timeframes": {
            "Preliminary Protective Hearing": "72 hours",
            "Adjudicatory Hearing": "10 days",
            "Dispositional Hearing": "30 days",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "O.C.G.A. §15-11-2 - Definitions",
            "O.C.G.A. §15-11-133 - Emergency custody",
            "O.C.G.A. §15-11-310 - TPR"
        ],
        "discovery": "O.C.G.A. §15-11-170",
        "key_cases": ["In re R.M. (2009)", "In re M.K.S. (2011)"],
        "constitution": "Georgia Constitution Art. I, §1, ¶1 - Due process"
    },
    "NC": {
        "agency": "Division of Social Services",
        "statutes": "N.C.G.S. Chapter 7B",
        "timeframes": {
            "Nonsecure Custody Hearing": "7 days",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "90 days, then every 6 months"
        },
        "key_statutes": [
            "N.C.G.S. §7B-101 - Definitions",
            "N.C.G.S. §7B-500 - Taking into custody",
            "N.C.G.S. §7B-1111 - TPR grounds"
        ],
        "discovery": "N.C.G.S. §7B-700",
        "key_cases": ["In re J.N. (2010)", "In re Montgomery (2009)"],
        "constitution": "North Carolina Constitution Art. I, §19 - Due process"
    },
    "MI": {
        "agency": "Michigan Department of Health and Human Services",
        "statutes": "MCL Chapter 712A (Probate Code)",
        "timeframes": {
            "Preliminary Hearing": "24 hours",
            "Adjudication": "63 days (child in care)",
            "Disposition": "28 days after adjudication",
            "Review Hearing": "Every 91 days"
        },
        "key_statutes": [
            "MCL §712A.2 - Jurisdiction",
            "MCL §712A.13a - Preliminary hearing",
            "MCL §712A.19b - TPR"
        ],
        "discovery": "MCR 3.922",
        "key_cases": ["In re Sanders (2007)", "In re Rood (2009)"],
        "constitution": "Michigan Constitution Art. I, §17 - Due process"
    },
    "AZ": {
        "agency": "Arizona Department of Child Safety (DCS)",
        "statutes": "Arizona Revised Statutes Title 8",
        "timeframes": {
            "Preliminary Protective Hearing": "5-7 days",
            "Dependency Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "A.R.S. §8-201 - Definitions",
            "A.R.S. §8-821 - Taking child into custody",
            "A.R.S. §8-533 - TPR grounds"
        ],
        "discovery": "Arizona Rules of Procedure for Juvenile Court",
        "key_cases": ["Michael J. v. Arizona DES (2006)", "In re Maricopa County (2004)"],
        "constitution": "Arizona Constitution Art. 2, §4 - Due process"
    },
    "CO": {
        "agency": "Colorado Department of Human Services",
        "statutes": "Colorado Children's Code (C.R.S. Title 19)",
        "timeframes": {
            "Temporary Custody Hearing": "72 hours",
            "Adjudicatory Hearing": "90 days",
            "Dispositional Hearing": "45 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "C.R.S. §19-1-103 - Definitions",
            "C.R.S. §19-3-401 - Taking child into custody",
            "C.R.S. §19-3-604 - TPR criteria"
        ],
        "discovery": "C.R.C.P. 26; §19-1-303",
        "key_cases": ["People in Interest of A.M. (2020)", "In re D.I.S. (2009)"],
        "constitution": "Colorado Constitution Art. II, §25 - Due process"
    },
    "NJ": {
        "agency": "Division of Child Protection and Permanency (DCP&P)",
        "statutes": "N.J.S.A. Title 9, Title 30",
        "timeframes": {
            "Order to Show Cause": "2 days",
            "Fact-Finding": "120 days",
            "Disposition": "60 days after fact-finding",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "N.J.S.A. 9:6-8.21 - Definitions",
            "N.J.S.A. 9:6-8.28 - Temporary removal",
            "N.J.S.A. 30:4C-15 - TPR"
        ],
        "discovery": "N.J. Court Rules 5:12",
        "key_cases": ["In re Guardianship of J.C. (2006)", "DYFS v. A.W. (2005)"],
        "constitution": "New Jersey Constitution Art. I, §1 - Due process"
    },
    "VA": {
        "agency": "Virginia Department of Social Services",
        "statutes": "Virginia Code Title 16.1",
        "timeframes": {
            "Preliminary Removal Hearing": "5 days",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "60 days after adjudication",
            "Foster Care Review": "Every 6 months"
        },
        "key_statutes": [
            "Va. Code §16.1-228 - Definitions",
            "Va. Code §16.1-251 - Emergency removal",
            "Va. Code §16.1-283 - TPR"
        ],
        "discovery": "Va. Code §16.1-264",
        "key_cases": ["Roanoke DSS v. Burns (2005)", "Bristol DSS v. Welch (2008)"],
        "constitution": "Virginia Constitution Art. I, §11 - Due process"
    },
    "WA": {
        "agency": "Department of Children, Youth, and Families (DCYF)",
        "statutes": "RCW Title 13.34",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Fact-Finding": "75 days",
            "Disposition": "14 days after fact-finding",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "RCW 13.34.030 - Definitions",
            "RCW 13.34.050 - Taking child into custody",
            "RCW 13.34.180 - TPR"
        ],
        "discovery": "RCW 13.34.096",
        "key_cases": ["In re Dependency of K.R. (2015)", "In re Welfare of Key (2009)"],
        "constitution": "Washington Constitution Art. I, §3 - Due process"
    },
    "MA": {
        "agency": "Department of Children and Families (DCF)",
        "statutes": "M.G.L. Chapter 119",
        "timeframes": {
            "72-Hour Hearing": "Next court day after emergency",
            "Trial on Merits": "90 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "M.G.L. c.119 §21 - Definitions",
            "M.G.L. c.119 §24 - Emergency custody",
            "M.G.L. c.210 §3 - TPR"
        ],
        "discovery": "Mass. R. Civ. P. 26-37",
        "key_cases": ["Adoption of Hugo (2002)", "Care & Protection of Robert (2006)"],
        "constitution": "Massachusetts Constitution Art. 12 - Due process"
    },
    "IN": {
        "agency": "Indiana Department of Child Services (DCS)",
        "statutes": "Indiana Code Title 31",
        "timeframes": {
            "Detention Hearing": "48 hours",
            "Initial Hearing": "10 days",
            "Fact-Finding": "60 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "IC 31-34-1 - CHINS definitions",
            "IC 31-34-4 - Emergency custody",
            "IC 31-35-2 - TPR"
        ],
        "discovery": "Indiana Trial Rule 26",
        "key_cases": ["In re K.T.K. (2009)", "Matter of A.I. (2015)"],
        "constitution": "Indiana Constitution Art. 1, §12 - Due process"
    },
    "TN": {
        "agency": "Department of Children's Services (DCS)",
        "statutes": "Tennessee Code Title 37",
        "timeframes": {
            "Preliminary Hearing": "3 days",
            "Adjudicatory Hearing": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "T.C.A. §37-1-102 - Definitions",
            "T.C.A. §37-1-114 - Taking into custody",
            "T.C.A. §36-1-113 - TPR grounds"
        ],
        "discovery": "Tenn. R. Juv. P. 25",
        "key_cases": ["In re Adoption of A.M.H. (2008)", "State v. B.J.W. (2012)"],
        "constitution": "Tennessee Constitution Art. I, §8 - Due process"
    },
    "MO": {
        "agency": "Missouri Children's Division",
        "statutes": "Missouri Revised Statutes Chapter 211",
        "timeframes": {
            "Protective Custody Hearing": "3 days",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "R.S.Mo. §211.031 - Jurisdiction",
            "R.S.Mo. §211.032 - Protective custody",
            "R.S.Mo. §211.447 - TPR"
        ],
        "discovery": "Missouri Supreme Court Rule 124",
        "key_cases": ["In Interest of K.A.W. (2010)", "In re D.L.W. (2007)"],
        "constitution": "Missouri Constitution Art. I, §10 - Due process"
    },
    "MD": {
        "agency": "Department of Human Services - Social Services",
        "statutes": "Courts & Judicial Proceedings Article, Title 3",
        "timeframes": {
            "Shelter Care Hearing": "Next business day",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Md. Code, Cts. & Jud. Proc. §3-801 - Definitions",
            "Md. Code, Cts. & Jud. Proc. §3-815 - Emergency custody",
            "Md. Code, Fam. Law §5-323 - TPR"
        ],
        "discovery": "Maryland Rule 11-105",
        "key_cases": ["In re Adoption/Guardianship No. 3598 (2003)", "In re Priscilla B. (2006)"],
        "constitution": "Maryland Constitution Declaration of Rights Art. 24 - Due process"
    },
    "WI": {
        "agency": "Wisconsin Department of Children and Families",
        "statutes": "Wisconsin Statutes Chapter 48",
        "timeframes": {
            "Temporary Physical Custody Hearing": "48 hours",
            "Plea Hearing": "30 days",
            "Fact-Finding": "30 days after plea",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Wis. Stat. §48.02 - Definitions",
            "Wis. Stat. §48.19 - Taking into custody",
            "Wis. Stat. §48.415 - TPR grounds"
        ],
        "discovery": "Wis. Stat. §48.293",
        "key_cases": ["In re Termination of B.E. (2007)", "Sheboygan County v. Julie A.B. (2002)"],
        "constitution": "Wisconsin Constitution Art. I, §1 - Due process"
    },
    "MN": {
        "agency": "Minnesota Department of Human Services",
        "statutes": "Minnesota Statutes Chapter 260C",
        "timeframes": {
            "Emergency Hearing": "72 hours",
            "Admit/Deny Hearing": "20 days",
            "Trial": "60 days from petition",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "Minn. Stat. §260C.007 - Definitions",
            "Minn. Stat. §260C.175 - Emergency custody",
            "Minn. Stat. §260C.301 - TPR"
        ],
        "discovery": "Minn. R. Juv. Prot. P. 9",
        "key_cases": ["In re Welfare of J.J.B. (2006)", "In re Child of P.T. (2009)"],
        "constitution": "Minnesota Constitution Art. I, §7 - Due process"
    },
    "SC": {
        "agency": "South Carolina Department of Social Services",
        "statutes": "South Carolina Code Title 63",
        "timeframes": {
            "Probable Cause Hearing": "72 hours",
            "Merits Hearing": "35 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "S.C. Code §63-7-20 - Definitions",
            "S.C. Code §63-7-620 - Emergency removal",
            "S.C. Code §63-7-2570 - TPR"
        ],
        "discovery": "S.C. Code §63-7-1990",
        "key_cases": ["S.C. DSS v. Wilson (2005)", "In re Angela P. (2008)"],
        "constitution": "South Carolina Constitution Art. I, §3 - Due process"
    },
    "AL": {
        "agency": "Alabama Department of Human Resources",
        "statutes": "Alabama Code Title 12, Chapter 15",
        "timeframes": {
            "Shelter Care Hearing": "72 hours",
            "Adjudicatory Hearing": "45 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Ala. Code §12-15-102 - Definitions",
            "Ala. Code §12-15-304 - Emergency custody",
            "Ala. Code §12-15-319 - TPR"
        ],
        "discovery": "Ala. R. Juv. P. 13",
        "key_cases": ["Ex parte Beasley (2003)", "J.M. v. D.G.M. (2010)"],
        "constitution": "Alabama Constitution Art. I, §6 - Due process"
    },
    "LA": {
        "agency": "Louisiana Department of Children and Family Services",
        "statutes": "Louisiana Children's Code",
        "timeframes": {
            "Continued Custody Hearing": "3 days",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "La. Ch.C. Art. 603 - Definitions",
            "La. Ch.C. Art. 619 - Emergency custody",
            "La. Ch.C. Art. 1015 - TPR grounds"
        ],
        "discovery": "La. Ch.C. Art. 653",
        "key_cases": ["State in Interest of J.A. (2006)", "In re C.M.M. (2009)"],
        "constitution": "Louisiana Constitution Art. I, §2 - Due process"
    },
    "KY": {
        "agency": "Kentucky Cabinet for Health and Family Services",
        "statutes": "Kentucky Revised Statutes Chapter 620",
        "timeframes": {
            "Temporary Removal Hearing": "72 hours",
            "Adjudication": "45 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "KRS 620.020 - Definitions",
            "KRS 620.060 - Emergency custody",
            "KRS 625.090 - TPR grounds"
        ],
        "discovery": "KRS 620.060",
        "key_cases": ["Cabinet v. B.L. (2008)", "In re J.R.G. (2005)"],
        "constitution": "Kentucky Constitution §2 - Due process"
    },
    "OR": {
        "agency": "Oregon Department of Human Services",
        "statutes": "Oregon Revised Statutes Chapter 419B",
        "timeframes": {
            "Shelter Hearing": "24 hours",
            "Jurisdiction Hearing": "60 days",
            "Disposition": "14 days after jurisdiction",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "ORS 419B.005 - Definitions",
            "ORS 419B.150 - Protective custody",
            "ORS 419B.504 - TPR grounds"
        ],
        "discovery": "ORS 419B.195",
        "key_cases": ["State ex rel. DHS v. W.A. (2006)", "In re Z.C. (2010)"],
        "constitution": "Oregon Constitution Art. I, §10 - Due process"
    },
    "OK": {
        "agency": "Oklahoma Department of Human Services",
        "statutes": "Oklahoma Statutes Title 10A",
        "timeframes": {
            "Show Cause Hearing": "5 days",
            "Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "10A O.S. §1-1-105 - Definitions",
            "10A O.S. §1-4-201 - Emergency custody",
            "10A O.S. §1-4-904 - TPR grounds"
        ],
        "discovery": "10A O.S. §1-4-503",
        "key_cases": ["In re T.T.S. (2007)", "Matter of C.G. (2012)"],
        "constitution": "Oklahoma Constitution Art. 2, §7 - Due process"
    },
    "CT": {
        "agency": "Connecticut Department of Children and Families",
        "statutes": "Connecticut General Statutes Chapter 815t",
        "timeframes": {
            "Preliminary Hearing": "10 days",
            "Adjudicatory Hearing": "60 days",
            "Disposition": "90 days from filing",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "C.G.S. §46b-120 - Definitions",
            "C.G.S. §17a-101g - Emergency custody",
            "C.G.S. §45a-717 - TPR"
        ],
        "discovery": "Conn. Practice Book §33a-6",
        "key_cases": ["In re Joseph W. (2007)", "In re Roshawn R. (2009)"],
        "constitution": "Connecticut Constitution Art. I, §9 - Due process"
    },
    "IA": {
        "agency": "Iowa Department of Human Services",
        "statutes": "Iowa Code Chapter 232",
        "timeframes": {
            "Removal Hearing": "48 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Iowa Code §232.2 - Definitions",
            "Iowa Code §232.78 - Emergency custody",
            "Iowa Code §232.116 - TPR grounds"
        ],
        "discovery": "Iowa R. Juv. P. 8.3",
        "key_cases": ["In re H.S. (2008)", "In re J.L.W. (2006)"],
        "constitution": "Iowa Constitution Art. I, §9 - Due process"
    },
    "MS": {
        "agency": "Mississippi Department of Child Protection Services",
        "statutes": "Mississippi Code Title 43, Chapter 21",
        "timeframes": {
            "Shelter Hearing": "48 hours",
            "Adjudicatory Hearing": "90 days",
            "Disposition": "14 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Miss. Code §43-21-105 - Definitions",
            "Miss. Code §43-21-303 - Emergency custody",
            "Miss. Code §93-15-103 - TPR grounds"
        ],
        "discovery": "Miss. R. Civ. P. 26",
        "key_cases": ["In Interest of J.P.H. (2005)", "L.G. v. Miss. DHS (2010)"],
        "constitution": "Mississippi Constitution Art. 3, §14 - Due process"
    },
    "AR": {
        "agency": "Arkansas Division of Children and Family Services",
        "statutes": "Arkansas Code Title 9, Chapter 27",
        "timeframes": {
            "Probable Cause Hearing": "72 hours",
            "Adjudication": "60 days",
            "Review Hearing": "Every 6 months",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "Ark. Code §9-27-303 - Definitions",
            "Ark. Code §9-27-313 - Emergency custody",
            "Ark. Code §9-27-341 - TPR grounds"
        ],
        "discovery": "Ark. Code §9-27-325",
        "key_cases": ["Trout v. Ark. DHS (2008)", "Dinkins v. Ark. DHS (2006)"],
        "constitution": "Arkansas Constitution Art. 2, §8 - Due process"
    },
    "UT": {
        "agency": "Utah Division of Child and Family Services",
        "statutes": "Utah Code Title 80",
        "timeframes": {
            "Shelter Hearing": "72 hours",
            "Pretrial/Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "Utah Code §80-1-102 - Definitions",
            "Utah Code §80-3-301 - Emergency custody",
            "Utah Code §80-4-301 - TPR grounds"
        ],
        "discovery": "Utah R. Juv. P. 45",
        "key_cases": ["In re B.R. (2007)", "State in Interest of K.F. (2009)"],
        "constitution": "Utah Constitution Art. I, §7 - Due process"
    },
    "NV": {
        "agency": "Nevada Division of Child and Family Services",
        "statutes": "Nevada Revised Statutes Chapter 432B",
        "timeframes": {
            "Protective Custody Hearing": "72 hours",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "NRS 432B.010 - Definitions",
            "NRS 432B.390 - Emergency custody",
            "NRS 128.105 - TPR grounds"
        ],
        "discovery": "NRS 432B.280",
        "key_cases": ["In re N.J. (2008)", "In re Parental Rights as to A.G. (2010)"],
        "constitution": "Nevada Constitution Art. 1, §8 - Due process"
    },
    "KS": {
        "agency": "Kansas Department for Children and Families",
        "statutes": "Kansas Statutes Chapter 38",
        "timeframes": {
            "Temporary Custody Hearing": "72 hours",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "K.S.A. 38-2202 - Definitions",
            "K.S.A. 38-2232 - Emergency custody",
            "K.S.A. 38-2269 - TPR grounds"
        ],
        "discovery": "K.S.A. 38-2244",
        "key_cases": ["In re K.R. (2008)", "In re S.D. (2011)"],
        "constitution": "Kansas Constitution Bill of Rights §18 - Due process"
    },
    "NM": {
        "agency": "New Mexico Children, Youth and Families Department",
        "statutes": "NMSA 1978, Chapter 32A",
        "timeframes": {
            "Custody Hearing": "10 days",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "NMSA §32A-4-2 - Definitions",
            "NMSA §32A-4-6 - Emergency custody",
            "NMSA §32A-4-28 - TPR grounds"
        ],
        "discovery": "NMRA, Rule 10-122",
        "key_cases": ["In re Pamela A.G. (2006)", "State ex rel. CYFD v. Patricia H. (2009)"],
        "constitution": "New Mexico Constitution Art. II, §18 - Due process"
    },
    "NE": {
        "agency": "Nebraska Department of Health and Human Services",
        "statutes": "Nebraska Revised Statutes Chapter 43",
        "timeframes": {
            "Detention Hearing": "48 hours",
            "Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Neb. Rev. Stat. §43-245 - Definitions",
            "Neb. Rev. Stat. §43-248 - Emergency custody",
            "Neb. Rev. Stat. §43-292 - TPR grounds"
        ],
        "discovery": "Neb. Rev. Stat. §43-273.02",
        "key_cases": ["In re Interest of Samantha C. (2008)", "In re Interest of Mainor T. (2005)"],
        "constitution": "Nebraska Constitution Art. I, §3 - Due process"
    },
    "WV": {
        "agency": "West Virginia Department of Health and Human Resources",
        "statutes": "West Virginia Code Chapter 49",
        "timeframes": {
            "Preliminary Hearing": "10 days",
            "Adjudicatory Hearing": "60 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "W. Va. Code §49-1-201 - Definitions",
            "W. Va. Code §49-4-304 - Emergency custody",
            "W. Va. Code §49-4-604 - TPR grounds"
        ],
        "discovery": "W. Va. Code §49-4-602",
        "key_cases": ["In re Jonathan P. (2007)", "State v. Michael M. (2010)"],
        "constitution": "West Virginia Constitution Art. III, §10 - Due process"
    },
    "ID": {
        "agency": "Idaho Department of Health and Welfare",
        "statutes": "Idaho Code Title 16, Chapter 16",
        "timeframes": {
            "Shelter Care Hearing": "48 hours",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "14 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Idaho Code §16-1602 - Definitions",
            "Idaho Code §16-1608 - Emergency custody",
            "Idaho Code §16-2005 - TPR grounds"
        ],
        "discovery": "I.R.C.P. 26",
        "key_cases": ["In re Doe (2008)", "Idaho DHS v. Doe (2011)"],
        "constitution": "Idaho Constitution Art. I, §13 - Due process"
    },
    "HI": {
        "agency": "Hawaii Department of Human Services",
        "statutes": "Hawaii Revised Statutes Chapter 587A",
        "timeframes": {
            "Temporary Custody Hearing": "48 hours",
            "Adjudication": "60 days",
            "Disposition": "30 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "HRS §587A-4 - Definitions",
            "HRS §587A-8 - Emergency custody",
            "HRS §571-61 - TPR grounds"
        ],
        "discovery": "HRS §587A-16",
        "key_cases": ["In re Doe (2007)", "DHS v. Roe Family (2010)"],
        "constitution": "Hawaii Constitution Art. I, §5 - Due process"
    },
    "NH": {
        "agency": "New Hampshire Division for Children, Youth and Families",
        "statutes": "RSA Chapter 169-C",
        "timeframes": {
            "Preliminary Hearing": "24 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 12 months"
        },
        "key_statutes": [
            "RSA 169-C:3 - Definitions",
            "RSA 169-C:6 - Emergency custody",
            "RSA 170-C:5 - TPR grounds"
        ],
        "discovery": "N.H. Super. Ct. R. 21",
        "key_cases": ["In re Baby Boy Doe (2005)", "In re Brendan C.-H. (2009)"],
        "constitution": "New Hampshire Constitution Part I, Art. 15 - Due process"
    },
    "ME": {
        "agency": "Maine Department of Health and Human Services",
        "statutes": "Maine Revised Statutes Title 22, Chapter 1071",
        "timeframes": {
            "Preliminary Hearing": "7 days",
            "Summary Preliminary Hearing": "24 hours (emergency)",
            "Jeopardy Hearing": "120 days",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "22 M.R.S. §4002 - Definitions",
            "22 M.R.S. §4034 - Emergency custody",
            "22 M.R.S. §4055 - TPR grounds"
        ],
        "discovery": "22 M.R.S. §4008",
        "key_cases": ["In re Thomas H. (2006)", "In re Michael C. (2010)"],
        "constitution": "Maine Constitution Art. I, §6-A - Due process"
    },
    "RI": {
        "agency": "Rhode Island Department of Children, Youth and Families",
        "statutes": "Rhode Island General Laws Title 40",
        "timeframes": {
            "Detention Hearing": "48 hours",
            "Adjudication": "90 days",
            "Disposition": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "R.I. Gen. Laws §40-11-2 - Definitions",
            "R.I. Gen. Laws §40-11-5 - Emergency custody",
            "R.I. Gen. Laws §15-7-7 - TPR grounds"
        ],
        "discovery": "R.I. Gen. Laws §40-11-12",
        "key_cases": ["In re Destiny B. (2007)", "In re M.B. (2011)"],
        "constitution": "Rhode Island Constitution Art. I, §2 - Due process"
    },
    "MT": {
        "agency": "Montana Department of Public Health and Human Services",
        "statutes": "Montana Code Title 41",
        "timeframes": {
            "Show Cause Hearing": "20 days",
            "Adjudication": "90 days",
            "Disposition": "20 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "MCA §41-3-102 - Definitions",
            "MCA §41-3-301 - Emergency custody",
            "MCA §41-3-609 - TPR grounds"
        ],
        "discovery": "MCA §41-3-205",
        "key_cases": ["In re A.N. (2008)", "In re D.B. (2006)"],
        "constitution": "Montana Constitution Art. II, §17 - Due process"
    },
    "DE": {
        "agency": "Delaware Division of Family Services",
        "statutes": "Delaware Code Title 13, Chapter 9",
        "timeframes": {
            "Preliminary Hearing": "24 hours",
            "Adjudicatory Hearing": "30 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "13 Del. C. §901 - Definitions",
            "13 Del. C. §903 - Emergency custody",
            "13 Del. C. §1103 - TPR grounds"
        ],
        "discovery": "Del. Fam. Ct. R. Civ. P. 26",
        "key_cases": ["In re T.W. (2007)", "DSCYF v. Doe (2010)"],
        "constitution": "Delaware Constitution Art. I, §7 - Due process"
    },
    "SD": {
        "agency": "South Dakota Department of Social Services",
        "statutes": "South Dakota Codified Laws Title 26",
        "timeframes": {
            "Temporary Custody Hearing": "48 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "SDCL 26-8A-2 - Definitions",
            "SDCL 26-7A-12 - Emergency custody",
            "SDCL 26-8A-26 - TPR grounds"
        ],
        "discovery": "SDCL 15-6-26",
        "key_cases": ["In re A.S. (2008)", "People v. J.H. (2011)"],
        "constitution": "South Dakota Constitution Art. VI, §2 - Due process"
    },
    "ND": {
        "agency": "North Dakota Department of Human Services",
        "statutes": "North Dakota Century Code Chapter 27-20",
        "timeframes": {
            "Shelter Care Hearing": "96 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "N.D.C.C. §27-20.2-01 - Definitions",
            "N.D.C.C. §27-20.2-06 - Emergency custody",
            "N.D.C.C. §27-20.3-20 - TPR grounds"
        ],
        "discovery": "N.D.R.Ct. 8.3",
        "key_cases": ["In Interest of J.Z. (2007)", "In Interest of K.L. (2010)"],
        "constitution": "North Dakota Constitution Art. I, §12 - Due process"
    },
    "AK": {
        "agency": "Alaska Office of Children's Services",
        "statutes": "Alaska Statutes Title 47, Chapter 17",
        "timeframes": {
            "Probable Cause Hearing": "48 hours",
            "Adjudication": "120 days",
            "Disposition": "60 days after adjudication",
            "Permanency Hearing": "12 months"
        },
        "key_statutes": [
            "AS 47.17.290 - Definitions",
            "AS 47.10.142 - Emergency custody",
            "AS 25.23.180 - TPR grounds"
        ],
        "discovery": "Alaska R. Civ. P. 26",
        "key_cases": ["In re J.L.F. (2008)", "In re S.A. (2006)"],
        "constitution": "Alaska Constitution Art. I, §7 - Due process"
    },
    "VT": {
        "agency": "Vermont Department for Children and Families",
        "statutes": "Vermont Statutes Title 33, Chapter 53",
        "timeframes": {
            "Temporary Care Hearing": "72 hours",
            "Merits Hearing": "60 days",
            "Disposition": "35 days after merits",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "33 V.S.A. §5102 - Definitions",
            "33 V.S.A. §5302 - Emergency custody",
            "15A V.S.A. §3-504 - TPR grounds"
        ],
        "discovery": "V.R.F.P. 4.1(i)",
        "key_cases": ["In re G.S. (2008)", "In re A.F. (2011)"],
        "constitution": "Vermont Constitution Ch. I, Art. 10 - Due process"
    },
    "WY": {
        "agency": "Wyoming Department of Family Services",
        "statutes": "Wyoming Statutes Title 14",
        "timeframes": {
            "Shelter Care Hearing": "48 hours",
            "Adjudicatory Hearing": "60 days",
            "Dispositional Hearing": "30 days after adjudication",
            "Review Hearing": "Every 6 months"
        },
        "key_statutes": [
            "Wyo. Stat. §14-3-402 - Definitions",
            "Wyo. Stat. §14-3-405 - Emergency custody",
            "Wyo. Stat. §14-2-309 - TPR grounds"
        ],
        "discovery": "W.R.C.P. 26",
        "key_cases": ["In re DJG (2007)", "In re K.M.J. (2010)"],
        "constitution": "Wyoming Constitution Art. 1, §6 - Due process"
    }
}

# Federal law that applies to ALL states
FEDERAL_CPS_LAW = {
    "statutes": [
        "42 U.S.C. §671-679b - Title IV-E Foster Care",
        "42 U.S.C. §5101-5119 - Child Abuse Prevention and Treatment Act (CAPTA)",
        "42 U.S.C. §670-679c - Adoption and Safe Families Act (ASFA)",
        "25 U.S.C. §1901-1963 - Indian Child Welfare Act (ICWA)",
        "42 U.S.C. §1983 - Civil Rights (for suing CPS)"
    ],
    "constitutional_rights": [
        "4th Amendment - Protection against unreasonable searches/seizures",
        "5th Amendment - Due process, self-incrimination protection",
        "6th Amendment - Right to counsel in criminal matters",
        "14th Amendment - Due process, equal protection"
    ],
    "supreme_court_cases": [
        "Troxel v. Granville (2000) - Parental rights fundamental",
        "Santosky v. Kramer (1982) - Clear and convincing standard for TPR",
        "Stanley v. Illinois (1972) - Unwed fathers' rights",
        "Lassiter v. DSS (1981) - Right to counsel in TPR"
    ],
    "asfa_requirements": {
        "15_22_month_rule": "State must file TPR if child in care 15 of last 22 months",
        "reasonable_efforts": "Agency must make reasonable efforts to reunify",
        "exceptions": "Aggravated circumstances, abandonment, prior TPR"
    }
}

@app.get("/api/law-library/states")
async def get_all_states():
    """Get list of all states"""
    states = [{"code": code, "name": name} for code, name in STATES_INFO.items()]
    return {"states": sorted(states, key=lambda x: x["name"])}

@app.get("/api/law-library/{state_code}")
async def get_state_law_info(state_code: str, current_user: dict = Depends(get_current_user)):
    """Get comprehensive CPS law information for a state - INSTANT LOADING from pre-built database"""
    state_code = state_code.upper()
    state_name = STATES_INFO.get(state_code)
    if not state_name:
        raise HTTPException(status_code=404, detail="State not found")
    
    # Use pre-built database for instant response
    state_data = STATE_CPS_DATABASE.get(state_code)
    
    if state_data:
        # Format the pre-built data into readable format
        formatted_info = format_state_law_info(state_code, state_name, state_data)
        return {
            "state_code": state_code,
            "state_name": state_name,
            "law_info": formatted_info,
            "federal_law": FEDERAL_CPS_LAW,
            "source": "pre_built_database"
        }
    else:
        # Return generic template with federal law for states not yet in database
        generic_info = get_generic_state_info(state_code, state_name)
        return {
            "state_code": state_code,
            "state_name": state_name,
            "law_info": generic_info,
            "federal_law": FEDERAL_CPS_LAW,
            "source": "generic_template"
        }

def format_state_law_info(state_code: str, state_name: str, data: dict) -> str:
    """Format pre-built state data into readable format"""
    timeframes = data.get("timeframes", {})
    timeframes_text = "\n".join([f"   • {k}: {v}" for k, v in timeframes.items()])
    
    statutes_text = "\n".join([f"   • {s}" for s in data.get("key_statutes", [])])
    cases_text = "\n".join([f"   • {c}" for c in data.get("key_cases", [])])
    
    return f"""
═══════════════════════════════════════════════════════════════════
           {state_name.upper()} ({state_code}) CPS LAW GUIDE
═══════════════════════════════════════════════════════════════════

📋 CPS AGENCY
   {data.get('agency', 'State Child Welfare Agency')}

📚 GOVERNING STATUTES
   {data.get('statutes', 'State Family Code')}

⏱️ KEY TIMEFRAMES
{timeframes_text}

📜 KEY STATUTORY PROVISIONS
{statutes_text}

📖 DISCOVERY RIGHTS
   {data.get('discovery', 'Consult state rules of procedure')}

⚖️ IMPORTANT STATE CASE LAW
{cases_text}

🏛️ STATE CONSTITUTIONAL PROTECTION
   {data.get('constitution', f'{state_name} Constitution - Due Process Clause')}

═══════════════════════════════════════════════════════════════════
                    FEDERAL LAW THAT APPLIES
═══════════════════════════════════════════════════════════════════

📋 FEDERAL STATUTES
   • 42 U.S.C. §671-679b - Title IV-E Foster Care
   • 42 U.S.C. §5101-5119 - CAPTA (Child Abuse Prevention & Treatment Act)
   • 42 U.S.C. §670-679c - ASFA (Adoption & Safe Families Act)
   • 25 U.S.C. §1901-1963 - ICWA (Indian Child Welfare Act)
   • 42 U.S.C. §1983 - Civil Rights (for suing CPS workers)

🏛️ CONSTITUTIONAL RIGHTS
   • 4th Amendment - Protection against warrantless searches
   • 5th Amendment - Due process, self-incrimination protection
   • 14th Amendment - Due process, equal protection
   
⚖️ KEY SUPREME COURT PRECEDENTS
   • Troxel v. Granville (2000) - Parental rights are FUNDAMENTAL
   • Santosky v. Kramer (1982) - Clear & convincing evidence for TPR
   • Stanley v. Illinois (1972) - Due process before termination
   • Lassiter v. DSS (1981) - Right to counsel considerations

📌 ASFA 15/22 MONTH RULE
   State must file TPR petition if child in foster care 15 of last 22 months
   (with exceptions for aggravated circumstances)

═══════════════════════════════════════════════════════════════════
"""

def get_generic_state_info(state_code: str, state_name: str) -> str:
    """Generate generic info for states not in the pre-built database"""
    return f"""
═══════════════════════════════════════════════════════════════════
           {state_name.upper()} ({state_code}) CPS LAW GUIDE
═══════════════════════════════════════════════════════════════════

📋 CPS AGENCY
   {state_name} Department of Children and Family Services
   (Contact your state legislature website for exact agency name)

📚 GOVERNING STATUTES
   {state_name} Family Code / Children's Code
   (Search your state's legislative database for specific citations)

⏱️ TYPICAL CPS TIMEFRAMES (VERIFY WITH YOUR STATE LAW)
   • Emergency/Shelter Hearing: Usually 24-72 hours
   • Adjudication/Jurisdiction Hearing: 30-90 days
   • Disposition Hearing: 15-30 days after adjudication
   • Review Hearings: Every 6 months
   • Permanency Hearing: Within 12 months of removal
   
📜 IMPORTANT: VERIFY ALL TIMEFRAMES WITH YOUR STATE CODE
   Timeframes vary significantly by state. Missing a deadline
   can have serious consequences for your case.

📖 DISCOVERY RIGHTS
   Contact the court clerk or your attorney for procedures
   to obtain your CPS case file in {state_name}.

═══════════════════════════════════════════════════════════════════
                    FEDERAL LAW THAT APPLIES
═══════════════════════════════════════════════════════════════════

📋 FEDERAL STATUTES (APPLY TO ALL STATES)
   • 42 U.S.C. §671-679b - Title IV-E Foster Care
   • 42 U.S.C. §5101-5119 - CAPTA (Child Abuse Prevention & Treatment Act)
   • 42 U.S.C. §670-679c - ASFA (Adoption & Safe Families Act)
   • 25 U.S.C. §1901-1963 - ICWA (Indian Child Welfare Act)
   • 42 U.S.C. §1983 - Civil Rights (for suing CPS workers)

🏛️ CONSTITUTIONAL RIGHTS (APPLY EVERYWHERE)
   • 4th Amendment - Protection against warrantless searches
   • 5th Amendment - Due process, self-incrimination protection
   • 14th Amendment - Due process, equal protection
   
⚖️ KEY SUPREME COURT PRECEDENTS
   • Troxel v. Granville (2000) - Parental rights are FUNDAMENTAL
   • Santosky v. Kramer (1982) - Clear & convincing evidence for TPR
   • Stanley v. Illinois (1972) - Due process before termination
   • Lassiter v. DSS (1981) - Right to counsel considerations

📌 ASFA 15/22 MONTH RULE
   State must file TPR petition if child in foster care 15 of last 22 months
   (with exceptions for aggravated circumstances)

═══════════════════════════════════════════════════════════════════
         For state-specific citations, consult:
         • Your state's legislative website
         • A family law attorney in {state_name}
         • Your local law library
═══════════════════════════════════════════════════════════════════
"""


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


# ============== LEGAL NOTEPAD ==============

@app.post("/api/notepad")
async def create_notepad_entry(entry: NotepadEntryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new notepad entry - can be global or case-specific"""
    entry_id = str(uuid.uuid4())
    
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": entry.case_id,  # None for global notes
        "title": entry.title,
        "content": entry.content,
        "category": entry.category,
        "state": entry.state,
        "source_type": entry.source_type,
        "source_reference": entry.source_reference,
        "tags": entry.tags or [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notepad_entries.insert_one(notepad_entry)
    notepad_entry["id"] = notepad_entry.pop("_id")
    return notepad_entry

@app.get("/api/notepad")
async def list_notepad_entries(
    case_id: Optional[str] = None,
    category: Optional[str] = None,
    global_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """List notepad entries - filter by case or get global notes"""
    query = {"user_id": current_user["user_id"]}
    
    if global_only:
        query["case_id"] = None
    elif case_id:
        query["case_id"] = case_id
    
    if category:
        query["category"] = category
    
    entries = []
    async for entry in db.notepad_entries.find(query).sort("created_at", -1):
        entry["id"] = entry.pop("_id")
        entries.append(entry)
    
    return {"entries": entries, "total": len(entries)}

@app.get("/api/notepad/{entry_id}")
async def get_notepad_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific notepad entry"""
    entry = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not entry:
        raise HTTPException(status_code=404, detail="Note not found")
    
    entry["id"] = entry.pop("_id")
    return entry

@app.put("/api/notepad/{entry_id}")
async def update_notepad_entry(
    entry_id: str,
    update: NotepadEntryUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a notepad entry"""
    existing = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.notepad_entries.update_one(
        {"_id": entry_id},
        {"$set": update_data}
    )
    
    updated = await db.notepad_entries.find_one({"_id": entry_id})
    updated["id"] = updated.pop("_id")
    return updated

@app.delete("/api/notepad/{entry_id}")
async def delete_notepad_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a notepad entry"""
    result = await db.notepad_entries.delete_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"status": "deleted", "id": entry_id}

@app.post("/api/notepad/save-from-library")
async def save_from_law_library(
    state_code: str = Body(...),
    case_id: Optional[str] = Body(None),
    title: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """Quick save state law info to notepad"""
    state_code = state_code.upper()
    state_name = STATES_INFO.get(state_code)
    
    if not state_name:
        raise HTTPException(status_code=404, detail="State not found")
    
    state_data = STATE_CPS_DATABASE.get(state_code)
    if state_data:
        content = format_state_law_info(state_code, state_name, state_data)
    else:
        content = get_generic_state_info(state_code, state_name)
    
    entry_id = str(uuid.uuid4())
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": case_id,
        "title": title or f"{state_name} CPS Law Reference",
        "content": content,
        "category": "statute",
        "state": state_code,
        "source_type": "law_library",
        "source_reference": f"/api/law-library/{state_code}",
        "tags": ["cps_law", state_code.lower(), "state_statute"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notepad_entries.insert_one(notepad_entry)
    notepad_entry["id"] = notepad_entry.pop("_id")
    return notepad_entry

@app.post("/api/notepad/save-from-courtlistener")
async def save_from_courtlistener(
    case_name: str = Body(...),
    citation: str = Body(...),
    court: str = Body(...),
    date_filed: str = Body(...),
    snippet: str = Body(...),
    url: str = Body(...),
    case_id: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """Save CourtListener case to notepad"""
    entry_id = str(uuid.uuid4())
    
    content = f"""
═══════════════════════════════════════════════════════════════════
                    COURT OPINION REFERENCE
═══════════════════════════════════════════════════════════════════

📋 CASE NAME
   {case_name}

📚 CITATION
   {citation}

🏛️ COURT
   {court}

📅 DATE FILED
   {date_filed}

📝 RELEVANT EXCERPT
   {snippet}

🔗 FULL OPINION
   {url}

═══════════════════════════════════════════════════════════════════
"""
    
    notepad_entry = {
        "_id": entry_id,
        "user_id": current_user["user_id"],
        "case_id": case_id,
        "title": case_name,
        "content": content,
        "category": "case_law",
        "state": None,
        "source_type": "courtlistener",
        "source_reference": url,
        "tags": ["case_law", "courtlistener", court.lower().replace(" ", "_")],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notepad_entries.insert_one(notepad_entry)
    notepad_entry["id"] = notepad_entry.pop("_id")
    return notepad_entry


# ============== PDF EXPORT ==============

# IMPORTANT: /all/pdf route must come BEFORE /{entry_id}/pdf to avoid route matching issues
@app.get("/api/export/notepad/all/pdf")
async def export_all_notes_to_pdf(
    case_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Export all notepad entries as single PDF"""
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.units import inch
    from fastapi.responses import StreamingResponse
    
    query = {"user_id": current_user["user_id"]}
    if case_id:
        query["case_id"] = case_id
    
    entries = []
    async for entry in db.notepad_entries.find(query).sort("created_at", -1):
        entries.append(entry)
    
    if not entries:
        raise HTTPException(status_code=404, detail="No notes found")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=20, spaceAfter=20)
    
    story = []
    story.append(Paragraph("THE CPS PUNISHER - Legal Research Notebook", title_style))
    story.append(Paragraph(f"Total Notes: {len(entries)}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    for i, entry in enumerate(entries):
        if i > 0:
            story.append(PageBreak())
        
        story.append(Paragraph(entry.get("title", "Untitled"), styles['Heading2']))
        story.append(Paragraph(f"Category: {entry.get('category', 'general')} | Created: {entry.get('created_at', 'N/A')[:10]}", styles['Italic']))
        story.append(Spacer(1, 10))
        
        content = entry.get("content", "").replace("\n", "<br/>")
        content = content.replace("═", "-").replace("📋", "*").replace("📚", "*")
        content = content.replace("🏛️", "*").replace("📅", "*").replace("📝", "*")
        content = content.replace("🔗", "*").replace("⏱️", "*").replace("📜", "*")
        content = content.replace("⚖️", "*").replace("📖", "*").replace("📌", "*")
        
        story.append(Paragraph(content, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"cps_punisher_all_notes.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/api/export/notepad/{entry_id}/pdf")
async def export_notepad_to_pdf(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Export a notepad entry as PDF"""
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    from fastapi.responses import StreamingResponse
    
    entry = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not entry:
        raise HTTPException(status_code=404, detail="Note not found")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=18, spaceAfter=20)
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=10, leading=14)
    
    story = []
    story.append(Paragraph(f"THE CPS PUNISHER - Legal Notepad", title_style))
    story.append(Paragraph(entry.get("title", "Untitled"), styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # Convert content - handle special characters
    content = entry.get("content", "").replace("\n", "<br/>")
    content = content.replace("═", "-").replace("📋", "*").replace("📚", "*")
    content = content.replace("🏛️", "*").replace("📅", "*").replace("📝", "*")
    content = content.replace("🔗", "*").replace("⏱️", "*").replace("📜", "*")
    content = content.replace("⚖️", "*").replace("📖", "*").replace("📌", "*")
    
    story.append(Paragraph(content, body_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"Category: {entry.get('category', 'N/A')}", styles['Normal']))
    story.append(Paragraph(f"Created: {entry.get('created_at', 'N/A')}", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"cps_punisher_note_{entry_id[:8]}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/export/case/{case_id}/pdf")
async def export_case_to_pdf(case_id: str, current_user: dict = Depends(get_current_user)):
    """Export full case summary as PDF"""
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from fastapi.responses import StreamingResponse
    
    # Get case
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get related data
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        violations.append(v)
    
    timeline = []
    async for t in db.timeline_events.find({"case_id": case_id}).sort("event_date", 1):
        timeline.append(t)
    
    documents = []
    async for d in db.documents.find({"case_id": case_id}):
        documents.append(d)
    
    notes = []
    async for n in db.notepad_entries.find({"case_id": case_id, "user_id": current_user["user_id"]}):
        notes.append(n)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=20, spaceAfter=20)
    section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=14, spaceBefore=15, spaceAfter=10)
    
    story = []
    
    # Header
    story.append(Paragraph("THE CPS PUNISHER", title_style))
    story.append(Paragraph("CASE SUMMARY REPORT", styles['Heading2']))
    story.append(Spacer(1, 20))
    
    # Case Info
    story.append(Paragraph("CASE INFORMATION", section_style))
    case_info = [
        ["Case Title:", case.get("title", "N/A")],
        ["State:", case.get("state", "N/A")],
        ["County:", case.get("county", "N/A")],
        ["Case Number:", case.get("case_number", "N/A")],
        ["Status:", case.get("status", "active")],
        ["Created:", case.get("created_at", "N/A")[:10] if case.get("created_at") else "N/A"]
    ]
    t = Table(case_info, colWidths=[2*inch, 4*inch])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # Violations
    if violations:
        story.append(Paragraph(f"VIOLATIONS IDENTIFIED ({len(violations)})", section_style))
        for v in violations:
            story.append(Paragraph(f"• {v.get('violation_type', 'Unknown')}: {v.get('description', '')[:100]}...", styles['Normal']))
        story.append(Spacer(1, 10))
    
    # Timeline
    if timeline:
        story.append(Paragraph(f"CASE TIMELINE ({len(timeline)} events)", section_style))
        for t in timeline[:10]:  # Limit to 10
            story.append(Paragraph(f"• {t.get('event_date', 'N/A')}: {t.get('title', 'Untitled')}", styles['Normal']))
        story.append(Spacer(1, 10))
    
    # Notes
    if notes:
        story.append(Paragraph(f"LEGAL NOTES ({len(notes)})", section_style))
        for n in notes[:5]:  # Limit to 5
            story.append(Paragraph(f"• {n.get('title', 'Untitled')} ({n.get('category', 'general')})", styles['Normal']))
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph("Generated by THE CPS PUNISHER - AI-Powered Legal Defense Platform", styles['Italic']))
    story.append(Paragraph("This document is for informational purposes only. Consult a licensed attorney.", styles['Italic']))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"cps_case_{case_id[:8]}_summary.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ============== CASE PREPARATION KIT ==============

@app.get("/api/export/case/{case_id}/preparation-kit")
async def export_case_preparation_kit(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Generate comprehensive Court Preparation Kit PDF
    Includes: Case info, violations, timeline, evidence, documents, notes, strategies
    """
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from fastapi.responses import StreamingResponse
    
    # Get case with ownership check
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Gather ALL case data
    violations = []
    async for v in db.violations.find({"case_id": case_id}).sort("date_occurred", -1):
        violations.append(v)
    
    timeline = []
    async for t in db.timeline_events.find({"case_id": case_id}).sort("event_date", 1):
        timeline.append(t)
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}):
        evidence.append(e)
    
    documents = []
    async for d in db.documents.find({"case_id": case_id}):
        documents.append(d)
    
    notes = []
    async for n in db.notepad_entries.find({"case_id": case_id, "user_id": current_user["user_id"]}):
        notes.append(n)
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}):
        strategies.append(s)
    
    communications = []
    async for c in db.communications.find({"case_id": case_id}).sort("date", -1):
        communications.append(c)
    
    court_filings = []
    async for f in db.court_filings.find({"case_id": case_id}).sort("filed_date", -1):
        court_filings.append(f)
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        topMargin=0.75*inch, 
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'KitTitle', 
        parent=styles['Heading1'], 
        fontSize=24, 
        spaceAfter=10,
        alignment=TA_CENTER,
        textColor=colors.darkred
    )
    subtitle_style = ParagraphStyle(
        'KitSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.gray,
        spaceAfter=30
    )
    section_style = ParagraphStyle(
        'Section', 
        parent=styles['Heading2'], 
        fontSize=16, 
        spaceBefore=20, 
        spaceAfter=12,
        textColor=colors.darkblue,
        borderWidth=1,
        borderColor=colors.darkblue,
        borderPadding=5
    )
    subsection_style = ParagraphStyle(
        'Subsection',
        parent=styles['Heading3'],
        fontSize=12,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.black
    )
    body_style = ParagraphStyle(
        'KitBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'KitBullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=12,
        leftIndent=20,
        spaceAfter=4
    )
    
    story = []
    
    # ===== COVER PAGE =====
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("THE CPS PUNISHER", title_style))
    story.append(Paragraph("COURT PREPARATION KIT", ParagraphStyle('SubTitle', parent=title_style, fontSize=18, textColor=colors.black)))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(f"Case: {case.get('title', 'Untitled Case')}", subtitle_style))
    story.append(Paragraph(f"State: {case.get('state', 'N/A')} | County: {case.get('county', 'N/A')}", subtitle_style))
    story.append(Paragraph(f"Case Number: {case.get('case_number', 'N/A')}", subtitle_style))
    story.append(Spacer(1, 0.5*inch))
    
    # Stats summary
    stats_data = [
        ["DOCUMENT SUMMARY", ""],
        ["Total Violations Identified:", str(len(violations))],
        ["Timeline Events:", str(len(timeline))],
        ["Evidence Items:", str(len(evidence))],
        ["Documents Analyzed:", str(len(documents))],
        ["Legal Notes:", str(len(notes))],
        ["Defense Strategies:", str(len(strategies))],
        ["Communications Logged:", str(len(communications))],
        ["Court Filings:", str(len(court_filings))],
    ]
    stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
    stats_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.5*inch))
    
    generation_date = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    story.append(Paragraph(f"Generated: {generation_date}", ParagraphStyle('Date', parent=styles['Italic'], alignment=TA_CENTER)))
    story.append(PageBreak())
    
    # ===== TABLE OF CONTENTS =====
    story.append(Paragraph("TABLE OF CONTENTS", section_style))
    toc_items = [
        "1. Case Information",
        "2. Identified Violations",
        "3. Case Timeline",
        "4. Evidence Inventory",
        "5. Document Analysis",
        "6. Legal Research Notes",
        "7. Defense Strategies",
        "8. Communication Log",
        "9. Court Filings",
        "10. Legal Disclaimers"
    ]
    for item in toc_items:
        story.append(Paragraph(item, body_style))
    story.append(PageBreak())
    
    # ===== 1. CASE INFORMATION =====
    story.append(Paragraph("1. CASE INFORMATION", section_style))
    
    case_info_data = [
        ["Field", "Value"],
        ["Case Title", case.get("title", "N/A")],
        ["Case Number", case.get("case_number", "N/A")],
        ["State", case.get("state", "N/A")],
        ["County", case.get("county", "N/A")],
        ["Status", case.get("status", "active").upper()],
        ["Date Opened", case.get("date_opened", "N/A")],
        ["Caseworker", case.get("caseworker_name", "N/A")],
        ["Judge", case.get("judge_name", "N/A")],
        ["Court", case.get("court_name", "N/A")],
        ["Attorney", case.get("attorney_name", "N/A")],
    ]
    
    if case.get("children_names"):
        case_info_data.append(["Children", ", ".join(case.get("children_names", []))])
    
    case_table = Table(case_info_data, colWidths=[2*inch, 4.5*inch])
    case_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(case_table)
    
    if case.get("description"):
        story.append(Spacer(1, 15))
        story.append(Paragraph("Case Description:", subsection_style))
        story.append(Paragraph(case.get("description", ""), body_style))
    
    story.append(PageBreak())
    
    # ===== 2. VIOLATIONS =====
    story.append(Paragraph("2. IDENTIFIED VIOLATIONS", section_style))
    
    if violations:
        story.append(Paragraph(f"Total violations identified: {len(violations)}", body_style))
        story.append(Spacer(1, 10))
        
        for i, v in enumerate(violations, 1):
            story.append(Paragraph(f"Violation #{i}: {v.get('violation_type', 'Unknown')}", subsection_style))
            
            v_data = [
                ["Severity:", v.get("severity", "medium").upper()],
                ["Date Occurred:", v.get("date_occurred", "N/A")],
                ["Description:", v.get("description", "No description")[:500]],
            ]
            if v.get("evidence_notes"):
                v_data.append(["Evidence Notes:", v.get("evidence_notes", "")[:300]])
            
            for row in v_data:
                story.append(Paragraph(f"<b>{row[0]}</b> {row[1]}", bullet_style))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("No violations have been documented yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 3. TIMELINE =====
    story.append(Paragraph("3. CASE TIMELINE", section_style))
    
    if timeline:
        story.append(Paragraph(f"Total events: {len(timeline)}", body_style))
        story.append(Spacer(1, 10))
        
        timeline_data = [["Date", "Event", "Type"]]
        for t in timeline:
            timeline_data.append([
                t.get("event_date", "N/A")[:10] if t.get("event_date") else "N/A",
                t.get("title", "Untitled")[:50],
                t.get("event_type", "general")
            ])
        
        timeline_table = Table(timeline_data, colWidths=[1.2*inch, 3.8*inch, 1.5*inch])
        timeline_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(timeline_table)
    else:
        story.append(Paragraph("No timeline events have been documented yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 4. EVIDENCE =====
    story.append(Paragraph("4. EVIDENCE INVENTORY", section_style))
    
    if evidence:
        story.append(Paragraph(f"Total evidence items: {len(evidence)}", body_style))
        story.append(Spacer(1, 10))
        
        for i, e in enumerate(evidence, 1):
            story.append(Paragraph(f"Evidence #{i}: {e.get('title', 'Untitled')}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {e.get('evidence_type', 'document')}", bullet_style))
            story.append(Paragraph(f"<b>Source:</b> {e.get('source', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Date Collected:</b> {e.get('date_collected', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Description:</b> {e.get('description', '')[:300]}", bullet_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No evidence items have been catalogued yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 5. DOCUMENTS =====
    story.append(Paragraph("5. DOCUMENT ANALYSIS", section_style))
    
    if documents:
        story.append(Paragraph(f"Total documents analyzed: {len(documents)}", body_style))
        story.append(Spacer(1, 10))
        
        for i, d in enumerate(documents, 1):
            story.append(Paragraph(f"Document #{i}: {d.get('filename', d.get('title', 'Untitled'))}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {d.get('document_type', 'general')}", bullet_style))
            story.append(Paragraph(f"<b>Uploaded:</b> {d.get('created_at', 'N/A')[:10] if d.get('created_at') else 'N/A'}", bullet_style))
            
            if d.get("ai_analysis"):
                analysis = d.get("ai_analysis", "")[:500]
                story.append(Paragraph(f"<b>AI Analysis:</b> {analysis}...", bullet_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No documents have been uploaded for analysis yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 6. LEGAL NOTES =====
    story.append(Paragraph("6. LEGAL RESEARCH NOTES", section_style))
    
    if notes:
        # Group by category
        categories = {}
        for n in notes:
            cat = n.get("category", "general")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(n)
        
        for cat, cat_notes in categories.items():
            story.append(Paragraph(f"{cat.upper()} ({len(cat_notes)} notes)", subsection_style))
            for n in cat_notes[:5]:  # Limit to 5 per category
                story.append(Paragraph(f"• <b>{n.get('title', 'Untitled')}</b>", bullet_style))
                if n.get("source_type"):
                    story.append(Paragraph(f"  Source: {n.get('source_type')}", ParagraphStyle('Source', parent=bullet_style, fontSize=9, textColor=colors.gray)))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No legal research notes have been saved yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 7. STRATEGIES =====
    story.append(Paragraph("7. DEFENSE STRATEGIES", section_style))
    
    if strategies:
        for i, s in enumerate(strategies, 1):
            story.append(Paragraph(f"Strategy #{i}: {s.get('title', 'Untitled')}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {s.get('strategy_type', 'general')}", bullet_style))
            content = s.get("content", "")[:800]
            # Clean content for PDF
            content = content.replace("\n", " ").replace("•", "-")
            story.append(Paragraph(content, body_style))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("No defense strategies have been generated yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 8. COMMUNICATIONS =====
    story.append(Paragraph("8. COMMUNICATION LOG", section_style))
    
    if communications:
        story.append(Paragraph(f"Total communications logged: {len(communications)}", body_style))
        story.append(Spacer(1, 10))
        
        comm_data = [["Date", "Type", "Contact", "Summary"]]
        for c in communications[:20]:  # Limit to 20
            comm_data.append([
                c.get("date", "N/A")[:10] if c.get("date") else "N/A",
                c.get("communication_type", "N/A")[:15],
                c.get("contact_name", "N/A")[:20],
                c.get("summary", "")[:40] + "..."
            ])
        
        comm_table = Table(comm_data, colWidths=[1*inch, 1.2*inch, 1.5*inch, 2.8*inch])
        comm_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(comm_table)
    else:
        story.append(Paragraph("No communications have been logged yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 9. COURT FILINGS =====
    story.append(Paragraph("9. COURT FILINGS", section_style))
    
    if court_filings:
        for i, f in enumerate(court_filings, 1):
            story.append(Paragraph(f"Filing #{i}: {f.get('title', 'Untitled')}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {f.get('filing_type', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Filed Date:</b> {f.get('filed_date', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Status:</b> {f.get('status', 'filed')}", bullet_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No court filings have been recorded yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 10. DISCLAIMERS =====
    story.append(Paragraph("10. LEGAL DISCLAIMERS", section_style))
    
    disclaimers = [
        "This document is generated by THE CPS PUNISHER, an AI-powered legal research and case management tool.",
        "This document is for INFORMATIONAL PURPOSES ONLY and does not constitute legal advice.",
        "Always consult with a licensed attorney before taking any legal action.",
        "The accuracy of information in this document depends on the data entered by the user.",
        "AI-generated analyses and strategies should be reviewed by qualified legal counsel.",
        "This document may contain sensitive personal information and should be handled confidentially.",
        "THE CPS PUNISHER and its creators are not responsible for any actions taken based on this document."
    ]
    
    for d in disclaimers:
        story.append(Paragraph(f"• {d}", bullet_style))
    
    story.append(Spacer(1, 30))
    story.append(Paragraph("— END OF COURT PREPARATION KIT —", ParagraphStyle('End', parent=styles['Italic'], alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    # Generate filename
    case_title_clean = "".join(c for c in case.get("title", "case")[:20] if c.isalnum() or c in " -_").strip().replace(" ", "_")
    filename = f"CPS_Punisher_Court_Kit_{case_title_clean}_{case_id[:8]}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


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
    
    # Get pricing from server-side configuration (NEVER accept amount from frontend)
    tier_pricing = TIER_PRICING.get(request.tier)
    if not tier_pricing:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    amount = tier_pricing.get(request.billing_period)
    if not amount:
        raise HTTPException(status_code=400, detail="Invalid billing period")
    
    tier_name = tier_pricing.get("name", request.tier.title())
    
    success_url = f"{request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/pricing"
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Use amount-based checkout instead of price_id
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["user_id"],
            "tier": request.tier,
            "tier_name": tier_name,
            "billing_period": request.billing_period
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    await db.payment_transactions.insert_one({
        "_id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["user_id"],
        "tier": request.tier,
        "tier_name": tier_name,
        "billing_period": request.billing_period,
        "amount": amount,
        "currency": "usd",
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


# ============== LEGAL KNOWLEDGE BASE API ==============

@app.get("/api/legal/supreme-court-cases")
async def get_supreme_court_cases():
    """Get comprehensive Supreme Court case database for CPS defense"""
    return {
        "cases": SUPREME_COURT_CASES,
        "count": len(SUPREME_COURT_CASES),
        "description": "Landmark Supreme Court cases for CPS and family law defense"
    }

@app.get("/api/legal/circuit-court-cases")
async def get_circuit_court_cases():
    """Get Federal Circuit Court precedents for CPS Section 1983 claims"""
    return {
        "cases": CIRCUIT_COURT_CASES,
        "count": len(CIRCUIT_COURT_CASES),
        "description": "Critical Federal Circuit Court precedents - essential for Section 1983 claims"
    }

@app.get("/api/legal/blacks-law")
async def get_blacks_law_definitions():
    """Get Black's Law Dictionary definitions for CPS legal terms"""
    return {
        "definitions": BLACKS_LAW_DEFINITIONS,
        "count": len(BLACKS_LAW_DEFINITIONS),
        "source": "Black's Law Dictionary (11th ed. 2019)"
    }

@app.get("/api/legal/constitutional-rights")
async def get_constitutional_rights():
    """Get constitutional rights analysis for CPS cases"""
    return {
        "rights": CONSTITUTIONAL_RIGHTS,
        "description": "Constitutional amendments and their application in CPS cases"
    }

@app.get("/api/legal/violation-analysis/{violation_type}")
async def get_violation_analysis(violation_type: str):
    """Get detailed analysis for a specific violation type"""
    if violation_type in VIOLATION_ANALYSIS:
        analysis = VIOLATION_ANALYSIS[violation_type]
        case_law = get_relevant_case_law(violation_type)
        immunity = analyze_qualified_immunity(violation_type)
        return {
            "violation_type": violation_type,
            "analysis": analysis,
            "relevant_case_law": case_law,
            "qualified_immunity_analysis": immunity
        }
    else:
        # Return generic analysis
        return {
            "violation_type": violation_type,
            "case_law": get_relevant_case_law(violation_type),
            "qualified_immunity": analyze_qualified_immunity(violation_type)
        }

@app.get("/api/legal/rooker-feldman")
async def get_rooker_feldman_guidance():
    """Get Rooker-Feldman doctrine and avoidance strategies"""
    return {
        "doctrine": ROOKER_FELDMAN,
        "description": "Critical guidance for avoiding Rooker-Feldman dismissal in Section 1983 cases"
    }

@app.get("/api/legal/section-1983-guide")
async def get_section_1983_guide():
    """Get comprehensive Section 1983 litigation guide"""
    return {
        "guide": SECTION_1983,
        "description": "Complete guide to 42 U.S.C. § 1983 civil rights litigation against CPS"
    }

@app.get("/api/legal/federal-statutes")
async def get_federal_statutes():
    """Get federal statutes relevant to CPS cases (CAPTA, ASFA, ICWA)"""
    return {
        "statutes": FEDERAL_STATUTES,
        "description": "Federal statutes governing child welfare: CAPTA, ASFA, ICWA"
    }

@app.post("/api/legal/analyze-violation")
async def analyze_specific_violation(
    violation_type: str = Body(...),
    facts: dict = Body(default={}),
    state: str = Body(default="TX"),
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a specific violation with AI using the legal knowledge base.
    This is the most powerful legal analysis feature.
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get relevant legal knowledge
    case_law = get_relevant_case_law(violation_type)
    immunity = analyze_qualified_immunity(violation_type)
    violation_info = VIOLATION_ANALYSIS.get(violation_type, {})
    
    # Build comprehensive context
    context = f"""
VIOLATION TYPE: {violation_type}

CONSTITUTIONAL BASIS: {case_law.get('constitutional_basis', 'Constitutional violation')}

RELEVANT SUPREME COURT PRECEDENTS:
{json.dumps([SUPREME_COURT_CASES.get(k, {}) for k in ['troxel', 'stanley', 'santosky', 'camara']], indent=2)}

RELEVANT CIRCUIT COURT PRECEDENTS:
{json.dumps(case_law.get('relevant_cases', []), indent=2)}

VIOLATION ANALYSIS:
{json.dumps(violation_info, indent=2)}

QUALIFIED IMMUNITY ANALYSIS:
{json.dumps(immunity, indent=2)}

ROOKER-FELDMAN AVOIDANCE:
{json.dumps(ROOKER_FELDMAN.get('avoidance_strategies', []), indent=2)}

FACTS OF THIS CASE:
{json.dumps(facts, indent=2)}

STATE: {state}
"""

    system_prompt = """You are THE CPS PUNISHER - the most knowledgeable legal AI for CPS cases.

You have access to comprehensive legal knowledge including:
- Supreme Court precedents (Troxel, Stanley, Santosky, Lassiter, Camara)
- Federal Circuit Court precedents (Calabretta v. Floyd, Wallis v. Spencer, Duchesne v. Sugarman)
- Black's Law Dictionary definitions
- Section 1983 civil rights guidance
- Rooker-Feldman avoidance strategies
- Qualified immunity analysis

Analyze this violation using your legal knowledge. Be AGGRESSIVE in identifying violations.
Cite specific cases with their holdings. Explain how to defeat qualified immunity.
Provide a Section 1983 viability assessment.

Format your response with:
1. VIOLATION IDENTIFIED
2. CONSTITUTIONAL BASIS
3. SUPPORTING CASE LAW (with citations and holdings)
4. QUALIFIED IMMUNITY ANALYSIS
5. SECTION 1983 VIABILITY
6. RECOMMENDED LEGAL STRATEGY
7. POTENTIAL DAMAGES"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"violation-{uuid.uuid4().hex[:8]}",
        system_message=system_prompt
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Analyze this {violation_type} violation with comprehensive legal analysis:

{context}

Provide your expert legal analysis."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "violation_type": violation_type,
        "analysis": response,
        "case_law_cited": case_law,
        "qualified_immunity": immunity,
        "section_1983_viable": case_law.get("section_1983_viable", True)
    }


@app.get("/api/legal/incident-types")
async def get_incident_types():
    """Get all incident/violation types with analysis guidance"""
    return {
        "incident_types": [
            {
                "id": "warrantless_entry",
                "name": "Warrantless Home Entry",
                "description": "CPS entered home without warrant, consent, or exigent circumstances",
                "constitutional_basis": "Fourth Amendment",
                "key_case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
                "section_1983_viable": True,
                "qualified_immunity_likely_defeated": True
            },
            {
                "id": "coerced_consent",
                "name": "Coerced Consent",
                "description": "CPS obtained entry through threats, deception, or coercion",
                "constitutional_basis": "Fourth Amendment",
                "key_case": "Schneckloth v. Bustamonte, 412 U.S. 218 (1973)",
                "section_1983_viable": True
            },
            {
                "id": "strip_search",
                "name": "Strip Search of Child",
                "description": "Invasive physical examination without warrant or exigency",
                "constitutional_basis": "Fourth Amendment",
                "key_case": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
                "section_1983_viable": True,
                "qualified_immunity_likely_defeated": True
            },
            {
                "id": "emergency_removal_no_danger",
                "name": "Emergency Removal Without Imminent Danger",
                "description": "Children removed without evidence of imminent danger",
                "constitutional_basis": "Fourth and Fourteenth Amendments",
                "key_case": "Gates v. Texas DHS, 537 F.3d 404 (5th Cir. 2008)",
                "section_1983_viable": True
            },
            {
                "id": "inadequate_investigation",
                "name": "Inadequate Investigation",
                "description": "Removal without reasonable investigation",
                "constitutional_basis": "Fourteenth Amendment Due Process",
                "key_case": "Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)",
                "section_1983_viable": True
            },
            {
                "id": "fabricated_evidence",
                "name": "Fabricated Evidence",
                "description": "Caseworker fabricated or falsified evidence",
                "constitutional_basis": "Fourteenth Amendment Due Process",
                "key_case": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
                "section_1983_viable": True,
                "qualified_immunity_likely_defeated": True
            },
            {
                "id": "procedural_due_process",
                "name": "Procedural Due Process Violation",
                "description": "Failed to provide proper notice or hearing",
                "constitutional_basis": "Fourteenth Amendment",
                "key_case": "Mathews v. Eldridge, 424 U.S. 319 (1976)",
                "section_1983_viable": True
            },
            {
                "id": "denial_of_counsel",
                "name": "Denial of Right to Counsel",
                "description": "Proceedings held without attorney when required",
                "constitutional_basis": "Fourteenth Amendment / Sixth Amendment",
                "key_case": "Lassiter v. DSS, 452 U.S. 18 (1981)",
                "section_1983_viable": True
            },
            {
                "id": "fifth_amendment",
                "name": "Fifth Amendment Violation",
                "description": "Compelled self-incriminating statements",
                "constitutional_basis": "Fifth Amendment",
                "key_case": "Minnesota v. Murphy, 465 U.S. 420 (1984)",
                "section_1983_viable": True
            },
            {
                "id": "icwa_violation",
                "name": "ICWA Violation",
                "description": "Indian Child Welfare Act requirements not followed",
                "constitutional_basis": "Federal Statute (25 U.S.C. §§ 1901-1963)",
                "requirements": ["Notice to tribe", "Active efforts", "Placement preferences", "Qualified expert witness"],
                "section_1983_viable": True
            }
        ]
    }


# ============== VISITATION LOG ==============

@app.post("/api/visitation")
async def create_visitation(
    case_id: str = Body(...),
    date: str = Body(...),
    time: str = Body(default="10:00"),
    duration: int = Body(default=60),
    location: str = Body(default=""),
    supervisor: str = Body(default=""),
    child_emotional_state: str = Body(default="happy"),
    what_happened: str = Body(default=""),
    child_quotes: str = Body(default=""),
    supervisor_issues: str = Body(default=""),
    visit_allowed: bool = Body(default=True),
    reason_denied: str = Body(default=""),
    notes: str = Body(default=""),
    current_user: dict = Depends(get_current_user)
):
    """Log a visitation with your children"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    visit_id = str(uuid.uuid4())
    visit = {
        "_id": visit_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "date": date,
        "time": time,
        "duration": duration,
        "location": location,
        "supervisor": supervisor,
        "child_emotional_state": child_emotional_state,
        "what_happened": what_happened,
        "child_quotes": child_quotes,
        "supervisor_issues": supervisor_issues,
        "visit_allowed": visit_allowed,
        "reason_denied": reason_denied,
        "notes": notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.visitations.insert_one(visit)
    visit["id"] = visit.pop("_id")
    return visit

@app.get("/api/visitation/{case_id}")
async def get_visitations(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all visitation logs for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    visits = await db.visitations.find({"case_id": case_id}).sort("date", -1).to_list(200)
    for v in visits:
        v["id"] = v.pop("_id")
    
    # Calculate stats
    total_visits = len(visits)
    denied_visits = len([v for v in visits if not v.get("visit_allowed", True)])
    total_hours = sum(v.get("duration", 0) for v in visits) / 60
    
    return {
        "visits": visits,
        "stats": {
            "total_visits": total_visits,
            "denied_visits": denied_visits,
            "total_hours": round(total_hours, 1),
            "denial_rate": round((denied_visits / total_visits * 100) if total_visits > 0 else 0, 1)
        }
    }


# ============== COURT HEARINGS & COUNTDOWN ==============

HEARING_TYPES = [
    {"value": "detention", "label": "Detention Hearing (Emergency Removal)", "color": "red", "prep_days": 1},
    {"value": "adjudication", "label": "Adjudication Hearing (Did abuse/neglect occur?)", "color": "orange", "prep_days": 14},
    {"value": "disposition", "label": "Disposition Hearing (What happens next?)", "color": "yellow", "prep_days": 14},
    {"value": "review_6", "label": "6-Month Review Hearing", "color": "blue", "prep_days": 7},
    {"value": "review_12", "label": "12-Month Permanency Hearing", "color": "indigo", "prep_days": 14},
    {"value": "review_18", "label": "18-Month Review", "color": "purple", "prep_days": 14},
    {"value": "termination", "label": "Termination of Parental Rights Trial", "color": "red", "prep_days": 30},
    {"value": "appeal", "label": "Appeal Hearing", "color": "gray", "prep_days": 14},
    {"value": "other", "label": "Other Hearing", "color": "gray", "prep_days": 7}
]

DEFAULT_PREP_CHECKLIST = [
    "Review all case documents",
    "Meet with attorney 3+ days before hearing",
    "Prepare testimony and practice answers",
    "Gather all evidence and certificates",
    "Arrange childcare/transportation",
    "Plan professional outfit",
    "Get good night sleep before hearing",
    "Arrive 30 minutes early",
    "Turn off cell phone"
]

WHAT_TO_BRING = [
    "All service completion certificates",
    "Drug test results",
    "Visitation logs",
    "Communication records",
    "Witness list and contact info",
    "Pen and notepad",
    "Copy of case plan",
    "Evidence photos/documents",
    "Character reference letters"
]

@app.get("/api/court-hearings/types")
async def get_hearing_types():
    """Get all hearing types with preparation info"""
    return {
        "hearing_types": HEARING_TYPES,
        "default_checklist": DEFAULT_PREP_CHECKLIST,
        "what_to_bring": WHAT_TO_BRING
    }

@app.post("/api/court-hearings")
async def create_court_hearing(
    case_id: str = Body(...),
    date: str = Body(...),
    time: str = Body(default="09:00"),
    hearing_type: str = Body(...),
    judge: str = Body(default=""),
    location: str = Body(default=""),
    notes: str = Body(default=""),
    current_user: dict = Depends(get_current_user)
):
    """Create a court hearing with countdown and preparation checklist"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    hearing_id = str(uuid.uuid4())
    hearing = {
        "_id": hearing_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "date": date,
        "time": time,
        "hearing_type": hearing_type,
        "judge": judge,
        "location": location,
        "notes": notes,
        "prep_checklist": [{"id": str(i), "text": item, "completed": False} for i, item in enumerate(DEFAULT_PREP_CHECKLIST)],
        "what_to_bring": WHAT_TO_BRING,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.court_hearings.insert_one(hearing)
    hearing["id"] = hearing.pop("_id")
    
    # Calculate countdown
    hearing_date = datetime.strptime(date, "%Y-%m-%d")
    days_until = (hearing_date - datetime.now()).days
    hearing["days_until"] = max(0, days_until)
    
    return hearing

@app.get("/api/court-hearings/{case_id}")
async def get_court_hearings(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all court hearings for a case with countdowns"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    hearings = await db.court_hearings.find({"case_id": case_id}).sort("date", 1).to_list(50)
    
    for h in hearings:
        h["id"] = h.pop("_id")
        # Calculate countdown
        try:
            hearing_date = datetime.strptime(h["date"], "%Y-%m-%d")
            h["days_until"] = max(0, (hearing_date - datetime.now()).days)
        except:
            h["days_until"] = 0
    
    # Get next upcoming hearing
    upcoming = [h for h in hearings if h["days_until"] > 0]
    next_hearing = upcoming[0] if upcoming else None
    
    return {
        "hearings": hearings,
        "next_hearing": next_hearing
    }

@app.put("/api/court-hearings/{hearing_id}/checklist")
async def update_hearing_checklist(
    hearing_id: str,
    checklist: list = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update hearing preparation checklist"""
    hearing = await db.court_hearings.find_one({"_id": hearing_id, "user_id": current_user["user_id"]})
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    await db.court_hearings.update_one(
        {"_id": hearing_id},
        {"$set": {"prep_checklist": checklist}}
    )
    
    return {"message": "Checklist updated", "checklist": checklist}


# ============== RIGHTS GUIDE ==============

@app.get("/api/rights-guide")
async def get_rights_guide():
    """Get comprehensive rights guide for CPS interactions"""
    return {
        "categories": [
            {
                "title": "Your Constitutional Rights",
                "icon": "shield",
                "color": "blue",
                "rights": [
                    {
                        "title": "4th Amendment - Protection from Unreasonable Search",
                        "description": "You have the right to refuse CPS entry into your home without a warrant, court order, or your consent.",
                        "details": [
                            "You can refuse to let CPS in unless they have a warrant",
                            "Exigent circumstances (immediate danger) is an exception",
                            "If you let them in, you can ask them to leave at any time",
                            "You can limit their access to certain areas",
                            "Anything you show them can be used against you"
                        ],
                        "key_case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)"
                    },
                    {
                        "title": "5th Amendment - Right Against Self-Incrimination",
                        "description": "You have the right to remain silent and not answer questions that might incriminate you.",
                        "details": [
                            "You can refuse to answer questions",
                            "Politely say 'I prefer not to answer without my attorney present'",
                            "Silence cannot be held against you in court",
                            "Don't try to explain or defend yourself without counsel",
                            "Everything you say CAN and WILL be used against you"
                        ],
                        "key_case": "Minnesota v. Murphy, 465 U.S. 420 (1984)"
                    },
                    {
                        "title": "14th Amendment - Due Process Rights",
                        "description": "You have the right to fair legal proceedings before your parental rights can be terminated.",
                        "details": [
                            "Right to notice of allegations and hearings",
                            "Right to present evidence and witnesses",
                            "Right to confront accusers",
                            "Right to appeal decisions",
                            "Government must prove case by clear and convincing evidence"
                        ],
                        "key_case": "Santosky v. Kramer, 455 U.S. 745 (1982)"
                    }
                ]
            },
            {
                "title": "During CPS Investigation",
                "icon": "alert",
                "color": "orange",
                "rights": [
                    {
                        "title": "Right to Legal Representation",
                        "description": "You have the right to an attorney before and during all CPS interactions.",
                        "details": [
                            "Request a court-appointed attorney if you cannot afford one",
                            "Do not sign ANYTHING without attorney review",
                            "You can stop the interview to consult with your attorney",
                            "Bring your attorney to all meetings and interviews",
                            "CPS must stop questioning if you invoke this right"
                        ]
                    },
                    {
                        "title": "Right to Know the Allegations",
                        "description": "CPS must tell you specifically what you are being accused of.",
                        "details": [
                            "Request written allegations and who made them",
                            "They must tell you what evidence they have",
                            "You have right to see investigative reports",
                            "Ask for specifics - dates, incidents, witnesses",
                            "Vague allegations are not sufficient"
                        ]
                    },
                    {
                        "title": "Right to Refuse Interviews & Tests",
                        "description": "You can decline to be interviewed or tested without a court order.",
                        "details": [
                            "You can refuse drug tests without court order",
                            "You can refuse psychological evaluations",
                            "You can refuse to let them interview you",
                            "Children can only be interviewed with your permission (in most states)",
                            "Refusing is NOT admission of guilt"
                        ]
                    }
                ]
            },
            {
                "title": "After Removal or Court Involvement",
                "icon": "check",
                "color": "green",
                "rights": [
                    {
                        "title": "Right to Visitation",
                        "description": "You have the right to visit your children unless a court specifically orders otherwise.",
                        "details": [
                            "Visits can only be denied by court order",
                            "You can request more frequent or longer visits",
                            "Document all visits and any issues",
                            "Report any violations of visitation orders",
                            "Visitation denial can be grounds for complaint"
                        ]
                    },
                    {
                        "title": "Right to Reunification Services",
                        "description": "CPS must make 'reasonable efforts' to reunite your family.",
                        "details": [
                            "CPS must provide services to help you meet case plan goals",
                            "Services must be accessible and appropriate",
                            "Document any services they fail to provide",
                            "Failure to make reasonable efforts is a defense",
                            "This is required by federal law (ASFA)"
                        ],
                        "key_statute": "Adoption and Safe Families Act (ASFA)"
                    },
                    {
                        "title": "Right to Appeal",
                        "description": "You have the right to appeal court decisions you disagree with.",
                        "details": [
                            "Deadlines are strict - usually 30-60 days",
                            "You need an attorney for appeals",
                            "Keep copies of all court orders",
                            "Document all procedural violations",
                            "Appeals can reverse wrongful decisions"
                        ]
                    }
                ]
            }
        ],
        "quick_rights": [
            {
                "question": "Can CPS enter my home without permission?",
                "answer": "NO - CPS needs your consent, a warrant, or exigent circumstances (immediate danger) to enter your home.",
                "legal_basis": "Fourth Amendment, Calabretta v. Floyd (9th Cir. 1999)"
            },
            {
                "question": "Do I have to take a drug test if CPS asks?",
                "answer": "NO (before court order) - CPS cannot force you to drug test without a court order. Refusing may be noted, but you have the right.",
                "legal_basis": "Fourth Amendment, Fifth Amendment"
            },
            {
                "question": "Can CPS interview my child at school without me?",
                "answer": "VARIES BY STATE - Some states allow it, others require parental consent. Check your state law. You can instruct your child's school to contact you first.",
                "legal_basis": "State-specific statutes"
            },
            {
                "question": "What if CPS threatens to take my kids if I don't cooperate?",
                "answer": "This may be coercion. You have rights. Politely assert them and contact an attorney immediately. Document the threat.",
                "legal_basis": "Fourth Amendment, Due Process"
            }
        ]
    }


# ============== EVIDENCE CHECKLIST ==============

@app.get("/api/evidence-checklist")
async def get_evidence_checklist():
    """Get comprehensive evidence checklist for building your case"""
    return {
        "categories": [
            {
                "title": "Documentation & Records",
                "icon": "file-text",
                "items": [
                    "All CPS reports and correspondence",
                    "Court documents and orders",
                    "Case plan and service agreements",
                    "Your notes from all CPS interactions (dates, times, what was said)",
                    "Text messages and emails with CPS",
                    "Any recordings of interactions (if legal in your state)",
                    "Medical records showing child's health",
                    "School records showing attendance and performance",
                    "Therapy or counseling records",
                    "Drug test results (if applicable)"
                ]
            },
            {
                "title": "Character & Parenting Evidence",
                "icon": "heart",
                "items": [
                    "Character reference letters from teachers, doctors, neighbors",
                    "Employment records showing stability",
                    "Certificates from completed parenting classes",
                    "Proof of participation in recommended services",
                    "Religious or community involvement documentation",
                    "Volunteer work or positive activities",
                    "Evidence of bond with your children (cards, drawings, photos)",
                    "Witness statements supporting your parenting"
                ]
            },
            {
                "title": "Home & Living Conditions",
                "icon": "home",
                "items": [
                    "Photos of home showing clean, safe environment",
                    "Lease or mortgage showing stable housing",
                    "Utility bills showing services are on",
                    "Photos of children's rooms and beds",
                    "Photos of food in refrigerator/pantry",
                    "Home safety measures (smoke detectors, locks, etc.)",
                    "Documentation of any home improvements made"
                ]
            },
            {
                "title": "Photos & Video Evidence",
                "icon": "camera",
                "items": [
                    "Photos of children looking healthy and happy",
                    "Photos from family activities and outings",
                    "Photos showing child's belongings and living space",
                    "Before/after photos if CPS claims were about home conditions",
                    "Photos of any alleged injuries (with timestamps)",
                    "Video of positive parent-child interactions",
                    "Photos showing children in your care over time"
                ]
            },
            {
                "title": "Witness Information",
                "icon": "users",
                "items": [
                    "List of potential witnesses with contact information",
                    "People who have observed you parenting",
                    "People who can testify to false allegations",
                    "Professionals who have worked with your family",
                    "Family members who can support your case",
                    "Neighbors who know your family",
                    "Teachers, coaches, or mentors of your children"
                ]
            },
            {
                "title": "Evidence Contradicting CPS Claims",
                "icon": "file-check",
                "items": [
                    "Documents showing CPS statements are false",
                    "Timeline showing contradictions in their reports",
                    "Receipts or records disproving allegations",
                    "Alibi evidence (if accused of something you didn't do)",
                    "Expert reports contradicting CPS conclusions",
                    "Evidence of bias by investigator",
                    "Proof of services you were denied",
                    "Documentation of procedural violations"
                ]
            }
        ]
    }


@app.post("/api/evidence-checklist/{case_id}")
async def save_evidence_checklist(
    case_id: str,
    checked_items: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Save evidence checklist progress for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    await db.evidence_checklists.update_one(
        {"case_id": case_id, "user_id": current_user["user_id"]},
        {"$set": {"checked_items": checked_items, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Checklist saved", "checked_items": checked_items}

@app.get("/api/evidence-checklist/{case_id}")
async def get_case_evidence_checklist(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get saved evidence checklist for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    checklist = await db.evidence_checklists.find_one({"case_id": case_id, "user_id": current_user["user_id"]})
    
    return {"checked_items": checklist.get("checked_items", {}) if checklist else {}}


# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "CPS Punisher API",
        "version": "4.0.0",
        "features": "150+ Components | Section 1983 | Podcast Creator | Deep Legal AI",
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
        "features": 150
    }


# ============== SECTION 1983 CIVIL RIGHTS LAWSUIT GENERATOR ==============

SECTION_1983_SYSTEM_PROMPT = """You are THE CPS PUNISHER's Section 1983 Civil Rights Lawsuit Expert.

You are an expert in 42 U.S.C. § 1983 civil rights litigation against Child Protective Services, 
caseworkers, supervisors, and government officials who violate constitutional rights.

Your expertise includes:
- Fourth Amendment (unreasonable searches/seizures, warrantless home entries)
- Fourteenth Amendment (due process, equal protection, family integrity)
- Fifth Amendment (self-incrimination, Miranda rights in CPS contexts)
- First Amendment (freedom of religion, speech)
- Qualified Immunity analysis and how to defeat it
- Monell liability (municipal liability for policies/customs)
- Individual capacity vs official capacity suits
- Conspiracy claims under 42 U.S.C. § 1985
- State law claims to pair with Section 1983
- Damages calculations (compensatory, punitive, nominal)
- Attorney's fees under 42 U.S.C. § 1988

Key Supreme Court cases you know intimately:
- Santosky v. Kramer (clear and convincing evidence standard)
- Troxel v. Granville (parental rights as fundamental)
- Stanley v. Illinois (due process in family matters)
- Gates v. Texas DHS (emergency removal standards)
- Duchesne v. Sugarman (liability for wrongful removal)

You generate complaints that are:
1. Factually detailed and compelling
2. Legally sound with proper citations
3. Structured to survive a motion to dismiss
4. Designed to defeat qualified immunity
5. Include all required elements for each cause of action"""

@app.post("/api/section-1983/generate")
async def generate_section_1983_complaint(
    case_id: str = Body(...),
    defendants: list = Body(default=[]),
    constitutional_violations: list = Body(default=[]),
    relief_sought: list = Body(default=[]),
    include_monell: bool = Body(default=True),
    include_conspiracy: bool = Body(default=False),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a comprehensive Section 1983 Civil Rights Complaint.
    This is THE MOST POWERFUL feature - turns CPS violations into federal lawsuits.
    """
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

    response = await chat.send_message(UserMessage(text=prompt))
    
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


@app.get("/api/section-1983/templates")
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


@app.get("/api/section-1983/{case_id}")
async def get_section_1983_complaints(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all Section 1983 complaints for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    complaints = await db.section_1983_complaints.find(
        {"case_id": case_id},
        {"_id": 1, "defendants": 1, "constitutional_violations": 1, "generated_at": 1}
    ).to_list(50)
    
    for c in complaints:
        c["id"] = c.pop("_id")
    
    return {"complaints": complaints}


# ============== PODCAST CREATOR ==============

@app.post("/api/podcast/generate-script")
async def generate_podcast_script(
    case_id: str = Body(None),
    topic: str = Body(...),
    episode_type: str = Body(default="educational"),
    duration_minutes: int = Body(default=15),
    include_case_details: bool = Body(default=False),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a podcast script about CPS defense, legal rights, or case analysis.
    Episode types: educational, case_analysis, interview_style, news_update, legal_breakdown
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case_context = ""
    if case_id and include_case_details:
        case = await get_case_with_ownership(case_id, current_user["user_id"])
        violations = await db.violations.find({"case_id": case_id}).to_list(20)
        case_context = f"""
CASE CONTEXT (anonymize in script):
- State: {case.get('state', 'Unknown')}
- Case Type: CPS Investigation/Dependency
- Violations Found: {len(violations)}
- Key Issues: {', '.join([v.get('violation_type', '') for v in violations[:5]])}
"""
    
    episode_formats = {
        "educational": "Educational deep-dive explaining legal concepts to parents",
        "case_analysis": "Analysis of legal strategies based on a real case scenario",
        "interview_style": "Host interviewing an expert (write both parts)",
        "news_update": "News-style update on CPS law changes and court decisions",
        "legal_breakdown": "Step-by-step breakdown of a legal process or procedure"
    }
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"podcast-{uuid.uuid4().hex[:8]}",
        system_message="""You are a podcast script writer for THE CPS PUNISHER - 
a show that educates parents about their rights when dealing with Child Protective Services.

Your scripts are:
- Engaging and conversational (not dry legal lecture)
- Legally accurate with proper terminology
- Empowering to parents (action-oriented advice)
- Include specific legal citations when relevant
- Written for audio (speaker cues, pauses, emphasis)

Format scripts with:
[INTRO MUSIC]
HOST: dialogue
[SOUND EFFECT if needed]
[OUTRO]

Make it sound like a professional legal podcast that could compete with top legal shows."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Create a {duration_minutes}-minute podcast script for THE CPS PUNISHER podcast.

EPISODE TOPIC: {topic}

EPISODE FORMAT: {episode_formats.get(episode_type, episode_formats['educational'])}

TARGET AUDIENCE: Parents facing CPS investigations, family advocates, attorneys

{case_context}

REQUIREMENTS:
1. Opening hook that grabs attention (first 30 seconds crucial)
2. Clear structure with 3-4 main points
3. Specific legal citations and case law references
4. Actionable takeaways parents can use
5. Call to action at end
6. Appropriate length for {duration_minutes} minutes (~150 words per minute)

Include timestamps: [00:00], [02:30], etc.

Make this script POWERFUL, INFORMATIVE, and ENGAGING.
Parents listening should feel empowered and educated."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save podcast script
    script_id = str(uuid.uuid4())
    script_doc = {
        "_id": script_id,
        "user_id": current_user["user_id"],
        "case_id": case_id,
        "topic": topic,
        "episode_type": episode_type,
        "duration_minutes": duration_minutes,
        "script": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.podcast_scripts.insert_one(script_doc)
    
    return {
        "id": script_id,
        "script": response,
        "topic": topic,
        "episode_type": episode_type,
        "duration_minutes": duration_minutes,
        "word_count": len(response.split()),
        "created_at": script_doc["created_at"]
    }


@app.get("/api/podcast/topics")
async def get_podcast_topics():
    """Get suggested podcast topics"""
    return {
        "categories": [
            {
                "name": "Constitutional Rights",
                "topics": [
                    "Fourth Amendment: When CPS Can (and Can't) Enter Your Home",
                    "Understanding Due Process in CPS Cases",
                    "Your Fifth Amendment Rights During CPS Interviews",
                    "Religious Freedom and CPS: Know Your First Amendment Rights"
                ]
            },
            {
                "name": "CPS Procedures",
                "topics": [
                    "What Happens During a CPS Investigation: Step by Step",
                    "Safety Plans: Your Rights and How to Negotiate",
                    "Understanding the Adjudication Hearing",
                    "The Permanency Planning Process Explained"
                ]
            },
            {
                "name": "Legal Strategy",
                "topics": [
                    "How to File a Section 1983 Lawsuit Against CPS",
                    "Defeating Qualified Immunity: Strategies That Work",
                    "Discovery in CPS Cases: Getting the Records You Need",
                    "Appeals in Dependency Cases: Deadlines and Strategies"
                ]
            },
            {
                "name": "Case Law Deep Dives",
                "topics": [
                    "Santosky v. Kramer: The Case That Changed CPS Forever",
                    "Troxel v. Granville: Parental Rights as Fundamental",
                    "Recent Circuit Court Victories Against CPS",
                    "State Supreme Court Cases Every Parent Should Know"
                ]
            },
            {
                "name": "Practical Defense",
                "topics": [
                    "Documenting Everything: Building Your Defense from Day One",
                    "Working with Court-Appointed Attorneys Effectively",
                    "How to Testify in Your Own Case",
                    "Dealing with Biased Caseworkers"
                ]
            }
        ]
    }


@app.get("/api/podcast/scripts")
async def get_user_podcast_scripts(current_user: dict = Depends(get_current_user)):
    """Get all podcast scripts for the user"""
    scripts = await db.podcast_scripts.find(
        {"user_id": current_user["user_id"]},
        {"_id": 1, "topic": 1, "episode_type": 1, "duration_minutes": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(50)
    
    for s in scripts:
        s["id"] = s.pop("_id")
    
    return {"scripts": scripts}


# ============== DEEP CASE LAW ANALYSIS ==============

@app.post("/api/case-law/analyze")
async def analyze_case_law(
    case_id: str = Body(...),
    focus_areas: list = Body(default=["fourth_amendment", "due_process"]),
    jurisdiction: str = Body(default="federal"),
    current_user: dict = Depends(get_current_user)
):
    """
    Deep AI analysis of relevant case law for your specific situation.
    Finds precedents that support your defense.
    """
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


@app.post("/api/ai/expert-analysis")
async def expert_legal_analysis(
    case_id: str = Body(...),
    question: str = Body(...),
    analysis_type: str = Body(default="comprehensive"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get expert-level legal analysis on any CPS question.
    This is SMARTER than any other legal AI for CPS cases.
    """
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

@app.post("/api/courtlistener/deep-search")
async def deep_case_law_search(
    query: str = Body(...),
    court_type: str = Body(default="all"),
    date_range: str = Body(default="all"),
    case_type: str = Body(default="cps"),
    current_user: dict = Depends(get_current_user)
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


# ============== ADVANCED LEGAL STRATEGY COMPONENTS ==============
# LegalStrategyBuilder, ArgumentGenerator, EvidenceArgumentMapper, LegalPrecedentFinder

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


@app.post("/api/strategy-builder/build")
async def build_legal_strategy(
    request: StrategyBuildRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    LEGAL STRATEGY BUILDER - Builds comprehensive defense strategy
    Analyzes case data and generates a complete legal roadmap
    """
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

Build a strategy that a $500/hour family law attorney would charge thousands to create."""

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


@app.post("/api/argument-generator/generate")
async def generate_legal_arguments(
    request: LegalArgumentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    ARGUMENT GENERATOR - Generates specific legal arguments from evidence and violations
    Creates court-ready argument paragraphs with citations
    """
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
Argument Type: {request.argument_type.upper()} - {argument_types.get(request.argument_type)}"""

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


@app.post("/api/evidence-mapper/map")
async def map_evidence_to_precedents(
    request: EvidenceMapping,
    current_user: dict = Depends(get_current_user)
):
    """
    EVIDENCE ARGUMENT MAPPER - Maps evidence to legal precedents and arguments
    Shows how specific evidence supports legal arguments
    """
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
4. Draft how to use it in court"""

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


@app.post("/api/precedent-finder/search")
async def find_legal_precedents(
    request: PrecedentSearchRequest,
    current_user: dict = Depends(get_current_user)
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

Find the most relevant precedents for the given violation type and explain how each applies."""

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

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "violation_type": request.violation_type,
        "precedent_analysis": response,
        "supreme_court_cases": supreme_court_relevant[:5],
        "circuit_court_cases": circuit_relevant[:5],
        "qualified_immunity_analysis": immunity,
        "internal_case_law": internal_cases
    }


@app.get("/api/strategy-builder/saved/{case_id}")
async def get_saved_strategies(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all saved strategies for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    strategies = []
    async for s in db.generated_strategies.find({"case_id": case_id}).sort("created_at", -1):
        s["id"] = s.pop("_id")
        strategies.append(s)
    
    return {"strategies": strategies}


@app.get("/api/argument-generator/saved/{case_id}")
async def get_saved_arguments(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get all saved arguments for a case"""
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    arguments = []
    async for a in db.generated_arguments.find({"case_id": case_id}).sort("created_at", -1):
        a["id"] = a.pop("_id")
        arguments.append(a)
    
    return {"arguments": arguments}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
