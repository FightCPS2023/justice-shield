"""
CPS Punisher - Authentication Utilities
JWT creation, password hashing, and user verification
"""
from datetime import datetime, timezone, timedelta
from fastapi import Depends, HTTPException, Request
from passlib.context import CryptContext
from jose import jwt, JWTError

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS, ADMIN_EMAILS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def get_current_user(request: Request):
    cookie_token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization")
    header_token = None
    if auth_header and auth_header.lower().startswith("bearer "):
        header_token = auth_header.split(" ", 1)[1]

    token = cookie_token or header_token

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError:
        pass

    from database import get_db

    db = get_db()
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc and cookie_token and header_token:
        try:
            payload = jwt.decode(header_token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            return {"user_id": user_id, "email": payload.get("email")}
        except JWTError:
            session_doc = None

    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_id = session_doc.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    user_doc = await db.users.find_one(
        {"$or": [{"user_id": user_id}, {"_id": user_id}]},
        {"_id": 0, "email": 1}
    )

    return {"user_id": user_id, "email": user_doc.get("email") if user_doc else None}


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    from database import get_db
    db = get_db()
    user = await db.users.find_one({"$or": [{"user_id": current_user["user_id"]}, {"_id": current_user["user_id"]}]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    is_admin = (
        user.get("email") in ADMIN_EMAILS or
        user.get("is_admin", False) or
        user.get("role") == "admin"
    )
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
