"""Viral Victory Cards — shareable social graphics for legal actions taken."""
import uuid
import secrets
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import base64
import html
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel

from database import get_db
from auth import get_current_user

router = APIRouter()

TRIGGER_TYPES = ["violation_detected", "lawsuit_drafted", "foia_filed", "evidence_sealed", "dossier_dispatched", "caseworker_flagged"]
STYLES = ["dark", "chrome", "fire"]

HEADLINES = {
    "violation_detected": "⚠️ CONSTITUTIONAL VIOLATION DETECTED",
    "lawsuit_drafted": "⚔️ FEDERAL LAWSUIT DRAFTED — 42 U.S.C. § 1983",
    "foia_filed": "🔍 FOIA REQUEST FILED — TRANSPARENCY DEMANDED",
    "evidence_sealed": "🔐 EVIDENCE SEALED — IMMUTABLE VAULT",
    "dossier_dispatched": "📢 CORRUPTION DOSSIER DISPATCHED",
    "caseworker_flagged": "🚨 CASEWORKER FLAGGED — INTEGRITY DATABASE",
}
BASE_TAGS = ["#JusticeShield", "#CPSAccountability", "#ParentsRights"]
TRIGGER_TAGS = {
    "violation_detected": ["#4thAmendment", "#DueProcess", "#KnowYourRights"],
    "lawsuit_drafted": ["#Section1983", "#CivilRights", "#FederalCourt"],
    "foia_filed": ["#FOIA", "#PublicRecords", "#Transparency"],
    "evidence_sealed": ["#ChainOfCustody", "#EvidencePreserved"],
    "dossier_dispatched": ["#SystemicCorruption", "#Accountability", "#Oversight"],
    "caseworker_flagged": ["#IntegrityDatabase", "#Misconduct"],
}
ACCENT = {"violation_detected": "red", "caseworker_flagged": "red", "dossier_dispatched": "red",
          "lawsuit_drafted": "gold", "foia_filed": "gold", "evidence_sealed": "gold"}


class TriggerData(BaseModel):
    case_id: Optional[str] = None
    violation_type: Optional[str] = None
    lawsuit_id: Optional[str] = None
    foia_id: Optional[str] = None
    vault_id: Optional[str] = None
    dossier_id: Optional[str] = None
    caseworker_name: Optional[str] = None
    redact_caseworker: bool = True
    amendment: Optional[str] = None
    violation_count: Optional[int] = None
    state: Optional[str] = None
    agency: Optional[str] = None


class GenerateCardRequest(BaseModel):
    trigger_type: str
    trigger_data: TriggerData = TriggerData()
    card_style: str = "chrome"
    custom_headline: Optional[str] = None


class ImagePayload(BaseModel):
    share_image_data: str


def _ordinal_amendment(a: Optional[str]) -> Optional[str]:
    if not a:
        return None
    a = a.strip()
    return a if "amend" in a.lower() else f"{a} Amendment"


def build_card_copy(trigger_type: str, d: TriggerData) -> Dict[str, Any]:
    state = f" — {d.state.upper()}" if d.state else ""
    name = None if (d.redact_caseworker or not d.caseworker_name) else d.caseworker_name
    n = d.violation_count or 0
    amend = _ordinal_amendment(d.amendment)
    if trigger_type == "violation_detected":
        sub = f"{amend or 'Constitutional'} violation documented on the record{state}"
        stats = f"{n} constitutional violation{'s' if n != 1 else ''} documented" if n else "Violation logged — evidence preserved"
    elif trigger_type == "lawsuit_drafted":
        sub = f"Civil rights action drafted against {d.agency or 'the agency'}{state}"
        stats = f"{n} count{'s' if n != 1 else ''} · Monell · Qualified-immunity pierce" if n else "Federal complaint drafted — Rule 11 reviewed"
    elif trigger_type == "foia_filed":
        sub = f"Public records demand served on {d.agency or 'the agency'}{state}"
        stats = "Bond · Oath of office · Case file · Hotline audio"
    elif trigger_type == "evidence_sealed":
        sub = "AES-256 sealed · Proof-of-custody hash generated"
        stats = f"Vault certificate {d.vault_id[:8]}…" if d.vault_id else "Tamper-evident certificate issued"
    elif trigger_type == "dossier_dispatched":
        sub = f"Notice of Systemic Corruption delivered to oversight{state}"
        stats = f"{n} documented violation{'s' if n != 1 else ''} escalated" if n else "Legislators · AG · Inspector General notified"
    else:
        sub = f"{name + ' — ' if name else ''}{d.agency or 'Caseworker'} entered into the Integrity Database{state}"
        stats = f"{n} violation{'s' if n != 1 else ''} on file · risk score computed" if n else "Pattern tracking activated"
    return {"headline": HEADLINES[trigger_type], "subtext": sub, "stats_line": stats,
            "hashtags": BASE_TAGS + TRIGGER_TAGS[trigger_type] + ([f"#{d.state.upper()}CPS"] if d.state else []),
            "accent": ACCENT[trigger_type]}


