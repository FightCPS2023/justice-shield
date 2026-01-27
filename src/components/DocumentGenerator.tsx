import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Download, Copy, Mail, FileEdit, Scale, Shield } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";

interface Document {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface Violations {
  [key: string]: boolean;
}

interface DocumentGeneratorProps {
  violations: Violations;
  documents: Document[];
  timelineEvents: TimelineEvent[];
  caseDetails: {
    caseNumber: string;
    county: string;
    dateOpened: string;
    caseworker: string;
    attorney: string;
  };
  userState?: string;
}

export function DocumentGenerator({ violations, documents, timelineEvents, caseDetails, userState }: DocumentGeneratorProps) {
  const [parentInfo, setParentInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    childrenNames: "",
  });

  const violationLabels: { [key: string]: string } = {
    fourthAmendment: "Fourth Amendment Violation (Illegal Search/Seizure)",
    fourteenthAmendment: "Fourteenth Amendment Violation (Due Process)",
    firstAmendment: "First Amendment Violation (Free Speech/Religion)",
    noMirandaRights: "No Miranda Rights Given",
    noWrittenNotice: "No Written Notice Provided",
    improperInvestigation: "Improper Investigation Conducted",
    missedDeadlines: "Missed Legal Deadlines",
    noSafetyPlan: "No Safety Plan Offered",
    noReasonableEfforts: "No Reasonable Efforts Made",
    falsifiedReports: "Falsified or Misleading Reports",
    hearsayEvidence: "Hearsay Evidence Used",
    noPhysicalEvidence: "No Physical Evidence",
    biasedInvestigation: "Biased Investigation",
    cherryPickedEvidence: "Cherry-Picked Evidence",
    deniedLegalCounsel: "Denied Legal Counsel",
    forcedToSign: "Forced to Sign Documents",
    deniedVisitation: "Denied Visitation Rights",
    noInterpreter: "No Interpreter Provided",
    noServicesOffered: "No Services Offered",
    inappropriatePlacement: "Inappropriate Placement",
    separatedSiblings: "Separated Siblings",
    noRelativePlacement: "No Relative Placement Considered",
  };

  const selectedViolations = Object.keys(violations).filter((key) => violations[key]);

