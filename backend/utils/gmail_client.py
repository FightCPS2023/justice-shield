import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
from email.message import EmailMessage
import base64

from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
from database import get_db

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.labels",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]


def _client_config() -> dict:
    return {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
    }


async def create_oauth_state(user_id: str) -> str:
    db = get_db()
    state = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": user_id,
        "purpose": "gmail",
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    return state


async def verify_oauth_state(state: str) -> Optional[str]:
    db = get_db()
    record = await db.oauth_states.find_one({"state": state, "purpose": "gmail"})
    if not record:
        return None
    expires_at = record.get("expires_at")
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and datetime.now(timezone.utc) > expires_at:
        await db.oauth_states.delete_one({"_id": record.get("_id")})
        return None
    await db.oauth_states.delete_one({"_id": record.get("_id")})
    return record.get("user_id")


def build_auth_url(redirect_uri: str, state: str) -> str:
    flow = Flow.from_client_config(_client_config(), scopes=GMAIL_SCOPES, redirect_uri=redirect_uri)
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true',
        state=state
    )
    return auth_url


def exchange_code_for_tokens(code: str, redirect_uri: str) -> Credentials:
    flow = Flow.from_client_config(_client_config(), scopes=GMAIL_SCOPES, redirect_uri=redirect_uri)
    flow.fetch_token(code=code)
    return flow.credentials


async def save_gmail_tokens(user_id: str, creds: Credentials):
    db = get_db()
    expires_at = creds.expiry
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    await db.gmail_tokens.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes,
            "expires_at": expires_at,
            "updated_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )


async def get_gmail_credentials(user_id: str) -> Optional[Credentials]:
    db = get_db()
    token = await db.gmail_tokens.find_one({"user_id": user_id})
    if not token:
        return None

    creds = Credentials(
        token=token.get("access_token"),
        refresh_token=token.get("refresh_token"),
        token_uri=token.get("token_uri"),
        client_id=token.get("client_id"),
        client_secret=token.get("client_secret"),
        scopes=token.get("scopes") or GMAIL_SCOPES
    )

    expires_at = token.get("expires_at")
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at and datetime.now(timezone.utc) >= expires_at:
        creds.refresh(GoogleRequest())
        await db.gmail_tokens.update_one(
            {"user_id": user_id},
            {"$set": {
                "access_token": creds.token,
                "expires_at": creds.expiry,
                "updated_at": datetime.now(timezone.utc)
            }}
        )

    return creds


async def send_gmail_message(user_id: str, to_email: str, subject: str, body: str) -> str:
    creds = await get_gmail_credentials(user_id)
    if not creds:
        raise ValueError("Gmail not connected")

    service = build('gmail', 'v1', credentials=creds)
    message = EmailMessage()
    message['To'] = to_email
    message['Subject'] = subject
    message.set_content(body)

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    sent = service.users().messages().send(userId='me', body={'raw': raw}).execute()
    return sent.get('id')
