"""
CPS Punisher - ADA Compliance Knowledge Base
Comprehensive Americans with Disabilities Act database for CPS cases
Includes: State-specific laws, False Claims Acts, Civil Guardian rules, Case Law
"""

# ADA Federal Framework
ADA_FEDERAL_LAW = {
    "title_ii": {
        "name": "Title II - Public Services",
        "citation": "42 U.S.C. §§ 12131-12165",
        "description": "Prohibits discrimination by public entities including CPS agencies",
        "key_provisions": [
            "No qualified individual with a disability shall be excluded from participation in or denied benefits of services, programs, or activities of a public entity",
            "Public entities must make reasonable modifications to policies, practices, and procedures",
            "Public entities must provide auxiliary aids and services when necessary",
            "Programs must be accessible to individuals with disabilities"
        ],
        "regulations": "28 C.F.R. Part 35"
    },
    "section_504": {
        "name": "Section 504 of Rehabilitation Act",
        "citation": "29 U.S.C. § 794",
        "description": "Prohibits discrimination by any program receiving federal funding",
        "key_provisions": [
            "No otherwise qualified individual with a disability shall be excluded solely by reason of disability",
            "Applies to ALL CPS agencies as they receive federal Title IV-E funding",
            "Requires reasonable accommodations in all aspects of CPS proceedings",
            "Parents with disabilities cannot be discriminated against in custody decisions"
        ],
        "regulations": "45 C.F.R. Part 84"
    },
    "ada_amendments_act": {
        "name": "ADA Amendments Act of 2008 (ADAAA)",
        "citation": "Pub. L. 110-325",
        "description": "Broadened definition of disability, easier to qualify for protection",
        "key_changes": [
            "Disability interpreted broadly - covers more conditions",
            "Mitigating measures (medication, prosthetics) cannot be considered",
            "Episodic conditions and those in remission still protected",
            "Major life activities expanded to include major bodily functions"
        ]
    }
}

# CPS-Specific ADA Requirements
CPS_ADA_REQUIREMENTS = {
    "investigation_accommodations": [
        "Provide sign language interpreters for deaf/hard of hearing parents",
        "Allow support persons during interviews for parents with cognitive disabilities",
        "Provide documents in accessible formats (large print, Braille, audio)",
        "Schedule meetings at accessible locations",
        "Allow extra time for parents with processing difficulties",
        "Provide written summaries of verbal communications",
        "Use plain language in all communications"
    ],
    "service_plan_accommodations": [
        "Modify service requirements to accommodate disabilities",
        "Provide parenting classes in accessible formats",
        "Allow alternative methods to demonstrate parenting skills",
        "Provide transportation assistance for mobility-impaired parents",
        "Offer in-home services when facility-based services are inaccessible",
        "Extend timelines when disability affects completion",
        "Consider disability when evaluating compliance"
    ],
    "court_accommodations": [
        "Request ADA coordinator involvement in proceedings",
        "Provide assistive listening devices",
        "Allow frequent breaks for medical needs",
        "Provide real-time captioning (CART)",
        "Allow service animals in courtroom",
        "Modify courtroom procedures as needed",
        "Ensure all court documents are accessible"
    ],
    "visitation_accommodations": [
        "Provide accessible visitation facilities",
        "Allow support persons during visits",
        "Modify visitation requirements based on disability",
        "Provide transportation to accessible locations",
        "Allow video visits when in-person is inaccessible",
        "Train foster parents on parent's disability needs"
    ]
}