  const generateCaseAnalysis = () => {
    const today = new Date().toLocaleDateString();
    
    return `CASE ANALYSIS REPORT
Date: ${today}
Case Number: ${caseDetails.caseNumber || "[CASE NUMBER]"}
County: ${caseDetails.county || "[COUNTY]"}

EXECUTIVE SUMMARY

Based on a comprehensive review of the case materials, timeline of events, and applicable law, this analysis identifies significant deficiencies in the CPS investigation and proceedings. The following violations and procedural errors have been documented, each of which undermines the legal basis for CPS intervention and creates grounds for dismissal or case modification.

IDENTIFIED VIOLATIONS (${selectedViolations.length} Total)

${selectedViolations.length > 0 ? selectedViolations.map((key, index) => `${index + 1}. ${violationLabels[key]}`).join('\n') : 'No violations have been identified yet. Please complete the Violations tab to generate a comprehensive analysis.'}

DETAILED FINDINGS

${selectedViolations.map((key, index) => {
  const label = violationLabels[key];
  let analysis = "";
  
  switch(key) {
    case "fourthAmendment":
      analysis = "The Fourth Amendment protects citizens from unreasonable searches and seizures. CPS workers do not have blanket authority to enter homes, search property, or interview children without consent or a warrant. Evidence obtained through illegal searches must be suppressed and cannot form the basis for removal or case findings.";
      break;
    case "fourteenthAmendment":
      analysis = "The Fourteenth Amendment guarantees due process rights, including the right to notice, the right to be heard, and the right to challenge evidence. Violations of due process are fundamental constitutional errors that undermine the entire case.";
      break;
    case "noWrittenNotice":
      analysis = "Parents have a constitutional right to written notice of allegations, hearings, and their rights. Failure to provide proper written notice violates due process and may render subsequent proceedings invalid.";
      break;
    case "improperInvestigation":
      analysis = "CPS is required to conduct thorough, unbiased investigations. Failures to interview relevant witnesses, consider exculpatory evidence, or follow investigation protocols demonstrate investigatory negligence and bias.";
      break;
    case "missedDeadlines":
      analysis = "State law imposes strict deadlines for hearings, case plans, and reviews. Missed deadlines violate statutory requirements and may provide grounds for dismissal or case modification.";
      break;
    case "noReasonableEfforts":
      analysis = "CPS is legally required to make 'reasonable efforts' to prevent removal and achieve reunification. Failure to provide services, referrals, or support demonstrates that removal was premature and unjustified.";
      break;
    case "falsifiedReports":
      analysis = "Falsified, exaggerated, or misleading reports constitute fraud upon the court. Documentary evidence contradicting CPS reports destroys their credibility and may warrant sanctions against the agency.";
      break;
    case "hearsayEvidence":
      analysis = "Hearsay evidence is generally inadmissible unless it falls within specific exceptions. CPS reliance on uncorroborated hearsay violates evidentiary rules and denies parents the right to confront witnesses.";
      break;
    case "noPhysicalEvidence":
      analysis = "Cases lacking physical evidence of abuse or neglect rely entirely on subjective opinions and uncorroborated statements. This evidentiary deficiency fails to meet the legal burden of proof.";
      break;
    case "deniedLegalCounsel":
      analysis = "Parents have a constitutional right to legal representation in dependency proceedings. Denial of this right or interference with attorney-client communications constitutes reversible error.";
      break;
    case "deniedVisitation":
      analysis = "Denial of visitation without documented safety concerns violates parental rights and hinders reunification efforts. Courts disfavor visitation restrictions absent compelling evidence.";
      break;
    default:
      analysis = "This violation represents a significant procedural or legal deficiency that undermines CPS's case and provides grounds for legal challenge.";
  }
  
  return `
${index + 1}. ${label}

${analysis}

Recommended Action: Document this violation thoroughly, gather supporting evidence, and raise this issue in court filings and hearings. Consult with your attorney about filing a motion addressing this specific violation.
`;
}).join('\n')}

TIMELINE ANALYSIS

${timelineEvents.length > 0 ? `The following timeline demonstrates the sequence of events in this case:\n\n${timelineEvents.map(event => `• ${new Date(event.date).toLocaleDateString()}: ${event.title}\n  ${event.description}`).join('\n\n')}` : 'No timeline events documented yet.'}

EVIDENTIARY ANALYSIS

Documents Reviewed: ${documents.length}
${documents.length > 0 ? `\n${documents.map((doc, i) => `${i + 1}. ${doc.title} (${new Date(doc.date).toLocaleDateString()})`).join('\n')}` : ''}

LEGAL STRATEGY RECOMMENDATIONS

1. IMMEDIATE ACTIONS
   • File motion to dismiss based on procedural violations
   • Request all CPS records through discovery
   • Document all violations in sworn affidavit
   • Demand compliance with legal requirements

2. MOTION PRACTICE
   • Motion to Suppress illegally obtained evidence
   • Motion to Dismiss for failure to state a claim
   • Motion for Return of Children based on violation of rights
   • Motion to Compel CPS compliance with statutory duties

3. DEFENSE STRATEGY
   • Challenge CPS credibility through documented falsehoods
   • Present exculpatory evidence CPS ignored
   • Demonstrate bias and predetermined outcome
   • Show lack of reasonable efforts

4. AFFIRMATIVE STEPS
   • Complete all requested services proactively
   • Document safe, stable home environment
   • Gather character witnesses
   • Maintain detailed logs of all CPS interactions

CONCLUSION

The violations and deficiencies identified in this analysis provide substantial grounds for legal challenge. The cumulative effect of these errors demonstrates that CPS has failed to meet its legal burden and has violated constitutional and statutory protections. Immediate legal action is recommended to protect parental rights and achieve reunification.

This analysis should be reviewed with qualified legal counsel and used to develop comprehensive litigation strategy.

---
Generated: ${today}
This is an educational tool. Consult with a licensed attorney.`;
  };

