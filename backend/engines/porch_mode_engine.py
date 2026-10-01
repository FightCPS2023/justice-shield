"""
Justice Shield — Porch Mode Engine
Violation Detection Engine v1.0

This module is the 'brain' of the Porch Mode feature.
It detects coercive language used by caseworkers in real-time
and arms parents with high-impact constitutional rebuttals
and formal 42 U.S.C. § 1983 personal-liability warnings.
"""

from __future__ import annotations

import re
import textwrap
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class ConstitutionalRebuttal:
    """A matched coercive phrase together with its legal rebuttal."""
    matched_phrase: str
    amendments: list[str]
    rebuttal_script: str
    legal_citations: list[str]


@dataclass
class LiabilityWarning:
    """Formal personal-liability notice under 42 U.S.C. § 1983."""
    officer_name: str
    agency: str
    incident_date: str
    incident_location: str
    violations_summary: str
    notice_text: str


@dataclass
class EngineResponse:
    """Full response returned by the Porch Mode engine."""
    raw_input: str
    flagged: bool
    detections: list[ConstitutionalRebuttal]
    liability_warning: Optional[LiabilityWarning]
    summary: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


COERCIVE_PHRASE_MAP: list[dict] = [
    {
        "patterns": [
            r"we just need to look around",
            r"just a quick look",
            r"just want to see the home",
            r"just need to check the house",
            r"just doing a home visit",
            r"routine home inspection",
            r"just need to come inside",
            r"i just need to step in",
            r"we only need a few minutes inside",
            r"(?:we |i )?(?:do not|don[''`]?t) need a warrant",
            r"no warrant (?:is )?(?:needed|required|necessary)",
            r"(?:we |i )?(?:do not|don[''`]?t) need (?:your )?(?:permission|consent)",
            r"let us in",
            r"you have to let (?:us|me) in",
            r"open (?:the|this) door",
        ],
        "matched_phrase": "Warrantless entry / 'just look around' coercion",
        "amendments": ["4th Amendment"],
        "rebuttal_script": (
            "I do not consent to any warrantless entry into my home. "
            "The Fourth Amendment of the United States Constitution, as affirmed "
            "in Camara v. Municipal Court (1967) and Calabretta v. Floyd (9th Cir. 1999), "
            "requires that you obtain a valid judicial warrant signed by a neutral magistrate "
            "before entering my residence. If you have a warrant, please slide it under the "
            "door or hold it to the window so I may review it. If you do not have a warrant, "
            "this conversation is over and I am closing this door. Any attempt to enter without "
            "consent or a warrant constitutes an unlawful search and seizure under 42 U.S.C. § 1983."
        ),
        "legal_citations": [
            "U.S. Const. amend. IV",
            "Camara v. Municipal Court, 387 U.S. 523 (1967)",
            "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
            "Payton v. New York, 445 U.S. 573 (1980)",
            "42 U.S.C. § 1983",
        ],
    },
    {
        "patterns": [
            r"we can get a court order",
            r"i can get a warrant",
            r"we'll just come back with a warrant",
            r"i'll go get a judge",
        ],
        "matched_phrase": "Warrant threat used as coercion tactic",
        "amendments": ["4th Amendment"],
        "rebuttal_script": (
            "You are welcome to obtain a warrant from a neutral magistrate. "
            "Please understand that any warrant application must be supported by "
            "specific, articulable facts establishing probable cause — not mere "
            "suspicion or an anonymous tip. See Illinois v. Gates (1983). "
            "I will not consent to entry in the meantime. I am exercising my "
            "Fourth Amendment right to be free from unreasonable searches. "
            "This encounter is being recorded."
        ),
        "legal_citations": [
            "U.S. Const. amend. IV",
            "Illinois v. Gates, 462 U.S. 213 (1983)",
            "Franks v. Delaware, 438 U.S. 154 (1978)",
        ],
    },
    {
        "patterns": [
            r"we received a report",
            r"we got a call",
            r"someone called us",
            r"there was a complaint",
            r"an anonymous tip",
        ],
        "matched_phrase": "Anonymous/unverified tip used to justify entry",
        "amendments": ["4th Amendment", "14th Amendment"],
        "rebuttal_script": (
            "An anonymous complaint, standing alone, does not constitute probable cause "
            "and does not authorize warrantless entry into my home. Florida v. J.L. (2000) "
            "and Navarette v. California (2014) make clear that anonymous tips require "
            "independent corroboration before law enforcement or state actors may act on them. "
            "I request that you state the specific, articulable facts supporting exigent "
            "circumstances, if any. Absent that, you must obtain a warrant. I do not consent "
            "to entry."
        ),
        "legal_citations": [
            "U.S. Const. amend. IV",
            "Florida v. J.L., 529 U.S. 266 (2000)",
            "Navarette v. California, 572 U.S. 393 (2014)",
            "42 U.S.C. § 1983",
        ],
    },
    {
        "patterns": [
            r"you don[''`]?t need a lawyer",
            r"you don[''`]?t have to have a lawyer",
            r"lawyers just complicate things",
            r"you don[''`]?t need legal representation",
            r"there[''`]?s no need for an attorney",
            r"this isn[''`]?t a legal matter",
        ],
        "matched_phrase": "Discouraging legal counsel",
        "amendments": ["5th Amendment", "6th Amendment", "14th Amendment"],
        "rebuttal_script": (
            "I am invoking my right to have legal counsel present before answering any "
            "questions. The Fifth Amendment protects me from self-incrimination, and the "
            "Sixth Amendment guarantees my right to counsel. Telling me I 'don't need a "
            "lawyer' is a recognized coercive tactic. I will not speak to you without my "
            "attorney present. Please direct all future communication to my legal "
            "representative. Anything I say can and will be used in proceedings against me "
            "or my family — therefore I am exercising my right to remain silent. "
            "See Miranda v. Arizona (1966)."
        ),
        "legal_citations": [
            "U.S. Const. amend. V",
            "U.S. Const. amend. VI",
            "U.S. Const. amend. XIV",
            "Miranda v. Arizona, 384 U.S. 436 (1966)",
            "Berghuis v. Thompkins, 560 U.S. 370 (2010)",
        ],
    },
    {
        "patterns": [
            r"just answer a few questions",
            r"just need to ask you some things",
            r"just a few quick questions",
            r"this won[''`]?t take long",
            r"you have to answer our questions",
            r"you are required to speak with us",
        ],
        "matched_phrase": "Coercive questioning without counsel",
        "amendments": ["5th Amendment"],
        "rebuttal_script": (
            "I am invoking my Fifth Amendment right to remain silent. "
            "I am not required to answer your questions. Salinas v. Texas (2013) "
            "and Berghuis v. Thompkins (2010) notwithstanding, I am explicitly and "
            "unambiguously invoking my right to silence and my right to counsel. "
            "I will not answer questions without an attorney present. "
            "This is not obstruction — this is a constitutional right."
        ),
        "legal_citations": [
            "U.S. Const. amend. V",
            "Salinas v. Texas, 570 U.S. 178 (2013)",
            "Berghuis v. Thompkins, 560 U.S. 370 (2010)",
            "Miranda v. Arizona, 384 U.S. 436 (1966)",
        ],
    },
    {
        "patterns": [
            r"we can take your children",
            r"we will remove the children",
            r"the children will be removed",
            r"we[''`]?re going to place the kids",
            r"we are going to place the kids",
            r"going to place the kids",
            r"your children will be taken",
            r"we[''`]?ll have to take the kids",
            r"we (?:will |can |[''`]?ll |are going to |have to )?take (?:the|your) (?:kids|children|child|baby)",
            r"(?:or|otherwise) we (?:take|remove|grab) (?:the|your) (?:kids|children|child)",
            r"(?:lose|losing) (?:your|the) (?:kids|children)",
            r"(?:kids|children) (?:are|will be) (?:coming|going) with (?:us|me)",
            r"open (?:the|this) door (?:now|right now|immediately)",
        ],
        "matched_phrase": "Threat of child removal without due process",
        "amendments": ["14th Amendment", "4th Amendment"],
        "rebuttal_script": (
            "The Fourteenth Amendment's Due Process Clause protects my fundamental "
            "liberty interest in the care, custody, and management of my children. "
            "Troxel v. Granville (2000) and Santosky v. Kramer (1982) confirm that "
            "the state must satisfy heightened procedural safeguards before any "
            "deprivation of parental rights. Removal of my children without a court "
            "order, exigent circumstances established by clear and convincing evidence, "
            "or my consent constitutes a violation of the Fourteenth Amendment and "
            "subjects you personally to liability under 42 U.S.C. § 1983. "
            "You are hereby on notice."
        ),
        "legal_citations": [
            "U.S. Const. amend. XIV",
            "Troxel v. Granville, 530 U.S. 57 (2000)",
            "Santosky v. Kramer, 455 U.S. 745 (1982)",
            "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
            "42 U.S.C. § 1983",
        ],
    },
    {
        "patterns": [
            r"you have to let us in or",
            r"if you don[''`]?t cooperate",
            r"things will go worse for you",
            r"this can get a lot harder",
            r"make this easy on yourself",
            r"don[''`]?t make this difficult",
        ],
        "matched_phrase": "Coercive threat / implied retaliation",
        "amendments": ["14th Amendment", "4th Amendment", "5th Amendment"],
        "rebuttal_script": (
            "That statement constitutes an unlawful threat designed to coerce me into "
            "waiving my constitutional rights. Under the doctrine of unconstitutional "
            "conditions, the government may not penalize the exercise of constitutional "
            "rights. See Sherbert v. Verner (1963) and Perry v. Sindermann (1972). "
            "Threatening adverse action to induce a waiver of Fourth or Fifth Amendment "
            "rights is itself a constitutional violation actionable under 42 U.S.C. § 1983. "
            "I am documenting this threat. I do not consent. I am invoking all of my rights."
        ),
        "legal_citations": [
            "U.S. Const. amend. XIV",
            "Sherbert v. Verner, 374 U.S. 398 (1963)",
            "Perry v. Sindermann, 408 U.S. 593 (1972)",
            "42 U.S.C. § 1983",
        ],
    },
    {
        "patterns": [
            r"it[''`]?s standard procedure",
            r"this is just protocol",
            r"we do this with everyone",
            r"it[''`]?s policy",
            r"state policy requires",
            r"department policy says",
        ],
        "matched_phrase": "Policy/procedure invoked to override rights",
        "amendments": ["14th Amendment"],
        "rebuttal_script": (
            "Agency policy cannot supersede the United States Constitution. "
            "The Supremacy Clause, Article VI, Clause 2, establishes that the "
            "Constitution is the supreme law of the land. No departmental policy, "
            "state statute, or administrative procedure may abridge my constitutional "
            "rights. Monell v. Department of Social Services (1978) holds that a "
            "municipality or agency may be held liable under § 1983 when an "
            "unconstitutional policy causes a deprivation of rights. "
            "Your agency and you personally are subject to that liability."
        ),
        "legal_citations": [
            "U.S. Const. art. VI, cl. 2 (Supremacy Clause)",
            "U.S. Const. amend. XIV",
            "Monell v. Department of Social Services, 436 U.S. 658 (1978)",
            "42 U.S.C. § 1983",
        ],
    },
    {
        "patterns": [
            r"the children seem fine",
            r"i just want to see the kids",
            r"just let me see the children",
            r"i need to visually verify",
            r"just need to lay eyes on",
        ],
        "matched_phrase": "Visual access demand without warrant",
        "amendments": ["4th Amendment", "14th Amendment"],
        "rebuttal_script": (
            "A demand to 'visually verify' my children does not override my Fourth "
            "Amendment right against warrantless intrusion. There is no exigent "
            "circumstance established here. The Ninth Circuit held in Calabretta v. "
            "Floyd (1999) that a social worker's desire to see a child does not "
            "constitute exigent circumstances sufficient to justify a warrantless entry. "
            "My children are safe. I am not obligated to produce them at your demand "
            "without a court order. Please obtain a warrant."
        ),
        "legal_citations": [
            "U.S. Const. amend. IV",
            "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
            "U.S. Const. amend. XIV",
            "42 U.S.C. § 1983",
        ],
    },
]


