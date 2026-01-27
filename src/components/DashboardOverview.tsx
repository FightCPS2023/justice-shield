// Enhanced Dashboard Overview Component
import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  FileText,
  AlertTriangle,
  Calendar,
  Shield,
  CheckSquare,
  TrendingUp,
  Upload,
  FileSearch,
  Lightbulb,
  ArrowRight,
  Clock,
  Target,
  BookOpen,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";

interface DashboardOverviewProps {
  documentCount: number;
  timelineEventCount: number;
  violationCount: number;
  caseDetails: {
    caseNumber: string;
    dateOpened: string;
    county: string;
  };
  onNavigate: (tab: string) => void;
}

export function DashboardOverview({
  documentCount,
  timelineEventCount,
  violationCount,
  caseDetails,
  onNavigate,
}: DashboardOverviewProps) {
  // Calculate case preparation progress
  const calculateProgress = () => {
    let progress = 0;
    if (documentCount > 0) progress += 25;
    if (timelineEventCount > 0) progress += 25;
    if (violationCount > 0) progress += 25;
    if (caseDetails.caseNumber && caseDetails.dateOpened) progress += 25;
    return progress;
  };

  const progress = calculateProgress();

  const getProgressStatus = () => {
    if (progress < 30) return { label: "Getting Started", color: "text-red-600" };
    if (progress < 60) return { label: "Building Foundation", color: "text-yellow-600" };
    if (progress < 90) return { label: "Making Progress", color: "text-blue-600" };
    return { label: "Well Prepared", color: "text-green-600" };
  };

  const status = getProgressStatus();

  const quickActions = [
    {
      icon: Upload,
      label: "Upload Document",
      description: "Add CPS documents for AI analysis",
      action: () => onNavigate("documents"),
      variant: "default" as const,
    },
    {
      icon: FileSearch,
      label: "Check Violations",
      description: "Identify procedural and legal violations",
      action: () => onNavigate("violations"),
      variant: "outline" as const,
    },
    {
      icon: Lightbulb,
      label: "Generate Defense",
      description: "Create defense strategies based on violations",
      action: () => onNavigate("defense"),
      variant: "outline" as const,
    },
    {
      icon: BookOpen,
      label: "Know Your Rights",
      description: "Comprehensive guide to parental rights",
      action: () => onNavigate("rights"),
      variant: "outline" as const,
    },
  ];

  const metrics = [
    {
      icon: FileText,
      label: "Documents",
      value: documentCount,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      action: () => onNavigate("documents"),
    },
    {
      icon: Calendar,
      label: "Timeline Events",
      value: timelineEventCount,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      action: () => onNavigate("timeline"),
    },
    {
      icon: AlertTriangle,
      label: "Violations Found",
      value: violationCount,
      color: violationCount > 0 ? "bg-red-500" : "bg-gray-400",
      textColor: violationCount > 0 ? "text-red-600" : "text-gray-600",
      action: () => onNavigate("violations"),
    },
    {
      icon: Shield,
      label: "Case Progress",
      value: `${progress}%`,
      color: "bg-green-500",
      textColor: "text-green-600",
      action: () => {},
    },
  ];

  const nextSteps = [
    {
      condition: documentCount === 0,
      title: "Upload Your First Document",
      description: "Start by uploading CPS documents to analyze for violations",
      action: () => onNavigate("documents"),
    },
    {
      condition: timelineEventCount === 0,
      title: "Build Your Case Timeline",
      description: "Document all important dates and events in your case",
      action: () => onNavigate("timeline"),
    },
    {
      condition: violationCount === 0,
      title: "Check for Violations",
      description: "Review your case for procedural and constitutional violations",
      action: () => onNavigate("violations"),
    },
    {
      condition: violationCount > 0 && documentCount > 0,
      title: "Generate Defense Strategy",
      description: "Create a comprehensive defense based on identified violations",
      action: () => onNavigate("defense"),
    },
  ];

  const activeNextSteps = nextSteps.filter((step) => step.condition).slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6" role="region" aria-label="Dashboard Overview">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg sm:text-xl">Welcome to Your Case Defense Center</h2>
              <HelpTooltip 
                content="This dashboard shows your overall case progress and guides you through building a strong defense. Complete each section to maximize your chances of success." 
                side="right"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
              {caseDetails.caseNumber
                ? `Managing case ${caseDetails.caseNumber}`
                : "Build your defense strategy with AI-powered analysis"}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="text-xs sm:text-sm">
                <Target className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
              {caseDetails.dateOpened && (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  Opened {new Date(caseDetails.dateOpened).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
          {violationCount > 0 && (
            <div className="bg-red-100 dark:bg-red-900/30 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-red-300 dark:border-red-700 w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  {violationCount} Violations
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300">
                Review defense strategies
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Case Preparation Progress</span>
              <HelpTooltip 
                content="Your progress is calculated based on: uploading documents (25%), creating timeline events (25%), identifying violations (25%), and entering case details (25%)." 
                side="right"
                iconClassName="h-3 w-3"
              />
            </div>
            <span className={`text-sm font-medium ${status.color}`}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Complete all sections to maximize your defense preparation
          </p>
        </div>
      </div>

      {/* First Time User Guide */}
      {progress === 0 && (
        <InfoBox title="🎯 Quick Start Guide - Get Started in 3 Steps" variant="primary">
          <ol className="space-y-3 list-decimal list-inside">
            <li>
              <strong>Upload Documents:</strong> Start by uploading your CPS reports, court documents, or emails. Our AI will automatically analyze them for violations.
            </li>
            <li>
              <strong>Identify Violations:</strong> Review the Violations section and check all that apply to your case. This creates the foundation of your defense.
            </li>
            <li>
              <strong>Generate Your Defense:</strong> Once violations are identified, view your personalized defense strategy with specific action steps.
            </li>
          </ol>
          <p className="mt-3 text-xs italic">💡 Pro Tip: The more detailed information you add, the more powerful your defense becomes. Don't rush - take time to document everything accurately.</p>
        </InfoBox>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary/50"
                onClick={metric.action}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    metric.action();
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className={`text-3xl font-semibold ${metric.textColor}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>Click to view {metric.label.toLowerCase()}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Next Steps */}
      {activeNextSteps.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Recommended Next Steps
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {activeNextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 sm:p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors cursor-pointer group"
                onClick={step.action}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    step.action();
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base mb-1 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2 sm:ml-4" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="p-4 sm:p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2 sm:gap-3">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-1" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base mb-1 sm:mb-2 text-amber-900 dark:text-amber-100">
              Important Reminder
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
              This tool is designed to help you identify potential issues and build your defense
              strategy. However, it does not replace professional legal counsel. Every CPS case
              is unique and requires personalized legal advice. Always consult with a qualified
              family law attorney before taking legal action.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}