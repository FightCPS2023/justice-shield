// CPS Case Defense Analyzer - Simplified Menu-Based Navigation
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner@2.0.3";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthForm } from "./components/AuthForm";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { AccessibilityProvider, SkipToContent } from "./components/AccessibilityProvider";
import { StickyDisclaimerBanner } from "./components/StickyDisclaimerBanner";
import { LegalDisclaimerPages as LegalDisclaimer } from "./components/LegalDisclaimerPages";
import { LandingPage } from "./components/LandingPage";
import { MainMenu } from "./components/MainMenu";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { TimelinePage } from "./pages/TimelinePage";
import { ViolationsPage } from "./pages/ViolationsPage";
import { StrategyPage } from "./pages/StrategyPage";
import { RightsGuidePage } from "./pages/RightsGuidePage";
import { EvidencePage } from "./pages/EvidencePage";
import { FederalPage } from "./pages/FederalPage";
import { CommunityPage } from "./pages/CommunityPage";
import { DirectoryPage } from "./pages/DirectoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TierSelection } from "./components/TierSelection";
import { Loader2 } from "lucide-react";

// DEV MODE: Set to true to bypass authentication while building
const DEV_MODE = false;

interface Document {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface Violation {
  id: string;
  type: string;
  description: string;
  date: string;
  severity: string;
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
}

export default function App() {
  // Landing page state
  const [showLandingPage, setShowLandingPage] = useState(() => {
    const hasSeenLanding = localStorage.getItem("cpsHasSeenLanding");
    return !hasSeenLanding;
  });

  // Authentication state
  const [auth, setAuth] = useState<AuthState>(() => {
    if (DEV_MODE) {
      return {
        accessToken: "dev_token",
        userId: "dev_user_123",
        email: "dev@example.com",
      };
    }
    return { accessToken: null, userId: null, email: null };
  });

  // Current page state
  const [currentPage, setCurrentPage] = useState<string>("menu");

  // Subscription tier
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    return localStorage.getItem("cps_user_tier") || "free";
  });

  // Case data
  const [caseId] = useState("case_" + Date.now());
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDocuments = localStorage.getItem(`cps_documents_${caseId}`);
        const savedEvents = localStorage.getItem(`cps_timeline_${caseId}`);
        const savedViolations = localStorage.getItem(`cps_violations_${caseId}`);
        const savedStrategies = localStorage.getItem(`cps_strategies_${caseId}`);

        if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
        if (savedEvents) setTimelineEvents(JSON.parse(savedEvents));
        if (savedViolations) setViolations(JSON.parse(savedViolations));
        if (savedStrategies) setStrategies(JSON.parse(savedStrategies));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [caseId]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`cps_documents_${caseId}`, JSON.stringify(documents));
    }
  }, [documents, caseId, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`cps_timeline_${caseId}`, JSON.stringify(timelineEvents));
    }
  }, [timelineEvents, caseId, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`cps_violations_${caseId}`, JSON.stringify(violations));
    }
  }, [violations, caseId, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`cps_strategies_${caseId}`, JSON.stringify(strategies));
    }
  }, [strategies, caseId, isLoading]);

  // Navigation handler
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleBackToMenu = () => {
    setCurrentPage("menu");
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setAuth({ accessToken: null, userId: null, email: null });
    setCurrentPage("menu");
    localStorage.removeItem("cps_auth_token");
    toast.success("Logged out successfully");
  };

  const handleLandingPageComplete = () => {
    localStorage.setItem("cpsHasSeenLanding", "true");
    setShowLandingPage(false);
  };

  // Show landing page
  if (showLandingPage) {
    return (
      <LandingPage
        onGetStarted={handleLandingPageComplete}
        onSignIn={handleLandingPageComplete}
      />
    );
  }

  // Show authentication screen if not authenticated
  if (!auth.accessToken) {
    return (
      <SubscriptionProvider>
        <AuthForm
          onAuth={(userId, accessToken, tier) => {
            setAuth({ 
              userId, 
              accessToken,
              email: userId // In real app, get actual email
            });

            if (tier) {
              localStorage.setItem("cps_user_tier", tier);
              setSubscriptionTier(tier);
            }

            toast.success("Welcome to The CPS Punisher!");
          }}
        />
      </SubscriptionProvider>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your case data...</p>
        </div>
      </div>
    );
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "menu":
        return (
          <MainMenu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            userEmail={auth.email || "user@example.com"}
            subscriptionTier={subscriptionTier}
          />
        );

      case "dashboard":
        return (
          <DashboardPage
            onBackToMenu={handleBackToMenu}
            caseId={caseId}
            documents={documents}
            timelineEvents={timelineEvents}
            violations={violations}
            strategies={strategies}
          />
        );

      case "documents":
        return (
          <DocumentsPage
            onBackToMenu={handleBackToMenu}
            caseId={caseId}
            documents={documents}
            onDocumentsChange={setDocuments}
          />
        );

      case "timeline":
        return (
          <TimelinePage
            onBackToMenu={handleBackToMenu}
            caseId={caseId}
            events={timelineEvents}
            onEventsChange={setTimelineEvents}
          />
        );

      case "violations":
        return (
          <ViolationsPage
            onBackToMenu={handleBackToMenu}
            caseId={caseId}
            violations={violations}
            onViolationsChange={setViolations}
          />
        );

      case "strategy":
        return (
          <StrategyPage
            onBackToMenu={handleBackToMenu}
            caseId={caseId}
            strategies={strategies}
            onStrategiesChange={setStrategies}
            documents={documents}
            violations={violations}
          />
        );

      case "rights":
        return <RightsGuidePage onBackToMenu={handleBackToMenu} />;

      case "evidence":
        return <EvidencePage onBackToMenu={handleBackToMenu} caseId={caseId} />;

      case "federal":
        return (
          <FederalPage
            onBackToMenu={handleBackToMenu}
            caseId={caseId}
            documents={documents}
            violations={violations}
          />
        );

      case "community":
        return <CommunityPage onBackToMenu={handleBackToMenu} />;

      case "directory":
        return <DirectoryPage onBackToMenu={handleBackToMenu} />;

      case "settings":
        return (
          <SettingsPage
            onBackToMenu={handleBackToMenu}
            subscriptionTier={subscriptionTier}
            onUpgrade={() => {
              toast.info("Upgrade feature coming soon!");
            }}
          />
        );

      default:
        return (
          <MainMenu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            userEmail={auth.email || "user@example.com"}
            subscriptionTier={subscriptionTier}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <SubscriptionProvider>
          <LegalDisclaimer
            onAccept={(userType) => {
              console.log("User accepted disclaimer as:", userType);
            }}
          />
          <SkipToContent />
          <StickyDisclaimerBanner />
          <div className="min-h-screen">
            {renderPage()}
          </div>
          <Toaster position="top-right" richColors />
        </SubscriptionProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}
