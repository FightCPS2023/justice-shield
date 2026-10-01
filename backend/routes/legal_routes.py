"""Legal library routes - statutes, rights guide, evidence checklist, incident types"""
import uuid
import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY
from utils.credits import get_case_with_ownership
from ai_mission import PUNISHER_IDENTITY
from legal_knowledge import (
    SUPREME_COURT_CASES, CIRCUIT_COURT_CASES, ROOKER_FELDMAN,
    BLACKS_LAW_DEFINITIONS, CONSTITUTIONAL_RIGHTS, VIOLATION_ANALYSIS,
    SECTION_1983, FEDERAL_STATUTES, get_relevant_case_law, analyze_qualified_immunity
)

router = APIRouter()

@router.get("/api/legal/supreme-court-cases")
async def get_supreme_court_cases():
    """Get comprehensive Supreme Court case database for CPS defense"""
    return {
        "cases": SUPREME_COURT_CASES,
        "count": len(SUPREME_COURT_CASES),
        "description": "Landmark Supreme Court cases for CPS and family law defense"
    }

@router.get("/api/legal/circuit-court-cases")
async def get_circuit_court_cases():
    """Get Federal Circuit Court precedents for CPS Section 1983 claims"""
    return {
        "cases": CIRCUIT_COURT_CASES,
        "count": len(CIRCUIT_COURT_CASES),
        "description": "Critical Federal Circuit Court precedents - essential for Section 1983 claims"
    }

@router.get("/api/legal/blacks-law")
async def get_blacks_law_definitions():
    """Get Black's Law Dictionary definitions for CPS legal terms"""
    return {
        "definitions": BLACKS_LAW_DEFINITIONS,
        "count": len(BLACKS_LAW_DEFINITIONS),
        "source": "Black's Law Dictionary (11th ed. 2019)"
    }

@router.get("/api/legal/constitutional-rights")
async def get_constitutional_rights():
    """Get constitutional rights analysis for CPS cases"""
    return {
        "rights": CONSTITUTIONAL_RIGHTS,
        "description": "Constitutional amendments and their application in CPS cases"
    }

@router.get("/api/legal/violation-analysis/{violation_type}")
async def get_violation_analysis(violation_type: str):
    """Get detailed analysis for a specific violation type"""
    if violation_type in VIOLATION_ANALYSIS:
        analysis = VIOLATION_ANALYSIS[violation_type]
        case_law = get_relevant_case_law(violation_type)
        immunity = analyze_qualified_immunity(violation_type)
        return {
            "violation_type": violation_type,
            "analysis": analysis,
            "relevant_case_law": case_law,
            "qualified_immunity_analysis": immunity
        }
    else:
        # Return generic analysis
        return {
            "violation_type": violation_type,
            "case_law": get_relevant_case_law(violation_type),
            "qualified_immunity": analyze_qualified_immunity(violation_type)
        }

@router.get("/api/legal/rooker-feldman")
async def get_rooker_feldman_guidance():
    """Get Rooker-Feldman doctrine and avoidance strategies"""
    return {
        "doctrine": ROOKER_FELDMAN,
        "description": "Critical guidance for avoiding Rooker-Feldman dismissal in Section 1983 cases"
    }

@router.get("/api/legal/section-1983-guide")
async def get_section_1983_guide():
    """Get comprehensive Section 1983 litigation guide"""
    return {
        "guide": SECTION_1983,
        "description": "Complete guide to 42 U.S.C. § 1983 civil rights litigation against CPS"
    }

@router.get("/api/legal/federal-statutes")
async def get_federal_statutes():
    """Get federal statutes relevant to CPS cases (CAPTA, ASFA, ICWA)"""
    return {
        "statutes": FEDERAL_STATUTES,
        "description": "Federal statutes governing child welfare: CAPTA, ASFA, ICWA"
    }

