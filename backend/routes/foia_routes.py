from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

from auth import get_current_user
from engines.foia_bot_engine import get_available_states, generate_foia_package
from utils.credits import save_ai_response_to_case
from utils.gmail_client import (
    create_oauth_state,
    verify_oauth_state,
    build_auth_url,
    exchange_code_for_tokens,
    save_gmail_tokens,
    send_gmail_message,
    get_gmail_credentials,
)
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
from database import get_db

router = APIRouter()

DEFAULT_REMINDER_SCHEDULE = [7, 14, 30]

class FoiaRequest(BaseModel):
    user_name: str
    state: str
    caseworker_name: str
    agency_name: str
    case_id: str | None = None

class FoiaSendRequest(BaseModel):
    user_name: str
    state: str
    caseworker_name: str
    agency_name: str
    recipient_email: str
    case_id: str | None = None


@router.get('/api/oauth/gmail/login')
async def gmail_login(request: Request, current_user: dict = Depends(get_current_user)):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail='Gmail OAuth not configured')
    state = await create_oauth_state(current_user['user_id'])
    redirect_uri = f"{request.base_url}api/oauth/gmail/callback"
    auth_url = build_auth_url(redirect_uri, state)
    return {"auth_url": auth_url}


@router.get('/api/oauth/gmail/callback')
async def gmail_callback(code: str, state: str, request: Request):
    user_id = await verify_oauth_state(state)
    if not user_id:
        raise HTTPException(status_code=400, detail='Invalid or expired OAuth state')

    redirect_uri = f"{request.base_url}api/oauth/gmail/callback"
    creds = exchange_code_for_tokens(code, redirect_uri)
    await save_gmail_tokens(user_id, creds)

    html = """
    <html><body style='font-family: Arial; background:#111; color:#fff; padding:40px;'>
      <h2>Gmail connected successfully.</h2>
      <p>You can close this window and return to the FOIA Requests tab.</p>
    </body></html>
    """
    return HTMLResponse(html)


@router.get('/api/foia/email/status')
async def foia_email_status(current_user: dict = Depends(get_current_user)):
    creds = await get_gmail_credentials(current_user['user_id'])
    return {"connected": bool(creds)}


@router.get('/api/foia/states')
async def foia_states(current_user: dict = Depends(get_current_user)):
    return {"states": get_available_states()}


@router.post('/api/foia/generate')
async def foia_generate(payload: FoiaRequest, current_user: dict = Depends(get_current_user)):
    if not payload.user_name.strip():
        raise HTTPException(status_code=400, detail='Your name is required')
    if not payload.caseworker_name.strip():
        raise HTTPException(status_code=400, detail='Caseworker name is required')
    if not payload.agency_name.strip():
        raise HTTPException(status_code=400, detail='Agency name is required')

    try:
        package = generate_foia_package(
            user_name=payload.user_name,
            state=payload.state,
            caseworker_name=payload.caseworker_name,
            agency_name=payload.agency_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if payload.case_id:
        await save_ai_response_to_case(
            case_id=payload.case_id,
            user_id=current_user["user_id"],
            feature_type="foia_request",
            prompt=f"FOIA request for {payload.caseworker_name} ({payload.agency_name})",
            response=package.get("document_markdown", ""),
            metadata={"state": package.get("state"), "statute": package.get("statute")}
        )

    return package


@router.post('/api/foia/send')
async def foia_send(payload: FoiaSendRequest, current_user: dict = Depends(get_current_user)):
    if not payload.recipient_email:
        raise HTTPException(status_code=400, detail='Recipient email is required')

    package = generate_foia_package(
        user_name=payload.user_name,
        state=payload.state,
        caseworker_name=payload.caseworker_name,
        agency_name=payload.agency_name,
    )

    subject = f"Public Records Request — {payload.caseworker_name}"
    body = package.get('document_markdown', '')

    message_id = await send_gmail_message(
        current_user['user_id'],
        payload.recipient_email,
        subject,
        body
    )

    db = get_db()
    now = datetime.now(timezone.utc)
    foia_record = {
        "user_id": current_user['user_id'],
        "case_id": payload.case_id,
        "state": package.get('state'),
        "caseworker_name": payload.caseworker_name,
        "agency_name": payload.agency_name,
        "recipient_email": payload.recipient_email,
        "document_markdown": body,
        "sent_at": now,
        "message_id": message_id,
        "reminder_schedule": DEFAULT_REMINDER_SCHEDULE,
        "status": "sent"
    }
    result = await db.foia_requests.insert_one(foia_record)

    reminders = []
    for days in DEFAULT_REMINDER_SCHEDULE:
        reminders.append({
            "foia_id": result.inserted_id,
            "user_id": current_user['user_id'],
            "recipient_email": payload.recipient_email,
            "due_at": now + timedelta(days=days),
            "status": "pending",
            "attempts": 0
        })
    if reminders:
        await db.foia_reminders.insert_many(reminders)

    return {"status": "sent", "message_id": message_id}


@router.post('/api/foia/reminders/dispatch')
async def foia_dispatch_reminders(current_user: dict = Depends(get_current_user)):
    db = get_db()
    now = datetime.now(timezone.utc)
    cursor = db.foia_reminders.find({
        "user_id": current_user['user_id'],
        "status": "pending",
        "due_at": {"$lte": now}
    }).limit(5)

    sent_count = 0
    async for reminder in cursor:
        try:
            foia_request = await db.foia_requests.find_one({"_id": reminder['foia_id']})
            if not foia_request:
                await db.foia_reminders.update_one({"_id": reminder['_id']}, {"$set": {"status": "skipped"}})
                continue

            subject = f"FOLLOW-UP: Public Records Request — {foia_request.get('caseworker_name')}"
            body = foia_request.get('document_markdown', '') + "\n\nThis is a follow-up request. Please confirm receipt and provide the requested records."
            await send_gmail_message(
                current_user['user_id'],
                reminder['recipient_email'],
                subject,
                body
            )
            await db.foia_reminders.update_one({"_id": reminder['_id']}, {"$set": {"status": "sent", "sent_at": now}})
            sent_count += 1
        except Exception as e:
            await db.foia_reminders.update_one(
                {"_id": reminder['_id']},
                {"$set": {"status": "error", "last_error": str(e), "attempts": reminder.get('attempts', 0) + 1}}
            )

    return {"sent": sent_count}
