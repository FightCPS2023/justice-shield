import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useSubscription } from '../contexts/SubscriptionContext';

interface RightsQuestion {
  id: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  legalBasis: string[];
  actionSteps: string[];
  isPremium: boolean;
}

const rightsQuestions: RightsQuestion[] = [
  {
    id: 'home-entry',
    question: 'Can CPS enter my home without permission?',
    shortAnswer: 'NO - CPS needs your consent, a warrant, or exigent circumstances (immediate danger) to enter your home.',
    detailedAnswer: `CPS cannot legally enter your home without:
1. Your voluntary consent (which you can refuse)
2. A valid court-issued warrant
3. Exigent circumstances (immediate, life-threatening danger to a child)

Recent Supreme Court case Caniglia v. Strom (2021) makes it clear: the "community caretaking" exception does NOT apply to warrantless home entries. CPS must respect your Fourth Amendment rights.`,
    legalBasis: [
      'Fourth Amendment - Protection against unreasonable searches',
      'Caniglia v. Strom (2021) - SCOTUS ruling',
      'Lange v. California (2021) - Pursuit of minor offense does not justify warrantless entry'
    ],
    actionSteps: [
      'Politely but firmly state: "I do not consent to any search or entry"',
      'Ask if they have a warrant (and examine it if presented)',
      'Step outside and close the door to speak with them',
      'Record the interaction if legal in your state',
      'Contact an attorney immediately'
    ],
    isPremium: false
  },
  {
    id: 'drug-test',
    question: 'Do I have to take a drug test if CPS asks?',
    shortAnswer: 'NO (before court order) - CPS cannot force you to drug test without a court order. Refusing may be used against you, but you have the right.',
    detailedAnswer: `You are NOT legally required to take a drug test simply because CPS requests it - UNLESS there is a court order.

However, understand the strategic implications:
• Refusing may give CPS ammunition to claim you're "uncooperative"
• They may use refusal to justify removal or court action
• If you have nothing to hide, testing may work in your favor
• If you do test positive, it becomes evidence against you

IMPORTANT: If there IS a court order, you must comply or face contempt of court charges.`,
    legalBasis: [
      'Fourth Amendment - Protection against unreasonable searches (bodily fluids)',
      'Fifth Amendment - Right against self-incrimination',
      'No legal obligation without court order or valid consent'
    ],
    actionSteps: [
      'Ask to see the court order (if they claim there is one)',
      'Consult with attorney BEFORE agreeing to test',
      'If you choose to test, get independent confirmation/copy of results',
      'Document all requests and your responses in writing',
      'Never be coerced - illegal coercion can be challenged'
    ],
    isPremium: false
  },
  {
    id: 'refuse-cps',
    question: 'What happens if I refuse to cooperate with CPS?',
    shortAnswer: 'You have constitutional rights, but refusal can lead to court involvement. Strategic cooperation with attorney guidance is usually best.',
    detailedAnswer: `Your rights vs. CPS tactics:

WHAT YOU CAN LEGALLY REFUSE:
✅ Home entry without warrant/consent
✅ Answering questions (Fifth Amendment)
✅ Drug testing without court order
✅ Signing documents under duress
✅ Allowing child interview without you present (in some states)

WHAT CPS MIGHT DO:
⚠️ File for emergency court order
⚠️ Claim you're "uncooperative" (use against you)
⚠️ Seek warrant for home entry
⚠️ Escalate investigation
⚠️ File dependency petition in court

SMART STRATEGY:
🎯 Exercise rights but be professional
🎯 Get attorney involved immediately
🎯 Provide information through attorney
🎯 Document everything in writing
🎯 Never refuse court orders`,
    legalBasis: [
      'Fourth Amendment - No unreasonable searches',
      'Fifth Amendment - Right to remain silent',
      'Fourteenth Amendment - Due process rights',
      'Parental rights are fundamental liberty interests (Troxel v. Granville)'
    ],
    actionSteps: [
      'Say: "I want to cooperate but need my attorney present"',
      'Provide your attorney\'s contact information',
      'Document all interactions in writing with dates/times',
      'Never be hostile - be calm and professional',
      'Comply with valid court orders to avoid contempt',
      'File written objections to false claims immediately'
    ],
    isPremium: false
  },
  {
    id: 'interview-child',
    question: 'Can CPS interview my child without me present?',
    shortAnswer: 'MAYBE - Laws vary by state. In schools, often yes. At home, you can generally refuse entry. Ask for attorney.',
    detailedAnswer: `This is highly state-specific:

AT SCHOOL:
• Most states allow CPS to interview children at school WITHOUT parental consent
• Schools often cooperate with CPS under mandatory reporting laws
• You generally won't be notified until after the interview
• This is one of the most controversial CPS practices

AT YOUR HOME:
• You can refuse CPS entry to your home
• If they cannot enter, they cannot interview without your permission
• Some states require parental presence or notification

IN EMERGENCY/INVESTIGATION:
• If CPS believes child is in immediate danger, they may proceed without consent
• Court orders can mandate interviews

PREMIUM STRATEGY: Paid members get state-specific guidance and letter templates to send to schools limiting CPS access.`,
    legalBasis: [
      'Varies by state law',
      'Dupuy v. Samuels (7th Cir.) - Parents have right to be present in some circumstances',
      'Schools act "in loco parentis" (in place of parents)',
      'Parental rights are fundamental but not absolute'
    ],
    actionSteps: [
      'Send letter to school limiting CPS access (template available for premium)',
      'Instruct child: "I want my mom/dad present for any questions"',
      'Request copy of any interview notes/recordings',
      'File complaint if interview was improper',
      'Document everything for potential legal challenge'
    ],
    isPremium: true
  },
  {
    id: 'remove-child',
    question: 'Can CPS remove my child immediately?',
    shortAnswer: 'ONLY in emergency - CPS needs either your consent, law enforcement assistance, or immediate court approval. You get a hearing within 48-72 hours.',
    detailedAnswer: `CPS Emergency Removal Standards:

LEGAL REQUIREMENTS:
• Must show IMMINENT DANGER or risk of serious harm
• Usually requires law enforcement involvement
• Must file for court hearing within 24-72 hours (varies by state)
• You are entitled to emergency hearing and attorney

"IMMINENT DANGER" MEANS:
✓ Serious physical harm is about to occur
✓ Medical emergency being ignored
✓ Child abandoned or alone
✓ Credible threat of violence

NOT SUFFICIENT FOR EMERGENCY REMOVAL:
✗ Dirty house (unless severe health hazard)
✗ Poverty or lack of resources
✗ Different parenting style
✗ Unsubstantiated allegations
✗ Past mistakes you've corrected

YOUR RIGHTS IMMEDIATELY AFTER REMOVAL:
🔥 Emergency court hearing (48-72 hours)
🔥 Right to attorney (free if you qualify)
🔥 Right to present evidence
🔥 Right to challenge probable cause
🔥 Placement with relatives must be considered first`,
    legalBasis: [
      'Fourth Amendment - Seizure of child requires warrant or exigent circumstances',
      'Fourteenth Amendment Due Process',
      'Brokaw v. Mercer County - Notice and hearing required',
      'ASFA (Adoption and Safe Families Act) - Reasonable efforts required'
    ],
    actionSteps: [
      'IMMEDIATE: Contact attorney (public defender if needed)',
      'Request emergency hearing within 72 hours',
      'File motion for return of child',
      'Gather evidence of safety and bond',
      'Identify relatives for placement',
      'Document why removal was unnecessary',
      'Request all CPS reports and evidence',
      'File challenges to false statements'
    ],
    isPremium: true
  },
  {
    id: 'anonymous-report',
    question: 'Can someone report me to CPS anonymously?',
    shortAnswer: 'YES - Anonymous reports are allowed, but they cannot be the sole basis for removal. CPS must independently verify and corroborate.',
    detailedAnswer: `Anonymous Reports - Know Your Rights:

YES, ANONYMOUS REPORTS ARE LEGAL:
• Anyone can report suspicions anonymously
• Mandatory reporters (teachers, doctors) usually must identify themselves
• CPS must investigate all reports, even anonymous

BUT THERE ARE LIMITS:
⚠️ Anonymous reports alone = insufficient for removal
⚠️ Must be corroborated with actual evidence
⚠️ Cannot violate Fourth Amendment based solely on anonymous tip
⚠️ Hearsay from anonymous source is challengeable in court

YOU CAN:
✅ Request the report (with identifying info redacted)
✅ Challenge investigation based solely on anonymous claims
✅ Demand CPS show corroborating evidence
✅ File motion to dismiss if no corroboration exists
✅ Sue for malicious false reporting (if you discover reporter)

PREMIUM FEATURE: Get templates to subpoena reporter identity and challenge anonymous allegations.`,
    legalBasis: [
      'Most states protect reporter anonymity',
      'Crawford v. Washington - Confrontation clause (hearsay challenges)',
      'Anonymous tips must be corroborated for probable cause',
      'Malicious false reporting can be actionable'
    ],
    actionSteps: [
      'Request copy of the report (Freedom of Information Act)',
      'Document all evidence contradicting allegations',
      'Challenge hearsay evidence in court',
      'Demand CPS show independent corroboration',
      'If report is false, file complaint for malicious reporting',
      'Gather witness statements supporting your parenting'
    ],
    isPremium: false
  }
];

