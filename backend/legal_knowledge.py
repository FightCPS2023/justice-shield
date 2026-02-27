"""
COMPREHENSIVE LEGAL KNOWLEDGE BASE FOR CPS DEFENSE
Integrated from CPS Punisher original application

This contains real case law, statutes, constitutional principles,
Black's Law definitions, and sophisticated legal reasoning.
"""

# ============================================================================
# LANDMARK SUPREME COURT CASES - CPS & FAMILY LAW
# ============================================================================

SUPREME_COURT_CASES = {
    "troxel": {
        "citation": "Troxel v. Granville, 530 U.S. 57 (2000)",
        "holding": "The liberty interest of parents in the care, custody, and control of their children is 'perhaps the oldest of the fundamental liberty interests recognized by this Court.'",
        "application": "Parents have a fundamental constitutional right to make decisions concerning the care, custody, and control of their children.",
        "key_quotes": [
            "The interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests recognized by this Court.",
            "So long as a parent adequately cares for his or her children, there will normally be no reason for the State to inject itself into the private realm of the family."
        ],
        "use_for": ["Parental rights challenges", "State interference objections", "Fundamental rights violations"],
        "legal_test": "Strict scrutiny applies when state infringes on fundamental parental rights"
    },
    "stanley": {
        "citation": "Stanley v. Illinois, 405 U.S. 645 (1972)",
        "holding": "Parents have a fundamental right to raise their children, and the state cannot terminate parental rights without due process.",
        "application": "State must provide procedural protections before terminating or restricting parental rights.",
        "key_quotes": [
            "The rights to conceive and to raise one's children have been deemed essential.",
            "The private interest here, that of a man in the children he has sired and raised, undeniably warrants deference and, absent a powerful countervailing interest, protection."
        ],
        "use_for": ["Due process violations", "Termination of parental rights", "Procedural rights"],
        "legal_test": "Due process required before state can interfere with parent-child relationship"
    },
    "santosky": {
        "citation": "Santosky v. Kramer, 455 U.S. 745 (1982)",
        "holding": "Clear and convincing evidence standard required for termination of parental rights.",
        "application": "State must prove by clear and convincing evidence that grounds exist to terminate parental rights.",
        "key_quotes": [
            "The fundamental liberty interest of natural parents in the care, custody, and management of their child does not evaporate simply because they have not been model parents.",
            "Before a State may sever completely and irrevocably the rights of parents in their natural child, due process requires that the State support its allegations by at least clear and convincing evidence."
        ],
        "use_for": ["Burden of proof challenges", "Evidentiary standards", "TPR proceedings"],
        "legal_test": "Clear and convincing evidence standard for termination of parental rights"
    },
    "lassiter": {
        "citation": "Lassiter v. Department of Social Services, 452 U.S. 18 (1981)",
        "holding": "Right to counsel in termination proceedings determined by case-by-case analysis, but often required.",
        "application": "Parents may have right to appointed counsel in TPR proceedings depending on circumstances.",
        "key_quotes": [
            "A parent's desire for and right to 'the companionship, care, custody, and management of his or her children' is an important interest that 'undeniably warrants deference and, absent a powerful countervailing interest, protection.'"
        ],
        "use_for": ["Right to counsel", "Due process violations", "Procedural protections"],
        "legal_test": "Mathews v. Eldridge balancing test for procedural due process"
    },
    "camara": {
        "citation": "Camara v. Municipal Court, 387 U.S. 523 (1967)",
        "holding": "Administrative searches generally require warrants or consent.",
        "application": "CPS home visits may constitute searches requiring warrants unless consent or exigent circumstances.",
        "key_quotes": [
            "Except in certain carefully defined classes of cases, a search of private property without proper consent is unreasonable unless it has been authorized by a valid search warrant."
        ],
        "use_for": ["Warrantless home visits", "Fourth Amendment violations", "Consent challenges"],
        "legal_test": "Warrant requirement for administrative searches absent consent or exigency"
    },
    "minnesota_v_murphy": {
        "citation": "Minnesota v. Murphy, 465 U.S. 420 (1984)",
        "holding": "Fifth Amendment protections apply in civil proceedings with potential criminal implications.",
        "application": "Parents can invoke Fifth Amendment privilege in CPS proceedings if testimony could lead to criminal charges.",
        "key_quotes": [
            "The Fifth Amendment privilege against compulsory self-incrimination is not limited to proceedings in which a criminal conviction is sought."
        ],
        "use_for": ["Self-incrimination objections", "Coerced statements", "Miranda violations"],
        "legal_test": "Privilege applies when answers could lead to criminal prosecution"
    }
}

