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
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'research', icon: Search, label: 'Legal Research' },
    { id: 'library', icon: BookOpen, label: 'Law Library' },
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
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'research' && <ResearchTab />}
          {activeTab === 'library' && <LawLibraryTab />}
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
  const [generating, setGenerating] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');

  const documentTypes = [
    { id: 'motion_to_dismiss', name: 'Motion to Dismiss' },
    { id: 'motion_discovery', name: 'Motion for Discovery' },
    { id: 'motion_due_process', name: 'Motion for Due Process Hearing' },
    { id: 'demand_letter', name: 'Demand Letter to CPS' },
    { id: 'objection_letter', name: 'Written Objection' },
    { id: 'affidavit', name: 'Affidavit/Declaration' },
    { id: 'case_plan_objection', name: 'Case Plan Objection' },
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
      
      // Save the generated document
      const newDoc = await api.post('/api/documents', {
        case_id: selectedCase.id,
        title: documentTypes.find(d => d.id === docType)?.name || docType,
        content: response.document,
        doc_type: docType
      });
      
      setDocuments([...documents, newDoc]);
      toast.success('Document generated successfully!');
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
        <p className="text-gray-400">Select a case to generate legal documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="documents-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Document Generator</h1>
        <p className="text-gray-400">AI-powered legal document creation for {selectedCase.title}</p>
      </div>

      {/* Document Types */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((doc) => (
          <button
            key={doc.id}
            onClick={() => generateDocument(doc.id)}
            disabled={generating}
            className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-red-600/50 transition-all text-left"
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

      {/* Generated Documents */}
      {documents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Generated Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-gray-400">{doc.date}</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Eye className="w-4 h-4 inline mr-2" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
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

export default App;
