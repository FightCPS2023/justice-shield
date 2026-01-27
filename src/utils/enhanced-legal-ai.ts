/**
 * Enhanced Legal AI - Integrates Knowledge Base with AI Prompts
 * 
 * This module creates LEGALLY SAVVY AI prompts by injecting
 * real case law, statutes, and legal reasoning into every analysis.
 */

import {
  SUPREME_COURT_CASES,
  CIRCUIT_COURT_CASES,
  FEDERAL_STATUTES,
  CONSTITUTIONAL_RIGHTS,
  COMMON_VIOLATIONS,
  LEGAL_TESTS,
  findRelevantCaseLaw
} from './legal-knowledge-base';

import {
  analyzeFourthAmendmentViolation,
  analyzeSubstantiveDueProcess,
  analyzeProceduralDueProcess,
  analyzeReasonableEfforts,
  analyzeSection1983Claim,
  performComprehensiveAnalysis
} from './legal-reasoning-engine';

import {
  getRemovalLawsForState,
  getAdjudicationLawsForState,
  getTerminationLawsForState,
  analyzeStateLawCompliance
} from './jurisdiction-specific-laws';

import { UserTier } from './ai-prompts';

/**
 * Generate legally sophisticated AI prompt with real case law
 */
export function generateLegallySavvyPrompt(params: {
  tier: UserTier;
  taskType: 'document_analysis' | 'violation_check' | 'strategy' | 'legal_question';
  userInput: string;
  caseContext?: {
    state?: string;
    violations?: string[];
    documentType?: string;
    timeline?: any[];
  };
}): string {
  const { tier, taskType, userInput, caseContext } = params;

  // Build legal context based on case information
  const legalContext = buildLegalContext(caseContext);

  // Create tier-specific base prompt
  const basePrompt = tier === 'attorney' 
    ? createAttorneyPrompt(taskType, legalContext)
    : createParentPrompt(taskType, legalContext);

  // Add user input
  const fullPrompt = `${basePrompt}\n\n# USER INPUT\n${userInput}\n\n# YOUR ANALYSIS\nProvide detailed analysis using the legal framework above.`;

  return fullPrompt;
}

/**
 * Build legal context from case information
 */
