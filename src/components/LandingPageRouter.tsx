import React, { useState } from 'react';
import { LandingPage } from './LandingPage';
import { AttorneyLandingPage } from './AttorneyLandingPage';
import { EnhancedHeroSection } from './EnhancedHeroSection';
import { Button } from './ui/button';
import { Users, Briefcase, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { FooterDisclaimer } from './LegalDisclaimer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from 'figma:asset/da7dee53b50fcb425e1a14bf57136ede67a0ca5a.png';
// import { StickyDisclaimerBanner } from './StickyDisclaimerBanner'; // REMOVED

interface LandingPageRouterProps {
  onGetStarted: (userType: 'parent' | 'attorney') => void;
}

export function LandingPageRouter({ onGetStarted }: LandingPageRouterProps) {
  const [selectedAudience, setSelectedAudience] = useState<'parent' | 'attorney' | null>(null);

  // Show enhanced hero section first
  if (selectedAudience === null) {
    return (
      <EnhancedHeroSection 
        onSelectParent={() => setSelectedAudience('parent')}
        onSelectAttorney={() => setSelectedAudience('attorney')}
      />
    );
  }

  // Show appropriate landing page based on selection
  if (selectedAudience === 'attorney') {
    return <AttorneyLandingPage onGetStarted={() => onGetStarted('attorney')} />;
  }

  return <LandingPage onGetStarted={() => onGetStarted('parent')} />;
}