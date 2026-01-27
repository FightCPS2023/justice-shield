/**
 * EVIDENCE & ARGUMENT CONSTRUCTION ENGINE
 * 
 * Evidence quality scoring, multi-layered argument construction,
 * and sophisticated legal reasoning synthesis.
 */

// ============================================================================
// EVIDENCE QUALITY SCORING
// ============================================================================

export interface EvidenceScore {
  overallScore: number; // 0-100
  category: 'excellent' | 'strong' | 'adequate' | 'weak' | 'insufficient';
  components: {
    relevance: number;
    reliability: number;
    admissibility: number;
    persuasiveness: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  admissibilityIssues: Array<{
    issue: string;
    rule: string;
    howToFix: string;
  }>;
}

/**
 * Score evidence quality comprehensively
 */
export function scoreEvidence(evidence: {
  type: 'documentary' | 'testimony' | 'physical' | 'expert' | 'demonstrative';
  source: string;
  content: string;
  authentication: 'authenticated' | 'needs_authentication' | 'self-authenticating';
  hearsay: boolean;
  hearsayException?: string;
  chain_of_custody: boolean;
  expert_qualified: boolean;
  bias_issues: boolean;
  corroboration: 'strong' | 'some' | 'none';
}): EvidenceScore {
  let relevance = 50;
  let reliability = 50;
  let admissibility = 50;
  let persuasiveness = 50;
  let completeness = 50;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];
  const admissibilityIssues: Array<any> = [];
  
  // RELEVANCE SCORING
  if (evidence.type === 'documentary') {
    relevance += 20;
    strengths.push('Documentary evidence is generally highly relevant');
  }
  
  if (evidence.type === 'expert') {
    relevance += 25;
    strengths.push('Expert testimony provides specialized knowledge');
  }
  
  // RELIABILITY SCORING
  if (evidence.authentication === 'authenticated') {
    reliability += 20;
    admissibility += 20;
    strengths.push('Evidence is properly authenticated');
  } else if (evidence.authentication === 'needs_authentication') {
    reliability -= 15;
    admissibility -= 20;
    weaknesses.push('Evidence lacks proper authentication');
    improvements.push('Obtain authentication from author/witness');
    admissibilityIssues.push({
      issue: 'Authentication Required',
      rule: 'FRE 901 - Evidence must be authenticated before admission',
      howToFix: 'Obtain declaration from author or witness with personal knowledge'
    });
  }
  
  if (evidence.hearsay && !evidence.hearsayException) {
    reliability -= 25;
    admissibility -= 40;
    weaknesses.push('Hearsay without exception - likely inadmissible');
    improvements.push('Identify hearsay exception or obtain direct testimony');
    admissibilityIssues.push({
      issue: 'Hearsay Without Exception',
      rule: 'FRE 802 - Hearsay is not admissible unless exception applies',
      howToFix: 'Identify applicable exception (e.g., business records, excited utterance, present sense impression) or obtain in-person testimony'
    });
  } else if (evidence.hearsay && evidence.hearsayException) {
    reliability += 10;
    admissibility += 15;
    strengths.push(`Hearsay exception available: ${evidence.hearsayException}`);
  }
  
  if (evidence.type === 'physical' && !evidence.chain_of_custody) {
    reliability -= 20;
    admissibility -= 25;
    weaknesses.push('Chain of custody issues');
    improvements.push('Establish complete chain of custody');
    admissibilityIssues.push({
      issue: 'Chain of Custody Gap',
      rule: 'FRE 901 - Physical evidence must have continuous chain of custody',
      howToFix: 'Obtain declarations from each person who handled evidence documenting custody transfer'
    });
  }
  
  if (evidence.type === 'expert' && !evidence.expert_qualified) {
    reliability -= 30;
    admissibility -= 35;
    weaknesses.push('Expert qualifications questionable');
    improvements.push('Establish expert qualifications under Daubert/Frye standard');
    admissibilityIssues.push({
      issue: 'Expert Qualification',
      rule: 'FRE 702 / Daubert - Expert must be qualified and testimony must be reliable',
      howToFix: 'Establish expert education, training, experience; show methodology is sound and reliable'
    });
  } else if (evidence.type === 'expert' && evidence.expert_qualified) {
    reliability += 25;
    admissibility += 30;
    persuasiveness += 20;
    strengths.push('Qualified expert adds significant weight');
  }
  
