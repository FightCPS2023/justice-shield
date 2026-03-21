"""
CPS Punisher - Credit & Tier Utility Functions
"""
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import Depends, HTTPException

from config import TIER_LEVELS, TIER_FEATURES, FEATURE_CREDIT_COSTS
from database import get_db
from auth import get_current_user


async def get_user_tier(user_id: str) -> str:
    db = get_db()
    user = await db.users.find_one({"_id": user_id}, {"tier": 1})
    return user.get("tier", "free") if user else "free"


def check_tier_access(user_tier: str, required_tier: str) -> bool:
    return TIER_LEVELS.get(user_tier, 0) >= TIER_LEVELS.get(required_tier, 0)


def require_tier(min_tier: str, feature_key: str = ""):
    """FastAPI dependency factory: enforces minimum tier OR allows credit bypass"""
    async def _check(current_user: dict = Depends(get_current_user)):
        db = get_db()
        user_tier = await get_user_tier(current_user["user_id"])
        current_user["tier"] = user_tier

        if check_tier_access(user_tier, min_tier):
            return current_user

        credit_cost = FEATURE_CREDIT_COSTS.get(feature_key, 0)
        if credit_cost > 0:
            user = await db.users.find_one({"_id": current_user["user_id"]}, {"purchased_credits": 1})
            purchased = user.get("purchased_credits", 0) if user else 0
            if purchased >= credit_cost:
                await spend_purchased_credits(current_user["user_id"], credit_cost, feature_key)
                current_user["credits_spent"] = credit_cost
                return current_user

        tier_name = min_tier.replace("_", " ").title()
        credit_msg = f" or {credit_cost} credits" if credit_cost > 0 else ""
        raise HTTPException(
            status_code=403,
            detail=f"This feature requires the {tier_name} plan{credit_msg}. Upgrade or purchase credits."
        )
    return _check


async def check_ai_credits(user_id: str, user_tier: str) -> bool:
    db = get_db()
    tier_limits = TIER_FEATURES.get(user_tier, TIER_FEATURES["free"])
    max_credits = tier_limits["ai_credits"]
    if max_credits == -1:
        return True
    user = await db.users.find_one({"_id": user_id}, {"ai_credits_used": 1, "credits_reset_at": 1, "purchased_credits": 1})
    credits_used = user.get("ai_credits_used", 0)
    purchased = user.get("purchased_credits", 0)
    reset_at = user.get("credits_reset_at")
    if reset_at:
        reset_date = datetime.fromisoformat(reset_at) if isinstance(reset_at, str) else reset_at
        if datetime.now(timezone.utc) - reset_date > timedelta(days=30):
            await db.users.update_one({"_id": user_id}, {"$set": {"ai_credits_used": 0, "credits_reset_at": datetime.now(timezone.utc).isoformat()}})
            return True
    if credits_used < max_credits:
        return True
    if purchased > 0:
        return True
    return False


async def increment_ai_credits(user_id: str):
    db = get_db()
    user = await db.users.find_one({"_id": user_id}, {"ai_credits_used": 1, "tier": 1, "purchased_credits": 1})
    user_tier = user.get("tier", "free") if user else "free"
    tier_limits = TIER_FEATURES.get(user_tier, TIER_FEATURES["free"])
    max_credits = tier_limits["ai_credits"]
    credits_used = user.get("ai_credits_used", 0) if user else 0

    if max_credits == -1 or credits_used < max_credits:
        await db.users.update_one(
            {"_id": user_id},
            {"$inc": {"ai_credits_used": 1}, "$setOnInsert": {"credits_reset_at": datetime.now(timezone.utc).isoformat()}},
            upsert=False
        )
    else:
        await db.users.update_one(
            {"_id": user_id},
            {"$inc": {"purchased_credits": -1}}
        )


async def spend_purchased_credits(user_id: str, amount: int, feature: str) -> bool:
    db = get_db()
    user = await db.users.find_one({"_id": user_id}, {"purchased_credits": 1})
    purchased = user.get("purchased_credits", 0) if user else 0
    if purchased < amount:
        return False
    await db.users.update_one(
        {"_id": user_id},
        {"$inc": {"purchased_credits": -amount}}
    )
    await db.credit_transactions.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "feature": feature,
        "credits_spent": amount,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return True


async def check_doc_upload_limit(user_id: str, user_tier: str) -> bool:
    db = get_db()
    tier_limits = TIER_FEATURES.get(user_tier, TIER_FEATURES["free"])
    max_docs = tier_limits["docs_per_month"]
    if max_docs == -1:
        return True
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    count = await db.documents.count_documents({
        "user_id": user_id,
        "source": "upload",
        "created_at": {"$gte": month_start}
    })
    return count < max_docs


async def check_case_limit(user_id: str, user_tier: str) -> bool:
    db = get_db()
    tier_limits = TIER_FEATURES.get(user_tier, TIER_FEATURES["free"])
    max_cases = tier_limits["cases_max"]
    if max_cases == -1:
        return True
    count = await db.cases.count_documents({"user_id": user_id})
    return count < max_cases


async def get_case_with_ownership(case_id: str, user_id: str):
    db = get_db()
    case = await db.cases.find_one({"_id": case_id, "user_id": user_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


async def save_ai_response_to_case(
    case_id: str,
    user_id: str,
    feature_type: str,
    prompt: str,
    response: str,
    metadata: dict = None
):
    if not case_id:
        return None
    db = get_db()
    note_id = str(uuid.uuid4())
    ai_note = {
        "_id": note_id,
        "case_id": case_id,
        "user_id": user_id,
        "feature_type": feature_type,
        "prompt": prompt[:2000] if prompt else "",
        "response": response,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ai_case_notes.insert_one(ai_note)
    return note_id


async def save_case_memory(
    case_id: str,
    user_id: str,
    title: str,
    content: str,
    tags: list = None,
    source: str = "auto",
    metadata: dict = None
):
    if not case_id or not content:
        return None
    db = get_db()
    memory_id = str(uuid.uuid4())
    memory_entry = {
        "_id": memory_id,
        "case_id": case_id,
        "user_id": user_id,
        "title": title or "Case Memory",
        "content": content,
        "tags": tags or [],
        "source": source,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.case_memory.insert_one(memory_entry)
    return memory_id


async def get_case_memory_context(case_id: str, user_id: str, limit: int = 25) -> str:
    if not case_id:
        return ""
    db = get_db()
    memories = []
    async for entry in db.case_memory.find({"case_id": case_id, "user_id": user_id}).sort("created_at", -1).limit(limit):
        title = entry.get("title") or "Memory"
        content = entry.get("content") or ""
        tags = entry.get("tags", [])
        tag_text = f" [tags: {', '.join(tags)}]" if tags else ""
        memories.append(f"- {title}: {content}{tag_text}")
    if not memories:
        return ""
    return "CASE MEMORY (facts collected so far):\n" + "\n".join(memories)
