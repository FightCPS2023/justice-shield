/**
 * GENIUS AI INTEGRATION
 * 
 * Master integration layer that enhances ALL existing components
 * with predictive analytics, pattern recognition, strategic intelligence,
 * and evidence scoring capabilities.
 */

import { analyzeDocument, type AnalysisResult } from './documentAnalyzer';
import { generateText } from './gemini-api';
import { generateLegallySavvyPrompt } from './enhanced-legal-ai';

// Import all genius AI engines
import {
  predictOutcome,
  findSimilarCases,
  predictMotionSuccess,
  assessRisks,
  type CaseFactors,
  type OutcomePrediction,
  type SimilarCase,
  type MotionPrediction,
  type RiskAssessment
} from './predictive-analytics-engine';

import {
  detectContradictions,
  identifyPatterns,
  extractEntities,
  analyzeCrossDocument,
  type Contradiction,
  type Pattern,
  type ExtractedEntity,
  type CrossDocumentInsight
} from './pattern-recognition-engine';

import {
  analyzeGameTheory,
  predictOpponentBehavior,
  analyzeJudge,
  generateDecisionTree,
  identifyLeverage,
  calculateSettlementValue,
  type GameTheoryAnalysis,
  type OpponentProfile,
  type JudgeProfile,
  type StrategicDecision,
  type LeveragePoint,
  type SettlementValue
} from './strategic-intelligence-engine';

import {
  scoreEvidence,
  constructArgument,
  generateIRAC,
  generateBriefOutline,
  generateCrossExam,
  enhancePersuasiveness,
  type EvidenceScore,
  type LegalArgument,
  type IRACAnalysis,
  type BriefOutline,
  type CrossExamQuestion
} from './evidence-argument-engine';

// ============================================================================
// ENHANCED DOCUMENT ANALYSIS
// ============================================================================

export interface GeniusDocumentAnalysis extends AnalysisResult {
  // Add genius AI enhancements
  contradictions: Contradiction[];
  patterns: Pattern[];
  entities: ExtractedEntity[];
  evidenceScore: EvidenceScore;
  predictedImpact: {
    strengthensCase: boolean;
    score: number; // 0-100
    reasoning: string;
  };
}

/**
 * Analyze document with FULL GENIUS AI capabilities
 */
export async function analyzeDocumentWithGeniusAI(params: {
  documentContent: string;
  documentTitle: string;
  documentType: string;
  documentDate?: Date;
  allDocuments?: Array<{
    name: string;
    type: string;
    content: string;
    date?: Date;
  }>;
  caseContext?: {
    state?: string;
    violations?: string[];
    timeline?: any[];
  };
  userTier: 'free' | 'premium' | 'attorney';
}): Promise<GeniusDocumentAnalysis> {
  const {
    documentContent,
    documentTitle,
    documentType,
    documentDate,
    allDocuments,
    caseContext,
    userTier
  } = params;

  // Step 1: Basic analysis (existing)
  const basicAnalysis = analyzeDocument(documentContent, documentTitle);

  // Step 2: Pattern recognition on THIS document
  const currentDoc = {
    name: documentTitle,
    type: documentType,
    content: documentContent,
    date: documentDate
  };

  const entities = extractEntities([currentDoc]);
  
  // Step 3: Cross-document analysis if other docs available
  let contradictions: Contradiction[] = [];
  let patterns: Pattern[] = [];
  let crossInsights: CrossDocumentInsight[] = [];

  if (allDocuments && allDocuments.length > 0) {
    const allDocs = [...allDocuments, currentDoc];
    contradictions = detectContradictions(allDocs);
    patterns = identifyPatterns(allDocs);
    crossInsights = analyzeCrossDocument(allDocs);
  }

  // Step 4: Evidence quality scoring
  const evidenceScore = scoreEvidence({
    type: 'documentary',
    source: documentTitle,
    content: documentContent,
    authentication: 'needs_authentication',
    hearsay: documentContent.toLowerCase().includes('told') || 
             documentContent.toLowerCase().includes('said') ||
             documentContent.toLowerCase().includes('reported'),
    hearsayException: undefined,
    chain_of_custody: documentType.toLowerCase().includes('medical') ||
                      documentType.toLowerCase().includes('lab'),
    expert_qualified: documentType.toLowerCase().includes('expert') ||
                      documentType.toLowerCase().includes('medical'),
    bias_issues: documentType.toLowerCase().includes('cps') ||
                 documentType.toLowerCase().includes('investigation'),
    corroboration: allDocuments && allDocuments.length > 2 ? 'some' : 'none'
  });

  // Step 5: Predict impact on case
  const predictedImpact = assessDocumentImpact(
    basicAnalysis,
    evidenceScore,
    contradictions,
    patterns
  );

  // Step 6: Generate AI-enhanced analysis with Gemini (if attorney tier)
  if (userTier === 'attorney' && caseContext) {
    const prompt = generateLegallySavvyPrompt({
      tier: userTier,
      taskType: 'document_analysis',
      userInput: `Document: ${documentTitle}\nType: ${documentType}\n\nContent:\n${documentContent}`,
      caseContext: {
        state: caseContext.state,
        violations: caseContext.violations,
        documentType: documentType
      }
    });

    // Enhanced analysis (would be sent to Gemini in production)
    // const aiAnalysis = await generateText(prompt);
  }

  return {
    ...basicAnalysis,
    contradictions,
    patterns,
    entities,
    evidenceScore,
    predictedImpact
  };
}

