"""
CPS Punisher - Pydantic Schemas
All request/response models for the API
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============== AUTH MODELS ==============

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

class PasscodeRequest(BaseModel):
    passcode: str


# ============== CASE MODELS ==============

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


# ============== DOCUMENT MODELS ==============

class DocumentCreate(BaseModel):
    case_id: str
    title: str
    content: str
    document_type: Optional[str] = "general"


# ============== VIOLATION MODELS ==============

class ViolationCreate(BaseModel):
    case_id: str
    violation_type: str
    description: str
    date_occurred: Optional[str] = None
    severity: Optional[str] = "medium"
    evidence_notes: Optional[str] = None


# ============== TIMELINE MODELS ==============

class TimelineEventCreate(BaseModel):
    case_id: str
    title: str
    event_date: str
    event_type: Optional[str] = "general"
    description: Optional[str] = None


# ============== STRATEGY MODELS ==============

class StrategyCreate(BaseModel):
    case_id: str
    title: str
    content: str
    strategy_type: Optional[str] = "general"


# ============== EVIDENCE MODELS ==============

class EvidenceItemCreate(BaseModel):
    case_id: str
    title: str
    description: str
    evidence_type: Optional[str] = "document"
    date_collected: Optional[str] = None
    source: Optional[str] = None


# ============== COMMUNICATION MODELS ==============

class CommunicationLogCreate(BaseModel):
    case_id: str
    communication_type: str
    contact_name: str
    date: str
    summary: str
    follow_up_needed: Optional[bool] = False


# ============== SERVICE MODELS ==============

class ServiceRecordCreate(BaseModel):
    case_id: str
    service_type: str
    provider: str
    start_date: str
    status: Optional[str] = "in_progress"
    notes: Optional[str] = None


# ============== COURT FILING MODELS ==============

class CourtFilingCreate(BaseModel):
    case_id: str
    filing_type: str
    title: str
    filed_date: str
    content: Optional[str] = None
    status: Optional[str] = "filed"


# ============== CRIMINAL CASE MODELS ==============

class CriminalCaseCreate(BaseModel):
    case_id: str
    charges: List[str]
    court: str
    status: str
    notes: Optional[str] = None


# ============== JUDGE RESEARCH MODELS ==============

class JudgeResearchCreate(BaseModel):
    case_id: str
    judge_name: str
    court: str
    known_rulings: Optional[List[str]] = []
    tendencies: Optional[str] = None
    notes: Optional[str] = None


# ============== CALENDAR MODELS ==============

class CalendarEventCreate(BaseModel):
    title: str
    event_type: str
    start_datetime: str
    end_datetime: Optional[str] = None
    description: Optional[str] = None
    case_id: Optional[str] = None
    location: Optional[str] = None
    reminder: Optional[bool] = True


# ============== FORUM MODELS ==============

class ForumPostCreate(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[List[str]] = []


# ============== NOTEPAD MODELS ==============

class NotepadEntryCreate(BaseModel):
    case_id: Optional[str] = None
    title: str
    content: str
    category: str = "general"
    state: Optional[str] = None
    source_type: Optional[str] = None
    source_reference: Optional[str] = None
    tags: Optional[List[str]] = []

class NotepadEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None


# ============== CHAT MODELS ==============

class ChatMessage(BaseModel):
    message: str
    case_id: Optional[str] = None


# ============== PAYMENT MODELS ==============

class CheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str = "monthly"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


# ============== AI STRATEGY MODELS ==============

class StrategyBuildRequest(BaseModel):
    case_id: str
    goal: str
    aggression_level: str = "moderate"
    violations: Optional[List[str]] = []
    evidence_summary: Optional[str] = None
    timeline_summary: Optional[str] = None

class ArgumentGenerateRequest(BaseModel):
    case_id: str
    argument_type: str
    violation: Optional[str] = None
    facts: Optional[str] = None

class EvidenceMapRequest(BaseModel):
    case_id: str
    evidence_items: List[Dict[str, str]]
    violations: Optional[List[str]] = []

class PrecedentSearchRequest(BaseModel):
    case_id: str
    search_query: str
    jurisdiction: Optional[str] = None
    issue_type: Optional[str] = None
