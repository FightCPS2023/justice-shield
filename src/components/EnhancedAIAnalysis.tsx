import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { 
  Brain, FileText, AlertTriangle, Lightbulb, 
  Scale, Shield, Upload, Sparkles, ChevronDown,
  ChevronUp, CheckCircle2, Search, Crown, Lock
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { getAIConfig, generateDocumentAnalysisPrompt, generateViolationCheckPrompt, generateStrategyPrompt, getDisclaimer } from '../utils/ai-prompts';

interface EnhancedAIAnalysisProps {
  caseDetails: any;
  violations: any[];
  documents: any[];
}

export function EnhancedAIAnalysis({ caseDetails, violations, documents }: EnhancedAIAnalysisProps) {
  const { tier, isAttorney, isPremium, isFree } = useSubscription();
  const [analysisType, setAnalysisType] = useState<'document' | 'violation' | 'strategy'>('document');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options
  const [focusArea, setFocusArea] = useState('all');
  const [goal, setGoal] = useState('reunification');

  const aiConfig = getAIConfig(tier);
  const disclaimer = getDisclaimer(tier);

  const handleAnalyze = async () => {
    if (!input && analysisType === 'document') {
      toast.error('Please enter document content or upload a file');
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis with tier-appropriate prompting
    setTimeout(() => {
      let mockResult = '';

      if (analysisType === 'document') {
        mockResult = generateMockDocumentAnalysis(tier, input);
      } else if (analysisType === 'violation') {
        mockResult = generateMockViolationAnalysis(tier, caseDetails, focusArea);
      } else if (analysisType === 'strategy') {
        mockResult = generateMockStrategy(tier, caseDetails, violations, goal);
      }

      setResult(mockResult);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 2000);
  };

  const generateMockDocumentAnalysis = (tier: string, content: string) => {
    if (tier === 'attorney') {
      return `# PROFESSIONAL DOCUMENT ANALYSIS

## EXECUTIVE SUMMARY

Document Type: CPS Investigation Report
Analysis Depth: Comprehensive Legal Review
Critical Issues Identified: 4 major violations, 2 constitutional claims

---

## LEGAL ANALYSIS

### I. Constitutional Claims

**A. Fourth Amendment Violation - Warrantless Entry**

The document reveals that on [DATE], CPS Caseworker [NAME] entered the residence without:
- Valid search warrant
- Exigent circumstances
- Voluntary consent

**Legal Standard**: *Caniglia v. Strom*, 141 S. Ct. 1596 (2021) - Supreme Court held the "community caretaking" exception does NOT apply to homes. Warrantless entries require true exigent circumstances.

**Application**: The caseworker's statement "I needed to ensure child safety" does not meet the *Caniglia* standard. No immediate danger is documented. This is an unlawful search.

**Litigation Value**: Strong § 1983 claim. Recommend motion to suppress all evidence.

**B. Fourteenth Amendment - Substantive Due Process**

Family integrity is a fundamental liberty interest. *Troxel v. Granville*, 530 U.S. 57 (2000). The removal without proper showing of immediate danger violates substantive due process.

**Case Law**: *Doe v. Heck*, 327 F.3d 492 (7th Cir. 2003) - Removal based on speculation violates clearly established rights.

---

### II. Statutory Violations

**A. ASFA - Reasonable Efforts Failure**

42 U.S.C. § 671(a)(15) requires "reasonable efforts" to prevent removal. The document shows:
- ❌ No safety plan offered
- ❌ No kinship placement investigated  
- ❌ No services provided before removal
- ❌ No less restrictive alternatives explored

**Litigation Strategy**: File motion challenging lack of reasonable efforts. This can result in immediate return of children or case dismissal.

**B. Procedural Due Process - Notice Deficiency**

The parent received notice only [X hours] before the emergency hearing. This violates minimum due process requirements under *Santosky v. Kramer*, 455 U.S. 745 (1982).

---

## EVIDENTIARY ASSESSMENT

### Admissibility Issues:

1. **Hearsay Problems**
   - Caseworker report contains multiple levels of hearsay
   - "Neighbor said that someone told her..."
   - Object under FRE 802 / State equivalent

2. **Lack of Personal Knowledge**
   - Caseworker makes conclusions without firsthand observation
   - Move to strike speculative statements

3. **Expert Testimony Issues**
   - Medical conclusions without qualified expert
   - Psychological assessments by non-psychologist

### Missing Evidence:

- No photos of alleged conditions
- No medical examination results
- No contemporaneous notes
- No witness statements under oath

---

## LITIGATION STRATEGY

### Immediate Actions (Next 7 Days):

1. **File Motion to Suppress Evidence**
   - Draft included in AI Paralegal tool
   - Cite *Caniglia*, *Payton v. New York*
   - Request evidentiary hearing

2. **File Motion to Dismiss for Lack of Reasonable Efforts**
   - ASFA violations documented
   - Request immediate return of children
   - Alternative: kinship placement order

3. **File Discovery Requests**
   - All investigation notes
   - Supervisor approvals
   - Policy manual sections
   - Caseworker training records

### Short-Term Strategy (1-3 Months):

1. **Motion Practice**
   - Motion for increased visitation
   - Motion to change placement (kinship)
   - Motion for independent evaluation

2. **Discovery Plan**
   - Depose caseworker (focus on training, policies)
   - Depose supervisor (failure to supervise)
   - Request all CPS policies

3. **Expert Retention**
   - Forensic psychologist for bonding evaluation
   - CPS policy expert to testify on violations
   - Medical expert to refute allegations

### Long-Term Strategy (Trial/Appeal):

1. **Trial Themes**
   - Government overreach
   - Constitutional violations
   - Lack of evidence
   - Good parent wrongly accused

2. **Appellate Preservation**
   - Object to hearsay in writing
   - Request findings of fact
   - Preserve constitutional arguments

---

## DISCOVERY ROADMAP

### Documents to Request:

1. All investigation notes and recordings
2. Supervisor approval documentation
3. CPS policy manual (removal procedures)
4. Caseworker training records
5. Prior complaints about caseworker
6. All communications about this case
7. Medical records reviewed
8. Photographs taken

### Depositions to Take:

1. **Caseworker** - Focus areas:
   - Training on constitutional rights
   - Why no warrant obtained
   - Why no safety plan offered
   - Policy compliance

2. **Supervisor** - Focus areas:
   - Approval process
   - Oversight of caseworker
   - Review of removal decision

### Interrogatories (See Discovery Tool):

- Pre-generated 20 interrogatories available
- Customized to this case's issues

---

## RISK ANALYSIS

### Litigation Risks:

**Medium Risk**: Judge may be deferential to CPS
**Mitigation**: Strong legal arguments, clear violations

**Low Risk**: Evidence admissibility challenges
**Mitigation**: Well-documented hearsay objections

### Ethical Considerations:

- ✅ No conflicts identified
- ✅ Competence: Consider CPS law specialist if needed
- ✅ Candor: Evidence supports claims

### Timeline Considerations:

- Emergency hearing: [DATE] - 72 hours
- Adjudication deadline: [DATE] - ASFA 60 days
- Permanency hearing: [DATE] - ASFA 12 months

---

## CASE LAW SUPPORT

**Fourth Amendment**:
- *Caniglia v. Strom*, 141 S. Ct. 1596 (2021)
- *Payton v. New York*, 445 U.S. 573 (1980)
- *Doe v. Heck*, 327 F.3d 492 (7th Cir. 2003)

**Due Process**:
- *Santosky v. Kramer*, 455 U.S. 745 (1982)
- *Troxel v. Granville*, 530 U.S. 57 (2000)
- *Stanley v. Illinois*, 405 U.S. 645 (1972)

**ASFA Reasonable Efforts**:
- 42 U.S.C. § 671(a)(15)
- *In re B.J.*, [STATE CITATION]

---

## RECOMMENDED NEXT STEPS

**Priority 1** (This Week):
1. Draft and file Motion to Suppress
2. Draft and file Motion to Dismiss  
3. File emergency motion for return/kinship placement

**Priority 2** (Within 30 Days):
1. Serve discovery requests
2. Retain forensic psychologist
3. File ADA accommodation request if applicable

**Priority 3** (Ongoing):
1. Document all visits/interactions
2. Comply with all court orders
3. Complete all required services

---

⚖️ **ATTORNEY RESPONSIBILITY NOTICE**

This analysis is AI-generated and provided as a research tool. You remain fully responsible for reviewing all information, verifying legal citations, ensuring jurisdiction-specific accuracy, applying professional judgment, and complying with rules of professional conduct. All AI-generated content must be reviewed and customized before use with clients.

---

**Analysis completed with Professional AI Analyst (Attorney Suite)**
Generated: ${new Date().toLocaleString()}
Confidence Level: High (Strong constitutional and statutory claims identified)`;
    } else {
      return `📋 **AI DOCUMENT ANALYSIS**

---

## SUMMARY

I've analyzed the document you provided. Based on the content, there appear to be several important legal issues you should discuss with your attorney.

---

## 🔍 POTENTIAL ISSUES IDENTIFIED

### 1. Possible Fourth Amendment Violation (Unlawful Entry)

**What This Means**: The Fourth Amendment protects you from unreasonable searches of your home. CPS generally needs either:
- Your voluntary consent, OR
- A search warrant, OR  
- True emergency circumstances

**What I Found**: The document indicates CPS entered your home without a warrant and possibly without proper consent or emergency circumstances.

**Why This Matters**: Evidence obtained through an unlawful search might be excluded from court. This is called a "motion to suppress evidence."

**Discuss With Your Attorney**: 
- Whether CPS had legal authority to enter your home
- If a motion to suppress evidence would be appropriate
- What "exigent circumstances" means in your state

### 2. Reasonable Efforts May Not Have Been Made

**What This Means**: Federal law (ASFA - Adoption and Safe Families Act) requires CPS to make "reasonable efforts" to prevent removing children from their parents. This might include:
- Offering a safety plan
- Providing services
- Investigating relatives who could help
- Trying less drastic alternatives

**What I Found**: The document suggests CPS may have removed children without first trying these alternatives.

**Why This Matters**: If CPS didn't make reasonable efforts, your attorney might be able to get your children returned or get the case dismissed.

**Discuss With Your Attorney**:
- Whether CPS offered you any services before removal
- If relatives were considered for placement
- Whether a "reasonable efforts" motion could help your case

### 3. Possible Procedural Due Process Issues

**What This Means**: You have a constitutional right to notice and a fair hearing before your children can be taken. This includes:
- Adequate notice of the hearing
- Time to prepare  
- Opportunity to be heard
- Right to an attorney

**What I Found**: There may have been issues with how much notice you received before the emergency hearing.

**Why This Matters**: Procedural violations can be grounds for challenging the removal.

**Discuss With Your Attorney**:
- Whether you received proper notice
- If you had enough time to prepare
- Your right to challenge procedural violations

### 4. Evidence Quality Concerns

**What This Means**: In court, evidence must meet certain standards:
- Hearsay (someone repeating what someone else said) is usually not allowed
- People must have personal knowledge of what they're testifying about
- Medical/psychological conclusions need qualified experts

**What I Found**: The document contains statements that might be hearsay or speculation rather than facts.

**Why This Matters**: Weak evidence can be challenged in court. Your attorney can object to inadmissible evidence.

**Discuss With Your Attorney**:
- Which statements might be hearsay
- What evidence is missing or weak
- How to challenge unreliable evidence

---

## ⚖️ RELEVANT LEGAL FRAMEWORK (Educational Reference)

**Fourth Amendment** (U.S. Constitution)
- Protects against unreasonable searches and seizures
- Generally requires warrant for home entry
- Exceptions exist for true emergencies

**Fourteenth Amendment** (U.S. Constitution)  
- Protects fundamental right to parent your children
- Requires due process before government can interfere
- "Substantive due process" means government needs good reasons

**ASFA** (Federal Law - 42 U.S.C. § 671)
- Requires "reasonable efforts" to prevent removal
- Sets timelines for hearings and permanency
- Protects family preservation when safe

**Your State's Laws**
- Each state has specific CPS procedures
- Your attorney will know your state's requirements
- State laws must meet federal minimum standards

---

## 💡 TOPICS TO DISCUSS WITH YOUR ATTORNEY

Here are specific questions to bring up:

**About the Entry**:
1. Did CPS have legal authority to enter without a warrant?
2. Should we file a motion to suppress evidence?
3. What does "exigent circumstances" mean in our state?

**About Reasonable Efforts**:
1. Did CPS violate reasonable efforts requirements?
2. Can we file a motion to challenge lack of reasonable efforts?
3. Were relatives properly investigated for placement?

**About Your Rights**:
1. Were my procedural rights violated?
2. What evidence can be challenged?
3. What are the deadlines I need to know about?

**About Strategy**:
1. What motions should we file?
2. What evidence do we need to gather?
3. What's our best path to reunification?

---

## 📁 EVIDENCE & DOCUMENTATION SUGGESTIONS

Start gathering and organizing:

**Documents to Collect**:
- All written communications with CPS
- Emails, texts, letters
- Court documents you've received
- Any recordings (if legal in your state)
- Photos of your home
- Medical records

**People to Identify**:
- Witnesses who were present during CPS interactions
- Relatives who could testify about your parenting
- Professionals who know your family (doctors, teachers)

**Timeline to Create**:
- Date and time of each CPS contact
- What was said and done
- Who was present
- What happened next

💡 **Tip**: Use the Timeline Builder in this app to organize all this information for your attorney!

---

## ⚠️ IMPORTANT REMINDER

**This analysis provides legal information for educational purposes only. This is NOT legal advice.**

Every case is unique, and laws vary significantly by state and even by county. What I've described here is general information about how CPS cases often work - but YOUR case has unique facts that only a licensed attorney can properly evaluate.

**You must consult with a licensed attorney in your jurisdiction** who can:
- Review your specific documents and facts
- Apply your state's specific laws
- Give you actual legal advice  
- Represent you in court
- File motions on your behalf

Do not make legal decisions based solely on this analysis. Use it to have an informed conversation with your attorney.

---

**Next Steps**:
1. ✅ Print or save this analysis
2. ✅ Contact a CPS defense attorney in your area  
3. ✅ Bring this analysis and all your documents to your attorney consultation
4. ✅ Ask the questions listed above
5. ✅ Follow your attorney's specific advice for YOUR case

---

**Analysis completed with Enhanced AI Assistant**
Generated: ${new Date().toLocaleString()}

Need help finding an attorney? Many areas have free legal aid for CPS cases. Search "[Your County] free legal aid child protective services" online.`;
    }
  };

  const generateMockViolationAnalysis = (tier: string, caseDetails: any, focusArea: string) => {
    if (tier === 'attorney') {
      return `# COMPREHENSIVE VIOLATION ANALYSIS

## Case: ${caseDetails.caseNumber || 'Not Provided'}
## State: ${caseDetails.state || 'Not Provided'}
## Analysis Type: Professional Legal Review (Attorney Suite)

---

## EXECUTIVE SUMMARY

**Total Violations Identified**: 12
**Constitutional Claims**: 3 (Strong)
**Federal Statutory Violations**: 4 (Moderate to Strong)
**Procedural Violations**: 5 (Strong)

**Recommended Immediate Action**: File emergency motion packet (3 motions) within 72 hours.

---

## I. CONSTITUTIONAL VIOLATIONS

### A. Fourth Amendment - Warrantless Search (STRONG CLAIM)

**Violation**: Entry without warrant, consent, or exigent circumstances
**Legal Standard**: *Caniglia v. Strom*, 141 S. Ct. 1596 (2021)
**Evidence**: Caseworker admission in report
**Remedy**: Motion to Suppress + § 1983 civil rights claim
**Damages Potential**: $25K-$100K (qualified immunity may apply)

**Litigation Strategy**:
- File motion to suppress immediately
- Preserve for § 1983 federal lawsuit
- Discovery: Caseworker training on 4th Amendment
- Expert: Constitutional law professor testimony

[Additional constitutional violations detailed...]

---

## II. FEDERAL STATUTORY VIOLATIONS

### A. ASFA - Reasonable Efforts (42 U.S.C. § 671(a)(15))

**Violation**: No services offered prior to removal
**Standard**: "Reasonable efforts to prevent removal"  
**Evidence**: 
- No safety plan documented
- No kinship investigation
- No referrals to services
**Remedy**: Motion to dismiss / Return children
**Case Law**: [State specific citations]

[Additional violations detailed...]

---

## III. DISCOVERY TARGETS

Based on violations identified, obtain:

1. **Caseworker's complete file**
2. **Supervisor's approval/oversight docs**
3. **Policy manual sections on:**
   - Emergency removal criteria
   - Reasonable efforts requirements  
   - Kinship investigation procedures
4. **Training records** (4th Amendment, ASFA compliance)
5. **Prior complaints** about this caseworker

---

## IV. MOTION PRACTICE ROADMAP

### Week 1:
- [ ] Motion to Suppress Evidence
- [ ] Motion to Dismiss (Reasonable Efforts)
- [ ] Emergency Motion for Kinship Placement

### Week 2-4:
- [ ] Discovery Requests (Interrogatories, RFP, RFA)
- [ ] Motion for Increased Visitation
- [ ] Motion for Independent Evaluation

### Months 2-3:
- [ ] Motion for Summary Judgment (if evidence supports)
- [ ] Motion in Limine (exclude inadmissible evidence)
- [ ] Trial preparation

---

## V. FEDERAL LITIGATION EVALUATION

**§ 1983 Viability**: HIGH

**Defendants**:
- Caseworker (individual capacity)
- Supervisor (individual capacity)  
- Agency (Monell claim - policy/custom)

**Claims**:
1. Fourth Amendment violation
2. Fourteenth Amendment substantive due process
3. Fourteenth Amendment procedural due process

**Qualified Immunity Analysis**: Likely overcome - clearly established rights violated

**Damages**: Emotional distress, loss of parental relationship, economic damages

---

⚖️ **ATTORNEY RESPONSIBILITY NOTICE**
[Full attorney disclaimer...]

**Analysis completed with Professional AI Analyst**`;
    } else {
      return `📋 **VIOLATION ANALYSIS**

I've analyzed your case for potential violations of your rights and CPS requirements. Here's what I found:

---

## 🚨 POTENTIAL VIOLATIONS IDENTIFIED

### 1. Fourth Amendment - Possible Illegal Entry

**What This Means**: The Constitution protects your home from unreasonable searches.

**What May Have Been Violated**: CPS may have entered your home without:
- A warrant
- Your true voluntary consent
- A real emergency

**Why This Matters**: Evidence from an illegal search might not be allowed in court.

**What To Do**: Ask your attorney about filing a "Motion to Suppress Evidence"

---

### 2. ASFA - Reasonable Efforts May Be Missing

**What This Means**: Federal law requires CPS to try to prevent removing children.

**What May Have Been Violated**: CPS may have failed to:
- Offer you services
- Investigate family members who could help
- Try a less drastic solution (like a safety plan)

**Why This Matters**: You might be able to get your children back if CPS didn't follow this law.

**What To Do**: Ask your attorney about a "Reasonable Efforts Motion"

---

[Additional violations in plain language...]

---

## 💡 WHAT TO DISCUSS WITH YOUR ATTORNEY

Bring these specific questions:

1. **About the violations I found**: "Did CPS violate my Fourth Amendment rights?"
2. **About remedies**: "Can we file motions based on these violations?"  
3. **About strategy**: "Which violations give us the strongest case?"

---

⚠️ **IMPORTANT REMINDER**

This is legal information, not legal advice. Every case is different. You must consult with a licensed attorney to get advice specific to YOUR situation.

**Analysis completed with Enhanced AI Assistant**`;
    }
  };

  const generateMockStrategy = (tier: string, caseDetails: any, violations: any[], goal: string) => {
    // Similar structure as above - tier-appropriate strategy generation
    return tier === 'attorney'
      ? `[Professional litigation strategy for attorneys...]`
      : `[Educational strategy information for parents...]`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="mb-2 text-purple-900 flex items-center gap-2">
              {isAttorney ? 'Professional AI Analyst' : 'Enhanced AI Assistant'}
              {isAttorney && (
                <Badge className="bg-slate-700 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Attorney Suite
                </Badge>
              )}
              {!isAttorney && isPremium && (
                <Badge className="bg-amber-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-purple-800">
              {isAttorney 
                ? 'Advanced AI research and analysis tool for licensed attorneys. Provides professional-grade legal analysis with appropriate disclaimers.'
                : 'Comprehensive AI-powered legal information assistant. Helps you understand your rights and prepare for attorney consultations.'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis Type Selection */}
      <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as any)}>
        <TabsList>
          <TabsTrigger value="document">
            <FileText className="w-4 h-4 mr-2" />
            Document Analysis
          </TabsTrigger>
          <TabsTrigger value="violation">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Violation Check
          </TabsTrigger>
          <TabsTrigger value="strategy">
            <Lightbulb className="w-4 h-4 mr-2" />
            Strategy {isAttorney ? 'Development' : 'Information'}
          </TabsTrigger>
        </TabsList>

        {/* Document Analysis Tab */}
        <TabsContent value="document" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <div className="text-sm mb-2">Document Content</div>
              <Textarea
                placeholder={isAttorney 
                  ? "Paste document text for professional legal analysis..." 
                  : "Paste document text for educational analysis..."
                }
                rows={10}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !input}>
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Violation Check Tab */}
        <TabsContent value="violation" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <div className="text-sm mb-2">Focus Area (Optional)</div>
              <Select value={focusArea} onValueChange={setFocusArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Violations</SelectItem>
                  <SelectItem value="constitutional">Constitutional Rights</SelectItem>
                  <SelectItem value="procedural">Procedural Issues</SelectItem>
                  <SelectItem value="evidence">Evidence Problems</SelectItem>
                  <SelectItem value="asfa">ASFA/Federal Law</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check for Violations
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <div className="text-sm mb-2">{isAttorney ? 'Client' : 'Your'} Goal</div>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reunification">Reunification</SelectItem>
                  <SelectItem value="dismissal">Case Dismissal</SelectItem>
                  <SelectItem value="kinship">Kinship Placement</SelectItem>
                  <SelectItem value="visitation">Increased Visitation</SelectItem>
                  {isAttorney && <SelectItem value="federal">Federal Litigation</SelectItem>}
                  {isAttorney && <SelectItem value="appeal">Appeal</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Strategy {isAttorney ? 'Plan' : 'Information'}
                </>
              )}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {result && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm">Analysis Results</div>
            <Badge variant="outline">
              {isAttorney ? 'Professional Grade' : 'Educational'}
            </Badge>
          </div>

          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
              {result}
            </pre>
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert className={isAttorney ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}>
        {isAttorney ? <Scale className="h-4 w-4 text-blue-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
        <AlertTitle className={isAttorney ? 'text-blue-900' : 'text-amber-900'}>
          {isAttorney ? 'Attorney Responsibility' : 'Important Legal Disclaimer'}
        </AlertTitle>
        <AlertDescription className={isAttorney ? 'text-blue-800 text-xs' : 'text-amber-800 text-xs'}>
          {disclaimer}
        </AlertDescription>
      </Alert>
    </div>
  );
}
