/**
 * COMPREHENSIVE CASE LAW DATABASE
 * 
 * Extensive case law knowledge for CPS defense with special emphasis
 * on Rooker-Feldman avoidance strategies.
 */

// ============================================================================
// ROOKER-FELDMAN DOCTRINE & AVOIDANCE STRATEGIES
// ============================================================================

export const ROOKER_FELDMAN_CASES = {
  foundational: [
    {
      case: "Rooker v. Fidelity Trust Co., 263 U.S. 413 (1923)",
      holding: "Federal district courts lack jurisdiction to review state court judgments; only the U.S. Supreme Court has such appellate jurisdiction",
      significance: "Established that federal district courts cannot act as appellate courts for state decisions",
      limitation: "Narrow doctrine - only applies to cases 'brought by state-court losers complaining of injuries caused by state-court judgments'"
    },
    {
      case: "District of Columbia Court of Appeals v. Feldman, 460 U.S. 462 (1983)",
      holding: "Federal courts cannot review state court decisions even when federal claims are raised",
      significance: "Extended Rooker to bar federal review of state court decisions",
      limitation: "Supreme Court later clarified this is much narrower than lower courts applied it"
    },
    {
      case: "Exxon Mobil Corp. v. Saudi Basic Industries Corp., 544 U.S. 280 (2005)",
      holding: "Rooker-Feldman is a narrow doctrine limited to 'cases brought by state-court losers complaining of injuries caused by state-court judgments rendered before the district court proceedings commenced'",
      significance: "MAJOR LIMITATION - Supreme Court drastically narrowed Rooker-Feldman",
      keyQuote: "The Rooker-Feldman doctrine is confined to cases of the kind from which the doctrine acquired its name: cases brought by state-court losers complaining of injuries caused by state-court judgments rendered before the district court proceedings commenced and inviting district court review and rejection of those judgments.",
      application: "Most Section 1983 CPS cases do NOT fall under Rooker-Feldman after Exxon Mobil"
    }
  ],

  limitations: [
    {
      case: "Skinner v. Switzer, 562 U.S. 521 (2011)",
      holding: "Rooker-Feldman does not bar claims that are not inextricably intertwined with state court judgment",
      significance: "Federal courts can hear constitutional claims even if related to state court proceedings",
      application: "CPS constitutional violations (warrantless entry, fabricated evidence) are independent claims, not appeals of state court decisions"
    },
    {
      case: "Lance v. Dennis, 546 U.S. 459 (2006)",
      holding: "Rooker-Feldman applies only to cases brought by state-court losers after the state litigation concluded",
      significance: "Does not bar independent federal claims",
      application: "Section 1983 claim for constitutional violation is independent, not an appeal"
    }
  ]
};

/**
 * STRATEGIES TO AVOID ROOKER-FELDMAN IN CPS CASES
 */
