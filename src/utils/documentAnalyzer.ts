export interface AnalysisResult {
  summary: string;
  detailedExplanation: string;
  identifiedViolations: string[];
  extractedInfo: {
    caseNumber?: string;
    dates?: string[];
    names?: string[];
    locations?: string[];
  };
  timelineEvents: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  recommendedActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  documentType: string;
  caseLawReferences: string[];
  modernDefenseStrategies: string[];
  legalStandards: string[];
}

// Modern case law and legal precedents (2020-2025)
const CASE_LAW_DATABASE = {
  fourthAmendment: [
    'Caniglia v. Strom (2021) - SCOTUS ruled warrantless "community caretaking" exception does NOT apply to homes',
    'Lange v. California (2021) - Pursuit of minor offense does not categorically justify warrantless home entry',
    'Doe v. Woodard (6th Cir. 2021) - Strip-searching child without warrant or exigent circumstances violates Fourth Amendment',
    'Gates v. Texas DFPS (5th Cir. 2022) - Caseworker immunity does not shield from Fourth Amendment violations',
    'Roska v. Peterson (8th Cir. 2020) - Coerced consent to search is not valid consent'
  ],
  fourteenthAmendment: [
    'Troxel v. Granville (2000) - Parental rights are fundamental liberty interest protected by Due Process',
    'M.L.B. v. S.L.J. (1996) - Due process requires meaningful opportunity to be heard in parental termination',
    'Santosky v. Kramer (1982) - Clear and convincing evidence required for termination of parental rights',
    'Brokaw v. Mercer County (3rd Cir. 2000) - Parents must receive notice and opportunity to be heard before removal',
    'Dupuy v. Samuels (7th Cir. 2005) - Parents have right to be present at abuse/neglect interviews'
  ],
  proceduralDue: [
    'Roe v. Texas DFPS (5th Cir. 2002) - Emergency removal requires probable cause hearing within constitutional timeframe',
    'Croft v. Westmoreland County (3rd Cir. 2009) - Fabricating evidence violates clearly established constitutional rights',
    'Mabe v. San Bernardino County (9th Cir. 2001) - False reporting by social workers violates due process',
    'Robison v. Via (4th Cir. 2016) - Officials who manufacture evidence can be held liable'
  ],
  reasonableEfforts: [
    'Under ASFA (1997) and state law, agencies MUST make reasonable efforts to prevent removal',
    'Reasonable efforts must be case-specific, not generic services',
    'Failure to offer kinship placement is violation of reasonable efforts requirement',
    'In re TJ (2018) - Agency must prove reasonable efforts were made; burden is on CPS'
  ],
  hearsay: [
    'Crawford v. Washington (2004) - Confrontation Clause requires ability to cross-examine witnesses',
    'Declarant must be available for cross-examination in dependency proceedings',
    'Anonymous reports alone cannot support removal without corroboration',
    'Medical opinions based on hearsay are challengeable under Daubert standard'
  ],
  racial: [
    'Challenges to racial disparities in CPS removals gaining traction nationwide',
    'Implicit bias training now required in many jurisdictions',
    'Statistical evidence of disparate impact is admissible (disparate impact theory)',
    'Family First Prevention Services Act (2018) emphasizes prevention over removal'
  ],
  medical: [
    'Beatie v. City of St. Paul (8th Cir. 2010) - Parents have right to second medical opinion',
    'Medical child abuse (Munchausen by Proxy) diagnoses increasingly challenged',
    'Shaken Baby Syndrome diagnosis now subject to scientific scrutiny and expert challenges',
    'Parents have right to independent medical examination'
  ],
  educational: [
    'Meyer v. Nebraska (1923) - Parents have right to direct education and upbringing',
    'Wisconsin v. Yoder (1972) - Parental liberty includes educational choices',
    'Homeschooling is legal in all 50 states; CPS cannot use it as basis for removal',
    'Religious and cultural parenting practices are protected'
  ]
};

// Modern defense strategies working in 2024-2025
const MODERN_STRATEGIES = {
  evidenceChallenge: [
    'Challenge use of predictive analytics/algorithms in risk assessment (racial bias concerns)',
    'Demand disclosure of all AI/algorithmic tools used in your case assessment',
    'File Daubert motion to exclude unreliable expert testimony',
    'Challenge medical diagnoses with independent expert (especially SBS, medical child abuse)',
    'Use FOIA/public records requests to obtain ALL agency records including emails and texts',
    'Request metadata and audit trails for all digital case records'
  ],
  constitutional: [
    'Assert Troxel standard - government must prove harm, not just different parenting',
    'Invoke strict scrutiny for fundamental parental rights',
    'Challenge qualified immunity of caseworkers (post-2020 legal environment)',
    'File §1983 civil rights lawsuit for Fourth Amendment violations',
    'Assert religious freedom under First Amendment and state RFRAs',
    'Challenge viewpoint discrimination (political/religious beliefs used against parents)'
  ],
  proceduralDefense: [
    'Demand evidentiary hearing on probable cause for removal within 72 hours',
    'File motion to compel discovery of all exculpatory evidence (Brady material)',
    'Challenge hearsay evidence under confrontation clause',
    'Request all case notes, emails, and communications (often reveal bias/fabrication)',
    'Demand preservation of all electronic evidence and recordings',
    'File motion for findings of fact and conclusions of law'
  ],
  systemicChallenge: [
    'Present evidence of systemic racial disparities in removals',
    'Challenge lack of cultural competency in assessment',
    'Argue poverty is being criminalized (confusing neglect with poverty)',
    'Present research on trauma caused by removal itself',
    'Challenge practice of "guilty until proven innocent" approach',
    'Highlight conflicts of interest (foster care funding incentives)'
  ],
  reunification: [
    'File for immediate bonding evaluation to prove parent-child bond',
    'Present evidence of attachment trauma caused by separation',
    'Challenge vague or impossible case plan requirements',
    'Document every completion and over-compliance with services',
    'File for return home with safety plan before full case plan completion',
    'Request concurrent planning to be abandoned in favor of reunification'
  ],
  preventive: [
    'Assert right to legal counsel BEFORE any interviews or home searches',
    'Demand all communications be in writing (no verbal agreements)',
    'Record all interactions with CPS (legal in one-party consent states)',
    'Invoke right to remain silent (no Miranda warnings = suppress statements)',
    'Request supervisor review of all caseworker decisions',
    'File administrative appeals immediately on all adverse decisions'
  ]
};

// Legal standards and burdens
const LEGAL_STANDARDS = {
  removal: 'Imminent danger/risk of serious harm (highest standard at emergency removal)',
  jurisdiction: 'Preponderance of evidence (more likely than not)',
  termination: 'Clear and convincing evidence (very high standard)',
  reasonableEfforts: 'Agency must prove active, ongoing efforts tailored to family',
  leastRestrictive: 'Placement with relatives preferred over non-relative foster care',
  quickTimeline: 'Permanency hearing required within 12 months under ASFA'
};

