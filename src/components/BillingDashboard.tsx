import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Crown, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BillingDashboardProps {
  userId: string;
  accessToken: string;
}

interface SubscriptionInfo {
  status: string;
  tier: 'free' | 'premium' | 'attorney';
  subscription: {
    id: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
    trial_end?: number;
  } | null;
}

export function BillingDashboard({ userId, accessToken }: BillingDashboardProps) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [userId]);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-a24eaa40/stripe/subscription-status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load subscription');
      }

      setSubscription(data);
    } catch (err: any) {
      console.error('Error loading subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-a24eaa40/stripe/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            returnUrl: window.location.href,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Portal error:', err);
      setError(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tierInfo = {
    free: {
      name: 'Free Plan',
      color: 'text-gray-600',
      badge: 'default' as const,
    },
    premium: {
      name: 'Premium',
      color: 'text-amber-600',
      badge: 'default' as const,
    },
    attorney: {
      name: 'Attorney Suite',
      color: 'text-purple-600',
      badge: 'secondary' as const,
    },
  };

  const currentTier = subscription?.tier || 'free';
  const info = tierInfo[currentTier];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className={`size-5 ${info.color}`} />
            Current Plan
          </CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{info.name}</h3>
              <Badge variant={info.badge} className="mt-2">
                {subscription?.status || 'Active'}
              </Badge>
            </div>
            {currentTier !== 'free' && (
              <Button
                onClick={handleManageSubscription}
                disabled={actionLoading}
                variant="outline"
              >
                {actionLoading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="size-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            )}
          </div>

          {/* Subscription Details */}
          {subscription?.subscription && (
            <div className="space-y-4">
              {subscription.subscription.trial_end && 
               subscription.subscription.trial_end * 1000 > Date.now() && (
                <Alert>
                  <Calendar className="size-4" />
                  <AlertDescription>
                    <strong>Trial Active:</strong> Your free trial ends on{' '}
                    {new Date(subscription.subscription.trial_end * 1000).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date:</span>
                  <span className="font-medium">
                    {new Date(subscription.subscription.current_period_end * 1000).toLocaleDateString()}
                  </span>
                </div>

                {subscription.subscription.cancel_at_period_end && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      Your subscription will be canceled on{' '}
                      {new Date(subscription.subscription.current_period_end * 1000).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Manage Options */}
          {currentTier !== 'free' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Through the Customer Portal, you can:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Update your payment method</li>
                <li>• View and download invoices</li>
                <li>• Update billing information</li>
                <li>• Cancel your subscription</li>
                <li>• Change your plan</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats (if not free) */}
      {currentTier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>This Month's Usage</CardTitle>
            <CardDescription>Track your feature usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-2xl font-bold">Unlimited</p>
                <p className="text-sm text-muted-foreground mt-1">Documents Analyzed</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-2xl font-bold">
                  {currentTier === 'premium' ? '50' : '200'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">AI Requests/Day</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-2xl font-bold">All</p>
                <p className="text-sm text-muted-foreground mt-1">Features Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt (if free) */}
      {currentTier === 'free' && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-5 text-amber-600" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Unlock AI-powered features and unlimited access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Premium - $19.99/month</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Unlimited documents</li>
                  <li>✓ AI analysis</li>
                  <li>✓ Defense strategies</li>
                  <li>✓ 7-day free trial</li>
                </ul>
                <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
                  Start Free Trial
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Attorney Suite - $99/month</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Everything in Premium</li>
                  <li>✓ 50M+ court opinions</li>
                  <li>✓ Professional tools</li>
                  <li>✓ Multi-state research</li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/pricing'}>
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}