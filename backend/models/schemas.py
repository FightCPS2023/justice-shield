"""
CPS Punisher - All Pydantic Schemas (matching server.py models exactly)
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any


# ============== AUTH MODELS ==============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    state: Optional[str] = None
    accepted_terms: bool = False
    accepted_privacy: bool = False

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
    accepted_terms: Optional[bool] = None
    accepted_privacy: Optional[bool] = None
    accepted_at: Optional[str] = None

class PasscodeRequest(BaseModel):
    passcode: str


# ============== ADMIN MODELS ==============
class PasscodeToggleRequest(BaseModel):
    passcode: str
    active: bool

class UserTierUpdateRequest(BaseModel):
    user_id: str
    tier: str

class AdvocateApplication(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    photo_url: Optional[str] = None
    bio: str
    experience_years: int
    specialties: List[str]
    state: str
    city: Optional[str] = None
    organization: Optional[str] = None
    certifications: Optional[List[str]] = []
    languages: Optional[List[str]] = ["English"]

class AdvocateStatusUpdate(BaseModel):
    advocate_id: str
    status: str


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
    doc_type: str
    date: Optional[str] = None

class DocumentUpload(BaseModel):
    case_id: str
    title: str
    content: str
    doc_type: str
    source: str = "upload"


# ============== VIOLATION MODELS ==============
class ViolationCreate(BaseModel):
    case_id: str
    violation_type: str
    description: str
    severity: str = "medium"
    date: Optional[str] = None
    statute_reference: Optional[str] = None
    constitutional_basis: Optional[str] = None


# ============== TIMELINE MODELS ==============
class TimelineEventCreate(BaseModel):
    case_id: str
    title: str
    description: str
    date: str
    event_type: str = "general"
    importance: str = "medium"


# ============== STRATEGY MODELS ==============
class StrategyCreate(BaseModel):
    case_id: str
    title: str
    description: str
    priority: str = "medium"
    legal_basis: Optional[str] = None
    case_law_support: Optional[List[str]] = []


# ============== EVIDENCE MODELS ==============
class EvidenceItemCreate(BaseModel):
    case_id: str
    title: str
    description: str
    evidence_type: str
    date_obtained: Optional[str] = None
    source: Optional[str] = None
    supports_defense: bool = True


# ============== COMMUNICATION MODELS ==============
class CommunicationLogCreate(BaseModel):
    case_id: str
    contact_type: str
    contact_with: str
    date: str
    summary: str
    favorable: Optional[bool] = None


# ============== SERVICE MODELS ==============
class ServiceRecordCreate(BaseModel):
    case_id: str
    service_type: str
    provider: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "in_progress"
    notes: Optional[str] = None


# ============== COURT FILING MODELS ==============
class CourtFilingCreate(BaseModel):
    case_id: str
    filing_type: str
    title: str
    date_filed: Optional[str] = None
    status: str = "pending"
    content: Optional[str] = None


# ============== CRIMINAL CASE MODELS ==============
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


# ============== JUDGE RESEARCH MODELS ==============
class JudgeResearchCreate(BaseModel):
    case_id: str
    judge_name: str
    court: Optional[str] = None
    research_notes: Optional[str] = None
    known_rulings: Optional[List[str]] = []
    judicial_philosophy: Optional[str] = None


# ============== CALENDAR MODELS ==============
class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    event_type: str = "general"
    case_id: Optional[str] = None
    reminder_days: Optional[int] = 1


# ============== CHAT MODELS ==============
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    case_id: Optional[str] = None
    context_type: Optional[str] = "general"


# ============== AI ANALYSIS MODELS ==============
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


# ============== PAYMENT MODELS ==============
class CreditPurchaseRequest(BaseModel):
    package_id: str
    origin_url: str

class CheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str = "monthly"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


# ============== STRATEGY BUILDER MODELS ==============
class LegalArgumentRequest(BaseModel):
    case_id: str
    argument_type: str
    key_facts: Optional[str] = None
    target_violation: Optional[str] = None

class EvidenceMapping(BaseModel):
    case_id: str
    evidence_description: str
    related_violations: Optional[List[str]] = []

class PrecedentSearchRequest(BaseModel):
    case_id: str
    legal_issue: str
    jurisdiction: Optional[str] = None
    search_scope: Optional[str] = "federal_and_state"

class StrategyBuildRequest(BaseModel):
    case_id: str
    goal: str
    aggression_level: str = "moderate"
    violations: Optional[List[str]] = []
    evidence_summary: Optional[str] = None
    timeline_summary: Optional[str] = None


# ============== COMMUNITY MODELS ==============
class VisitationCreate(BaseModel):
    case_id: str
    visit_date: str
    visit_time: Optional[str] = None
    location: Optional[str] = None
    children_present: Optional[List[str]] = []
    supervisor_name: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    concerns: Optional[str] = None
    positive_observations: Optional[str] = None

class CourtHearingCreate(BaseModel):
    case_id: str
    hearing_type: str
    hearing_date: str
    hearing_time: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_steps: Optional[str] = None