function assessDocumentImpact(
  analysis: AnalysisResult,
  evidenceScore: EvidenceScore,
  contradictions: Contradiction[],
  patterns: Pattern[]
): { strengthensCase: boolean; score: number; reasoning: string } {
  let score = 50; // Start neutral
  const reasons: string[] = [];

  // Evidence quality impact
  if (evidenceScore.overallScore > 70) {
    score += 20;
    reasons.push('High-quality evidence (admissible and reliable)');
  } else if (evidenceScore.overallScore < 40) {
    score -= 15;
    reasons.push('Weak evidence (admissibility issues)');
  }

  // Violations help parent
  if (analysis.identifiedViolations.length > 0) {
    score += 15 * analysis.identifiedViolations.length;
    reasons.push(`${analysis.identifiedViolations.length} violations identified`);
  }

  // Contradictions help parent (CPS credibility damaged)
  const criticalContradictions = contradictions.filter(c => c.severity === 'critical');
  if (criticalContradictions.length > 0) {
    score += 25;
    reasons.push(`${criticalContradictions.length} critical contradictions found`);
  }

  // Bias patterns help parent
  const biasPatterns = patterns.filter(p => p.type === 'bias');
  if (biasPatterns.length > 0) {
    score += 15;
    reasons.push('CPS bias patterns detected');
  }

  // Normalize
  score = Math.min(Math.max(score, 0), 100);

  return {
    strengthensCase: score > 50,
    score,
    reasoning: reasons.join('; ')
  };
}

// ============================================================================
// ENHANCED CASE PREDICTION
// ============================================================================

/**
 * Predict case outcome using genius AI
 */
export function predictCaseOutcome(params: {
  state: string;
  violations: string[];
  documents: any[];
  timeline: any[];
  childrenCount: number;
  childAge: number;
  hasAttorney: boolean;
  caseplanCompliance: 'full' | 'partial' | 'none';
  removalDuration: number; // days
  servicesProvided: boolean;
}): OutcomePrediction {
  const caseFactors: CaseFactors = {
    state: params.state,
    childAge: params.childAge,
    numberOfChildren: params.childrenCount,
    parentMaritalStatus: 'single', // Would get from user profile
    
    allegationType: ['neglect'], // Would extract from documents
    substanceAbuse: false,
    domesticViolence: false,
    mentalHealth: false,
    poverty: true,
    
    hadAttorney: params.hasAttorney,
    warrantlessEntry: params.violations.includes('fourthAmendment'),
    inadequateInvestigation: params.violations.includes('improperInvestigation'),
    noReasonableEfforts: params.violations.includes('noReasonableEfforts'),
    missedHearingDeadlines: params.violations.includes('missedDeadlines'),
    
    medicalEvidence: 'none',
    witnessStatements: params.documents.length,
    photosVideos: false,
    expertTestimony: false,
    
    removalDuration: params.removalDuration,
    visitationRestricted: false,
    servicesProvided: params.servicesProvided,
    caseplanCompliance: params.caseplanCompliance,
    
    constitutionalViolations: params.violations.filter(v => 
      v.includes('Amendment') || v.includes('constitutional')
    ),
    statutoryViolations: params.violations.filter(v => 
      v.includes('ASFA') || v.includes('statutory')
    )
  };

  return predictOutcome(caseFactors);
}

// ============================================================================
// ENHANCED VIOLATION ANALYSIS
// ============================================================================

export interface GeniusViolationAnalysis {
  violations: string[];
  similarCases: SimilarCase[];
  risks: RiskAssessment;
  recommendedStrategy: GameTheoryAnalysis;
  section1983Viable: boolean;
  settlementValue: SettlementValue | null;
  leveragePoints: LeveragePoint[];
}

