"""
CPS Punisher - Configuration Module
Centralized configuration for the application
"""
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cps_punisher")

# API Keys
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")
COURTLISTENER_API_KEY = os.environ.get("COURTLISTENER_API_KEY", "")
FULL_ACCESS_PASSCODE = os.environ.get("FULL_ACCESS_PASSCODE", "PUNISHER2024")

# JWT Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "cps-punisher-secret-key-2024-secure-random-string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Stripe pricing tiers
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
