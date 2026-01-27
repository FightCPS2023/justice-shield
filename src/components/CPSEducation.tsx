// CPS Education - Understanding Violations and Your Rights
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BookOpen,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Scale,
  ClipboardCheck,
  Search,
  MessageSquare,
  CheckCircle,
  XCircle,
  Info,
  Lock,
  FileSearch,
  UserX,
  FileWarning,
  HandMetal,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export function CPSEducation() {
  const [activeCategory, setActiveCategory] = useState("services");

  const educationTopics = {
    services: {
      icon: ClipboardCheck,
      title: "Services Not Being Offered",
      color: "blue",
      content: {
        overview: "CPS has a legal obligation to provide 'reasonable efforts' to prevent removal of children and to reunify families. Failure to offer appropriate services is a major violation of your rights.",
        whatQualifies: [
          {
            title: "Parenting Classes",
            description: "CPS must offer evidence-based parenting education programs appropriate to your situation. This includes culturally sensitive programs and classes in your native language if needed.",
            examples: [
              "Age-appropriate parenting skills training",
              "Trauma-informed parenting classes",
              "Positive discipline techniques",
              "Child development education"
            ]
          },
          {
            title: "Mental Health Services",
            description: "If mental health is cited as a concern, CPS must provide or facilitate access to appropriate mental health treatment.",
            examples: [
              "Individual therapy or counseling",
              "Family therapy sessions",
              "Psychiatric evaluation and medication management",
              "Trauma therapy (EMDR, CBT, etc.)"
            ]
          },
          {
            title: "Substance Abuse Treatment",
            description: "If substance use is an issue, CPS must offer comprehensive treatment options, not just demand that you 'get clean.'",
            examples: [
              "Inpatient or outpatient rehabilitation programs",
              "Medication-assisted treatment (MAT)",
              "12-step or alternative support groups",
              "Drug testing with treatment, not just surveillance"
            ]
          },
          {
            title: "Housing Assistance",
            description: "If housing is cited as a safety concern, CPS must help you find appropriate housing, not just criticize your current situation.",
            examples: [
              "Emergency housing vouchers",
              "Rental assistance programs",
              "Help with housing applications",
              "Transitional housing programs"
            ]
          },
          {
            title: "Financial Support",
            description: "CPS should connect you with financial resources to address poverty-related issues that don't constitute abuse or neglect.",
            examples: [
              "TANF (Temporary Assistance for Needy Families)",
              "SNAP (food assistance)",
              "Childcare subsidies",
              "Utility assistance programs",
              "Employment services and job training"
            ]
          },
          {
            title: "Medical Services",
            description: "Access to healthcare for both you and your children, especially if medical needs were cited as concerns.",
            examples: [
              "Health insurance enrollment (Medicaid/CHIP)",
              "Medical appointments and transportation",
              "Specialized medical care referrals",
              "Dental and vision care"
            ]
          }
        ],
        redFlags: [
          "CPS says 'we don't have funding for that' without exploring alternatives",
          "You're told to find services yourself without guidance or resources",
          "Services are offered but there's a 6+ month waitlist with no interim support",
          "CPS demands you complete services but won't pay for them or help you access free options",
          "Services offered are inappropriate for your actual situation (e.g., anger management when the issue is poverty)",
          "CPS refuses to provide services in your language or culturally appropriate services"
        ],
        legalStandards: [
          {
            title: "Reasonable Efforts Requirement",
            content: "Federal law (42 U.S.C. § 671(a)(15)) requires states to make 'reasonable efforts' to prevent removal and achieve reunification. This isn't optional."
          },
          {
            title: "Individualized Service Plans",
            content: "Services must be tailored to your family's specific needs, not a one-size-fits-all approach."
          },
          {
            title: "Active Efforts (ICWA Cases)",
            content: "For Native American families, the Indian Child Welfare Act requires 'active efforts' - a higher standard than reasonable efforts - to prevent breakup of the family."
          }
        ],
        whatToDo: [
          "Document every service you requested and whether it was provided",
          "Keep records of waitlists, denials, or lack of response from CPS",
          "Request your case plan in writing and note any services missing",
          "Ask your attorney to file a motion if services aren't being provided",
          "Request a administrative review or case conference if services are inadequate"
        ]
      }
    },
    coercion: {
      icon: HandMetal,
      title: "Coercion & Intimidation Tactics",
      color: "red",
      content: {
        overview: "Coercion occurs when CPS uses threats, intimidation, deception, or pressure to force you to sign documents, agree to plans, or give up your rights. Any agreement made under coercion may be invalid and violates your constitutional rights.",
        commonTactics: [
          {
            title: "Threat of Immediate Removal",
            description: "CPS threatens to take your children right now unless you sign a safety plan or agree to their demands.",
            why: "This creates duress - you're not making a free choice, you're being threatened. Unless there's an immediate emergency, CPS needs a court order to remove children.",
            examples: [
              "'Sign this or we're taking your kids right now'",
              "'If you don't agree to this plan, I'll have to remove the children for their safety'",
              "'We can do this the easy way or the hard way'"
            ]
          },
          {
            title: "False Claims About Court Proceedings",
            description: "CPS tells you that if you don't cooperate, the judge will be angry or you'll lose your case.",
            why: "This misrepresents the legal process and pressures you into giving up rights without proper legal representation.",
            examples: [
              "'The judge will be mad if you don't sign this'",
              "'If you lawyer up, it looks like you have something to hide'",
              "'Judges always side with us anyway, so you might as well cooperate'"
            ]
          },
          {
            title: "Discouraging Legal Representation",
            description: "CPS suggests you don't need a lawyer or that getting one will make things worse.",
            why: "You have an absolute right to an attorney. Discouraging this is a violation of your due process rights.",
            examples: [
              "'You don't need a lawyer for this, it's just a safety plan'",
              "'Getting an attorney will just drag this out longer'",
              "'Lawyers just make things more complicated'",
              "'If you have nothing to hide, why do you need a lawyer?'"
            ]
          },
          {
            title: "Deceptive Language",
            description: "CPS uses vague terms or misrepresents what you're agreeing to when signing documents.",
            why: "You can't give informed consent if you don't understand what you're agreeing to.",
            examples: [
              "Calling a removal a 'voluntary placement' or 'safety plan'",
              "Using phrases like 'just sign here' without explaining the document",
              "Downplaying the legal implications of a safety plan",
              "Not explaining that a 'voluntary' plan can be used against you in court"
            ]
          },
          {
            title: "Time Pressure",
            description: "CPS demands immediate decisions without giving you time to read documents, think, or consult a lawyer.",
            why: "Informed consent requires adequate time to understand what you're agreeing to.",
            examples: [
              "'I need this signed right now'",
              "'We don't have time to wait for you to read all this'",
              "'This needs to happen today or the children will be removed'"
            ]
          },
          {
            title: "Isolation Tactics",
            description: "CPS interviews you alone, late at night, or in intimidating settings without support persons present.",
            why: "This creates a power imbalance and prevents you from having witnesses or support.",
            examples: [
              "Showing up at your door at 8 PM demanding to talk",
              "Refusing to let you call a family member or advocate",
              "Interviewing you in a police station or government office",
              "Separating you from your spouse to interview separately"
            ]
          }
        ],
        invalidConsent: [
          {
            title: "When 'Voluntary' Isn't Really Voluntary",
            content: "A signature obtained under coercion is not legally valid consent. Courts have ruled that coerced agreements, including 'voluntary' safety plans, violate constitutional rights."
          },
          {
            title: "Safety Plans vs. Court Orders",
            content: "Safety plans are supposed to be voluntary alternatives to court intervention. If you're threatened with removal unless you sign, it's NOT voluntary - it's coerced. CPS needs a court order for involuntary action."
          },
          {
            title: "Your Right to Refuse",
            content: "You have the right to refuse to sign anything. If CPS believes removal is necessary, they must go to court and prove it to a judge. You cannot be punished for exercising your legal rights."
          }
        ],
        protectYourself: [
          "Never sign anything without reading it completely",
          "Ask for time to consult with an attorney before signing",
          "Request a copy of any document they want you to sign",
          "Bring a support person or witness to all CPS meetings",
          "Document any threats, pressure, or intimidation tactics",
          "Record interactions if legal in your state (many states allow one-party consent)",
          "If you feel threatened, say 'I do not consent to this' clearly",
          "Report coercion to your attorney, the court, or CPS supervisor"
        ],
        legalRecourse: [
          "Any agreement signed under duress can be challenged in court",
          "Coercion by CPS workers can be grounds for civil rights lawsuits (Section 1983 claims)",
          "Evidence obtained through coercion may be inadmissible in court",
          "Your attorney can file motions to suppress coerced statements or invalidate coerced agreements"
        ]
      }
    },
    attorney: {
      icon: Scale,
      title: "Right to Legal Counsel",
      color: "purple",
      content: {
        overview: "Your right to legal representation is fundamental. CPS cannot deny you access to an attorney, and attempting to do so is a serious constitutional violation that can invalidate their entire case.",
        whenRightApplies: [
          {
            title: "During Initial Investigation",
            description: "You have the right to consult with an attorney before speaking to CPS, before signing anything, and before allowing entry to your home.",
            whatToSay: "'I want to speak with an attorney before answering any questions' or 'I do not consent to this search without speaking to my lawyer first.'"
          },
          {
            title: "At Emergency Removal",
            description: "If CPS removes your children, you must be appointed an attorney immediately if you cannot afford one.",
            timeline: "Most states require appointment of counsel within 24-48 hours of removal. Delays in appointing counsel can violate due process."
          },
          {
            title: "All Court Proceedings",
            description: "You have an absolute right to legal representation at every court hearing, including emergency hearings, adjudication, disposition, and review hearings.",
            requirement: "The court cannot proceed without ensuring you have legal representation or have validly waived this right."
          },
          {
            title: "Before Signing Legal Documents",
            description: "Any legal document related to your case - safety plans, service plans, consents, waivers - you have the right to review with an attorney first.",
            protection: "Documents signed without opportunity for legal consultation may be challengeable as coerced or uninformed."
          }
        ],
        violations: [
          {
            title: "Denying Access to Attorney",
            description: "CPS prevents you from contacting or meeting with your lawyer.",
            examples: [
              "Refusing to let you make a phone call to your attorney",
              "Proceeding with interviews or removing children before you can contact counsel",
              "Scheduling meetings at times when your attorney cannot attend",
              "Refusing to postpone interviews until your attorney arrives"
            ]
          },
          {
            title: "Discouraging Legal Representation",
            description: "CPS actively tries to prevent you from seeking or using legal counsel.",
            examples: [
              "'You don't need a lawyer for this'",
              "'If you get a lawyer, we'll assume you're guilty'",
              "'Lawyers just make things worse'",
              "'This will go faster if you just cooperate without a lawyer'"
            ]
          },
          {
            title: "Interviewing Without Notice to Attorney",
            description: "CPS contacts you directly for interviews when they know you have legal representation, without notifying your attorney.",
            why: "Once you have an attorney, CPS should communicate through them or with their knowledge."
          },
          {
            title: "Inadequate Representation",
            description: "While not CPS's fault directly, systematic problems that deny effective counsel.",
            examples: [
              "Attorney meets you for first time at the hearing",
              "Attorney handles hundreds of cases and can't give yours proper attention",
              "Attorney pressures you to accept CPS's plan without fighting",
              "Attorney doesn't return calls or investigate your case"
            ]
          }
        ],
        consequences: [
          {
            title: "Due Process Violations",
            content: "Denial of counsel violates the Due Process Clause of the 14th Amendment. Courts may dismiss cases or exclude evidence obtained in violation of your right to counsel."
          },
          {
            title: "Reversible Error",
            content: "Court proceedings conducted without proper legal representation can be reversed on appeal, even if other evidence suggests CPS had a valid case."
          },
          {
            title: "Civil Liability",
            content: "CPS workers who intentionally deny access to counsel may face personal liability in civil rights lawsuits."
          }
        ],
        whatToDo: [
          "Clearly state 'I want an attorney' or 'I want to speak to my lawyer' at the first interaction with CPS",
          "Do not answer substantive questions until you have consulted with counsel",
          "Document any denial or discouragement of your right to an attorney",
          "If appointed counsel is inadequate, file a motion for substitution of counsel",
          "Report attorney access violations to the judge at your first court appearance",
          "Contact your state bar association if CPS interferes with attorney-client relationship"
        ],
        caselaw: [
          "In re Gault (1967): Established right to counsel in juvenile proceedings",
          "Many states have specific statutes guaranteeing parents' right to counsel in dependency cases",
          "Some jurisdictions recognize right to appointed counsel even before formal court proceedings begin"
        ]
      }
    },
    cherryPicking: {
      icon: FileSearch,
      title: "Cherry Picking Evidence",
      color: "orange",
      content: {
        overview: "Cherry picking occurs when CPS selectively presents evidence that supports their narrative while hiding or ignoring evidence that contradicts it. This violates your due process rights and constitutes fraud on the court.",
        whatItLooksLike: [
          {
            title: "Selective Quoting",
            description: "CPS quotes parts of medical records, school reports, or witness statements while omitting context that changes the meaning.",
            example: "Report says: 'Mother appeared tired and stressed but was attentive and responsive to the child's needs.' CPS quotes only: 'Mother appeared tired and stressed,' suggesting neglect."
          },
          {
            title: "Ignoring Exculpatory Evidence",
            description: "CPS has evidence that supports your side but doesn't include it in reports or court filings.",
            examples: [
              "Witnesses who support your parenting aren't interviewed or their statements aren't included",
              "Medical records showing injuries were accidental are left out of reports",
              "School records showing good attendance and performance are ignored",
              "Photos or documentation you provided aren't included in the case file"
            ]
          },
          {
            title: "Mischaracterizing Evidence",
            description: "CPS presents evidence in a misleading way to make it seem worse than it is.",
            examples: [
              "Normal childhood injuries described as 'suspicious bruising'",
              "Cultural practices misrepresented as abuse",
              "Messy house described as 'hazardous conditions'",
              "Appropriate discipline characterized as 'violence'"
            ]
          },
          {
            title: "Omitting Contradictory Expert Opinions",
            description: "CPS gets multiple expert opinions but only presents the one that supports removal.",
            example: "Two doctors say injuries are accidental, one says they're suspicious. CPS only cites the suspicious opinion."
          },
          {
            title: "Hiding Negative Information About Alternatives",
            description: "CPS presents foster care or relative placement as safe while hiding known problems.",
            examples: [
              "Not disclosing foster parent's disciplinary history",
              "Hiding that relative placement has prior CPS involvement",
              "Not revealing allegations against foster homes",
              "Omitting information about problems children are having in placement"
            ]
          }
        ],
        whyItMatters: [
          {
            title: "Due Process Violation",
            content: "You have a constitutional right to know all evidence - both for and against you. Cherry picking denies you a fair hearing."
          },
          {
            title: "Fraud on the Court",
            content: "Intentionally misleading the court by omitting material evidence can constitute fraud, which can result in case dismissal and sanctions against CPS."
          },
          {
            title: "Undermines Judicial Decision-Making",
            content: "Judges make life-altering decisions based on incomplete information, potentially removing children unnecessarily or failing to provide appropriate services."
          }
        ],
        howToIdentify: [
          "Request complete copies of ALL documents CPS has, not just their summary",
          "Compare CPS reports to original source documents (medical records, police reports, etc.)",
          "Look for suspicious gaps in timelines or missing witness statements",
          "Ask 'What evidence did CPS NOT include in their report?'",
          "Subpoena CPS case files and compare to what was presented to court",
          "Interview witnesses CPS spoke to and compare their actual statements to what CPS reported",
          "Get your own expert evaluations and compare to CPS's expert",
          "Look for qualifying language in original documents that's been removed in CPS summaries"
        ],
        fightBack: [
          "File discovery motions to obtain ALL documents and evidence",
          "Subpoena original source documents and witnesses",
          "File motion to compel if CPS withholds evidence",
          "Have your attorney cross-examine CPS workers about omitted evidence",
          "Present excluded evidence directly to the court",
          "File motion for sanctions if CPS intentionally withheld exculpatory evidence",
          "Raise Brady violations (failure to disclose exculpatory evidence) in criminal proceedings",
          "Consider civil rights lawsuit for malicious prosecution if pattern of evidence suppression"
        ],
        documentation: [
          "Keep your own copies of all documents, communications, and evidence",
          "Create a timeline showing what evidence exists vs. what CPS presented",
          "Note discrepancies between original sources and CPS characterizations",
          "Photograph, video, or otherwise preserve evidence that contradicts CPS claims",
          "Keep logs of all witnesses and what they can testify to",
          "Organize evidence by topic/allegation to show what CPS omitted"
        ]
      }
    },
    writtenNotice: {
      icon: FileText,
      title: "Written Notice Requirements",
      color: "green",
      content: {
        overview: "Due process requires that you receive written notice of allegations, hearings, and your rights. Verbal-only notice or vague written notice violates your constitutional right to defend yourself.",
        requiredNotices: [
          {
            title: "Notice of Investigation",
            description: "In many states, you're entitled to written notice that CPS is investigating you.",
            mustInclude: [
              "The specific allegations being investigated",
              "Your rights during the investigation",
              "Information about how to access an attorney",
              "The potential consequences of the investigation"
            ]
          },
          {
            title: "Notice of Court Hearings",
            description: "You must receive written notice of all court hearings with adequate time to prepare.",
            requirements: [
              "Date, time, and location of hearing",
              "Purpose of the hearing",
              "Your right to be present and represented by counsel",
              "Consequences if you don't attend",
              "Typically required 48-72 hours before hearing (varies by state)"
            ]
          },
          {
            title: "Notice of Removal",
            description: "If CPS removes your children, you must receive written notice explaining why.",
            mustInclude: [
              "Specific reasons for removal (not vague claims)",
              "Date and time of removal",
              "Where children are placed (to extent possible)",
              "Next court date",
              "Your rights to attorney and to challenge removal",
              "Information about visitation"
            ]
          },
          {
            title: "Notice of Allegations in Petition",
            description: "The court petition must specify exactly what CPS is alleging in writing.",
            standards: [
              "Specific facts, not conclusory statements",
              "Dates and details of alleged incidents",
              "Identification of which child is affected by which allegation",
              "Cannot be vague like 'neglect' - must explain what actions or omissions constitute neglect"
            ]
          },
          {
            title: "Notice of Case Plan",
            description: "You must receive written notice of what services you're required to complete.",
            mustInclude: [
              "Specific services required",
              "Timeframes for completion",
              "Connection between services and allegations",
              "Resources to access services",
              "Consequences of non-compliance"
            ]
          }
        ],
        violations: [
          {
            title: "Verbal-Only Notice",
            description: "CPS tells you about hearings, allegations, or requirements verbally but doesn't provide written documentation.",
            problem: "You can't adequately prepare defense without written specifics. Memory is unreliable and CPS can later claim they said something different."
          },
          {
            title: "Vague Written Notice",
            description: "Notice is so general you can't understand what you're accused of or defending against.",
            examples: [
              "'Neglect of children' - doesn't specify what actions/omissions",
              "'Inappropriate discipline' - doesn't detail incidents",
              "'Unsafe home conditions' - doesn't specify hazards",
              "'Failure to protect' - doesn't explain what threat or when"
            ]
          },
          {
            title: "Inadequate Time",
            description: "Notice is provided but not with enough time to prepare or respond.",
            examples: [
              "Hearing notice delivered day before hearing",
              "Emergency hearing with no advance notice (only allowed in true emergencies)",
              "Service plan demands action within days of notice",
              "Notice sent to wrong address"
            ]
          },
          {
            title: "No Notice of Rights",
            description: "CPS doesn't inform you of your legal rights in writing.",
            mustKnow: [
              "Right to attorney",
              "Right to remain silent",
              "Right to refuse entry without warrant",
              "Right to be present at hearings",
              "Right to present evidence",
              "Right to cross-examine witnesses"
            ]
          },
          {
            title: "Changed Allegations",
            description: "CPS changes the allegations against you without providing updated written notice.",
            problem: "You prepared defense to allegation A, but at hearing CPS proceeds on allegation B without prior notice."
          }
        ],
        legalStandards: [
          {
            title: "Due Process Requirements",
            content: "14th Amendment Due Process Clause requires adequate notice before government can deprive you of parental rights. This means notice must be reasonably calculated to inform you of the proceedings."
          },
          {
            title: "State-Specific Rules",
            content: "Each state has rules of civil procedure and juvenile court rules specifying notice requirements. These often exceed constitutional minimums."
          },
          {
            title: "Best Interest Exceptions",
            content: "True emergencies may allow removal without prior notice, but you must receive notice as soon as possible after and get an immediate hearing."
          }
        ],
        protectYourself: [
          "Demand written documentation of all allegations, requirements, and deadlines",
          "If notice is verbal, send a follow-up email: 'This confirms our conversation where you stated...'",
          "Keep all written notices in a safe place",
          "Note date and method you received notice (mail, hand-delivery, etc.)",
          "If notice is vague, ask in writing for specific details",
          "Update your address with court and CPS in writing to ensure you receive notices",
          "Check court docket online regularly for filed documents",
          "Have attorney file motion for more definite statement if allegations are too vague"
        ],
        remedies: [
          "Motion to dismiss for insufficient notice",
          "Motion to continue hearing to allow adequate preparation time",
          "Motion to strike vague allegations and require specific pleading",
          "Objection to admission of evidence on issues not properly noticed",
          "Appeal based on denial of due process",
          "Motion for new hearing if you didn't receive proper notice"
        ]
      }
    },
    readRights: {
      icon: Shield,
      title: "Failure to Read Rights",
      color: "indigo",
      content: {
        overview: "While CPS workers aren't required to give Miranda warnings like police, you still have constitutional rights that should be explained. Failure to inform you of your rights can make evidence obtained inadmissible.",
        yourRights: [
          {
            title: "Right to Remain Silent",
            description: "You are not required to speak to CPS investigators. Anything you say can be used against you in court.",
            application: [
              "You can refuse to answer questions",
              "You can stop an interview at any time",
              "Silence cannot be used as evidence of guilt",
              "You can refuse to explain injuries, home conditions, etc. without penalty"
            ],
            whatToSay: "'I'm not comfortable answering questions without my attorney present' or 'I decline to discuss this matter.'"
          },
          {
            title: "Right to Refuse Entry",
            description: "CPS cannot enter your home without your consent, a warrant, or exigent circumstances (immediate danger).",
            application: [
              "You can refuse to let CPS in",
              "You can ask them to come back when your attorney is present",
              "If they claim emergency, ask them to explain what the emergency is",
              "You can offer to bring children to the door so CPS can see them without entering"
            ],
            whatToSay: "'I do not consent to a search of my home' or 'Please come back when my attorney can be present.'"
          },
          {
            title: "Right to Attorney",
            description: "You have the right to consult with an attorney before answering questions or making decisions.",
            application: [
              "Ask to speak to a lawyer before proceeding",
              "Don't sign anything without legal review",
              "Request appointed attorney if you can't afford one",
              "CPS should not discourage you from seeking counsel"
            ],
            whatToSay: "'I want to speak with an attorney before answering any questions.'"
          },
          {
            title: "Right to Witnesses",
            description: "You can have a support person, advocate, or witness present during CPS interactions.",
            application: [
              "Ask to have a family member, friend, or advocate present",
              "Many jurisdictions allow you to record interviews (check your state law)",
              "Having a witness protects against mischaracterization of what was said",
              "CPS cannot force you to be interviewed alone"
            ]
          },
          {
            title: "Right to Refuse Drug Testing",
            description: "Without a court order, you can refuse drug testing. Your refusal cannot be sole basis for removal.",
            application: [
              "CPS cannot force you to take a drug test without consent or court order",
              "Refusal to test can be mentioned in reports but isn't proof of drug use",
              "If you do consent, ensure proper chain of custody and your right to challenge results"
            ]
          }
        ],
        mirandaVsCPS: [
          {
            title: "When Miranda Applies",
            content: "If police are involved in CPS investigation and you're in custody, Miranda warnings are required. Statements obtained in violation can be suppressed."
          },
          {
            title: "When Miranda Doesn't Apply",
            content: "CPS workers alone typically don't need to give Miranda warnings because you're usually not in custody. However, you still have constitutional rights."
          },
          {
            title: "Joint Investigations",
            content: "When CPS and police investigate together, the line blurs. If police are present and asking questions, Miranda should apply. If they don't give warnings, this can be raised in criminal proceedings."
          }
        ],
        violations: [
          {
            title: "Coerced Statements",
            description: "CPS obtains statements through threats, deception, or not honoring your request to stop.",
            examples: [
              "'If you don't talk to us, we'll take the kids'",
              "'We'll tell the judge you didn't cooperate'",
              "Continuing interview after you ask to stop or request attorney"
            ]
          },
          {
            title: "Misrepresenting Authority",
            description: "CPS tells you that you must answer questions, must let them in, or must comply when legally you don't.",
            examples: [
              "'You have to let us in'",
              "'You have to take this drug test'",
              "'You're required to answer our questions'",
              "'If you don't cooperate, that's obstruction'"
            ]
          },
          {
            title: "Denying Right to Counsel",
            description: "CPS refuses to let you contact attorney or delays proceedings until you've already been interviewed.",
            problem: "Once you invoke right to counsel, questioning should stop. Continuing violates your rights."
          },
          {
            title: "Deceptive Tactics",
            description: "CPS uses deception to obtain statements or evidence you wouldn't have provided if told the truth.",
            examples: [
              "'This is just informal, nothing you say will be used against you'",
              "'We're just here to help, not investigate'",
              "'If you just explain, this will all go away'",
              "Pretending document is 'just for our records' when it's actually evidence"
            ]
          }
        ],
        consequences: [
          {
            title: "Suppression of Evidence",
            content: "Statements obtained in violation of your rights may be suppressed and not allowed at trial. This is especially true if you clearly invoked right to remain silent or right to counsel."
          },
          {
            title: "Fruit of the Poisonous Tree",
            content: "Evidence obtained as a result of rights violations may also be excluded. For example, if coerced statement led to search, both statement and search results could be suppressed."
          },
          {
            title: "Impact on Credibility",
            content: "Even if evidence isn't suppressed, rights violations can damage CPS credibility and suggest they knew they didn't have a real case."
          }
        ],
        protectYourself: [
          "Know your rights BEFORE CPS contacts you",
          "Keep an attorney's phone number accessible",
          "Practice saying 'I want to speak to an attorney' and 'I do not consent'",
          "Record interactions if legal in your state",
          "Have a support person present when possible",
          "Don't be pressured into immediate responses",
          "Document if CPS misrepresents your rights or uses coercion",
          "Report rights violations to your attorney immediately"
        ]
      }
    },
    safetyPlan: {
      icon: FileWarning,
      title: "No Safety Plan Offered",
      color: "yellow",
      content: {
        overview: "CPS must make reasonable efforts to prevent removal, which often includes offering a safety plan. Removing children without first attempting a safety plan may violate the least restrictive means requirement.",
        whatIsSafetyPlan: [
          {
            title: "Purpose",
            description: "A safety plan is an agreement between you and CPS about actions to address concerns without removing children from home.",
            intent: "To keep families together while addressing safety issues, using the least restrictive intervention necessary."
          },
          {
            title: "Common Elements",
            description: "What safety plans typically include:",
            examples: [
              "Specific safety concerns being addressed",
              "Actions parent agrees to take (e.g., supervision, services, home modifications)",
              "Who will provide supervision if needed (relative, friend)",
              "Duration of the plan",
              "Services or resources CPS will provide",
              "Schedule for CPS follow-up",
              "Conditions for successful completion"
            ]
          },
          {
            title: "Voluntary vs. Coerced",
            description: "Key distinction that determines if plan is valid:",
            voluntary: "You genuinely agree to plan as alternative to court involvement. You understand it's optional. CPS provides services to help you comply.",
            coerced: "You're threatened with immediate removal if you don't sign. You're not told it's optional. Plan is unreasonable or impossible to complete."
          }
        ],
        whenRequired: [
          {
            title: "Reasonable Efforts Doctrine",
            content: "Federal and state law requires CPS to make 'reasonable efforts' to prevent removal. A safety plan is often the least restrictive reasonable effort.",
            standard: "Before removing children, CPS must show the court they attempted less intrusive interventions, unless child is in imminent danger."
          },
          {
            title: "Emergency Removal Exception",
            content: "Safety plans can be skipped only if there's genuine emergency - immediate threat to child's safety with no time to implement plan.",
            examples: [
              "Severe physical abuse requiring immediate medical attention",
              "Parent actively using drugs with no appropriate supervision available",
              "Domestic violence incident with ongoing threat",
              "Child abandoned with no caregiver"
            ],
            notEmergencies: [
              "House is messy or cluttered",
              "Poverty-related issues (no food, utilities off)",
              "Past incidents that aren't currently occurring",
              "Allegations that haven't been investigated"
            ]
          }
        ],
        violations: [
          {
            title: "No Safety Plan Offered",
            description: "CPS removes children without discussing or offering any safety plan alternative.",
            problem: "Violates reasonable efforts requirement and least restrictive means principle. Court may find removal unnecessary."
          },
          {
            title: "Unreasonable Safety Plan",
            description: "CPS offers plan but it's impossible to comply with.",
            examples: [
              "Requiring you to move out of your home immediately with no alternative housing",
              "Demanding you end relationship without resources to do so safely",
              "Requiring services that aren't available or have long waitlists",
              "Demanding you quit job for supervision without financial support",
              "Requiring someone else to move in but rejecting all options"
            ]
          },
          {
            title: "No Services to Support Plan",
            description: "Safety plan requires actions but CPS provides no help to accomplish them.",
            examples: [
              "Plan requires daycare but CPS doesn't help arrange or fund it",
              "Plan requires substance abuse treatment but CPS doesn't provide referral or payment",
              "Plan requires repairs to home but CPS offers no assistance",
              "Plan requires supervision but all suggested supervisors are rejected"
            ]
          },
          {
            title: "Removing Despite Compliance",
            description: "You comply with safety plan but CPS removes children anyway.",
            problem: "Suggests safety plan was pretext and removal was planned regardless. Demonstrates CPS acted in bad faith."
          },
          {
            title: "Refusing All Safety Plan Options",
            description: "CPS rejects every safety plan proposal without legitimate reason.",
            examples: [
              "Family members offer to supervise but all are rejected without proper assessment",
              "You propose home modifications but CPS refuses to consider",
              "You begin services voluntarily but CPS says it's not enough"
            ]
          }
        ],
        legalImplications: [
          {
            title: "Failure of Reasonable Efforts",
            content: "If CPS didn't offer safety plan when feasible, court may find they failed to make reasonable efforts. This can result in:\n• Children returned home\n• Case dismissed\n• CPS ordered to provide services rather than pursue removal\n• Finding that removal was not necessary"
          },
          {
            title: "Less Restrictive Alternatives",
            content: "Constitutional principle requires government to use least restrictive means to achieve goal. Removal without attempting safety plan may violate this principle."
          },
          {
            title: "Burden of Proof",
            content: "CPS must prove removal was necessary. If they didn't try safety plan, it's harder to prove nothing less restrictive would have worked."
          }
        ],
        howToRaise: [
          "Immediately tell your attorney that no safety plan was offered or considered",
          "Document any offers you made for safety planning that were rejected",
          "At removal hearing, attorney should argue CPS failed reasonable efforts",
          "Propose specific safety plan to court as alternative to continued removal",
          "Note in court that relatives or others were available for supervision",
          "Point out that CPS failed to assess less restrictive alternatives",
          "Request court to order CPS to work with you on safety plan",
          "If safety plan was offered but unreasonable, explain why and propose modifications"
        ],
        proposingPlan: [
          {
            title: "Be Specific",
            content: "Vague offers won't work. Provide names, dates, concrete actions you'll take."
          },
          {
            title: "Identify Resources",
            content: "Who will supervise? Where will you live? What services will you attend? Give details."
          },
          {
            title: "Address Each Concern",
            content: "For every issue CPS raised, explain how your plan addresses it."
          },
          {
            title: "Show It's Feasible",
            content: "Demonstrate the people and resources are actually available and willing."
          },
          {
            title: "Offer Monitoring",
            content: "Show you're willing to have CPS or others check in to verify compliance."
          }
        ]
      }
    },
    investigation: {
      icon: Search,
      title: "Improper Investigation Procedures",
      color: "pink",
      content: {
        overview: "CPS must follow proper procedures during investigations. Violations of investigation protocols can taint evidence, violate your rights, and form the basis for case dismissal or civil rights claims.",
        properProcedures: [
          {
            title: "Neutral Investigation",
            description: "CPS must investigate objectively, seeking both incriminating and exculpatory evidence.",
            requirements: [
              "Interview witnesses who support you, not just accusers",
              "Document evidence that contradicts allegations",
              "Consider alternative explanations for injuries or conditions",
              "Avoid confirmation bias - seeking only evidence that confirms suspicions"
            ]
          },
          {
            title: "Timely Investigation",
            description: "CPS must complete investigations within state-mandated timeframes (usually 30-60 days).",
            requirements: [
              "Respond to reports promptly based on priority level",
              "Complete all required interviews and assessments",
              "Make determination within statutory timeframe",
              "Provide you with investigation results in writing"
            ]
          },
          {
            title: "Proper Documentation",
            description: "CPS must accurately document all aspects of investigation.",
            requirements: [
              "Take photos/videos to preserve evidence",
              "Write reports that accurately reflect what was observed and said",
              "Include both supporting and contradicting evidence",
              "Sign and date all documentation",
              "Maintain proper chain of custody for evidence"
            ]
          },
          {
            title: "Child Interviews",
            description: "When interviewing children, CPS must use proper techniques.",
            requirements: [
              "Age-appropriate interview methods",
              "Avoid leading or suggestive questions",
              "Record interviews when possible",
              "Consider child's developmental level and trauma history",
              "Conduct interviews in neutral location when possible",
              "Avoid multiple interviews that can create false memories"
            ]
          },
          {
            title: "Medical Examinations",
            description: "Medical exams must be appropriate and properly authorized.",
            requirements: [
              "Obtain parental consent unless court order or emergency",
              "Use qualified medical professionals",
              "Consider multiple medical opinions for injuries",
              "Don't pressure doctors to reach particular conclusions",
              "Provide parents with medical findings"
            ]
          }
        ],
        commonViolations: [
          {
            title: "Biased Investigation",
            description: "CPS decides conclusion before investigating and only seeks confirming evidence.",
            examples: [
              "Not interviewing witnesses you provide who can contradict allegations",
              "Refusing to investigate alternative explanations",
              "Dismissing evidence that doesn't support removal",
              "Working backward from desired outcome",
              "Accepting accuser's word without verification"
            ]
          },
          {
            title: "Unlawful Entry or Search",
            description: "CPS enters home or searches without proper authority.",
            violations: [
              "Entering home without consent, warrant, or emergency",
              "Searching areas beyond what consent allowed",
              "Threatening consequences if you don't allow entry",
              "Claiming false emergency to justify warrantless entry",
              "Using police to coerce entry when no warrant exists"
            ]
          },
          {
            title: "Improper Child Interviews",
            description: "CPS uses suggestive or coercive techniques with children.",
            problems: [
              "Leading questions that suggest desired answers",
              "Interviewing child repeatedly until getting desired response",
              "Promising rewards for certain answers",
              "Threatening consequences for not disclosing",
              "Interviewing very young child without proper forensic techniques",
              "Not recording interview (hiding technique problems)"
            ]
          },
          {
            title: "Failure to Consider Alternatives",
            description: "CPS doesn't investigate other explanations for alleged abuse.",
            examples: [
              "Bruising that could be from normal play not investigated",
              "Medical conditions not considered (e.g., bleeding disorders)",
              "Cultural practices misunderstood as abuse without research",
              "Accidental injuries assumed to be inflicted",
              "Prior false allegations not considered"
            ]
          },
          {
            title: "Falsifying or Altering Evidence",
            description: "CPS manipulates evidence to support case.",
            violations: [
              "Altering photos or videos",
              "Misquoting witnesses or documents",
              "Backdating reports",
              "Adding observations after the fact",
              "Destroying evidence that contradicts their case",
              "Coaching witnesses"
            ]
          },
          {
            title: "Failure to Investigate Accuser",
            description: "CPS takes allegations at face value without assessing credibility or motive.",
            problems: [
              "Not investigating custody dispute context",
              "Ignoring history of false allegations by reporter",
              "Not considering reporter's bias or grudge",
              "Failing to verify facts claimed by reporter",
              "Not interviewing reporter in detail"
            ]
          },
          {
            title: "Exceeding Investigation Authority",
            description: "CPS goes beyond what's needed to investigate report.",
            examples: [
              "Investigating allegations not in the original report",
              "Searching home for issues unrelated to report",
              "Interviewing children about matters beyond the allegation",
              "Requiring drug tests when substance abuse wasn't alleged",
              "Expanding investigation without new evidence"
            ]
          }
        ],
        yourRights: [
          "Right to know what's being investigated",
          "Right to present evidence and witnesses",
          "Right to refuse entry without warrant",
          "Right to be present during child interviews (in some states)",
          "Right to accurate documentation of investigation",
          "Right to investigation results in writing",
          "Right to challenge investigation findings",
          "Right to have investigation completed within reasonable time"
        ],
        consequences: [
          {
            title: "Evidence Suppression",
            content: "Evidence obtained through improper investigation may be inadmissible:\n• Statements from coerced child interviews\n• Evidence from illegal searches\n• Tainted medical opinions\n• Documents obtained through deception"
          },
          {
            title: "Case Dismissal",
            content: "Serious investigation violations can result in entire case being dismissed, especially if violations are intentional or grossly negligent."
          },
          {
            title: "Civil Liability",
            content: "Improper investigation tactics can expose CPS workers to personal liability:\n• Unlawful search claims\n• False imprisonment\n• Malicious prosecution\n• Violation of civil rights (Section 1983)"
          }
        ],
        protectYourself: [
          "Document everything from first CPS contact",
          "Take your own photos/videos of home, children, conditions",
          "Keep list of all witnesses and what they can testify to",
          "Provide names of supporting witnesses to CPS in writing",
          "Get copies of all medical, school, and other records",
          "Note date, time, and details of all CPS contacts",
          "If CPS mischaracterizes something, correct it in writing",
          "Record interactions if legal in your state",
          "Keep all CPS letters, reports, and documents",
          "Hire attorney early to oversee investigation"
        ],
        raiseViolations: [
          "File motion to suppress evidence obtained improperly",
          "Subpoena CPS investigation file and compare to what was presented",
          "Cross-examine CPS worker about investigation procedures",
          "Present evidence CPS ignored or omitted",
          "Call witnesses CPS didn't interview",
          "File motion to dismiss based on due process violations",
          "Request court to find CPS not credible due to investigation flaws",
          "Consider civil rights lawsuit if violations are egregious"
        ]
      }
    }
  };

  const categories = Object.entries(educationTopics).map(([key, value]) => ({
    id: key,
    ...value
  }));

  const currentTopic = educationTopics[activeCategory as keyof typeof educationTopics];
  const Icon = currentTopic.icon;

  return (
    <div className="space-y-6" role="region" aria-label="CPS Education">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2">CPS Violations & Rights Education</h2>
            <p className="text-muted-foreground mb-4">
              Understanding your rights and recognizing violations is critical to defending your case. 
              This comprehensive guide explains common CPS violations, what they look like in practice, 
              and how to protect yourself and your family.
            </p>
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-100">Educational Resource</AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                This information is for educational purposes. Every case is different. Always consult 
                with a qualified family law attorney about your specific situation.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <Card
              key={category.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                isActive ? 'border-2 border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-primary' : `bg-${category.color}-500`
                }`}>
                  <CategoryIcon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-white'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm mb-1 line-clamp-2">{category.title}</h3>
                  <Badge variant={isActive ? "default" : "outline"} className="text-xs">
                    {isActive ? "Selected" : "Learn More"}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content Area */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 bg-${currentTopic.color}-500 rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2>{currentTopic.title}</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive guide to understanding and identifying violations
            </p>
          </div>
        </div>

        {/* Overview */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-base">
            {currentTopic.content.overview}
          </AlertDescription>
        </Alert>

        {/* Dynamic Content Based on Category */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Detailed Information</TabsTrigger>
            <TabsTrigger value="examples">Examples & Red Flags</TabsTrigger>
            <TabsTrigger value="action">What To Do</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Services Content */}
            {activeCategory === 'services' && (
              <>
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    What Qualifies as Required Services
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {currentTopic.content.whatQualifies?.map((item: any, index: number) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{item.title}</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p className="text-muted-foreground">{item.description}</p>
                          {item.examples && item.examples.length > 0 && (
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm mb-2">Examples include:</p>
                              <ul className="space-y-1">
                                {item.examples.map((example: string, i: number) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    Legal Standards
                  </h3>
                  <div className="space-y-3">
                    {currentTopic.content.legalStandards?.map((standard: any, index: number) => (
                      <Card key={index} className="p-4 bg-blue-50 dark:bg-blue-950">
                        <h4 className="mb-2 text-blue-900 dark:text-blue-100">{standard.title}</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{standard.content}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Coercion Content */}
            {activeCategory === 'coercion' && (
              <>
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Common Coercion Tactics
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {currentTopic.content.commonTactics?.map((tactic: any, index: number) => (
                      <AccordionItem key={index} value={`tactic-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            {tactic.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p className="text-muted-foreground">{tactic.description}</p>
                          <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                            <Info className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-900 dark:text-amber-100">Why This Matters</AlertTitle>
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                              {tactic.why}
                            </AlertDescription>
                          </Alert>
                          {tactic.examples && tactic.examples.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm mb-2 text-red-900 dark:text-red-100">Examples of this tactic:</p>
                              <ul className="space-y-2">
                                {tactic.examples.map((example: string, i: number) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-red-800 dark:text-red-200 italic">"{example}"</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    Understanding Invalid Consent
                  </h3>
                  <div className="space-y-3">
                    {currentTopic.content.invalidConsent?.map((item: any, index: number) => (
                      <Card key={index} className="p-4 bg-purple-50 dark:bg-purple-950">
                        <h4 className="mb-2 text-purple-900 dark:text-purple-100">{item.title}</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200">{item.content}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Attorney Rights Content */}
            {activeCategory === 'attorney' && (
              <>
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-600" />
                    When Your Right to Counsel Applies
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {currentTopic.content.whenRightApplies?.map((item: any, index: number) => (
                      <AccordionItem key={index} value={`right-${index}`}>
                        <AccordionTrigger>{item.title}</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p className="text-muted-foreground">{item.description}</p>
                          {item.whatToSay && (
                            <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-900 dark:text-green-100 mb-1">What to say:</p>
                              <p className="text-sm text-green-800 dark:text-green-200 italic">{item.whatToSay}</p>
                            </Card>
                          )}
                          {item.timeline && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>{item.timeline}</AlertDescription>
                            </Alert>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <UserX className="w-5 h-5 text-red-600" />
                    Common Violations of Right to Counsel
                  </h3>
                  <div className="space-y-3">
                    {currentTopic.content.violations?.map((violation: any, index: number) => (
                      <Card key={index} className="p-4 border-red-200 dark:border-red-800">
                        <h4 className="mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          {violation.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">{violation.description}</p>
                        {violation.examples && violation.examples.length > 0 && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm mb-2">Examples:</p>
                            <ul className="space-y-1">
                              {violation.examples.map((example: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-red-600">•</span>
                                  <span className="italic">"{example}"</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Cherry Picking, Written Notice, Read Rights, Safety Plan, Investigation - Similar structured content */}
            {['cherryPicking', 'writtenNotice', 'readRights', 'safetyPlan', 'investigation'].includes(activeCategory) && (
              <div className="space-y-6">
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900 dark:text-blue-100">
                    This section contains detailed information about {currentTopic.title.toLowerCase()}. 
                    Use the tabs above to explore specific examples and actionable steps.
                  </AlertDescription>
                </Alert>
                
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                  <h3 className="mb-4">Detailed Content Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Switch to the "Examples & Red Flags" and "What To Do" tabs for comprehensive guidance 
                    on {currentTopic.title.toLowerCase()}.
                  </p>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Red Flags to Watch For
              </h3>
              
              {currentTopic.content.redFlags && (
                <div className="space-y-2">
                  {currentTopic.content.redFlags.map((flag: string, index: number) => (
                    <Card key={index} className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-900 dark:text-red-100">{flag}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {currentTopic.content.violations && (
                <div className="space-y-4">
                  {currentTopic.content.violations.map((violation: any, index: number) => (
                    <Card key={index} className="p-5 border-l-4 border-l-red-600">
                      <h4 className="mb-2 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        {violation.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">{violation.description}</p>
                      {violation.examples && violation.examples.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                          <p className="text-sm mb-2 text-red-900 dark:text-red-100">Watch out for:</p>
                          <ul className="space-y-1">
                            {violation.examples.map((example: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-red-600 mt-1">•</span>
                                <span className="text-red-800 dark:text-red-200">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {violation.problem && (
                        <Alert className="mt-3 bg-amber-50 dark:bg-amber-950 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800 dark:text-amber-200">
                            {violation.problem}
                          </AlertDescription>
                        </Alert>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="action" className="space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                How to Protect Yourself
              </h3>
              
              {currentTopic.content.whatToDo && (
                <div className="space-y-2 mb-6">
                  {currentTopic.content.whatToDo.map((action: string, index: number) => (
                    <Card key={index} className="p-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-900 dark:text-green-100">{action}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {currentTopic.content.protectYourself && (
                <div className="space-y-2 mb-6">
                  <h4 className="mb-3 text-green-900 dark:text-green-100">Protection Strategies:</h4>
                  {currentTopic.content.protectYourself.map((strategy: string, index: number) => (
                    <Card key={index} className="p-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-900 dark:text-green-100">{strategy}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {currentTopic.content.legalRecourse && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    Legal Remedies Available
                  </h4>
                  <div className="space-y-2">
                    {currentTopic.content.legalRecourse.map((remedy: string, index: number) => (
                      <Card key={index} className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">{remedy}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentTopic.content.fightBack && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    How to Fight Back
                  </h4>
                  <div className="space-y-2">
                    {currentTopic.content.fightBack.map((action: string, index: number) => (
                      <Card key={index} className="p-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-900 dark:text-purple-100">{action}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Bottom CTA */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="mb-2">Knowledge is Power in Your Defense</h3>
            <p className="text-muted-foreground mb-4">
              Understanding these violations helps you recognize when your rights are being violated 
              and take appropriate action. Use this knowledge to work with your attorney to build a 
              strong defense and protect your family.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">
                <FileText className="w-4 h-4 mr-2" />
                Check My Case for Violations
              </Button>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Download Rights Guide
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