  if (evidence.bias_issues) {
    reliability -= 15;
    persuasiveness -= 20;
    weaknesses.push('Source has bias or credibility issues');
    improvements.push('Corroborate with independent evidence');
  }
  
  // CORROBORATION
  if (evidence.corroboration === 'strong') {
    reliability += 20;
    persuasiveness += 25;
    strengths.push('Strong corroborating evidence available');
  } else if (evidence.corroboration === 'none') {
    reliability -= 10;
    persuasiveness -= 15;
    weaknesses.push('No corroboration - stands alone');
    improvements.push('Seek corroborating evidence from independent sources');
  }
  
  // COMPLETENESS
  if (evidence.content.length > 500) {
    completeness += 20;
    strengths.push('Evidence is detailed and comprehensive');
  } else if (evidence.content.length < 100) {
    completeness -= 20;
    weaknesses.push('Evidence is sparse - lacks detail');
    improvements.push('Obtain more complete documentation');
  }
  
  // Normalize scores
  relevance = Math.min(Math.max(relevance, 0), 100);
  reliability = Math.min(Math.max(reliability, 0), 100);
  admissibility = Math.min(Math.max(admissibility, 0), 100);
  persuasiveness = Math.min(Math.max(persuasiveness, 0), 100);
  completeness = Math.min(Math.max(completeness, 0), 100);
  
  const overallScore = Math.round(
    (relevance * 0.25) +
    (reliability * 0.25) +
    (admissibility * 0.25) +
    (persuasiveness * 0.15) +
    (completeness * 0.10)
  );
  
  const category: 'excellent' | 'strong' | 'adequate' | 'weak' | 'insufficient' =
    overallScore >= 85 ? 'excellent' :
    overallScore >= 70 ? 'strong' :
    overallScore >= 55 ? 'adequate' :
    overallScore >= 40 ? 'weak' :
    'insufficient';
  
  return {
    overallScore,
    category,
    components: {
      relevance,
      reliability,
      admissibility,
      persuasiveness,
      completeness
    },
    strengths,
    weaknesses,
    improvements,
    admissibilityIssues
  };
}

// ============================================================================
// ARGUMENT CONSTRUCTION
// ============================================================================

export interface LegalArgument {
  thesis: string;
  layers: ArgumentLayer[];
  structure: 'IRAC' | 'CRAC' | 'CREAC' | 'TREAT';
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak';
  anticipatedCounterarguments: string[];
  rebuttals: string[];
  caseLawSupport: Array<{
    citation: string;
    holding: string;
    application: string;
    weight: 'binding' | 'persuasive';
  }>;
  recommended presentation: string;
}

export interface ArgumentLayer {
  level: number;
  type: 'constitutional' | 'statutory' | 'precedent' | 'policy' | 'factual';
  argument: string;
  support: string[];
  weaknesses: string[];
}

/**
 * Construct sophisticated multi-layered legal argument
 */