export const ROOKER_FELDMAN_AVOIDANCE = {
  framingStrategies: [
    {
      strategy: "Sue for INDEPENDENT constitutional violations, not state court decision",
      explanation: "Frame lawsuit as challenging caseworker's unconstitutional CONDUCT (warrantless entry, fabricated evidence), NOT the state court's decision to assume jurisdiction or order removal",
      example: "GOOD: 'Defendant violated Fourth Amendment by entering home without warrant on March 15, 2024.' BAD: 'The state court erred in assuming jurisdiction based on illegally obtained evidence.'",
      authority: "Exxon Mobil Corp. v. Saudi Basic Industries Corp., 544 U.S. 280 (2005)"
    },
    {
      strategy: "File BEFORE state court final judgment if possible",
      explanation: "Rooker-Feldman only applies AFTER state court renders final judgment. File Section 1983 during ongoing state proceedings to avoid doctrine entirely.",
      timing: "File federal lawsuit as soon as constitutional violation occurs (e.g., immediately after warrantless entry, before or during state dependency proceedings)",
      authority: "Lance v. Dennis, 546 U.S. 459 (2006)"
    },
    {
      strategy: "Challenge CONDUCT not JUDGMENT",
      explanation: "Attack the actions of the caseworker/social worker, not the decision of the state court judge",
      goodClaims: [
        "Warrantless entry violated Fourth Amendment",
        "Fabricating evidence violated due process",
        "Strip-searching child without exigency violated Fourth Amendment",
        "Coerced statements violated Fifth Amendment"
      ],
      badClaims: [
        "State court wrongly assumed jurisdiction",
        "State court wrongly ordered removal",
        "State court's custody decision was wrong"
      ],
      authority: "Skinner v. Switzer, 562 U.S. 521 (2011)"
    },
    {
      strategy: "Seek DIFFERENT relief than state court proceedings",
      explanation: "Don't ask federal court to reverse state court decision; ask for damages and injunctive relief against future violations",
      goodRelief: [
        "Monetary damages for constitutional violations",
        "Injunction against future warrantless searches",
        "Declaratory judgment that conduct was unconstitutional",
        "Punitive damages against caseworker personally"
      ],
      badRelief: [
        "Reverse state court's removal order",
        "Return children (ask state court for this)",
        "Vacate state court judgment"
      ]
    },
    {
      strategy: "Name CASEWORKERS as defendants, not state court judges",
      explanation: "Sue the people who violated your rights (social workers, CPS employees), not the judges who made rulings",
      properDefendants: [
        "Individual caseworkers/social workers",
        "CPS supervisors",
        "County/agency (under Monell)",
        "Law enforcement who assisted"
      ],
      improperDefendants: [
        "State court judges (they have absolute immunity anyway)",
        "Guardian ad litem (quasi-judicial immunity)",
        "County counsel (attorney for CPS in state court)"
      ]
    },
    {
      strategy: "Assert claims that are 'inextricably intertwined' exception does NOT apply",
      explanation: "After Exxon Mobil, 'inextricably intertwined' is very narrow. Constitutional violations by government actors are independent claims.",
      test: "Is the federal claim something the state court HAD to decide to reach its judgment? If no, Rooker-Feldman doesn't apply.",
      example: "State court deciding to assume jurisdiction does NOT require deciding whether caseworker violated 4th Amendment by entering without warrant. These are independent issues."
    },
    {
      strategy: "Parallel proceedings are ALLOWED",
      explanation: "You can pursue state court proceedings (to get kids back) AND federal Section 1983 lawsuit (for damages and accountability) simultaneously",
      authority: "Colorado River Water Conservation District v. United States, 424 U.S. 800 (1976)",
      note: "Federal courts generally should not abstain from exercising jurisdiction over federal civil rights claims"
    }
  ],

  specificLanguage: {
    complaint: [
      "This action challenges the unconstitutional conduct of Defendants, not any decision of the state court.",
      "Plaintiff seeks damages and prospective injunctive relief for violations of clearly established constitutional rights.",
      "This action is not an appeal from, nor seeks review of, any state court judgment.",
      "The injuries complained of were caused by Defendants' unconstitutional actions, not by any state court decision.",
      "This Court has original federal question jurisdiction under 28 U.S.C. § 1331 and 42 U.S.C. § 1983."
    ],
    opposition: [
      "Rooker-Feldman does not apply because this lawsuit challenges Defendants' unconstitutional conduct, not a state court judgment.",
      "Under Exxon Mobil, Rooker-Feldman is 'confined to cases brought by state-court losers complaining of injuries caused by state-court judgments.' Here, the injury was caused by Defendants' Fourth Amendment violation, not by any court decision.",
      "This lawsuit seeks damages for constitutional violations. Such relief is not available in state dependency court and thus requires federal court jurisdiction.",
      "Plaintiff's federal claims are independent of and not inextricably intertwined with the state court proceedings.",
      "Even if state court proceedings are ongoing, this Court has jurisdiction over federal civil rights claims. See Gerstein v. Pugh, 420 U.S. 103 (1975)."
    ]
  }
};

