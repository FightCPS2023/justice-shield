import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Download, Copy, CheckCircle2, AlertCircle, Scale, Shield, Gavel, Brain, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { analyzeDocument, type AnalysisResult } from "../utils/documentAnalyzer";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import { templates, type TemplateData } from "../utils/legalTemplates";
import { additionalTemplates } from "../utils/legalTemplates2";

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

interface Recommendation {
  title: string;
  category: string;
  priority: string;
  description: string;
  steps?: string[];
  documents?: string[];
}

interface DocumentGeneratorEnhancedProps {
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
  recommendations?: Recommendation[];
}

export function DocumentGeneratorEnhanced({ 
  violations, 
  documents, 
  timelineEvents, 
  caseDetails, 
  userState,
  recommendations = []
}: DocumentGeneratorEnhancedProps) {
  const [parentInfo, setParentInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    state: userState || "",
    zip: "",
    phone: "",
    email: "",
    childrenNames: "",
    dateOfBirth: "",
  });

  const [courtInfo, setCourtInfo] = useState({
    courtName: "",
    courtType: "district", // district, family, juvenile, superior
    judgeName: "",
    courtAddress: "",
    division: "",
  });

  const [generatedDocuments, setGeneratedDocuments] = useState<{[key: string]: string}>({});
  const [selectedDocType, setSelectedDocType] = useState("");
  const [useAIEnhancement, setUseAIEnhancement] = useState(true);
  const [documentAnalyses, setDocumentAnalyses] = useState<{[key: string]: AnalysisResult}>({});

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

  // Get AI insights from uploaded documents
  const getAIInsights = () => {
    if (!useAIEnhancement || documents.length === 0) {
      return {
        caseLaw: [] as string[],
        strategies: [] as string[],
        keyFacts: [] as string[],
        recommendations: [] as string[]
      };
    }

    const allCaseLaw: string[] = [];
    const allStrategies: string[] = [];
    const allKeyFacts: string[] = [];
    const allRecommendations: string[] = [];

    documents.forEach(doc => {
      // Check if document has analysis
      if (doc.analysis) {
        allCaseLaw.push(...(doc.analysis.caseLawReferences || []));
        allStrategies.push(...(doc.analysis.modernDefenseStrategies || []));
        allRecommendations.push(...(doc.analysis.recommendedActions || []));
      } else {
        // Analyze document on-the-fly if not already analyzed
        const analysis = analyzeDocument(doc.content, doc.title);
        allCaseLaw.push(...(analysis.caseLawReferences || []));
        allStrategies.push(...(analysis.modernDefenseStrategies || []));
        allRecommendations.push(...(analysis.recommendedActions || []));
        
        // Extract key facts from timeline events
        if (analysis.timelineEvents && analysis.timelineEvents.length > 0) {
          analysis.timelineEvents.forEach(event => {
            allKeyFacts.push(`${event.date}: ${event.title}`);
          });
        }
      }
    });

    return {
      caseLaw: [...new Set(allCaseLaw)].slice(0, 10), // Top 10 unique case law citations
      strategies: [...new Set(allStrategies)].slice(0, 8),
      keyFacts: [...new Set(allKeyFacts)].slice(0, 15),
      recommendations: [...new Set(allRecommendations)].slice(0, 10)
    };
  };

  const aiInsights = getAIInsights();

  // Build template data from user inputs
  const buildTemplateData = (): TemplateData => {
    const violationsList = selectedViolations.map(key => violationLabels[key]);
    const factsList = timelineEvents.map(event => `${event.date}: ${event.description}`);
    
    return {
      courtName: courtInfo.courtName,
      courtType: courtInfo.courtType,
      judgeName: courtInfo.judgeName,
      courtAddress: courtInfo.courtAddress,
      division: courtInfo.division,
      
      caseNumber: caseDetails.caseNumber,
      county: caseDetails.county,
      state: parentInfo.state || userState || "",
      dateOpened: caseDetails.dateOpened,
      caseworker: caseDetails.caseworker,
      
      parentName: parentInfo.fullName,
      parentAddress: parentInfo.address,
      parentCity: parentInfo.city,
      parentState: parentInfo.state,
      parentZip: parentInfo.zip,
      parentPhone: parentInfo.phone,
      parentEmail: parentInfo.email,
      childrenNames: parentInfo.childrenNames,
      parentDOB: parentInfo.dateOfBirth,
      
      attorneyName: caseDetails.attorney,
      
      violations: violationsList,
      facts: factsList,
      caseLaw: aiInsights.caseLaw,
      
      aiInsights: aiInsights,
    };
  };

  // Helper function to generate court caption
  const generateCaption = (documentTitle: string) => {
    const stateName = parentInfo.state || userState || "[STATE]";
    const countyName = caseDetails.county || "[COUNTY]";
    const courtTypeFormatted = courtInfo.courtType === "district" ? "DISTRICT COURT"
      : courtInfo.courtType === "family" ? "FAMILY COURT"
      : courtInfo.courtType === "juvenile" ? "JUVENILE COURT"
      : courtInfo.courtType === "superior" ? "SUPERIOR COURT"
      : "DISTRICT COURT";

    return `IN THE ${courtTypeFormatted}
${courtInfo.courtName || `FOR ${countyName} COUNTY, ${stateName}`}
${courtInfo.division ? `${courtInfo.division} DIVISION` : ''}

IN THE INTEREST OF:                    §
                                        §    CASE NO. ${caseDetails.caseNumber || "[CASE NUMBER]"}
${parentInfo.childrenNames || "[CHILD/CHILDREN'S NAMES]"}, §
                                        §
CHILD/CHILDREN                          §    ${countyName.toUpperCase()} COUNTY, ${stateName.toUpperCase()}

${documentTitle.toUpperCase()}
`;
  };

  // Generate signature block
  const generateSignatureBlock = () => {
    const today = new Date().toLocaleDateString();
    return `
Dated: ${today}

Respectfully submitted,


_________________________________
${parentInfo.fullName || "[YOUR NAME]"}
${parentInfo.address ? `${parentInfo.address}\n` : '[YOUR ADDRESS]\n'}${parentInfo.city && parentInfo.state ? `${parentInfo.city}, ${parentInfo.state} ${parentInfo.zip}\n` : '[CITY, STATE ZIP]\n'}${parentInfo.phone ? `Phone: ${parentInfo.phone}\n` : 'Phone: [YOUR PHONE]\n'}${parentInfo.email ? `Email: ${parentInfo.email}` : 'Email: [YOUR EMAIL]'}

${caseDetails.attorney ? `\nATTORNEY OF RECORD:\n${caseDetails.attorney}` : '\n[If represented by attorney, include attorney information]'}
`;
  };

  // Generate certificate of service
  const generateCertificateOfService = () => {
    const today = new Date().toLocaleDateString();
    return `
CERTIFICATE OF SERVICE

I hereby certify that on ${today}, a true and correct copy of the foregoing document was served upon all parties of record via:

☐ Hand Delivery
☐ U.S. Mail, First Class, Postage Prepaid
☐ Email
☐ Electronic Filing System

To the following:

${caseDetails.caseworker ? `${caseDetails.caseworker}\nCPS Caseworker\n[Address/Email]\n` : 'CPS Caseworker: [NAME AND ADDRESS]\n'}
${caseDetails.attorney ? `${caseDetails.attorney}\nAttorney for CPS\n[Address/Email]\n` : 'CPS Attorney: [NAME AND ADDRESS]\n'}
Guardian ad Litem: [NAME AND ADDRESS]
Court: ${courtInfo.courtName || "[COURT NAME AND ADDRESS]"}


_________________________________
${parentInfo.fullName || "[YOUR NAME]"}
`;
  };

  // Enhanced Motion to Dismiss with proper formatting
  const generateMotionToDismiss = () => {
    const content = `${generateCaption("MOTION TO DISMISS")}

TO THE HONORABLE COURT:

COMES NOW ${parentInfo.fullName || "[RESPONDENT'S NAME]"}, Respondent and parent in the above-captioned matter, and respectfully files this Motion to Dismiss the Child Protective Services dependency petition, and in support thereof, states as follows:

I. INTRODUCTION AND SUMMARY OF ARGUMENT

This Honorable Court should dismiss the dependency petition filed against Respondent because Child Protective Services has failed to meet its burden of proof, violated constitutional and statutory protections, and failed to comply with mandatory procedural requirements. The cumulative effect of CPS's violations renders this proceeding fundamentally unfair and deprives this Court of jurisdiction to proceed.

II. STATEMENT OF FACTS

${timelineEvents.length > 0 ? timelineEvents.map((event, i) => {
  return `${i + 1}. On ${new Date(event.date).toLocaleDateString()}, ${event.title}. ${event.description}`;
}).join('\n\n') : '1. [State the relevant facts of your case in chronological order]\n\n2. [Include dates, parties involved, and specific events]\n\n3. [Focus on facts that support your motion to dismiss]'}

III. LEGAL ARGUMENT

A. CONSTITUTIONAL VIOLATIONS REQUIRE DISMISSAL

${selectedViolations.filter(v => v.includes('Amendment')).length > 0 ? 
`The petition is based on evidence obtained through violations of Respondent's constitutional rights under the Fourth and Fourteenth Amendments to the United States Constitution${parentInfo.state ? ` and the ${parentInfo.state} State Constitution` : ''}:

${selectedViolations.filter(v => v.includes('Amendment')).map((key, i) => {
  const label = violationLabels[key];
  let analysis = "";
  
  if (key === "fourthAmendment") {
    analysis = `Evidence obtained through warrantless entry and search of Respondent's home violates the Fourth Amendment. CPS does not have blanket authority to enter homes without consent or a warrant. See Camreta v. Greene, 563 U.S. 692 (2011); Doe v. Heck, 327 F.3d 492 (7th Cir. 2003). All evidence obtained as a result of this constitutional violation must be suppressed and cannot form the basis for dependency findings.`;
  } else if (key === "fourteenthAmendment") {
    analysis = `The Fourteenth Amendment guarantees procedural due process, including adequate notice and opportunity to be heard. CPS's failure to provide proper due process violates Respondent's fundamental liberty interest in the care, custody, and management of their children. See Troxel v. Granville, 530 U.S. 57 (2000); Santosky v. Kramer, 455 U.S. 745 (1982).`;
  }
  
  return `${i + 1}. ${label}\n\n${analysis}`;
}).join('\n\n')}

Constitutional violations of this magnitude cannot be cured and require dismissal of the petition.` 
: ''}

B. PROCEDURAL VIOLATIONS WARRANT DISMISSAL

CPS has committed numerous procedural violations that undermine the integrity of these proceedings:

${selectedViolations.filter(v => !v.includes('Amendment')).map((key, i) => {
  const label = violationLabels[key];
  let analysis = "";
  
  if (key === "noWrittenNotice") {
    analysis = `Respondent was not provided with adequate written notice of allegations and rights as required by state law. This denial of due process is a fundamental defect that cannot be remedied.`;
  } else if (key === "missedDeadlines") {
    analysis = `CPS failed to comply with statutory deadlines for [specify which deadlines]. These deadlines are mandatory, not directory, and failure to comply deprives this Court of jurisdiction to proceed.`;
  } else if (key === "noReasonableEfforts") {
    analysis = `CPS failed to make reasonable efforts to prevent removal as required by federal and state law. See 42 U.S.C. § 671(a)(15) (ASFA reasonable efforts requirement). This failure renders the removal improper and requires immediate reunification.`;
  } else if (key === "improperInvestigation") {
    analysis = `The investigation was conducted in a biased manner, failing to interview relevant witnesses and ignoring exculpatory evidence. This investigative negligence undermines the reliability of CPS's allegations.`;
  } else {
    analysis = `This violation demonstrates CPS's failure to comply with mandatory procedures designed to protect parental rights.`;
  }
  
  return `${i + 1}. ${label}\n\n${analysis}`;
}).join('\n\n')}