export function constructArgument(params: {
  claim: string;
  facts: string[];
  legalBasis: string[];
  caseLaw: string[];
  jurisdiction: string;
  goalOutcome: string;
}): LegalArgument {
  // Build argument layers from strongest to weakest
  const layers: ArgumentLayer[] = [];
  
  // Layer 1: Constitutional (if applicable)
  if (params.legalBasis.some(b => b.includes('Amendment') || b.includes('constitutional'))) {
    layers.push({
      level: 1,
      type: 'constitutional',
      argument: 'This violates fundamental constitutional rights protected by the U.S. Constitution',
      support: [
        'Fourth Amendment protects against unreasonable searches and seizures',
        'Fourteenth Amendment protects fundamental parental rights',
        'Strict scrutiny applies when fundamental rights are at issue',
        'Government must prove compelling interest AND least restrictive means'
      ],
      weaknesses: [
        'Must show state actor (not issue for CPS)',
        'Must show clearly established law for § 1983 (but Calabretta clearly established warrantless entry)'
      ]
    });
  }
  
  // Layer 2: Statutory
  if (params.legalBasis.some(b => b.includes('ASFA') || b.includes('statute') || b.includes('U.S.C.'))) {
    layers.push({
      level: 2,
      type: 'statutory',
      argument: 'CPS violated federal statutory requirements',
      support: [
        'ASFA mandates reasonable efforts to prevent removal (42 U.S.C. § 671(a)(15))',
        'State must comply with federal law to receive federal funding',
        'Reasonable efforts required both pre-removal and post-removal',
        'Courts must make specific findings on reasonable efforts'
      ],
      weaknesses: [
        'Reasonable efforts requirement has exceptions',
        'Definition of "reasonable" is somewhat flexible'
      ]
    });
  }
  
  // Layer 3: Precedent
  if (params.caseLaw.length > 0) {
    layers.push({
      level: 3,
      type: 'precedent',
      argument: 'Controlling precedent requires ruling in our favor',
      support: params.caseLaw.map(c => `Cite: ${c}`),
      weaknesses: [
        'Opposing counsel may distinguish cases',
        'Different factual circumstances'
      ]
    });
  }
  
  // Layer 4: Policy
  layers.push({
    level: 4,
    type: 'policy',
    argument: 'Policy considerations favor reunification',
    support: [
      'Children do best with biological parents when safe',
      'Foster care is traumatic for children',
      'State should use least intrusive means',
      'Preserving families is societal interest'
    ],
    weaknesses: [
      'Policy arguments less powerful than legal arguments',
      'Child safety is paramount policy'
    ]
  });
  
  // Layer 5: Factual
  layers.push({
    level: 5,
    type: 'factual',
    argument: 'The facts support our position',
    support: params.facts,
    weaknesses: [
      'CPS may dispute facts',
      'Need admissible evidence to prove facts'
    ]
  });
  
  // Anticipate counterarguments
  const counterarguments = [
    'CPS acted in good faith based on information available',
    'Child safety required immediate action',
    'Parent has history of issues',
    'More time needed to ensure sustained change',
    'Child has bonded with foster family'
  ];
  
  // Prepare rebuttals
  const rebuttals = [
    'Good faith does not excuse constitutional violations (qualified immunity defeated if clearly established law)',
    'Exigent circumstances require immediate threat - not present here',
    'Past issues do not justify current violation of rights',
    'ASFA timelines must be respected - reasonable efforts required',
    'Bonding argument fails - parental rights are fundamental (Troxel v. Granville)'
  ];
  
  // Assess argument strength
  const strength: 'very_strong' | 'strong' | 'moderate' | 'weak' = 
    layers.length >= 4 && params.caseLaw.length >= 2 ? 'very_strong' :
    layers.length >= 3 && params.caseLaw.length >= 1 ? 'strong' :
    layers.length >= 2 ? 'moderate' :
    'weak';
  
  return {
    thesis: params.claim,
    layers,
    structure: 'CREAC', // Conclusion, Rule, Explanation, Application, Conclusion
    strength,
    anticipatedCounterarguments: counterarguments,
    rebuttals,
    caseLawSupport: [], // Would be populated from case law database
    recommendedPresentation: generatePresentationStrategy(layers, strength)
  };
}

function generatePresentationStrategy(layers: ArgumentLayer[], strength: string): string {
  let strategy = '**RECOMMENDED PRESENTATION STRATEGY**\n\n';
  
  strategy += '1. **Opening**: Lead with strongest argument (';
  strategy += layers[0]?.type === 'constitutional' ? 'constitutional violation' : 'strongest legal ground';
  strategy += ')\n\n';
  
  strategy += '2. **Build Layers**: Present arguments in order of strength:\n';
  layers.forEach((layer, idx) => {
    strategy += `   ${idx + 1}. ${layer.type.toUpperCase()}: ${layer.argument}\n`;
  });
  
  strategy += '\n3. **Anticipate Opposition**: Address counterarguments preemptively\n\n';
  
  strategy += '4. **Close Strong**: Return to constitutional argument and cite binding precedent\n\n';
  
  strategy += '5. **Tone**: Professional, confident, cite-heavy. Let the law do the work.\n\n';
  
  if (strength === 'very_strong' || strength === 'strong') {
    strategy += '**ASSESSMENT**: Strong multi-layered argument with solid legal foundation. Present confidently and demand relief.\n';
  } else {
    strategy += '**ASSESSMENT**: Argument has weaknesses. Consider settlement or alternative strategies.\n';
  }
  
  return strategy;
}