/**
 * Analyze violations with strategic intelligence
 */
export function analyzeViolationsWithGenius(params: {
  violations: string[];
  caseFactors: Partial<CaseFactors>;
  hasConstitutionalViolations: boolean;
  state: string;
}): GeniusViolationAnalysis {
  // Find similar cases
  const similarCases = findSimilarCases(params.caseFactors as CaseFactors);

  // Risk assessment
  const risks = assessRisks(params.caseFactors as CaseFactors);

  // Game theory strategy
  const strategy = analyzeGameTheory({
    currentPosition: params.hasConstitutionalViolations 
      ? "Constitutional violations identified"
      : "Case ongoing",
    yourGoals: ['reunification', 'damages'],
    opponentGoals: ['avoid liability', 'maintain removal'],
    availableActions: [
      'File motion to suppress',
      'File Section 1983 lawsuit',
      'Negotiate settlement',
      'Comply with case plan'
    ],
    constraints: [],
    timeframe: '6 months'
  });

  // Leverage analysis
  const leverage = identifyLeverage({
    hasConstitutionalViolations: params.hasConstitutionalViolations,
    hasProceduralViolations: params.violations.some(v => 
      v.includes('procedural') || v.includes('notice') || v.includes('deadline')
    ),
    publicInterest: false,
    financialResources: 'medium',
    caseQuality: params.hasConstitutionalViolations ? 'strong' : 'medium'
  });

  // Settlement value (if Section 1983 viable)
  let settlementValue: SettlementValue | null = null;
  if (params.hasConstitutionalViolations) {
    settlementValue = calculateSettlementValue({
      violations: params.violations,
      daysInFosterCare: (params.caseFactors.removalDuration || 0),
      emotionalDistress: 'severe',
      economicDamages: 10000,
      punitiveFeasible: true,
      defendantType: 'county'
    });
  }

  return {
    violations: params.violations,
    similarCases: similarCases.slice(0, 3), // Top 3
    risks,
    recommendedStrategy: strategy,
    section1983Viable: params.hasConstitutionalViolations,
    settlementValue,
    leveragePoints: leverage
  };
}

// ============================================================================
// ENHANCED DEFENSE STRATEGY
// ============================================================================

export interface GeniusDefenseStrategy {
  argument: LegalArgument;
  iracAnalysis: IRACAnalysis;
  briefOutline: BriefOutline;
  crossExamQuestions: CrossExamQuestion[];
  motionPredictions: {
    motionToSuppress: MotionPrediction;
    motionToDismiss: MotionPrediction;
    motionForReturn: MotionPrediction;
  };
  opponentProfile: OpponentProfile;
  judgeProfile: JudgeProfile;
  decisionTree: StrategicDecision;
}

/**
 * Generate comprehensive defense strategy with genius AI
 */
export function generateGeniusDefenseStrategy(params: {
  violations: string[];
  facts: string[];
  state: string;
  goal: string;
}): GeniusDefenseStrategy {
  // Construct multi-layered argument
  const argument = constructArgument({
    claim: "CPS violated constitutional and statutory rights",
    facts: params.facts,
    legalBasis: ['4th Amendment', '14th Amendment', 'ASFA'],
    caseLaw: ['Calabretta v. Floyd', 'Troxel v. Granville', 'Santosky v. Kramer'],
    jurisdiction: params.state,
    goalOutcome: params.goal
  });

  // IRAC analysis
  const iracAnalysis = generateIRAC({
    issue: "Did CPS violate parent's constitutional rights?",
    relevantLaw: [
      'Fourth Amendment requires warrant or exigent circumstances',
      'Fourteenth Amendment protects fundamental parental rights',
      'ASFA requires reasonable efforts to prevent removal'
    ],
    facts: params.facts,
    desiredConclusion: 'Yes, multiple constitutional and statutory violations occurred'
  });

  // Brief structure
  const briefOutline = generateBriefOutline({
    motionType: 'Motion to Suppress Evidence and Dismiss Petition',
    jurisdiction: params.state,
    party: 'petitioner',
    keyArguments: [
      'Fourth Amendment Violation - Warrantless Entry',
      'Fourteenth Amendment - Due Process Violation',
      'ASFA Violation - No Reasonable Efforts'
    ],
    relief: [
      'Suppress all evidence obtained through unlawful search',
      'Dismiss petition for lack of admissible evidence',
      'Return children to parent immediately',
      'Award costs and attorney fees'
    ]
  });

  // Cross-examination questions
  const crossExamQuestions = generateCrossExam({
    witness: 'cps_worker',
    knownWeaknesses: params.violations,
    priorStatements: [],
    documents: []
  });

  // Motion success predictions
  const motionPredictions = {
    motionToSuppress: predictMotionSuccess({
      motionType: 'motion_to_suppress',
      state: params.state,
      hasCaselaw: true,
      evidenceStrength: 'strong',
      proceduralCompliance: false,
      constitutionalViolation: params.violations.includes('fourthAmendment'),
      clearlyEstablishedLaw: true
    }),
    motionToDismiss: predictMotionSuccess({
      motionType: 'motion_to_dismiss',
      state: params.state,
      hasCaselaw: true,
      evidenceStrength: 'moderate',
      proceduralCompliance: false,
      constitutionalViolation: true,
      clearlyEstablishedLaw: true
    }),
    motionForReturn: predictMotionSuccess({
      motionType: 'motion_for_return',
      state: params.state,
      hasCaselaw: true,
      evidenceStrength: 'strong',
      proceduralCompliance: false,
      constitutionalViolation: true,
      clearlyEstablishedLaw: true
    })
  };

  // Opponent analysis
  const opponentProfile = predictOpponentBehavior({
    opponent: 'CPS',
    caseStrength: 'weak',
    hasViolations: true,
    publicityRisk: false,
    attorneyExperience: 'mid-level'
  });

  // Judge analysis
  const judgeProfile = analyzeJudge({
    jurisdiction: params.state,
    caseType: 'dependency'
  });

  // Strategic decision tree
  const decisionTree = generateDecisionTree({
    currentSituation: "Constitutional violations identified",
    goals: ['reunification', 'accountability'],
    constraints: [],
    timeframe: '6 months'
  });

  return {
    argument,
    iracAnalysis,
    briefOutline,
    crossExamQuestions,
    motionPredictions,
    opponentProfile,
    judgeProfile,
    decisionTree
  };
}

