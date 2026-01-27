import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Scale, ExternalLink, Search, BookOpen, FileText, Building,
  ChevronDown, ChevronRight, MapPin, Phone, Mail, Globe,
  Gavel, Users, Shield, AlertCircle, Info
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface LegalResource {
  id: string;
  title: string;
  category: string;
  description: string;
  url?: string;
  content?: string;
  tags?: string[];
}

export function MississippiLegalResources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Mississippi State Bar Legal Resources
  const resources: LegalResource[] = [
    {
      id: 'ms-courts-overview',
      title: 'Mississippi Court System Overview',
      category: 'Courts',
      description: 'Understanding Mississippi\'s court hierarchy and jurisdiction',
      content: `
**MISSISSIPPI COURT SYSTEM STRUCTURE:**

**1. MISSISSIPPI SUPREME COURT**
- Highest court in the state
- 9 justices serving 8-year terms
- Three districts (Northern, Central, Southern)
- Jurisdiction: Appeals from lower courts, constitutional questions
- Location: Jackson, Mississippi
- Website: courts.ms.gov

**2. MISSISSIPPI COURT OF APPEALS**
- Intermediate appellate court
- 10 judges serving 8-year terms
- Five districts statewide
- Jurisdiction: Appeals from circuit and county courts
- Hears civil, criminal, and domestic relations appeals

**3. CIRCUIT COURTS (Trial Courts of General Jurisdiction)**
- 22 judicial districts
- Jurisdiction:
  * Criminal felonies
  * Civil cases over $75,000
  * Equity cases
  * Appeals from county, justice, and municipal courts
  * Family law matters including CPS cases

**4. CHANCERY COURTS**
- Equity jurisdiction
- Handle:
  * Adoptions
  * Child custody and support
  * Divorce
  * Guardianships
  * Estate matters
  * Juvenile matters including CPS/dependency cases

**5. COUNTY COURTS**
- Civil jurisdiction up to $200,000
- Misdemeanor criminal jurisdiction
- Eminent domain cases
- Not all counties have county courts

**6. JUSTICE COURTS**
- Limited jurisdiction
- Civil cases up to $3,500
- Misdemeanors with fines up to $1,000
- Preliminary hearings for felonies
- Small claims

**7. MUNICIPAL COURTS**
- City ordinance violations
- Misdemeanors within city limits
- Traffic violations
      `,
      tags: ['courts', 'jurisdiction', 'mississippi', 'system']
    },
    {
      id: 'ms-cps-process',
      title: 'Mississippi CPS/Youth Court Process',
      category: 'CPS Proceedings',
      description: 'How CPS cases work in Mississippi Youth Court',
      content: `
**MISSISSIPPI YOUTH COURT JURISDICTION:**

Mississippi CPS cases are handled in **Chancery Court** under the Youth Court Division.

**TYPES OF CASES:**
1. **Delinquency** - Juvenile criminal cases
2. **Child in Need of Supervision (CHINS)** - Truancy, runaways
3. **Abuse and Neglect** - CPS removals and dependency cases

**CPS CASE PROCESS IN MISSISSIPPI:**

**STEP 1: INVESTIGATION**
- Mississippi Department of Child Protection Services (MDCPS) investigates
- Must have reasonable cause to believe abuse/neglect occurred
- Investigation must be completed within 45 days
- Parent rights: You can refuse entry without warrant or court order

**STEP 2: REMOVAL (If Immediate Danger)**
- Emergency removal by law enforcement or CPS
- Must file petition within 72 hours
- Shelter hearing within 72 hours of removal

**STEP 3: SHELTER HEARING (Emergency Custody Hearing)**
- Within 72 hours of removal
- Court determines if child can be returned or stays in custody
- Parent has right to:
  * Be present
  * Have attorney (appointed if indigent)
  * Present evidence
  * Cross-examine witnesses

**STEP 4: ADJUDICATION HEARING**
- Within 30 days of petition filing
- State must prove abuse/neglect by clear and convincing evidence
- Court decides if child is dependent/neglected
- Parents have right to trial

**STEP 5: DISPOSITION HEARING**
- If abuse/neglect is found
- Court decides placement and services
- Family treatment plan created
- Visitation schedule ordered

**STEP 6: REVIEW HEARINGS**
- Every 6 months minimum
- Court reviews progress on treatment plan
- Can modify custody, visitation, services

**STEP 7: PERMANENCY HEARING**
- Within 12 months of removal
- Court determines permanent plan:
  * Reunification
  * Adoption
  * Guardianship
  * Another planned permanent living arrangement (APPLA)

**STEP 8: TERMINATION OF PARENTAL RIGHTS (if applicable)**
- Usually filed if no progress after 12-18 months
- Must prove by clear and convincing evidence
- Parent has right to jury trial
- Grounds for TPR in Mississippi (Miss. Code § 93-15-119):
  * Abandonment
  * Abuse or neglect
  * Failure to adjust circumstances
  * Mental illness or deficiency
  * Imprisonment
  * Substance abuse

**TIMELINES:**
- **15 of 22 months rule**: State must file TPR if child in care 15 of most recent 22 months
- **Exceptions**: Child with relative, documented compelling reason

**PARENT RIGHTS:**
- Right to attorney (appointed if can't afford)
- Right to notice of all hearings
- Right to be present at hearings
- Right to present evidence
- Right to cross-examine witnesses
- Right to appeal
- Right to visitation (unless court finds harmful)
      `,
      tags: ['cps', 'youth court', 'process', 'mississippi', 'timeline']
    },
    {
      id: 'ms-statutes',
      title: 'Key Mississippi CPS Statutes',
      category: 'Statutes',
      description: 'Important Mississippi laws governing CPS cases',
      content: `
**KEY MISSISSIPPI STATUTES FOR CPS CASES:**

**MISS. CODE ANN. § 43-15-13 - Mississippi Child Protection Act**
- Defines abuse and neglect
- Establishes MDCPS authority
- Mandates reporters

**MISS. CODE ANN. § 43-21-105 - Youth Court Definitions**
- Defines "neglected child"
- Defines "abused child"
- Defines "delinquent child"

**MISS. CODE ANN. § 93-15-103 - Youth Court Jurisdiction**
- Establishes chancery court jurisdiction over youth matters
- Jurisdiction over abuse and neglect cases

**MISS. CODE ANN. § 93-15-105 - Right to Counsel**
- Entitlement to appointed counsel if indigent
- Guardian ad litem appointment

**MISS. CODE ANN. § 93-15-111 - Shelter Hearing**
- 72-hour requirement
- Burden of proof
- What court must find

**MISS. CODE ANN. § 93-15-113 - Adjudication Hearing**
- Timing requirements
- Standard of proof (clear and convincing)
- Rights of parents

**MISS. CODE ANN. § 93-15-119 - Grounds for Termination of Parental Rights**
Critical statute listing all grounds:
(1) Abandonment
(2) Abuse or neglect and unfitness
(3) Failure to adjust circumstances
(4) Mental illness or deficiency
(5) Imprisonment
(6) Substance abuse affecting ability to parent
(7) Involuntary termination of sibling's rights
(8) Murder or manslaughter of another child

**MISS. CODE ANN. § 93-15-121 - Termination Hearing Procedures**
- Right to jury trial
- Clear and convincing evidence standard
- Best interest of child determination

**MISS. CODE ANN. § 43-15-13 - Reporting of Child Abuse**
- Mandatory reporters list
- Immunity for good faith reports
- Penalties for failure to report

**MISS. CODE ANN. § 43-21-605 - Emergency Custody**
- When law enforcement can take emergency custody
- Requirements for removal

**MISS. CODE ANN. § 93-15-107 - Case Plans**
- Requirements for family treatment plans
- Parent participation
- Services to be provided

**IMPORTANT TIMEFRAMES:**
- 72 hours: Shelter hearing after removal
- 30 days: Adjudication hearing after petition
- 6 months: Review hearings
- 12 months: Permanency hearing
- 15 of 22 months: TPR filing deadline (ASFA)
      `,
      tags: ['statutes', 'laws', 'mississippi', 'code', 'cps']
    },
    {
      id: 'ms-parental-rights',
      title: 'Mississippi Parental Rights in CPS Cases',
      category: 'Rights',
      description: 'Your constitutional and statutory rights as a parent',
      content: `
**YOUR RIGHTS AS A PARENT IN MISSISSIPPI CPS CASES:**

**CONSTITUTIONAL RIGHTS:**

**1. FOURTEENTH AMENDMENT - FUNDAMENTAL RIGHT TO PARENT**
- Right to care, custody, and control of your children
- Cannot be terminated without due process
- State must prove unfitness by clear and convincing evidence

**2. FOURTH AMENDMENT - PROTECTION FROM UNREASONABLE SEARCHES**
- CPS cannot enter your home without:
  * Your consent
  * A warrant
  * Exigent circumstances (immediate danger)
- You have the right to refuse entry
- You have the right to refuse to answer questions

**3. FIFTH AMENDMENT - RIGHT AGAINST SELF-INCRIMINATION**
- You do NOT have to talk to CPS
- Anything you say CAN and WILL be used against you
- You have the right to remain silent

**MISSISSIPPI STATUTORY RIGHTS:**

**RIGHT TO NOTICE** (Miss. Code § 93-15-105)
- Written notice of all hearings
- Notice of allegations against you
- Notice of right to attorney
- Notice of possible consequences

**RIGHT TO COUNSEL** (Miss. Code § 93-15-105)
- Right to hire your own attorney
- Right to appointed counsel if indigent
- Attorney must be provided at shelter hearing

**RIGHT TO BE PRESENT** (Miss. Code § 93-15-109)
- Right to attend all hearings
- Right to hear all evidence
- Court can exclude only for good cause

**RIGHT TO PRESENT EVIDENCE** (Miss. Code § 93-15-113)
- Call witnesses on your behalf
- Submit documents and exhibits
- Testify in your own defense
- Challenge state's evidence

**RIGHT TO CROSS-EXAMINE** (Miss. Code § 93-15-113)
- Question CPS caseworker
- Question state witnesses
- Challenge their testimony
- Expose lies and inconsistencies

**RIGHT TO VISITATION** (Miss. Code § 93-15-107)
- Court must order visitation unless harmful to child
- Reasonable visitation schedule
- Can request modification if insufficient

**RIGHT TO SERVICES** (Miss. Code § 93-15-107)
- State must provide reasonable reunification services
- Services must be in case plan
- State must make reasonable efforts to reunify

**RIGHT TO APPEAL** (Miss. Code § 93-15-125)
- Appeal adjudication of abuse/neglect
- Appeal termination of parental rights
- Appeal any final order
- 30 days to file notice of appeal

**RIGHT TO JURY TRIAL** (Miss. Code § 93-15-121)
- In termination of parental rights cases
- Must request in writing
- 12-person jury

**RIGHT TO REUNIFICATION**
- Presumption is for reunification
- State must make reasonable efforts
- Termination is last resort

**WHAT CPS CANNOT DO:**

❌ Enter your home without permission, warrant, or emergency
❌ Take your child without court order (except emergency)
❌ Force you to sign anything
❌ Force you to take a drug test (but refusal can be used against you)
❌ Force you to do services not in court order
❌ Deny court-ordered visitation
❌ Lie to you or threaten you
❌ Discriminate based on poverty alone
❌ Remove child based on anonymous tip alone

**WHAT YOU SHOULD DO:**

✅ Document EVERYTHING
✅ Get an attorney immediately
✅ Attend all hearings
✅ Complete all services
✅ Attend all visits
✅ Keep visit logs
✅ Keep communication records
✅ Gather character witnesses
✅ Get housing/employment stable
✅ Pass drug tests
✅ Follow court orders
      `,
      tags: ['rights', 'parental rights', 'constitutional', 'mississippi']
    },
    {
      id: 'ms-court-locations',
      title: 'Mississippi Chancery Court Locations',
      category: 'Courts',
      description: 'Find your local chancery court',
      content: `
**MISSISSIPPI CHANCERY COURT DISTRICTS:**

Mississippi has 20 Chancery Court Districts. CPS cases are heard in the Chancery Court in your county.

**DISTRICT 1 - DeSoto County**
- Counties: DeSoto
- Location: Hernando

**DISTRICT 2 - Panola, Tate, Tunica**
- Counties: Panola, Tate, Tunica
- Locations: Batesville, Senatobia, Tunica

**DISTRICT 3 - Alcorn, Tippah, Tishomingo**
- Counties: Alcorn, Tippah, Tishomingo
- Locations: Corinth, Ripley, Iuka

**DISTRICT 4 - Lee, Pontotoc, Union**
- Counties: Lee, Pontotoc, Union
- Locations: Tupelo, Pontotoc, New Albany

**DISTRICT 5 - Benton, Lafayette, Marshall**
- Counties: Benton, Lafayette, Marshall
- Locations: Ashland, Oxford, Holly Springs

**DISTRICT 6 - Coahoma, Quitman**
- Counties: Coahoma, Quitman
- Locations: Clarksdale, Marks

**DISTRICT 7 - Bolivar**
- Counties: Bolivar
- Locations: Rosedale, Cleveland

**DISTRICT 8 - Tallahatchie, Yalobusha**
- Counties: Tallahatchie, Yalobusha
- Locations: Charleston, Sumner, Water Valley, Coffeeville

**DISTRICT 9 - Grenada, Montgomery**
- Counties: Grenada, Montgomery
- Locations: Grenada, Winona

**DISTRICT 10 - Chickasaw, Clay, Lowndes, Monroe, Oktibbeha**
- Counties: Chickasaw, Clay, Lowndes, Monroe, Oktibbeha
- Locations: Houston, West Point, Columbus, Aberdeen, Starkville

**DISTRICT 11 - Attala, Carroll, Choctaw, Webster, Winston**
- Counties: Attala, Carroll, Choctaw, Webster, Winston
- Locations: Kosciusko, Carrollton, Ackerman, Eupora, Louisville

**DISTRICT 12 - Hinds County**
- Counties: Hinds
- Location: Jackson

**DISTRICT 13 - Leake, Neshoba, Scott**
- Counties: Leake, Neshoba, Scott
- Locations: Carthage, Philadelphia, Forest

**DISTRICT 14 - Rankin County**
- Counties: Rankin
- Location: Brandon

**DISTRICT 15 - Adams, Franklin, Wilkinson**
- Counties: Adams, Franklin, Wilkinson
- Locations: Natchez, Meadville, Woodville

**DISTRICT 16 - Madison County**
- Counties: Madison
- Location: Canton

**DISTRICT 17 - Claiborne, Copiah, Jefferson**
- Counties: Claiborne, Copiah, Jefferson
- Locations: Port Gibson, Hazlehurst, Fayette

**DISTRICT 18 - Covington, Lawrence, Jefferson Davis**
- Counties: Covington, Lawrence, Jefferson Davis
- Locations: Collins, Monticello, Prentiss

**DISTRICT 19 - Pike, Walthall, Amite, Marion, Lamar**
- Counties: Pike, Walthall, Amite, Marion, Lamar
- Locations: Magnolia, Tylertown, Liberty, Columbia, Purvis

**DISTRICT 20 - Harrison, Hancock, Stone**
- Counties: Harrison, Hancock, Stone
- Locations: Gulfport, Bay St. Louis, Wiggins

**TO FIND YOUR COURT:**
1. Identify your county
2. Find the district number above
3. Visit: courts.ms.gov
4. Search for "[Your County] Chancery Court"
      `,
      tags: ['courts', 'locations', 'chancery', 'mississippi', 'districts']
    },
    {
      id: 'ms-appeals',
      title: 'How to Appeal in Mississippi',
      category: 'Appeals',
      description: 'Steps to appeal a CPS court decision',
      content: `
**APPEALING A MISSISSIPPI YOUTH COURT DECISION:**

**WHAT CAN BE APPEALED:**
✅ Adjudication of abuse/neglect
✅ Termination of parental rights
✅ Denial of reunification
✅ Visitation restrictions
✅ Any final order affecting your rights

**DEADLINE TO APPEAL:**
⏰ **30 DAYS** from entry of final order (Miss. R. App. P. 4)
- This deadline is STRICT
- Miss it and you lose your right to appeal
- File Notice of Appeal immediately

**STEP 1: FILE NOTICE OF APPEAL**
- File in the trial court (Chancery Court)
- Must be within 30 days of final order
- Form available from court clerk
- Filing fee required (or motion to proceed in forma pauperis)

**STEP 2: APPEAL BOND (If Required)**
- May need to post bond
- Can request waiver if indigent
- Not required in TPR appeals

**STEP 3: ORDER TRANSCRIPT**
- Request court reporter to prepare transcript
- Must order within 14 days of filing notice of appeal
- Filing fee or IFP motion
- Critical for appeal - need exact record

**STEP 4: DESIGNATE RECORD**
- List all documents from trial court to include
- File with clerk within 14 days
- Include all relevant pleadings, orders, evidence

**STEP 5: RECORD PREPARATION**
- Court clerk prepares record
- Includes transcript and designated documents
- Transmitted to Court of Appeals

**STEP 6: BRIEF FILING**
- Appellant's Brief due 35 days after record filed
- Must follow Miss. R. App. P. 28
- Must cite legal authority
- Must reference record

**WHAT TO INCLUDE IN BRIEF:**
1. Statement of issues
2. Statement of facts
3. Summary of argument
4. Argument with legal citations
5. Conclusion
6. Certificate of service

**STEP 7: APPELLEE'S BRIEF**
- State files response brief
- 35 days after appellant's brief

**STEP 8: REPLY BRIEF (Optional)**
- Your response to state's brief
- 14 days after appellee's brief

**STEP 9: ORAL ARGUMENT**
- May be scheduled
- Not always granted
- Chance to argue to judges

**STEP 10: DECISION**
- Court of Appeals issues opinion
- Can affirm, reverse, or remand
- Usually within 6-12 months

**MISSISSIPPI COURT OF APPEALS:**
- 10 judges
- 3-judge panels decide cases
- Located in Jackson
- Website: courts.ms.gov/appellate_courts/coa

**FURTHER APPEAL TO SUPREME COURT:**
- Can petition Supreme Court
- Discretionary review
- Must show legal significance
- Not guaranteed to be heard

**STANDARDS OF REVIEW:**

**Findings of Fact:**
- "Clearly erroneous" standard
- Very deferential to trial court
- Hard to overturn

**Conclusions of Law:**
- "De novo" review
- Court reviews legal issues fresh
- No deference to trial court

**Abuse of Discretion:**
- For discretionary rulings
- Must show trial judge clearly abused discretion

**GROUNDS FOR APPEAL:**

✅ **Insufficient Evidence**
- State didn't meet burden of proof
- No clear and convincing evidence

✅ **Legal Errors**
- Judge applied wrong law
- Violated constitutional rights
- Improper admission of evidence

✅ **Procedural Violations**
- Denied right to attorney
- Denied right to present evidence
- No notice of hearing

✅ **Abuse of Discretion**
- Unreasonable ruling
- Arbitrary decision

**GET A LAWYER:**
Appeals are highly technical. You NEED an attorney experienced in appellate practice.

**COST:**
- Filing fees: ~$125-250
- Transcript costs: $500-2,000+
- Attorney fees: $5,000-15,000+
- Can request to proceed IFP (in forma pauperis - as a poor person)

**EFFECT OF APPEAL:**
- Does NOT automatically stop TPR
- Does NOT automatically restore custody
- Can request stay of order pending appeal
- Child usually remains in current placement during appeal
      `,
      tags: ['appeals', 'court of appeals', 'mississippi', 'process']
    },
    {
      id: 'ms-legal-aid',
      title: 'Free Legal Help in Mississippi',
      category: 'Resources',
      description: 'Organizations that provide free legal assistance',
      content: `
**FREE & LOW-COST LEGAL ASSISTANCE IN MISSISSIPPI:**

**1. MISSISSIPPI CENTER FOR LEGAL SERVICES**
- Provides free legal help to low-income Mississippians
- Handles family law including CPS cases
- Website: mclslaw.org
- Phone: 1-800-773-1818

**OFFICES:**
- Jackson: (601) 948-6752
- Biloxi: (228) 374-4160
- Greenville: (662) 335-2716
- Hattiesburg: (601) 545-2950
- Oxford: (662) 234-8731

**2. MISSISSIPPI VOLUNTEER LAWYERS PROJECT**
- Pro bono legal services
- Family law assistance
- Website: msvlp.org
- Phone: (601) 960-9577

**3. SOUTHEAST MISSISSIPPI LEGAL SERVICES**
- Free legal aid for qualifying individuals
- Website: smls.org
- Phone: 1-800-898-9245

**OFFICES:**
- Gulfport: (228) 864-7908
- Hattiesburg: (601) 545-2950
- Columbia: (601) 736-6764
- Laurel: (601) 428-0571

**4. NORTH MISSISSIPPI RURAL LEGAL SERVICES**
- Serves northern Mississippi counties
- Website: nmrls.com
- Phone: 1-800-898-8101

**OFFICES:**
- Tupelo: (662) 842-7106
- Oxford: (662) 234-8731
- Greenwood: (662) 453-6565
- Clarksdale: (662) 624-6666

**5. MISSISSIPPI BAR LAWYER REFERRAL SERVICE**
- Connects you with attorneys
- Initial consultation often reduced fee
- Phone: (601) 948-4471
- Website: msbar.org

**6. MISSISSIPPI ACCESS TO JUSTICE COMMISSION**
- Coordinates legal aid resources
- Website: courts.ms.gov/atj

**7. MISSISSIPPI SUPREME COURT SELF-HELP CENTER**
- Forms and information
- Limited scope representation info
- Website: courts.ms.gov/selfhelp

**8. LAW SCHOOL CLINICS:**

**University of Mississippi School of Law**
- Family Law Clinic
- Phone: (662) 915-6910
- Oxford, MS

**Mississippi College School of Law**
- Civil Legal Clinic
- Phone: (601) 925-7100
- Jackson, MS

**9. CHILDREN'S DEFENSE FUND - MISSISSIPPI**
- Child advocacy
- Website: childrensdefense.org
- Phone: (601) 355-6245

**10. SOUTHERN POVERTY LAW CENTER**
- Civil rights cases
- Children's rights
- Website: splcenter.org

**ELIGIBILITY:**
Most legal aid requires income at or below 125% of federal poverty level:
- Individual: ~$15,000/year
- Family of 4: ~$31,000/year

**WHAT TO BRING:**
📋 Proof of income
📋 Photo ID
📋 Social Security card
📋 All court documents
📋 CPS records
📋 Any relevant documents

**MISSISSIPPI STATE BAR ASSOCIATION:**
- Main: (601) 948-4471
- Website: msbar.org
- Can help find attorney
- File complaints against attorneys
      `,
      tags: ['legal aid', 'free lawyers', 'resources', 'mississippi', 'help']
    },
    {
      id: 'ms-mdcps-contact',
      title: 'Mississippi Department of Child Protection Services',
      category: 'Agencies',
      description: 'Contact information and how to file complaints',
      content: `
**MISSISSIPPI DEPARTMENT OF CHILD PROTECTION SERVICES (MDCPS):**

**MAIN OFFICE:**
Mississippi Department of Child Protection Services
750 North State Street
Jackson, MS 39202
Phone: (601) 359-4991
Website: mdcps.ms.gov

**CHILD ABUSE HOTLINE:**
📞 **1-800-222-8000** (24/7)
- Report suspected abuse/neglect
- Ask questions about active case
- Report violations by caseworker

**REGIONAL OFFICES:**

**REGION 1 - NORTHWEST**
District 1 (DeSoto): (662) 469-4500
District 2 (Tunica, Tate, Panola): (662) 563-6365
District 5 (Marshall, Benton, Lafayette): (662) 234-6565
District 6 (Coahoma, Quitman): (662) 627-2211
District 7 (Bolivar): (662) 843-6815
District 8 (Tallahatchie, Yalobusha): (662) 647-5433

**REGION 2 - NORTHEAST**
District 3 (Alcorn, Tippah, Tishomingo): (662) 286-7747
District 4 (Lee, Pontotoc, Union): (662) 841-9049
District 9 (Grenada, Montgomery): (662) 226-9141
District 10 (Chickasaw, Clay, Lowndes, Monroe, Oktibbeha): (662) 327-7667
District 11 (Attala, Carroll, Choctaw, Webster, Winston): (662) 289-5156

**REGION 3 - METRO**
District 12 (Hinds): (601) 359-4550
District 14 (Rankin): (601) 825-3366
District 16 (Madison): (601) 859-2210

**REGION 4 - CENTRAL**
District 13 (Leake, Neshoba, Scott): (601) 656-5951
District 17 (Claiborne, Copiah, Jefferson): (601) 894-3023

**REGION 5 - SOUTHWEST**
District 15 (Adams, Franklin, Wilkinson): (601) 442-7104
District 18 (Covington, Jefferson Davis, Lawrence): (601) 792-4371
District 19 (Amite, Pike, Walthall, Marion, Lamar): (601) 783-3341

**REGION 6 - COASTAL**
District 20 (Hancock, Harrison, Stone): (228) 832-7552

**HOW TO FILE A COMPLAINT AGAINST MDCPS:**

**1. INTERNAL COMPLAINT:**
- Contact supervisor of caseworker
- Request District Director contact info
- File written complaint with regional office
- Document everything

**2. MDCPS OFFICE OF INSPECTOR GENERAL:**
Mississippi Department of Child Protection Services
Office of Inspector General
750 North State Street
Jackson, MS 39202
Phone: (601) 359-4991
Email: MDCPSOig@mdcps.ms.gov

**3. GOVERNOR'S OFFICE:**
Governor of Mississippi
P.O. Box 139
Jackson, MS 39205
Phone: (601) 359-3150
Website: governorbryant.ms.gov

**4. MISSISSIPPI DEPARTMENT OF HUMAN SERVICES (Oversight):**
MDHS Division of Family and Children's Services
750 North State Street
Jackson, MS 39202
Phone: (601) 359-4500

**5. MISSISSIPPI STATE AUDITOR (Fraud/Waste):**
Office of the State Auditor
P.O. Box 956
Jackson, MS 39205
Phone: (601) 576-2800
Hotline: 1-800-321-1275

**6. MISSISSIPPI LEGISLATURE:**
- Contact your State Representative
- Contact your State Senator
- Find them: legislature.ms.gov

**7. MEDIA:**
- Investigate Mississippi: investigatemississippi.org
- Local news stations
- Document everything first

**WHAT TO INCLUDE IN COMPLAINT:**
📋 Your name and contact info
📋 Child's name and case number
📋 Caseworker name and office
📋 Specific violations with dates
📋 Supporting documentation
📋 Witnesses
📋 What resolution you seek

**DOCUMENT EVERYTHING:**
- Get caseworker's name and supervisor's name
- Get direct phone numbers
- Get case number
- Keep all letters and notices
- Record phone calls (if legal in MS - single party consent state)
- Take notes of all interactions
      `,
      tags: ['mdcps', 'cps', 'complaints', 'contact', 'mississippi', 'agency']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Resources', icon: BookOpen },
    { value: 'Courts', label: 'Court System', icon: Scale },
    { value: 'CPS Proceedings', label: 'CPS Process', icon: Shield },
    { value: 'Statutes', label: 'Laws & Statutes', icon: FileText },
    { value: 'Rights', label: 'Your Rights', icon: AlertCircle },
    { value: 'Appeals', label: 'Appeals Process', icon: Gavel },
    { value: 'Resources', label: 'Legal Aid', icon: Users },
    { value: 'Agencies', label: 'Agencies & Contacts', icon: Building }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mississippi Legal Resources</h1>
            <p className="text-gray-600 mb-4">
              Comprehensive guide to Mississippi's court system, CPS process, statutes, and legal resources
            </p>
            <Alert className="bg-blue-100 border-blue-300">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Source:</strong> Information compiled from Mississippi State Bar, Mississippi Courts, and Mississippi Code. 
                Visit <a href="https://msb.lawinfopedia.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">msb.lawinfopedia.com</a> for official resources.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Mississippi legal resources..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="whitespace-nowrap"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-2 border-blue-200 bg-blue-50">
          <div className="text-2xl font-bold text-blue-700">{resources.length}</div>
          <div className="text-sm text-blue-600">Total Resources</div>
        </Card>
        <Card className="p-4 text-center border-2 border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-700">20</div>
          <div className="text-sm text-green-600">Court Districts</div>
        </Card>
        <Card className="p-4 text-center border-2 border-purple-200 bg-purple-50">
          <div className="text-2xl font-bold text-purple-700">FREE</div>
          <div className="text-sm text-purple-600">Legal Aid Available</div>
        </Card>
        <Card className="p-4 text-center border-2 border-orange-200 bg-orange-50">
          <div className="text-2xl font-bold text-orange-700">24/7</div>
          <div className="text-sm text-orange-600">Abuse Hotline</div>
        </Card>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Resources Found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        ) : (
          filteredResources.map(resource => (
            <Card key={resource.id} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <button
                onClick={() => toggleExpanded(resource.id)}
                className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-blue-600">{resource.category}</Badge>
                    {resource.url && <ExternalLink className="w-4 h-4 text-blue-600" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600">{resource.description}</p>
                  {resource.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resource.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {expandedItems.has(resource.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedItems.has(resource.id) && (
                <div className="px-6 pb-6 border-t">
                  <div className="prose max-w-none mt-4">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border">
                      {resource.content}
                    </div>
                  </div>
                  {resource.url && (
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Official Resource
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <Card className="p-6 bg-yellow-50 border-2 border-yellow-200">
        <Alert className="bg-yellow-100 border-yellow-300">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Legal Disclaimer</AlertTitle>
          <AlertDescription className="text-yellow-800">
            This information is for educational purposes only and does not constitute legal advice. 
            Laws change frequently. Always consult with a licensed Mississippi attorney for advice specific to your case. 
            For official information, visit <a href="https://msb.lawinfopedia.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">msb.lawinfopedia.com</a> or <a href="https://courts.ms.gov" target="_blank" rel="noopener noreferrer" className="underline font-semibold">courts.ms.gov</a>.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Information compiled from Mississippi State Bar, Mississippi Courts, and Mississippi Code<br/>
        The CPS Punisher™ - Copyright © 2024 DARREN GUAY - All Rights Reserved
      </div>
    </div>
  );
}