// ============================================================================
// IRAC/CREAC GENERATOR
// ============================================================================

export interface IRACAnalysis {
  issue: string;
  rule: string;
  application: string;
  conclusion: string;
  fullText: string;
}

/**
 * Generate IRAC analysis automatically
 */
export function generateIRAC(params: {
  issue: string;
  relevantLaw: string[];
  facts: string[];
  desiredConclusion: string;
}): IRACAnalysis {
  const issue = `**ISSUE**\n\n${params.issue}`;
  
  const rule = `**RULE**\n\n${params.relevantLaw.join('\n\n')}`;
  
  let application = `**APPLICATION**\n\n`;
  application += `Here, ${params.facts[0]}\n\n`;
  params.facts.slice(1).forEach(fact => {
    application += `Additionally, ${fact}\n\n`;
  });
  application += `Under the applicable legal standard, `;
  
  const conclusion = `**CONCLUSION**\n\n${params.desiredConclusion}`;
  
  const fullText = `${issue}\n\n${rule}\n\n${application}\n\n${conclusion}`;
  
  return {
    issue: params.issue,
    rule: params.relevantLaw.join(' '),
    application: params.facts.join(' '),
    conclusion: params.desiredConclusion,
    fullText
  };
}

// ============================================================================
// BRIEF STRUCTURE GENERATOR
// ============================================================================

export interface BriefOutline {
  caption: string;
  introduction: string;
  statementOfFacts: string[];
  legalArgument: {
    pointHeadings: string[];
    subpoints: string[][];
  };
  conclusion: string;
  prayerForRelief: string[];
  estimatedLength: number;
}

/**
 * Generate professional brief structure
 */
export function generateBriefOutline(params: {
  motionType: string;
  jurisdiction: string;
  party: 'petitioner' | 'respondent';
  keyArguments: string[];
  relief: string[];
}): BriefOutline {
  const caption = generateCaption(params.motionType, params.jurisdiction);
  
  const introduction = `This ${params.motionType} is brought to [primary purpose]. As demonstrated below, [key thesis]. The Court should grant this motion and [desired relief].`;
  
  const statementOfFacts = [
    'On [date], CPS initiated an investigation',
    'CPS entered the home without [warrant/consent/exigency]',
    '[Parent] has consistently [complied/cooperated/sought services]',
    'The children have been in foster care for [duration]',
    'Despite [reasonable efforts/compliance], reunification has been delayed'
  ];
  
  const pointHeadings = params.keyArguments.map((arg, idx) => 
    `${toRomanNumeral(idx + 1)}. ${arg.toUpperCase()}`
  );
  
  const subpoints = params.keyArguments.map(() => [
    'A. Constitutional Framework',
    'B. Application to These Facts',
    'C. Supporting Case Law',
    'D. Conclusion'
  ]);
  
  const conclusion = `For the foregoing reasons, this Court should grant this ${params.motionType} and order the relief requested below.`;
  
  const estimatedLength = Math.max(10, params.keyArguments.length * 3) + 5;
  
  return {
    caption,
    introduction,
    statementOfFacts,
    legalArgument: {
      pointHeadings,
      subpoints
    },
    conclusion,
    prayerForRelief: params.relief,
    estimatedLength
  };
}

function generateCaption(motionType: string, jurisdiction: string): string {
  return `IN THE [SUPERIOR/CIRCUIT] COURT\n${jurisdiction.toUpperCase()}\n\nIn re: [CHILD NAME]\nCase No.: [CASE NUMBER]\n\n${motionType.toUpperCase()}`;
}

function toRomanNumeral(num: number): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return numerals[num - 1] || num.toString();
}

// ============================================================================
// CROSS-EXAMINATION QUESTION GENERATOR
// ============================================================================

export interface CrossExamQuestion {
  category: 'foundation' | 'impeachment' | 'prior_inconsistent' | 'bias' | 'knowledge_limits';
  question: string;
  expectedAnswer: string;
  followUp: string[];
  purpose: string;
}

/**
 * Generate strategic cross-examination questions
 */