# ============================================================================
# FEDERAL CIRCUIT COURT CASES - CRITICAL CPS PRECEDENTS
# ============================================================================

CIRCUIT_COURT_CASES = {
    "calabretta_v_floyd": {
        "citation": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
        "circuit": "9th Circuit",
        "holding": "CPS social workers need warrant or exigent circumstances to enter home and examine child over parental objection.",
        "application": "Parents can refuse warrantless CPS entry absent consent or emergency.",
        "key_quotes": [
            "Investigatory home visits that involve the interviewing of children are searches within the meaning of the Fourth Amendment.",
            "Government officials may not enter a home without a warrant or one of the well-established exceptions to the warrant requirement, even when seeking to investigate suspected child abuse."
        ],
        "use_for": ["Warrantless home entry", "CPS violations", "Fourth Amendment § 1983 claims"],
        "section_1983": True,
        "qualified_immunity": "Clearly established law - no QI if warrantless entry without exigency"
    },
    "wallis_v_spencer": {
        "citation": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
        "circuit": "9th Circuit",
        "holding": "Strip searching child without warrant or exigent circumstances violates Fourth Amendment.",
        "application": "CPS cannot conduct invasive searches of children without parental consent, warrant, or emergency.",
        "key_quotes": [
            "A visual body cavity search of a child in state custody is an invasion of the child's privacy that is sufficiently serious to require a warrant absent exigent circumstances."
        ],
        "use_for": ["Invasive searches", "Child examinations", "Fourth Amendment violations"],
        "section_1983": True,
        "qualified_immunity": "Clearly established - no QI for warrantless strip searches"
    },
    "duchesne_v_sugarman": {
        "citation": "Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)",
        "circuit": "2nd Circuit",
        "holding": "Due process violated when children removed without adequate investigation or evidence.",
        "application": "CPS must conduct reasonable investigation before emergency removal.",
        "key_quotes": [
            "The state cannot constitutionally remove a child from its parents' custody without prior notice and a hearing, except in emergency circumstances where there is an imminent danger to the child's life or health."
        ],
        "use_for": ["Wrongful removal", "Inadequate investigation", "Due process violations"],
        "section_1983": True,
        "qualified_immunity": "May be overcome if investigation grossly inadequate"
    },
    "croft_v_westmoreland": {
        "citation": "Croft v. Westmoreland County, 103 F.3d 1123 (3rd Cir. 1997)",
        "circuit": "3rd Circuit",
        "holding": "Parents have constitutionally protected liberty interest in family integrity; investigation must be reasonable.",
        "application": "Overreaching CPS investigation violates substantive due process.",
        "key_quotes": [
            "Parents have a constitutionally protected liberty interest in the companionship, care, custody, and management of their children."
        ],
        "use_for": ["Family integrity claims", "Substantive due process", "Overreaching investigation"],
        "section_1983": True
    },
    "gates_v_texas": {
        "citation": "Gates v. Texas Department of Protective Services, 537 F.3d 404 (5th Cir. 2008)",
        "circuit": "5th Circuit",
        "holding": "Emergency removal requires imminent danger; reasonable investigation is required.",
        "application": "CPS must have reasonable cause to believe child faces imminent danger for emergency removal.",
        "key_quotes": [
            "The emergency exception requires that the danger to the child be imminent - that is, immediate and present - and that an investigation could not reasonably be undertaken."
        ],
        "use_for": ["Emergency removal challenges", "Fifth Circuit precedent", "Imminent danger standard"],
        "section_1983": True
    },
    "tenenbaum_v_williams": {
        "citation": "Tenenbaum v. Williams, 193 F.3d 581 (2nd Cir. 1999)",
        "circuit": "2nd Circuit",
        "holding": "CPS caseworkers can be held liable for constitutional violations in child removal cases.",
        "application": "Individual caseworkers are not automatically entitled to qualified immunity.",
        "use_for": ["Qualified immunity analysis", "Individual liability", "Section 1983 claims"],
        "section_1983": True
    }
}

# ============================================================================
# ROOKER-FELDMAN DOCTRINE & AVOIDANCE
# ============================================================================

