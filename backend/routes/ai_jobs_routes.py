"""AI job runner: long generations run server-side; the client polls. Immune to proxy stream caps."""
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Depends, Body

from database import get_db
from auth import get_current_user
from utils.credits import require_tier
from models.schemas import ChatMessage
from .ai_routes import (
    SmartResearchRequest, SmartDocGenRequest, smart_legal_research, smart_document_generator,
    ai_defense_strategy, ai_chat,
)
from .strategy_routes import (
    StrategyBuildRequest, LegalArgumentRequest, EvidenceMapping, PrecedentSearchRequest,
    build_legal_strategy, generate_legal_arguments, map_evidence_to_precedents, find_legal_precedents,
)
from .caselaw_routes import analyze_case_law
from .section1983_routes import generate_section_1983_complaint

router = APIRouter()
JOB_TTL_SECONDS = 3600


async def _run_case_law(payload, user):
    return await analyze_case_law(
        case_id=payload["case_id"],
        focus_areas=payload.get("focus_areas") or ["fourth_amendment", "due_process"],
        jurisdiction=payload.get("jurisdiction") or "federal",
        current_user=user,
    )


async def _run_1983(payload, user):
    return await generate_section_1983_complaint(
        case_id=payload["case_id"],
        defendants=payload.get("defendants") or [],
        constitutional_violations=payload.get("constitutional_violations") or [],
        relief_sought=payload.get("relief_sought") or [],
        include_monell=payload.get("include_monell", True),
        include_conspiracy=payload.get("include_conspiracy", False),
        current_user=user,
    )


TARGETS: Dict[str, Dict[str, Any]] = {
    "smart-research": {"model": SmartResearchRequest, "run": lambda p, u: smart_legal_research(SmartResearchRequest(**p), u)},
    "smart-document": {"model": SmartDocGenRequest, "run": lambda p, u: smart_document_generator(SmartDocGenRequest(**p), u)},
    "chat": {"model": ChatMessage, "run": lambda p, u: ai_chat(ChatMessage(**p), u)},
    "defense-strategy": {"tier": ("essential", "defense_strategy"), "run": lambda p, u: ai_defense_strategy(p["case_id"], u)},
    "strategy-builder": {"tier": ("professional", ""), "run": lambda p, u: build_legal_strategy(StrategyBuildRequest(**p), u)},
    "argument-generator": {"tier": ("professional", ""), "run": lambda p, u: generate_legal_arguments(LegalArgumentRequest(**p), u)},
    "evidence-mapper": {"tier": ("professional", ""), "run": lambda p, u: map_evidence_to_precedents(EvidenceMapping(**p), u)},
    "precedent-finder": {"tier": ("professional", ""), "run": lambda p, u: find_legal_precedents(PrecedentSearchRequest(**p), u)},
    "case-law": {"tier": ("professional", ""), "run": _run_case_law},
    "section-1983": {"tier": ("attorney", ""), "run": _run_1983},
}


async def _execute(job_id: str, target: str, payload: dict, user: dict):
    db = get_db()
    try:
        result = await TARGETS[target]["run"](payload, user)
        await db.ai_jobs.update_one({"_id": job_id}, {"$set": {"status": "complete", "result": result, "finished_at": datetime.now(timezone.utc).isoformat()}})
    except HTTPException as exc:
        await db.ai_jobs.update_one({"_id": job_id}, {"$set": {"status": "error", "error": exc.detail, "status_code": exc.status_code, "finished_at": datetime.now(timezone.utc).isoformat()}})
    except Exception as exc:
        await db.ai_jobs.update_one({"_id": job_id}, {"$set": {"status": "error", "error": str(exc)[:500], "status_code": 500, "finished_at": datetime.now(timezone.utc).isoformat()}})


@router.post("/api/ai/jobs/{target}")
async def start_ai_job(target: str, payload: dict = Body(default={}), current_user: dict = Depends(get_current_user)):
    spec = TARGETS.get(target)
    if not spec:
        raise HTTPException(status_code=404, detail=f"Unknown AI job target '{target}'")
    if spec.get("tier"):
        current_user = await require_tier(*spec["tier"])(current_user)
    if spec.get("model"):
        try:
            spec["model"](**payload)
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Invalid payload: {exc}")
    db = get_db()
    job_id = str(uuid.uuid4())
    await db.ai_jobs.insert_one({
        "_id": job_id, "user_id": current_user["user_id"], "target": target, "status": "running",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    asyncio.create_task(_execute(job_id, target, payload, dict(current_user)))
    return {"job_id": job_id, "status": "running", "target": target}


@router.get("/api/ai/jobs/{job_id}")
async def get_ai_job(job_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    job = await db.ai_jobs.find_one({"_id": job_id, "user_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["job_id"] = job.pop("_id")
    return job