def _public_base(request: Request) -> str:
    raw = request.headers.get("origin") or request.headers.get("referer")
    if raw:
        u = urlparse(raw)
        if u.scheme and u.netloc:
            return f"{u.scheme}://{u.netloc}"
    fwd_host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    fwd_proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    if fwd_host:
        return f"{fwd_proto}://{fwd_host.split(',')[0].strip()}"
    return str(request.base_url).rstrip("/")


@router.post("/api/victory-cards/generate")
async def generate_card(payload: GenerateCardRequest, request: Request, current_user: dict = Depends(get_current_user)):
    if payload.trigger_type not in TRIGGER_TYPES:
        raise HTTPException(status_code=400, detail=f"trigger_type must be one of {TRIGGER_TYPES}")
    if payload.card_style not in STYLES:
        raise HTTPException(status_code=400, detail=f"card_style must be one of {STYLES}")
    copy = build_card_copy(payload.trigger_type, payload.trigger_data)
    if payload.custom_headline:
        copy["headline"] = payload.custom_headline.strip().upper()[:80]
    card_id = str(uuid.uuid4())
    share_token = secrets.token_urlsafe(8)
    td = payload.trigger_data.model_dump()
    if td.get("redact_caseworker"):
        td["caseworker_name"] = None
    card = {
        "_id": card_id,
        "card_id": card_id,
        "user_id": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "trigger_type": payload.trigger_type,
        "trigger_data": td,
        "card_style": payload.card_style,
        **copy,
        "share_token": share_token,
        "share_url": f"{_public_base(request)}/api/victory-cards/og/{share_token}",
        "share_image_data": None,
        "brand": {"wordmark": "JUSTICE SHIELD", "site": "thecpspunisher.com"},
    }
    db = get_db()
    await db.victory_cards.insert_one(dict(card))
    card.pop("_id")
    return card


@router.get("/api/victory-cards")
async def list_cards(limit: int = Query(50, ge=1, le=200), current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.victory_cards.find({"user_id": current_user["user_id"]}, {"_id": 0, "share_image_data": 0}).sort("created_at", -1).limit(limit)
    cards: List[dict] = [c async for c in cursor]
    return {"cards": cards, "total": len(cards)}


@router.get("/api/victory-cards/og/{share_token}", response_class=HTMLResponse)
async def og_card_page(share_token: str, request: Request):
    """Crawler-friendly share page: Open Graph / Twitter meta + redirect humans to the SPA view."""
    db = get_db()
    card = await db.victory_cards.find_one({"share_token": share_token}, {"_id": 0, "user_id": 0, "share_image_data": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    base = _public_base(request)
    title = html.escape(card["headline"])
    desc = html.escape(f"{card['subtext']} — {card['stats_line']} {' '.join(card.get('hashtags', []))}")
    image = f"{base}/api/victory-cards/image/{share_token}.png"
    target = f"{base}/victory/{share_token}"
    return f"""<!doctype html><html><head><meta charset="utf-8">
<title>{title} | Justice Shield</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Justice Shield — The CPS Punisher">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:url" content="{html.escape(target)}"><meta property="og:image" content="{html.escape(image)}">
<meta property="og:image:width" content="1080"><meta property="og:image:height" content="1080">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}"><meta name="twitter:image" content="{html.escape(image)}">
<meta http-equiv="refresh" content="0;url={html.escape(target)}">
<style>body{{background:#000;color:#c0c0c0;font-family:monospace;padding:2rem}}a{{color:#fff}}</style></head>
<body><p>{title}</p><p>{desc}</p><a href="{html.escape(target)}">View card</a></body></html>"""


@router.get("/api/victory-cards/image/{share_token}.png")
async def card_image(share_token: str):
    db = get_db()
    card = await db.victory_cards.find_one({"share_token": share_token}, {"_id": 0, "share_image_data": 1})
    if not card or not card.get("share_image_data"):
        raise HTTPException(status_code=404, detail="Image not rendered yet — open the card and download/share once to publish its image")
    data = card["share_image_data"]
    if "," in data:
        data = data.split(",", 1)[1]
    return Response(content=base64.b64decode(data), media_type="image/png", headers={"Cache-Control": "public, max-age=3600"})


@router.get("/api/victory-cards/public/{share_token}")
async def public_card(share_token: str):
    db = get_db()
    card = await db.victory_cards.find_one({"share_token": share_token}, {"_id": 0, "user_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.get("/api/victory-cards/{card_id}")
async def get_card(card_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    card = await db.victory_cards.find_one({"card_id": card_id, "user_id": current_user["user_id"]}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.put("/api/victory-cards/{card_id}/image")
async def save_card_image(card_id: str, payload: ImagePayload, current_user: dict = Depends(get_current_user)):
    if len(payload.share_image_data) > 2_500_000:
        raise HTTPException(status_code=413, detail="Image too large")
    db = get_db()
    res = await db.victory_cards.update_one({"card_id": card_id, "user_id": current_user["user_id"]}, {"$set": {"share_image_data": payload.share_image_data}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"saved": True}


@router.delete("/api/victory-cards/{card_id}")
async def delete_card(card_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    res = await db.victory_cards.delete_one({"card_id": card_id, "user_id": current_user["user_id"]})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"deleted": True}
