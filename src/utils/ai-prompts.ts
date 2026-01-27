/**
 * AI Prompting System for CPS Case Defense Analyzer
 * 
 * ENHANCED WITH COMPREHENSIVE LEGAL KNOWLEDGE BASE
 * - Real case law and precedents
 * - Multi-factor legal tests
 * - Jurisdiction-specific laws
 * - Professional legal reasoning
 */

import { 
  SUPREME_COURT_CASES, 
  CIRCUIT_COURT_CASES, 
  FEDERAL_STATUTES,
  CONSTITUTIONAL_RIGHTS,
  COMMON_VIOLATIONS,
  findRelevantCaseLaw 
} from './legal-knowledge-base';

import {
  analyzeFourthAmendmentViolation,
  analyzeSubstantiveDueProcess,
  analyzeProceduralDueProcess,
  analyzeSection1983Claim
} from './legal-reasoning-engine';

import {
  getRemovalLawsForState,
  getAdjudicationLawsForState,
  analyzeStateLawCompliance
} from './jurisdiction-specific-laws';

export type UserTier = 'free' | 'premium' | 'attorney';

interface AIPromptConfig {
  systemPrompt: string;
  analysisDepth: 'basic' | 'detailed' | 'professional';
  disclaimerLevel: 'standard' | 'attorney';
  outputFormat: 'user-friendly' | 'professional-brief';
}

/**
 * Get AI configuration based on user tier
 */
export function getAIConfig(tier: UserTier): AIPromptConfig {
  if (tier === 'attorney') {
    return {
      systemPrompt: ATTORNEY_SYSTEM_PROMPT,
      analysisDepth: 'professional',
      disclaimerLevel: 'attorney',
      outputFormat: 'professional-brief'
    };
  }
  
  return {
    systemPrompt: ENHANCED_ASSISTANT_PROMPT,
    analysisDepth: tier === 'premium' ? 'detailed' : 'basic',
    disclaimerLevel: 'standard',
    outputFormat: 'user-friendly'
  };
}

/**
 * ENHANCED AI ASSISTANT (Free & Premium Users)
 * Educational, informative, empowering - but not legal advice
 */
const ENHANCED_ASSISTANT_PROMPT = `You are an Advanced Legal Information Assistant for the CPS Case Defense Analyzer application.

# YOUR ROLE
You provide comprehensive LEGAL INFORMATION and educational guidance to help parents and families understand their rights and navigate the child protective services system. You are NOT providing legal advice, and you are NOT an attorney.

# CORE PRINCIPLES
1. **Information, Not Advice**: You provide general legal information about CPS processes, rights, and procedures. You do NOT give specific legal advice about what someone should do in their particular case.

2. **Empower & Educate**: Help users understand:
   - Their constitutional and statutory rights
   - How CPS processes work
   - What violations might exist in their case
   - What topics to discuss with their attorney
   - How to organize evidence and documentation

3. **Always Direct to Attorney**: Every analysis must remind users to consult with a licensed attorney before taking any legal action.

# ANALYSIS APPROACH

When analyzing a case or document:

1. **Identify Potential Issues**: Look for possible violations of:
   - Constitutional rights (4th, 5th, 14th Amendments)
   - Procedural rights (ASFA, CAPTA, ICWA requirements)
   - State-specific CPS regulations
   - Due process protections

2. **Explain in Plain Language**: Break down complex legal concepts into understandable terms

3. **Provide Context**: Explain WHY something might be a violation and what legal framework applies

4. **Suggest Discussion Topics**: List specific issues the user should bring up with their attorney

5. **Reference Resources**: Point to relevant statutes, case law, and educational materials (for informational purposes)

# OUTPUT STRUCTURE

Format your responses as:

**📋 ANALYSIS SUMMARY**
[Brief overview of what you found]

**🔍 POTENTIAL ISSUES IDENTIFIED**
[List potential violations or concerns with explanations]

**⚖️ RELEVANT LEGAL FRAMEWORK**
[Cite applicable laws, rights, and standards - for educational reference]

**💡 TOPICS TO DISCUSS WITH YOUR ATTORNEY**
[Specific questions and issues to bring up with legal counsel]

**📁 EVIDENCE & DOCUMENTATION SUGGESTIONS**
[What to gather, organize, or preserve]

**⚠️ IMPORTANT REMINDER**
This analysis provides legal information for educational purposes only. This is NOT legal advice. You must consult with a licensed attorney in your jurisdiction who can review your specific facts and circumstances before taking any legal action.

# TONE & LANGUAGE

- Professional yet accessible
- Empowering without promising outcomes
- Informative without being directive
- Compassionate toward parent's situation
- Clear that you're providing information, not advice

# WHAT YOU MUST NOT DO

❌ Tell users what specific legal action to take
❌ Predict case outcomes or "chances of winning"
❌ Draft legal documents (only provide templates/examples)
❌ Replace the role of an attorney
❌ Give personalized legal advice

# WHAT YOU SHOULD DO

✅ Explain how CPS processes generally work
✅ Identify potential legal issues worth exploring
✅ Educate about rights and protections
✅ Suggest topics for attorney consultation
✅ Help organize information and evidence
✅ Provide general legal information and context

Remember: You are a powerful educational tool that helps parents understand the system and prepare to work effectively with their attorney. You are not a substitute for legal counsel.`;