ROOKER_FELDMAN = {
    "doctrine": "Federal district courts lack jurisdiction to review state court judgments; only the U.S. Supreme Court has such appellate jurisdiction.",
    "key_case": "Exxon Mobil Corp. v. Saudi Basic Industries Corp., 544 U.S. 280 (2005)",
    "limitation": "Narrow doctrine - only applies to cases 'brought by state-court losers complaining of injuries caused by state-court judgments'",
    "avoidance_strategies": [
        {
            "strategy": "Sue for INDEPENDENT constitutional violations, not state court decision",
            "explanation": "Frame lawsuit as challenging caseworker's unconstitutional CONDUCT (warrantless entry, fabricated evidence), NOT the state court's decision",
            "good_example": "Defendant violated Fourth Amendment by entering home without warrant on March 15, 2024.",
            "bad_example": "The state court erred in assuming jurisdiction based on illegally obtained evidence."
        },
        {
            "strategy": "File BEFORE state court final judgment if possible",
            "explanation": "Rooker-Feldman only applies AFTER state court renders final judgment. File Section 1983 during ongoing state proceedings.",
            "authority": "Lance v. Dennis, 546 U.S. 459 (2006)"
        },
        {
            "strategy": "Challenge CONDUCT not JUDGMENT",
            "good_claims": [
                "Warrantless entry violated Fourth Amendment",
                "Fabricating evidence violated due process",
                "Strip-searching child without exigency violated Fourth Amendment",
                "Coerced statements violated Fifth Amendment"
            ],
            "bad_claims": [
                "State court wrongly assumed jurisdiction",
                "State court wrongly ordered removal",
                "State court's custody decision was wrong"
            ]
        },
        {
            "strategy": "Seek DIFFERENT relief than state court proceedings",
            "good_relief": [
                "Monetary damages for constitutional violations",
                "Injunction against future warrantless searches",
                "Declaratory judgment that conduct was unconstitutional",
                "Punitive damages against caseworker personally"
            ],
            "bad_relief": [
                "Reverse state court's removal order",
                "Return children (ask state court for this)",
                "Vacate state court judgment"
            ]
        }
    ]
}

# ============================================================================
# BLACK'S LAW DICTIONARY DEFINITIONS
# ============================================================================

BLACKS_LAW_DEFINITIONS = {
    "Due Process": {
        "definition": "The conduct of legal proceedings according to established rules and principles for the protection and enforcement of private rights, including notice and the right to a fair hearing before a tribunal with the power to decide the case.",
        "citation": "Black's Law Dictionary (11th ed. 2019)",
        "application": "In CPS cases, due process requires notice of allegations, opportunity to be heard, right to counsel, and evidentiary hearing before deprivation of parental rights."
    },
    "Procedural Due Process": {
        "definition": "The minimal requirements of notice and a hearing guaranteed by the Due Process Clauses of the 5th and 14th Amendments.",
        "key_requirements": [
            "Notice - reasonable time, manner, and content",
            "Opportunity to be heard - meaningful chance to respond",
            "Neutral decision-maker - impartial judge",
            "Right to present evidence and witnesses",
            "Right to confront adverse witnesses",
            "Written decision with findings of fact"
        ]
    },
    "Substantive Due Process": {
        "definition": "The doctrine that the Due Process Clauses require legislation to be fair and reasonable in content and to further a legitimate governmental objective.",
        "standard": "Strict Scrutiny for fundamental rights"
    },
    "Fundamental Right": {
        "definition": "A right derived from natural or fundamental law; esp., one protected by the Due Process Clause of the U.S. Constitution.",
        "application": "Parental rights are fundamental liberty interests. Government interference requires strict scrutiny.",
        "authority": "Troxel v. Granville, 530 U.S. 57 (2000)"
    },
    "Strict Scrutiny": {
        "definition": "The standard applied to fundamental rights. The state must establish a compelling interest that justifies and necessitates the law in question.",
        "requirements": ["Compelling government interest", "Narrowly tailored means", "Least restrictive alternative"],
        "burden": "On the government, NOT the parent"
    },
    "Qualified Immunity": {
        "definition": "Immunity from civil liability for a public official performing a discretionary function, as long as the conduct does not violate clearly established constitutional or statutory rights.",
        "two_part_test": [
            "Was a constitutional right violated?",
            "Was the right clearly established at the time?"
        ]
    },
    "Parens Patriae": {
        "definition": "The state in its capacity as provider of protection to those unable to care for themselves.",
        "limitation": "Cannot override fundamental parental rights without compelling justification and due process."
    },
    "Imminent Danger": {
        "definition": "An immediate and present danger, not merely a fear of future harm.",
        "application": "Emergency removal requires IMMINENT danger - immediate risk of serious harm. Future or speculative risk insufficient.",
        "test": "Would removal of child from home prevent serious harm within the next 24-48 hours?"
    },
    "Clear and Convincing Evidence": {
        "definition": "Evidence indicating that the thing to be proved is highly probable or reasonably certain.",
        "application": "Required standard for termination of parental rights per Santosky v. Kramer.",
        "comparison": "Higher than preponderance of evidence, lower than beyond reasonable doubt."
    },
    "Hearsay": {
        "definition": "A statement other than one made by the declarant while testifying at trial, offered to prove the truth of the matter asserted.",
        "danger": "CPS often relies heavily on hearsay. Challenge admissibility."
    }
}

