import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { 
  Sparkles, FileText, Scale, Gavel, Shield, 
  ClipboardList, BookOpen, Download, Copy, 
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Wand2, Lock, Crown
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner@2.0.3';

interface AIParalegalProps {
  caseDetails: any;
  violations: any;
  documents: any[];
  timelineEvents: any[];
  userState: string;
}

export function AIParalegal({ caseDetails, violations, documents, timelineEvents, userState }: AIParalegalProps) {
  const { isAttorney } = useSubscription();
  const [documentType, setDocumentType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options
  const [jurisdiction, setJurisdiction] = useState(userState || '');
  const [citationStyle, setCitationStyle] = useState('bluebook');
  const [tone, setTone] = useState('formal');

  if (!isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl mb-2">Attorney Suite Feature</h3>
        <p className="text-muted-foreground mb-4">
          AI Paralegal is available exclusively for Attorney Suite subscribers.
        </p>
        <Button>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Attorney Suite
        </Button>
      </Card>
    );
  }

  const documentTemplates = [
    {
      category: 'Motions',
      icon: FileText,
      items: [
        { value: 'motion-dismiss', label: 'Motion to Dismiss', description: 'Dismiss case for lack of evidence or jurisdiction' },
        { value: 'motion-suppress', label: 'Motion to Suppress Evidence', description: 'Suppress illegally obtained evidence' },
        { value: 'motion-reasonable-efforts', label: 'Motion - No Reasonable Efforts', description: 'Challenge CPS failure to make reasonable efforts' },
        { value: 'motion-return-custody', label: 'Motion to Return to Custody', description: 'Request immediate return of children' },
        { value: 'motion-change-placement', label: 'Motion to Change Placement', description: 'Request kinship or better placement' },
        { value: 'motion-visitation', label: 'Motion for Increased Visitation', description: 'Request more parenting time' }
      ]
    },
    {
      category: 'Discovery',
      icon: ClipboardList,
      items: [
        { value: 'interrogatories', label: 'Interrogatories', description: 'Written questions to opposing party' },
        { value: 'requests-admission', label: 'Requests for Admission', description: 'Request party admit/deny specific facts' },
        { value: 'requests-production', label: 'Requests for Production', description: 'Request documents and evidence' },
        { value: 'discovery-responses', label: 'Discovery Responses', description: 'Respond to opposing discovery' },
        { value: 'deposition-outline', label: 'Deposition Outline', description: 'Questions for deposition' }
      ]
    },
    {
      category: 'Federal Litigation',
      icon: Gavel,
      items: [
        { value: '1983-complaint', label: '42 U.S.C. § 1983 Complaint', description: 'Civil rights violation lawsuit' },
        { value: 'ada-complaint', label: 'ADA Title II Complaint', description: 'Americans with Disabilities Act claim' },
        { value: 'section-504', label: 'Section 504 Complaint', description: 'Rehabilitation Act violation' },
        { value: 'habeas-petition', label: 'Habeas Corpus Petition', description: 'Challenge unlawful custody' },
        { value: 'rico-outline', label: 'RICO Claim Outline', description: 'Racketeering claim framework' },
        { value: 'monell-claim', label: 'Monell Policy Claim', description: 'Municipal liability claim' }
      ]
    },
    {
      category: 'Appeals',
      icon: Scale,
      items: [
        { value: 'notice-appeal', label: 'Notice of Appeal', description: 'Initiate appellate process' },
        { value: 'appellate-brief', label: 'Appellate Brief', description: 'Comprehensive appeal brief' },
        { value: 'assignments-error', label: 'Assignments of Error', description: 'List trial court errors' },
        { value: 'motion-supplement-record', label: 'Motion to Supplement Record', description: 'Add missing evidence to record' }
      ]
    },
    {
      category: 'Memoranda & Research',
      icon: BookOpen,
      items: [
        { value: 'memo-law', label: 'Memorandum of Law', description: 'Legal research memo supporting motion' },
        { value: 'trial-brief', label: 'Trial Brief', description: 'Pre-trial legal arguments' },
        { value: 'case-summary', label: 'Case Law Summary', description: 'Summarize relevant precedent' }
      ]
    },
    {
      category: 'ADA & Accommodations',
      icon: Shield,
      items: [
        { value: 'ada-violation-notice', label: 'ADA Violation Notice', description: 'Notice of disability discrimination' },
        { value: 'accommodation-request', label: 'Reasonable Accommodation Request', description: 'Formal ADA accommodation request' },
        { value: 'independent-eval-request', label: 'Independent Evaluation Request', description: 'Request IEE for child' }
      ]
    }
  ];

  const handleGenerate = async () => {
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const template = documentTemplates
        .flatMap(cat => cat.items)
        .find(item => item.value === documentType);
      
      let mockDocument = '';
      
      if (documentType === 'motion-suppress') {
        mockDocument = generateMotionToSuppress();
      } else if (documentType === '1983-complaint') {
        mockDocument = generate1983Complaint();
      } else if (documentType === 'interrogatories') {
        mockDocument = generateInterrogatories();
      } else if (documentType === 'appellate-brief') {
        mockDocument = generateAppellateBrief();
      } else if (documentType === 'ada-violation-notice') {
        mockDocument = generateADANotice();
      } else {
        mockDocument = generateGenericDocument(template?.label || 'Document');
      }
      
      setGeneratedDocument(mockDocument);
      setIsGenerating(false);
      toast.success('Document generated! Please review and customize before filing.');
    }, 2000);
  };

  const generateMotionToSuppress = () => {
    return `IN THE ${jurisdiction.toUpperCase()} DISTRICT COURT
${caseDetails.county || '[COUNTY]'}, ${jurisdiction.toUpperCase()}

IN THE INTEREST OF:                    §
                                        §
${caseDetails.caseNumber || '[CASE NUMBER]'}      §

MOTION TO SUPPRESS EVIDENCE AND MEMORANDUM IN SUPPORT

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES [CLIENT NAME], Respondent in the above-entitled and numbered cause, and files this Motion to Suppress Evidence and Memorandum in Support, and would respectfully show the Court as follows:

I. INTRODUCTION

Respondent moves this Court to suppress all evidence obtained as a result of the warrantless entry and search of Respondent's home on [DATE]. The evidence was obtained in violation of Respondent's Fourth Amendment rights under the United States Constitution and Article I, Section 9 of the ${jurisdiction} Constitution.

II. STATEMENT OF FACTS

1. On [DATE], caseworker [CASEWORKER NAME] from the Department of Family and Protective Services arrived at Respondent's residence without a warrant.

2. Respondent did not consent to entry or search of the premises.

3. No exigent circumstances existed that would justify a warrantless entry.

4. The caseworker threatened to obtain a court order if Respondent did not allow entry.

5. Under duress and coercion, Respondent permitted entry.

6. All observations, statements, and evidence collected during this unlawful entry should be suppressed.

III. ARGUMENT AND AUTHORITIES

A. The Fourth Amendment Prohibits Warrantless Home Searches

The Fourth Amendment to the United States Constitution provides:

    "The right of the people to be secure in their persons, houses, papers, and effects, 
    against unreasonable searches and seizures, shall not be violated..."

The "physical entry of the home is the chief evil against which the wording of the Fourth Amendment is directed." Payton v. New York, 445 U.S. 573, 585 (1980).

B. CPS's Entry Was Not Justified By Exigent Circumstances

Warrantless entry is permitted only when exigent circumstances exist. The Supreme Court has held that the "community caretaking" exception does not apply to homes. Caniglia v. Strom, 141 S. Ct. 1596 (2021).

In Caniglia, the Court rejected the argument that officers may enter homes without warrants to perform "community caretaking functions." The Court emphasized that "the very core" of the Fourth Amendment is "the right of a man to retreat into his own home and there be free from unreasonable governmental intrusion."

Here, there were no exigent circumstances. No child was in immediate danger. No emergency existed. CPS's entry was unlawful.

C. Evidence Obtained Must Be Suppressed Under the Exclusionary Rule

Evidence obtained in violation of the Fourth Amendment must be suppressed. Mapp v. Ohio, 367 U.S. 643 (1961). The exclusionary rule applies to child welfare proceedings. See In re B.J., [CITATION].

IV. PRAYER

WHEREFORE, PREMISES CONSIDERED, Respondent respectfully requests that this Court:

1. Grant this Motion to Suppress Evidence;
2. Suppress all evidence, observations, and statements obtained as a result of the unlawful entry;
3. Grant such other and further relief to which Respondent may be justly entitled.

Respectfully submitted,

_________________________________
[ATTORNEY NAME]
[BAR NUMBER]
[FIRM NAME]
[ADDRESS]
[PHONE]
[EMAIL]

ATTORNEY FOR RESPONDENT

CERTIFICATE OF SERVICE

I hereby certify that a true and correct copy of the foregoing Motion to Suppress Evidence has been served upon all parties of record on this ___ day of __________, 20__.

_________________________________
[ATTORNEY NAME]

---
ATTORNEY REVIEW REQUIRED: This document is AI-generated and must be reviewed, verified, 
and customized by a licensed attorney before filing. All citations must be verified for 
accuracy and jurisdiction-specific applicability.`;
  };

  const generate1983Complaint = () => {
    return `UNITED STATES DISTRICT COURT
[DISTRICT] OF ${jurisdiction.toUpperCase()}

[PLAINTIFF NAME],                       §
                                        §
                  Plaintiff,            §
                                        §
v.                                      §    CIVIL ACTION NO. __________
                                        §
[DEFENDANTS],                           §
                                        §    JURY TRIAL DEMANDED
                  Defendants.           §

COMPLAINT FOR VIOLATION OF CIVIL RIGHTS
42 U.S.C. § 1983

Plaintiff [NAME], by and through undersigned counsel, files this Complaint against Defendants 
for violations of Plaintiff's constitutional rights under 42 U.S.C. § 1983, and alleges as follows:

I. PARTIES

1. Plaintiff [NAME] is a resident of [COUNTY], ${jurisdiction}.

2. Defendant [CPS CASEWORKER NAME] is a social worker employed by the Department of Family 
and Protective Services, acting under color of state law.

3. Defendant [SUPERVISOR NAME] is a supervisor at DFPS, acting under color of state law.

4. All Defendants are sued in their individual and official capacities.

II. JURISDICTION AND VENUE

5. This Court has jurisdiction under 28 U.S.C. §§ 1331 and 1343 (civil rights).

6. Venue is proper under 28 U.S.C. § 1391 because the events occurred in this district.

III. FACTUAL ALLEGATIONS

7. On [DATE], Defendants violated Plaintiff's Fourth Amendment rights by conducting a 
warrantless search of Plaintiff's home without consent or exigent circumstances.

8. Defendants violated Plaintiff's Fourteenth Amendment substantive due process rights by 
removing Plaintiff's children without proper justification.

9. Defendants fabricated evidence and made false statements in court filings.

10. Defendants acted with deliberate indifference to Plaintiff's constitutional rights.

IV. CAUSES OF ACTION

COUNT I: FOURTH AMENDMENT VIOLATION (Unlawful Search)

11. Plaintiff incorporates all previous allegations.

12. Defendants' warrantless entry and search violated Plaintiff's Fourth Amendment rights.

13. No consent or exigent circumstances justified the search.

14. The violation was objectively unreasonable.

COUNT II: FOURTEENTH AMENDMENT VIOLATION (Substantive Due Process)

15. Plaintiff incorporates all previous allegations.

16. Plaintiff has a fundamental liberty interest in the care, custody, and management of 
her children. Troxel v. Granville, 530 U.S. 57 (2000).

17. Defendants' removal of Plaintiff's children without proper justification "shocks the 
conscience" and violates substantive due process.

COUNT III: FOURTEENTH AMENDMENT VIOLATION (Procedural Due Process)

18. Plaintiff was denied adequate notice and opportunity to be heard before removal.

19. Defendants failed to provide required procedural protections.

V. DAMAGES

20. As a direct and proximate result of Defendants' actions, Plaintiff has suffered:
    a. Emotional distress and mental anguish
    b. Loss of parental relationship with children
    c. Damage to reputation
    d. Economic damages

VI. PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests:

A. Judgment against Defendants for violations of 42 U.S.C. § 1983;
B. Compensatory damages;
C. Punitive damages;
D. Attorneys' fees and costs under 42 U.S.C. § 1988;
E. Such other relief as the Court deems just and proper.

JURY TRIAL DEMANDED

Respectfully submitted,

_________________________________
[ATTORNEY NAME]
[BAR NUMBER]
[FIRM NAME]
[ADDRESS]
[PHONE]
[EMAIL]

ATTORNEY FOR PLAINTIFF

---
ATTORNEY REVIEW REQUIRED: Federal complaints require careful review. Verify all 
jurisdictional requirements, statute of limitations, and Eleventh Amendment immunity issues.`;
  };

  const generateInterrogatories = () => {
    return `IN THE ${jurisdiction.toUpperCase()} DISTRICT COURT
${caseDetails.county || '[COUNTY]'}, ${jurisdiction.toUpperCase()}

IN THE INTEREST OF:                    §
                                        §
${caseDetails.caseNumber || '[CASE NUMBER]'}      §

RESPONDENT'S FIRST SET OF INTERROGATORIES TO PETITIONER

TO: [COUNTY] DEPARTMENT OF FAMILY AND PROTECTIVE SERVICES

Respondent [NAME] requests that Petitioner answer the following interrogatories fully and under 
oath within thirty (30) days from the date of service, pursuant to [STATE CIVIL PROCEDURE RULES].

DEFINITIONS

"You" or "Your" refers to the Department of Family and Protective Services and its agents.
"Child" or "Children" refers to [CHILD NAMES].
"Removal" refers to the taking of the Children from Respondent's custody on [DATE].

INTERROGATORIES

INTERROGATORY NO. 1:
State the factual basis for your belief that the Children were in immediate danger on [DATE].

INTERROGATORY NO. 2:
Identify every person interviewed during your investigation and state the date and substance 
of each interview.

INTERROGATORY NO. 3:
Identify all evidence you obtained to support the allegations in your petition.

INTERROGATORY NO. 4:
State whether you conducted a criminal background check on Respondent. If so, identify all 
criminal history found.

INTERROGATORY NO. 5:
Identify all services offered to Respondent before removal of the Children.

INTERROGATORY NO. 6:
State whether you investigated kinship placement before placing the Children in foster care. 
If so, identify all relatives contacted.

INTERROGATORY NO. 7:
Identify the caseworker's supervisor and state what supervision was provided during this investigation.

INTERROGATORY NO. 8:
State whether a safety plan was offered to Respondent before removal. If not, explain why not.

INTERROGATORY NO. 9:
Identify all CPS policies and procedures allegedly violated by Respondent.

INTERROGATORY NO. 10:
State whether you obtained consent before entering Respondent's home on [DATE]. If not, 
state the legal basis for entry without consent.

INTERROGATORY NO. 11:
Identify all exigent circumstances that allegedly justified warrantless entry and removal.

INTERROGATORY NO. 12:
State whether the Children showed any signs of physical abuse during your examination. If 
so, describe in detail.

INTERROGATORY NO. 13:
Identify all medical professionals who examined the Children and state their findings.

INTERROGATORY NO. 14:
State whether any drug tests were administered to Respondent. If so, state the results.

INTERROGATORY NO. 15:
Identify all efforts made to reunify Respondent with the Children since removal.

INTERROGATORY NO. 16:
State the factual basis for any allegation of neglect.

INTERROGATORY NO. 17:
Identify all witnesses you intend to call at trial.

INTERROGATORY NO. 18:
State whether you recorded any conversations with Respondent. If so, identify all recordings.

INTERROGATORY NO. 19:
Identify all complaints or reports made about Respondent to CPS within the past five years.

INTERROGATORY NO. 20:
State the date Respondent was provided a copy of the removal affidavit.

Respectfully submitted,

_________________________________
[ATTORNEY NAME]
[BAR NUMBER]

CERTIFICATE OF SERVICE
[Standard certificate language]

---
ATTORNEY NOTE: Customize interrogatories based on specific case facts. Verify compliance 
with state-specific discovery rules and limits on number of interrogatories.`;
  };

  const generateAppellateBrief = () => {
    return `[APPELLATE COURT NAME]
${jurisdiction.toUpperCase()}

[APPELLANT NAME],                       §
                                        §
                  Appellant,            §    NO. ${caseDetails.caseNumber || '[APPEAL NO.]'}
                                        §
v.                                      §    Appeal from [TRIAL COURT]
                                        §    ${caseDetails.county || '[COUNTY]'}, ${jurisdiction}
[APPELLEE NAME],                        §
                                        §
                  Appellee.             §

APPELLANT'S BRIEF

IDENTITY OF PARTIES AND COUNSEL

Appellant: [NAME]
Attorney for Appellant: [YOUR NAME, ADDRESS, PHONE, EMAIL, BAR NO.]

Appellee: [NAME]
Attorney for Appellee: [NAME, ADDRESS]

STATEMENT OF THE CASE

Nature of the Case: This is an appeal from [describe type of order].

Trial Court Disposition: [Describe ruling being appealed].

STATEMENT REGARDING ORAL ARGUMENT

Appellant requests oral argument. This case involves [state why oral argument is appropriate].

ISSUES PRESENTED

I. WHETHER THE TRIAL COURT ERRED IN [FIRST ISSUE]

II. WHETHER THE TRIAL COURT ERRED IN [SECOND ISSUE]

STATEMENT OF FACTS

[Detailed factual background with record citations]

SUMMARY OF THE ARGUMENT

The trial court committed reversible error by [summarize main arguments]. This Court should 
reverse and [requested relief].

ARGUMENT

I. THE TRIAL COURT ERRED IN [FIRST ISSUE]

   A. Standard of Review
   
   [State appropriate standard: abuse of discretion, de novo, substantial evidence, etc.]

   B. Applicable Law
   
   [Cite relevant statutes and case law]

   C. Application to This Case
   
   [Apply law to facts with record citations]

II. THE TRIAL COURT ERRED IN [SECOND ISSUE]

   [Repeat structure]

CONCLUSION AND PRAYER

The trial court's [ORDER] should be reversed because [reasons]. Appellant respectfully requests 
that this Court reverse the trial court's decision and [specific relief requested].

Respectfully submitted,

_________________________________
[ATTORNEY NAME]
[BAR NUMBER]

CERTIFICATE OF COMPLIANCE

I certify that this brief complies with [applicable rules regarding length, font, etc.].

CERTIFICATE OF SERVICE

[Standard certificate]

---
ATTORNEY REVIEW ESSENTIAL: Appellate briefs require strict compliance with court rules. 
Verify all citations, ensure proper formatting, and confirm deadlines. Consider retention 
of appellate specialist if this is not your primary practice area.`;
  };

  const generateADANotice = () => {
    return `[DATE]

[RECIPIENT NAME]
[TITLE]
[AGENCY NAME]
[ADDRESS]

RE: Notice of Americans with Disabilities Act Violation
    Client: [CLIENT NAME]
    Matter: [CASE NUMBER]

Dear [RECIPIENT]:

This office represents [CLIENT NAME] ("Client") regarding violations of the Americans with 
Disabilities Act, 42 U.S.C. § 12101 et seq., and Section 504 of the Rehabilitation Act, 29 U.S.C. § 794.

I. BACKGROUND

Client has a documented disability: [SPECIFY DISABILITY]. This disability substantially limits 
one or more major life activities. Client is a qualified individual with a disability under the ADA.

Your agency is a "public entity" subject to Title II of the ADA and Section 504.

II. ADA VIOLATIONS

Your agency has violated the ADA in the following ways:

A. Failure to Provide Reasonable Accommodations

Client requested the following reasonable accommodations:
[LIST ACCOMMODATIONS REQUESTED]

These accommodations were denied without proper consideration or interactive process.

B. Disability Discrimination

Your agency has discriminated against Client on the basis of disability by:
[SPECIFY DISCRIMINATORY ACTIONS]

C. Failure to Engage in Interactive Process

The ADA requires public entities to engage in an "interactive process" to determine appropriate 
accommodations. Your agency failed to do so.

III. LEGAL REQUIREMENTS

Title II of the ADA provides:

    "No qualified individual with a disability shall, by reason of such disability, be excluded 
    from participation in or be denied the benefits of the services, programs, or activities of 
    a public entity, or be subjected to discrimination by any such entity." 42 U.S.C. § 12132.

Public entities must make "reasonable modifications" to policies, practices, and procedures to 
avoid discrimination. 28 C.F.R. § 35.130(b)(7).

IV. REQUESTED CORRECTIVE ACTION

To remedy these violations, we request that your agency immediately:

1. Provide the requested reasonable accommodations;
2. Cease all discriminatory practices;
3. Engage in the interactive process in good faith;
4. Train staff on ADA compliance;
5. Revise policies to ensure ADA compliance.

V. FEDERAL REMEDIES AVAILABLE

If these violations are not remedied within thirty (30) days, Client may pursue the following remedies:

• Private right of action under 42 U.S.C. § 12133
• Damages
• Injunctive relief
• Attorneys' fees and costs under 42 U.S.C. § 12205

Please contact me within fourteen (14) days to discuss resolution of this matter.

Sincerely,

_________________________________
[ATTORNEY NAME]
[BAR NUMBER]
[FIRM NAME]
[CONTACT INFORMATION]

cc: [SUPERVISOR]
    [ADA COORDINATOR]
    
---
ATTORNEY NOTE: ADA claims have specific procedural requirements. Consider whether 
administrative exhaustion is required. Document all accommodation requests and denials.`;
  };

  const generateGenericDocument = (title: string) => {
    return `[ATTORNEY LETTERHEAD]

${title.toUpperCase()}

[This is a template for ${title}. The AI Paralegal would generate specific content based 
on your case facts, selected document type, and custom prompts.]

Case: ${caseDetails.caseNumber || '[CASE NUMBER]'}
Client: [CLIENT NAME]
Jurisdiction: ${jurisdiction || '[JURISDICTION]'}

[Document content would be generated here based on:
- Document type selected
- Custom prompts provided
- Case facts from your uploaded documents
- Identified violations
- Timeline events
- Jurisdiction-specific laws and procedures]

Key Elements Included:
✓ Proper formatting for ${jurisdiction} courts
✓ Relevant case law citations
✓ Specific factual allegations
✓ Legal arguments
✓ Prayer for relief

---
ATTORNEY REVIEW REQUIRED: All AI-generated documents must be thoroughly reviewed, 
verified for accuracy, and customized to your specific case before filing or use.

Generated: ${new Date().toLocaleString()}
Credits Used: 1 of 1,000 monthly`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocument);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-${Date.now()}.txt`;
    a.click();
    toast.success('Document downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="mb-2 text-purple-900 flex items-center gap-2">
              AI Paralegal - Attorney-Grade Document Drafting
              <Badge className="bg-purple-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Attorney Suite
              </Badge>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Generate professional legal documents using AI. Supports motions, briefs, discovery, federal 
              litigation, appeals, and more. All outputs require attorney review and customization.
            </p>
            <div className="flex items-center gap-4 text-xs text-purple-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                950/1,000 credits remaining
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Court-ready formatting
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Case law citations
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Attorney Ethics Warning */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Professional Responsibility Notice</AlertTitle>
        <AlertDescription className="text-amber-800">
          You remain fully responsible for all generated content. Every document must be reviewed for 
          accuracy, verified for jurisdiction-specific applicability, and customized to your client's 
          unique facts before use or filing. This tool provides drafting assistance, not legal advice.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Document Selection */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4">
              <div className="text-sm mb-2">Document Type</div>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document to generate..." />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {documentTemplates.map((category) => (
                    <div key={category.category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                        {category.category}
                      </div>
                      {category.items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <div>
                            <div>{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <div className="text-sm mb-2">Custom Instructions (Optional)</div>
              <Textarea
                placeholder="E.g., 'Focus on Fourth Amendment violations based on warrantless entry' or 'Include arguments about failure to investigate kinship placement'..."
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between"
              >
                <span>Advanced Options</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {showAdvanced && (
                <div className="mt-3 space-y-3 p-4 bg-muted rounded-lg">
                  <div>
                    <label className="text-xs mb-1 block">Jurisdiction</label>
                    <Input
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder="e.g., Texas, California"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Citation Style</label>
                    <Select value={citationStyle} onValueChange={setCitationStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bluebook">Bluebook</SelectItem>
                        <SelectItem value="alwd">ALWD</SelectItem>
                        <SelectItem value="local">Local Court Rules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                        <SelectItem value="conciliatory">Conciliatory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!documentType || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>
          </Card>

          {/* Quick Templates */}
          <Card className="p-5">
            <div className="text-sm mb-3">Popular Templates</div>
            <div className="space-y-2">
              {[
                { label: 'Motion to Suppress', value: 'motion-suppress', icon: FileText },
                { label: '§ 1983 Complaint', value: '1983-complaint', icon: Gavel },
                { label: 'Discovery Interrogatories', value: 'interrogatories', icon: ClipboardList },
                { label: 'Appellate Brief', value: 'appellate-brief', icon: Scale }
              ].map((template) => {
                const Icon = template.icon;
                return (
                  <Button
                    key={template.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setDocumentType(template.value)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {template.label}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Generated Document */}
        <div>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm">Generated Document</div>
              {generatedDocument && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {generatedDocument ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg min-h-[600px] max-h-[600px] overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {generatedDocument}
                  </pre>
                </div>

                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-900">ATTORNEY REVIEW REQUIRED</AlertTitle>
                  <AlertDescription className="text-red-800 text-xs">
                    This AI-generated document must be reviewed by you for accuracy, completeness, 
                    and applicability to your jurisdiction and case. Verify all citations, customize 
                    to specific facts, and ensure compliance with court rules before filing.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="min-h-[600px] flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Select a document type and click Generate</p>
                  <p className="text-xs mt-2">AI will draft a professional legal document based on your case</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
