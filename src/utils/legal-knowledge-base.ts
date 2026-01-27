/**
 * Comprehensive Legal Knowledge Base for CPS Defense
 * 
 * This contains real case law, statutes, constitutional principles,
 * and legal standards that the AI uses for sophisticated analysis.
 * 
 * NOW ENHANCED WITH:
 * - Black's Law Dictionary definitions
 * - Extensive case law database
 * - Rooker-Feldman avoidance strategies
 */

// Import Black's Law and comprehensive case law
import { BLACKS_LAW_DEFINITIONS, getBlacksLawDefinition, generateDefinitionsSection } from './blacks-law-definitions';
import { 
  ROOKER_FELDMAN_CASES, 
  ROOKER_FELDMAN_AVOIDANCE,
  SUPREME_COURT_CPS_CASES,
  CIRCUIT_COURT_CPS_CASES,
  MISSISSIPPI_SUPREME_COURT_CASES,
  getCasesByIssue,
  generateRookerFeldmanAvoidanceLanguage,
  analyzeRookerFeldmanRisk
} from './comprehensive-case-law-database';

// ============================================================================
// LANDMARK SUPREME COURT CASES - CPS & FAMILY LAW
// ============================================================================

export const SUPREME_COURT_CASES = {
  // Parental Rights as Fundamental
  troxel: {
    citation: 'Troxel v. Granville, 530 U.S. 57 (2000)',
    holding: 'The liberty interest of parents in the care, custody, and control of their children is "perhaps the oldest of the fundamental liberty interests recognized by this Court."',
    application: 'Parents have a fundamental constitutional right to make decisions concerning the care, custody, and control of their children.',
    keyQuotes: [
      'The interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests recognized by this Court.',
      'So long as a parent adequately cares for his or her children, there will normally be no reason for the State to inject itself into the private realm of the family.'
    ],
    useFor: ['Parental rights challenges', 'State interference objections', 'Fundamental rights violations'],
    legalTest: 'Strict scrutiny applies when state infringes on fundamental parental rights'
  },

  stanley: {
    citation: 'Stanley v. Illinois, 405 U.S. 645 (1972)',
    holding: 'Parents have a fundamental right to raise their children, and the state cannot terminate parental rights without due process.',
    application: 'State must provide procedural protections before terminating or restricting parental rights.',
    keyQuotes: [
      'The rights to conceive and to raise one\'s children have been deemed essential.',
      'The private interest here, that of a man in the children he has sired and raised, undeniably warrants deference and, absent a powerful countervailing interest, protection.'
    ],
    useFor: ['Due process violations', 'Termination of parental rights', 'Procedural rights'],
    legalTest: 'Due process required before state can interfere with parent-child relationship'
  },

  santosky: {
    citation: 'Santosky v. Kramer, 455 U.S. 745 (1982)',
    holding: 'Clear and convincing evidence standard required for termination of parental rights.',
    application: 'State must prove by clear and convincing evidence that grounds exist to terminate parental rights.',
    keyQuotes: [
      'The fundamental liberty interest of natural parents in the care, custody, and management of their child does not evaporate simply because they have not been model parents.',
      'Before a State may sever completely and irrevocably the rights of parents in their natural child, due process requires that the State support its allegations by at least clear and convincing evidence.'
    ],
    useFor: ['Burden of proof challenges', 'Evidentiary standards', 'TPR proceedings'],
    legalTest: 'Clear and convincing evidence standard for termination of parental rights'
  },

  lassiter: {
    citation: 'Lassiter v. Department of Social Services, 452 U.S. 18 (1981)',
    holding: 'Right to counsel in termination proceedings determined by case-by-case analysis, but often required.',
    application: 'Parents may have right to appointed counsel in TPR proceedings depending on circumstances.',
    keyQuotes: [
      'A parent\'s desire for and right to "the companionship, care, custody, and management of his or her children" is an important interest that "undeniably warrants deference and, absent a powerful countervailing interest, protection."',
    ],
    useFor: ['Right to counsel', 'Due process violations', 'Procedural protections'],
    legalTest: 'Mathews v. Eldridge balancing test for procedural due process'
  },

  // Fourth Amendment - Search & Seizure
  camara: {
    citation: 'Camara v. Municipal Court, 387 U.S. 523 (1967)',
    holding: 'Administrative searches generally require warrants or consent.',
    application: 'CPS home visits may constitute searches requiring warrants unless consent or exigent circumstances.',
    keyQuotes: [
      'Except in certain carefully defined classes of cases, a search of private property without proper consent is unreasonable unless it has been authorized by a valid search warrant.'
    ],
    useFor: ['Warrantless home visits', 'Fourth Amendment violations', 'Consent challenges'],
    legalTest: 'Warrant requirement for administrative searches absent consent or exigency'
  },

  // Fifth Amendment - Self-Incrimination
  minnesotaVMurphy: {
    citation: 'Minnesota v. Murphy, 465 U.S. 420 (1984)',
    holding: 'Fifth Amendment protections apply in civil proceedings with potential criminal implications.',
    application: 'Parents can invoke Fifth Amendment privilege in CPS proceedings if testimony could lead to criminal charges.',
    keyQuotes: [
      'The Fifth Amendment privilege against compulsory self-incrimination is not limited to proceedings in which a criminal conviction is sought.'
    ],
    useFor: ['Self-incrimination objections', 'Coerced statements', 'Miranda violations'],
    legalTest: 'Privilege applies when answers could lead to criminal prosecution'
  },

  // Due Process - Substantive
  washingtonVGlucksberg: {
    citation: 'Washington v. Glucksberg, 521 U.S. 702 (1997)',
    holding: 'Fundamental rights analysis requires liberty interest to be deeply rooted in Nation\'s history and tradition.',
    application: 'Parental rights are fundamental because they are deeply rooted in American legal tradition.',
    keyQuotes: [
      'Our established method of substantive-due-process analysis has two primary features: First, we have regularly observed that the Due Process Clause specially protects those fundamental rights and liberties which are, objectively, "deeply rooted in this Nation\'s history and tradition."'
    ],
    useFor: ['Substantive due process claims', 'Fundamental rights arguments'],
    legalTest: 'Strict scrutiny for fundamental rights; rational basis for others'
  }
};

