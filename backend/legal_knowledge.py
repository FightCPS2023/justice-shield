import os
import re

# ============================================================================
# LANDMARK SUPREME COURT CASES - CPS & FAMILY LAW
# ============================================================================

SUPREME_COURT_CASES = {
    "troxel": {
        "citation": "Troxel v. Granville, 530 U.S. 57 (2000)",
        "holding": "The liberty interest of parents in the care, custody, and control of their children is 'perhaps the oldest of the fundamental liberty interests recognized by this Court.'",
        "application": "Parents have a fundamental constitutional right to make decisions concerning the care, custody, and control of their children.",
        "key_quotes": [
            "The interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests recognized by this Court.",
            "So long as a parent adequately cares for his or her children, there will normally be no reason for the State to inject itself into the private realm of the family."
        ],
        "use_for": ["Parental rights challenges", "State interference objections", "Fundamental rights violations"],
        "legal_test": "Strict scrutiny applies when state infringes on fundamental parental rights"
    },
    "stanley": {
        "citation": "Stanley v. Illinois, 405 U.S. 645 (1972)",
        "holding": "Parents have a fundamental right to raise their children, and the state cannot terminate parental rights without due process.",
        "application": "State must provide procedural protections before terminating or restricting parental rights.",
        "key_quotes": [
            "The rights to conceive and to raise one's children have been deemed essential.",
            "The private interest here, that of a man in the children he has sired and raised, undeniably warrants deference and, absent a powerful countervailing interest, protection."
        ],
        "use_for": ["Due process violations", "Termination of parental rights", "Procedural rights"],
        "legal_test": "Due process required before state can interfere with parent-child relationship"
    },
    "santosky": {
        "citation": "Santosky v. Kramer, 455 U.S. 745 (1982)",
        "holding": "Clear and convincing evidence standard required for termination of parental rights.",
        "application": "State must prove by clear and convincing evidence that grounds exist to terminate parental rights.",
        "key_quotes": [
            "The fundamental liberty interest of natural parents in the care, custody, and management of their child does not evaporate simply because they have not been model parents.",
            "Before a State may sever completely and irrevocably the rights of parents in their natural child, due process requires that the State support its allegations by at least clear and convincing evidence."
        ],
        "use_for": ["Burden of proof challenges", "Evidentiary standards", "TPR proceedings"],
        "legal_test": "Clear and convincing evidence standard for termination of parental rights"
    },
    "lassiter": {
        "citation": "Lassiter v. Department of Social Services, 452 U.S. 18 (1981)",
        "holding": "Right to counsel in termination proceedings determined by case-by-case analysis, but often required.",
        "application": "Parents may have right to appointed counsel in TPR proceedings depending on circumstances.",
        "key_quotes": [
            "A parent's desire for and right to 'the companionship, care, custody, and management of his or her children' is an important interest that 'undeniably warrants deference and, absent a powerful countervailing interest, protection.'"
        ],
        "use_for": ["Right to counsel", "Due process violations", "Procedural protections"],
        "legal_test": "Mathews v. Eldridge balancing test for procedural due process"
    },
    "camara": {
        "citation": "Camara v. Municipal Court, 387 U.S. 523 (1967)",
        "holding": "Administrative searches generally require warrants or consent.",
        "application": "CPS home visits may constitute searches requiring warrants unless consent or exigent circumstances.",
        "key_quotes": [
            "Except in certain carefully defined classes of cases, a search of private property without proper consent is unreasonable unless it has been authorized by a valid search warrant."
        ],
        "use_for": ["Warrantless home visits", "Fourth Amendment violations", "Consent challenges"],
        "legal_test": "Warrant requirement for administrative searches absent consent or exigency"
    },
    "minnesota_v_murphy": {
        "citation": "Minnesota v. Murphy, 465 U.S. 420 (1984)",
        "holding": "Fifth Amendment protections apply in civil proceedings with potential criminal implications.",
        "application": "Parents can invoke Fifth Amendment privilege in CPS proceedings if testimony could lead to criminal charges.",
        "key_quotes": [
            "The Fifth Amendment privilege against compulsory self-incrimination is not limited to proceedings in which a criminal conviction is sought."
        ],
        "use_for": ["Self-incrimination objections", "Coerced statements", "Miranda violations"],
        "legal_test": "Privilege applies when answers could lead to criminal prosecution"
    }
}

# ============================================================================
# FEDERAL CIRCUIT COURT CASES - CRITICAL CPS PRECEDENTS
# ============================================================================

CIRCUIT_COURT_CASES = {
    "calabretta_v_floyd": {
        "citation": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
        "circuit": "9th Circuit",
        "holding": "CPS social workers need warrant or exigent circumstances to enter home and examine child over parental objection.",
        "application": "Parents can refuse warrantless CPS entry absent consent or emergency.",
        "key_quotes": [
            "Investigatory home visits that involve the interviewing of children are searches within the meaning of the Fourth Amendment.",
            "Government officials may not enter a home without a warrant or one of the well-established exceptions to the warrant requirement, even when seeking to investigate suspected child abuse."
        ],
        "use_for": ["Warrantless home entry", "CPS violations", "Fourth Amendment § 1983 claims"],
        "section_1983": True,
        "qualified_immunity": "Clearly established law - no QI if warrantless entry without exigency"
    },
    "wallis_v_spencer": {
        "citation": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
        "circuit": "9th Circuit",
        "holding": "Strip searching child without warrant or exigent circumstances violates Fourth Amendment.",
        "application": "CPS cannot conduct invasive searches of children without parental consent, warrant, or emergency.",
        "key_quotes": [
            "A visual body cavity search of a child in state custody is an invasion of the child's privacy that is sufficiently serious to require a warrant absent exigent circumstances."
        ],
        "use_for": ["Invasive searches", "Child examinations", "Fourth Amendment violations"],
        "section_1983": True,
        "qualified_immunity": "Clearly established - no QI for warrantless strip searches"
    },
    "duchesne_v_sugarman": {
        "citation": "Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)",
        "circuit": "2nd Circuit",
        "holding": "Due process violated when children removed without adequate investigation or evidence.",
        "application": "CPS must conduct reasonable investigation before emergency removal.",
        "key_quotes": [
            "The state cannot constitutionally remove a child from its parents' custody without prior notice and a hearing, except in emergency circumstances where there is an imminent danger to the child's life or health."
        ],
        "use_for": ["Wrongful removal", "Inadequate investigation", "Due process violations"],
        "section_1983": True,
        "qualified_immunity": "May be overcome if investigation grossly inadequate"
    },
    "croft_v_westmoreland": {
        "citation": "Croft v. Westmoreland County, 103 F.3d 1123 (3rd Cir. 1997)",
        "circuit": "3rd Circuit",
        "holding": "Parents have constitutionally protected liberty interest in family integrity; investigation must be reasonable.",
        "application": "Overreaching CPS investigation violates substantive due process.",
        "key_quotes": [
            "Parents have a constitutionally protected liberty interest in the companionship, care, custody, and management of their children."
        ],
        "use_for": ["Family integrity claims", "Substantive due process", "Overreaching investigation"],
        "section_1983": True
    },
    "gates_v_texas": {
        "citation": "Gates v. Texas Department of Protective Services, 537 F.3d 404 (5th Cir. 2008)",
        "circuit": "5th Circuit",
        "holding": "Emergency removal requires imminent danger; reasonable investigation is required.",
        "application": "CPS must have reasonable cause to believe child faces imminent danger for emergency removal.",
        "key_quotes": [
            "The emergency exception requires that the danger to the child be imminent - that is, immediate and present - and that an investigation could not reasonably be undertaken."
        ],
        "use_for": ["Emergency removal challenges", "Fifth Circuit precedent", "Imminent danger standard"],
        "section_1983": True
    },
    "tenenbaum_v_williams": {
        "citation": "Tenenbaum v. Williams, 193 F.3d 581 (2nd Cir. 1999)",
        "circuit": "2nd Circuit",
        "holding": "CPS caseworkers can be held liable for constitutional violations in child removal cases.",
        "application": "Individual caseworkers are not automatically entitled to qualified immunity.",
        "use_for": ["Qualified immunity analysis", "Individual liability", "Section 1983 claims"],
        "section_1983": True
    }
}

# ============================================================================
# CHILD-RELATED COURT RULINGS (FROM USER PDF)
# ============================================================================

