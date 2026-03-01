"""
CPS Punisher - Database Module
MongoDB connection and database instance management
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, DB_NAME

# Database client - initialized on startup
client: AsyncIOMotorClient = None
db = None

# Collection indexes configuration
COLLECTION_INDEXES = {
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

async def init_db():
    """Initialize database connection and create indexes"""
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    for collection, indexes in COLLECTION_INDEXES.items():
        for field, unique in indexes:
            await db[collection].create_index(field, unique=unique)
    
    return db

async def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()

def get_db():
    """Get database instance"""
    return db