# ============================================================================
# CONSTITUTIONAL AMENDMENTS & RIGHTS
# ============================================================================

CONSTITUTIONAL_RIGHTS = {
    "fourth_amendment": {
        "text": "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated.",
        "cps_application": [
            "Home visits may be searches requiring warrants",
            "Child examinations may be searches",
            "Removal of children is a seizure",
            "Consent must be voluntary and informed"
        ],
        "exceptions": [
            "Valid warrant",
            "Voluntary consent (NOT coerced)",
            "Exigent circumstances (imminent danger)",
            "Emergency exception (immediate threat to life)"
        ],
        "key_cases": ["Calabretta v. Floyd", "Wallis v. Spencer", "Camara v. Municipal Court"]
    },
    "fifth_amendment": {
        "text": "No person shall be compelled in any criminal case to be a witness against himself.",
        "cps_application": [
            "Parents can refuse to answer questions that might incriminate",
            "CPS cannot coerce self-incriminating statements",
            "Applies even in civil proceedings if criminal consequences possible"
        ],
        "key_case": "Minnesota v. Murphy"
    },
    "fourteenth_amendment_due_process": {
        "text": "No State shall deprive any person of life, liberty, or property, without due process of law.",
        "cps_application": [
            "Right to notice before removal hearings",
            "Right to be heard at meaningful time and manner",
            "Right to present evidence and witnesses",
            "Right to confront and cross-examine witnesses",
            "Right to impartial decision-maker",
            "Right to written findings of fact"
        ],
        "key_cases": ["Stanley v. Illinois", "Santosky v. Kramer", "Lassiter v. DSS"]
    },
    "fourteenth_amendment_equal_protection": {
        "text": "No State shall deny to any person within its jurisdiction the equal protection of the laws.",
        "cps_application": [
            "Selective enforcement based on race, religion, or socioeconomic status prohibited",
            "Poverty alone cannot be basis for removal"
        ]
    }
}

# ============================================================================
# COMMON VIOLATION TYPES
# ============================================================================

