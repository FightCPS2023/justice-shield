/**
 * Stripe Client Utilities
 * Handles Stripe Checkout session creation and payment flow
 */

import { projectId } from './supabase/info';

export interface StripeCheckoutParams {
  tier: 'essential' | 'professional' | 'attorney' | 'enterprise';
  userId: string;
}

/**
 * Creates a Stripe Checkout session and redirects user to payment page
 */
export async function createStripeCheckout({ tier, userId }: StripeCheckoutParams): Promise<void> {
  try {
    console.log('Creating Stripe checkout session...', { tier, userId });

    // Call your Supabase edge function to create checkout session
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier, userId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url, sessionId } = await response.json();

    console.log('Checkout session created:', { sessionId, url });

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

/**
 * Pricing information for each tier
 */
export const STRIPE_PRICES = {
  essential: {
    monthly: 39,
    annual: 390, // 17% savings
  },
  professional: {
    monthly: 79,
    annual: 790, // 17% savings
  },
  attorney: {
    monthly: 299,
    annual: 2990, // 17% savings
  },
  enterprise: {
    monthly: 999,
    annual: 9990, // 17% savings
  },
};

/**
 * Feature limits for each tier
 */
export const TIER_LIMITS = {
  free: {
    documents: 1,
    violations: 5,
    aiCredits: 0,
    cases: 1,
  },
  essential: {
    documents: 25,
    violations: 'unlimited' as const,
    aiCredits: 25,
    cases: 1,
  },
  professional: {
    documents: 'unlimited' as const,
    violations: 'unlimited' as const,
    aiCredits: 100,
    cases: 1,
  },
  attorney: {
    documents: 'unlimited' as const,
    violations: 'unlimited' as const,
    aiCredits: 500,
    cases: 'unlimited' as const,
  },
  enterprise: {
    documents: 'unlimited' as const,
    violations: 'unlimited' as const,
    aiCredits: 2000,
    cases: 'unlimited' as const,
  },
};

/**
 * Get readable tier name
 */
export function getTierDisplayName(tier: string): string {
  const names: Record<string, string> = {
    free: 'Free',
    essential: 'Essential',
    professional: 'Professional',
    attorney: 'Attorney',
    enterprise: 'Enterprise',
  };
  return names[tier] || tier;
}

/**
 * Check if user can upgrade from current tier to target tier
 */
export function canUpgrade(currentTier: string, targetTier: string): boolean {
  const hierarchy = ['free', 'essential', 'professional', 'attorney', 'enterprise'];
  const currentIndex = hierarchy.indexOf(currentTier);
  const targetIndex = hierarchy.indexOf(targetTier);
  return targetIndex > currentIndex;
}

/**
 * Calculate savings for annual billing
 */
export function calculateAnnualSavings(tier: keyof typeof STRIPE_PRICES): number {
  const monthly = STRIPE_PRICES[tier].monthly;
  const annual = STRIPE_PRICES[tier].annual;
  const monthlyEquivalent = monthly * 12;
  return monthlyEquivalent - annual;
}