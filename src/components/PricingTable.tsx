import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Crown, Zap, Scale, Building2, Sparkles, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PricingTableProps {
  onSelectPlan: (priceId: string, planName: string) => void;
  currentTier?: 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise';
  loading?: boolean;
}

export function PricingTable({ onSelectPlan, currentTier = 'free', loading = false }: PricingTableProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const plans = {
    monthly: [
      {
        name: 'Free',
        price: 0,
        priceId: null,
        tier: 'free',
        description: 'Try basic features',
        features: [
          '1 document upload per month',
          'Basic violation checker',
          'Timeline builder',
          'Rights guide',
          'Evidence checklist',
        ],
        notIncluded: [
          'No AI analysis',
          'No defense strategies',
          'No motion templates',
        ],
        icon: Zap,
        color: 'text-gray-600',
      },
      {
        name: 'Essential',
        price: 39,
        priceId: 'price_1SZChVLer5ye2GBih8C2Cn8U',
        tier: 'essential',
        description: 'Perfect for parents starting their defense',
        features: [
          '25 document uploads/month',
          'Basic AI document analysis',
          'Defense strategy suggestions',
          'Motion templates',
          'Timeline builder',
          'Violation checker',
          'Community forum access',
          'Email support',
        ],
        icon: Sparkles,
        color: 'text-blue-600',
      },
      {
        name: 'Professional',
        price: 79,
        priceId: 'price_1SZDlfLer5ye2GBidSCef53l',
        tier: 'professional',
        description: 'Complete legal defense toolkit',
        features: [
          'UNLIMITED documents',
          'Advanced AI analysis',
          'AI defense strategy generator',
          'Professional motion templates',
          'Case law research access',
          'Case podcast generator',
          'Virtual case binder export',
          'Priority email support',
          '7-day free trial',
        ],
        badge: 'Most Popular',
        icon: Crown,
        color: 'text-amber-600',
        popular: true,
        trial: '7-day free trial',
      },
      {
        name: 'Attorney Suite',
        price: 299,
        priceId: 'price_1SZDnkLer5ye2GBisGCQtncE',
        tier: 'attorney',
        description: 'Professional tools for attorneys',
        features: [
          'Everything in Professional +',
          'Multi-client management (10)',
          'CourtListener (50M+ opinions)',
          'AI Paralegal (500 requests/day)',
          'Multi-state law research',
          'Professional reports',
          'Litigation tools',
          'Priority phone support',
        ],
        icon: Scale,
        color: 'text-purple-600',
      },
      {
        name: 'Enterprise',
        price: 999,
        priceId: 'price_1SZDpeLer5ye2GBi9gT16zyW',
        tier: 'enterprise',
        description: 'For law firms & legal aid',
        features: [
          'Everything in Attorney +',
          'UNLIMITED clients',
          'Team collaboration (5 users)',
          'Unlimited AI (2000/day)',
          'Custom integrations',
          'Dedicated support',
          'Training & onboarding',
          'Custom branding',
        ],
        icon: Building2,
        color: 'text-indigo-600',
      },
    ],
    annual: [
      {
        name: 'Essential Annual',
        price: 390,
        monthlyPrice: 32.50,
        priceId: 'price_1SZDqXLer5ye2GBi27cH4jsS',
        tier: 'essential',
        description: 'Save 17% with annual billing',
        features: [
          'Everything in Essential',
          'Save $78/year (17% off)',
          'Lock in rate for 12 months',
        ],
        icon: Sparkles,
        color: 'text-blue-600',
      },
      {
        name: 'Professional Annual',
        price: 790,
        monthlyPrice: 65.83,
        priceId: 'price_1SZDwnLer5ye2GBiqEl9SAba',
        tier: 'professional',
        description: 'Save 17% with annual billing',
        features: [
          'Everything in Professional',
          'Save $158/year (17% off)',
          'Lock in rate for 12 months',
        ],
        badge: 'Best Value',
        icon: Crown,
        color: 'text-amber-600',
        popular: true,
      },
      {
        name: 'Attorney Annual',
        price: 2990,
        monthlyPrice: 249.17,
        priceId: 'price_1SZDsSLer5ye2GBieHTotLLO',
        tier: 'attorney',
        description: 'Save 17% with annual billing',
        features: [
          'Everything in Attorney Suite',
          'Save $598/year (17% off)',
          'Lock in rate for 12 months',
        ],
        icon: Scale,
        color: 'text-purple-600',
      },
      {
        name: 'Enterprise Annual',
        price: 9990,
        monthlyPrice: 832.50,
        priceId: 'price_1SZDueLer5ye2GBiRifVwAeC',
        tier: 'enterprise',
        description: 'Save 17% with annual billing',
        features: [
          'Everything in Enterprise',
          'Save $1,998/year (17% off)',
          'Lock in rate for 12 months',
        ],
        icon: Building2,
        color: 'text-indigo-600',
      },
    ],
  };

  const activePlans = billingInterval === 'monthly' ? plans.monthly : plans.annual;

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get the tools you need to fight for your children
          </p>

          {/* Billing Toggle */}
          <Tabs defaultValue="monthly" className="w-full max-w-md mx-auto" onValueChange={(value) => setBillingInterval(value as 'monthly' | 'annual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">
                Annual
                <Badge variant="secondary" className="ml-2">Save 17%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {activePlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentTier === plan.tier;
            
            return (
              <Card 
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-lg scale-105' 
                    : ''
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    {plan.badge}
                  </Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-6 h-6 ${plan.color}`} />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl">${plan.price}</span>
                      <span className="text-muted-foreground">
                        /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {plan.monthlyPrice && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${plan.monthlyPrice.toFixed(2)}/month billed annually
                      </p>
                    )}
                    {plan.trial && billingInterval === 'monthly' && (
                      <Badge variant="secondary" className="mt-2">
                        {plan.trial}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <X className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.priceId ? (
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => onSelectPlan(plan.priceId!, plan.name)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Choose ${plan.name}`}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Free</th>
                  <th className="text-center p-4">Essential</th>
                  <th className="text-center p-4 bg-primary/5">Professional</th>
                  <th className="text-center p-4">Attorney</th>
                  <th className="text-center p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Document Uploads</td>
                  <td className="text-center p-4">1/mo</td>
                  <td className="text-center p-4">25/mo</td>
                  <td className="text-center p-4 bg-primary/5">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">AI Analysis</td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">AI Requests/Day</td>
                  <td className="text-center p-4">0</td>
                  <td className="text-center p-4">25</td>
                  <td className="text-center p-4 bg-primary/5">100</td>
                  <td className="text-center p-4">500</td>
                  <td className="text-center p-4">2,000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Case Law Access</td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Multi-Client</td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4 bg-primary/5"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4">10 clients</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Support</td>
                  <td className="text-center p-4">Email</td>
                  <td className="text-center p-4">Email</td>
                  <td className="text-center p-4 bg-primary/5">Priority Email</td>
                  <td className="text-center p-4">Phone</td>
                  <td className="text-center p-4">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-primary/5">
            <CardHeader>
              <CardTitle>Why Parents Choose Our Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="mb-2">Save Thousands</h3>
                  <p className="text-sm text-muted-foreground">
                    Attorney fees: $5K-15K<br/>
                    Our tools: $79/month
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🤖</div>
                  <h3 className="mb-2">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant violation detection<br/>
                    Professional defense strategies
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">⚖️</div>
                  <h3 className="mb-2">Court-Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional motions<br/>
                    50M+ case law opinions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades at the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, MasterCard, American Express, Discover) processed securely through Stripe.
              </p>
            </div>
            <div>
              <h3 className="mb-2">Is there a money-back guarantee?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Professional plan includes a 7-day free trial. If you're not satisfied, cancel within the trial period for a full refund.
              </p>
            </div>
            <div>
              <h3 className="mb-2">Do I need a lawyer to use this?</h3>
              <p className="text-sm text-muted-foreground">
                Our tools are designed to help you build your case and work with your attorney. We always recommend consulting with a qualified attorney for legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
