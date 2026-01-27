// Legal Document Templates Library
// Based on real court forms and legal pleadings used in CPS/Family Law cases
// Templates follow proper legal formatting and citation standards

interface TemplateData {
  // Court Information
  courtName: string;
  courtType: string;
  judgeName: string;
  courtAddress: string;
  division: string;
  
  // Case Information
  caseNumber: string;
  county: string;
  state: string;
  dateOpened: string;
  caseworker: string;
  
  // Parent Information
  parentName: string;
  parentAddress: string;
  parentCity: string;
  parentState: string;
  parentZip: string;
  parentPhone: string;
  parentEmail: string;
  childrenNames: string;
  parentDOB: string;
  
  // Attorney Information
  attorneyName: string;
  attorneyBarNumber?: string;
  attorneyFirm?: string;
  attorneyAddress?: string;
  attorneyPhone?: string;
  attorneyEmail?: string;
  
  // Case-Specific Data
  violations?: string[];
  facts?: string[];
  evidence?: string[];
  caseLaw?: string[];
  dateOfIncident?: string;
  dateOfRemoval?: string;
  hearingDate?: string;
  
  // AI-Generated Content
  aiInsights?: {
    caseLaw: string[];
    strategies: string[];
    keyFacts: string[];
    recommendations: string[];
  };
}

// Helper function to format court caption
export const formatCaption = (data: TemplateData, documentTitle: string): string => {
  const courtTypeFormatted = data.courtType === "district" ? "DISTRICT COURT"
    : data.courtType === "family" ? "FAMILY COURT"
    : data.courtType === "juvenile" ? "JUVENILE COURT"
    : data.courtType === "superior" ? "SUPERIOR COURT"
    : "DISTRICT COURT";

  return `IN THE ${courtTypeFormatted}
${data.courtName || `FOR ${data.county} COUNTY, ${data.state}`}
${data.division ? `${data.division} DIVISION` : ''}

IN THE INTEREST OF:                    §
                                        §    CAUSE NO. ${data.caseNumber || "[CASE NUMBER]"}
${data.childrenNames || "[CHILD/CHILDREN'S NAMES]"}, §
                                        §
CHILD/CHILDREN                          §    ${data.county.toUpperCase()} COUNTY, ${data.state.toUpperCase()}

${documentTitle.toUpperCase()}
`;
};

// Helper function to format signature block
export const formatSignature = (data: TemplateData, isPro: boolean = false): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  if (isPro && data.attorneyName) {
    return `
Dated: ${today}

Respectfully submitted,

_________________________________
${data.attorneyName}
${data.attorneyBarNumber ? `State Bar No. ${data.attorneyBarNumber}` : ''}
${data.attorneyFirm || ''}
${data.attorneyAddress || ''}
${data.attorneyPhone ? `Phone: ${data.attorneyPhone}` : ''}
${data.attorneyEmail ? `Email: ${data.attorneyEmail}` : ''}

ATTORNEY FOR ${data.parentName.toUpperCase()}
`;
  } else {
    return `
Dated: ${today}

Respectfully submitted,

_________________________________
${data.parentName}
${data.parentAddress}
${data.parentCity}, ${data.parentState} ${data.parentZip}
${data.parentPhone ? `Phone: ${data.parentPhone}` : ''}
${data.parentEmail ? `Email: ${data.parentEmail}` : ''}

PRO SE
`;
  }
};