// ============================================================================
// FEDERAL CIRCUIT COURT CASES - CRITICAL CPS PRECEDENTS
// ============================================================================

export const CIRCUIT_COURT_CASES = {
  // Fourth Amendment - Warrantless Searches
  calabrettaVFloyd: {
    citation: 'Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)',
    circuit: '9th Circuit',
    holding: 'CPS social workers need warrant or exigent circumstances to enter home and examine child over parental objection.',
    application: 'Parents can refuse warrantless CPS entry absent consent or emergency.',
    keyQuotes: [
      'Investigatory home visits that involve the interviewing of children are searches within the meaning of the Fourth Amendment.',
      'Government officials may not enter a home without a warrant or one of the well-established exceptions to the warrant requirement, even when seeking to investigate suspected child abuse.'
    ],
    useFor: ['Warrantless home entry', 'CPS violations', 'Fourth Amendment § 1983 claims'],
    section1983: true,
    qualifiedImmunity: 'Clearly established law - no QI if warrantless entry without exigency'
  },

  wallisvSpencer: {
    citation: 'Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)',
    circuit: '9th Circuit',
    holding: 'Strip searching child without warrant or exigent circumstances violates Fourth Amendment.',
    application: 'CPS cannot conduct invasive searches of children without parental consent, warrant, or emergency.',
    keyQuotes: [
      'A visual body cavity search of a child in state custody is an invasion of the child\'s privacy that is sufficiently serious to require a warrant absent exigent circumstances.',
    ],
    useFor: ['Invasive searches', 'Child examinations', 'Fourth Amendment violations'],
    section1983: true,
    qualifiedImmunity: 'Clearly established - no QI for warrantless strip searches'
  },

  // Procedural Due Process
  duchesneVSugarman: {
    citation: 'Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)',
    circuit: '2nd Circuit',
    holding: 'Parents have due process right to notice and hearing before or promptly after emergency removal.',
    application: 'Emergency removals without immediate hearing may violate due process.',
    useFor: ['Emergency removals', 'Notice violations', 'Hearing rights'],
    section1983: true
  },

  // Substantive Due Process - State Created Danger
  desharneyVWinnebago: {
    citation: 'DeShaney v. Winnebago County, 489 U.S. 189 (1989)',
    holding: 'Generally no substantive due process liability for failure to protect, unless state creates danger.',
    application: 'CPS may have liability if their actions affirmatively create or increase danger to child.',
    keyQuotes: [
      'The Clause is phrased as a limitation on the State\'s power to act, not as a guarantee of certain minimal levels of safety and security.',
    ],
    useFor: ['State created danger doctrine', 'CPS liability', 'Harm to children in state custody'],
    exception: 'Special relationship or state-created danger can create liability'
  },

  // Familial Association
  hodoroskiVRay: {
    citation: 'Hodoroski v. Ray, 844 F.3d 1210 (9th Cir. 2017)',
    circuit: '9th Circuit',
    holding: 'Right to familial association includes right to live with family members and direct upbringing of children.',
    application: 'Unjustified separation of family members violates fundamental rights.',
    useFor: ['Family separation', 'Visitation restrictions', 'Placement decisions'],
    section1983: true
  },

  // Fabrication of Evidence
  whiteheadVCitizen: {
    citation: 'Whitehead v. Citizen, 680 F.3d 1124 (9th Cir. 2012)',
    circuit: '9th Circuit',
    holding: 'Social workers who fabricate evidence or make material omissions in warrant affidavits violate clearly established law.',
    application: 'CPS workers liable under § 1983 for falsifying reports or withholding exculpatory evidence.',
    useFor: ['False allegations', 'Fabricated evidence', 'Malicious prosecution'],
    section1983: true,
    qualifiedImmunity: 'No QI for fabricating evidence'
  },

  // Removal Without Investigation
  rogersVCounty: {
    citation: 'Rogers v. County of San Joaquin, 487 F.3d 1288 (9th Cir. 2007)',
    circuit: '9th Circuit',
    holding: 'Removing child without adequate investigation violates Fourth Amendment.',
    application: 'CPS must conduct reasonable investigation before removal; cannot remove based on mere allegations.',
    useFor: ['Inadequate investigation', 'Premature removal', 'Fourth Amendment claims'],
    section1983: true
  }
};

