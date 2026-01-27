// Federal Civil Rights Litigation Templates
// Section 1983 Lawsuits, Notices of Liability, Federal Court Documents
// Based on 42 U.S.C. § 1983, 28 U.S.C. § 1331, § 1343, § 1441

interface FederalTemplateData {
  // Plaintiff Information
  plaintiffName: string;
  plaintiffAddress: string;
  plaintiffCity: string;
  plaintiffState: string;
  plaintiffZip: string;
  plaintiffPhone: string;
  plaintiffEmail: string;
  
  // Children Information
  childrenNames: string;
  childrenAges?: string;
  
  // Defendant Information
  defendants: Array<{
    name: string;
    title: string;
    agency: string;
    address?: string;
    actions: string[];
  }>;
  
  // Case Information
  stateCaseNumber?: string;
  county: string;
  state: string;
  dateOfIncident: string;
  dateOfRemoval?: string;
  
  // Violations
  constitutionalViolations: Array<{
    amendment: string;
    description: string;
    caselaw: string[];
  }>;
  
  // Damages
  damages: {
    economic?: number;
    nonEconomic?: string;
    punitive?: boolean;
  };
  
  // Attorney Information
  attorneyName?: string;
  attorneyBarNumber?: string;
  attorneyFirm?: string;
  attorneyAddress?: string;
  attorneyPhone?: string;
  attorneyEmail?: string;
  
  // Facts
  facts?: string[];
  evidence?: string[];
}

// Helper function to format federal court caption
const formatFederalCaption = (data: FederalTemplateData, documentTitle: string, caseNumber?: string): string => {
  return `UNITED STATES DISTRICT COURT
${data.state.toUpperCase()} DISTRICT OF ${data.state.toUpperCase()}
${data.county.toUpperCase()} DIVISION

${data.plaintiffName.toUpperCase()},

                    Plaintiff,

v.                                              ${caseNumber ? `CASE NO. ${caseNumber}` : 'CIVIL ACTION NO. _____________'}

${data.defendants.map((d, i) => `${d.name.toUpperCase()}, ${d.title},${i < data.defendants.length - 1 ? '\n' : ''}`).join('')}

                    Defendants.

${documentTitle.toUpperCase()}
`;
};

// Helper function to format federal signature block
const formatFederalSignature = (data: FederalTemplateData): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  if (data.attorneyName) {
    return `
Dated: ${today}

Respectfully submitted,

/s/ ${data.attorneyName}
_________________________________
${data.attorneyName}
${data.attorneyBarNumber ? `Bar No. ${data.attorneyBarNumber}` : ''}
${data.attorneyFirm || ''}
${data.attorneyAddress || ''}
${data.attorneyPhone ? `Tel: ${data.attorneyPhone}` : ''}
${data.attorneyEmail ? `Email: ${data.attorneyEmail}` : ''}

ATTORNEY FOR PLAINTIFF
`;
  } else {
    return `
Dated: ${today}

Respectfully submitted,

/s/ ${data.plaintiffName}
_________________________________
${data.plaintiffName}
${data.plaintiffAddress}
${data.plaintiffCity}, ${data.plaintiffState} ${data.plaintiffZip}
${data.plaintiffPhone ? `Tel: ${data.plaintiffPhone}` : ''}
${data.plaintiffEmail ? `Email: ${data.plaintiffEmail}` : ''}

PRO SE PLAINTIFF
`;
  }
};

