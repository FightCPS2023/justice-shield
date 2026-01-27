/**
 * BLACK'S LAW DICTIONARY DEFINITIONS
 * 
 * Authoritative legal definitions for CPS and family law terminology.
 * Based on Black's Law Dictionary (11th Edition, 2019) and earlier editions.
 */

export const BLACKS_LAW_DEFINITIONS = {
  // CONSTITUTIONAL & CIVIL RIGHTS
  
  "Due Process": {
    definition: "The conduct of legal proceedings according to established rules and principles for the protection and enforcement of private rights, including notice and the right to a fair hearing before a tribunal with the power to decide the case.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "In CPS cases, due process requires notice of allegations, opportunity to be heard, right to counsel, and evidentiary hearing before deprivation of parental rights.",
    relatedTerms: ["Procedural Due Process", "Substantive Due Process", "Fundamental Rights"]
  },

  "Procedural Due Process": {
    definition: "The minimal requirements of notice and a hearing guaranteed by the Due Process Clauses of the 5th and 14th Amendments, esp. if the deprivation of a significant life, liberty, or property interest may occur.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "CPS must provide advance notice of hearings, allegations in writing, opportunity to present evidence and cross-examine witnesses, and right to appeal.",
    keyRequirements: [
      "Notice - reasonable time, manner, and content",
      "Opportunity to be heard - meaningful chance to respond",
      "Neutral decision-maker - impartial judge",
      "Right to present evidence and witnesses",
      "Right to confront adverse witnesses",
      "Written decision with findings of fact"
    ]
  },

  "Substantive Due Process": {
    definition: "The doctrine that the Due Process Clauses of the 5th and 14th Amendments require legislation to be fair and reasonable in content and to further a legitimate governmental objective.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Protects fundamental right to parent children; government must have compelling interest and use least restrictive means to interfere with parent-child relationship.",
    standardOfReview: "Strict Scrutiny for fundamental rights"
  },

  "Fundamental Right": {
    definition: "A right derived from natural or fundamental law; esp., one protected by the Due Process Clause of the U.S. Constitution, such as the right to privacy or to vote.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Parental rights are fundamental liberty interests. Government interference requires strict scrutiny: compelling state interest + narrowly tailored means.",
    caseAuthority: "Troxel v. Granville, 530 U.S. 57 (2000); Meyer v. Nebraska, 262 U.S. 390 (1923)"
  },

  "Strict Scrutiny": {
    definition: "The standard applied to suspect classifications (such as race) in equal-protection analysis and to fundamental rights (such as voting rights) in due-process analysis. Under strict scrutiny, the state must establish that it has a compelling interest that justifies and necessitates the law in question.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "When CPS interferes with fundamental parental rights, state must prove: (1) compelling interest, (2) narrowly tailored means, (3) least restrictive alternative.",
    burden: "On the government, NOT the parent"
  },

  "Qualified Immunity": {
    definition: "Immunity from civil liability for a public official who is performing a discretionary function, as long as the conduct does not violate clearly established constitutional or statutory rights.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "CPS caseworkers can lose qualified immunity if they violate clearly established law (e.g., warrantless home entry under Calabretta v. Floyd).",
    twoPartTest: [
      "1. Was a constitutional right violated?",
      "2. Was the right clearly established at the time?"
    ]
  },

  // FAMILY LAW TERMS

  "Parens Patriae": {
    definition: "The state in its capacity as provider of protection to those unable to care for themselves. The doctrine that the government has standing to prosecute a lawsuit on behalf of a citizen, esp. on behalf of someone who is under a legal disability to prosecute the suit.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Legal basis for state to intervene in family to protect children. BUT this power is LIMITED by parental rights and must meet constitutional standards.",
    limits: "Cannot override fundamental parental rights without compelling justification and due process"
  },

  "Best Interests of the Child": {
    definition: "A standard by which a court determines what arrangements would be to a child's greatest benefit, used esp. in child-custody and visitation decisions.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "In CPS cases, courts balance child welfare against fundamental parental rights. 'Best interests' cannot trump constitutional rights without meeting strict scrutiny.",
    warning: "Often misused to justify removal without meeting legal standards for harm"
  },

  "Neglect": {
    definition: "The failure to exercise the degree of care that a reasonable person under similar circumstances would exercise; conduct that falls below a legal standard for protecting others from unreasonable risk of harm.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Must be MORE than poverty or different parenting choices. Requires showing actual or imminent harm to child.",
    confusion: "Poverty is often confused with neglect; this conflation violates constitutional rights"
  },

  "Abuse": {
    definition: "Physical or mental maltreatment; mistreatment.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    legalStandard: "Requires evidence of actual injury or serious risk of injury. Subjective opinions insufficient.",
    proofRequired: "Physical evidence, medical documentation, or credible eyewitness testimony"
  },

  "Imminent Danger": {
    definition: "An immediate and present danger, not merely a fear of future harm.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Emergency removal requires IMMINENT danger - immediate risk of serious harm. Future or speculative risk insufficient.",
    test: "Would removal of child from home prevent serious harm within the next 24-48 hours?"
  },

  // EVIDENCE & PROCEDURE

  "Hearsay": {
    definition: "An out-of-court statement offered in evidence to prove the truth of the matter asserted.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    rule: "Generally inadmissible unless exception applies",
    application: "CPS reports often based entirely on hearsay (what others told caseworker). Must be challenged under Confrontation Clause.",
    exceptions: [
      "Business records (if properly authenticated)",
      "Excited utterance (spontaneous statement)",
      "Present sense impression (describing event as it happens)",
      "Statements for medical diagnosis/treatment"
    ]
  },

  "Confrontation Clause": {
    definition: "The Sixth Amendment provision generally guaranteeing a criminal defendant's right to confront and cross-examine witnesses against the defendant.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Also applies in CPS proceedings where liberty interests at stake. Parents have right to cross-examine accusers and witnesses.",
    authority: "Crawford v. Washington, 541 U.S. 36 (2004)"
  },

  "Burden of Proof": {
    definition: "A party's duty to prove a disputed assertion or charge. The burden includes both the burden of production (providing enough evidence on an issue for the trier of fact to decide it) and the burden of persuasion (convincing the trier of fact that the alleged fact is true).",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    cpsStandards: {
      jurisdiction: "Preponderance of evidence (more likely than not)",
      removal: "Clear and convincing evidence in many states",
      termination: "Clear and convincing evidence (REQUIRED by Santosky v. Kramer)"
    },
    critical: "Burden is ALWAYS on CPS/state, NEVER on parent to prove innocence"
  },

  "Clear and Convincing Evidence": {
    definition: "Evidence indicating that the thing to be proved is highly probable or reasonably certain. This is a greater burden than preponderance of the evidence but less than evidence beyond a reasonable doubt.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Required for termination of parental rights (Santosky v. Kramer). Some states require it for removal as well.",
    standard: "Substantially more than 'more likely than not'; must be 'highly probable'"
  },

  "Preponderance of the Evidence": {
    definition: "The greater weight of the evidence; evidence that is more convincing than the evidence offered against it.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Standard for initial jurisdiction in most CPS cases. Often described as '51% likelihood' but even this low standard is often not met.",
    inadequate: "Speculation, suspicion, or possibility is insufficient even for preponderance standard"
  },

  // CONSTITUTIONAL CONCEPTS

  "Exigent Circumstances": {
    definition: "A situation that demands unusual or immediate action and that may allow people to circumvent usual procedures; esp., a situation in which a police officer may search or seize property without a warrant because there is no time to obtain one.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "One of few exceptions to warrant requirement. For CPS, must show IMMEDIATE risk of serious harm - not future or speculative danger.",
    test: "Would waiting for warrant result in imminent serious injury or death to child?",
    notExigent: [
      "Anonymous tip with no corroboration",
      "Messy house or poverty",
      "Parent refusing to cooperate",
      "CPS wanting to interview child"
    ]
  },

  "Probable Cause": {
    definition: "A reasonable ground to suspect that a person has committed or is committing a crime or that a place contains specific items connected with a crime. Probable cause must exist for a law enforcement officer to make an arrest without a warrant, search without a warrant, or seize property in the reasonable belief that items are connected with a crime.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Required for emergency removal without court order. Must be based on specific articulable facts, not suspicion or hunches.",
    inadequate: "Anonymous tips, vague allegations, different parenting styles"
  },

  "Clearly Established Law": {
    definition: "In the context of qualified immunity, a constitutional or statutory right that has been sufficiently developed through case law that a reasonable official would know that their conduct violates that right.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "If caseworker violates clearly established law (e.g., warrantless entry after Calabretta), qualified immunity does not apply.",
    examples: [
      "Warrantless home entry without consent/exigent circumstances (4th Amendment)",
      "Removal without notice or hearing (14th Amendment Due Process)",
      "Fabricating evidence (Due Process)"
    ]
  },

  "Color of Law": {
    definition: "The appearance or semblance of legal right; authority under color of law means authority exercised pursuant to a law that is improper or improperly used.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "CPS caseworkers act under color of state law. This makes them liable under 42 U.S.C. § 1983 for constitutional violations.",
    significance: "Private citizens cannot violate constitutional rights; government actors can and are liable"
  },

  // REMEDIES & LITIGATION

  "Section 1983": {
    definition: "The common name for 42 U.S.C. § 1983, which provides a cause of action against any person who, under color of state law, deprives another of any rights, privileges, or immunities secured by the U.S. Constitution and laws.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    elements: [
      "1. Defendant acted under color of state law",
      "2. Defendant deprived plaintiff of federal constitutional or statutory right"
    ],
    remedies: "Damages (compensatory and punitive), injunctive relief, attorney's fees"
  },

  "Rooker-Feldman Doctrine": {
    definition: "The principle that a federal district court may not exercise appellate jurisdiction over a final state-court judgment. Only the U.S. Supreme Court may exercise such jurisdiction.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    danger: "Can be used to dismiss Section 1983 claims if they appear to challenge state court decisions",
    avoidance: "Frame claims as independent constitutional violations, not appeals of state court orders"
  },

  // STANDARDS & BURDENS

  "Reasonable Efforts": {
    definition: "In child-welfare law, diligent attempts by a child-welfare agency to provide services that will help a child's family resolve problems that led to the child being placed in foster care.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    legalRequirement: "ASFA (Adoption and Safe Families Act) requires states to make reasonable efforts before and after removal",
    burden: "On the state to prove reasonable efforts were made, NOT on parent to request them"
  },

  "Least Restrictive Alternative": {
    definition: "A doctrine that, when a governmental agency restricts a person's liberty, the agency must use the least restrictive means possible to achieve its purpose.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "Before removing child, CPS must try less intrusive means (safety plan, in-home services, placement with relatives).",
    constitutionalBasis: "Required by strict scrutiny when fundamental rights at stake"
  },

  "Prima Facie Case": {
    definition: "A party's production of enough evidence to allow the fact-trier to infer the fact at issue and rule in the party's favor.",
    citation: "Black's Law Dictionary (11th ed. 2019)",
    application: "CPS must present prima facie case before burden shifts. Many CPS cases lack even prima facie evidence.",
    insufficient: "Hearsay, speculation, or conclusory allegations without factual basis"
  }
};