C. INSUFFICIENT EVIDENCE TO SUPPORT PETITION

The petition fails to allege sufficient facts to establish statutory grounds for dependency under ${parentInfo.state || '[STATE]'} law:

1. The petition contains only vague and conclusory allegations without specific facts.

2. CPS relies on inadmissible hearsay evidence without proper foundation or corroboration.

3. There is no physical evidence of abuse, neglect, or present danger to the children.

4. CPS has failed to identify specific parenting deficiencies that constitute statutory neglect or abuse.

5. The evidence shows that the children are safe in Respondent's care.

${aiInsights.caseLaw.length > 0 && useAIEnhancement ? `
Supporting Case Law:

${aiInsights.caseLaw.slice(0, 5).map(law => `• ${law}`).join('\n')}
` : ''}

Without credible, admissible evidence meeting the applicable burden of proof, this petition cannot proceed.

D. LACK OF REASONABLE EFFORTS

Federal and state law require CPS to make "reasonable efforts" to prevent removal and achieve reunification. 42 U.S.C. § 671(a)(15). CPS has failed to make any reasonable efforts in this case:

1. No services were offered prior to removal.

2. No safety plan was developed to maintain the children in the home.

3. Relatives willing and able to care for the children were not considered.

4. CPS took the most drastic action (removal) without attempting less restrictive alternatives.

