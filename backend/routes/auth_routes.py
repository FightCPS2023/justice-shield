"""
CPS Punisher - Authentication Routes
User signup, login, profile management, passcode redemption, Google OAuth
"""
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse

from database import get_db
from auth import create_access_token, verify_password, get_password_hash, get_current_user
from models.schemas import UserCreate, UserLogin, TokenResponse, PasscodeRequest
from config import FULL_ACCESS_PASSCODE

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Register a new user"""
    db = get_db()
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


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Login and get access token"""
    db = get_db()
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


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    db = get_db()
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = user.pop("_id")
    return user


@router.put("/profile")
async def update_profile(update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    db = get_db()
    allowed_fields = ["name", "state", "phone", "address"]
    update_doc = {k: v for k, v in update_data.items() if k in allowed_fields}
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": update_doc}
    )
    return {"message": "Profile updated"}


@router.post("/redeem-passcode")
async def redeem_passcode(request: PasscodeRequest, current_user: dict = Depends(get_current_user)):
    """Redeem a passcode for full enterprise access"""
    db = get_db()
    if request.passcode != FULL_ACCESS_PASSCODE:
        raise HTTPException(status_code=400, detail="Invalid passcode")
    
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {
            "tier": "enterprise",
            "tier_source": "passcode",
            "passcode_redeemed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
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


@router.post("/google/session")
async def process_google_session(request: Request):
    """Process Google OAuth session_id from Emergent Auth"""
    db = get_db()
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
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
    
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        user_id = existing_user["_id"]
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "name": name,
                "picture": picture,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        tier = existing_user.get("tier", "free")
    else:
        user_id = str(uuid.uuid4())
        tier = "free"
        await db.users.insert_one({
            "_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "tier": tier,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
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
    
    access_token = create_access_token({"user_id": user_id, "email": email})
    
    response_data = {
        "access_token": access_token,
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "tier": tier
    }
    
    response = JSONResponse(content=response_data)
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7*24*60*60,
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )
    return response


@router.post("/google/logout")
async def google_logout(request: Request):
    """Logout and clear Google OAuth session"""
    db = get_db()
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response