/**
 * Get Black's Law definition for a term
 */
export function getBlacksLawDefinition(term: string): any {
  return BLACKS_LAW_DEFINITIONS[term] || null;
}

/**
 * Get all definitions related to a category
 */
export function getDefinitionsByCategory(category: 'constitutional' | 'family' | 'evidence' | 'remedies'): any[] {
  const categories = {
    constitutional: [
      'Due Process', 'Procedural Due Process', 'Substantive Due Process',
      'Fundamental Right', 'Strict Scrutiny', 'Qualified Immunity',
      'Exigent Circumstances', 'Probable Cause', 'Clearly Established Law',
      'Color of Law'
    ],
    family: [
      'Parens Patriae', 'Best Interests of the Child', 'Neglect', 'Abuse',
      'Imminent Danger', 'Reasonable Efforts', 'Least Restrictive Alternative'
    ],
    evidence: [
      'Hearsay', 'Confrontation Clause', 'Burden of Proof',
      'Clear and Convincing Evidence', 'Preponderance of the Evidence',
      'Prima Facie Case'
    ],
    remedies: [
      'Section 1983', 'Rooker-Feldman Doctrine'
    ]
  };

  return categories[category].map(term => ({
    term,
    ...BLACKS_LAW_DEFINITIONS[term]
  }));
}

/**
 * Generate legal definition section for documents
 */
export function generateDefinitionsSection(terms: string[]): string {
  let section = "**LEGAL DEFINITIONS (Black's Law Dictionary)**\n\n";
  
  terms.forEach(term => {
    const def = BLACKS_LAW_DEFINITIONS[term];
    if (def) {
      section += `**${term}**: ${def.definition}\n`;
      section += `*${def.citation}*\n\n`;
      
      if (def.application) {
        section += `Application: ${def.application}\n\n`;
      }
    }
  });
  
  return section;
}