export function generateCrossExam(params: {
  witness: 'cps_worker' | 'expert' | 'foster_parent' | 'other';
  knownWeaknesses: string[];
  priorStatements: string[];
  documents: string[];
}): CrossExamQuestion[] {
  const questions: CrossExamQuestion[] = [];
  
  // Foundation questions
  questions.push({
    category: 'foundation',
    question: 'You\'ve worked for CPS for how long?',
    expectedAnswer: '[X] years',
    followUp: [
      'And in those [X] years, how many investigations have you conducted?',
      'Of those investigations, how many resulted in unfounded allegations?',
      'So you\'re aware that not all allegations are accurate, correct?'
    ],
    purpose: 'Establish that worker knows investigations can be wrong'
  });
  
  // Prior inconsistent statements
  if (params.priorStatements.length > 0) {
    params.priorStatements.forEach((statement, idx) => {
      questions.push({
        category: 'prior_inconsistent',
        question: `In your report dated [date], you stated [statement]. Did you write that?`,
        expectedAnswer: 'Yes',
        followUp: [
          'But today you testified [different statement]. Which is correct?',
          'Were you lying then, or are you lying now?',
          'Or were you just careless in your documentation?'
        ],
        purpose: 'Impeach with prior inconsistent statement'
      });
    });
  }
  
  // Knowledge limits
  questions.push({
    category: 'knowledge_limits',
    question: 'You never actually witnessed the alleged incident, did you?',
    expectedAnswer: 'No',
    followUp: [
      'So everything you know is based on what others told you?',
      'You didn\'t verify those statements independently, did you?',
      'You don\'t actually know if they were telling the truth, do you?'
    ],
    purpose: 'Show lack of personal knowledge - everything is hearsay'
  });
  
  // Bias
  if (params.witness === 'cps_worker') {
    questions.push({
      category: 'bias',
      question: 'You get paid whether or not you find abuse, correct?',
      expectedAnswer: 'Yes',
      followUp: [
        'But your job security depends on appearing to protect children, correct?',
        'And you\'re aware CPS has been criticized for removing children unnecessarily?',
        'So you have an incentive to err on the side of removal, don\'t you?'
      ],
      purpose: 'Establish institutional bias toward removal'
    });
  }
  
  // Constitutional violations
  if (params.knownWeaknesses.includes('warrantless entry')) {
    questions.push({
      category: 'impeachment',
      question: 'You didn\'t have a search warrant when you entered the home, did you?',
      expectedAnswer: 'No',
      followUp: [
        'You didn\'t have consent to enter, did you?',
        'And there wasn\'t an immediate emergency, was there?',
        'You\'re aware the Constitution requires a warrant or exigent circumstances, aren\'t you?',
        'But you entered anyway, correct?'
      ],
      purpose: 'Establish Fourth Amendment violation conclusively'
    });
  }
  
  return questions;
}

// ============================================================================
// PERSUASIVE WRITING ENHANCER
// ============================================================================

/**
 * Enhance legal writing for maximum persuasiveness
 */
export function enhancePersuasiveness(text: string): {
  enhanced: string;
  improvements: string[];
  powerWords: string[];
} {
  let enhanced = text;
  const improvements: string[] = [];
  
  // Replace weak phrases with strong phrases
  const replacements: Record<string, string> = {
    'it appears that': 'the evidence establishes that',
    'it seems': 'the record demonstrates',
    'might': 'will',
    'could': 'can',
    'perhaps': 'clearly',
    'maybe': 'undoubtedly',
    'we think': 'the facts compel the conclusion',
    'in our opinion': 'the law requires',
    'we believe': 'the evidence proves'
  };
  
  Object.entries(replacements).forEach(([weak, strong]) => {
    if (enhanced.toLowerCase().includes(weak)) {
      enhanced = enhanced.replace(new RegExp(weak, 'gi'), strong);
      improvements.push(`Strengthened: "${weak}" → "${strong}"`);
    }
  });
  
  const powerWords = [
    'clearly', 'undoubtedly', 'compelling', 'conclusive',
    'established', 'demonstrated', 'proven', 'mandates',
    'requires', 'fundamental', 'constitutional', 'controlling'
  ];
  
  return {
    enhanced,
    improvements,
    powerWords
  };
}