// ============================================================================
// FEDERAL STATUTES - CPS GOVERNING LAWS
// ============================================================================

export const FEDERAL_STATUTES = {
  asfa: {
    name: 'Adoption and Safe Families Act of 1997',
    citation: '42 U.S.C. § 671 et seq.',
    keyProvisions: {
      reasonableEfforts: {
        statute: '42 U.S.C. § 671(a)(15)',
        requirement: 'State must make reasonable efforts to prevent removal and facilitate reunification.',
        timeline: 'Reasonable efforts required both pre-removal and post-removal',
        exceptions: [
          'Aggravated circumstances as defined by state law',
          'Parent previously terminated on another child',
          'Parent committed murder/manslaughter of another child',
          'Parent committed felony assault resulting in serious injury to child'
        ],
        useFor: 'Challenge CPS failure to provide services or support reunification'
      },
      permanencyHearing: {
        statute: '42 U.S.C. § 675(5)(C)',
        requirement: 'Permanency hearing within 12 months of child entering foster care.',
        timeline: '12 months from foster care entry',
        useFor: 'Challenge delays in permanency hearings'
      },
      caseReview: {
        statute: '42 U.S.C. § 675(5)(B)',
        requirement: 'Periodic review hearings every 6 months.',
        timeline: 'No later than 6 months from prior review',
        useFor: 'Ensure case progress is being reviewed'
      },
      timelyFilingTPR: {
        statute: '42 U.S.C. § 675(5)(E)',
        requirement: 'State must file TPR petition if child in care 15 of most recent 22 months (with exceptions).',
        timeline: '15 of 22 months rule',
        exceptions: [
          'Child placed with relative',
          'State documents compelling reason not to file',
          'State has not provided reasonable services'
        ],
        useFor: 'Challenge premature or delayed TPR filings'
      }
    },
    commonViolations: [
      'Failure to make reasonable efforts before removal',
      'Failure to make reasonable efforts toward reunification',
      'Missing permanency hearing deadlines',
      'Inadequate case plan',
      'Not exploring kinship placements'
    ]
  },

  capta: {
    name: 'Child Abuse Prevention and Treatment Act',
    citation: '42 U.S.C. § 5106 et seq.',
    keyProvisions: {
      definitions: {
        statute: '42 U.S.C. § 5106g',
        defines: 'Child abuse and neglect standards for federal funding',
        requirement: 'States must meet minimum definitions to receive federal funds',
      },
      reporting: {
        requirement: 'States must have procedures to receive and investigate reports',
        useFor: 'Challenge inadequate investigations'
      },
      guardianAdLitem: {
        statute: '42 U.S.C. § 5106a(b)(2)(B)(xiii)',
        requirement: 'Appointment of guardian ad litem for child in judicial proceedings',
        useFor: 'Ensure child representation in proceedings'
      }
    }
  },

  icwa: {
    name: 'Indian Child Welfare Act of 1978',
    citation: '25 U.S.C. § 1901 et seq.',
    applicability: 'Applies to Native American children and families',
    keyProvisions: {
      jurisdiction: {
        statute: '25 U.S.C. § 1911',
        requirement: 'Tribal court has exclusive jurisdiction over children domiciled on reservation',
        transfer: 'State courts must transfer to tribal court absent good cause',
      },
      activeEfforts: {
        statute: '25 U.S.C. § 1912(d)',
        requirement: 'Active efforts (higher than reasonable efforts) to prevent breakup of Indian family',
        useFor: 'Challenge inadequate services to Native families'
      },
      placementPreferences: {
        statute: '25 U.S.C. § 1915',
        hierarchy: [
          '1. Extended family member',
          '2. Foster home licensed/approved by tribe',
          '3. Indian foster home',
          '4. Institution approved by tribe or operated by Indian organization'
        ],
        useFor: 'Challenge placement decisions for Native children'
      },
      standardOfProof: {
        statute: '25 U.S.C. § 1912',
        requirement: 'Beyond reasonable doubt for termination (higher than clear and convincing)',
        expert: 'Qualified expert witness required to testify',
        useFor: 'Higher evidentiary standard in TPR'
      }
    }
  },

  titleIV_E: {
    name: 'Title IV-E Foster Care Program',
    citation: '42 U.S.C. § 672',
    requirement: 'Federal reimbursement for foster care costs if state meets requirements',
    keyProvisions: {
      eligibility: 'Child must be removed pursuant to judicial determination',
      contraryToWelfare: 'Court must find continued residence in home contrary to welfare',
      reasonableEfforts: 'Court must find reasonable efforts were made'
    },
    useFor: 'Challenge removals that do not meet federal requirements'
  }
};

