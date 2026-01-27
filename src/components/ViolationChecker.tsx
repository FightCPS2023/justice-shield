import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { AlertTriangle, Shield, AlertCircle, CheckCircle2, Lock, Crown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import { InlineDisclaimer } from "./InlineDisclaimer";

interface ViolationCheckerProps {
  violations: any;
  onUpdate: (field: string, value: boolean) => void;
}

export function ViolationChecker({ violations, onUpdate }: ViolationCheckerProps) {
  const { tier, getViolationLimit, canSeeFullViolationDetails } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const violationCategories = [
    {
      title: "Constitutional Rights Violations",
      icon: Shield,
      items: [
        {
          key: "fourthAmendment",
          label: "4th Amendment - Warrantless Search/Entry",
          description: "CPS entered home without warrant, consent, or exigent circumstances",
        },
        {
          key: "fourteenthAmendment",
          label: "14th Amendment - Due Process Violation",
          description: "Rights violated without proper legal procedures",
        },
        {
          key: "firstAmendment",
          label: "1st Amendment - Religious Freedom",
          description: "Interference with religious practices or beliefs",
        },
      ],
    },
    {
      title: "Procedural Violations",
      icon: AlertCircle,
      items: [
        {
          key: "noMirandaRights",
          label: "Failure to Read Rights",
          description: "Did not inform you of your rights before questioning",
        },
        {
          key: "noWrittenNotice",
          label: "No Written Notice",
          description: "Failed to provide written notice of allegations or hearings",
        },
        {
          key: "improperInvestigation",
          label: "Improper Investigation Procedures",
          description: "Investigation did not follow required protocols",
        },
        {
          key: "missedDeadlines",
          label: "Missed Legal Deadlines",
          description: "CPS failed to meet court-ordered or statutory deadlines",
        },
        {
          key: "noSafetyPlan",
          label: "No Safety Plan Offered",
          description: "Failed to offer safety plan before removal",
        },
        {
          key: "noReasonableEfforts",
          label: "Failure to Make Reasonable Efforts",
          description: "Did not try to prevent removal or reunify family",
        },
      ],
    },
    {
      title: "Evidence & Documentation Issues",
      icon: AlertTriangle,
      items: [
        {
          key: "falsifiedReports",
          label: "Falsified or Exaggerated Reports",
          description: "Reports contain false information or exaggerations",
        },
        {
          key: "hearsayEvidence",
          label: "Reliance on Hearsay",
          description: "Case based on hearsay rather than direct evidence",
        },
        {
          key: "noPhysicalEvidence",
          label: "Lack of Physical Evidence",
          description: "Allegations not supported by physical evidence",
        },
        {
          key: "biasedInvestigation",
          label: "Biased Investigation",
          description: "Investigator showed bias or predetermined conclusion",
        },
        {
          key: "cherryPickedEvidence",
          label: "Cherry-Picked Evidence",
          description: "Ignored exculpatory evidence or positive information",
        },
      ],
    },
    {
      title: "Rights Denial",
      icon: Shield,
      items: [
        {
          key: "deniedLegalCounsel",
          label: "Denied Access to Attorney",
          description: "Prevented from consulting with lawyer",
        },
        {
          key: "forcedToSign",
          label: "Coerced to Sign Documents",
          description: "Pressured to sign papers without understanding or legal counsel",
        },
        {
          key: "deniedVisitation",
          label: "Improper Denial of Visitation",
          description: "Denied visits with child without valid reason",
        },
        {
          key: "noInterpreter",
          label: "No Interpreter Provided",
          description: "Language barrier not accommodated",
        },
      ],
    },
    {
      title: "Service & Placement Issues",
      icon: CheckCircle2,
      items: [
        {
          key: "noServicesOffered",
          label: "Services Not Offered",
          description: "Failed to provide required services or referrals",
        },
        {
          key: "inappropriatePlacement",
          label: "Inappropriate Placement",
          description: "Child placed in unsuitable or unsafe environment",
        },
        {
          key: "separatedSiblings",
          label: "Siblings Separated",
          description: "Separated siblings without justification",
        },
        {
          key: "noRelativePlacement",
          label: "Didn't Consider Relative Placement",
          description: "Failed to place with relatives before foster care",
        },
      ],
    },
  ];

  const totalViolations = Object.values(violations).filter(Boolean).length;
  const violationLimit = getViolationLimit();
  const showFullDetails = canSeeFullViolationDetails();
  
  // Get checked violations
  const checkedViolations = Object.entries(violations)
    .filter(([_, value]) => value)
    .map(([key]) => key);
  
  // For free users, show only first 2 violations
  const visibleViolationsCount = tier === 'free' && violationLimit !== 'unlimited' 
    ? Math.min(checkedViolations.length, violationLimit as number)
    : checkedViolations.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-base sm:text-lg">Identify Violations in Your Case</h2>
          {tier === 'free' && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Lock className="w-3 h-3" />
              {violationLimit} violations shown (Free)
            </Badge>
          )}
          <HelpTooltip 
            content="Select all violations that apply to your case. Each violation you identify will be analyzed in detail and included in your defense strategy. The more violations you document, the stronger your case becomes." 
            side="right"
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Check all violations that apply to your situation. These can form the basis of your defense.
          {tier === 'free' && ' Free users can identify violations but see limited details for only 2 violations.'}
        </p>
      </div>

      {/* Legal disclaimer for violation checker */}
      <InlineDisclaimer type="educational" variant="compact" />
      <InlineDisclaimer type="data" variant="compact" />

      {/* First-time user guide */}
      {totalViolations === 0 && (
        <InfoBox title="How to Use the Violation Checker" variant="primary">
          <ol className="space-y-2 list-decimal list-inside">
            <li><strong>Review Each Category:</strong> Read through all violation types carefully</li>
            <li><strong>Check What Applies:</strong> Select all violations that occurred in your case</li>
            <li><strong>Read Descriptions:</strong> Each violation includes a detailed explanation to help you identify it</li>
            <li><strong>Build Your Defense:</strong> Selected violations automatically populate your defense strategy</li>
            <li><strong>Document Everything:</strong> Note specific dates and incidents for each violation you select</li>
          </ol>
        </InfoBox>
      )}

      {tier === 'free' && totalViolations === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Free Tier: 2 Violation Analysis</AlertTitle>
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p>As a free user, you can:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✅ Check any violations in your case</li>
                <li>✅ See basic summary for up to 2 violations</li>
                <li>⚠️ Limited details and defense strategies</li>
              </ul>
              <p className="mt-2"><strong>Premium users get:</strong></p>
              <ul className="text-sm space-y-1 ml-4">
                <li>🔥 Full analysis of ALL violations (unlimited)</li>
                <li>🔥 Detailed case law and legal precedents</li>
                <li>🔥 Specific defense strategies for each violation</li>
                <li>🔥 State-specific guidance</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {totalViolations > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            Potential Violations Identified: {totalViolations}
            {tier === 'free' && totalViolations > 2 && (
              <span className="text-sm text-muted-foreground ml-2">
                (Showing details for {visibleViolationsCount})
              </span>
            )}
          </AlertTitle>
          <AlertDescription>
            {tier === 'premium' ? (
              'These violations may strengthen your case. Document each one thoroughly and consult with your attorney.'
            ) : (
              <>
                You've identified {totalViolations} potential violation{totalViolations > 1 ? 's' : ''}. 
                {totalViolations > 2 ? (
                  <> Free users see summary details for 2 violations. <strong>Upgrade to Premium</strong> to unlock full analysis of all {totalViolations} violations with case law, defense strategies, and recommended actions.</>
                ) : (
                  ' Review the summary below and upgrade to see detailed legal analysis.'
                )}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 sm:space-y-6">
        {violationCategories.map((category) => {
          const Icon = category.icon;
          const categoryViolations = category.items.filter((item) => violations[item.key]).length;

          return (
            <Card key={category.title} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-semibold">{category.title}</span>
                </div>
                {categoryViolations > 0 && (
                  <Badge variant="destructive" className="text-xs">{categoryViolations} found</Badge>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {category.items.map((item) => (
                  <div key={item.key} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={item.key}
                      checked={violations[item.key]}
                      onCheckedChange={(checked) => onUpdate(item.key, checked as boolean)}
                      className="mt-0.5 sm:mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <label htmlFor={item.key} className="cursor-pointer leading-none text-sm sm:text-base block">
                        {item.label}
                      </label>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}