// ==========================================
// TEMPLATE 1: SECTION 1983 CIVIL RIGHTS COMPLAINT
// ==========================================
export const generate1983Complaint = (data: FederalTemplateData): string => {
  const facts = data.facts || [];
  const violations = data.constitutionalViolations || [];
  
  return `${formatFederalCaption(data, "COMPLAINT FOR VIOLATION OF CIVIL RIGHTS\n(42 U.S.C. § 1983)\nJURY DEMAND")}

     Plaintiff ${data.plaintiffName}, by and through ${data.attorneyName ? 'undersigned counsel' : 'pro se representation'}, brings this action for declaratory and injunctive relief and damages pursuant to 42 U.S.C. § 1983 against Defendants for violations of Plaintiff's constitutional rights, and in support thereof alleges as follows:

NATURE OF THE ACTION

     1. This is a civil rights action seeking monetary damages and injunctive relief for violations of Plaintiff's constitutional rights secured by the Fourth and Fourteenth Amendments to the United States Constitution, enforced through 42 U.S.C. § 1983.

     2. Defendants, acting under color of state law, deprived Plaintiff and ${data.childrenNames} of clearly established constitutional rights, including the fundamental liberty interest in family integrity, the right to be free from unreasonable searches and seizures, and the right to substantive and procedural due process.

JURISDICTION AND VENUE

     3. This Court has subject matter jurisdiction over this action pursuant to 28 U.S.C. § 1331 (federal question jurisdiction) and 28 U.S.C. § 1343(a)(3) and (4) (civil rights jurisdiction).

     4. This Court has authority to award the requested damages pursuant to 42 U.S.C. § 1983, and to grant declaratory and injunctive relief pursuant to 28 U.S.C. §§ 2201 and 2202.

     5. Venue is proper in this district pursuant to 28 U.S.C. § 1391(b) because Defendants reside in this district and the events giving rise to this action occurred in this district.

PARTIES

     6. Plaintiff ${data.plaintiffName} is a resident of ${data.county} County, ${data.state}, and a citizen of the United States.

     7. Plaintiff is the parent of ${data.childrenNames}, who ${data.childrenNames.includes(',') ? 'are minors' : 'is a minor'} residing in ${data.state}.

${data.defendants.map((defendant, i) => `
     ${i + 8}. Defendant ${defendant.name} is ${defendant.title} employed by ${defendant.agency}. At all times relevant to this Complaint, Defendant ${defendant.name} was acting under color of state law and within the scope of employment. Defendant ${defendant.name} is sued in both individual and official capacities.
`).join('')}

     ${8 + data.defendants.length}. Each Defendant, acting under color of state law, was responsible for the policies, practices, customs, and actions that violated Plaintiff's constitutional rights as alleged herein.

FACTUAL ALLEGATIONS

     ${9 + data.defendants.length}. At all times relevant to this Complaint, Plaintiff was the custodial parent of ${data.childrenNames} and exercised all parental rights and responsibilities.

     ${10 + data.defendants.length}. Plaintiff has a fundamental liberty interest in the care, custody, and management of ${data.childrenNames}. This right is protected by the Fourteenth Amendment to the United States Constitution. Troxel v. Granville, 530 U.S. 57, 65 (2000).
${facts.length > 0 ? `
${facts.map((fact, i) => `
     ${11 + data.defendants.length + i}. ${fact}`).join('')}` : `
     ${11 + data.defendants.length}. On or about ${data.dateOfIncident}, Defendants initiated contact with Plaintiff regarding allegations of abuse or neglect.
     
     ${12 + data.defendants.length}. Defendants conducted an investigation that violated Plaintiff's constitutional rights as detailed below.`}

CONSTITUTIONAL VIOLATIONS

COUNT I: VIOLATION OF FOURTEENTH AMENDMENT
(Deprivation of Fundamental Parental Rights Without Due Process)

     ${20 + data.defendants.length}. Plaintiff repeats and realleges each and every allegation contained in the preceding paragraphs as if fully set forth herein.

     ${21 + data.defendants.length}. The Fourteenth Amendment to the United States Constitution guarantees that no state shall "deprive any person of life, liberty, or property, without due process of law."

     ${22 + data.defendants.length}. Parents have a fundamental liberty interest in the care, custody, and management of their children. This right is "perhaps the oldest of the fundamental liberty interests recognized by this Court." Troxel v. Granville, 530 U.S. 57, 65 (2000).

     ${23 + data.defendants.length}. Government interference with this fundamental right requires strict scrutiny and must be narrowly tailored to serve a compelling state interest. Pierce v. Society of Sisters, 268 U.S. 510 (1925).

     ${24 + data.defendants.length}. Defendants, acting under color of state law, deprived Plaintiff of this fundamental right by:
${data.defendants.map((d, i) => `
          ${String.fromCharCode(97 + i)}. ${d.actions.join('; ')}`).join('')}

     ${25 + data.defendants.length}. Defendants' actions were not narrowly tailored to serve any compelling state interest and violated clearly established constitutional law.

     ${26 + data.defendants.length}. At the time of Defendants' actions, it was clearly established that parents have a fundamental right to family integrity and that government agents must comply with constitutional requirements before interfering with that right.

     ${27 + data.defendants.length}. Defendants knew or should have known that their actions violated Plaintiff's constitutional rights.

     ${28 + data.defendants.length}. As a direct and proximate result of Defendants' constitutional violations, Plaintiff has suffered and continues to suffer severe emotional distress, loss of the parent-child relationship, reputational harm, and other damages.

COUNT II: VIOLATION OF FOURTH AMENDMENT
(Unreasonable Search and Seizure)

     ${29 + data.defendants.length}. Plaintiff repeats and realleges each and every allegation contained in the preceding paragraphs.

     ${30 + data.defendants.length}. The Fourth Amendment to the United States Constitution protects individuals from unreasonable searches and seizures by government agents.

     ${31 + data.defendants.length}. This protection extends with full force to child welfare investigations. Calabretta v. Floyd, 189 F.3d 808, 812 (9th Cir. 1999).

     ${32 + data.defendants.length}. A warrantless search of a home is "presumptively unreasonable" and violates the Fourth Amendment unless justified by probable cause and exigent circumstances. Payton v. New York, 445 U.S. 573, 586 (1980).

     ${33 + data.defendants.length}. Defendants conducted a warrantless search of Plaintiff's home and seizure of ${data.childrenNames} without:
          a. Obtaining a warrant;
          b. Securing voluntary consent;
          c. Establishing probable cause;
          d. Demonstrating exigent circumstances.

     ${34 + data.defendants.length}. Defendants' entry into Plaintiff's home and seizure of ${data.childrenNames} violated Plaintiff's clearly established Fourth Amendment rights.

     ${35 + data.defendants.length}. As a direct and proximate result, Plaintiff has suffered severe emotional distress, loss of liberty, invasion of privacy, and other damages.

COUNT III: VIOLATION OF FOURTEENTH AMENDMENT
(Procedural Due Process)

     ${36 + data.defendants.length}. Plaintiff repeats and realleges each and every allegation contained in the preceding paragraphs.

     ${37 + data.defendants.length}. The Fourteenth Amendment requires that the government provide adequate notice and a meaningful opportunity to be heard before depriving individuals of protected liberty interests.

     ${38 + data.defendants.length}. Before removing children from parental custody, the government must provide:
          a. Adequate and timely notice of allegations;
          b. A meaningful opportunity to be heard;
          c. A neutral decision-maker;
          d. The right to present evidence;
          e. The right to confront adverse witnesses.

     See Stanley v. Illinois, 405 U.S. 645 (1972).

     ${39 + data.defendants.length}. Defendants deprived Plaintiff of procedural due process by:
          a. Failing to provide adequate notice of allegations;
          b. Removing ${data.childrenNames} without a pre-deprivation hearing;
          c. Failing to provide a meaningful opportunity to be heard;
          d. Conducting a biased investigation.

     ${40 + data.defendants.length}. These procedural violations denied Plaintiff fundamental fairness and violated clearly established constitutional law.

COUNT IV: MUNICIPAL/POLICY LIABILITY
(Against Agency Defendants in Official Capacity)

     ${41 + data.defendants.length}. Plaintiff repeats and realleges each and every allegation contained in the preceding paragraphs.

     ${42 + data.defendants.length}. The constitutional violations alleged herein resulted from official policies, customs, or practices of ${data.defendants.find(d => d.agency)?.agency || 'the Department'}.

     ${43 + data.defendants.length}. The following policies, customs, or practices caused the constitutional violations:
          a. Inadequate training of caseworkers on constitutional requirements;
          b. Failure to supervise caseworkers;
          c. Custom of conducting warrantless searches and seizures;
          d. Policy of removing children based on insufficient evidence;
          e. Deliberate indifference to constitutional rights;
          f. Failure to discipline workers who violate constitutional rights.

     ${44 + data.defendants.length}. These policies and customs represent deliberate indifference to constitutional rights and were the moving force behind the violations alleged herein. Monell v. Department of Social Services, 436 U.S. 658 (1978).

QUALIFIED IMMUNITY DOES NOT APPLY

     ${45 + data.defendants.length}. Qualified immunity does not protect Defendants because:

     ${46 + data.defendants.length}. At the time of the violations, the constitutional rights at issue were clearly established. It has been clearly established for decades that:
          a. Parents have a fundamental right to family integrity;
          b. The Fourth Amendment prohibits warrantless searches absent exigent circumstances;
          c. Due process requires notice and hearing before deprivation of liberty interests.

     ${47 + data.defendants.length}. No reasonable officer in Defendants' position could have believed their conduct was lawful. The constitutional violations were obvious.

     ${48 + data.defendants.length}. Defendants acted with deliberate indifference to Plaintiff's constitutional rights, with malice, and in reckless disregard of clearly established law.

DAMAGES

     ${49 + data.defendants.length}. As a direct and proximate result of Defendants' unconstitutional conduct, Plaintiff has suffered:

     ${50 + data.defendants.length}. Compensatory Damages:
          a. Severe emotional distress, anxiety, and depression;
          b. Loss of the parent-child relationship and family integrity;
          c. Loss of custody and visitation with ${data.childrenNames};
          d. Reputational harm and damage to personal and professional relationships;
          e. Economic losses including legal fees and lost wages;
${data.damages.economic ? `          f. Economic damages in the amount of $${data.damages.economic.toLocaleString()};` : ''}
          g. Pain and suffering;
          h. Loss of enjoyment of life.

     ${51 + data.defendants.length}. Plaintiff is entitled to compensatory damages in an amount to be proven at trial.

     ${52 + data.defendants.length}. Punitive Damages:
${data.damages.punitive ? `
     ${53 + data.defendants.length}. Defendants' conduct was malicious, reckless, wanton, and in callous disregard of Plaintiff's constitutional rights. Defendants acted with evil motive and reckless indifference to federally protected rights.

     ${54 + data.defendants.length}. Plaintiff is entitled to punitive damages to punish Defendants and deter similar conduct in the future.` : ''}

PRAYER FOR RELIEF

     WHEREFORE, Plaintiff respectfully requests that this Court:

     A. Assume jurisdiction over this matter;

     B. Enter judgment in favor of Plaintiff and against all Defendants;

     C. Award Plaintiff compensatory damages in an amount to be determined at trial;
${data.damages.punitive ? `
     D. Award Plaintiff punitive damages against individual Defendants;` : ''}

     E. Award Plaintiff reasonable attorney's fees and costs pursuant to 42 U.S.C. § 1988;

     F. Grant declaratory relief declaring that Defendants violated Plaintiff's constitutional rights;

     G. Grant injunctive relief:
          1. Ordering the immediate return of ${data.childrenNames} to Plaintiff's custody;
          2. Enjoining Defendants from future violations of constitutional rights;
          3. Requiring Defendants to implement policies to prevent future violations;
          4. Requiring training of all caseworkers on constitutional requirements;

     H. Award pre-judgment and post-judgment interest;

     I. Grant such other and further relief as this Court deems just and proper.

JURY DEMAND

     Plaintiff demands trial by jury on all issues so triable.
${formatFederalSignature(data)}

VERIFICATION

     I, ${data.plaintiffName}, declare under penalty of perjury under the laws of the United States that I have read the foregoing Complaint and that the facts alleged therein are true and correct to the best of my knowledge and belief.

Executed on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

_________________________________
${data.plaintiffName}
`;
};

// ==========================================
// TEMPLATE 2: NOTICE OF LIABILITY UNDER COLOR OF LAW
// ==========================================
export const generateNoticeOfLiability = (data: FederalTemplateData): string => {
  return `NOTICE OF LIABILITY UNDER COLOR OF LAW
42 U.S.C. § 1983 - DEPRIVATION OF RIGHTS
18 U.S.C. § 241, § 242 - CRIMINAL CIVIL RIGHTS VIOLATIONS

DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TO: ${data.defendants.map(d => `${d.name}, ${d.title}\n    ${d.agency}${d.address ? `\n    ${d.address}` : ''}`).join('\n\n    ')}

FROM: ${data.plaintiffName}
      ${data.plaintiffAddress}
      ${data.plaintiffCity}, ${data.plaintiffState} ${data.plaintiffZip}

RE: ${data.childrenNames} - Case No. ${data.stateCaseNumber || '[CASE NUMBER]'}
    Notice of Pending Federal Civil Rights Litigation
    Personal Liability for Constitutional Violations

═══════════════════════════════════════════════════════════════

NOTICE IS HEREBY GIVEN that you are being placed on formal notice of potential personal civil and criminal liability under federal law for actions taken under color of state law.

I. LEGAL BASIS FOR LIABILITY

You are hereby notified that your actions may constitute violations of the following federal laws:

A. 42 U.S.C. § 1983 - CIVIL LIABILITY

     Title 42 U.S.C. § 1983 provides:

     "Every person who, under color of any statute, ordinance, regulation, 
     custom, or usage, of any State or Territory or the District of Columbia, 
     subjects, or causes to be subjected, any citizen of the United States or 
     other person within the jurisdiction thereof to the deprivation of any 
     rights, privileges, or immunities secured by the Constitution and laws, 
     shall be liable to the party injured in an action at law, suit in equity, 
     or other proper proceeding for redress..."

     This statute allows individuals to sue government officials who violate constitutional rights while acting under color of state law. Liability extends to individual capacity, making you PERSONALLY LIABLE for damages.

B. 18 U.S.C. § 242 - CRIMINAL CIVIL RIGHTS VIOLATIONS

     Title 18 U.S.C. § 242 provides criminal penalties for willfully depriving persons of constitutional rights under color of law:

     "Whoever, under color of any law, statute, ordinance, regulation, or 
     custom, willfully subjects any person in any State, Territory, 
     Commonwealth, Possession, or District to the deprivation of any rights, 
     privileges, or immunities secured or protected by the Constitution or 
     laws of the United States..."

     Penalties: Up to life imprisonment depending on severity of violation.

C. 18 U.S.C. § 241 - CONSPIRACY AGAINST RIGHTS

     If you acted in concert with others to violate constitutional rights, you may be criminally liable for conspiracy.

II. CONSTITUTIONAL RIGHTS YOU MAY BE VIOLATING

You are hereby placed on notice that your actions may violate the following clearly established constitutional rights:

A. FOURTEENTH AMENDMENT - FUNDAMENTAL PARENTAL RIGHTS

     The fundamental right of parents to the care, custody, and control of their children is "perhaps the oldest of the fundamental liberty interests recognized by" the Supreme Court. Troxel v. Granville, 530 U.S. 57, 65 (2000).

     Your interference with this fundamental right requires strict scrutiny and must be narrowly tailored to serve a compelling state interest. It is CLEARLY ESTABLISHED that removal of children requires:
     
     • Probable cause to believe child is in imminent danger
     • No reasonable alternative to removal
     • Compliance with Fourth Amendment requirements

     Cases establishing this law:
     • Troxel v. Granville, 530 U.S. 57 (2000)
     • Santosky v. Kramer, 455 U.S. 745 (1982)
     • Stanley v. Illinois, 405 U.S. 645 (1972)
     • Meyer v. Nebraska, 262 U.S. 390 (1923)
     • Pierce v. Society of Sisters, 268 U.S. 510 (1925)

B. FOURTH AMENDMENT - UNREASONABLE SEARCH AND SEIZURE

     The Fourth Amendment protects the home from warrantless searches and individuals from unreasonable seizures.

     It is CLEARLY ESTABLISHED that:
     • Warrantless home searches are presumptively unconstitutional
     • Consent must be truly voluntary, not coerced
     • Exigent circumstances must be genuine emergencies
     • Child protective investigations are subject to Fourth Amendment

     Cases establishing this law:
     • Payton v. New York, 445 U.S. 573 (1980)
     • Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)
     • Doe v. Heck, 327 F.3d 492 (7th Cir. 2003)
     • Weller v. Department of Social Services, 901 F.2d 387 (4th Cir. 1990)