// ============================================================================
// CONSTITUTIONAL PROVISIONS - FUNDAMENTAL RIGHTS
// ============================================================================

export const CONSTITUTIONAL_RIGHTS = {
  firstAmendment: {
    text: 'Congress shall make no law... abridging the freedom of speech... or the right of the people peaceably to assemble...',
    applications: [
      {
        right: 'Religious freedom',
        cpApplication: 'Parents can raise children according to religious beliefs absent harm',
        cases: ['Wisconsin v. Yoder', 'Prince v. Massachusetts'],
        violations: [
          'Penalizing parents for religious practices (e.g., homeschooling, medical choices)',
          'Removing children based on religious beliefs'
        ]
      },
      {
        right: 'Freedom of association',
        cpApplication: 'Right to family association',
        violations: [
          'Restricting contact with family members without justification',
          'Prohibiting association with extended family'
        ]
      }
    ]
  },

  fourthAmendment: {
    text: 'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated...',
    applications: [
      {
        right: 'No warrantless home entry',
        cpApplication: 'CPS cannot enter home without consent, warrant, or exigent circumstances',
        exceptions: [
          'Voluntary consent (must be knowing and voluntary)',
          'Exigent circumstances (immediate threat to child)',
          'Valid search warrant',
          'Hot pursuit',
          'Plain view doctrine'
        ],
        violations: [
          'Forcing entry without warrant or consent',
          'Threatening parents to gain entry',
          'Claiming false emergency to bypass warrant',
          'Searching areas beyond scope of consent'
        ]
      },
      {
        right: 'No unreasonable seizure of person',
        cpApplication: 'Removing child is a "seizure" requiring constitutional justification',
        legalStandard: 'Probable cause + exigent circumstances OR court order',
        violations: [
          'Removing child without court order absent emergency',
          'Basing removal on unsubstantiated allegations',
          'Removing all children when only one at risk'
        ]
      },
      {
        right: 'No strip searches without cause',
        cpApplication: 'Cannot strip search child without warrant, consent, or exigent circumstances',
        cases: ['Wallis v. Spencer'],
        violations: [
          'Strip searching child at school without parent consent',
          'Invasive medical exams without parental permission or court order'
        ]
      }
    ],
    section1983: 'Violations actionable under 42 U.S.C. § 1983'
  },

  fifthAmendment: {
    text: 'No person... shall be compelled in any criminal case to be a witness against himself...',
    applications: [
      {
        right: 'Privilege against self-incrimination',
        cpApplication: 'Parents can refuse to answer questions if answers could incriminate',
        scope: 'Applies in civil proceedings if criminal prosecution possible',
        limitations: 'Can be used against parent in dependency proceedings (adverse inference)',
        violations: [
          'Forcing parents to admit to abuse',
          'Compelling testimony without Miranda warnings when in custody',
          'Threatening removal if parent doesn\'t answer questions'
        ]
      }
    ]
  },

  fourteenthAmendment: {
    text: 'No State shall... deprive any person of life, liberty, or property, without due process of law...',
    applications: [
      {
        right: 'Substantive due process - parental rights',
        cpApplication: 'Fundamental right to raise children; state must have compelling interest and use least restrictive means',
        legalStandard: 'Strict scrutiny',
        violations: [
          'Removing children based on poverty alone',
          'Removing children for non-conforming but non-harmful parenting',
          'Imposing unreasonable case plan requirements',
          'Failing to consider less restrictive alternatives to removal'
        ]
      },
      {
        right: 'Procedural due process',
        cpApplication: 'Parents entitled to notice and hearing before or promptly after removal',
        requirements: [
          'Adequate notice of allegations',
          'Timely hearing',
          'Opportunity to be heard',
          'Impartial tribunal',
          'Right to present evidence',
          'Right to confront witnesses (in some proceedings)'
        ],
        violations: [
          'No hearing after emergency removal',
          'Inadequate notice of allegations',
          'Denying parent right to testify',
          'Excluding relevant evidence',
          'Biased judge',
          'Failing to provide interpreter'
        ]
      },
      {
        right: 'Equal protection',
        cpApplication: 'Cannot discriminate based on race, religion, disability, etc.',
        legalStandard: 'Suspect class = strict scrutiny; others = rational basis',
        violations: [
          'Treating minorities more harshly',
          'Removing children from disabled parents without individualized assessment',
          'Discriminating based on poverty',
          'Targeting families based on religion'
        ]
      }
    ],
    section1983: 'All violations actionable under 42 U.S.C. § 1983'
  }
};

// ============================================================================
// SECTION 1983 CIVIL RIGHTS LITIGATION
// ============================================================================

