/**
 * ADVANCED PATTERN RECOGNITION ENGINE
 * 
 * Detects patterns, contradictions, and inconsistencies across multiple
 * documents, identifies hidden connections, and extracts structured data
 * from unstructured text.
 */

// ============================================================================
// CONTRADICTION DETECTION
// ============================================================================

export interface Contradiction {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  type: 'factual' | 'timeline' | 'witness' | 'allegation' | 'procedural';
  document1: {
    name: string;
    excerpt: string;
    date?: Date;
  };
  document2: {
    name: string;
    excerpt: string;
    date?: Date;
  };
  description: string;
  legalSignificance: string;
  howToExploit: string;
}

/**
 * Detect contradictions across multiple documents
 */
export function detectContradictions(documents: Array<{
  name: string;
  type: string;
  content: string;
  date?: Date;
}>): Contradiction[] {
  const contradictions: Contradiction[] = [];
  
  // Extract claims from each document
  const documentClaims = documents.map(doc => ({
    document: doc,
    claims: extractClaims(doc.content)
  }));
  
  // Compare claims across documents
  for (let i = 0; i < documentClaims.length; i++) {
    for (let j = i + 1; j < documentClaims.length; j++) {
      const doc1 = documentClaims[i];
      const doc2 = documentClaims[j];
      
      // Check for contradictory claims
      doc1.claims.forEach(claim1 => {
        doc2.claims.forEach(claim2 => {
          if (areContradictory(claim1, claim2)) {
            contradictions.push({
              id: `CONTRA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              severity: assessContradictionSeverity(claim1, claim2),
              type: determineContradictionType(claim1, claim2),
              document1: {
                name: doc1.document.name,
                excerpt: claim1.text,
                date: doc1.document.date
              },
              document2: {
                name: doc2.document.name,
                excerpt: claim2.text,
                date: doc2.document.date
              },
              description: `Contradiction found: "${claim1.subject}" differs between documents`,
              legalSignificance: generateLegalSignificance(claim1, claim2),
              howToExploit: generateExploitationStrategy(claim1, claim2)
            });
          }
        });
      });
    }
  }
  
  return contradictions.sort((a, b) => {
    const severityOrder = { critical: 3, major: 2, minor: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

interface Claim {
  subject: string;
  predicate: string;
  text: string;
  confidence: number;
  timestamp?: Date;
  location?: string;
  person?: string;
}

function extractClaims(content: string): Claim[] {
  const claims: Claim[] = [];
  
  // Pattern: Dates and times
  const datePattern = /(?:on|at|during)\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/gi;
  const dateMatches = content.matchAll(datePattern);
  for (const match of dateMatches) {
    claims.push({
      subject: 'date',
      predicate: match[1],
      text: match[0],
      confidence: 0.9
    });
  }
  
  // Pattern: Injuries/marks
  const injuryPattern = /(bruise|mark|injury|wound|laceration|fracture|burn)\s+(?:on|to)\s+([a-z\s]+)/gi;
  const injuryMatches = content.matchAll(injuryPattern);
  for (const match of injuryMatches) {
    claims.push({
      subject: 'injury',
      predicate: `${match[1]} on ${match[2]}`,
      text: match[0],
      confidence: 0.85
    });
  }
  
  // Pattern: Witness statements
  const witnessPattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:stated|said|reported|testified)\s+that\s+([^.]+)/gi;
  const witnessMatches = content.matchAll(witnessPattern);
  for (const match of witnessMatches) {
    claims.push({
      subject: 'witness_statement',
      predicate: match[2],
      text: match[0],
      confidence: 0.8,
      person: match[1]
    });
  }
  
  // Pattern: Substance use
  const substancePattern = /(tested|screened)\s+(positive|negative)\s+for\s+([a-z\s]+)/gi;
  const substanceMatches = content.matchAll(substancePattern);
  for (const match of substanceMatches) {
    claims.push({
      subject: 'substance_test',
      predicate: `${match[2]} for ${match[3]}`,
      text: match[0],
      confidence: 0.95
    });
  }
  
  // Pattern: Presence/absence
  const presencePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:was|was not|wasn't)\s+(present|absent|home|at the residence)/gi;
  const presenceMatches = content.matchAll(presencePattern);
  for (const match of presenceMatches) {
    claims.push({
      subject: 'presence',
      predicate: `${match[1]} ${match[2]}`,
      text: match[0],
      confidence: 0.85,
      person: match[1]
    });
  }
  
  // Pattern: Time statements
  const timePattern = /(?:at|around|approximately)\s+(\d{1,2}:\d{2}\s*[ap]m)/gi;
  const timeMatches = content.matchAll(timePattern);
  for (const match of timeMatches) {
    claims.push({
      subject: 'time',
      predicate: match[1],
      text: match[0],
      confidence: 0.9
    });
  }
  
  return claims;
}

function areContradictory(claim1: Claim, claim2: Claim): boolean {
  // Same subject but different predicates
  if (claim1.subject === claim2.subject && claim1.subject !== 'witness_statement') {
    if (claim1.predicate !== claim2.predicate) {
      // Check if they're actually contradictory (not just different)
      if (claim1.subject === 'substance_test') {
        return claim1.predicate.includes('positive') && claim2.predicate.includes('negative') ||
               claim1.predicate.includes('negative') && claim2.predicate.includes('positive');
      }
      
      if (claim1.subject === 'presence') {
        return (claim1.predicate.includes('present') && claim2.predicate.includes('absent')) ||
               (claim1.predicate.includes('absent') && claim2.predicate.includes('present'));
      }
      
      if (claim1.subject === 'date' || claim1.subject === 'time') {
        return claim1.predicate.toLowerCase() !== claim2.predicate.toLowerCase();
      }
      
      if (claim1.subject === 'injury') {
        // Different injury descriptions might be contradictory
        return true;
      }
    }
  }
  
  return false;
}

function assessContradictionSeverity(claim1: Claim, claim2: Claim): 'critical' | 'major' | 'minor' {
  if (claim1.subject === 'substance_test') return 'critical';
  if (claim1.subject === 'injury') return 'critical';
  if (claim1.subject === 'presence') return 'major';
  if (claim1.subject === 'date') return 'major';
  if (claim1.subject === 'time') return 'minor';
  return 'minor';
}

function determineContradictionType(claim1: Claim, claim2: Claim): 'factual' | 'timeline' | 'witness' | 'allegation' | 'procedural' {
  if (claim1.subject === 'date' || claim1.subject === 'time') return 'timeline';
  if (claim1.subject === 'witness_statement') return 'witness';
  if (claim1.subject === 'injury' || claim1.subject === 'substance_test') return 'allegation';
  return 'factual';
}

function generateLegalSignificance(claim1: Claim, claim2: Claim): string {
  if (claim1.subject === 'substance_test') {
    return 'CRITICAL: Contradictory drug test results directly undermine CPS credibility and evidence foundation. Can be used to challenge entire investigation.';
  }
  
  if (claim1.subject === 'injury') {
    return 'CRITICAL: Inconsistent injury descriptions suggest unreliable observations or falsified reports. Raises questions about medical examination accuracy.';
  }
  
  if (claim1.subject === 'presence') {
    return 'MAJOR: Contradictory presence statements affect witness credibility and timeline accuracy. Can be used to impeach witnesses.';
  }
  
  if (claim1.subject === 'date') {
    return 'MAJOR: Timeline contradictions can invalidate entire sequence of events and challenge CPS narrative.';
  }
  
  return 'Factual contradictions damage CPS credibility and can be exploited in cross-examination.';
}

function generateExploitationStrategy(claim1: Claim, claim2: Claim): string {
  let strategy = '1. File motion highlighting contradiction\n';
  strategy += '2. Demand explanation from CPS\n';
  strategy += '3. Use in cross-examination to impeach witnesses\n';
  strategy += '4. Argue CPS investigation was careless/biased\n';
  
  if (claim1.subject === 'substance_test' || claim1.subject === 'injury') {
    strategy += '5. Move to exclude contradictory evidence\n';
    strategy += '6. Request independent examination/testing\n';
    strategy += '7. Consider fraud on court motion if intentional';
  }
  
  return strategy;
}

// ============================================================================
// PATTERN RECOGNITION
// ============================================================================

export interface Pattern {
  type: 'bias' | 'procedural_violation' | 'evidence_pattern' | 'timeline_anomaly' | 'credibility_issue';
  description: string;
  occurrences: number;
  examples: string[];
  legalImplications: string;
  actionItems: string[];
}

/**
 * Identify patterns across case documents
 */
export function identifyPatterns(documents: Array<{
  name: string;
  type: string;
  content: string;
  date?: Date;
}>): Pattern[] {
  const patterns: Pattern[] = [];
  
  // Bias detection
  const biasPattern = detectBiasPatterns(documents);
  if (biasPattern) patterns.push(biasPattern);
  
  // Procedural violations
  const proceduralPattern = detectProceduralViolations(documents);
  if (proceduralPattern) patterns.push(proceduralPattern);
  
  // Evidence inconsistencies
  const evidencePattern = detectEvidencePatterns(documents);
  if (evidencePattern) patterns.push(evidencePattern);
  
  // Timeline anomalies
  const timelinePattern = detectTimelineAnomalies(documents);
  if (timelinePattern) patterns.push(timelinePattern);
  
  // Credibility issues
  const credibilityPattern = detectCredibilityIssues(documents);
  if (credibilityPattern) patterns.push(credibilityPattern);
  
  return patterns;
}

function detectBiasPatterns(documents: any[]): Pattern | null {
  const biasIndicators: string[] = [];
  const examples: string[] = [];
  
  documents.forEach(doc => {
    const content = doc.content.toLowerCase();
    
    // Loaded language
    if (content.match(/refuses to|failed to|unwilling to|uncooperative/gi)) {
      const matches = content.match(/refuses to|failed to|unwilling to|uncooperative/gi);
      if (matches && matches.length > 3) {
        biasIndicators.push('repeated negative characterizations');
        examples.push(`"${matches.slice(0, 2).join('", "')}" (${matches.length} instances)`);
      }
    }
    
    // Assumption language
    if (content.match(/appears to|seems to|likely|probably|suspected/gi)) {
      const matches = content.match(/appears to|seems to|likely|probably|suspected/gi);
      if (matches && matches.length > 5) {
        biasIndicators.push('excessive speculation');
        examples.push(`Speculative language used ${matches.length} times`);
      }
    }
    
    // Missing parent perspective
    if (!content.match(/parent stated|parent explained|parent reported/gi) && 
        doc.type === 'CPS Report') {
      biasIndicators.push('parent voice absent');
      examples.push(`No parent perspective documented in ${doc.name}`);
    }
  });
  
  if (biasIndicators.length > 0) {
    return {
      type: 'bias',
      description: 'Pattern of biased language and one-sided reporting detected',
      occurrences: biasIndicators.length,
      examples: examples,
      legalImplications: 'Biased CPS reporting can be challenged as violating due process. Demonstrates predetermined conclusion before investigation complete.',
      actionItems: [
        'File motion to exclude biased characterizations',
        'Demand factual observations only',
        'Cross-examine on confirmation bias',
        'Request independent assessment'
      ]
    };
  }
  
  return null;
}

function detectProceduralViolations(documents: any[]): Pattern | null {
  const violations: string[] = [];
  const examples: string[] = [];
  
  documents.forEach(doc => {
    const content = doc.content;
    
    // Missing signatures
    if (!content.match(/signature|signed by|reviewed by/gi) && doc.type === 'Court Order') {
      violations.push('unsigned document');
      examples.push(`${doc.name} appears unsigned`);
    }
    
    // Missing dates
    if (!content.match(/\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4}/g) && doc.type === 'CPS Report') {
      violations.push('missing dates');
      examples.push(`${doc.name} lacks proper dating`);
    }
    
    // Missing notice language
    if (!content.match(/you have the right to|entitled to|right to an attorney/gi) && 
        doc.type === 'Notice') {
      violations.push('missing rights notification');
      examples.push(`${doc.name} lacks required rights language`);
    }
  });
  
  if (violations.length > 0) {
    return {
      type: 'procedural_violation',
      description: 'Multiple procedural deficiencies identified',
      occurrences: violations.length,
      examples: examples,
      legalImplications: 'Procedural violations can be grounds for dismissal or suppression of evidence. Due process requires proper procedures.',
      actionItems: [
        'File motion to dismiss for procedural violations',
        'Challenge admissibility of defective documents',
        'Demand compliance with procedural requirements',
        'Preserve issue for appeal'
      ]
    };
  }
  
  return null;
}

function detectEvidencePatterns(documents: any[]): Pattern | null {
  const issues: string[] = [];
  const examples: string[] = [];
  
  documents.forEach(doc => {
    const content = doc.content.toLowerCase();
    
    // Hearsay reliance
    const hearsayCount = (content.match(/someone said|told by|heard from|anonymous caller|third party/gi) || []).length;
    if (hearsayCount > 3) {
      issues.push('excessive hearsay');
      examples.push(`${hearsayCount} hearsay references in ${doc.name}`);
    }
    
    // Lack of direct evidence
    if (!content.match(/witnessed|observed|saw|photographed|documented/gi) && 
        doc.type === 'Investigation Report') {
      issues.push('no direct evidence');
      examples.push(`${doc.name} lacks direct observations`);
    }
    
    // Missing chain of custody
    if (content.match(/drug test|sample|specimen/gi) && 
        !content.match(/chain of custody|sealed|witnessed/gi)) {
      issues.push('chain of custody gaps');
      examples.push(`Evidence in ${doc.name} lacks proper chain of custody`);
    }
  });
  
  if (issues.length > 0) {
    return {
      type: 'evidence_pattern',
      description: 'Systematic evidence quality issues',
      occurrences: issues.length,
      examples: examples,
      legalImplications: 'Weak evidence foundation undermines CPS case. Hearsay and lack of direct evidence can be excluded or given little weight.',
      actionItems: [
        'File motion to exclude hearsay',
        'Challenge lack of foundation',
        'Demand production of original evidence',
        'Request authentication of all exhibits'
      ]
    };
  }
  
  return null;
}

function detectTimelineAnomalies(documents: any[]): Pattern | null {
  // Extract all dates mentioned
  const dateEvents: Array<{ date: Date; event: string; document: string }> = [];
  
  documents.forEach(doc => {
    const datePattern = /(\w+\s+\d{1,2},?\s+\d{4})/g;
    const matches = doc.content.matchAll(datePattern);
    
    for (const match of matches) {
      try {
        const date = new Date(match[1]);
        dateEvents.push({
          date,
          event: match[0],
          document: doc.name
        });
      } catch (e) {
        // Invalid date, skip
      }
    }
  });
  
  // Sort by date
  dateEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Look for anomalies
  const anomalies: string[] = [];
  
  for (let i = 0; i < dateEvents.length - 1; i++) {
    const current = dateEvents[i];
    const next = dateEvents[i + 1];
    
    // Events out of logical order
    if (current.event.includes('investigation closed') && next.event.includes('home visit')) {
      anomalies.push(`Investigation closed before visit on ${next.date.toLocaleDateString()}`);
    }
  }
  
  if (anomalies.length > 0) {
    return {
      type: 'timeline_anomaly',
      description: 'Timeline inconsistencies detected',
      occurrences: anomalies.length,
      examples: anomalies,
      legalImplications: 'Timeline contradictions suggest careless documentation or falsified records. Can impeach CPS testimony.',
      actionItems: [
        'Create detailed timeline exhibit',
        'Highlight contradictions in briefing',
        'Cross-examine on timeline inconsistencies',
        'Use to argue unreliable investigation'
      ]
    };
  }
  
  return null;
}

function detectCredibilityIssues(documents: any[]): Pattern | null {
  const issues: string[] = [];
  const examples: string[] = [];
  
  // Look for changed stories
  const witnessStatements = new Map<string, string[]>();
  
  documents.forEach(doc => {
    const witnessPattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:stated|said|testified)\s+that\s+([^.]+)/gi;
    const matches = doc.content.matchAll(witnessPattern);
    
    for (const match of matches) {
      const witness = match[1];
      const statement = match[2];
      
      if (!witnessStatements.has(witness)) {
        witnessStatements.set(witness, []);
      }
      witnessStatements.get(witness)!.push(statement);
    }
  });
  
  // Check for inconsistent statements
  witnessStatements.forEach((statements, witness) => {
    if (statements.length > 1) {
      // Simplified: if statements are very different in length or content
      const avgLength = statements.reduce((sum, s) => sum + s.length, 0) / statements.length;
      const hasVeryDifferent = statements.some(s => Math.abs(s.length - avgLength) > avgLength * 0.5);
      
      if (hasVeryDifferent) {
        issues.push('inconsistent witness statements');
        examples.push(`${witness} gave varying accounts across documents`);
      }
    }
  });
  
  if (issues.length > 0) {
    return {
      type: 'credibility_issue',
      description: 'Witness credibility problems identified',
      occurrences: issues.length,
      examples: examples,
      legalImplications: 'Inconsistent witness statements undermine credibility. Can be used for impeachment and to argue unreliable evidence.',
      actionItems: [
        'Prepare impeachment questions for cross-examination',
        'Create exhibit comparing statements',
        'Argue unreliable witnesses',
        'Request exclusion of testimony'
      ]
    };
  }
  
  return null;
}

// ============================================================================
// ENTITY EXTRACTION
// ============================================================================

export interface ExtractedEntity {
  type: 'person' | 'date' | 'location' | 'organization' | 'allegation' | 'injury';
  value: string;
  context: string;
  document: string;
  confidence: number;
}

/**
 * Extract structured entities from unstructured text
 */
export function extractEntities(documents: Array<{
  name: string;
  content: string;
}>): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  
  documents.forEach(doc => {
    // Extract people
    const namePattern = /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g;
    const nameMatches = doc.content.matchAll(namePattern);
    for (const match of nameMatches) {
      entities.push({
        type: 'person',
        value: match[1],
        context: getContext(doc.content, match.index!, 50),
        document: doc.name,
        confidence: 0.8
      });
    }
    
    // Extract dates
    const datePattern = /\b(\w+\s+\d{1,2},?\s+\d{4})\b/g;
    const dateMatches = doc.content.matchAll(datePattern);
    for (const match of dateMatches) {
      entities.push({
        type: 'date',
        value: match[1],
        context: getContext(doc.content, match.index!, 50),
        document: doc.name,
        confidence: 0.95
      });
    }
    
    // Extract allegations
    const allegationPattern = /\b(abuse|neglect|domestic violence|substance abuse|physical abuse|sexual abuse|emotional abuse)\b/gi;
    const allegationMatches = doc.content.matchAll(allegationPattern);
    for (const match of allegationMatches) {
      entities.push({
        type: 'allegation',
        value: match[1],
        context: getContext(doc.content, match.index!, 100),
        document: doc.name,
        confidence: 0.9
      });
    }
  });
  
  return entities;
}

function getContext(text: string, index: number, length: number): string {
  const start = Math.max(0, index - length);
  const end = Math.min(text.length, index + length);
  return text.substring(start, end);
}

// ============================================================================
// CROSS-DOCUMENT ANALYSIS
// ============================================================================

export interface CrossDocumentInsight {
  type: 'connection' | 'gap' | 'corroboration' | 'refutation';
  description: string;
  involvedDocuments: string[];
  significance: 'high' | 'medium' | 'low';
  actionItem: string;
}

/**
 * Analyze connections and gaps across multiple documents
 */
export function analyzeCrossDocument(documents: Array<{
  name: string;
  type: string;
  content: string;
  date?: Date;
}>): CrossDocumentInsight[] {
  const insights: CrossDocumentInsight[] = [];
  
  // Extract entities from all documents
  const allEntities = extractEntities(documents);
  
  // Find entities mentioned in multiple documents (corroboration)
  const entityCounts = new Map<string, Set<string>>();
  allEntities.forEach(entity => {
    const key = `${entity.type}:${entity.value}`;
    if (!entityCounts.has(key)) {
      entityCounts.set(key, new Set());
    }
    entityCounts.get(key)!.add(entity.document);
  });
  
  // Identify corroborated facts
  entityCounts.forEach((docs, entityKey) => {
    if (docs.size > 2) {
      const [type, value] = entityKey.split(':');
      insights.push({
        type: 'corroboration',
        description: `${type} "${value}" mentioned in multiple documents`,
        involvedDocuments: Array.from(docs),
        significance: 'medium',
        actionItem: 'Use for establishing consistency and reliability'
      });
    }
  });
  
  // Find gaps (expected documents missing)
  const docTypes = new Set(documents.map(d => d.type));
  const expectedDocTypes = ['CPS Report', 'Medical Report', 'Police Report', 'Court Order'];
  
  expectedDocTypes.forEach(expected => {
    if (!docTypes.has(expected)) {
      insights.push({
        type: 'gap',
        description: `Missing expected document: ${expected}`,
        involvedDocuments: [],
        significance: 'high',
        actionItem: `File discovery request for ${expected}`
      });
    }
  });
  
  return insights;
}