  const generateAffidavit = () => {
    const today = new Date().toLocaleDateString();
    
    return `AFFIDAVIT OF ${parentInfo.fullName.toUpperCase() || "[YOUR NAME]"}

STATE OF [YOUR STATE]
COUNTY OF ${caseDetails.county?.toUpperCase() || "[YOUR COUNTY]"}

I, ${parentInfo.fullName || "[Your Full Name]"}, being first duly sworn, depose and state as follows:

1. PERSONAL INFORMATION

I am the parent of ${parentInfo.childrenNames || "[Child/Children Names]"} and have personal knowledge of the facts stated in this affidavit.

My current address is: ${parentInfo.address || "[Your Address]"}
My phone number is: ${parentInfo.phone || "[Your Phone]"}
My email is: ${parentInfo.email || "[Your Email]"}

2. CASE BACKGROUND

This affidavit is submitted in connection with Case Number ${caseDetails.caseNumber || "[Case Number]"}, currently pending in ${caseDetails.county || "[County]"} County.

The case was opened on or about ${caseDetails.dateOpened ? new Date(caseDetails.dateOpened).toLocaleDateString() : "[Date]"}.

The assigned caseworker is ${caseDetails.caseworker || "[Caseworker Name]"}.

3. VIOLATIONS OF MY RIGHTS

I declare under penalty of perjury that CPS has violated my rights in the following ways:

${selectedViolations.map((key, index) => `${index + 1}. ${violationLabels[key]}
   [Describe specific facts, dates, and circumstances of this violation]
`).join('\n')}

4. TIMELINE OF EVENTS

${timelineEvents.length > 0 ? timelineEvents.map((event, i) => `${i + 1}. On ${new Date(event.date).toLocaleDateString()}: ${event.title}
   ${event.description}`).join('\n\n') : '[Describe chronological sequence of events]'}

5. FACTUAL DISPUTES WITH CPS REPORTS

I dispute the following statements in CPS reports and documents:

[List specific statements from CPS reports that are false or misleading, with explanation of the true facts]

6. EVIDENCE OF SAFE HOME ENVIRONMENT

I maintain a safe and appropriate home for my child/children, as evidenced by:

• Clean, safe housing with adequate space and amenities
• Stable income and ability to provide for children's needs
• No safety hazards or dangerous conditions
• Appropriate sleeping arrangements
• Food, clothing, and necessities available
• [Add specific details about your home and situation]

7. COMPLIANCE WITH REQUESTS

I have complied with all reasonable requests from CPS, including:

• [List services, classes, evaluations you have completed]
• [List appointments attended]
• [List requested documentation provided]

8. LACK OF REASONABLE EFFORTS BY CPS

CPS has failed to make reasonable efforts to prevent removal or achieve reunification:

• Failed to offer services prior to removal
• Failed to consider relative placement
• Failed to accommodate my work schedule for visits
• [Add specific examples of CPS failures]

9. REQUEST FOR RELIEF

Based on the violations of my rights and the lack of evidence supporting CPS allegations, I respectfully request:

• Immediate return of my children to my custody
• Dismissal of the case
• Increased visitation pending resolution
• Provision of services to support reunification
• [Other specific requests]

10. DECLARATION

I declare under penalty of perjury under the laws of the State of [Your State] that the foregoing is true and correct to the best of my knowledge and belief.

Executed on ${today}


_________________________________
${parentInfo.fullName || "[Your Signature]"}
${parentInfo.fullName || "[Your Printed Name]"}


NOTARY SECTION
[To be completed by notary public]

---
This is a template. Have it reviewed by your attorney before filing.`;
  };