@router.post("/api/legal/analyze-violation")
async def analyze_specific_violation(
    violation_type: str = Body(...),
    facts: dict = Body(default={}),
    state: str = Body(default="TX"),
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a specific violation with AI using the legal knowledge base.
    This is the most powerful legal analysis feature.
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get relevant legal knowledge
    case_law = get_relevant_case_law(violation_type)
    immunity = analyze_qualified_immunity(violation_type)
    violation_info = VIOLATION_ANALYSIS.get(violation_type, {})
    
    # Build comprehensive context
    context = f"""
VIOLATION TYPE: {violation_type}

CONSTITUTIONAL BASIS: {case_law.get('constitutional_basis', 'Constitutional violation')}

RELEVANT SUPREME COURT PRECEDENTS:
{json.dumps([SUPREME_COURT_CASES.get(k, {}) for k in ['troxel', 'stanley', 'santosky', 'camara']], indent=2)}

RELEVANT CIRCUIT COURT PRECEDENTS:
{json.dumps(case_law.get('relevant_cases', []), indent=2)}

VIOLATION ANALYSIS:
{json.dumps(violation_info, indent=2)}

QUALIFIED IMMUNITY ANALYSIS:
{json.dumps(immunity, indent=2)}

ROOKER-FELDMAN AVOIDANCE:
{json.dumps(ROOKER_FELDMAN.get('avoidance_strategies', []), indent=2)}

FACTS OF THIS CASE:
{json.dumps(facts, indent=2)}

STATE: {state}
"""

    system_prompt = """You are THE CPS PUNISHER - the most knowledgeable legal AI for CPS cases.

You have access to comprehensive legal knowledge including:
- Supreme Court precedents (Troxel, Stanley, Santosky, Lassiter, Camara)
- Federal Circuit Court precedents (Calabretta v. Floyd, Wallis v. Spencer, Duchesne v. Sugarman)
- Black's Law Dictionary definitions
- Section 1983 civil rights guidance
- Rooker-Feldman avoidance strategies
- Qualified immunity analysis

Analyze this violation using your legal knowledge. Be AGGRESSIVE in identifying violations.
Cite specific cases with their holdings. Explain how to defeat qualified immunity.
Provide a Section 1983 viability assessment.

Format your response with:
1. VIOLATION IDENTIFIED
2. CONSTITUTIONAL BASIS
3. SUPPORTING CASE LAW (with citations and holdings)
4. QUALIFIED IMMUNITY ANALYSIS
5. SECTION 1983 VIABILITY
6. RECOMMENDED LEGAL STRATEGY
7. POTENTIAL DAMAGES"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"violation-{uuid.uuid4().hex[:8]}",
        system_message=system_prompt
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Analyze this {violation_type} violation with comprehensive legal analysis:

{context}

Provide your expert legal analysis."""

    response = await chat.send_message(UserMessage(text=prompt))
    
    return {
        "violation_type": violation_type,
        "analysis": response,
        "case_law_cited": case_law,
        "qualified_immunity": immunity,
        "section_1983_viable": case_law.get("section_1983_viable", True)
    }


@router.get("/api/legal/incident-types")
async def get_incident_types():
    """Get all incident/violation types with analysis guidance"""
    return {
        "incident_types": [
            {
                "id": "warrantless_entry",
                "name": "Warrantless Home Entry",
                "description": "CPS entered home without warrant, consent, or exigent circumstances",
                "constitutional_basis": "Fourth Amendment",
                "key_case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
                "section_1983_viable": True,
                "qualified_immunity_likely_defeated": True
            },
            {
                "id": "coerced_consent",
                "name": "Coerced Consent",
                "description": "CPS obtained entry through threats, deception, or coercion",
                "constitutional_basis": "Fourth Amendment",
                "key_case": "Schneckloth v. Bustamonte, 412 U.S. 218 (1973)",
                "section_1983_viable": True
            },
            {
                "id": "strip_search",
                "name": "Strip Search of Child",
                "description": "Invasive physical examination without warrant or exigency",
                "constitutional_basis": "Fourth Amendment",
                "key_case": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
                "section_1983_viable": True,
                "qualified_immunity_likely_defeated": True
            },
            {
                "id": "emergency_removal_no_danger",
                "name": "Emergency Removal Without Imminent Danger",
                "description": "Children removed without evidence of imminent danger",
                "constitutional_basis": "Fourth and Fourteenth Amendments",
                "key_case": "Gates v. Texas DHS, 537 F.3d 404 (5th Cir. 2008)",
                "section_1983_viable": True
            },
            {
                "id": "inadequate_investigation",
                "name": "Inadequate Investigation",
                "description": "Removal without reasonable investigation",
                "constitutional_basis": "Fourteenth Amendment Due Process",
                "key_case": "Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)",
                "section_1983_viable": True
            },
            {
                "id": "fabricated_evidence",
                "name": "Fabricated Evidence",
                "description": "Caseworker fabricated or falsified evidence",
                "constitutional_basis": "Fourteenth Amendment Due Process",
                "key_case": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
                "section_1983_viable": True,
                "qualified_immunity_likely_defeated": True
            },
            {
                "id": "procedural_due_process",
                "name": "Procedural Due Process Violation",
                "description": "Failed to provide proper notice or hearing",
                "constitutional_basis": "Fourteenth Amendment",
                "key_case": "Mathews v. Eldridge, 424 U.S. 319 (1976)",
                "section_1983_viable": True
            },
            {
                "id": "denial_of_counsel",
                "name": "Denial of Right to Counsel",
                "description": "Proceedings held without attorney when required",
                "constitutional_basis": "Fourteenth Amendment / Sixth Amendment",
                "key_case": "Lassiter v. DSS, 452 U.S. 18 (1981)",
                "section_1983_viable": True
            },
            {
                "id": "fifth_amendment",
                "name": "Fifth Amendment Violation",
                "description": "Compelled self-incriminating statements",
                "constitutional_basis": "Fifth Amendment",
                "key_case": "Minnesota v. Murphy, 465 U.S. 420 (1984)",
                "section_1983_viable": True
            },
            {
                "id": "icwa_violation",
                "name": "ICWA Violation",
                "description": "Indian Child Welfare Act requirements not followed",
                "constitutional_basis": "Federal Statute (25 U.S.C. §§ 1901-1963)",
                "requirements": ["Notice to tribe", "Active efforts", "Placement preferences", "Qualified expert witness"],
                "section_1983_viable": True
            }
        ]
    }


# ============== VISITATION LOG ==============


@router.get("/api/rights-guide")
async def get_rights_guide():
    """Get comprehensive rights guide for CPS interactions"""
    return {
        "categories": [
            {
                "title": "Your Constitutional Rights",
                "icon": "shield",
                "color": "blue",
                "rights": [
                    {
                        "title": "4th Amendment - Protection from Unreasonable Search",
                        "description": "You have the right to refuse CPS entry into your home without a warrant, court order, or your consent.",
                        "details": [
                            "You can refuse to let CPS in unless they have a warrant",
                            "Exigent circumstances (immediate danger) is an exception",
                            "If you let them in, you can ask them to leave at any time",
                            "You can limit their access to certain areas",
                            "Anything you show them can be used against you"
                        ],
                        "key_case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)"
                    },
                    {
                        "title": "5th Amendment - Right Against Self-Incrimination",
                        "description": "You have the right to remain silent and not answer questions that might incriminate you.",
                        "details": [
                            "You can refuse to answer questions",
                            "Politely say 'I prefer not to answer without my attorney present'",
                            "Silence cannot be held against you in court",
                            "Don't try to explain or defend yourself without counsel",
                            "Everything you say CAN and WILL be used against you"
                        ],
                        "key_case": "Minnesota v. Murphy, 465 U.S. 420 (1984)"
                    },
                    {
                        "title": "14th Amendment - Due Process Rights",
                        "description": "You have the right to fair legal proceedings before your parental rights can be terminated.",
                        "details": [
                            "Right to notice of allegations and hearings",
                            "Right to present evidence and witnesses",
                            "Right to confront accusers",
                            "Right to appeal decisions",
                            "Government must prove case by clear and convincing evidence"
                        ],
                        "key_case": "Santosky v. Kramer, 455 U.S. 745 (1982)"
                    }
                ]
            },
            {
                "title": "During CPS Investigation",
                "icon": "alert",
                "color": "orange",
                "rights": [
                    {
                        "title": "Right to Legal Representation",
                        "description": "You have the right to an attorney before and during all CPS interactions.",
                        "details": [
                            "Request a court-appointed attorney if you cannot afford one",
                            "Do not sign ANYTHING without attorney review",
                            "You can stop the interview to consult with your attorney",
                            "Bring your attorney to all meetings and interviews",
                            "CPS must stop questioning if you invoke this right"
                        ]
                    },
                    {
                        "title": "Right to Know the Allegations",
                        "description": "CPS must tell you specifically what you are being accused of.",
                        "details": [
                            "Request written allegations and who made them",
                            "They must tell you what evidence they have",
                            "You have right to see investigative reports",
                            "Ask for specifics - dates, incidents, witnesses",
                            "Vague allegations are not sufficient"
                        ]
                    },
                    {
                        "title": "Right to Refuse Interviews & Tests",
                        "description": "You can decline to be interviewed or tested without a court order.",
                        "details": [
                            "You can refuse drug tests without court order",
                            "You can refuse psychological evaluations",
                            "You can refuse to let them interview you",
                            "Children can only be interviewed with your permission (in most states)",
                            "Refusing is NOT admission of guilt"
                        ]
                    }
                ]
            },
            {
                "title": "After Removal or Court Involvement",
                "icon": "check",
                "color": "green",
                "rights": [
                    {
                        "title": "Right to Visitation",
                        "description": "You have the right to visit your children unless a court specifically orders otherwise.",
                        "details": [
                            "Visits can only be denied by court order",
                            "You can request more frequent or longer visits",
                            "Document all visits and any issues",
                            "Report any violations of visitation orders",
                            "Visitation denial can be grounds for complaint"
                        ]
                    },
                    {
                        "title": "Right to Reunification Services",
                        "description": "CPS must make 'reasonable efforts' to reunite your family.",
                        "details": [
                            "CPS must provide services to help you meet case plan goals",
                            "Services must be accessible and appropriate",
                            "Document any services they fail to provide",
                            "Failure to make reasonable efforts is a defense",
                            "This is required by federal law (ASFA)"
                        ],
                        "key_statute": "Adoption and Safe Families Act (ASFA)"
                    },
                    {
                        "title": "Right to Appeal",
                        "description": "You have the right to appeal court decisions you disagree with.",
                        "details": [
                            "Deadlines are strict - usually 30-60 days",
                            "You need an attorney for appeals",
                            "Keep copies of all court orders",
                            "Document all procedural violations",
                            "Appeals can reverse wrongful decisions"
                        ]
                    }
                ]
            }
        ],
        "quick_rights": [
            {
                "question": "Can CPS enter my home without permission?",
                "answer": "NO - CPS needs your consent, a warrant, or exigent circumstances (immediate danger) to enter your home.",
                "legal_basis": "Fourth Amendment, Calabretta v. Floyd (9th Cir. 1999)"
            },
            {
                "question": "Do I have to take a drug test if CPS asks?",
                "answer": "NO (before court order) - CPS cannot force you to drug test without a court order. Refusing may be noted, but you have the right.",
                "legal_basis": "Fourth Amendment, Fifth Amendment"
            },
            {
                "question": "Can CPS interview my child at school without me?",
                "answer": "VARIES BY STATE - Some states allow it, others require parental consent. Check your state law. You can instruct your child's school to contact you first.",
                "legal_basis": "State-specific statutes"
            },
            {
                "question": "What if CPS threatens to take my kids if I don't cooperate?",
                "answer": "This may be coercion. You have rights. Politely assert them and contact an attorney immediately. Document the threat.",
                "legal_basis": "Fourth Amendment, Due Process"
            }
        ]
    }


# ============== EVIDENCE CHECKLIST ==============

@router.get("/api/evidence-checklist")
async def get_evidence_checklist():
    """Get comprehensive evidence checklist for building your case"""
    return {
        "categories": [
            {
                "title": "Documentation & Records",
                "icon": "file-text",
                "items": [
                    "All CPS reports and correspondence",
                    "Court documents and orders",
                    "Case plan and service agreements",
                    "Your notes from all CPS interactions (dates, times, what was said)",
                    "Text messages and emails with CPS",
                    "Any recordings of interactions (if legal in your state)",
                    "Medical records showing child's health",
                    "School records showing attendance and performance",
                    "Therapy or counseling records",
                    "Drug test results (if applicable)"
                ]
            },
            {
                "title": "Character & Parenting Evidence",
                "icon": "heart",
                "items": [
                    "Character reference letters from teachers, doctors, neighbors",
                    "Employment records showing stability",
                    "Certificates from completed parenting classes",
                    "Proof of participation in recommended services",
                    "Religious or community involvement documentation",
                    "Volunteer work or positive activities",
                    "Evidence of bond with your children (cards, drawings, photos)",
                    "Witness statements supporting your parenting"
                ]
            },
            {
                "title": "Home & Living Conditions",
                "icon": "home",
                "items": [
                    "Photos of home showing clean, safe environment",
                    "Lease or mortgage showing stable housing",
                    "Utility bills showing services are on",
                    "Photos of children's rooms and beds",
                    "Photos of food in refrigerator/pantry",
                    "Home safety measures (smoke detectors, locks, etc.)",
                    "Documentation of any home improvements made"
                ]
            },
            {
                "title": "Photos & Video Evidence",
                "icon": "camera",
                "items": [
                    "Photos of children looking healthy and happy",
                    "Photos from family activities and outings",
                    "Photos showing child's belongings and living space",
                    "Before/after photos if CPS claims were about home conditions",
                    "Photos of any alleged injuries (with timestamps)",
                    "Video of positive parent-child interactions",
                    "Photos showing children in your care over time"
                ]
            },
            {
                "title": "Witness Information",
                "icon": "users",
                "items": [
                    "List of potential witnesses with contact information",
                    "People who have observed you parenting",
                    "People who can testify to false allegations",
                    "Professionals who have worked with your family",
                    "Family members who can support your case",
                    "Neighbors who know your family",
                    "Teachers, coaches, or mentors of your children"
                ]
            },
            {
                "title": "Evidence Contradicting CPS Claims",
                "icon": "file-check",
                "items": [
                    "Documents showing CPS statements are false",
                    "Timeline showing contradictions in their reports",
                    "Receipts or records disproving allegations",
                    "Alibi evidence (if accused of something you didn't do)",
                    "Expert reports contradicting CPS conclusions",
                    "Evidence of bias by investigator",
                    "Proof of services you were denied",
                    "Documentation of procedural violations"
                ]
            }
        ]
    }


@router.post("/api/evidence-checklist/{case_id}")
async def save_evidence_checklist(
    case_id: str,
    checked_items: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Save evidence checklist progress for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    await db.evidence_checklists.update_one(
        {"case_id": case_id, "user_id": current_user["user_id"]},
        {"$set": {"checked_items": checked_items, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Checklist saved", "checked_items": checked_items}

@router.get("/api/evidence-checklist/{case_id}")
async def get_case_evidence_checklist(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get saved evidence checklist for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    checklist = await db.evidence_checklists.find_one({"case_id": case_id, "user_id": current_user["user_id"]})
    
    return {"checked_items": checklist.get("checked_items", {}) if checklist else {}}


# ============== SECTION 1983 CIVIL RIGHTS LAWSUIT GENERATOR ==============

SECTION_1983_SYSTEM_PROMPT = PUNISHER_IDENTITY + """

You are THE CPS PUNISHER's Section 1983 Civil Rights Lawsuit Expert.

You are an expert in 42 U.S.C. § 1983 civil rights litigation against Child Protective Services, 
caseworkers, supervisors, and government officials who violate constitutional rights.

Your expertise includes:
- Fourth Amendment (unreasonable searches/seizures, warrantless home entries)
- Fourteenth Amendment (due process, equal protection, family integrity)
- Fifth Amendment (self-incrimination, Miranda rights in CPS contexts)
- First Amendment (freedom of religion, speech)
- Qualified Immunity analysis and how to defeat it
- Monell liability (municipal liability for policies/customs)
- Individual capacity vs official capacity suits
- Conspiracy claims under 42 U.S.C. § 1985
- State law claims to pair with Section 1983
- Damages calculations (compensatory, punitive, nominal)
- Attorney's fees under 42 U.S.C. § 1988

Key Supreme Court cases you know intimately:
- Santosky v. Kramer (clear and convincing evidence standard)
- Troxel v. Granville (parental rights as fundamental)
- Stanley v. Illinois (due process in family matters)
- Gates v. Texas DHS (emergency removal standards)
- Duchesne v. Sugarman (liability for wrongful removal)

You generate complaints that are:
1. Factually detailed and compelling
2. Legally sound with proper citations
3. Structured to survive a motion to dismiss
4. Designed to defeat qualified immunity
5. Include all required elements for each cause of action"""