VIOLATION_ANALYSIS = {
    "warrantless_entry": {
        "description": "CPS entered home without warrant, consent, or exigent circumstances",
        "constitutional_basis": "Fourth Amendment",
        "key_case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
        "elements": [
            "Government actor (CPS worker)",
            "Entry into constitutionally protected area (home)",
            "No warrant obtained",
            "No valid consent",
            "No exigent circumstances"
        ],
        "section_1983_viable": True,
        "qualified_immunity": "Likely defeated - clearly established law"
    },
    "coerced_consent": {
        "description": "CPS obtained entry through threats, deception, or coercion",
        "constitutional_basis": "Fourth Amendment",
        "key_case": "Schneckloth v. Bustamonte, 412 U.S. 218 (1973)",
        "coercion_indicators": [
            "Threats to remove children if denied entry",
            "Implied threats of arrest",
            "Police presence creating implicit coercion",
            "Misrepresentation of authority",
            "Failure to inform of right to refuse"
        ],
        "section_1983_viable": True
    },
    "inadequate_investigation": {
        "description": "CPS removed children without reasonable investigation",
        "constitutional_basis": "Fourteenth Amendment Due Process",
        "key_case": "Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)",
        "elements": [
            "Removal occurred",
            "Investigation was inadequate or non-existent",
            "Reasonable investigation would have prevented removal",
            "No true emergency existed"
        ],
        "section_1983_viable": True
    },
    "false_emergency": {
        "description": "CPS claimed emergency when no imminent danger existed",
        "constitutional_basis": "Fourth and Fourteenth Amendments",
        "key_case": "Gates v. Texas DHS, 537 F.3d 404 (5th Cir. 2008)",
        "analysis": {
            "imminent_danger_requires": [
                "Immediate threat of serious harm",
                "Cannot wait for court order",
                "Evidence of actual (not speculative) danger",
                "Reasonable belief based on articulable facts"
            ],
            "not_imminent_danger": [
                "Messy house",
                "Poverty",
                "Different parenting style",
                "Speculative future harm",
                "Hearsay allegations alone"
            ]
        },
        "section_1983_viable": True
    },
    "procedural_due_process": {
        "description": "CPS failed to provide proper notice or hearing",
        "constitutional_basis": "Fourteenth Amendment",
        "key_case": "Mathews v. Eldridge, 424 U.S. 319 (1976)",
        "required_procedures": [
            "Written notice of allegations",
            "Notice of hearing date with reasonable time to prepare",
            "Right to present evidence",
            "Right to cross-examine witnesses",
            "Impartial decision-maker",
            "Written findings of fact"
        ],
        "section_1983_viable": True
    },
    "fabricated_evidence": {
        "description": "CPS worker fabricated or falsified evidence",
        "constitutional_basis": "Fourteenth Amendment Due Process",
        "key_case": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
        "types": [
            "False statements in reports",
            "Coaching child witnesses",
            "Omitting exculpatory evidence",
            "Misrepresenting medical findings",
            "Creating misleading photos"
        ],
        "section_1983_viable": True,
        "qualified_immunity": "Defeated - clearly unconstitutional"
    },
    "strip_search": {
        "description": "Invasive physical examination of child without warrant or exigency",
        "constitutional_basis": "Fourth Amendment",
        "key_case": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
        "section_1983_viable": True,
        "qualified_immunity": "Defeated - clearly established"
    }
}

# ============================================================================
# SECTION 1983 GUIDANCE
# ============================================================================

SECTION_1983 = {
    "statute": "42 U.S.C. § 1983",
    "elements": [
        "Action under color of state law",
        "Deprivation of federal constitutional or statutory right",
        "By a 'person' (individual or local government)",
        "Resulting in damages"
    ],
    "defendants": {
        "individual_capacity": {
            "description": "Sue caseworker personally for damages",
            "advantages": ["Can recover compensatory and punitive damages", "No sovereign immunity"],
            "disadvantages": ["Must overcome qualified immunity", "Personal assets limited"]
        },
        "official_capacity": {
            "description": "Sue for injunctive/declaratory relief only",
            "note": "Equivalent to suit against agency; no damages against individual"
        },
        "monell_liability": {
            "description": "Sue local government/agency directly",
            "requirements": [
                "Constitutional violation occurred",
                "Violation caused by official policy or custom",
                "Policy was 'moving force' behind violation"
            ],
            "authority": "Monell v. Dept. of Social Services, 436 U.S. 658 (1978)"
        }
    },
    "damages": {
        "compensatory": "Actual damages suffered (emotional distress, lost wages, medical expenses)",
        "punitive": "Available against individuals acting with reckless disregard for rights",
        "nominal": "$1 when violation proven but no actual damages",
        "attorney_fees": "Prevailing plaintiff entitled to reasonable fees under 42 U.S.C. § 1988"
    },
    "qualified_immunity": {
        "test": [
            "Did defendant violate a constitutional right?",
            "Was the right 'clearly established' at the time?"
        ],
        "clearly_established_means": [
            "Existing precedent with similar facts",
            "Obvious case under established principles",
            "Reasonable official would know conduct unconstitutional"
        ],
        "cases_defeating_immunity_for_cps": [
            "Calabretta v. Floyd - warrantless home entry",
            "Wallis v. Spencer - strip searches",
            "Duchesne v. Sugarman - wrongful removal",
            "Devereaux v. Abbey - fabricated evidence"
        ]
    }
}

# ============================================================================
# FEDERAL STATUTES
# ============================================================================

