import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Crown, Check, X, Lock, Shield, FileText, Brain, 
  Calendar, FileCheck, Database, FolderOpen, Mic, 
  Bell, Zap, ArrowRight, Sparkles, Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface PremiumUpgradeProps {
  isOpen?: boolean;
  onClose?: () => void;
  feature?: string; // Which feature triggered the upgrade prompt
  // New props for wrapper usage
  children?: React.ReactNode;
  featureName?: string;
  featureDescription?: string;
  requiredTier?: 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise';
}

export function PremiumUpgrade({ 
  isOpen = false, 
  onClose, 
  feature,
  children,
  featureName,
  featureDescription,
  requiredTier = 'professional'
}: PremiumUpgradeProps) {
  const { tier, hasSpecialAccess } = useSubscription();
  const [showModal, setShowModal] = useState(isOpen);
  const [selectedTier, setSelectedTier] = useState<'essential' | 'professional' | 'attorney'>('professional');

  // If used as a wrapper, check access
  if (children) {
    // Tier hierarchy check
    const tierHierarchy = ['free', 'essential', 'professional', 'attorney', 'enterprise'];
    const userTierLevel = tierHierarchy.indexOf(tier);
    const requiredTierLevel = tierHierarchy.indexOf(requiredTier);
    
    // Special access grants everything
    if (hasSpecialAccess || userTierLevel >= requiredTierLevel) {
      return <>{children}</>;
    }

    // User doesn't have access - show upgrade prompt
    return (
      <Card className="p-8 text-center border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">{featureName || 'Premium Feature'}</h3>
            <p className="text-amber-800 text-base leading-relaxed mb-4">
              {featureDescription || 'This feature requires a higher subscription tier to access.'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-amber-300">
            <Lock className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              Requires: <span className="font-bold capitalize">{requiredTier}</span> Tier or Higher
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              onClick={() => setShowModal(true)}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to {requiredTier === 'essential' ? 'Essential' : requiredTier === 'professional' ? 'Professional' : requiredTier === 'attorney' ? 'Attorney' : 'Enterprise'}
            </Button>
            <Button variant="outline">
              View Pricing
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">Current Tier: <span className="font-bold capitalize">{tier}</span></p>
                {tier === 'free' && (
                  <p className="text-xs text-blue-700 mt-1">
                    Upgrade to unlock 320+ premium features including unlimited AI analysis, document generation, and legal research tools.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Handle upgrade action (when used as upgrade modal)
  const handleUpgrade = (newTier: 'essential' | 'professional' | 'attorney') => {
    // In production, this would open Stripe checkout
    console.log(`Upgrade to ${newTier} tier`);
    if (onClose) onClose();
    setShowModal(false);
  };

  const premiumFeatures = [
    {
      icon: FileText,
      title: 'Advanced Document Generator',
      description: 'AI auto-fills custom affidavits, FOIA requests, motion templates, CPS violation notices, and court filings with your case details',
      free: '5 basic templates',
      premium: 'Unlimited auto-filled documents',
      highlight: true
    },
    {
      icon: Brain,
      title: 'Unlimited AI Analysis',
      description: 'Upload court orders, case plans, emails, safety plans - AI finds violations, due process issues, conflicts of interest, fraud indicators, illegal entries',
      free: '3 document uploads',
      premium: 'Unlimited uploads & deep AI analysis',
      highlight: true
    },
    {
      icon: Calendar,
      title: 'Unlimited Timeline Generator',
      description: 'Add photos, audio, video, child statements with automatic date detection, PDF export, attorney-ready formatting',
      free: '1 timeline, text export only',
      premium: 'Unlimited timelines with media & PDF export',
      highlight: false
    },
    {
      icon: FileCheck,
      title: 'Full Violation Report + Case Summary',
      description: 'AI generates professional brief with all violations, statutes, case law, constitutional issues, missing evidence, and next steps',
      free: '2 violations, summary only',
      premium: 'Complete violation analysis with legal brief',
      highlight: true
    },
    {
      icon: Database,
      title: 'Secure Encrypted Storage',
      description: 'Military-grade encryption for all documents, evidence, photos, audio, and CPS reports',
      free: 'Local storage only',
      premium: 'Encrypted cloud storage',
      highlight: false
    },
    {
      icon: FolderOpen,
      title: 'Virtual Case Binder',
      description: 'Professional case organization with sections for everything, drag-and-drop filing, auto-classified uploads',
      free: 'Basic document list',
      premium: 'Full case management system',
      highlight: false
    },
    {
      icon: Mic,
      title: 'Unlimited Podcast Conversions',
      description: 'Multiple expert voices, remove identifying info for privacy, create case update series',
      free: '1 podcast/month',
      premium: 'Unlimited podcasts with privacy controls',
      highlight: true
    },
    {
      icon: Bell,
      title: 'Real-Time Notifications',
      description: 'Proactive alerts when violations detected, illegal safety plans identified, or critical actions needed',
      free: 'None',
      premium: 'Smart notifications & action alerts',
      highlight: false
    },
    {
      icon: Zap,
      title: 'Priority AI Support',
      description: 'Unlimited daily AI legal Q&A instead of 3 questions/day',
      free: '3 questions/day',
      premium: 'Unlimited AI legal assistance',
      highlight: false
    }
  ];

  const comparisonFeatures = [
    { feature: 'Document Uploads', free: '3 uploads', premium: 'Unlimited' },
    { feature: 'Document Generation', free: '5 basic templates', premium: 'Unlimited auto-filled' },
    { feature: 'AI Analysis', free: 'Basic', premium: 'Deep analysis + fraud detection' },
    { feature: 'Violation Analysis', free: '2 violations (summary)', premium: 'Unlimited (full case law)' },
    { feature: 'Timeline', free: '1 timeline, text export', premium: 'Unlimited + media + PDF' },
    { feature: 'Podcast', free: '1/month', premium: 'Unlimited + privacy controls' },
    { feature: 'Evidence Storage', free: '5 entries, 1 photo, 1 audio', premium: 'Unlimited encrypted storage' },
    { feature: 'AI Questions', free: '3/day', premium: 'Unlimited' },
    { feature: 'Case Binder', free: 'Basic list', premium: 'Professional organization' },
    { feature: 'Notifications', free: 'None', premium: 'Real-time alerts' },
    { feature: 'Legal Brief', free: 'None', premium: 'AI-generated professional brief' },
    { feature: 'State-Specific', free: 'Generic guidance', premium: 'Customized for your state' }
  ];

  if (tier === 'premium') {
    return (
      <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <Crown className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Premium Member</AlertTitle>
        <AlertDescription className="text-amber-800">
          You have full access to all premium features. Thank you for supporting CPS Case Defense Analyzer!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open && onClose) onClose();
      }}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-8 w-[95vw] sm:w-full">
          <DialogHeader className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">Upgrade to Premium</DialogTitle>
                <DialogDescription className="text-sm sm:text-base leading-relaxed">
                  {feature ? (
                    <span className="text-amber-700 dark:text-amber-400">
                      <strong className="text-amber-600">{feature}</strong> is a premium feature. 
                      Unlock this and all other premium features for just $19.99/month.
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base">
                      Transform your CPS defense with unlimited AI analysis, professional document generation, 
                      and a complete legal powerhouse toolkit.
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Highlighted Benefits */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {premiumFeatures.filter(f => f.highlight).map((item, idx) => (
                <Card key={idx} className="p-3 sm:p-4 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 text-amber-900 flex items-center gap-2 text-sm sm:text-base font-medium">
                        <span className="truncate">{item.title}</span>
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs sm:text-sm text-amber-800 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
                        <Badge variant="outline" className="bg-white text-xs">Free: {item.free}</Badge>
                        <ArrowRight className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <Badge className="bg-amber-600 text-xs">Premium: {item.premium}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* All Features */}
            <div>
              <div className="mb-2 sm:mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="text-sm sm:text-base font-medium">Complete Premium Feature Set</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {premiumFeatures.map((item, idx) => (
                  <Card key={idx} className="p-2 sm:p-3">
                    <div className="flex items-start gap-2">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm mb-1 font-medium leading-tight">{item.title}</div>
                        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Comparison Table - Mobile Optimized */}
            <div>
              <div className="mb-2 sm:mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base font-medium">Free vs Premium Comparison</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2 sm:p-3 whitespace-nowrap">Feature</th>
                        <th className="text-center p-2 sm:p-3 whitespace-nowrap">Free</th>
                        <th className="text-center p-2 sm:p-3 bg-amber-50 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                            <span className="hidden sm:inline">Premium</span>
                            <span className="sm:hidden">Pro</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 sm:p-3 text-xs sm:text-sm">{item.feature}</td>
                          <td className="p-2 sm:p-3 text-center text-muted-foreground text-xs sm:text-sm">{item.free}</td>
                          <td className="p-2 sm:p-3 text-center bg-amber-50">
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                              <span className="text-amber-900 text-xs sm:text-sm">{item.premium}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
              <div className="text-center space-y-3 sm:space-y-4">{" "}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">Just $19.99/month</h3>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
                    Less than $1 per day to protect your family and fight for your children
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-amber-600 hover:bg-amber-50"
                    onClick={() => handleUpgrade('premium')}
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/20"
                    onClick={() => {
                      setShowModal(false);
                      if (onClose) onClose();
                    }}
                  >
                    Maybe Later
                  </Button>
                </div>
                <p className="text-xs text-amber-100">
                  🔒 Secure payment processing • Cancel anytime • 30-day money-back guarantee
                </p>
              </div>
            </Card>

            {/* Trust Signals */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ⭐⭐⭐⭐⭐ Trusted by thousands of parents fighting CPS
              </p>
              <p className="text-xs text-muted-foreground">
                "This app helped me identify 12 violations and reunify with my kids in 4 months" - Sarah M., Texas
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline Upgrade Card (when not in modal) */}
      {!isOpen && !showModal && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-600" />
                <span className="text-xl text-amber-900">Unlock Premium Features</span>
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                  $19.99/month
                </Badge>
              </div>
              <p className="text-sm text-amber-800 mb-4">
                Get unlimited AI analysis, professional document generation, encrypted storage, 
                and complete legal powerhouse toolkit. Fight CPS with every weapon available.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <div className="font-medium">Unlimited AI Analysis</div>
                    <div className="text-xs text-amber-700">Find every violation</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <div className="font-medium">Auto-Filled Documents</div>
                    <div className="text-xs text-amber-700">Court-ready in minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <div className="font-medium">Professional Brief</div>
                    <div className="text-xs text-amber-700">Attorney-ready case summary</div>
                  </div>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                onClick={() => setShowModal(true)}
              >
                <Crown className="w-5 h-5 mr-2" />
                View All Premium Features
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

// Premium Feature Badge Component
export function PremiumBadge({ feature }: { feature?: string }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { tier } = useSubscription();

  if (tier === 'premium') return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700"
        onClick={() => setShowUpgrade(true)}
      >
        <Lock className="w-3 h-3" />
        <span className="text-xs">Premium</span>
      </Button>
      <PremiumUpgrade 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        feature={feature}
      />
    </>
  );
}

// Premium Lock Component (for locked features)
export function PremiumLock({ feature, description }: { feature: string; description?: string }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-xl mb-2 text-amber-900">{feature}</div>
            {description && (
              <p className="text-sm text-amber-700 mb-4">{description}</p>
            )}
          </div>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
            onClick={() => setShowUpgrade(true)}
          >
            <Crown className="w-5 h-5 mr-2" />
            Unlock Premium - $19.99/month
          </Button>
          <p className="text-xs text-muted-foreground">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </Card>
      <PremiumUpgrade 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        feature={feature}
      />
    </>
  );
}