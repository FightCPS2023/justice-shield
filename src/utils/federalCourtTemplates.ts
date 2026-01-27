// Federal Court Removal and Constitutional Hearing Templates
// Notice of Removal to Federal Court (28 U.S.C. § 1441, § 1443)
// Federal Hearing Motions and Constitutional Arguments

import type { FederalTemplateData } from './federalTemplates';

interface RemovalData extends FederalTemplateData {
  stateCourt: string;
  stateJudge: string;
  removalBasis: 'federal_question' | 'civil_rights' | 'both';
  federalClaims: string[];
}

// ==========================================
// TEMPLATE: NOTICE OF REMOVAL TO FEDERAL COURT
// ==========================================
export const generateNoticeOfRemoval = (data: RemovalData): string => {
  return `UNITED STATES DISTRICT COURT
${data.state.toUpperCase()} DISTRICT OF ${data.state.toUpperCase()}
${data.county.toUpperCase()} DIVISION

IN THE INTEREST OF:
${data.childrenNames}

NOTICE OF REMOVAL
(28 U.S.C. §§ 1441, 1443)

TO THE CLERK OF THE UNITED STATES DISTRICT COURT:

TO THE HONORABLE JUDGE OF THIS COURT:

TO ALL PARTIES AND THEIR COUNSEL OF RECORD:

     NOW COMES ${data.plaintiffName}, Respondent in the above-referenced state court proceeding, and pursuant to 28 U.S.C. §§ 1331, 1441, and 1443, hereby removes the above-captioned action from the ${data.stateCourt} to this United States District Court, and in support thereof states as follows:

I. TIMELINESS OF REMOVAL

     1. This Notice of Removal is timely filed within thirty (30) days of ${data.plaintiffName}'s receipt of the initial pleading setting forth the claim or claims forming the basis for removal. 28 U.S.C. § 1446(b).

     2. Alternatively, this removal is timely under 28 U.S.C. § 1446(b)(3) as the case has become removable based on substantial federal constitutional questions that have arisen in the state court proceedings.

II. STATE COURT PROCEEDINGS

     3. On or about ${data.dateOfIncident || '[DATE]'}, the Department initiated state court dependency proceedings against ${data.plaintiffName} in the ${data.stateCourt}, ${data.county} County, ${data.state}.

     4. The state case is styled: In the Interest of ${data.childrenNames}, Case No. ${data.stateCaseNumber || '[STATE CASE NUMBER]'}, pending before the Honorable ${data.stateJudge || '[JUDGE NAME]'}.

     5. The state court petition alleges abuse or neglect and seeks to deprive ${data.plaintiffName} of custody of ${data.childrenNames}.

     6. ${data.plaintiffName} has appeared in the state court proceedings and preserved all federal constitutional challenges.

III. BASIS FOR REMOVAL JURISDICTION

     7. This Court has original jurisdiction over this action pursuant to:
          a. 28 U.S.C. § 1331 (federal question jurisdiction);
          b. 28 U.S.C. § 1343(a)(3) and (4) (civil rights jurisdiction);
          c. 28 U.S.C. § 1443 (removal for civil rights violations).

A. Federal Question Jurisdiction (28 U.S.C. § 1331)

     8. This case presents substantial federal constitutional questions that are:
          a. Actually disputed;
          b. Substantial;
          c. Necessarily raised by the state court proceedings;
          d. Capable of resolution in federal court without disrupting the federal-state balance.

     Grable & Sons Metal Products, Inc. v. Darue Engineering & Manufacturing, 545 U.S. 308 (2005).

     9. The federal questions presented include:
${data.federalClaims.map((claim, i) => `
          ${String.fromCharCode(97 + i)}. ${claim}`).join('')}

     10. These federal constitutional questions are central to the state court case and must be resolved to determine the outcome.

B. Civil Rights Jurisdiction (28 U.S.C. § 1343)

     11. This Court has jurisdiction under 28 U.S.C. § 1343(a)(3), which provides jurisdiction over:

     "Any civil action authorized by law to be commenced by any person... 
     [t]o redress the deprivation, under color of any State law, statute, 
     ordinance, regulation, custom or usage, of any right, privilege or 
     immunity secured by the Constitution of the United States..."

     12. The state court proceedings involve deprivations of constitutional rights under color of state law, including:
          • Fourth Amendment violations (unreasonable search and seizure)
          • Fourteenth Amendment violations (due process, family integrity)
          • Equal protection violations
          • First Amendment violations (if applicable)

C. Civil Rights Removal (28 U.S.C. § 1443)

     13. Removal is proper under 28 U.S.C. § 1443(1), which allows removal of:

     "Any civil action... commenced in a State court against any person who 
     is denied or cannot enforce in the courts of such State a right under 
     any law providing for the equal civil rights of citizens of the United 
     States..."

     14. ${data.plaintiffName} cannot enforce federal constitutional rights in state court because:
          a. The state court lacks jurisdiction to provide adequate federal remedies;
          b. State law immunity doctrines prevent adequate vindication of federal rights;
          c. State court procedures are inadequate to protect federal rights;
          d. The state court has demonstrated hostility to federal claims.

     15. Federal court removal is necessary to vindicate federal civil rights.

IV. SUBSTANTIAL FEDERAL CONSTITUTIONAL ISSUES

A. Fourth Amendment Violations

     16. The state court proceedings are premised on evidence obtained through violations of the Fourth Amendment to the United States Constitution.

     17. Defendants conducted warrantless searches and seizures without:
          • Valid consent;
          • Probable cause;
          • Exigent circumstances;
          • Judicial authorization.

     18. The Fourth Amendment applies with full force to child welfare investigations. Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999).

     19. These Fourth Amendment violations present substantial federal questions requiring federal court resolution.

B. Fourteenth Amendment - Fundamental Parental Rights

     20. ${data.plaintiffName} has a fundamental liberty interest in the care, custody, and management of ${data.childrenNames}. Troxel v. Granville, 530 U.S. 57 (2000).

     21. The state court proceedings deprive ${data.plaintiffName} of this fundamental right without satisfying strict scrutiny.

     22. The state has failed to demonstrate:
          • A compelling state interest;
          • That its actions are narrowly tailored;
          • That less restrictive alternatives are unavailable.

     23. These fundamental rights violations present substantial federal constitutional questions.

C. Fourteenth Amendment - Procedural Due Process

     24. ${data.plaintiffName} was denied procedural due process in violation of the Fourteenth Amendment.

     25. Specifically, ${data.plaintiffName} was denied:
          • Adequate and timely notice of allegations;
          • A meaningful opportunity to be heard;
          • A neutral decision-maker;
          • The right to present evidence and cross-examine witnesses;
          • Discovery of exculpatory evidence.

     26. The state court proceedings violate minimum due process requirements. Stanley v. Illinois, 405 U.S. 645 (1972).

D. Fourteenth Amendment - Substantive Due Process

     27. State actors engaged in conduct that "shocks the conscience" in violation of substantive due process.

     28. This conscience-shocking conduct includes:
          • Fabricating evidence;
          • Coercing statements;
          • Removing children based on personal animus;
          • Ignoring exculpatory evidence;
          • Violating clearly established constitutional rights.

     29. Such conduct violates substantive due process. County of Sacramento v. Lewis, 523 U.S. 833 (1998).

V. FEDERAL COURT IS THE PROPER FORUM

     30. Federal court is the proper and necessary forum for this action because:

     31. The case presents substantial federal constitutional questions that are central to the action and require federal interpretation.

     32. State court lacks adequate procedures and remedies to vindicate federal constitutional rights.

     33. Federal defendants (if any) are properly joined, creating federal jurisdiction.

     34. The federal interests in protecting constitutional rights outweigh any state interest in adjudicating this case.

     35. Federal court resolution will provide uniform interpretation of federal constitutional law.

VI. NO OBSTACLE TO REMOVAL

     36. No procedural obstacle prevents removal:

     37. All defendants have consented to removal or will consent, or alternatively, removal is proper under 28 U.S.C. § 1441(c) (severing federal claims).

     38. No prior federal litigation has addressed these federal claims.

     39. The Rooker-Feldman doctrine does not apply because ${data.plaintiffName} is not seeking review of a final state court judgment, but rather removal of a pending action.

     40. The Younger abstention doctrine does not require remand because:
          a. The federal constitutional violations are clear;
          b. The state proceedings are not adequate to protect federal rights;
          c. Federal intervention is necessary to prevent irreparable injury;
          d. Bad faith or harassment exists in the state proceedings.

     Younger v. Harris, 401 U.S. 37 (1971).

VII. PROCEDURAL REQUIREMENTS SATISFIED

     41. This Notice of Removal is accompanied by:
          • Copies of all process, pleadings, and orders from state court;
          • A copy of the state court docket;
          • Filing fee or application to proceed in forma pauperis.

     42. Notice of this removal has been provided to all parties and filed with the state court as required by 28 U.S.C. § 1446(d).

     43. All procedural requirements for removal have been satisfied.

VIII. PRAYER FOR RELIEF

     WHEREFORE, ${data.plaintiffName} respectfully requests that this Court:

     A. Accept removal of this action from state court;

     B. Assume jurisdiction over this action;

     C. Order that all state court proceedings be stayed pending resolution in federal court;

     D. Provide ${data.plaintiffName} a federal forum to vindicate federal constitutional rights;

     E. Set a scheduling conference to determine further proceedings;

     F. Grant such other and further relief as this Court deems just and proper.

Dated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Respectfully submitted,

/s/ ${data.attorneyName || data.plaintiffName}
_________________________________
${data.attorneyName || data.plaintiffName}
${data.attorneyName ? (data.attorneyBarNumber ? `Bar No. ${data.attorneyBarNumber}` : '') : 'Pro Se'}
${data.attorneyAddress || data.plaintiffAddress}
${data.attorneyPhone || data.plaintiffPhone}
${data.attorneyEmail || data.plaintiffEmail}

${data.attorneyName ? 'ATTORNEY FOR RESPONDENT' : 'PRO SE RESPONDENT'}

CERTIFICATE OF SERVICE

     I hereby certify that a true and correct copy of this Notice of Removal has been served on all parties of record and filed with the ${data.stateCourt} on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

_________________________________
${data.attorneyName || data.plaintiffName}
`;
};

