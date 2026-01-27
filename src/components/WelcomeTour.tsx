// Welcome Tour Component for First-Time Users
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  FileText,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Shield,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: any;
  image?: string;
  tip?: string;
}

interface WelcomeTourProps {
  onComplete: () => void;
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenWelcomeTour");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const steps: TourStep[] = [
    {
      title: "Welcome to CPS Case Defense Analyzer",
      description:
        "This powerful tool helps you identify violations in your CPS case and build a strong defense strategy. Let us show you how to get started.",
      icon: Sparkles,
      tip: "This is an educational tool. Always consult with a qualified attorney for legal advice.",
    },
    {
      title: "Step 1: Upload Your Documents",
      description:
        "Start by uploading CPS documents like court orders, case plans, and reports. Our AI will automatically analyze them to identify key information, violations, and timeline events.",
      icon: FileText,
      tip: "The more documents you upload, the more comprehensive your analysis will be.",
    },
    {
      title: "Step 2: Build Your Timeline",
      description:
        "Create a chronological timeline of all important events in your case. Our AI can automatically extract dates and events from your uploaded documents.",
      icon: Calendar,
      tip: "A detailed timeline helps identify patterns and procedural violations.",
    },
    {
      title: "Step 3: Check for Violations",
      description:
        "Review the 24 types of violations our system can identify, including constitutional rights violations, procedural errors, evidence issues, and service failures.",
      icon: AlertTriangle,
      tip: "Violations identified by AI should be verified with your attorney.",
    },
    {
      title: "Step 4: Generate Defense Strategies",
      description:
        "Based on identified violations, generate specific, actionable defense strategies tailored to your case. Get legal precedents and motion templates.",
      icon: Lightbulb,
      tip: "Defense strategies are customized based on your state's laws and regulations.",
    },
    {
      title: "Step 5: Know Your Rights",
      description:
        "Access comprehensive guides about your parental rights, court procedures, and CPS regulations specific to your state.",
      icon: Shield,
      tip: "Understanding your rights is crucial to protecting your family.",
    },
    {
      title: "Step 6: Collect Evidence",
      description:
        "Use our evidence checklist to ensure you're gathering all necessary documentation to support your case and counter CPS claims.",
      icon: CheckSquare,
      tip: "Document everything - photos, communications, witness statements, and more.",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenWelcomeTour", "true");
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenWelcomeTour", "true");
    setIsOpen(false);
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle>{currentStepData.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <DialogDescription className="text-base">
          {currentStepData.description}
        </DialogDescription>

        {currentStepData.tip && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Pro Tip</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentStepData.tip}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tour
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to reset the tour for testing or user preference
export function useResetTour() {
  return () => {
    localStorage.removeItem("hasSeenWelcomeTour");
    window.location.reload();
  };
}
