import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Lightbulb, Scale, FileText, Users, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import { InlineDisclaimer } from "./InlineDisclaimer";

interface DefenseStrategyProps {
  violations: any;
  caseDetails: any;
}

export function DefenseStrategy({ violations, caseDetails }: DefenseStrategyProps) {
  const getDefenseStrategies = () => {
    const strategies = [];

    // Constitutional violations
    if (violations.fourthAmendment) {
      strategies.push({
        title: "File Motion to Suppress Evidence",
        category: "Constitutional Defense",
        priority: "High",
        description: "Challenge the warrantless entry and any evidence obtained from it.",
        steps: [
          "Document exactly what happened during the entry",
          "Determine if you gave consent or if CPS claimed exigent circumstances",
          "File motion to suppress evidence obtained from illegal entry",
          "Cite relevant case law (e.g., Camreta v. Greene, Doe v. Heck)",
          "Request dismissal if evidence was illegally obtained",
        ],
      });
    }

    if (violations.fourteenthAmendment) {
      strategies.push({
        title: "Due Process Violation Defense",
        category: "Constitutional Defense",
        priority: "High",
        description: "Assert your right to due process was violated.",
        steps: [
          "Document when and how your rights were violated",
          "Show that proper procedures were not followed",
          "File motion citing 14th Amendment violations",
          "Request remedy for rights violations",
          "Seek dismissal based on due process violations",
        ],
      });
    }

    // Procedural violations
    if (violations.noWrittenNotice || violations.missedDeadlines) {
      strategies.push({
        title: "Challenge Procedural Failures",
        category: "Procedural Defense",
        priority: "High",
        description: "CPS must follow specific procedures and timelines.",
        steps: [
          "Review state CPS statutes and regulations",
          "Document all procedural violations with dates",
          "File motion to dismiss based on failure to follow procedures",
          "Request sanctions against CPS for violations",
          "Use violations to show pattern of misconduct",
        ],
      });
    }

    if (violations.noReasonableEfforts || violations.noSafetyPlan) {
      strategies.push({
        title: "Reasonable Efforts Defense",
        category: "Procedural Defense",
        priority: "High",
        description: "CPS must make reasonable efforts before and after removal.",
        steps: [
          "Document that no services were offered before removal",
          "Show that CPS did not try alternatives to removal",
          "Request finding that reasonable efforts were NOT made",
          "This can lead to case dismissal or immediate reunification",
          "Cite ASFA (Adoption and Safe Families Act) requirements",
        ],
      });
    }

    // Evidence challenges
    if (violations.falsifiedReports || violations.cherryPickedEvidence) {
      strategies.push({
        title: "Challenge CPS Reports & Evidence",
        category: "Evidence Defense",
        priority: "High",
        description: "Attack the credibility and accuracy of CPS evidence.",
        steps: [
          "Create timeline showing contradictions in reports",
          "Gather evidence that contradicts false allegations",
          "Obtain witness statements supporting your version",
          "File motion to strike false statements from record",
          "Cross-examine caseworker on inconsistencies",
        ],
      });
    }

    if (violations.hearsayEvidence || violations.noPhysicalEvidence) {
      strategies.push({
        title: "Insufficient Evidence Defense",
        category: "Evidence Defense",
        priority: "Medium",
        description: "Challenge the quality and sufficiency of evidence.",
        steps: [
          "Object to hearsay evidence at hearings",
          "Point out lack of physical evidence supporting claims",
          "Request specific findings of fact based on actual evidence",
          "Motion for directed verdict due to insufficient evidence",
          "Emphasize burden of proof is on CPS",
        ],
      });
    }

    if (violations.biasedInvestigation) {
      strategies.push({
        title: "Investigator Bias Challenge",
        category: "Evidence Defense",
        priority: "Medium",
        description: "Show that investigation was biased or predetermined.",
        steps: [
          "Document examples of bias in investigation",
          "Show investigator ignored exculpatory evidence",
          "File complaint about investigator's conduct",
          "Request new investigator or supervisor review",
          "Use bias to impeach investigator's testimony",
        ],
      });
    }

    // Rights violations
    if (violations.deniedLegalCounsel || violations.forcedToSign) {
      strategies.push({
        title: "Coercion & Rights Violation Defense",
        category: "Rights Defense",
        priority: "High",
        description: "Documents signed under duress are not valid.",
        steps: [
          "File motion to void any documents signed without counsel",
          "Declare you were not informed of right to attorney",
          "Show you were coerced or didn't understand what you signed",
          "Request all signed documents be stricken from evidence",
          "File grievance against caseworker for rights violations",
        ],
      });
    }

    // Service failures
    if (violations.noServicesOffered) {
      strategies.push({
        title: "Failure to Provide Services Defense",
        category: "Service Defense",
        priority: "Medium",
        description: "CPS must offer appropriate services for reunification.",
        steps: [
          "Document requested services that were denied",
          "Show you were willing to participate in services",
          "Prove CPS failed to make referrals",
          "Request immediate provision of services",
          "Use as evidence CPS not working toward reunification",
        ],
      });
    }

    if (violations.inappropriatePlacement || violations.noRelativePlacement) {
      strategies.push({
        title: "Challenge Placement Decisions",
        category: "Placement Defense",
        priority: "Medium",
        description: "Children should be placed with relatives when possible.",
        steps: [
          "Identify qualified relatives willing to take placement",
          "File motion for relative placement",
          "Document problems with current placement",
          "Request ICPC (Interstate Compact) if needed",
          "Show relative placement is in child's best interest",
        ],
      });
    }

    // General strategies
    strategies.push({
      title: "Build Your Counter-Narrative",
      category: "General Strategy",
      priority: "Essential",
      description: "Tell your side of the story with evidence.",
      steps: [
        "Write detailed timeline of all events",
        "Gather character witnesses (teachers, doctors, family)",
        "Collect evidence of good parenting (photos, activities, medical care)",
        "Document stable home environment",
        "Show bond between you and your children",
      ],
    });

    strategies.push({
      title: "Document Everything",
      category: "General Strategy",
      priority: "Essential",
      description: "Create a comprehensive record of your case.",
      steps: [
        "Keep copies of ALL documents and communications",
        "Take notes after every interaction with CPS",
        "Record dates, times, and what was said",
        "Photograph your home and living conditions",
        "Save text messages and emails",
      ],
    });

    if (Object.values(violations).filter(Boolean).length >= 3) {
      strategies.push({
        title: "File Complaint & Lawsuit",
        category: "Legal Action",
        priority: "Consider",
        description: "Multiple violations may warrant formal complaint or civil suit.",
        steps: [
          "File complaint with CPS ombudsman or oversight agency",
          "Document all violations for potential civil rights lawsuit",
          "Consult with civil rights attorney about 42 U.S.C. § 1983 claim",
          "Consider complaint to state licensing board",
          "Request investigation by state or federal authorities",
        ],
      });
    }

    return strategies.sort((a, b) => {
      const priorityOrder: Record<string, number> = { High: 0, Essential: 1, Medium: 2, Consider: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const strategies = getDefenseStrategies();
  const violationCount = Object.values(violations).filter(Boolean).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Essential":
        return "default";
      case "Medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-base sm:text-lg">Defense Strategies & Recommendations</h2>
          <HelpTooltip 
            content="Based on the violations you've identified, this section generates specific legal defense strategies. Each strategy includes step-by-step actions you can take to defend your case and fight for your children." 
            side="right"
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Based on the violations identified in your case, here are recommended defense strategies.
        </p>
      </div>

      <InlineDisclaimer type="legal" variant="compact" />

      {violationCount === 0 ? (
        <>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No Violations Selected</AlertTitle>
            <AlertDescription>
              Go to the "Violations" tab to identify issues in your case. This will generate specific defense strategies.
            </AlertDescription>
          </Alert>
          
          <InfoBox title="How Defense Strategies Work" variant="primary">
            <p className="mb-3">This powerful feature automatically generates customized legal defense strategies based on the violations you've identified in your case.</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Automatic Generation:</strong> Strategies are created instantly when you select violations</li>
              <li><strong>Prioritized Actions:</strong> Each strategy is ranked by priority (High, Essential, Medium)</li>
              <li><strong>Step-by-Step Guidance:</strong> Clear action steps for implementing each strategy</li>
              <li><strong>Multiple Approaches:</strong> Constitutional, procedural, and evidence-based defenses</li>
              <li><strong>Case-Specific:</strong> Strategies adapt based on your specific violation pattern</li>
            </ul>
            <p className="mt-3 text-xs italic">💡 Tip: The more violations you accurately identify, the more comprehensive your defense strategy becomes.</p>
          </InfoBox>
        </>
      ) : (
        <>
          <Card className="p-4 sm:p-6 bg-primary/5">
            <div className="flex items-start gap-2 sm:gap-3">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base mb-2">Important Reminders</div>
                <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>• These strategies are educational - consult with a qualified attorney</li>
                  <li>• Every case is unique - adapt these strategies to your situation</li>
                  <li>• Document everything and keep detailed records</li>
                  <li>• Act quickly - many motions and deadlines are time-sensitive</li>
                  <li>• Stay calm and professional in all interactions</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:gap-4">
            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              {strategies.map((strategy, index) => (
                <AccordionItem key={index} value={`strategy-${index}`} className="border rounded-lg">
                  <Card className="border-0">
                    <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pr-2 sm:pr-4 gap-2">
                        <div className="flex items-start gap-2 sm:gap-3 text-left flex-1 min-w-0">
                          <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base mb-1">{strategy.title}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{strategy.description}</p>
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(strategy.priority) as any} className="text-xs flex-shrink-0">
                          {strategy.priority}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4" />
                          <span className="text-muted-foreground">Category: {strategy.category}</span>
                        </div>
                        <div>
                          <div className="mb-2 text-sm">Action Steps:</div>
                          <ol className="space-y-2">
                            {strategy.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex gap-3 text-sm">
                                <span className="text-primary shrink-0">{stepIndex + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
}