// ==========================================
// TEMPLATE: MOTION FOR PRELIMINARY INJUNCTION (FEDERAL COURT)
// ==========================================
export const generateFederalInjunction = (data: FederalTemplateData): string => {
  return `UNITED STATES DISTRICT COURT
${data.state.toUpperCase()} DISTRICT OF ${data.state.toUpperCase()}
${data.county.toUpperCase()} DIVISION

${data.plaintiffName.toUpperCase()},

                    Plaintiff,

v.                                              CASE NO. _____________

${data.defendants.map((d, i) => `${d.name.toUpperCase()}, ${d.title},${i < data.defendants.length - 1 ? '\n' : ''}`).join('')}

                    Defendants.

MOTION FOR PRELIMINARY INJUNCTION
AND TEMPORARY RESTRAINING ORDER

     Plaintiff ${data.plaintiffName} hereby moves this Court for entry of a preliminary injunction and, if necessary, temporary restraining order pursuant to Fed. R. Civ. P. 65, and in support thereof states as follows:

I. INTRODUCTION

     1. This motion seeks immediate injunctive relief to prevent irreparable constitutional harm to Plaintiff and ${data.childrenNames}.

     2. Defendants, acting under color of state law, have violated and continue to violate Plaintiff's clearly established constitutional rights.

     3. Immediate injunctive relief is necessary to prevent ongoing constitutional violations and irreparable harm to the parent-child relationship.

II. LEGAL STANDARD

     4. A preliminary injunction is appropriate when the moving party demonstrates:
          a. A substantial likelihood of success on the merits;
          b. A substantial threat of irreparable injury if the injunction is not granted;
          c. The threatened injury outweighs any harm to the defendant;
          d. The injunction would not be adverse to the public interest.

     Winter v. Natural Resources Defense Council, Inc., 555 U.S. 7, 20 (2008).

     5. Where constitutional rights are threatened, a finding of irreparable injury is "virtually automatic." Elrod v. Burns, 427 U.S. 347, 373 (1976).

III. LIKELIHOOD OF SUCCESS ON THE MERITS

     6. Plaintiff is substantially likely to succeed on the merits of the constitutional claims alleged in the Complaint.

A. Fourth Amendment Claims

     7. Defendants conducted warrantless searches and seizures in violation of the Fourth Amendment.

     8. It is clearly established that:
          • Warrantless home searches are presumptively unconstitutional;
          • Child protective investigations must comply with the Fourth Amendment;
          • Consent must be voluntary;
          • Exigent circumstances must be genuine emergencies.

     Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999); Payton v. New York, 445 U.S. 573 (1980).

     9. Plaintiff is likely to prevail on Fourth Amendment claims.

B. Fourteenth Amendment - Fundamental Rights

     10. Plaintiff has a fundamental liberty interest in family integrity. Troxel v. Granville, 530 U.S. 57 (2000).

     11. Defendants' interference with this fundamental right is subject to strict scrutiny and cannot survive.

     12. Defendants have not demonstrated a compelling state interest or narrow tailoring.

     13. Plaintiff is likely to prevail on fundamental rights claims.

C. Fourteenth Amendment - Due Process

     14. Plaintiff was denied adequate notice and opportunity to be heard in violation of procedural due process.

     15. The state proceedings lacked fundamental fairness. Stanley v. Illinois, 405 U.S. 645 (1972).

     16. Plaintiff is likely to prevail on due process claims.

IV. IRREPARABLE INJURY

     17. Plaintiff faces immediate and irreparable injury absent injunctive relief.

     18. Loss of constitutional freedoms, even for minimal periods, constitutes irreparable injury. Elrod v. Burns, 427 U.S. 347, 373 (1976).

     19. Specifically, Plaintiff suffers:
          • Ongoing deprivation of fundamental parental rights;
          • Continuing damage to parent-child bond;
          • Emotional distress and trauma to ${data.childrenNames};
          • Irreversible harm to family integrity;
          • Ongoing constitutional violations.

     20. The parent-child relationship deteriorates with each day of separation. Prolonged separation causes permanent developmental and psychological harm to children.

     21. Money damages cannot adequately compensate for:
          • Loss of the parent-child relationship;
          • Emotional and psychological harm to children;
          • Developmental harm from prolonged separation;
          • Permanent damage to family bonds.

     22. Only immediate injunctive relief can prevent irreparable harm.

V. BALANCE OF HARMS

     23. The balance of harms weighs heavily in favor of granting the injunction.

     24. Harm to Plaintiff absent injunction:
          • Permanent loss of parent-child relationship;
          • Irreversible psychological harm to children;
          • Ongoing constitutional violations;
          • Violation of fundamental rights.

     25. Harm to Defendants if injunction granted:
          • Minimal administrative burden of returning children;
          • Requirement to comply with Constitution (no cognizable harm).

     26. Defendants have no legitimate interest in continuing to violate constitutional rights.

     27. The harm to Plaintiff vastly outweighs any harm to Defendants.

VI. PUBLIC INTEREST

     28. The public interest strongly favors granting the injunction.

     29. The public has a strong interest in:
          • Protecting constitutional rights;
          • Preserving family integrity;
          • Preventing government overreach;
          • Ensuring child welfare officials comply with the Constitution;
          • Deterring future constitutional violations.

     30. "It is always in the public interest to prevent the violation of a party's constitutional rights." G & V Lounge, Inc. v. Michigan Liquor Control Commission, 23 F.3d 1071, 1079 (6th Cir. 1994).

     31. The public interest is served by holding government officials accountable to constitutional requirements.

VII. REQUESTED INJUNCTIVE RELIEF

     WHEREFORE, Plaintiff requests that this Court issue:

A. Temporary Restraining Order (if necessary)

     If notice to Defendants is not practical, Plaintiff requests a TRO pursuant to Fed. R. Civ. P. 65(b) ordering:

     1. Immediate return of ${data.childrenNames} to Plaintiff's custody;
     2. Stay of all state court proceedings;
     3. Prohibition on further removal or interference with custody;

B. Preliminary Injunction

     Plaintiff requests a preliminary injunction ordering:

     1. Return of ${data.childrenNames} to Plaintiff's custody pending resolution of this action;

     2. Prohibition on Defendants from:
          a. Removing or threatening to remove ${data.childrenNames};
          b. Conducting warrantless searches of Plaintiff's home;
          c. Interfering with Plaintiff's parental rights;
          d. Retaliating against Plaintiff for filing this action;

     3. Requirements that Defendants:
          a. Comply with Fourth Amendment warrant requirements;
          b. Provide adequate due process protections;
          c. Preserve all evidence;
          d. Dismiss baseless allegations;

     4. Stay of all state court proceedings pending resolution of federal constitutional claims;

     5. Such other relief as this Court deems just and proper.

VIII. BOND

     Plaintiff requests that any bond requirement be waived or set at a nominal amount due to:
          • The constitutional nature of the claims;
          • Minimal risk of harm to Defendants;
          • Plaintiff's limited financial resources.

     Alternatively, Plaintiff requests permission to proceed in forma pauperis.

IX. CONCLUSION

     For the foregoing reasons, Plaintiff respectfully requests that this Court grant this Motion for Preliminary Injunction and Temporary Restraining Order.

Dated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Respectfully submitted,

/s/ ${data.attorneyName || data.plaintiffName}
_________________________________
${data.attorneyName || data.plaintiffName}
${data.attorneyName ? (data.attorneyBarNumber ? `Bar No. ${data.attorneyBarNumber}` : '') : 'Pro Se'}

CERTIFICATE OF SERVICE

_________________________________
`;
};