This failure to make reasonable efforts violates federal law and requires dismissal of the petition and return of the children.

IV. REQUEST FOR RELIEF

WHEREFORE, Respondent respectfully requests that this Honorable Court:

1. DISMISS the dependency petition with prejudice;

2. ORDER the immediate return of the children to Respondent's custody;

3. FIND that CPS failed to make reasonable efforts as required by law;

4. SUPPRESS all evidence obtained in violation of constitutional rights;

5. EXPUNGE all records related to this case from CPS and state databases;

6. AWARD Respondent reasonable attorney's fees and costs incurred in defending against this improper petition;

7. SANCTION CPS for violation of Respondent's constitutional rights; and

8. Grant such other and further relief as this Court deems just and proper.

${generateSignatureBlock()}

${generateCertificateOfService()}

---
IMPORTANT LEGAL NOTICE: This document is a template generated by an educational tool. It must be reviewed, customized, and verified by a licensed attorney in your jurisdiction before filing. Do not file this document without attorney review. Every case is unique and requires legal analysis specific to your facts and jurisdiction.`;
    
    return content;
  };

  // Motion to Suppress Evidence
  const generateMotionToSuppress = () => {
    if (!violations.fourthAmendment) {
      return "This motion is only applicable when Fourth Amendment violations are present. Please mark Fourth Amendment violations in the Violations section.";
    }

    const content = `${generateCaption("MOTION TO SUPPRESS EVIDENCE")}

TO THE HONORABLE COURT:

COMES NOW ${parentInfo.fullName || "[RESPONDENT'S NAME]"}, Respondent in the above-captioned matter, and respectfully moves this Court to suppress all evidence obtained as a result of the warrantless entry and search of Respondent's home, and in support thereof, states as follows:

I. INTRODUCTION

This motion seeks to suppress evidence obtained in violation of Respondent's rights under the Fourth Amendment to the United States Constitution${parentInfo.state ? ` and Article [X], Section [X] of the ${parentInfo.state} Constitution` : ' and the applicable state constitution'}. The evidence must be excluded as "fruit of the poisonous tree" because it was obtained through an illegal warrantless search.

II. STATEMENT OF FACTS

1. On or about ${timelineEvents.length > 0 ? new Date(timelineEvents[0].date).toLocaleDateString() : "[DATE]"}, CPS caseworker ${caseDetails.caseworker || "[CASEWORKER NAME]"} appeared at Respondent's home.

2. The caseworker demanded entry to the home without a warrant, court order, or valid consent.

3. ${parentInfo.fullName || "[Respondent]"} [did/did not] consent to the entry.

4. No exigent circumstances existed that would justify a warrantless entry.

5. The caseworker conducted a search of the home and [interviewed the children/took photographs/examined belongings] without consent or legal authority.

6. All evidence relied upon by CPS in this case stems from this illegal entry and search.

[Add more specific facts about what happened during the illegal entry and search]

III. LEGAL ARGUMENT

A. THE FOURTH AMENDMENT PROTECTS PARENTS FROM WARRANTLESS CPS SEARCHES

