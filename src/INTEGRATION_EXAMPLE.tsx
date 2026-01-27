/**
 * INTEGRATION EXAMPLE
 * How to use the new legally savvy AI in your existing components
 */

import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

// Import the new legal AI modules
import { generateLegallySavvyPrompt } from './utils/enhanced-legal-ai';
import { 
  analyzeFourthAmendmentViolation,
  analyzeSubstantiveDueProcess,
  analyzeSection1983Claim,
  performComprehensiveAnalysis 
} from './utils/legal-reasoning-engine';
import { 
  findRelevantCaseLaw,
  SUPREME_COURT_CASES,
  CIRCUIT_COURT_CASES 
} from './utils/legal-knowledge-base';
import { getRemovalLawsForState } from './utils/jurisdiction-specific-laws';
import { generateText } from './utils/gemini-api'; // Your existing Gemini integration

// ============================================================================
// EXAMPLE 1: ENHANCE DOCUMENT UPLOAD WITH LEGAL KNOWLEDGE
// ============================================================================

export function EnhancedDocumentUpload() {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDocument = async (documentText: string, documentType: string) => {
    setIsAnalyzing(true);

    // Get user's tier and state from context (you already have this)
    const userTier = 'premium'; // or get from your auth context
    const userState = 'Mississippi'; // or get from user profile
    const userViolations = ['warrantless entry', 'inadequate investigation']; // from your violation checker

    // Generate legally savvy prompt using the new system
    const prompt = generateLegallySavvyPrompt({
      tier: userTier,
      taskType: 'document_analysis',
      userInput: `Document Type: ${documentType}\n\nDocument Content:\n${documentText}`,
      caseContext: {
        state: userState,
        violations: userViolations,
        documentType: documentType
      }
    });

    // Send to Gemini API (your existing function)
    const result = await generateText(prompt);
    
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <Card className="p-6">
      <h3>Smart Document Analysis</h3>
      {isAnalyzing && <p>Analyzing with legal knowledge base...</p>}
      {analysis && (
        <div className="whitespace-pre-wrap">
          {analysis}
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// EXAMPLE 2: ENHANCED VIOLATION CHECKER
// ============================================================================

export function EnhancedViolationChecker() {
  const [violations, setViolations] = useState<any[]>([]);

  const checkForViolations = () => {
    const detectedViolations = [];

    // Example: User reports warrantless entry
    const userReported = {
      hadWarrant: false,
      hadConsent: false,
      consentCoerced: false,
      exigentCircumstances: false,
      investigationQuality: 'inadequate' as const
    };

    // Run sophisticated Fourth Amendment analysis
    const fourthAmendmentAnalysis = analyzeFourthAmendmentViolation(userReported);

    if (fourthAmendmentAnalysis.violation) {
      detectedViolations.push({
        type: 'Fourth Amendment Violation',
        strength: fourthAmendmentAnalysis.strength,
        analysis: fourthAmendmentAnalysis.analysis,
        applicableCases: fourthAmendmentAnalysis.applicableCases,
        section1983Viable: fourthAmendmentAnalysis.section1983Viable,
        qualifiedImmunity: fourthAmendmentAnalysis.qualifiedImmunity
      });
    }

    setViolations(detectedViolations);
  };

  return (
    <div>
      <Button onClick={checkForViolations}>Check for Violations</Button>
      
      {violations.map((v, idx) => (
        <Card key={idx} className="mt-4 p-4">
          <h4>{v.type}</h4>
          <p><strong>Strength:</strong> {v.strength}</p>
          <p className="whitespace-pre-wrap">{v.analysis}</p>
          
          {v.applicableCases.length > 0 && (
            <div className="mt-4">
              <strong>Applicable Case Law:</strong>
              {v.applicableCases.map((c: any, i: number) => (
                <div key={i} className="ml-4 mt-2">
                  <p className="font-semibold">{c.citation}</p>
                  <p className="text-sm">{c.holding}</p>
                </div>
              ))}
            </div>
          )}

          {v.section1983Viable && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="font-semibold">Section 1983 Claim Viable!</p>
              <p>Qualified Immunity: {v.qualifiedImmunity}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: SHOW RELEVANT CASE LAW
// ============================================================================

export function RelevantCaseLawDisplay({ violationType }: { violationType: string }) {
  // Find relevant case law automatically
  const relevantCases = findRelevantCaseLaw(violationType);

  return (
    <Card className="p-4">
      <h3>Relevant Case Law for {violationType}</h3>
      {relevantCases.map((caseData, idx) => (
        <div key={idx} className="mt-4 border-l-4 border-blue-500 pl-4">
          <p className="font-bold">{caseData.citation}</p>
          <p className="text-sm mt-1"><strong>Holding:</strong> {caseData.holding}</p>
          <p className="text-sm mt-1"><strong>Application:</strong> {caseData.application}</p>
          
          {caseData.keyQuotes && caseData.keyQuotes.length > 0 && (
            <blockquote className="mt-2 italic text-sm border-l-2 pl-3">
              "{caseData.keyQuotes[0]}"
            </blockquote>
          )}

          {caseData.section1983 && (
            <p className="mt-2 text-xs bg-green-100 p-2 rounded">
              ✅ Applicable to Section 1983 claims
            </p>
          )}
        </div>
      ))}
    </Card>
  );
}

// ============================================================================
// EXAMPLE 4: STATE-SPECIFIC LAW DISPLAY
// ============================================================================

export function StateSpecificLawGuide({ state }: { state: string }) {
  const removalLaw = getRemovalLawsForState(state);

  if (!removalLaw) {
    return <p>State law information not available</p>;
  }

  return (
    <Card className="p-4">
      <h3>{state} CPS Removal Law</h3>
      <div className="space-y-2 mt-3">
        <div>
          <strong>Statute:</strong> {removalLaw.statute}
        </div>
        <div>
          <strong>Standard:</strong> {removalLaw.standard}
        </div>
        <div>
          <strong>Who Can Remove:</strong> {removalLaw.whoCanRemove.join(', ')}
        </div>
        <div>
          <strong>Hearing Deadline:</strong> {removalLaw.timeForHearing}
        </div>
        <div>
          <strong>Warrant Required:</strong> {removalLaw.warrantRequired ? 'Yes' : 'No (with exceptions)'}
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <p className="text-sm">
          <strong>Important:</strong> If your hearing was not held within {removalLaw.timeForHearing}, 
          this may be a procedural violation you can challenge.
        </p>
      </div>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 5: SECTION 1983 CLAIM EVALUATOR
// ============================================================================

export function Section1983Evaluator({ caseData }: { caseData: any }) {
  const [evaluation, setEvaluation] = useState<any>(null);

  const evaluateClaim = () => {
    const result = analyzeSection1983Claim({
      constitutionalRight: '4th Amendment - Warrantless Entry',
      rightViolated: true,
      defendant: 'social worker',
      actingUnderColorOfLaw: true,
      clearlyEstablishedLaw: true,
      damages: 'significant'
    });

    setEvaluation(result);
  };

  return (
    <Card className="p-6">
      <h3>Section 1983 Federal Lawsuit Evaluation</h3>
      
      <Button onClick={evaluateClaim} className="mt-3">
        Evaluate Section 1983 Claim
      </Button>

      {evaluation && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded ${evaluation.viable ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="font-bold">
              Claim Status: {evaluation.viable ? '✅ VIABLE' : '❌ NOT VIABLE'}
            </p>
            <p>Strength: {evaluation.strength.toUpperCase()}</p>
          </div>

          <div className="whitespace-pre-wrap border-l-4 border-gray-300 pl-4">
            {evaluation.analysis}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-3 rounded ${evaluation.elements.actingUnderColorOfLaw.satisfied ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Color of Law</strong>
              <p className="text-sm">{evaluation.elements.actingUnderColorOfLaw.satisfied ? '✅ Satisfied' : '❌ Not satisfied'}</p>
            </div>
            <div className={`p-3 rounded ${evaluation.elements.deprivationOfRights.satisfied ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Rights Violated</strong>
              <p className="text-sm">{evaluation.elements.deprivationOfRights.satisfied ? '✅ Satisfied' : '❌ Not satisfied'}</p>
            </div>
            <div className={`p-3 rounded ${evaluation.elements.causation.satisfied ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Causation</strong>
              <p className="text-sm">{evaluation.elements.causation.satisfied ? '✅ Satisfied' : '❌ Not satisfied'}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded">
            <strong>Qualified Immunity:</strong> {evaluation.qualifiedImmunity}
            {evaluation.qualifiedImmunity === 'defeated' && (
              <p className="text-sm mt-2">
                ✅ Social worker cannot claim qualified immunity. Law was clearly established.
              </p>
            )}
          </div>

          <div className="p-4 bg-purple-50 rounded">
            <strong>Damages:</strong>
            <p className="text-sm mt-2">{evaluation.damages}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// EXAMPLE 6: COMPREHENSIVE CASE ANALYSIS
// ============================================================================

export function ComprehensiveCaseAnalysis({ caseDetails }: { caseDetails: any }) {
  const [analysis, setAnalysis] = useState<any>(null);

  const runAnalysis = () => {
    const result = performComprehensiveAnalysis({
      facts: caseDetails.facts,
      documents: caseDetails.documents,
      violations: caseDetails.violations,
      state: caseDetails.state,
      timeline: caseDetails.timeline,
      children: caseDetails.childrenCount
    });

    setAnalysis(result);
  };

  return (
    <Card className="p-6">
      <h3>AI Legal Analysis</h3>
      <Button onClick={runAnalysis}>Run Comprehensive Analysis</Button>

      {analysis && (
        <div className="mt-6 space-y-6">
          {/* Executive Summary */}
          <div className="p-4 bg-blue-50 rounded">
            <h4 className="font-bold">Executive Summary</h4>
            <p>{analysis.executiveSummary}</p>
          </div>

          {/* Legal Issues */}
          <div>
            <h4 className="font-bold mb-3">Legal Issues Identified</h4>
            {analysis.legalIssues.map((issue: any, idx: number) => (
              <Card key={idx} className="p-4 mb-3">
                <p className="font-semibold">{issue.issueType}</p>
                <p className="text-sm mt-1">{issue.description}</p>
                <p className="text-xs mt-2">
                  <strong>Strength:</strong> {issue.strength.toUpperCase()}
                </p>
                {issue.supportingCaseLaw.length > 0 && (
                  <div className="mt-2 text-xs">
                    <strong>Supporting Cases:</strong>
                    {issue.supportingCaseLaw.slice(0, 2).map((c: any, i: number) => (
                      <div key={i} className="ml-2">• {c.citation}</div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Litigation Strategy */}
          <div>
            <h4 className="font-bold mb-3">Litigation Strategy</h4>
            
            <div className="space-y-3">
              <div>
                <strong className="text-red-600">Immediate Actions:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {analysis.litigationStrategy.immediateActions.map((action: string, idx: number) => (
                    <li key={idx} className="text-sm">{action}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-orange-600">Short-term Strategy:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {analysis.litigationStrategy.shortTermStrategy.map((action: string, idx: number) => (
                    <li key={idx} className="text-sm">{action}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-blue-600">Long-term Strategy:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {analysis.litigationStrategy.longTermStrategy.map((action: string, idx: number) => (
                    <li key={idx} className="text-sm">{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Strength Assessment */}
          <div className="p-4 bg-green-50 rounded">
            <h4 className="font-bold">Overall Case Strength</h4>
            <p>{analysis.strengthAssessment}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// EXAMPLE 7: LANDMARK CASES REFERENCE
// ============================================================================

export function LandmarkCasesReference() {
  return (
    <div className="space-y-4">
      <h3>Landmark Cases - Quick Reference</h3>
      
      <Card className="p-4">
        <h4 className="font-semibold">Parental Rights are Fundamental</h4>
        <p className="text-sm mt-2">
          <strong>{SUPREME_COURT_CASES.troxel.citation}</strong>
        </p>
        <blockquote className="mt-2 italic text-sm border-l-4 border-blue-500 pl-3">
          "{SUPREME_COURT_CASES.troxel.keyQuotes[0]}"
        </blockquote>
        <p className="text-sm mt-2">
          <strong>What this means:</strong> {SUPREME_COURT_CASES.troxel.application}
        </p>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold">Warrantless CPS Entry is Unconstitutional</h4>
        <p className="text-sm mt-2">
          <strong>{CIRCUIT_COURT_CASES.calabrettaVFloyd.citation}</strong>
        </p>
        <blockquote className="mt-2 italic text-sm border-l-4 border-blue-500 pl-3">
          "{CIRCUIT_COURT_CASES.calabrettaVFloyd.keyQuotes[0]}"
        </blockquote>
        <p className="text-sm mt-2">
          <strong>What this means:</strong> {CIRCUIT_COURT_CASES.calabrettaVFloyd.application}
        </p>
        {CIRCUIT_COURT_CASES.calabrettaVFloyd.section1983 && (
          <p className="mt-2 text-xs bg-green-100 p-2 rounded">
            ✅ Can be used in Section 1983 federal lawsuit
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold">Clear and Convincing Evidence for TPR</h4>
        <p className="text-sm mt-2">
          <strong>{SUPREME_COURT_CASES.santosky.citation}</strong>
        </p>
        <blockquote className="mt-2 italic text-sm border-l-4 border-blue-500 pl-3">
          "{SUPREME_COURT_CASES.santosky.keyQuotes[0]}"
        </blockquote>
        <p className="text-sm mt-2">
          <strong>What this means:</strong> {SUPREME_COURT_CASES.santosky.application}
        </p>
      </Card>
    </div>
  );
}

// ============================================================================
// HOW TO INTEGRATE INTO YOUR EXISTING COMPONENTS
// ============================================================================

/*

1. IN YOUR DOCUMENT UPLOAD COMPONENT:
   Replace basic AI analysis with EnhancedDocumentUpload logic

2. IN YOUR VIOLATION CHECKER:
   Use analyzeFourthAmendmentViolation(), analyzeSubstantiveDueProcess(), etc.
   instead of generic violation checking

3. IN YOUR DEFENSE STRATEGY COMPONENT:
   Use performComprehensiveAnalysis() to generate sophisticated strategies

4. IN YOUR RIGHTS GUIDE:
   Display relevant case law using findRelevantCaseLaw()

5. IN YOUR FEDERAL LITIGATION SECTION:
   Add Section1983Evaluator component

6. IN USER PROFILE/SETTINGS:
   Add state selector, then use getRemovalLawsForState() throughout app

7. IN YOUR AI CHAT:
   Use generateLegallySavvyPrompt() for every user question

*/