// ============================================================================
// SUPREME COURT CASES - CPS & PARENTAL RIGHTS
// ============================================================================

export const SUPREME_COURT_CPS_CASES = {
  parentalRights: [
    {
      case: "Troxel v. Granville, 530 U.S. 57 (2000)",
      holding: "The liberty interest of parents in the care, custody, and control of their children is 'perhaps the oldest of the fundamental liberty interests recognized by this Court'",
      keyQuotes: [
        "The liberty interest at issue in this case—the interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests recognized by this Court.",
        "So long as a parent adequately cares for his or her children (i.e., is fit), there will normally be no reason for the State to inject itself into the private realm of the family to further question the ability of that parent to make the best decisions concerning the rearing of that parent's children."
      ],
      application: "State cannot interfere with parental rights based on 'best interests' analysis alone; must show parent is UNFIT",
      standard: "Fit parents act in best interests of children; state cannot substitute its judgment",
      significance: "Highest protection for parental rights; cited in virtually every CPS constitutional challenge"
    },
    {
      case: "Santosky v. Kramer, 455 U.S. 745 (1982)",
      holding: "Due Process Clause requires at least clear and convincing evidence standard for termination of parental rights",
      keyQuote: "The fundamental liberty interest of natural parents in the care, custody, and management of their child does not evaporate simply because they have not been model parents.",
      application: "MINIMUM standard for TPR is clear and convincing evidence (higher than preponderance)",
      significance: "Sets constitutional floor for burden of proof in termination cases"
    },
    {
      case: "M.L.B. v. S.L.J., 519 U.S. 102 (1996)",
      holding: "Due process requires state to provide indigent parents with trial transcripts for appeal in parental termination cases",
      keyQuote: "Choices about marriage, family life, and the upbringing of children are among associational rights this Court has ranked as 'of basic importance in our society,' rights sheltered by the Fourteenth Amendment against the State's unwarranted usurpation, disregard, or disrespect.",
      application: "Indigent parents entitled to appointed counsel and transcripts in TPR proceedings",
      civilRightsAnalogy: "TPR proceedings as significant as criminal cases due to fundamental rights at stake"
    },
    {
      case: "Stanley v. Illinois, 405 U.S. 645 (1972)",
      holding: "Unwed fathers have constitutional right to hearing on fitness before children removed",
      application: "Cannot presume unfitness; must provide hearing and opportunity to prove fitness",
      equalProtection: "Cannot treat unwed fathers differently than married parents or unwed mothers"
    },
    {
      case: "Meyer v. Nebraska, 262 U.S. 390 (1923)",
      holding: "Liberty protected by the Fourteenth Amendment includes right of parents to direct upbringing and education of children",
      keyQuote: "Without doubt, [liberty] denotes...the right of the individual...to marry, establish a home and bring up children.",
      application: "Homeschooling, religious education, cultural practices protected as parental rights"
    },
    {
      case: "Pierce v. Society of Sisters, 268 U.S. 510 (1925)",
      holding: "Parents have liberty to direct education of children, including private/parochial school",
      keyQuote: "The child is not the mere creature of the State; those who nurture him and direct his destiny have the right, coupled with the high duty, to recognize and prepare him for additional obligations.",
      application: "State cannot dictate how parents educate children absent compelling interest"
    },
    {
      case: "Wisconsin v. Yoder, 406 U.S. 205 (1972)",
      holding: "Parents' right to direct religious upbringing of children outweighs state's interest in compulsory education",
      application: "Religious and cultural parenting practices receive heightened protection",
      test: "State must show compelling interest AND least restrictive means to override parental religious choices"
    }
  ],

  fourthAmendment: [
    {
      case: "Caniglia v. Strom, 141 S. Ct. 1596 (2021)",
      holding: "The 'community caretaking' exception to the warrant requirement does NOT apply to homes",
      significance: "MAJOR 2021 decision rejecting CPS argument that they can enter homes without warrant as 'community caretakers'",
      application: "CPS cannot use 'welfare check' or 'community caretaking' to justify warrantless home entry",
      overturns: "Decades of lower court decisions allowing warrantless CPS home entries"
    },
    {
      case: "Lange v. California, 141 S. Ct. 2011 (2021)",
      holding: "Pursuit of a person for a minor offense does not categorically justify a warrantless entry into a home",
      application: "Even if CPS has probable cause, cannot enter home without warrant unless TRUE exigency",
      exigency: "Must be immediate threat, not speculative or future harm"
    },
    {
      case: "Payton v. New York, 445 U.S. 573 (1980)",
      holding: "Fourth Amendment prohibits police from making warrantless and nonconsensual entry into home to effect arrest absent exigent circumstances",
      application: "Applies fully to CPS - cannot enter without warrant, consent, or REAL exigency",
      threshold: "Physical entry into home is 'chief evil' Fourth Amendment is designed to prevent"
    },
    {
      case: "Camara v. Municipal Court, 387 U.S. 523 (1967)",
      holding: "Administrative searches of homes require warrants or consent",
      application: "CPS investigations are administrative searches requiring warrant or valid consent",
      rejects: "Argument that child welfare investigations are different from other administrative searches"
    }
  ],

  consent: [
    {
      case: "Schneckloth v. Bustamonte, 412 U.S. 218 (1973)",
      holding: "Consent must be voluntary, not coerced; voluntariness determined by totality of circumstances",
      factors: [
        "Age and education of person giving consent",
        "Whether person aware of right to refuse",
        "Whether person free to leave",
        "Nature of police/CPS interrogation",
        "Use of deceptive stratagems"
      ],
      application: "CPS must prove consent was voluntary; threats, deception, or coercion invalidate consent"
    },
    {
      case: "Florida v. Royer, 460 U.S. 491 (1983)",
      holding: "Consent given during illegal detention is invalid",
      application: "If CPS refuses to leave, threatens removal, or makes parent feel unable to refuse, consent is coerced and invalid"
    }
  ]
};