C. FOURTEENTH AMENDMENT - PROCEDURAL DUE PROCESS

     It is CLEARLY ESTABLISHED that before depriving parents of custody, the government must provide:
     
     • Adequate and timely notice
     • Meaningful opportunity to be heard
     • Neutral decision-maker
     • Right to present evidence

     Cases: Stanley v. Illinois, 405 U.S. 645 (1972); Mathews v. Eldridge, 424 U.S. 319 (1976)

D. FOURTEENTH AMENDMENT - SUBSTANTIVE DUE PROCESS

     Government conduct that "shocks the conscience" violates substantive due process.

     It is CLEARLY ESTABLISHED that fabricating evidence, coercing statements, and removing children based on personal animus shocks the conscience.

     Cases: Rochin v. California, 342 U.S. 165 (1952); County of Sacramento v. Lewis, 523 U.S. 833 (1998)

III. QUALIFIED IMMUNITY WILL NOT PROTECT YOU

Qualified immunity protects government officials only when:
     1. The constitutional right was not clearly established, OR
     2. A reasonable official could have believed the conduct was lawful

Qualified immunity DOES NOT protect you when:
     • The constitutional right is clearly established (as detailed above)
     • No reasonable officer could believe the conduct was lawful
     • The official acts with malice or in reckless disregard of rights
     • The official fabricates evidence or acts in bad faith

