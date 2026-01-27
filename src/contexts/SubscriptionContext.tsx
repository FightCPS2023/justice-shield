import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  hasSpecialAccess: boolean;
  checkAccessCode: (code: string) => boolean;
  removeSpecialAccess: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Special access code (you can change this to whatever you want)
const SPECIAL_ACCESS_CODE = 'CPSPUNISHER2024';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>('free');
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);

  // Wrapper for setTier that also persists to localStorage
  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    localStorage.setItem('cps_user_tier', newTier);
  };

  // Check for special access and saved tier on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem('cps_special_access');
    if (storedAccess === 'granted') {
      setHasSpecialAccess(true);
    }
    
    // Load user's selected tier
    const storedTier = localStorage.getItem('cps_user_tier') as SubscriptionTier;
    if (storedTier && ['free', 'essential', 'professional', 'attorney', 'enterprise'].includes(storedTier)) {
      setTierState(storedTier);
    }
  }, []);

  const checkAccessCode = (code: string): boolean => {
    if (code === SPECIAL_ACCESS_CODE) {
      setHasSpecialAccess(true);
      localStorage.setItem('cps_special_access', 'granted');
      return true;
    }
    return false;
  };

  const removeSpecialAccess = () => {
    setHasSpecialAccess(false);
    localStorage.removeItem('cps_special_access');
  };

  const checkFeatureAccess = (feature: string): boolean => {
    // Special access code grants everything
    if (hasSpecialAccess) return true;

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
    };

    return featureMap[feature]?.includes(tier) ?? false;
  };

  const getDocumentLimit = (): number | 'unlimited' => {
    if (hasSpecialAccess) return 'unlimited';
    
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
    if (hasSpecialAccess) return 'unlimited';
    if (tier === 'free') return 5;
    return 'unlimited';
  };

  const canSeeFullViolationDetails = (): boolean => {
    if (hasSpecialAccess) return true;
    return tier !== 'free';
  };

  const getAICreditsLimit = (): number => {
    if (hasSpecialAccess) return 2000;
    
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
        isEnterprise: hasSpecialAccess || tier === 'enterprise',
        isAttorney: hasSpecialAccess || tier === 'attorney' || tier === 'enterprise',
        isProfessional: hasSpecialAccess || tier === 'professional' || tier === 'attorney' || tier === 'enterprise',
        isEssential: hasSpecialAccess || tier === 'essential' || tier === 'professional' || tier === 'attorney' || tier === 'enterprise',
        isFree: !hasSpecialAccess && tier === 'free',
        checkFeatureAccess,
        getDocumentLimit,
        getViolationLimit,
        canSeeFullViolationDetails,
        getAICreditsLimit,
        hasSpecialAccess,
        checkAccessCode,
        removeSpecialAccess,
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