// ============================================================================
// QUICK ACCESS FUNCTIONS FOR COMPONENTS
// ============================================================================

/**
 * Quick analysis for document upload
 */
export async function quickDocumentAnalysis(
  content: string,
  title: string,
  type: string
): Promise<{
  hasContradictions: boolean;
  contradictionCount: number;
  hasBias: boolean;
  evidenceQuality: 'excellent' | 'strong' | 'adequate' | 'weak' | 'insufficient';
  keyFindings: string[];
}> {
  const docs = [{ name: title, type, content, date: new Date() }];
  const contradictions = detectContradictions(docs);
  const patterns = identifyPatterns(docs);
  const evidenceScore = scoreEvidence({
    type: 'documentary',
    source: title,
    content,
    authentication: 'needs_authentication',
    hearsay: content.toLowerCase().includes('said'),
    chain_of_custody: false,
    expert_qualified: false,
    bias_issues: type.toLowerCase().includes('cps'),
    corroboration: 'none'
  });

  const keyFindings: string[] = [];
  
  if (contradictions.length > 0) {
    keyFindings.push(`${contradictions.length} contradictions detected`);
  }
  
  const biasPatterns = patterns.filter(p => p.type === 'bias');
  if (biasPatterns.length > 0) {
    keyFindings.push('Bias patterns found in document');
  }
  
  if (evidenceScore.overallScore < 50) {
    keyFindings.push('Evidence quality concerns');
  }

  return {
    hasContradictions: contradictions.length > 0,
    contradictionCount: contradictions.length,
    hasBias: biasPatterns.length > 0,
    evidenceQuality: evidenceScore.category,
    keyFindings
  };
}

/**
 * Quick case strength assessment
 */
export function quickCaseAssessment(violations: string[]): {
  overallStrength: 'very_strong' | 'strong' | 'moderate' | 'weak';
  section1983Viable: boolean;
  settlementPotential: 'high' | 'medium' | 'low';
  topRecommendation: string;
} {
  const hasConstitutional = violations.some(v => 
    v.includes('Amendment') || v.includes('constitutional')
  );

  let overallStrength: 'very_strong' | 'strong' | 'moderate' | 'weak' = 'weak';
  
  if (hasConstitutional && violations.length >= 3) {
    overallStrength = 'very_strong';
  } else if (hasConstitutional) {
    overallStrength = 'strong';
  } else if (violations.length >= 2) {
    overallStrength = 'moderate';
  }

  return {
    overallStrength,
    section1983Viable: hasConstitutional,
    settlementPotential: hasConstitutional ? 'high' : 
                         violations.length > 2 ? 'medium' : 'low',
    topRecommendation: hasConstitutional 
      ? 'File motion to suppress and consider Section 1983 federal lawsuit'
      : 'Focus on procedural challenges and case plan compliance'
  };
}
