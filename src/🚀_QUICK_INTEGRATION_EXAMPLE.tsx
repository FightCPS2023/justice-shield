// 🚀 QUICK INTEGRATION EXAMPLE
// This shows how to integrate the new UX components into your App.tsx

import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { SituationDescription } from './components/SituationDescription';
import { NavigationSidebarRevamped } from './components/NavigationSidebarRevamped';
import { SectionWrapper } from './components/SectionWrapper';
import { ReturningUserLogin } from './components/ReturningUserLogin';
import { ViolationChecker } from './components/ViolationChecker';
import { DefenseStrategy } from './components/DefenseStrategy';
import { CaseDocuments } from './components/CaseDocuments';
import { AlertTriangle, Shield, Upload } from 'lucide-react';

// ============================================================================
// STEP 1: Add these state variables to your App component
// ============================================================================

function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState<'login' | 'menu' | 'section'>('login');
  const [activeSection, setActiveSection] = useState<string>('menu');
  const [isReturningUser, setIsReturningUser] = useState(false);
  
  // User data (you probably already have this)
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeCaseName, setActiveCaseName] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('Free');
  
  // Your existing state
  const [violations, setViolations] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // ============================================================================
  // STEP 2: Check if returning user
  // ============================================================================
  
  useEffect(() => {
    const hasAccount = localStorage.getItem('user-has-account');
    const savedEmail = localStorage.getItem('user-email');
    const savedName = localStorage.getItem('user-name');
    
    if (hasAccount === 'true') {
      setIsReturningUser(true);
      if (savedEmail) setUserEmail(savedEmail);
      if (savedName) setUserName(savedName);
    }
  }, []);
  
  // ============================================================================
  // STEP 3: Handle login (returning users)
  // ============================================================================
  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Your authentication logic here
      // For demo purposes:
      if (email && password) {
        setUserEmail(email);
        setUserName(email.split('@')[0]);
        setCurrentView('menu');
        localStorage.setItem('user-has-account', 'true');
        localStorage.setItem('user-email', email);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };
  
  // ============================================================================
  // STEP 4: Handle navigation
  // ============================================================================
  
  const handleNavigate = (section: string) => {
    if (section === 'menu') {
      setCurrentView('menu');
      setActiveSection('menu');
    } else {
      setCurrentView('section');
      setActiveSection(section);
    }
  };
  
  const handleBackToMenu = () => {
    setCurrentView('menu');
    setActiveSection('menu');
  };
  
  // ============================================================================
  // STEP 5: Handle situation description submission
  // ============================================================================
  
  const handleSituationSubmit = (description: string, method: 'write' | 'record') => {
    console.log('Situation described:', description);
    // Your AI analysis logic here
    // Then navigate to documents or violations
    handleNavigate('violations');
  };
  
  // ============================================================================
  // STEP 6: Render sections with SectionWrapper
  // ============================================================================
  
  const renderSection = () => {
    switch (activeSection) {
      // NEW: Situation Description
      case 'situation':
        return (
          <SituationDescription
            onBack={handleBackToMenu}
            onSubmit={handleSituationSubmit}
            onUploadInstead={() => handleNavigate('documents')}
          />
        );
      
      // Documents with SectionWrapper
      case 'documents':
        return (
          <SectionWrapper
            title="Upload Documents"
            description="Upload CPS documents for AI analysis and violation detection"
            icon={<Upload className="w-8 h-8" />}
            onBack={() => setActiveSection('menu')}
            onBackToMenu={handleBackToMenu}
            instructions={[
              { step: 1, text: "Click the upload button or drag and drop files" },
              { step: 2, text: "Supported formats: PDF, Word, images, scanned documents" },
              { step: 3, text: "Wait for AI analysis to complete (30-60 seconds)" },
              { step: 4, text: "Review detected violations and key information" },
              { step: 5, text: "Organize documents into categories" }
            ]}
            disclaimer="All documents are encrypted and stored securely. AI analysis is for informational purposes only and does not constitute legal advice. Always have documents reviewed by a licensed attorney."
            showAIBadge={true}
            headerColor="from-blue-600 to-indigo-600"
            iconBgColor="bg-blue-600"
          >
            <CaseDocuments
              caseId={activeCaseName}
              documents={documents}
              onDocumentAnalyzed={(doc) => {
                // Your document analysis logic
              }}
            />
          </SectionWrapper>
        );
      
      // Violations with SectionWrapper
      case 'violations':
        return (
          <SectionWrapper
            title="Violation Checker"
            description="Detect constitutional and procedural violations in your CPS case"
            icon={<AlertTriangle className="w-8 h-8" />}
            onBack={() => setActiveSection('menu')}
            onBackToMenu={handleBackToMenu}
            instructions={[
              { step: 1, text: "Upload or select documents to analyze for violations" },
              { step: 2, text: "AI scans for 50+ types of constitutional and procedural violations" },
              { step: 3, text: "Review detected violations with severity levels and legal citations" },
              { step: 4, text: "Generate legal responses or motions to suppress evidence" },
              { step: 5, text: "Consult with an attorney to verify and act on violations" }
            ]}
            disclaimer="AI violation detection is for informational purposes only. Violations must be verified by a licensed attorney before being used in legal proceedings. Not all detected issues may constitute actionable violations in your jurisdiction."
            showAIBadge={true}
            headerColor="from-red-600 to-orange-600"
            iconBgColor="bg-red-600"
            additionalHelp={
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Common Violations We Detect:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• 4th Amendment: Warrantless searches, illegal entry</li>
                  <li>• 5th Amendment: Miranda violations, coerced statements</li>
                  <li>• 14th Amendment: Due process violations, inadequate notice</li>
                  <li>• Procedural: Failure to follow state law, missed deadlines</li>
                </ul>
              </div>
            }
          >
            <ViolationChecker
              violations={violations}
              caseDetails={{ /* your case details */ }}
            />
          </SectionWrapper>
        );
      
      // Defense Strategy with SectionWrapper
      case 'defense':
        return (
          <SectionWrapper
            title="Defense Strategy"
            description="AI-powered legal defense strategies tailored to your case"
            icon={<Shield className="w-8 h-8" />}
            onBack={() => setActiveSection('menu')}
            onBackToMenu={handleBackToMenu}
            instructions={[
              { step: 1, text: "Review your case details, violations, and evidence" },
              { step: 2, text: "AI generates multiple defense strategies based on your situation" },
              { step: 3, text: "Review recommended legal approaches and their success rates" },
              { step: 4, text: "Select strategies that best fit your case and goals" },
              { step: 5, text: "Download strategy documents or schedule attorney consultation" }
            ]}
            disclaimer="Defense strategies are AI-generated recommendations for informational purposes only. Actual legal strategy must be developed by a licensed attorney who can review all case details and local laws. Success rates are estimates based on similar cases."
            showAIBadge={true}
            headerColor="from-purple-600 to-pink-600"
            iconBgColor="bg-purple-600"
          >
            <DefenseStrategy
              violations={violations}
              caseDetails={{ /* your case details */ }}
            />
          </SectionWrapper>
        );
      
      // Add more sections here with SectionWrapper...
      
      default:
        return null;
    }
  };
  
  // ============================================================================
  // STEP 7: Main render with navigation
  // ============================================================================
  
  return (
    <div className="flex h-screen">
      {/* Show login for returning users */}
      {currentView === 'login' && isReturningUser && (
        <ReturningUserLogin
          onLogin={handleLogin}
          onForgotPassword={() => {
            // Your forgot password logic
            console.log('Forgot password');
          }}
          onBackToWelcome={() => {
            setIsReturningUser(false);
            // Show your regular onboarding flow
          }}
        />
      )}
      
      {/* Show main menu */}
      {currentView === 'menu' && (
        <MainMenu
          onNavigate={handleNavigate}
          userName={userName}
          activeCaseName={activeCaseName}
          subscriptionTier={subscriptionTier}
        />
      )}
      
      {/* Show section with sidebar */}
      {currentView === 'section' && activeSection !== 'situation' && (
        <>
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <NavigationSidebarRevamped
              activeSection={activeSection}
              onNavigate={handleNavigate}
              onBackToMenu={handleBackToMenu}
              violationCount={violations.length}
              documentCount={documents.length}
            />
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {renderSection()}
          </div>
        </>
      )}
      
      {/* Special: Situation description (full screen, no sidebar) */}
      {currentView === 'section' && activeSection === 'situation' && (
        renderSection()
      )}
    </div>
  );
}