# Key ADA Case Law for CPS Cases
ADA_CASE_LAW = {
    "supreme_court": [
        {
            "case": "Tennessee v. Lane",
            "citation": "541 U.S. 509 (2004)",
            "holding": "Congress validly abrogated state sovereign immunity under Title II for cases involving fundamental rights like access to courts",
            "relevance": "CPS cases involve fundamental parental rights - ADA fully applies"
        },
        {
            "case": "Olmstead v. L.C.",
            "citation": "527 U.S. 581 (1999)",
            "holding": "Unjustified segregation of persons with disabilities is discrimination under ADA",
            "relevance": "Removing children solely due to parent's disability may violate ADA"
        },
        {
            "case": "PGA Tour, Inc. v. Martin",
            "citation": "532 U.S. 661 (2001)",
            "holding": "Reasonable modifications required unless they fundamentally alter the nature of the program",
            "relevance": "CPS must modify services unless it fundamentally changes child safety mission"
        }
    ],
    "circuit_courts": [
        {
            "case": "K.E. v. Department of Human Services",
            "circuit": "9th Circuit",
            "citation": "No. 19-35807 (2021)",
            "holding": "ADA applies to CPS custody decisions; failure to accommodate parent's disability can be ADA violation",
            "relevance": "Direct application of ADA to child welfare cases"
        },
        {
            "case": "Mary Jo C. v. New York State",
            "circuit": "2nd Circuit",
            "citation": "707 F.3d 144 (2013)",
            "holding": "Title II of ADA applies to state child welfare agencies",
            "relevance": "Establishes CPS agencies are covered entities under ADA"
        },
        {
            "case": "Disability Rights Ohio v. Ohio",
            "circuit": "6th Circuit",
            "holding": "Parents with disabilities entitled to reasonable modifications in CPS services",
            "relevance": "Affirms accommodation requirement in service plans"
        }
    ],
    "landmark_settlements": [
        {
            "case": "Sara Gordon v. State of Massachusetts DCF",
            "year": "2015",
            "outcome": "Settlement requiring DCF to provide accommodations for parents with disabilities",
            "key_terms": [
                "Training for all caseworkers on ADA",
                "Designated ADA coordinators",
                "Modified assessment tools",
                "Adaptive parenting evaluations"
            ]
        },
        {
            "case": "National Federation of the Blind v. California DSS",
            "year": "2018",
            "outcome": "Policy changes for blind parents in CPS system",
            "key_terms": [
                "Accessible document formats",
                "Assistive technology provision",
                "Modified home safety assessments"
            ]
        }
    ]
}

# False Claims Act Database
FALSE_CLAIMS_ACT = {
    "federal": {
        "statute": "31 U.S.C. §§ 3729-3733",
        "name": "Federal False Claims Act",
        "qui_tam": True,
        "damages": "Treble damages plus $11,665-$23,331 per false claim",
        "relevance_to_cps": [
            "CPS agencies receive federal Title IV-E funding",
            "False claims for foster care maintenance payments",
            "Fraudulent claims for services not provided",
            "Billing for ADA accommodations not actually given",
            "Falsifying case documentation to secure funding"
        ],
        "whistleblower_protections": "15-30% of recovery for qui tam relators"
    },
    "state_fca_laws": {
        "CA": {"has_fca": True, "citation": "Cal. Gov. Code §§ 12650-12656", "qui_tam": True},
        "TX": {"has_fca": True, "citation": "Tex. Hum. Res. Code §§ 36.001-36.132", "qui_tam": True},
        "NY": {"has_fca": True, "citation": "N.Y. State Fin. Law §§ 187-194", "qui_tam": True},
        "FL": {"has_fca": True, "citation": "Fla. Stat. §§ 68.081-68.09", "qui_tam": True},
        "IL": {"has_fca": True, "citation": "740 ILCS 175/", "qui_tam": True},
        "GA": {"has_fca": True, "citation": "O.C.G.A. §§ 23-3-120 to 23-3-127", "qui_tam": True},
        "MA": {"has_fca": True, "citation": "Mass. Gen. Laws ch. 12 §§ 5A-5O", "qui_tam": True},
        "NJ": {"has_fca": True, "citation": "N.J. Stat. Ann. §§ 2A:32C-1 to 2A:32C-18", "qui_tam": True},
        "VA": {"has_fca": True, "citation": "Va. Code Ann. §§ 8.01-216.1 to 8.01-216.19", "qui_tam": True},
        "WA": {"has_fca": True, "citation": "RCW 74.66", "qui_tam": True},
        "CO": {"has_fca": True, "citation": "Colo. Rev. Stat. §§ 25.5-4-303.5 to 25.5-4-310", "qui_tam": True},
        "TN": {"has_fca": True, "citation": "Tenn. Code Ann. §§ 4-18-101 to 4-18-108", "qui_tam": True},
        "MI": {"has_fca": True, "citation": "MCL 400.601-400.615", "qui_tam": True},
        "MN": {"has_fca": True, "citation": "Minn. Stat. §§ 15C.01-15C.16", "qui_tam": True},
        "NC": {"has_fca": True, "citation": "N.C. Gen. Stat. §§ 1-605 to 1-618", "qui_tam": True},
        "OH": {"has_fca": False, "notes": "No state FCA - use federal FCA"},
        "PA": {"has_fca": False, "notes": "No state FCA - use federal FCA"},
        "AZ": {"has_fca": False, "notes": "No state FCA - use federal FCA"},
    }
}