  const generateMotionToDismiss = () => {
    return `MOTION TO DISMISS

IN THE [COURT NAME]
FOR ${caseDetails.county?.toUpperCase() || "[COUNTY]"} COUNTY

In re: ${parentInfo.childrenNames || "[Children's Names]"}

Case No.: ${caseDetails.caseNumber || "[Case Number]"}

MOTION TO DISMISS DEPENDENCY PETITION

COMES NOW ${parentInfo.fullName || "[Parent Name]"}, parent and respondent in the above-captioned matter, and respectfully moves this Court to dismiss the dependency petition filed by Child Protective Services, and in support states:

I. INTRODUCTION

This dependency petition should be dismissed because CPS has failed to meet its burden of proof, violated constitutional and statutory rights, and failed to make reasonable efforts as required by law.

II. VIOLATIONS OF CONSTITUTIONAL RIGHTS

${selectedViolations.filter(v => v.includes('Amendment')).length > 0 ? 
`The petition is based on evidence obtained in violation of constitutional protections:

${selectedViolations.filter(v => v.includes('Amendment')).map(key => `• ${violationLabels[key]}`).join('\n')}

Evidence obtained in violation of constitutional rights must be suppressed and cannot support a dependency finding.` : ''}

III. PROCEDURAL VIOLATIONS

CPS has committed the following procedural violations that warrant dismissal:

${selectedViolations.filter(v => !v.includes('Amendment')).map((key, i) => `${i + 1}. ${violationLabels[key]}`).join('\n')}

IV. FAILURE TO STATE A CLAIM

The petition fails to allege sufficient facts to establish dependency under applicable law:

• No specific allegations of abuse or neglect
• Reliance on hearsay and speculation
• No physical evidence of harm or risk
• Failure to identify specific parenting deficiencies

V. LACK OF REASONABLE EFFORTS

CPS has failed to make reasonable efforts to prevent removal or achieve reunification as required by federal and state law. This failure renders the removal improper and requires return of the children.

VI. INSUFFICIENT EVIDENCE

The evidence presented by CPS fails to meet the required burden of proof:

• No credible evidence of abuse or neglect
• Conflicting reports and statements
• Lack of corroboration for allegations
• Exculpatory evidence ignored

VII. REQUEST FOR RELIEF

WHEREFORE, respondent respectfully requests that this Court:

1. DISMISS the dependency petition with prejudice;
2. ORDER the immediate return of the children to respondent's custody;
3. EXPUNGE all records related to this case;
4. AWARD respondent attorney's fees and costs;
5. Grant such other and further relief as the Court deems just and proper.

Respectfully submitted,

_________________________________
${parentInfo.fullName || "[Your Name]"}
${parentInfo.address || "[Your Address]"}
${parentInfo.phone || "[Your Phone]"}
${parentInfo.email || "[Your Email]"}

[Attorney information if represented]

---
This is a template. Must be adapted to your specific case and reviewed by an attorney.`;
  };

  const generateEmailTemplate = (type: string) => {
    const templates = {
      records: `Subject: Public Records Request - Case ${caseDetails.caseNumber || "[Case Number]"}

Dear ${caseDetails.caseworker || "[Caseworker Name]"},

Pursuant to [State] Public Records Act, I hereby request copies of all records, documents, reports, notes, recordings, and communications related to Case Number ${caseDetails.caseNumber || "[Case Number]"}, including but not limited to:

• All initial and ongoing investigation reports
• All contact notes and case notes
• All emails and written communications
• All photographs and video recordings
• All medical, psychological, or educational records obtained
• All safety assessments and risk assessments
• All supervisor reviews and approvals
• All court reports and filings
• All audio or video recordings of interviews
• Complete case file in its entirety

Please provide these records within the timeframe required by law. I am willing to pay reasonable copying fees and will pick up the records at your office.

If any portion of this request is denied, please provide a written explanation citing the specific legal exemption.

Thank you for your prompt attention to this matter.

Sincerely,
${parentInfo.fullName || "[Your Name]"}
${parentInfo.phone || "[Your Phone]"}
${parentInfo.email || "[Your Email]"}`,

      visitation: `Subject: Request for Increased Visitation - Case ${caseDetails.caseNumber || "[Case Number]"}

Dear ${caseDetails.caseworker || "[Caseworker Name]"},

I am writing to formally request increased visitation with my child/children in Case Number ${caseDetails.caseNumber || "[Case Number]"}.

I have been cooperative with all CPS requests and have:
• Completed [list services/classes]
• Maintained stable housing and employment
• Attended all scheduled visits without incident
• [Add other relevant accomplishments]

Current visitation of [current schedule] is insufficient to maintain the parent-child bond and work toward reunification. I respectfully request:

• Increased frequency: [requested schedule]
• Longer duration: [requested length]
• Unsupervised visits as appropriate
• Overnight visits to prepare for reunification

Research shows that frequent parent-child contact is essential for successful reunification. I am committed to my children and ask that you support our relationship through increased visitation.

Please respond within 7 days with your decision and rationale.

Thank you,
${parentInfo.fullName || "[Your Name]"}
${parentInfo.phone || "[Your Phone]"}`,

      complaint: `Subject: Formal Complaint Regarding Case Handling - Case ${caseDetails.caseNumber || "[Case Number]"}

[Supervisor Name]
[Agency Name]
[Address]

Dear [Supervisor Name],

I am writing to file a formal complaint regarding the handling of Case Number ${caseDetails.caseNumber || "[Case Number]"} by caseworker ${caseDetails.caseworker || "[Caseworker Name]"}.

The following issues require immediate supervisory review and correction:

${selectedViolations.slice(0, 5).map((key, i) => `${i + 1}. ${violationLabels[key]}`).join('\n')}

These actions violate agency policy, state law, and my constitutional rights. I request:

• Immediate investigation of this complaint
• Written response within 14 days
• Corrective action to remedy violations
• Assignment of a new caseworker if appropriate

I have documentation supporting these complaints and am prepared to escalate this matter if not resolved at the agency level.

I await your prompt response.

Sincerely,
${parentInfo.fullName || "[Your Name]"}
${parentInfo.address || "[Your Address]"}
${parentInfo.phone || "[Your Phone]"}
${parentInfo.email || "[Your Email]"}

CC: [Attorney if applicable]`,
    };

    return templates[type as keyof typeof templates] || "";
  };