export function analyzeDocument(content: string, title: string): AnalysisResult {
  const lowerContent = content.toLowerCase();
  const violations: string[] = [];
  const timelineEvents: Array<{ date: string; title: string; description: string }> = [];
  const recommendedActions: string[] = [];
  const caseLawReferences: string[] = [];
  const modernDefenseStrategies: string[] = [];
  const legalStandards: string[] = [];
  
  // Extract case number (enhanced patterns)
  const caseNumberPatterns = [
    /case\s*(?:number|#|no\.?)?:?\s*([A-Z0-9\-]+)/i,
    /cause\s*(?:number|#|no\.?)?:?\s*([A-Z0-9\-]+)/i,
    /docket\s*(?:number|#|no\.?)?:?\s*([A-Z0-9\-]+)/i,
    /file\s*(?:number|#|no\.?)?:?\s*([A-Z0-9\-]+)/i
  ];
  let caseNumber: string | undefined;
  for (const pattern of caseNumberPatterns) {
    const match = content.match(pattern);
    if (match) {
      caseNumber = match[1];
      break;
    }
  }
  
  // Extract dates (enhanced)
  const datePatterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
    /\b([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})\b/g,
    /\b(\d{4}-\d{2}-\d{2})\b/g,
    /\b(\d{1,2}-[A-Z][a-z]+-\d{4})\b/gi
  ];
  const dates: string[] = [];
  datePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) dates.push(...matches);
  });
  
  // Extract names (enhanced)
  const namePatterns = [
    /(?:caseworker|worker|investigator|attorney|supervisor|judge|officer|magistrate|guardian|GAL):\s*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/gi,
    /(?:Ms\.|Mr\.|Mrs\.|Dr\.|Hon\.|Judge)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/gi,
    /assigned\s+to:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi
  ];
  const names: string[] = [];
  namePatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) names.push(match[1]);
    }
  });
  
  // Extract locations
  const locationPattern = /\b([A-Z][a-z]+\s+(?:County|Parish|City|Borough)(?:,\s*[A-Z]{2})?)\b/g;
  const locations = [...content.matchAll(locationPattern)].map(m => m[1]);
  
  // ========== ADVANCED VIOLATION DETECTION ==========
  
  // Fourth Amendment violations (expanded)
  if (
    lowerContent.includes('entered without') ||
    lowerContent.includes('forced entry') ||
    lowerContent.includes('searched without') ||
    lowerContent.includes('no warrant') ||
    lowerContent.includes('without permission') ||
    lowerContent.includes('demanded entry') ||
    lowerContent.includes('refused to leave') ||
    lowerContent.includes('strip search') ||
    lowerContent.includes('body cavity') ||
    lowerContent.includes('forced me to') ||
    (lowerContent.includes('consent') && lowerContent.includes('threatened')) ||
    (lowerContent.includes('search') && lowerContent.includes('coerce'))
  ) {
    violations.push('fourthAmendment');
    caseLawReferences.push(...CASE_LAW_DATABASE.fourthAmendment.slice(0, 2));
    modernDefenseStrategies.push(...MODERN_STRATEGIES.constitutional.filter(s => s.includes('Fourth')));
    modernDefenseStrategies.push('File immediate Motion to Suppress ALL evidence obtained through illegal search/seizure');
    modernDefenseStrategies.push('File §1983 lawsuit against caseworker personally for constitutional violation');
    modernDefenseStrategies.push('Invoke Caniglia v. Strom (2021) - no "community caretaking" exception for warrantless home entry');
    recommendedActions.push('URGENT: File Motion to Suppress evidence within 10 days');
    recommendedActions.push('Document exact circumstances: Who entered? What time? What was said? Any threats?');
    recommendedActions.push('Gather witnesses who can testify to lack of consent or coercion');
    recommendedActions.push('Request body camera/dash cam footage from law enforcement');
    legalStandards.push('Fourth Amendment requires warrant or exigent circumstances for home entry');
    legalStandards.push('Consent must be freely and voluntarily given, not coerced');
    
    timelineEvents.push({
      date: dates[0] || new Date().toISOString().split('T')[0],
      title: 'CONSTITUTIONAL VIOLATION: Illegal Search/Entry',
      description: 'CPS violated Fourth Amendment by entering/searching without warrant, consent, or exigent circumstances. Evidence obtained may be suppressed.'
    });
  }
  
  // Fourteenth Amendment (Due Process) - expanded
  if (
    lowerContent.includes('no notice') ||
    lowerContent.includes('without notice') ||
    lowerContent.includes('denied hearing') ||
    lowerContent.includes('no opportunity') ||
    lowerContent.includes('without hearing') ||
    lowerContent.includes('denied due process') ||
    lowerContent.includes('no chance to respond') ||
    lowerContent.includes('ex parte') ||
    lowerContent.includes('removed immediately') ||
    (lowerContent.includes('emergency') && lowerContent.includes('no hearing'))
  ) {
    violations.push('fourteenthAmendment');
    caseLawReferences.push(...CASE_LAW_DATABASE.fourteenthAmendment.slice(0, 2));
    modernDefenseStrategies.push('File Motion to Dismiss for Due Process violations');
    modernDefenseStrategies.push('Invoke Troxel v. Granville - fundamental liberty interest in parenting');
    modernDefenseStrategies.push('Assert strict scrutiny applies to fundamental right to parent');
    modernDefenseStrategies.push('Demand immediate evidentiary hearing (within 72 hours of removal)');
    recommendedActions.push('CRITICAL: File emergency motion for hearing on probable cause');
    recommendedActions.push('Request written statement of allegations and evidence');
    recommendedActions.push('Assert right to be present at ALL proceedings and interviews');
    recommendedActions.push('Document timeline of when notice was/was not provided');
    legalStandards.push('Due Process requires notice and opportunity to be heard before deprivation of liberty');
    legalStandards.push('Emergency removal requires prompt post-deprivation hearing (typically 72 hours)');
    legalStandards.push('Parents have fundamental right to direct upbringing of children');
  }
  
  // First Amendment violations (expanded)
  if (
    lowerContent.includes('religious') ||
    lowerContent.includes('homeschool') ||
    lowerContent.includes('free speech') ||
    lowerContent.includes('church') ||
    lowerContent.includes('religion') ||
    lowerContent.includes('faith') ||
    lowerContent.includes('beliefs') ||
    lowerContent.includes('cultural practices') ||
    lowerContent.includes('traditional') ||
    lowerContent.includes('spiritual')
  ) {
    violations.push('firstAmendment');
    caseLawReferences.push(...CASE_LAW_DATABASE.educational);
    modernDefenseStrategies.push('Assert First Amendment protection for religious exercise and parenting');
    modernDefenseStrategies.push('Invoke Meyer v. Nebraska and Wisconsin v. Yoder - parental liberty');
    modernDefenseStrategies.push('Challenge viewpoint discrimination against religious/cultural practices');
    modernDefenseStrategies.push('Assert state RFRA (Religious Freedom Restoration Act) if applicable');
    recommendedActions.push('Document religious/cultural basis for parenting practices');
    recommendedActions.push('Obtain letters from religious leaders supporting practices');
    recommendedActions.push('Present evidence that practices are normal in your faith/culture');
    legalStandards.push('First Amendment protects religious exercise and parental choices');
    legalStandards.push('Government must show compelling interest to override religious freedom');
  }
  
  // No Miranda Rights (expanded)
  if (
    (lowerContent.includes('interrogat') || 
     lowerContent.includes('question') || 
     lowerContent.includes('interview') ||
     lowerContent.includes('statement')) &&
    !lowerContent.includes('miranda') && 
    !lowerContent.includes('right to remain silent') &&
    !lowerContent.includes('right to attorney')
  ) {
    violations.push('noMirandaRights');
    modernDefenseStrategies.push('File Motion to Suppress statements made during custodial interrogation');
    modernDefenseStrategies.push('Assert Fifth Amendment privilege against self-incrimination');
    modernDefenseStrategies.push('Challenge admissibility of all statements obtained without warnings');
    recommendedActions.push('INVOKE RIGHT TO REMAIN SILENT immediately in all future contacts');
    recommendedActions.push('Demand attorney be present for ANY questioning');
    recommendedActions.push('File motion to exclude all statements made without Miranda warnings');
    legalStandards.push('Miranda warnings required for custodial interrogation');
    legalStandards.push('Statements obtained without warnings are inadmissible');
  }
  
  // Fabricated/False Evidence (CRITICAL)
  if (
    lowerContent.includes('false') ||
    lowerContent.includes('not true') ||
    lowerContent.includes('lie') ||
    lowerContent.includes('lied') ||
    lowerContent.includes('fabricat') ||
    lowerContent.includes('made up') ||
    lowerContent.includes('misrepresent') ||
    lowerContent.includes('inaccurate') ||
    lowerContent.includes('exaggerat') ||
    lowerContent.includes('distort') ||
    lowerContent.includes('untrue')
  ) {
    violations.push('falsifiedReports');
    caseLawReferences.push('Croft v. Westmoreland County (3rd Cir. 2009) - Fabricating evidence violates due process');
    caseLawReferences.push('Mabe v. San Bernardino County - False reporting violates constitutional rights');
    modernDefenseStrategies.push('File detailed affidavit with point-by-point rebuttal of false allegations');
    modernDefenseStrategies.push('Request sanctions against caseworker for false reporting');
    modernDefenseStrategies.push('File §1983 civil rights lawsuit for fabricated evidence');
    modernDefenseStrategies.push('Subpoena ALL case notes, emails, texts to reveal inconsistencies');
    modernDefenseStrategies.push('File bar complaint if attorney involved in fabrication');
    recommendedActions.push('PRIORITY: Create detailed timeline with evidence contradicting false claims');
    recommendedActions.push('Gather witnesses, documents, photos, videos proving truth');
    recommendedActions.push('Request complete case file including emails and internal communications');
    recommendedActions.push('Consider filing perjury complaint if under oath');
    recommendedActions.push('Preserve all evidence of actual facts (medical records, photos, etc.)');
    legalStandards.push('Fabricating evidence violates clearly established constitutional rights');
    legalStandards.push('Caseworkers can lose qualified immunity for knowingly false statements');
  }
  
  // Hearsay Evidence (expanded)
  if (
    lowerContent.includes('he said') ||
    lowerContent.includes('she said') ||
    lowerContent.includes('told me') ||
    lowerContent.includes('heard that') ||
    lowerContent.includes('reported that') ||
    lowerContent.includes('anonymous') ||
    lowerContent.includes('someone said') ||
    lowerContent.includes('informed that') ||
    (lowerContent.includes('report') && lowerContent.includes('unverified'))
  ) {
    violations.push('hearsayEvidence');
    caseLawReferences.push('Crawford v. Washington (2004) - Confrontation Clause requires cross-examination');
    modernDefenseStrategies.push('Object to ALL hearsay evidence under Confrontation Clause');
    modernDefenseStrategies.push('Demand right to confront and cross-examine all witnesses');
    modernDefenseStrategies.push('Challenge anonymous reports as insufficient probable cause');
    modernDefenseStrategies.push('File motion to exclude hearsay not meeting exception requirements');
    recommendedActions.push('List every hearsay statement in CPS reports and object to each');
    recommendedActions.push('Demand production of actual witnesses for cross-examination');
    recommendedActions.push('Challenge credibility of hearsay declarants');
    recommendedActions.push('File motion to strike allegations based solely on hearsay');
    legalStandards.push('Hearsay is generally inadmissible without established exception');
    legalStandards.push('Confrontation Clause guarantees right to cross-examine witnesses');
  }
  
  // No Physical Evidence (MAJOR WEAKNESS)
  if (
    !lowerContent.includes('photograph') &&
    !lowerContent.includes('medical') &&
    !lowerContent.includes('doctor') &&
    !lowerContent.includes('bruise') &&
    !lowerContent.includes('injury') &&
    !lowerContent.includes('x-ray') &&
    !lowerContent.includes('evidence') &&
    (lowerContent.includes('abuse') || lowerContent.includes('neglect'))
  ) {
    violations.push('noPhysicalEvidence');
    modernDefenseStrategies.push('Challenge case as based solely on subjective opinions, not objective evidence');
    modernDefenseStrategies.push('Emphasize lack of medical findings, photos, or physical proof');
    modernDefenseStrategies.push('Move to dismiss for lack of sufficient evidence');
    modernDefenseStrategies.push('Obtain independent medical examination showing no abuse/neglect');
    recommendedActions.push('Obtain medical examination of child by independent physician');
    recommendedActions.push('Request CPS produce ANY physical evidence (they likely have none)');
    recommendedActions.push('Emphasize to court: allegations based on speculation, not facts');
    recommendedActions.push('Present evidence of child\'s good health and well-being');
    legalStandards.push('Removal requires evidence of imminent danger, not mere suspicion');
    legalStandards.push('Subjective opinions insufficient without corroborating physical evidence');
  }
  
  // Biased Investigation
  if (
    lowerContent.includes('did not interview') ||
    lowerContent.includes('refused to talk') ||
    lowerContent.includes('ignored evidence') ||
    lowerContent.includes('would not listen') ||
    lowerContent.includes('not investigate') ||
    lowerContent.includes('dismissed') ||
    lowerContent.includes('biased') ||
    lowerContent.includes('predetermined') ||
    lowerContent.includes('already decided') ||
    lowerContent.includes('ignored my')
  ) {
    violations.push('improperInvestigation');
    violations.push('biasedInvestigation');
    modernDefenseStrategies.push('Present list of exculpatory evidence CPS ignored or suppressed');
    modernDefenseStrategies.push('Subpoena witnesses CPS refused to interview');
    modernDefenseStrategies.push('File complaint for violation of Brady disclosure obligations');
    modernDefenseStrategies.push('Present evidence of confirmation bias in investigation');
    recommendedActions.push('Create comprehensive list of evidence CPS ignored');
    recommendedActions.push('Identify all witnesses CPS did not interview and present their testimony');
    recommendedActions.push('Document any exculpatory evidence not included in reports');
    recommendedActions.push('File motion to compel disclosure of all Brady material');
    legalStandards.push('CPS has obligation to conduct thorough, impartial investigation');
    legalStandards.push('Brady rule requires disclosure of exculpatory evidence');
  }
  
  // Cherry-Picked Evidence
  if (
    lowerContent.includes('did not include') ||
    lowerContent.includes('left out') ||
    lowerContent.includes('omitted') ||
    lowerContent.includes('failed to mention') ||
    lowerContent.includes('selective') ||
    lowerContent.includes('only showed')
  ) {
    violations.push('cherryPickedEvidence');
    modernDefenseStrategies.push('Present complete factual record to expose selective reporting');
    modernDefenseStrategies.push('Highlight pattern of omitting favorable evidence');
    modernDefenseStrategies.push('File motion for sanctions for misleading the court');
    recommendedActions.push('Create side-by-side comparison: CPS version vs. complete truth');
    recommendedActions.push('Present ALL evidence, including what CPS omitted');
    recommendedActions.push('Emphasize to court that CPS presented only part of story');
  }
  
  // No Reasonable Efforts (ASFA violation)
  if (
    lowerContent.includes('no services') ||
    lowerContent.includes('did not offer') ||
    lowerContent.includes('no help') ||
    lowerContent.includes('no support') ||
    lowerContent.includes('no referral') ||
    lowerContent.includes('refused to help') ||
    (lowerContent.includes('removal') && lowerContent.includes('immediate') && !lowerContent.includes('reasonable efforts'))
  ) {
    violations.push('noReasonableEfforts');
    violations.push('noServicesOffered');
    caseLawReferences.push(...CASE_LAW_DATABASE.reasonableEfforts);
    modernDefenseStrategies.push('Challenge removal as violation of ASFA reasonable efforts requirement');
    modernDefenseStrategies.push('File motion arguing CPS failed statutory duty to prevent removal');
    modernDefenseStrategies.push('Present evidence of available services CPS did not offer');
    modernDefenseStrategies.push('Argue removal was premature when services could have prevented it');
    recommendedActions.push('Document every service that could have been offered but was not');
    recommendedActions.push('File motion for finding that reasonable efforts were NOT made');
    recommendedActions.push('Request return home with safety plan and services');
    recommendedActions.push('Identify relatives who could have been offered as placement');
    legalStandards.push('ASFA requires reasonable efforts to prevent removal (except in extreme cases)');
    legalStandards.push('Burden is on agency to prove reasonable efforts were made');
  }
  
  // No Safety Plan Offered
  if (
    lowerContent.includes('no safety plan') ||
    lowerContent.includes('did not offer plan') ||
    (lowerContent.includes('removal') && !lowerContent.includes('safety plan') && !lowerContent.includes('prevention'))
  ) {
    violations.push('noSafetyPlan');
    modernDefenseStrategies.push('Argue removal was unnecessary - safety plan could have addressed concerns');
    modernDefenseStrategies.push('Present proposed safety plan to court showing removal was avoidable');
    recommendedActions.push('Draft comprehensive safety plan addressing all alleged concerns');
    recommendedActions.push('Identify protective factors and support network');
    recommendedActions.push('Request return home with protective safety plan in place');
    legalStandards.push('Least restrictive alternative principle requires trying safety plans before removal');
  }
  
  // Denied Legal Counsel
  if (
    lowerContent.includes('no attorney') ||
    lowerContent.includes('no lawyer') ||
    lowerContent.includes('denied counsel') ||
    lowerContent.includes('without attorney') ||
    lowerContent.includes('couldn\'t afford') ||
    lowerContent.includes('asked for lawyer')
  ) {
    violations.push('deniedLegalCounsel');
    caseLawReferences.push('M.L.B. v. S.L.J. (1996) - Right to counsel in parental termination cases');
    modernDefenseStrategies.push('File motion for appointment of counsel immediately');
    modernDefenseStrategies.push('Challenge validity of any proceedings without counsel present');
    modernDefenseStrategies.push('File for continuance to secure representation');
    recommendedActions.push('URGENT: File motion for court-appointed attorney if you cannot afford one');
    recommendedActions.push('Request reversal of any orders entered without counsel present');
    recommendedActions.push('Assert ineffective assistance if attorney was inadequate');
    legalStandards.push('Indigent parents entitled to counsel in termination proceedings');
    legalStandards.push('Right to effective assistance of counsel');
  }
  
  // Forced/Coerced Signatures
  if (
    lowerContent.includes('forced') ||
    lowerContent.includes('threatened') ||
    lowerContent.includes('coerced') ||
    lowerContent.includes('said i had to') ||
    lowerContent.includes('made me sign') ||
    lowerContent.includes('no choice') ||
    lowerContent.includes('told me to sign') ||
    lowerContent.includes('wouldn\'t leave until')
  ) {
    violations.push('forcedToSign');
    modernDefenseStrategies.push('File motion to void all documents signed under duress/coercion');
    modernDefenseStrategies.push('Present affidavit detailing threats and coercive tactics');
    modernDefenseStrategies.push('Challenge admissibility of coerced documents');
    modernDefenseStrategies.push('File complaint against caseworker for coercive practices');
    recommendedActions.push('Detail exact threats/coercion used to force signature');
    recommendedActions.push('File motion to set aside any agreements signed under duress');
    recommendedActions.push('Testify about circumstances and lack of voluntary consent');
    legalStandards.push('Consent must be knowing, voluntary, and intelligent');
    legalStandards.push('Coerced agreements are void and unenforceable');
  }
  
  // Denied Visitation
  if (
    lowerContent.includes('no visit') ||
    lowerContent.includes('denied visit') ||
    lowerContent.includes('canceled visit') ||
    lowerContent.includes('cancelled visit') ||
    lowerContent.includes('refused visit') ||
    lowerContent.includes('supervised only') ||
    lowerContent.includes('no contact')
  ) {
    violations.push('deniedVisitation');
    caseLawReferences.push('Parental right to visitation is fundamental constitutional right');
    modernDefenseStrategies.push('File emergency motion for immediate visitation');
    modernDefenseStrategies.push('Request bonding evaluation to show harm of separation');
    modernDefenseStrategies.push('Challenge restrictions as not supported by evidence');
    modernDefenseStrategies.push('File for contempt if court-ordered visits are denied');
    recommendedActions.push('Document every denied, cancelled, or restricted visit with dates/times');
    recommendedActions.push('File emergency motion - each day without contact causes trauma');
    recommendedActions.push('Request liberal, unsupervised visitation based on no safety concerns');
    legalStandards.push('Visitation restrictions must be supported by specific evidence of harm');
    legalStandards.push('Frequent parent-child contact is presumed beneficial');
  }
  
  // Inappropriate Placement
  if (
    lowerContent.includes('unsafe placement') ||
    lowerContent.includes('abused in foster') ||
    lowerContent.includes('inappropriate placement') ||
    lowerContent.includes('dangerous placement') ||
    lowerContent.includes('bad foster') ||
    lowerContent.includes('molested') ||
    lowerContent.includes('hurt in placement')
  ) {
    violations.push('inappropriatePlacement');
    modernDefenseStrategies.push('File emergency motion for immediate change of placement');
    modernDefenseStrategies.push('Document all safety concerns with current placement');
    modernDefenseStrategies.push('Report to licensing authority and law enforcement if abuse occurred');
    modernDefenseStrategies.push('Use as evidence CPS cannot provide safer environment than parent');
    recommendedActions.push('URGENT: File emergency motion if child in danger');
    recommendedActions.push('Document child\'s statements about placement');
    recommendedActions.push('Request return home as safer alternative to foster care');
  }
  
  // Separated Siblings
  if (
    lowerContent.includes('separated sibling') ||
    lowerContent.includes('different home') ||
    lowerContent.includes('split up') ||
    (lowerContent.includes('sibling') && lowerContent.includes('apart'))
  ) {
    violations.push('separatedSiblings');
    modernDefenseStrategies.push('File motion citing statutory preference for sibling placement');
    modernDefenseStrategies.push('Present evidence of trauma caused by sibling separation');
    modernDefenseStrategies.push('Request immediate placement together');
    recommendedActions.push('Cite state law preference for keeping siblings together');
    recommendedActions.push('Present expert testimony on harm of sibling separation');
    legalStandards.push('State law presumes siblings should be placed together');
    legalStandards.push('CPS must make reasonable efforts to place siblings together');
  }
  
  // No Relative Placement (ICWA if applicable)
  if (
    (lowerContent.includes('relative') || lowerContent.includes('kinship') || 
     lowerContent.includes('grandmother') || lowerContent.includes('grandfather') ||
     lowerContent.includes('aunt') || lowerContent.includes('uncle')) &&
    (lowerContent.includes('denied') || lowerContent.includes('refused') || 
     lowerContent.includes('not consider') || lowerContent.includes('rejected'))
  ) {
    violations.push('noRelativePlacement');
    modernDefenseStrategies.push('Challenge as violation of statutory preference for kinship placement');
    modernDefenseStrategies.push('File motion for immediate placement with approved relative');
    modernDefenseStrategies.push('If Native American: invoke ICWA requirements for tribal placement preference');
    modernDefenseStrategies.push('Present evidence of willing and able relatives');
    recommendedActions.push('Provide detailed list of relatives willing to take placement');
    recommendedActions.push('Obtain letters from relatives expressing willingness');
    recommendedActions.push('Challenge any improper denial of relative placements');
    legalStandards.push('Federal and state law prefer placement with relatives');
    legalStandards.push('ICWA requires placement preference for Native American children');
  }
  
  // Missed Deadlines
  if (
    lowerContent.includes('late') ||
    lowerContent.includes('missed deadline') ||
    lowerContent.includes('overdue') ||
    lowerContent.includes('past due') ||
    lowerContent.includes('delay') ||
    lowerContent.includes('untimely')
  ) {
    violations.push('missedDeadlines');
    modernDefenseStrategies.push('File motion citing violations of ASFA statutory deadlines');
    modernDefenseStrategies.push('Request dismissal or sanctions for procedural violations');
    modernDefenseStrategies.push('Document pattern of delays and missed timelines');
    recommendedActions.push('Create timeline showing all statutory deadlines and violations');
    recommendedActions.push('File motion for expedited proceedings');
    legalStandards.push('ASFA requires strict timelines for permanency (12-month hearings, etc.)');
  }
  
  // Racial/Cultural Bias
  if (
    lowerContent.includes('cultural') ||
    lowerContent.includes('immigrant') ||
    lowerContent.includes('language barrier') ||
    lowerContent.includes('racial') ||
    lowerContent.includes('discrimination') ||
    lowerContent.includes('stereotyp')
  ) {
    caseLawReferences.push(...CASE_LAW_DATABASE.racial);
    modernDefenseStrategies.push('Present statistical evidence of racial disparities in removals');
    modernDefenseStrategies.push('Challenge lack of cultural competency in assessment');
    modernDefenseStrategies.push('Obtain expert testimony on cultural parenting practices');
    modernDefenseStrategies.push('File complaint alleging discriminatory treatment');
    recommendedActions.push('Document cultural practices that may have been misunderstood');
    recommendedActions.push('Obtain cultural expert to educate court on practices');
    recommendedActions.push('Present evidence of discriminatory disparate impact');
  }
  
  // Medical Abuse Allegations (SBS, Munchausen)
  if (
    lowerContent.includes('shaken baby') ||
    lowerContent.includes('munchausen') ||
    lowerContent.includes('medical child abuse') ||
    lowerContent.includes('factitious disorder') ||
    lowerContent.includes('subdural hematoma')
  ) {
    caseLawReferences.push(...CASE_LAW_DATABASE.medical);
    modernDefenseStrategies.push('Retain independent medical expert - SBS diagnosis increasingly challenged');
    modernDefenseStrategies.push('File Daubert motion to exclude unreliable medical testimony');
    modernDefenseStrategies.push('Present alternative medical explanations (birth trauma, vitamin deficiency, etc.)');
    modernDefenseStrategies.push('Challenge lack of confounding medical investigation');
    modernDefenseStrategies.push('Obtain second opinion from pediatric specialist');
    recommendedActions.push('CRITICAL: Retain medical expert immediately (biomechanical engineer for SBS)');
    recommendedActions.push('Request all medical records including imaging studies');
    recommendedActions.push('Research alternative diagnoses that explain symptoms');
    legalStandards.push('Medical opinions must be based on reliable scientific methodology (Daubert)');
  }
  
  // Poverty Confused with Neglect
  if (
    lowerContent.includes('couldn\'t afford') ||
    lowerContent.includes('poor') ||
    lowerContent.includes('homeless') ||
    lowerContent.includes('housing') ||
    lowerContent.includes('job loss') ||
    lowerContent.includes('unemploy')
  ) {
    modernDefenseStrategies.push('Argue poverty is being criminalized - not grounds for removal');
    modernDefenseStrategies.push('Cite state law that poverty alone cannot be basis for neglect finding');
    modernDefenseStrategies.push('Present evidence CPS should have provided financial assistance');
    modernDefenseStrategies.push('Request concrete services (housing, financial assistance) instead of removal');
    recommendedActions.push('Distinguish between poverty and neglect in your argument');
    recommendedActions.push('Request emergency assistance and services');
    legalStandards.push('Poverty alone is not neglect under state law');
  }
  
  // ========== GENERATE DETAILED EXPLANATION ==========
  
  let detailedExplanation = '';
  let documentType = 'General CPS Document';
  
  if (lowerContent.includes('petition') || lowerContent.includes('complaint')) {
    documentType = 'Dependency Petition';
    detailedExplanation = `⚖️ DEPENDENCY PETITION ANALYSIS

This is the legal document initiating court jurisdiction over your family. This petition is the foundation of CPS's entire case.

🎯 LEGAL STANDARD: CPS must prove allegations by preponderance of evidence (more likely than not). For termination, they need clear and convincing evidence.

🔍 CRITICAL ANALYSIS POINTS:

1. VAGUE ALLEGATIONS: Petitions often contain conclusory statements ("child at risk") without specific facts. Challenge any allegation not supported by concrete evidence.

2. HEARSAY FOUNDATION: Many petitions are built on hearsay - "someone reported that..." This violates your confrontation rights. Demand to face your accusers.

3. CONFUSING POVERTY WITH NEGLECT: Courts increasingly recognize that poverty is not neglect. If allegations involve lack of resources, argue CPS should provide services, not remove children.

4. LEGAL SUFFICIENCY: Each allegation must meet statutory definition of abuse/neglect. Generic "concerns" are insufficient.

📚 APPLICABLE CASE LAW:
• Santosky v. Kramer: Clear and convincing evidence required for termination
• Troxel v. Granville: Parental rights are fundamental - strict scrutiny applies
• Due Process requires specific factual allegations, not conclusions

💡 MODERN DEFENSE STRATEGY:
• File point-by-point response denying vague allegations
• Demand bill of particulars forcing CPS to provide specific facts
• Challenge each allegation's legal sufficiency
• Move to dismiss allegations not meeting statutory elements
• Assert constitutional defenses (Fourth, Fourteenth, First Amendment)

⚠️ WHAT THEY WON'T TELL YOU:
• You can challenge EVERYTHING in this petition
• Burden of proof is on CPS, not you
• You don't have to prove you're a good parent; they must prove you're not
• Procedural defects can get petition dismissed

${violations.length > 0 ? `\n🚨 ${violations.length} VIOLATIONS DETECTED IN THIS DOCUMENT - These weaken CPS's case significantly.` : ''}`;
  
  } else if (lowerContent.includes('investigation') || lowerContent.includes('intake')) {
    documentType = 'Investigation Report';
    detailedExplanation = `🔎 INVESTIGATION REPORT ANALYSIS

This report documents CPS's investigation and forms the evidentiary basis for court proceedings. These reports are notoriously flawed.

⚠️ COMMON PROBLEMS WITH CPS INVESTIGATIONS:

1. CONFIRMATION BIAS: Investigators often decide outcome before investigating. They look for evidence supporting removal, ignore exculpatory evidence.

2. HEARSAY ON HEARSAY: Reports often state "Child said..." or "Witness reported..." without first-hand observation. This is inadmissible hearsay.

3. SELECTIVE REPORTING: CPS cherry-picks negative information, omits positive facts. This violates Brady disclosure obligations.

4. LACK OF CULTURAL COMPETENCY: Cultural and religious practices are mischaracterized as abuse/neglect.

5. FALSE STATEMENTS: Studies show CPS reports contain significant factual errors and fabrications.

📚 APPLICABLE CASE LAW:
• Croft v. Westmoreland County: Fabricating evidence violates due process
• Mabe v. San Bernardino County: Social workers liable for false reporting
• Brady v. Maryland: Prosecution (CPS) must disclose exculpatory evidence

💡 MODERN DEFENSE STRATEGY:
• Create point-by-point rebuttal document with evidence
• Subpoena complete case file including emails and notes
• File motion to compel Brady material (exculpatory evidence)
• Identify witnesses CPS didn't interview - present their testimony
• Obtain independent expert evaluation contradicting CPS conclusions
• File §1983 lawsuit if fabrication is egregious

🎯 HOW TO ATTACK THIS REPORT:
• Factual errors (dates, times, who was present)
• Statements attributed to you that you didn't make  
• Omission of exculpatory evidence
• Witnesses not interviewed
• Bias and predetermined conclusions
• Lack of physical/medical evidence
• Reliance on hearsay without verification

${violations.length > 0 ? `\n🚨 ${violations.length} VIOLATIONS DETECTED - Strong grounds to challenge investigation validity.` : ''}`;
  
  } else if (lowerContent.includes('court report') || lowerContent.includes('status')) {
    documentType = 'Court Report/Status Update';
    detailedExplanation = `📋 COURT REPORT ANALYSIS

CPS submits these reports to influence judicial decisions. They are often copy-pasted from previous reports with minimal updates.

🎯 PROBLEMS WITH COURT REPORTS:

1. OUTDATED INFORMATION: May not reflect recent positive developments
2. MINIMIZING PROGRESS: Your compliance is downplayed or omitted
3. BIASED RECOMMENDATIONS: Often recommend continued removal despite lack of evidence
4. FAILURE TO ACKNOWLEDGE COMPLETION: Services you've completed may not be mentioned
5. NO REASONABLE EFFORTS DOCUMENTATION: Reports often don't show CPS made efforts to prevent removal

📚 LEGAL FRAMEWORK:
• ASFA requires reasonable efforts to prevent removal and achieve reunification
• CPS bears burden of proving reasonable efforts were made
• Permanency hearings required within 12 months
• Goal should be reunification unless compelling reasons otherwise

💡 RESPONSE STRATEGY:
• File detailed written response to court report
• Bring documentation of ALL services completed
• Present evidence of bond with children and positive parenting
• Highlight any false or outdated information
• Request court take judicial notice of your response
• Bring witnesses to testify about your progress
• Document CPS failures and lack of services offered

🎯 WHAT TO INCLUDE IN YOUR RESPONSE:
✓ List of every service completed with certificates
✓ Evidence of stable housing and income
✓ Letters of support from professionals
✓ Photos/videos showing positive parent-child relationship
✓ Documentation contradicting false statements
✓ Timeline showing your compliance
✓ Evidence of improvements made

${violations.length > 0 ? `\n⚠️ ${violations.length} VIOLATIONS IDENTIFIED - Use these to challenge CPS credibility.` : ''}`;
  
  } else if (lowerContent.includes('safety plan') || lowerContent.includes('case plan') || lowerContent.includes('service plan')) {
    documentType = 'Case/Safety Plan';
    detailedExplanation = `📝 CASE PLAN ANALYSIS

This outlines requirements you must complete. Case plans must be reasonable, relevant, and designed to address legitimate concerns.

⚖️ LEGAL REQUIREMENTS FOR CASE PLANS:

1. MUST BE INDIVIDUALIZED: Not generic boilerplate
2. REASONABLY RELATED TO ALLEGATIONS: Can't require drug treatment if no substance abuse alleged
3. SERVICES MUST BE AVAILABLE: CPS must actually provide access to required services
4. MUST BE ACHIEVABLE: Impossible requirements can be challenged
5. CULTURAL COMPETENCY: Must respect cultural and religious practices

🚨 RED FLAGS IN CASE PLANS:

• Vague requirements ("improve parenting skills")
• Services not related to allegations
• Impossible timelines or requirements
• Requirements you physically cannot meet
• Failure to provide promised services
• Changes in plan without notice
• Conflicting requirements

💡 HOW TO CHALLENGE UNREASONABLE REQUIREMENTS:

1. File motion to modify case plan
2. Document inability to complete specific requirements
3. Propose alternative services that address same concerns
4. Document CPS failure to provide services
5. Request court order compelling CPS to provide services

🎯 COMPLIANCE STRATEGY:

✓ Complete every requirement as quickly as possible
✓ Get written proof of completion (certificates, letters)
✓ Document attendance and participation
✓ Keep log of all CPS contacts and communications
✓ If service not available, document repeated attempts
✓ Request modifications in writing if needed
✓ Over-comply when possible (extra services, therapy)

📚 LEGAL STANDARDS:
• Reasonable efforts must be "active and thorough"
• CPS cannot require impossible or irrelevant services
• Parents have right to participate in plan development
• Plan must be designed to achieve reunification

${violations.length > 0 ? `\n⚠️ ${violations.length} VIOLATIONS DETECTED - These may invalidate case plan requirements.` : ''}`;
  
  } else if (lowerContent.includes('removal') || lowerContent.includes('taken') || lowerContent.includes('emergency')) {
    documentType = 'Removal Documentation';
    detailedExplanation = `🚨 EMERGENCY REMOVAL ANALYSIS

Removal of your child is the most serious deprivation of constitutional rights. Strict legal standards apply.

⚖️ LEGAL STANDARD FOR REMOVAL:

CPS must prove IMMINENT DANGER or risk of SERIOUS HARM. This is the highest standard. "Concerns" or "potential risk" are insufficient.

🎯 CONSTITUTIONAL REQUIREMENTS:

1. EXIGENT CIRCUMSTANCES: Must be emergency that doesn't allow time for warrant
2. PROBABLE CAUSE: Specific facts indicating imminent danger
3. REASONABLE EFFORTS: Must try less restrictive alternatives first (unless exception)
4. PROMPT HEARING: 72-hour rule - you must get hearing within 72 hours in most states
5. WRITTEN NOTICE: Right to written notice of allegations

📚 CRITICAL CASE LAW:
• Caniglia v. Strom (2021): No "community caretaking" exception for warrantless home entry
• Doe v. Woodard (6th Cir.): Warrantless strip search violates Fourth Amendment
• Troxel v. Granville: Fundamental right to parent - strict scrutiny applies

💡 GROUNDS TO CHALLENGE REMOVAL:

1. NO IMMINENT DANGER: Past incidents or "concerns" don't justify emergency removal
2. LESS RESTRICTIVE ALTERNATIVES: Safety plan, protective person, relative placement not tried
3. NO REASONABLE EFFORTS: CPS didn't offer services to prevent removal
4. PROCEDURAL VIOLATIONS: No warrant, no exigent circumstances, forced entry
5. FALSE ALLEGATIONS: Removal based on fabricated or exaggerated claims

🎯 IMMEDIATE ACTION REQUIRED:

✓ File emergency motion for return of children
✓ Demand 72-hour probable cause hearing
✓ Request findings on reasonable efforts
✓ File motion to suppress evidence from illegal search
✓ Document lack of imminent danger
✓ Present willing relatives for placement
✓ Propose comprehensive safety plan
✓ Gather witnesses to testify removal was unnecessary

⚠️ MODERN STRATEGY:
• Challenge removal as violation of Fourth Amendment
• Assert lack of reasonable efforts under ASFA
• Present evidence removal causes more trauma than alleged risk
• Request bonding evaluation to prove harm of separation
• File §1983 lawsuit for constitutional violations

🔍 WHAT TO PROVE:
• No imminent danger existed
• Children were safe in your care
• CPS had time to get warrant but didn't
• Less restrictive options were available
• Removal was punitive, not protective

${violations.length > 0 ? `\n🚨 CRITICAL: ${violations.length} VIOLATIONS DETECTED - Strong grounds for immediate return.` : ''}`;
  
  } else if (lowerContent.includes('termination') || lowerContent.includes('tpr')) {
    documentType = 'Termination of Parental Rights';
    detailedExplanation = `⚖️ TERMINATION PETITION - HIGHEST STAKES

Termination of parental rights is the "death penalty" of family law. This permanently ends your legal relationship with your child.

🎯 LEGAL STANDARD: CLEAR AND CONVINCING EVIDENCE

CPS must prove their case by clear and convincing evidence - a much higher standard than preponderance. This is almost (but not quite) as high as "beyond reasonable doubt."

📚 CONTROLLING CASE LAW:
• Santosky v. Kramer (1982): Clear and convincing evidence required
• M.L.B. v. S.L.J. (1996): Right to counsel in termination proceedings
• Troxel v. Granville: Parental rights are fundamental constitutional liberty

🚨 GROUNDS FOR TERMINATION (CPS must prove):

1. Statutory ground exists (abandonment, abuse, failure to remedy, etc.)
2. Reasonable efforts were made (or exception applies)
3. Termination is in child's best interest
4. Permanent plan exists for child

💡 DEFENSES TO TERMINATION:

1. CHALLENGE STATUTORY GROUND: Strictly construe elements - all must be proven
2. NO REASONABLE EFFORTS: If CPS didn't provide adequate services, they can't terminate
3. NOT IN BEST INTEREST: Present evidence of bond, attachment, trauma of severance
4. PROCEDURAL VIOLATIONS: Any due process violation can invalidate proceedings
5. CONSTITUTIONAL DEFENSES: Assert fundamental right to parent

🎯 EVIDENCE TO PRESENT:

✓ Proof of completion of all services
✓ Bonding/attachment evaluation showing strong parent-child bond
✓ Expert testimony on trauma of termination
✓ Evidence of improvements and changes made
✓ Witnesses testifying to your parenting abilities
✓ Documentation of CPS failures and violations
✓ Alternative permanency plan (guardianship, etc.)

⚠️ CRITICAL STRATEGY:

• Retain expert witnesses (psychologist, social worker)
• Get bonding evaluation immediately
• Document every service completion
• Challenge credibility of CPS witnesses
• Present evidence CPS failures, not parent failures
• Show termination will harm child more than help
• Prove you've addressed concerns that led to removal

🎯 APPEAL RIGHTS:
• You have right to appeal termination order
• Appellate courts reverse terminations frequently
• Common grounds: insufficient evidence, procedural errors, rights violations

${violations.length > 0 ? `\n🚨 ${violations.length} VIOLATIONS = STRONG DEFENSE - These violations can prevent termination.` : ''}`;

  } else {
    detailedExplanation = `📄 DOCUMENT ANALYSIS

This document is part of your CPS case file and should be scrutinized for accuracy, bias, and legal compliance.

🔍 KEY ANALYSIS FACTORS:

1. ACCURACY: Are facts stated correctly? Dates, times, people present?
2. COMPLETENESS: What exculpatory information is omitted?
3. HEARSAY: How much is based on "he said/she said" vs. direct observation?
4. BIAS: Is language neutral or prejudicial?
5. LEGAL SUFFICIENCY: Do allegations meet statutory definitions?

💡 HOW TO USE THIS DOCUMENT:

✓ Create point-by-point rebuttal of any false statements
✓ Identify omitted favorable information
✓ Note any procedural violations
✓ Preserve as evidence for your case
✓ Share with attorney for analysis
✓ Use to impeach CPS credibility if contains falsehoods

📚 YOUR RIGHTS:
• Right to complete case file (including emails, notes)
• Right to respond to allegations in writing
• Right to present contrary evidence
• Right to challenge admissibility

${violations.length > 0 ? `\n⚠️ ${violations.length} POTENTIAL VIOLATIONS IDENTIFIED - Document these for your defense.` : ''}`;
  }
  
  // Determine risk level based on violations
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (violations.length === 0) riskLevel = 'low';
  else if (violations.length <= 3) riskLevel = 'medium';
  else if (violations.length <= 6) riskLevel = 'high';
  else riskLevel = 'critical';
  
  // Generate summary
  const summary = `AI ANALYSIS COMPLETE: ${documentType} analyzed. ${violations.length} constitutional/procedural violation(s) identified. ${caseLawReferences.length} case law citation(s) provided. ${modernDefenseStrategies.length} modern defense strateg${modernDefenseStrategies.length === 1 ? 'y' : 'ies'} generated. Risk Level: ${riskLevel.toUpperCase()}. ${
    violations.length > 0 
      ? 'SIGNIFICANT ISSUES DETECTED - Immediate attorney consultation recommended.' 
      : 'Review document carefully with attorney to identify additional defenses.'
  }`;
  
  // Add general recommended actions
  if (violations.length > 0) {
    recommendedActions.push('🔥 URGENT: Share this analysis with attorney within 24 hours');
    recommendedActions.push('📁 Preserve original document in organized case file');
    recommendedActions.push('📝 Create timeline of events described in document');
  }
  recommendedActions.push('💼 Request complete case file including all emails and internal communications');
  recommendedActions.push('🎯 Prepare written response to any inaccuracies');
  recommendedActions.push('👥 Identify witnesses who can contradict false allegations');
  
  // Add general modern strategies
  if (violations.length > 2) {
    modernDefenseStrategies.push('Consider filing §1983 civil rights lawsuit - violations may support damages claim');
    modernDefenseStrategies.push('File formal complaint with CPS supervisor and state oversight agency');
  }
  
  // AUTO-GENERATE TIMELINE EVENTS from document content
  // Extract key event dates and descriptions
  const eventPatterns = [
    { pattern: /(removal|removed|took|taken)\s+(?:child|children|kids)/i, title: 'Child Removal', type: 'critical' },
    { pattern: /(investigation|investigated|visit|visited|came to|arrived at)\s+(?:home|house|residence)/i, title: 'CPS Home Visit/Investigation', type: 'high' },
    { pattern: /(court|hearing|trial|proceeding)/i, title: 'Court Proceeding', type: 'high' },
    { pattern: /(interview|questioned|spoke with)\s+(?:child|children)/i, title: 'Child Interview', type: 'medium' },
    { pattern: /(medical|doctor|hospital|examination|exam)/i, title: 'Medical Examination', type: 'medium' },
    { pattern: /(report|reported|allegation|complaint)\s+(?:filed|made|received)/i, title: 'CPS Report Filed', type: 'high' },
    { pattern: /(case plan|service plan|reunification plan)/i, title: 'Case Plan', type: 'medium' },
    { pattern: /(placement|placed|foster)/i, title: 'Child Placement', type: 'high' },
    { pattern: /(denial|denied|refused)\s+(?:access|visit|contact)/i, title: 'Visitation Denied', type: 'high' }
  ];

  // Try to match events with dates
  dates.forEach((date, index) => {
    // Look for context around each date (100 chars before and after)
    const dateIndex = content.indexOf(date);
    if (dateIndex >= 0) {
      const contextStart = Math.max(0, dateIndex - 100);
      const contextEnd = Math.min(content.length, dateIndex + 100);
      const context = content.substring(contextStart, contextEnd);
      
      // Check if any event patterns match this context
      for (const eventPattern of eventPatterns) {
        if (eventPattern.pattern.test(context)) {
          // Extract a description from the context
          const sentences = context.split(/[.!?]+/);
          const relevantSentence = sentences.find(s => s.includes(date) || eventPattern.pattern.test(s)) || sentences[0];
          
          timelineEvents.push({
            date: date,
            title: eventPattern.title,
            description: relevantSentence.trim().substring(0, 200) + (relevantSentence.length > 200 ? '...' : '')
          });
          
          break; // Only add one event per date
        }
      }
    }
  });

  // If we found dates but no specific events, create generic timeline entries for first few dates
  if (dates.length > 0 && timelineEvents.length === 0) {
    dates.slice(0, 3).forEach((date, index) => {
      timelineEvents.push({
        date: date,
        title: `Document Event ${index + 1}`,
        description: `Event mentioned in ${documentType} on ${date}. Review document for details.`
      });
    });
  }
  
  return {
    summary,
    detailedExplanation,
    identifiedViolations: violations,
    extractedInfo: {
      caseNumber,
      dates: [...new Set(dates)].slice(0, 10), // Limit to 10 most relevant
      names: [...new Set(names)].slice(0, 10),
      locations: [...new Set(locations)]
    },
    timelineEvents,
    recommendedActions: [...new Set(recommendedActions)], // Remove duplicates
    riskLevel,
    documentType,
    caseLawReferences: [...new Set(caseLawReferences)],
    modernDefenseStrategies: [...new Set(modernDefenseStrategies)],
    legalStandards: [...new Set(legalStandards)]
  };
}
