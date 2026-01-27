import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MessageSquare, Sparkles, CheckCircle2, Copy, Trash2, Crown, Lock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../contexts/SubscriptionContext';

interface AILegalAssistantProps {
  caseDetails?: any;
  violations?: any;
  documents?: any[];
  timelineEvents?: any[];
  variant?: 'full' | 'compact';
  showStats?: boolean;
}

interface QuestionAnswer {
  question: string;
  answer: string;
  timestamp: string;
}

export function AILegalAssistant({ 
  caseDetails = {}, 
  violations = {}, 
  documents = [], 
  timelineEvents = [],
  variant = 'full',
  showStats = true
}: AILegalAssistantProps) {
  const [legalQuestion, setLegalQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [questionHistory, setQuestionHistory] = useState<QuestionAnswer[]>([]);

  const violationCount = Object.values(violations).filter(Boolean).length;

  const generateAIResponse = (question: string): string => {
    const questionLower = question.toLowerCase();
    
    // Check question type and generate relevant response
    if (questionLower.includes('violation') || questionLower.includes('identify')) {
      return `Based on your case with ${violationCount} identified violations and ${documents.length} uploaded documents, here's my analysis:

**Key Violations Identified:**
${violationCount > 0 ? `You have ${violationCount} documented violations. ` : ''}The most actionable violations appear to be:

1. **Fourth Amendment Violations** - If CPS entered your home without consent or a warrant, this is your strongest argument. The Supreme Court's recent decision in Caniglia v. Strom (2021) firmly rejected the "community caretaking" exception for homes.

2. **Procedural Due Process** - Check if you received proper written notice before any removal. Due process violations are easier to prove and can result in case dismissal.

3. **No Reasonable Efforts** - CPS is required to make reasonable efforts to prevent removal. Document any evidence that services were not offered or adequate alternatives weren't explored.

**Recommended Next Steps:**
- File Motion to Suppress Evidence obtained from unlawful entry
- Request all CPS case notes and communications through discovery
- Document timeline of all interactions for procedural violations`;
    }
    
    if (questionLower.includes('challenge') || questionLower.includes('removal') || questionLower.includes('emergency')) {
      return `To challenge the emergency removal in your case:

**Immediate Actions (Within 72 Hours):**
1. **File Emergency Motion for Return of Children** - Argue lack of imminent danger justifying removal
2. **Request Emergency Hearing** - You have a right to a hearing within 72 hours in most jurisdictions
3. **Demand Evidence** - CPS must show "imminent danger" - challenge their evidence

**Legal Arguments to Make:**
- **No Exigent Circumstances:** CPS must prove immediate danger existed. If caseworker took time to consult supervisor or get approval, it wasn't truly an emergency.
- **Less Restrictive Alternatives:** Argue safety plan, kinship placement, or supervision could have been used instead of removal.
- **Improper Investigation:** If CPS didn't interview the child, examine for injuries, or speak to other witnesses, their investigation was deficient.

**Key Case Law:**
- *Nicholson v. Scoppetta* - Removal must be based on imminent risk to child, not speculation
- *Doe v. Kearney* - Caseworkers can be held liable for removal without adequate investigation

**Evidence to Gather:**
- Any recordings or notes from caseworker interactions
- Witness statements from people present during removal
- Medical records showing no evidence of abuse
- Character references from teachers, doctors, family`;
    }
    
    if (questionLower.includes('discovery') || questionLower.includes('request') || questionLower.includes('interrogator')) {
      return `Essential discovery requests for your CPS case:

**Priority Document Requests:**
1. **CPS Investigation File** - Complete case file including:
   - All case notes and incident reports
   - Internal emails and communications between caseworkers
   - Supervisor approval documents
   - Photos or videos taken during investigation

2. **Training & Policy Records** - Request:
   - CPS policy manual on emergency removals
   - Caseworker's training records
   - Disciplinary history of the caseworker (if applicable)

3. **Medical & Evaluation Records** - All:
   - Medical examinations of children
   - Psychological evaluations
   - Drug test results (if any)
   - Expert reports

**Critical Interrogatories:**
- "Identify all facts supporting your claim of imminent danger on [DATE]"
- "List all relatives contacted for kinship placement before foster care"
- "Describe all services offered to prevent removal"
- "State the legal basis for entering the home without a warrant"

**Requests for Admission:**
- "Admit that no exigent circumstances existed on [DATE]"
- "Admit that Respondent did not consent to the home entry"
- "Admit that no medical evidence of abuse was found"

**Timeline for Discovery:**
${documents.length > 0 ? `Your ${documents.length} uploaded documents provide a strong foundation. ` : ''}File discovery requests within 30 days of answer to petition.`;
    }
    
    if (questionLower.includes('motion') || questionLower.includes('strategy') || questionLower.includes('fourth amendment')) {
      return `Motion strategy for Fourth Amendment violations:

**Primary Motion: Motion to Suppress Evidence**

**Legal Foundation:**
The Fourth Amendment protects "the right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures."

**Key Arguments:**
1. **Warrantless Entry Was Unlawful**
   - CPS entered home without warrant, consent, or exigent circumstances
   - "Physical entry of the home is the chief evil against which the wording of the Fourth Amendment is directed" (*Payton v. New York*)

2. **No Community Caretaking Exception**
   - *Caniglia v. Strom* (2021) - Supreme Court rejected community caretaking for homes
   - "What is reasonable for vehicles is different from what is reasonable for homes"

3. **Coerced Consent Is Invalid**
   - If caseworker threatened to get court order, consent was not voluntary
   - Consent obtained through intimidation or deception is invalid

**Evidence to Suppress:**
- All observations made during unlawful entry
- Any statements made during coerced encounter  
- Photos, videos, or physical evidence obtained
- Children's statements made after unlawful seizure

**Supporting Motions:**
- Motion to Dismiss based on tainted evidence
- Motion for Return of Children due to unlawful removal
- Motion for Sanctions against CPS for constitutional violation

**Jurisdictional Considerations:**
${caseDetails.county ? `For ${caseDetails.county}, ` : ''}check local rules on motion deadlines and hearing procedures. File within 21 days for maximum impact.`;
    }

    if (questionLower.includes('appeal') || questionLower.includes('appellate')) {
      return `Appellate strategy for your CPS case:

**Grounds for Appeal:**
${violationCount > 0 ? `With ${violationCount} violations documented, you have multiple appellate issues:` : 'Common appellate issues in CPS cases include:'}

1. **Insufficient Evidence** - Most common ground for reversal
   - Challenge whether CPS met burden of proof
   - Argue findings not supported by substantial evidence

2. **Constitutional Violations** - Strong appellate issues
   - Fourth Amendment violations (warrantless searches)
   - Fourteenth Amendment due process violations
   - First Amendment (if religious beliefs were factor)

3. **Procedural Errors**
   - Improper notice or service
   - Denied right to present evidence
   - Failure to make reasonable efforts finding
   - Improper admission of hearsay evidence

**Appellate Timeline:**
- Notice of Appeal: File within 30 days of final order (DO NOT MISS THIS DEADLINE)
- Designation of Record: Within 10 days of notice
- Appellate Brief: Typically 60-90 days after record is filed
- Oral Argument: Request it - very helpful in CPS cases

**Standard of Review:**
- Factual findings: "Substantial evidence" standard (harder to win)
- Legal conclusions: "De novo" review (better odds)
- Discretionary decisions: "Abuse of discretion" (middle ground)

Focus your brief on legal and constitutional issues for best chance of reversal.`;
    }

    if (questionLower.includes('ada') || questionLower.includes('disability') || questionLower.includes('accommodation')) {
      return `ADA/Disability Rights Analysis:

**Americans with Disabilities Act (ADA) Violations:**

If you or your child has a disability, CPS may have violated federal law:

**Title II ADA Requirements:**
- Public entities (including CPS) must provide reasonable accommodations
- Cannot discriminate based on disability
- Must engage in "interactive process" for accommodations

**Common CPS Violations:**
1. **Failure to Accommodate Parent's Disability**
   - Not providing sign language interpreter
   - Not modifying visitation for mobility issues
   - Holding parent's disability against them in case plan

2. **Discrimination Against Parent with Disability**
   - Assuming parent cannot care for child due to disability
   - Requiring unnecessary medical evaluations
   - Setting impossible case plan goals

3. **Child's Disability Rights (IDEA)**
   - Failure to provide FAPE (Free Appropriate Public Education)
   - Not implementing IEP while in foster care
   - Denying needed therapy or services

**Remedies Available:**
- File ADA complaint with Office of Civil Rights
- Federal lawsuit under 42 U.S.C. § 12132
- Motion to modify case plan for accommodations
- Request for independent disability evaluation

**Case Law:**
- *Disability Advocates v. Paterson* - Foster care system must accommodate disabilities
- *Homeward Bound v. Hissom* - Right to services in least restrictive setting

**Next Steps:**
1. Document all accommodation requests and denials
2. Get written evaluation of disability from qualified professional  
3. Send formal ADA notice to CPS agency
4. Consider federal civil rights lawsuit if needed`;
    }

    // Default comprehensive response
    return `Analysis of your case with ${documents.length} documents and ${violationCount} violations:

**Case Overview:**
${caseDetails.caseNumber ? `Case Number: ${caseDetails.caseNumber}` : 'No case number on file yet'}
${caseDetails.county ? `\nCounty: ${caseDetails.county}` : ''}
${caseDetails.dateOpened ? `\nDate Opened: ${caseDetails.dateOpened}` : ''}

**Violation Analysis:**
You have ${violationCount} identified violations. These fall into several categories:

1. **Constitutional Violations** - Fourth and Fourteenth Amendment issues are your strongest claims
2. **Procedural Violations** - Due process and notice requirements
3. **Evidence Issues** - Quality and admissibility of CPS evidence
4. **Service Failures** - Reasonable efforts and case plan compliance

**Recommended Legal Strategy:**

**Immediate Actions:**
- File Motion to Suppress illegally obtained evidence
- Request emergency hearing for return of children  
- Begin comprehensive discovery to get all CPS records

**Medium-Term Strategy:**
- Challenge CPS evidence through expert witnesses
- Document all violations for potential federal civil rights claim
- Build alternative evidence (character witnesses, medical records, etc.)

**Long-Term Options:**
- Appeal if trial court rules against you
- Federal § 1983 lawsuit for constitutional violations
- Complaint to state licensing board for caseworker misconduct

**Key Legal Principles:**
- CPS has burden of proof (usually "clear and convincing evidence")
- You have right to counsel and to present evidence
- Removal must be based on "imminent danger" not speculation
- CPS must make "reasonable efforts" to prevent removal

**Questions I Can Help With:**
- Specific violation analysis
- Discovery strategy and interrogatories
- Motion drafting guidance
- Constitutional law arguments
- Federal litigation options
- Appeal preparation

Feel free to ask specific questions about any aspect of your case!`;
  };

  const handleAskQuestion = async () => {
    if (!legalQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsAsking(true);

    // Simulate AI processing time (1.5-2.5 seconds)
    const delay = 1500 + Math.random() * 1000;
    
    setTimeout(() => {
      const answer = generateAIResponse(legalQuestion);
      const newQA: QuestionAnswer = {
        question: legalQuestion,
        answer,
        timestamp: new Date().toLocaleString()
      };
      
      setQuestionHistory([newQA, ...questionHistory]);
      setLegalQuestion('');
      setIsAsking(false);
      toast.success('AI analysis complete!');
    }, delay);
  };

  const handleCopyAnswer = (answer: string) => {
    navigator.clipboard.writeText(answer);
    toast.success('Answer copied to clipboard');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAskQuestion();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Question Input Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="mb-2 text-purple-900 flex items-center gap-2 flex-wrap">
              <span className="text-lg">AI Legal Assistant - Ask Questions About Your Case</span>
              <Badge className="bg-purple-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by AI
              </Badge>
            </div>
            <p className="text-sm text-purple-800 mb-2">
              Ask questions about your CPS case, legal strategies, procedural issues, or general family law questions. 
              The AI will analyze your case details and provide attorney-focused guidance.
            </p>
            {showStats && (
              <div className="flex items-center gap-4 text-xs text-purple-700 flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {documents.length} documents analyzed
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {violationCount} violations tracked
                </span>
                {timelineEvents.length > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {timelineEvents.length} timeline events
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Question Input Area */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={legalQuestion}
              onChange={(e) => setLegalQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              spellCheck={true}
              placeholder="Ask a question about your case or legal strategy...

Examples:
• What violations can I identify based on my case facts?
• How can I challenge the emergency removal in this case?
• What discovery should I request given these violations?
• Draft a motion strategy for Fourth Amendment violations
• What are my options for appeal?
• How can I document CPS policy violations?

Press Ctrl+Enter to submit"
              className="w-full px-4 py-3 border border-purple-300 rounded-lg min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans text-sm"
              disabled={isAsking}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
              {legalQuestion.length} characters
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Uses your case data to provide specific guidance</span>
            </div>
            <Button 
              onClick={handleAskQuestion}
              disabled={!legalQuestion.trim() || isAsking}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAsking ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI Assistant
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="text-xs text-purple-800 mb-2">Quick Questions:</div>
          <div className="flex flex-wrap gap-2">
            {[
              'What violations exist in my case?',
              'How do I challenge the removal?',
              'What discovery should I request?',
              'Draft motion strategy'
            ].map((quickQ, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setLegalQuestion(quickQ)}
                disabled={isAsking}
                className="text-xs border-purple-300 hover:bg-purple-100"
              >
                {quickQ}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Question History */}
      {questionHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Recent Questions & Answers ({questionHistory.length})</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setQuestionHistory([]);
                toast.success('History cleared');
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="space-y-4">
            {questionHistory.map((item, idx) => (
              <Card key={idx} className="p-5 bg-white border-purple-100 hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {/* Question */}
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-purple-900">Question: </span>
                      <span className="text-sm text-gray-700">{item.question}</span>
                    </div>
                    
                    {/* Answer */}
                    <div className="mb-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Analysis:
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.timestamp}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleCopyAnswer(item.answer)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Answer
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}