Supreme Court Justice Sotomayor: "Qualified immunity is not an exoneration; I suspect it reflects judicial economy rather than a determination that the defendant's actions were lawful." Baxter v. Bracey, 140 S. Ct. 1862 (2020) (Sotomayor, J., dissenting).

RECENT DEVELOPMENTS: The Supreme Court and lower courts have increasingly narrowed qualified immunity, especially in cases involving:
     • Fourth Amendment violations
     • Warrantless seizures
     • Family integrity violations
     • Fabrication of evidence

YOU WILL BE SUED IN YOUR INDIVIDUAL CAPACITY. Qualified immunity likely will not shield you from personal liability.

IV. SPECIFIC VIOLATIONS YOU ARE COMMITTING

You are hereby placed on notice of the following specific violations:

${data.defendants.map((d, i) => `
${i + 1}. ${d.name}:
${d.actions.map(action => `     • ${action}`).join('\n')}
`).join('')}

These actions violate clearly established constitutional law. You have NO qualified immunity defense.

V. DAMAGES YOU WILL BE PERSONALLY LIABLE FOR

If you proceed with the constitutional violations described above, you will be personally liable for:

A. COMPENSATORY DAMAGES (42 U.S.C. § 1983)
     • Emotional distress and mental anguish
     • Loss of parent-child relationship
     • Loss of liberty
     • Reputational harm
     • Economic losses
     • Pain and suffering

     Juries regularly award six-figure and seven-figure verdicts in civil rights cases.