function buildLegalContext(caseContext?: any): string {
  if (!caseContext) {
    return '';
  }

  let context = '\n# RELEVANT LEGAL FRAMEWORK\n\n';

  // Add state-specific laws if state is known
  if (caseContext.state) {
    const removalLaw = getRemovalLawsForState(caseContext.state);
    const adjudicationLaw = getAdjudicationLawsForState(caseContext.state);
    const terminationLaw = getTerminationLawsForState(caseContext.state);

    if (removalLaw) {
      context += `## ${caseContext.state} Removal Law\n`;
      context += `**Statute:** ${removalLaw.statute}\n`;
      context += `**Standard:** ${removalLaw.standard}\n`;
      context += `**Hearing Timeline:** ${removalLaw.timeForHearing}\n\n`;
    }

    if (adjudicationLaw) {
      context += `## ${caseContext.state} Adjudication Law\n`;
      context += `**Statute:** ${adjudicationLaw.statute}\n`;
      context += `**Standard of Proof:** ${adjudicationLaw.standardOfProof}\n`;
      context += `**Abuse Definition:** ${adjudicationLaw.definitions.abuse}\n`;
      context += `**Neglect Definition:** ${adjudicationLaw.definitions.neglect}\n\n`;
    }

    if (terminationLaw) {
      context += `## ${caseContext.state} Termination Law\n`;
      context += `**Statute:** ${terminationLaw.statute}\n`;
      context += `**Standard of Proof:** ${terminationLaw.standardOfProof}\n`;
      context += `**Grounds:** ${terminationLaw.grounds.join('; ')}\n\n`;
    }
  }

  // Add relevant case law if violations are identified
  if (caseContext.violations && caseContext.violations.length > 0) {
    context += '## Relevant Case Law\n\n';
    
    caseContext.violations.forEach((violation: string) => {
      const relevantCases = findRelevantCaseLaw(violation);
      if (relevantCases.length > 0) {
        context += `### For ${violation}:\n`;
        relevantCases.slice(0, 3).forEach(caseData => {
          context += `\n**${caseData.citation}**\n`;
          context += `*Holding:* ${caseData.holding}\n`;
          context += `*Application:* ${caseData.application}\n`;
          if (caseData.keyQuotes && caseData.keyQuotes.length > 0) {
            context += `*Key Quote:* "${caseData.keyQuotes[0]}"\n`;
          }
        });
        context += '\n';
      }
    });
  }

  // Add constitutional framework
  context += '## Constitutional Framework\n\n';
  context += '**Fourth Amendment:** Right against unreasonable searches and seizures. CPS cannot enter home without warrant, consent, or exigent circumstances. (Calabretta v. Floyd, 189 F.3d 808)\n\n';
  context += '**Fourteenth Amendment - Substantive Due Process:** Parental rights are fundamental. State must have compelling interest and use least restrictive means (strict scrutiny). (Troxel v. Granville, 530 U.S. 57)\n\n';
  context += '**Fourteenth Amendment - Procedural Due Process:** Parents entitled to notice and hearing before or promptly after removal. (Stanley v. Illinois, 405 U.S. 645)\n\n';

  // Add federal statutes
  context += '## Federal Statutes\n\n';
  context += '**ASFA (42 U.S.C. § 671):** Requires reasonable efforts to prevent removal and facilitate reunification; permanency hearing within 12 months; case review every 6 months.\n\n';
  context += '**Santosky v. Kramer:** Clear and convincing evidence required for termination of parental rights (455 U.S. 745).\n\n';

  // Add Section 1983 framework if constitutional violations possible
  if (caseContext.violations?.some((v: string) => 
    v.toLowerCase().includes('fourth amendment') || 
    v.toLowerCase().includes('due process') ||
    v.toLowerCase().includes('warrantless')
  )) {
    context += '## Section 1983 Civil Rights Claims\n\n';
    context += '**42 U.S.C. § 1983:** Allows lawsuit for constitutional violations by state actors.\n';
    context += '**Elements:** (1) Acting under color of state law; (2) Deprivation of constitutional right; (3) Causation.\n';
    context += '**Qualified Immunity:** Defeated if law was clearly established (e.g., warrantless entry, fabricated evidence).\n';
    context += '**Damages:** Compensatory (emotional distress, lost wages) + Punitive (if malicious).\n\n';
  }

  return context;
}

/**
 * Create attorney-specific prompt
 */
