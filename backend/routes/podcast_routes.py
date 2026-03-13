"""Podcast routes"""
import uuid
import json
import re
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Body

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY
from utils.credits import (
    require_tier, check_ai_credits, increment_ai_credits, save_ai_response_to_case
)

router = APIRouter()

@router.post("/api/podcast/generate-script")
async def generate_podcast_script(
    case_id: str = Body(None),
    topic: str = Body(...),
    episode_type: str = Body(default="educational"),
    duration_minutes: int = Body(default=15),
    include_case_details: bool = Body(default=False),
    current_user: dict = Depends(require_tier("attorney"))
):
    """
    Generate a podcast script about CPS defense, legal rights, or case analysis.
    Episode types: educational, case_analysis, interview_style, news_update, legal_breakdown
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    case_context = ""
    if case_id and include_case_details:
        case = await get_case_with_ownership(case_id, current_user["user_id"])
        violations = await db.violations.find({"case_id": case_id}).to_list(20)
        case_context = f"""
CASE CONTEXT (anonymize in script):
- State: {case.get('state', 'Unknown')}
- Case Type: CPS Investigation/Dependency
- Violations Found: {len(violations)}
- Key Issues: {', '.join([v.get('violation_type', '') for v in violations[:5]])}
"""
    
    episode_formats = {
        "educational": "Educational deep-dive explaining legal concepts to parents",
        "case_analysis": "Analysis of legal strategies based on a real case scenario",
        "interview_style": "Host interviewing an expert (write both parts)",
        "news_update": "News-style update on CPS law changes and court decisions",
        "legal_breakdown": "Step-by-step breakdown of a legal process or procedure"
    }
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"podcast-{uuid.uuid4().hex[:8]}",
        system_message="""You are a podcast script writer for THE CPS PUNISHER - 
a show that educates parents about their rights when dealing with Child Protective Services.

Your scripts are:
- Engaging and conversational (not dry legal lecture)
- Legally accurate with proper terminology
- Empowering to parents (action-oriented advice)
- Include specific legal citations when relevant
- Written for audio (speaker cues, pauses, emphasis)

Format scripts with:
[INTRO MUSIC]
HOST: dialogue
[SOUND EFFECT if needed]
[OUTRO]

Make it sound like a professional legal podcast that could compete with top legal shows."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Create a {duration_minutes}-minute podcast script for THE CPS PUNISHER podcast.

EPISODE TOPIC: {topic}

EPISODE FORMAT: {episode_formats.get(episode_type, episode_formats['educational'])}

TARGET AUDIENCE: Parents facing CPS investigations, family advocates, attorneys

{case_context}

REQUIREMENTS:
1. Opening hook that grabs attention (first 30 seconds crucial)
2. Clear structure with 3-4 main points
3. Specific legal citations and case law references
4. Actionable takeaways parents can use
5. Call to action at end
6. Appropriate length for {duration_minutes} minutes (~150 words per minute)

Include timestamps: [00:00], [02:30], etc.

Make this script POWERFUL, INFORMATIVE, and ENGAGING.
Parents listening should feel empowered and educated."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save podcast script
    script_id = str(uuid.uuid4())
    script_doc = {
        "_id": script_id,
        "user_id": current_user["user_id"],
        "case_id": case_id,
        "topic": topic,
        "episode_type": episode_type,
        "duration_minutes": duration_minutes,
        "script": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.podcast_scripts.insert_one(script_doc)
    
    return {
        "id": script_id,
        "script": response,
        "topic": topic,
        "episode_type": episode_type,
        "duration_minutes": duration_minutes,
        "word_count": len(response.split()),
        "created_at": script_doc["created_at"]
    }


@router.get("/api/podcast/topics")
async def get_podcast_topics():
    """Get suggested podcast topics"""
    return {
        "categories": [
            {
                "name": "Constitutional Rights",
                "topics": [
                    "Fourth Amendment: When CPS Can (and Can't) Enter Your Home",
                    "Understanding Due Process in CPS Cases",
                    "Your Fifth Amendment Rights During CPS Interviews",
                    "Religious Freedom and CPS: Know Your First Amendment Rights"
                ]
            },
            {
                "name": "CPS Procedures",
                "topics": [
                    "What Happens During a CPS Investigation: Step by Step",
                    "Safety Plans: Your Rights and How to Negotiate",
                    "Understanding the Adjudication Hearing",
                    "The Permanency Planning Process Explained"
                ]
            },
            {
                "name": "Legal Strategy",
                "topics": [
                    "How to File a Section 1983 Lawsuit Against CPS",
                    "Defeating Qualified Immunity: Strategies That Work",
                    "Discovery in CPS Cases: Getting the Records You Need",
                    "Appeals in Dependency Cases: Deadlines and Strategies"
                ]
            },
            {
                "name": "Case Law Deep Dives",
                "topics": [
                    "Santosky v. Kramer: The Case That Changed CPS Forever",
                    "Troxel v. Granville: Parental Rights as Fundamental",
                    "Recent Circuit Court Victories Against CPS",
                    "State Supreme Court Cases Every Parent Should Know"
                ]
            },
            {
                "name": "Practical Defense",
                "topics": [
                    "Documenting Everything: Building Your Defense from Day One",
                    "Working with Court-Appointed Attorneys Effectively",
                    "How to Testify in Your Own Case",
                    "Dealing with Biased Caseworkers"
                ]
            }
        ]
    }


@router.get("/api/podcast/scripts")
async def get_user_podcast_scripts(current_user: dict = Depends(get_current_user)):
    """Get all podcast scripts for the user"""
    db = get_db()
    scripts = await db.podcast_scripts.find(
        {"user_id": current_user["user_id"]},
        {"_id": 1, "topic": 1, "episode_type": 1, "duration_minutes": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(50)
    
    for s in scripts:
        s["id"] = s.pop("_id")
    
    return {"scripts": scripts}


# ============== DEEP CASE LAW ANALYSIS ==============


