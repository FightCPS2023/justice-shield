import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Scale, Search, Phone, Globe, Mail, Building, ExternalLink,
  ChevronDown, ChevronRight, Shield, AlertCircle, Info, BookOpen,
  Users, FileText, Gavel, Flag, Library, School
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  contacts?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  tags?: string[];
}

export function FederalCPSResources() {
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

  const resources: Resource[] = [
    {
      id: 'federal-cps-overview',
      title: 'Federal Child Welfare System Overview',
      category: 'Federal Law',
      description: 'Understanding federal laws governing CPS cases nationwide',
      content: `
**FEDERAL LAWS GOVERNING CHILD WELFARE:**

**1. ADOPTION AND SAFE FAMILIES ACT (ASFA) - 1997**
**Public Law 105-89**

**Key Provisions:**
- **15 of 22 Month Rule:** States must file TPR petition if child in care 15 of most recent 22 months
- **Reasonable Efforts:** Required to prevent removal and achieve reunification
- **Permanency Hearing:** Required within 12 months of child entering care
- **Concurrent Planning:** Work on reunification AND alternate plan simultaneously

**Exceptions to 15/22 Rule:**
- Child placed with relative
- Documented compelling reason
- State has not provided reasonable services

**Timeline Requirements:**
- **Permanency Hearing:** 12 months
- **Permanency Plan:** Must be established
- **Review Hearings:** Every 6 months minimum

**2. INDIAN CHILD WELFARE ACT (ICWA) - 1978**
**25 U.S.C. § 1901 et seq.**

**Applies When:**
- Child is member or eligible for membership in federally recognized tribe
- Parent or extended family member is tribal member

**Special Protections:**
- **Active Efforts** required (higher standard than reasonable efforts)
- **Qualified Expert Witness** required for removal
- **Placement Preferences:** 
  1. Extended family
  2. Members of child's tribe
  3. Other Indian families
- **Notice to Tribe** required
- **Tribal Court Jurisdiction** in many cases

**Burden of Proof:**
- **Removal:** Clear and convincing + expert testimony
- **TPR:** Beyond reasonable doubt + expert testimony

**3. CHILD ABUSE PREVENTION AND TREATMENT ACT (CAPTA) - 1974**
**42 U.S.C. § 5101 et seq.**

**Defines Child Abuse and Neglect:**
- Physical abuse
- Sexual abuse
- Emotional abuse
- Neglect (including medical neglect)
- Abandonment

**Requirements for States:**
- Mandatory reporting laws
- Immunity for reporters
- Investigation procedures
- Prevention programs

**Funding:**
- Federal grants to states
- Conditions on funding
- State compliance requirements

**4. FOSTERING CONNECTIONS ACT - 2008**
**Public Law 110-351**

**Key Provisions:**
- Extended foster care to age 21 (state option)
- Kinship guardianship assistance
- Family connection requirements
- Notice to relatives when child removed
- Educational stability provisions

**5. FAMILY FIRST PREVENTION SERVICES ACT - 2018**
**Public Law 115-123**

**Major Changes:**
- Prevention services funding
- Limits on congregate care
- Kinship navigator programs
- Pregnant and parenting foster youth support

**Goals:**
- Keep families together when safe
- Reduce need for foster care
- Improve well-being of children

**6. MULTIETHNIC PLACEMENT ACT (MEPA) - 1994**
**42 U.S.C. § 1996b**

**Prohibits:**
- Delaying or denying placement based on race
- Discrimination in foster/adoptive placements
- Using race as sole factor

**Allows:**
- Considering child's cultural needs
- Recruiting diverse foster parents

**7. KEEPING CHILDREN AND FAMILIES SAFE ACT - 2003**
**Public Law 108-36**

**Reauthorized CAPTA with:**
- Stronger screening requirements
- Improved data collection
- Enhanced training
- Focus on prevention

---

**FEDERAL CONSTITUTIONAL PROTECTIONS:**

**FOURTEENTH AMENDMENT - DUE PROCESS**
- Right to parent is fundamental liberty interest
- Cannot terminate without due process
- Clear and convincing evidence standard (Santosky v. Kramer, 1982)
- Right to fair hearing

**FOURTH AMENDMENT - UNREASONABLE SEARCH**
- Protection from warrantless home entry
- CPS needs consent, warrant, or exigent circumstances
- No forced entry without legal authority

**FIFTH AMENDMENT - SELF-INCRIMINATION**
- Right to remain silent
- Statements can be used against you
- No requirement to talk to CPS investigator

---

**LANDMARK SUPREME COURT CASES:**

**Santosky v. Kramer (1982)**
- Established "clear and convincing evidence" standard for TPR
- Due process requires higher burden than preponderance

**Troxel v. Granville (2000)**
- Affirmed fundamental right of parents to make decisions
- Presumption that fit parents act in child's best interest

**Stanley v. Illinois (1972)**
- Unwed fathers have parental rights
- Cannot terminate without due process

**Lassiter v. Department of Social Services (1981)**
- No absolute right to appointed counsel in TPR
- Due process may require it in some cases

**DeShaney v. Winnebago County (1989)**
- State generally no duty to protect from private harm
- But once state takes custody, duty to protect arises

---

**FEDERAL FUNDING PROGRAMS:**

**TITLE IV-E (Social Security Act)**
- Foster care maintenance payments
- Adoption assistance
- Kinship guardianship assistance
- Conditions on federal funding

**TITLE IV-B**
- Child welfare services
- Promoting safe and stable families
- Prevention and family support

**TANF (Temporary Assistance for Needy Families)**
- Cash assistance
- May require cooperation with CPS
- Benefits cannot be denied solely for non-cooperation with CPS

---

**FEDERAL REPORTING:**

**NCANDS (National Child Abuse and Neglect Data System)**
- Collects CPS data from all states
- Annual reports on maltreatment
- Public access to statistics

**AFCARS (Adoption and Foster Care Analysis and Reporting System)**
- Foster care statistics
- Adoption data
- Public reporting

---

**YOUR FEDERAL RIGHTS IN CPS CASES:**

✅ **Right to due process** before termination  
✅ **Right to notice** of hearings  
✅ **Right to be heard** in court  
✅ **Higher standard of proof** (clear and convincing)  
✅ **Protection from unreasonable search** (Fourth Amendment)  
✅ **Right to remain silent** (Fifth Amendment)  
✅ **Right to counsel** (in some states/circumstances)  
✅ **Right to appeal** adverse decisions  
✅ **ICWA protections** (if applicable)  
✅ **Right to reunification services**  
✅ **Right to timely permanency**  

**Federal law sets the FLOOR, not the ceiling. States can provide MORE protections, but not less.**
      `,
      contacts: {
        website: 'www.acf.hhs.gov/cb',
        phone: '1-800-394-3366'
      },
      tags: ['federal law', 'ASFA', 'ICWA', 'CAPTA', 'constitutional rights', 'supreme court']
    },
    {
      id: 'doj-resources',
      title: 'U.S. Department of Justice Resources',
      category: 'DOJ',
      description: 'Federal civil rights enforcement and legal resources',
      content: `
**U.S. DEPARTMENT OF JUSTICE (DOJ) RESOURCES:**

**OVERVIEW:**
The DOJ enforces federal civil rights laws and oversees certain aspects of state child welfare systems.

---

**1. CIVIL RIGHTS DIVISION**

**Office for Civil Rights**
Address: 950 Pennsylvania Avenue NW, Washington, DC 20530
Phone: (202) 514-4609
Website: www.justice.gov/crt
Email: AskCRT@usdoj.gov

**Enforces:**
- Civil Rights Act of 1964
- Americans with Disabilities Act
- Fair Housing Act
- Religious Land Use and Institutionalized Persons Act (RLUIPA)

**Relevant to CPS:**
- Discrimination in child welfare
- Disability discrimination
- Unequal treatment based on race
- Religious freedom violations

**How to File Complaint:**
1. Visit www.civilrights.justice.gov
2. Online form available
3. Mail to address above
4. Must allege federal civil rights violation

---

**2. OFFICE OF JUVENILE JUSTICE AND DELINQUENCY PREVENTION (OJJDP)**

Address: 810 Seventh Street NW, Washington, DC 20531
Phone: (202) 307-5911
Website: www.ojjdp.gov

**Mission:**
- Support state and local juvenile justice systems
- Prevent delinquency
- Improve juvenile justice

**Resources:**
- Model programs
- Research and statistics
- Training and technical assistance
- Grant funding

**Publications:**
- Juvenile Justice Bulletins
- Statistical briefings
- Best practice guides

---

**3. OFFICE ON VIOLENCE AGAINST WOMEN (OVW)**

Phone: (202) 307-6026
Website: www.justice.gov/ovw

**Relevant Programs:**
- Domestic violence services
- Protective order enforcement
- Victim services
- Safe havens for children

---

**4. COMMUNITY RELATIONS SERVICE (CRS)**

Phone: (202) 305-2935
Website: www.justice.gov/crs

**Provides:**
- Mediation services
- Conflict resolution
- Community dialogue facilitation
- Training on civil rights

---

**5. OFFICE OF LEGAL COUNSEL (OLC)**

Website: www.justice.gov/olc

**Provides:**
- Legal opinions
- Constitutional analysis
- Federal law interpretation

---

**FILING FEDERAL CIVIL RIGHTS COMPLAINTS:**

**Section 1983 Lawsuits:**
- Sue state/local officials for civil rights violations
- File in federal district court
- Damages and injunctive relief available
- Must show constitutional or federal law violation
- Must show defendant acted "under color of law"

**Common CPS-Related Claims:**
✅ Fourth Amendment (unreasonable seizure)  
✅ Fourteenth Amendment (due process)  
✅ Fourteenth Amendment (familial association)  
✅ First Amendment (religious freedom)  
✅ Equal Protection (discrimination)  

**How to File:**
1. Hire attorney (recommended)
2. Draft complaint
3. File in federal district court
4. Serve defendants
5. Litigation process

**Important Deadlines:**
- **Statute of Limitations:** Usually 2-3 years (varies by state)
- **Notice Requirements:** May need notice to government
- **File promptly** - don't wait

---

**DOJ CIVIL RIGHTS INVESTIGATIONS OF STATE CHILD WELFARE:**

**Past Investigations:**
The DOJ has investigated child welfare systems in multiple states for:
- Systemic violations of children's rights
- Inadequate services
- Unsafe conditions
- Discrimination

**Examples:**
- Georgia (foster care conditions)
- New Jersey (foster care system)
- District of Columbia (LaShawn A. lawsuit)

**Results:**
- Consent decrees
- Court monitoring
- System reforms
- Improved services

---

**FEDERAL CIVIL RIGHTS HOTLINES:**

**DOJ Civil Rights Division:**
📞 **1-844-380-6178** (Toll-free)
📞 (202) 514-4609

**Hours:** Monday-Friday, 9:00 AM - 5:00 PM EST

**What to Report:**
- Civil rights violations
- Discrimination
- Constitutional violations by government officials

**FBI Civil Rights Unit:**
📞 Local FBI field office
Website: tips.fbi.gov

---

**FEDERAL PROTECTION FOR PARENTS:**

**Americans with Disabilities Act (ADA):**
- Cannot discriminate based on disability
- Cannot terminate rights solely due to parent's disability
- Must provide reasonable accommodations
- Applies to mental health conditions

**Title VI (Civil Rights Act):**
- No discrimination based on race
- No disparate treatment
- Applies to agencies receiving federal funds
- Most state CPS agencies covered

**Religious Freedom Restoration Act (RFRA):**
- Protects religious exercise
- Government must show compelling interest
- Must use least restrictive means

---

**FEDERAL COURT RESOURCES:**

**U.S. District Courts:**
- Federal trial courts
- Handle Section 1983 cases
- Civil rights jurisdiction
- Find your district: www.uscourts.gov

**U.S. Courts of Appeals:**
- 13 circuits
- Review district court decisions
- Published opinions set precedent

**U.S. Supreme Court:**
- Highest court
- Discretionary review
- Petition for certiorari
- Few cases accepted

**PACER (Public Access to Court Electronic Records):**
Website: pacer.uscourts.gov
- Access federal court documents
- Search cases
- Small fee per page
- Free for low-volume users

---

**FEDERAL LEGAL AID:**

**Legal Services Corporation (LSC):**
Website: www.lsc.gov
Phone: (202) 295-1500
- Find local legal aid: lsc.gov/what-legal-aid/find-legal-aid

**National legal aid funded by federal government**

---

**FILING COMPLAINTS AGAINST CPS WITH DOJ:**

**When to File:**
- Pattern of civil rights violations
- Systemic discrimination
- Egregious constitutional violations
- Retaliation for exercising rights

**What DOJ Can Do:**
- Investigate state/local child welfare
- File lawsuit against state
- Negotiate consent decree
- Monitor compliance
- Enforce federal laws

**What DOJ Cannot Do:**
- Handle individual custody cases
- Act as your personal attorney
- Guarantee outcome
- Override state court decisions

**Realistic Expectations:**
- DOJ rarely takes individual cases
- Focus on systemic problems
- Long investigation process
- No guarantee of action

---

**ADDITIONAL FEDERAL RESOURCES:**

**Children's Bureau (ACF/HHS):**
Website: www.acf.hhs.gov/cb
Phone: 1-800-394-3366

**Child Welfare Information Gateway:**
Website: www.childwelfare.gov
Phone: 1-800-394-3366
Email: info@childwelfare.gov

**National Resource Center for Legal and Judicial Issues:**
Website: www.abacenteron children.org

**ABA Center on Children and the Law:**
Website: www.americanbar.org/groups/child_law

---

**IMPORTANT DISCLAIMER:**

Federal agencies handle systemic issues, not individual cases. For your specific case:
✅ Hire a local attorney  
✅ File in state court  
✅ Exhaust state remedies first  
✅ Then consider federal court  

Federal resources are for:
- Constitutional violations
- Civil rights claims
- Research and information
- Policy advocacy
      `,
      contacts: {
        phone: '1-844-380-6178',
        email: 'AskCRT@usdoj.gov',
        website: 'www.justice.gov/crt',
        address: '950 Pennsylvania Avenue NW, Washington, DC 20530'
      },
      tags: ['DOJ', 'federal', 'civil rights', 'discrimination', 'Section 1983']
    },
    {
      id: 'federal-courts',
      title: 'Federal Court System Guide',
      category: 'Federal Courts',
      description: 'Understanding federal courts and jurisdiction',
      content: `
**FEDERAL COURT SYSTEM:**

**THREE-TIER SYSTEM:**

**1. U.S. DISTRICT COURTS (Trial Courts)**
- 94 districts nationwide
- Original jurisdiction
- Where cases start
- Jury trials available

**2. U.S. COURTS OF APPEALS (Appellate Courts)**
- 13 circuits (11 numbered + DC + Federal Circuit)
- Review district court decisions
- No new evidence
- Panel of 3 judges typically
- Published opinions are precedent

**3. U.S. SUPREME COURT**
- Highest court
- 9 justices
- Discretionary review (certiorari)
- Final say on constitutional issues

---

**THE 13 FEDERAL CIRCUITS:**

**First Circuit:**
States: Maine, Massachusetts, New Hampshire, Rhode Island, Puerto Rico
Location: Boston, MA

**Second Circuit:**
States: Connecticut, New York, Vermont
Location: New York, NY

**Third Circuit:**
States: Delaware, New Jersey, Pennsylvania, Virgin Islands
Location: Philadelphia, PA

**Fourth Circuit:**
States: Maryland, North Carolina, South Carolina, Virginia, West Virginia
Location: Richmond, VA

**Fifth Circuit:**
States: Louisiana, Mississippi, Texas
Location: New Orleans, LA

**Sixth Circuit:**
States: Kentucky, Michigan, Ohio, Tennessee
Location: Cincinnati, OH

**Seventh Circuit:**
States: Illinois, Indiana, Wisconsin
Location: Chicago, IL

**Eighth Circuit:**
States: Arkansas, Iowa, Minnesota, Missouri, Nebraska, North Dakota, South Dakota
Location: St. Louis, MO

**Ninth Circuit:**
States: Alaska, Arizona, California, Hawaii, Idaho, Montana, Nevada, Oregon, Washington, Guam, Northern Mariana Islands
Location: San Francisco, CA

**Tenth Circuit:**
States: Colorado, Kansas, New Mexico, Oklahoma, Utah, Wyoming
Location: Denver, CO

**Eleventh Circuit:**
States: Alabama, Florida, Georgia
Location: Atlanta, GA

**D.C. Circuit:**
Location: Washington, DC
Jurisdiction: Appeals from D.C. District Court, federal agencies

**Federal Circuit:**
Location: Washington, DC
Specialized: Patents, international trade, federal claims

---

**FEDERAL JURISDICTION IN CPS CASES:**

**When Federal Courts Have Jurisdiction:**

**1. Federal Question Jurisdiction (28 U.S.C. § 1331)**
- Case arises under U.S. Constitution
- Federal law violated
- Federal right at issue

**Examples in CPS:**
✅ Section 1983 civil rights lawsuit  
✅ ICWA violation  
✅ Constitutional violation by state official  
✅ Federal civil rights claim  

**2. Diversity Jurisdiction (28 U.S.C. § 1332)**
- Parties from different states
- Amount in controversy > $75,000
- Rarely applies to CPS cases

**3. Removal Jurisdiction (28 U.S.C. § 1441)**
- Case filed in state court
- Contains federal question
- Defendant can remove to federal court
- Must do within 30 days

---

**SECTION 1983 LAWSUITS (42 U.S.C. § 1983):**

**Requirements:**
1. Defendant acted "under color of state law"
2. Violated your constitutional or federal rights
3. You suffered damages

**Common Defendants:**
- CPS caseworkers
- CPS supervisors
- State child welfare officials
- Foster care agencies
- County/state governments

**Common Claims:**
✅ **Fourth Amendment:** Unlawful removal/search  
✅ **Fourteenth Amendment:** Due process violation  
✅ **Fourteenth Amendment:** Familial association  
✅ **First Amendment:** Free exercise of religion  
✅ **Equal Protection:** Discrimination  

**Remedies Available:**
- Money damages (compensatory)
- Punitive damages (if willful)
- Injunctive relief (court order)
- Declaratory relief
- Attorney's fees (if you win)

**Defenses:**
- **Qualified Immunity:** Official reasonably believed actions were lawful
- **Absolute Immunity:** Judges, prosecutors (in limited circumstances)
- **Statute of Limitations:** Usually 2-3 years

---

**HABEAS CORPUS (28 U.S.C. § 2254):**

**For Custody Challenges:**
- Child wrongfully held in state custody
- Constitutional violation
- Exhausted state remedies
- Rare in CPS cases

**Requirements:**
- Petitioner in custody
- Constitutional violation
- No adequate state remedy

---

**FILING IN FEDERAL COURT:**

**Step 1: Draft Complaint**
- State facts
- Identify legal claims
- List defendants
- Specify damages sought
- Include prayer for relief

**Step 2: File in District Court**
- Find correct district
- Pay filing fee (~$402) or file IFP motion
- Serve summons on defendants

**Step 3: Service of Process**
- Serve defendants within 90 days
- Federal marshals can serve
- Follow Federal Rules of Civil Procedure

**Step 4: Answer/Response**
- Defendants file answer
- May file motion to dismiss
- Discovery begins

**Step 5: Discovery**
- Document requests
- Depositions
- Interrogatories
- Expert witnesses

**Step 6: Summary Judgment**
- Either side may move
- Judge decides if trial needed

**Step 7: Trial**
- Jury or bench trial
- Present evidence
- Verdict

**Step 8: Appeal (if necessary)**
- File in Circuit Court of Appeals
- Notice within 30 days of judgment

---

**FEDERAL RULES:**

**Federal Rules of Civil Procedure (FRCP)**
- Govern federal civil cases
- Pleading requirements
- Discovery rules
- Trial procedures

**Federal Rules of Evidence (FRE)**
- What evidence is admissible
- Expert witness requirements
- Hearsay rules

**Federal Rules of Appellate Procedure (FRAP)**
- Appeal deadlines
- Brief requirements
- Oral argument

---

**IMPORTANT DEADLINES:**

**Notice of Removal:** 30 days from service  
**Notice of Appeal:** 30 days from judgment  
**Section 1983 Statute of Limitations:** 2-3 years (varies by state)  
**Service of Process:** 90 days from filing  
**Response to Complaint:** 21 days from service  

---

**FINDING YOUR FEDERAL COURT:**

**U.S. District Court Locator:**
Website: www.uscourts.gov/court-locator

**By State:**
Each state has 1-4 district courts
Example: 
- Mississippi: Northern District, Southern District
- Texas: Northern, Southern, Eastern, Western Districts
- New York: Northern, Southern, Eastern, Western Districts

**Court Websites:**
Format: [district].uscourts.gov
Example: msnd.uscourts.gov (Mississippi Northern District)

---

**FEDERAL COURT FEES:**

**Filing Fees:**
- Civil case: $402
- Appeal: $505
- Bankruptcy: $338

**In Forma Pauperis (IFP):**
- Can't afford fees
- File affidavit of poverty
- Court may waive fees
- Must show indigency

---

**PACER (Electronic Access):**

Website: pacer.uscourts.gov

**Features:**
- Search federal cases
- View documents
- Track case status
- Download filings

**Cost:**
- $0.10 per page
- Free if < $30/quarter
- Register for free account

---

**FEDERAL LEGAL REPRESENTATION:**

**Federal Defender Offices:**
- Criminal cases only
- Not for civil CPS cases

**Legal Aid:**
- Some handle federal cases
- Limited capacity
- Income requirements

**Pro Bono Programs:**
- Federal bar associations
- Law school clinics
- Volunteer lawyers

**Private Attorneys:**
- Section 1983 specialists
- Civil rights attorneys
- May work on contingency
- Attorney's fees available if you win

---

**LANDMARK CASES TO RESEARCH:**

**Santosky v. Kramer (1982)** - Clear and convincing standard  
**DeShaney v. Winnebago (1989)** - State duty to protect  
**Nicholson v. Scoppetta (2004)** - Domestic violence victims  
**Tenenbaum v. Williams (1999)** - Strip search of children  
**Doe v. Kearney (2003)** - Caseworker liability  

---

**SUPREME COURT PETITIONS:**

**Petition for Certiorari:**
- Request Supreme Court review
- File within 90 days of final judgment
- < 1% of petitions granted
- Need issue of national importance

**When Court Takes Cases:**
- Circuit split (circuits disagree)
- Important constitutional question
- Federal law interpretation needed
- Significant public interest

---

**HELPFUL RESOURCES:**

**U.S. Courts Website:**
www.uscourts.gov
- Court locator
- Forms
- Educational resources
- Statistics

**Federal Judicial Center:**
www.fjc.gov
- Research
- Education
- Publications

**Administrative Office of U.S. Courts:**
- Court administration
- Statistics
- Annual reports

---

**IMPORTANT NOTES:**

⚠️ **Federal court is complex** - strongly recommend attorney  
⚠️ **State remedies first** - usually must exhaust state courts  
⚠️ **Strict deadlines** - missing deadline can end case  
⚠️ **Higher standards** - federal judges are strict  
⚠️ **No guarantee** - qualified immunity often defeats claims  

**Federal court should be LAST RESORT after state courts.**
      `,
      contacts: {
        website: 'www.uscourts.gov',
        phone: '(202) 502-2600'
      },
      tags: ['federal courts', 'Section 1983', 'jurisdiction', 'circuits', 'appeals']
    },
    {
      id: 'child-welfare-agencies',
      title: 'National Child Welfare Agencies & Organizations',
      category: 'Organizations',
      description: 'Key federal and national child welfare organizations',
      content: `
**NATIONAL CHILD WELFARE AGENCIES & ORGANIZATIONS:**

---

**FEDERAL AGENCIES:**

**1. CHILDREN'S BUREAU (ACF/HHS)**
Address: 330 C Street SW, Washington, DC 20201
Phone: 1-800-394-3366
Website: www.acf.hhs.gov/cb
Email: cb@acf.hhs.gov

**Mission:**
- Oversee federal child welfare programs
- Administer Title IV-E funding
- Enforce ASFA and CAPTA
- Provide technical assistance to states

**Programs:**
- Child Abuse Prevention
- Foster Care and Adoption
- Family Preservation
- Independent Living

**Resources:**
- Statistical reports
- Policy guidance
- Training materials
- Best practices

---

**2. CHILD WELFARE INFORMATION GATEWAY**
Phone: 1-800-394-3366
Email: info@childwelfare.gov
Website: www.childwelfare.gov

**Free Resources:**
- Factsheets on every topic
- State statutes database
- Search by topic
- Downloadable publications

**Topics Covered:**
- Child abuse and neglect
- Foster care
- Adoption
- Parenting
- Organizations by state

**Publications:**
- Prevention
- Identification and reporting
- Treatment and recovery
- Statistics

---

**3. NATIONAL INDIAN CHILD WELFARE ASSOCIATION (NICWA)**
Phone: (503) 222-4044
Website: www.nicwa.org
Email: info@nicwa.org

**For Native American Families:**
- ICWA expertise
- Tribal resources
- Legal assistance
- Advocacy

---

**NATIONAL ADVOCACY ORGANIZATIONS:**

**4. CHILDREN'S DEFENSE FUND (CDF)**
Phone: 1-800-233-1200
Website: www.childrensdefense.org

**Focus:**
- Child advocacy
- Policy reform
- Poverty elimination
- Healthcare access

**Services:**
- Research and data
- Policy advocacy
- Public education

---

**5. CHILD WELFARE LEAGUE OF AMERICA (CWLA)**
Phone: (202) 638-2952
Website: www.cwla.org

**Members:**
- Child welfare agencies
- Service providers

**Resources:**
- Standards of excellence
- Training
- Publications
- Conferences

---

**6. NATIONAL CASA (COURT APPOINTED SPECIAL ADVOCATES)**
Phone: 1-800-628-3233
Website: www.nationalcasa.org

**What CASA Does:**
- Volunteer advocates for children in court
- Independent voice for child
- Investigate and recommend to judge

**Get a CASA:**
- Request through your court
- Judge appoints
- Free service

---

**7. AMERICAN BAR ASSOCIATION CENTER ON CHILDREN AND THE LAW**
Phone: (202) 662-1720
Website: www.americanbar.org/groups/child_law

**Resources:**
- Legal research
- Training for attorneys
- Model laws
- Publications

**Projects:**
- Parent representation
- Judicial education
- Child welfare law specialists

---

**8. NATIONAL CENTER FOR YOUTH LAW (NCYL)**
Phone: (510) 835-8098
Website: www.youthlaw.org

**Focus:**
- Legal advocacy for youth
- Foster care reform
- Education rights
- Healthcare access

**Services:**
- Litigation
- Policy advocacy
- Technical assistance

---

**9. CHILDREN'S RIGHTS**
Phone: (212) 683-2210
Website: www.childrensrights.org

**Focus:**
- Class action litigation
- Systemic reform
- Accountability

**Major Cases:**
- Foster care system reform
- Abuse in care
- Adequate services

---

**PARENT SUPPORT ORGANIZATIONS:**

**10. NATIONAL COUNCIL FOR ADOPTION**
Phone: (703) 299-6633
Website: www.adoptioncouncil.org

**For:**
- Adoptive families
- Birth parents
- Adoption information

---

**11. ZERO TO THREE**
Phone: (202) 638-1144
Website: www.zerotothree.org

**Focus:**
- Early childhood (0-3 years)
- Parent-child relationships
- Infant mental health

---

**12. PREVENT CHILD ABUSE AMERICA**
Phone: (312) 663-3520
Website: www.preventchildabuse.org

**Mission:**
- Prevention programs
- Public education
- Community support

**Chapters in Every State**

---

**RESEARCH & DATA:**

**13. CHILD TRENDS**
Phone: (240) 223-9200
Website: www.childtrends.org

**Provides:**
- Research on children and families
- Data analysis
- Policy briefs

---

**14. CHAPIN HALL (University of Chicago)**
Phone: (773) 256-5100
Website: www.chapinhall.org

**Focus:**
- Child welfare research
- Evaluation
- Data systems

**Major Projects:**
- Multistate foster care data
- Outcome studies
- Evidence-based practice

---

**LEGAL RESOURCES:**

**15. NATIONAL LEGAL AID & DEFENDER ASSOCIATION (NLADA)**
Phone: (202) 452-0620
Website: www.nlada.org

**Directory:**
- Legal aid programs nationwide
- Public defender offices

---

**16. PARENT REPRESENTATION PROGRAMS:**

**National Association of Counsel for Children (NACC)**
Phone: (303) 864-5320
Website: www.naccchildlaw.org

**ABA Parent Representation Standards**
Website: www.americanbar.org

---

**STATE-SPECIFIC:**

**17. CASEY FAMILY PROGRAMS**
Phone: (206) 282-7300
Website: www.casey.org

**Focus:**
- State child welfare systems
- Technical assistance
- Research
- Policy

**Available in Many States**

---

**EDUCATIONAL RESOURCES:**

**18. AMERICAN PROFESSIONAL SOCIETY ON THE ABUSE OF CHILDREN (APSAC)**
Phone: (843) 764-2905
Website: www.apsac.org

**For Professionals:**
- Training
- Certification
- Publications

**Guidelines:**
- Investigation
- Assessment
- Treatment

---

**MENTAL HEALTH:**

**19. NATIONAL CHILD TRAUMATIC STRESS NETWORK (NCTSN)**
Phone: (310) 235-2633
Website: www.nctsn.org

**Resources:**
- Trauma-informed care
- Treatment for traumatized children
- Parent resources

---

**DISABILITIES:**

**20. NATIONAL DISABILITY RIGHTS NETWORK (NDRN)**
Phone: (202) 408-9514
Website: www.ndrn.org

**Protection & Advocacy:**
- Disability rights
- Protection from abuse
- Access to services

**Office in Every State**

---

**SUBSTANCE ABUSE:**

**21. NATIONAL CENTER ON SUBSTANCE ABUSE AND CHILD WELFARE (NCSACW)**
Phone: 1-866-493-2758
Website: www.ncsacw.samhsa.gov

**For Parents with Substance Use:**
- Treatment resources
- Family-centered recovery
- Child welfare collaboration

---

**DOMESTIC VIOLENCE:**

**22. NATIONAL DOMESTIC VIOLENCE HOTLINE**
Phone: **1-800-799-7233** (SAFE)
Text: START to 88788
Website: www.thehotline.org

**24/7 Support:**
- Safety planning
- Resources
- Referrals
- Chat available

---

**23. NATIONAL COALITION AGAINST DOMESTIC VIOLENCE (NCADV)**
Phone: (303) 839-1852
Website: www.ncadv.org

---

**FAMILY FINDING:**

**24. FAMILY FINDING RESOURCES**
- Kevin Campbell Foundation
- Family finding programs
- Relative search assistance

---

**REPORTING & COMPLAINTS:**

**25. REPORT CHILD ABUSE:**

**Childhelp National Child Abuse Hotline:**
📞 **1-800-422-4453** (24/7)
Website: www.childhelp.org

**What They Do:**
- Crisis counseling
- Information
- Referrals to local services
- Multi-lingual

---

**26. REPORT GOVERNMENT FRAUD/WASTE:**

**HHS Office of Inspector General:**
Phone: 1-800-HHS-TIPS (1-800-447-8477)
Website: oig.hhs.gov

**For Reporting:**
- CPS fraud
- Misuse of federal funds
- Waste in child welfare

---

**INTERNATIONAL:**

**27. HAGUE CONFERENCE ON PRIVATE INTERNATIONAL LAW**
Website: www.hcch.net

**For International Cases:**
- International child abduction
- Intercountry adoption
- International jurisdiction

---

**HOW TO USE THESE RESOURCES:**

**For Information:**
✅ Child Welfare Information Gateway  
✅ Children's Bureau  
✅ Your state's child welfare website  

**For Legal Help:**
✅ Legal aid programs  
✅ Parent representation programs  
✅ ABA Center on Children and the Law  

**For Support:**
✅ National Hotline (1-800-422-4453)  
✅ Domestic Violence Hotline (1-800-799-7233)  
✅ Local support groups  

**For Advocacy:**
✅ Children's Defense Fund  
✅ Children's Rights  
✅ Disability Rights Network  

**For Research:**
✅ Child Trends  
✅ Chapin Hall  
✅ Casey Family Programs  

---

**CRITICAL HOTLINES TO REMEMBER:**

📞 **Childhelp National Child Abuse Hotline: 1-800-422-4453**  
📞 **National Domestic Violence Hotline: 1-800-799-7233**  
📞 **National Suicide Prevention Lifeline: 988**  
📞 **SAMHSA Treatment Referral: 1-800-662-4357**  
📞 **Child Welfare Information Gateway: 1-800-394-3366**  

---

**ALL resources listed provide information and referrals. They are NOT substitutes for legal representation in your case.**
      `,
      contacts: {
        phone: '1-800-394-3366',
        email: 'info@childwelfare.gov',
        website: 'www.childwelfare.gov'
      },
      tags: ['organizations', 'resources', 'federal agencies', 'hotlines', 'advocacy']
    },
    {
      id: 'national-statistics',
      title: 'National CPS Statistics & Data',
      category: 'Statistics',
      description: 'Understanding national child welfare data and trends',
      content: `
**NATIONAL CPS STATISTICS & DATA:**

**DATA SOURCES:**

**1. CHILD MALTREATMENT REPORT (Annual)**
Published by: Children's Bureau, ACF/HHS
Website: www.acf.hhs.gov/cb/data-research/child-maltreatment

**Most Recent Data (2022):**

**Reports:**
- **3.9 million** reports of child abuse/neglect
- Involving **7.0 million children**
- **1.8 million** received CPS investigation
- **579,000 children** were victims

**Victimization Rate:**
- **7.8 victims per 1,000 children** nationally
- Varies by state

**Types of Maltreatment:**
- Neglect: 76.1%
- Physical Abuse: 16.1%
- Sexual Abuse: 9.6%
- Psychological/Emotional: 6.4%
- Medical Neglect: 1.9%
- Other: 14.2%
(Note: Children can be victims of multiple types)

**Child Fatalities:**
- **1,820 children died** from abuse/neglect
- Rate: 2.46 per 100,000 children

**Age Groups Most At Risk:**
- Under 1 year: Highest fatality rate
- 0-3 years: Highest victimization rate

**Perpetrators:**
- Parents: 76.7%
- Other relatives: 6.3%
- Unmarried partner of parent: 4.9%

---

**2. AFCARS REPORT (Adoption and Foster Care Analysis)**
Published by: Children's Bureau

**Foster Care (2022):**
- **368,530 children** in foster care (end of FY)
- **203,770 children entered** foster care
- **199,433 children exited** foster care
- Average time in care: **20.9 months**

**Entries to Foster Care:**
- Median age: 6.5 years
- 52% Male, 48% Female

**Reasons for Removal:**
- Neglect: 62%
- Parental drug abuse: 36%
- Caretaker inability: 14%
- Physical abuse: 13%
- Child behavior: 11%
- Housing: 10%
- Parental incarceration: 8%
- Sexual abuse: 4%

**Placement Settings:**
- Non-relative foster family: 45%
- Relative foster care: 32%
- Group home/institution: 15%
- Pre-adoptive home: 4%
- Trial home visit: 3%

**Exits from Foster Care:**
- Reunification: 51%
- Living with relative: 6%
- Adoption: 20%
- Guardianship: 8%
- Emancipation: 8%
- Other: 7%

**Adoptions (2022):**
- **50,248 children adopted** from foster care
- Median age at adoption: 6.3 years
- Average time to adoption: 26.5 months

---

**3. STATE-BY-STATE DATA:**

**States with Highest Rates of Children in Foster Care (per 1,000):**
1. West Virginia
2. Wyoming  
3. Montana
4. Alaska
5. Oklahoma

**States with Lowest Rates:**
1. Virginia
2. New Jersey
3. Maryland
4. Utah
5. California

**States with Highest Removal Rates:**
- Often correlate with poverty, drug use, rural areas

---

**4. RACIAL DISPARITIES:**

**Children in Foster Care by Race (2022):**
- White: 43%
- Black/African American: 21%
- Hispanic: 23%
- Two or more races: 9%
- Other: 4%

**Disproportionality:**
- Black children: **Over-represented** (21% of foster care, 14% of child population)
- Native American/Alaska Native: **Severely over-represented**
- White children: **Under-represented**
- Hispanic: Roughly proportional

**Disparities Exist in:**
- Investigation rates
- Substantiation rates
- Removal rates
- Time in care
- Reunification rates
- TPR rates

---

**5. OUTCOMES:**

**Re-entry to Foster Care:**
- 8.3% of children re-enter within 12 months

**Permanency:**
- Children who achieve permanency within 12 months: 41.5%

**Aging Out:**
- ~20,000 youth age out of foster care annually
- Often at age 18 or 21

**Outcomes for Youth Who Age Out:**
- Higher homelessness rates
- Lower educational attainment
- Higher unemployment
- Higher incarceration rates
- Teen pregnancy rates higher

---

**6. TIMELINES:**

**Median Time to Reunification:**
- 6.5 months nationally
- Varies by state

**Median Time to Adoption:**
- 26.5 months

**Median Time to Guardianship:**
- 18 months

**Time in Care:**
- Under 1 month: 9%
- 1-5 months: 19%
- 6-11 months: 16%
- 12-23 months: 21%
- 24+ months: 35%

---

**7. CHARACTERISTICS OF CHILDREN:**

**Age Distribution:**
- Under 1: 6%
- 1-5: 29%
- 6-10: 24%
- 11-15: 26%
- 16-20: 15%

**Special Needs:**
- 40% have special needs
- 25% have disabilities

**Educational Concerns:**
- Higher rates of special education
- Lower test scores
- Higher dropout rates

---

**8. PARENT CHARACTERISTICS:**

**Common Issues:**
- **Substance abuse:** 36% (and rising)
- Mental illness: ~20%
- Domestic violence: ~25%
- Poverty: Significant factor
- Homelessness/housing: ~10%
- Incarceration: ~8%

**Opioid Crisis Impact:**
- Dramatic increase in parental drug abuse
- Children entering care due to drugs up 53% since 2012

---

**9. COSTS:**

**Annual Federal Spending:**
- Title IV-E (Foster Care): ~$5 billion
- Title IV-B (Prevention): ~$300 million
- Total child welfare spending: $30+ billion (federal + state)

**Cost Per Child:**
- Varies by state
- Average ~$40,000-50,000/year

---

**10. TERMINATION OF PARENTAL RIGHTS:**

**Annual TPRs:**
- ~50,000-60,000 annually (estimate)
- Often prerequisite for adoption

**Grounds (Most Common):**
- Abandonment
- Abuse/neglect
- Failure to remedy
- Substance abuse
- Mental illness/incapacity
- Incarceration

---

**WHERE TO FIND DATA:**

**National Data:**
✅ **Child Maltreatment Report:** www.acf.hhs.gov/cb/data-research/child-maltreatment  
✅ **AFCARS Data:** www.acf.hhs.gov/cb/research-data-technology/statistics-research/afcars  
✅ **NCANDS (National Child Abuse and Neglect Data System)**  
✅ **Kids Count Data Center:** datacenter.kidscount.org  

**State Data:**
✅ Your state's child welfare department website  
✅ State KIDS COUNT page  
✅ Court statistics (state judiciary websites)  

**Research:**
✅ Child Trends: www.childtrends.org  
✅ Chapin Hall: www.chapinhall.org  
✅ Casey Family Programs: www.casey.org  

---

**USING DATA IN YOUR CASE:**

**Show Patterns:**
- "In [State], XX% of children are reunified within 12 months"
- "National standard is reunification within 12 months"
- "I have completed more services than average"

**Challenge Bias:**
- Racial disparities data
- Over-representation of certain populations
- Question discriminatory practices

**Support Arguments:**
- Statistics on successful reunification
- Outcomes of services
- Effectiveness of certain interventions

**Policy Advocacy:**
- Show systemic problems
- Support reform efforts
- Demand accountability

---

**IMPORTANT TRENDS:**

**Rising:**
- Parental substance abuse (opioid crisis)
- Removal rates in some states
- Children in care due to drugs

**Falling:**
- Overall child maltreatment rates (long-term)
- Foster care caseloads (in some states)
- TPR rates (in some states)

**Persistent Issues:**
- Racial disparities
- Aging out outcomes
- Re-entry rates
- Shortage of foster homes

---

**CRITICAL FACTS TO KNOW:**

✅ **51% of children are reunified** with parents  
✅ **Average time in care: 21 months**  
✅ **Substance abuse involved in 36% of removals**  
✅ **Black children disproportionately represented**  
✅ **8% of children re-enter care within 12 months**  
✅ **20,000+ youth age out annually**  
✅ **Median time to reunification: 6.5 months**  

---

**DATA LIMITATIONS:**

⚠️ Data is often 1-2 years old  
⚠️ States define things differently  
⚠️ Reporting varies by state  
⚠️ Not all cases captured  
⚠️ Quality varies  

**Use data to inform, not dictate, your approach to your individual case.**
      `,
      contacts: {
        website: 'www.acf.hhs.gov/cb/data-research',
        phone: '1-800-394-3366'
      },
      tags: ['statistics', 'data', 'foster care', 'outcomes', 'trends', 'national']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Resources', icon: BookOpen },
    { value: 'Federal Law', label: 'Federal Laws', icon: Gavel },
    { value: 'DOJ', label: 'Department of Justice', icon: Shield },
    { value: 'Federal Courts', label: 'Federal Courts', icon: Scale },
    { value: 'Organizations', label: 'Organizations', icon: Users },
    { value: 'Statistics', label: 'Statistics & Data', icon: FileText }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <Flag className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Federal CPS Resources</h1>
            <p className="text-gray-600 mb-4">
              Federal laws, Department of Justice resources, federal courts, and national child welfare information
            </p>
            <Alert className="bg-blue-100 border-blue-300">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Federal Resources:</strong> These resources cover federal laws (ASFA, ICWA, CAPTA), DOJ civil rights enforcement, federal court system, and national organizations. Federal law sets minimum standards - your state may provide additional protections.
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
                placeholder="Search federal resources..."
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
          <div className="text-sm text-blue-600">Federal Resources</div>
        </Card>
        <Card className="p-4 text-center border-2 border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-700">13</div>
          <div className="text-sm text-green-600">Federal Circuits</div>
        </Card>
        <Card className="p-4 text-center border-2 border-purple-200 bg-purple-50">
          <div className="text-2xl font-bold text-purple-700">24/7</div>
          <div className="text-sm text-purple-600">National Hotlines</div>
        </Card>
        <Card className="p-4 text-center border-2 border-orange-200 bg-orange-50">
          <div className="text-2xl font-bold text-orange-700">FREE</div>
          <div className="text-sm text-orange-600">Federal Info</div>
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
                    {resource.tags && resource.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600">{resource.description}</p>
                  {resource.contacts && (
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                      {resource.contacts.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {resource.contacts.phone}
                        </span>
                      )}
                      {resource.contacts.website && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {resource.contacts.website}
                        </span>
                      )}
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
                    <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border max-h-[600px] overflow-y-auto">
                      {resource.content}
                    </div>
                  </div>
                  {resource.contacts && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-gray-900 mb-2">Contact Information:</h4>
                      <div className="space-y-2 text-sm">
                        {resource.contacts.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-600" />
                            <a href={`tel:${resource.contacts.phone}`} className="text-blue-600 hover:underline">
                              {resource.contacts.phone}
                            </a>
                          </div>
                        )}
                        {resource.contacts.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <a href={`mailto:${resource.contacts.email}`} className="text-blue-600 hover:underline">
                              {resource.contacts.email}
                            </a>
                          </div>
                        )}
                        {resource.contacts.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <a 
                              href={`https://${resource.contacts.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              {resource.contacts.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {resource.contacts.address && (
                          <div className="flex items-start gap-2">
                            <Building className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-gray-700">{resource.contacts.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Important Hotlines */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-6 h-6 text-red-600" />
          Critical National Hotlines (24/7)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-bold text-gray-900">Childhelp National Child Abuse Hotline</div>
            <a href="tel:1-800-422-4453" className="text-2xl font-bold text-red-600 hover:underline">
              1-800-422-4453
            </a>
            <div className="text-sm text-gray-600 mt-1">Crisis counseling, information, referrals</div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-bold text-gray-900">National Domestic Violence Hotline</div>
            <a href="tel:1-800-799-7233" className="text-2xl font-bold text-red-600 hover:underline">
              1-800-799-7233
            </a>
            <div className="text-sm text-gray-600 mt-1">Safety planning, resources, support</div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-bold text-gray-900">National Suicide Prevention Lifeline</div>
            <a href="tel:988" className="text-2xl font-bold text-red-600 hover:underline">
              988
            </a>
            <div className="text-sm text-gray-600 mt-1">Mental health crisis support</div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-bold text-gray-900">SAMHSA Treatment Referral</div>
            <a href="tel:1-800-662-4357" className="text-2xl font-bold text-red-600 hover:underline">
              1-800-662-4357
            </a>
            <div className="text-sm text-gray-600 mt-1">Substance abuse treatment locator</div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <Card className="p-6 bg-yellow-50 border-2 border-yellow-200">
        <Alert className="bg-yellow-100 border-yellow-300">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Legal Disclaimer</AlertTitle>
          <AlertDescription className="text-yellow-800">
            This information is for educational purposes only and does not constitute legal advice. 
            Federal law sets minimum standards - your state may provide additional protections. 
            Always consult with a licensed attorney for advice specific to your case. 
            For official federal information, visit <a href="https://www.lawinfopedia.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">lawinfopedia.com</a> or the official agency websites listed above.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Information compiled from federal agencies, Department of Justice, and national organizations<br/>
        The CPS Punisher™ - Copyright © 2024 DARREN GUAY - All Rights Reserved
      </div>
    </div>
  );
}