// ==========================================
// TEMPLATE 1: MOTION TO DISMISS
// ==========================================
export const generateMotionToDismiss = (data: TemplateData): string => {
  const violations = data.violations || [];
  const facts = data.facts || [];
  const caseLaw = data.caseLaw || [];

  return `${formatCaption(data, "MOTION TO DISMISS")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and respectfully moves this Court to dismiss the above-captioned matter in its entirety, and in support thereof would show the Court as follows:

I. INTRODUCTION

     This matter involves allegations of abuse or neglect against ${data.parentName} regarding the minor child(ren), ${data.childrenNames}. ${data.parentName} respectfully submits that the Department has failed to meet its burden of proof and that this case should be dismissed for the following reasons.

II. LEGAL STANDARD

     Under the Due Process Clause of the Fourteenth Amendment to the United States Constitution, the government must prove allegations of abuse or neglect by clear and convincing evidence. Santosky v. Kramer, 455 U.S. 745, 769 (1982). This heightened standard of proof reflects the fundamental liberty interest that parents have in the care, custody, and control of their children. Troxel v. Granville, 530 U.S. 57, 65 (2000).

     A petition for removal must state facts that, if true, would constitute abuse or neglect as defined by state statute. Vague or conclusory allegations are insufficient. The Department must present credible evidence supporting each element of its claims.

III. GROUNDS FOR DISMISSAL

A. Insufficient Evidence

     The Department has failed to present clear and convincing evidence of abuse or neglect. The evidence presented consists primarily of:
${violations.includes('hearsayEvidence') || violations.includes('noPhysicalEvidence') ? `
     • Hearsay statements that are inadmissible and unreliable
     • Speculative conclusions unsupported by physical evidence
     • Unsubstantiated allegations from biased sources` : ''}
${facts.length > 0 ? `
     The undisputed facts demonstrate:
${facts.slice(0, 5).map((fact, i) => `     ${i + 1}. ${fact}`).join('\n')}` : ''}

     This evidence is insufficient to meet the heightened clear and convincing standard required by Santosky.

B. Constitutional Violations
${violations.includes('fourteenthAmendment') || violations.includes('noWrittenNotice') ? `
     1. Due Process Violations

     ${data.parentName}'s constitutional rights to due process have been violated in the following ways:
     
     • Inadequate or untimely notice of allegations
     • Failure to provide notice of hearing dates with sufficient time to prepare
     • Denial of fundamental fairness in the investigative process
     
     The Fourteenth Amendment requires that parents receive adequate notice and a meaningful opportunity to be heard before their parental rights are affected. Stanley v. Illinois, 405 U.S. 645 (1972).` : ''}
${violations.includes('fourthAmendment') ? `
     2. Fourth Amendment Violations

     The Department violated ${data.parentName}'s Fourth Amendment rights by:
     
     • Conducting a warrantless search of the home without consent
     • Failing to establish probable cause or exigent circumstances
     • Coercing entry through threats and intimidation
     
     The sanctity of the home requires that government agents obtain a warrant before conducting searches, absent exigent circumstances. Payton v. New York, 445 U.S. 573 (1980).` : ''}
${violations.includes('deniedLegalCounsel') ? `
     3. Right to Counsel

     ${data.parentName} was denied the right to consult with legal counsel before making critical decisions, including:
     
     • Signing safety plans or service agreements
     • Submitting to interrogation by investigators
     • Agreeing to removal of the child(ren)
     
     This denial of counsel violated both state law and fundamental fairness principles.` : ''}

C. Failure to Comply with Statutory Requirements
${violations.includes('noReasonableEfforts') ? `
     1. Reasonable Efforts

     The Department failed to make reasonable efforts to prevent removal as required by 42 U.S.C. § 671(a)(15)(B) and applicable state law. Specifically:
     
     • No safety plan was offered that would allow the child(ren) to remain at home
     • No in-home services were provided prior to removal
     • Less restrictive alternatives were not explored
     • Relatives were not contacted for placement
     
     The Adoption and Safe Families Act (ASFA) requires that agencies make reasonable efforts to preserve families before resorting to removal.` : ''}
${violations.includes('inappropriatePlacement') || violations.includes('separatedSiblings') ? `
     2. Placement Preferences

     The Department violated statutory placement preferences by:
     
     • Failing to prioritize placement with relatives
     • Separating siblings without compelling justification
     • Placing child(ren) outside their community and school district
     
     State and federal law require that agencies give priority to relative placements and maintain sibling relationships whenever possible.` : ''}

D. Procedural Defects
${violations.includes('missedDeadlines') ? `
     The Department failed to comply with mandatory statutory deadlines:
     
     • Initial hearing was not held within required timeframe
     • Service plan was not filed within statutory deadline
     • Status reviews were not conducted timely
     
     These procedural violations prejudice ${data.parentName}'s ability to achieve timely reunification.` : ''}

IV. APPLICABLE CASE LAW
${caseLaw.length > 0 ? `
     The following authorities support dismissal:
${caseLaw.slice(0, 8).map((cite, i) => `
     ${i + 1}. ${cite}`).join('')}` : `
     • Santosky v. Kramer, 455 U.S. 745 (1982) - Clear and convincing evidence standard required
     • Troxel v. Granville, 530 U.S. 57 (2000) - Fundamental parental rights
     • Stanley v. Illinois, 405 U.S. 645 (1972) - Due process protections for parents
     • In re Gault, 387 U.S. 1 (1967) - Procedural safeguards in dependency proceedings`}

V. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court:

     1. GRANT this Motion to Dismiss and dismiss the petition in its entirety;
     
     2. Order the immediate return of ${data.childrenNames} to ${data.parentName}'s care and custody;
     
     3. Award ${data.parentName} attorney's fees and costs incurred in defending this action; and
     
     4. Grant such other and further relief, both general and special, at law or in equity, to which ${data.parentName} may be justly entitled.
${formatSignature(data, !!data.attorneyName)}

CERTIFICATE OF SERVICE

     I hereby certify that a true and correct copy of the foregoing Motion to Dismiss has been delivered to all counsel of record on this ${new Date().getDate()} day of ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${new Date().getFullYear()}.

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 2: MOTION TO SUPPRESS EVIDENCE
// ==========================================
export const generateMotionToSuppress = (data: TemplateData): string => {
  return `${formatCaption(data, "MOTION TO SUPPRESS EVIDENCE")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Motion to Suppress Evidence, and in support thereof would respectfully show the Court as follows:

I. INTRODUCTION

     ${data.parentName} moves to suppress all evidence obtained as a result of an unlawful search and seizure conducted by the Department on or about ${data.dateOfIncident || '[DATE]'}. The evidence was obtained in violation of the Fourth Amendment to the United States Constitution and applicable state constitutional provisions.

II. FACTUAL BACKGROUND

     On ${data.dateOfIncident || '[DATE]'}, agents of the Department appeared at ${data.parentName}'s residence located at ${data.parentAddress}, ${data.parentCity}, ${data.parentState} ${data.parentZip}.

     The agents:
     • Entered the home without a warrant
     • Failed to obtain voluntary consent
     • Conducted a search of the premises
     • Removed the child(ren) without court authorization
     • Photographed the child(ren) and home without consent

     At no time did the agents:
     • Present a warrant or court order
     • Explain that ${data.parentName} had the right to refuse entry
     • Identify any exigent circumstances justifying warrantless entry
     • Seek consent before conducting the search

III. LEGAL ARGUMENT

A. Fourth Amendment Protection

     The Fourth Amendment protects individuals from unreasonable searches and seizures by government agents. Katz v. United States, 389 U.S. 347 (1967). This protection applies with full force to child welfare investigations. Calabretta v. Floyd, 189 F.3d 808, 812 (9th Cir. 1999).

     A warrantless search of a home is "presumptively unreasonable" and violates the Fourth Amendment unless it falls within a recognized exception. Payton v. New York, 445 U.S. 573, 586 (1980).

B. No Valid Consent

     For consent to be valid, it must be:
     1. Voluntary
     2. Given by one with authority
     3. Free from coercion or duress

     Schneckloth v. Bustamonte, 412 U.S. 218 (1973).

     In this case, no valid consent was obtained. The agents:
     • Used threats and intimidation
     • Implied that refusal would result in immediate removal
     • Failed to inform ${data.parentName} of the right to refuse
     • Created a coercive atmosphere through their numbers and demeanor

     Under these circumstances, any purported "consent" was not voluntary and cannot justify the search.

C. No Exigent Circumstances

     Warrantless searches may be justified by exigent circumstances when there is:
     1. Probable cause to believe evidence is present
     2. A reasonable belief that delay would result in:
        a. Destruction of evidence
        b. Escape of a suspect
        c. Danger to officers or others

     Welsh v. Wisconsin, 466 U.S. 740 (1984).

     No exigent circumstances existed here:
     • The child(ren) were not in imminent danger
     • ${data.parentName} was cooperative
     • No emergency medical situation existed
     • There was sufficient time to obtain a warrant

     The agents' own reports acknowledge that they scheduled the visit in advance, negating any claim of exigency.

D. Exclusionary Rule Applies

     Evidence obtained in violation of the Fourth Amendment must be suppressed. Mapp v. Ohio, 367 U.S. 643 (1961). This includes:
     
     • Physical evidence seized during the search
     • Photographs taken during the unlawful entry
     • Statements obtained during the illegal search
     • Observations made after unlawful entry
     • Any derivative evidence ("fruit of the poisonous tree")

     Wong Sun v. United States, 371 U.S. 471 (1963).

E. Good Faith Exception Does Not Apply

     The good faith exception to the exclusionary rule does not apply when:
     • No warrant was obtained
     • Agents knew or should have known their conduct was unlawful
     • Agents deliberately violated constitutional rights

     United States v. Leon, 468 U.S. 897 (1984).

     Here, the agents made no effort to obtain a warrant despite having ample opportunity. They cannot claim good faith when they deliberately bypassed the warrant requirement.

IV. APPLICABLE AUTHORITY

     • U.S. Const. amend. IV
     • Payton v. New York, 445 U.S. 573 (1980)
     • Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)
     • Mapp v. Ohio, 367 U.S. 643 (1961)
     • Schneckloth v. Bustamonte, 412 U.S. 218 (1973)
     • Welsh v. Wisconsin, 466 U.S. 740 (1984)
     • Wong Sun v. United States, 371 U.S. 471 (1963)
     • Katz v. United States, 389 U.S. 347 (1967)

V. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court:

     1. GRANT this Motion to Suppress Evidence;
     
     2. Suppress all evidence obtained as a result of the unlawful search and seizure;
     
     3. Prohibit the Department from introducing such evidence at any hearing;
     
     4. Dismiss the petition for lack of admissible evidence; and
     
     5. Grant such other and further relief to which ${data.parentName} may be justly entitled.
${formatSignature(data, !!data.attorneyName)}

CERTIFICATE OF SERVICE

     I hereby certify that a true and correct copy of the foregoing Motion to Suppress Evidence has been delivered to all counsel of record on this ${new Date().getDate()} day of ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${new Date().getFullYear()}.

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 3: MOTION FOR REUNIFICATION
// ==========================================
export const generateMotionForReunification = (data: TemplateData): string => {
  const facts = data.facts || [];
  
  return `${formatCaption(data, "MOTION FOR REUNIFICATION")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Motion for Reunification, and in support thereof would respectfully show the Court as follows:

I. INTRODUCTION

     ${data.parentName} respectfully moves this Court to order the reunification of ${data.childrenNames} with ${data.parentName}. ${data.parentName} has substantially complied with all court orders and the service plan, has addressed the issues that led to removal, and reunification is in the best interests of the child(ren).

II. PROCEDURAL HISTORY

     This case was opened on or about ${data.dateOpened || '[DATE]'}.
     
     The child(ren) were removed from ${data.parentName}'s care on ${data.dateOfRemoval || '[DATE]'}.
     
     ${data.parentName} has been working diligently toward reunification since that date.

III. SERVICE PLAN COMPLIANCE

     ${data.parentName} has substantially complied with all requirements of the court-ordered service plan:

A. Completed Services
${facts.filter(f => f.toLowerCase().includes('complete') || f.toLowerCase().includes('attend')).length > 0 ? 
facts.filter(f => f.toLowerCase().includes('complete') || f.toLowerCase().includes('attend')).slice(0, 6).map((fact, i) => 
`     ${i + 1}. ${fact}`).join('\n') : `
     1. Completed parenting education program (Certificate attached as Exhibit A)
     2. Successfully completed substance abuse assessment and treatment
     3. Maintained stable housing suitable for the child(ren)
     4. Obtained and maintained legal employment
     5. Completed domestic violence counseling
     6. Attended all scheduled visitations without incident`}

B. Visitation Record

     ${data.parentName} has:
     • Attended 100% of scheduled visits
     • Demonstrated appropriate parenting during visits
     • Maintained positive interactions with the child(ren)
     • Followed all visitation rules and guidelines
     
     Visitation reports (attached as Exhibit B) document ${data.parentName}'s strong bond with the child(ren) and ability to meet their needs.

C. Changed Circumstances

     Since the date of removal, ${data.parentName} has:
     • Addressed all safety concerns identified by the Department
     • Completed all recommended services and counseling
     • Established a safe and stable home environment
     • Demonstrated sustained behavioral changes
     • Built a support network to assist with parenting

IV. LEGAL STANDARD

A. Reunification Preference

     Federal and state law establish a strong preference for reunification. The Adoption and Safe Families Act (ASFA) requires reasonable efforts to reunify families. 42 U.S.C. § 671(a)(15)(B).

     The fundamental liberty interest of parents in the care, custody, and control of their children requires that reunification be ordered when the parent has remedied the conditions that led to removal. In re C.H., 89 S.W.3d 17 (2002).

B. Best Interests Standard

     Reunification is presumed to be in the best interests of the child unless the Department proves by clear and convincing evidence that reunification would place the child at substantial risk of harm. In re A.V., 113 S.W.3d 355 (2003).

     Factors to consider include:
     1. The parent-child bond
     2. The parent's compliance with services
     3. Changed circumstances since removal
     4. The child's wishes (if age-appropriate)
     5. The permanency plan
     6. The child's need for stability

V. BEST INTERESTS ANALYSIS

     Reunification serves the best interests of ${data.childrenNames} for the following reasons:

A. Strong Parent-Child Bond

     ${data.parentName} and ${data.childrenNames} share a strong, healthy bond. The child(ren) express a desire to return home and ask about reunification during every visit.
     
     [If available: Bonding evaluation by Dr. [NAME] confirms strong attachment (Exhibit C)]

B. Elimination of Safety Concerns

     All safety concerns that led to removal have been addressed:
     • Home is safe, clean, and appropriate for children
     • Financial stability has been achieved
     • Support system is in place
     • Parenting skills have been demonstrated

C. Child's Wishes

     [If age-appropriate] ${data.childrenNames}, age [AGE], has expressed a clear desire to return to ${data.parentName}'s care. The child's preference should be given substantial weight.

D. Stability Through Reunification

     While foster care may provide temporary stability, permanent stability is achieved through reunification with the biological parent. Continued separation causes emotional harm to the child(ren).

E. Length of Separation

     The child(ren) have been in care for [DURATION]. Prolonged separation causes developmental harm and undermines the parent-child relationship. Prompt reunification is necessary to preserve this fundamental bond.

VI. REASONABLE EFFORTS TOWARD REUNIFICATION

     The Department has a continuing duty to make reasonable efforts toward reunification. ${data.parentName} has done everything requested and more. Continued separation is no longer justified.

     The Department cannot:
     • Add new requirements after substantial compliance
     • Move the goal posts to delay reunification
     • Require perfection rather than substantial compliance
     • Use minor issues to justify continued separation

VII. GRADUATED REUNIFICATION PLAN

     If the Court has any remaining concerns, ${data.parentName} respectfully requests a graduated reunification plan:

     Phase 1 (Weeks 1-2):
     • Increase visitation to daily unsupervised visits
     • Weekend overnight visits

     Phase 2 (Weeks 3-4):
     • Extended overnight visits (3-4 days)
     • Department conducts home visits

     Phase 3 (Week 5+):
     • Full reunification
     • Protective supervision for 3-6 months
     • Ongoing services and support

VIII. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court:

     1. GRANT this Motion for Reunification;
     
     2. Order the immediate reunification of ${data.childrenNames} with ${data.parentName};
     
     3. In the alternative, order a graduated reunification plan;
     
     4. Order protective supervision to support the family;
     
     5. Dismiss this case upon successful completion of supervision; and
     
     6. Grant such other and further relief to which ${data.parentName} may be justly entitled.
${formatSignature(data, !!data.attorneyName)}

CERTIFICATE OF SERVICE

     I hereby certify that a true and correct copy of the foregoing Motion for Reunification has been delivered to all counsel of record on this ${new Date().getDate()} day of ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${new Date().getFullYear()}.

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 4: ANSWER TO PETITION
// ==========================================
export const generateAnswerToPetition = (data: TemplateData): string => {
  return `${formatCaption(data, "ANSWER TO PETITION")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Answer to the Department's Petition, and in response thereto would respectfully show the Court as follows:

I. GENERAL DENIAL

     ${data.parentName} generally denies each and every allegation, matter, and thing set forth in the Department's Petition not herein expressly and specifically admitted.

II. SPECIFIC RESPONSES TO ALLEGATIONS

     ${data.parentName} responds to the specific paragraphs of the Petition as follows:

     Paragraph 1: [Admitted / Denied / Insufficient knowledge]
     
     Response: ${data.parentName} admits that the Court has jurisdiction but denies that removal was necessary or appropriate.

     Paragraph 2: [Admitted / Denied]
     
     Response: ${data.parentName} admits the identities of the parties but denies the characterization of the relationship.

     Paragraph 3-[N]: DENIED
     
     Response: ${data.parentName} specifically denies the allegations of abuse or neglect. The evidence does not support these conclusory allegations.

III. AFFIRMATIVE DEFENSES

     ${data.parentName} asserts the following affirmative defenses:

A. Insufficiency of Evidence

     The Department has failed to allege sufficient facts to state a claim for abuse or neglect under applicable state law. The allegations are vague, conclusory, and unsupported by credible evidence.

B. Failure to State a Claim

     Even if all allegations in the Petition were true (which they are not), they would not constitute abuse or neglect as defined by state statute.

C. Constitutional Violations

     The investigation and removal violated ${data.parentName}'s constitutional rights:
     
     • Fourth Amendment - Unlawful search and seizure
     • Fourteenth Amendment - Deprivation of liberty without due process
     • Equal Protection - Discriminatory application of child welfare laws

D. Failure to Make Reasonable Efforts

     The Department failed to make reasonable efforts to prevent removal as required by 42 U.S.C. § 671(a)(15)(B) and state law. Less restrictive alternatives were available but not pursued.

E. Improper Investigation

     The investigation was biased, incomplete, and conducted in violation of Department policy and state law. Exculpatory evidence was ignored.

F. Hearsay and Unreliable Evidence

     The Petition relies on inadmissible hearsay and unreliable evidence that cannot support a finding by clear and convincing evidence.

G. No Imminent Danger

     There was no imminent danger to the child(ren) justifying emergency removal without a hearing.

H. Suitable Alternative Placement

     Even if some safety concerns existed (which is denied), relative placement or safety planning could have addressed them without removal.

I. Laches and Delay

     The Department's delay in filing the Petition and prosecuting this case has prejudiced ${data.parentName}'s rights and the child(ren)'s need for permanency.

IV. DENIAL OF ENDANGERMENT

     ${data.parentName} specifically denies that:
     
     • Any abuse or neglect occurred
     • The child(ren) were endangered
     • ${data.parentName} is unable or unwilling to provide safe care
     • Removal was necessary or appropriate
     • The Department made reasonable efforts to prevent removal

V. REQUEST FOR RELIEF

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court:

     1. Dismiss the Petition for failure to state a claim;
     
     2. Find that the Department has not met its burden of proof;
     
     3. Order the immediate return of ${data.childrenNames} to ${data.parentName}'s care;
     
     4. Order family maintenance services rather than continued removal;
     
     5. Award attorney's fees and costs; and
     
     6. Grant all other relief to which ${data.parentName} is entitled.
${formatSignature(data, !!data.attorneyName)}

VERIFICATION

STATE OF ${data.state.toUpperCase()}    §
                                         §
COUNTY OF ${data.county.toUpperCase()}  §

     BEFORE ME, the undersigned authority, on this day personally appeared ${data.parentName}, who being by me duly sworn, on oath stated:

     "My name is ${data.parentName}. I am over 18 years of age and fully competent to make this verification. I have read the foregoing Answer and the facts stated therein are true and correct to the best of my knowledge and belief."

_________________________________
${data.parentName}

     SWORN TO AND SUBSCRIBED before me on this _____ day of _____________, 20___.

_________________________________
Notary Public, State of ${data.state}
My Commission Expires: __________

CERTIFICATE OF SERVICE

     I hereby certify that a true and correct copy of the foregoing Answer to Petition has been delivered to all counsel of record on this ${new Date().getDate()} day of ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${new Date().getFullYear()}.

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 5: MOTION FOR MODIFICATION OF VISITATION
// ==========================================
export const generateMotionForVisitation = (data: TemplateData): string => {
  return `${formatCaption(data, "MOTION FOR MODIFICATION OF VISITATION")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Motion for Modification of Visitation, and in support thereof would respectfully show the Court as follows:

I. INTRODUCTION

     ${data.parentName} respectfully moves this Court to modify the current visitation order to increase the frequency and duration of visits with ${data.childrenNames}. Increased visitation is necessary to maintain and strengthen the parent-child bond and is in the best interests of the child(ren).

II. CURRENT VISITATION ORDER

     The Court's current order provides for:
     • [Frequency]: __________ visits per week/month
     • [Duration]: __________ hours per visit
     • [Supervision]: Supervised / Unsupervised
     • [Location]: __________

III. REQUESTED MODIFICATION

     ${data.parentName} respectfully requests that visitation be modified as follows:
     
     • Frequency: Daily visits or minimum 5 days per week
     • Duration: Minimum 4 hours per visit
     • Supervision: Unsupervised (or reduced supervision)
     • Location: In ${data.parentName}'s home when possible
     • Overnight visits: Progressive plan leading to overnights

IV. GROUNDS FOR MODIFICATION

A. Maintaining Parent-Child Bond

     Frequent, quality visitation is essential to maintaining the parent-child relationship. Research demonstrates that:
     
     • Children in foster care need consistent contact with parents
     • Infrequent visits undermine attachment and bonding
     • Liberal visitation increases likelihood of successful reunification
     • Parent-child separation causes developmental harm

     In re C.H., 89 S.W.3d 17, 27 (2002) (recognizing importance of visitation).

B. Successful Visitation History

     ${data.parentName} has demonstrated:
     • Perfect attendance at all scheduled visits
     • Appropriate interactions with the child(ren)
     • Compliance with all visitation rules
     • Progress in parenting skills
     • Ability to meet the child(ren)'s needs

     Visitation supervisors have reported [positive findings - attach reports as exhibits].

C. Service Plan Progress

     ${data.parentName} has made substantial progress on the service plan:
     • Completed parenting classes
     • Demonstrated housing stability
     • Maintained employment
     • Completed counseling/treatment
     • Addressed safety concerns

     This progress supports increased visitation as a step toward reunification.

D. Best Interests of the Child

     Increased visitation serves the best interests of ${data.childrenNames}:
     
     • Child expresses desire for more time with parent
     • Child shows positive response to visits
     • Longer visits allow for more natural parent-child interactions
     • Home visits allow child to maintain connection to home environment
     • Progressive visitation prepares for reunification

E. Fundamental Liberty Interest

     ${data.parentName} has a fundamental liberty interest in the parent-child relationship. Troxel v. Granville, 530 U.S. 57 (2000). Restrictions on visitation must be narrowly tailored to serve a compelling state interest.
     
     Current visitation restrictions are overly broad and not supported by current evidence.

V. CHANGE IN CIRCUMSTANCES

     Since the entry of the current visitation order, the following circumstances have changed:
     
     1. ${data.parentName} has completed required services
     2. Safety concerns have been addressed
     3. ${data.parentName} has demonstrated consistent appropriate parenting
     4. The child(ren) have requested increased contact
     5. [Time period] has passed without incident
     6. Expert evaluation supports increased visitation

VI. NO SAFETY CONCERNS

     There are no current safety concerns that would justify restricting visitation:
     
     • No recent allegations or incidents
     • All drug screens negative (if applicable)
     • Housing is safe and appropriate
     • ${data.parentName} has demonstrated protective capacity
     • Support system is in place

     The Department's reports acknowledge that visits have gone well and ${data.parentName} poses no safety risk during visitation.

VII. PROGRESSIVE REUNIFICATION PLAN

     Increased visitation should follow a progressive plan:

     Phase 1 (Immediate):
     • Increase to daily 4-hour visits
     • Reduce supervision to periodic monitoring
     • Allow visits in ${data.parentName}'s home

     Phase 2 (After 2 weeks of successful visits):
     • Add weekend day visits (8-10 hours)
     • Fully unsupervised visits
     • Child participates in normal activities with parent

     Phase 3 (After 4 weeks):
     • Overnight weekend visits
     • Extended visits during school breaks

     Phase 4 (After 6-8 weeks):
     • Trial home placement
     • Protective supervision
     • Full reunification

VIII. LEGAL AUTHORITY

     • Troxel v. Granville, 530 U.S. 57 (2000)
     • In re C.H., 89 S.W.3d 17 (2002)
     • 42 U.S.C. § 671(a)(15) (reasonable efforts)
     • [State statute on visitation rights]

IX. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court:

     1. GRANT this Motion for Modification of Visitation;
     
     2. Order increased visitation as outlined above;
     
     3. Order progressive unsupervised visitation leading to overnight visits;
     
     4. Allow visits to occur in ${data.parentName}'s home;
     
     5. Order the Department to support and facilitate liberal visitation; and
     
     6. Grant such other and further relief to which ${data.parentName} is entitled.
${formatSignature(data, !!data.attorneyName)}

CERTIFICATE OF SERVICE

     I hereby certify that a true and correct copy of the foregoing Motion for Modification of Visitation has been delivered to all counsel of record on this ${new Date().getDate()} day of ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${new Date().getFullYear()}.

_________________________________
${data.attorneyName || data.parentName}
`;
};

// Export all templates
export const templates = {
  motionToDismiss: generateMotionToDismiss,
  motionToSuppress: generateMotionToSuppress,
  motionForReunification: generateMotionForReunification,
  answerToPetition: generateAnswerToPetition,
  motionForVisitation: generateMotionForVisitation,
};

export type TemplateType = keyof typeof templates;
