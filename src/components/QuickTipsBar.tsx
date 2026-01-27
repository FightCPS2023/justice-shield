// Quick Tips Bar - Contextual help based on current section
import React from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Lightbulb, FileText, AlertTriangle, Calendar, Shield, CheckSquare } from "lucide-react";

interface QuickTipsBarProps {
  section: string;
}

export function QuickTipsBar({ section }: QuickTipsBarProps) {
  const tips: Record<string, { icon: any; tip: string }> = {
    documents: {
      icon: FileText,
      tip: "💡 Quick Tip: Upload documents immediately when you receive them. The AI will analyze each one for violations and extract timeline events automatically.",
    },
    violations: {
      icon: AlertTriangle,
      tip: "💡 Quick Tip: Check ALL violations that apply - don't minimize the issues. The more violations you document, the stronger your defense becomes.",
    },
    timeline: {
      icon: Calendar,
      tip: "💡 Quick Tip: Add events as they happen with specific dates and details. A detailed timeline often reveals patterns of CPS violations and proves your cooperation.",
    },
    defense: {
      icon: Lightbulb,
      tip: "💡 Quick Tip: Focus on 'High Priority' strategies first. Print these strategies and review them with your attorney for maximum impact.",
    },
    rights: {
      icon: Shield,
      tip: "💡 Quick Tip: You have MORE rights than CPS will tell you. Read the 'DO and DON'T' lists and exercise your rights politely but firmly.",
    },
    evidence: {
      icon: CheckSquare,
      tip: "💡 Quick Tip: Even if something seems unimportant, collect it anyway. You can decide what to use later with your attorney.",
    },
  };

  const currentTip = tips[section];
  
  if (!currentTip) return null;

  const Icon = currentTip.icon;

  return (
    <Alert className="mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-l-4 border-l-amber-500">
      <Icon className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <AlertDescription className="text-xs sm:text-sm text-amber-900 dark:text-amber-100">
        {currentTip.tip}
      </AlertDescription>
    </Alert>
  );
}
