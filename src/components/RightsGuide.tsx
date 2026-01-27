import { Card } from "./ui/card";
import { Shield, AlertCircle, CheckCircle2, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import { InlineDisclaimer } from "./InlineDisclaimer";

export function RightsGuide() {
  const rightsCategories = [
    {
      title: "Your Constitutional Rights",
      icon: Shield,
      color: "text-blue-500",
      rights: [
        {
          title: "4th Amendment - Protection from Unreasonable Search",
          description: "You have the right to refuse CPS entry into your home without a warrant, court order, or your consent.",
          details: [
            "You can refuse to let CPS in unless they have a warrant",
            "Exigent circumstances (immediate danger) is an exception",
            "If you let them in, you can ask them to leave at any time",
            "You can limit their access to certain areas",
            "Anything you show them can be used against you",
          ],
        },
        {
          title: "5th Amendment - Right Against Self-Incrimination",
          description: "You have the right to remain silent and not answer questions that might incriminate you.",
          details: [
            "You can refuse to answer questions",
            "Politely say 'I prefer not to answer without my attorney present'",
            "Silence cannot be held against you in court",
            "Don't try to explain or defend yourself without counsel",
            "Everything you say CAN and WILL be used against you",
          ],
        },
        {
          title: "14th Amendment - Due Process Rights",
          description: "You have the right to fair legal proceedings before your parental rights can be terminated.",
          details: [
            "Right to notice of allegations and hearings",
            "Right to present evidence and witnesses",
            "Right to confront accusers",
            "Right to appeal decisions",
            "Government must prove case by clear and convincing evidence",
          ],
        },
      ],
    },
    {
      title: "During CPS Investigation",
      icon: AlertCircle,
      color: "text-orange-500",
      rights: [
        {
          title: "Right to Legal Representation",
          description: "You have the right to an attorney before and during all CPS interactions.",
          details: [
            "Request a court-appointed attorney if you cannot afford one",
            "Do not sign ANYTHING without attorney review",
            "You can stop the interview to consult with your attorney",
            "Bring your attorney to all meetings and interviews",
            "CPS must stop questioning if you invoke this right",
          ],
        },
        {
          title: "Right to Know the Allegations",
          description: "CPS must tell you specifically what you are being accused of.",
          details: [
            "Request written allegations and who made them",
            "They must tell you what evidence they have",
            "You have right to see investigative reports",
            "Ask for specifics - dates, incidents, witnesses",
            "Vague allegations are not sufficient",
          ],
        },
        {
          title: "Right to Refuse Interviews & Tests",
          description: "You can decline to be interviewed or tested without a court order.",
          details: [
            "You can refuse drug tests without court order",
            "You can refuse psychological evaluations",
            "You can refuse to let them interview you",
            "Children can only be interviewed with your permission (in most states)",
            "Refusing is NOT admission of guilt",
          ],
        },
      ],
    },
    {
      title: "After Removal or Court Involvement",
      icon: CheckCircle2,
      color: "text-green-500",
      rights: [
        {
          title: "Right to Visitation",
          description: "You have the right to visit your children unless a court specifically orders otherwise.",
          details: [
            "Visits can only be denied by court order",
            "You can request more frequent or longer visits",
            "Visits should be in least restrictive setting possible",
            "You can request unsupervised visitation",
            "Document any improper denial of visits",
          ],
        },
        {
          title: "Right to Participate in Case Planning",
          description: "You have the right to be involved in decisions about your case and your child.",
          details: [
            "Participate in service plan development",
            "Request modifications to unreasonable requirements",
            "Give input on placement decisions",
            "Be notified of and attend all court hearings",
            "Review and comment on reports submitted to court",
          ],
        },
        {
          title: "Right to Reunification Services",
          description: "CPS must make reasonable efforts to reunify your family.",
          details: [
            "Services must be offered and accessible",
            "Services should address specific issues in your case",
            "You should receive adequate time to complete services",
            "Services must be appropriate for your situation",
            "CPS must document reasonable efforts were made",
          ],
        },
      ],
    },
  ];

  const dosDonts = {
    dos: [
      "Be polite and respectful, even when you're upset",
      "Ask for identification and write down names/badge numbers",
      "Request everything in writing",
      "Document every interaction with dates and details",
      "Consult with an attorney before making decisions",
      "Follow court orders exactly as written",
      "Show up to all scheduled hearings and appointments",
      "Keep your home clean and safe",
      "Complete recommended services",
      "Stay calm and don't lose your temper",
    ],
    donts: [
      "Don't let CPS in without warrant or court order (unless you choose to)",
      "Don't answer questions without your attorney",
      "Don't sign anything without attorney review",
      "Don't allow child interviews without being present (when possible)",
      "Don't consent to searches, drug tests, or evaluations without court order",
      "Don't get confrontational or physical",
      "Don't post about your case on social media",
      "Don't miss court dates or appointments",
      "Don't ignore the situation or hope it goes away",
      "Don't believe everything CPS tells you - verify with attorney",
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          Know Your Rights
          <HelpTooltip 
            content="This comprehensive guide explains your constitutional and legal rights when dealing with CPS. Each right includes specific details and practical advice for protecting yourself and your family." 
            side="right"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Understanding your legal rights is crucial when dealing with CPS. This information is educational - always consult with an attorney for your specific situation.
        </p>
      </div>

      <InlineDisclaimer type="legal" variant="compact" />
      <InlineDisclaimer type="educational" variant="compact" />

      <InfoBox title="🚨 Critical First Steps When CPS Contacts You" variant="warning">
        <ol className="space-y-2 list-decimal list-inside">
          <li><strong>DO NOT panic:</strong> Stay calm and polite, but exercise your rights</li>
          <li><strong>Get an attorney IMMEDIATELY:</strong> Before answering questions or signing anything</li>
          <li><strong>Document everything:</strong> Write down dates, times, names, and what was said</li>
          <li><strong>Do NOT consent to searches:</strong> Unless they have a warrant or court order</li>
          <li><strong>Do NOT sign anything:</strong> Without your attorney reviewing it first</li>
        </ol>
      </InfoBox>

      <Alert>
        <Phone className="h-4 w-4" />
        <AlertTitle>Get Legal Help Immediately</AlertTitle>
        <AlertDescription>
          If CPS has contacted you, consult with a family law attorney right away. Many offer free consultations. Contact your local bar association for referrals.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {rightsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icon className={`w-6 h-6 ${category.color}`} />
                <span>{category.title}</span>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {category.rights.map((right, index) => (
                  <AccordionItem key={index} value={`right-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="text-left">
                        <div className="mb-1">{right.title}</div>
                        <p className="text-sm text-muted-foreground">{right.description}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <ul className="space-y-2">
                        {right.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold">DO These Things</span>
          </div>
          <ul className="space-y-1.5 sm:space-y-2">
            {dosDonts.dos.map((item, index) => (
              <li key={index} className="flex gap-2 text-xs sm:text-sm">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="mb-3 sm:mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold">DON'T Do These Things</span>
          </div>
          <ul className="space-y-1.5 sm:space-y-2">
            {dosDonts.donts.map((item, index) => (
              <li key={index} className="flex gap-2 text-xs sm:text-sm">
                <span className="text-red-500 flex-shrink-0">✗</span>
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-4 sm:p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <div className="flex gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm flex-1 min-w-0">
            <div className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-100">Disclaimer</div>
            <p className="text-amber-800 dark:text-amber-200">
              This information is for educational purposes only and does not constitute legal advice. Laws vary by state and situation. 
              Always consult with a qualified attorney licensed in your state for advice specific to your case.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