function createAttorneyPrompt(taskType: string, legalContext: string): string {
  let prompt = `You are an EXPERT LEGAL RESEARCH ASSISTANT for a licensed attorney practicing CPS defense law.\n\n`;
  prompt += `# YOUR EXPERTISE\n`;
  prompt += `You have deep knowledge of:\n`;
  prompt += `- Constitutional law (4th, 5th, 14th Amendments)\n`;
  prompt += `- CPS statutory law (ASFA, CAPTA, ICWA)\n`;
  prompt += `- Federal civil rights litigation (§ 1983)\n`;
  prompt += `- State-specific CPS procedures\n`;
  prompt += `- Family law case precedents\n`;
  prompt += `- Multi-factor legal tests and standards\n\n`;

  prompt += legalContext;

  switch (taskType) {
    case 'document_analysis':
      prompt += `\n# TASK: PROFESSIONAL DOCUMENT ANALYSIS\n\n`;
      prompt += `Analyze the document with sophisticated legal reasoning:\n\n`;
      prompt += `1. **LEGAL ISSUES IDENTIFICATION**\n`;
      prompt += `   - Spot ALL constitutional violations (cite specific amendments)\n`;
      prompt += `   - Identify statutory violations (cite statutes)\n`;
      prompt += `   - Flag procedural errors (cite rules)\n\n`;
      prompt += `2. **CASE LAW APPLICATION**\n`;
      prompt += `   - Apply relevant Supreme Court precedent\n`;
      prompt += `   - Apply Circuit Court precedent (specify circuit)\n`;
      prompt += `   - Distinguish adverse cases\n`;
      prompt += `   - Quote key language from cases\n\n`;
      prompt += `3. **MULTI-FACTOR ANALYSIS**\n`;
      prompt += `   - Apply Mathews v. Eldridge balancing test for due process\n`;
      prompt += `   - Apply strict scrutiny for fundamental rights\n`;
      prompt += `   - Analyze Fourth Amendment reasonableness (totality of circumstances)\n\n`;
      prompt += `4. **LITIGATION STRATEGY**\n`;
      prompt += `   - Recommend specific motions to file (with legal basis)\n`;
      prompt += `   - Identify discovery targets\n`;
      prompt += `   - Assess Section 1983 viability (elements + QI analysis)\n`;
      prompt += `   - Flag appellate preservation issues\n\n`;
      prompt += `5. **EVIDENTIARY ANALYSIS**\n`;
      prompt += `   - Admissibility under rules of evidence\n`;
      prompt += `   - Hearsay exceptions\n`;
      prompt += `   - Authentication requirements\n`;
      prompt += `   - Expert witness needs\n\n`;
      prompt += `**FORMAT:** Use professional legal memo format with headings, citations, and analysis.\n`;
      break;

    case 'violation_check':
      prompt += `\n# TASK: COMPREHENSIVE VIOLATION ANALYSIS\n\n`;
      prompt += `Conduct multi-layered violation analysis:\n\n`;
      prompt += `1. **CONSTITUTIONAL VIOLATIONS**\n`;
      prompt += `   - Fourth Amendment: Warrantless search/seizure analysis\n`;
      prompt += `   - Fifth Amendment: Self-incrimination issues\n`;
      prompt += `   - Fourteenth Amendment: Substantive + procedural due process\n`;
      prompt += `   - First Amendment: Religious freedom, association\n\n`;
      prompt += `2. **FEDERAL STATUTORY VIOLATIONS**\n`;
      prompt += `   - ASFA reasonable efforts analysis\n`;
      prompt += `   - ICWA compliance (if applicable)\n`;
      prompt += `   - ADA violations (if disability involved)\n\n`;
      prompt += `3. **STATE LAW VIOLATIONS**\n`;
      prompt += `   - Statutory removal requirements\n`;
      prompt += `   - Hearing timeline compliance\n`;
      prompt += `   - Notice requirements\n\n`;
      prompt += `4. **SECTION 1983 ASSESSMENT**\n`;
      prompt += `   For each constitutional violation:\n`;
      prompt += `   - State the clearly established law\n`;
      prompt += `   - Assess qualified immunity\n`;
      prompt += `   - Evaluate municipal liability (Monell)\n`;
      prompt += `   - Estimate damages potential\n\n`;
      prompt += `**CITE SPECIFIC CASES AND STATUTES FOR EACH VIOLATION**\n`;
      break;

    case 'strategy':
      prompt += `\n# TASK: LITIGATION STRATEGY DEVELOPMENT\n\n`;
      prompt += `Develop comprehensive litigation strategy:\n\n`;
      prompt += `1. **IMMEDIATE ACTIONS (1-7 days)**\n`;
      prompt += `   - Emergency motions (specify grounds and legal standard)\n`;
      prompt += `   - Evidence preservation\n`;
      prompt += `   - Protective measures\n\n`;
      prompt += `2. **SHORT-TERM STRATEGY (1-3 months)**\n`;
      prompt += `   - Motion practice roadmap (prioritized)\n`;
      prompt += `   - Discovery plan (specific requests)\n`;
      prompt += `   - Expert retention (type and purpose)\n\n`;
      prompt += `3. **LONG-TERM STRATEGY (3-12 months)**\n`;
      prompt += `   - Trial theory and themes\n`;
      prompt += `   - Appellate preservation\n`;
      prompt += `   - Federal litigation (§ 1983 evaluation)\n\n`;
      prompt += `4. **RISK ANALYSIS**\n`;
      prompt += `   - Strengths (with supporting case law)\n`;
      prompt += `   - Weaknesses (with mitigation strategies)\n`;
      prompt += `   - Opposing counsel's likely arguments\n`;
      prompt += `   - Countermeasures\n\n`;
      prompt += `**Use case law to support each strategic recommendation**\n`;
      break;

    case 'legal_question':
      prompt += `\n# TASK: LEGAL RESEARCH & ANALYSIS\n\n`;
      prompt += `Provide sophisticated legal analysis:\n\n`;
      prompt += `1. **DIRECT ANSWER**\n`;
      prompt += `   - State the legal rule clearly\n`;
      prompt += `   - Cite controlling authority\n\n`;
      prompt += `2. **LEGAL FRAMEWORK**\n`;
      prompt += `   - Constitutional provisions\n`;
      prompt += `   - Applicable statutes\n`;
      prompt += `   - Relevant case law (Supreme Court → Circuit → State)\n\n`;
      prompt += `3. **APPLICATION**\n`;
      prompt += `   - Apply law to the facts\n`;
      prompt += `   - Distinguish unfavorable precedent\n`;
      prompt += `   - Identify strongest arguments\n\n`;
      prompt += `4. **PRACTICE RECOMMENDATIONS**\n`;
      prompt += `   - Specific steps to take\n`;
      prompt += `   - Pitfalls to avoid\n`;
      prompt += `   - Ethical considerations\n\n`;
      break;
  }

  prompt += `\n⚖️ **ATTORNEY RESPONSIBILITY:** This is AI-assisted legal research. You must verify all citations, apply professional judgment, and customize for your jurisdiction and client.\n`;

  return prompt;
}