  const generateActionPlan = () => {
    return `STEP-BY-STEP ACTION PLAN FOR YOUR CPS CASE

Generated: ${new Date().toLocaleDateString()}
Case: ${caseDetails.caseNumber || "[Case Number]"}

IMMEDIATE ACTIONS (Next 24-48 Hours)

□ Contact an experienced family law/dependency attorney immediately
  - Get referrals from local bar association
  - Ask about free/reduced cost representation
  - Schedule consultation ASAP

□ Stop talking to CPS without attorney present
  - Politely decline interviews
  - Say: "I prefer to have my attorney present"
  - Don't argue or explain

□ Document everything starting NOW
  - Write down all events from memory
  - Save all texts, emails, letters
  - Take photos of your home
  - Start a daily journal

WEEK 1 ACTIONS

□ Request all CPS records
  - File public records request (use email template)
  - Request complete case file
  - Request all investigator notes

□ Secure your rights
  - Know you can refuse home entry without warrant
  - Know you can refuse child interviews
  - Know you can refuse drug tests without court order
  - Review your constitutional rights

□ Build your support team
  - Identify character witnesses
  - Contact family members who can help
  - Find support groups for parents
  - Connect with your attorney

□ Preserve evidence
  - Don't delete anything
  - Make copies of important documents
  - Screenshot text messages
  - Save voicemails

ONGOING ACTIONS

□ Complete all requested services PROACTIVELY
  - Don't wait to be told
  - Get certificates of completion
  - Document all participation
  - Go above and beyond requirements

□ Document violations by CPS
  - Note missed deadlines
  - Note false statements
  - Note denied rights
  - Keep detailed timeline

□ Prepare your home
  - Ensure clean, safe environment
  - Stock food and necessities
  - Prepare children's rooms/spaces
  - Take photos showing home is appropriate

□ Attend all hearings and appointments
  - Never miss court dates
  - Arrive early, dress appropriately
  - Be respectful to judge
  - Take notes

□ Maintain visitation
  - Never miss visits
  - Arrive on time
  - Bring activities for children
  - Document each visit

□ Build your case file
  - Organize all documents chronologically
  - Create timeline of events
  - Gather character references
  - Collect evidence of good parenting

LEGAL STRATEGY ACTIONS

□ File appropriate motions
  ${selectedViolations.includes('fourthAmendment') ? '- Motion to Suppress illegally obtained evidence\n  ' : ''}
  ${selectedViolations.includes('noReasonableEfforts') ? '- Motion for Return of Children\n  ' : ''}
  ${selectedViolations.length > 3 ? '- Motion to Dismiss\n  ' : ''}
  - Motion for Increased Visitation

□ Prepare affidavit
  - Use template provided
  - Detail all violations
  - Include specific facts and dates
  - Have notarized

□ Gather evidence
  - Medical records showing no abuse
  - School records showing stability
  - Employment verification
  - Housing documentation
  - Character letters

□ Challenge CPS reports
  - Identify false statements
  - Gather contradictory evidence
  - Prepare to testify
  - Subpoena witnesses if needed

COMMUNICATION STRATEGY

□ With CPS:
  - All communication through attorney if possible
  - If must communicate, use email (creates record)
  - Be professional and brief
  - Never admit to anything

□ With children:
  - Reassure them you're working to bring them home
  - Don't speak negatively about CPS to them
  - Focus on positive connection during visits
  - Document what children tell you about placement

□ With court:
  - Always be respectful
  - Dress professionally
  - Answer questions directly
  - Don't volunteer information

LONG-TERM GOALS

□ Work toward reunification
  - Complete all case plan requirements
  - Address any legitimate concerns
  - Show consistent progress
  - Maintain stable housing/employment

□ Build strong record
  - Document your compliance
  - Document CPS failures
  - Gather positive evidence
  - Maintain credibility

□ Prepare for hearings
  - Know hearing dates
  - Prepare testimony
  - Organize evidence
  - Coordinate with attorney

CRITICAL WARNINGS - DO NOT:

✗ Sign anything without attorney review
✗ Let CPS in without warrant
✗ Submit to searches without attorney present
✗ Take drug tests without court order (unless you'll pass)
✗ Make statements without attorney present
✗ Post about case on social media
✗ Miss any court dates or visits
✗ Lose your temper with CPS or in court
✗ Discuss case with CPS-appointed evaluators without attorney
✗ Give up - keep fighting for your children

RESOURCES

• State bar association: [Look up your state]
• Legal aid societies: [Search locally]
• Parent support groups: [Find local groups]
• Your rights: Review the Rights Guide in this app

Remember: CPS must prove their case. You don't have to prove your innocence. They have the burden of proof. Document everything, follow your attorney's advice, and stay focused on reunification.

---
This is an educational guide. Follow your attorney's specific advice for your case.`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadDocument = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`${filename} downloaded!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1">Document Generator</div>
        <p className="text-sm text-muted-foreground">
          Generate legal documents, analysis reports, motions, and templates based on your case
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="text-sm mb-3">Your Information (Optional - improves document customization)</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={parentInfo.fullName}
                onChange={(e) => setParentInfo({ ...parentInfo, fullName: e.target.value })}
                placeholder="Your full legal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childrenNames">Children's Names</Label>
              <Input
                id="childrenNames"
                value={parentInfo.childrenNames}
                onChange={(e) => setParentInfo({ ...parentInfo, childrenNames: e.target.value })}
                placeholder="Names of your children"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={parentInfo.address}
                onChange={(e) => setParentInfo({ ...parentInfo, address: e.target.value })}
                placeholder="Your current address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={parentInfo.phone}
                onChange={(e) => setParentInfo({ ...parentInfo, phone: e.target.value })}
                placeholder="Your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={parentInfo.email}
                onChange={(e) => setParentInfo({ ...parentInfo, email: e.target.value })}
                placeholder="Your email address"
              />
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="voidabinitio">
            <span className="flex items-center gap-1">
              <Badge variant="destructive" className="text-xs px-1">NEW</Badge>
              Void Ab Initio
            </span>
          </TabsTrigger>
          <TabsTrigger value="motions">Motions</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="affidavit">Affidavit</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>Comprehensive Case Analysis Report</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateCaseAnalysis(), "Case Analysis")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadDocument(generateCaseAnalysis(), "Case_Analysis_Report.txt")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generateCaseAnalysis()}</pre>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-primary" />
                <div>Step-by-Step Action Plan</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateActionPlan(), "Action Plan")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadDocument(generateActionPlan(), "Action_Plan.txt")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generateActionPlan()}</pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="motions" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <div>Motion to Dismiss</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateMotionToDismiss(), "Motion to Dismiss")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadDocument(generateMotionToDismiss(), "Motion_to_Dismiss.txt")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generateMotionToDismiss()}</pre>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> This is a template that must be customized to your specific case and reviewed by a licensed attorney before filing with the court.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <div>Public Records Request</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateEmailTemplate("records"), "Records Request")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{generateEmailTemplate("records")}</pre>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <div>Visitation Request</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateEmailTemplate("visitation"), "Visitation Request")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{generateEmailTemplate("visitation")}</pre>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <div>Formal Complaint</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateEmailTemplate("complaint"), "Complaint Letter")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{generateEmailTemplate("complaint")}</pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="affidavit" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>Sworn Affidavit</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateAffidavit(), "Affidavit")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadDocument(generateAffidavit(), "Affidavit.txt")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generateAffidavit()}</pre>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Fill in all bracketed sections with specific details. This affidavit must be signed before a notary public. Have it reviewed by your attorney before submitting.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedViolations.length === 0 && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <div className="text-blue-900 dark:text-blue-100 mb-1">Tip: Identify Violations First</div>
              <p className="text-blue-800 dark:text-blue-200">
                For more comprehensive and specific documents, complete the Violations tab first. The documents will automatically incorporate your identified violations and provide targeted legal strategies.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}