export function QuickRightsChecker() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { tier } = useSubscription();

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Quick Rights Checker
        </div>
        <p className="text-sm text-muted-foreground">
          Get instant answers to urgent CPS rights questions. Know your rights before CPS shows up.
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">🔥 Free Legal Guidance</AlertTitle>
        <AlertDescription className="text-blue-800">
          These answers are based on constitutional law and recent court precedents. However, laws vary by state. 
          {tier === 'free' && ' Upgrade to Premium for state-specific guidance and customized letter templates.'}
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {rightsQuestions.map((item) => (
          <Card key={item.id} className={`p-4 ${item.isPremium && tier === 'free' ? 'opacity-75' : ''}`}>
            <Collapsible 
              open={expandedId === item.id} 
              onOpenChange={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                      <div className="text-left">
                        <div className="mb-2 flex items-center gap-2">
                          {item.isPremium && tier === 'free' && (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                          {item.question}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{item.shortAnswer}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {expandedId === item.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="mt-4 space-y-4">
                {item.isPremium && tier === 'free' ? (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">Premium Feature</AlertTitle>
                    <AlertDescription className="text-amber-800">
                      Unlock detailed explanations, state-specific guidance, and action templates with Premium.
                      <div className="mt-2">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          Upgrade to See Full Answer
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm mb-2">Detailed Explanation:</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {item.detailedAnswer}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Legal Basis:
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <ul className="text-sm space-y-1 text-blue-900">
                          {item.legalBasis.map((basis, idx) => (
                            <li key={idx}>⚖️ {basis}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-green-600" />
                        Action Steps:
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <ol className="text-sm space-y-2 text-green-900 list-decimal list-inside">
                          {item.actionSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {tier === 'free' && (
        <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <Shield className="h-4 w-4 text-primary" />
          <AlertTitle>💎 Want More?</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>Premium members get:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✅ State-specific legal guidance</li>
                <li>✅ Customized letter templates (school limits, written requests, etc.)</li>
                <li>✅ Unlimited AI legal Q&A (vs. 3 questions/day free)</li>
                <li>✅ Full violation analysis (vs. 2 violations free)</li>
                <li>✅ Priority support</li>
              </ul>
              <Button className="mt-3" size="sm">
                Upgrade to Premium - Protect Your Rights
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
