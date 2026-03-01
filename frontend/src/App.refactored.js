/**
 * CPS Punisher - Main Application (Refactored)
 * Clean, organized entry point that imports modular components
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Home, FileText, MessageSquare, AlertTriangle, Clock, Eye, 
  Calendar, Search, BookOpen, Users, CreditCard, Shield, Brain,
  Scale, Gavel, Mic, CheckCircle2, LogOut, Menu
} from 'lucide-react';

// Import all tab components
import {
  OverviewTab, CasesTab, ChatTab, ViolationsTab, DocumentsTab,
  TimelineTab, ResearchTab, LawLibraryTab, CalendarTab, PricingTab,
  EvidenceTab, CommunicationsTab, CourtFilingsTab, JudgeWatchTab,
  DefenseStrategyTab, CriminalCaseTab, ServicesTab, ForumTab,
  AdvocatesTab, ExpertLegalAITab, Section1983Tab, PodcastCreatorTab,
  CaseLawAnalysisTab, IncidentAnalyzerTab, LegalKnowledgeBaseTab,
  RightsGuideTab, EvidenceChecklistTab, VisitationLogTab,
  CourtHearingsTab, LegalStrategyBuilderTab, ArgumentGeneratorTab,
  EvidenceMapperTab, PrecedentFinderTab, CourtListenerTab, NotepadTab
} from './components/tabs';

// Import page components
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// ============== AUTH CONTEXT ==============
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// API Helper
const createApi = (token) => ({
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },
  
  get(endpoint) { return this.request(endpoint); },
  post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); },
  put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },
});

// ============== MAIN APP ==============
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');

  const api = createApi(localStorage.getItem('cps_token'));

  useEffect(() => {
    checkAuth();
    handleOAuthCallback();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('cps_token');
    if (token) {
      try {
        const userData = await api.get('/api/auth/me');
        setUser(userData);
        setCurrentPage('dashboard');
      } catch (error) {
        localStorage.removeItem('cps_token');
      }
    }
    setLoading(false);
  };

  const handleOAuthCallback = async () => {
    const hash = window.location.hash;
    if (hash && hash.includes('session_id=')) {
      const sessionId = hash.split('session_id=')[1]?.split('&')[0];
      if (sessionId) {
        try {
          const response = await api.post('/api/auth/google/session', { session_id: sessionId });
          if (response.access_token) {
            localStorage.setItem('cps_token', response.access_token);
            setUser(response);
            setCurrentPage('dashboard');
            window.history.replaceState(null, '', window.location.pathname);
            toast.success('Welcome back!');
          }
        } catch (error) {
          toast.error('Google login failed');
        }
      }
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('cps_token', response.access_token);
      setUser(response);
      setCurrentPage('dashboard');
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/signup', { name, email, password });
      localStorage.setItem('cps_token', response.access_token);
      setUser(response);
      setCurrentPage('dashboard');
      toast.success('Account created!');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('cps_token');
    setUser(null);
    setCurrentPage('landing');
    toast.success('Logged out');
  };

  const authValue = {
    user,
    setUser,
    login,
    signup,
    logout,
    api: createApi(localStorage.getItem('cps_token')),
    isAuthenticated: !!user,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <img src="/images/shield-logo.png" alt="Logo" className="w-20 h-24 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-black text-white">
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'auth' && <AuthPage onNavigate={setCurrentPage} />}
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        <Toaster richColors position="top-right" />
      </div>
    </AuthContext.Provider>
  );
}

// ============== DASHBOARD ==============
function Dashboard({ onNavigate }) {
  const { user, logout, api } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await api.get('/api/cases');
      setCases(data.cases || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'cases', icon: FileText, label: 'My Cases' },
    { id: 'chat', icon: MessageSquare, label: 'AI Assistant' },
    { id: 'expert', icon: Brain, label: 'Expert Legal AI' },
    { id: 'strategybuilder', icon: Shield, label: 'Strategy Builder', highlight: true },
    { id: 'argumentgen', icon: Scale, label: 'Argument Generator', highlight: true },
    { id: 'evidencemapper', icon: Eye, label: 'Evidence Mapper', highlight: true },
    { id: 'precedentfinder', icon: Search, label: 'Precedent Finder', highlight: true },
    { id: 'section1983', icon: Gavel, label: 'Section 1983 Lawsuit' },
    { id: 'incidents', icon: AlertTriangle, label: 'Incident Analyzer' },
    { id: 'legaldb', icon: BookOpen, label: 'Legal Knowledge Base' },
    { id: 'rights', icon: Shield, label: 'Know Your Rights' },
    { id: 'podcast', icon: Mic, label: 'Podcast Creator' },
    { id: 'caselaw', icon: BookOpen, label: 'Case Law Analysis' },
    { id: 'violations', icon: AlertTriangle, label: 'Violations' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'timeline', icon: Clock, label: 'Timeline' },
    { id: 'evidence', icon: Eye, label: 'Evidence' },
    { id: 'evidencelist', icon: CheckCircle2, label: 'Evidence Checklist' },
    { id: 'visitation', icon: Users, label: 'Visitation Log' },
    { id: 'courthearings', icon: Calendar, label: 'Court Hearings' },
    { id: 'communications', icon: MessageSquare, label: 'Communications' },
    { id: 'courtfilings', icon: Gavel, label: 'Court Filings' },
    { id: 'judgewatch', icon: Scale, label: 'Judge Watch' },
    { id: 'strategy', icon: Shield, label: 'Defense Strategy' },
    { id: 'criminal', icon: AlertTriangle, label: 'Criminal Case' },
    { id: 'services', icon: Users, label: 'Services' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'research', icon: Search, label: 'Legal Research' },
    { id: 'library', icon: BookOpen, label: 'Law Library' },
    { id: 'courtlistener', icon: Scale, label: 'Court Opinions', highlight: true },
    { id: 'notepad', icon: FileText, label: 'Legal Notepad', highlight: true },
    { id: 'forum', icon: Users, label: 'Community' },
    { id: 'advocates', icon: Users, label: 'Find Advocates' },
    { id: 'pricing', icon: CreditCard, label: 'Upgrade Plan' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src="/images/shield-logo.png" alt="Logo" className="w-10 h-12 object-contain" />
            <div>
              <h1 className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>CPS PUNISHER</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-red-600/20 text-red-500 border border-red-600/30' 
                  : item.highlight 
                    ? 'text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 border border-purple-800/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className={`w-5 h-5 ${item.highlight ? 'text-purple-400' : ''}`} />
              {item.label}
              {item.highlight && <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full ml-auto">NEW</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-500"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
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
          {activeTab === 'overview' && <OverviewTab cases={cases} setActiveTab={setActiveTab} />}
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
          {activeTab === 'timeline' && <TimelineTab selectedCase={selectedCase} />}
          {activeTab === 'evidence' && <EvidenceTab selectedCase={selectedCase} />}
          {activeTab === 'evidencelist' && <EvidenceChecklistTab selectedCase={selectedCase} />}
          {activeTab === 'visitation' && <VisitationLogTab selectedCase={selectedCase} />}
          {activeTab === 'courthearings' && <CourtHearingsTab selectedCase={selectedCase} />}
          {activeTab === 'rights' && <RightsGuideTab />}
          {activeTab === 'communications' && <CommunicationsTab selectedCase={selectedCase} />}
          {activeTab === 'courtfilings' && <CourtFilingsTab selectedCase={selectedCase} />}
          {activeTab === 'judgewatch' && <JudgeWatchTab selectedCase={selectedCase} />}
          {activeTab === 'strategy' && <DefenseStrategyTab selectedCase={selectedCase} />}
          {activeTab === 'criminal' && <CriminalCaseTab selectedCase={selectedCase} />}
          {activeTab === 'services' && <ServicesTab selectedCase={selectedCase} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'research' && <ResearchTab />}
          {activeTab === 'library' && <LawLibraryTab />}
          {activeTab === 'courtlistener' && <CourtListenerTab selectedCase={selectedCase} />}
          {activeTab === 'notepad' && <NotepadTab selectedCase={selectedCase} />}
          {activeTab === 'forum' && <ForumTab />}
          {activeTab === 'advocates' && <AdvocatesTab />}
          {activeTab === 'pricing' && <PricingTab />}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
