// Reusable Help Tooltip Component for User Guidance
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { HelpCircle, Info } from "lucide-react";
import { cn } from "./utils";

interface HelpTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  variant?: "help" | "info";
  className?: string;
  iconClassName?: string;
}

export function HelpTooltip({
  content,
  side = "top",
  variant = "help",
  className,
  iconClassName,
}: HelpTooltipProps) {
  const Icon = variant === "help" ? HelpCircle : Info;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
            className
          )}
          aria-label="Help information"
        >
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Quick info box component for inline help
interface InfoBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function InfoBox({
  title,
  children,
  variant = "default",
  className,
}: InfoBoxProps) {
  const variants = {
    default: "bg-muted/50 border-muted-foreground/20",
    primary: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-2",
        variants[variant],
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <h4 className="font-medium">{title}</h4>
        </div>
      )}
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