FEDERAL_STATUTES = {
    "CAPTA": {
        "name": "Child Abuse Prevention and Treatment Act",
        "citation": "42 U.S.C. §§ 5101-5119",
        "requirements": [
            "States must have CPS system to receive federal funding",
            "Must have procedures for reporting and investigating",
            "Must have procedures to protect children",
            "Must have procedures to protect parents' rights"
        ],
        "violations": ["Failure to follow mandatory procedures", "Inadequate investigation protocols"]
    },
    "ASFA": {
        "name": "Adoption and Safe Families Act",
        "citation": "Pub. L. 105-89 (1997)",
        "key_provisions": [
            "Reasonable efforts to prevent removal required",
            "Reasonable efforts for reunification required",
            "Permanency hearing within 12 months",
            "TPR petition if child in care 15 of 22 months"
        ],
        "violations": ["Failure to make reasonable efforts", "Missing timelines"]
    },
    "ICWA": {
        "name": "Indian Child Welfare Act",
        "citation": "25 U.S.C. §§ 1901-1963",
        "key_provisions": [
            "Applies to Indian children (member or eligible for membership)",
            "Notice to tribe required",
            "Active efforts (higher than reasonable efforts) required",
            "Placement preferences for Indian families",
            "Qualified expert witness required for removal"
        ],
        "violations": ["Failure to notify tribe", "Failure to make active efforts", "Ignoring placement preferences"]
    }
}

def get_relevant_case_law(violation_type: str) -> dict:
    """Get relevant case law for a specific violation type."""
    case_law = []
    
    if violation_type in ["fourth_amendment", "warrantless_entry", "warrantless_search"]:
        case_law.extend([
            CIRCUIT_COURT_CASES["calabretta_v_floyd"],
            CIRCUIT_COURT_CASES["wallis_v_spencer"],
            SUPREME_COURT_CASES["camara"]
        ])
    
    if violation_type in ["fourteenth_amendment", "due_process", "procedural_due_process"]:
        case_law.extend([
            SUPREME_COURT_CASES["stanley"],
            SUPREME_COURT_CASES["santosky"],
            CIRCUIT_COURT_CASES["duchesne_v_sugarman"]
        ])
    
    if violation_type in ["emergency_removal", "imminent_danger"]:
        case_law.extend([
            CIRCUIT_COURT_CASES["gates_v_texas"],
            CIRCUIT_COURT_CASES["duchesne_v_sugarman"]
        ])
    
    if violation_type in ["fabricated_evidence", "falsified_reports"]:
        case_law.append({
            "citation": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
            "holding": "Deliberate fabrication of evidence violates due process",
            "qualified_immunity": "Defeated"
        })
    
    return {
        "violation_type": violation_type,
        "relevant_cases": case_law,
        "constitutional_basis": get_constitutional_basis(violation_type),
        "section_1983_viable": True
    }

def get_constitutional_basis(violation_type: str) -> str:
    """Get constitutional basis for violation type."""
    mapping = {
        "fourth_amendment": "Fourth Amendment - Protection against unreasonable searches and seizures",
        "warrantless_entry": "Fourth Amendment - Warrantless home entry",
        "warrantless_search": "Fourth Amendment - Warrantless search",
        "strip_search": "Fourth Amendment - Invasive bodily search",
        "coerced_consent": "Fourth Amendment - Involuntary consent",
        "fourteenth_amendment": "Fourteenth Amendment - Due Process",
        "due_process": "Fourteenth Amendment - Due Process Clause",
        "procedural_due_process": "Fourteenth Amendment - Procedural Due Process",
        "substantive_due_process": "Fourteenth Amendment - Substantive Due Process",
        "emergency_removal": "Fourth and Fourteenth Amendments",
        "inadequate_investigation": "Fourteenth Amendment - Due Process",
        "fabricated_evidence": "Fourteenth Amendment - Due Process",
        "fifth_amendment": "Fifth Amendment - Self-incrimination",
        "equal_protection": "Fourteenth Amendment - Equal Protection"
    }
    return mapping.get(violation_type, "Constitutional violation")

def analyze_qualified_immunity(violation_type: str) -> dict:
    """Analyze whether qualified immunity can be defeated."""
    clearly_established = [
        "warrantless_entry",
        "strip_search",
        "fabricated_evidence",
        "coerced_consent"
    ]
    
    if violation_type in clearly_established:
        return {
            "likely_defeated": True,
            "reasoning": f"The unconstitutionality of {violation_type} is clearly established by existing precedent.",
            "key_cases": get_relevant_case_law(violation_type)["relevant_cases"]
        }
    else:
        return {
            "likely_defeated": False,
            "reasoning": "Qualified immunity analysis is fact-dependent. Consult with attorney.",
            "factors": [
                "Specificity of existing precedent",
                "Egregiousness of conduct",
                "Whether reasonable official would know conduct unconstitutional"
            ]
        }
