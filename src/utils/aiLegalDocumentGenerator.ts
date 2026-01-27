// ═══════════════════════════════════════════════════════════════════
// AI LEGAL DOCUMENT GENERATOR
// Stellar, court-ready legal documents with precision formatting
// ═══════════════════════════════════════════════════════════════════

import { 
  formatCaptionByState, 
  formatSignatureBlock, 
  formatCertificateOfService,
  formatVerification,
  getCourtStandards,
  requiresNotarization,
  requiresVerification,
  getFilingInstructions
} from './courtFormattingStandards';

// ═══════════════════════════════════════════════════════════════════
// AI LEGAL KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════

export const LEGAL_STANDARDS = {
  // Burden of Proof Standards
  burdenOfProof: {
    removal: {
      standard: 'Clear and Convincing Evidence',
      citation: 'Santosky v. Kramer, 455 U.S. 745, 769 (1982)',
      explanation: 'The State must prove by clear and convincing evidence that the child is in imminent danger requiring removal from the home.',
      application: 'This heightened standard requires more than preponderance of evidence but less than beyond reasonable doubt. Mere suspicion or unsubstantiated allegations are insufficient.'
    },
    termination: {
      standard: 'Clear and Convincing Evidence',
      citation: 'Santosky v. Kramer, 455 U.S. 745 (1982)',
      explanation: 'Termination of parental rights requires clear and convincing evidence of statutory grounds AND that termination is in the best interest of the child.',
      application: 'This is one of the highest standards in civil law, reflecting the fundamental right to parent.'
    },
    reunification: {
      standard: 'Preponderance of Evidence',
      citation: 'State law varies',
      explanation: 'Parent must show by preponderance that they have remedied conditions and reunification is in child\'s best interest.',
      application: 'More likely than not standard - 51% probability.'
    }
  },

  // Constitutional Rights
  constitutionalRights: {
    fourthAmendment: {
      right: 'Freedom from Unreasonable Search and Seizure',
      citation: 'U.S. Const. amend. IV; Payton v. New York, 445 U.S. 573 (1980)',
      elements: [
        'CPS/law enforcement needs warrant, consent, or exigent circumstances',
        'Exigent circumstances require immediate threat to child\'s safety',
        'Mere allegations are insufficient to establish exigency',
        'Warrantless entry violates Fourth Amendment absent true emergency'
      ],
      remedies: [
        'Suppression of evidence obtained from illegal search',
        'Dismissal of case if evidence is fruit of poisonous tree',
        'Section 1983 civil rights lawsuit',
        'Qualified immunity may not apply if right was clearly established'
      ]
    },
    fourteenthAmendment: {
      right: 'Due Process and Fundamental Liberty Interest in Parenting',
      citation: 'Troxel v. Granville, 530 U.S. 57 (2000); Stanley v. Illinois, 405 U.S. 645 (1972)',
      elements: [
        'Parents have fundamental liberty interest in care, custody, and control of children',
        'State may not interfere without compelling interest and due process',
        'Due process requires notice and meaningful opportunity to be heard',
        'Procedural protections must be provided before removal'
      ],
      remedies: [
        'Immediate return of children if due process violated',
        'Dismissal of case for procedural defects',
        'Damages for constitutional violation',
        'Injunctive relief preventing future violations'
      ]
    },
    firstAmendment: {
      right: 'Freedom of Religion and Parental Decision-Making',
      citation: 'Wisconsin v. Yoder, 406 U.S. 205 (1972); Prince v. Massachusetts, 321 U.S. 158 (1944)',
      elements: [
        'Parents have right to direct religious upbringing of children',
        'State cannot interfere with religious practices absent harm to child',
        'Cultural and religious parenting practices protected',
        'State bias against religion violates First Amendment'
      ],
      remedies: [
        'Dismissal if case based on religious discrimination',
        'Injunction against religious intrusion',
        'Damages for First Amendment violation',
        'Attorneys\' fees under 42 U.S.C. § 1988'
      ]
    }
  },

  // Statutory Requirements
  statutoryRequirements: {
    reasonableEfforts: {
      requirement: 'Reasonable Efforts to Prevent Removal',
      citation: '42 U.S.C. § 671(a)(15); Adoption and Safe Families Act (ASFA)',
      mustShow: [
        'Agency made reasonable efforts to prevent removal',
        'Services were offered to remedy identified issues',
        'Less restrictive alternatives were considered',
        'Removal was necessary despite efforts'
      ],
      failure: 'Failure to make reasonable efforts may require return of children and dismissal of case'
    },
    relativePlacement: {
      requirement: 'Priority Placement with Relatives',
      citation: '42 U.S.C. § 671(a)(19); ICWA for Native American children',
      mustShow: [
        'Agency conducted diligent search for relatives',
        'Relatives were given preference for placement',
        'Relatives were provided opportunity to be assessed',
        'Denial of relative placement was justified'
      ],
      failure: 'Improper denial of relative placement may violate federal and state law'
    },
    caseplan: {
      requirement: 'Written Case Plan with Specific Goals',
      citation: '42 U.S.C. § 675(1); state law varies',
      mustInclude: [
        'Specific, measurable goals for reunification',
        'Services to be provided to parent and child',
        'Timeline for achievement of goals',
        'Visitation schedule'
      ],
      failure: 'Failure to provide adequate case plan violates due process and statutory requirements'
    }
  },

  // Evidence Standards
  evidenceStandards: {
    hearsay: {
      rule: 'Hearsay Generally Inadmissible',
      citation: 'Federal Rules of Evidence 801-807; state equivalents',
      definition: 'Out-of-court statement offered for truth of matter asserted',
      exceptions: [
        'Present sense impression',
        'Excited utterance',
        'Statement for medical diagnosis',
        'Business records',
        'Public records'
      ],
      application: 'CPS reports often contain inadmissible hearsay. Object to hearsay statements and demand live testimony subject to cross-examination.'
    },
    expertTestimony: {
      rule: 'Expert Testimony Must be Reliable and Relevant',
      citation: 'Daubert v. Merrell Dow Pharmaceuticals, 509 U.S. 579 (1993)',
      requirements: [
        'Expert must be qualified by knowledge, skill, experience, training, or education',
        'Testimony must be based on sufficient facts or data',
        'Testimony must be product of reliable principles and methods',
        'Expert must have reliably applied principles to facts'
      ],
      application: 'Challenge unqualified experts, junk science, and conclusory opinions lacking factual basis'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// CASE LAW DATABASE (Selected Key Cases)
// ═══════════════════════════════════════════════════════════════════

export const KEY_CASE_LAW = {
  // Fourth Amendment
  'Gates v. Texas Department of Protective and Regulatory Services': {
    citation: '537 F.3d 404 (5th Cir. 2008)',
    holding: 'CPS social workers need probable cause and either warrant, consent, or exigent circumstances to enter home',
    keyQuote: 'The right of parents to raise their children without undue government intrusion is a fundamental liberty interest protected by the due process clause.',
    application: 'Use when CPS entered home without warrant, consent, or true emergency'
  },
  'Doe v. Heck': {
    citation: '327 F.3d 492 (7th Cir. 2003)',
    holding: 'Strip search of child without warrant or exigent circumstances violates Fourth Amendment',
    keyQuote: 'Absent an emergency, a strip search of a child requires a warrant or court order.',
    application: 'Use when CPS conducted invasive medical examination without authorization'
  },
  'Roska ex rel. Roska v. Sneddon': {
    citation: '437 F.3d 964 (9th Cir. 2006)',
    holding: 'Warrantless interrogation of child at school requires reasonable suspicion of abuse',
    keyQuote: 'Social workers must have objectively reasonable suspicion of child abuse before conducting warrantless investigation.',
    application: 'Use when CPS interviewed child without reasonable suspicion or parental notice'
  },

  // Due Process
  'Santosky v. Kramer': {
    citation: '455 U.S. 745 (1982)',
    holding: 'Clear and convincing evidence required for termination of parental rights',
    keyQuote: 'The fundamental liberty interest of natural parents in the care, custody, and management of their child requires use of clear and convincing evidence standard.',
    application: 'Foundation case for burden of proof in all CPS cases'
  },
  'Troxel v. Granville': {
    citation: '530 U.S. 57 (2000)',
    holding: 'Parents have fundamental constitutional right to make decisions concerning care, custody, and control of children',
    keyQuote: 'The liberty interest at issue in this case—the interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests.',
    application: 'Use to establish fundamental nature of parental rights'
  },
  'Stanley v. Illinois': {
    citation: '405 U.S. 645 (1972)',
    holding: 'Parents entitled to hearing before children can be taken by state',
    keyQuote: 'The Court has frequently emphasized that procedural due process rules are shaped by the risk of error inherent in the truth-finding process.',
    application: 'Use when parent was denied hearing or procedural protections'
  },

  // Qualified Immunity
  'Pearson v. Callahan': {
    citation: '555 U.S. 223 (2009)',
    holding: 'Two-part test for qualified immunity: (1) constitutional violation, (2) clearly established right',
    keyQuote: 'Officials are not immune if, on an objective basis, it is obvious that no reasonably competent officer would have concluded that a warrant existed.',
    application: 'Use in Section 1983 suits to overcome qualified immunity defense'
  },
  'Tenenbaum v. Williams': {
    citation: '193 F.3d 581 (2d Cir. 1999)',
    holding: 'Social worker not entitled to qualified immunity for removing children without warrant or exigent circumstances',
    keyQuote: 'Qualified immunity does not protect social workers who remove children in violation of clearly established Fourth Amendment rights.',
    application: 'Defeats qualified immunity when removal was clearly unconstitutional'
  },

  // Reasonable Efforts
  'Adoption and Safe Families Act': {
    citation: '42 U.S.C. § 671(a)(15)',
    holding: 'State must make reasonable efforts to prevent removal and reunify families',
    keyQuote: 'In each case, reasonable efforts shall be made to preserve and reunify families.',
    application: 'Use when agency failed to offer services or explore alternatives to removal'
  }
};

// ═══════════════════════════════════════════════════════════════════
// STELLAR DOCUMENT GENERATOR
// ═══════════════════════════════════════════════════════════════════

export interface DocumentGenerationParams {
  // Case Information
  state: string;
  county: string;
  courtType: 'family' | 'juvenile' | 'district' | 'federal';
  caseNumber: string;
  childrenNames: string;
  
  // Party Information
  parentName: string;
  parentAddress: string;
  parentCity: string;
  parentState: string;
  parentZip: string;
  parentPhone: string;
  parentEmail: string;
  parentDOB?: string;
  
  // Attorney Information (if represented)
  isRepresented: boolean;
  attorneyName?: string;
  attorneyBarNumber?: string;
  attorneyFirm?: string;
  attorneyAddress?: string;
  attorneyPhone?: string;
  attorneyEmail?: string;
  
  // Case Details
  violations: string[];
  facts: string[];
  evidence: string[];
  dateOfIncident?: string;
  dateOfRemoval?: string;
  hearingDate?: string;
  
  // Court Info
  courtName?: string;
  judgeName?: string;
  division?: string;
  
  // CPS Information
  caseworkerName?: string;
  agencyName?: string;
  agencyAttorney?: string;
  
  // AI Enhancement
  useAI: boolean;
  documentAnalysis?: any[];
}

// ═══════════════════════════════════════════════════════════════════
// MOTION TO DISMISS (Court-Perfect Format)
// ═══════════════════════════════════════════════════════════════════

export const generateMotionToDismiss = (params: DocumentGenerationParams): string => {
  const standards = getCourtStandards(params.state);
  
  // Generate caption
  const caption = formatCaptionByState(
    params.state,
    params.courtType,
    {
      county: params.county,
      caseNumber: params.caseNumber,
      childrenNames: params.childrenNames,
      documentTitle: 'MOTION TO DISMISS',
      division: params.division
    }
  );

  // Generate signature block
  const signature = formatSignatureBlock(
    params.state,
    params.isRepresented ? 'attorney' : 'pro-se',
    {
      name: params.isRepresented ? (params.attorneyName || '') : params.parentName,
      address: params.isRepresented ? params.attorneyAddress : params.parentAddress,
      city: params.isRepresented ? '' : params.parentCity,
      state: params.isRepresented ? '' : params.parentState,
      zip: params.isRepresented ? '' : params.parentZip,
      phone: params.isRepresented ? params.attorneyPhone : params.parentPhone,
      email: params.isRepresented ? params.attorneyEmail : params.parentEmail,
      barNumber: params.attorneyBarNumber,
      firm: params.attorneyFirm
    },
    params.parentName
  );

  // Select applicable case law based on violations
  const applicableCaseLaw: string[] = [];
  if (params.violations.includes('fourthAmendment')) {
    applicableCaseLaw.push(
      `${KEY_CASE_LAW['Gates v. Texas Department of Protective and Regulatory Services'].citation} ("${KEY_CASE_LAW['Gates v. Texas Department of Protective and Regulatory Services'].keyQuote}")`,
      `${KEY_CASE_LAW['Roska ex rel. Roska v. Sneddon'].citation}`
    );
  }
  if (params.violations.includes('fourteenthAmendment') || params.violations.includes('noWrittenNotice')) {
    applicableCaseLaw.push(
      `${KEY_CASE_LAW['Santosky v. Kramer'].citation}`,
      `${KEY_CASE_LAW['Troxel v. Granville'].citation}`,
      `${KEY_CASE_LAW['Stanley v. Illinois'].citation}`
    );
  }

  // Build document body
  let documentBody = `${caption}

TO THE HONORABLE ${params.judgeName || 'JUDGE'} OF SAID COURT:

NOW COMES ${params.parentName}${params.isRepresented ? ', by and through undersigned counsel,' : ', appearing pro se,'} and respectfully moves this Honorable Court to dismiss the above-captioned matter in its entirety, and in support thereof would show the Court as follows:

I. INTRODUCTION AND SUMMARY OF RELIEF SOUGHT

     ${params.parentName} respectfully moves this Court to dismiss the petition filed by ${params.agencyName || 'the Department'} regarding the minor child(ren), ${params.childrenNames}. As demonstrated below, the Department has failed to meet its burden of proof, violated constitutional rights, and failed to comply with statutory requirements. This case should be dismissed with prejudice.

II. LEGAL STANDARD FOR DISMISSAL

     A. Burden of Proof

     Under the Due Process Clause of the Fourteenth Amendment to the United States Constitution and applicable state law, the State must prove allegations of abuse or neglect by **clear and convincing evidence**. ${KEY_CASE_LAW['Santosky v. Kramer'].citation}. This heightened standard of proof—more demanding than the preponderance standard used in most civil cases—reflects the fundamental liberty interest that parents have in the care, custody, and control of their children. ${KEY_CASE_LAW['Troxel v. Granville'].citation}.

     The clear and convincing standard requires that the evidence be "so clear, direct, and weighty and convincing as to enable the factfinder to come to a clear conviction, without hesitancy, of the truth of the precise facts in issue." *In re Winship*, 397 U.S. 358, 368 (1970). Vague, conclusory, or speculative allegations are insufficient to meet this standard.

     B. Sufficiency of the Petition

     A petition alleging abuse or neglect must state specific facts that, if proven true, would constitute a statutory basis for state intervention. Bare legal conclusions, unsubstantiated allegations, and hearsay statements are insufficient to support removal or continued custody.

     C. Constitutional Protections

     Parents possess a fundamental liberty interest in the care, custody, and control of their children, which is "perhaps the oldest of the fundamental liberty interests recognized by this Court." ${KEY_CASE_LAW['Troxel v. Granville'].citation} at 65. This fundamental right may not be infringed absent a compelling state interest and narrow tailoring of the state's action. Any state action interfering with parental rights must comply with procedural and substantive due process requirements of the Fourteenth Amendment.

III. GROUNDS FOR DISMISSAL

     A. Insufficient Evidence to Meet Clear and Convincing Standard

     The Department has failed to present clear and convincing evidence of abuse or neglect. The evidence consists primarily of:`;

  // Add specific evidence deficiencies
  if (params.violations.includes('hearsayEvidence')) {
    documentBody += `

     1. **Inadmissible Hearsay Evidence**

     The Department's case relies heavily on out-of-court statements that are offered for the truth of the matter asserted and lack any applicable hearsay exception. See Federal Rules of Evidence 801-807 (adopted by most states). Specifically:

     ${params.facts.length > 0 ? params.facts.slice(0, 3).map((f, i) => `     • ${f}`).join('\n') : '     • Unsworn statements from anonymous reporters\n     • Third-party allegations lacking personal knowledge\n     • Conclusory statements from mandatory reporters'}

     These hearsay statements are insufficient to meet the clear and convincing standard. The Department must produce competent, admissible evidence subject to cross-examination. *Crawford v. Washington*, 541 U.S. 36 (2004).`;
  }

  if (params.violations.includes('noPhysicalEvidence')) {
    documentBody += `

     2. **Complete Absence of Physical Evidence**

     The Department has produced no physical evidence, medical records, photographs, or expert testimony to support allegations of abuse or neglect. Speculation and suspicion, without corroborating physical evidence, cannot meet the clear and convincing standard. The absence of objective evidence is fatal to the Department's case.`;
  }

  if (params.violations.includes('biasedInvestigation') || params.violations.includes('cherryPickedEvidence')) {
    documentBody += `

     3. **Biased Investigation and Cherry-Picked Evidence**

     The investigation conducted by ${params.caseworkerName || 'the assigned caseworker'} was fundamentally flawed and biased. The investigator:

     • Failed to investigate exculpatory evidence
     • Ignored witness statements supporting ${params.parentName}
     • Drew conclusions before gathering all evidence
     • Demonstrated confirmation bias throughout investigation

     A biased investigation that ignores exculpatory evidence violates due process and renders the resulting petition unreliable. *Brady v. Maryland*, 373 U.S. 83 (1963) (prosecution must disclose exculpatory evidence).`;
  }

  // Constitutional Violations Section
  documentBody += `

     B. Violation of Constitutional Rights

     The Department's actions in this case have violated ${params.parentName}'s clearly established constitutional rights under the Fourth and Fourteenth Amendments to the United States Constitution.`;

  if (params.violations.includes('fourthAmendment')) {
    documentBody += `

     1. **Fourth Amendment Violation - Unreasonable Search and Seizure**

     ${params.caseworkerName || 'The caseworker'} violated the Fourth Amendment by entering ${params.parentName}'s home without:

     • A valid search warrant supported by probable cause
     • Voluntary and knowing consent
     • Exigent circumstances requiring immediate action

     ${KEY_CASE_LAW['Gates v. Texas Department of Protective and Regulatory Services'].holding}. ${KEY_CASE_LAW['Gates v. Texas Department of Protective and Regulatory Services'].citation}. "${KEY_CASE_LAW['Gates v. Texas Department of Protective and Regulatory Services'].keyQuote}"

     The warrantless entry here violated clearly established Fourth Amendment law. *Payton v. New York*, 445 U.S. 573 (1980) (warrantless entry into home violates Fourth Amendment absent exigent circumstances). There were no exigent circumstances justifying the warrantless intrusion. Mere allegations or suspicion do not constitute an emergency. *Roska ex rel. Roska v. Sneddon*, ${KEY_CASE_LAW['Roska ex rel. Roska v. Sneddon'].citation}.

     **All evidence obtained from this unconstitutional search must be suppressed**, and the case must be dismissed as fruit of the poisonous tree. *Wong Sun v. United States*, 371 U.S. 471 (1963).`;
  }

  if (params.violations.includes('fourteenthAmendment') || params.violations.includes('noWrittenNotice')) {
    documentBody += `

     2. **Fourteenth Amendment Violation - Denial of Due Process**

     ${params.parentName}'s fundamental right to due process has been violated in multiple respects:

     • **Inadequate Notice**: ${params.parentName} did not receive proper written notice of the specific allegations, as required by due process. ${KEY_CASE_LAW['Stanley v. Illinois'].citation} (parents entitled to notice and hearing before children are taken).

     • **No Meaningful Opportunity to be Heard**: ${params.parentName} was not afforded a meaningful opportunity to respond to allegations before removal${params.dateOfRemoval ? ` on ${params.dateOfRemoval}` : ''}.

     • **Lack of Procedural Protections**: The investigation proceeded without basic procedural safeguards, including the right to counsel, right to confront accusers, and right to present evidence.

     "The fundamental liberty interest of natural parents in the care, custody, and management of their child does not evaporate simply because they have not been model parents." ${KEY_CASE_LAW['Santosky v. Kramer'].citation} at 753. Due process requires procedural protections commensurate with this fundamental right.`;
  }

  if (params.violations.includes('deniedLegalCounsel') || params.violations.includes('forcedToSign')) {
    documentBody += `

     3. **Coercion and Denial of Counsel**

     ${params.parentName} was coerced into${params.violations.includes('forcedToSign') ? ' signing documents' : ' making statements'} without the benefit of legal counsel. Specifically:

     • ${params.parentName} was threatened with immediate removal of children unless cooperation
     • ${params.parentName} was denied opportunity to consult with an attorney
     • ${params.parentName} was misled about rights and consequences of actions

     Any statements or agreements obtained through coercion and without counsel are involuntary and must be excluded. *Miranda v. Arizona*, 384 U.S. 436 (1966); *Lynumn v. Illinois*, 372 U.S. 528 (1963) (confessions obtained by coercive inducements are involuntary).`;
  }

  // Statutory Violations Section
  documentBody += `

     C. Failure to Comply with Statutory Requirements`;

  if (params.violations.includes('noReasonableEfforts') || params.violations.includes('noSafetyPlan') || params.violations.includes('noServicesOffered')) {
    documentBody += `

     1. **Failure to Make Reasonable Efforts**

     Federal and state law require that the Department make "reasonable efforts" to prevent the removal of children from their home and to reunify families. 42 U.S.C. § 671(a)(15)(A); ${params.state} state law. The Department failed to make any reasonable efforts in this case:

     • No safety plan was offered that would allow ${params.childrenNames} to remain at home
     • No in-home services were provided prior to removal
     • No preventative services were offered to address alleged concerns
     • Less restrictive alternatives (kinship care, safety monitors) were not explored
     • ${params.violations.includes('noRelativePlacement') ? 'Relatives were not contacted or considered for placement' : ''}

     This failure violates the Adoption and Safe Families Act (ASFA) and state law. When the Department fails to make reasonable efforts, the Court may order return of children and dismissal of the case. *In re T.J.*, [cite state case on reasonable efforts].`;
  }

  if (params.violations.includes('inappropriatePlacement') || params.violations.includes('separatedSiblings')) {
    documentBody += `

     2. **Improper Placement Decisions**

     The Department has violated statutory requirements regarding placement:

     ${params.violations.includes('separatedSiblings') ? '• Siblings have been separated despite statutory preference for keeping siblings together' : ''}
     ${params.violations.includes('inappropriatePlacement') ? '• Children placed in inappropriate setting not meeting their needs' : ''}
     ${params.violations.includes('noRelativePlacement') ? '• Relatives were not given placement preference despite federal requirement (42 U.S.C. § 671(a)(19))' : ''}

     These placement violations demonstrate the Department's disregard for statutory mandates and the best interests of the children.`;
  }

  if (params.violations.includes('missedDeadlines')) {
    documentBody += `

     3. **Failure to Comply with Statutory Deadlines**

     The Department has missed critical statutory deadlines, violating ${params.parentName}'s rights and the children's right to permanency:

     • Late filing of petition
     • Delayed permanency hearings
     • Untimely completion of assessments
     • Failure to comply with Adoption and Safe Families Act (ASFA) timelines

     These violations prejudice ${params.parentName} and undermine the integrity of the proceedings.`;
  }

  // Prayer for Relief
  documentBody += `

IV. CONCLUSION AND PRAYER FOR RELIEF

     The Department has failed to meet its burden of proof, violated ${params.parentName}'s constitutional rights, and failed to comply with statutory requirements. The evidence is insufficient, the investigation was flawed, and the procedural violations are substantial.

     WHEREFORE, PREMISES CONSIDERED, ${params.parentName} respectfully prays that this Court:

     1. **GRANT this Motion to Dismiss** and dismiss the petition with prejudice;

     2. **ORDER the immediate return** of ${params.childrenNames} to ${params.parentName}'s custody;

     3. **AWARD ${params.parentName} reasonable attorneys' fees and costs** pursuant to applicable law;

     4. **AWARD any further relief**, legal or equitable, to which ${params.parentName} may be entitled.

Respectfully submitted,
`;

  // Add signature
  documentBody += signature;

  // Add certificate of service
  if (params.agencyAttorney) {
    const certOfService = formatCertificateOfService(
      params.state,
      {
        recipientName: params.agencyAttorney,
        recipientTitle: `Attorney for ${params.agencyName || 'Department'}`,
        serviceMethod: 'certified mail, return receipt requested',
        servedBy: params.isRepresented ? (params.attorneyName || '') : params.parentName
      }
    );
    documentBody += certOfService;
  }

  // Add verification if required
  if (requiresVerification(params.state, 'Motion to Dismiss')) {
    const verification = formatVerification(
      params.state,
      params.parentName,
      'MOTION TO DISMISS'
    );
    documentBody += verification;
  }

  // Add filing instructions
  documentBody += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILING INSTRUCTIONS

${getFilingInstructions(params.state)}

⚠️ IMPORTANT REMINDERS:

1. **Review Carefully**: This document is a template. Review every section and customize facts specific to your case.

2. **Verify Citations**: Confirm all legal citations are current and applicable in your jurisdiction.

3. **Attach Evidence**: Include supporting affidavits, declarations, and documentary evidence as exhibits.

4. **File Timely**: Check local rules for response deadlines. File well before deadline.

5. **Serve All Parties**: Serve copies on Department's attorney and any other parties.

6. **Consult Attorney**: This document is for educational purposes. Consult a licensed attorney before filing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return documentBody;
};

// ═══════════════════════════════════════════════════════════════════
// EXPORT ALL GENERATORS
// ═══════════════════════════════════════════════════════════════════

export {
  LEGAL_STANDARDS,
  KEY_CASE_LAW
};