# Civil Guardian/GAL ADA Requirements
CIVIL_GUARDIAN_ADA = {
    "gal_requirements": [
        "Guardian ad Litems must consider parent's disability in recommendations",
        "GALs cannot recommend termination solely based on disability",
        "GALs must inquire about accommodation needs",
        "GAL reports must address ADA compliance of agency",
        "GALs have duty to advocate for parent's accommodation rights"
    ],
    "guardian_accommodations": [
        "Court-appointed guardians must provide accessible communication",
        "Guardianship proceedings must be accessible to disabled respondents",
        "Guardian reports must be provided in accessible formats",
        "Guardians must facilitate ADA accommodations for their wards"
    ],
    "challenging_gal": [
        "File motion to remove biased GAL",
        "Request ADA training for assigned GAL",
        "Document all instances of disability discrimination by GAL",
        "Cite ADA violations in objections to GAL reports"
    ]
}

# State-Specific ADA + CPS Provisions
STATE_ADA_CPS_DATABASE = {
    "CA": {
        "agency": "California Department of Social Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "Welf. & Inst. Code § 361.2 - Must consider accommodations before removal",
            "Welf. & Inst. Code § 366.21 - Accommodations must be part of reunification services",
            "Cal. Gov. Code § 11135 - State civil rights protections"
        ],
        "case_law": [
            "In re Jasmine G. (2005) - Disability alone insufficient for termination",
            "In re Rebecca H. (1991) - Services must be tailored to parent's abilities"
        ],
        "false_claims": "Cal. Gov. Code §§ 12650-12656",
        "ada_violations_common": [
            "Failure to provide sign language interpreters",
            "Inaccessible service locations",
            "No accommodation in parenting assessments"
        ]
    },
    "TX": {
        "agency": "Texas Department of Family and Protective Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "Tex. Fam. Code § 263.102 - Service plan must consider disabilities",
            "Tex. Hum. Res. Code § 121.003 - State disability rights"
        ],
        "case_law": [
            "In re M.S. (2019) - DFPS must provide ADA accommodations",
            "In re J.F.C. (2001) - Cannot terminate based on disability alone"
        ],
        "false_claims": "Tex. Hum. Res. Code §§ 36.001-36.132",
        "ada_violations_common": [
            "No mental health accommodations",
            "Failure to modify parenting classes",
            "Inaccessible visitation facilities"
        ]
    },
    "NY": {
        "agency": "New York Office of Children and Family Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "N.Y. Soc. Serv. Law § 384-b - Cannot terminate based solely on disability",
            "N.Y. Exec. Law § 296 - Human Rights Law protections"
        ],
        "case_law": [
            "In re Carla L. (2004) - ADA accommodations required in services",
            "Matter of Joyce T. (2015) - Disability must not be sole factor"
        ],
        "false_claims": "N.Y. State Fin. Law §§ 187-194",
        "ada_violations_common": [
            "Inadequate mental health services",
            "No cognitive disability accommodations",
            "Biased parenting evaluations"
        ]
    },
    "FL": {
        "agency": "Florida Department of Children and Families",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "Fla. Stat. § 39.001 - Purpose includes protecting disabled parents' rights",
            "Fla. Stat. § 39.6012 - Case plan must address disabilities"
        ],
        "case_law": [
            "G.C. v. DCF (2019) - ADA applies to dependency proceedings",
            "In re K.W. (2017) - Reasonable accommodations required"
        ],
        "false_claims": "Fla. Stat. §§ 68.081-68.09",
        "ada_violations_common": [
            "No accommodations for physical disabilities",
            "Failure to provide accessible transportation",
            "Discriminatory foster care placements"
        ]
    },
    "IL": {
        "agency": "Illinois Department of Children and Family Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "705 ILCS 405/1-3 - Best interests includes accommodating disabilities",
            "775 ILCS 5/ - Illinois Human Rights Act"
        ],
        "case_law": [
            "In re D.T. (2012) - DCFS must accommodate disabilities",
            "In re M.M. (2009) - Cannot discriminate based on mental illness"
        ],
        "false_claims": "740 ILCS 175/",
        "ada_violations_common": [
            "Inadequate psychiatric services",
            "No learning disability accommodations",
            "Inaccessible DCFS offices"
        ]
    },
    "PA": {
        "agency": "Pennsylvania Department of Human Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "23 Pa. C.S. § 6301 - Child welfare includes disability protections",
            "43 P.S. § 955 - Pennsylvania Human Relations Act"
        ],
        "case_law": [
            "In re L.J.B. (2013) - Services must be tailored to disabilities",
            "In re Adoption of J.J. (2011) - ADA applies to TPR proceedings"
        ],
        "false_claims": "No state FCA - Use federal 31 U.S.C. §§ 3729-3733",
        "ada_violations_common": [
            "No intellectual disability accommodations",
            "Failure to provide support persons",
            "Biased permanency recommendations"
        ]
    },
    "OH": {
        "agency": "Ohio Department of Job and Family Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "ORC § 2151.414 - Best interest factors must consider accommodations",
            "ORC § 4112 - Ohio Civil Rights Act"
        ],
        "case_law": [
            "In re C.F. (2007) - Agency must provide reasonable accommodations",
            "In re B.W. (2015) - Disability alone cannot justify removal"
        ],
        "false_claims": "No state FCA - Use federal 31 U.S.C. §§ 3729-3733",
        "ada_violations_common": [
            "No autism spectrum accommodations",
            "Inadequate mental health referrals",
            "Inaccessible court facilities"
        ]
    },
    "GA": {
        "agency": "Georgia Division of Family and Children Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "O.C.G.A. § 15-11-26 - Dependency proceedings must accommodate disabilities",
            "O.C.G.A. § 30-1-1 - Georgia disability rights"
        ],
        "case_law": [
            "In re S.K.L. (2018) - DFCS must provide ADA accommodations",
            "In re L.T. (2014) - Cannot terminate based on disability prognosis"
        ],
        "false_claims": "O.C.G.A. §§ 23-3-120 to 23-3-127",
        "ada_violations_common": [
            "No sensory disability accommodations",
            "Failure to train foster parents",
            "Discriminatory placement decisions"
        ]
    },
    "NC": {
        "agency": "North Carolina Division of Social Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "N.C. Gen. Stat. § 7B-901 - Services must be appropriate to family needs",
            "N.C. Gen. Stat. § 168A - Persons with Disabilities Protection Act"
        ],
        "case_law": [
            "In re A.K. (2017) - ADA accommodations required in DSS services",
            "In re J.S.L. (2010) - Disability must not be deciding factor"
        ],
        "false_claims": "N.C. Gen. Stat. §§ 1-605 to 1-618",
        "ada_violations_common": [
            "No traumatic brain injury accommodations",
            "Inadequate substance abuse services",
            "Failure to coordinate with disability services"
        ]
    },
    "MI": {
        "agency": "Michigan Department of Health and Human Services",
        "ada_coordinator_required": True,
        "specific_statutes": [
            "MCL § 712A.13a - Reasonable efforts must include accommodations",
            "MCL § 37.1101 - Persons with Disabilities Civil Rights Act"
        ],
        "case_law": [
            "In re Sanders (2006) - DHHS must accommodate parental disabilities",
            "In re Rood (2009) - Services must be tailored to abilities"
        ],
        "false_claims": "MCL 400.601-400.615",
        "ada_violations_common": [
            "No developmental disability accommodations",
            "Failure to provide assistive technology",
            "Biased psychological evaluations"
        ]
    }
}