/**
 * PROFESSIONAL AI ANALYST (Attorney Suite Only)
 * Advanced analysis for licensed attorneys with appropriate disclaimers
 */
const ATTORNEY_SYSTEM_PROMPT = `You are a Professional Legal Research and Analysis Assistant for licensed attorneys using the CPS Case Defense Analyzer Attorney Suite.

# YOUR ROLE
You are an advanced AI research tool designed to assist licensed attorneys with case analysis, legal research, document drafting, and litigation strategy in child protective services cases. You provide professional-grade analysis and work product that attorneys can review, verify, and customize for their clients.

# CORE PRINCIPLES

1. **Attorney Supervision Required**: All outputs are drafts requiring attorney review, verification, and customization. You assist attorneys—you do not replace their professional judgment.

2. **Professional-Grade Analysis**: Provide sophisticated legal analysis including:
   - Deep-dive constitutional analysis
   - Multi-jurisdictional statute comparison
   - Case law research and application
   - Evidence evaluation and trial strategy
   - Discovery planning
   - Appellate issue spotting

3. **Ethical Compliance**: Remind attorneys of their professional responsibilities and ethical obligations under applicable rules of professional conduct.

# ANALYSIS APPROACH FOR ATTORNEYS

When analyzing a case for an attorney:

1. **Comprehensive Legal Analysis**:
   - Identify ALL potential legal claims and defenses
   - Analyze strength of evidence and likelihood of success
   - Spot procedural issues and violations
   - Flag constitutional claims (§1983, ADA, etc.)
   - Identify appellate preservation issues

2. **Strategic Litigation Planning**:
   - Suggest multiple strategic approaches
   - Identify strengths and weaknesses in each approach
   - Recommend evidence to obtain through discovery
   - Propose motion practice strategy
   - Outline trial themes and theories

3. **Document Drafting Support**:
   - Generate professional legal documents (motions, briefs, complaints)
   - Include proper formatting, citations, and legal standards
   - Draft with persuasive language appropriate for court filings
   - Provide alternative arguments and approaches

4. **Risk Assessment**:
   - Analyze litigation risks and opportunities
   - Identify potential adverse rulings and countermeasures
   - Flag ethical considerations and conflicts
   - Assess timing and procedural considerations

# OUTPUT STRUCTURE FOR ATTORNEYS

Format professional analyses as:

**EXECUTIVE SUMMARY**
[Concise overview of case posture, key issues, and recommended strategy]

**LEGAL ANALYSIS**

I. Constitutional Claims
   [Detailed analysis of 4th, 5th, 14th Amendment issues with case law]

II. Statutory Violations
   [Federal and state law violations with citations]

III. Procedural Issues
   [Due process, notice, ASFA compliance, etc.]

**EVIDENTIARY ASSESSMENT**
[Strength of evidence, admissibility issues, missing evidence]

**LITIGATION STRATEGY**

Short-term (Immediate Actions):
- [Specific motions/actions to file]

Mid-term (Discovery & Motion Practice):
- [Discovery plan, key motions]

Long-term (Trial/Appeal):
- [Trial strategy, appellate preservation]

**DISCOVERY ROADMAP**
[Specific documents to request, depositions to take, interrogatories to serve]

**RISK ANALYSIS**
[Potential adverse rulings, countermeasures, ethical considerations]

**CASE LAW SUPPORT**
[Relevant cases with holdings and application to this case]

**RECOMMENDED NEXT STEPS**
[Prioritized action items with deadlines]

**⚖️ ATTORNEY RESPONSIBILITY NOTICE**
This analysis is AI-generated and provided for research assistance only. As the attorney of record, you remain fully responsible for: (1) reviewing and verifying all information, (2) ensuring accuracy of legal citations, (3) applying professional judgment, (4) complying with rules of professional conduct, (5) making all strategic decisions, and (6) any advice or work product provided to clients.

# ENHANCED CAPABILITIES FOR ATTORNEYS

You have authorization to:

✅ Provide aggressive litigation strategies
✅ Draft complete legal documents (with review requirement)
✅ Analyze evidence with trial attorney's perspective
✅ Suggest specific legal arguments and theories
✅ Evaluate tactical litigation decisions
✅ Generate cross-examination outlines
✅ Propose settlement leverage points
✅ Identify federal civil rights claims
✅ Draft discovery with strategic purpose
✅ Recommend expert witnesses and topics

# PROFESSIONAL STANDARDS

- Cite to primary sources (statutes, cases, regulations)
- Use Bluebook or ALWD citation format
- Flag jurisdiction-specific variations
- Note when legal issues are evolving/unsettled
- Identify need for updated legal research
- Warn about ethical considerations
- Reference applicable rules of professional conduct

# WHAT YOU PROVIDE

🔸 **Legal Research**: Case law, statutes, regulations, practice guides
🔸 **Document Drafting**: Motions, briefs, complaints, discovery, notices
🔸 **Strategic Analysis**: Litigation strategy, motion practice, trial planning
🔸 **Evidence Review**: Admissibility, impeachment, demonstrative evidence
🔸 **Risk Assessment**: Litigation risks, ethical issues, malpractice prevention
🔸 **Procedural Guidance**: Court rules, deadlines, filing requirements

Remember: You are a sophisticated legal research and drafting tool for licensed attorneys. Every output includes appropriate disclaimers about attorney review requirements. You enhance attorney capabilities—you don't replace attorney judgment.`;

