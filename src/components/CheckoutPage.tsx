import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, Check, Lock, Shield, 
  AlertCircle, Crown, Loader2, CreditCard, Star, Scale, Building2, Zap
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { CPSPunisherLogo } from './CPSPunisherLogo';
import { toast } from 'sonner@2.0.3';
import { STRIPE_PRICE_IDS } from '../utils/stripe-config';
import { projectId } from '../utils/supabase/info';
import { publicAnonKey } from '../utils/supabase/info';
import { createDemoCheckoutSession } from '../utils/stripe-demo';

interface CheckoutPageProps {
  tier: 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise';
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutPage({ tier, onBack, onSuccess }: CheckoutPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Get price details based on tier
  const getPriceId = () => {
    switch (tier) {
      case 'essential':
        return STRIPE_PRICE_IDS.essential_monthly;
      case 'professional':
        return STRIPE_PRICE_IDS.professional_monthly;
      case 'attorney':
        return STRIPE_PRICE_IDS.attorney_monthly;
      case 'enterprise':
        return STRIPE_PRICE_IDS.enterprise_monthly;
      default:
        return null;
    }
  };

  const planDetails = {
    free: { 
      name: 'Free', 
      price: 0, 
      description: 'Basic features',
      icon: Shield,
      color: 'from-gray-400 to-gray-600',
      features: ['3 document uploads', 'Basic AI analysis', 'Violation checker', 'Rights guide access']
    },
    essential: { 
      name: 'Essential', 
      price: 39, 
      description: 'Perfect for parents starting their defense',
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      features: ['25 document uploads', 'Advanced AI analysis', 'CourtListener access', 'State policy engine', 'Community forum', 'Email support']
    },
    professional: { 
      name: 'Professional', 
      price: 79, 
      description: 'Complete legal defense toolkit',
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      features: ['Unlimited uploads', 'Premium AI features', 'Document generator', 'Legal research hub', 'Priority support', 'All essential features']
    },
    attorney: { 
      name: 'Attorney Suite', 
      price: 299, 
      description: 'Professional tools for attorneys',
      icon: Scale,
      color: 'from-amber-400 to-amber-600',
      features: ['Everything in Professional', '500 AI credits/month', 'Multi-client management', 'Federal litigation tools', 'Section 1983 generator', 'Priority phone support']
    },
    enterprise: { 
      name: 'Enterprise', 
      price: 999, 
      description: 'For law firms & organizations',
      icon: Building2,
      color: 'from-rose-400 to-rose-600',
      features: ['Everything in Attorney', 'Unlimited team members', 'Custom branding', 'API access', 'Dedicated support', '24/7 priority support']
    },
  }[tier];

  const TierIcon = planDetails.icon;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get current user info from localStorage (or your auth system)
      const userId = localStorage.getItem('cps_user_id') || 'demo_user_' + Date.now();
      const userEmail = localStorage.getItem('cps_user_email') || 'demo@example.com';
      
      // Get price ID for this tier
      const stripePriceId = getPriceId();
      
      if (!stripePriceId) {
        throw new Error('Free plan does not require checkout');
      }

      // Try real backend first
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/server/make-server-a24eaa40/stripe/create-checkout`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            priceId: stripePriceId,
            userId,
            email: userEmail,
            successUrl: window.location.origin + '/success',
            cancelUrl: window.location.origin + '/pricing',
          }),
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          }
        }
      } catch (backendError) {
        console.log('Backend not available, using demo mode');
      }

      // Backend not available - use demo mode
      toast.info('Demo Mode Active', {
        description: 'Using simulated Stripe checkout. In production, this would connect to real Stripe.'
      });

      // Create demo checkout session
      const demoSession = await createDemoCheckoutSession({
        priceId: stripePriceId,
        userId,
        email: userEmail,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/pricing',
      });

      // Redirect to demo checkout
      window.location.href = demoSession.url;

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout process');
      toast.error('Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} disabled={isProcessing}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <CPSPunisherLogo size="small" showText={true} variant="image" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Plan Summary Card */}
          <Card className="p-8 border-2 border-purple-200">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                Subscribe to {planDetails.name}
              </h1>
              <p className="text-muted-foreground">{planDetails.description}</p>
            </div>

            {/* Plan Details */}
            <div className={`p-6 rounded-xl bg-gradient-to-r ${planDetails.color} text-white mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <TierIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{planDetails.name} Plan</div>
                    <div className="text-white/80">Monthly Subscription</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">${planDetails.price}</div>
                  <div className="text-white/80">/month</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">What's Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {planDetails.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-base text-gray-700 dark:text-gray-300">
                <span>{planDetails.name} Plan</span>
                <span>${planDetails.price}.00</span>
              </div>
              {tier === 'professional' && (
                <div className="flex justify-between text-base text-green-600">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    7-Day Free Trial
                  </span>
                  <span>-${planDetails.price}.00</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total Due Today</span>
                <span>${tier === 'professional' ? '0' : planDetails.price}.00</span>
              </div>
              {tier === 'professional' && (
                <p className="text-sm text-muted-foreground text-center">
                  Free for 7 days, then ${planDetails.price}/month. Cancel anytime.
                </p>
              )}
              {tier !== 'professional' && (
                <p className="text-sm text-muted-foreground text-center">
                  Billed monthly. Cancel anytime.
                </p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Continue to Secure Checkout
                </>
              )}
            </Button>

            {/* Security Badge */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                    30-Day Money-Back Guarantee
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Try risk-free. Cancel anytime within 30 days for a full refund. No questions asked.
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <Alert className="mt-4 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
              <Lock className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                <strong>Secure Payment:</strong> You'll be redirected to Stripe's secure checkout page. 
                All transactions are encrypted and PCI compliant. We never see or store your card details.
              </AlertDescription>
            </Alert>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}