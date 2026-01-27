import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, ArrowRight, Info } from 'lucide-react';
import { Button } from './ui/button';

interface ActionWarningProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'warning' | 'info' | 'error';
  icon?: React.ReactNode;
  className?: string;
}

export function ActionWarning({ 
  title, 
  message, 
  actionLabel, 
  onAction, 
  variant = 'warning',
  icon,
  className = ''
}: ActionWarningProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return 'border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800';
      case 'info':
        return 'border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800';
      case 'warning':
      default:
        return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'error':
        return 'text-red-900 dark:text-red-200';
      case 'info':
        return 'text-blue-900 dark:text-blue-200';
      case 'warning':
      default:
        return 'text-yellow-900 dark:text-yellow-200';
    }
  };

  const defaultIcon = variant === 'info' ? <Info className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />;

  return (
    <Alert className={`${getVariantStyles()} ${className} animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className={`${getIconColor()} flex-shrink-0 mt-0.5`}>
        {icon || defaultIcon}
      </div>
      <div className="flex-1 min-w-0">
        <AlertTitle className={`${getTextColor()} font-semibold mb-1 text-sm sm:text-base`}>
          {title}
        </AlertTitle>
        <AlertDescription className={`${getTextColor()} opacity-90 text-xs sm:text-sm leading-relaxed`}>
          {message}
        </AlertDescription>
        {actionLabel && onAction && (
          <Button
            size="sm"
            onClick={onAction}
            className="mt-3 w-full sm:w-auto"
            variant={variant === 'error' ? 'destructive' : 'default'}
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Pre-built warning messages for common scenarios
export const CommonWarnings = {
  noCase: {
    title: 'No Case Selected',
    message: 'Please select or create a case before accessing this feature. All documents, timelines, and violations are organized by case.',
    actionLabel: 'Create Your First Case',
    variant: 'warning' as const,
  },
  noDocuments: {
    title: 'No Documents Uploaded',
    message: 'Upload case documents to enable AI analysis. Supported formats: PDF, DOC, DOCX, TXT, and images.',
    actionLabel: 'Upload Documents',
    variant: 'info' as const,
  },
  noTimeline: {
    title: 'Timeline Empty',
    message: 'Add events to your timeline to track the case chronologically. Include dates, descriptions, and supporting evidence.',
    actionLabel: 'Add Timeline Event',
    variant: 'info' as const,
  },
  selectState: {
    title: 'State Not Selected',
    message: 'Select your state to access state-specific CPS laws, regulations, and violation checks.',
    actionLabel: 'Select State',
    variant: 'warning' as const,
  },
  premiumFeature: {
    title: 'Premium Feature',
    message: 'This feature is available with a paid subscription. Upgrade to access advanced tools and unlimited AI analysis.',
    actionLabel: 'View Pricing',
    variant: 'info' as const,
  },
  missingInfo: {
    title: 'Missing Case Information',
    message: 'Complete the case details form to enable advanced features and generate accurate legal documents.',
    actionLabel: 'Complete Case Info',
    variant: 'warning' as const,
  },
  noViolations: {
    title: 'No Violations Detected Yet',
    message: 'Upload documents or add timeline events to scan for CPS violations. AI will analyze content and identify potential violations.',
    actionLabel: 'Get Started',
    variant: 'info' as const,
  },
  uploadInProgress: {
    title: 'Upload in Progress',
    message: 'Please wait for the current upload to complete before proceeding. AI analysis is processing your documents.',
    variant: 'info' as const,
  },
  noCaseWorker: {
    title: 'Case Worker Not Specified',
    message: 'Add your CPS case worker information to track interactions and generate targeted legal documents.',
    actionLabel: 'Add Case Worker Info',
    variant: 'info' as const,
  },
  noChildren: {
    title: 'No Children Added',
    message: 'Add information about the children involved in this case to generate accurate court documents and track their status.',
    actionLabel: 'Add Children Info',
    variant: 'warning' as const,
  },
};