B. PUNITIVE DAMAGES (Individual Capacity Only)
     Punitive damages are available when the defendant acts with:
     • Reckless or callous disregard of constitutional rights
     • Evil motive or intent to harm
     • Malice

     Smith v. Wade, 461 U.S. 30 (1983).

     Punitive damages are designed to PUNISH and DETER. Awards can be substantial.

C. ATTORNEY'S FEES (42 U.S.C. § 1988)
     If Plaintiff prevails, you (and/or your agency) will be ordered to pay Plaintiff's attorney's fees and costs. This can amount to hundreds of thousands of dollars.

D. CRIMINAL PENALTIES (18 U.S.C. § 242)
     • Up to 1 year imprisonment for willful deprivation of rights
     • Up to 10 years if bodily injury results
     • Up to life imprisonment if death results

VI. INDEMNIFICATION IS NOT GUARANTEED

While some government agencies indemnify employees for civil rights violations, indemnification is NOT automatic and may be denied if:
     • You acted outside the scope of employment
     • You acted with malice or willful misconduct
     • You violated agency policy
     • You ignored training and established procedures

YOU MAY BE REQUIRED TO PAY DAMAGES FROM YOUR OWN ASSETS.

Your home, savings, retirement accounts, and wages may be subject to judgment enforcement.