export const SECTION_1983 = {
  statute: '42 U.S.C. § 1983',
  fullText: 'Every person who, under color of any statute, ordinance, regulation, custom, or usage, of any State... subjects, or causes to be subjected, any citizen... to the deprivation of any rights, privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured...',
  
  elements: {
    actingUnderColorOfLaw: {
      requirement: 'Defendant must be state actor or acting under color of state law',
      includes: ['CPS social workers', 'Law enforcement', 'Judges (limited)', 'Government agencies'],
      excludes: ['Private citizens', 'Private agencies (unless performing state function)']
    },
    deprivationOfRights: {
      requirement: 'Violation of federal constitutional or statutory right',
      commonRights: [
        'Fourth Amendment (warrantless search/seizure)',
        'Fourteenth Amendment substantive due process (parental rights)',
        'Fourteenth Amendment procedural due process (notice, hearing)',
        'First Amendment (religious freedom, association)',
        'Equal Protection'
      ]
    },
    causation: {
      requirement: 'Defendant\'s actions caused the constitutional violation',
      standard: 'But-for causation or substantial factor'
    }
  },

  qualifiedImmunity: {
    definition: 'Government officials immune from liability unless they violated clearly established law',
    twoPartTest: {
      part1: 'Was a constitutional right violated?',
      part2: 'Was the right clearly established at the time of violation?'
    },
    clearlyEstablished: {
      standard: 'Law must be sufficiently clear that every reasonable official would understand conduct is unlawful',
      sources: ['Supreme Court precedent', 'Circuit Court precedent from same circuit', 'Consensus of cases from other circuits'],
      noQI_examples: [
        'Warrantless home entry without exigent circumstances (Calabretta)',
        'Strip searching child without warrant or exigency (Wallis)',
        'Fabricating evidence (Whitehead)',
        'Removing child without adequate investigation (Rogers)'
      ]
    }
  },

  damages: {
    compensatory: {
      types: ['Economic damages (lost wages, therapy costs)', 'Emotional distress', 'Loss of companionship'],
      proof: 'Must demonstrate actual injury'
    },
    punitive: {
      standard: 'Available if defendant acted with malicious intent or reckless disregard',
      purpose: 'Punish and deter egregious conduct'
    },
    nominalDamages: {
      amount: 'Typically $1',
      when: 'Constitutional violation proven but no actual damages shown'
    }
  },

  municipalLiability: {
    monell: {
      citation: 'Monell v. Department of Social Services, 436 U.S. 658 (1978)',
      requirement: 'Municipality liable only for violations caused by official policy or custom',
      notLiable: 'Cannot sue municipality under respondeat superior (vicarious liability)',
      policy: 'Written policy, unwritten custom, or deliberate indifference'
    },
    customOrPolicy: [
      'Formal written policy',
      'Widespread practice so permanent and well-settled to constitute custom',
      'Decision by official with final policymaking authority',
      'Deliberate indifference (failure to train, failure to supervise)'
    ]
  },

  stateLiability: {
    sovereignImmunity: '11th Amendment bars suits against states in federal court',
    exceptions: [
      'State officials sued in individual capacity',
      'Prospective injunctive relief (Ex Parte Young)',
      'State waives immunity',
      'Congress abrogates immunity (rare)'
    ]
  }
};

// ============================================================================
// COMMON CPS VIOLATIONS & LEGAL CHALLENGES
// ============================================================================

