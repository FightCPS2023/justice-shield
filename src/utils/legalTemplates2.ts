// Additional Legal Document Templates
// Extended library of CPS/Family Law templates

import { formatCaption, formatSignature, type TemplateData } from './legalTemplates';

// ==========================================
// TEMPLATE 6: MOTION TO COMPEL DISCOVERY
// ==========================================
export const generateMotionToCompelDiscovery = (data: TemplateData): string => {
  return `${formatCaption(data, "MOTION TO COMPEL DISCOVERY")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Motion to Compel Discovery, and in support thereof would respectfully show the Court as follows:

I. INTRODUCTION

     ${data.parentName} served discovery requests on the Department on ${data.dateOfIncident || '[DATE]'}. The Department has failed to provide complete responses and has withheld critical documents necessary to prepare an adequate defense.

II. DISCOVERY REQUESTS

     ${data.parentName} properly served the following discovery requests:
     
     • Request for Production of Documents (25 requests)
     • Interrogatories (15 questions)
     • Request for Admissions (10 requests)

     Responses were due on [DATE], but the Department has:
     • Failed to respond to several requests
     • Provided incomplete responses
     • Withheld documents without proper objection
     • Made improper blanket objections

III. SPECIFIC ITEMS WITHHELD

     The Department has improperly withheld the following discoverable materials:

A. Complete Case File
     Request No. 1: Complete CPS case file including:
     • All investigative notes and reports
     • Supervisor review documents
     • Internal communications
     • Prior unfounded reports
     
     Response: Department objected claiming "investigation privilege" without legal basis.

B. Witness Statements
     Request No. 5: All witness statements and interview notes
     
     Response: Department provided redacted statements claiming "confidentiality" but failed to provide privilege log or seek in camera review.

C. Exculpatory Evidence
     Request No. 10: All evidence favorable to ${data.parentName}, including:
     • Statements supporting ${data.parentName}
     • Evidence contradicting allegations
     • Information about source credibility
     
     Response: No response provided.

D. Worker Training and Qualifications
     Request No. 15: Training records and qualifications of assigned caseworker
     
     Response: Department objected claiming "not relevant."

E. Audio/Video Recordings
     Request No. 18: All audio or video recordings of:
     • Interviews with ${data.parentName}
     • Interviews with child(ren)
     • Home visits
     
     Response: Department claims no recordings exist, but policy requires recording of certain interactions.

F. Prior CPS History
     Request No. 20: All prior CPS reports involving this family
     
     Response: Department provided only "substantiated" reports, withholding unfounded allegations showing pattern of false reporting.

IV. LEGAL ARGUMENT

A. Broad Discovery Rights in Dependency Cases

     ${data.parentName} is entitled to broad discovery in this dependency proceeding. At stake are fundamental constitutional rights - the right to family integrity and parental custody.

     Discovery rules must be liberally construed to allow adequate preparation of defense. In re D.T., 34 S.W.3d 625 (2000).

B. No Investigation Privilege

     The Department's claim of "investigation privilege" is without merit. Texas and most states do not recognize a general investigation privilege in civil proceedings.

     The public interest in protecting children does not override ${data.parentName}'s due process right to defend against allegations. In re Baby Boy K., 546 N.W.2d 86 (1996).

C. Brady Disclosure Obligations

     Under Brady v. Maryland, 373 U.S. 83 (1963), the Department must disclose all exculpatory evidence. This includes:
     
     • Evidence of innocence
     • Impeachment evidence
     • Evidence undermining witness credibility
     • Alternative suspect information
     • Prior false allegations

D. Relevance Standard

     Evidence is discoverable if it is "reasonably calculated to lead to the discovery of admissible evidence." The relevance standard is broad and liberal.

     Worker qualifications, training records, and prior case handling are relevant to:
     • Credibility of investigation
     • Bias or preconception
     • Compliance with proper procedures
     • Pattern and practice

E. No Absolute Confidentiality

     While some CPS records have confidentiality protections, these are not absolute. The court may order disclosure when:
     
     • Necessary for fair hearing
     • Outweighed by constitutional rights at stake
     • Subject to protective order limiting use

     In camera review should be ordered if Department claims specific privilege.

V. PREJUDICE TO RESPONDENT

     The Department's failure to provide discovery prejudices ${data.parentName}:
     
     • Unable to prepare adequate defense
     • Cannot effectively cross-examine witnesses
     • Denied access to exculpatory evidence
     • Cannot investigate Department's claims
     • Forced to trial without critical information

VI. BAD FAITH

     The Department's discovery responses demonstrate bad faith:
     
     • Blanket objections without specific basis
     • No privilege log provided
     • Failure to seek protective order if legitimate concern
     • Violation of discovery rules and court orders
     • Pattern of non-compliance

VII. REQUESTED RELIEF

     ${data.parentName} requests that this Court:
     
     1. Order the Department to provide complete responses to all discovery requests within 10 days;
     
     2. Order production of all withheld documents;
     
     3. Conduct in camera review of any documents for which specific privilege is claimed;
     
     4. Impose sanctions against the Department for bad faith discovery conduct;
     
     5. Award attorney's fees and costs incurred in filing this motion; and
     
     6. Continue any scheduled hearings to allow adequate time for review of produced documents.

VIII. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court GRANT this Motion to Compel Discovery and award all requested relief.
${formatSignature(data, !!data.attorneyName)}

CERTIFICATE OF SERVICE

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 7: DECLARATION IN SUPPORT
// ==========================================
export const generateDeclaration = (data: TemplateData): string => {
  const facts = data.facts || [];
  
  return `${formatCaption(data, "DECLARATION OF " + data.parentName.toUpperCase())}

TO THE HONORABLE JUDGE OF SAID COURT:

     I, ${data.parentName}, hereby declare as follows:

I. PERSONAL BACKGROUND

     1. My name is ${data.parentName}. I am over the age of 18 and competent to make this declaration. I have personal knowledge of the facts stated herein, and they are true and correct.

     2. I am the parent of ${data.childrenNames}, who ${data.childrenNames.includes(',') ? 'are' : 'is'} the subject of this proceeding.

     3. I reside at ${data.parentAddress}, ${data.parentCity}, ${data.parentState} ${data.parentZip}. I have lived at this address since [DATE].

     4. My date of birth is ${data.parentDOB || '[DOB]'}.

II. FACTUAL BACKGROUND

     5. On or about ${data.dateOfIncident || '[DATE]'}, CPS workers appeared at my home.
${facts.length > 0 ? facts.map((fact, i) => `
     ${i + 6}. ${fact}`).join('') : `
     6. I cooperated fully with the investigation.
     
     7. I allowed the workers to inspect my home.
     
     8. I answered all questions truthfully.`}

III. RELATIONSHIP WITH CHILD(REN)

     10. I have a strong, loving bond with my child(ren). We have never been separated prior to this case.

     11. I have always provided for my child(ren)'s physical, emotional, and educational needs.

     12. My child(ren) ${data.childrenNames.includes(',') ? 'have' : 'has'} never been abused or neglected while in my care.

     13. During visits, my child(ren) ${data.childrenNames.includes(',') ? 'are' : 'is'} happy to see me and ${data.childrenNames.includes(',') ? 'do' : 'does'} not want visits to end.

IV. DENIAL OF ALLEGATIONS

     14. I deny the allegations of abuse or neglect made by CPS.

     15. Specifically, I deny that:
         a. I harmed my child(ren) in any way
         b. My home was unsafe or unsuitable
         c. I was unable or unwilling to care for my child(ren)
         d. Removal was necessary or appropriate

     16. The allegations are based on [hearsay/false information/biased reporting].

V. COMPLIANCE WITH SERVICES

     17. I have complied with all court orders and service plan requirements:

         a. Completed parenting classes on [DATE]
         b. Completed substance abuse assessment
         c. Maintained stable housing
         d. Obtained/maintained employment
         e. Attended all scheduled visits
         f. Completed counseling as requested

     18. I have made significant positive changes since this case began.

     19. I am fully capable of caring for my child(ren) safely.

VI. CURRENT SITUATION

     20. I currently:
         • Reside at a safe, suitable home
         • Have stable employment earning $[AMOUNT] per month
         • Have completed all required services
         • Have a support system to assist with parenting
         • Am ready for my child(ren) to return home

VII. REQUEST FOR RELIEF

     21. I respectfully request that the Court order the return of my child(ren) to my care.

     22. I am committed to working with the Department to ensure my child(ren)'s safety and well-being.

     23. Reunification is in the best interests of my child(ren).

VIII. VERIFICATION

     I declare under penalty of perjury under the laws of the State of ${data.state} that the foregoing is true and correct.

     Executed on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

_________________________________
${data.parentName}

STATE OF ${data.state.toUpperCase()}    §
                                         §
COUNTY OF ${data.county.toUpperCase()}  §

     SUBSCRIBED AND SWORN TO before me on this _____ day of _____________, 20___.

_________________________________
Notary Public, State of ${data.state}
My Commission Expires: __________
`;
};

// ==========================================
// TEMPLATE 8: REQUEST FOR PROTECTIVE ORDER
// ==========================================
export const generateProtectiveOrder = (data: TemplateData): string => {
  return `${formatCaption(data, "REQUEST FOR PROTECTIVE ORDER")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Request for Protective Order, and in support thereof would respectfully show the Court as follows:

I. INTRODUCTION

     ${data.parentName} requests that this Court enter a protective order governing the use and dissemination of confidential information disclosed during this dependency proceeding.

II. GROUNDS FOR PROTECTIVE ORDER

A. Confidential Information at Issue

     This case involves highly sensitive and confidential information, including:
     
     • Medical records of ${data.parentName} and the child(ren)
     • Mental health treatment records
     • Substance abuse assessment and treatment records
     • Educational records
     • Financial information
     • Personal identifying information

B. Risk of Improper Disclosure

     Without a protective order, there is a substantial risk that confidential information will be:
     
     • Disclosed to unauthorized persons
     • Used for improper purposes unrelated to this case
     • Shared on social media or public forums
     • Used to harass or embarrass ${data.parentName}
     • Disclosed to ${data.parentName}'s employer or landlord

C. Privacy Interests

     ${data.parentName} has significant privacy interests in:
     
     • Medical and mental health information (HIPAA-protected)
     • Treatment records for substance abuse (42 C.F.R. Part 2)
     • Educational records (FERPA-protected)
     • Privileged communications with therapists and counselors

III. PROPOSED PROTECTIVE ORDER

     ${data.parentName} proposes the following protective order provisions:

A. Confidential Designation

     Any party may designate documents or information as "CONFIDENTIAL" if disclosure would:
     
     • Violate privacy rights
     • Cause harassment or embarrassment
     • Disclose protected health information
     • Reveal privileged communications

B. Use Limitations

     Information designated CONFIDENTIAL may only be:
     
     • Disclosed to parties, counsel, and court personnel
     • Used solely for purposes of this litigation
     • Shared with expert witnesses under confidentiality agreement
     • Filed under seal with the court

C. Prohibited Disclosures

     No party or counsel shall:
     
     • Disclose confidential information to non-parties
     • Post confidential information on social media
     • Use confidential information for purposes outside this case
     • Share confidential information with media or press

D. Return of Documents

     Upon conclusion of this case, all parties must:
     
     • Return or destroy confidential documents
     • Certify compliance with protective order
     • Permanently delete electronic copies

IV. GOOD CAUSE

     Good cause exists for this protective order because:
     
     1. The information involves private medical and mental health matters
     2. Disclosure could cause significant harm to ${data.parentName}
     3. The protective order is narrowly tailored
     4. Less restrictive alternatives are inadequate
     5. The public interest in confidentiality outweighs any interest in disclosure

V. NO PREJUDICE TO PARTIES

     This protective order will not prejudice any party because:
     
     • All parties will have access to necessary information
     • The order only limits disclosure to non-parties
     • Parties can still use information for case preparation
     • Court will receive all relevant evidence

VI. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court enter the attached Protective Order.
${formatSignature(data, !!data.attorneyName)}

[Proposed Order on next page]

---

${formatCaption(data, "PROTECTIVE ORDER")}

     On this day, the Court considered ${data.parentName}'s Request for Protective Order. After review, the Court finds that good cause exists for entry of this order.

     IT IS THEREFORE ORDERED that:

     1. Documents and information designated as "CONFIDENTIAL" shall be used only for purposes of this litigation.

     2. Confidential information may be disclosed only to parties, counsel, court personnel, and designated experts.

     3. No party shall disclose confidential information on social media, to media/press, or to any non-party.

     4. Confidential documents filed with the court shall be filed under seal.

     5. Upon conclusion of this case, all confidential documents shall be returned or destroyed.

     6. Any violation of this order may result in sanctions including contempt.

SIGNED on _________________, 20___.

                              _________________________________
                              HONORABLE ____________________
                              JUDGE PRESIDING

CERTIFICATE OF SERVICE

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 9: MOTION FOR EMERGENCY HEARING
// ==========================================
export const generateEmergencyMotion = (data: TemplateData): string => {
  return `${formatCaption(data, "EMERGENCY MOTION FOR EXPEDITED HEARING")}

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} and files this Emergency Motion for Expedited Hearing, and in support thereof would respectfully show the Court as follows:

I. NATURE OF EMERGENCY

     An urgent situation has arisen requiring immediate court intervention:
     
     [Select applicable emergency]:
     
     ☐ Child's health or safety is at immediate risk in current placement
     ☐ Child is experiencing severe emotional distress requiring immediate reunification
     ☐ Foster parent is moving out of state
     ☐ Child has been moved to new placement without notice
     ☐ Visitation has been improperly suspended
     ☐ Child is requesting immediate return home
     ☐ Medical emergency requiring parental consent
     ☐ Other urgent matter: _________________

II. FACTUAL BASIS FOR EMERGENCY

     The following facts demonstrate the need for immediate hearing:

     1. ${data.childrenNames} ${data.childrenNames.includes(',') ? 'are' : 'is'} currently placed at [LOCATION].

     2. On [DATE], the following occurred: [DESCRIBE EMERGENCY SITUATION]

     3. This situation requires immediate court intervention because:
        a. Delay will cause irreparable harm to the child(ren)
        b. The child(ren)'s safety is at risk
        c. Fundamental rights are being violated
        d. The situation is deteriorating rapidly

     4. ${data.parentName} immediately notified the Department on [DATE] but no action was taken.

     5. The child(ren) cannot wait for a regularly scheduled hearing.

III. IMMINENT HARM

     Without immediate court intervention, the following harm will occur:
     
     • Child(ren) will suffer emotional trauma
     • Parent-child bond will be permanently damaged
     • Child(ren)'s safety will be compromised
     • Constitutional rights will be violated
     • Irreparable injury will result

IV. REQUESTED RELIEF

     ${data.parentName} requests an emergency hearing within [24 hours / 48 hours / 72 hours] to address:
     
     1. [Primary issue requiring emergency hearing]
     2. [Secondary issue if applicable]
     3. [Additional issues]

V. TEMPORARY ORDERS REQUESTED

     Pending the emergency hearing, ${data.parentName} requests temporary orders:
     
     ☐ Suspend any planned placement change
     ☐ Restore suspended visitation immediately
     ☐ Allow telephone contact with child(ren)
     ☐ Appoint guardian ad litem to investigate
     ☐ Require Department to file written report
     ☐ Other: _________________

VI. NOTICE TO PARTIES

     ${data.parentName} has:
     
     ☐ Provided notice to all parties and counsel
     ☐ Requests hearing without prior notice due to extreme emergency
     
     [If no prior notice]: Notice could not be given because [EXPLAIN].

VII. LEGAL AUTHORITY

     The Court has authority to grant emergency relief under:
     
     • [State statute - emergency hearing provision]
     • [State rule of procedure]
     • Court's inherent authority to protect child welfare
     • Constitutional due process requirements

VIII. PRAYER

     WHEREFORE, PREMISES CONSIDERED, ${data.parentName} respectfully requests that this Court:

     1. Set this matter for emergency hearing within [TIMEFRAME];
     
     2. Grant temporary orders as requested pending hearing;
     
     3. Require all parties to appear at emergency hearing; and
     
     4. Grant such other relief as the Court deems just and proper.
${formatSignature(data, !!data.attorneyName)}

CERTIFICATE OF EMERGENCY

     I certify that this is a genuine emergency requiring immediate court attention and that the facts stated herein are true and correct.

_________________________________
${data.attorneyName || data.parentName}

CERTIFICATE OF SERVICE / NOTICE

_________________________________
${data.attorneyName || data.parentName}
`;
};

// ==========================================
// TEMPLATE 10: NOTICE OF APPEAL
// ==========================================
export const generateNoticeOfAppeal = (data: TemplateData): string => {
  return `${formatCaption(data, "NOTICE OF APPEAL")}

TO THE HONORABLE JUDGE OF SAID COURT:

TO ALL PARTIES AND THEIR ATTORNEYS OF RECORD:

     PLEASE TAKE NOTICE that ${data.parentName}, ${data.attorneyName ? 'by and through undersigned counsel,' : 'appearing pro se,'} hereby gives notice of appeal to the [Court of Appeals / Appellate Division] from the following order(s) and judgment(s):

I. ORDER(S) APPEALED FROM

     ${data.parentName} appeals from the following order(s) entered in this case:

     1. Order dated ${data.hearingDate || '[DATE]'} [DESCRIBE ORDER]
        Filed on [DATE]

     2. [Additional orders if applicable]

II. NATURE OF APPEAL

     This is an appeal from:
     
     ☐ Final order terminating parental rights
     ☐ Order denying motion to dismiss
     ☐ Order denying reunification
     ☐ Order restricting visitation
     ☐ Finding of abuse or neglect
     ☐ Disposition order
     ☐ Other: _________________

III. GROUNDS FOR APPEAL

     ${data.parentName} appeals on the following grounds:

     A. The trial court erred in [DESCRIBE ERROR]

     B. The evidence was insufficient to support the finding that [FINDING]

     C. The trial court abused its discretion by [DECISION]

     D. The order violated ${data.parentName}'s constitutional rights to [RIGHT]

     E. The trial court failed to [REQUIRED ACTION]

IV. RELIEF SOUGHT ON APPEAL

     On appeal, ${data.parentName} seeks:
     
     1. Reversal of the trial court's order
     2. Rendition of judgment in ${data.parentName}'s favor
     3. Remand for new hearing
     4. Immediate return of ${data.childrenNames} to ${data.parentName}
     5. Such other relief as the Court of Appeals deems proper

V. STAY OF PROCEEDINGS

     ${data.parentName} requests that this Court:
     
     ☐ Stay all proceedings pending appeal
     ☐ Stay enforcement of the order pending appeal
     ☐ Continue current visitation pending appeal
     ☐ Maintain status quo pending appeal

VI. RECORD ON APPEAL

     ${data.parentName} requests that the record on appeal include:
     
     • All pleadings filed in this case
     • All orders entered by the Court
     • Transcript of hearing(s) on [DATES]
     • All exhibits admitted into evidence
     • Complete court file

VII. CERTIFICATION

     I certify that:
     
     1. This notice of appeal is timely filed within [30/60/90] days of the order appealed from;
     
     2. ${data.parentName} has the right to appeal under [STATUTE];
     
     3. A copy of this notice has been served on all parties and their counsel; and
     
     4. [If applicable] The required filing fee has been paid / Application to proceed in forma pauperis is filed concurrently.

     NOTICE TO APPELLEE: You have [30] days from service of this notice to file a cross-appeal if desired.

Dated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Respectfully submitted,

_________________________________
${data.attorneyName || data.parentName}
${data.attorneyName ? `State Bar No. ${data.attorneyBarNumber || '[BAR NUMBER]'}` : 'Pro Se'}
${data.attorneyAddress || data.parentAddress}
${data.attorneyPhone || data.parentPhone}
${data.attorneyEmail || data.parentEmail}

CERTIFICATE OF SERVICE

     I certify that a true and correct copy of this Notice of Appeal was served on all parties and their attorneys of record on this ${new Date().getDate()} day of ${new Date().toLocaleDateString('en-US', { month: 'long' })}, ${new Date().getFullYear()}, by:

     ☐ Personal delivery
     ☐ Certified mail, return receipt requested
     ☐ Email to counsel at: _________________
     ☐ E-filing system

_________________________________
${data.attorneyName || data.parentName}
`;
};

// Export additional templates
export const additionalTemplates = {
  motionToCompelDiscovery: generateMotionToCompelDiscovery,
  declaration: generateDeclaration,
  protectiveOrder: generateProtectiveOrder,
  emergencyMotion: generateEmergencyMotion,
  noticeOfAppeal: generateNoticeOfAppeal,
};
