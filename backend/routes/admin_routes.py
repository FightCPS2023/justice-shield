"""Admin routes - user management, passcodes, advocates"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from database import get_db
from auth import get_current_user
from config import VALID_PASSCODES, ADMIN_EMAILS


router = APIRouter()

# ============== ADMIN SYSTEM ==============
# Local override for admin emails (kept for backward compatibility)
LOCAL_ADMIN_EMAILS = [
    "admin@thecpspunisher.com",
    "owner@thecpspunisher.com",
    "cpsvhuntingjustice@gmail.com",  # Primary admin
]

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Dependency to check if user is admin"""
    db = get_db()
    user = await db.users.find_one({"$or": [{"_id": current_user["user_id"]}, {"user_id": current_user["user_id"]}]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_admin = (
        user.get("email") in ADMIN_EMAILS or 
        user.get("email") in LOCAL_ADMIN_EMAILS or
        user.get("is_admin", False) or
        user.get("role") == "admin"
    )
    
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return current_user

# --- Admin: Passcode Management ---
@router.get("/api/admin/passcodes")
async def get_all_passcodes(admin: dict = Depends(get_admin_user)):
    """Get all passcodes and their status"""
    db = get_db()
    # Get redemption counts for each passcode
    redemption_counts = {}
    async for redemption in db.passcode_redemptions.aggregate([
        {"$group": {"_id": "$passcode_used", "count": {"$sum": 1}}}
    ]):
        redemption_counts[redemption["_id"]] = redemption["count"]
    
    # Get disabled passcodes
    disabled_doc = await db.admin_settings.find_one({"_id": "disabled_passcodes"})
    disabled_passcodes = disabled_doc.get("passcodes", []) if disabled_doc else []
    
    passcodes = []
    for code in VALID_PASSCODES:
        passcodes.append({
            "code": code,
            "redemptions": redemption_counts.get(code.upper(), 0),
            "active": code.upper() not in [p.upper() for p in disabled_passcodes]
        })
    
    return {"passcodes": passcodes}

class PasscodeToggleRequest(BaseModel):
    passcode: str
    active: bool

@router.post("/api/admin/passcodes/toggle")
async def toggle_passcode(request: PasscodeToggleRequest, admin: dict = Depends(get_admin_user)):
    """Enable or disable a passcode"""
    db = get_db()
    passcode_upper = request.passcode.upper().strip()
    
    if request.active:
        # Remove from disabled list
        await db.admin_settings.update_one(
            {"_id": "disabled_passcodes"},
            {"$pull": {"passcodes": passcode_upper}},
            upsert=True
        )
    else:
        # Add to disabled list
        await db.admin_settings.update_one(
            {"_id": "disabled_passcodes"},
            {"$addToSet": {"passcodes": passcode_upper}},
            upsert=True
        )
    
    return {"success": True, "passcode": passcode_upper, "active": request.active}

# --- Admin: User Management ---
@router.get("/api/admin/users")
async def get_all_users(admin: dict = Depends(get_admin_user), skip: int = 0, limit: int = 50):
    """Get all users with pagination"""
    db = get_db()
    users = []
    async for user in db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit):
        users.append({
            "id": user.get("user_id") or user.get("id") or user.get("_id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "tier": user.get("tier", "free"),
            "tier_source": user.get("tier_source"),
            "created_at": user.get("created_at"),
            "is_admin": user.get("email") in ADMIN_EMAILS or user.get("email") in LOCAL_ADMIN_EMAILS or user.get("is_admin", False)
        })
    
    total = await db.users.count_documents({})
    return {"users": users, "total": total, "skip": skip, "limit": limit}

class UserTierUpdateRequest(BaseModel):
    user_id: str
    tier: str

@router.post("/api/admin/users/update-tier")
async def update_user_tier(request: UserTierUpdateRequest, admin: dict = Depends(get_admin_user)):
    """Update a user's tier"""
    db = get_db()
    valid_tiers = ["free", "essential", "professional", "attorney", "enterprise"]
    if request.tier not in valid_tiers:
        raise HTTPException(status_code=400, detail=f"Invalid tier. Must be one of: {valid_tiers}")
    
    result = await db.users.update_one(
        {"$or": [{"_id": request.user_id}, {"user_id": request.user_id}]},
        {"$set": {
            "tier": request.tier,
            "tier_source": "admin",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "user_id": request.user_id, "new_tier": request.tier}

# --- Admin: Redemption History ---
@router.get("/api/admin/redemptions")
async def get_redemption_history(admin: dict = Depends(get_admin_user), skip: int = 0, limit: int = 50):
    """Get passcode redemption history"""
    db = get_db()
    redemptions = []
    async for r in db.passcode_redemptions.find({}).sort("redeemed_at", -1).skip(skip).limit(limit):
        redemptions.append({
            "id": r["_id"],
            "user_id": r.get("user_id"),
            "email": r.get("email"),
            "passcode": r.get("passcode_used"),
            "tier_granted": r.get("tier_granted"),
            "redeemed_at": r.get("redeemed_at")
        })
    
    total = await db.passcode_redemptions.count_documents({})
    return {"redemptions": redemptions, "total": total, "skip": skip, "limit": limit}

# --- Admin: Dashboard Stats ---
@router.get("/api/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    db = get_db()
    total_users = await db.users.count_documents({})
    total_cases = await db.cases.count_documents({})
    total_documents = await db.documents.count_documents({})
    total_redemptions = await db.passcode_redemptions.count_documents({})
    pending_advocates = await db.advocates.count_documents({"status": "pending"})
    approved_advocates = await db.advocates.count_documents({"status": "approved"})
    
    # Tier breakdown
    tier_counts = {}
    async for tier in db.users.aggregate([
        {"$group": {"_id": "$tier", "count": {"$sum": 1}}}
    ]):
        tier_counts[tier["_id"] or "free"] = tier["count"]
    
    return {
        "total_users": total_users,
        "total_cases": total_cases,
        "total_documents": total_documents,
        "total_redemptions": total_redemptions,
        "pending_advocates": pending_advocates,
        "approved_advocates": approved_advocates,
        "tier_breakdown": tier_counts
    }


# ============== ADVOCATE SYSTEM ==============

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

@router.post("/api/advocates/apply")
async def apply_as_advocate(application: AdvocateApplication):
    """Submit an advocate application (public endpoint)"""
    db = get_db()
    # Check if email already registered as advocate
    existing = await db.advocates.find_one({"email": application.email})
    if existing:
        raise HTTPException(status_code=400, detail="An application with this email already exists")
    
    advocate_id = str(uuid.uuid4())
    advocate_doc = {
        "_id": advocate_id,
        "name": application.name,
        "email": application.email,
        "phone": application.phone,
        "website": application.website,
        "photo_url": application.photo_url,
        "bio": application.bio,
        "experience_years": application.experience_years,
        "specialties": application.specialties,
        "state": application.state,
        "city": application.city,
        "organization": application.organization,
        "certifications": application.certifications or [],
        "languages": application.languages or ["English"],
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.advocates.insert_one(advocate_doc)
    
    return {
        "success": True,
        "message": "Your application has been submitted! We will review it and get back to you soon.",
        "advocate_id": advocate_id
    }

@router.get("/api/advocates")
async def get_approved_advocates(state: Optional[str] = None, specialty: Optional[str] = None):
    """Get list of approved advocates (public endpoint)"""
    db = get_db()
    query = {"status": "approved"}
    if state:
        query["state"] = state.upper()
    if specialty:
        query["specialties"] = {"$in": [specialty]}
    
    advocates = []
    async for adv in db.advocates.find(query, {"email": 0, "phone": 0}).sort("name", 1).limit(100):
        advocates.append({
            "id": adv["_id"],
            "name": adv.get("name"),
            "photo_url": adv.get("photo_url"),
            "bio": adv.get("bio"),
            "experience_years": adv.get("experience_years"),
            "specialties": adv.get("specialties", []),
            "state": adv.get("state"),
            "city": adv.get("city"),
            "organization": adv.get("organization"),
            "website": adv.get("website"),
            "languages": adv.get("languages", ["English"])
        })
    
    return {"advocates": advocates}

@router.get("/api/advocates/{advocate_id}")
async def get_advocate_details(advocate_id: str):
    """Get details of a specific approved advocate"""
    db = get_db()
    advocate = await db.advocates.find_one({"_id": advocate_id, "status": "approved"}, {"email": 0})
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    return {
        "id": advocate["_id"],
        "name": advocate.get("name"),
        "phone": advocate.get("phone"),  # Show phone for approved advocates
        "photo_url": advocate.get("photo_url"),
        "bio": advocate.get("bio"),
        "experience_years": advocate.get("experience_years"),
        "specialties": advocate.get("specialties", []),
        "state": advocate.get("state"),
        "city": advocate.get("city"),
        "organization": advocate.get("organization"),
        "website": advocate.get("website"),
        "certifications": advocate.get("certifications", []),
        "languages": advocate.get("languages", ["English"])
    }

# --- Admin: Advocate Management ---
@router.get("/api/admin/advocates")
async def get_all_advocates(admin: dict = Depends(get_admin_user), status: Optional[str] = None):
    """Get all advocate applications"""
    db = get_db()
    query = {}
    if status:
        query["status"] = status
    
    advocates = []
    async for adv in db.advocates.find(query).sort("created_at", -1):
        advocates.append({
            "id": adv["_id"],
            "name": adv.get("name"),
            "email": adv.get("email"),
            "phone": adv.get("phone"),
            "state": adv.get("state"),
            "experience_years": adv.get("experience_years"),
            "specialties": adv.get("specialties", []),
            "status": adv.get("status"),
            "created_at": adv.get("created_at")
        })
    
    return {"advocates": advocates}

class AdvocateStatusUpdate(BaseModel):
    advocate_id: str
    status: str  # approved, rejected, pending

@router.post("/api/admin/advocates/update-status")
async def update_advocate_status(request: AdvocateStatusUpdate, admin: dict = Depends(get_admin_user)):
    """Approve or reject an advocate application"""
    db = get_db()
    if request.status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be: pending, approved, or rejected")
    
    result = await db.advocates.update_one(
        {"_id": request.advocate_id},
        {"$set": {
            "status": request.status,
            "reviewed_by": admin.get("email"),
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    return {"success": True, "advocate_id": request.advocate_id, "new_status": request.status}

@router.delete("/api/admin/advocates/{advocate_id}")
async def delete_advocate(advocate_id: str, admin: dict = Depends(get_admin_user)):
    """Delete an advocate application"""
    db = get_db()
    result = await db.advocates.delete_one({"_id": advocate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    return {"success": True, "message": "Advocate deleted"}