export const COMMON_VIOLATIONS = {
  warrantlessEntry: {
    violation: 'CPS enters home without consent, warrant, or exigent circumstances',
    constitutionalRight: 'Fourth Amendment',
    legalStandard: 'Warrant or valid exception required',
    exceptions: ['Voluntary consent', 'Exigent circumstances (immediate danger)', 'Valid warrant'],
    howToChallenge: [
      'File motion to suppress evidence obtained',
      'Assert Fourth Amendment violation in dependency proceeding',
      'File § 1983 lawsuit for damages'
    ],
    cases: ['Calabretta v. Floyd', 'Camara v. Municipal Court'],
    damages: 'Compensatory and punitive damages available'
  },

  inadequateInvestigation: {
    violation: 'CPS removes child based on unverified allegations without proper investigation',
    constitutionalRight: 'Fourth Amendment (unreasonable seizure), Fourteenth Amendment (due process)',
    legalStandard: 'Must have probable cause based on adequate investigation',
    howToChallenge: [
      'File emergency motion for return',
      'Challenge removal at detention hearing',
      'File § 1983 claim for unreasonable seizure'
    ],
    cases: ['Rogers v. County of San Joaquin'],
    commonFactors: [
      'Removed all children when only one allegedly at risk',
      'Did not interview alleged victim',
      'Did not interview witnesses',
      'Relied solely on anonymous tip',
      'No medical examination before removal'
    ]
  },

  noReasonableEfforts: {
    violation: 'CPS fails to make reasonable efforts to prevent removal or facilitate reunification',
    statutoryRight: 'ASFA (42 U.S.C. § 671(a)(15))',
    legalStandard: 'State must make reasonable efforts unless aggravated circumstances',
    howToChallenge: [
      'Object to findings at review hearings',
      'File motion to compel services',
      'Appeal reasonable efforts finding'
    ],
    commonExamples: [
      'No services offered before removal',
      'Inadequate or inappropriate case plan services',
      'Not exploring kinship placements',
      'Providing services parent cannot access (wrong language, too far away)',
      'Setting up parent to fail with impossible requirements'
    ]
  },

  proceduralDueProcess: {
    violation: 'Parent denied adequate notice, hearing, or opportunity to be heard',
    constitutionalRight: 'Fourteenth Amendment procedural due process',
    requirements: [
      'Adequate notice of allegations and hearing',
      'Timely hearing after removal',
      'Opportunity to testify and present evidence',
      'Impartial decision-maker',
      'Right to counsel (in TPR and often in dependency)'
    ],
    howToChallenge: [
      'Object on the record to procedural violations',
      'File motion to continue for proper notice',
      'Raise due process violation on appeal',
      'File § 1983 claim if egregious'
    ]
  },

  fabricatedEvidence: {
    violation: 'CPS worker falsifies reports, lies in court filings, or withholds exculpatory evidence',
    constitutionalRight: 'Fourteenth Amendment due process',
    legalStandard: 'Fabricating or withholding material evidence violates due process',
    howToChallenge: [
      'File motion to dismiss based on fraud on court',
      'Request sanctions',
      'File § 1983 claim for fabrication of evidence',
      'File bar complaint against attorney'
    ],
    cases: ['Whitehead v. Citizen'],
    qualifiedImmunity: 'No qualified immunity for fabricating evidence',
    damages: 'Compensatory and punitive damages available'
  },

  visitationRestrictions: {
    violation: 'CPS unreasonably restricts or denies parent-child visitation',
    constitutionalRight: 'Fourteenth Amendment liberty interest in family association',
    legalStandard: 'Restrictions must be narrowly tailored to serve compelling interest',
    howToChallenge: [
      'File motion to increase visitation',
      'Object to restrictive visitation order',
      'File § 1983 claim for violation of familial association'
    ],
    cases: ['Hodoroski v. Ray'],
    unreasonableRestrictions: [
      'No unsupervised visits without justification',
      'Minimal visitation (e.g., 1 hour per month)',
      'Requiring parent to pay for supervision',
      'Denying visitation as punishment for non-compliance'
    ]
  }
};

// ============================================================================
// LEGAL TESTS & STANDARDS
// ============================================================================

export const LEGAL_TESTS = {
  scrutinyLevels: {
    strictScrutiny: {
      trigger: 'Fundamental right or suspect classification',
      test: 'Government must prove compelling state interest + narrowly tailored means',
      applies: ['Parental rights', 'Race discrimination', 'Religious freedom (hybrid rights)'],
      burden: 'On government',
      standard: 'Very difficult to satisfy'
    },
    intermediateScrutiny: {
      trigger: 'Semi-suspect classification (gender, legitimacy)',
      test: 'Important governmental interest + substantially related means',
      applies: ['Gender discrimination'],
      burden: 'On government',
      standard: 'Moderate difficulty'
    },
    rationalBasis: {
      trigger: 'All other government actions',
      test: 'Legitimate government interest + rationally related means',
      applies: ['Economic regulations', 'Non-fundamental rights'],
      burden: 'On challenger',
      standard: 'Very easy to satisfy (highly deferential)'
    }
  },

  standardsOfProof: {
    beyondReasonableDoubt: {
      percentage: '~99%',
      appliesTo: ['Criminal convictions', 'ICWA terminations'],
      description: 'Highest standard; no reasonable doubt in mind of reasonable person'
    },
    clearAndConvincing: {
      percentage: '~75%',
      appliesTo: ['Termination of parental rights (Santosky)', 'Many dependency adjudications'],
      description: 'More than preponderance; substantially more likely than not'
    },
    preponderanceOfEvidence: {
      percentage: '~51%',
      appliesTo: ['Most civil cases', 'Some dependency adjudications'],
      description: 'More likely than not'
    },
    probableCause: {
      percentage: '~40-50%',
      appliesTo: ['Warrants', 'Emergency removals'],
      description: 'Fair probability or reasonable grounds to believe'
    },
    reasonableSuspicion: {
      percentage: '~20-30%',
      appliesTo: ['Investigative stops (Terry stops)'],
      description: 'Specific and articulable facts creating reasonable suspicion'
    }
  },

  proceduralTests: {
    mathewsVEldridge: {
      citation: 'Mathews v. Eldridge, 424 U.S. 319 (1976)',
      purpose: 'Determine what process is due',
      factors: [
        '1. Private interest affected (parental rights = highest)',
        '2. Risk of erroneous deprivation and value of additional safeguards',
        '3. Government interest and burden of additional procedures'
      ],
      application: 'Balance these factors to determine required procedural protections'
    }
  }
};

// ============================================================================
// STATE-SPECIFIC CPS LAWS (Sample - Mississippi)
// ============================================================================