The Fourth Amendment protects citizens from unreasonable searches and seizures by government officials, including CPS caseworkers. See Camreta v. Greene, 563 U.S. 692, 705 (2011) ("'[A] State's
 child welfare officers may not, consistent with the Fourth Amendment, force entry into a home without a warrant or an applicable exception to the warrant requirement.'").

CPS caseworkers are government officials subject to Fourth Amendment constraints. Doe v. Heck, 327 F.3d 492, 510 (7th Cir. 2003). They do not have blanket authority to enter homes without consent or a warrant. Calabretta v. Floyd, 189 F.3d 808, 813 (9th Cir. 1999).

${aiInsights.caseLaw.filter(law => law.toLowerCase().includes('fourth') || law.toLowerCase().includes('search') || law.toLowerCase().includes('warrant')).length > 0 && useAIEnhancement ? `
Additional Supporting Authority:

${aiInsights.caseLaw.filter(law => law.toLowerCase().includes('fourth') || law.toLowerCase().includes('search') || law.toLowerCase().includes('warrant')).slice(0, 3).map(law => `• ${law}`).join('\n')}
` : ''}

B. NO EXCEPTION TO THE WARRANT REQUIREMENT APPLIED

The warrantless entry into Respondent's home falls outside any recognized exception to the warrant requirement:

1. Consent Exception: Respondent did not voluntarily consent to the entry. [If consent was given, argue it was coerced or involuntary due to: implied threat of child removal, misrepresentation of authority, etc.]

2. Exigent Circumstances: No emergency existed requiring immediate entry. The children were not in imminent danger. CPS had time to obtain a warrant but failed to do so.

3. Plain View Doctrine: Not applicable as entry itself was illegal.

CPS bears the burden of proving that an exception applies. The State has failed to meet this burden.

C. ALL EVIDENCE MUST BE SUPPRESSED AS FRUIT OF THE POISONOUS TREE

The "fruit of the poisonous tree" doctrine requires suppression of all evidence obtained directly or indirectly from an illegal search. Wong Sun v. United States, 371 U.S. 471 (1963). 

All evidence in this case derives from the illegal entry:

• Observations made during the illegal search
• Photographs taken during the search  
• Statements made by children during the illegal entry
• Any physical evidence seized
• All subsequent investigation stemming from the illegal entry

Because this evidence forms the entire basis for CPS's petition, suppression requires dismissal of the case.

IV. CONCLUSION

The warrantless entry into Respondent's home violated clearly established Fourth Amendment rights. All evidence obtained must be suppressed. Without this illegally obtained evidence, CPS cannot meet its burden of proof, and the petition must be dismissed.

V. REQUEST FOR RELIEF

WHEREFORE, Respondent respectfully requests that this Court:

1. GRANT this Motion to Suppress Evidence;

2. SUPPRESS all evidence obtained as a result of the warrantless entry and search;

3. DISMISS the dependency petition due to lack of admissible evidence;

4. HOLD an evidentiary hearing on this motion;

5. FIND that CPS violated Respondent's Fourth Amendment rights;

6. ORDER return of the children to Respondent's custody; and

7. Grant such other relief as the Court deems just and proper.

${generateSignatureBlock()}

${generateCertificateOfService()}

---
IMPORTANT LEGAL NOTICE: This document is a template. Must be reviewed by an attorney and customized to your specific facts before filing.`;
    
    return content;
  };

  // Affidavit with proper legal formatting
  const generateAffidavit = () => {
    const today = new Date().toLocaleDateString();
    const stateName = parentInfo.state || userState || "[STATE]";
    const countyName = caseDetails.county || "[COUNTY]";
    
    const content = `${generateCaption("AFFIDAVIT OF " + (parentInfo.fullName || "[YOUR NAME]").toUpperCase())}

STATE OF ${stateName.toUpperCase()}    §
                                        §
COUNTY OF ${countyName.toUpperCase()}  §

BEFORE ME, the undersigned authority, personally appeared ${parentInfo.fullName || "[YOUR FULL NAME]"}, who, being by me first duly sworn, upon oath stated:

"My name is ${parentInfo.fullName || "[YOUR FULL NAME]"}. I am over eighteen years of age, of sound mind, capable of making this affidavit, and personally acquainted with the facts herein stated:

I. PERSONAL INFORMATION

1. I am the parent of ${parentInfo.childrenNames || "[CHILD/CHILDREN'S NAMES]"} in the above-captioned matter.

2. I have personal knowledge of all facts stated in this affidavit.

3. I am competent to testify to these matters if called as a witness.

4. My current address is: ${parentInfo.address || "[ADDRESS]"}, ${parentInfo.city || "[CITY]"}, ${parentInfo.state || "[STATE]"} ${parentInfo.zip || "[ZIP]"}.

5. My phone number is: ${parentInfo.phone || "[PHONE]"}.

6. My email address is: ${parentInfo.email || "[EMAIL]"}.

${parentInfo.dateOfBirth ? `7. My date of birth is: ${parentInfo.dateOfBirth}.\n` : '7. My date of birth is: [DATE].\n'}

II. CASE BACKGROUND

8. This affidavit is submitted in connection with Case Number ${caseDetails.caseNumber || "[CASE NUMBER]"}, currently pending in this Court.

9. The case was opened on or about ${caseDetails.dateOpened ? new Date(caseDetails.dateOpened).toLocaleDateString() : "[DATE]"} by Child Protective Services.

10. The assigned CPS caseworker is ${caseDetails.caseworker || "[CASEWORKER NAME]"}.

11. [Add background about how the case started, initial allegations, etc.]

III. VIOLATIONS OF MY CONSTITUTIONAL AND STATUTORY RIGHTS

I declare under penalty of perjury that CPS has violated my rights in the following ways:

${selectedViolations.map((key, index) => {
  const label = violationLabels[key];
  return `${index + 12}. ${label}

[Describe in detail: What happened? When did it happen? Who was present? What exactly was said or done? Include specific dates, times, locations, and names. Be as specific as possible.]

`;
}).join('\n')}

IV. TIMELINE OF EVENTS

${timelineEvents.length > 0 ? timelineEvents.map((event, i) => {
  const num = selectedViolations.length + 12 + i + 1;
  return `${num}. On ${new Date(event.date).toLocaleDateString()}: ${event.title}. ${event.description}`;
}).join('\n\n') : `${selectedViolations.length + 12 + 1}. [Describe events in chronological order with specific dates and details]`}

V. FACTUAL DISPUTES WITH CPS REPORTS

${selectedViolations.length + timelineEvents.length + 12 + 2}. I dispute the following statements made by CPS in their reports and court filings:

[List each false or misleading statement with:
- The specific statement from CPS report (quote it exactly)
- Why it is false or misleading
- What the true facts are
- Evidence that supports your version]

VI. EVIDENCE OF SAFE AND APPROPRIATE HOME

${selectedViolations.length + timelineEvents.length + 12 + 3}. I maintain a safe, stable, and appropriate home for my children, as evidenced by:

a. Housing: I have [describe housing - owned/rented, size, condition, safety features]. The home has:
   • [Number] bedrooms with appropriate sleeping arrangements for each child
   • Clean, functioning kitchen and bathroom facilities
   • No safety hazards, dangerous conditions, or code violations
   • Adequate heating, cooling, and utilities
   • [Add other specific details about your home]

b. Financial Stability: I am [employed/self-employed/receiving income from] [describe income source]. My monthly income is approximately $[amount], which is sufficient to provide for my children's needs including food, clothing, shelter, medical care, and education.

c. Support System: I have a strong support network including [family members, friends, community resources] who are available to assist with childcare and support.

d. Parenting Ability: I am a capable, loving parent who:
   • [Describe your positive parenting practices]
   • [List services, classes, or therapy you've completed]
   • [Describe your relationship with your children]
   • [Provide examples of meeting children's needs]

VII. COMPLIANCE WITH CPS REQUESTS

${selectedViolations.length + timelineEvents.length + 12 + 4}. I have complied with all reasonable requests from CPS, including:

a. Services Completed:
   • [List all services, classes, evaluations, or programs you've completed]
   • [Include dates and certificates of completion if available]

b. Appointments Attended:
   • [List all visits, meetings, and court hearings attended]
   • [Note if you've never missed an appointment]

c. Drug Testing:
   • [If applicable, describe clean drug tests]
   • [Include dates and results]

d. Other Compliance:
   • [List any other things you've done to comply]
   • [Include documentation provided to CPS]

VIII. CPS FAILURES - LACK OF REASONABLE EFFORTS

${selectedViolations.length + timelineEvents.length + 12 + 5}. CPS has failed to make reasonable efforts to prevent removal and achieve reunification:

a. No services were offered to me prior to removing my children.

b. CPS did not consider placing the children with relatives despite [name relatives] being willing and able.

c. CPS did not develop a safety plan that would have allowed the children to remain in my care.

d. CPS has [describe other failures - denied services, scheduled visits at impossible times, failed to provide transportation, etc.].

e. CPS has made it impossible for me to comply by [describe any Catch-22 situations].

${aiInsights.recommendations.length > 0 && useAIEnhancement ? `
${selectedViolations.length + timelineEvents.length + 12 + 6}. Based on analysis of case documents, the following additional CPS failures have been identified:

${aiInsights.recommendations.slice(0, 5).map((rec, i) => `   ${String.fromCharCode(97 + i)}. ${rec}`).join('\n\n')}
` : ''}

IX. FALSE, MISLEADING, AND UNSUPPORTED ALLEGATIONS

${selectedViolations.length + timelineEvents.length + 12 + 6}. CPS's allegations against me are false, misleading, or unsupported by evidence:

[For each allegation:
- State the allegation
- Explain why it's false or unsupported
- Provide the true facts
- Reference evidence that proves your version]

X. BEST INTERESTS OF THE CHILDREN

${selectedViolations.length + timelineEvents.length + 12 + 7}. It is in the best interests of my children to be returned to my care because:

a. I am their parent and we have a strong, loving bond.

b. The children [describe how separation has affected them - emotional distress, regression, etc.].

c. I can and do provide a safe, stable, nurturing home.

d. The children have expressed their desire to return home. [If true]

e. Continued separation causes unnecessary trauma and harm.

f. There is no evidence of present danger to the children in my care.

XI. REQUEST FOR RELIEF

${selectedViolations.length + timelineEvents.length + 12 + 8}. Based on the violations of my rights, the lack of evidence supporting CPS's allegations, and the best interests of my children, I respectfully request that this Court:

a. Immediately return my children to my custody;

b. Dismiss the dependency petition;

c. Find that CPS failed to make reasonable efforts;

d. Find that CPS violated my constitutional and statutory rights;

e. Increase visitation pending resolution if children are not immediately returned;

f. Order services and support to facilitate reunification;

g. Sanction CPS for rights violations and false allegations; and

h. Grant any other relief the Court deems appropriate.

XII. OATH AND AFFIRMATION

${selectedViolations.length + timelineEvents.length + 12 + 9}. I declare under penalty of perjury under the laws of the State of ${stateName} that the foregoing is true and correct to the best of my knowledge, information, and belief.

${selectedViolations.length + timelineEvents.length + 12 + 10}. I understand that this affidavit is sworn testimony and that making false statements herein subjects me to penalties for perjury.

${selectedViolations.length + timelineEvents.length + 12 + 11}. I have read this affidavit and it accurately reflects my testimony.

FURTHER AFFIANT SAYETH NOT.


EXECUTED on this _______ day of ______________, 20_____.


_________________________________
${parentInfo.fullName || "[YOUR NAME]"}
AFFIANT


SWORN TO AND SUBSCRIBED before me on this _______ day of ______________, 20_____, by ${parentInfo.fullName || "[YOUR NAME]"}, who is personally known to me or has produced ______________________ as identification.


_________________________________
NOTARY PUBLIC

My Commission Expires: ___________

[NOTARY SEAL]

---
IMPORTANT: This affidavit must be notarized before filing. Bring valid photo ID to the notary. Have your attorney review this affidavit before signing. Everything stated must be true - false statements can result in perjury charges.`;

    return content;
  };

  // Motion for Return of Children (No Reasonable Efforts)
  const generateMotionForReturn = () => {
    const content = `${generateCaption("MOTION FOR RETURN OF CHILDREN")}

TO THE HONORABLE COURT:

COMES NOW ${parentInfo.fullName || "[RESPONDENT'S NAME]"}, Respondent in the above-captioned matter, and respectfully files this Motion for Return of Children based on CPS's failure to make reasonable efforts, and in support thereof, states as follows:

I. INTRODUCTION

Federal and state law require Child Protective Services to make "reasonable efforts" to prevent removal and to reunify families. 42 U.S.C. § 671(a)(15) (ASFA). CPS has completely failed to make any reasonable efforts in this case, rendering the removal of Respondent's children improper and requiring their immediate return.

II. STATEMENT OF FACTS

1. CPS removed Respondent's children on ${caseDetails.dateOpened ? new Date(caseDetails.dateOpened).toLocaleDateString() : "[DATE]"}.

2. Prior to removal, CPS did not offer any services to address alleged concerns.

3. CPS did not attempt to develop a safety plan that would allow the children to remain home.

4. CPS did not consider placement with relatives who were willing and able to care for the children.

5. CPS did not explore any alternatives to removal.

6. Since removal, CPS has [describe failures to provide services, facilitate reunification, etc.].

[Add more specific facts about CPS's failures]

III. LEGAL ARGUMENT

A. FEDERAL LAW REQUIRES REASONABLE EFFORTS

The Adoption and Safe Families Act (ASFA) requires states to make "reasonable efforts" to prevent removal and achieve reunification. 42 U.S.C. § 671(a)(15). This is a condition of receiving federal funding and is incorporated into every state's child welfare laws.

"Reasonable efforts" means that CPS must try less drastic alternatives before removing children and must actively work toward reunification after removal. See ${parentInfo.state || '[State]'} [cite to state reasonable efforts statute].

B. CPS FAILED TO MAKE REASONABLE EFFORTS TO PREVENT REMOVAL

CPS made no efforts whatsoever to prevent removal:

1. No services were offered before removal
2. No safety planning was attempted
3. No evaluation of relative placements
4. No attempt to address concerns while keeping family intact
5. Immediate removal without considering alternatives

This "removal first, ask questions later" approach violates the reasonable efforts requirement and renders the removal improper.

C. CPS HAS FAILED TO MAKE REASONABLE EFFORTS TOWARD REUNIFICATION

Even after removal, CPS has failed to make reasonable efforts:

1. [Describe lack of services, unreasonable requirements, etc.]
2. [Describe barriers CPS has created to reunification]
3. [Describe how CPS has not facilitated parent-child relationship]

D. FAILURE TO MAKE REASONABLE EFFORTS REQUIRES RETURN

When CPS fails to make reasonable efforts, the proper remedy is return of the children. The removal was improper from the start, and continued detention is not justified.

[Cite state case law on reasonable efforts and return of children]

E. RESPONDENT HAS A SAFE HOME AND IS A FIT PARENT

Respondent maintains a safe, appropriate home and is a capable parent:

[Describe your home, parenting abilities, completion of services, etc.]

There is no present danger to the children in Respondent's care. Any concerns that may have existed have been addressed. The children should be returned home immediately.

IV. REQUEST FOR RELIEF

WHEREFORE, Respondent respectfully requests that this Court:

1. GRANT this Motion for Return of Children;

2. FIND that CPS failed to make reasonable efforts as required by federal and state law;

3. ORDER the immediate return of the children to Respondent's custody;

4. HOLD CPS accountable for failure to comply with statutory requirements;

5. ORDER CPS to provide appropriate services to support the family;

6. DISMISS the dependency petition; and

7. Grant such other relief as the Court deems just and proper.

${generateSignatureBlock()}

${generateCertificateOfService()}

---
IMPORTANT: This document must be reviewed by an attorney and customized to your case before filing.`;

    return content;
  };

  // Emergency Motion
  const generateEmergencyMotion = () => {
    const content = `${generateCaption("EMERGENCY MOTION FOR IMMEDIATE RELIEF")}

TO THE HONORABLE COURT:

COMES NOW ${parentInfo.fullName || "[RESPONDENT'S NAME]"}, Respondent in the above-captioned matter, and respectfully files this Emergency Motion for Immediate Relief, and in support thereof, states as follows:

I. EMERGENCY NATURE OF THIS MOTION

This is an emergency motion requiring immediate hearing and ruling because:

1. [Describe the emergency - child in danger in placement, serious illness, urgent violation, etc.]

2. Delay will cause irreparable harm to [Respondent/children]

3. Immediate Court intervention is necessary to prevent [describe harm]

4. [Add other reasons this is an emergency]

This Court has authority to grant emergency relief to protect the children's welfare and Respondent's constitutional rights.

II. STATEMENT OF FACTS

[Describe the facts giving rise to the emergency in detail with dates, times, and specific information]

III. LEGAL BASIS FOR EMERGENCY RELIEF

[Cite applicable law authorizing emergency relief]

[Explain why the facts meet the legal standard for emergency relief]

IV. REQUEST FOR EMERGENCY RELIEF

WHEREFORE, Respondent respectfully requests that this Court:

1. SET an emergency hearing on this motion within [24/48/72] hours;

2. [State specific relief requested - return children, change placement, emergency visitation, stop harmful action, etc.];

3. [Additional emergency relief requested]; and

4. Grant such other emergency relief as necessary.

RESPONDENT CERTIFIES that this motion is made in good faith and based on exigent circumstances requiring immediate Court intervention.

${generateSignatureBlock()}

${generateCertificateOfService()}

---
EMERGENCY FILING NOTE: After filing, immediately contact the court clerk to request an emergency hearing. Be prepared to explain why this is a true emergency. Have your attorney review before filing.`;

    return content;
  };

  // Discovery Request
  const generateDiscoveryRequest = () => {
    const content = `${generateCaption("RESPONDENT'S FIRST REQUEST FOR PRODUCTION OF DOCUMENTS")}

TO: ${caseDetails.caseworker || "[CPS CASEWORKER]"}
    Child Protective Services
    [Address]

TO: [CPS ATTORNEY NAME]
    [Attorney Address]

Pursuant to [State Rules of Civil Procedure/Family Law Procedure], Respondent ${parentInfo.fullName || "[NAME]"} requests that CPS produce the following documents and tangible things for inspection and copying at [location] within thirty (30) days of service of this request:

DEFINITIONS

For purposes of this request:

"Document" means any written, recorded, or graphic matter, including electronically stored information, emails, text messages, notes, reports, photographs, videos, audio recordings, and any other data compilation.

"CPS" means Child Protective Services and all employees, agents, contractors, and representatives thereof.

"The Children" means ${parentInfo.childrenNames || "[CHILDREN'S NAMES]"}.

"This Case" means Case No. ${caseDetails.caseNumber || "[CASE NUMBER]"}.

REQUESTS FOR PRODUCTION

REQUEST NO. 1: All complete CPS case files regarding this case and the children, including but not limited to all investigative files, ongoing case files, and closed case files.

REQUEST NO. 2: All initial and supplemental investigation reports, including all attachments and exhibits.

REQUEST NO. 3: All contact notes, case notes, and running logs maintained by any CPS employee regarding this case from [date case opened] to present.

REQUEST NO. 4: All emails, text messages, and other electronic communications between any CPS employees regarding this case or the children.

REQUEST NO. 5: All audio or video recordings of any interviews with Respondent, the children, or any other person regarding this case.

REQUEST NO. 6: All photographs taken by CPS of Respondent's home, the children, or any other subject related to this case.

REQUEST NO. 7: All medical records, medical evaluations, and medical reports obtained or reviewed by CPS regarding the children.

REQUEST NO. 8: All psychological evaluations, psychiatric evaluations, mental health assessments, and substance abuse assessments regarding Respondent or the children.

REQUEST NO. 9: All safety assessments and risk assessments conducted in this case.

REQUEST NO. 10: All case plans, service plans, and family service plans developed in this case.

REQUEST NO. 11: All documents reflecting services offered, provided, or recommended to Respondent.

REQUEST NO. 12: All documents reflecting consideration of relative placement for the children, including names of relatives contacted and reasons for approval or denial of placement.

REQUEST NO. 13: All documents reflecting the decision to remove the children from Respondent's care, including supervisor approvals and legal consultations.

REQUEST NO. 14: All documents related to the current placement of the children, including foster home studies, background checks, and placement agreements.

REQUEST NO. 15: All documents reflecting visits between Respondent and the children, including visitation logs, observation notes, and visitation plans.

REQUEST NO. 16: All reports submitted to this Court by CPS in this case, including all drafts and supporting documentation.

REQUEST NO. 17: All policies, procedures, and regulations governing CPS investigation and case handling that were in effect during the relevant time period.

REQUEST NO. 18: All training materials provided to ${caseDetails.caseworker || "[caseworker]"} regarding Fourth Amendment rights, search and seizure, parental rights, and investigation procedures.

REQUEST NO. 19: All personnel records for ${caseDetails.caseworker || "[caseworker]"}, including disciplinary actions, complaints, and supervisor evaluations.

REQUEST NO. 20: All documents reflecting communications between CPS and law enforcement regarding this case.

REQUEST NO. 21: All documents reflecting communications between CPS and the Guardian ad Litem regarding this case.

REQUEST NO. 22: All documents reflecting communications between CPS and medical providers, schools, therapists, or other third parties regarding the children or this case.

REQUEST NO. 23: All documents or data from any databases maintained by CPS regarding Respondent or the children, including but not limited to [state database names].

REQUEST NO. 24: All documents reflecting supervisory review and approval of case decisions.

REQUEST NO. 25: All documents relating to any prior CPS involvement with Respondent's family, if any.

REQUEST NO. 26: All documents that CPS intends to introduce as evidence at any hearing in this matter.

REQUEST NO. 27: All documents that support, contradict, or relate to any allegation made against Respondent in this case.

REQUEST NO. 28: All documents identified, referenced, or relied upon in preparing CPS reports to the Court.

REQUEST NO. 29: All documents reflecting expenditures or costs incurred by CPS in this case.

REQUEST NO. 30: All other documents in CPS's possession, custody, or control related in any way to this case, Respondent, or the children.

INSTRUCTIONS FOR PRODUCTION

1. Documents shall be produced in their original form, including metadata for electronically stored information.

2. Documents shall be organized and labeled to correspond to the numbered requests above.

3. If any document is withheld on grounds of privilege, provide a privilege log identifying each document, the privilege claimed, and the basis for the privilege.

4. If any request is objected to, state the specific grounds for each objection and produce all non-objectionable documents.

5. Production shall be made at: [location] on [date] at [time], or as otherwise mutually agreed.

${generateSignatureBlock()}

${generateCertificateOfService()}

---
NOTE: This is a comprehensive discovery request. Your attorney may want to modify based on your specific case needs and procedural rules in your jurisdiction.`;

    return content;
  };

  // Generate document based on type using professional legal templates
  const generateDocument = (type: string) => {
    let content = "";
    const templateData = buildTemplateData();
    
    switch(type) {
      case "motion-dismiss":
        content = templates.motionToDismiss(templateData);
        break;
      case "motion-suppress":
        content = templates.motionToSuppress(templateData);
        break;
      case "motion-reunification":
        content = templates.motionForReunification(templateData);
        break;
      case "answer-petition":
        content = templates.answerToPetition(templateData);
        break;
      case "motion-visitation":
        content = templates.motionForVisitation(templateData);
        break;
      case "motion-compel-discovery":
        content = additionalTemplates.motionToCompelDiscovery(templateData);
        break;
      case "declaration":
        content = additionalTemplates.declaration(templateData);
        break;
      case "protective-order":
        content = additionalTemplates.protectiveOrder(templateData);
        break;
      case "emergency-motion":
        content = additionalTemplates.emergencyMotion(templateData);
        break;
      case "notice-appeal":
        content = additionalTemplates.noticeOfAppeal(templateData);
        break;
      case "affidavit":
      case "motion-return":
      case "discovery":
        // Keep old templates for now (can update later)
        content = type === "affidavit" ? generateAffidavit() :
                  type === "motion-return" ? generateMotionForReturn() :
                  generateDiscoveryRequest();
        break;
      default:
        content = "Please select a document type.";
    }
    
    setGeneratedDocuments(prev => ({
      ...prev,
      [type]: content
    }));
    
    setSelectedDocType(type);
    toast.success("📄 Professional legal document generated successfully!");
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

  // Get recommended documents from strategies
  const getRecommendedDocuments = () => {
    const recommendedDocs: {type: string; title: string; priority: string; reason: string}[] = [];
    
    if (violations.fourthAmendment) {
      recommendedDocs.push({
        type: "motion-suppress",
        title: "Motion to Suppress Evidence",
        priority: "High",
        reason: "Fourth Amendment violation detected - illegally obtained evidence should be suppressed"
      });
    }
    
    if (violations.noReasonableEfforts || violations.noSafetyPlan) {
      recommendedDocs.push({
        type: "motion-return",
        title: "Motion for Return of Children",
        priority: "High",
        reason: "CPS failed to make reasonable efforts - children should be returned"
      });
    }
    
    if (selectedViolations.length >= 3) {
      recommendedDocs.push({
        type: "motion-dismiss",
        title: "Motion to Dismiss",
        priority: "High",
        reason: `${selectedViolations.length} violations documented - strong grounds for dismissal`
      });
    }
    
    recommendedDocs.push({
      type: "affidavit",
      title: "Sworn Affidavit",
      priority: "High",
      reason: "Document your testimony and violations under oath"
    });
    
    recommendedDocs.push({
      type: "discovery",
      title: "Discovery Request",
      priority: "Medium",
      reason: "Obtain all CPS records and evidence"
    });
    
    return recommendedDocs;
  };

  const recommendedDocs = getRecommendedDocuments();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gavel className="w-6 h-6 text-primary" />
          <div>Court Document Generator</div>
          <HelpTooltip 
            content="This tool generates professional legal document templates based on your case violations and details. Documents include motions, affidavits, and discovery requests with proper legal formatting and citations." 
            side="right"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Generate properly formatted legal documents with court-ready captions and formatting
        </p>
      </div>

      <InfoBox title="⚖️ Critical Legal Notice" variant="warning">
        <p className="mb-2">
          <strong>These are TEMPLATES ONLY</strong> - not ready-to-file legal documents.
        </p>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Every document MUST be reviewed by a licensed attorney before filing</li>
          <li>Courts have specific formatting and filing requirements</li>
          <li>Incorrect or improper filings can harm your case</li>
          <li>Use these as a starting point to discuss strategy with your lawyer</li>
        </ul>
      </InfoBox>

      {/* Information Input Sections */}
      <div className="grid gap-4">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div className="text-sm">Your Information</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Legal Name *</Label>
              <Input
                id="fullName"
                value={parentInfo.fullName}
                onChange={(e) => setParentInfo({ ...parentInfo, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childrenNames">Children's Names *</Label>
              <Input
                id="childrenNames"
                value={parentInfo.childrenNames}
                onChange={(e) => setParentInfo({ ...parentInfo, childrenNames: e.target.value })}
                placeholder="Jane Doe, John Doe Jr."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Your Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={parentInfo.dateOfBirth}
                onChange={(e) => setParentInfo({ ...parentInfo, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={parentInfo.address}
                onChange={(e) => setParentInfo({ ...parentInfo, address: e.target.value })}
                placeholder="123 Main St, Apt 4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={parentInfo.city}
                onChange={(e) => setParentInfo({ ...parentInfo, city: e.target.value })}
                placeholder="Austin"
              />
            </div>
            <div className="space-y-2 grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={parentInfo.state}
                  onChange={(e) => setParentInfo({ ...parentInfo, state: e.target.value })}
                  placeholder="TX"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input
                  id="zip"
                  value={parentInfo.zip}
                  onChange={(e) => setParentInfo({ ...parentInfo, zip: e.target.value })}
                  placeholder="78701"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={parentInfo.phone}
                onChange={(e) => setParentInfo({ ...parentInfo, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={parentInfo.email}
                onChange={(e) => setParentInfo({ ...parentInfo, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </Card>

        {/* Court Information */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <div className="text-sm">Court Information</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courtType">Court Type</Label>
              <Select
                value={courtInfo.courtType}
                onValueChange={(value) => setCourtInfo({ ...courtInfo, courtType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select court type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="district">District Court</SelectItem>
                  <SelectItem value="family">Family Court</SelectItem>
                  <SelectItem value="juvenile">Juvenile Court</SelectItem>
                  <SelectItem value="superior">Superior Court</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courtName">Full Court Name (Optional)</Label>
              <Input
                id="courtName"
                value={courtInfo.courtName}
                onChange={(e) => setCourtInfo({ ...courtInfo, courtName: e.target.value })}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judgeName">Judge Name (Optional)</Label>
              <Input
                id="judgeName"
                value={courtInfo.judgeName}
                onChange={(e) => setCourtInfo({ ...courtInfo, judgeName: e.target.value })}
                placeholder="Hon. Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="division">Division (Optional)</Label>
              <Input
                id="division"
                value={courtInfo.division}
                onChange={(e) => setCourtInfo({ ...courtInfo, division: e.target.value })}
                placeholder="e.g., Family Division, Civil Division"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* AI Enhancement Status */}
      {documents.length > 0 && (
        <Card className="p-4 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-green-900 dark:text-green-100">AI-Enhanced Document Generation</div>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} analyzed • {aiInsights.caseLaw.length} case law citations • {aiInsights.strategies.length} strategies identified
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseAIEnhancement(!useAIEnhancement)}
              className={useAIEnhancement ? "border-green-600 text-green-600" : ""}
            >
              {useAIEnhancement ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI On
                </>
              ) : (
                <>AI Off</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Recommended Documents Based on Violations */}
      {recommendedDocs.length > 0 && (
        <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <div className="text-blue-900 dark:text-blue-100 mb-1">
                Recommended Documents for Your Case
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Based on your violations{documents.length > 0 ? ', uploaded documents,' : ''} and case details, these documents are recommended:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {recommendedDocs.map((doc, index) => (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{doc.title}</div>
                      <Badge variant={doc.priority === "High" ? "destructive" : "secondary"}>
                        {doc.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.reason}</p>
                  </div>
                  <Button
                    onClick={() => generateDocument(doc.type)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Analysis Summary */}
      {useAIEnhancement && documents.length > 0 && aiInsights.caseLaw.length > 0 && (
        <Card className="p-6 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-start gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="text-purple-900 dark:text-purple-100 mb-1">
                AI Analysis Summary from Your Documents
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Key findings that will be incorporated into your generated documents:
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {aiInsights.caseLaw.length > 0 && (
              <AccordionItem value="caselaw" className="border bg-white dark:bg-gray-800 rounded-lg px-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-600" />
                    <span>Relevant Case Law ({aiInsights.caseLaw.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {aiInsights.caseLaw.map((law, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{law}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {aiInsights.strategies.length > 0 && (
              <AccordionItem value="strategies" className="border bg-white dark:bg-gray-800 rounded-lg px-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Defense Strategies ({aiInsights.strategies.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {aiInsights.strategies.map((strategy, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {aiInsights.recommendations.length > 0 && (
              <AccordionItem value="recommendations" className="border bg-white dark:bg-gray-800 rounded-lg px-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Recommended Actions ({aiInsights.recommendations.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {aiInsights.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <Alert className="mt-4 border-purple-300 bg-purple-100 dark:bg-purple-900/30">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200 text-xs">
              These insights from your uploaded documents will be automatically integrated into the legal arguments and citations in your generated court documents.
            </AlertDescription>
          </Alert>
        </Card>
      )}

      {/* Document Type Selection */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="text-sm mb-2">Select Document Type to Generate</div>
          <p className="text-xs text-muted-foreground mb-4">
            Choose from properly formatted court documents{useAIEnhancement && documents.length > 0 ? ' with AI-enhanced legal arguments' : ''}
          </p>
        </div>

        <Tabs defaultValue="motions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="motions">Motions</TabsTrigger>
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="motions" className="space-y-3">
            <Button
              onClick={() => generateDocument("motion-dismiss")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Gavel className="w-4 h-4" />
                  <span>Motion to Dismiss</span>
                  {selectedViolations.length >= 3 && (
                    <Badge variant="default" className="text-xs">Recommended</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Court-ready motion with legal citations (Santosky, Troxel, Stanley)
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("motion-suppress")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!violations.fourthAmendment || !parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Motion to Suppress Evidence</span>
                  {violations.fourthAmendment && (
                    <Badge variant="default" className="text-xs">Recommended</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  4th Amendment motion with Payton, Mapp, Calabretta citations
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("motion-reunification")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Motion for Reunification</span>
                  {(violations.noReasonableEfforts || violations.noServicesOffered) && (
                    <Badge variant="default" className="text-xs">Recommended</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Request child return with service plan compliance details
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("answer-petition")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4" />
                  <span>Answer to Petition</span>
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Formal response with affirmative defenses and verification
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("motion-visitation")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Motion for Modification of Visitation</span>
                  {violations.deniedVisitation && (
                    <Badge variant="default" className="text-xs">Recommended</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Increase visitation frequency/duration with progressive plan
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("emergency-motion")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Emergency Motion for Expedited Hearing</span>
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Request immediate court intervention for urgent matters
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("notice-appeal")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Gavel className="w-4 h-4" />
                  <span>Notice of Appeal</span>
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Appeal unfavorable court order with grounds and relief sought
                </div>
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="discovery" className="space-y-3">
            <Button
              onClick={() => generateDocument("motion-compel-discovery")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4" />
                  <span>Motion to Compel Discovery</span>
                  <Badge variant="default" className="text-xs">Recommended</Badge>
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Force CPS to produce withheld documents (Brady violations)
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("discovery")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Request for Production of Documents</span>
                  <Badge variant="default" className="text-xs">Recommended</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Comprehensive discovery request for all CPS records
                </div>
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="other" className="space-y-3">
            <Button
              onClick={() => generateDocument("declaration")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Declaration (Sworn Statement)</span>
                  <Badge variant="default" className="text-xs">Recommended</Badge>
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Sworn declaration with verification and notary block
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("protective-order")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Request for Protective Order</span>
                  <Badge variant="outline" className="text-xs">Professional Template</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Protect confidential medical/mental health records
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateDocument("affidavit")}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              disabled={!parentInfo.fullName}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Sworn Affidavit (Classic)</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Traditional affidavit format
                </div>
              </div>
            </Button>
          </TabsContent>
        </Tabs>

        {!parentInfo.fullName && (
          <Alert className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Please fill in your information above to generate documents
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Generated Documents Results */}
      {Object.keys(generatedDocuments).length > 0 && (
        <Card className="p-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div className="text-green-900 dark:text-green-100">
              Generated Documents ({Object.keys(generatedDocuments).length})
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {Object.entries(generatedDocuments).map(([type, content]) => {
              const docTitle = 
                type === "motion-dismiss" ? "Motion to Dismiss" :
                type === "motion-suppress" ? "Motion to Suppress Evidence" :
                type === "affidavit" ? "Sworn Affidavit" :
                type === "motion-return" ? "Motion for Return of Children" :
                type === "emergency-motion" ? "Emergency Motion" :
                type === "discovery" ? "Discovery Request" :
                "Document";

              return (
                <AccordionItem key={type} value={type} className="border bg-white dark:bg-gray-800 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div>{docTitle}</div>
                        <div className="text-xs text-muted-foreground">
                          Click to preview • Ready to copy or download
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => copyToClipboard(content, docTitle)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                        <Button
                          onClick={() => downloadDocument(content, `${docTitle.replace(/ /g, '_')}.txt`)}
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>

                      <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                          <strong>ATTORNEY REVIEW REQUIRED:</strong> This document must be reviewed and customized by a licensed attorney before filing with the court. This is a template for educational purposes only.
                        </AlertDescription>
                      </Alert>

                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{content}</pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      )}

      {/* Legal Disclaimer */}
      <Alert variant="default" className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>IMPORTANT LEGAL DISCLAIMER:</strong> All generated documents are templates for educational purposes only and must be reviewed, customized, and approved by a licensed attorney in your jurisdiction before filing with any court. Do not file these documents without attorney review. This tool does not provide legal advice. Improper filing of court documents can harm your case.
        </AlertDescription>
      </Alert>
    </div>
  );
}