/**
 * Create parent/individual-specific prompt
 */
function createParentPrompt(taskType: string, legalContext: string): string {
  let prompt = `You are an EDUCATIONAL LEGAL INFORMATION ASSISTANT helping parents understand their CPS case.\n\n`;
  prompt += `# YOUR ROLE\n`;
  prompt += `Provide clear, understandable legal information (NOT legal advice) about:\n`;
  prompt += `- Constitutional rights in CPS cases\n`;
  prompt += `- Federal and state CPS laws\n`;
  prompt += `- Common CPS violations\n`;
  prompt += `- What to discuss with an attorney\n\n`;

  prompt += legalContext;

  switch (taskType) {
    case 'document_analysis':
      prompt += `\n# TASK: DOCUMENT ANALYSIS (Educational)\n\n`;
      prompt += `Help the parent understand this document:\n\n`;
      prompt += `1. **WHAT THIS DOCUMENT MEANS**\n`;
      prompt += `   - Plain language summary\n`;
      prompt += `   - Why this document matters\n`;
      prompt += `   - What happens next\n\n`;
      prompt += `2. **POTENTIAL LEGAL ISSUES**\n`;
      prompt += `   - Rights that might be involved\n`;
      prompt += `   - Possible violations to discuss with attorney\n`;
      prompt += `   - Procedural concerns\n\n`;
      prompt += `3. **QUESTIONS FOR YOUR ATTORNEY**\n`;
      prompt += `   - Specific questions to ask\n`;
      prompt += `   - Information attorney will need\n`;
      prompt += `   - Deadlines to be aware of\n\n`;
      prompt += `4. **NEXT STEPS**\n`;
      prompt += `   - What to document\n`;
      prompt += `   - Evidence to gather\n`;
      prompt += `   - Immediate actions to consider (with attorney guidance)\n\n`;
      break;

    case 'violation_check':
      prompt += `\n# TASK: IDENTIFY POTENTIAL VIOLATIONS (Educational)\n\n`;
      prompt += `Help the parent understand what violations might exist:\n\n`;
      prompt += `1. **CONSTITUTIONAL RIGHTS**\n`;
      prompt += `   - Was there a warrantless home entry? (4th Amendment)\n`;
      prompt += `   - Were you denied a hearing? (Due Process)\n`;
      prompt += `   - Were you forced to answer questions? (5th Amendment)\n\n`;
      prompt += `2. **FEDERAL LAW REQUIREMENTS**\n`;
      prompt += `   - Did CPS make reasonable efforts before removal?\n`;
      prompt += `   - Did you get a hearing within the required time?\n`;
      prompt += `   - Were you offered services?\n\n`;
      prompt += `3. **WHY THESE VIOLATIONS MATTER**\n`;
      prompt += `   - How each violation affects your case\n`;
      prompt += `   - What relief might be available\n`;
      prompt += `   - Why you need an attorney to pursue these\n\n`;
      prompt += `4. **DISCUSSING WITH YOUR ATTORNEY**\n`;
      prompt += `   - Questions to ask about each violation\n`;
      prompt += `   - Evidence your attorney will need\n`;
      prompt += `   - Possible legal actions (motions, appeals, lawsuits)\n\n`;
      break;

    case 'strategy':
      prompt += `\n# TASK: UNDERSTANDING YOUR LEGAL OPTIONS (Educational)\n\n`;
      prompt += `Help the parent understand their options:\n\n`;
      prompt += `1. **YOUR RIGHTS**\n`;
      prompt += `   - Constitutional protections you have\n`;
      prompt += `   - Federal law protections (ASFA)\n`;
      prompt += `   - State law rights\n\n`;
      prompt += `2. **POSSIBLE LEGAL ACTIONS**\n`;
      prompt += `   - Types of motions that might apply (general information)\n`;
      prompt += `   - Appeal rights and timelines\n`;
      prompt += `   - Federal civil rights lawsuits (§ 1983)\n\n`;
      prompt += `3. **WORKING WITH YOUR ATTORNEY**\n`;
      prompt += `   - Questions to ask\n`;
      prompt += `   - Information to provide\n`;
      prompt += `   - How to prepare for hearings\n\n`;
      prompt += `4. **DOCUMENTATION**\n`;
      prompt += `   - What to document and how\n`;
      prompt += `   - Evidence to preserve\n`;
      prompt += `   - Witnesses to identify\n\n`;
      break;

    case 'legal_question':
      prompt += `\n# TASK: ANSWER LEGAL QUESTION (Educational)\n\n`;
      prompt += `Provide educational information:\n\n`;
      prompt += `1. **GENERAL LEGAL INFORMATION**\n`;
      prompt += `   - How this area of law generally works\n`;
      prompt += `   - Relevant rights and protections\n`;
      prompt += `   - Common situations and outcomes\n\n`;
      prompt += `2. **WHAT TO DISCUSS WITH ATTORNEY**\n`;
      prompt += `   - Specific questions to ask\n`;
      prompt += `   - Why attorney advice is crucial here\n`;
      prompt += `   - What information attorney will need\n\n`;
      prompt += `3. **RESOURCES**\n`;
      prompt += `   - Relevant laws and cases (for reference)\n`;
      prompt += `   - What to research\n`;
      prompt += `   - Where to find more information\n\n`;
      break;
  }

  prompt += `\n⚠️ **IMPORTANT DISCLAIMER:** This is educational information only, NOT legal advice. Every case is different. You MUST consult a licensed attorney before taking any legal action.\n`;

  return prompt;
}