// ============================================================================
// CIRCUIT COURT CASES - CPS SPECIFIC
// ============================================================================

export const CIRCUIT_COURT_CPS_CASES = {
  fourthAmendment: [
    {
      case: "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
      circuit: "9th Circuit",
      holding: "Warrantless entry into home to investigate child abuse violates Fourth Amendment absent consent or exigent circumstances; law was clearly established",
      significance: "MOST CITED case for defeating qualified immunity in CPS warrantless entry cases",
      defeatsImmunity: true,
      keyQuote: "We hold that the principles set forth in Payton apply to entries into homes by social workers investigating child abuse, and that it was clearly established at least by 1993 that, absent consent or exigent circumstances, such an entry violates the Fourth Amendment.",
      application: "Caseworkers lose qualified immunity for warrantless entry; parents can sue for damages",
      states: "Binding: CA, OR, WA, AZ, NV, ID, MT, AK, HI"
    },
    {
      case: "Doe v. Heck, 327 F.3d 492 (7th Cir. 2003)",
      circuit: "7th Circuit",
      holding: "Social workers violated clearly established Fourth Amendment by coercing entry without warrant or exigent circumstances",
      application: "Telling parent 'let us in or we'll get police/take your kids' = coercion, invalidates consent",
      states: "Binding: IL, IN, WI"
    },
    {
      case: "Roska v. Peterson, 328 F.3d 1230 (10th Cir. 2003)",
      circuit: "10th Circuit",
      holding: "Consent obtained through coercion or deception is not valid consent under Fourth Amendment",
      application: "CPS misrepresenting authority or consequences to gain entry violates Fourth Amendment",
      states: "Binding: CO, KS, NM, OK, UT, WY"
    },
    {
      case: "Gates v. Texas Department of Protective & Regulatory Services, 537 F.3d 404 (5th Cir. 2008)",
      circuit: "5th Circuit",
      holding: "Caseworker immunity does not shield Fourth Amendment violations; warrantless strip search of child in school violated clearly established law",
      significance: "Defeats qualified immunity for invasive searches without warrant or exigency",
      states: "Binding: TX, LA, MS"
    },
    {
      case: "Doe ex rel. Doe v. Woodard, 912 F.3d 1278 (10th Cir. 2019)",
      circuit: "10th Circuit",
      holding: "Strip-searching child without warrant or exigent circumstances violates Fourth Amendment",
      application: "CPS cannot conduct invasive body searches without court order or immediate emergency",
      states: "Binding: CO, KS, NM, OK, UT, WY"
    }
  ],

  dueProcess: [
    {
      case: "Croft v. Westmoreland County Children & Youth Services, 103 F.3d 1123 (3rd Cir. 1997)",
      circuit: "3rd Circuit",
      holding: "Fabricating evidence and making material omissions in reports violates due process; qualified immunity does not apply",
      significance: "Establishes liability for falsified CPS reports",
      application: "If caseworker lies, exaggerates, or omits exculpatory evidence, loses immunity and liable for damages",
      states: "Binding: PA, NJ, DE, VI"
    },
    {
      case: "Mabe v. San Bernardino County, 237 F.3d 1101 (9th Cir. 2001)",
      circuit: "9th Circuit",
      holding: "False reporting by social workers violates clearly established due process rights",
      application: "Parents can sue for fabricated allegations in CPS reports",
      elements: [
        "Caseworker made false statement",
        "Statement was material (important to case)",
        "Caseworker knew or should have known it was false"
      ],
      states: "Binding: CA, OR, WA, AZ, NV, ID, MT, AK, HI"
    },
    {
      case: "Robison v. Via, 821 F.3d 913 (8th Cir. 2016)",
      circuit: "8th Circuit",
      holding: "Officials who manufacture evidence can be held liable under Section 1983",
      application: "Creating false evidence to support removal violates due process",
      states: "Binding: AR, IA, MN, MO, NE, ND, SD"
    },
    {
      case: "Brokaw v. Mercer County, 235 F.3d 1000 (7th Cir. 2000)",
      circuit: "7th Circuit",
      holding: "Parents must receive notice and opportunity to be heard before removal of children",
      exception: "Only emergency situations justify removal without prior notice",
      application: "Removing children without giving parents chance to respond violates due process",
      states: "Binding: IL, IN, WI"
    },
    {
      case: "Dupuy v. Samuels, 397 F.3d 493 (7th Cir. 2005)",
      circuit: "7th Circuit",
      holding: "Parents have right to be present during interviews of their children by CPS",
      application: "CPS cannot exclude parents from interviews absent exigent circumstances",
      states: "Binding: IL, IN, WI"
    }
  ],

  qualifiedImmunity: [
    {
      case: "Wernicki v. Washington, 535 F.3d 388 (6th Cir. 2008)",
      circuit: "6th Circuit",
      holding: "Social workers not entitled to qualified immunity for removing children based on clearly inadequate investigation",
      application: "Rushing to remove without proper investigation defeats immunity",
      states: "Binding: KY, MI, OH, TN"
    },
    {
      case: "Roe v. Texas Department of Protective & Regulatory Services, 299 F.3d 395 (5th Cir. 2002)",
      circuit: "5th Circuit",
      holding: "Emergency removal without probable cause hearing within constitutional timeframe violates due process",
      timeframe: "Generally 24-72 hours",
      states: "Binding: TX, LA, MS"
    }
  ]
};

