import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { CheckoutPage } from './CheckoutPage';
import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Shield, Star, Crown, Scale, Building2, Check, Lock, ChevronRight, Zap, Sparkles } from 'lucide-react';

interface TierSelectionProps {
  onSelectTier: (tier: 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise') => void;
  onSkip?: () => void;
}

export function TierSelection({ onSelectTier, onSkip }: TierSelectionProps) {
  const [selectedTier, setSelectedTier] = useState<'free' | 'essential' | 'professional' | 'attorney' | 'enterprise' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Check if user pre-selected a tier from landing page
  useEffect(() => {
    const preSelectedTier = localStorage.getItem('cps_selected_tier') as 'free' | 'essential' | 'professional' | null;
    if (preSelectedTier) {
      setSelectedTier(preSelectedTier);
      setShowConfirmation(true);
      toast.info(`You selected the ${preSelectedTier === 'free' ? 'Free' : preSelectedTier === 'essential' ? 'Essential' : 'Professional'} plan`);
      // Clear the selection so it doesn't persist
      localStorage.removeItem('cps_selected_tier');
    }
  }, []);

  const tiers = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Start your defense with essential tools',
      icon: Shield,
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
      popular: false,
      features: [
        '1 Active Case',
        '3 Document Uploads',
        '5 Violation Checks',
        'Basic Timeline (Text Only)',
        'Evidence Checklist',
        'Rights Guide Access',
        'Community Forum (Read-Only)',
        'Local Storage Only'
      ],
      limitations: [
        'No AI Analysis',
        'No Document Generation',
        'No PDF Export',
        'Limited Features'
      ]
    },
    {
      id: 'essential' as const,
      name: 'Essential',
      price: '$39',
      period: '/month',
      description: 'Perfect for parents building their defense',
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      popular: false,
      features: [
        '3 Active Cases',
        '25 Document Uploads',
        'Unlimited Violation Checks',
        'AI Document Analysis (25 credits)',
        'Timeline with Media Support',
        'PDF Export & Printing',
        'Communication Log',
        'Service Tracker',
        'Community Forum Access',
        'Email Support'
      ],
      highlights: [
        'AI Analysis Included',
        'Multi-Case Support',
        'Professional Export'
      ]
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Complete legal defense arsenal',
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50',
      popular: true,
      features: [
        'Unlimited Cases',
        'Unlimited Document Uploads',
        'Unlimited Violation Checks',
        'AI Document Analysis (100 credits)',
        'AI Document Generation',
        'Legal Brief Generator',
        'Visitation Log',
        'Virtual Case Binder',
        'Legal Research Hub',
        'Citation Network Analysis',
        'Encrypted Cloud Storage',
        'Priority Email Support'
      ],
      highlights: [
        'Most Popular Choice',
        'AI Brief Generation',
        'Research Tools'
      ]
    },
    {
      id: 'attorney' as const,
      name: 'Attorney Suite',
      price: '$299',
      period: '/month',
      description: 'Professional litigation tools for attorneys',
      icon: Scale,
      color: 'from-amber-400 to-amber-600',
      borderColor: 'border-amber-300',
      bgColor: 'bg-amber-50',
      popular: false,
      features: [
        'Everything in Professional',
        'Unlimited AI Credits (500/month)',
        'AI Legal Assistant',
        'AI Paralegal Suite',
        'Document Review & Analyzer',
        'Federal Civil Rights Generator',
        'Section 1983 Lawsuit Tools',
        'Notice of Liability Generator',
        'Federal Court Removal Tools',
        'Multi-Client Management',
        'White-Label Reports',
        'Attorney Dashboard',
        'Priority Phone Support'
      ],
      highlights: [
        'For Legal Professionals',
        'Federal Litigation Tools',
        'Multi-Client Ready'
      ]
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: '$999',
      period: '/month',
      description: 'For law firms and advocacy organizations',
      icon: Building2,
      color: 'from-rose-400 to-rose-600',
      borderColor: 'border-rose-300',
      bgColor: 'bg-rose-100',
      textColor: 'text-gray-900',
      popular: false,
      features: [
        'Everything in Attorney Suite',
        'Unlimited AI Credits (2000/month)',
        'Unlimited Team Members',
        'Custom Branding',
        'API Access',
        'Advanced Analytics',
        'Custom Integrations',
        'Dedicated Account Manager',
        'Custom Training',
        'SLA Guarantee',
        '24/7 Priority Support',
        'On-Site Implementation'
      ],
      highlights: [
        'For Organizations',
        'Team Collaboration',
        'Custom Solutions'
      ]
    }
  ];

  const handleSelectTier = (tierId: typeof tiers[number]['id']) => {
    setSelectedTier(tierId);
    if (tierId === 'free') {
      // Free tier - no payment needed
      onSelectTier(tierId);
    } else {
      // Paid tier - show confirmation
      setShowConfirmation(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (selectedTier && selectedTier !== 'free') {
      // Close confirmation dialog and show checkout page
      setShowConfirmation(false);
      setShowCheckout(true);
    }
  };

  const handleCheckoutSuccess = () => {
    if (selectedTier) {
      onSelectTier(selectedTier);
      setShowCheckout(false);
    }
  };

  const selectedTierData = tiers.find(t => t.id === selectedTier);

  // Show checkout page
  if (showCheckout && selectedTier && selectedTier !== 'free') {
    return (
      <CheckoutPage
        tier={selectedTier}
        onBack={() => setShowCheckout(false)}
        onSuccess={handleCheckoutSuccess}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Choose Your Plan</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Select Your Tier
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Choose the plan that best fits your needs. You can upgrade or downgrade anytime.
            </p>
            
            <p className="text-sm text-muted-foreground">
              All paid plans include a <strong>30-day money-back guarantee</strong>
            </p>

            {onSkip && (
              <Button 
                variant="ghost" 
                onClick={onSkip}
                className="mt-4 text-sm"
              >
                Skip for now - Start with Free
              </Button>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
            {tiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  tier.popular 
                    ? 'border-4 border-purple-500 shadow-xl scale-105' 
                    : `border-2 ${tier.borderColor}`
                } ${selectedTier === tier.id ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title & Price */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{tier.price}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{tier.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{tier.description}</p>
                  </div>

                  {/* Highlights (if any) */}
                  {tier.highlights && tier.highlights.length > 0 && (
                    <div className={`mb-4 p-3 rounded-lg ${tier.bgColor} border ${tier.borderColor}`}>
                      {tier.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-gray-100">
                          <Zap className="w-3 h-3 flex-shrink-0 text-gray-900 dark:text-gray-100" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectTier(tier.id)}
                    className={`w-full mb-4 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : tier.id === 'free'
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : ''
                    }`}
                    variant={tier.id === 'free' || tier.popular ? 'default' : 'outline'}
                  >
                    {tier.id === 'free' ? 'Start Free' : 'Select Plan'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Features List */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">What's Included:</div>
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                    
                    {/* Limitations (Free tier only) */}
                    {tier.limitations && tier.limitations.map((limitation, idx) => (
                      <div key={`limit-${idx}`} className="flex items-start gap-2 text-xs opacity-50">
                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-through text-gray-600 dark:text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table (Optional) */}
          <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <h3 className="text-lg font-bold mb-4 text-center">Not sure which plan is right for you?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Star className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold mb-1">Just Starting?</div>
                <div className="text-xs text-muted-foreground mb-2">Choose <strong>Essential</strong> for AI analysis and multi-case support</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Crown className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold mb-1">Serious Defense?</div>
                <div className="text-xs text-muted-foreground mb-2">Choose <strong>Professional</strong> for complete legal research tools</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Scale className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <div className="font-semibold mb-1">Legal Professional?</div>
                <div className="text-xs text-muted-foreground mb-2">Choose <strong>Attorney Suite</strong> for litigation tools</div>
              </div>
            </div>
          </Card>

          {/* Trust Badges */}
          <div className="mt-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Encrypted Data</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Cancel Anytime</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              All plans include 30-day money-back guarantee. No questions asked.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTierData && (
                <>
                  <selectedTierData.icon className="w-6 h-6" />
                  Confirm {selectedTierData.name} Plan
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              You're about to subscribe to the {selectedTierData?.name} plan
            </DialogDescription>
          </DialogHeader>

          {selectedTierData && (
            <div className="space-y-4">
              {/* Price Summary */}
              <Card className="p-4 bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedTierData.name} Plan</span>
                  <span className="text-xl font-bold">{selectedTierData.price}{selectedTierData.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedTierData.description}</p>
              </Card>

              {/* Key Features */}
              <div>
                <div className="text-sm font-semibold mb-2">Key Features:</div>
                <div className="space-y-1">
                  {selectedTierData.features.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                  {selectedTierData.features.length > 5 && (
                    <div className="text-xs text-muted-foreground italic">
                      + {selectedTierData.features.length - 5} more features...
                    </div>
                  )}
                </div>
              </div>

              {/* Guarantee */}
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-green-900 dark:text-green-100">30-Day Money-Back Guarantee</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Try risk-free. Cancel anytime within 30 days for a full refund.</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={handleConfirmPurchase}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to secure checkout
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}