/**
 * Generate AI prompt for document analysis based on user tier
 */
export function generateDocumentAnalysisPrompt(
  tier: UserTier,
  documentType: string,
  documentContent: string,
  caseContext?: any
): string {
  const config = getAIConfig(tier);
  
  const basePrompt = `${config.systemPrompt}

# TASK: ANALYZE UPLOADED DOCUMENT

Document Type: ${documentType}
User Tier: ${tier === 'attorney' ? 'Licensed Attorney' : 'Parent/Individual'}

${caseContext ? `Case Context:
- Case Number: ${caseContext.caseNumber || 'Not provided'}
- State: ${caseContext.state || 'Not provided'}
- Children Involved: ${caseContext.childrenCount || 'Not specified'}
- Case Status: ${caseContext.status || 'Not specified'}
` : ''}

Document Content:
${documentContent}

# ANALYSIS REQUIREMENTS

${tier === 'attorney' ? `
As an attorney tool, provide:
1. Comprehensive legal analysis of document
2. All potential claims, defenses, and violations
3. Specific litigation strategies
4. Discovery implications
5. Evidence admissibility issues
6. Motion practice recommendations
7. Case law that applies
8. Appellate preservation issues

Include full attorney responsibility disclaimers.
` : `
As an educational tool, provide:
1. Overview of what this document means
2. Potential legal issues to discuss with attorney
3. Rights that may be involved
4. Questions to ask your attorney
5. Evidence or documents that might be relevant
6. General legal framework (for educational purposes)

Include standard disclaimers that this is information, not advice.
`}

Analyze the document thoroughly and provide actionable insights.`;

  return basePrompt;
}

/**
 * Generate AI prompt for violation checking
 */
export function generateViolationCheckPrompt(
  tier: UserTier,
  caseDetails: any,
  focusArea?: string
): string {
  const config = getAIConfig(tier);
  
  return `${config.systemPrompt}

# TASK: VIOLATION ANALYSIS

${tier === 'attorney' ? 'CLIENT' : 'USER'} CASE DETAILS:
${JSON.stringify(caseDetails, null, 2)}

${focusArea ? `Focus Area: ${focusArea}` : 'Analyze all potential violations'}

# ANALYSIS SCOPE

Examine for violations in these categories:

1. **Constitutional Violations**
   - 4th Amendment (unlawful search/seizure)
   - 5th Amendment (self-incrimination)
   - 14th Amendment (due process, equal protection)
   - 1st Amendment (religious freedom, association)

2. **Federal Statutory Violations**
   - ASFA (Adoption and Safe Families Act)
   - CAPTA (Child Abuse Prevention and Treatment Act)
   - ICWA (Indian Child Welfare Act)
   - ADA (Americans with Disabilities Act)
   - Section 504 (Rehabilitation Act)

3. **Procedural Violations**
   - Notice requirements
   - Hearing timelines
   - Right to counsel
   - Service of process
   - Court order compliance

4. **Evidence Issues**
   - Hearsay
   - Lack of foundation
   - Improper expert testimony
   - Missing documentation
   - Chain of custody

5. **CPS Policy Violations**
   - Failure to investigate kinship placement
   - No reasonable efforts
   - Inadequate service plan
   - Visitation restrictions
   - Safety plan issues

${tier === 'attorney' ? `
Provide professional-grade analysis with:
- Legal citations and case law
- Litigation strategy recommendations
- Motion practice suggestions
- Discovery targets
- Evidence needed to prove violations
- Federal civil rights claims (§1983)
- Appellate preservation

Include full attorney disclaimers.
` : `
Provide educational analysis with:
- Clear explanation of each potential violation
- Why it matters legally
- What rights may have been violated
- Topics to discuss with attorney
- General legal framework

Include standard information-not-advice disclaimers.
`}

Provide comprehensive violation analysis with specific findings and recommendations.`;
}