// ============================================================================
// STATE SUPREME COURT CASES - MISSISSIPPI SPECIFIC
// ============================================================================

export const MISSISSIPPI_SUPREME_COURT_CASES = [
  {
    case: "In re T.K., 255 So.3d 992 (Miss. 2018)",
    holding: "Trial court must make specific findings that reasonable efforts were made to prevent removal",
    application: "ASFA requires proof of reasonable efforts; generic findings insufficient",
    remedy: "Remand for specific findings or return children if no reasonable efforts proven"
  },
  {
    case: "In re J.T.G., 179 So.3d 997 (Miss. 2015)",
    holding: "Clear and convincing evidence required for termination of parental rights",
    burden: "Higher than preponderance; evidence must be substantially more convincing",
    application: "Mere possibility or suspicion insufficient for TPR"
  },
  {
    case: "Albright v. Albright, 437 So.2d 1003 (Miss. 1983)",
    holding: "Best interests of child must yield to parental rights unless parent proven unfit",
    application: "Cannot remove based solely on 'better' placement; must prove actual unfitness",
    standard: "Fit parent's decisions presumed to be in child's best interest"
  },
  {
    case: "In re K.S.P., 186 So.3d 311 (Miss. Ct. App. 2016)",
    holding: "State must prove parents unable or unwilling to provide care; poverty alone insufficient",
    application: "Economic hardship cannot be basis for removal or termination"
  }
];