export default App;

// ============================================================================
// EXAMPLE: How to wrap your existing ViolationChecker component
// ============================================================================

/*
// BEFORE (old way):
<ViolationChecker violations={violations} />

// AFTER (new way with SectionWrapper):
<SectionWrapper
  title="Violation Checker"
  description="Detect violations in your case"
  icon={<AlertTriangle className="w-8 h-8" />}
  onBack={() => setActiveSection('menu')}
  onBackToMenu={handleBackToMenu}
  instructions={[
    { step: 1, text: "Upload documents" },
    { step: 2, text: "AI analyzes" },
    { step: 3, text: "Review results" }
  ]}
  disclaimer="For informational purposes only..."
  showAIBadge={true}
>
  <ViolationChecker violations={violations} />
</SectionWrapper>
*/

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/*
✅ 1. Add new state variables (currentView, activeSection, isReturningUser)
✅ 2. Add navigation handlers (handleNavigate, handleBackToMenu)
✅ 3. Add login handler (handleLogin)
✅ 4. Create renderSection() function
✅ 5. Wrap each section with SectionWrapper
✅ 6. Add MainMenu component
✅ 7. Add NavigationSidebarRevamped
✅ 8. Add ReturningUserLogin
✅ 9. Add SituationDescription
✅ 10. Test all navigation paths
✅ 11. Verify back buttons work
✅ 12. Verify menu button works
✅ 13. Check mobile responsive
✅ 14. Deploy!
*/
