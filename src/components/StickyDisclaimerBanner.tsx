import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

export function StickyDisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has permanently dismissed the banner
    const dismissed = localStorage.getItem('cps-disclaimer-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('cps-disclaimer-banner-dismissed', 'true');
    setIsDismissed(true);
  };

  const handleShow = () => {
    setIsVisible(true);
  };

  // If permanently dismissed, show a small button to bring it back
  if (isDismissed && !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShow}
          className="shadow-lg bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
          aria-label="Show legal disclaimer"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Legal Notice
        </Button>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
      <Alert className="rounded-none border-0 border-b-2 border-amber-500 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 dark:from-amber-950 dark:via-amber-900 dark:to-amber-950 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-1.5 overflow-x-auto">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
            <AlertDescription className="text-amber-900 dark:text-amber-100 text-xs font-medium whitespace-nowrap">
              <strong>LEGAL NOTICE:</strong> This app provides legal information, NOT legal advice. 
              We are NOT attorneys. No attorney-client relationship is created.
              {' '}<strong className="underline">You MUST consult a licensed attorney.</strong>
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-5 w-5 p-0 hover:bg-amber-200 dark:hover:bg-amber-800 flex-shrink-0"
              aria-label="Dismiss disclaimer banner"
            >
              <X className="h-3 w-3 text-amber-700 dark:text-amber-300" />
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}