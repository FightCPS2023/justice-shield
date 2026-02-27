import React, { useState, useEffect, createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// API Helper
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('cps_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },
  
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, data) => api.request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing');

  useEffect(() => {
    const token = localStorage.getItem('cps_token');
    const userData = localStorage.getItem('cps_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('dashboard');
    }
    setLoading(false);
  }, []);

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

  const signup = async (name, email, password) => {
    try {
      const data = await api.post('/api/auth/signup', { name, email, password });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, api }}>
      <div className="min-h-screen bg-black text-white">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'auth' && <AuthPage onNavigate={setCurrentView} />}
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    </AuthContext.Provider>
  );
}

// Landing Page
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-950/30" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)',
        }} />
        
        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl py-20">
          {/* Badges */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-red-500" />
              AI-Powered Analysis
            </span>
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              50 States Covered
            </span>
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              100% Confidential
            </span>
          </div>

          {/* Logo */}
          <div className="mb-8">
            <Shield className="w-24 h-24 mx-auto text-red-600 animate-pulse" style={{ filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.5))' }} />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <span className="text-white">THE CPS</span>
          </h1>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-wider text-glow" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <span className="gradient-text">PUNISHER</span>
          </h1>

          <p className="text-xl md:text-2xl text-red-400 mb-4 uppercase tracking-wide">
            The Legal Educator They Didn't Want You To Find!
          </p>
          
          <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto">
            AI-powered case analysis, violation detection, and defense strategy generation. 
            Fight for your family with the most advanced CPS defense platform available.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('auth')}
              className="btn-punisher flex items-center justify-center gap-2 text-lg glow-red"
              data-testid="get-started-btn"
            >
              <Shield className="w-5 h-5" />
              Start Fighting Back
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline-punisher flex items-center justify-center gap-2 text-lg"
            >
              <Play className="w-5 h-5" />
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Start in 60 Seconds
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Powerful Defense Arsenal
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to analyze your case and build an effective defense
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: 'AI Case Analysis', desc: 'GPT-5.2 powered analysis identifies violations and builds strategies automatically', color: 'text-purple-500' },
              { icon: AlertTriangle, title: 'Violation Detection', desc: 'Track 24+ violation types including constitutional rights and procedural errors', color: 'text-red-500' },
              { icon: FileText, title: 'Document Generator', desc: 'Create court-ready motions, letters, and legal documents instantly', color: 'text-blue-500' },
              { icon: Scale, title: 'Law Library', desc: 'Access statutes, case law, and CPS policies for all 50 states', color: 'text-yellow-500' },
              { icon: Calendar, title: 'Case Timeline', desc: 'Build comprehensive timelines with automatic event extraction', color: 'text-green-500' },
              { icon: MessageSquare, title: 'AI Legal Chat', desc: 'Ask questions and get instant answers from your AI legal assistant', color: 'text-cyan-500' },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 card-hover">
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-black to-red-950/20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-600 mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Ready to Fight Back?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your children are counting on you. Start your defense today.
          </p>
          <button 
            onClick={() => onNavigate('auth')}
            className="btn-punisher text-xl glow-red"
            data-testid="cta-get-started-btn"
          >
            <Shield className="w-6 h-6 inline mr-2" />
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 bg-black">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2024-2025 THE CPS PUNISHER. Educational tool - not legal advice.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Always consult with a licensed attorney for legal matters.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Auth Page
function AuthPage({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-950/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto text-red-600 mb-4" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
            THE CPS PUNISHER
          </h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to continue your fight' : 'Create your account to fight back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                placeholder="Enter your name"
                required={!isLogin}
                data-testid="name-input"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
              placeholder="Enter your email"
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
              placeholder={isLogin ? 'Enter your password' : 'Create a password (6+ chars)'}
              required
              minLength={6}
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-punisher flex items-center justify-center gap-2"
            data-testid="auth-submit-btn"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-500 hover:text-red-400"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <button
          onClick={() => onNavigate('landing')}
          className="block mx-auto mt-4 text-gray-500 hover:text-gray-400"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

// Dashboard Component
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
    { id: 'violations', icon: AlertTriangle, label: 'Violations' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'timeline', icon: Clock, label: 'Timeline' },
    { id: 'evidence', icon: Eye, label: 'Evidence' },
    { id: 'communications', icon: MessageSquare, label: 'Communications' },
    { id: 'courtfilings', icon: Gavel, label: 'Court Filings' },
    { id: 'judgewatch', icon: Scale, label: 'Judge Watch' },
    { id: 'strategy', icon: Shield, label: 'Defense Strategy' },
    { id: 'criminal', icon: AlertTriangle, label: 'Criminal Case' },
    { id: 'services', icon: Users, label: 'Services' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'research', icon: Search, label: 'Legal Research' },
    { id: 'library', icon: BookOpen, label: 'Law Library' },
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
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>CPS PUNISHER</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-red-600/20 text-red-500 border border-red-600/30' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
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
            <Shield className="w-6 h-6 text-red-600" />
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
          {activeTab === 'violations' && <ViolationsTab selectedCase={selectedCase} />}
          {activeTab === 'documents' && <DocumentsTab selectedCase={selectedCase} />}
          {activeTab === 'timeline' && <TimelineTab selectedCase={selectedCase} />}
          {activeTab === 'evidence' && <EvidenceTab selectedCase={selectedCase} />}
          {activeTab === 'communications' && <CommunicationsTab selectedCase={selectedCase} />}
          {activeTab === 'courtfilings' && <CourtFilingsTab selectedCase={selectedCase} />}
          {activeTab === 'judgewatch' && <JudgeWatchTab selectedCase={selectedCase} />}
          {activeTab === 'strategy' && <DefenseStrategyTab selectedCase={selectedCase} />}
          {activeTab === 'criminal' && <CriminalCaseTab selectedCase={selectedCase} />}
          {activeTab === 'services' && <ServicesTab selectedCase={selectedCase} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'research' && <ResearchTab />}
          {activeTab === 'library' && <LawLibraryTab />}
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

// Overview Tab
function OverviewTab({ cases, setActiveTab }) {
  const quickActions = [
    { icon: Plus, label: 'New Case', action: () => setActiveTab('cases'), color: 'bg-red-600' },
    { icon: MessageSquare, label: 'AI Chat', action: () => setActiveTab('chat'), color: 'bg-purple-600' },
    { icon: Search, label: 'Research', action: () => setActiveTab('research'), color: 'bg-blue-600' },
    { icon: BookOpen, label: 'Law Library', action: () => setActiveTab('library'), color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="overview-tab">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Welcome Back, Warrior
        </h1>
        <p className="text-gray-400">Continue your fight for your family</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={action.action}
            className={`${action.color} p-6 rounded-xl flex flex-col items-center gap-3 hover:opacity-90 transition-opacity`}
          >
            <action.icon className="w-8 h-8" />
            <span className="font-semibold">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Active Cases</h3>
          <p className="text-4xl font-bold text-red-500">{cases.length}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">AI Sessions</h3>
          <p className="text-4xl font-bold text-purple-500">∞</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">States Covered</h3>
          <p className="text-4xl font-bold text-green-500">50</p>
        </div>
      </div>

      {/* Recent Cases */}
      {cases.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Cases</h3>
          <div className="space-y-3">
            {cases.slice(0, 3).map((caseItem) => (
              <div key={caseItem.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                <div>
                  <p className="font-medium">{caseItem.title}</p>
                  <p className="text-sm text-gray-400">{caseItem.state}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  caseItem.status === 'active' ? 'bg-green-600/20 text-green-500' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {caseItem.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200">
            <strong>Legal Notice:</strong> This platform provides legal EDUCATION and INFORMATION, not legal advice. 
            We are not attorneys. Always consult with a licensed attorney for your specific case.
          </p>
        </div>
      </div>
    </div>
  );
}

// Cases Tab
function CasesTab({ cases, setCases, selectedCase, setSelectedCase }) {
  const { api } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    state: '',
    case_number: '',
    children_names: []
  });

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCase = await api.post('/api/cases', formData);
      setCases([...cases, newCase]);
      setSelectedCase(newCase);
      setShowCreate(false);
      setFormData({ title: '', description: '', state: '', case_number: '', children_names: [] });
      toast.success('Case created successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="cases-tab">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>My Cases</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-punisher flex items-center gap-2"
          data-testid="create-case-btn"
        >
          <Plus className="w-5 h-5" />
          New Case
        </button>
      </div>

      {/* Create Case Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Case</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  placeholder="e.g., Smith Family CPS Case"
                  required
                  data-testid="case-title-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State*</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  required
                  data-testid="case-state-select"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Case Number (Optional)</label>
                <input
                  type="text"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  placeholder="Court case number if known"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 h-24"
                  placeholder="Brief description of your case"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-punisher"
                  data-testid="submit-case-btn"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Cases Yet</h3>
          <p className="text-gray-400 mb-4">Create your first case to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" />
            Create Case
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className={`p-6 rounded-xl cursor-pointer transition-all ${
                selectedCase?.id === caseItem.id
                  ? 'bg-red-600/20 border-2 border-red-600'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{caseItem.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">State: {caseItem.state}</p>
                  {caseItem.case_number && (
                    <p className="text-gray-500 text-sm">Case #: {caseItem.case_number}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  caseItem.status === 'active' ? 'bg-green-600/20 text-green-500' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {caseItem.status || 'Active'}
                </span>
              </div>
              {caseItem.description && (
                <p className="text-gray-400 mt-3 text-sm line-clamp-2">{caseItem.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCase && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-4">
          <p className="text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            <strong>Selected Case:</strong> {selectedCase.title} - Use the sidebar to access case features
          </p>
        </div>
      )}
    </div>
  );
}

// AI Chat Tab
function ChatTab({ selectedCase }) {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: userMessage,
        session_id: sessionId,
        case_id: selectedCase?.id
      });
      
      setSessionId(response.session_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fadeIn" data-testid="chat-tab">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>AI Legal Assistant</h1>
          <p className="text-gray-400 text-sm">Powered by GPT-5.2 • Specialized in CPS Defense</p>
        </div>
        {selectedCase && (
          <span className="px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-full text-sm text-red-400">
            Case: {selectedCase.title}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-800/30 border border-gray-700 rounded-xl p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Legal Assistant</h3>
            <p className="text-gray-400 mb-4">Ask me anything about CPS cases, your rights, or defense strategies</p>
            <div className="grid gap-2 max-w-md mx-auto">
              {[
                "What are my constitutional rights in a CPS case?",
                "How do I request discovery documents?",
                "What violations should I look for in CPS reports?"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl p-4 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-red-600/20 border border-red-600/30' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700/50 border border-gray-600 p-4 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your rights, CPS procedures, defense strategies..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600"
          disabled={loading}
          data-testid="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-punisher px-6"
          data-testid="chat-send-btn"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

// Violations Tab
function ViolationsTab({ selectedCase }) {
  const { api } = useAuth();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    violation_type: '',
    description: '',
    severity: 'medium',
    date: '',
    statute_reference: ''
  });

  const violationTypes = [
    '4th Amendment - Unreasonable Search',
    '5th Amendment - Due Process',
    '6th Amendment - Right to Counsel',
    '14th Amendment - Equal Protection',
    'Procedural Error',
    'Evidence Tampering',
    'False Statements',
    'Failure to Notify',
    'Improper Removal',
    'Policy Violation',
    'Discovery Violation',
    'Other'
  ];

  useEffect(() => {
    if (selectedCase) {
      loadViolations();
    }
  }, [selectedCase]);

  const loadViolations = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/violations/${selectedCase.id}`);
      setViolations(data.violations || []);
    } catch (error) {
      console.error('Failed to load violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }
    
    setLoading(true);
    try {
      const newViolation = await api.post('/api/violations', {
        ...formData,
        case_id: selectedCase.id
      });
      setViolations([...violations, newViolation]);
      setShowAdd(false);
      setFormData({ violation_type: '', description: '', severity: 'medium', date: '', statute_reference: '' });
      toast.success('Violation added!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="violations-tab">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case from "My Cases" to track violations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="violations-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Violation Tracker</h1>
          <p className="text-gray-400">Case: {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Violation
        </button>
      </div>

      {/* Add Violation Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Violation</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Violation Type*</label>
                <select
                  value={formData.violation_type}
                  onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  required
                >
                  <option value="">Select Type</option>
                  {violationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date (if known)</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description*</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-24"
                  placeholder="Describe the violation in detail"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Statute Reference</label>
                <input
                  type="text"
                  value={formData.statute_reference}
                  onChange={(e) => setFormData({ ...formData, statute_reference: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="e.g., 4th Amendment, State Code § 123"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-punisher">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Violation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Violations List */}
      {violations.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Violations Tracked</h3>
          <p className="text-gray-400 mb-4">Start tracking potential violations in your case</p>
        </div>
      ) : (
        <div className="space-y-4">
          {violations.map((v) => (
            <div key={v.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{v.violation_type}</h3>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  v.severity === 'critical' ? 'bg-red-600/20 text-red-400' :
                  v.severity === 'high' ? 'bg-orange-600/20 text-orange-400' :
                  v.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {v.severity}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{v.description}</p>
              {v.statute_reference && (
                <p className="text-sm text-purple-400">📜 {v.statute_reference}</p>
              )}
              {v.date && (
                <p className="text-sm text-gray-500 mt-2">Date: {v.date}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Documents Tab
function DocumentsTab({ selectedCase }) {
  const { api } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('upload');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const documentTypes = [
    { id: 'motion_to_dismiss', name: 'Motion to Dismiss' },
    { id: 'motion_discovery', name: 'Motion for Discovery' },
    { id: 'motion_due_process', name: 'Motion for Due Process Hearing' },
    { id: 'demand_letter', name: 'Demand Letter to CPS' },
    { id: 'objection_letter', name: 'Written Objection' },
    { id: 'affidavit', name: 'Affidavit/Declaration' },
    { id: 'case_plan_objection', name: 'Case Plan Objection' },
    { id: 'motion_reunification', name: 'Motion for Reunification' },
    { id: 'emergency_motion', name: 'Emergency Motion' },
    { id: 'complaint_1983', name: 'Section 1983 Civil Rights Complaint' },
  ];

  useEffect(() => {
    if (selectedCase) {
      loadDocuments();
    }
  }, [selectedCase]);

  const loadDocuments = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/documents/${selectedCase.id}`);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    const allowedTypes = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      toast.error(`File type not supported. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('case_id', selectedCase.id);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('doc_type', 'cps_document');
      formData.append('auto_analyze', 'true');

      const token = localStorage.getItem('cps_token');
      
      setUploadProgress('Uploading and analyzing with AI... This may take 30-60 seconds.');
      
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      
      setDocuments([result, ...documents]);
      setSelectedDocument(result);
      
      const violationsCreated = result.analysis_result?.violations_created || 0;
      const timelineCreated = result.analysis_result?.timeline_events_created || 0;
      
      toast.success(
        `Document analyzed! Found ${violationsCreated} violations and ${timelineCreated} timeline events.`,
        { duration: 5000 }
      );
      
      setActiveSubTab('analysis');
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const reanalyzeDocument = async (docId) => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('cps_token');
      const response = await fetch(`${API_URL}/api/documents/${docId}/reanalyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Reanalysis failed');
      
      const result = await response.json();
      toast.success(`Reanalysis complete! Found ${result.violations_created} new violations.`);
      loadDocuments();
    } catch (error) {
      toast.error('Failed to reanalyze document');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateDocument = async (docType) => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }
    
    setGenerating(true);
    setSelectedDocType(docType);
    
    try {
      const response = await api.post('/api/ai/generate-document', {
        case_id: selectedCase.id,
        document_type: docType
      });
      
      const newDoc = await api.post('/api/documents', {
        case_id: selectedCase.id,
        title: documentTypes.find(d => d.id === docType)?.name || docType,
        content: response.document,
        doc_type: docType
      });
      
      setDocuments([newDoc, ...documents]);
      setSelectedDocument(newDoc);
      toast.success('Document generated successfully!');
      setActiveSubTab('analysis');
    } catch (error) {
      toast.error('Failed to generate document');
    } finally {
      setGenerating(false);
      setSelectedDocType('');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="documents-tab">
        <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to upload and analyze documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="documents-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Document Analysis Center
        </h1>
        <p className="text-gray-400">Upload CPS documents for AI-powered analysis - {selectedCase.title}</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {[
          { id: 'upload', label: 'Upload & Analyze', icon: Upload },
          { id: 'generate', label: 'Generate Documents', icon: FileText },
          { id: 'analysis', label: 'View Analysis', icon: Brain },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeSubTab === tab.id 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeSubTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive 
                ? 'border-red-500 bg-red-500/10' 
                : 'border-gray-600 hover:border-red-600/50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-red-500 animate-spin" />
                <p className="text-lg font-semibold text-red-400">{uploadProgress}</p>
                <p className="text-gray-400">AI is analyzing your document for violations and timeline events...</p>
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop Your CPS Documents Here</h3>
                <p className="text-gray-400 mb-4">
                  Upload petitions, safety plans, court orders, letters, or any CPS documents
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported: PDF, TXT, PNG, JPG, DOC, DOCX (Max 10MB)
                </p>
                <label className="btn-punisher cursor-pointer inline-block">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                    data-testid="file-upload-input"
                  />
                  <Upload className="w-5 h-5 inline mr-2" />
                  Select File to Upload
                </label>
              </>
            )}
          </div>

          {/* What AI Will Find */}
          <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-500" />
              What THE CPS PUNISHER Will Analyze
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: AlertTriangle, title: 'Constitutional Violations', desc: '4th, 5th, 6th, 14th Amendment violations' },
                { icon: Clock, title: 'Timeline Events', desc: 'Every date and deadline extracted' },
                { icon: Users, title: 'Named Individuals', desc: 'Caseworkers, judges, attorneys identified' },
                { icon: Shield, title: 'Defense Opportunities', desc: 'Legal arguments and weaknesses' },
                { icon: FileText, title: 'Key Allegations', desc: 'What CPS claims against you' },
                { icon: Gavel, title: 'Motions to File', desc: 'Recommended legal actions' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Documents List */}
          {documents.filter(d => d.source === 'upload').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
              <div className="space-y-3">
                {documents.filter(d => d.source === 'upload').map(doc => (
                  <div 
                    key={doc.id} 
                    className={`bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedDocument?.id === doc.id ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => {
                      setSelectedDocument(doc);
                      setActiveSubTab('analysis');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">{doc.title}</h4>
                          <p className="text-sm text-gray-400">
                            {doc.filename} • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.analysis && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            Analyzed
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setActiveSubTab('analysis');
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          View Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Tab */}
      {activeSubTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-300">
              Generate professional legal documents based on your case data, violations, and timeline. 
              AI will include relevant case law and {selectedCase.state} statutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => generateDocument(doc.id)}
                disabled={generating}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-red-600/50 transition-all text-left"
                data-testid={`generate-${doc.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  {generating && selectedDocType === doc.id && (
                    <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                  )}
                </div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-gray-400 mt-1">Generate with AI</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeSubTab === 'analysis' && (
        <div className="space-y-6">
          {selectedDocument ? (
            <DocumentAnalysisView 
              document={selectedDocument} 
              onReanalyze={() => reanalyzeDocument(selectedDocument.id)}
              analyzing={analyzing}
            />
          ) : (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Document Selected</h3>
              <p className="text-gray-400">Upload a document or select one from the list to view its analysis</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Document Analysis View Component
function DocumentAnalysisView({ document, onReanalyze, analyzing }) {
  const analysis = document.analysis_result?.analysis || document.analysis;
  
  if (!analysis) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
        <p className="text-gray-400 mb-4">This document hasn't been analyzed yet</p>
        <button 
          onClick={onReanalyze}
          disabled={analyzing}
          className="btn-punisher"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Analyzing...</>
          ) : (
            <><Brain className="w-5 h-5 inline mr-2" /> Analyze Now</>
          )}
        </button>
      </div>
    );
  }

  const data = typeof analysis === 'string' ? { raw_analysis: analysis } : analysis;

  return (
    <div className="space-y-6" data-testid="document-analysis">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{document.title}</h2>
          <p className="text-gray-400">{document.filename}</p>
        </div>
        <button 
          onClick={onReanalyze}
          disabled={analyzing}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          Re-analyze
        </button>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 border border-blue-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Document Summary
          </h3>
          <p className="text-gray-300">{data.summary}</p>
          {data.document_type && (
            <p className="text-sm text-blue-400 mt-2">Document Type: {data.document_type}</p>
          )}
        </div>
      )}

      {/* Violations Found */}
      {data.violations && data.violations.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Violations Identified ({data.violations.length})
          </h3>
          <div className="space-y-4">
            {data.violations.map((v, i) => (
              <div key={i} className="bg-black/30 rounded-lg p-4 border-l-4 border-red-500">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      v.severity === 'high' ? 'bg-red-600' : 
                      v.severity === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {v.severity?.toUpperCase() || 'MEDIUM'}
                    </span>
                    <h4 className="font-semibold mt-2">{v.type?.replace(/_/g, ' ').toUpperCase()}</h4>
                  </div>
                </div>
                <p className="text-gray-300 mt-2">{v.description}</p>
                {v.legal_basis && (
                  <p className="text-sm text-red-400 mt-2">Legal Basis: {v.legal_basis}</p>
                )}
                {v.defense_strategy && (
                  <p className="text-sm text-green-400 mt-1">Defense: {v.defense_strategy}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Allegations */}
      {data.key_allegations && data.key_allegations.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-yellow-500" />
            Key Allegations Against You
          </h3>
          <ul className="space-y-2">
            {data.key_allegations.map((allegation, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-yellow-500">•</span>
                <span className="text-gray-300">{allegation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline Events */}
      {data.timeline_events && data.timeline_events.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Timeline Events Extracted ({data.timeline_events.length})
          </h3>
          <div className="space-y-3">
            {data.timeline_events.map((event, i) => (
              <div key={i} className="flex items-start gap-4 border-l-2 border-purple-500/50 pl-4">
                <div className="text-purple-400 font-mono text-sm whitespace-nowrap">
                  {event.date || 'Unknown'}
                </div>
                <div>
                  <p className="text-gray-200">{event.event}</p>
                  {event.significance && (
                    <p className="text-sm text-gray-400 mt-1">{event.significance}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Named Individuals */}
      {data.named_individuals && data.named_individuals.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Named Individuals
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.named_individuals.map((person, i) => (
              <div key={i} className="bg-black/30 rounded-lg p-3">
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-blue-400">{person.role}</p>
                {person.actions && <p className="text-sm text-gray-400 mt-1">{person.actions}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defense Opportunities & Recommended Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.defense_opportunities && data.defense_opportunities.length > 0 && (
          <div className="bg-gradient-to-r from-green-900/30 to-gray-900 border border-green-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Defense Opportunities
            </h3>
            <ul className="space-y-2">
              {data.defense_opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.recommended_actions && data.recommended_actions.length > 0 && (
          <div className="bg-gradient-to-r from-orange-900/30 to-gray-900 border border-orange-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Recommended Actions
            </h3>
            <ul className="space-y-2">
              {data.recommended_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">{i + 1}.</span>
                  <span className="text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Motions to Consider */}
      {data.motions_to_consider && data.motions_to_consider.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-red-500" />
            Motions to Consider Filing
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.motions_to_consider.map((motion, i) => (
              <span key={i} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
                {motion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw Analysis Fallback */}
      {data.raw_analysis && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Full Analysis</h3>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm">{data.raw_analysis}</pre>
        </div>
      )}

      {/* Red Flags */}
      {data.red_flags && data.red_flags.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Red Flags & Concerns
          </h3>
          <ul className="space-y-2">
            {data.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500">⚠</span>
                <span className="text-gray-300">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Timeline Tab
function TimelineTab({ selectedCase }) {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    event_type: 'general'
  });

  useEffect(() => {
    if (selectedCase) {
      loadEvents();
    }
  }, [selectedCase]);

  const loadEvents = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/timeline/${selectedCase.id}`);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    
    setLoading(true);
    try {
      const newEvent = await api.post('/api/timeline', {
        ...formData,
        case_id: selectedCase.id
      });
      setEvents([...events, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowAdd(false);
      setFormData({ title: '', description: '', date: '', event_type: 'general' });
      toast.success('Timeline event added!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="timeline-tab">
        <Clock className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to build your timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="timeline-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Case Timeline</h1>
          <p className="text-gray-400">{selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add Timeline Event</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="e.g., Initial CPS Contact"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date*</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  <option value="general">General</option>
                  <option value="contact">CPS Contact</option>
                  <option value="hearing">Court Hearing</option>
                  <option value="filing">Court Filing</option>
                  <option value="violation">Violation</option>
                  <option value="removal">Removal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-24"
                  placeholder="Describe what happened"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-punisher">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <Clock className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
          <p className="text-gray-400">Start building your case timeline</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />
          <div className="space-y-6">
            {events.map((event, i) => (
              <div key={event.id} className="relative flex gap-6 pl-4">
                <div className="absolute left-6 w-4 h-4 rounded-full bg-red-600 border-4 border-gray-900" />
                <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl p-4 ml-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-red-400">{event.date}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{event.event_type}</span>
                  </div>
                  {event.description && (
                    <p className="text-gray-400 mt-2 text-sm">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Legal Research Tab
function ResearchTab() {
  const { api } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/ai/legal-research', {
        query,
        state: state || null
      });
      setResults(response.research_results);
    } catch (error) {
      toast.error('Research failed');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="research-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Legal Research</h1>
        <p className="text-gray-400">AI-powered search of statutes, case law, and CPS policies</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search statutes, case law, CPS policies..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
            data-testid="research-input"
          />
          <button type="submit" disabled={loading} className="btn-punisher px-8" data-testid="research-btn">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {/* Quick searches */}
      <div className="flex flex-wrap gap-2">
        {[
          "Emergency removal timeframes",
          "Discovery rights in CPS",
          "Parental rights termination grounds",
          "4th Amendment CPS violations"
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => setQuery(q)}
            className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-full text-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Research Results</h2>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-300">{results}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Law Library Tab
function LawLibraryTab() {
  const { api } = useAuth();
  const [selectedState, setSelectedState] = useState('');
  const [stateInfo, setStateInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const states = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  ];

  const loadStateInfo = async (code) => {
    setSelectedState(code);
    setLoading(true);
    try {
      const response = await api.get(`/api/law-library/${code}`);
      setStateInfo(response.law_info);
    } catch (error) {
      toast.error('Failed to load state information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="library-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Law Library</h1>
        <p className="text-gray-400">CPS statutes, codes, and policies for all 50 states</p>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {states.map((state) => (
          <button
            key={state.code}
            onClick={() => loadStateInfo(state.code)}
            className={`p-3 rounded-lg text-sm font-semibold transition-all ${
              selectedState === state.code
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={state.name}
          >
            {state.code}
          </button>
        ))}
      </div>

      {/* State Info */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      )}

      {stateInfo && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            {states.find(s => s.code === selectedState)?.name} CPS Law
          </h2>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-300">{stateInfo}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar Tab
function CalendarTab() {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: 'general'
  });

  const eventTypes = [
    { value: 'court_hearing', label: 'Court Hearing', color: 'bg-red-500' },
    { value: 'deadline', label: 'Filing Deadline', color: 'bg-orange-500' },
    { value: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
    { value: 'reminder', label: 'Reminder', color: 'bg-purple-500' },
    { value: 'general', label: 'General', color: 'bg-gray-500' },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.get('/api/calendar');
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newEvent = await api.post('/api/calendar', formData);
      setEvents([...events, newEvent].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setShowAdd(false);
      setFormData({ title: '', description: '', event_date: '', event_time: '', event_type: 'general' });
      toast.success('Event added to calendar!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/calendar/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getEventColor = (type) => eventTypes.find(t => t.value === type)?.color || 'bg-gray-500';

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="calendar-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Calendar</h1>
          <p className="text-gray-400">Track court dates, deadlines, and important events</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add Calendar Event</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="e.g., Court Hearing"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date*</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-20"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-punisher">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
          <p className="text-gray-400 mb-4">Add court dates, deadlines, and reminders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`w-2 rounded-full ${getEventColor(event.event_type)}`} />
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-red-400 text-sm">
                    {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {event.event_time && ` at ${event.event_time}`}
                  </p>
                  {event.description && <p className="text-gray-400 text-sm mt-1">{event.description}</p>}
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-700 rounded text-xs">
                    {eventTypes.find(t => t.value === event.event_type)?.label || 'General'}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(event.id)} className="text-gray-500 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Pricing Tab
function PricingTab() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const tiers = [
    {
      id: 'essential',
      name: 'Essential',
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      monthly: 39,
      annual: 390,
      description: 'Perfect for parents starting their defense',
      features: [
        '25 document uploads/month',
        'AI document analysis',
        'Defense strategy suggestions',
        'Motion templates',
        'Timeline builder',
        'Community forum access'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      monthly: 79,
      annual: 790,
      popular: true,
      description: 'Complete legal defense toolkit',
      features: [
        'UNLIMITED document uploads',
        'Advanced AI analysis',
        'AI document generation',
        'Legal research hub',
        'Case law access',
        '7-day free trial',
        'Priority support'
      ]
    },
    {
      id: 'attorney',
      name: 'Attorney Suite',
      icon: Scale,
      color: 'from-amber-400 to-amber-600',
      monthly: 299,
      annual: 2990,
      description: 'Professional tools for attorneys',
      features: [
        'Everything in Professional',
        '500 AI credits/month',
        'Multi-client management',
        'Federal litigation tools',
        'Section 1983 generator',
        'White-label reports',
        'Priority phone support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building2,
      color: 'from-rose-400 to-rose-600',
      monthly: 999,
      annual: 9990,
      description: 'For law firms & organizations',
      features: [
        'Everything in Attorney',
        'Unlimited team members',
        'Custom branding',
        'API access',
        'Dedicated support',
        '24/7 priority support'
      ]
    }
  ];

  const handleSubscribe = async (tier) => {
    setLoading(true);
    try {
      const response = await api.post('/api/stripe/create-checkout', {
        tier: tier.id,
        billing_period: billingPeriod,
        origin_url: window.location.origin
      });
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="pricing-tab">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>Upgrade Your Plan</h1>
        <p className="text-gray-400">Current plan: <span className="text-red-500 font-semibold">{user?.tier?.toUpperCase() || 'FREE'}</span></p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-full p-1 flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === 'monthly' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === 'annual' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
          >
            Annual <span className="text-green-400 text-xs ml-1">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-gray-800/50 border rounded-xl p-6 ${tier.popular ? 'border-purple-500 border-2' : 'border-gray-700'}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
              <tier.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
            
            <div className="mb-4">
              <span className="text-4xl font-bold">${billingPeriod === 'monthly' ? tier.monthly : tier.annual}</span>
              <span className="text-gray-400">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <button
              onClick={() => handleSubscribe(tier)}
              disabled={loading || user?.tier === tier.id}
              className={`w-full py-3 rounded-lg font-semibold mb-4 ${
                user?.tier === tier.id
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : tier.popular
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
               user?.tier === tier.id ? 'Current Plan' : 'Subscribe'}
            </button>

            <div className="space-y-2">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <div className="flex justify-center gap-6">
          <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Secure Payment</span>
          <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Encrypted</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Cancel Anytime</span>
        </div>
        <p>All plans include a 30-day money-back guarantee</p>
      </div>
    </div>
  );
}

// Evidence Tab
function EvidenceTab({ selectedCase }) {
  const { api } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    evidence_type: 'document',
    date_obtained: '',
    source: '',
    supports_defense: true
  });

  const evidenceTypes = [
    { id: 'document', label: 'Document' },
    { id: 'photo', label: 'Photo/Image' },
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio Recording' },
    { id: 'testimony', label: 'Testimony/Statement' },
    { id: 'medical', label: 'Medical Record' },
    { id: 'school', label: 'School Record' },
    { id: 'character', label: 'Character Reference' },
    { id: 'expert', label: 'Expert Opinion' },
    { id: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (selectedCase) loadEvidence();
  }, [selectedCase]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/evidence/${selectedCase.id}`);
      setEvidence(data.evidence || []);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newEvidence = await api.post('/api/evidence', {
        ...formData,
        case_id: selectedCase.id
      });
      setEvidence([newEvidence, ...evidence]);
      setShowAdd(false);
      setFormData({ title: '', description: '', evidence_type: 'document', date_obtained: '', source: '', supports_defense: true });
      toast.success('Evidence added!');
    } catch (error) {
      toast.error('Failed to add evidence');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="evidence-tab">
        <Eye className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to manage evidence</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="evidence-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Evidence Tracker</h1>
          <p className="text-gray-400">Manage evidence for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Evidence
        </button>
      </div>

      {/* Add Evidence Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Evidence</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={formData.evidence_type}
                  onChange={(e) => setFormData({...formData, evidence_type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {evidenceTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date Obtained</label>
                  <input
                    type="date"
                    value={formData.date_obtained}
                    onChange={(e) => setFormData({...formData, date_obtained: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Source</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Where from?"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.supports_defense}
                  onChange={(e) => setFormData({...formData, supports_defense: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm">This evidence supports the defense</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Add Evidence</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : evidence.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Eye className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No evidence added yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {evidence.map(item => (
            <div key={item.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${item.supports_defense ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    {item.supports_defense ? 'SUPPORTS DEFENSE' : 'AGAINST'}
                  </span>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{item.evidence_type}</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{item.description}</p>
              {item.source && <p className="text-xs text-gray-500 mt-2">Source: {item.source}</p>}
              {item.date_obtained && <p className="text-xs text-gray-500">Obtained: {item.date_obtained}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Communications Tab
function CommunicationsTab({ selectedCase }) {
  const { api } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    contact_type: 'phone',
    contact_with: '',
    date: '',
    summary: '',
    favorable: null
  });

  const contactTypes = [
    { id: 'phone', label: 'Phone Call' },
    { id: 'email', label: 'Email' },
    { id: 'in_person', label: 'In Person' },
    { id: 'text', label: 'Text Message' },
    { id: 'letter', label: 'Letter' },
    { id: 'court', label: 'Court Proceeding' }
  ];

  useEffect(() => {
    if (selectedCase) loadCommunications();
  }, [selectedCase]);

  const loadCommunications = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/communications/${selectedCase.id}`);
      setCommunications(data.communications || []);
    } catch (error) {
      console.error('Failed to load communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newComm = await api.post('/api/communications', {
        ...formData,
        case_id: selectedCase.id
      });
      setCommunications([newComm, ...communications]);
      setShowAdd(false);
      setFormData({ contact_type: 'phone', contact_with: '', date: '', summary: '', favorable: null });
      toast.success('Communication logged!');
    } catch (error) {
      toast.error('Failed to log communication');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="communications-tab">
        <MessageSquare className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to log communications</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="communications-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Communication Log</h1>
          <p className="text-gray-400">Track all communications for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Log Communication
        </button>
      </div>

      {/* Add Communication Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Log Communication</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={formData.contact_type}
                    onChange={(e) => setFormData({...formData, contact_type: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {contactTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contact With</label>
                <input
                  type="text"
                  value={formData.contact_with}
                  onChange={(e) => setFormData({...formData, contact_with: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Caseworker Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  placeholder="What was discussed?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Was this favorable?</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, favorable: true})}
                    className={`flex-1 py-2 rounded-lg ${formData.favorable === true ? 'bg-green-600' : 'bg-gray-700'}`}>
                    Favorable
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, favorable: false})}
                    className={`flex-1 py-2 rounded-lg ${formData.favorable === false ? 'bg-red-600' : 'bg-gray-700'}`}>
                    Unfavorable
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, favorable: null})}
                    className={`flex-1 py-2 rounded-lg ${formData.favorable === null ? 'bg-gray-600' : 'bg-gray-700'}`}>
                    Neutral
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Log Communication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communications List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : communications.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No communications logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {communications.map(comm => (
            <div key={comm.id} className={`bg-gray-800/50 border-l-4 rounded-r-xl p-4 ${
              comm.favorable === true ? 'border-green-500' : comm.favorable === false ? 'border-red-500' : 'border-gray-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{comm.contact_type}</span>
                  <span className="text-gray-400">{comm.date}</span>
                </div>
                {comm.favorable !== null && (
                  <span className={`px-2 py-1 rounded text-xs ${comm.favorable ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    {comm.favorable ? 'FAVORABLE' : 'UNFAVORABLE'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{comm.contact_with}</h3>
              <p className="text-gray-400 text-sm mt-1">{comm.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Court Filings Tab
function CourtFilingsTab({ selectedCase }) {
  const { api } = useAuth();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    filing_type: 'motion',
    title: '',
    date_filed: '',
    status: 'pending',
    content: ''
  });

  const filingTypes = [
    { id: 'motion', label: 'Motion' },
    { id: 'petition', label: 'Petition' },
    { id: 'answer', label: 'Answer/Response' },
    { id: 'objection', label: 'Objection' },
    { id: 'brief', label: 'Brief' },
    { id: 'order', label: 'Court Order' },
    { id: 'subpoena', label: 'Subpoena' },
    { id: 'notice', label: 'Notice' },
    { id: 'appeal', label: 'Appeal' },
    { id: 'other', label: 'Other' }
  ];

  const statusTypes = [
    { id: 'pending', label: 'Pending', color: 'bg-yellow-600/20 text-yellow-400' },
    { id: 'filed', label: 'Filed', color: 'bg-blue-600/20 text-blue-400' },
    { id: 'granted', label: 'Granted', color: 'bg-green-600/20 text-green-400' },
    { id: 'denied', label: 'Denied', color: 'bg-red-600/20 text-red-400' },
    { id: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-600/20 text-gray-400' }
  ];

  useEffect(() => {
    if (selectedCase) loadFilings();
  }, [selectedCase]);

  const loadFilings = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/court-filings/${selectedCase.id}`);
      setFilings(data.filings || []);
    } catch (error) {
      console.error('Failed to load filings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newFiling = await api.post('/api/court-filings', {
        ...formData,
        case_id: selectedCase.id
      });
      setFilings([newFiling, ...filings]);
      setShowAdd(false);
      setFormData({ filing_type: 'motion', title: '', date_filed: '', status: 'pending', content: '' });
      toast.success('Court filing added!');
    } catch (error) {
      toast.error('Failed to add filing');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="courtfilings-tab">
        <Gavel className="w-12 h-12 mx-auto text-purple-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to manage court filings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courtfilings-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Court Filings</h1>
          <p className="text-gray-400">Track all filings for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Filing
        </button>
      </div>

      {/* Add Filing Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Court Filing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Filing Type</label>
                  <select
                    value={formData.filing_type}
                    onChange={(e) => setFormData({...formData, filing_type: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {filingTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {statusTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Motion to Dismiss"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date Filed</label>
                <input
                  type="date"
                  value={formData.date_filed}
                  onChange={(e) => setFormData({...formData, date_filed: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content/Notes</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  placeholder="Filing content or notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Add Filing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filings List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : filings.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Gavel className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No court filings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filings.map(filing => {
            const statusInfo = statusTypes.find(s => s.id === filing.status) || statusTypes[0];
            return (
              <div key={filing.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Gavel className="w-5 h-5 text-purple-500" />
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs uppercase">{filing.filing_type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
                <h3 className="font-semibold text-lg">{filing.title}</h3>
                {filing.date_filed && <p className="text-sm text-gray-400 mt-1">Filed: {filing.date_filed}</p>}
                {filing.content && <p className="text-gray-400 text-sm mt-2">{filing.content}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Judge Watch Tab
function JudgeWatchTab({ selectedCase }) {
  const { api } = useAuth();
  const [judgeResearch, setJudgeResearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    judge_name: '',
    court: '',
    research_notes: '',
    judicial_philosophy: '',
    known_rulings: []
  });
  const [rulingInput, setRulingInput] = useState('');

  useEffect(() => {
    if (selectedCase) loadJudgeResearch();
  }, [selectedCase]);

  const loadJudgeResearch = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/judge-research/${selectedCase.id}`);
      setJudgeResearch(data.judge_research);
    } catch (error) {
      console.error('Failed to load judge research:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchJudge = async (name) => {
    if (!name || name.length < 3) return;
    setSearching(true);
    try {
      const data = await api.get(`/api/courtlistener/judges?name=${encodeURIComponent(name)}`);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const research = await api.post('/api/judge-research', {
        ...formData,
        case_id: selectedCase.id
      });
      setJudgeResearch(research);
      setShowAdd(false);
      toast.success('Judge research saved!');
    } catch (error) {
      toast.error('Failed to save research');
    }
  };

  const addRuling = () => {
    if (rulingInput.trim()) {
      setFormData({...formData, known_rulings: [...formData.known_rulings, rulingInput.trim()]});
      setRulingInput('');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="judgewatch-tab">
        <Scale className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to research the judge</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="judgewatch-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Judge Watch</h1>
          <p className="text-gray-400">Research your judge for {selectedCase.title}</p>
        </div>
        {!judgeResearch && (
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Add Judge Research
          </button>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Judge Research</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Judge Name</label>
                  <input
                    type="text"
                    value={formData.judge_name}
                    onChange={(e) => { setFormData({...formData, judge_name: e.target.value}); searchJudge(e.target.value); }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Full name"
                    required
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
                      {searchResults.slice(0, 5).map((judge, i) => (
                        <button key={i} type="button"
                          onClick={() => { setFormData({...formData, judge_name: judge.name_full || judge.name}); setSearchResults([]); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm">
                          {judge.name_full || judge.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Court</label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => setFormData({...formData, court: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="e.g., Travis County Family Court"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Judicial Philosophy</label>
                <textarea
                  value={formData.judicial_philosophy}
                  onChange={(e) => setFormData({...formData, judicial_philosophy: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20"
                  placeholder="What is their general approach? Pro-CPS? Pro-reunification?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Research Notes</label>
                <textarea
                  value={formData.research_notes}
                  onChange={(e) => setFormData({...formData, research_notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  placeholder="Any important information about this judge..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Known Rulings</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rulingInput}
                    onChange={(e) => setRulingInput(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Add a known ruling..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRuling())}
                  />
                  <button type="button" onClick={addRuling} className="px-4 py-2 bg-gray-600 rounded-lg">Add</button>
                </div>
                {formData.known_rulings.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.known_rulings.map((ruling, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm flex items-center gap-1">
                        {ruling}
                        <button type="button" onClick={() => setFormData({...formData, known_rulings: formData.known_rulings.filter((_, j) => j !== i)})}
                          className="text-red-400 hover:text-red-300">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Save Research</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Judge Research Display */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : judgeResearch ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-900/30 to-gray-900 border border-yellow-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Scale className="w-8 h-8 text-yellow-500" />
                  {judgeResearch.judge_name}
                </h2>
                {judgeResearch.court && <p className="text-gray-400 mt-1">{judgeResearch.court}</p>}
              </div>
              <button onClick={() => { setFormData(judgeResearch); setShowAdd(true); }} className="px-3 py-1 bg-gray-700 rounded text-sm">
                <Edit2 className="w-4 h-4 inline mr-1" /> Edit
              </button>
            </div>
          </div>

          {judgeResearch.judicial_philosophy && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> Judicial Philosophy
              </h3>
              <p className="text-gray-300">{judgeResearch.judicial_philosophy}</p>
            </div>
          )}

          {judgeResearch.research_notes && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Research Notes
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">{judgeResearch.research_notes}</p>
            </div>
          )}

          {judgeResearch.known_rulings && judgeResearch.known_rulings.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-500" /> Known Rulings
              </h3>
              <ul className="space-y-2">
                {judgeResearch.known_rulings.map((ruling, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span className="text-gray-300">{ruling}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Scale className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No judge research yet for this case</p>
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Add Judge Research
          </button>
        </div>
      )}
    </div>
  );
}

// Defense Strategy Tab
function DefenseStrategyTab({ selectedCase }) {
  const { api } = useAuth();
  const [strategies, setStrategies] = useState([]);
  const [generatedStrategy, setGeneratedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    legal_basis: '',
    case_law_support: []
  });

  useEffect(() => {
    if (selectedCase) loadStrategies();
  }, [selectedCase]);

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/strategies/${selectedCase.id}`);
      setStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    setGenerating(true);
    try {
      const data = await api.post(`/api/ai/defense-strategy?case_id=${selectedCase.id}`);
      setGeneratedStrategy(data);
      toast.success('Defense strategy generated!');
    } catch (error) {
      toast.error('Failed to generate strategy');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStrategy = await api.post('/api/strategies', {
        ...formData,
        case_id: selectedCase.id
      });
      setStrategies([newStrategy, ...strategies]);
      setShowAdd(false);
      setFormData({ title: '', description: '', priority: 'medium', legal_basis: '', case_law_support: [] });
      toast.success('Strategy added!');
    } catch (error) {
      toast.error('Failed to add strategy');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="strategy-tab">
        <Shield className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to build defense strategies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="strategy-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Defense Strategy</h1>
          <p className="text-gray-400">Build your defense for {selectedCase.title}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateStrategy} disabled={generating} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            AI Generate Strategy
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Add Strategy
          </button>
        </div>
      </div>

      {/* AI Generated Strategy */}
      {generatedStrategy && (
        <div className="bg-gradient-to-r from-purple-900/30 to-gray-900 border border-purple-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI-Generated Defense Strategy
          </h3>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg overflow-auto max-h-96">
              {generatedStrategy.strategy}
            </pre>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Generated: {new Date(generatedStrategy.generated_at).toLocaleString()} | 
            Analyzed: {generatedStrategy.violations_analyzed} violations, {generatedStrategy.events_analyzed} events
          </p>
        </div>
      )}

      {/* Add Strategy Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Defense Strategy</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Strategy Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Fourth Amendment Challenge"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24"
                  placeholder="Describe the strategy..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Legal Basis</label>
                <input
                  type="text"
                  value={formData.legal_basis}
                  onChange={(e) => setFormData({...formData, legal_basis: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Fourth Amendment, State Statute §123.45"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Add Strategy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Strategies List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : strategies.length === 0 && !generatedStrategy ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Shield className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No defense strategies yet</p>
          <button onClick={generateStrategy} disabled={generating} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg">
            {generating ? <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> : <Brain className="w-5 h-5 inline mr-2" />}
            Generate AI Strategy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map(strategy => (
            <div key={strategy.id} className={`bg-gray-800/50 border-l-4 rounded-r-xl p-4 ${
              strategy.priority === 'high' ? 'border-red-500' : strategy.priority === 'medium' ? 'border-yellow-500' : 'border-gray-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  strategy.priority === 'high' ? 'bg-red-600/20 text-red-400' : 
                  strategy.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {strategy.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <h3 className="font-semibold text-lg">{strategy.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{strategy.description}</p>
              {strategy.legal_basis && (
                <p className="text-sm text-green-400 mt-2">Legal Basis: {strategy.legal_basis}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Criminal Case Tab
function CriminalCaseTab({ selectedCase }) {
  const { api } = useAuth();
  const [criminalCase, setCriminalCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    criminal_case_number: '',
    court: '',
    prosecutor: '',
    defense_attorney: '',
    bond_status: '',
    next_court_date: '',
    relation_to_cps: '',
    charges: []
  });
  const [chargeInput, setChargeInput] = useState({ charge: '', statute: '', severity: 'misdemeanor' });

  useEffect(() => {
    if (selectedCase) loadCriminalCase();
  }, [selectedCase]);

  const loadCriminalCase = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/criminal-case/${selectedCase.id}`);
      setCriminalCase(data.criminal_case);
    } catch (error) {
      console.error('Failed to load criminal case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post('/api/criminal-case', {
        ...formData,
        case_id: selectedCase.id
      });
      setCriminalCase(data);
      setShowAdd(false);
      toast.success('Criminal case info saved!');
    } catch (error) {
      toast.error('Failed to save criminal case');
    }
  };

  const addCharge = () => {
    if (chargeInput.charge.trim()) {
      setFormData({...formData, charges: [...formData.charges, {...chargeInput}]});
      setChargeInput({ charge: '', statute: '', severity: 'misdemeanor' });
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="criminal-tab">
        <AlertTriangle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to link criminal charges</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="criminal-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Criminal Case Link</h1>
          <p className="text-gray-400">Track related criminal charges for {selectedCase.title}</p>
        </div>
        {!criminalCase && (
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Link Criminal Case
          </button>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Link Criminal Case</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={formData.criminal_case_number}
                    onChange={(e) => setFormData({...formData, criminal_case_number: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Court</label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => setFormData({...formData, court: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prosecutor</label>
                  <input
                    type="text"
                    value={formData.prosecutor}
                    onChange={(e) => setFormData({...formData, prosecutor: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Defense Attorney</label>
                  <input
                    type="text"
                    value={formData.defense_attorney}
                    onChange={(e) => setFormData({...formData, defense_attorney: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bond Status</label>
                  <input
                    type="text"
                    value={formData.bond_status}
                    onChange={(e) => setFormData({...formData, bond_status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="e.g., $10,000 bond posted"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Next Court Date</label>
                  <input
                    type="date"
                    value={formData.next_court_date}
                    onChange={(e) => setFormData({...formData, next_court_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Relation to CPS Case</label>
                <textarea
                  value={formData.relation_to_cps}
                  onChange={(e) => setFormData({...formData, relation_to_cps: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20"
                  placeholder="How does this criminal case relate to the CPS case?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Charges</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={chargeInput.charge}
                    onChange={(e) => setChargeInput({...chargeInput, charge: e.target.value})}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Charge description"
                  />
                  <select
                    value={chargeInput.severity}
                    onChange={(e) => setChargeInput({...chargeInput, severity: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="infraction">Infraction</option>
                    <option value="misdemeanor">Misdemeanor</option>
                    <option value="felony">Felony</option>
                  </select>
                  <button type="button" onClick={addCharge} className="px-4 py-2 bg-gray-600 rounded-lg">Add</button>
                </div>
                {formData.charges.length > 0 && (
                  <div className="space-y-2">
                    {formData.charges.map((charge, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                        <span>{charge.charge}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            charge.severity === 'felony' ? 'bg-red-600' : 
                            charge.severity === 'misdemeanor' ? 'bg-yellow-600' : 'bg-gray-600'
                          }`}>{charge.severity}</span>
                          <button type="button" onClick={() => setFormData({...formData, charges: formData.charges.filter((_, j) => j !== i)})}
                            className="text-red-400">&times;</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Save Criminal Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Criminal Case Display */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : criminalCase ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-900/30 to-gray-900 border border-orange-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  Criminal Case #{criminalCase.criminal_case_number || 'N/A'}
                </h2>
                {criminalCase.court && <p className="text-gray-400">{criminalCase.court}</p>}
              </div>
              <button onClick={() => { setFormData(criminalCase); setShowAdd(true); }} className="px-3 py-1 bg-gray-700 rounded text-sm">
                <Edit2 className="w-4 h-4 inline mr-1" /> Edit
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {criminalCase.prosecutor && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Prosecutor</p>
                  <p className="font-medium">{criminalCase.prosecutor}</p>
                </div>
              )}
              {criminalCase.defense_attorney && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Defense Attorney</p>
                  <p className="font-medium">{criminalCase.defense_attorney}</p>
                </div>
              )}
              {criminalCase.bond_status && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Bond Status</p>
                  <p className="font-medium">{criminalCase.bond_status}</p>
                </div>
              )}
              {criminalCase.next_court_date && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Next Court Date</p>
                  <p className="font-medium text-red-400">{criminalCase.next_court_date}</p>
                </div>
              )}
            </div>
          </div>

          {criminalCase.charges && criminalCase.charges.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Charges ({criminalCase.charges.length})</h3>
              <div className="space-y-2">
                {criminalCase.charges.map((charge, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3">
                    <span>{charge.charge}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      charge.severity === 'felony' ? 'bg-red-600' : 
                      charge.severity === 'misdemeanor' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>{charge.severity?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {criminalCase.relation_to_cps && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Relation to CPS Case</h3>
              <p className="text-gray-300">{criminalCase.relation_to_cps}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No linked criminal case</p>
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Link Criminal Case
          </button>
        </div>
      )}
    </div>
  );
}

// Services Tab
function ServicesTab({ selectedCase }) {
  const { api } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    provider: '',
    start_date: '',
    end_date: '',
    status: 'in_progress',
    notes: ''
  });

  const serviceTypes = [
    'Parenting Classes', 'Drug Testing', 'Counseling', 'Therapy', 'Anger Management',
    'Domestic Violence Classes', 'Substance Abuse Treatment', 'Mental Health Evaluation',
    'Home Study', 'Supervised Visitation', 'Family Therapy', 'Other'
  ];

  const statusTypes = [
    { id: 'not_started', label: 'Not Started', color: 'bg-gray-600/20 text-gray-400' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-600/20 text-blue-400' },
    { id: 'completed', label: 'Completed', color: 'bg-green-600/20 text-green-400' },
    { id: 'failed', label: 'Failed/Non-Compliant', color: 'bg-red-600/20 text-red-400' }
  ];

  useEffect(() => {
    if (selectedCase) loadServices();
  }, [selectedCase]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/services/${selectedCase.id}`);
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newService = await api.post('/api/services', {
        ...formData,
        case_id: selectedCase.id
      });
      setServices([newService, ...services]);
      setShowAdd(false);
      setFormData({ service_type: '', provider: '', start_date: '', end_date: '', status: 'in_progress', notes: '' });
      toast.success('Service added!');
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="services-tab">
        <Users className="w-12 h-12 mx-auto text-teal-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to track services</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="services-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Case Plan Services</h1>
          <p className="text-gray-400">Track required services for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Service
        </button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Service Type</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                >
                  <option value="">Select service...</option>
                  {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Provider name/agency"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {statusTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Add Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No services tracked yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map(service => {
            const statusInfo = statusTypes.find(s => s.id === service.status) || statusTypes[1];
            return (
              <div key={service.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
                <h3 className="font-semibold text-lg">{service.service_type}</h3>
                {service.provider && <p className="text-gray-400 text-sm">Provider: {service.provider}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {service.start_date && <span>Start: {service.start_date}</span>}
                  {service.end_date && <span>End: {service.end_date}</span>}
                </div>
                {service.notes && <p className="text-sm text-gray-400 mt-2">{service.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Forum Tab
function ForumTab() {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general' });

  const categories = [
    { id: 'general', label: 'General Discussion' },
    { id: 'legal', label: 'Legal Questions' },
    { id: 'victories', label: 'Victories & Success Stories' },
    { id: 'support', label: 'Support & Encouragement' },
    { id: 'resources', label: 'Resources & Tips' }
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await api.get('/api/forum/posts');
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPost = await api.post('/api/forum/posts', formData);
      setPosts([newPost, ...posts]);
      setShowAdd(false);
      setFormData({ title: '', content: '', category: 'general' });
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="forum-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Community Forum</h1>
          <p className="text-gray-400">Connect with other parents fighting CPS</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> New Post
        </button>
      </div>

      {/* Add Post Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{post.category}</span>
                <span className="text-gray-500 text-sm">{post.author_name}</span>
                <span className="text-gray-600 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-gray-400 mt-2">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Advocates Tab
function AdvocatesTab() {
  const { api } = useAuth();
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    loadAdvocates();
  }, [stateFilter]);

  const loadAdvocates = async () => {
    setLoading(true);
    try {
      const url = stateFilter ? `/api/advocates?state=${stateFilter}` : '/api/advocates';
      const data = await api.get(url);
      setAdvocates(data.advocates || []);
    } catch (error) {
      console.error('Failed to load advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="advocates-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Find Advocates</h1>
          <p className="text-gray-400">Connect with family advocates and attorneys in your state</p>
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
        >
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : advocates.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No advocates listed yet for {stateFilter || 'any state'}</p>
          <p className="text-sm text-gray-500">Check back soon as we grow our directory</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advocates.map(advocate => (
            <div key={advocate.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{advocate.name}</h3>
                  <p className="text-sm text-gray-400">{advocate.type}</p>
                  <p className="text-xs text-gray-500">{advocate.state}</p>
                </div>
              </div>
              {advocate.description && <p className="text-gray-400 text-sm mt-3">{advocate.description}</p>}
              {advocate.contact && <p className="text-blue-400 text-sm mt-2">{advocate.contact}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