# ADA Compliance Checklist for CPS Cases
ADA_COMPLIANCE_CHECKLIST = {
    "investigation_phase": [
        {"item": "Was parent asked about disability status?", "required": True},
        {"item": "Were communication accommodations offered?", "required": True},
        {"item": "Was accessible meeting location provided?", "required": True},
        {"item": "Were documents provided in accessible format?", "required": True},
        {"item": "Was extra time allowed for responses?", "required": False},
        {"item": "Was support person permitted?", "required": False}
    ],
    "service_plan_phase": [
        {"item": "Does plan address disability accommodations?", "required": True},
        {"item": "Are services accessible to parent?", "required": True},
        {"item": "Are alternative compliance methods offered?", "required": True},
        {"item": "Are timelines modified for disability?", "required": False},
        {"item": "Is transportation assistance provided?", "required": False},
        {"item": "Are in-home services offered when needed?", "required": False}
    ],
    "court_proceedings": [
        {"item": "Is courtroom physically accessible?", "required": True},
        {"item": "Are auxiliary aids provided?", "required": True},
        {"item": "Is ADA coordinator involved?", "required": False},
        {"item": "Are breaks provided for medical needs?", "required": False},
        {"item": "Are documents in accessible format?", "required": True}
    ],
    "visitation": [
        {"item": "Is visitation location accessible?", "required": True},
        {"item": "Are accommodations provided during visits?", "required": True},
        {"item": "Is transportation accessible?", "required": False},
        {"item": "Are visit times/duration modified as needed?", "required": False}
    ]
}

