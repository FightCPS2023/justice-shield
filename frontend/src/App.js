import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, Menu, X, LogOut,
  Home, Settings, Lock, Loader2, Clock, Eye, CheckCircle2,
  CreditCard, Zap, Mic, HelpCircle, ChevronDown
} from 'lucide-react';

import api, { API_URL } from './lib/api';
import AuthContext, { useAuth } from './context/AuthContext';

// Import all page/tab components
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import OverviewTab from './components/features/OverviewTab';
import CasesTab from './components/features/CasesTab';
import ChatTab from './components/features/ChatTab';
import ViolationsTab from './components/features/ViolationsTab';
import DocumentsTab from './components/features/DocumentsTab';
import TimelineTab from './components/features/TimelineTab';
import ResearchTab from './components/features/ResearchTab';
import LawLibraryTab from './components/features/LawLibraryTab';
import HowToTab from './components/features/HowToTab';
import PoliciesTab from './components/features/PoliciesTab';
import CalendarTab from './components/features/CalendarTab';
import PricingTab from './components/features/PricingTab';
import SettingsTab from './components/features/SettingsTab';
import AdminBoardTab from './components/features/AdminBoardTab';
import AICaseNotesTab from './components/features/AICaseNotesTab';
import CaseMemoryTab from './components/features/CaseMemoryTab';
import SmartDocTab from './components/features/SmartDocTab';
import EvidenceTab from './components/features/EvidenceTab';
import CommunicationsTab from './components/features/CommunicationsTab';
import CourtFilingsTab from './components/features/CourtFilingsTab';
import JudgeWatchTab from './components/features/JudgeWatchTab';
import PersonLookupTab from './components/features/PersonLookupTab';
import DefenseStrategyTab from './components/features/DefenseStrategyTab';
import CriminalCaseTab from './components/features/CriminalCaseTab';
import ServicesTab from './components/features/ServicesTab';
import ForumTab from './components/features/ForumTab';
import AdvocatesTab from './components/features/AdvocatesTab';
import ExpertLegalAITab from './components/features/ExpertLegalAITab';
import Section1983Tab from './components/features/Section1983Tab';
import PodcastCreatorTab from './components/features/PodcastCreatorTab';
import CaseLawAnalysisTab from './components/features/CaseLawAnalysisTab';
import IncidentAnalyzerTab from './components/features/IncidentAnalyzerTab';
import LegalKnowledgeBaseTab from './components/features/LegalKnowledgeBaseTab';
import RightsGuideTab from './components/features/RightsGuideTab';
import EvidenceChecklistTab from './components/features/EvidenceChecklistTab';
import VisitationLogTab from './components/features/VisitationLogTab';
import CourtHearingsTab from './components/features/CourtHearingsTab';
import LegalStrategyBuilderTab from './components/features/LegalStrategyBuilderTab';
import ArgumentGeneratorTab from './components/features/ArgumentGeneratorTab';
import EvidenceMapperTab from './components/features/EvidenceMapperTab';
import PrecedentFinderTab from './components/features/PrecedentFinderTab';
import CourtListenerTab from './components/features/CourtListenerTab';
import NotepadTab from './components/features/NotepadTab';
import ADAComplianceTab from './components/features/ADAComplianceTab';
import HelpBot from './components/HelpBot';

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing');
  const [processingOAuth, setProcessingOAuth] = useState(false);
  const hasProcessedOAuth = useRef(false);

  const getSessionIdFromUrl = () => {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash && hash.includes('session_id=')) {
      return hash.split('session_id=')[1]?.split('&')[0];
    }
    if (search && search.includes('session_id=')) {
      return search.split('session_id=')[1]?.split('&')[0];
    }
    return null;
  };

  useEffect(() => {
    const sessionId = getSessionIdFromUrl();
    if (sessionId && !hasProcessedOAuth.current) {
      hasProcessedOAuth.current = true;
      setProcessingOAuth(true);
      processGoogleAuth(sessionId);
      return;
    }
    if (!sessionId) {
      const token = localStorage.getItem('cps_token');
      const userData = localStorage.getItem('cps_user');
      if (token && userData) {
        setUser(JSON.parse(userData));
        setCurrentView('dashboard');
      }
      setLoading(false);
    }
  }, []);

  const processGoogleAuth = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Google authentication failed');
      localStorage.setItem('cps_token', data.access_token);
      localStorage.setItem('cps_user', JSON.stringify(data));
      setUser(data);
      setCurrentView('dashboard');
      window.history.replaceState(null, '', window.location.pathname);
      toast.success(`Welcome, ${data.name}! Signed in with Google.`);
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed. Please try again.');
      setCurrentView('auth');
    } finally {
      setProcessingOAuth(false);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('cps_token', data.access_token);
      localStorage.setItem('cps_user', JSON.stringify(data));
      setUser(data);
      setCurrentView('dashboard');
      toast.success('Welcome back to THE CPS PUNISHER!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signup = async (name, email, password, policyData = {}) => {
    try {
      const data = await api.post('/api/auth/signup', { name, email, password, ...policyData });
      localStorage.setItem('cps_token', data.access_token);
      localStorage.setItem('cps_user', JSON.stringify(data));
      setUser(data);
      setCurrentView('dashboard');
      toast.success('Account created! Welcome to THE CPS PUNISHER!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('cps_token');
    localStorage.removeItem('cps_user');
    setUser(null);
    setCurrentView('landing');
    toast.success('Logged out successfully');
  };

  if (loading || processingOAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <img src="/images/shield-logo.png" alt="Loading" className="w-24 h-28 animate-pulse mb-4" />
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        {processingOAuth && <p className="text-gray-400 mt-4">Signing in with Google...</p>}
      </div>
    );
  }

  const token = localStorage.getItem('cps_token');

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, api, token }}>
      <div className="min-h-screen bg-black text-white">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'auth' && <AuthPage onNavigate={setCurrentView} />}
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    </AuthContext.Provider>
  );
}

