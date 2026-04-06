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
    "full_text": """Every person who, under color of any statute, ordinance, regulation, custom, or usage, 
of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen 
of the United States or other person within the jurisdiction thereof to the deprivation of any rights, 
privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured in 
an action at law, suit in equity, or other proper proceeding for redress.""",
    
    "elements": [
        "1. Action UNDER COLOR OF STATE LAW - CPS workers act under state authority",
        "2. DEPRIVATION of federal constitutional or statutory right",
        "3. By a 'PERSON' (individual caseworker, supervisor, or local government)",
        "4. Resulting in actual DAMAGES to the plaintiff"
    ],
    
    "constitutional_violations_commonly_claimed": {
        "fourth_amendment": {
            "name": "Fourth Amendment - Unreasonable Search & Seizure",
            "violations": [
                "Warrantless home entry without consent or exigent circumstances",
                "Warrantless removal of children (seizure)",
                "Strip searches or medical exams without consent/warrant",
                "Coerced or deceptive consent to entry",
                "Remaining in home after consent withdrawn"
            ],
            "key_cases": [
                "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999) - Warrantless entry violated 4th Amendment",
                "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000) - Strip searches of children unconstitutional",
                "Gates v. Texas Dept. of Protective Services, 537 F.3d 404 (5th Cir. 2008)",
                "Camara v. Municipal Court, 387 U.S. 523 (1967) - Home is constitutionally protected"
            ]
        },
        "fourteenth_amendment_substantive": {
            "name": "Fourteenth Amendment - Substantive Due Process",
            "violations": [
                "Interference with fundamental right to family integrity",
                "Removal without imminent danger",
                "False allegations to justify removal",
                "Fabrication of evidence",
                "Shock-the-conscience conduct"
            ],
            "key_cases": [
                "Troxel v. Granville, 530 U.S. 57 (2000) - Parents have fundamental liberty interest",
                "Stanley v. Illinois, 405 U.S. 645 (1972) - Fundamental right to parent",
                "Duchesne v. Sugarman, 566 F.2d 817 (2d Cir. 1977) - Wrongful removal violates due process"
            ]
        },
        "fourteenth_amendment_procedural": {
            "name": "Fourteenth Amendment - Procedural Due Process",
            "violations": [
                "Removal without pre-deprivation hearing",
                "Inadequate notice of allegations",
                "No opportunity to respond before removal",
                "Ex parte orders without justification",
                "Denial of meaningful hearing"
            ],
            "key_cases": [
                "Santosky v. Kramer, 455 U.S. 745 (1982) - Clear and convincing evidence required for TPR",
                "Lassiter v. Dept. of Social Services, 452 U.S. 18 (1981) - Right to counsel may be required",
                "Mathews v. Eldridge, 424 U.S. 319 (1976) - Three-factor test for procedural due process"
            ]
        },
        "first_amendment": {
            "name": "First Amendment - Religion & Expression",
            "violations": [
                "Removal based on religious practices",
                "Discrimination against homeschooling",
                "Retaliation for exercising free speech",
                "Religious bias in placement decisions"
            ],
            "key_cases": [
                "Wisconsin v. Yoder, 406 U.S. 205 (1972) - Religious liberty in education"
            ]
        }
    },
    
    "defendants": {
        "individual_capacity": {
            "description": "Sue the caseworker, supervisor, or official PERSONALLY for damages",
            "what_you_can_recover": ["Compensatory damages", "Punitive damages", "Attorney fees"],
            "advantages": [
                "Can recover compensatory damages (emotional distress, lost income)",
                "Can recover PUNITIVE damages if conduct was malicious/reckless",
                "No Eleventh Amendment immunity"
            ],
            "challenges": ["Must overcome QUALIFIED IMMUNITY defense"],
            "strategy": "Name the specific caseworker, their supervisor, and any officials who approved the actions"
        },
        "official_capacity": {
            "description": "Equivalent to suing the government agency",
            "what_you_can_recover": ["Injunctive relief (stop the conduct)", "Declaratory relief"],
            "limitations": "NO monetary damages against individuals in official capacity",
            "when_to_use": "When seeking court order to return children or stop ongoing violations"
        },
        "monell_liability": {
            "description": "Sue the COUNTY or LOCAL AGENCY directly (not the state)",
            "requirements": [
                "A constitutional violation occurred",
                "Violation was caused by an OFFICIAL POLICY or CUSTOM",
                "The policy was the 'MOVING FORCE' behind the violation"
            ],
            "policies_that_count": [
                "Written policies that violate rights",
                "Widespread practices even if unwritten",
                "Failure to train when need is obvious",
                "Deliberate indifference to constitutional violations"
            ],
            "authority": "Monell v. Dept. of Social Services, 436 U.S. 658 (1978)",
            "note": "States and state agencies have Eleventh Amendment immunity - sue COUNTIES instead"
        }
    },
    
    "damages_recoverable": {
        "compensatory": {
            "description": "Actual damages suffered",
            "categories": [
                "Emotional distress and mental anguish",
                "Damage to parent-child relationship",
                "Lost wages (time off work for hearings, etc.)",
                "Medical/therapy expenses",
                "Reputation damage",
                "Humiliation and embarrassment"
            ],
            "note": "Emotional distress alone can support substantial damages in family separation cases"
        },
        "punitive": {
            "description": "Punishment for especially egregious conduct",
            "requirements": "Defendant acted with reckless or callous indifference to rights, or with evil motive",
            "available_against": "Individual defendants only (not government entities)"
        },
        "nominal": {
            "description": "$1 when violation proven but no actual damages",
            "importance": "Establishes the violation occurred and entitles you to attorney fees"
        },
        "attorney_fees": {
            "statute": "42 U.S.C. § 1988",
            "rule": "Prevailing plaintiff is entitled to reasonable attorney fees",
            "note": "This makes contingency representation possible for civil rights cases"
        }
    },
    
    "qualified_immunity": {
        "what_it_is": "A defense that shields government officials from liability unless they violated 'clearly established' law",
        "two_prong_test": [
            "PRONG 1: Did the defendant violate a constitutional right?",
            "PRONG 2: Was the right 'CLEARLY ESTABLISHED' at the time of the conduct?"
        ],
        "clearly_established_means": [
            "Existing court precedent with SIMILAR facts (not identical)",
            "The violation was so obvious that any reasonable official would know",
            "No need for a case with exact same facts - just 'fair warning'"
        ],
        "how_to_defeat_qualified_immunity": [
            "Cite cases from YOUR circuit with similar facts",
            "Argue the violation was obvious under general constitutional principles",
            "Show pattern of similar misconduct (no good faith defense)",
            "Demonstrate intentional violation of known rights",
            "Use Supreme Court cases establishing the underlying right"
        ],
        "cases_where_qualified_immunity_defeated_for_cps": [
            {
                "case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
                "facts": "CPS and police entered home without warrant based on anonymous tip",
                "holding": "Qualified immunity DENIED - clearly established that warrantless entry requires warrant, consent, or exigent circumstances"
            },
            {
                "case": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
                "facts": "Children strip-searched and subjected to intrusive exams without warrant",
                "holding": "Qualified immunity DENIED - clearly established that strip searches of children require warrant"
            },
            {
                "case": "Duchesne v. Sugarman, 566 F.2d 817 (2d Cir. 1977)",
                "facts": "Children removed without emergency circumstances",
                "holding": "Clearly established that removal requires imminent danger or court order"
            },
            {
                "case": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
                "facts": "Caseworker fabricated evidence in abuse investigation",
                "holding": "Qualified immunity DENIED - deliberately fabricating evidence violates clearly established due process rights"
            },
            {
                "case": "Rogers v. County of San Joaquin, 487 F.3d 1288 (9th Cir. 2007)",
                "facts": "Caseworkers provided false information to obtain removal order",
                "holding": "Qualified immunity may be denied for knowingly false statements"
            }
        ],
        "recent_developments_2024_2025": [
            {
                "case": "Bambach v. Moegle (6th Cir. Feb. 2024)",
                "holding": "CPS workers received qualified immunity for temporarily retaining children after initial consent",
                "lesson": "Document the EXACT moment consent is withdrawn"
            },
            {
                "note": "Supreme Court petition filed 2025 questioning qualified immunity for CPS workers",
                "status": "Circuit split exists on how to apply qualified immunity in CPS cases"
            },
            {
                "trend": "Courts increasingly scrutinizing CPS claims of qualified immunity",
                "strategy": "Build strong record of clearly established violations in your circuit"
            }
        ]
    },
    
    "rooker_feldman_doctrine": {
        "what_it_is": "Federal courts cannot review state court judgments - your Section 1983 case may be dismissed if it looks like you're appealing a state court decision",
        "how_to_avoid_dismissal": [
            "Challenge the CONDUCT of caseworkers, not the state court's DECISION",
            "File BEFORE the state case is final if possible",
            "Focus on constitutional violations that occurred INDEPENDENT of court proceedings",
            "Sue for actions taken OUTSIDE of court (investigations, interviews, removals)",
            "Seek damages for the PROCESS used, not the outcome"
        ],
        "safe_claims": [
            "Warrantless entry (happened before any court involvement)",
            "Coerced statements (conduct of investigation)",
            "Fabricated evidence (even if used in court, the fabrication is the wrong)",
            "Failure to investigate exculpatory evidence"
        ],
        "risky_claims": [
            "The state court got it wrong",
            "Challenging the custody decision itself",
            "Seeking return of children through federal court"
        ]
    },
    
    "statute_of_limitations": {
        "general_rule": "Borrows from state personal injury statute - typically 2-3 years",
        "when_it_starts": "When plaintiff knew or should have known of the violation",
        "tolling_for_minors": "Clock may not start until child reaches 18",
        "continuing_violation": "Each day of wrongful separation may be new violation",
        "important": "Check YOUR state's personal injury statute of limitations"
    },
    
    "filing_strategy": {
        "where_to_file": "Federal district court (preferred) or state court",
        "why_federal": [
            "Federal judges more familiar with constitutional issues",
            "Federal Rules of Civil Procedure often more favorable",
            "Jury pools may be more diverse"
        ],
        "complaint_requirements": [
            "Identify all defendants by name and position",
            "State claims under 42 U.S.C. § 1983",
            "Identify specific constitutional rights violated",
            "Allege facts showing defendants acted under color of state law",
            "Allege facts showing how each defendant was personally involved",
            "Request specific relief (damages, injunction, attorney fees)"
        ],
        "discovery_opportunities": [
            "Subpoena CPS records and internal communications",
            "Depose caseworkers under oath",
            "Request training records (for Monell claims)",
            "Request complaint history of caseworker",
            "Request policies and procedures"
        ]
    },
    
    "practical_steps_to_file_section_1983": [
        {
            "step": 1,
            "action": "DOCUMENT EVERYTHING",
            "details": "Keep detailed records of all interactions with CPS, including dates, times, names, and what was said"
        },
        {
            "step": 2,
            "action": "IDENTIFY THE VIOLATIONS",
            "details": "Use this guide to identify which constitutional rights were violated"
        },
        {
            "step": 3,
            "action": "IDENTIFY THE DEFENDANTS",
            "details": "Name specific caseworkers, supervisors, and the county/agency"
        },
        {
            "step": 4,
            "action": "RESEARCH YOUR CIRCUIT'S CASE LAW",
            "details": "Find cases in your federal circuit with similar facts where qualified immunity was denied"
        },
        {
            "step": 5,
            "action": "CONSULT A CIVIL RIGHTS ATTORNEY",
            "details": "Section 1983 cases are complex - find an attorney experienced in civil rights litigation"
        },
        {
            "step": 6,
            "action": "FILE COMPLAINT IN FEDERAL COURT",
            "details": "Ensure complaint is detailed enough to survive motion to dismiss"
        },
        {
            "step": 7,
            "action": "PREPARE FOR QUALIFIED IMMUNITY MOTION",
            "details": "Defendants will almost always raise this - be ready with case law"
        }
    ]
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