# Common ADA Violations in CPS Cases
COMMON_ADA_VIOLATIONS = [
    {
        "violation": "Failure to provide reasonable accommodations",
        "description": "CPS did not modify services or procedures to accommodate parent's disability",
        "legal_basis": "42 U.S.C. § 12132; 28 C.F.R. § 35.130",
        "remedy": "File ADA complaint with HHS Office for Civil Rights"
    },
    {
        "violation": "Discrimination in custody decisions",
        "description": "Removal or TPR based on parent's disability rather than actual harm to child",
        "legal_basis": "42 U.S.C. § 12132; 29 U.S.C. § 794",
        "remedy": "Appeal citing ADA; file §1983 lawsuit"
    },
    {
        "violation": "Inaccessible services",
        "description": "Required services not accessible to parent with disability",
        "legal_basis": "28 C.F.R. § 35.149",
        "remedy": "Request accessible alternatives; file ADA complaint"
    },
    {
        "violation": "Failure to provide auxiliary aids",
        "description": "No interpreter, accessible documents, or communication aids",
        "legal_basis": "28 C.F.R. § 35.160",
        "remedy": "Request aids immediately; document refusals"
    },
    {
        "violation": "Biased parenting assessments",
        "description": "Evaluations not modified to account for disability",
        "legal_basis": "28 C.F.R. § 35.130(b)(1)",
        "remedy": "Request adaptive evaluation; challenge biased results"
    },
    {
        "violation": "Unnecessary segregation",
        "description": "Children removed when services could keep family together",
        "legal_basis": "Olmstead v. L.C., 527 U.S. 581 (1999)",
        "remedy": "Cite Olmstead; request in-home services"
    }
]

def analyze_case_for_ada_violations(case_data: dict, violations: list, timeline: list) -> dict:
    """
    Analyze a case for potential ADA compliance violations
    Returns detailed analysis with citations
    """
    ada_issues = []
    
    # Check for disability mentions
    case_text = str(case_data).lower() + " " + " ".join([str(v) for v in violations]) + " " + " ".join([str(t) for t in timeline])
    
    disability_keywords = [
        "disability", "disabled", "mental health", "psychiatric", "autism", "adhd",
        "depression", "anxiety", "bipolar", "schizophrenia", "intellectual disability",
        "developmental disability", "blind", "deaf", "wheelchair", "mobility",
        "cognitive", "learning disability", "ptsd", "trauma", "brain injury"
    ]
    
    disabilities_found = [kw for kw in disability_keywords if kw in case_text]
    
    if disabilities_found:
        # Check for accommodation issues
        accommodation_keywords = ["accommodation", "ada", "modify", "accessible", "interpreter", "auxiliary"]
        accommodations_mentioned = any(kw in case_text for kw in accommodation_keywords)
        
        if not accommodations_mentioned:
            ada_issues.append({
                "issue": "Possible failure to provide ADA accommodations",
                "description": f"Disability indicators found ({', '.join(disabilities_found)}) but no accommodations documented",
                "severity": "HIGH",
                "legal_basis": "42 U.S.C. § 12132; 28 C.F.R. § 35.130",
                "recommendation": "Immediately request ADA accommodations in writing; document all disability-related needs"
            })
        
        # Check for discrimination language
        discrimination_keywords = ["because of disability", "due to mental health", "unable to parent", "capacity", "competency"]
        if any(kw in case_text for kw in discrimination_keywords):
            ada_issues.append({
                "issue": "Potential disability-based discrimination",
                "description": "Language suggests decisions may be based on disability rather than actual harm",
                "severity": "CRITICAL",
                "legal_basis": "ADA Title II; Section 504; Tennessee v. Lane",
                "recommendation": "Document discriminatory statements; prepare ADA complaint and potential §1983 claim"
            })
    
    # Check service plan issues
    if "service plan" in case_text or "case plan" in case_text:
        if not any(kw in case_text for kw in ["accommodation", "modify", "alternative"]):
            ada_issues.append({
                "issue": "Service plan may lack required accommodations",
                "description": "Service plan exists but no disability accommodations documented",
                "severity": "MEDIUM",
                "legal_basis": "28 C.F.R. § 35.130(b)(7)",
                "recommendation": "Request written ADA accommodations be added to service plan"
            })
    
    return {
        "disabilities_identified": disabilities_found,
        "ada_issues": ada_issues,
        "total_issues": len(ada_issues),
        "critical_issues": len([i for i in ada_issues if i["severity"] == "CRITICAL"]),
        "compliance_score": max(0, 100 - (len(ada_issues) * 20)),
        "recommendations": [
            "Request ADA coordinator involvement in case",
            "Document all accommodation requests in writing",
            "File HHS complaint if accommodations denied",
            "Consider ADA claims in any federal lawsuit"
        ] if ada_issues else ["No immediate ADA concerns identified - continue monitoring"]
    }