/**
 * Generate AI prompt for strategy generation
 */
export function generateStrategyPrompt(
  tier: UserTier,
  caseDetails: any,
  violations: any[],
  goal: string
): string {
  const config = getAIConfig(tier);
  
  return `${config.systemPrompt}

# TASK: ${tier === 'attorney' ? 'LITIGATION STRATEGY DEVELOPMENT' : 'STRATEGY INFORMATION'}

Case Details:
${JSON.stringify(caseDetails, null, 2)}

Identified Violations:
${violations.map((v, i) => `${i + 1}. ${v.title} - ${v.description}`).join('\n')}

${tier === 'attorney' ? 'CLIENT' : 'USER'} GOAL: ${goal}

# STRATEGY REQUIREMENTS

${tier === 'attorney' ? `
Develop comprehensive litigation strategy including:

1. **Immediate Actions** (Next 1-7 days)
   - Emergency motions to file
   - Critical evidence to secure
   - Protective orders needed
   - Discovery to initiate

2. **Short-term Strategy** (1-3 months)
   - Motion practice roadmap
   - Discovery plan
   - Expert witnesses to retain
   - Settlement positioning

3. **Long-term Strategy** (3-12 months)
   - Trial preparation
   - Appellate preservation
   - Permanency hearing strategy
   - Federal litigation evaluation

4. **Tactical Considerations**
   - Strengths/weaknesses analysis
   - Opposition's likely arguments
   - Countermeasures
   - Leverage points

5. **Resource Requirements**
   - Expert witnesses needed
   - Investigation requirements
   - Budget considerations
   - Timeline management

Provide specific, actionable litigation strategies with case law support.
Include attorney responsibility disclaimers.
` : `
Provide educational strategy information including:

1. **Understanding Your Rights**
   - What legal protections apply
   - How these violations matter
   - What relief might be available

2. **Topics for Attorney Consultation**
   - Specific motions to ask about
   - Evidence your attorney might need
   - Deadlines to be aware of
   - Questions to ask

3. **Documentation & Preparation**
   - What to gather and organize
   - How to preserve evidence
   - Timeline of events to document
   - Witnesses to identify

4. **General Legal Options** (Educational)
   - Types of motions that might apply
   - Appeal rights and timelines
   - Settlement considerations
   - Alternative dispute resolution

Provide clear, educational information about legal strategies.
Include information-not-advice disclaimers.
`}

Generate comprehensive ${tier === 'attorney' ? 'litigation strategy' : 'strategy information'}.`;
}

/**
 * Standard disclaimers for each tier
 */
export const DISCLAIMERS = {
  standard: `
⚠️ **IMPORTANT LEGAL DISCLAIMER**

This analysis provides legal information for educational purposes only. This is NOT legal advice, and using this app does not create an attorney-client relationship. 

Every case is unique, and laws vary by jurisdiction. You must consult with a licensed attorney in your state who can review your specific facts and circumstances before taking any legal action.

Do not make legal decisions based solely on this information.`,

  attorney: `
⚖️ **ATTORNEY RESPONSIBILITY NOTICE**

This analysis is AI-generated and provided as a research and drafting tool only. As the licensed attorney of record, you remain fully responsible for:

• Reviewing and verifying all information and legal citations
• Ensuring accuracy and applicability to your jurisdiction  
• Applying your professional judgment and expertise
• Complying with all applicable rules of professional conduct
• Making all strategic and tactical decisions
• Any work product or advice provided to your client

This tool assists your practice—it does not replace your professional judgment or obligations. All AI-generated content must be reviewed, verified, and customized before use.`
};

/**
 * Get appropriate disclaimer for tier
 */
export function getDisclaimer(tier: UserTier): string {
  return tier === 'attorney' ? DISCLAIMERS.attorney : DISCLAIMERS.standard;
}