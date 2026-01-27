import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Scale, 
  FileText, 
  Search,
  ExternalLink,
  Download,
  Bookmark,
  BookMarked,
  Scroll,
  Gavel,
  Shield,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Library,
  Sparkles,
  Filter,
  CheckCircle,
  Copy
} from 'lucide-react';

interface LegalResource {
  id: string;
  title: string;
  category: 'bench-book' | 'maxim' | 'foundational' | 'doctrine' | 'case-law' | 'religious';
  subcategory?: string;
  description: string;
  content: string;
  citations?: string[];
  relevance: string[];
  tags: string[];
  url?: string;
}

export function LegalResourcesLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  // Comprehensive legal resources database
  const resources: LegalResource[] = [
    // FEDERAL BENCH BOOKS
    {
      id: 'bench-book-4th-amendment',
      title: 'Federal Judicial Center: Fourth Amendment Search & Seizure',
      category: 'bench-book',
      subcategory: 'Constitutional Rights',
      description: 'Comprehensive guidance on Fourth Amendment protections against unreasonable searches and seizures, particularly relevant to CPS home visits and investigations.',
      content: `
**Key Principles:**

1. **Warrantless Searches Exception**
   - Consent must be voluntary and knowing
   - Exigent circumstances must be immediate and verified
   - Plain view doctrine requires lawful presence
   - Emergency aid exception has strict requirements

2. **Administrative Searches (CPS Context)**
   - *Camara v. Municipal Court* (1967): Administrative warrant required
   - Social workers are government agents subject to Fourth Amendment
   - "Welfare check" does not automatically create exigency
   - Parent has right to refuse entry without warrant or court order

3. **Consent Issues**
   - Must be freely and voluntarily given
   - Can be withdrawn at any time
   - Scope limited to what was consented to
   - Coercion or threat vitiates consent

4. **Exigent Circumstances Standard**
   - Immediate danger to child's life or safety
   - Reasonable belief based on articulable facts
   - Not mere suspicion or anonymous tip
   - Hot pursuit, destruction of evidence, or escape

**Judicial Standards:**
- Totality of circumstances test
- Reasonableness under the circumstances
- Balancing state interest vs. privacy rights
- Probable cause requirement for removal

**CPS Application:**
When CPS enters home without warrant or consent, courts examine:
1. Was there immediate threat to child?
2. Did worker have reasonable belief of danger?
3. Could warrant have been obtained?
4. Was less intrusive alternative available?

**Case Law:**
- *Payton v. New York* (1980): Warrantless home entry unconstitutional
- *Kentucky v. King* (2011): Exigency cannot be police-created
- *Doe v. Kearney* (9th Cir. 2003): CPS needs warrant or exigency
- *Gates v. Texas* (5th Cir. 2008): Anonymous tip insufficient for warrantless entry
      `,
      relevance: ['Warrantless home entry', 'CPS investigations', 'Constitutional violations', 'Evidence suppression'],
      tags: ['4th Amendment', 'searches', 'warrants', 'consent', 'exigent circumstances'],
      url: 'https://www.fjc.gov'
    },
    {
      id: 'bench-book-14th-amendment',
      title: 'Federal Judicial Center: Fourteenth Amendment Due Process',
      category: 'bench-book',
      subcategory: 'Constitutional Rights',
      description: 'Due process protections for parents in child welfare proceedings, including notice, hearing rights, and fundamental liberty interests.',
      content: `
**Fundamental Principles:**

1. **Substantive Due Process**
   - Parent-child relationship is fundamental liberty interest
   - *Troxel v. Granville* (2000): Parental rights among "oldest fundamental liberty interests"
   - State must have compelling interest to interfere
   - Means must be narrowly tailored to serve that interest

2. **Procedural Due Process Requirements**
   - Adequate and timely notice of proceedings
   - Meaningful opportunity to be heard
   - Right to counsel in termination cases (*Lassiter v. Dept. of Social Services*)
   - Impartial tribunal
   - Right to present evidence and cross-examine witnesses

3. **Notice Requirements**
   - Must be reasonably calculated to inform
   - Specific allegations, not vague accusations
   - Sufficient time to prepare defense
   - Written notice required for removal

4. **Hearing Rights**
   - Preliminary hearing within 72 hours of removal (most states)
   - Adjudication hearing on merits
   - Dispositional hearing if jurisdiction found
   - Review hearings every 6 months minimum
   - Permanency hearing within 12 months

**Standards of Proof:**
- Removal: Probable cause or reasonable grounds
- Adjudication: Preponderance of evidence (most states) or clear & convincing
- Termination of Parental Rights: Clear and convincing evidence (*Santosky v. Kramer*)

**Burden of Proof:**
- State bears burden at all stages
- Parent presumed fit until proven otherwise
- State must prove allegations by required standard

**CPS Application:**

**Common Due Process Violations:**
1. **Insufficient Notice**
   - Vague allegations ("neglect" without specifics)
   - Late notice (received after deadlines)
   - No notice of right to counsel
   - Failure to notify of hearing dates

2. **Denial of Hearing Rights**
   - Ex parte orders without emergency justification
   - Continuances denying timely hearing
   - Exclusion from hearings
   - Denial of right to testify

3. **Inadequate Time to Prepare**
   - Notice given day before hearing
   - Discovery denied or delayed
   - Expert reports provided at last minute

**Relevant Case Law:**
- *Stanley v. Illinois* (1972): Unwed fathers entitled to due process
- *Santosky v. Kramer* (1982): Clear & convincing standard for TPR
- *M.L.B. v. S.L.J.* (1996): Transcript fees cannot deny appellate review
- *Lassiter v. Dept. of Social Services* (1981): No automatic right to counsel but required when TPR likely
      `,
      relevance: ['Due process violations', 'Notice requirements', 'Hearing rights', 'Parental rights'],
      tags: ['14th Amendment', 'due process', 'parental rights', 'notice', 'hearings'],
      url: 'https://www.fjc.gov'
    },
    {
      id: 'bench-book-evidence',
      title: 'Federal Judicial Center: Evidence Standards in Child Welfare',
      category: 'bench-book',
      subcategory: 'Evidence & Procedure',
      description: 'Rules of evidence, hearsay exceptions, burden of proof, and evidentiary standards specific to child protection cases.',
      content: `
**Evidence Standards:**

1. **Admissibility Standards**
   - Relevant and material to allegations
   - Reliable under circumstances
   - Not unfairly prejudicial
   - Properly authenticated
   - Not privileged

2. **Hearsay in Child Welfare Cases**
   **General Rule:** Hearsay inadmissible unless exception applies

   **Common Exceptions:**
   - Child's statement to medical professional for diagnosis/treatment
   - Excited utterance (spontaneous statement during/after event)
   - Statement against interest
   - Business records (CPS files, medical records)
   - Public records (police reports with limitations)

   **Residual Exception:**
   - Statement has circumstantial guarantees of trustworthiness
   - Offered to prove material fact
   - More probative than other available evidence
   - Admission serves interests of justice

3. **Expert Testimony**
   - Qualified by knowledge, skill, experience, training, or education
   - Based on sufficient facts or data
   - Product of reliable principles and methods
   - Applied principles reliably to facts (*Daubert* standard)

4. **Medical Records**
   - Business records exception
   - Statements for medical diagnosis/treatment
   - Must establish foundation (custodian, regular practice)
   - Not admissible if prepared for litigation

**Burden of Proof Standards:**

1. **Initial Removal (Emergency)**
   - Probable cause or reasonable belief
   - Imminent danger to child
   - Articulable facts, not mere suspicion

2. **Preliminary/Detention Hearing**
   - Prima facie showing of danger
   - Preponderance that continued detention necessary
   - Cannot use hearsay alone in many jurisdictions

3. **Adjudication (Jurisdiction)**
   - Preponderance of evidence (most states)
   - Some states: Clear and convincing
   - State bears burden of proof

4. **Termination of Parental Rights**
   - Clear and convincing evidence required (*Santosky v. Kramer*)
   - Highest standard in child welfare
   - Each element must be proven to this standard

**Evidentiary Issues in CPS Cases:**

**Problematic Evidence:**
1. **Uncorroborated Social Worker Testimony**
   - Hearsay within hearsay
   - Opinions beyond scope of expertise
   - Advocacy role vs. neutral witness

2. **Anonymous Tips**
   - Insufficient alone for removal
   - Must be corroborated
   - Reliability must be established

3. **Coerced Statements**
   - Obtained through threats or promises
   - "Sign this or lose your kids" = inadmissible
   - Violation of constitutional rights

4. **Improperly Obtained Evidence**
   - Fruit of unconstitutional search
   - Violation of Miranda rights
   - Chain of custody issues

**Documentary Evidence Requirements:**
- Proper foundation established
- Authentication of documents
- Best evidence rule (original preferred)
- Chain of custody for physical evidence

**Case Law:**
- *Daubert v. Merrell Dow* (1993): Expert testimony standards
- *Crawford v. Washington* (2004): Confrontation clause (criminal, but persuasive)
- *In re Malinda S.* (CA 1990): Hearsay alone insufficient for jurisdiction
      `,
      relevance: ['Evidence challenges', 'Hearsay objections', 'Burden of proof', 'Expert witnesses'],
      tags: ['evidence', 'hearsay', 'burden of proof', 'experts', 'admissibility'],
      url: 'https://www.fjc.gov'
    },

    // MAXIMS OF LAW
    {
      id: 'maxim-ignorantia',
      title: 'Maxim: Ignorantia juris non excusat',
      category: 'maxim',
      description: '"Ignorance of the law excuses no one" - BUT this cuts both ways: CPS workers must know and follow the law.',
      content: `
**Latin:** Ignorantia juris non excusat
**Translation:** Ignorance of the law excuses no one

**Application to CPS Cases:**

**For Parents:**
While parents are expected to know their rights, courts recognize:
- CPS workers have duty to inform parents of rights
- Failure to provide Miranda warnings when required
- Failure to inform of right to refuse entry
- Failure to inform of right to counsel

**For CPS Workers:**
This maxim applies MORE STRONGLY to government agents:
- Social workers must know constitutional requirements
- "I didn't know I needed a warrant" is not a defense
- Qualified immunity lost when violating clearly established rights
- Training deficiencies not an excuse

**Case Applications:**
1. CPS worker enters home without warrant or exigency
   → Cannot claim ignorance of Fourth Amendment
   
2. CPS interrogates parent without Miranda warnings
   → Cannot claim ignorance of Fifth Amendment requirements
   
3. CPS removes child without probable cause
   → Cannot claim ignorance of due process standards

**Defense Strategy:**
When CPS claims "good faith" or "didn't know":
- Point to training materials they received
- Reference state policy manuals (clearly state requirements)
- Cite *Harlow v. Fitzgerald*: No immunity for violating clearly established law
- Note: Constitutional rights were clearly established decades ago

**Supporting Maxim:**
*"Delegatus non potest delegare"* - A delegate cannot delegate
- CPS acts under state's parens patriae authority
- Must follow strict statutory and constitutional limits
- Cannot exceed delegated authority
      `,
      relevance: ['Constitutional violations', 'Qualified immunity', 'CPS training', 'Rights violations'],
      tags: ['maxim', 'legal principles', 'ignorance', 'CPS duties', 'constitutional rights']
    },
    {
      id: 'maxim-ei-incumbit',
      title: 'Maxim: Ei incumbit probatio qui dicit, non qui negat',
      category: 'maxim',
      description: '"The burden of proof lies upon him who affirms, not him who denies" - The state must prove allegations, not the parent disprove them.',
      content: `
**Latin:** Ei incumbit probatio qui dicit, non qui negat
**Translation:** The burden of proof lies upon him who affirms, not him who denies

**Fundamental Principle:**
The state (CPS) makes allegations, therefore the state MUST prove them.
The parent does NOT have to prove innocence.

**Application to CPS Cases:**

**Burden of Proof on CPS:**
1. **At Removal:**
   - CPS must show probable cause child in danger
   - Parent does NOT have to prove child is safe
   
2. **At Jurisdiction/Adjudication:**
   - CPS must prove allegations by preponderance (or clear & convincing)
   - Parent does NOT have to prove allegations false
   
3. **At Termination:**
   - CPS must prove grounds by clear & convincing evidence
   - Parent does NOT have to prove fitness

**Common Violations:**

**Shifting Burden:**
1. "Prove your home is safe" → WRONG (CPS must prove it's unsafe)
2. "Prove you're not using drugs" → WRONG (CPS must prove you are)
3. "Show us you can parent" → WRONG (CPS must prove you cannot)

**Negative Proof Problem:**
Cannot require parent to prove a negative:
- "Prove abuse didn't happen" → Impossible
- "Prove you won't relapse" → Speculative
- "Prove child won't be harmed" → Future prediction

**Proper Burden:**
✅ CPS must prove: "Child was harmed"
❌ Parent does NOT prove: "Child was not harmed"

✅ CPS must prove: "Parent is currently using drugs"
❌ Parent does NOT prove: "Parent is not using drugs"

✅ CPS must prove: "Home is dangerous"
❌ Parent does NOT prove: "Home is safe"

**Defense Strategy:**

**Burden-Shifting Objections:**
When CPS or court improperly shifts burden:

1. **Cite This Maxim** + *Santosky v. Kramer*
   "Your Honor, the burden of proof remains on the state at all times. 
   The state must prove [specific allegation], not require my client to disprove it."

2. **Object to Negative Proof Demands**
   "Objection. Counsel is asking my client to prove a negative, which is impossible and shifts the burden."

3. **Presumption of Parental Fitness**
   "My client is presumed fit. The state must overcome that presumption with evidence, 
   not require my client to prove fitness."

**Related Maxims:**
- *Semper necessitas probandi incumbit ei qui agit* - The necessity of proof always lies with the person who lays charges
- *In dubio pro reo* - When in doubt, for the accused
- *Actori incumbit onus probandi* - The burden of proof rests on the plaintiff

**Case Law:**
- *Stanley v. Illinois* (1972): Presumption of parental fitness
- *Santosky v. Kramer* (1982): State bears burden in TPR
- *In re Winship* (1970): Burden always on state (juvenile delinquency, but principle applies)
      `,
      relevance: ['Burden of proof', 'Presumption of innocence', 'Evidence requirements', 'Due process'],
      tags: ['maxim', 'burden of proof', 'presumptions', 'state burden', 'evidence']
    },
    {
      id: 'maxim-nemo-tenetur',
      title: 'Maxim: Nemo tenetur seipsum accusare',
      category: 'maxim',
      description: '"No one is bound to accuse himself" - Fifth Amendment privilege against self-incrimination applies in CPS cases.',
      content: `
**Latin:** Nemo tenetur seipsum accusare
**Translation:** No one is bound to accuse himself

**Constitutional Basis:**
Fifth Amendment: "No person shall be compelled in any criminal case to be a witness against himself"

**Application Beyond Criminal Cases:**

**CPS Context:**
While CPS cases are "civil," the privilege applies when:
1. Testimony could lead to criminal charges (abuse, neglect crimes)
2. Statements could be used in parallel criminal investigation
3. Admissions could result in incarceration (contempt, criminal referral)

**When Fifth Amendment Applies in CPS Cases:**

**Custodial Interrogation:**
- CPS office questioning without freedom to leave = custodial
- Miranda warnings required if:
  * Parent not free to leave
  * Reasonable person would not feel free to leave
  * Questioning accusatory/confrontational

**Investigative Interviews:**
Even if not "custodial," parent has right:
- To remain silent
- To refuse to answer questions
- To stop interview at any time
- To consult with attorney

**Cannot Be Used Against Parent:**
Courts cannot:
- Draw negative inference from silence
- Use refusal to speak as evidence of guilt
- Consider assertion of rights as "non-cooperation"
- Deny reunification because parent "won't talk"

**Common CPS Tactics (Violations):**

1. **"If you have nothing to hide, why won't you talk?"**
   → Improper. Assertion of rights ≠ guilt

2. **"We need to hear your side of the story"**
   → Manipulative. Parent has no duty to provide "their side"

3. **"Your silence makes you look guilty"**
   → Violation. Cannot draw negative inference

4. **"Cooperation is required for reunification"**
   → Improper if "cooperation" means incriminating statements

**Proper Exercise of Rights:**

**Sample Statements:**
1. "I invoke my Fifth Amendment right to remain silent."
2. "I will not answer questions without my attorney present."
3. "I do not consent to this interview."
4. "I am invoking my right to counsel."

**After Invoking:**
- CPS must stop questioning immediately (*Miranda v. Arizona*)
- Cannot try to persuade you to waive rights
- Cannot threaten consequences for invoking rights
- Cannot continue "off the record" or "just clarifying"

**Exception - Immunity:**
If granted immunity (rare in CPS cases), must answer or face contempt.
But: Immunized statements cannot be used in criminal prosecution.

**Defense Strategy:**

**Pre-Interview Advice:**
1. Do NOT speak to CPS without attorney
2. Politely decline: "I'd like my attorney present"
3. Do not sign anything
4. Do not consent to searches

**If Statements Already Made:**
1. Move to suppress if Miranda violated
2. Move to suppress if coerced
3. Argue statements involuntary if threats made
4. Cite this maxim + Fifth Amendment

**Related Principles:**
- *Miranda v. Arizona* (1966): Warnings required for custodial interrogation
- *Garrity v. New Jersey* (1967): Coerced statements inadmissible
- *Griffin v. California* (1965): No negative inference from silence

**Case Law:**
- *Minnesota v. Murphy* (1984): Fifth Amendment applies in civil context when criminal prosecution possible
- *Baltimore Dept. of Social Services v. Bouknight* (1990): Limited exception for producing child (but not testimony)
- *Chavez v. Martinez* (2003): Coercive questioning violates Fifth Amendment even without prosecution
      `,
      relevance: ['Fifth Amendment', 'Miranda rights', 'Self-incrimination', 'Interrogation'],
      tags: ['maxim', '5th Amendment', 'Miranda', 'silence', 'interrogation', 'rights']
    },

    // FEDERALIST PAPERS
    {
      id: 'federalist-51',
      title: 'Federalist No. 51: Separation of Powers & Checks on Government',
      category: 'foundational',
      subcategory: 'Federalist Papers',
      description: 'Madison\'s explanation of separation of powers and why government power must be limited and checked - directly applicable to CPS overreach.',
      content: `
**Author:** James Madison
**Published:** February 6, 1788
**Subject:** Separation of powers and checks and balances

**Key Quotes:**

"If men were angels, no government would be necessary. If angels were to govern men, neither external nor internal controls on government would be necessary. In framing a government which is to be administered by men over men, the great difficulty lies in this: you must first enable the government to control the governed; and in the next place oblige it to control itself."

**Relevance to CPS Cases:**

**Government Must Control Itself:**
CPS is government agency that MUST be controlled by:
1. **Constitutional limits** (4th, 5th, 14th Amendments)
2. **Statutory limits** (state child welfare laws)
3. **Judicial oversight** (court review of removals)
4. **Procedural safeguards** (due process requirements)

**Separation of Powers:**

**Executive Branch (CPS):**
- Investigates allegations
- Removes children (with court approval)
- Provides services
- BUT: Cannot be judge, jury, and executioner

**Judicial Branch (Courts):**
- Reviews CPS removals
- Adjudicates allegations
- Orders services or reunification
- BUT: Cannot investigate or provide services

**Problem: CPS Overreach:**
When CPS acts as investigator, prosecutor, AND decision-maker:
- Violates separation of powers principles
- Creates conflict of interest
- Removes impartial tribunal requirement
- Concentrates power in executive agency

**Checks and Balances in CPS System:**

**Courts Check CPS:**
- Preliminary hearings within 72 hours
- Review of removal decision
- Adjudication of allegations
- Ongoing review hearings

**Parents' Rights Check CPS:**
- Fourth Amendment (no warrantless entry)
- Fifth Amendment (no forced statements)
- Fourteenth Amendment (due process, fundamental rights)
- Right to counsel

**Procedural Safeguards Check CPS:**
- Burden of proof on state
- Right to hearing
- Right to present evidence
- Right to cross-examine

**Madison's Warning Applied:**
"The accumulation of all powers, legislative, executive, and judiciary, in the same hands, whether of one, a few, or many, and whether hereditary, self-appointed, or elective, may justly be pronounced the very definition of tyranny."

**CPS Tyranny When:**
- Investigates without oversight
- Removes without court review
- Acts as prosecutor and judge
- Denies parental rights without due process

**Defense Strategy:**
When CPS exceeds authority, cite Federalist 51:
1. CPS is executive branch, cannot usurp judicial function
2. Removal requires court approval (separation of powers)
3. Ex parte orders violate checks and balances
4. Concentration of power in CPS = tyranny Madison warned against

**Application:**
"Your Honor, Federalist 51 warns against concentration of government power in one branch. Here, CPS investigated, determined guilt, and removed the child without court review - acting as investigator, prosecutor, and judge. This violates the fundamental principle of separation of powers."

**Modern Case Law:**
- *Youngstown Sheet & Tube Co. v. Sawyer* (1952): Separation of powers limits executive
- *INS v. Chadha* (1983): Separation essential to liberty
- *Clinton v. City of New York* (1998): Cannot delegate core powers
      `,
      relevance: ['Government overreach', 'Separation of powers', 'Due process', 'Tyranny prevention'],
      tags: ['Federalist Papers', 'Madison', 'separation of powers', 'checks and balances', 'government limits']
    },
    {
      id: 'federalist-78',
      title: 'Federalist No. 78: Judicial Review & Protection of Rights',
      category: 'foundational',
      subcategory: 'Federalist Papers',
      description: 'Hamilton on judicial review as protection against legislative and executive overreach - the judiciary as guardian of constitutional rights.',
      content: `
**Author:** Alexander Hamilton
**Published:** June 14, 1788
**Subject:** The judiciary as safeguard of liberty and constitutional rights

**Key Quotes:**

"The complete independence of the courts of justice is peculiarly essential in a limited Constitution. By a limited Constitution, I understand one which contains certain specified exceptions to the legislative authority... Limitations of this kind can be preserved in practice no other way than through the medium of courts of justice, whose duty it must be to declare all acts contrary to the manifest tenor of the Constitution void."

**Relevance to CPS Cases:**

**Courts as Guardian of Rights:**
When CPS violates constitutional rights, ONLY the courts can:
1. Declare the violation
2. Suppress illegally obtained evidence
3. Dismiss improperly filed petitions
4. Award damages for rights violations

**Judicial Independence:**
Courts must be independent of CPS to:
- Provide fair hearing
- Check executive power (CPS is executive agency)
- Protect minority rights (parents against state)
- Enforce constitutional limits

**"Least Dangerous Branch":**
Hamilton wrote courts have:
- No power of purse (like legislature)
- No power of sword (like executive)
- Only JUDGMENT

**Application:**
In CPS cases, courts exercise judgment to:
- Determine if removal was constitutional
- Assess whether evidence was properly obtained
- Decide if due process was provided
- Balance state interest vs. parental rights

**Constitutional Limits on CPS:**

**CPS Cannot:**
- Override Fourth Amendment (warrantless searches)
- Override Fifth Amendment (forced incrimination)
- Override Fourteenth Amendment (due process, parental rights)
- Act beyond statutory authority

**Courts Must:**
- Void actions contrary to Constitution
- Suppress evidence from illegal searches
- Dismiss cases lacking due process
- Protect fundamental rights of parents

**Defense Strategy:**

**When Filing Motions:**
Cite Federalist 78 to remind court of its duty:

"Your Honor, as Hamilton wrote in Federalist 78, this Court's duty is to 'declare all acts contrary to the manifest tenor of the Constitution void.' CPS's warrantless entry violated the Fourth Amendment. This Court must void the fruits of that violation."

**When CPS Overreaches:**
"The framers established an independent judiciary precisely to check executive overreach like this. CPS, as an executive agency, exceeded its constitutional authority. This Court must exercise its judgment to protect constitutional rights."

**When Courts Rubber-Stamp CPS:**
"Your Honor, with respect, judicial independence requires this Court to scrutinize CPS's actions, not merely approve them. Hamilton warned that courts must be the 'bulwark' against tyranny."

**Hamilton's Vision:**

**Courts Protect Against:**
1. **Legislative Oppression:** Laws that violate rights
2. **Executive Oppression:** Agencies (CPS) that violate rights
3. **Majoritarian Tyranny:** Popular will that tramples minority rights

**Courts Do This By:**
1. Judicial review of government actions
2. Declaration of unconstitutional acts as void
3. Protection of individual rights against state power
4. Independent judgment based on law and Constitution

**Judicial Review in CPS Context:**

**Courts Review:**
- Was removal supported by probable cause?
- Was search constitutional?
- Was due process provided?
- Did CPS follow statutory requirements?
- Are parental rights being protected?

**If Answer is NO:**
- Void the removal
- Suppress the evidence
- Dismiss the petition
- Order return of child
- Sanction CPS for violation

**Modern Doctrine:**
- *Marbury v. Madison* (1803): Established judicial review
- *Cooper v. Aaron* (1958): Judicial supremacy in constitutional interpretation
- *United States v. Nixon* (1974): No one above the law, including executive

**Application to CPS:**
CPS is executive agency → Subject to judicial review → Courts must enforce constitutional limits → Cannot defer to CPS expertise on legal/constitutional questions

**Quote for Closing Arguments:**
"The Founders gave us an independent judiciary for moments exactly like this - when government power threatens individual liberty. This Court stands as the bulwark between my client's fundamental rights and the state's overreach. Hamilton's vision demands this Court exercise its independent judgment and protect these constitutional rights."
      `,
      relevance: ['Judicial review', 'Constitutional rights', 'Separation of powers', 'Court independence'],
      tags: ['Federalist Papers', 'Hamilton', 'judicial review', 'courts', 'constitutional rights', 'independence']
    },

    // CONSTITUTION
    {
      id: 'constitution-4th-amendment',
      title: 'U.S. Constitution: Fourth Amendment',
      category: 'foundational',
      subcategory: 'Bill of Rights',
      description: 'Protection against unreasonable searches and seizures - the primary constitutional protection against CPS home invasions.',
      content: `
**Text:**
"The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized."

**Application to CPS Cases:**

**Your Home:**
- Fourth Amendment protects your home most strongly
- CPS cannot enter without warrant or valid exception
- "I'm from the government" does NOT override Fourth Amendment

**Your Person:**
- CPS cannot force medical exams without consent or court order
- Physical seizure of child = seizure under Fourth Amendment
- Drug testing of parent requires consent or court order

**Your Papers & Effects:**
- CPS cannot search drawers, closets, phones without consent
- Medical records protected (HIPAA + Fourth Amendment)
- School records require consent or court order

**Warrant Requirement:**

**When CPS Needs Warrant:**
- To enter home over objection
- To search areas not in plain view
- To remove child (absent emergency)

**Probable Cause Requirement:**
- Specific, articulable facts
- Not mere suspicion or anonymous tip
- Reasonable belief child in danger
- Based on reliable information

**Exceptions (When Warrant NOT Required):**

1. **Consent**
   - Must be freely and voluntarily given
   - Can be limited in scope
   - Can be withdrawn at any time
   - Coercion vitiates consent

2. **Exigent Circumstances**
   - Immediate danger to child's life or safety
   - No time to obtain warrant
   - Reasonable belief based on articulable facts
   - Must be genuine emergency, not pretext

3. **Plain View**
   - CPS in position lawfully
   - Incriminating nature immediately apparent
   - Inadvertent discovery (cannot search to create plain view)

4. **Hot Pursuit**
   - Pursuing suspect/endangered child
   - Continuous pursuit
   - Immediate danger

**NOT Exceptions:**
❌ Anonymous tip alone
❌ "Welfare check" without specific danger
❌ "We need to see the child"
❌ "It's policy to enter the home"
❌ Pressure, threats, or intimidation to gain "consent"

**Common CPS Fourth Amendment Violations:**

1. **Warrantless Entry**
   - "We need to come in" → NO, you need a warrant or my consent
   - Foot in door technique → Trespass and violation
   - Entering while parent steps out → No consent to remain

2. **Warrantless Search**
   - Opening closets, drawers, fridge (beyond plain view)
   - Searching bedrooms without consent
   - Looking through papers, mail, phones

3. **Warrantless Seizure**
   - Taking child without court order or emergency
   - Forcing child to CPS office
   - Medical exams without consent

4. **Coerced Consent**
   - "Let us in or we'll take your kids" → Coercion, no valid consent
   - "We'll get a warrant anyway" → Coercion
   - "This will look bad in court" → Coercion

**Exclusionary Rule:**

**Evidence Obtained Illegally:**
- Cannot be used in court
- "Fruit of the poisonous tree"
- Statements from illegal entry suppressed
- Observations from illegal search suppressed

**Motion to Suppress:**
File motion to exclude evidence obtained via:
- Warrantless entry
- Illegal search
- Coerced consent
- Violation of Fourth Amendment

**Defense Strategy:**

**If CPS At Door:**
1. Do not let them in without warrant
2. Step outside and close door behind you (or speak through screen/ring camera)
3. Ask: "Do you have a warrant?"
4. If no: "I do not consent to entry or search"
5. If they enter anyway: "I am not consenting to this entry"

**In Court:**
1. File Motion to Suppress evidence from illegal entry/search
2. Cite Fourth Amendment + *Payton*, *Camara*, *Doe v. Kearney*
3. Argue exigent circumstances did not exist
4. Request evidentiary hearing on circumstances of entry

**Key Case Law:**
- *Payton v. New York* (1980): Warrantless home entry unconstitutional
- *Camara v. Municipal Court* (1967): Administrative search needs warrant
- *Doe v. Kearney* (9th Cir. 2003): CPS social workers need warrant or exigency
- *Gates v. Texas* (5th Cir. 2008): Anonymous tip insufficient for warrantless entry
- *Kentucky v. King* (2011): Cannot create own exigency
- *Mapp v. Ohio* (1961): Exclusionary rule applies to states

**Constitutional Standard:**
"Reasonableness" under totality of circumstances
- Was there warrant or valid exception?
- If exigency claimed, was it immediate and verifiable?
- If consent claimed, was it voluntary?
- Could less intrusive alternative have been used?
      `,
      relevance: ['Warrantless searches', 'Home entry', 'Evidence suppression', 'CPS investigations'],
      tags: ['4th Amendment', 'Constitution', 'searches', 'seizures', 'warrants', 'privacy']
    },
    {
      id: 'constitution-14th-amendment',
      title: 'U.S. Constitution: Fourteenth Amendment Due Process & Parental Rights',
      category: 'foundational',
      subcategory: 'Bill of Rights',
      description: 'Due process and equal protection - the foundation of parental rights as fundamental liberty interests.',
      content: `
**Relevant Text:**
"...nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws."

**Two Components:**

**1. Substantive Due Process**
Protects fundamental rights from government interference

**2. Procedural Due Process**
Requires fair procedures before depriving rights

**Parental Rights as Fundamental Liberty:**

**Supreme Court Precedent:**
- Parent-child relationship is fundamental liberty interest
- Among "oldest of the fundamental liberty interests" (*Troxel*)
- Presumption that fit parents act in child's best interest
- State cannot interfere without compelling reason

**Key Cases:**
- *Meyer v. Nebraska* (1923): Liberty includes right to raise children
- *Pierce v. Society of Sisters* (1925): Parents direct upbringing
- *Stanley v. Illinois* (1972): Unwed fathers have parental rights
- *Santosky v. Kramer* (1982): Clear & convincing standard for TPR
- *Troxel v. Granville* (2000): Parental rights are fundamental

**Substantive Due Process in CPS Cases:**

**State Must Show:**
1. **Compelling Government Interest**
   - Protecting child from harm
   - NOT: Providing "better" home
   - NOT: Disagreement with parenting choices
   - NOT: Poverty or non-conformity

2. **Narrowly Tailored Means**
   - Least intrusive alternative
   - Removal only when no other option
   - Services must be offered before removal (when possible)
   - Return child as soon as safe

**Violations of Substantive Due Process:**

❌ Removing child based on poverty
❌ Removing child for non-dangerous parenting differences
❌ Removing child without attempting less restrictive alternatives
❌ Keeping child in care longer than necessary
❌ Terminating rights without clear & convincing evidence

**Procedural Due Process Requirements:**

**Before Removal (If Time Permits):**
- Court hearing for removal order
- Probable cause showing
- Opportunity to be heard

**After Emergency Removal:**
- Preliminary/detention hearing within 72 hours (typical)
- Written notice of allegations
- Appointed counsel (in many states)
- Opportunity to present evidence

**Throughout Case:**
- Adequate notice of hearings
- Meaningful opportunity to participate
- Right to counsel (especially at TPR)
- Right to present evidence
- Right to cross-examine witnesses
- Impartial tribunal

**Notice Requirements:**

**Must Be:**
- In writing
- Timely (sufficient time to prepare)
- Specific (not vague allegations)
- Include right to counsel
- Include hearing dates and rights

**Insufficient Notice:**
❌ "Neglect" without specifics
❌ Notice day before hearing
❌ No explanation of allegations
❌ No information about rights

**Hearing Rights:**

**Parent Has Right To:**
- Be present at all hearings
- Testify on own behalf
- Present witnesses and evidence
- Cross-examine state's witnesses
- Counsel (appointed if indigent in TPR cases)
- Appeal adverse decisions

**Court Must:**
- Hold timely hearings
- Make findings on the record
- Explain basis for decisions
- Consider less restrictive alternatives
- Review case regularly

**Standards of Proof:**

**Different Stages:**
1. **Emergency Removal:** Probable cause
2. **Detention Hearing:** Prima facie showing
3. **Adjudication:** Preponderance (or clear & convincing)
4. **Termination of Parental Rights:** Clear and convincing evidence (*Santosky*)

**Equal Protection:**

**Prohibits Discrimination Based On:**
- Race
- Ethnicity
- Religion
- Socioeconomic status
- Disability
- Family structure

**Violations:**
- Targeting poor families
- Removing children due to parent's disability
- Different treatment based on race
- Discriminatory application of standards

**Defense Strategy:**

**Substantive Due Process:**
1. Argue parental rights are fundamental
2. State must show compelling interest (actual harm, not speculation)
3. Demand least restrictive alternative
4. Challenge removal as not narrowly tailored

**Procedural Due Process:**
1. Challenge insufficient notice
2. Demand timely hearings
3. Ensure right to counsel
4. Object to denial of opportunity to be heard
5. Request findings and explanations

**Motions:**
- Motion to Dismiss for lack of due process
- Motion for Return of Child (if due process violated)
- Motion to Suppress evidence obtained without due process
- Motion for findings and conclusions

**Key Arguments:**

"Your Honor, my client's right to parent her child is a fundamental liberty interest protected by the Fourteenth Amendment. The state has failed to show a compelling interest sufficient to justify this intrusion, and removal was not narrowly tailored as less restrictive alternatives were not attempted."

"The notice provided was constitutionally inadequate. A vague allegation of 'neglect' one day before the hearing did not afford my client meaningful opportunity to prepare a defense, violating procedural due process."

"Under *Santosky v. Kramer*, termination of parental rights requires clear and convincing evidence. The state has not met this heightened burden, and this Court cannot terminate fundamental rights on a preponderance standard."

**Case Law:**
- *Mathews v. Eldridge* (1976): Balancing test for due process
- *Santosky v. Kramer* (1982): Clear & convincing for TPR
- *Lassiter v. Dept. of Social Services* (1981): Counsel in TPR
- *M.L.B. v. S.L.J.* (1996): Cannot deny appeal due to inability to pay
- *Stanley v. Illinois* (1972): Presumption of parental fitness
- *Troxel v. Granville* (2000): Fundamental liberty interest in parenting
      `,
      relevance: ['Parental rights', 'Due process', 'Notice requirements', 'Hearing rights', 'Fundamental rights'],
      tags: ['14th Amendment', 'Constitution', 'due process', 'parental rights', 'fundamental rights', 'equal protection']
    },

    // MAGNA CARTA
    {
      id: 'magna-carta-39',
      title: 'Magna Carta: Clause 39 - Foundation of Due Process',
      category: 'foundational',
      subcategory: 'Historical Foundation',
      description: 'The 800-year-old foundation of due process rights - no free man shall be seized or imprisoned except by lawful judgment.',
      content: `
**Original Latin (1215):**
"Nullus liber homo capiatur, vel imprisonetur, aut disseisiatur, aut utlagetur, aut exuletur, aut aliquo modo destruatur, nec super eum ibimus, nec super eum mittemus, nisi per legale judicium parium suorum vel per legem terrae."

**English Translation:**
"No free man shall be seized or imprisoned, or stripped of his rights or possessions, or outlawed or exiled, or deprived of his standing in any way, nor will we proceed with force against him, or send others to do so, except by the lawful judgment of his equals or by the law of the land."

**Modern Relevance:**

**Direct Ancestor of:**
- Fifth Amendment Due Process Clause
- Fourteenth Amendment Due Process Clause
- Right to jury trial
- Habeas corpus

**Application to CPS Cases:**

**"No free man shall be seized..."**
= Parent cannot have child seized without lawful process

**"...except by the lawful judgment of his equals..."**
= Requires court hearing, not just CPS decision

**"...or by the law of the land"**
= Must follow constitutional and statutory procedures

**800 Years of Due Process:**

**1215: Magna Carta**
- King cannot imprison or seize without lawful judgment
- Foundation of rule of law

**1791: U.S. Constitution Fifth Amendment**
- "Due process of law" - direct quote from Magna Carta tradition

**1868: Fourteenth Amendment**
- Extended due process to state actions (including CPS)

**2024: Still Applies**
- CPS cannot seize children without due process
- Parents entitled to lawful judgment before deprivation

**CPS Violations of Magna Carta Principles:**

1. **Seizure Without Judgment**
   - CPS removes child without court order
   - No judicial review before removal
   - CPS acts as investigator, prosecutor, and judge

2. **Deprivation Without Law**
   - Removal not authorized by statute
   - Exceeding statutory authority
   - Ignoring constitutional requirements

3. **Denial of "Judgment of Peers"**
   - Ex parte orders (no opportunity to respond)
   - Denial of jury trial (in some contexts)
   - Denial of fair hearing

**Defense Strategy:**

**Historical Argument:**
"Your Honor, for 800 years since Magna Carta, the principle has been clear: no person shall be deprived of their liberty or property except by lawful judgment. CPS's removal of my client's child without prior court review violates this ancient and fundamental principle, enshrined in our Due Process Clauses."

**Framing:**
Use Magna Carta to:
1. Show deep roots of due process
2. Emphasize seriousness of rights violation
3. Connect to American constitutional tradition
4. Argue fundamental nature of rights

**Companion Clauses:**

**Clause 40:**
"To no one will we sell, to no one deny or delay right or justice."

**Application:**
- CPS cannot delay hearings unnecessarily
- Cannot deny access to courts
- Cannot "sell" justice (e.g., require payment for services as condition of return)

**Modern Case Law Citing Magna Carta:**

- *Murray's Lessee v. Hoboken Land & Improvement Co.* (1856): Due process derives from Magna Carta
- *Hurtado v. California* (1884): Due process = law of the land from Magna Carta
- *Joint Anti-Fascist Refugee Committee v. McGrath* (1951): Magna Carta foundation of due process

**Symbolic Power:**

**Why Cite Magna Carta:**
1. Shows rights are ancient and fundamental
2. Predates American Constitution (proves universality)
3. Emphasizes rule of law over arbitrary power
4. Resonates with judges (legal history)

**Quote for Argument:**
"Eight hundred years ago, King John was forced to recognize at Runnymede that even a monarch cannot deprive a person of liberty without lawful process. Today, CPS workers - government employees - claim more power than medieval kings. This Court must enforce the principle established in 1215: no deprivation without due process."

**Connection to American Law:**

**Founders Knew Magna Carta:**
- Blackstone's Commentaries discussed it extensively
- Colonial charters referenced it
- Declaration of Independence echoes its principles
- Constitution's due process clauses derive from it

**Magna Carta → Blackstone → Founders → Constitution → Your Case**

This is not ancient history - it's living law.

**Practical Application:**

When CPS removes child without hearing:
1. Cite Magna Carta Clause 39
2. Connect to Fifth/Fourteenth Amendments
3. Argue 800-year tradition violated
4. Demand immediate hearing and judicial review

**Full Historical Context:**
Magna Carta was forced on King John by barons who were tired of arbitrary imprisonment and seizure of property. The parallels to CPS families are striking:
- Arbitrary exercise of government power ✓
- Seizure of "property" (children are not property, but the analogy holds)
- Denial of due process ✓
- Need for judicial check on executive power ✓

The same principles that limited a king in 1215 must limit CPS in 2024.
      `,
      relevance: ['Due process', 'Historical foundation', 'Rule of law', 'Judicial review'],
      tags: ['Magna Carta', 'due process', 'historical', 'fundamental rights', 'rule of law']
    },

    // PARENS PATRIAE
    {
      id: 'parens-patriae-doctrine',
      title: 'Parens Patriae: The State\'s Limited Authority Over Children',
      category: 'doctrine',
      description: 'Understanding parens patriae - the state\'s role as "parent of the nation" and its strict constitutional limits.',
      content: `
**Definition:**
Parens Patriae (Latin: "parent of the nation") - The state's authority to act as guardian for those who cannot protect themselves, particularly children.

**Historical Origin:**
- English common law
- King as "father of his country"
- Power to protect those unable to protect themselves (children, mentally ill)

**American Adoption:**
- States inherited parens patriae authority
- Used to justify child welfare system
- BUT: Strictly limited by constitutional rights

**The Critical Limitation:**

**Parens Patriae Does NOT Override:**
- Constitutional rights (4th, 5th, 14th Amendments)
- Presumption of parental fitness
- Requirement of due process
- Statutory limits on state authority

**Two-Part Test:**

**State Must Show:**
1. **Child Actually Needs Protection**
   - Actual harm or imminent danger
   - NOT: Parent is poor
   - NOT: Parent's choices differ from state's preferences
   - NOT: State can provide "better" care

2. **Parents Unable or Unwilling to Protect**
   - Parent is source of harm, OR
   - Parent cannot/will not protect from harm
   - NOT: State disagrees with parent's judgment

**Common Misuse of Parens Patriae:**

**CPS Often Claims:**
"We have parens patriae authority to remove this child."

**Reality:**
Parens patriae is not carte blanche. It's LIMITED authority subject to:
- Constitutional constraints
- Statutory requirements
- Judicial oversight
- Burden of proof

**Violations:**

1. **Parens Patriae to Override 4th Amendment**
   ❌ WRONG: "We can enter under parens patriae"
   ✓ CORRECT: Fourth Amendment still applies

2. **Parens Patriae to Override Parental Rights**
   ❌ WRONG: "State knows best"
   ✓ CORRECT: Parents presumed fit; state must prove otherwise

3. **Parens Patriae Without Proof of Harm**
   ❌ WRONG: "We're protecting the child" (speculatively)
   ✓ CORRECT: Must prove actual or imminent harm

4. **Parens Patriae as Unlimited Power**
   ❌ WRONG: "We can do whatever we think is best"
   ✓ CORRECT: Narrowly tailored to compelling state interest

**Constitutional Limits on Parens Patriae:**

**Supreme Court Holdings:**

**1. Cannot Override Fundamental Rights**
*Prince v. Massachusetts* (1944):
"...the family itself is not beyond regulation... But the family is not beyond regulation in the public interest... Neither rights of religion nor rights of parenthood are beyond limitation."

BUT: Limitations must be justified by compelling interest and narrowly tailored.

**2. Parents Presumed Fit**
*Troxel v. Granville* (2000):
"[T]he interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests recognized by this Court."

**3. Clear & Convincing Evidence Required**
*Santosky v. Kramer* (1982):
Parens patriae does not reduce burden of proof for TPR.

**Proper Scope of Parens Patriae:**

**State MAY:**
- Investigate credible allegations of abuse/neglect
- Remove child in genuine emergency
- Petition court for protective order
- Provide services to families
- Prosecute child abuse crimes

**State MAY NOT:**
- Override constitutional rights
- Remove child without proof of harm
- Deny due process
- Presume parents unfit
- Keep child longer than necessary
- Use lower standard of proof

**Defense Strategy:**

**When CPS Invokes Parens Patriae:**

**1. Acknowledge But Limit:**
"While the state has parens patriae authority to protect children, that authority is not unlimited. It is constrained by constitutional rights, statutory requirements, and the burden of proof."

**2. Demand Proof:**
"Parens patriae requires the state to prove this child needs protection and the parent cannot provide it. The state has not met its burden."

**3. Cite Constitutional Limits:**
"Parens patriae does not override the Fourth Amendment. The warrantless entry was unconstitutional regardless of the state's protective interest."

**4. Argue Narrow Tailoring:**
"Even if the state has a legitimate interest under parens patriae, removal is not narrowly tailored. Less restrictive alternatives such as [services, supervision, etc.] would protect the child while preserving parental rights."

**Historical Perspective:**

**Parens Patriae Evolution:**

**Medieval England:**
- King's power over wards and orphans
- Essentially unlimited royal prerogative

**American Revolution:**
- Rejected unlimited royal power
- Created constitutional republic with limited government
- Parens patriae SUBJECT TO constitutional limits

**Modern Era:**
- States have parens patriae authority
- BUT: Limited by Bill of Rights (via 14th Amendment)
- Cannot be used to circumvent constitutional protections

**Key Case Law:**

**Establishing Parens Patriae:**
- *Crouse's Case* (PA 1839): State can remove child from unfit parents
- *Prince v. Massachusetts* (1944): State can regulate child welfare

**Limiting Parens Patriae:**
- *Meyer v. Nebraska* (1923): Parental rights are fundamental
- *Pierce v. Society of Sisters* (1925): Parents direct upbringing
- *Stanley v. Illinois* (1972): Cannot presume parents unfit
- *Santosky v. Kramer* (1982): High burden of proof for TPR
- *Troxel v. Granville* (2000): Parental decisions presumed best

**Modern Interpretation:**

**Balance:**
State's parens patriae interest in child welfare
    vs.
Parents' fundamental liberty interest in child's care/custody

**Result:**
State must prove harm + necessity by required standard
Parents presumed fit and acting in child's best interest
Least restrictive alternative required

**Argument Structure:**

"Your Honor, while the state claims parens patriae authority, that doctrine does not grant unlimited power. Parens patriae is subject to constitutional constraints. Here, CPS violated the Fourth Amendment's prohibition on warrantless searches. The state cannot invoke parens patriae to override the Constitution. Moreover, parens patriae requires proof that this child needs protection and the parent cannot provide it. The state has not met its burden. The ancient doctrine of parens patriae has been tempered by 230 years of constitutional jurisprudence protecting parental rights. This Court must enforce those limits."

**Bottom Line:**

**Parens Patriae Is:**
- Limited state authority to protect children
- Subject to constitutional constraints
- Requires proof of necessity
- Must be narrowly tailored

**Parens Patriae Is NOT:**
- Unlimited power to override parents
- Exception to constitutional rights
- License to act without due process
- Presumption children better off in state care
      `,
      relevance: ['State authority', 'Parental rights', 'Constitutional limits', 'CPS overreach'],
      tags: ['parens patriae', 'state authority', 'doctrine', 'limits', 'parental rights', 'child welfare']
    },

    // BIBLE & RELIGIOUS FREEDOM
    {
      id: 'bible-family-foundation',
      title: 'Biblical Foundation of Family & Parental Authority',
      category: 'religious',
      subcategory: 'Scripture & Family',
      description: 'Biblical principles establishing parental authority, family structure, and God-given rights to raise children - the moral and historical foundation for parental rights.',
      content: `
**The Bible as Foundation of Parental Rights:**

The concept of parental rights predates the Constitution by thousands of years. Biblical principles established the family as the fundamental unit and parents as primary authority over children.

**Key Biblical Principles:**

**1. Parental Authority Ordained by God**

**Deuteronomy 6:6-7 (KJV)**
"And these words, which I command thee this day, shall be in thine heart: And thou shalt teach them diligently unto thy children, and shalt talk of them when thou sittest in thine house, and when thou walkest by the way, and when thou liest down, and when thou risest up."

**Application:** Parents are commanded to teach and train their children. This is not a government function - it's a parental duty ordained by God.

**Proverbs 22:6 (KJV)**
"Train up a child in the way he should go: and when he is old, he will not depart from it."

**Application:** Parents have authority and responsibility to direct the upbringing of their children.

**Ephesians 6:4 (KJV)**
"And, ye fathers, provoke not your children to wrath: but bring them up in the nurture and admonition of the Lord."

**Application:** God assigns child-rearing to parents, not the state. Parents are to provide spiritual and moral instruction.

**2. Children as Heritage from God**

**Psalm 127:3-5 (KJV)**
"Lo, children are an heritage of the LORD: and the fruit of the womb is his reward. As arrows are in the hand of a mighty man; so are children of the youth. Happy is the man that hath his quiver full of them: they shall not be ashamed, but they shall speak with the enemies in the gate."

**Application:** Children are a blessing from God, entrusted to parents - not property of the state. The state does not grant children; God does.

**3. Honor of Parents**

**Exodus 20:12 (KJV) - The Fifth Commandment**
"Honour thy father and thy mother: that thy days may be long upon the land which the LORD thy God giveth thee."

**Application:** God establishes parental authority as so fundamental that honoring parents is one of the Ten Commandments. The parent-child relationship is sacred.

**Colossians 3:20 (KJV)**
"Children, obey your parents in all things: for this is well pleasing unto the Lord."

**Application:** Children are to obey parents - not government workers. Parents are the primary authority.

**4. Protection of Family from State Interference**

**1 Samuel 8:10-18 - Warning Against Government Overreach**
When Israel demanded a king (government), Samuel warned:
"And he will take your sons... And he will take your daughters... And he will take your fields... And ye shall cry out in that day because of your king which ye shall have chosen you; and the LORD will not hear you in that day."

**Application:** The Bible warns against centralized government power that takes children from parents and interferes with families. This is seen as tyranny.

**5. Family as Foundation of Society**

**Genesis 2:24 (KJV)**
"Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh."

**Application:** God established the family (not government institutions) as the fundamental unit of society from Creation.

**Legal Relevance to CPS Cases:**

**Historical Foundation:**
The Framers of the Constitution were deeply influenced by Biblical principles:
- Blackstone's Commentaries (basis of American law) rooted in Biblical law
- Common law derived from Judeo-Christian tradition
- Founders' understanding of "inalienable rights" came from Biblical worldview
- "Endowed by their Creator" (Declaration of Independence) = God-given rights

**Constitutional Protection:**
First Amendment protects the free exercise of religion, including:
- Right to raise children according to religious beliefs
- Right to provide religious instruction
- Right to religious homeschooling/education
- Protection from state interference in religious upbringing

**Supreme Court Recognition:**

**Pierce v. Society of Sisters (1925)**
While not explicitly citing Bible, Court recognized parental right to direct religious upbringing:
"The fundamental theory of liberty upon which all governments in this Union repose excludes any general power of the State to standardize its children by forcing them to accept instruction from public teachers only. The child is not the mere creature of the State; those who nurture him and direct his destiny have the right, coupled with the high duty, to recognize and prepare him for additional obligations."

**Wisconsin v. Yoder (1972)**
Amish parents' right to religious upbringing of children:
"The history and culture of Western civilization reflect a strong tradition of parental concern for the nurture and upbringing of their children. This primary role of the parents in the upbringing of their children is now established beyond debate as an enduring American tradition."

**Application to CPS Cases:**

**1. Religious Parenting Cannot Be Basis for Removal**

CPS CANNOT remove children because:
- Family attends church regularly
- Parents use Biblical discipline (within legal bounds)
- Family homeschools for religious reasons
- Parents teach religious values
- Family lifestyle reflects religious beliefs

**2. Religious Freedom Defense**

When CPS targets religious families:
- Cite First Amendment Free Exercise Clause
- Reference Biblical commands to parents
- Invoke *Pierce*, *Yoder*, *Troxel* (parental rights cases)
- Argue religious discrimination

**3. Biblical Discipline vs. Abuse**

**Proverbs 13:24 (KJV)**
"He that spareth his rod hateth his son: but he that loveth him chasteneth him betimes."

**Important Distinction:**
- Biblical discipline = correction in love, age-appropriate, not causing injury
- Abuse = excessive force, injury, cruelty
- Religious belief in discipline does NOT permit abuse
- But religious parents have right to reasonable discipline

**4. Homeschooling**

Many Christian families homeschool based on:
- Deuteronomy 6:6-7 (teach children diligently)
- Proverbs 22:6 (train up a child)

CPS cannot target homeschoolers for religious education.

**5. Medical Decisions**

Some families have religious beliefs about:
- Prayer for healing (James 5:15)
- Refusing certain medical treatments
- Vaccinations

Courts balance religious freedom with child welfare, but sincere religious beliefs are protected (with narrow exceptions for life-threatening situations).

**Defense Strategy:**

**When CPS Targets Religious Parenting:**

**1. Assert First Amendment Rights**
"My religious beliefs are protected by the First Amendment. The state cannot interfere with my right to raise my children according to my faith."

**2. Cite Biblical Authority**
"The Bible commands me as a parent to teach and train my children (Deuteronomy 6:6-7, Proverbs 22:6, Ephesians 6:4). These are God-given responsibilities that predate the Constitution."

**3. Reference Historical Foundation**
"The Founders recognized that rights come from God, not government. My parental rights are inalienable - granted by my Creator, not by the state."

**4. Distinguish Religious Practice from Abuse/Neglect**
"My religious beliefs inform my parenting, but I am not abusing or neglecting my children. The state cannot remove my children simply because they disagree with my religious values."

**5. Invoke Supreme Court Precedent**
Cite: *Pierce* (parents direct upbringing), *Yoder* (religious upbringing protected), *Troxel* (parental rights fundamental)

**Key Bible Verses for CPS Defense:**

**Parental Authority:**
- Deuteronomy 6:6-7 - Parents teach children
- Proverbs 22:6 - Parents train children
- Ephesians 6:4 - Parents bring up children
- Colossians 3:21 - Instruction to fathers

**Children as Blessing:**
- Psalm 127:3 - Children are heritage from the Lord
- Psalm 128:3 - Children like olive plants
- Genesis 33:5 - Children whom God graciously gave

**Family Protection:**
- 1 Timothy 5:8 - Provide for family
- Proverbs 31 - Care for household
- 1 Samuel 8 - Warning against government overreach

**Religious Freedom:**
- Acts 5:29 - "We ought to obey God rather than men"
- Daniel 3 - Refuse unjust government commands
- Exodus 1:17 - Midwives feared God, not Pharaoh

**Conclusion:**

The Bible establishes parental authority as God-ordained, predating all human government. While the state has limited parens patriae authority to protect children from genuine harm, it cannot override:
- First Amendment religious freedom
- God-given parental authority
- Biblical commands to parents
- Historical foundation of family autonomy

**As Acts 5:29 declares: "We ought to obey God rather than men."**

When the state oversteps its authority and violates God-given parental rights, parents have both a constitutional right and a Biblical duty to resist.
      `,
      relevance: ['Religious freedom', 'Parental authority', 'First Amendment', 'Homeschooling', 'Religious discrimination'],
      tags: ['Bible', 'religious freedom', '1st Amendment', 'parental rights', 'Scripture', 'family']
    },
    {
      id: 'first-amendment-religion-cps',
      title: 'First Amendment Religious Freedom in CPS Cases',
      category: 'religious',
      subcategory: 'Constitutional Rights',
      description: 'Free Exercise Clause protections against CPS targeting religious families, including case law on religious parenting, homeschooling, and medical decisions.',
      content: `
**First Amendment Religious Freedom:**

**Text of First Amendment (Religion Clauses):**
"Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof..."

**Two Clauses:**
1. **Establishment Clause** - Government cannot establish religion
2. **Free Exercise Clause** - Government cannot prohibit religious practice

**Application to CPS Cases:**

**Free Exercise Protection:**

The Free Exercise Clause protects:
- Religious beliefs
- Religious practices
- Religious upbringing of children
- Religious education
- Religious lifestyle choices

**CPS and Religious Freedom:**

**What CPS CANNOT Do:**

1. **Target Families Based on Religion**
   ❌ Remove children because family is "too religious"
   ❌ Punish church attendance or religious devotion
   ❌ Discriminate based on religious beliefs
   ❌ Force secular parenting standards on religious families

2. **Interfere with Religious Upbringing**
   ❌ Prohibit religious instruction
   ❌ Ban prayer or Bible reading in home
   ❌ Force children to attend public school (vs. religious school/homeschool)
   ❌ Restrict religious activities as "condition" of reunification

3. **Impose Secular Values**
   ❌ Require participation in programs that violate beliefs
   ❌ Mandate counseling that contradicts faith
   ❌ Force acceptance of values contrary to religion
   ❌ Punish traditional/Biblical family structures

**Key Supreme Court Cases:**

**1. Pierce v. Society of Sisters (1925)**
**Facts:** Oregon law required all children to attend public schools. Catholic schools challenged.
**Holding:** Parents have right to direct education and upbringing of children, including religious education.
**Quote:** "The child is not the mere creature of the State; those who nurture him and direct his destiny have the right, coupled with the high duty, to recognize and prepare him for additional obligations."

**Application to CPS:** State cannot force secular education or prohibit religious instruction.

**2. Wisconsin v. Yoder (1972)**
**Facts:** Amish parents prosecuted for refusing to send children to high school past 8th grade (religious belief in practical education).
**Holding:** Free Exercise Clause protects Amish parents' right to direct religious upbringing.
**Quote:** "The history and culture of Western civilization reflect a strong tradition of parental concern for the nurture and upbringing of their children. This primary role of the parents in the upbringing of their children is now established beyond debate as an enduring American tradition."

**Test Established:**
Government burden on religion must be:
1. Essential to compelling state interest
2. Least restrictive means

**Application to CPS:** CPS cannot remove children from religious home unless compelling interest (actual harm) and no less restrictive alternative.

**3. Employment Division v. Smith (1990)**
**Facts:** Native Americans fired for religious peyote use challenged.
**Holding:** Narrowed religious exemptions for "neutral laws of general applicability."
**Impact:** Made it harder to challenge laws on religious grounds.

**But:** Did not eliminate protection for parental rights. *Yoder* remains good law because parental rights + religious freedom = heightened protection.

**4. Church of Lukumi Babalu Aye v. Hialeah (1993)**
**Facts:** City banned animal sacrifice targeting Santeria religion.
**Holding:** Laws targeting specific religions violate Free Exercise.
**Test:** If law is not neutral or not generally applicable, strict scrutiny applies.

**Application to CPS:** If CPS targets religious families differently than non-religious, strict scrutiny applies.

**5. Fulton v. City of Philadelphia (2021)**
**Facts:** City refused to contract with Catholic foster agency that wouldn't certify same-sex couples.
**Holding:** City's policy not generally applicable; violated Free Exercise.

**Application to CPS:** Cannot discriminate against religious foster/adoptive parents for religious beliefs.

**Religious Freedom Restoration Act (RFRA):**

**Federal RFRA (1993):**
"Government shall not substantially burden a person's exercise of religion even if the burden results from a rule of general applicability" unless:
1. Government demonstrates compelling interest
2. Uses least restrictive means

**State RFRAs:**
Many states have their own RFRAs with similar protections.

**Application to CPS:**
If CPS action substantially burdens religious exercise, government must show:
- Compelling interest (protecting child from actual harm)
- Least restrictive means (removal vs. services)

**Common CPS Religious Freedom Issues:**

**1. Homeschooling**

**Religious Right:**
Many families homeschool based on:
- Deuteronomy 6:6-7 (teach children)
- Desire for Christian education
- Protection from secular influences

**CPS Cannot:**
- Remove children for homeschooling
- Require public school attendance
- Force secular curriculum
- Treat homeschooling as "educational neglect" without evidence

**Protection:**
*Pierce v. Society of Sisters* + *Yoder* + state homeschool laws

**2. Medical Decisions**

**Religious Beliefs:**
Some families have sincere beliefs about:
- Faith healing / prayer
- Refusing blood transfusions (Jehovah's Witnesses)
- Vaccine exemptions
- Alternative medicine

**Balance:**
Courts balance religious freedom with child welfare:
- **Non-emergency:** Parents' religious choice respected
- **Life-threatening emergency:** State may intervene to save life
- **Negligence standard:** Must show serious harm, not mere disagreement

**Cases:**
- *Prince v. Massachusetts* (1944): Religious freedom not absolute when child's health at stake
- But: State must show actual danger, not speculative harm

**3. Discipline**

**Religious Belief:**
Some Christians believe in Biblical discipline:
- Proverbs 13:24 ("spare the rod")
- Proverbs 22:15
- Hebrews 12:5-6

**Important Distinction:**
- **Biblical discipline:** Reasonable, controlled correction without injury
- **Abuse:** Excessive force, injury, cruelty

**Protection:**
- Religious belief in discipline protected
- But: Does not permit abuse
- Physical discipline that leaves marks/injuries = abuse (regardless of religious belief)
- Reasonable spanking without injury = protected in most states

**4. Family Structure**

**Religious Beliefs:**
- Traditional gender roles
- Large families
- Modesty standards
- Lifestyle choices based on faith

**CPS Cannot:**
- Remove children because family is "too traditional"
- Punish large families as "neglect" (without other evidence)
- Force feminist/secular values on religious families
- Discriminate against biblical family structure

**5. Foster/Adoption**

**Recent Issue:**
Some states trying to force religious agencies to:
- Place children with same-sex couples
- Violate religious beliefs in placements

**Protection:**
*Fulton v. Philadelphia* protects religious agencies from discrimination

**Defense Strategy:**

**When CPS Targets Religious Parenting:**

**1. Assert First Amendment Rights**
"I am exercising my First Amendment right to the free exercise of religion. The state's action substantially burdens my religious practice."

**2. Invoke State/Federal RFRA**
"Under [State] Religious Freedom Restoration Act, the state must demonstrate a compelling interest and use the least restrictive means. Neither requirement is met here."

**3. Cite Yoder and Pierce**
"As the Supreme Court held in *Wisconsin v. Yoder* and *Pierce v. Society of Sisters*, I have a constitutional right to direct the religious upbringing of my children."

**4. Demand Compelling Interest**
"The state must show a compelling interest - actual harm to my child - not mere disagreement with my religious values or lifestyle."

**5. Argue Least Restrictive Means**
"Even if the state had a compelling interest (which it does not), removal is not the least restrictive means. Services in the home would be less intrusive."

**6. Challenge Selective Enforcement**
"CPS is targeting my family because of our religious beliefs. Under *Church of Lukumi*, laws that are not neutral or generally applicable receive strict scrutiny."

**7. Distinguish Belief from Harm**
"My religious beliefs inform my parenting, but I am not harming my children. The state cannot equate religious parenting with abuse or neglect."

**Evidence of Religious Discrimination:**

**Red Flags:**
- CPS worker expresses hostility to religion
- Case file contains negative comments about faith
- "Too religious" noted as concern
- Church attendance cited as problem
- Religious homeschooling treated as neglect
- Biblical discipline called "abuse" (without injury)
- Traditional values characterized as harmful

**Discovery:**
Request:
- All case notes mentioning religion
- Worker's training on religious freedom
- Policies on religious families
- Statistical data (are religious families targeted more?)

**Accommodations Required:**

If child removed, parent entitled to religious accommodations:
- Visitation at times that don't conflict with religious observances
- Religious instruction for child in foster care
- Placement with family of same faith (when possible)
- Religious services participation
- Dietary restrictions respected (kosher, halal, etc.)

**Constitutional Test for CPS Religious Cases:**

**1. Is Religious Exercise Substantially Burdened?**
- Removal of children based on religious parenting = YES
- Restriction of religious upbringing = YES
- Forced secular programs = YES

**2. Is State Interest Compelling?**
- Protecting child from actual harm = Potentially yes
- Enforcing secular values = NO
- Disagreement with religious beliefs = NO

**3. Is Least Restrictive Means Used?**
- Removal when services would suffice = NO
- Prohibiting religious practice entirely = NO
- Accommodation available = Must use it

**If Any Answer Fails Test → Violation of Free Exercise**

**Remedies:**

**1. Motion to Dismiss**
Based on First Amendment violation

**2. Injunction**
Stop CPS from interfering with religious exercise

**3. Damages**
42 U.S.C. § 1983 civil rights lawsuit for violation of First Amendment

**4. Declaratory Judgment**
Court declaration that CPS violated religious freedom

**Conclusion:**

The First Amendment Free Exercise Clause provides robust protection for religious parenting. While not absolute (state can intervene for genuine child safety), CPS cannot:
- Target families for religious beliefs
- Impose secular values
- Restrict religious upbringing
- Discriminate based on faith

**Supreme Court has repeatedly affirmed that parental right to direct religious upbringing is fundamental and entitled to heightened constitutional protection.**

"The child is not the mere creature of the State" - *Pierce v. Society of Sisters*
      `,
      relevance: ['Religious freedom', 'First Amendment', 'Homeschooling', 'Medical decisions', 'Discrimination'],
      tags: ['1st Amendment', 'religious freedom', 'free exercise', 'Pierce', 'Yoder', 'discrimination']
    },
    {
      id: 'bible-verses-parental-rights',
      title: 'Key Bible Verses on Family, Parental Authority & Government Limits',
      category: 'religious',
      subcategory: 'Scripture Reference',
      description: 'Comprehensive collection of Bible verses establishing parental authority, family sanctity, and limits on government power - organized by topic for quick reference.',
      content: `
**Scripture Guide for Parental Rights & CPS Defense**

**All verses King James Version (KJV)**

---

## **I. PARENTAL AUTHORITY & DUTY**

### **Parents Commanded to Teach & Train Children**

**Deuteronomy 6:6-7**
"And these words, which I command thee this day, shall be in thine heart: And thou shalt teach them diligently unto thy children, and shalt talk of them when thou sittest in thine house, and when thou walkest by the way, and when thou liest down, and when thou risest up."

**Proverbs 22:6**
"Train up a child in the way he should go: and when he is old, he will not depart from it."

**Ephesians 6:4**
"And, ye fathers, provoke not your children to wrath: but bring them up in the nurture and admonition of the Lord."

**Proverbs 1:8**
"My son, hear the instruction of thy father, and forsake not the law of thy mother:"

**2 Timothy 1:5**
"When I call to remembrance the unfeigned faith that is in thee, which dwelt first in thy grandmother Lois, and thy mother Eunice; and I am persuaded that in thee also."
*(Example: Timothy's faith from mother & grandmother's teaching)*

**2 Timothy 3:15**
"And that from a child thou hast known the holy scriptures, which are able to make thee wise unto salvation through faith which is in Christ Jesus."
*(Parents taught Scripture from childhood)*

### **Parental Discipline & Correction**

**Proverbs 13:24**
"He that spareth his rod hateth his son: but he that loveth him chasteneth him betimes."

**Proverbs 19:18**
"Chasten thy son while there is hope, and let not thy soul spare for his crying."

**Proverbs 22:15**
"Foolishness is bound in the heart of a child; but the rod of correction shall drive it far from him."

**Proverbs 23:13-14**
"Withhold not correction from the child: for if thou beatest him with the rod, he shall not die. Thou shalt beat him with the rod, and shalt deliver his soul from hell."

**Proverbs 29:15**
"The rod and reproof give wisdom: but a child left to himself bringeth his mother to shame."

**Proverbs 29:17**
"Correct thy son, and he shall give thee rest; yea, he shall give delight unto thy soul."

**Hebrews 12:5-7**
"And ye have forgotten the exhortation which speaketh unto you as unto children, My son, despise not thou the chastening of the Lord, nor faint when thou art rebuked of him: For whom the Lord loveth he chasteneth... If ye endure chastening, God dealeth with you as with sons..."

---

## **II. CHILDREN AS BLESSING & HERITAGE**

**Psalm 127:3-5**
"Lo, children are an heritage of the LORD: and the fruit of the womb is his reward. As arrows are in the hand of a mighty man; so are children of the youth. Happy is the man that hath his quiver full of them: they shall not be ashamed, but they shall speak with the enemies in the gate."

**Psalm 128:3-4**
"Thy wife shall be as a fruitful vine by the sides of thine house: thy children like olive plants round about thy table. Behold, that thus shall the man be blessed that feareth the LORD."

**Genesis 33:5**
"And he lifted up his eyes, and saw the women and the children; and said, Who are those with thee? And he said, The children which God hath graciously given thy servant."

**Mark 10:14**
"But when Jesus saw it, he was much displeased, and said unto them, Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God."

**Psalm 113:9**
"He maketh the barren woman to keep house, and to be a joyful mother of children. Praise ye the LORD."

---

## **III. HONOR OF PARENTS**

**Exodus 20:12 (Fifth Commandment)**
"Honour thy father and thy mother: that thy days may be long upon the land which the LORD thy God giveth thee."

**Ephesians 6:1-3**
"Children, obey your parents in the Lord: for this is right. Honour thy father and mother; which is the first commandment with promise; That it may be well with thee, and thou mayest live long on the earth."

**Colossians 3:20**
"Children, obey your parents in all things: for this is well pleasing unto the Lord."

**Proverbs 1:8-9**
"My son, hear the instruction of thy father, and forsake not the law of thy mother: For they shall be an ornament of grace unto thy head, and chains about thy neck."

**Proverbs 6:20**
"My son, keep thy father's commandment, and forsake not the law of thy mother:"

**Proverbs 23:22**
"Hearken unto thy father that begat thee, and despise not thy mother when she is old."

**Leviticus 19:3**
"Ye shall fear every man his mother, and his father, and keep my sabbaths: I am the LORD your God."

---

## **IV. FAMILY AS FOUNDATION**

**Genesis 2:24**
"Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh."

**1 Timothy 5:8**
"But if any provide not for his own, and specially for those of his own house, he hath denied the faith, and is worse than an infidel."

**Joshua 24:15**
"And if it seem evil unto you to serve the LORD, choose you this day whom ye will serve... but as for me and my house, we will serve the LORD."

**Titus 2:4-5**
"That they may teach the young women to be sober, to love their husbands, to love their children, To be discreet, chaste, keepers at home, good, obedient to their own husbands, that the word of God be not blasphemed."

**1 Timothy 3:4-5**
"One that ruleth well his own house, having his children in subjection with all gravity; (For if a man know not how to rule his own house, how shall he take care of the church of God?)"

---

## **V. GOVERNMENT LIMITS & WARNINGS**

### **Obey God Rather Than Men**

**Acts 5:29**
"Then Peter and the other apostles answered and said, We ought to obey God rather than men."
*(When government commands violate God's law, obey God)*

**Acts 4:19**
"But Peter and John answered and said unto them, Whether it be right in the sight of God to hearken unto you more than unto God, judge ye."

### **Warnings Against Government Overreach**

**1 Samuel 8:10-18 (Warning Against Kings/Government)**
"And Samuel told all the words of the LORD unto the people that asked of him a king. And he said, This will be the manner of the king that shall reign over you: He will take your sons... And he will take your daughters... And he will take your fields, and your vineyards... And he will take your servants... And he will take your sheep: and ye shall be his servants. And ye shall cry out in that day because of your king which ye shall have chosen you; and the LORD will not hear you in that day."

**Application:** Biblical warning against centralized government power that takes children and interferes with families.

### **Resistance to Unjust Laws**

**Exodus 1:15-21 (Hebrew Midwives Defy Pharaoh)**
"And the king of Egypt spake to the Hebrew midwives... And he said, When ye do the office of a midwife to the Hebrew women... if it be a son, then ye shall kill him... But the midwives feared God, and did not as the king of Egypt commanded them, but saved the men children alive... Therefore God dealt well with the midwives..."

**Application:** When government commands evil (killing children), righteous resistance is blessed by God.

**Daniel 3:16-18 (Shadrach, Meshach, Abednego Refuse King's Command)**
"Shadrach, Meshach, and Abednego, answered and said to the king, O Nebuchadnezzar, we are not careful to answer thee in this matter. If it be so, our God whom we serve is able to deliver us from the burning fiery furnace, and he will deliver us out of thine hand, O king. But if not, be it known unto thee, O king, that we will not serve thy gods, nor worship the golden image which thou hast set up."

**Application:** Faithful believers refuse unjust government commands even at risk of punishment.

**Daniel 6:10 (Daniel Prays Despite King's Decree)**
"Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his God, as he did aforetime."

**Application:** Daniel continued religious practice despite government prohibition.

---

## **VI. PROTECTION & PROVISION FOR FAMILY**

**Proverbs 31:27-28**
"She looketh well to the ways of her household, and eateth not the bread of idleness. Her children arise up, and call her blessed; her husband also, and he praiseth her."

**Deuteronomy 11:18-19**
"Therefore shall ye lay up these my words in your heart and in your soul... And ye shall teach them your children, speaking of them when thou sittest in thine house, and when thou walkest by the way, when thou liest down, and when thou risest up."

**Proverbs 14:26**
"In the fear of the LORD is strong confidence: and his children shall have a place of refuge."

**Psalm 37:25**
"I have been young, and now am old; yet have I not seen the righteous forsaken, nor his seed begging bread."

---

## **VII. GOD'S VIEW OF CHILDREN**

**Matthew 18:3-6**
"And said, Verily I say unto you, Except ye be converted, and become as little children, ye shall not enter into the kingdom of heaven. Whosoever therefore shall humble himself as this little child, the same is greatest in the kingdom of heaven. And whoso shall receive one such little child in my name receiveth me. But whoso shall offend one of these little ones which believe in me, it were better for him that a millstone were hanged about his neck, and that he were drowned in the depth of the sea."

**Application:** God values children highly and warns severely against harming them. This applies to wrongful removal by CPS.

**Matthew 19:14**
"But Jesus said, Suffer little children, and forbid them not, to come unto me: for of such is the kingdom of heaven."

**Psalm 139:13-16**
"For thou hast possessed my reins: thou hast covered me in my mother's womb. I will praise thee; for I am fearfully and wonderfully made... My substance was not hid from thee, when I was made in secret... Thine eyes did see my substance, yet being unperfect; and in thy book all my members were written..."

---

## **VIII. JUSTICE & RIGHTEOUSNESS**

**Proverbs 31:8-9**
"Open thy mouth for the dumb in the cause of all such as are appointed to destruction. Open thy mouth, judge righteously, and plead the cause of the poor and needy."

**Isaiah 1:17**
"Learn to do well; seek judgment, relieve the oppressed, judge the fatherless, plead for the widow."

**Psalm 82:3-4**
"Defend the poor and fatherless: do justice to the afflicted and needy. Deliver the poor and needy: rid them out of the hand of the wicked."

**Micah 6:8**
"He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?"

**Deuteronomy 16:19-20**
"Thou shalt not wrest judgment; thou shalt not respect persons, neither take a gift: for a gift doth blind the eyes of the wise, and pervert the words of the righteous. That which is altogether just shalt thou follow..."

---

## **APPLICATION TO CPS DEFENSE**

**Use These Scriptures To:**

**1. Establish Parental Authority**
- Cite Deuteronomy 6:6-7, Ephesians 6:4, Proverbs 22:6
- "God has commanded me to teach and train my children. This is not the state's role."

**2. Assert Religious Freedom**
- Cite Acts 5:29, Acts 4:19
- "I must obey God rather than men when government oversteps its authority."

**3. Challenge Government Overreach**
- Cite 1 Samuel 8:10-18
- "The Bible warns against government taking children from families. This is tyranny."

**4. Defend Religious Parenting**
- Cite Proverbs 13:24, 22:6, Ephesians 6:4
- "My Biblical approach to parenting is protected by the First Amendment."

**5. Argue Children Are Blessing, Not State Property**
- Cite Psalm 127:3, Genesis 33:5
- "My children are a heritage from the Lord, entrusted to me - not property of the state."

**6. Demand Justice**
- Cite Proverbs 31:8-9, Micah 6:8, Deuteronomy 16:19-20
- "Scripture demands justice. CPS's actions are unjust and must be rectified."

**7. Point to Biblical Examples of Righteous Resistance**
- Cite Exodus 1:15-21 (midwives), Daniel 3 (fiery furnace), Daniel 6 (lions' den)
- "When government commands violate God's law, the faithful resist - and are vindicated."

---

## **CONCLUSION**

The Bible provides a comprehensive framework for:
- ✅ Parental authority (ordained by God)
- ✅ Parental duties (teach, train, discipline)
- ✅ Children as blessing (heritage from God)
- ✅ Family sanctity (foundation of society)
- ✅ Limits on government (cannot override God's commands)
- ✅ Religious freedom (obey God rather than men)
- ✅ Righteous resistance (when government oversteps)
- ✅ Justice requirements (defend the oppressed)

**These Biblical principles:**
1. **Predate the Constitution by thousands of years**
2. **Influenced the Founders' understanding of rights**
3. **Form the moral foundation of parental rights**
4. **Are protected by the First Amendment**
5. **Support resistance to CPS overreach**

**"We ought to obey God rather than men." - Acts 5:29**
      `,
      relevance: ['Religious parenting', 'Biblical authority', 'Scripture reference', 'Parental duties', 'Religious freedom'],
      tags: ['Bible', 'Scripture', 'verses', 'parental authority', 'religious freedom', 'family']
    }
  ];

  // Filter resources based on search and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resource.relevance.some(rel => rel.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (id: string) => {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id);
    } else {
      newBookmarked.add(id);
    }
    setBookmarked(newBookmarked);
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: Library, count: resources.length },
    { id: 'bench-book', label: 'Federal Bench Books', icon: Gavel, count: resources.filter(r => r.category === 'bench-book').length },
    { id: 'maxim', label: 'Maxims of Law', icon: Scroll, count: resources.filter(r => r.category === 'maxim').length },
    { id: 'foundational', label: 'Foundational Documents', icon: BookMarked, count: resources.filter(r => r.category === 'foundational').length },
    { id: 'religious', label: 'Bible & Religious Freedom', icon: BookOpen, count: resources.filter(r => r.category === 'religious').length },
    { id: 'doctrine', label: 'Legal Doctrines', icon: Scale, count: resources.filter(r => r.category === 'doctrine').length }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'bench-book': 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
      'maxim': 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
      'foundational': 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300',
      'religious': 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      'doctrine': 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="modern-card border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Legal Resources Library</h2>
              <p className="text-blue-100 text-sm">Federal Bench Books, Maxims of Law, Federalist Papers, Constitution, Magna Carta, The Bible & Legal Doctrines</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search resources by topic, tag, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.label}
                    <Badge variant="secondary" className="ml-2">{cat.count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <Card className="modern-card p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No resources found matching your search.</p>
          </Card>
        ) : (
          filteredResources.map(resource => (
            <Card key={resource.id} className="modern-card border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(resource.category)}>
                        {resource.category === 'bench-book' && 'Federal Bench Book'}
                        {resource.category === 'maxim' && 'Maxim of Law'}
                        {resource.category === 'foundational' && 'Foundational Document'}
                        {resource.category === 'religious' && 'Bible & Religious Freedom'}
                        {resource.category === 'doctrine' && 'Legal Doctrine'}
                      </Badge>
                      {resource.subcategory && (
                        <Badge variant="outline">{resource.subcategory}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <CardDescription className="mt-2">{resource.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(resource.id)}
                    className="shrink-0"
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarked.has(resource.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {resource.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                {/* Relevance */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Relevant For:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.relevance.map(rel => (
                      <Badge key={rel} variant="outline" className="text-xs">
                        {rel}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content (Expandable) */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedResource(expandedResource === resource.id ? null : resource.id)}
                    className="w-full justify-between mb-2"
                  >
                    <span>
                      {expandedResource === resource.id ? 'Hide Full Content' : 'View Full Content & Citations'}
                    </span>
                    {expandedResource === resource.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {expandedResource === resource.id && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4 mt-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap">{resource.content}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Content
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                        {resource.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Source
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <Card className="modern-card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{resources.filter(r => r.category === 'bench-book').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bench Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{resources.filter(r => r.category === 'maxim').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Maxims</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{resources.filter(r => r.category === 'foundational').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Foundational Docs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">{resources.filter(r => r.category === 'religious').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bible & Religious</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{resources.filter(r => r.category === 'doctrine').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doctrines</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="modern-card border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            How to Use These Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                For Your Defense
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                <li>• Cite in motions and pleadings</li>
                <li>• Reference in court arguments</li>
                <li>• Support constitutional challenges</li>
                <li>• Establish historical precedent</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                For Education
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                <li>• Understand your rights deeply</li>
                <li>• Learn legal principles</li>
                <li>• Research case strategies</li>
                <li>• Share with your attorney</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