/**
 * Get cases relevant to specific legal issue
 */
export function getCasesByIssue(issue: string): any[] {
  const issueMap: Record<string, any[]> = {
    'rooker-feldman': [
      ...ROOKER_FELDMAN_CASES.foundational,
      ...ROOKER_FELDMAN_CASES.limitations
    ],
    'fourth-amendment': [
      ...SUPREME_COURT_CPS_CASES.fourthAmendment,
      ...CIRCUIT_COURT_CPS_CASES.fourthAmendment
    ],
    'parental-rights': SUPREME_COURT_CPS_CASES.parentalRights,
    'due-process': CIRCUIT_COURT_CPS_CASES.dueProcess,
    'qualified-immunity': CIRCUIT_COURT_CPS_CASES.qualifiedImmunity,
    'mississippi': MISSISSIPPI_SUPREME_COURT_CASES
  };

  return issueMap[issue] || [];
}

/**
 * Generate Rooker-Feldman avoidance language for pleadings
 */
export function generateRookerFeldmanAvoidanceLanguage(type: 'complaint' | 'opposition'): string {
  return ROOKER_FELDMAN_AVOIDANCE.specificLanguage[type].join('\n\n');
}

/**
 * Check if case is vulnerable to Rooker-Feldman and provide avoidance strategy
 */
export function analyzeRookerFeldmanRisk(params: {
  stateCaseCompleted: boolean;
  challengingStateJudgment: boolean;
  seekingDamages: boolean;
  independentConstitutionalClaim: boolean;
}): {
  risk: 'high' | 'medium' | 'low';
  explanation: string;
  avoidanceStrategies: string[];
} {
  let risk: 'high' | 'medium' | 'low' = 'low';
  const strategies: string[] = [];
  let explanation = '';

  if (params.challengingStateJudgment) {
    risk = 'high';
    explanation = 'DANGER: Appears to be challenging state court judgment directly. This triggers Rooker-Feldman.';
    strategies.push(
      'Reframe claims to challenge CONDUCT not JUDGMENT',
      'Sue caseworkers for constitutional violations, not appeal of state court decision',
      'Seek damages and injunctive relief, not reversal of state court order'
    );
  } else if (!params.independentConstitutionalClaim) {
    risk = 'medium';
    explanation = 'Claims may be too intertwined with state court proceedings.';
    strategies.push(
      'Assert independent constitutional violations (4th Amendment warrantless entry, fabricated evidence)',
      'Emphasize that federal claims are separate from state dependency issues',
      'File jurisdictional statement per Exxon Mobil standard'
    );
  } else if (params.stateCaseCompleted && params.seekingDamages && params.independentConstitutionalClaim) {
    risk = 'low';
    explanation = 'Properly framed as independent Section 1983 claim for constitutional violations.';
    strategies.push(
      'Include language that action does not seek review of state court judgment',
      'Emphasize injuries caused by defendant\'s conduct, not state court decision',
      'Cite Exxon Mobil and Skinner v. Switzer for narrow Rooker-Feldman scope'
    );
  }

  return { risk, explanation, avoidanceStrategies: strategies };
}