USEFUL_CASE_LAW_INDEX = {
    "title": "Useful Case Law Index",
    "sections": [
        {
            "title": "Subject-Matter Jurisdiction & UCCJEA (Power to Act)",
            "purpose": "Challenges court authority to open the case or act without jurisdiction.",
            "cases": [
                {"name": "Ex parte Fordham", "citation": "144 So. 3d 319", "note": "Mandatory UCCJEA jurisdictional requirements."},
                {"name": "J.B. v. A.B.", "citation": "888 So. 2d 528", "note": "Rule 60(b) + lack of UCCJEA subject matter = void order."},
                {"name": "Ex parte K.L.P.", "citation": "868 So. 2d 454", "note": "How a court acquires jurisdiction."},
                {"name": "Ex parte Sealy, LLC", "citation": "904 So. 2d 1230", "note": "Dismissal and case nullity due to lack of jurisdiction."},
                {"name": "Ex parte S.T.S.", "citation": "806 So. 2d 336", "note": "Limits of juvenile court authority."},
                {"name": "Ex parte R.S.C.", "citation": "853 So. 2d 228", "note": "Standards for jurisdictional findings in child cases."},
                {"name": "Ex parte Jim Walter Homes, Inc.", "citation": "(1998)", "note": "Fundamental limits on court power; no jurisdiction means void."},
                {"name": "Ex parte Bridges", "citation": "925 So. 2d 189", "note": "Writ of prohibition when court acts without jurisdiction."},
                {"name": "Kulko v. Superior Ct.", "citation": "436 U.S. 84", "note": "Federal limits on personal jurisdiction."},
                {"name": "Roman Catholic Archdiocese of San Juan v. Feliciano", "citation": "589 U.S. (2020)", "note": "No jurisdiction = no power to act."}
            ]
        },
        {
            "title": "Service of Process & Procedural Rules (Notice and Rule 4/13)",
            "purpose": "Support arguments that service was fraudulent or legally insufficient.",
            "cases": [
                {"name": "M.M. v. B.L. and M.L.", "citation": "926 So. 2d 1038", "note": "Proper service under Rule 4 and Rule 13."},
                {"name": "T.B. v. T.H.", "citation": "30 So. 3d 445", "note": "Service of summons is mandatory to initiate a case."},
                {"name": "R.M. v. Elmore County DHR", "citation": "(2011)", "note": "Proper service is a prerequisite for state intervention."},
                {"name": "T.F.H. v. A.L.S.", "citation": "(2023)", "note": "Modern application of Rule 13 dependency procedures."},
                {"name": "Mullane v. Central Hanover Bank", "citation": "339 U.S. 306", "note": "Notice must be reasonably calculated to reach you."},
                {"name": "Armstrong v. Manzo", "citation": "380 U.S. 545", "note": "Failure to provide notice violates the 14th Amendment."},
                {"name": "Ex parte Weeks", "citation": "611 So. 2d 259", "note": "Technical requirements for legal notice."},
                {"name": "Ex parte Powell", "citation": "(var.)", "note": "Standards for service and due process."},
                {"name": "Hales v. Scott", "citation": "(1985)", "note": "Alabama Supreme Court on service of process."},
                {"name": "Crawford v. Hall", "citation": "531 So. 2d 874", "note": "Procedural rules for initiating claims."}
            ]
        },
        {
            "title": "Void Judgments, Nunc Pro Tunc, & Fraud (Rule 60(b))",
            "purpose": "Attack void orders and retroactive attempts to fix the record.",
            "cases": [
                {"name": "Ex parte Courtyard Citiflats (Arrington)", "citation": "259 So. 3d 669", "note": "Nunc pro tunc cannot fix lack of jurisdiction."},
                {"name": "B.W. v. S.S.", "citation": "(2022)", "note": "Rule 60(b) standard to set aside."},
                {"name": "United States v. Throckmorton", "citation": "(1878)", "note": "Fraud on the court vacates all actions."},
                {"name": "Hartford-Empire Co. v. Hazel-Atlas Glass Co.", "citation": "(1944)", "note": "Fraudulent judgments are unenforceable."},
                {"name": "Ex parte Full Circle Distribution, LLC", "citation": "(2003)", "note": "Standard for vacating void judgments under Rule 60(b)."},
                {"name": "Insurance Mgt. & Admin. v. Palomar Ins.", "citation": "(1991)", "note": "Rule 60(b) for jurisdictional defects."},
                {"name": "Ex parte Turner", "citation": "(2002)", "note": "Relief from judgments and appellate rights."},
                {"name": "Ex parte Antonucci", "citation": "(2005)", "note": "Mandatory standards for vacating orders."}
            ]
        },
        {
            "title": "DHR Accountability & Reasonable Efforts",
            "purpose": "Hold DHR to its burden and reunification obligations.",
            "cases": [
                {"name": "M.A.J. v. S.F.", "citation": "994 So. 2d 280", "note": "DHR must prove reasonable efforts were made."},
                {"name": "T.B. v. Cullman Cnty. DHR", "citation": "6 So. 3d 1195", "note": "State carries burden of proof for reunification."},
                {"name": "Ex parte McDaniel", "citation": "291 So. 3d 847", "note": "Rights of parents in dependency proceedings."},
                {"name": "N.J.D. v. Madison County DHR", "citation": "110 So. 3d 387", "note": "Dependency standards and parental rights."},
                {"name": "K.P. v. Madison County DHR", "citation": "243 So. 3d 835", "note": "DHR accountability."},
                {"name": "R.D. v. Coffee County DHR", "citation": "204 So. 3d 425", "note": "Standards for state interference in family units."},
                {"name": "Ex parte L.E.O.", "citation": "61 So. 3d 1042", "note": "Standard for dependency findings."},
                {"name": "In re Gault", "citation": "387 U.S. 1", "note": "Constitutional due process in juvenile proceedings."}
            ]
        },
        {
            "title": "ADA, Civil Rights, & Federal Protections",
            "purpose": "ADA/rehab act protections and civil rights limits on state action.",
            "cases": [
                {"name": "Bircoll v. Miami Dade County", "citation": "(2007)", "note": "ADA applies to law enforcement and state administrative actions."},
                {"name": "Alexander v. Choate", "citation": "469 U.S. 287", "note": "Meaningful access under ADA/Rehab Act."},
                {"name": "Taylor v. Sturgell", "citation": "553 U.S. 880", "note": "Limits on virtual representation."},
                {"name": "Sweeney v. Alabama ABC Board", "citation": "(2000)", "note": "Civil rights and state agency overreach."}
            ]
        },
        {
            "title": "Comprehensive Alabama Ex Parte and Misc. Citations",
            "purpose": "Additional Alabama authorities organized by writs, finality, dependency, due process, and evidence standards.",
            "cases": [
                {"name": "Ex parte SCW / Ex parte McInish", "citation": "47 So. 3d 767", "note": "Evidentiary standards; clear and convincing evidence."},
                {"name": "Ex parte McConico", "citation": "315 So. 3d 610", "note": "Mandamus/prohibition standards."},
                {"name": "Ex parte Roberts", "citation": "(var.)", "note": "Due process and notice standards."},
                {"name": "Ex parte Powell", "citation": "(var.)", "note": "Service and due process standards."},
                {"name": "Ex parte Weeks", "citation": "611 So. 2d 259", "note": "Notice requirements."},
                {"name": "Ex parte J.M.S.", "citation": "303 So. 3d 155", "note": "Rights in G.C.S. v. J.M.S."},
                {"name": "Ex parte Moore", "citation": "880 So. 2d 1131", "note": "Finality of judgments."},
                {"name": "Ex parte R.D.", "citation": "313 So. 3d 1119", "note": "Dependency standards; termination of parental rights."},
                {"name": "Ex parte Jenkins / Ex parte Smith", "citation": "(var.)", "note": "Extraordinary writs when no adequate remedy."},
                {"name": "Ex parte T.C.", "citation": "63 So. 3d 627", "note": "Supersedeas/stay during appeal."},
                {"name": "Ex parte Third Generation, Inc.", "citation": "(2003)", "note": "Law of the case; limits on revisiting final orders."},
                {"name": "Ex parte Pate IV / Ex parte GC", "citation": "(var.)", "note": "Procedural due process under ARJuvP."},
                {"name": "Ex parte CLJ / Ex parte RDN / Ex parte Alfa Mut. General Ins. Co.", "citation": "(var.)", "note": "Rule 8/Rule 60(b) mechanics and defect attacks."}
            ]
        },
        {
            "title": "Stop Order (Writs of Mandamus & Prohibition)",
            "purpose": "Freeze proceedings when a lower court acts without jurisdiction.",
            "cases": [
                {"name": "Ex parte McConico", "citation": "315 So. 3d 610", "note": "Gold standard for mandamus/prohibition."},
                {"name": "Ex parte Bridges", "citation": "925 So. 2d 189", "note": "Writ of prohibition; court must be prohibited from continuing."},
                {"name": "Ex parte Jenkins / Ex parte Smith", "citation": "(var.)", "note": "Extraordinary writ when no adequate remedy at law."}
            ]
        },
        {
            "title": "Finality & Voidness Doctrine (Rule 60)",
            "purpose": "Once a case is void or final, it cannot be revived without strict Rule 60 compliance.",
            "cases": [
                {"name": "Ex parte Moore", "citation": "880 So. 2d 1131", "note": "Finality of judgments."},
                {"name": "Ex parte Jim Walter Homes, Inc.", "citation": "(1998)", "note": "Void orders for lack of subject matter jurisdiction."},
                {"name": "Ex parte Third Generation, Inc.", "citation": "(2003)", "note": "Law of the case; limits on revisiting final orders."},
                {"name": "Ex parte RDN / Ex parte Alfa Mut. General Ins. Co.", "citation": "(var.)", "note": "Rule 8/Rule 60(b) mechanics."}
            ]
        },
        {
            "title": "Dependency & Parental Rights (DHR Tactics)",
            "purpose": "Challenge dependency findings and burden of proof tactics.",
            "cases": [
                {"name": "Ex parte J.M.S.", "citation": "303 So. 3d 155", "note": "Best interests vs natural rights of parent."},
                {"name": "Ex parte T.C.", "citation": "63 So. 3d 627", "note": "Stay/supersedeas authority."},
                {"name": "Ex parte R.D.", "citation": "313 So. 3d 1119", "note": "High burden for termination of parental rights."},
                {"name": "Ex parte Boykin", "citation": "656 So. 2d 821", "note": "Income/ability to pay vs willful failure."}
            ]
        },
        {
            "title": "Due Process & Notice (You Didn't Tell Me)",
            "purpose": "Challenge actions taken without fair notice or hearing.",
            "cases": [
                {"name": "Ex parte Weeks", "citation": "611 So. 2d 259", "note": "Notice violation invalidates orders."},
                {"name": "Ex parte Powell / Ex parte Roberts", "citation": "(var.)", "note": "Right to be heard and to counsel; due process."},
                {"name": "Ex parte Pate IV / Ex parte GC", "citation": "(var.)", "note": "ARJuvP procedural due process requirements."}
            ]
        },
        {
            "title": "Judicial Evidence & Record Striking",
            "purpose": "Remove fraudulent filings or hearsay from the record.",
            "cases": [
                {"name": "Ex parte McInish / Ex parte SCW", "citation": "47 So. 3d 767", "note": "Evidentiary standards; clear and convincing evidence."},
                {"name": "Ex parte CLJ", "citation": "(var.)", "note": "Clear and convincing evidence; evidentiary foundations."}
            ]
        }
    ]
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