CHILD_RELATED_COURT_RULINGS = [
    {
        "citation": "Roska v. Peterson, 328 F.3d 1230 (10 Cir. 2003)",
        "holding": "Social workers may not enter a home for protective custody without probable cause, a warrant, or exigent circumstances.",
        "application": "Confirms the constitutional protection of family integrity and limits warrantless CPS entry.",
        "use_for": ["warrantless_entry", "emergency_removal", "family_integrity", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Doe et al. v. Heck et al., 7th Cir. Ct. App. 2003",
        "holding": "Interviewing a child without parental consent on private property is a search/seizure absent probable cause or exigent circumstances.",
        "application": "Supports Fourth and Fourteenth Amendment challenges to warrantless child interviews.",
        "use_for": ["warrantless_search", "fourth_amendment", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Walsh v. Erie County Dep't of Job & Family Servs., 240 F. Supp. 2d 731 (N.D. Ohio 2003)",
        "holding": "Fourth Amendment protections apply to child welfare agencies; lack of training does not excuse violations.",
        "application": "Rejects qualified immunity defenses based on ignorance of constitutional limits.",
        "use_for": ["warrantless_entry", "fourth_amendment", "qualified_immunity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Nicholson v. Williams, 203 F.Supp.2d 153 (2002)",
        "holding": "Removing children from battered mothers solely because they witnessed abuse was unconstitutional.",
        "application": "Requires individualized assessment before removal in domestic violence contexts.",
        "use_for": ["due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "North Hudson DYFS v. Koehler Family (2001)",
        "holding": "Courts will not authorize fishing expeditions without tangible evidence of abuse or neglect.",
        "application": "Best-interest claims alone do not justify invasive investigations.",
        "use_for": ["warrantless_entry", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Brokaw v. Mercer County, 7th Cir. 2000",
        "holding": "Child removals are Fourth Amendment seizures; false information used to obtain orders violates the Constitution.",
        "application": "Supports challenges to removals based on fabricated evidence.",
        "use_for": ["emergency_removal", "fabricated_evidence", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Wooley v. City of Baton Rouge, 5th Cir. 2000",
        "holding": "Seizing a child without a warrant or probable cause of imminent danger is unlawful.",
        "application": "Limits emergency removal authority absent immediate danger.",
        "use_for": ["emergency_removal", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Malik v. Arapahoe Cty. Department of Social Services, 10th Cir. 1999",
        "holding": "Removal orders must be based on facts and legal basis, not just 'best interest' assertions.",
        "application": "Requires evidence-based findings for custody deprivations.",
        "use_for": ["due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Morris v. Dearborne, 5th Cir. 1999",
        "holding": "Using fraudulent evidence to remove a child violates due process.",
        "application": "Supports claims challenging falsified reports and perjury.",
        "use_for": ["fabricated_evidence", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Aponte Matos v. Toledo Davilla, 1st Cir. 1998",
        "holding": "Material false statements to obtain a warrant can create liability; searches cannot exceed warrant scope.",
        "application": "Challenges warrants based on misrepresentation in CPS investigations.",
        "use_for": ["fabricated_evidence", "warrantless_entry", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "J.B. v. Washington County, 10th Cir. 1997",
        "holding": "Forced separation of parent and child is a serious infringement on protected rights.",
        "application": "Supports family integrity and due process arguments.",
        "use_for": ["family_integrity", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Ram v. Rubin, 9th Cir. 1997",
        "holding": "Children cannot be removed without notice and a hearing unless there is imminent danger.",
        "application": "Reinforces procedural protections for removals.",
        "use_for": ["emergency_removal", "procedural_due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Whisman v. Rinehart, 8th Cir. 1997",
        "holding": "Parents have a right to a prompt post-deprivation hearing; delays violate due process.",
        "application": "Supports challenges to delayed hearings and continued detention.",
        "use_for": ["procedural_due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "K.H. through Murphy v. Morgan, 7th Cir. 1990",
        "holding": "Even emergency removals require prompt judicial proceedings.",
        "application": "Requires quick post-removal hearings.",
        "use_for": ["procedural_due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Weller v. Department of Social Services for Baltimore, 4th Cir. 1990",
        "holding": "Familial integrity is a fundamental liberty interest.",
        "application": "Supports claims defending parent-child custody rights.",
        "use_for": ["family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Germany v. Vance, 1st Cir. 1989",
        "holding": "Withholding potentially exculpatory information can defeat qualified immunity.",
        "application": "Supports discovery requests and Brady-type arguments.",
        "use_for": ["qualified_immunity", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Good v. Daupin County Social Services, 3rd Cir. 1989",
        "holding": "Warrantless searches in child abuse investigations require exigent circumstances.",
        "application": "Supports Fourth Amendment suppression of unlawful entry.",
        "use_for": ["warrantless_entry", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "White v. Pierce County, 9th Cir. 1986",
        "holding": "Officials cannot coerce entry into a home without a warrant or established exception.",
        "application": "Limits warrantless CPS home entries.",
        "use_for": ["warrantless_entry", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Doe v. Irwin, U.S. D. C. of Michigan 1985",
        "holding": "Parents' custody and nurture rights are fundamental and constitutionally protected.",
        "application": "Supports substantive due process challenges.",
        "use_for": ["family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Kelson v. Springfield, US Ct. App 9th Cir. 1985",
        "holding": "The parent-child relationship is a constitutionally protected liberty interest.",
        "application": "Supports family integrity claims.",
        "use_for": ["family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Bell v. City of Milwaukee, 7th Cir. 1984",
        "holding": "State severance of parent-child relationships requires rigorous due process protections.",
        "application": "Supports procedural challenges to removal proceedings.",
        "use_for": ["procedural_due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Langton v. Maloney, 527 F Supp 538, D.C. Conn. 1981",
        "holding": "State interference with custodial rights requires due process protections.",
        "application": "Supports due process objections to removal orders.",
        "use_for": ["procedural_due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "In the Interest of Cooper (Kansas 1980)",
        "holding": "Custody deprivation causes grievous loss and requires extensive due process protections.",
        "application": "Supports elevated procedural safeguards in custody cases.",
        "use_for": ["procedural_due_process", "family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Quilloin v. Walcott, 434 U.S. 246, 255 (1978)",
        "holding": "State breakup of a natural family cannot rest solely on best-interest analysis without proof of unfitness.",
        "application": "Supports challenges to removals lacking fitness findings.",
        "use_for": ["family_integrity", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Carson v. Elrod, 411 F Supp 645, 649; DC E.D. VA (1976)",
        "holding": "The parent-child bond is precious and should be zealously protected.",
        "application": "Supports family integrity and custody preservation arguments.",
        "use_for": ["family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Griswold v. Connecticut, 381 US 479 (1965)",
        "holding": "The Constitution protects familial privacy and personal decision-making.",
        "application": "Supports privacy-based challenges to intrusive CPS actions.",
        "use_for": ["family_integrity", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "May v. Anderson, 73 S. Ct. 840 (1952)",
        "holding": "Parental custody rights are far more precious than property rights.",
        "application": "Supports heightened protection for custody rights.",
        "use_for": ["family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Florida v. Bostick, 501 U.S. 429 (1991)",
        "holding": "Consent obtained through intimidation or harassment is not valid.",
        "application": "Challenges coerced consent in CPS investigations.",
        "use_for": ["coerced_consent", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Hafer v. Melo, S. Ct. 1991",
        "holding": "Government employees can be sued under 42 USC 1983 in their official and individual capacities.",
        "application": "Supports individual liability for CPS officials.",
        "use_for": ["qualified_immunity", "section_1983"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "McCord v. Maggio, 5th Cir. 1991",
        "holding": "Immunity can be lost when officials violate clearly established rights.",
        "application": "Supports defeating qualified immunity when rights are clear.",
        "use_for": ["qualified_immunity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Grossman v. City of Portland, 9th Cir. 1994",
        "holding": "Officials enforcing unconstitutional statutes are not entitled to qualified immunity.",
        "application": "Supports challenges to unconstitutional agency policies.",
        "use_for": ["qualified_immunity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Kalina v. Fletcher, S. Ct. 1997",
        "holding": "Prosecutors lack absolute immunity for false statements in warrant affidavits.",
        "application": "Supports claims against officials who submit false affidavits.",
        "use_for": ["qualified_immunity", "fabricated_evidence"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Forrester v. White, S. Ct. 1988",
        "holding": "Judges lack absolute immunity when acting in an administrative capacity.",
        "application": "Supports limits on immunity defenses for administrative acts.",
        "use_for": ["qualified_immunity"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "H.R. v. State Department of Human Resources, Ala. Ct. App. 1992",
        "holding": "An anonymous tip alone does not establish probable cause.",
        "application": "Challenges investigations and removals based on uncorroborated tips.",
        "use_for": ["warrantless_entry", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "California v. Hobari D., 499 U.S. 621 (1991)",
        "holding": "A seizure occurs when a reasonable person is not free to leave and yields to authority.",
        "application": "Defines seizure standards for child removals and interviews.",
        "use_for": ["fourth_amendment", "seizure"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Cassady v. Tackett, 938 F.2d 693 (1991)",
        "holding": "Coercive or intimidating behavior can compel compliance and violate due process.",
        "application": "Supports challenges to coerced cooperation in investigations.",
        "use_for": ["coerced_consent", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Chrissy v. Miss Department of Public Welfare, 5th Cir. 1991",
        "holding": "Officials can lose immunity for failing to investigate or disclose relevant reports.",
        "application": "Supports accountability for procedural failures.",
        "use_for": ["qualified_immunity", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "United States v. Becker, 9th Cir. 1991",
        "holding": "Fourth Amendment protections include knock-and-announce requirements.",
        "application": "Supports challenges to improper entry methods.",
        "use_for": ["warrantless_entry", "fourth_amendment"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Gross v. State of Illinois, 312 F 2d 257 (1963)",
        "holding": "State judges must protect individuals from federal constitutional violations.",
        "application": "Supports due process and constitutional oversight arguments.",
        "use_for": ["due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Blackburn v. Alabama, 361 U.S. 199, 206 (1960)",
        "holding": "Coercion can be mental as well as physical.",
        "application": "Supports challenges to coerced statements or consent.",
        "use_for": ["coerced_consent", "due_process"],
        "source": "Child-Related Court Rulings PDF"
    },
    {
        "citation": "Elrod v. Burns, 96 S. Ct. 1976",
        "holding": "Fundamental rights can be curtailed only by interests of vital importance.",
        "application": "Sets a high bar for state interference with family rights.",
        "use_for": ["family_integrity"],
        "source": "Child-Related Court Rulings PDF"
    }
]

# ============================================================================
# ROOKER-FELDMAN DOCTRINE & AVOIDANCE
# ============================================================================

ROOKER_FELDMAN = {
    "doctrine": "Federal district courts lack jurisdiction to review state court judgments; only the U.S. Supreme Court has such appellate jurisdiction.",
    "key_case": "Exxon Mobil Corp. v. Saudi Basic Industries Corp., 544 U.S. 280 (2005)",
    "limitation": "Narrow doctrine - only applies to cases 'brought by state-court losers complaining of injuries caused by state-court judgments'",
    "avoidance_strategies": [
        {
            "strategy": "Sue for INDEPENDENT constitutional violations, not state court decision",
            "explanation": "Frame lawsuit as challenging caseworker's unconstitutional CONDUCT (warrantless entry, fabricated evidence), NOT the state court's decision",
            "good_example": "Defendant violated Fourth Amendment by entering home without warrant on March 15, 2024.",
            "bad_example": "The state court erred in assuming jurisdiction based on illegally obtained evidence."
        },
        {
            "strategy": "File BEFORE state court final judgment if possible",
            "explanation": "Rooker-Feldman only applies AFTER state court renders final judgment. File Section 1983 during ongoing state proceedings.",
            "authority": "Lance v. Dennis, 546 U.S. 459 (2006)"
        },
        {
            "strategy": "Challenge CONDUCT not JUDGMENT",
            "good_claims": [
                "Warrantless entry violated Fourth Amendment",
                "Fabricating evidence violated due process",
                "Strip-searching child without exigency violated Fourth Amendment",
                "Coerced statements violated Fifth Amendment"
            ],
            "bad_claims": [
                "State court wrongly assumed jurisdiction",
                "State court wrongly ordered removal",
                "State court's custody decision was wrong"
            ]
        },
        {
            "strategy": "Seek DIFFERENT relief than state court proceedings",
            "good_relief": [
                "Monetary damages for constitutional violations",
                "Injunction against future warrantless searches",
                "Declaratory judgment that conduct was unconstitutional",
                "Punitive damages against caseworker personally"
            ],
            "bad_relief": [
                "Reverse state court's removal order",
                "Return children (ask state court for this)",
                "Vacate state court judgment"
            ]
        }
    ]
}

# ============================================================================
# BLACK'S LAW DICTIONARY DEFINITIONS
# ============================================================================

BLACKS_LAW_DEFINITIONS = {
    "Due Process": {
        "definition": "The conduct of legal proceedings according to established rules and principles for the protection and enforcement of private rights, including notice and the right to a fair hearing before a tribunal with the power to decide the case.",
        "citation": "Black's Law Dictionary (11th ed. 2019)",
        "application": "In CPS cases, due process requires notice of allegations, opportunity to be heard, right to counsel, and evidentiary hearing before deprivation of parental rights."
    },
    "Procedural Due Process": {
        "definition": "The minimal requirements of notice and a hearing guaranteed by the Due Process Clauses of the 5th and 14th Amendments.",
        "key_requirements": [
            "Notice - reasonable time, manner, and content",
            "Opportunity to be heard - meaningful chance to respond",
            "Neutral decision-maker - impartial judge",
            "Right to present evidence and witnesses",
            "Right to confront adverse witnesses",
            "Written decision with findings of fact"
        ]
    },
    "Substantive Due Process": {
        "definition": "The doctrine that the Due Process Clauses require legislation to be fair and reasonable in content and to further a legitimate governmental objective.",
        "standard": "Strict Scrutiny for fundamental rights"
    },
    "Fundamental Right": {
        "definition": "A right derived from natural or fundamental law; esp., one protected by the Due Process Clause of the U.S. Constitution.",
        "application": "Parental rights are fundamental liberty interests. Government interference requires strict scrutiny.",
        "authority": "Troxel v. Granville, 530 U.S. 57 (2000)"
    },
    "Strict Scrutiny": {
        "definition": "The standard applied to fundamental rights. The state must establish a compelling interest that justifies and necessitates the law in question.",
        "requirements": ["Compelling government interest", "Narrowly tailored means", "Least restrictive alternative"],
        "burden": "On the government, NOT the parent"
    },
    "Qualified Immunity": {
        "definition": "Immunity from civil liability for a public official performing a discretionary function, as long as the conduct does not violate clearly established constitutional or statutory rights.",
        "two_part_test": [
            "Was a constitutional right violated?",
            "Was the right clearly established at the time?"
        ]
    },
    "Parens Patriae": {
        "definition": "The state in its capacity as provider of protection to those unable to care for themselves.",
        "limitation": "Cannot override fundamental parental rights without compelling justification and due process."
    },
    "Imminent Danger": {
        "definition": "An immediate and present danger, not merely a fear of future harm.",
        "application": "Emergency removal requires IMMINENT danger - immediate risk of serious harm. Future or speculative risk insufficient.",
        "test": "Would removal of child from home prevent serious harm within the next 24-48 hours?"
    },
    "Clear and Convincing Evidence": {
        "definition": "Evidence indicating that the thing to be proved is highly probable or reasonably certain.",
        "application": "Required standard for termination of parental rights per Santosky v. Kramer.",
        "comparison": "Higher than preponderance of evidence, lower than beyond reasonable doubt."
    },
    "Hearsay": {
        "definition": "A statement other than one made by the declarant while testifying at trial, offered to prove the truth of the matter asserted.",
        "danger": "CPS often relies heavily on hearsay. Challenge admissibility."
    }
}

# ============================================================================
# CONSTITUTIONAL AMENDMENTS & RIGHTS
# ============================================================================

CONSTITUTIONAL_RIGHTS = {
    "fourth_amendment": {
        "text": "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated.",
        "cps_application": [
            "Home visits may be searches requiring warrants",
            "Child examinations may be searches",
            "Removal of children is a seizure",
            "Consent must be voluntary and informed"
        ],
        "exceptions": [
            "Valid warrant",
            "Voluntary consent (NOT coerced)",
            "Exigent circumstances (imminent danger)",
            "Emergency exception (immediate threat to life)"
        ],
        "key_cases": ["Calabretta v. Floyd", "Wallis v. Spencer", "Camara v. Municipal Court"]
    },
    "fifth_amendment": {
        "text": "No person shall be compelled in any criminal case to be a witness against himself.",
        "cps_application": [
            "Parents can refuse to answer questions that might incriminate",
            "CPS cannot coerce self-incriminating statements",
            "Applies even in civil proceedings if criminal consequences possible"
        ],
        "key_case": "Minnesota v. Murphy"
    },
    "fourteenth_amendment_due_process": {
        "text": "No State shall deprive any person of life, liberty, or property, without due process of law.",
        "cps_application": [
            "Right to notice before removal hearings",
            "Right to be heard at meaningful time and manner",
            "Right to present evidence and witnesses",
            "Right to confront and cross-examine witnesses",
            "Right to impartial decision-maker",
            "Right to written findings of fact"
        ],
        "key_cases": ["Stanley v. Illinois", "Santosky v. Kramer", "Lassiter v. DSS"]
    },
    "fourteenth_amendment_equal_protection": {
        "text": "No State shall deny to any person within its jurisdiction the equal protection of the laws.",
        "cps_application": [
            "Selective enforcement based on race, religion, or socioeconomic status prohibited",
            "Poverty alone cannot be basis for removal"
        ]
    }
}

# ============================================================================
# COMMON VIOLATION TYPES
# ============================================================================

VIOLATION_ANALYSIS = {
    "warrantless_entry": {
        "description": "CPS entered home without warrant, consent, or exigent circumstances",
        "constitutional_basis": "Fourth Amendment",
        "key_case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
        "elements": [
            "Government actor (CPS worker)",
            "Entry into constitutionally protected area (home)",
            "No warrant obtained",
            "No valid consent",
            "No exigent circumstances"
        ],
        "section_1983_viable": True,
        "qualified_immunity": "Likely defeated - clearly established law"
    },
    "coerced_consent": {
        "description": "CPS obtained entry through threats, deception, or coercion",
        "constitutional_basis": "Fourth Amendment",
        "key_case": "Schneckloth v. Bustamonte, 412 U.S. 218 (1973)",
        "coercion_indicators": [
            "Threats to remove children if denied entry",
            "Implied threats of arrest",
            "Police presence creating implicit coercion",
            "Misrepresentation of authority",
            "Failure to inform of right to refuse"
        ],
        "section_1983_viable": True
    },
    "inadequate_investigation": {
        "description": "CPS removed children without reasonable investigation",
        "constitutional_basis": "Fourteenth Amendment Due Process",
        "key_case": "Duchesne v. Sugarman, 566 F.2d 817 (2nd Cir. 1977)",
        "elements": [
            "Removal occurred",
            "Investigation was inadequate or non-existent",
            "Reasonable investigation would have prevented removal",
            "No true emergency existed"
        ],
        "section_1983_viable": True
    },
    "false_emergency": {
        "description": "CPS claimed emergency when no imminent danger existed",
        "constitutional_basis": "Fourth and Fourteenth Amendments",
        "key_case": "Gates v. Texas DHS, 537 F.3d 404 (5th Cir. 2008)",
        "analysis": {
            "imminent_danger_requires": [
                "Immediate threat of serious harm",
                "Cannot wait for court order",
                "Evidence of actual (not speculative) danger",
                "Reasonable belief based on articulable facts"
            ],
            "not_imminent_danger": [
                "Messy house",
                "Poverty",
                "Different parenting style",
                "Speculative future harm",
                "Hearsay allegations alone"
            ]
        },
        "section_1983_viable": True
    },
    "procedural_due_process": {
        "description": "CPS failed to provide proper notice or hearing",
        "constitutional_basis": "Fourteenth Amendment",
        "key_case": "Mathews v. Eldridge, 424 U.S. 319 (1976)",
        "required_procedures": [
            "Written notice of allegations",
            "Notice of hearing date with reasonable time to prepare",
            "Right to present evidence",
            "Right to cross-examine witnesses",
            "Impartial decision-maker",
            "Written findings of fact"
        ],
        "section_1983_viable": True
    },
    "fabricated_evidence": {
        "description": "CPS worker fabricated or falsified evidence",
        "constitutional_basis": "Fourteenth Amendment Due Process",
        "key_case": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
        "types": [
            "False statements in reports",
            "Coaching child witnesses",
            "Omitting exculpatory evidence",
            "Misrepresenting medical findings",
            "Creating misleading photos"
        ],
        "section_1983_viable": True,
        "qualified_immunity": "Defeated - clearly unconstitutional"
    },
    "strip_search": {
        "description": "Invasive physical examination of child without warrant or exigency",
        "constitutional_basis": "Fourth Amendment",
        "key_case": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
        "section_1983_viable": True,
        "qualified_immunity": "Defeated - clearly established"
    }
}

# ============================================================================
# SECTION 1983 GUIDANCE
# ============================================================================

SECTION_1983 = {
    "statute": "42 U.S.C. § 1983",
    "full_text": """Every person who, under color of any statute, ordinance, regulation, custom, or usage, 
of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen 
of the United States or other person within the jurisdiction thereof to the deprivation of any rights, 
privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured in 
an action at law, suit in equity, or other proper proceeding for redress.""",
    
    "elements": [
        "1. Action UNDER COLOR OF STATE LAW - CPS workers act under state authority",
        "2. DEPRIVATION of federal constitutional or statutory right",
        "3. By a 'PERSON' (individual caseworker, supervisor, or local government)",
        "4. Resulting in actual DAMAGES to the plaintiff"
    ],
    
    "constitutional_violations_commonly_claimed": {
        "fourth_amendment": {
            "name": "Fourth Amendment - Unreasonable Search & Seizure",
            "violations": [
                "Warrantless home entry without consent or exigent circumstances",
                "Warrantless removal of children (seizure)",
                "Strip searches or medical exams without consent/warrant",
                "Coerced or deceptive consent to entry",
                "Remaining in home after consent withdrawn"
            ],
            "key_cases": [
                "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999) - Warrantless entry violated 4th Amendment",
                "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000) - Strip searches of children unconstitutional",
                "Gates v. Texas Dept. of Protective Services, 537 F.3d 404 (5th Cir. 2008)",
                "Camara v. Municipal Court, 387 U.S. 523 (1967) - Home is constitutionally protected"
            ]
        },
        "fourteenth_amendment_substantive": {
            "name": "Fourteenth Amendment - Substantive Due Process",
            "violations": [
                "Interference with fundamental right to family integrity",
                "Removal without imminent danger",
                "False allegations to justify removal",
                "Fabrication of evidence",
                "Shock-the-conscience conduct"
            ],
            "key_cases": [
                "Troxel v. Granville, 530 U.S. 57 (2000) - Parents have fundamental liberty interest",
                "Stanley v. Illinois, 405 U.S. 645 (1972) - Fundamental right to parent",
                "Duchesne v. Sugarman, 566 F.2d 817 (2d Cir. 1977) - Wrongful removal violates due process"
            ]
        },
        "fourteenth_amendment_procedural": {
            "name": "Fourteenth Amendment - Procedural Due Process",
            "violations": [
                "Removal without pre-deprivation hearing",
                "Inadequate notice of allegations",
                "No opportunity to respond before removal",
                "Ex parte orders without justification",
                "Denial of meaningful hearing"
            ],
            "key_cases": [
                "Santosky v. Kramer, 455 U.S. 745 (1982) - Clear and convincing evidence required for TPR",
                "Lassiter v. Dept. of Social Services, 452 U.S. 18 (1981) - Right to counsel may be required",
                "Mathews v. Eldridge, 424 U.S. 319 (1976) - Three-factor test for procedural due process"
            ]
        },
        "first_amendment": {
            "name": "First Amendment - Religion & Expression",
            "violations": [
                "Removal based on religious practices",
                "Discrimination against homeschooling",
                "Retaliation for exercising free speech",
                "Religious bias in placement decisions"
            ],
            "key_cases": [
                "Wisconsin v. Yoder, 406 U.S. 205 (1972) - Religious liberty in education"
            ]
        }
    },
    
    "defendants": {
        "individual_capacity": {
            "description": "Sue the caseworker, supervisor, or official PERSONALLY for damages",
            "what_you_can_recover": ["Compensatory damages", "Punitive damages", "Attorney fees"],
            "advantages": [
                "Can recover compensatory damages (emotional distress, lost income)",
                "Can recover PUNITIVE damages if conduct was malicious/reckless",
                "No Eleventh Amendment immunity"
            ],
            "challenges": ["Must overcome QUALIFIED IMMUNITY defense"],
            "strategy": "Name the specific caseworker, their supervisor, and any officials who approved the actions"
        },
        "official_capacity": {
            "description": "Equivalent to suing the government agency",
            "what_you_can_recover": ["Injunctive relief (stop the conduct)", "Declaratory relief"],
            "limitations": "NO monetary damages against individuals in official capacity",
            "when_to_use": "When seeking court order to return children or stop ongoing violations"
        },
        "monell_liability": {
            "description": "Sue the COUNTY or LOCAL AGENCY directly (not the state)",
            "requirements": [
                "A constitutional violation occurred",
                "Violation was caused by an OFFICIAL POLICY or CUSTOM",
                "The policy was the 'MOVING FORCE' behind the violation"
            ],
            "policies_that_count": [
                "Written policies that violate rights",
                "Widespread practices even if unwritten",
                "Failure to train when need is obvious",
                "Deliberate indifference to constitutional violations"
            ],
            "authority": "Monell v. Dept. of Social Services, 436 U.S. 658 (1978)",
            "note": "States and state agencies have Eleventh Amendment immunity - sue COUNTIES instead"
        }
    },
    
    "damages_recoverable": {
        "compensatory": {
            "description": "Actual damages suffered",
            "categories": [
                "Emotional distress and mental anguish",
                "Damage to parent-child relationship",
                "Lost wages (time off work for hearings, etc.)",
                "Medical/therapy expenses",
                "Reputation damage",
                "Humiliation and embarrassment"
            ],
            "note": "Emotional distress alone can support substantial damages in family separation cases"
        },
        "punitive": {
            "description": "Punishment for especially egregious conduct",
            "requirements": "Defendant acted with reckless or callous indifference to rights, or with evil motive",
            "available_against": "Individual defendants only (not government entities)"
        },
        "nominal": {
            "description": "$1 when violation proven but no actual damages",
            "importance": "Establishes the violation occurred and entitles you to attorney fees"
        },
        "attorney_fees": {
            "statute": "42 U.S.C. § 1988",
            "rule": "Prevailing plaintiff is entitled to reasonable attorney fees",
            "note": "This makes contingency representation possible for civil rights cases"
        }
    },
    
    "qualified_immunity": {
        "what_it_is": "A defense that shields government officials from liability unless they violated 'clearly established' law",
        "two_prong_test": [
            "PRONG 1: Did the defendant violate a constitutional right?",
            "PRONG 2: Was the right 'CLEARLY ESTABLISHED' at the time of the conduct?"
        ],
        "clearly_established_means": [
            "Existing court precedent with SIMILAR facts (not identical)",
            "The violation was so obvious that any reasonable official would know",
            "No need for a case with exact same facts - just 'fair warning'"
        ],
        "how_to_defeat_qualified_immunity": [
            "Cite cases from YOUR circuit with similar facts",
            "Argue the violation was obvious under general constitutional principles",
            "Show pattern of similar misconduct (no good faith defense)",
            "Demonstrate intentional violation of known rights",
            "Use Supreme Court cases establishing the underlying right"
        ],
        "cases_where_qualified_immunity_defeated_for_cps": [
            {
                "case": "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)",
                "facts": "CPS and police entered home without warrant based on anonymous tip",
                "holding": "Qualified immunity DENIED - clearly established that warrantless entry requires warrant, consent, or exigent circumstances"
            },
            {
                "case": "Wallis v. Spencer, 202 F.3d 1126 (9th Cir. 2000)",
                "facts": "Children strip-searched and subjected to intrusive exams without warrant",
                "holding": "Qualified immunity DENIED - clearly established that strip searches of children require warrant"
            },
            {
                "case": "Duchesne v. Sugarman, 566 F.2d 817 (2d Cir. 1977)",
                "facts": "Children removed without emergency circumstances",
                "holding": "Clearly established that removal requires imminent danger or court order"
            },
            {
                "case": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
                "facts": "Caseworker fabricated evidence in abuse investigation",
                "holding": "Qualified immunity DENIED - deliberately fabricating evidence violates clearly established due process rights"
            },
            {
                "case": "Rogers v. County of San Joaquin, 487 F.3d 1288 (9th Cir. 2007)",
                "facts": "Caseworkers provided false information to obtain removal order",
                "holding": "Qualified immunity may be denied for knowingly false statements"
            }
        ],
        "recent_developments_2024_2025": [
            {
                "case": "Bambach v. Moegle (6th Cir. Feb. 2024)",
                "holding": "CPS workers received qualified immunity for temporarily retaining children after initial consent",
                "lesson": "Document the EXACT moment consent is withdrawn"
            },
            {
                "note": "Supreme Court petition filed 2025 questioning qualified immunity for CPS workers",
                "status": "Circuit split exists on how to apply qualified immunity in CPS cases"
            },
            {
                "trend": "Courts increasingly scrutinizing CPS claims of qualified immunity",
                "strategy": "Build strong record of clearly established violations in your circuit"
            }
        ]
    },
    
    "rooker_feldman_doctrine": {
        "what_it_is": "Federal courts cannot review state court judgments - your Section 1983 case may be dismissed if it looks like you're appealing a state court decision",
        "how_to_avoid_dismissal": [
            "Challenge the CONDUCT of caseworkers, not the state court's DECISION",
            "File BEFORE the state case is final if possible",
            "Focus on constitutional violations that occurred INDEPENDENT of court proceedings",
            "Sue for actions taken OUTSIDE of court (investigations, interviews, removals)",
            "Seek damages for the PROCESS used, not the outcome"
        ],
        "safe_claims": [
            "Warrantless entry (happened before any court involvement)",
            "Coerced statements (conduct of investigation)",
            "Fabricated evidence (even if used in court, the fabrication is the wrong)",
            "Failure to investigate exculpatory evidence"
        ],
        "risky_claims": [
            "The state court got it wrong",
            "Challenging the custody decision itself",
            "Seeking return of children through federal court"
        ]
    },
    
    "statute_of_limitations": {
        "general_rule": "Borrows from state personal injury statute - typically 2-3 years",
        "when_it_starts": "When plaintiff knew or should have known of the violation",
        "tolling_for_minors": "Clock may not start until child reaches 18",
        "continuing_violation": "Each day of wrongful separation may be new violation",
        "important": "Check YOUR state's personal injury statute of limitations"
    },
    
    "filing_strategy": {
        "where_to_file": "Federal district court (preferred) or state court",
        "why_federal": [
            "Federal judges more familiar with constitutional issues",
            "Federal Rules of Civil Procedure often more favorable",
            "Jury pools may be more diverse"
        ],
        "complaint_requirements": [
            "Identify all defendants by name and position",
            "State claims under 42 U.S.C. § 1983",
            "Identify specific constitutional rights violated",
            "Allege facts showing defendants acted under color of state law",
            "Allege facts showing how each defendant was personally involved",
            "Request specific relief (damages, injunction, attorney fees)"
        ],
        "discovery_opportunities": [
            "Subpoena CPS records and internal communications",
            "Depose caseworkers under oath",
            "Request training records (for Monell claims)",
            "Request complaint history of caseworker",
            "Request policies and procedures"
        ]
    },
    
    "practical_steps_to_file_section_1983": [
        {
            "step": 1,
            "action": "DOCUMENT EVERYTHING",
            "details": "Keep detailed records of all interactions with CPS, including dates, times, names, and what was said"
        },
        {
            "step": 2,
            "action": "IDENTIFY THE VIOLATIONS",
            "details": "Use this guide to identify which constitutional rights were violated"
        },
        {
            "step": 3,
            "action": "IDENTIFY THE DEFENDANTS",
            "details": "Name specific caseworkers, supervisors, and the county/agency"
        },
        {
            "step": 4,
            "action": "RESEARCH YOUR CIRCUIT'S CASE LAW",
            "details": "Find cases in your federal circuit with similar facts where qualified immunity was denied"
        },
        {
            "step": 5,
            "action": "CONSULT A CIVIL RIGHTS ATTORNEY",
            "details": "Section 1983 cases are complex - find an attorney experienced in civil rights litigation"
        },
        {
            "step": 6,
            "action": "FILE COMPLAINT IN FEDERAL COURT",
            "details": "Ensure complaint is detailed enough to survive motion to dismiss"
        },
        {
            "step": 7,
            "action": "PREPARE FOR QUALIFIED IMMUNITY MOTION",
            "details": "Defendants will almost always raise this - be ready with case law"
        }
    ]
}

# ============================================================================
# FEDERAL STATUTES
# ============================================================================

FEDERAL_STATUTES = {
    "CAPTA": {
        "name": "Child Abuse Prevention and Treatment Act",
        "citation": "42 U.S.C. §§ 5101-5119",
        "requirements": [
            "States must have CPS system to receive federal funding",
            "Must have procedures for reporting and investigating",
            "Must have procedures to protect children",
            "Must have procedures to protect parents' rights"
        ],
        "violations": ["Failure to follow mandatory procedures", "Inadequate investigation protocols"]
    },
    "ASFA": {
        "name": "Adoption and Safe Families Act",
        "citation": "Pub. L. 105-89 (1997)",
        "key_provisions": [
            "Reasonable efforts to prevent removal required",
            "Reasonable efforts for reunification required",
            "Permanency hearing within 12 months",
            "TPR petition if child in care 15 of 22 months"
        ],
        "violations": ["Failure to make reasonable efforts", "Missing timelines"]
    },
    "ICWA": {
        "name": "Indian Child Welfare Act",
        "citation": "25 U.S.C. §§ 1901-1963",
        "key_provisions": [
            "Applies to Indian children (member or eligible for membership)",
            "Notice to tribe required",
            "Active efforts (higher than reasonable efforts) required",
            "Placement preferences for Indian families",
            "Qualified expert witness required for removal"
        ],
        "violations": ["Failure to notify tribe", "Failure to make active efforts", "Ignoring placement preferences"]
    }
}

USEFUL_CASE_LAW_INDEX = {
    "title": "Useful Case Law Index",
    "sections": [
        {
            "title": "Subject-Matter Jurisdiction & UCCJEA (Power to Act)",
            "purpose": "Challenges court authority to open the case or act without jurisdiction.",
            "cases": [
                {"name": "Ex parte Fordham", "citation": "144 So. 3d 319", "note": "Mandatory UCCJEA jurisdictional requirements."},
                {"name": "J.B. v. A.B.", "citation": "888 So. 2d 528", "note": "Rule 60(b) + lack of UCCJEA subject matter = void order."},
                {"name": "Ex parte K.L.P.", "citation": "868 So. 2d 454", "note": "How a court acquires jurisdiction."},
                {"name": "Ex parte Sealy, LLC", "citation": "904 So. 2d 1230", "note": "Dismissal and case nullity due to lack of jurisdiction."},
                {"name": "Ex parte S.T.S.", "citation": "806 So. 2d 336", "note": "Limits of juvenile court authority."},
                {"name": "Ex parte R.S.C.", "citation": "853 So. 2d 228", "note": "Standards for jurisdictional findings in child cases."},
                {"name": "Ex parte Jim Walter Homes, Inc.", "citation": "(1998)", "note": "Fundamental limits on court power; no jurisdiction means void."},
                {"name": "Ex parte Bridges", "citation": "925 So. 2d 189", "note": "Writ of prohibition when court acts without jurisdiction."},
                {"name": "Kulko v. Superior Ct.", "citation": "436 U.S. 84", "note": "Federal limits on personal jurisdiction."},
                {"name": "Roman Catholic Archdiocese of San Juan v. Feliciano", "citation": "589 U.S. (2020)", "note": "No jurisdiction = no power to act."}
            ]
        },
        {
            "title": "Service of Process & Procedural Rules (Notice and Rule 4/13)",
            "purpose": "Support arguments that service was fraudulent or legally insufficient.",
            "cases": [
                {"name": "M.M. v. B.L. and M.L.", "citation": "926 So. 2d 1038", "note": "Proper service under Rule 4 and Rule 13."},
                {"name": "T.B. v. T.H.", "citation": "30 So. 3d 445", "note": "Service of summons is mandatory to initiate a case."},
                {"name": "R.M. v. Elmore County DHR", "citation": "(2011)", "note": "Proper service is a prerequisite for state intervention."},
                {"name": "T.F.H. v. A.L.S.", "citation": "(2023)", "note": "Modern application of Rule 13 dependency procedures."},
                {"name": "Mullane v. Central Hanover Bank", "citation": "339 U.S. 306", "note": "Notice must be reasonably calculated to reach you."},
                {"name": "Armstrong v. Manzo", "citation": "380 U.S. 545", "note": "Failure to provide notice violates the 14th Amendment."},
                {"name": "Ex parte Weeks", "citation": "611 So. 2d 259", "note": "Technical requirements for legal notice."},
                {"name": "Ex parte Powell", "citation": "(var.)", "note": "Standards for service and due process."},
                {"name": "Hales v. Scott", "citation": "(1985)", "note": "Alabama Supreme Court on service of process."},
                {"name": "Crawford v. Hall", "citation": "531 So. 2d 874", "note": "Procedural rules for initiating claims."}
            ]
        },
        {
            "title": "Void Judgments, Nunc Pro Tunc, & Fraud (Rule 60(b))",
            "purpose": "Attack void orders and retroactive attempts to fix the record.",
            "cases": [
                {"name": "Ex parte Courtyard Citiflats (Arrington)", "citation": "259 So. 3d 669", "note": "Nunc pro tunc cannot fix lack of jurisdiction."},
                {"name": "B.W. v. S.S.", "citation": "(2022)", "note": "Rule 60(b) standard to set aside."},
                {"name": "United States v. Throckmorton", "citation": "(1878)", "note": "Fraud on the court vacates all actions."},
                {"name": "Hartford-Empire Co. v. Hazel-Atlas Glass Co.", "citation": "(1944)", "note": "Fraudulent judgments are unenforceable."},
                {"name": "Ex parte Full Circle Distribution, LLC", "citation": "(2003)", "note": "Standard for vacating void judgments under Rule 60(b)."},
                {"name": "Insurance Mgt. & Admin. v. Palomar Ins.", "citation": "(1991)", "note": "Rule 60(b) for jurisdictional defects."},
                {"name": "Ex parte Turner", "citation": "(2002)", "note": "Relief from judgments and appellate rights."},
                {"name": "Ex parte Antonucci", "citation": "(2005)", "note": "Mandatory standards for vacating orders."}
            ]
        },
        {
            "title": "DHR Accountability & Reasonable Efforts",
            "purpose": "Hold DHR to its burden and reunification obligations.",
            "cases": [
                {"name": "M.A.J. v. S.F.", "citation": "994 So. 2d 280", "note": "DHR must prove reasonable efforts were made."},
                {"name": "T.B. v. Cullman Cnty. DHR", "citation": "6 So. 3d 1195", "note": "State carries burden of proof for reunification."},
                {"name": "Ex parte McDaniel", "citation": "291 So. 3d 847", "note": "Rights of parents in dependency proceedings."},
                {"name": "N.J.D. v. Madison County DHR", "citation": "110 So. 3d 387", "note": "Dependency standards and parental rights."},
                {"name": "K.P. v. Madison County DHR", "citation": "243 So. 3d 835", "note": "DHR accountability."},
                {"name": "R.D. v. Coffee County DHR", "citation": "204 So. 3d 425", "note": "Standards for state interference in family units."},
                {"name": "Ex parte L.E.O.", "citation": "61 So. 3d 1042", "note": "Standard for dependency findings."},
                {"name": "In re Gault", "citation": "387 U.S. 1", "note": "Constitutional due process in juvenile proceedings."}
            ]
        },
        {
            "title": "ADA, Civil Rights, & Federal Protections",
            "purpose": "ADA/rehab act protections and civil rights limits on state action.",
            "cases": [
                {"name": "Bircoll v. Miami Dade County", "citation": "(2007)", "note": "ADA applies to law enforcement and state administrative actions."},
                {"name": "Alexander v. Choate", "citation": "469 U.S. 287", "note": "Meaningful access under ADA/Rehab Act."},
                {"name": "Taylor v. Sturgell", "citation": "553 U.S. 880", "note": "Limits on virtual representation."},
                {"name": "Sweeney v. Alabama ABC Board", "citation": "(2000)", "note": "Civil rights and state agency overreach."}
            ]
        },
        {
            "title": "Comprehensive Alabama Ex Parte and Misc. Citations",
            "purpose": "Additional Alabama authorities organized by writs, finality, dependency, due process, and evidence standards.",
            "cases": [
                {"name": "Ex parte SCW / Ex parte McInish", "citation": "47 So. 3d 767", "note": "Evidentiary standards; clear and convincing evidence."},
                {"name": "Ex parte McConico", "citation": "315 So. 3d 610", "note": "Mandamus/prohibition standards."},
                {"name": "Ex parte Roberts", "citation": "(var.)", "note": "Due process and notice standards."},
                {"name": "Ex parte Powell", "citation": "(var.)", "note": "Service and due process standards."},
                {"name": "Ex parte Weeks", "citation": "611 So. 2d 259", "note": "Notice requirements."},
                {"name": "Ex parte J.M.S.", "citation": "303 So. 3d 155", "note": "Rights in G.C.S. v. J.M.S."},
                {"name": "Ex parte Moore", "citation": "880 So. 2d 1131", "note": "Finality of judgments."},
                {"name": "Ex parte R.D.", "citation": "313 So. 3d 1119", "note": "Dependency standards; termination of parental rights."},
                {"name": "Ex parte Jenkins / Ex parte Smith", "citation": "(var.)", "note": "Extraordinary writs when no adequate remedy."},
                {"name": "Ex parte T.C.", "citation": "63 So. 3d 627", "note": "Supersedeas/stay during appeal."},
                {"name": "Ex parte Third Generation, Inc.", "citation": "(2003)", "note": "Law of the case; limits on revisiting final orders."},
                {"name": "Ex parte Pate IV / Ex parte GC", "citation": "(var.)", "note": "Procedural due process under ARJuvP."},
                {"name": "Ex parte CLJ / Ex parte RDN / Ex parte Alfa Mut. General Ins. Co.", "citation": "(var.)", "note": "Rule 8/Rule 60(b) mechanics and defect attacks."}
            ]
        },
        {
            "title": "Stop Order (Writs of Mandamus & Prohibition)",
            "purpose": "Freeze proceedings when a lower court acts without jurisdiction.",
            "cases": [
                {"name": "Ex parte McConico", "citation": "315 So. 3d 610", "note": "Gold standard for mandamus/prohibition."},
                {"name": "Ex parte Bridges", "citation": "925 So. 2d 189", "note": "Writ of prohibition; court must be prohibited from continuing."},
                {"name": "Ex parte Jenkins / Ex parte Smith", "citation": "(var.)", "note": "Extraordinary writ when no adequate remedy at law."}
            ]
        },
        {
            "title": "Finality & Voidness Doctrine (Rule 60)",
            "purpose": "Once a case is void or final, it cannot be revived without strict Rule 60 compliance.",
            "cases": [
                {"name": "Ex parte Moore", "citation": "880 So. 2d 1131", "note": "Finality of judgments."},
                {"name": "Ex parte Jim Walter Homes, Inc.", "citation": "(1998)", "note": "Void orders for lack of subject matter jurisdiction."},
                {"name": "Ex parte Third Generation, Inc.", "citation": "(2003)", "note": "Law of the case; limits on revisiting final orders."},
                {"name": "Ex parte RDN / Ex parte Alfa Mut. General Ins. Co.", "citation": "(var.)", "note": "Rule 8/Rule 60(b) mechanics."}
            ]
        },
        {
            "title": "Dependency & Parental Rights (DHR Tactics)",
            "purpose": "Challenge dependency findings and burden of proof tactics.",
            "cases": [
                {"name": "Ex parte J.M.S.", "citation": "303 So. 3d 155", "note": "Best interests vs natural rights of parent."},
                {"name": "Ex parte T.C.", "citation": "63 So. 3d 627", "note": "Stay/supersedeas authority."},
                {"name": "Ex parte R.D.", "citation": "313 So. 3d 1119", "note": "High burden for termination of parental rights."},
                {"name": "Ex parte Boykin", "citation": "656 So. 2d 821", "note": "Income/ability to pay vs willful failure."}
            ]
        },
        {
            "title": "Due Process & Notice (You Didn't Tell Me)",
            "purpose": "Challenge actions taken without fair notice or hearing.",
            "cases": [
                {"name": "Ex parte Weeks", "citation": "611 So. 2d 259", "note": "Notice violation invalidates orders."},
                {"name": "Ex parte Powell / Ex parte Roberts", "citation": "(var.)", "note": "Right to be heard and to counsel; due process."},
                {"name": "Ex parte Pate IV / Ex parte GC", "citation": "(var.)", "note": "ARJuvP procedural due process requirements."}
            ]
        },
        {
            "title": "Judicial Evidence & Record Striking",
            "purpose": "Remove fraudulent filings or hearsay from the record.",
            "cases": [
                {"name": "Ex parte McInish / Ex parte SCW", "citation": "47 So. 3d 767", "note": "Evidentiary standards; clear and convincing evidence."},
                {"name": "Ex parte CLJ", "citation": "(var.)", "note": "Clear and convincing evidence; evidentiary foundations."}
            ]
        }
    ]
}

def get_relevant_case_law(violation_type: str) -> dict:
    """Get relevant case law for a specific violation type."""
    case_law = []
    normalized = (violation_type or "").lower()
    key = normalized.replace(" ", "_")

    def matches(terms) -> bool:
        return any(term in normalized for term in terms)

    if key in ["fourth_amendment", "warrantless_entry", "warrantless_search"] or matches([
        "fourth amendment", "warrantless", "search", "entry", "seizure", "home visit"
    ]):
        case_law.extend([
            CIRCUIT_COURT_CASES["calabretta_v_floyd"],
            CIRCUIT_COURT_CASES["wallis_v_spencer"],
            SUPREME_COURT_CASES["camara"]
        ])
    
    if key in ["fourteenth_amendment", "due_process", "procedural_due_process", "substantive_due_process"] or matches([
        "due process", "fourteenth amendment", "procedural", "substantive"
    ]):
        case_law.extend([
            SUPREME_COURT_CASES["stanley"],
            SUPREME_COURT_CASES["santosky"],
            CIRCUIT_COURT_CASES["duchesne_v_sugarman"]
        ])
    
    if key in ["emergency_removal", "imminent_danger"] or matches([
        "emergency", "imminent danger", "removal"
    ]):
        case_law.extend([
            CIRCUIT_COURT_CASES["gates_v_texas"],
            CIRCUIT_COURT_CASES["duchesne_v_sugarman"]
        ])
    
    if key in ["fabricated_evidence", "falsified_reports"] or matches([
        "fabricated", "falsified", "false report", "perjury"
    ]):
        case_law.append({
            "citation": "Devereaux v. Abbey, 263 F.3d 1070 (9th Cir. 2001)",
            "holding": "Deliberate fabrication of evidence violates due process",
            "qualified_immunity": "Defeated"
        })

    if key in ["family_integrity", "parental_rights", "custody_rights"] or matches([
        "family integrity", "parental rights", "custody", "family separation", "parent-child"
    ]):
        case_law.extend([
            SUPREME_COURT_CASES["troxel"],
            SUPREME_COURT_CASES["stanley"],
            SUPREME_COURT_CASES["santosky"]
        ])

    if key in ["coerced_consent", "consent"] or matches([
        "coercion", "coerced consent", "intimidation", "duress"
    ]):
        case_law.extend([
            {
                "citation": "Florida v. Bostick, 501 U.S. 429 (1991)",
                "holding": "Consent obtained through official intimidation or harassment is not valid consent.",
                "application": "Consent in CPS investigations must be voluntary and free from coercion."
            }
        ])

    for ruling in CHILD_RELATED_COURT_RULINGS:
        use_for = ruling.get("use_for", [])
        if key in use_for or any(term.replace("_", " ") in normalized for term in use_for) or any(term in normalized for term in use_for):
            case_law.append(ruling)

    return {
        "violation_type": violation_type,
        "relevant_cases": case_law,
        "constitutional_basis": get_constitutional_basis(violation_type),
        "section_1983_viable": True
    }

def get_constitutional_basis(violation_type: str) -> str:
    """Get constitutional basis for violation type."""
    mapping = {
        "fourth_amendment": "Fourth Amendment - Protection against unreasonable searches and seizures",
        "warrantless_entry": "Fourth Amendment - Warrantless home entry",
        "warrantless_search": "Fourth Amendment - Warrantless search",
        "strip_search": "Fourth Amendment - Invasive bodily search",
        "coerced_consent": "Fourth Amendment - Involuntary consent",
        "fourteenth_amendment": "Fourteenth Amendment - Due Process",
        "due_process": "Fourteenth Amendment - Due Process Clause",
        "procedural_due_process": "Fourteenth Amendment - Procedural Due Process",
        "substantive_due_process": "Fourteenth Amendment - Substantive Due Process",
        "family_integrity": "Fourteenth Amendment - Family integrity and parental rights",
        "parental_rights": "Fourteenth Amendment - Parental rights",
        "custody_rights": "Fourteenth Amendment - Custody and care of children",
        "emergency_removal": "Fourth and Fourteenth Amendments",
        "inadequate_investigation": "Fourteenth Amendment - Due Process",
        "fabricated_evidence": "Fourteenth Amendment - Due Process",
        "fifth_amendment": "Fifth Amendment - Self-incrimination",
        "equal_protection": "Fourteenth Amendment - Equal Protection",
        "seizure": "Fourth Amendment - Seizure of person",
        "section_1983": "42 U.S.C. § 1983 - Civil Rights"
    }
    return mapping.get(violation_type, "Constitutional violation")


def analyze_qualified_immunity(violation_type: str) -> dict:
    """Analyze qualified immunity for a given violation type."""
    # Get relevant violation analysis
    violation_info = VIOLATION_ANALYSIS.get(violation_type, {})
    
    # Default immunity analysis
    immunity_analysis = {
        "violation_type": violation_type,
        "qualified_immunity_likely_defeated": False,
        "clearly_established": False,
        "key_cases": [],
        "analysis": "Qualified immunity analysis requires case-specific facts.",
        "recommendations": []
    }
    
    # Check if this violation type has clear precedent
    clearly_established_violations = [
        "warrantless_entry", "strip_search", "fabricated_evidence",
        "coerced_consent", "false_emergency", "procedural_due_process"
    ]
    
    if violation_type in clearly_established_violations:
        immunity_analysis["qualified_immunity_likely_defeated"] = True
        immunity_analysis["clearly_established"] = True
        immunity_analysis["analysis"] = f"The right against {violation_type.replace('_', ' ')} is clearly established. Qualified immunity is likely to be defeated."
    
    # Add key cases from violation analysis
    if violation_info:
        immunity_analysis["key_cases"].append(violation_info.get("key_case", ""))
        immunity_analysis["section_1983_viable"] = violation_info.get("section_1983_viable", False)
        if violation_info.get("qualified_immunity"):
            immunity_analysis["qualified_immunity_notes"] = violation_info.get("qualified_immunity")
    
    # Add recommendations
    immunity_analysis["recommendations"] = [
        "Document all facts showing the violation was obvious",
        "Cite cases from your circuit with similar facts",
        "Show pattern of similar misconduct if applicable",
        "Demonstrate intentional violation of known rights"
    ]
    
    return immunity_analysis



COMPREHENSIVE_LEGAL_DOC_LIBRARY = [
    {
        "id": "usdc_emergency_motion_quash_2025",
        "title": "Emergency Motion to Quash (Evers v. Tennessee DCS)",
        "source_type": "court_filing",
        "citation": "Evers v. Tennessee Department of Children’s Services, Civil Case No. 3:25-cv-00199 (E.D. Tenn. 2025)",
        "source_file": "knowledge_docs/usdc_emergency_motion_quash_2025.txt",
        "summary": "Emergency motion seeking to quash CPS paperwork alleging failure to protect. Details alleged retaliation, lack of evidence, and Fourth/Fourteenth Amendment violations; requests TRO and emergency hearing.",
        "tags": ["emergency motion", "retaliation", "failure_to_protect", "TRO", "Fourth Amendment", "Fourteenth Amendment"],
        "key_takeaways": [
            "Challenges CPS service based on lack of evidence and alleged bad faith.",
            "Frames pattern of harassment and retaliatory enforcement.",
            "Seeks TRO/preliminary injunction and emergency hearing timelines.",
            "Alleges violations of Fourth and Fourteenth Amendment rights."
        ],
        "use_for": ["emergency_motion", "retaliation", "procedural_due_process", "warrantless_entry"],
        "content_excerpt": "Emergency Motion to Quash... seeks TRO, preliminary injunction, and emergency hearing."
    },
    {
        "id": "mccormick_v_braverman_2006",
        "title": "McCormick v. Braverman",
        "source_type": "case_law",
        "citation": "McCormick v. Braverman, 451 F.3d 382 (6th Cir. 2006)",
        "source_file": "knowledge_docs/mccormick_v_braverman_2006.txt",
        "summary": "Sixth Circuit decision clarifying limits of Rooker-Feldman, distinguishing independent federal claims from state-court judgment injuries, and applying collateral estoppel.",
        "tags": ["Rooker-Feldman", "collateral estoppel", "federal jurisdiction", "due process"],
        "key_takeaways": [
            "Rooker-Feldman applies only to injuries caused by state court judgments.",
            "Independent claims based on third-party misconduct may proceed.",
            "Preclusion (collateral estoppel) can bar relitigation of issues.",
            "Discusses privity and limits on federal review of state orders."
        ],
        "use_for": ["jurisdiction", "rooker_feldman", "collateral_estoppel", "federal_claims"],
        "content_excerpt": "Clarifies that federal claims alleging independent injury are not barred by Rooker-Feldman."
    },
    {
        "id": "fjc_benchbook_2013",
        "title": "Federal Judicial Center Benchbook (6th Ed.)",
        "source_type": "benchbook",
        "citation": "Benchbook for U.S. District Court Judges, 6th Ed. (Federal Judicial Center, 2013)",
        "source_file": "knowledge_docs/bench_book_federal_judges.txt",
        "summary": "Comprehensive judicial procedures guide covering criminal and civil proceedings, Brady obligations, case management, jury instructions, and motions.",
        "tags": ["benchbook", "procedure", "motions", "Brady", "case management"],
        "key_takeaways": [
            "Provides procedural scripts and checklists for hearings and motions.",
            "Outlines Brady/Giglio disclosure obligations.",
            "Includes guidance on injunctions and contempt proceedings.",
            "Emphasizes due process, notice, and jury instruction standards."
        ],
        "use_for": ["procedural_guidance", "injunctions", "motions", "brady"],
        "content_excerpt": "Benchbook provides step-by-step guidance for federal court procedures and hearings."
    },
    {
        "id": "child_welfare_reform_act_2024",
        "title": "Comprehensive Child Welfare Reform and Accountability Act (Draft)",
        "source_type": "draft_bill",
        "citation": "Comprehensive Child Welfare Reform and Accountability Act of 2024 (Draft)",
        "source_file": "knowledge_docs/child_welfare_reform_act_draft.txt",
        "summary": "Draft legislative proposal to abolish CPS, create Department of Child Welfare, mandate family preservation, raise evidentiary standards, and remove immunity protections.",
        "tags": ["policy", "legislation", "family_preservation", "accountability"],
        "key_takeaways": [
            "Establishes stringent evidentiary standards for removal (clear and convincing evidence).",
            "Eliminates qualified immunity for child welfare employees.",
            "Prioritizes family preservation and voluntary services.",
            "Creates oversight bodies and public transparency mandates."
        ],
        "use_for": ["policy_advocacy", "legislative_reform", "family_preservation"],
        "content_excerpt": "Calls for abolition of CPS and creation of a transparent, accountable DCW."
    },
    {
        "id": "ncstn_trauma_core_concepts",
        "title": "NCTSN Core Curriculum on Childhood Trauma (Ella Case)",
        "source_type": "trauma_guide",
        "citation": "NCTSN Core Curriculum on Childhood Trauma (2013–2020 materials)",
        "source_file": "knowledge_docs/core_curriculum_childhood_trauma.txt",
        "summary": "Trauma-informed care guidance using the Ella case study and 12 core concepts for understanding trauma responses in children.",
        "tags": ["trauma_informed", "childhood_trauma", "core_concepts"],
        "key_takeaways": [
            "Defines 12 core concepts for trauma-informed practice.",
            "Highlights caregiver distress and secondary traumatic stress.",
            "Emphasizes safety, development, and family system impacts.",
            "Provides case-based learning for child welfare practitioners."
        ],
        "use_for": ["trauma_informed_care", "child_impact", "family_support"],
        "content_excerpt": "Provides a structured trauma-informed framework for child welfare contexts."
    }
]


_KNOWLEDGE_TEXT_CACHE = {}


def _load_knowledge_text(source_file: str) -> str:
    if not source_file:
        return ""
    if source_file in _KNOWLEDGE_TEXT_CACHE:
        return _KNOWLEDGE_TEXT_CACHE[source_file]
    abs_path = os.path.join(os.path.dirname(__file__), source_file)
    if not os.path.exists(abs_path):
        return ""
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            text = f.read()
            _KNOWLEDGE_TEXT_CACHE[source_file] = text
            return text
    except Exception:
        return ""


def _extract_relevant_excerpt(text: str, keywords: list, max_chars: int = 1200) -> str:
    if not text:
        return ""
    lowered = text.lower()
    if not keywords:
        return text[:max_chars]
    paragraph_breaks = [p.strip() for p in text.split("\n\n") if p.strip()]
    scored = []
    for p in paragraph_breaks:
        score = sum(1 for k in keywords if k and k in p.lower())
        if score:
            scored.append((score, p))
    if not scored:
        return text[:max_chars]
    scored.sort(key=lambda x: (-x[0], len(x[1])))
    excerpt_parts = []
    total = 0
    for _, para in scored:
        if total + len(para) > max_chars:
            remaining = max_chars - total
            if remaining > 100:
                excerpt_parts.append(para[:remaining])
            break
        excerpt_parts.append(para)
        total += len(para)
        if total >= max_chars:
            break
    return "\n\n".join(excerpt_parts)


def get_knowledge_library_summary() -> str:
    lines = []
    for item in COMPREHENSIVE_LEGAL_DOC_LIBRARY:
        lines.append(f"- {item['title']} ({item['citation']}) :: {item['summary']}")
    return "\n".join(lines)


def get_knowledge_library_citations() -> str:
    lines = []
    for item in COMPREHENSIVE_LEGAL_DOC_LIBRARY:
        lines.append(f"- {item['title']}: {item['citation']}")
    return "\n".join(lines)


def get_knowledge_library_matches(query: str, max_items: int = 5) -> list:
    if not query:
        return []
    text = query.lower()
    results = []
    for item in COMPREHENSIVE_LEGAL_DOC_LIBRARY:
        tags = [t.lower() for t in item.get("tags", [])]
        use_for = [t.lower() for t in item.get("use_for", [])]
        if any(t in text for t in tags) or any(t in text for t in use_for):
            results.append(item)
    if not results:
        for item in COMPREHENSIVE_LEGAL_DOC_LIBRARY:
            haystack = f"{item.get('title','')} {item.get('summary','')} {item.get('content_excerpt','')}".lower()
            if any(token in haystack for token in text.split() if len(token) > 4):
                results.append(item)
    return results[:max_items]


def get_knowledge_library_context(query: str, max_items: int = 3, max_chars: int = 1600) -> str:
    matches = get_knowledge_library_matches(query, max_items=max_items)
    if not matches:
        return ""
    tokens = [t for t in re.findall(r"[a-zA-Z0-9]+", query.lower()) if len(t) > 3]
    lines = []
    for item in matches:
        full_text = _load_knowledge_text(item.get("source_file", ""))
        excerpt = _extract_relevant_excerpt(full_text, tokens, max_chars=max_chars)
        lines.append(f"SOURCE: {item['title']} ({item['citation']})")
        lines.append(f"SUMMARY: {item['summary']}")
        if excerpt:
            lines.append(f"EXCERPT:\n{excerpt}")
        lines.append("---")
    return "\n".join(lines)