// Dashboard - Main layout with sidebar and tab routing
function Dashboard({ onNavigate }) {
  const { user, logout, api, setUser } = useAuth();
  const [showTermsGate, setShowTermsGate] = useState(false);
  const [termsGateChecked, setTermsGateChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefetchedData, setPrefetchedData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [openSections, setOpenSections] = useState({
    core: true,
    case: true,
    ai: true,
    research: true,
    community: true
  });
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const prefetch = async () => {
      try {
        const [casesData, tierData, creditsData, adminCheck] = await Promise.all([
          api.get('/api/cases').catch(() => ({ cases: [] })),
          api.get('/api/auth/tier-status').catch(() => null),
          api.get('/api/credits/balance').catch(() => null),
          api.get('/api/admin/stats').catch(() => null),
        ]);
        setCases(casesData.cases || []);
        setPrefetchedData({ tierStatus: tierData, creditBalance: creditsData });
        const isAdminUser = adminCheck && typeof adminCheck.total_users === 'number';
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Prefetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    prefetch();
  }, []);

  useEffect(() => {
    if (user && (!user.accepted_terms || !user.accepted_privacy)) {
      setShowTermsGate(true);
    } else {
      setShowTermsGate(false);
    }
  }, [user]);

  const handleAcceptTerms = async () => {
    if (!termsGateChecked) {
      toast.error('You must accept the Terms and Privacy Policy to continue.');
      return;
    }
    try {
      const response = await api.post('/api/auth/accept-terms');
      const updatedUser = {
        ...user,
        accepted_terms: true,
        accepted_privacy: true,
        accepted_at: response.accepted_at
      };
      setUser(updatedUser);
      localStorage.setItem('cps_user', JSON.stringify(updatedUser));
      setShowTermsGate(false);
    } catch (error) {
      toast.error('Unable to save acceptance. Please try again.');
    }
  };

  const TIER_LEVELS = { free: 0, essential: 1, professional: 2, attorney: 3, enterprise: 4 };
  const userTierLevel = TIER_LEVELS[user?.tier] || 0;

  const menuSections = [
    {
      id: 'core',
      label: 'Core',
      items: [
        { id: 'overview', icon: Home, label: 'Overview', minTier: 'free' },
        { id: 'howto', icon: HelpCircle, label: 'How to Use', minTier: 'free', highlight: true },
        { id: 'policies', icon: FileText, label: 'Policies', minTier: 'free' },
        { id: 'cases', icon: FileText, label: 'My Cases', minTier: 'free' },
        { id: 'pricing', icon: CreditCard, label: 'Upgrade Plan', minTier: 'free' }
      ]
    },
    {
      id: 'case',
      label: 'Case Data',
      items: [
        { id: 'documents', icon: FileText, label: 'Documents', minTier: 'free', highlight: true },
        { id: 'ainotes', icon: Brain, label: 'AI Case Notes', minTier: 'free', highlight: true },
        { id: 'memory', icon: Brain, label: 'Case Memory', minTier: 'free', highlight: true },
        { id: 'violations', icon: AlertTriangle, label: 'Violations', minTier: 'free' },
        { id: 'timeline', icon: Clock, label: 'Timeline', minTier: 'free' },
        { id: 'evidence', icon: Eye, label: 'Evidence', minTier: 'free' },
        { id: 'evidencelist', icon: CheckCircle2, label: 'Evidence Checklist', minTier: 'free' },
        { id: 'visitation', icon: Users, label: 'Visitation Log', minTier: 'free' },
        { id: 'courthearings', icon: Calendar, label: 'Court Hearings', minTier: 'free' },
        { id: 'communications', icon: MessageSquare, label: 'Communications', minTier: 'free' },
        { id: 'calendar', icon: Calendar, label: 'Calendar', minTier: 'free' },
        { id: 'courtfilings', icon: Gavel, label: 'Court Filings', minTier: 'essential' },
        { id: 'notepad', icon: FileText, label: 'Legal Notepad', minTier: 'essential', highlight: true }
      ]
    },
    {
      id: 'ai',
      label: 'AI Tools',
      items: [
        { id: 'chat', icon: MessageSquare, label: 'AI Assistant', minTier: 'free', highlight: true },
        { id: 'smartdoc', icon: Zap, label: 'Smart Doc Generator', minTier: 'free', highlight: true },
        { id: 'incidents', icon: AlertTriangle, label: 'Incident Analyzer', minTier: 'essential' },
        { id: 'strategy', icon: Shield, label: 'Defense Strategy', minTier: 'essential' },
        { id: 'strategybuilder', icon: Shield, label: 'Strategy Builder', minTier: 'professional', highlight: true },
        { id: 'argumentgen', icon: Scale, label: 'Argument Generator', minTier: 'professional', highlight: true },
        { id: 'evidencemapper', icon: Eye, label: 'Evidence Mapper', minTier: 'professional', highlight: true },
        { id: 'expert', icon: Brain, label: 'Expert Legal AI', minTier: 'professional', highlight: true },
        { id: 'personlookup', icon: Search, label: 'Background Check', minTier: 'professional', highlight: true },
        { id: 'section1983', icon: Gavel, label: 'Section 1983 Lawsuit', minTier: 'attorney', highlight: true },
        { id: 'criminal', icon: AlertTriangle, label: 'Criminal Case', minTier: 'attorney' }
      ]
    },
    {
      id: 'research',
      label: 'Research & Law',
      items: [
        { id: 'research', icon: Search, label: 'Legal Research', minTier: 'professional' },
        { id: 'library', icon: BookOpen, label: 'Law Library', minTier: 'free' },
        { id: 'legaldb', icon: BookOpen, label: 'Legal Knowledge Base', minTier: 'professional' },
        { id: 'caselaw', icon: BookOpen, label: 'Case Law Analysis', minTier: 'professional', highlight: true },
        { id: 'precedentfinder', icon: Search, label: 'Precedent Finder', minTier: 'professional', highlight: true },
        { id: 'courtlistener', icon: Scale, label: 'Court Opinions', minTier: 'attorney', highlight: true },
        { id: 'rights', icon: Shield, label: 'Know Your Rights', minTier: 'free' },
        { id: 'ada', icon: Scale, label: 'ADA Compliance', minTier: 'professional', highlight: true },
        { id: 'judgewatch', icon: Scale, label: 'Judge Watch', minTier: 'professional' }
      ]
    },
    {
      id: 'community',
      label: 'Community & Support',
      items: [
        { id: 'forum', icon: Users, label: 'Community', minTier: 'free' },
        { id: 'advocates', icon: Users, label: 'Find Advocates', minTier: 'free' },
        { id: 'services', icon: Users, label: 'Services', minTier: 'essential' },
        { id: 'podcast', icon: Mic, label: 'Podcast Creator', minTier: 'attorney' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {showTermsGate && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" data-testid="terms-gate-modal">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-2">Terms of Service & Privacy Policy</h2>
            <p className="text-sm text-gray-400 mb-4">Effective Date: {effectiveDate}</p>
            <div className="space-y-3 text-sm text-gray-300">
              <p><strong>Acceptance:</strong> By using “The CPS Punisher,” you agree to these Terms.</p>
              <p><strong>Intellectual Property:</strong> All content, features, and functionalities are owned by Darren Guay and protected by IP laws. Users are granted a limited, non-exclusive license for personal use only. No reproduction, modification, or reverse engineering is permitted.</p>
              <p><strong>User Conduct:</strong> Users must not copy, distribute, or use the app for illegal purposes.</p>
              <p><strong>Disclaimer:</strong> The app provides analysis for informational purposes only, not legal advice.</p>
              <p><strong>Termination:</strong> Violation may result in account termination and legal action.</p>
              <p><strong>Governing Law:</strong> State of Maine.</p>
              <p><strong>Privacy:</strong> Data is used solely for app functionality and analysis; users may request access or deletion via <span className="text-purple-300">punisher@cpsbreakingnews.com</span>.</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-300 mt-6">
              <input
                type="checkbox"
                checked={termsGateChecked}
                onChange={(e) => setTermsGateChecked(e.target.checked)}
                className="mt-1"
                data-testid="terms-gate-checkbox"
              />
              <span>I agree to the Terms of Service and Privacy Policy.</span>
            </label>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleAcceptTerms}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                data-testid="terms-gate-accept-btn"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/shield-logo.png" alt="Logo" className="w-10 h-12 object-contain" />
              <div>
                <h1 className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>CPS PUNISHER</h1>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg" data-testid="close-sidebar-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pb-4">
          {menuSections.map((section) => (
            <div key={section.id} className="space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-gray-500 hover:text-gray-300"
                data-testid={`nav-section-${section.id}-toggle`}
              >
                <span>{section.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections[section.id] ? 'rotate-180' : ''}`} />
              </button>
              {openSections[section.id] && (
                <div className="space-y-1" data-testid={`nav-section-${section.id}-items`}>
                  {section.items.map((item) => {
                    const itemTierLevel = TIER_LEVELS[item.minTier] || 0;
                    const isLocked = itemTierLevel > userTierLevel;
                    const tierLabel = item.minTier === 'essential' ? 'ESS' : item.minTier === 'professional' ? 'PRO' : item.minTier === 'attorney' ? 'ATT' : null;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isLocked) {
                            toast.error(`This feature requires the ${item.minTier.charAt(0).toUpperCase() + item.minTier.slice(1)} plan or credits. Upgrade or buy credits.`);
                            setActiveTab('pricing');
                            setSidebarOpen(false);
                          } else {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isLocked 
                            ? 'text-gray-600 hover:bg-gray-800/50 cursor-not-allowed opacity-60'
                            : activeTab === item.id 
                              ? 'bg-red-600/20 text-red-500 border border-red-600/30' 
                              : item.highlight 
                                ? 'text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 border border-purple-800/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                        data-testid={`nav-${item.id}`}
                      >
                        {isLocked ? <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" /> : <item.icon className={`w-5 h-5 flex-shrink-0 ${item.highlight && !isLocked ? 'text-purple-400' : ''}`} />}
                        <span className="truncate">{item.label}</span>
                        {isLocked && tierLabel && (
                          <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">{tierLabel}</span>
                        )}
                        {!isLocked && item.highlight && (
                          <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full ml-auto flex-shrink-0">NEW</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-1 bg-black">
          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'text-red-400 hover:bg-red-900/30 hover:text-red-300'}`}
              data-testid="nav-admin"
            >
              <Shield className="w-5 h-5" />
              Admin Board
            </button>
          )}
          <button
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-500"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" data-testid="mobile-menu-btn">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/images/shield-logo.png" alt="Logo" className="w-8 h-10 object-contain" />
            <span className="font-bold">CPS PUNISHER</span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab cases={cases} setActiveTab={setActiveTab} prefetchedData={prefetchedData} />}
          {activeTab === 'howto' && <HowToTab setActiveTab={setActiveTab} />}
          {activeTab === 'policies' && <PoliciesTab />}
          {activeTab === 'cases' && <CasesTab cases={cases} setCases={setCases} selectedCase={selectedCase} setSelectedCase={setSelectedCase} />}
          {activeTab === 'chat' && <ChatTab selectedCase={selectedCase} />}
          {activeTab === 'expert' && <ExpertLegalAITab selectedCase={selectedCase} />}
          {activeTab === 'strategybuilder' && <LegalStrategyBuilderTab selectedCase={selectedCase} />}
          {activeTab === 'argumentgen' && <ArgumentGeneratorTab selectedCase={selectedCase} />}
          {activeTab === 'evidencemapper' && <EvidenceMapperTab selectedCase={selectedCase} />}
          {activeTab === 'precedentfinder' && <PrecedentFinderTab selectedCase={selectedCase} />}
          {activeTab === 'section1983' && <Section1983Tab selectedCase={selectedCase} />}
          {activeTab === 'incidents' && <IncidentAnalyzerTab selectedCase={selectedCase} />}
          {activeTab === 'legaldb' && <LegalKnowledgeBaseTab />}
          {activeTab === 'podcast' && <PodcastCreatorTab selectedCase={selectedCase} />}
          {activeTab === 'caselaw' && <CaseLawAnalysisTab selectedCase={selectedCase} />}
          {activeTab === 'violations' && <ViolationsTab selectedCase={selectedCase} />}
          {activeTab === 'documents' && <DocumentsTab selectedCase={selectedCase} />}
          {activeTab === 'smartdoc' && <SmartDocTab selectedCase={selectedCase} />}
          {activeTab === 'ainotes' && <AICaseNotesTab selectedCase={selectedCase} />}
          {activeTab === 'memory' && <CaseMemoryTab selectedCase={selectedCase} />}
          {activeTab === 'timeline' && <TimelineTab selectedCase={selectedCase} />}
          {activeTab === 'evidence' && <EvidenceTab selectedCase={selectedCase} />}
          {activeTab === 'evidencelist' && <EvidenceChecklistTab selectedCase={selectedCase} />}
          {activeTab === 'visitation' && <VisitationLogTab selectedCase={selectedCase} />}
          {activeTab === 'courthearings' && <CourtHearingsTab selectedCase={selectedCase} />}
          {activeTab === 'rights' && <RightsGuideTab />}
          {activeTab === 'ada' && <ADAComplianceTab selectedCase={selectedCase} />}
          {activeTab === 'communications' && <CommunicationsTab selectedCase={selectedCase} />}
          {activeTab === 'courtfilings' && <CourtFilingsTab selectedCase={selectedCase} />}
          {activeTab === 'judgewatch' && <JudgeWatchTab selectedCase={selectedCase} />}
          {activeTab === 'personlookup' && <PersonLookupTab selectedCase={selectedCase} />}
          {activeTab === 'strategy' && <DefenseStrategyTab selectedCase={selectedCase} />}
          {activeTab === 'criminal' && <CriminalCaseTab selectedCase={selectedCase} />}
          {activeTab === 'services' && <ServicesTab selectedCase={selectedCase} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'research' && <ResearchTab selectedCase={selectedCase} />}
          {activeTab === 'library' && <LawLibraryTab />}
          {activeTab === 'courtlistener' && <CourtListenerTab selectedCase={selectedCase} />}
          {activeTab === 'notepad' && <NotepadTab selectedCase={selectedCase} />}
          {activeTab === 'forum' && <ForumTab />}
          {activeTab === 'advocates' && <AdvocatesTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'admin' && isAdmin && <AdminBoardTab />}
        </div>
      </main>

      <HelpBot />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

export default App;
