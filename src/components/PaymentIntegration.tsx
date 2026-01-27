import React, { useState, useEffect } from 'react';
import { PricingTable } from './PricingTable';
import { CheckoutPage } from './CheckoutPage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle2, XCircle, CreditCard, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { toast } from 'sonner@2.0.3';

interface PaymentIntegrationProps {
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
}

export function PaymentIntegration({ userId, userEmail, onSuccess }: PaymentIntegrationProps) {
  const { tier } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ priceId: string; planName: string } | null>(null);

  const handleSelectPlan = (priceId: string, planName: string) => {
    setSelectedPlan({ priceId, planName });
    setShowCheckout(true);
    toast.info(`Starting checkout for ${planName}...`);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    toast.success('Payment successful! Your subscription is now active.');
    onSuccess?.();
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    toast.info('Checkout cancelled. You can upgrade anytime.');
  };

  return (
    <div className="w-full">
      {/* Current Plan Badge */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <Badge variant={tier === 'free' ? 'secondary' : 'default'} className="text-lg px-4 py-2">
          <Crown className="w-4 h-4 mr-2" />
          Current Plan: {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Badge>
      </div>

      {/* Pricing Table */}
      <PricingTable
        onSelectPlan={handleSelectPlan}
        currentTier={tier}
        loading={showCheckout}
      />

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              You're upgrading to {selectedPlan?.planName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <CheckoutPage
              priceId={selectedPlan.priceId}
              planName={selectedPlan.planName}
              userId={userId}
              userEmail={userEmail}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Subscription Status Component
 * Shows current subscription info and management options
 */
interface SubscriptionStatusProps {
  userId: string;
}

export function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const { tier } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const openCustomerPortal = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-a24eaa40/stripe/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId,
            returnUrl: window.location.origin + '/settings',
          }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not open billing portal');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'attorney':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'professional':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'essential':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tier */}
        <div className={`p-4 rounded-lg border-2 ${getTierColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6" />
              <div>
                <p className="font-semibold text-lg">
                  {tier === 'free' ? 'Free Tier' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`}
                </p>
                <p className="text-sm opacity-80">
                  {tier === 'free' ? 'Upgrade to unlock premium features' : 'Active subscription'}
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Manage Subscription */}
        {tier !== 'free' && (
          <div className="space-y-2">
            <Button
              onClick={openCustomerPortal}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Update payment method, view invoices, or cancel subscription
            </p>
          </div>
        )}

        {/* Free Tier CTA */}
        {tier === 'free' && (
          <Alert>
            <AlertTitle>Unlock Premium Features</AlertTitle>
            <AlertDescription>
              Upgrade to Essential ($39/mo) to get AI analysis, unlimited documents, and more.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline Upgrade Prompt
 * Shows a small upgrade prompt for specific features
 */
interface UpgradePromptProps {
  feature: string;
  requiredTier: 'essential' | 'professional' | 'attorney' | 'enterprise';
  onUpgrade: () => void;
}

export function InlineUpgradePrompt({ feature, requiredTier, onUpgrade }: UpgradePromptProps) {
  const { tier } = useSubscription();

  // Don't show if user already has access
  const tierOrder = ['free', 'essential', 'professional', 'attorney', 'enterprise'];
  if (tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier)) {
    return null;
  }

  return (
    <Alert className="border-2 border-primary/20 bg-primary/5">
      <Crown className="h-4 w-4" />
      <AlertTitle>Premium Feature: {feature}</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>
          Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to unlock this feature
        </span>
        <Button onClick={onUpgrade} size="sm" className="ml-4">
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
