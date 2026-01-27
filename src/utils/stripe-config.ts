/**
 * Stripe Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://dashboard.stripe.com/register
 * 2. Create account and verify email
 * 3. Get your API keys from: https://dashboard.stripe.com/test/apikeys
 * 4. Add to Supabase environment variables:
 *    - STRIPE_PUBLISHABLE_KEY (starts with pk_test_...)
 *    - STRIPE_SECRET_KEY (starts with sk_test_...)
 * 5. Create products in Stripe Dashboard
 * 6. Update PRICE_IDS below with your actual price IDs
 */

// Stripe Price IDs - LIVE PRODUCTION PRICES
export const STRIPE_PRICE_IDS = {
  essential_monthly: 'price_1SZChVLer5ye2GBih8C2Cn8U',
  essential_annual: 'price_1SZDqXLer5ye2GBi27cH4jsS',
  professional_monthly: 'price_1SZDlfLer5ye2GBidSCef53l',
  professional_annual: 'price_1SZDwnLer5ye2GBiqEl9SAba',
  attorney_monthly: 'price_1SZDnkLer5ye2GBisGCQtncE',
  attorney_annual: 'price_1SZDsSLer5ye2GBieHTotLLO',
  enterprise_monthly: 'price_1SZDpeLer5ye2GBi9gT16zyW',
  enterprise_annual: 'price_1SZDueLer5ye2GBiRifVwAeC',
};

// Subscription tier mapping
export type SubscriptionTier = 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise';

export interface SubscriptionLimits {
  documentsPerMonth: number;
  aiRequestsPerDay: number;
  aiAnalysis: boolean;
  defenseStrategies: boolean;
  motionTemplates: boolean;
  caseLawAccess: boolean;
  podcast: boolean;
  virtualBinder: boolean;
  communityForum: boolean;
  attorneyTools: boolean;
  multiClient: boolean;
  prioritySupport: boolean;
}

// Feature limits per tier
export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    documentsPerMonth: 1,
    aiRequestsPerDay: 0,
    aiAnalysis: false,
    defenseStrategies: false,
    motionTemplates: false,
    caseLawAccess: false,
    podcast: false,
    virtualBinder: false,
    communityForum: false,
    attorneyTools: false,
    multiClient: false,
    prioritySupport: false,
  },
  essential: {
    documentsPerMonth: 25,
    aiRequestsPerDay: 25,
    aiAnalysis: true,
    defenseStrategies: true,
    motionTemplates: true,
    caseLawAccess: false,
    podcast: false,
    virtualBinder: false,
    communityForum: true,
    attorneyTools: false,
    multiClient: false,
    prioritySupport: false,
  },
  professional: {
    documentsPerMonth: 999,
    aiRequestsPerDay: 100,
    aiAnalysis: true,
    defenseStrategies: true,
    motionTemplates: true,
    caseLawAccess: true,
    podcast: true,
    virtualBinder: true,
    communityForum: true,
    attorneyTools: false,
    multiClient: false,
    prioritySupport: true,
  },
  attorney: {
    documentsPerMonth: 9999,
    aiRequestsPerDay: 500,
    aiAnalysis: true,
    defenseStrategies: true,
    motionTemplates: true,
    caseLawAccess: true,
    podcast: true,
    virtualBinder: true,
    communityForum: true,
    attorneyTools: true,
    multiClient: true,
    prioritySupport: true,
  },
  enterprise: {
    documentsPerMonth: 99999,
    aiRequestsPerDay: 2000,
    aiAnalysis: true,
    defenseStrategies: true,
    motionTemplates: true,
    caseLawAccess: true,
    podcast: true,
    virtualBinder: true,
    communityForum: true,
    attorneyTools: true,
    multiClient: true,
    prioritySupport: true,
  },
};

// Plan details for display
export interface PlanDetails {
  name: string;
  price: number;
  priceId: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  tier: SubscriptionTier;
  description?: string;
}