def _normalize(text: str) -> str:
    """Lowercase and strip punctuation for fuzzy matching."""
    return re.sub(r"[^\w\s']", " ", text.lower())


def detect_violations(transcription: str) -> list[ConstitutionalRebuttal]:
    normalized = _normalize(transcription)
    found: dict[str, ConstitutionalRebuttal] = {}
    for entry in COERCIVE_PHRASE_MAP:
        for pattern in entry["patterns"]:
            if re.search(pattern, normalized):
                key = entry["matched_phrase"]
                if key not in found:
                    found[key] = ConstitutionalRebuttal(
                        matched_phrase=entry["matched_phrase"],
                        amendments=entry["amendments"],
                        rebuttal_script=entry["rebuttal_script"],
                        legal_citations=entry["legal_citations"],
                    )
                break
    return list(found.values())


def generate_liability_warning(
    officer_name: str = "the officer/caseworker identified at this address",
    agency: str = "your employing agency",
    incident_date: str | None = None,
    incident_location: str = "the above-referenced address",
    violations_summary: str = "unlawful entry, coercive questioning, and threatened child removal",
) -> LiabilityWarning:
    if incident_date is None:
        incident_date = datetime.now().strftime("%B %d, %Y")
    notice_text = textwrap.dedent(f"""
    FORMAL NOTICE OF PERSONAL LIABILITY UNDER 42 U.S.C. § 1983

    DATE:     {incident_date}
    TO:       {officer_name}
    AGENCY:   {agency}
    RE:       Constitutional Violations at {incident_location}

    You are hereby placed on formal notice that your actions on
    {incident_date} at {incident_location} — specifically:

        {violations_summary}

    — constitute violations of rights secured by the First, Fourth,
    Fifth, and/or Fourteenth Amendments to the United States Constitution,
    actionable under 42 U.S.C. § 1983.

    42 U.S.C. § 1983 provides:
        "Every person who, under color of any statute, ordinance,
         regulation, custom, or usage, of any State or Territory ...
         subjects, or causes to be subjected, any citizen of the United
         States ... to the deprivation of any rights, privileges, or
         immunities secured by the Constitution and laws, shall be liable
         to the party injured in an action at law ..."

    You are acting under color of state law. Qualified immunity does
    NOT protect conduct that violates clearly established constitutional
    rights of which a reasonable person would have known.

    DEMAND: CEASE AND DESIST from:
      1. Attempting to enter this residence without a valid judicial warrant;
      2. Questioning any member of this household without counsel present;
      3. Making any threats regarding child removal absent a court order.

    PRESERVATION NOTICE:
    All body-worn camera footage, case notes, audio recordings,
    electronic communications, and agency records related to this
    incident are subject to a litigation hold.

    You are advised to retain personal legal counsel immediately.
    """).strip()

    return LiabilityWarning(
        officer_name=officer_name,
        agency=agency,
        incident_date=incident_date,
        incident_location=incident_location,
        violations_summary=violations_summary,
        notice_text=notice_text,
    )