VII. WHAT YOU MUST DO TO AVOID LIABILITY

To avoid personal civil and criminal liability, you must IMMEDIATELY:

     1. CEASE all constitutional violations described above

     2. OBTAIN A WARRANT before conducting any further searches of the home or seizures of children (unless genuine exigent circumstances exist)

     3. PROVIDE adequate notice and opportunity to be heard before any further deprivation of parental rights

     4. DOCUMENT any genuine exigent circumstances with specificity

     5. PRESERVE ALL EVIDENCE - spoliation of evidence creates additional liability

     6. CONSULT with legal counsel regarding your potential liability

     7. REPORT this Notice to your supervisor and agency legal department

     8. CORRECT the constitutional violations by:
          • Returning ${data.childrenNames} to ${data.plaintiffName}'s custody if removal was unconstitutional
          • Dismissing baseless allegations
          • Providing full discovery of all exculpatory evidence

VIII. FEDERAL LAWSUIT IS IMMINENT

BE ADVISED that ${data.plaintiffName} intends to file a federal civil rights lawsuit in the United States District Court under 42 U.S.C. § 1983 seeking:

     • Declaratory judgment that you violated constitutional rights
     • Compensatory damages
     • Punitive damages (individual capacity)
     • Injunctive relief
     • Attorney's fees and costs

