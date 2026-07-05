"""Auth routes - signup, login, profile, Google OAuth"""
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from database import get_db
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from config import TIER_LEVELS, TIER_FEATURES, VALID_PASSCODES, AUTH_SERVICE_URL, ACCESS_TOKEN_EXPIRE_DAYS
from models.schemas import UserCreate, UserLogin, TokenResponse


router = APIRouter()

@router.post("/api/auth/signup")
async def signup(user_data: UserCreate):
    """Register a new user"""
    db = get_db()
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if not user_data.accepted_terms or not user_data.accepted_privacy:
        raise HTTPException(status_code=400, detail="You must accept the Terms of Service and Privacy Policy")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    accepted_at = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "_id": user_id,
        "user_id": user_id,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "name": user_data.name,
        "state": user_data.state,
        "tier": "free",
        "ai_credits_used": 0,
        "docs_generated": 0,
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_at": accepted_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token({"user_id": user_id, "email": user_data.email})
    
    response_data = TokenResponse(
        access_token=access_token,
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        tier="free",
        state=user_data.state,
        accepted_terms=True,
        accepted_privacy=True,
        accepted_at=accepted_at
    )

    response = JSONResponse(content=response_data.model_dump())
    response.set_cookie(
        key="session_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )

    return response

@router.post("/api/auth/login")
async def login(user_data: UserLogin):
    """Login and get access token"""
    db = get_db()
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = user.get("user_id") or user.get("_id")
    if not user_id:
        raise HTTPException(status_code=500, detail="User record missing identifier")

    if not user.get("user_id"):
        await db.users.update_one({"_id": user_id}, {"$set": {"user_id": user_id}})

    access_token = create_access_token({"user_id": user_id, "email": user["email"]})

    response_data = TokenResponse(
        access_token=access_token,
        user_id=user_id,
        email=user["email"],
        name=user.get("name", "User"),
        tier=user.get("tier", "free"),
        state=user.get("state"),
        accepted_terms=user.get("accepted_terms"),
        accepted_privacy=user.get("accepted_privacy"),
        accepted_at=user.get("accepted_at"),
        is_admin=user.get("is_admin", False)
    )

    response = JSONResponse(content=response_data.model_dump())
    response.set_cookie(
        key="session_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )

    return response

@router.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    db = get_db()
    user = await db.users.find_one(
        {"$or": [{"user_id": current_user["user_id"]}, {"_id": current_user["user_id"]}]},
        {"_id": 0, "password_hash": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/api/auth/profile")
async def update_profile(update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    db = get_db()
    allowed_fields = ["name", "state", "phone", "address"]
    update_doc = {k: v for k, v in update_data.items() if k in allowed_fields}
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"$or": [{"user_id": current_user["user_id"]}, {"_id": current_user["user_id"]}]},
        {"$set": update_doc}
    )
    return {"message": "Profile updated"}


@router.post("/api/auth/accept-terms")
async def accept_terms(current_user: dict = Depends(get_current_user)):
    """Accept Terms of Service and Privacy Policy"""
    db = get_db()
    accepted_at = datetime.now(timezone.utc).isoformat()
    await db.users.update_one(
        {"$or": [{"user_id": current_user["user_id"]}, {"_id": current_user["user_id"]}]},
        {"$set": {"accepted_terms": True, "accepted_privacy": True, "accepted_at": accepted_at, "updated_at": accepted_at}}
    )
    return {"accepted_terms": True, "accepted_privacy": True, "accepted_at": accepted_at}


@router.get("/api/auth/tier-status")
async def get_tier_status(current_user: dict = Depends(get_current_user)):
    """Get user's tier info, usage, and limits"""
    db = get_db()
    user = await db.users.find_one({"$or": [{"user_id": current_user["user_id"]}, {"_id": current_user["user_id"]}]}, {"_id": 0, "password_hash": 0})
    user_tier = user.get("tier", "free") if user else "free"
    tier_limits = TIER_FEATURES.get(user_tier, TIER_FEATURES["free"])

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    docs_this_month = await db.documents.count_documents({
        "user_id": current_user["user_id"],
        "source": "upload",
        "created_at": {"$gte": month_start}
    })
    case_count = await db.cases.count_documents({"user_id": current_user["user_id"]})
    ai_used = user.get("ai_credits_used", 0) if user else 0

    return {
        "tier": user_tier,
        "tier_level": TIER_LEVELS.get(user_tier, 0),
        "limits": tier_limits,
        "usage": {
            "docs_uploaded_this_month": docs_this_month,
            "ai_credits_used": ai_used,
            "cases_created": case_count,
        },
        "remaining": {
            "docs": tier_limits["docs_per_month"] - docs_this_month if tier_limits["docs_per_month"] != -1 else -1,
            "ai_credits": tier_limits["ai_credits"] - ai_used if tier_limits["ai_credits"] != -1 else -1,
            "cases": tier_limits["cases_max"] - case_count if tier_limits["cases_max"] != -1 else -1,
        }
    }


class PasscodeRequest(BaseModel):
    passcode: str

@router.post("/api/auth/redeem-passcode")
async def redeem_passcode(request: PasscodeRequest, current_user: dict = Depends(get_current_user)):
    """
    Redeem a passcode for full enterprise access to all features.
    This grants the user enterprise tier permanently.
    Passcodes are reusable by multiple users.
    """
    db = get_db()
    # Check if passcode is valid (case-insensitive)
    passcode_upper = request.passcode.upper().strip()
    if passcode_upper not in [p.upper() for p in VALID_PASSCODES]:
        raise HTTPException(status_code=400, detail="Invalid passcode")
    
    # Check if passcode is disabled by admin
    disabled_doc = await db.admin_settings.find_one({"_id": "disabled_passcodes"})
    if disabled_doc and passcode_upper in [p.upper() for p in disabled_doc.get("passcodes", [])]:
        raise HTTPException(status_code=400, detail="This passcode has been deactivated")
    
    # Upgrade user to enterprise tier
    await db.users.update_one(
        {"$or": [{"user_id": current_user["user_id"]}, {"_id": current_user["user_id"]}]},
        {"$set": {
            "tier": "enterprise",
            "tier_source": "passcode",
            "passcode_redeemed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log the redemption (for tracking purposes)
    await db.passcode_redemptions.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "email": current_user.get("email"),
        "passcode_used": passcode_upper,
        "tier_granted": "enterprise",
        "redeemed_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": "Full access granted! You now have Enterprise tier access to all features.",
        "new_tier": "enterprise"
    }


@router.post("/api/auth/google/session")
async def process_google_session(request: Request):
    """
    Process Google OAuth session_id from Emergent Auth
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    db = get_db()
    try:
        data = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {str(e)}")
    
    session_id = data.get("session_id")
    print(f"Google OAuth: Received session_id: {session_id[:50] if session_id else 'None'}...")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Exchange session_id for user data from Emergent Auth
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if not AUTH_SERVICE_URL:
                raise HTTPException(status_code=500, detail="Auth service URL not configured")
            auth_url = f"{AUTH_SERVICE_URL}/auth/v1/env/oauth/session-data"
            print(f"Google OAuth: Calling {auth_url}")
            response = await client.get(
                auth_url,
                headers={"X-Session-ID": session_id}
            )
            print(f"Google OAuth: Response status={response.status_code}")
            if response.status_code != 200:
                print(f"Google OAuth: Emergent auth returned {response.status_code}: {response.text}")
                raise HTTPException(status_code=401, detail=f"Invalid session - auth service returned {response.status_code}")
            
            auth_data = response.json()
            print(f"Google OAuth: Got auth_data with email={auth_data.get('email')}")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Auth service timeout")
        except HTTPException:
            raise
        except Exception as e:
            print(f"Google OAuth error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    
    email = auth_data.get("email")
    name = auth_data.get("name", "User")
    picture = auth_data.get("picture", "")
    session_token = auth_data.get("session_token")
    
    if not email or not session_token:
        print(f"Google OAuth: Missing email or session_token in auth response: {auth_data}")
        raise HTTPException(status_code=400, detail="Invalid auth response - missing email or session_token")
    
    # Check if user exists, if not create
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        user_id = existing_user.get("user_id") or existing_user.get("_id")
        user_tier = existing_user.get("tier", "free")
        update_doc = {
            "name": name,
            "picture": picture,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        if not existing_user.get("user_id"):
            update_doc["user_id"] = user_id
        await db.users.update_one(
            {"$or": [{"_id": user_id}, {"user_id": user_id}]},
            {"$set": update_doc}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_tier = "free"
        await db.users.insert_one({
            "_id": user_id,
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "tier": "free",
            "accepted_terms": False,
            "accepted_privacy": False,
            "accepted_at": None,
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
        "tier": user_tier,
        "is_admin": existing_user.get("is_admin", False) if existing_user else False
    }
    
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


@router.post("/api/auth/google/logout")
async def google_logout(request: Request):
    """Logout and clear Google OAuth session"""
    db = get_db()
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response

