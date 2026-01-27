import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type SubscriptionTier = 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  isEnterprise: boolean;
  isAttorney: boolean;
  isProfessional: boolean;
  isEssential: boolean;
  isFree: boolean;
  checkFeatureAccess: (feature: string) => boolean;
  getDocumentLimit: () => number | 'unlimited';
  getViolationLimit: () => number | 'unlimited';
  canSeeFullViolationDetails: () => boolean;
  getAICreditsLimit: () => number;
  refreshSubscription: () => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string; // Optional: pass userId to auto-fetch subscription
}

export function SubscriptionProvider({ children, userId }: SubscriptionProviderProps) {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);

  // Fetch subscription from Stripe on mount
  useEffect(() => {
    if (userId) {
      fetchSubscriptionStatus(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchSubscriptionStatus = async (userId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/subscription-status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Map Stripe tier to our tier
        const stripeTier = data.tier || 'free';
        setTier(stripeTier as SubscriptionTier);
      } else {
        // If error, default to free
        console.warn('Could not fetch subscription status, defaulting to free tier');
        setTier('free');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setTier('free'); // Fallback to free on error
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    if (userId) {
      await fetchSubscriptionStatus(userId);
    }
  };

  const checkFeatureAccess = (feature: string): boolean => {
    const featureMap: Record<string, SubscriptionTier[]> = {
      'community_forum': ['essential', 'professional', 'attorney', 'enterprise'],
      'virtual_case_binder': ['professional', 'attorney', 'enterprise'],
      'full_reports': ['professional', 'attorney', 'enterprise'],
      'ai_paralegal': ['attorney', 'enterprise'],
      'multi_client': ['attorney', 'enterprise'],
      'multi_state_law': ['attorney', 'enterprise'],
      'enhanced_ai': ['professional', 'attorney', 'enterprise'],
      'case_law_access': ['professional', 'attorney', 'enterprise'],
      'podcast': ['professional', 'attorney', 'enterprise'],
      'basic_ai': ['essential', 'professional', 'attorney', 'enterprise'],
      'federal_civil_rights': ['professional', 'attorney', 'enterprise'],
      'document_generator_pro': ['professional', 'attorney', 'enterprise'],
      'case_podcast': ['professional', 'attorney', 'enterprise'],
      'ai_legal_assistant': ['attorney', 'enterprise'],
      'courtlistener_access': ['attorney', 'enterprise'],
      'bulk_data_export': ['attorney', 'enterprise'],
      'advanced_analytics': ['attorney', 'enterprise'],
      'team_collaboration': ['enterprise'],
      'custom_branding': ['enterprise'],
      'api_access': ['enterprise'],
    };

    return featureMap[feature]?.includes(tier) ?? false;
  };

  const getDocumentLimit = (): number | 'unlimited' => {
    switch (tier) {
      case 'free':
        return 1;
      case 'essential':
        return 25;
      default:
        return 'unlimited';
    }
  };

  const getViolationLimit = (): number | 'unlimited' => {
    if (tier === 'free') return 5;
    return 'unlimited';
  };

  const canSeeFullViolationDetails = (): boolean => {
    return tier !== 'free';
  };

  const getAICreditsLimit = (): number => {
    switch (tier) {
      case 'free':
        return 0;
      case 'essential':
        return 25;
      case 'professional':
        return 100;
      case 'attorney':
        return 500;
      case 'enterprise':
        return 2000;
      default:
        return 0;
    }
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        tier, 
        setTier,
        isEnterprise: tier === 'enterprise',
        isAttorney: tier === 'attorney' || tier === 'enterprise',
        isProfessional: tier === 'professional' || tier === 'attorney' || tier === 'enterprise',
        isEssential: tier === 'essential' || tier === 'professional' || tier === 'attorney' || tier === 'enterprise',
        isFree: tier === 'free',
        checkFeatureAccess,
        getDocumentLimit,
        getViolationLimit,
        canSeeFullViolationDetails,
        getAICreditsLimit,
        refreshSubscription,
        loading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