You will be sued in both your OFFICIAL CAPACITY and INDIVIDUAL CAPACITY.

IX. CRIMINAL REFERRAL

BE FURTHER ADVISED that a criminal referral may be made to:
     • Federal Bureau of Investigation (FBI)
     • U.S. Attorney's Office
     • Department of Justice, Civil Rights Division

for investigation of potential criminal civil rights violations under 18 U.S.C. §§ 241 and 242.

X. THIS IS YOUR FINAL WARNING

This Notice constitutes your final warning before federal litigation commences.

If you continue to violate ${data.plaintiffName}'s constitutional rights despite this notice, you will be presumed to have acted:
     • With knowledge that your conduct was unlawful
     • With deliberate indifference to constitutional rights
     • With malice or reckless disregard

This will DEFEAT any qualified immunity defense and SUPPORT punitive damages.

XI. PRESERVATION OF EVIDENCE

You are hereby instructed to preserve ALL evidence related to this matter, including:
     • All case files, notes, and reports
     • All emails, text messages, and communications
     • All audio and video recordings
     • All photographs
     • All documents created or received

Spoliation of evidence will result in:
     • Adverse inference jury instructions
     • Sanctions
     • Additional damages
     • Criminal obstruction charges

═══════════════════════════════════════════════════════════════

This Notice is provided pursuant to due process requirements and to afford you an opportunity to correct constitutional violations before federal litigation commences.

Your receipt of this Notice establishes that you have been placed on notice of clearly established constitutional law and potential personal liability.

Govern yourself accordingly.

Respectfully submitted,

_________________________________
${data.plaintiffName}
${data.plaintiffAddress}
${data.plaintiffCity}, ${data.plaintiffState} ${data.plaintiffZip}
${data.plaintiffPhone ? `Phone: ${data.plaintiffPhone}` : ''}
${data.plaintiffEmail ? `Email: ${data.plaintiffEmail}` : ''}

CERTIFICATE OF SERVICE

I hereby certify that a true and correct copy of this Notice of Liability Under Color of Law was delivered to all named recipients on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} by:
     ☐ Certified Mail, Return Receipt Requested
     ☐ Personal Delivery
     ☐ Email

_________________________________
${data.plaintiffName}
`;
};

// Export all federal templates
export const federalTemplates = {
  section1983Complaint: generate1983Complaint,
  noticeOfLiability: generateNoticeOfLiability,
};

export type FederalTemplateType = keyof typeof federalTemplates;
export type { FederalTemplateData };