export const PLANS: PlanDetails[] = [
  {
    name: 'Essential',
    price: 39,
    priceId: STRIPE_PRICE_IDS.essential_monthly,
    interval: 'month',
    tier: 'essential',
    description: 'Perfect for parents starting their defense',
    features: [
      '25 document uploads per month',
      'Basic AI document analysis',
      'Defense strategy suggestions',
      'Motion templates',
      'Timeline builder',
      'Violation checker',
      'Community forum access',
      'Email support',
    ],
  },
  {
    name: 'Essential Annual',
    price: 390,
    priceId: STRIPE_PRICE_IDS.essential_annual,
    interval: 'year',
    tier: 'essential',
    description: 'Save 17% with annual billing',
    features: [
      'Everything in Essential Monthly',
      'Save $78/year (17% off)',
      'Lock in rate for 12 months',
    ],
  },
  {
    name: 'Professional',
    price: 79,
    priceId: STRIPE_PRICE_IDS.professional_monthly,
    interval: 'month',
    tier: 'professional',
    popular: true,
    description: 'Most popular - Complete legal defense toolkit',
    features: [
      'UNLIMITED document uploads',
      'Advanced AI document analysis',
      'AI defense strategy generator',
      'Professional motion templates',
      'Case law research access',
      'Case podcast generator',
      'Virtual case binder export',
      'Community forum access',
      'Priority email support',
      '7-day free trial',
    ],
  },
  {
    name: 'Professional Annual',
    price: 790,
    priceId: STRIPE_PRICE_IDS.professional_annual,
    interval: 'year',
    tier: 'professional',
    description: 'Save 17% with annual billing',
    features: [
      'Everything in Professional Monthly',
      'Save $158/year (17% off)',
      'Lock in rate for 12 months',
    ],
  },
  {
    name: 'Attorney Suite',
    price: 299,
    priceId: STRIPE_PRICE_IDS.attorney_monthly,
    interval: 'month',
    tier: 'attorney',
    description: 'Professional tools for solo attorneys & legal aid',
    features: [
      'Everything in Professional, PLUS:',
      'Multi-client management (10 clients)',
      'CourtListener API (50M+ opinions)',
      'AI Paralegal (500 AI requests/day)',
      'Multi-state law research',
      'Professional violation reports',
      'Litigation tools & templates',
      'Federal §1983 tools',
      'White-label export options',
      'Priority phone support',
    ],
  },
  {
    name: 'Attorney Suite Annual',
    price: 2990,
    priceId: STRIPE_PRICE_IDS.attorney_annual,
    interval: 'year',
    tier: 'attorney',
    description: 'Save 17% with annual billing',
    features: [
      'Everything in Attorney Monthly',
      'Save $598/year (17% off)',
      'Lock in rate for 12 months',
    ],
  },
  {
    name: 'Enterprise',
    price: 999,
    priceId: STRIPE_PRICE_IDS.enterprise_monthly,
    interval: 'month',
    tier: 'enterprise',
    description: 'For law firms & legal aid organizations',
    features: [
      'Everything in Attorney Suite, PLUS:',
      'UNLIMITED client management',
      'Team collaboration (5 users)',
      'Unlimited AI requests (2000/day)',
      'Custom integrations',
      'Dedicated support',
      'Training & onboarding',
      'Custom branding',
      'API access',
      'White-label portal',
    ],
  },
  {
    name: 'Enterprise Annual',
    price: 9990,
    priceId: STRIPE_PRICE_IDS.enterprise_annual,
    interval: 'year',
    tier: 'enterprise',
    description: 'Save 17% with annual billing',
    features: [
      'Everything in Enterprise Monthly',
      'Save $1,998/year (17% off)',
      'Lock in rate for 12 months',
    ],
  },
];

// Usage tracking helpers
export function getUsageKey(userId: string, type: 'documents' | 'ai_requests'): string {
  const now = new Date();
  if (type === 'documents') {
    // Reset monthly on the 1st
    return `usage_${userId}_documents_${now.getFullYear()}_${now.getMonth() + 1}`;
  } else {
    // Reset daily
    return `usage_${userId}_ai_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
  }
}

// Check if user can perform action
export function canPerformAction(
  tier: SubscriptionTier,
  action: keyof SubscriptionLimits,
  currentUsage?: number
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier];
  
  // Boolean features
  if (typeof limits[action] === 'boolean') {
    const upgradeMap = {
      'free': 'Essential ($39/mo)',
      'essential': 'Professional ($79/mo)',
      'professional': 'Attorney Suite ($299/mo)',
      'attorney': 'Enterprise ($999/mo)',
      'enterprise': 'current plan'
    };
    
    return {
      allowed: limits[action] as boolean,
      reason: !limits[action] ? `This feature requires ${upgradeMap[tier]} plan` : undefined,
    };
  }
  
  // Usage-based features
  if (action === 'documentsPerMonth' || action === 'aiRequestsPerDay') {
    const limit = limits[action] as number;
    const usage = currentUsage || 0;
    
    if (usage >= limit) {
      const upgradeMap = {
        'free': 'Essential ($39/mo)',
        'essential': 'Professional ($79/mo)',
        'professional': 'Attorney Suite ($299/mo)',
        'attorney': 'Enterprise ($999/mo)',
        'enterprise': 'current plan'
      };
      
      return {
        allowed: false,
        reason: `You've reached your ${action === 'documentsPerMonth' ? 'monthly document' : 'daily AI request'} limit. Upgrade to ${upgradeMap[tier]} for higher limits.`,
      };
    }
    
    return { allowed: true };
  }
  
  return { allowed: true };
}

// Get user's current tier from subscription
export function getTierFromSubscription(subscriptionStatus: string | null, priceId: string | null): SubscriptionTier {
  if (!subscriptionStatus || subscriptionStatus !== 'active') {
    return 'free';
  }
  
  if (!priceId) {
    return 'free';
  }
  
  // Check which plan they're subscribed to
  if (priceId === STRIPE_PRICE_IDS.enterprise_monthly || priceId === STRIPE_PRICE_IDS.enterprise_annual) {
    return 'enterprise';
  }
  
  if (priceId === STRIPE_PRICE_IDS.attorney_monthly || priceId === STRIPE_PRICE_IDS.attorney_annual) {
    return 'attorney';
  }
  
  if (priceId === STRIPE_PRICE_IDS.professional_monthly || priceId === STRIPE_PRICE_IDS.professional_annual) {
    return 'professional';
  }
  
  if (priceId === STRIPE_PRICE_IDS.essential_monthly || priceId === STRIPE_PRICE_IDS.essential_annual) {
    return 'essential';
  }
  
  return 'free';
}