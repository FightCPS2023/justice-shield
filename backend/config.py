"""
CPS Punisher - Configuration Module
Centralized configuration for the application
"""
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

# API Keys
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")
COURTLISTENER_API_KEY = os.environ.get("COURTLISTENER_API_KEY", "")
FULL_ACCESS_PASSCODE = os.environ.get("FULL_ACCESS_PASSCODE", "PUNISHER2024")

# JWT Configuration
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Stripe pricing tiers
TIER_PRICING = {
    "essential": {"monthly": 19.00, "annual": 190.00, "name": "Essential"},
    "professional": {"monthly": 99.00, "annual": 990.00, "name": "Professional"},
    "attorney": {"monthly": 299.00, "annual": 2990.00, "name": "Attorney Suite"},
    "enterprise": {"monthly": 999.00, "annual": 9990.00, "name": "Enterprise"},
}

# Tier hierarchy: higher index = more access
TIER_LEVELS = {
    "free": 0,
    "essential": 1,
    "professional": 2,
    "attorney": 3,
    "enterprise": 4,
}

TIER_FEATURES = {
    "free": {
        "docs_per_month": 1,
        "ai_credits": 5,
        "cases_max": 1,
        "features": [
            "1 Active Case",
            "5 AI Credits",
            "1 Document Upload/Month",
            "Basic AI Chat",
            "Law Library Access (Limited)"
        ]
    },
    "essential": {
        "docs_per_month": 25,
        "ai_credits": 100,
        "cases_max": -1,
        "features": [
            "Unlimited Cases",
            "100 AI Credits/Month",
            "25 Document Uploads/Month",
            "AI Chat & Defense Strategy",
            "Smart Document Generator",
            "Legal Notepad",
            "50-State Law Library",
            "Document Analysis (Basic)"
        ]
    },
    "professional": {
        "docs_per_month": -1,
        "ai_credits": 500,
        "cases_max": -1,
        "features": [
            "Everything in Essential +",
            "500 AI Credits/Month",
            "Unlimited Document Uploads",
            "Smart Legal Research Engine",
            "Background Check / Person Lookup",
            "Court Records Search",
            "Judge Research & Watch",
            "ADA Accommodations Tool",
            "Advanced Document Analysis",
            "Fraud & Perjury Detection",
            "Constitutional Violation Finder",
            "Section 1983 Research"
        ]
    },
    "attorney": {
        "docs_per_month": -1,
        "ai_credits": 2000,
        "cases_max": -1,
        "features": [
            "Everything in Professional +",
            "2000 AI Credits/Month",
            "Case Preparation Kit (PDF Export)",
            "Criminal Case Defense Prep",
            "Multi-Client Management",
            "Priority AI Processing",
            "Expert Witness Finder",
            "Section 1983 Lawsuit Builder",
            "Federal Court Filing Guide",
            "API Access (Coming Soon)"
        ]
    },
    "enterprise": {
        "docs_per_month": -1,
        "ai_credits": -1,
        "cases_max": -1,
        "features": [
            "Everything in Attorney +",
            "Unlimited AI Credits",
            "White-Label Options",
            "Dedicated Support",
            "Custom Integrations",
            "Team Management",
            "Analytics Dashboard",
            "Training & Onboarding"
        ]
    },
}

# Credit packages for a la carte purchases
CREDIT_PACKAGES = [
    {"id": "credits_10", "credits": 10, "price": 4.99, "label": "10 Credits", "popular": False},
    {"id": "credits_50", "credits": 50, "price": 19.99, "label": "50 Credits", "popular": True},
    {"id": "credits_100", "credits": 100, "price": 34.99, "label": "100 Credits", "popular": False},
    {"id": "credits_250", "credits": 250, "price": 74.99, "label": "250 Credits", "popular": False},
]

# Credit cost to use features above your tier
FEATURE_CREDIT_COSTS = {
    "ai_chat": 1,
    "doc_upload": 2,
    "doc_generate": 3,
    "defense_strategy": 3,
    "incident_analyzer": 2,
    "expert_ai": 5,
    "strategy_builder": 5,
    "argument_generator": 5,
    "evidence_mapper": 3,
    "precedent_finder": 3,
    "ada_compliance": 3,
    "case_law": 3,
    "law_library": 1,
    "judge_research": 2,
    "legal_research": 3,
    "section_1983": 10,
    "courtlistener": 3,
    "case_prep_kit": 10,
    "podcast": 5,
    "criminal_case": 3,
    "person_lookup": 5,
    "court_records_search": 3,
    "forensic_analysis": 5,
}

# Admin emails
ADMIN_EMAILS = [
    "admin@thecpspunisher.com",
    "owner@thecpspunisher.com",
    "cpsvhuntingjustice@gmail.com",
]

# Full access passcodes
VALID_PASSCODES = [
    "PUNISHER2024",
    "CPS-WARRIOR-001",
    "CPS-WARRIOR-002",
    "CPS-WARRIOR-003",
    "CPS-WARRIOR-004",
    "CPS-WARRIOR-005",
    "FAMILY-DEFENDER-01",
    "FAMILY-DEFENDER-02",
    "FAMILY-DEFENDER-03",
    "FAMILY-DEFENDER-04",
    "FAMILY-DEFENDER-05",
    "LEGAL-SHIELD-001",
    "LEGAL-SHIELD-002",
    "LEGAL-SHIELD-003",
    "LEGAL-SHIELD-004",
    "LEGAL-SHIELD-005",
    "JUSTICE-KEY-2024-A",
    "JUSTICE-KEY-2024-B",
    "JUSTICE-KEY-2024-C",
    "JUSTICE-KEY-2024-D",
]

# Upload directory
UPLOAD_DIR = "/tmp/cps_uploads"
WHISPER_MAX_SIZE = 25 * 1024 * 1024