/**
 * Enhance document analysis with legal knowledge
 */
export async function analyzeDocumentWithLegalKnowledge(
  documentText: string,
  documentType: string,
  state: string,
  tier: UserTier,
  violations?: string[]
): Promise<string> {
  const prompt = generateLegallySavvyPrompt({
    tier,
    taskType: 'document_analysis',
    userInput: `Document Type: ${documentType}\n\nDocument Content:\n${documentText}`,
    caseContext: {
      state,
      violations,
      documentType
    }
  });

  return prompt; // This would be sent to Gemini API
}

/**
 * Check violations with legal knowledge
 */
export async function checkViolationsWithLegalKnowledge(
  caseDetails: any,
  state: string,
  tier: UserTier
): Promise<string> {
  const prompt = generateLegallySavvyPrompt({
    tier,
    taskType: 'violation_check',
    userInput: JSON.stringify(caseDetails, null, 2),
    caseContext: {
      state,
      violations: caseDetails.violations || []
    }
  });

  return prompt; // This would be sent to Gemini API
}

/**
 * Generate strategy with legal knowledge
 */
export async function generateStrategyWithLegalKnowledge(
  caseDetails: any,
  violations: any[],
  goal: string,
  state: string,
  tier: UserTier
): Promise<string> {
  const prompt = generateLegallySavvyPrompt({
    tier,
    taskType: 'strategy',
    userInput: `Case Details: ${JSON.stringify(caseDetails, null, 2)}\n\nViolations: ${JSON.stringify(violations, null, 2)}\n\nGoal: ${goal}`,
    caseContext: {
      state,
      violations: violations.map(v => v.title || v.type || 'Unknown')
    }
  });

  return prompt; // This would be sent to Gemini API
}

/**
 * Answer legal question with knowledge base
 */
export async function answerLegalQuestionWithKnowledge(
  question: string,
  caseContext: any,
  state: string,
  tier: UserTier
): Promise<string> {
  const prompt = generateLegallySavvyPrompt({
    tier,
    taskType: 'legal_question',
    userInput: `Question: ${question}\n\nCase Context: ${JSON.stringify(caseContext, null, 2)}`,
    caseContext: {
      state,
      violations: caseContext.violations || []
    }
  });

  return prompt; // This would be sent to Gemini API
}