export const STATE_LAWS = {
  mississippi: {
    removal: {
      statute: 'Miss. Code Ann. § 43-21-301',
      standard: 'Immediate and urgent necessity',
      timeForHearing: '72 hours (excluding weekends and holidays)',
      who: 'Law enforcement or CPS with judicial approval'
    },
    adjudication: {
      statute: 'Miss. Code Ann. § 43-21-303',
      standard: 'Clear and convincing evidence child is abused or neglected',
      timeline: 'Within reasonable time after petition filed'
    },
    termination: {
      statute: 'Miss. Code Ann. § 93-15-103 to 93-15-119',
      grounds: [
        'Abandonment',
        'Chronic abuse/neglect',
        'Mental illness or deficiency',
        'Imprisonment',
        'Fault or refusal to adjust'
      ],
      standard: 'Clear and convincing evidence',
      bestInterest: 'Must also prove termination in child\'s best interest'
    },
    reasonableEfforts: {
      statute: 'Miss. Code Ann. § 43-15-13',
      requirement: 'Reasonable efforts to preserve and reunify family',
      exceptions: 'Aggravated circumstances as defined by statute'
    }
  },

  // Additional states can be added here
  // california: { ... },
  // texas: { ... },
  // florida: { ... }
};

// ============================================================================
// EXPERT HELPER FUNCTIONS
// ============================================================================

/**
 * Find relevant case law for a specific CPS violation
 */
export function findRelevantCaseLaw(violation: string): any[] {
  const relevant = [];
  const lowerViolation = violation.toLowerCase();

  // Search Supreme Court cases
  for (const [key, caseData] of Object.entries(SUPREME_COURT_CASES)) {
    if (caseData.useFor.some(use => lowerViolation.includes(use.toLowerCase()))) {
      relevant.push({ source: 'Supreme Court', ...caseData });
    }
  }

  // Search Circuit Court cases
  for (const [key, caseData] of Object.entries(CIRCUIT_COURT_CASES)) {
    if (caseData.useFor.some(use => lowerViolation.includes(use.toLowerCase()))) {
      relevant.push({ source: 'Circuit Court', ...caseData });
    }
  }

  return relevant;
}

/**
 * Get applicable legal standard for constitutional challenge
 */
export function getLegalStandard(rightType: string): any {
  if (rightType.toLowerCase().includes('parental')) {
    return LEGAL_TESTS.scrutinyLevels.strictScrutiny;
  }
  // Add more logic as needed
  return null;
}

/**
 * Get Section 1983 elements and guidance
 */
export function getSection1983Guidance(violationType: string): any {
  return {
    elements: SECTION_1983.elements,
    qualifiedImmunity: SECTION_1983.qualifiedImmunity,
    relevantCases: findRelevantCaseLaw(violationType)
  };
}

/**
 * Determine if ICWA applies
 */
export function checkICWAApplicability(childInfo: any): boolean {
  return childInfo.isNativeAmerican || 
         childInfo.tribeMember || 
         childInfo.eligibleForTribalMembership;
}

/**
 * Get ASFA timeline requirements
 */
export function getASFATimelines() {
  return {
    permanencyHearing: '12 months from foster care entry',
    caseReview: 'Every 6 months',
    tprFiling: '15 of most recent 22 months (with exceptions)',
    reasonableEfforts: 'Required pre-removal and ongoing'
  };
}

// ============================================================================
// EXPORT INTEGRATED BLACK'S LAW & COMPREHENSIVE CASE LAW
// ============================================================================

export {
  BLACKS_LAW_DEFINITIONS,
  getBlacksLawDefinition,
  generateDefinitionsSection
} from './blacks-law-definitions';

export {
  ROOKER_FELDMAN_CASES,
  ROOKER_FELDMAN_AVOIDANCE,
  SUPREME_COURT_CPS_CASES,
  CIRCUIT_COURT_CPS_CASES,
  MISSISSIPPI_SUPREME_COURT_CASES,
  getCasesByIssue,
  generateRookerFeldmanAvoidanceLanguage,
  analyzeRookerFeldmanRisk
} from './comprehensive-case-law-database';

/**
 * Get comprehensive legal analysis for a CPS issue
 */
export function getComprehensiveLegalAnalysis(issue: string): {
  blacksLawDefinitions: any[];
  supremeCourtCases: any[];
  circuitCases: any[];
  stateCases: any[];
  rookerFeldmanGuidance?: any;
} {
  const analysis: any = {
    blacksLawDefinitions: [],
    supremeCourtCases: [],
    circuitCases: [],
    stateCases: [],
  };

  // Get relevant Black's Law definitions
  const relevantTerms = extractLegalTerms(issue);
  analysis.blacksLawDefinitions = relevantTerms
    .map(term => getBlacksLawDefinition(term))
    .filter(def => def !== null);

  // Get relevant case law
  const issueKey = mapIssueToKey(issue);
  if (issueKey) {
    const cases = getCasesByIssue(issueKey);
    analysis.supremeCourtCases = cases.filter(c => c.circuit === undefined);
    analysis.circuitCases = cases.filter(c => c.circuit !== undefined);
  }

  // Add Mississippi-specific cases
  analysis.stateCases = MISSISSIPPI_SUPREME_COURT_CASES.filter(c =>
    c.holding.toLowerCase().includes(issue.toLowerCase())
  );

  // Add Rooker-Feldman guidance if relevant
  if (issue.toLowerCase().includes('1983') || issue.toLowerCase().includes('federal')) {
    analysis.rookerFeldmanGuidance = {
      cases: ROOKER_FELDMAN_CASES,
      avoidanceStrategies: ROOKER_FELDMAN_AVOIDANCE.framingStrategies,
      languageForPleadings: generateRookerFeldmanAvoidanceLanguage('complaint')
    };
  }

  return analysis;
}