// ==========================================
// TEMPLATE: FEDERAL BRIEF ON CONSTITUTIONAL ISSUES
// ==========================================
export const generateConstitutionalBrief = (data: FederalTemplateData): string => {
  return `UNITED STATES DISTRICT COURT
${data.state.toUpperCase()} DISTRICT OF ${data.state.toUpperCase()}

${data.plaintiffName.toUpperCase()},
                    Plaintiff,
v.                                              CASE NO. _____________

${data.defendants.map(d => `${d.name.toUpperCase()},`).join('\n')}
                    Defendants.

PLAINTIFF'S BRIEF IN SUPPORT OF CONSTITUTIONAL CLAIMS

TABLE OF CONTENTS

I.    INTRODUCTION......................................................1
II.   STATEMENT OF FACTS................................................1
III.  ARGUMENT..........................................................3
      A. Standard of Review.............................................3
      B. Defendants Violated Plaintiff's Fourth Amendment Rights........4
         1. The Fourth Amendment Applies to CPS Investigations..........4
         2. No Valid Consent Existed....................................5
         3. No Exigent Circumstances Justified Warrantless Entry........6
      C. Defendants Violated Fundamental Parental Rights................7
         1. Parental Rights Are Fundamental.............................7
         2. Strict Scrutiny Applies.....................................8
         3. Defendants Failed Strict Scrutiny...........................9
      D. Defendants Violated Procedural Due Process.....................10
      E. Qualified Immunity Does Not Apply..............................11
IV.   CONCLUSION........................................................12

TABLE OF AUTHORITIES

CASES:

Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)
County of Sacramento v. Lewis, 523 U.S. 833 (1998)
Mapp v. Ohio, 367 U.S. 643 (1961)
Meyer v. Nebraska, 262 U.S. 390 (1923)
Payton v. New York, 445 U.S. 573 (1980)
Pierce v. Society of Sisters, 268 U.S. 510 (1925)
Santosky v. Kramer, 455 U.S. 745 (1982)
Stanley v. Illinois, 405 U.S. 645 (1972)
Troxel v. Granville, 530 U.S. 57 (2000)

CONSTITUTIONAL PROVISIONS:

U.S. Const. amend. IV
U.S. Const. amend. XIV

STATUTES:

42 U.S.C. § 1983

═══════════════════════════════════════════════════════════════

I. INTRODUCTION

     This case presents fundamental questions of constitutional law: When may government agents enter a home without a warrant, remove children from parental custody, and deprive parents of their fundamental right to family integrity?

     The answer under the United States Constitution is clear: The Fourth Amendment requires a warrant absent exigent circumstances, and the Fourteenth Amendment requires strict scrutiny before government may interfere with fundamental parental rights.

     Defendants violated both amendments. They entered Plaintiff's home without a warrant, without consent, and without exigent circumstances. They removed ${data.childrenNames} from Plaintiff's custody without satisfying strict scrutiny. These violations of clearly established constitutional law cannot stand.

II. STATEMENT OF FACTS

     The undisputed facts establish that Defendants violated Plaintiff's constitutional rights:
${data.facts && data.facts.length > 0 ? data.facts.map((fact, i) => `
     ${i + 1}. ${fact}`).join('') : `
     1. On ${data.dateOfIncident}, Defendants appeared at Plaintiff's home without a warrant.
     
     2. Defendants demanded entry and threatened to obtain a court order if Plaintiff refused.
     
     3. Plaintiff, believing refusal would result in immediate removal of children, allowed entry under duress.`}

     These facts demonstrate clear constitutional violations.

III. ARGUMENT

A. Standard of Review

     Constitutional claims under § 1983 are reviewed de novo. The Court must determine whether Defendants' actions violated clearly established constitutional rights.

     Government officials are entitled to qualified immunity only if:
     (1) The constitutional right was not clearly established, OR
     (2) A reasonable official could have believed the conduct was lawful.

     Harlow v. Fitzgerald, 457 U.S. 800 (1982).

     As demonstrated below, the constitutional rights at issue were clearly established and no reasonable official could have believed Defendants' conduct was lawful.

B. Defendants Violated Plaintiff's Fourth Amendment Rights

1. The Fourth Amendment Applies to CPS Investigations

     The Fourth Amendment protects individuals from unreasonable searches and seizures. U.S. Const. amend. IV. This protection "applies with full force" to child welfare investigations. Calabretta v. Floyd, 189 F.3d 808, 812 (9th Cir. 1999).

     A warrantless search of a home is "presumptively unreasonable" and violates the Fourth Amendment unless justified by probable cause and exigent circumstances. Payton v. New York, 445 U.S. 573, 586 (1980).

     The "sanctity of the home" requires that government agents obtain a warrant before conducting searches absent emergency. Id. This requirement applies equally to child protective workers. Calabretta, 189 F.3d at 812.

2. No Valid Consent Existed

     For consent to validate a warrantless search, it must be:
     • Voluntary;
     • Given by one with authority;
     • Free from coercion or duress.

     Schneckloth v. Bustamonte, 412 U.S. 218 (1973).

     Consent is not voluntary when obtained through:
     • Threats of adverse consequences;
     • Implied threats to obtain court orders;
     • Exploitation of vulnerability;
     • Failure to inform of right to refuse.

     Here, Defendants obtained purported "consent" by:
     • Threatening to obtain a court order;
     • Implying that refusal would result in immediate removal;
     • Creating a coercive atmosphere;
     • Failing to inform Plaintiff of right to refuse.

     Such coerced "consent" cannot justify warrantless entry. The consent was invalid as a matter of law.

3. No Exigent Circumstances Justified Warrantless Entry

     Warrantless searches may be justified by exigent circumstances when there is:
     (1) Probable cause, AND
     (2) Reasonable belief that delay would result in:
         a. Destruction of evidence,
         b. Escape of suspect, OR
         c. Danger to persons.

     Welsh v. Wisconsin, 466 U.S. 740 (1984).

     No exigent circumstances existed here:
     • ${data.childrenNames} ${data.childrenNames.includes(',') ? 'were' : 'was'} not in imminent danger;
     • No emergency medical situation existed;
     • Plaintiff was cooperative;
     • There was adequate time to obtain a warrant.

     Defendants' own reports acknowledge they scheduled the visit in advance, negating any claim of emergency. The warrantless entry violated the Fourth Amendment.

C. Defendants Violated Fundamental Parental Rights

1. Parental Rights Are Fundamental

     The Fourteenth Amendment protects the fundamental liberty interest of parents in the care, custody, and management of their children. This right is "perhaps the oldest of the fundamental liberty interests recognized by this Court." Troxel v. Granville, 530 U.S. 57, 65 (2000).

     For over a century, the Supreme Court has protected parental rights:

     • Meyer v. Nebraska, 262 U.S. 390 (1923) - Right to direct children's upbringing and education;
     • Pierce v. Society of Sisters, 268 U.S. 510 (1925) - Parents' primary role in childrearing;
     • Stanley v. Illinois, 405 U.S. 645 (1972) - Due process protections for parents;
     • Santosky v. Kramer, 455 U.S. 745 (1982) - Clear and convincing evidence standard;
     • Troxel v. Granville, 530 U.S. 57 (2000) - Reaffirming fundamental nature of right.

     This fundamental right may not be infringed without strict scrutiny.

2. Strict Scrutiny Applies

     Government interference with fundamental rights triggers strict scrutiny. Under strict scrutiny, the government must prove:
     (1) A compelling state interest, AND
     (2) Narrow tailoring - the action is the least restrictive means.

     Washington v. Glucksberg, 521 U.S. 702 (1997).

     While protecting children is a compelling interest, the means employed must still be narrowly tailored. The government must demonstrate that less restrictive alternatives are inadequate.

3. Defendants Failed Strict Scrutiny

     Defendants cannot satisfy strict scrutiny because:

     First, no compelling interest justified removal. The evidence shows no imminent danger to ${data.childrenNames}. Vague concerns or speculative harm cannot support removal.

     Second, less restrictive alternatives were available:
     • Safety planning;
     • In-home services;
     • Relative placement;
     • Increased monitoring.

     Defendants made no effort to use less restrictive means. This failure dooms their actions under strict scrutiny.

D. Defendants Violated Procedural Due Process

     Before depriving parents of custody, due process requires:
     • Adequate notice of allegations;
     • Meaningful opportunity to be heard;
     • Neutral decision-maker;
     • Right to present evidence;
     • Right to confront adverse witnesses.

     Stanley v. Illinois, 405 U.S. 645 (1972).

     Defendants denied Plaintiff these protections by:
     • Providing inadequate notice;
     • Removing children before any hearing;
     • Conducting biased investigation;
     • Refusing to consider exculpatory evidence.

     These violations of procedural due process require relief.

E. Qualified Immunity Does Not Apply

     Qualified immunity does not protect Defendants because the constitutional rights at issue were clearly established.

     By 2020, it was clearly established that:
     • The Fourth Amendment applies to CPS investigations;
     • Warrantless searches require exigent circumstances;
     • Parents have fundamental rights to family integrity;
     • Due process requires notice and hearing.

     No reasonable official could have believed this conduct was lawful. Qualified immunity is defeated.

IV. CONCLUSION

     Defendants violated clearly established constitutional rights. The Fourth Amendment prohibited warrantless entry. The Fourteenth Amendment protected Plaintiff's fundamental parental rights. Due process required notice and hearing.

     Defendants satisfied none of these requirements. Their actions were unconstitutional and qualify for neither immunity nor deference.

     Plaintiff respectfully requests that this Court grant judgment in Plaintiff's favor on all constitutional claims.

Dated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Respectfully submitted,

/s/ ${data.attorneyName || data.plaintiffName}
_________________________________
${data.attorneyName || data.plaintiffName}
`;
};

// Export all federal court templates
export const federalCourtTemplates = {
  noticeOfRemoval: generateNoticeOfRemoval,
  federalInjunction: generateFederalInjunction,
  constitutionalBrief: generateConstitutionalBrief,
};

export type { RemovalData };