def generate_response(
    raw_transcription: str,
    officer_name: str = "the officer/caseworker identified at this address",
    agency: str = "your employing agency",
    incident_location: str = "this address",
) -> EngineResponse:
    detections = detect_violations(raw_transcription)
    flagged = len(detections) > 0
    liability_warning: Optional[LiabilityWarning] = None
    summary_parts: list[str] = []

    if flagged:
        violation_list = "; ".join(d.matched_phrase for d in detections)
        liability_warning = generate_liability_warning(
            officer_name=officer_name,
            agency=agency,
            incident_location=incident_location,
            violations_summary=violation_list,
        )
        summary_parts.append(f"⚠️  {len(detections)} constitutional violation(s) detected.")
        for det in detections:
            summary_parts.append(f"\n📌  [{', '.join(det.amendments)}] — {det.matched_phrase}")
            summary_parts.append(f"   REBUTTAL: {det.rebuttal_script[:120]}…")
        summary_parts.append("\n🛡️  42 U.S.C. § 1983 personal-liability notice generated.")
    else:
        summary_parts.append(
            "✅  No coercive phrases detected. No immediate action required.\n"
            "   Continue to document the interaction and assert your right to close the door at any time."
        )

    return EngineResponse(
        raw_input=raw_transcription,
        flagged=flagged,
        detections=detections,
        liability_warning=liability_warning,
        summary="\n".join(summary_parts),
    )