/**
 * Extract legal terms from issue description
 */
function extractLegalTerms(issue: string): string[] {
  const allTerms = Object.keys(BLACKS_LAW_DEFINITIONS);
  const found: string[] = [];

  allTerms.forEach(term => {
    if (issue.toLowerCase().includes(term.toLowerCase())) {
      found.push(term);
    }
  });

  // Add related terms
  if (issue.includes('warrant') || issue.includes('search')) {
    found.push('Exigent Circumstances', 'Probable Cause', 'Fourth Amendment');
  }
  if (issue.includes('removal') || issue.includes('termination')) {
    found.push('Due Process', 'Clear and Convincing Evidence', 'Parens Patriae');
  }
  if (issue.includes('evidence')) {
    found.push('Hearsay', 'Burden of Proof', 'Prima Facie Case');
  }
  if (issue.includes('1983')) {
    found.push('Section 1983', 'Qualified Immunity', 'Color of Law', 'Rooker-Feldman Doctrine');
  }

  return [...new Set(found)];
}

/**
 * Map issue description to case law category
 */
function mapIssueToKey(issue: string): string | null {
  const lower = issue.toLowerCase();

  if (lower.includes('rooker') || lower.includes('feldman')) {
    return 'rooker-feldman';
  }
  if (lower.includes('warrant') || lower.includes('search') || lower.includes('fourth')) {
    return 'fourth-amendment';
  }
  if (lower.includes('parent') || lower.includes('fundamental')) {
    return 'parental-rights';
  }
  if (lower.includes('due process') || lower.includes('notice') || lower.includes('hearing')) {
    return 'due-process';
  }
  if (lower.includes('immunity') || lower.includes('1983')) {
    return 'qualified-immunity';
  }
  if (lower.includes('mississippi')) {
    return 'mississippi';
  }

  return null;
}

/**
 * Generate Section 1983 complaint with Rooker-Feldman avoidance
 */
export function generateSection1983Complaint(params: {
  plaintiff: string;
  defendants: string[];
  violations: string[];
  facts: string[];
  damages: string;
}): string {
  let complaint = `UNITED STATES DISTRICT COURT\n`;
  complaint += `[DISTRICT]\n\n`;
  complaint += `${params.plaintiff},\n`;
  complaint += `    Plaintiff,\n\n`;
  complaint += `v.\n\n`;
  params.defendants.forEach(def => {
    complaint += `${def},\n`;
  });
  complaint += `    Defendants.\n\n`;
  complaint += `COMPLAINT FOR DAMAGES UNDER 42 U.S.C. § 1983\n\n`;

  complaint += `**I. JURISDICTIONAL STATEMENT**\n\n`;
  complaint += generateRookerFeldmanAvoidanceLanguage('complaint') + '\n\n';
  complaint += `This Court has original jurisdiction under 28 U.S.C. § 1331 (federal question) and 42 U.S.C. § 1983.\n\n`;

  complaint += `**II. PARTIES**\n\n`;
  complaint += `[Party allegations]\n\n`;

  complaint += `**III. FACTUAL ALLEGATIONS**\n\n`;
  params.facts.forEach((fact, i) => {
    complaint += `${i + 1}. ${fact}\n\n`;
  });

  complaint += `**IV. CAUSES OF ACTION**\n\n`;
  params.violations.forEach((violation, i) => {
    complaint += `**COUNT ${i + 1}: VIOLATION OF ${violation}**\n\n`;
    
    // Get Black's Law definition
    const def = getBlacksLawDefinition(violation.replace(/\d+(?:st|nd|rd|th)\s+Amendment/, '').trim());
    if (def) {
      complaint += `*Definition*: ${def.definition}\n\n`;
    }

    // Get relevant cases
    const cases = getCasesByIssue(mapIssueToKey(violation) || '');
    if (cases.length > 0) {
      complaint += `*Legal Authority*:\n`;
      cases.slice(0, 3).forEach(c => {
        complaint += `- ${c.case || c.citation}\n`;
      });
      complaint += '\n';
    }

    complaint += `[Specific allegations for this count]\n\n`;
  });

  complaint += `**V. PRAYER FOR RELIEF**\n\n`;
  complaint += `WHEREFORE, Plaintiff requests:\n`;
  complaint += `1. Compensatory damages in the amount of ${params.damages};\n`;
  complaint += `2. Punitive damages;\n`;
  complaint += `3. Injunctive relief prohibiting future violations;\n`;
  complaint += `4. Attorney's fees and costs under 42 U.S.C. § 1988;\n`;
  complaint += `5. Such other relief as the Court deems just and proper.\n\n`;

  return complaint;
}