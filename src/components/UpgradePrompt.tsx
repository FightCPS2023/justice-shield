import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Crown, Sparkles, Lock, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredTier: 'premium' | 'attorney';
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  variant?: 'inline' | 'modal';
}

export function UpgradePrompt({
  feature,
  description,
  requiredTier,
  open,
  onClose,
  onUpgrade,
  variant = 'modal',
}: UpgradePromptProps) {
  const benefits = {
    premium: [
      'Unlimited document uploads',
      'AI document analysis',
      'Defense strategy generator',
      'Motion templates',
      'Case podcast',
      'Virtual case binder',
      'Priority support',
    ],
    attorney: [
      'Everything in Premium, PLUS:',
      '50M+ court opinions',
      'Multi-state law research',
      'Professional reports',
      'Litigation tools',
      'Client management',
    ],
  };

  const price = requiredTier === 'premium' ? '$19.99' : '$99';
  const tierName = requiredTier === 'premium' ? 'Premium' : 'Attorney Suite';

  if (variant === 'inline') {
    return (
      <Alert className="border-primary bg-primary/5">
        <Lock className="size-4" />
        <AlertTitle className="flex items-center gap-2">
          {feature}
          <Badge variant="secondary">{tierName} Required</Badge>
        </AlertTitle>
        <AlertDescription>
          <p className="mb-3">{description}</p>
          <Button onClick={onUpgrade} size="sm">
            <Crown className="size-4 mr-2" />
            Upgrade to {tierName} - {price}/month
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg sm:text-xl">{feature}</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl sm:text-3xl font-bold">{price}</span>
              <span className="text-sm sm:text-base text-muted-foreground">/month</span>
            </div>
            <p className="text-sm font-medium">{tierName} Plan</p>
            {requiredTier === 'premium' && (
              <p className="text-xs text-muted-foreground mt-1">
                7-day free trial included
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-3">What you'll get:</p>
            <ul className="space-y-2">
              {benefits[requiredTier].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Sparkles className="size-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium mb-1">Worth Every Penny</p>
                <p className="text-muted-foreground leading-relaxed">
                  Save thousands in legal research fees. One hour with an attorney costs ${requiredTier === 'premium' ? '300-500' : '400-600'}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} className="flex-1">
            <Crown className="size-4 mr-2" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline banner version for page-level prompts
export function UpgradeBanner({
  feature,
  requiredTier,
  onUpgrade,
}: {
  feature: string;
  requiredTier: 'premium' | 'attorney';
  onUpgrade: () => void;
}) {
  const price = requiredTier === 'premium' ? '$19.99' : '$99';
  const tierName = requiredTier === 'premium' ? 'Premium' : 'Attorney Suite';

  return (
    <div className="rounded-lg border-2 border-primary bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Crown className="size-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            {feature}
            <Badge>{tierName} Feature</Badge>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock this powerful feature and many more with {tierName}. 
            {requiredTier === 'premium' && ' Start with a 7-day free trial.'}
          </p>
          <Button onClick={onUpgrade}>
            Upgrade to {tierName} - {price}/month
          </Button>
        </div>
      </div>
    </div>
  );
}

// Usage limit warning
export function UsageLimitWarning({
  used,
  limit,
  type,
  onUpgrade,
}: {
  used: number;
  limit: number;
  type: 'documents' | 'ai_requests';
  onUpgrade: () => void;
}) {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  if (!isNearLimit) return null;

  const typeLabel = type === 'documents' ? 'document uploads' : 'AI requests';
  const resetText = type === 'documents' ? 'next month' : 'tomorrow';

  return (
    <Alert variant={isAtLimit ? 'destructive' : 'default'} className="mb-4">
      <Lock className="size-4" />
      <AlertTitle>
        {isAtLimit ? `${typeLabel} limit reached` : `Approaching ${typeLabel} limit`}
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          You've used {used} of {limit} {typeLabel} this {type === 'documents' ? 'month' : 'day'}.
          {isAtLimit ? ` Limit resets ${resetText}.` : ''}
        </p>
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all ${isAtLimit ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <Button onClick={onUpgrade} size="sm" variant={isAtLimit ? 'default' : 'outline'}>
          Upgrade for Unlimited Access
        </Button>
      </AlertDescription>
    </Alert>
  );
}