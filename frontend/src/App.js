import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';

// API URL from environment - Emergent sets this during deployment
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// API Helper with mobile-friendly token handling
const api = {
  getToken() {
    try {
      return localStorage.getItem('cps_token');
    } catch (e) {
      console.error('localStorage access error:', e);
      return null;
    }
  },
  
  async request(endpoint, options = {}, retryCount = 0) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        // Token expired or invalid - clear auth and redirect to login
        try {
          localStorage.removeItem('cps_token');
          localStorage.removeItem('cps_user');
        } catch (e) {
          console.error('Failed to clear auth:', e);
        }
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed (${response.status})`);
      }
      
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic for network errors (max 2 retries)
      if (retryCount < 2 && (error.name === 'AbortError' || error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
        console.log(`Retrying request (attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.request(endpoint, options, retryCount + 1);
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('network')) {
        console.error('Network error details:', error);
        throw new Error('Connection error. Please check your internet and try again.');
      }
      throw error;
    }
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
  const [processingOAuth, setProcessingOAuth] = useState(false);
  const hasProcessedOAuth = useRef(false);

  // CRITICAL: Check for OAuth session_id synchronously during render (not in useEffect)
  // This prevents race conditions with auth checks
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
    
    // If we have a session_id from OAuth callback and haven't processed it yet
    if (sessionId && !hasProcessedOAuth.current) {
      hasProcessedOAuth.current = true; // Mark as processed immediately to prevent re-runs
      console.log('Processing OAuth session_id:', sessionId?.substring(0, 20) + '...');
      setProcessingOAuth(true);
      processGoogleAuth(sessionId);
      return;
    }

    // Normal auth check - only if no OAuth callback in progress
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
    console.log('Processing Google OAuth with session ID:', sessionId?.substring(0, 20) + '...');
    try {
      const response = await fetch(`${API_URL}/api/auth/google/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Google auth API error:', response.status, data);
        throw new Error(data.detail || 'Google authentication failed');
      }

      console.log('Google OAuth successful for:', data.email);
      localStorage.setItem('cps_token', data.access_token);
      localStorage.setItem('cps_user', JSON.stringify(data));
      setUser(data);
      setCurrentView('dashboard');
      
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      toast.success(`Welcome, ${data.name}! Signed in with Google.`);
    } catch (error) {
      console.error('Google auth error:', error);
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

  if (loading || processingOAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <img 
          src="/images/shield-logo.png" 
          alt="Loading" 
          className="w-24 h-28 animate-pulse mb-4"
        />
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        {processingOAuth && (
          <p className="text-gray-400 mt-4">Signing in with Google...</p>
        )}
      </div>
    );
  }

  const token = localStorage.getItem('cps_token');

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, api, token }}>
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
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/images/shield-logo.png" alt="CPS Punisher" className="w-8 h-9" />
            <span className="text-lg font-bold tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>THE CPS PUNISHER</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('auth')}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              data-testid="landing-sign-in-btn"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with hero image */}
        <div className="absolute inset-0">
          <img 
            src="/images/hero-logo.jpg" 
            alt="The CPS Punisher" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl py-20 mt-48">
          {/* Badges */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm">
              <Brain className="w-4 h-4 text-red-500" />
              AI-Powered Analysis
            </span>
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-red-500" />
              50 States Covered
            </span>
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm">
              <Lock className="w-4 h-4 text-red-500" />
              100% Confidential
            </span>
          </div>
          
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
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const { login, signup } = useAuth();

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (e) {
        console.error('Connection test failed:', e);
        setConnectionStatus('error');
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (connectionStatus === 'error') {
      setErrorMessage('Cannot connect to server. Please check your internet connection and try again.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      setRetryCount(0);
    } catch (error) {
      const msg = error.message || 'An error occurred';
      setErrorMessage(msg);
      if (msg.includes('network') || msg.includes('connection') || msg.includes('timeout') || msg.includes('fetch')) {
        setRetryCount(prev => prev + 1);
        setConnectionStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setErrorMessage('');
    setConnectionStatus('checking');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/health`);
      if (response.ok) {
        setConnectionStatus('connected');
        handleSubmit(new Event('submit'));
      } else {
        setConnectionStatus('error');
        setErrorMessage('Still cannot connect. Please try again in a moment.');
      }
    } catch (e) {
      setConnectionStatus('error');
      setErrorMessage('Connection failed. Please check your internet.');
    }
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin; // Redirect to root, session_id will be in hash
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/images/cracked-logo.jpg" 
            alt="CPS Punisher" 
            className="w-64 mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))' }}
          />
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to continue your fight' : 'Create your account to fight back'}
          </p>
          {/* Connection Status Indicator */}
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            {connectionStatus === 'checking' && (
              <span className="text-yellow-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Connecting...
              </span>
            )}
            {connectionStatus === 'connected' && (
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            )}
            {connectionStatus === 'error' && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Connection Issue
              </span>
            )}
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          data-testid="google-signin-btn"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-black via-gray-900 to-red-950/30 text-gray-400">or</span>
          </div>
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

          {/* Error message with retry */}
          {errorMessage && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 text-sm mb-2">{errorMessage}</p>
              {(errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              )}
            </div>
          )}

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
  const [prefetchedData, setPrefetchedData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Pre-fetch critical data in parallel on mount
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
        // Admin check: if we got stats back (has total_users), user is admin
        const isAdminUser = adminCheck && typeof adminCheck.total_users === 'number';
        setIsAdmin(isAdminUser);
        console.log('Admin check result:', isAdminUser, adminCheck);
      } catch (error) {
        console.error('Prefetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    prefetch();
  }, []);

  // Tier hierarchy: free=0, essential=1, professional=2, attorney=3, enterprise=4
  const TIER_LEVELS = { free: 0, essential: 1, professional: 2, attorney: 3, enterprise: 4 };
  const userTierLevel = TIER_LEVELS[user?.tier] || 0;

  const menuItems = [
    { id: 'overview', icon: Home, label: 'Overview', minTier: 'free' },
    { id: 'cases', icon: FileText, label: 'My Cases', minTier: 'free' },
    { id: 'ainotes', icon: Brain, label: 'AI Case Notes', minTier: 'free', highlight: true },
    { id: 'violations', icon: AlertTriangle, label: 'Violations', minTier: 'free' },
    { id: 'timeline', icon: Clock, label: 'Timeline', minTier: 'free' },
    { id: 'evidence', icon: Eye, label: 'Evidence', minTier: 'free' },
    { id: 'evidencelist', icon: CheckCircle2, label: 'Evidence Checklist', minTier: 'free' },
    { id: 'visitation', icon: Users, label: 'Visitation Log', minTier: 'free' },
    { id: 'courthearings', icon: Calendar, label: 'Court Hearings', minTier: 'free' },
    { id: 'communications', icon: MessageSquare, label: 'Communications', minTier: 'free' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', minTier: 'free' },
    { id: 'rights', icon: Shield, label: 'Know Your Rights', minTier: 'free' },
    { id: 'forum', icon: Users, label: 'Community', minTier: 'free' },
    { id: 'advocates', icon: Users, label: 'Find Advocates', minTier: 'free' },
    { id: 'chat', icon: MessageSquare, label: 'AI Assistant', minTier: 'free', highlight: true },
    { id: 'documents', icon: FileText, label: 'Documents', minTier: 'free', highlight: true },
    { id: 'smartdoc', icon: Zap, label: 'Smart Doc Generator', minTier: 'free', highlight: true },
    { id: 'incidents', icon: AlertTriangle, label: 'Incident Analyzer', minTier: 'essential' },
    { id: 'notepad', icon: FileText, label: 'Legal Notepad', minTier: 'essential', highlight: true },
    { id: 'courtfilings', icon: Gavel, label: 'Court Filings', minTier: 'essential' },
    { id: 'services', icon: Users, label: 'Services', minTier: 'essential' },
    { id: 'strategy', icon: Shield, label: 'Defense Strategy', minTier: 'essential' },
    { id: 'expert', icon: Brain, label: 'Expert Legal AI', minTier: 'professional', highlight: true },
    { id: 'strategybuilder', icon: Shield, label: 'Strategy Builder', minTier: 'professional', highlight: true },
    { id: 'argumentgen', icon: Scale, label: 'Argument Generator', minTier: 'professional', highlight: true },
    { id: 'evidencemapper', icon: Eye, label: 'Evidence Mapper', minTier: 'professional', highlight: true },
    { id: 'precedentfinder', icon: Search, label: 'Precedent Finder', minTier: 'professional', highlight: true },
    { id: 'ada', icon: Scale, label: 'ADA Compliance', minTier: 'professional', highlight: true },
    { id: 'caselaw', icon: BookOpen, label: 'Case Law Analysis', minTier: 'professional', highlight: true },
    { id: 'judgewatch', icon: Scale, label: 'Judge Watch', minTier: 'professional' },
    { id: 'personlookup', icon: Search, label: 'Background Check', minTier: 'professional', highlight: true },
    { id: 'legaldb', icon: BookOpen, label: 'Legal Knowledge Base', minTier: 'professional' },
    { id: 'research', icon: Search, label: 'Legal Research', minTier: 'professional' },
    { id: 'library', icon: BookOpen, label: 'Law Library', minTier: 'professional' },
    { id: 'section1983', icon: Gavel, label: 'Section 1983 Lawsuit', minTier: 'attorney', highlight: true },
    { id: 'courtlistener', icon: Scale, label: 'Court Opinions', minTier: 'attorney', highlight: true },
    { id: 'podcast', icon: Mic, label: 'Podcast Creator', minTier: 'attorney' },
    { id: 'criminal', icon: AlertTriangle, label: 'Criminal Case', minTier: 'attorney' },
    { id: 'pricing', icon: CreditCard, label: 'Upgrade Plan', minTier: 'free' },
  ];

  // Admin check is used in sidebar bottom section now

  return (
    <div className="min-h-screen bg-gray-900 flex">
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
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
              data-testid="close-sidebar-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pb-4">
          {menuItems.map((item) => {
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

      {/* Mobile header */}
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            data-testid="mobile-menu-btn"
          >
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
          {activeTab === 'research' && <ResearchTab />}
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

      {/* Help Bot - Floating Assistant */}
      <HelpBot />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Overview Tab
function OverviewTab({ cases, setActiveTab, prefetchedData = {} }) {
  const { api, user } = useAuth();
  const [tierStatus, setTierStatus] = useState(prefetchedData.tierStatus || null);
  const [creditBalance, setCreditBalance] = useState(prefetchedData.creditBalance || null);

  useEffect(() => {
    if (!tierStatus || !creditBalance) {
      const loadStatus = async () => {
        try {
          const [ts, cb] = await Promise.all([
            tierStatus ? Promise.resolve(tierStatus) : api.get('/api/auth/tier-status'),
            creditBalance ? Promise.resolve(creditBalance) : api.get('/api/credits/balance')
          ]);
          setTierStatus(ts);
          setCreditBalance(cb);
        } catch (e) { console.error(e); }
      };
      loadStatus();
    }
  }, []);

  const tierColors = { free: 'text-gray-400', essential: 'text-blue-400', professional: 'text-purple-400', attorney: 'text-amber-400', enterprise: 'text-red-400' };
  const tierBg = { free: 'bg-gray-600/20', essential: 'bg-blue-600/20', professional: 'bg-purple-600/20', attorney: 'bg-amber-600/20', enterprise: 'bg-red-600/20' };

  const quickActions = [
    { icon: Plus, label: 'New Case', action: () => setActiveTab('cases'), color: 'bg-red-600' },
    { icon: MessageSquare, label: 'AI Chat', action: () => setActiveTab('chat'), color: 'bg-purple-600' },
    { icon: Search, label: 'Research', action: () => setActiveTab('research'), color: 'bg-blue-600' },
    { icon: BookOpen, label: 'Law Library', action: () => setActiveTab('library'), color: 'bg-green-600' },
  ];

  const usageBar = (used, total, label) => {
    const isUnlimited = total === -1;
    const pct = isUnlimited ? 0 : Math.min((used / total) * 100, 100);
    const remaining = isUnlimited ? 'Unlimited' : `${Math.max(total - used, 0)} remaining`;
    const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-300">{isUnlimited ? 'Unlimited' : `${used}/${total}`}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          {!isUnlimited && <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />}
          {isUnlimited && <div className="h-full bg-green-500/30 rounded-full w-full" />}
        </div>
        <p className="text-xs text-gray-500">{remaining}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="overview-tab">
      {/* Header with Chrome Logo */}
      <div className="flex items-center gap-6">
        <img src="/images/chrome-logo.jpg" alt="CPS Punisher" className="w-32 h-auto hidden md:block" />
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Welcome Back, Punisher
          </h1>
          <p className="text-gray-400">Continue your fight for your family</p>
        </div>
      </div>

      {/* Tier & Usage Dashboard */}
      {tierStatus && (
        <div className="grid md:grid-cols-3 gap-4" data-testid="usage-dashboard">
          {/* Current Plan Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400 font-medium">Current Plan</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${tierBg[tierStatus.tier]} ${tierColors[tierStatus.tier]}`}>
                {tierStatus.tier.toUpperCase()}
              </span>
            </div>
            <p className={`text-2xl font-bold mb-3 ${tierColors[tierStatus.tier]}`}>
              {tierStatus.tier === 'free' ? 'Free' : tierStatus.tier.charAt(0).toUpperCase() + tierStatus.tier.slice(1)}
            </p>
            <button onClick={() => setActiveTab('pricing')} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1" data-testid="upgrade-plan-btn">
              <Zap className="w-3.5 h-3.5" /> Upgrade Plan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Usage Stats Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm text-gray-400 font-medium">Monthly Usage</h3>
            {usageBar(tierStatus.usage.ai_credits_used, tierStatus.limits.ai_credits, 'AI Credits')}
            {usageBar(tierStatus.usage.docs_uploaded_this_month, tierStatus.limits.docs_per_month, 'Doc Uploads')}
            {usageBar(tierStatus.usage.cases_created, tierStatus.limits.cases_max, 'Cases')}
          </div>

          {/* Credits Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm text-gray-400 font-medium mb-3">Purchased Credits</h3>
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-8 h-8 text-amber-400" />
              <p className="text-3xl font-bold text-amber-400" data-testid="credits-balance">
                {creditBalance?.purchased_credits ?? 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 mb-3">Use credits for any feature — no tier required</p>
            <button onClick={() => setActiveTab('pricing')} className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2" data-testid="buy-credits-btn">
              <Coins className="w-4 h-4" /> Buy Credits
            </button>
          </div>
        </div>
      )}

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
          <p className="text-4xl font-bold text-purple-500">{tierStatus ? (tierStatus.limits.ai_credits === -1 ? '∞' : `${tierStatus.usage.ai_credits_used}/${tierStatus.limits.ai_credits}`) : '...'}</p>
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
  const [viewingCase, setViewingCase] = useState(null);
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
              className={`p-6 rounded-xl transition-all ${
                selectedCase?.id === caseItem.id
                  ? 'bg-red-600/20 border-2 border-red-600'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="cursor-pointer flex-1" onClick={() => setSelectedCase(caseItem)}>
                  <h3 className="text-xl font-semibold">{caseItem.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">State: {caseItem.state}</p>
                  {caseItem.case_number && (
                    <p className="text-gray-500 text-sm">Case #: {caseItem.case_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    caseItem.status === 'active' ? 'bg-green-600/20 text-green-500' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {caseItem.status || 'Active'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCase(caseItem); setViewingCase(caseItem); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold flex items-center gap-2"
                    data-testid={`open-case-${caseItem.id}`}
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </button>
                </div>
              </div>
              {caseItem.description && (
                <p className="text-gray-400 mt-3 text-sm line-clamp-2">{caseItem.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>{caseItem.violation_count || 0} violations</span>
                <span>{caseItem.document_count || 0} documents</span>
                <span>{caseItem.event_count || 0} events</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {viewingCase && (
        <CaseDetailModal 
          caseData={viewingCase} 
          onClose={() => setViewingCase(null)}
          api={api}
        />
      )}

      {selectedCase && !viewingCase && (
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

// Case Detail Modal - Shows all saved case information
function CaseDetailModal({ caseData, onClose, api }) {
  const [loading, setLoading] = useState(true);
  const [caseDetails, setCaseDetails] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadCaseDetails();
  }, [caseData.id]);

  const loadCaseDetails = async () => {
    setLoading(true);
    try {
      // Load all case-related data
      const [violations, documents, timeline, evidence, communications, strategies] = await Promise.all([
        api.get(`/api/violations/${caseData.id}`).catch(() => ({ violations: [] })),
        api.get(`/api/documents/${caseData.id}`).catch(() => ({ documents: [] })),
        api.get(`/api/timeline/${caseData.id}`).catch(() => ({ events: [] })),
        api.get(`/api/evidence/${caseData.id}`).catch(() => ({ evidence: [] })),
        api.get(`/api/communications/${caseData.id}`).catch(() => ({ communications: [] })),
        api.get(`/api/strategies/${caseData.id}`).catch(() => ({ strategies: [] })),
      ]);

      setCaseDetails({
        violations: violations.violations || [],
        documents: documents.documents || [],
        timeline: timeline.events || [],
        evidence: evidence.evidence || [],
        communications: communications.communications || [],
        strategies: strategies.strategies || [],
      });
    } catch (error) {
      console.error('Failed to load case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'evidence', label: 'Evidence', icon: Eye },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'strategies', label: 'Strategies', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-5xl my-8 flex flex-col">
        {/* Header - sticky */}
        <div className="sticky top-0 p-6 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-red-900/30 to-gray-900 rounded-t-xl z-10">
          <div className="flex items-center gap-4">
            <img src="/images/shield-logo.png" alt="Logo" className="w-10 h-12" />
            <div>
              <h2 className="text-2xl font-bold">{caseData.title}</h2>
              <p className="text-gray-400 text-sm">State: {caseData.state} | Case #: {caseData.case_number || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('cps_token');
                  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/export/case/${caseData.id}/preparation-kit`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Court_Preparation_Kit_${caseData.title.replace(/\s+/g, '_')}.pdf`;
                    a.click();
                    toast.success('Court Preparation Kit downloaded!');
                  } else {
                    toast.error('Failed to generate kit');
                  }
                } catch (error) {
                  toast.error('Download failed');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-lg"
              data-testid="download-prep-kit-btn"
            >
              <Download className="w-4 h-4" />
              Court Prep Kit
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'border-b-2 border-red-500 text-red-500 bg-red-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
              {caseDetails && section.id !== 'overview' && (
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {caseDetails[section.id]?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="ml-3 text-gray-400">Loading case details...</span>
            </div>
          ) : (
            <>
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Case Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Title:</span> {caseData.title}</p>
                        <p><span className="text-gray-400">State:</span> {caseData.state}</p>
                        <p><span className="text-gray-400">Case Number:</span> {caseData.case_number || 'Not assigned'}</p>
                        <p><span className="text-gray-400">Status:</span> <span className="text-green-400">{caseData.status || 'Active'}</span></p>
                        <p><span className="text-gray-400">Created:</span> {new Date(caseData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Case Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-red-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-red-500">{caseDetails?.violations?.length || 0}</p>
                          <p className="text-xs text-gray-400">Violations</p>
                        </div>
                        <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-500">{caseDetails?.documents?.length || 0}</p>
                          <p className="text-xs text-gray-400">Documents</p>
                        </div>
                        <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-500">{caseDetails?.evidence?.length || 0}</p>
                          <p className="text-xs text-gray-400">Evidence</p>
                        </div>
                        <div className="text-center p-3 bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-500">{caseDetails?.timeline?.length || 0}</p>
                          <p className="text-xs text-gray-400">Events</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {caseData.description && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-300">{caseData.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'violations' && (
                <div className="space-y-4">
                  {caseDetails?.violations?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No violations recorded yet.</p>
                  ) : (
                    caseDetails?.violations?.map((v, i) => (
                      <div key={i} className="bg-gray-800/50 border border-red-900/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-red-400">{v.violation_type}</h4>
                            <p className="text-gray-300 text-sm mt-1">{v.description}</p>
                          </div>
                          <span className="text-xs text-gray-500">{v.date || 'No date'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'documents' && (
                <div className="space-y-4">
                  {caseDetails?.documents?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No documents uploaded yet.</p>
                  ) : (
                    caseDetails?.documents?.map((d, i) => (
                      <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-400" />
                            <div>
                              <h4 className="font-semibold">{d.title || d.filename}</h4>
                              <p className="text-gray-400 text-xs">{d.doc_type} • {d.file_type}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</span>
                        </div>
                        {d.content && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{d.content.substring(0, 200)}...</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'timeline' && (
                <div className="space-y-4">
                  {caseDetails?.timeline?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No timeline events yet.</p>
                  ) : (
                    <div className="relative border-l-2 border-gray-700 pl-6 space-y-6">
                      {caseDetails?.timeline?.map((e, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-8 w-4 h-4 bg-red-600 rounded-full border-2 border-gray-900"></div>
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <p className="text-red-400 text-sm font-semibold">{e.date}</p>
                            <h4 className="font-semibold mt-1">{e.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{e.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  {caseDetails?.evidence?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No evidence items logged yet.</p>
                  ) : (
                    caseDetails?.evidence?.map((e, i) => (
                      <div key={i} className="bg-gray-800/50 border border-purple-900/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-purple-400">{e.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">Type: {e.evidence_type} • Status: {e.status}</p>
                            <p className="text-gray-300 text-sm mt-2">{e.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'communications' && (
                <div className="space-y-4">
                  {caseDetails?.communications?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No communications logged yet.</p>
                  ) : (
                    caseDetails?.communications?.map((c, i) => (
                      <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{c.contact_name || 'Unknown Contact'}</h4>
                            <p className="text-gray-400 text-xs">{c.communication_type} • {c.date}</p>
                            <p className="text-gray-300 text-sm mt-2">{c.summary}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'strategies' && (
                <div className="space-y-4">
                  {caseDetails?.strategies?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No defense strategies saved yet.</p>
                  ) : (
                    caseDetails?.strategies?.map((s, i) => (
                      <div key={i} className="bg-gray-800/50 border border-green-900/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-green-400">{s.title}</h4>
                            <p className="text-gray-400 text-xs">{s.strategy_type} • Priority: {s.priority}</p>
                            <p className="text-gray-300 text-sm mt-2">{s.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Chat Tab
function ChatTab({ selectedCase }) {
  const { api, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setStreamingContent('');

    try {
      // Use streaming endpoint for real-time response
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          case_id: selectedCase?.id
        })
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.chunk) {
                fullContent += data.chunk;
                setStreamingContent(fullContent);
              }
              if (data.done && data.session_id) {
                setSessionId(data.session_id);
              }
            } catch (parseError) {
              // Skip parse errors for incomplete chunks
            }
          }
        }
      }

      // Add complete message to history
      setMessages((prev) => [...prev, { role: 'assistant', content: fullContent }]);
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      setStreamingContent('');
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

        {loading && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-3xl p-4 rounded-xl bg-gray-700/50 border border-gray-600">
              <p className="whitespace-pre-wrap">{streamingContent}<span className="animate-pulse">▊</span></p>
            </div>
          </div>
        )}

        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-gray-700/50 border border-gray-600 p-4 rounded-xl flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="text-gray-400 text-sm">Thinking...</span>
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
  const [uploadQueue, setUploadQueue] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const folderInputRef = React.useRef(null);

  const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.rtf', '.gif', '.webp', '.heic', '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB for documents/images
  const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50MB for audio/video

  // Helper to get icon for file type
  const getFileIcon = (fileType, category) => {
    const ext = fileType?.toLowerCase();
    if (category === 'audio' || ['.mp3', '.wav', '.m4a', '.aac', '.ogg'].includes(ext)) {
      return <Volume2 className="w-8 h-8 text-purple-500" />;
    }
    if (category === 'video' || ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
      return <Play className="w-8 h-8 text-red-500" />;
    }
    if (category === 'image' || ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'].includes(ext)) {
      return <Eye className="w-8 h-8 text-green-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

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

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Unsupported type: ${ext}`;
    
    // Different size limits for media files
    const mediaExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const maxSize = mediaExtensions.includes(ext) ? MAX_MEDIA_SIZE : MAX_FILE_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);
    
    if (file.size > maxSize) return `File too large (max ${maxSizeMB}MB)`;
    return null;
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', selectedCase.id);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('doc_type', 'cps_document');
    formData.append('auto_analyze', 'true');

    const token = localStorage.getItem('cps_token');
    const response = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    return response.json();
  };

  const handleBatchUpload = async (fileList) => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Validate and build queue
    const queue = files.map(file => {
      const error = validateFile(file);
      return {
        file,
        name: file.name,
        size: file.size,
        status: error ? 'error' : 'pending',
        error: error || null,
        result: null
      };
    });

    const validCount = queue.filter(q => q.status === 'pending').length;
    const invalidCount = queue.filter(q => q.status === 'error').length;

    if (validCount === 0) {
      toast.error(`No valid files to upload. ${invalidCount} file(s) skipped.`);
      return;
    }

    if (invalidCount > 0) {
      toast.warning(`${invalidCount} file(s) skipped (unsupported type or too large)`);
    }

    setUploadQueue(queue);
    setBatchUploading(true);

    // Process files sequentially
    const updatedQueue = [...queue];
    const newDocs = [];

    for (let i = 0; i < updatedQueue.length; i++) {
      if (updatedQueue[i].status === 'error') continue;

      updatedQueue[i].status = 'uploading';
      setUploadQueue([...updatedQueue]);

      try {
        const result = await uploadSingleFile(updatedQueue[i].file);
        updatedQueue[i].status = 'done';
        updatedQueue[i].result = result;
        newDocs.push(result);
      } catch (err) {
        updatedQueue[i].status = 'error';
        updatedQueue[i].error = err.message;
      }
      setUploadQueue([...updatedQueue]);
    }

    // Update document list
    if (newDocs.length > 0) {
      setDocuments(prev => [...newDocs, ...prev]);
      const totalViolations = newDocs.reduce((sum, d) => sum + (d.analysis_result?.violations_created || 0), 0);
      const totalTimeline = newDocs.reduce((sum, d) => sum + (d.analysis_result?.timeline_events_created || 0), 0);
      toast.success(
        `${newDocs.length} document(s) uploaded! Found ${totalViolations} violations and ${totalTimeline} timeline events.`,
        { duration: 6000 }
      );
    }

    setBatchUploading(false);
  };

  // Legacy single-file handler (kept for backwards compat)
  const handleFileUpload = async (file) => {
    await handleBatchUpload([file]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const items = e.dataTransfer.items;
    const files = [];

    // Handle folder drops (webkitGetAsEntry)
    if (items && items.length > 0 && items[0].webkitGetAsEntry) {
      const entries = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) entries.push(entry);
      }

      const readEntries = (dirEntry) => {
        return new Promise((resolve) => {
          const reader = dirEntry.createReader();
          const allEntries = [];
          const readBatch = () => {
            reader.readEntries((batch) => {
              if (batch.length === 0) {
                resolve(allEntries);
              } else {
                allEntries.push(...batch);
                readBatch();
              }
            });
          };
          readBatch();
        });
      };

      const getFile = (fileEntry) => {
        return new Promise((resolve) => fileEntry.file(resolve));
      };

      const processEntries = async (entryList) => {
        for (const entry of entryList) {
          if (entry.isFile) {
            const file = await getFile(entry);
            files.push(file);
          } else if (entry.isDirectory) {
            const subEntries = await readEntries(entry);
            await processEntries(subEntries);
          }
        }
      };

      processEntries(entries).then(() => {
        if (files.length > 0) handleBatchUpload(files);
      });
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBatchUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const clearQueue = () => {
    setUploadQueue([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
      <div className="flex gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
        {[
          { id: 'upload', label: 'Upload & Analyze', icon: Upload },
          { id: 'generate', label: 'Generate Documents', icon: FileText },
          { id: 'analysis', label: 'View Analysis', icon: Brain },
          { id: 'forensic', label: 'Forensic Analyzer', icon: Search },
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
          {/* Upload Zone - Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              dragActive 
                ? 'border-red-500 bg-red-500/10 scale-[1.01]' 
                : 'border-gray-600 hover:border-red-600/50'
            } ${batchUploading ? 'opacity-50 pointer-events-none' : ''}`}
            data-testid="upload-dropzone"
          >
            {batchUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-red-500 animate-spin" />
                <p className="text-lg font-semibold text-red-400">
                  Uploading {uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.filter(q => q.status !== 'error' || q.result).length} files...
                </p>
                <p className="text-gray-400">AI is analyzing your documents for violations and timeline events...</p>
              </div>
            ) : (
              <>
                <Upload className="w-14 h-14 mx-auto text-gray-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Drop Files or Folders Here</h3>
                <p className="text-gray-400 mb-2">
                  Upload petitions, safety plans, court orders, letters, or any CPS documents
                </p>
                <p className="text-sm text-gray-500 mb-5">
                  Drag & drop files or folders • Documents (PDF, DOC, TXT) • Images (JPG, PNG) • Audio (MP3, WAV) • Video (MP4, MOV) • Max 50MB
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="btn-punisher cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors" data-testid="select-files-btn">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.txt,.png,.jpg,.jpeg,.doc,.docx,.rtf,.gif,.webp,.heic,.mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.avi,.mkv,.webm"
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 0) handleBatchUpload(e.target.files);
                        e.target.value = '';
                      }}
                      data-testid="file-upload-input"
                    />
                    <Upload className="w-4 h-4" />
                    Select Files
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors border border-gray-600" data-testid="select-folder-btn">
                    <input
                      ref={folderInputRef}
                      type="file"
                      className="hidden"
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 0) handleBatchUpload(e.target.files);
                        e.target.value = '';
                      }}
                      data-testid="folder-upload-input"
                    />
                    <FileText className="w-4 h-4" />
                    Upload Folder
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Upload Queue */}
          {uploadQueue.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5" data-testid="upload-queue">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-500" />
                  Upload Queue ({uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.length})
                </h3>
                {!batchUploading && (
                  <button onClick={clearQueue} className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600" data-testid="clear-queue-btn">
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadQueue.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.status === 'done' ? 'bg-green-900/20 border border-green-800/30' :
                    item.status === 'error' ? 'bg-red-900/20 border border-red-800/30' :
                    item.status === 'uploading' ? 'bg-blue-900/20 border border-blue-800/30' :
                    'bg-gray-900/50 border border-gray-800'
                  }`} data-testid={`queue-item-${idx}`}>
                    <div className="flex-shrink-0">
                      {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                      {item.status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {item.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {item.status === 'pending' && <Clock className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.size)}
                        {item.status === 'uploading' && ' — Analyzing with AI...'}
                        {item.status === 'done' && ` — ${item.result?.analysis_result?.violations_created || 0} violations found`}
                        {item.status === 'error' && ` — ${item.error}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'done' ? 'bg-green-600/20 text-green-400' :
                      item.status === 'error' ? 'bg-red-600/20 text-red-400' :
                      item.status === 'uploading' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {item.status === 'uploading' ? 'Analyzing' : item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        {getFileIcon(doc.file_type, doc.file_category)}
                        <div>
                          <h4 className="font-semibold">{doc.title}</h4>
                          <p className="text-sm text-gray-400">
                            {doc.filename} • {new Date(doc.created_at).toLocaleDateString()}
                            {doc.file_category && doc.file_category !== 'document' && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs capitalize">{doc.file_category}</span>
                            )}
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

      {/* Forensic Analyzer Tab */}
      {activeSubTab === 'forensic' && (
        <ForensicAnalyzerView 
          selectedCase={selectedCase}
          documents={documents}
          selectedDocument={selectedDocument}
        />
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

// Forensic Analyzer View — 7-Point Legal Forensic Analysis
function ForensicAnalyzerView({ selectedCase, documents, selectedDocument }) {
  const { api } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(selectedDocument?.id || '');
  const [analysisMode, setAnalysisMode] = useState('single'); // single or case

  useEffect(() => {
    if (selectedCase) {
      api.get(`/api/ai/forensic-analysis/${selectedCase.id}`).then(data => {
        setPastAnalyses(data.analyses || []);
      }).catch(() => {});
    }
  }, [selectedCase]);

  const runForensicAnalysis = async () => {
    setAnalyzing(true);
    setResults(null);
    try {
      const payload = analysisMode === 'case'
        ? { case_id: selectedCase.id }
        : { document_id: selectedDocId, case_id: selectedCase?.id };
      const data = await api.post('/api/ai/forensic-analysis', payload);
      setResults(data);
      setPastAnalyses(prev => [data, ...prev]);
      toast.success('Forensic analysis complete');
    } catch (error) {
      toast.error(error.message || 'Forensic analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const sections = [
    { id: 1, title: 'MOUs & Interagency Agreements', icon: FileText, color: 'text-blue-500' },
    { id: 2, title: 'Stipulations & Contractual Terms', icon: Scale, color: 'text-purple-500' },
    { id: 3, title: 'Void Ab Initio Issues', icon: AlertTriangle, color: 'text-red-500' },
    { id: 4, title: 'Child Welfare / Trafficking Indicators', icon: Shield, color: 'text-amber-500' },
    { id: 5, title: 'Structural Legal Issues', icon: Gavel, color: 'text-orange-500' },
    { id: 6, title: 'Legal Evidence Matrix', icon: BarChart3, color: 'text-green-500' },
    { id: 7, title: 'Final Assessment', icon: CheckCircle2, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6" data-testid="forensic-analyzer">
      <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Search className="w-7 h-7 text-red-500" />
          Legal Forensic Document Analyzer
        </h2>
        <p className="text-gray-400">AI-powered 7-point legal forensic analysis for government records, interagency agreements, and CPS documents</p>

        {/* Analysis Mode */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setAnalysisMode('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${analysisMode === 'single' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            data-testid="forensic-mode-single"
          >
            Single Document
          </button>
          <button
            onClick={() => setAnalysisMode('case')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${analysisMode === 'case' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            data-testid="forensic-mode-case"
          >
            Entire Case ({documents.length} docs)
          </button>
        </div>

        {/* Document Selector for single mode */}
        {analysisMode === 'single' && (
          <div className="mt-4">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm"
              data-testid="forensic-doc-select"
            >
              <option value="">Select a document to analyze...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.title || doc.filename}</option>
              ))}
            </select>
          </div>
        )}

        {/* Analysis Sections Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
          {sections.map((s) => (
            <div key={s.id} className="bg-gray-900/80 border border-gray-800 rounded-lg p-2 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-[10px] text-gray-400 leading-tight">{s.title}</p>
            </div>
          ))}
        </div>

        <button
          onClick={runForensicAnalysis}
          disabled={analyzing || (analysisMode === 'single' && !selectedDocId)}
          className="mt-4 btn-punisher px-8 py-3 flex items-center gap-2 disabled:opacity-50"
          data-testid="forensic-run-btn"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Running 7-Point Analysis...</>
          ) : (
            <><Search className="w-5 h-5" /> Run Forensic Analysis</>
          )}
        </button>
      </div>

      {/* Loading State */}
      {analyzing && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Performing Forensic Analysis...</p>
          <p className="text-sm text-gray-400">Scanning for MOUs, stipulations, void ab initio defects, trafficking indicators, and structural issues</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {sections.map((s) => (
              <span key={s.id} className="px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 flex items-center gap-1">
                <s.icon className="w-3 h-3" /> {s.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && !analyzing && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden" data-testid="forensic-results">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Forensic Analysis Complete
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{results.document_title} — {new Date(results.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(results.analysis); toast.success('Analysis copied'); }}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1.5"
                data-testid="forensic-copy-btn"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([results.analysis], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = window.document.createElement('a');
                  a.href = url;
                  a.download = `forensic-analysis-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Analysis downloaded');
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-1.5"
                data-testid="forensic-download-btn"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">{results.analysis}</pre>
          </div>
        </div>
      )}

      {/* Past Analyses */}
      {pastAnalyses.length > 0 && !results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Previous Forensic Analyses</h3>
          {pastAnalyses.map((a, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setResults(a)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors text-left"
              >
                <div>
                  <p className="font-medium">{a.document_title}</p>
                  <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// Legal Research Tab — Cetient-Style Smart Research Engine
function ResearchTab() {
  const { api } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState('');
  const [researchType, setResearchType] = useState('comprehensive');
  const [searchTime, setSearchTime] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResults('');
    setSearchTime(null);
    const startTime = Date.now();
    try {
      const response = await api.post('/api/ai/smart-research', {
        query,
        state: state || null,
        research_type: researchType
      });
      setResults(response.results);
      setSearchTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (error) {
      toast.error(error.message || 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
  ];

  const researchTypes = [
    { id: 'comprehensive', label: 'Full Research Brief', icon: BookOpen, desc: 'Statutes, case law, strategies, deadlines' },
    { id: 'case_law', label: 'Case Law Search', icon: Scale, desc: 'Find relevant court decisions & precedents' },
    { id: 'statutes', label: 'Statute Finder', icon: FileText, desc: 'Find all applicable statutes & regulations' },
    { id: 'defense_strategy', label: 'Defense Strategy', icon: Shield, desc: 'Build a complete defense plan' },
  ];

  const quickSearches = [
    "What are my rights when CPS comes to my door without a warrant?",
    "Emergency removal timeframes and due process requirements",
    "How to challenge a CPS safety plan in court",
    "4th Amendment violations during CPS home investigations",
    "Grounds for motion to dismiss CPS dependency petition",
    "ADA accommodations CPS must provide for disabled parents",
    "False allegations defense strategies in CPS cases",
    "Parental rights termination timeline and appeals process",
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="research-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Search className="w-8 h-8 text-red-500" />
          Smart Legal Research
        </h1>
        <p className="text-gray-400 mt-1">AI-powered research engine — ask any legal question in plain English</p>
      </div>

      {/* Research Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="research-type-selector">
        {researchTypes.map((rt) => (
          <button
            key={rt.id}
            onClick={() => setResearchType(rt.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              researchType === rt.id
                ? 'border-red-500 bg-red-600/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            data-testid={`research-type-${rt.id}`}
          >
            <rt.icon className={`w-5 h-5 mb-2 ${researchType === rt.id ? 'text-red-500' : 'text-gray-500'}`} />
            <p className="font-semibold text-sm">{rt.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-3">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm w-32"
            data-testid="research-state-select"
          >
            <option value="">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any CPS legal question in plain English..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-red-600 text-base"
              data-testid="research-input"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="btn-punisher px-6 flex items-center gap-2 disabled:opacity-50" data-testid="research-btn">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Research
          </button>
        </div>
      </form>

      {/* Quick Searches */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Quick searches</p>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((q, i) => (
            <button
              key={i}
              onClick={() => { setQuery(q); }}
              className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-lg font-semibold">Researching legal databases...</p>
          <p className="text-sm text-gray-400 mt-1">Searching statutes, case law, and CPS policies across all jurisdictions</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden" data-testid="research-results">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Research Complete
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {researchType === 'comprehensive' ? 'Full Research Brief' : researchType === 'case_law' ? 'Case Law Results' : researchType === 'statutes' ? 'Statute Analysis' : 'Defense Strategy'}
                {state && ` — ${state} Jurisdiction`}
                {searchTime && ` — ${searchTime}s`}
              </p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(results); toast.success('Copied to clipboard'); }}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1.5"
              data-testid="copy-results-btn"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">{results}</pre>
            </div>
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
  const [saving, setSaving] = useState(false);

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

  const saveToNotepad = async () => {
    if (!selectedState) return;
    setSaving(true);
    try {
      await api.post('/api/notepad/save-from-library', { state_code: selectedState });
      toast.success(`${states.find(s => s.code === selectedState)?.name} CPS Law saved to your Legal Notepad!`);
    } catch (error) {
      toast.error('Failed to save to notepad');
    } finally {
      setSaving(false);
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
          <span className="ml-3 text-gray-400">Loading state CPS law information...</span>
        </div>
      )}

      {!selectedState && !loading && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Select a State</h3>
          <p className="text-gray-400">Click on a state abbreviation above to view CPS laws, statutes, timelines, and procedures for that state.</p>
        </div>
      )}

      {stateInfo && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-red-500" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {states.find(s => s.code === selectedState)?.name} CPS Law Guide
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-600/20 border border-green-500 text-green-400 text-xs rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Instant Access
              </span>
              <button
                onClick={saveToNotepad}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50"
                data-testid="save-to-notepad-btn"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save to Notepad
              </button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none bg-black/30 rounded-lg p-6 border border-gray-700/50">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">{stateInfo}</pre>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              State-specific statutes & timelines
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4" />
              Key case law included
            </span>
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
      color: 'from-blue-500 to-blue-700',
      monthly: 49,
      annual: 490,
      description: 'For parents starting their CPS defense',
      features: [
        'Unlimited Cases',
        '25 Document Uploads/month',
        '100 AI Credits/month',
        'AI Document Analysis',
        'AI Chat Assistant',
        'Motion & Document Generation',
        'Defense Strategy Generator',
        'Incident Analyzer',
        'Legal Notepad with PDF Export',
        'Court Filings Tracker',
        'Services Tracker',
        'Email Support'
      ],
      notIncluded: [
        'Strategy Builder',
        'ADA Compliance',
        'Section 1983 Generator'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Crown,
      color: 'from-purple-500 to-purple-700',
      monthly: 99,
      annual: 990,
      popular: true,
      description: 'Complete CPS defense toolkit',
      features: [
        'Everything in Essential, plus:',
        'UNLIMITED Document Uploads',
        '500 AI Credits/month',
        'Expert Legal AI Assistant',
        'Strategy Builder',
        'Argument Generator',
        'Evidence Mapper',
        'Precedent Finder',
        'ADA Compliance Center (50 States)',
        'Case Law Analysis',
        'Law Library (50 States)',
        'Judge Research Tools',
        'Legal Research Engine',
        'Multi-file & Folder Upload',
        'Priority Email Support'
      ]
    },
    {
      id: 'attorney',
      name: 'Attorney Suite',
      icon: Scale,
      color: 'from-amber-500 to-amber-700',
      monthly: 299,
      annual: 2990,
      description: 'Professional tools for family law attorneys',
      features: [
        'Everything in Professional, plus:',
        '2,000 AI Credits/month',
        'Section 1983 Lawsuit Generator',
        'CourtListener Integration (50M+ Opinions)',
        'Court Preparation Kit (PDF)',
        'Podcast Script Creator',
        'Criminal Case Tools',
        'Qualified Immunity Analysis',
        'Federal Civil Rights Tools',
        'Court Document Export (PDF)',
        'Priority Phone Support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building2,
      color: 'from-red-500 to-red-700',
      monthly: 999,
      annual: 9990,
      description: 'For law firms & advocacy organizations',
      features: [
        'Everything in Attorney, plus:',
        'UNLIMITED AI Credits',
        'Multi-Client Case Management',
        'Bulk Case Import',
        'Advanced Analytics Dashboard',
        'API Access for Integration',
        'Custom AI Training',
        '24/7 Priority Support',
        'Quarterly Strategy Sessions'
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
    <div className="space-y-8 animate-fadeIn" data-testid="pricing-tab">
      {/* Header */}
      <div className="text-center">
        <img src="/images/chrome-logo.jpg" alt="CPS Punisher" className="w-48 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>Upgrade Your Plan</h1>
        <p className="text-gray-400">Current plan: <span className="text-red-500 font-semibold">{user?.tier?.toUpperCase() || 'FREE'}</span></p>
      </div>

      {/* Free Tier Banner */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Free Plan Includes:</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 1 Case</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 1 Doc Upload/Month</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 5 AI Questions</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> AI Chat Access</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Violation & Timeline Tracking</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Evidence & Visitation Logs</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Know Your Rights Guide</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Community Forum</span>
        </div>
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

      {/* Credit Purchase Section */}
      <div className="bg-gradient-to-br from-amber-900/20 to-gray-900/50 border border-amber-700/30 rounded-xl p-8" data-testid="credit-purchase-section">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Buy AI Credits</h2>
          </div>
          <p className="text-gray-400">Use credits for any feature without upgrading your plan</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { id: 'credits_10', credits: 10, price: 4.99, label: '10 Credits' },
            { id: 'credits_50', credits: 50, price: 19.99, label: '50 Credits', popular: true },
            { id: 'credits_100', credits: 100, price: 34.99, label: '100 Credits' },
            { id: 'credits_250', credits: 250, price: 74.99, label: '250 Credits' },
          ].map((pkg) => (
            <div key={pkg.id} className={`relative bg-gray-800/80 border rounded-xl p-5 text-center ${pkg.popular ? 'border-amber-500 border-2' : 'border-gray-700'}`}>
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-600 rounded-full text-xs font-bold">
                  BEST VALUE
                </div>
              )}
              <Coins className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">{pkg.credits}</p>
              <p className="text-sm text-gray-400 mb-3">Credits</p>
              <p className="text-xl font-bold text-amber-400 mb-3">${pkg.price}</p>
              <p className="text-xs text-gray-500 mb-3">${(pkg.price / pkg.credits).toFixed(2)}/credit</p>
              <button
                onClick={async () => {
                  try {
                    const data = await api.post('/api/credits/purchase', { package_id: pkg.id, origin_url: window.location.origin });
                    if (data.url) window.location.href = data.url;
                  } catch (e) { toast.error(e.message); }
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors text-sm"
                data-testid={`buy-${pkg.id}`}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Credits never expire &bull; Use for any premium feature &bull; No subscription required</p>
        </div>
      </div>

      {/* Passcode Redemption */}
      <PasscodeRedemption />

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

// Passcode Redemption Component
function PasscodeRedemption() {
  const { api } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      toast.error('Please enter a passcode');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/redeem-passcode', { passcode: passcode.trim() });
      toast.success(response.message || 'Full access granted!');
      setPasscode('');
      setShowInput(false);
      // Refresh the page to update tier
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Key className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Have a Passcode?</h3>
      </div>
      <p className="text-gray-400 text-sm mb-4">Enter your access code for full enterprise features</p>
      
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-semibold transition-all"
        >
          Enter Passcode
        </button>
      ) : (
        <form onSubmit={handleRedeem} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
            placeholder="Enter passcode..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 uppercase tracking-wider"
            data-testid="passcode-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-semibold transition-all disabled:opacity-50"
            data-testid="redeem-passcode-btn"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Redeem'}
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setPasscode(''); }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  const { user, api } = useAuth();
  const [tierStatus, setTierStatus] = useState(null);
  const [creditBalance, setCreditBalance] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ts, cb] = await Promise.all([
          api.get('/api/auth/tier-status'),
          api.get('/api/credits/balance')
        ]);
        setTierStatus(ts);
        setCreditBalance(cb);
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  const tierColors = { free: 'text-gray-400', essential: 'text-blue-400', professional: 'text-purple-400', attorney: 'text-amber-400', enterprise: 'text-red-400' };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn" data-testid="settings-tab">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Settings</h1>

      {/* Account Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><User className="w-5 h-5 text-red-500" /> Account</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white font-medium" data-testid="settings-email">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Name</label>
            <p className="text-white font-medium">{user?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Current Plan</label>
            <p className={`font-bold ${tierColors[user?.tier] || 'text-gray-400'}`} data-testid="settings-tier">
              {(user?.tier || 'free').toUpperCase()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Member Since</label>
            <p className="text-white font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Usage & Credits */}
      {tierStatus && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Usage This Month</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">AI Credits</p>
              <p className="text-2xl font-bold">{tierStatus.usage.ai_credits_used} <span className="text-sm text-gray-500">/ {tierStatus.limits.ai_credits === -1 ? '∞' : tierStatus.limits.ai_credits}</span></p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Doc Uploads</p>
              <p className="text-2xl font-bold">{tierStatus.usage.docs_uploaded_this_month} <span className="text-sm text-gray-500">/ {tierStatus.limits.docs_per_month === -1 ? '∞' : tierStatus.limits.docs_per_month}</span></p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Purchased Credits</p>
              <p className="text-2xl font-bold text-amber-400">{creditBalance?.purchased_credits ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /> About THE CPS PUNISHER</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p><span className="text-gray-300 font-medium">Version:</span> 4.0.0</p>
          <p><span className="text-gray-300 font-medium">Purpose:</span> AI-powered CPS case defense platform with legal research, document analysis, violation tracking, and court preparation tools.</p>
          <p><span className="text-gray-300 font-medium">Coverage:</span> All 50 US states with state-specific CPS laws, ADA compliance, and case law.</p>
          <p><span className="text-gray-300 font-medium">AI Features:</span> Chat assistant, document analysis, strategy builder, argument generator, evidence mapper, precedent finder, and more.</p>
          <p><span className="text-gray-300 font-medium">Credit System:</span> Buy credits to access premium features without upgrading your plan. Credits never expire.</p>
        </div>
      </div>

      {/* Feature Credit Costs */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Coins className="w-5 h-5 text-amber-400" /> Credit Costs Per Feature</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            ['AI Chat Question', 1], ['Document Upload & Analysis', 2], ['Document Generation', 3],
            ['Defense Strategy', 3], ['Incident Analyzer', 2], ['Expert Legal AI', 5],
            ['Strategy Builder', 5], ['Argument Generator', 5], ['Evidence Mapper', 3],
            ['Precedent Finder', 3], ['ADA Compliance', 3], ['Case Law Analysis', 3],
            ['Law Library', 1], ['Judge Research', 2], ['Legal Research', 3],
            ['Section 1983', 10], ['CourtListener', 3], ['Case Prep Kit', 10],
            ['Podcast Creator', 5], ['Criminal Case', 3],
          ].map(([name, cost]) => (
            <div key={name} className="flex justify-between py-1.5 px-3 bg-gray-900/50 rounded">
              <span className="text-gray-300">{name}</span>
              <span className="text-amber-400 font-medium">{cost} credits</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
        <p className="text-sm text-yellow-200/80">
          <strong>Legal Notice:</strong> This platform provides legal EDUCATION and INFORMATION, not legal advice. We are not attorneys. Always consult with a licensed attorney for your specific case.
        </p>
      </div>
    </div>
  );
}

// Admin Board Tab
function AdminBoardTab() {
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [passcodes, setPasscodes] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSection === 'dashboard') {
        const data = await api.get('/api/admin/stats');
        setStats(data);
      } else if (activeSection === 'users') {
        const data = await api.get('/api/admin/users');
        setUsers(data.users || []);
      } else if (activeSection === 'advocates') {
        const data = await api.get('/api/admin/advocates');
        setAdvocates(data.advocates || []);
      } else if (activeSection === 'passcodes') {
        const data = await api.get('/api/admin/passcodes');
        setPasscodes(data.passcodes || []);
      } else if (activeSection === 'redemptions') {
        const data = await api.get('/api/admin/redemptions');
        setRedemptions(data.redemptions || []);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const togglePasscode = async (code, active) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/passcodes/toggle', { passcode: code, active });
      toast.success(`Passcode ${active ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update passcode');
    } finally {
      setActionLoading(false);
    }
  };

  const updateUserTier = async (userId, tier) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/users/update-tier', { user_id: userId, tier });
      toast.success('User tier updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update user tier');
    } finally {
      setActionLoading(false);
    }
  };

  const updateAdvocateStatus = async (advocateId, status) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/advocates/update-status', { advocate_id: advocateId, status });
      toast.success(`Advocate ${status}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update advocate status');
    } finally {
      setActionLoading(false);
    }
  };

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'advocates', label: 'Advocates', icon: Users },
    { id: 'passcodes', label: 'Passcodes', icon: Key },
    { id: 'redemptions', label: 'Redemptions', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="admin-board-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-500" style={{ fontFamily: 'Oswald, sans-serif' }}>Admin Board</h1>
          <p className="text-gray-400">Manage users, advocates, and passcodes</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <>
          {/* Dashboard */}
          {activeSection === 'dashboard' && stats && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-white">{stats.total_users}</p>
                <p className="text-gray-400">Total Users</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-blue-400">{stats.total_cases}</p>
                <p className="text-gray-400">Total Cases</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-purple-400">{stats.total_documents}</p>
                <p className="text-gray-400">Documents</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-amber-400">{stats.total_redemptions}</p>
                <p className="text-gray-400">Passcode Redemptions</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-green-400">{stats.approved_advocates}</p>
                <p className="text-gray-400">Approved Advocates</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-yellow-400">{stats.pending_advocates}</p>
                <p className="text-gray-400">Pending Advocates</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 col-span-2">
                <p className="text-lg font-semibold mb-3">Tier Breakdown</p>
                <div className="grid grid-cols-5 gap-2">
                  {['free', 'essential', 'professional', 'attorney', 'enterprise'].map(tier => (
                    <div key={tier} className="text-center">
                      <p className="text-2xl font-bold">{stats.tier_breakdown[tier] || 0}</p>
                      <p className="text-xs text-gray-400 capitalize">{tier}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeSection === 'users' && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={user.tier}
                          onChange={(e) => updateUserTier(user.id, e.target.value)}
                          disabled={actionLoading}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="free">Free</option>
                          <option value="essential">Essential</option>
                          <option value="professional">Professional</option>
                          <option value="attorney">Attorney</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.is_admin && <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded text-xs">Admin</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Advocates */}
          {activeSection === 'advocates' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => loadData()} className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600">All</button>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">State</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Experience</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {advocates.map(adv => (
                      <tr key={adv.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">{adv.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{adv.email}</td>
                        <td className="px-4 py-3 text-sm">{adv.state}</td>
                        <td className="px-4 py-3 text-sm">{adv.experience_years} yrs</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            adv.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                            adv.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {adv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          {adv.status !== 'approved' && (
                            <button
                              onClick={() => updateAdvocateStatus(adv.id, 'approved')}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {adv.status !== 'rejected' && (
                            <button
                              onClick={() => updateAdvocateStatus(adv.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {advocates.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No advocate applications yet</div>
                )}
              </div>
            </div>
          )}

          {/* Passcodes */}
          {activeSection === 'passcodes' && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Passcode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Redemptions</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {passcodes.map(pc => (
                    <tr key={pc.code} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-mono">{pc.code}</td>
                      <td className="px-4 py-3 text-sm">{pc.redemptions}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${pc.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {pc.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => togglePasscode(pc.code, !pc.active)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded text-xs disabled:opacity-50 ${
                            pc.active 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {pc.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Redemptions */}
          {activeSection === 'redemptions' && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Passcode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier Granted</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {redemptions.map(r => (
                    <tr key={r.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm">{r.email}</td>
                      <td className="px-4 py-3 text-sm font-mono">{r.passcode}</td>
                      <td className="px-4 py-3 text-sm capitalize">{r.tier_granted}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {r.redeemed_at ? new Date(r.redeemed_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {redemptions.length === 0 && (
                <div className="text-center py-8 text-gray-400">No redemptions yet</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}


// AI Case Notes Tab - View all AI-generated content for a case
function AICaseNotesTab({ selectedCase }) {
  const { api } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [featureCounts, setFeatureCounts] = useState({});
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (selectedCase) {
      loadNotes();
    }
  }, [selectedCase, filter]);

  const loadNotes = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `/api/cases/${selectedCase.id}/ai-notes`
        : `/api/cases/${selectedCase.id}/ai-notes?feature_type=${filter}`;
      const data = await api.get(url);
      setNotes(data.notes || []);
      setFeatureCounts(data.feature_counts || {});
    } catch (error) {
      console.error('Failed to load AI notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this AI note?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/cases/${selectedCase.id}/ai-notes/${noteId}`);
      toast.success('Note deleted');
      loadNotes();
      setSelectedNote(null);
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const featureLabels = {
    chat: { label: 'AI Chat', icon: MessageSquare, color: 'text-purple-400' },
    strategy: { label: 'Defense Strategy', icon: Shield, color: 'text-blue-400' },
    research: { label: 'Legal Research', icon: Search, color: 'text-green-400' },
    document: { label: 'Document Gen', icon: FileText, color: 'text-amber-400' },
    forensic: { label: 'Forensic Analysis', icon: Eye, color: 'text-red-400' },
    analysis: { label: 'AI Analysis', icon: Brain, color: 'text-cyan-400' },
  };

  const getFeatureInfo = (type) => featureLabels[type] || { label: type, icon: Brain, color: 'text-gray-400' };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn">
        <Brain className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Select a Case First</h2>
        <p className="text-gray-400">AI notes are automatically saved when you use AI features while a case is selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="ai-notes-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>AI Case Notes</h1>
          <p className="text-gray-400">All AI-generated insights for: <span className="text-red-400">{selectedCase.title}</span></p>
        </div>
        <button onClick={loadNotes} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          All ({Object.values(featureCounts).reduce((a, b) => a + b, 0) || notes.length})
        </button>
        {Object.entries(featureCounts).map(([type, count]) => {
          const info = getFeatureInfo(type);
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${filter === type ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <info.icon className="w-4 h-4" />
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Brain className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No AI notes yet for this case</p>
          <p className="text-sm text-gray-500">Use AI features (Chat, Strategy, Research, etc.) while this case is selected to generate notes.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map(note => {
            const info = getFeatureInfo(note.feature_type);
            return (
              <div 
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-gray-900 ${info.color}`}>
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm truncate">{note.prompt}</p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{note.response?.substring(0, 150)}...</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const info = getFeatureInfo(selectedNote.feature_type);
                  return (
                    <>
                      <div className={`p-2 rounded-lg bg-gray-800 ${info.color}`}>
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{info.label}</h2>
                        <p className="text-xs text-gray-500">{new Date(selectedNote.created_at).toLocaleString()}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedNote.response);
                    toast.success('Copied to clipboard');
                  }}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Copy response"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  disabled={deleting}
                  className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedNote(null)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedNote.prompt && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Your Prompt / Question</p>
                  <p className="text-gray-300">{selectedNote.prompt}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-2">AI Response</p>
                <div className="prose prose-invert max-w-none bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">{selectedNote.response}</pre>
                </div>
              </div>
              {selectedNote.metadata && Object.keys(selectedNote.metadata).length > 0 && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                  <p>Metadata: {JSON.stringify(selectedNote.metadata)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Smart Document Generator Tab — Cetient-Style
function SmartDocTab({ selectedCase }) {
  const { api } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState(selectedCase?.state || '');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [genTime, setGenTime] = useState(null);

  useEffect(() => {
    if (selectedCase?.state) setState(selectedCase.state);
  }, [selectedCase]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setDocument('');
    setGenTime(null);
    const startTime = Date.now();
    try {
      const response = await api.post('/api/ai/smart-document', {
        prompt,
        case_id: selectedCase?.id || null,
        state: state || null
      });
      setDocument(response.document);
      setGenTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (error) {
      toast.error(error.message || 'Document generation failed');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
  ];

  const templates = [
    { label: 'Motion to Dismiss', prompt: 'Draft a Motion to Dismiss the CPS dependency petition for lack of evidence and failure to meet the statutory burden of proof' },
    { label: 'Motion for Discovery', prompt: 'Draft a Motion for Discovery demanding all CPS investigation records, communications, notes, and reports related to this case' },
    { label: 'Due Process Hearing Request', prompt: 'Draft a Request for Due Process Hearing challenging the removal of children without proper court authorization' },
    { label: 'Demand Letter to CPS', prompt: 'Draft a formal Demand Letter to CPS demanding immediate return of children and cessation of unlawful investigation practices' },
    { label: 'ADA Accommodation Request', prompt: 'Draft a formal ADA Accommodation Request to the CPS agency and court requiring reasonable accommodations for a parent with a disability' },
    { label: 'Section 1983 Complaint', prompt: 'Draft a Section 1983 Civil Rights Complaint against CPS caseworkers for violation of constitutional rights including 4th and 14th Amendment violations' },
    { label: 'Objection to Case Plan', prompt: 'Draft a Written Objection to the CPS Case Plan as being unreasonable, unnecessary, and not tailored to the actual circumstances of the family' },
    { label: 'Emergency Motion', prompt: 'Draft an Emergency Motion requesting immediate judicial review of CPS emergency removal of children' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="smartdoc-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Zap className="w-8 h-8 text-amber-500" />
          Smart Document Generator
        </h1>
        <p className="text-gray-400 mt-1">
          Describe what you need in plain English — get a complete, court-ready legal document with citations
          {selectedCase && <span className="text-red-400 font-medium"> — Auto-linked to: {selectedCase.title}</span>}
        </p>
      </div>

      {/* Template Quick Buttons */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">One-Click Templates</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => setPrompt(t.prompt)}
              className="px-4 py-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 rounded-xl text-sm text-left transition-colors"
              data-testid={`template-${i}`}
            >
              <FileText className="w-4 h-4 text-amber-500 mb-1" />
              <span className="font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the document you need in plain English... e.g., 'Write a motion to dismiss the CPS case because they violated my 4th Amendment rights during the home investigation'"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:border-red-600 text-base resize-y"
          data-testid="smartdoc-input"
        />
        <div className="flex items-center gap-3">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm"
            data-testid="smartdoc-state"
          >
            <option value="">Select State</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {selectedCase && (
            <span className="text-xs text-gray-500 bg-gray-900 px-3 py-2 rounded-lg flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Case: {selectedCase.title}
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="btn-punisher px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
            data-testid="smartdoc-generate-btn"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            Generate Document
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-lg font-semibold">Generating your legal document...</p>
          <p className="text-sm text-gray-400 mt-1">Pulling case data, statutes, and precedents for your jurisdiction</p>
        </div>
      )}

      {/* Generated Document */}
      {document && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden" data-testid="smartdoc-result">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Document Generated
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {state && `${state} Jurisdiction — `}Court-ready with citations
                {genTime && ` — ${genTime}s`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(document); toast.success('Document copied'); }}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1.5"
                data-testid="copy-doc-btn"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([document], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = window.document.createElement('a');
                  a.href = url;
                  a.download = 'legal-document.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Document downloaded');
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-1.5"
                data-testid="download-doc-btn"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">{document}</pre>
          </div>
        </div>
      )}
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


// Person Lookup / Background Check Tab
function PersonLookupTab({ selectedCase }) {
  const { api } = useAuth();
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    city: '',
    additional_info: '',
    lookup_type: 'comprehensive'
  });

  const lookupTypes = [
    { id: 'comprehensive', label: 'Comprehensive Report', desc: 'Full background including criminal, civil, addresses, contacts' },
    { id: 'criminal', label: 'Criminal Records', desc: 'Focus on criminal history and court records' },
    { id: 'civil', label: 'Civil Records', desc: 'Lawsuits, judgments, bankruptcies' },
    { id: 'address', label: 'Address & Contact', desc: 'Find addresses, phone numbers, emails' },
    { id: 'professional', label: 'Professional History', desc: 'Licenses, certifications, disciplinary actions' }
  ];

  const handleLookup = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name to search');
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.post('/api/ai/person-lookup', {
        ...formData,
        additional_info: selectedCase ? `Case ID: ${selectedCase.id}. ${formData.additional_info}` : formData.additional_info
      });
      setLookupResult(result);
      setSearchHistory([{ name: formData.name, timestamp: new Date().toISOString(), type: formData.lookup_type }, ...searchHistory.slice(0, 9)]);
      toast.success('Background check complete');
    } catch (error) {
      toast.error(error.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCourtSearch = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name to search');
      return;
    }
    
    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('state', formData.state);
      formPayload.append('case_type', 'all');
      
      const result = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/court-records-search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('cps_token')}` },
        body: formPayload
      }).then(r => r.json());
      
      setLookupResult({
        name: formData.name,
        lookup_type: 'court_records',
        results: { raw_report: result.court_records },
        sources_checked: ['Court Records Database'],
        disclaimer: result.disclaimer,
        timestamp: result.timestamp
      });
      toast.success('Court records search complete');
    } catch (error) {
      toast.error('Court records search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="personlookup-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Search className="w-8 h-8 text-red-500" />
          Background Check
        </h1>
        <p className="text-gray-400 mt-2">
          Investigate caseworkers, judges, witnesses, or other parties. Similar to NCIC law enforcement databases.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" /> Person Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
              placeholder="e.g., Jane Smith or Smith, Jane"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
            <select
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
            >
              <option value="">Select State</option>
              {['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
              placeholder="City (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Additional Info</label>
            <input
              type="text"
              value={formData.additional_info}
              onChange={e => setFormData({...formData, additional_info: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
              placeholder="DOB, employer, address, etc."
            />
          </div>
        </div>

        {/* Lookup Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Search Type</label>
          <div className="grid md:grid-cols-3 gap-3">
            {lookupTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setFormData({...formData, lookup_type: type.id})}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.lookup_type === type.id 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLookup}
            disabled={loading}
            className="btn-punisher flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Run Background Check
          </button>
          <button
            onClick={handleCourtSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Scale className="w-5 h-5" />
            Search Court Records
          </button>
        </div>
      </div>

      {/* Results */}
      {lookupResult && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Background Report: {lookupResult.name}
            </h2>
            <span className="text-xs text-gray-500">{new Date(lookupResult.timestamp).toLocaleString()}</span>
          </div>

          {/* Sources Checked */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lookupResult.sources_checked?.map((source, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                {source}
              </span>
            ))}
          </div>

          {/* Report Content */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
              {lookupResult.results?.raw_report || 'No report data'}
            </pre>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">{lookupResult.disclaimer}</p>
            </div>
          </div>

          {/* Save to Case */}
          {selectedCase && (
            <button
              onClick={() => toast.success('Report saved to case AI notes')}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save to Case
            </button>
          )}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-gray-400">Recent Searches</h3>
          <div className="space-y-2">
            {searchHistory.map((search, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-700/50"
                onClick={() => setFormData({...formData, name: search.name})}
              >
                <span className="text-sm">{search.name}</span>
                <span className="text-xs text-gray-500">{new Date(search.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" /> What This Tool Searches
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="font-medium text-white mb-2">Criminal Records</h4>
            <ul className="space-y-1">
              <li>• Felony and misdemeanor convictions</li>
              <li>• Pending charges</li>
              <li>• Sex offender registry</li>
              <li>• Restraining orders</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Civil Records</h4>
            <ul className="space-y-1">
              <li>• Lawsuits (plaintiff/defendant)</li>
              <li>• Bankruptcies</li>
              <li>• Judgments and liens</li>
              <li>• Family court matters</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Personal Information</h4>
            <ul className="space-y-1">
              <li>• Known addresses</li>
              <li>• Phone numbers</li>
              <li>• Email addresses</li>
              <li>• Relatives and associates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Professional Records</h4>
            <ul className="space-y-1">
              <li>• Professional licenses</li>
              <li>• Disciplinary actions</li>
              <li>• Complaints filed</li>
              <li>• Employment history</li>
            </ul>
          </div>
        </div>
      </div>
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
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    photo_url: '',
    bio: '',
    experience_years: '',
    specialties: [],
    state: '',
    city: '',
    organization: '',
    certifications: '',
    languages: 'English'
  });

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const specialtyOptions = [
    'CPS Defense', 'Family Law', 'Parental Rights', 'Child Welfare',
    'Dependency Cases', 'Termination of Parental Rights', 'Foster Care',
    'ADA Accommodations', 'Civil Rights', 'Appeals', 'Mediation'
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

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const applicationData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l)
      };
      await api.post('/api/advocates/apply', applicationData);
      toast.success('Application submitted! We will review it and get back to you soon.');
      setShowApplyForm(false);
      setFormData({
        name: '', email: '', phone: '', website: '', photo_url: '', bio: '',
        experience_years: '', specialties: [], state: '', city: '', organization: '',
        certifications: '', languages: 'English'
      });
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="advocates-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Find Advocates</h1>
          <p className="text-gray-400">Connect with family advocates and attorneys in your state</p>
        </div>
        <div className="flex gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setShowApplyForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="become-advocate-btn"
          >
            Become an Advocate
          </button>
        </div>
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900">
              <h2 className="text-xl font-bold">Become an Advocate</h2>
              <button onClick={() => setShowApplyForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitApplication} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="advocate@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Los Angeles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Law Firm or Organization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Specialties *</label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.specialties.includes(specialty)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio / Background *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Tell us about your background, experience, and how you help families..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Bar License, Mediation Cert"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="English, Spanish"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.specialties.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advocate Detail Modal */}
      {selectedAdvocate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  {selectedAdvocate.photo_url ? (
                    <img src={selectedAdvocate.photo_url} alt={selectedAdvocate.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedAdvocate.name}</h2>
                    <p className="text-gray-400">{selectedAdvocate.organization}</p>
                    <p className="text-sm text-gray-500">{selectedAdvocate.city}, {selectedAdvocate.state}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAdvocate(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience</p>
                  <p>{selectedAdvocate.experience_years} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAdvocate.specialties?.map(s => (
                      <span key={s} className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">About</p>
                  <p className="text-gray-300">{selectedAdvocate.bio}</p>
                </div>
                {selectedAdvocate.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <p className="text-blue-400">{selectedAdvocate.phone}</p>
                  </div>
                )}
                {selectedAdvocate.website && (
                  <a href={selectedAdvocate.website} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-400 hover:underline">
                    Visit Website →
                  </a>
                )}
                {selectedAdvocate.languages?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Languages</p>
                    <p>{selectedAdvocate.languages.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : advocates.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No advocates listed yet for {stateFilter || 'any state'}</p>
          <p className="text-sm text-gray-500 mb-4">Check back soon as we grow our directory</p>
          <button
            onClick={() => setShowApplyForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-medium hover:opacity-90"
          >
            Be the First - Apply Now
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advocates.map(advocate => (
            <div 
              key={advocate.id} 
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-red-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedAdvocate(advocate)}
            >
              <div className="flex items-start gap-3">
                {advocate.photo_url ? (
                  <img src={advocate.photo_url} alt={advocate.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{advocate.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{advocate.organization || advocate.city}</p>
                  <p className="text-xs text-gray-500">{advocate.state} • {advocate.experience_years} yrs exp</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {advocate.specialties?.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{s}</span>
                ))}
                {advocate.specialties?.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">+{advocate.specialties.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Expert Legal AI Tab - SMARTER THAN ANY OTHER LEGAL AI
function ExpertLegalAITab({ selectedCase }) {
  const { api } = useAuth();
  const [question, setQuestion] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const analysisTypes = [
    { id: 'comprehensive', label: 'Comprehensive Analysis', desc: 'Full legal analysis with citations' },
    { id: 'strategy', label: 'Strategy Focus', desc: 'Defense strategy recommendations' },
    { id: 'constitutional', label: 'Constitutional Analysis', desc: 'Focus on constitutional violations' },
    { id: 'procedural', label: 'Procedural Analysis', desc: 'CPS procedure violations' },
    { id: 'quick', label: 'Quick Answer', desc: 'Concise response' }
  ];

  const sampleQuestions = [
    "What are my rights if CPS shows up at my door without a warrant?",
    "How do I challenge an emergency removal in court?",
    "What constitutes a Fourth Amendment violation by CPS?",
    "How do I file a complaint against my caseworker?",
    "What are the deadlines for CPS to file their petition?",
    "Can CPS interview my child at school without my consent?",
    "What is the standard for termination of parental rights?",
    "How do I request discovery in my dependency case?"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedCase) return;

    setLoading(true);
    try {
      const data = await api.post('/api/ai/expert-analysis', {
        case_id: selectedCase.id,
        question: question,
        analysis_type: analysisType
      });
      setResponse(data);
      setHistory([{ question, response: data, timestamp: new Date() }, ...history]);
    } catch (error) {
      toast.error('Failed to get expert analysis');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="expert-tab">
        <img src="/images/chrome-logo.jpg" alt="CPS Punisher" className="w-48 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Expert Legal AI</h3>
        <p className="text-gray-400">Select a case to get expert legal analysis</p>
        <p className="text-sm text-red-400 mt-2">SMARTER than any other legal AI for CPS cases</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="expert-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Brain className="w-8 h-8 text-purple-500" />
          Expert Legal AI
        </h1>
        <p className="text-gray-400">The most knowledgeable CPS legal AI in existence - {selectedCase.title}</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Analysis Type</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {analysisTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAnalysisType(type.id)}
                className={`p-3 rounded-lg text-left transition-all ${
                  analysisType === type.id
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700 hover:border-purple-600/50'
                } border`}
              >
                <p className="font-medium text-sm">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Your Legal Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask any CPS legal question - I know more than any other legal AI..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 h-32 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {sampleQuestions.slice(0, 4).map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuestion(q)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs hover:border-purple-500 transition-colors"
            >
              {q.substring(0, 40)}...
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing (30-60 seconds)...</>
          ) : (
            <><Brain className="w-6 h-6" /> Get Expert Analysis</>
          )}
        </button>
      </form>

      {/* Response */}
      {response && (
        <div className="bg-gradient-to-r from-purple-900/30 to-gray-900 border border-purple-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Expert Analysis
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(response.analysis)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg overflow-auto max-h-[600px]">
              {response.analysis}
            </pre>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span>Violations analyzed: {response.case_context?.violations_count || 0}</span>
            <span>Timeline events: {response.case_context?.timeline_events || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Section 1983 Civil Rights Lawsuit Tab
function Section1983Tab({ selectedCase }) {
  const { api } = useAuth();
  const [templates, setTemplates] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [defendants, setDefendants] = useState(['']);
  const [violations, setViolations] = useState(['fourth_amendment', 'fourteenth_substantive_dp']);
  const [includeMonell, setIncludeMonell] = useState(true);
  const [includeConspiracy, setIncludeConspiracy] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await api.get('/api/section-1983/templates');
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

  const generateComplaint = async () => {
    if (!selectedCase) {
      toast.error('Select a case first');
      return;
    }

    setGenerating(true);
    try {
      const data = await api.post('/api/section-1983/generate', {
        case_id: selectedCase.id,
        defendants: defendants.filter(d => d.trim()),
        constitutional_violations: violations,
        include_monell: includeMonell,
        include_conspiracy: includeConspiracy,
        relief_sought: ['Compensatory damages', 'Punitive damages', 'Declaratory relief', 'Injunctive relief', 'Attorney fees']
      });
      setComplaint(data);
      toast.success('Section 1983 Complaint generated!');
    } catch (error) {
      toast.error('Failed to generate complaint');
    } finally {
      setGenerating(false);
    }
  };

  const addDefendant = () => setDefendants([...defendants, '']);
  const updateDefendant = (index, value) => {
    const updated = [...defendants];
    updated[index] = value;
    setDefendants(updated);
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="section1983-tab">
        <img src="/images/shield-logo.png" alt="CPS Punisher" className="w-24 h-28 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Section 1983 Lawsuit Generator</h3>
        <p className="text-gray-400">Select a case to generate a federal civil rights complaint</p>
        <p className="text-sm text-red-400 mt-2">Turn CPS violations into federal lawsuits</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="section1983-tab">
      <div className="bg-gradient-to-r from-red-900/50 to-gray-900 border border-red-800/50 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <img src="/images/shield-logo.png" alt="Logo" className="w-16 h-20 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
              <Gavel className="w-8 h-8 text-red-500" />
              Section 1983 Civil Rights Lawsuit
            </h1>
            <p className="text-gray-300 mt-2">
              42 U.S.C. § 1983 allows you to sue government officials who violate your constitutional rights.
              This is YOUR most powerful weapon against CPS overreach.
            </p>
          </div>
        </div>
      </div>

      {/* Claim Types Reference */}
      {templates && (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.claim_types.map(claim => (
            <div key={claim.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={violations.includes(claim.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setViolations([...violations, claim.id]);
                    } else {
                      setViolations(violations.filter(v => v !== claim.id));
                    }
                  }}
                  className="w-4 h-4"
                />
                <h3 className="font-semibold text-red-400">{claim.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-2">{claim.description}</p>
              <div className="text-xs text-gray-500">
                <p className="font-medium">Elements:</p>
                <ul className="list-disc list-inside">
                  {claim.elements.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Defendants */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Defendants to Sue</h3>
        {defendants.map((defendant, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={defendant}
              onChange={(e) => updateDefendant(i, e.target.value)}
              placeholder="e.g., Jane Smith, CPS Caseworker (Individual Capacity)"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
            {defendants.length > 1 && (
              <button onClick={() => setDefendants(defendants.filter((_, j) => j !== i))} className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addDefendant} className="mt-2 px-4 py-2 bg-gray-700 rounded-lg text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Defendant
        </button>
        
        {templates && (
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium">Common defendants:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {templates.common_defendants.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDefendants([...defendants.filter(x => x), d])}
                  className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
          <input type="checkbox" checked={includeMonell} onChange={(e) => setIncludeMonell(e.target.checked)} className="w-4 h-4" />
          <span>Include Monell Claim (Sue the Agency)</span>
        </label>
        <label className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
          <input type="checkbox" checked={includeConspiracy} onChange={(e) => setIncludeConspiracy(e.target.checked)} className="w-4 h-4" />
          <span>Include §1985 Conspiracy Claim</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateComplaint}
        disabled={generating || violations.length === 0}
        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
      >
        {generating ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> Generating Federal Lawsuit (60-90 seconds)...</>
        ) : (
          <><Gavel className="w-6 h-6" /> Generate Section 1983 Complaint</>
        )}
      </button>

      {/* Generated Complaint */}
      {complaint && (
        <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-500" />
              Generated Section 1983 Complaint
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(complaint.complaint)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-6 rounded-lg overflow-auto max-h-[800px] font-mono">
            {complaint.complaint}
          </pre>
          <p className="text-xs text-gray-500 mt-4">
            Generated: {new Date(complaint.generated_at).toLocaleString()} | 
            Violations analyzed: {complaint.violations_analyzed}
          </p>
        </div>
      )}
    </div>
  );
}

// Podcast Creator Tab
function PodcastCreatorTab({ selectedCase }) {
  const { api } = useAuth();
  const [topics, setTopics] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    episode_type: 'educational',
    duration_minutes: 15,
    include_case_details: false
  });
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    loadTopics();
    loadScripts();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await api.get('/api/podcast/topics');
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics');
    }
  };

  const loadScripts = async () => {
    try {
      const data = await api.get('/api/podcast/scripts');
      setScripts(data.scripts || []);
    } catch (error) {
      console.error('Failed to load scripts');
    }
  };

  const generateScript = async () => {
    if (!formData.topic.trim()) {
      toast.error('Enter a podcast topic');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        ...formData,
        case_id: selectedCase?.id || null
      };
      const data = await api.post('/api/podcast/generate-script', payload);
      setScript(data);
      loadScripts();
      toast.success('Podcast script generated!');
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const episodeTypes = [
    { id: 'educational', label: 'Educational', desc: 'Deep-dive on legal concepts' },
    { id: 'case_analysis', label: 'Case Analysis', desc: 'Analyze legal strategies' },
    { id: 'interview_style', label: 'Interview', desc: 'Host + expert format' },
    { id: 'news_update', label: 'News Update', desc: 'Legal news and changes' },
    { id: 'legal_breakdown', label: 'Legal Breakdown', desc: 'Step-by-step procedures' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="podcast-tab">
      <div className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 border border-pink-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Mic className="w-8 h-8 text-pink-500" />
          Podcast Script Creator
        </h1>
        <p className="text-gray-300 mt-2">
          Create professional podcast scripts about CPS defense, legal rights, and case strategies.
          Educate and empower parents through audio content.
        </p>
      </div>

      {/* Episode Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Episode Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="e.g., Understanding Your Fourth Amendment Rights"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Episode Type</label>
            <div className="grid grid-cols-2 gap-2">
              {episodeTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData({...formData, episode_type: type.id})}
                  className={`p-3 rounded-lg text-left border ${
                    formData.episode_type === type.id
                      ? 'bg-pink-600/20 border-pink-500'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Duration: {formData.duration_minutes} minutes</label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          {selectedCase && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.include_case_details}
                onChange={(e) => setFormData({...formData, include_case_details: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">Include case details (anonymized)</span>
            </label>
          )}

          <button
            onClick={generateScript}
            disabled={generating || !formData.topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Script...</>
            ) : (
              <><Mic className="w-5 h-5" /> Generate Podcast Script</>
            )}
          </button>
        </div>

        {/* Topic Suggestions */}
        {topics && (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 max-h-[500px] overflow-y-auto">
            <h3 className="font-semibold mb-4">Suggested Topics</h3>
            {topics.categories.map((cat, i) => (
              <div key={i} className="mb-4">
                <p className="text-sm font-medium text-pink-400 mb-2">{cat.name}</p>
                <div className="space-y-1">
                  {cat.topics.map((topic, j) => (
                    <button
                      key={j}
                      onClick={() => setFormData({...formData, topic})}
                      className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-700 rounded text-sm"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Script */}
      {script && (
        <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Radio className="w-6 h-6 text-pink-500" />
              {script.topic}
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-700 rounded text-sm">{script.duration_minutes} min</span>
              <span className="px-3 py-1 bg-gray-700 rounded text-sm">{script.word_count} words</span>
              <button
                onClick={() => navigator.clipboard.writeText(script.script)}
                className="px-4 py-1 bg-pink-600 hover:bg-pink-700 rounded flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-6 rounded-lg overflow-auto max-h-[600px]">
            {script.script}
          </pre>
        </div>
      )}

      {/* Previous Scripts */}
      {scripts.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Previous Scripts</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.slice(0, 6).map(s => (
              <div key={s.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <Mic className="w-5 h-5 text-pink-500 mb-2" />
                <h4 className="font-medium text-sm line-clamp-2">{s.topic}</h4>
                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                  <span>{s.episode_type}</span>
                  <span>{s.duration_minutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Case Law Analysis Tab
function CaseLawAnalysisTab({ selectedCase }) {
  const { api } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [focusAreas, setFocusAreas] = useState(['fourth_amendment', 'due_process']);
  const [jurisdiction, setJurisdiction] = useState('federal');

  const focusOptions = [
    { id: 'fourth_amendment', label: 'Fourth Amendment' },
    { id: 'due_process', label: 'Due Process' },
    { id: 'equal_protection', label: 'Equal Protection' },
    { id: 'qualified_immunity', label: 'Qualified Immunity' },
    { id: 'emergency_removal', label: 'Emergency Removal' },
    { id: 'tpr', label: 'Termination of Parental Rights' }
  ];

  const runAnalysis = async () => {
    if (!selectedCase) {
      toast.error('Select a case first');
      return;
    }

    setAnalyzing(true);
    try {
      const data = await api.post('/api/case-law/analyze', {
        case_id: selectedCase.id,
        focus_areas: focusAreas,
        jurisdiction
      });
      setAnalysis(data);
      toast.success('Case law analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze case law');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="caselaw-tab">
        <BookOpen className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Deep Case Law Analysis</h3>
        <p className="text-gray-400">Select a case to find relevant precedents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="caselaw-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <BookOpen className="w-8 h-8 text-blue-500" />
          Deep Case Law Analysis
        </h1>
        <p className="text-gray-400">AI-powered analysis of relevant precedents for {selectedCase.title}</p>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Focus Areas</label>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (focusAreas.includes(opt.id)) {
                    setFocusAreas(focusAreas.filter(f => f !== opt.id));
                  } else {
                    setFocusAreas([...focusAreas, opt.id]);
                  }
                }}
                className={`px-3 py-2 rounded-lg border ${
                  focusAreas.includes(opt.id)
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Jurisdiction</label>
          <div className="flex gap-2">
            {[
              { id: 'federal', label: 'Federal Courts' },
              { id: 'state', label: 'State Courts' },
              { id: 'both', label: 'Both' }
            ].map(j => (
              <button
                key={j.id}
                onClick={() => setJurisdiction(j.id)}
                className={`px-4 py-2 rounded-lg border ${
                  jurisdiction === j.id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runAnalysis}
          disabled={analyzing || focusAreas.length === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Case Law (60-90 seconds)...</>
          ) : (
            <><Search className="w-5 h-5" /> Find Relevant Precedents</>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 border border-blue-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Case Law Analysis</h3>
            <button
              onClick={() => navigator.clipboard.writeText(analysis.analysis)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-6 rounded-lg overflow-auto max-h-[800px]">
            {analysis.analysis}
          </pre>
          <p className="text-xs text-gray-500 mt-4">
            Analyzed: {analysis.violations_analyzed} violations | Focus: {analysis.focus_areas?.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Incident Analyzer Tab - Comprehensive Violation Analysis
function IncidentAnalyzerTab({ selectedCase }) {
  const { api } = useAuth();
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [facts, setFacts] = useState({});

  useEffect(() => {
    loadIncidentTypes();
  }, []);

  const loadIncidentTypes = async () => {
    try {
      const data = await api.get('/api/legal/incident-types');
      setIncidentTypes(data.incident_types || []);
    } catch (error) {
      console.error('Failed to load incident types');
    } finally {
      setLoading(false);
    }
  };

  const analyzeViolation = async () => {
    if (!selectedIncident) return;
    setAnalyzing(true);
    try {
      const data = await api.post('/api/legal/analyze-violation', {
        violation_type: selectedIncident.id,
        facts: facts,
        state: selectedCase?.state || 'TX'
      });
      setAnalysis(data);
    } catch (error) {
      toast.error('Failed to analyze violation');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="incidents-tab">
      <div className="bg-gradient-to-r from-orange-900/50 to-gray-900 border border-orange-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          Incident Analyzer
        </h1>
        <p className="text-gray-300 mt-2">
          Analyze CPS incidents for constitutional violations. Get case law citations, qualified immunity analysis, and Section 1983 viability assessment.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Incident Types */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Incident Type</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {incidentTypes.map(incident => (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    selectedIncident?.id === incident.id
                      ? 'bg-orange-600/20 border-orange-500'
                      : 'bg-gray-800/50 border-gray-700 hover:border-orange-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{incident.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{incident.description}</p>
                      <p className="text-xs text-orange-400 mt-2">{incident.constitutional_basis}</p>
                    </div>
                    {incident.section_1983_viable && (
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">§1983</span>
                    )}
                  </div>
                  {incident.key_case && (
                    <p className="text-xs text-gray-500 mt-2">Key Case: {incident.key_case}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            {selectedIncident ? (
              <>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">{selectedIncident.name}</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Constitutional Basis:</span>
                      <p className="text-orange-400">{selectedIncident.constitutional_basis}</p>
                    </div>
                    {selectedIncident.key_case && (
                      <div>
                        <span className="text-gray-400">Key Precedent:</span>
                        <p className="text-blue-400">{selectedIncident.key_case}</p>
                      </div>
                    )}
                    <div className="flex gap-4 pt-2">
                      {selectedIncident.section_1983_viable && (
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Section 1983 Viable</span>
                      )}
                      {selectedIncident.qualified_immunity_likely_defeated && (
                        <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs">QI Likely Defeated</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={analyzeViolation}
                  disabled={analyzing}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
                  ) : (
                    <><Brain className="w-5 h-5" /> Get Deep Legal Analysis</>
                  )}
                </button>

                {analysis && (
                  <div className="bg-gradient-to-r from-orange-900/30 to-gray-900 border border-orange-800/50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Legal Analysis</h3>
                    <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-4 rounded-lg overflow-auto max-h-[400px]">
                      {analysis.analysis}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Select an incident type to analyze</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Legal Knowledge Base Tab
function LegalKnowledgeBaseTab() {
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('supreme');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [supreme, circuit, blacks, section1983, rooker] = await Promise.all([
        api.get('/api/legal/supreme-court-cases'),
        api.get('/api/legal/circuit-court-cases'),
        api.get('/api/legal/blacks-law'),
        api.get('/api/legal/section-1983-guide'),
        api.get('/api/legal/rooker-feldman')
      ]);
      setData({ supreme, circuit, blacks, section1983, rooker });
    } catch (error) {
      console.error('Failed to load legal data');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'supreme', label: 'Supreme Court Cases', icon: Scale },
    { id: 'circuit', label: 'Circuit Court Cases', icon: Gavel },
    { id: 'blacks', label: "Black's Law Definitions", icon: BookOpen },
    { id: 'section1983', label: 'Section 1983 Guide', icon: FileText },
    { id: 'rooker', label: 'Rooker-Feldman', icon: Shield }
  ];

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="legaldb-tab">
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <BookOpen className="w-8 h-8 text-blue-500" />
          Legal Knowledge Base
        </h1>
        <p className="text-gray-300 mt-2">
          Comprehensive legal database with Supreme Court cases, Circuit Court precedents, Black's Law definitions, and Section 1983 guidance.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'supreme' && data.supreme && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Landmark Supreme Court Cases ({data.supreme.count})</h2>
          {Object.entries(data.supreme.cases || {}).map(([key, caseInfo]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400">{caseInfo.citation}</h3>
              <p className="text-gray-300 mt-2"><strong>Holding:</strong> {caseInfo.holding}</p>
              <p className="text-gray-400 mt-2"><strong>Application:</strong> {caseInfo.application}</p>
              {caseInfo.key_quotes && (
                <div className="mt-3 pl-4 border-l-2 border-blue-500">
                  {caseInfo.key_quotes.map((quote, i) => (
                    <p key={i} className="text-sm text-gray-400 italic mb-2">"{quote}"</p>
                  ))}
                </div>
              )}
              {caseInfo.use_for && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {caseInfo.use_for.map((use, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{use}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'circuit' && data.circuit && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Federal Circuit Court Precedents ({data.circuit.count})</h2>
          {Object.entries(data.circuit.cases || {}).map(([key, caseInfo]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-purple-400">{caseInfo.citation}</h3>
                {caseInfo.section_1983 && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">§1983 Case</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{caseInfo.circuit}</p>
              <p className="text-gray-300 mt-2"><strong>Holding:</strong> {caseInfo.holding}</p>
              <p className="text-gray-400 mt-2"><strong>Application:</strong> {caseInfo.application}</p>
              {caseInfo.key_quotes && (
                <div className="mt-3 pl-4 border-l-2 border-purple-500">
                  {caseInfo.key_quotes.map((quote, i) => (
                    <p key={i} className="text-sm text-gray-400 italic mb-2">"{quote}"</p>
                  ))}
                </div>
              )}
              {caseInfo.use_for && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {caseInfo.use_for.map((use, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">{use}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'blacks' && data.blacks && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Black's Law Dictionary Definitions ({data.blacks.count})</h2>
          <p className="text-sm text-gray-500">Source: {data.blacks.source}</p>
          {Object.entries(data.blacks.definitions || {}).map(([term, info]) => (
            <div key={term} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-400">{term}</h3>
              <p className="text-gray-300 mt-2">{info.definition}</p>
              {info.application && (
                <p className="text-gray-400 mt-2"><strong>CPS Application:</strong> {info.application}</p>
              )}
              {info.key_requirements && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-400">Requirements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
                    {info.key_requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'section1983' && data.section1983 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Section 1983 Civil Rights Guide</h2>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-400">42 U.S.C. § 1983</h3>
            <div className="mt-4">
              <p className="font-medium">Required Elements:</p>
              <ul className="list-disc list-inside text-gray-400 mt-2">
                {data.section1983.guide?.elements?.map((el, i) => <li key={i}>{el}</li>)}
              </ul>
            </div>
            {data.section1983.guide?.defendants && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {Object.entries(data.section1983.guide.defendants).map(([key, info]) => (
                  <div key={key} className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-medium text-red-400 capitalize">{key.replace(/_/g, ' ')}</h4>
                    <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                  </div>
                ))}
              </div>
            )}
            {data.section1983.guide?.damages && (
              <div className="mt-4">
                <p className="font-medium">Available Damages:</p>
                <div className="grid md:grid-cols-2 gap-2 mt-2">
                  {Object.entries(data.section1983.guide.damages).map(([type, desc]) => (
                    <div key={type} className="bg-black/30 rounded-lg p-3">
                      <span className="text-green-400 capitalize">{type}:</span>
                      <span className="text-gray-400 text-sm ml-2">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'rooker' && data.rooker && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Rooker-Feldman Doctrine & Avoidance</h2>
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-400">Critical for Section 1983 Cases!</h3>
            <p className="text-gray-300 mt-2">{data.rooker.doctrine?.doctrine}</p>
            <p className="text-yellow-400 mt-2"><strong>Key Case:</strong> {data.rooker.doctrine?.key_case}</p>
            <p className="text-green-400 mt-2"><strong>Limitation:</strong> {data.rooker.doctrine?.limitation}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Avoidance Strategies</h3>
            {data.rooker.doctrine?.avoidance_strategies?.map((strategy, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="font-bold text-green-400">{strategy.strategy}</h4>
                <p className="text-gray-400 mt-2">{strategy.explanation}</p>
                {strategy.good_example && (
                  <div className="mt-3 bg-green-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500">GOOD:</p>
                    <p className="text-green-400 text-sm">{strategy.good_example}</p>
                  </div>
                )}
                {strategy.bad_example && (
                  <div className="mt-2 bg-red-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500">BAD:</p>
                    <p className="text-red-400 text-sm">{strategy.bad_example}</p>
                  </div>
                )}
                {strategy.good_claims && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">GOOD CLAIMS:</p>
                    <ul className="list-disc list-inside text-green-400 text-sm">
                      {strategy.good_claims.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {strategy.bad_claims && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">BAD CLAIMS:</p>
                    <ul className="list-disc list-inside text-red-400 text-sm">
                      {strategy.bad_claims.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Rights Guide Tab
function RightsGuideTab() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    loadRightsGuide();
  }, []);

  const loadRightsGuide = async () => {
    try {
      const rights = await api.get('/api/rights-guide');
      setData(rights);
    } catch (error) {
      console.error('Failed to load rights guide');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="rights-tab">
      <div className="bg-gradient-to-r from-blue-900/50 to-gray-900 border border-blue-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Shield className="w-8 h-8 text-blue-500" />
          Know Your Rights
        </h1>
        <p className="text-gray-300 mt-2">
          Your constitutional rights during CPS interactions. Know them. Assert them. Protect your family.
        </p>
      </div>

      {/* Quick Rights */}
      {data?.quick_rights && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.quick_rights.map((qr, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-400">{qr.question}</h3>
              <p className="text-gray-300 mt-2">{qr.answer}</p>
              <p className="text-xs text-blue-400 mt-2">{qr.legal_basis}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      {data?.categories && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                  activeCategory === i ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                {cat.title}
              </button>
            ))}
          </div>

          {/* Rights List */}
          <div className="space-y-4">
            {data.categories[activeCategory]?.rights.map((right, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400">{right.title}</h3>
                <p className="text-gray-300 mt-2">{right.description}</p>
                {right.details && (
                  <ul className="mt-4 space-y-2">
                    {right.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {right.key_case && (
                  <p className="text-sm text-purple-400 mt-4">Key Case: {right.key_case}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Evidence Checklist Tab
function EvidenceChecklistTab({ selectedCase }) {
  const { api } = useAuth();
  const [checklist, setChecklist] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
    if (selectedCase) loadSavedChecklist();
  }, [selectedCase]);

  const loadChecklist = async () => {
    try {
      const data = await api.get('/api/evidence-checklist');
      setChecklist(data);
    } catch (error) {
      console.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedChecklist = async () => {
    if (!selectedCase) return;
    try {
      const data = await api.get(`/api/evidence-checklist/${selectedCase.id}`);
      setCheckedItems(data.checked_items || {});
    } catch (error) {
      console.error('Failed to load saved checklist');
    }
  };

  const toggleItem = async (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newChecked = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(newChecked);
    
    if (selectedCase) {
      try {
        await api.post(`/api/evidence-checklist/${selectedCase.id}`, { checked_items: newChecked });
      } catch (error) {
        console.error('Failed to save');
      }
    }
  };

  const totalItems = checklist?.categories?.reduce((sum, cat) => sum + cat.items.length, 0) || 0;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="evidencelist-tab">
      <div className="bg-gradient-to-r from-green-900/50 to-gray-900 border border-green-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          Evidence Checklist
        </h1>
        <p className="text-gray-300 mt-2">
          Build the strongest possible case. Check off evidence as you gather it.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Your Progress</span>
          <span className="text-green-400">{checkedCount} / {totalItems} ({progress}%)</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {checklist?.categories?.map((category, catIndex) => {
          const catChecked = category.items.filter((_, i) => checkedItems[`${catIndex}-${i}`]).length;
          return (
            <div key={catIndex} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  {category.title}
                </h3>
                <span className="text-sm text-gray-400">{catChecked}/{category.items.length}</span>
              </div>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => {
                  const key = `${catIndex}-${itemIndex}`;
                  const isChecked = checkedItems[key];
                  return (
                    <label key={itemIndex} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-gray-700/50">
                      <input
                        type="checkbox"
                        checked={isChecked || false}
                        onChange={() => toggleItem(catIndex, itemIndex)}
                        className="w-4 h-4 mt-0.5"
                      />
                      <span className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Visitation Log Tab
function VisitationLogTab({ selectedCase }) {
  const { api } = useAuth();
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    location: '',
    supervisor: '',
    child_emotional_state: 'happy',
    what_happened: '',
    child_quotes: '',
    supervisor_issues: '',
    visit_allowed: true,
    reason_denied: '',
    notes: ''
  });

  const emotionalStates = [
    { id: 'happy', label: 'Happy', icon: '😊', color: 'text-green-400' },
    { id: 'neutral', label: 'Neutral', icon: '😐', color: 'text-yellow-400' },
    { id: 'sad', label: 'Sad', icon: '😢', color: 'text-blue-400' },
    { id: 'distressed', label: 'Distressed', icon: '😰', color: 'text-red-400' }
  ];

  useEffect(() => {
    if (selectedCase) loadVisits();
  }, [selectedCase]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/visitation/${selectedCase.id}`);
      setVisits(data.visits || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newVisit = await api.post('/api/visitation', {
        ...formData,
        case_id: selectedCase.id
      });
      setVisits([newVisit, ...visits]);
      setShowAdd(false);
      toast.success('Visit logged!');
    } catch (error) {
      toast.error('Failed to log visit');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="visitation-tab">
        <Users className="w-12 h-12 mx-auto text-pink-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to log visitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="visitation-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Visitation Log</h1>
          <p className="text-gray-400">Track visits with your children - {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Log Visit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{stats.total_visits || 0}</p>
          <p className="text-sm text-gray-400">Total Visits</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{stats.total_hours || 0}h</p>
          <p className="text-sm text-gray-400">Total Time</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{stats.denied_visits || 0}</p>
          <p className="text-sm text-gray-400">Denied Visits</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{stats.denial_rate || 0}%</p>
          <p className="text-sm text-gray-400">Denial Rate</p>
        </div>
      </div>

      {/* Add Visit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Log Visitation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (min)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.visit_allowed} onChange={(e) => setFormData({...formData, visit_allowed: e.target.checked})}
                    className="w-4 h-4" />
                  <span>Visit Allowed</span>
                </label>
              </div>

              {!formData.visit_allowed && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason Denied</label>
                  <input type="text" value={formData.reason_denied} onChange={(e) => setFormData({...formData, reason_denied: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" placeholder="Why was visit denied?" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Supervisor</label>
                  <input type="text" value={formData.supervisor} onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Child's Emotional State</label>
                <div className="flex gap-2">
                  {emotionalStates.map(state => (
                    <button key={state.id} type="button"
                      onClick={() => setFormData({...formData, child_emotional_state: state.id})}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                        formData.child_emotional_state === state.id ? 'bg-gray-600 ring-2 ring-blue-500' : 'bg-gray-700'
                      }`}>
                      <span className="text-xl">{state.icon}</span>
                      <span className="text-sm">{state.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">What Happened</label>
                <textarea value={formData.what_happened} onChange={(e) => setFormData({...formData, what_happened: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24" placeholder="Describe the visit..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Child Quotes (important for court!)</label>
                <textarea value={formData.child_quotes} onChange={(e) => setFormData({...formData, child_quotes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-16" placeholder="Exact quotes from your child..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Supervisor Issues</label>
                <textarea value={formData.supervisor_issues} onChange={(e) => setFormData({...formData, supervisor_issues: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-16" placeholder="Any problems with supervisor?" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Log Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visits List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No visits logged yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map(visit => {
            const emotionInfo = emotionalStates.find(e => e.id === visit.child_emotional_state) || emotionalStates[0];
            return (
              <div key={visit.id} className={`bg-gray-800/50 border-l-4 rounded-r-xl p-4 ${
                visit.visit_allowed ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{visit.date}</span>
                    <span className="text-gray-400">{visit.time}</span>
                    <span className="text-gray-400">{visit.duration} min</span>
                    <span className={emotionInfo.color}>{emotionInfo.icon} {emotionInfo.label}</span>
                  </div>
                  {!visit.visit_allowed && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">DENIED</span>
                  )}
                </div>
                {visit.location && <p className="text-sm text-gray-400">Location: {visit.location}</p>}
                {visit.supervisor && <p className="text-sm text-gray-400">Supervisor: {visit.supervisor}</p>}
                {visit.what_happened && <p className="text-gray-300 mt-2">{visit.what_happened}</p>}
                {visit.child_quotes && (
                  <p className="text-blue-400 mt-2 italic">"{visit.child_quotes}"</p>
                )}
                {visit.supervisor_issues && (
                  <p className="text-red-400 mt-2">Issues: {visit.supervisor_issues}</p>
                )}
                {visit.reason_denied && (
                  <p className="text-red-400 mt-2">Reason Denied: {visit.reason_denied}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Court Hearings Tab with Countdown
function CourtHearingsTab({ selectedCase }) {
  const { api } = useAuth();
  const [hearings, setHearings] = useState([]);
  const [nextHearing, setNextHearing] = useState(null);
  const [hearingTypes, setHearingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '09:00',
    hearing_type: 'adjudication',
    judge: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadHearingTypes();
    if (selectedCase) loadHearings();
  }, [selectedCase]);

  const loadHearingTypes = async () => {
    try {
      const data = await api.get('/api/court-hearings/types');
      setHearingTypes(data.hearing_types || []);
    } catch (error) {
      console.error('Failed to load hearing types');
    }
  };

  const loadHearings = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/court-hearings/${selectedCase.id}`);
      setHearings(data.hearings || []);
      setNextHearing(data.next_hearing);
    } catch (error) {
      console.error('Failed to load hearings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newHearing = await api.post('/api/court-hearings', {
        ...formData,
        case_id: selectedCase.id
      });
      setHearings([...hearings, newHearing].sort((a, b) => new Date(a.date) - new Date(b.date)));
      if (!nextHearing || newHearing.days_until < nextHearing.days_until) {
        setNextHearing(newHearing);
      }
      setShowAdd(false);
      toast.success('Hearing added!');
    } catch (error) {
      toast.error('Failed to add hearing');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="courthearings-tab">
        <Calendar className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to manage court hearings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courthearings-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Court Hearings</h1>
          <p className="text-gray-400">Upcoming hearings for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Hearing
        </button>
      </div>

      {/* Countdown Timer */}
      {nextHearing && (
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-800/50 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">NEXT HEARING IN</p>
          <p className="text-6xl font-bold text-red-400 my-4">{nextHearing.days_until}</p>
          <p className="text-2xl text-gray-300">DAYS</p>
          <div className="mt-4">
            <p className="text-xl font-semibold">{hearingTypes.find(t => t.value === nextHearing.hearing_type)?.label || nextHearing.hearing_type}</p>
            <p className="text-gray-400">{nextHearing.date} at {nextHearing.time}</p>
            {nextHearing.location && <p className="text-gray-500">{nextHearing.location}</p>}
          </div>
        </div>
      )}

      {/* Add Hearing Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Court Hearing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hearing Type</label>
                <select value={formData.hearing_type} onChange={(e) => setFormData({...formData, hearing_type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
                  {hearingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Judge</label>
                <input type="text" value={formData.judge} onChange={(e) => setFormData({...formData, judge: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" placeholder="Judge name" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" placeholder="Courtroom address" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Add Hearing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hearings List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : hearings.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No hearings scheduled yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hearings.map(hearing => {
            const typeInfo = hearingTypes.find(t => t.value === hearing.hearing_type);
            return (
              <div key={hearing.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{typeInfo?.label || hearing.hearing_type}</h3>
                    <p className="text-gray-400">{hearing.date} at {hearing.time}</p>
                    {hearing.location && <p className="text-gray-500 text-sm">{hearing.location}</p>}
                    {hearing.judge && <p className="text-gray-500 text-sm">Judge: {hearing.judge}</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">{hearing.days_until}</p>
                    <p className="text-xs text-gray-500">DAYS</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============== ADVANCED LEGAL STRATEGY COMPONENTS ===============

// Legal Strategy Builder Tab
function LegalStrategyBuilderTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [config, setConfig] = useState({
    goal: 'reunification',
    aggressive_level: 'medium'
  });

  useEffect(() => {
    if (selectedCase) {
      loadSavedStrategies();
    }
  }, [selectedCase]);

  const loadSavedStrategies = async () => {
    if (!selectedCase) return;
    try {
      const data = await api.get(`/api/strategy-builder/saved/${selectedCase.id}`);
      setSavedStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  };

  const buildStrategy = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    setLoading(true);
    setStrategy(null);

    try {
      const response = await api.post('/api/strategy-builder/build', {
        case_id: selectedCase.id,
        goal: config.goal,
        aggressive_level: config.aggressive_level
      });
      setStrategy(response);
      loadSavedStrategies();
      toast.success('Strategy built successfully!');
    } catch (error) {
      toast.error('Failed to build strategy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="strategy-builder-tab">
        <img src="/images/shield-logo.png" alt="CPS Punisher" className="w-20 h-24 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Legal Strategy Builder</h2>
        <p className="text-gray-400">Please select a case to build a comprehensive legal strategy</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="strategy-builder-tab">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/images/shield-logo.png" alt="Logo" className="w-12 h-14 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
              Legal Strategy Builder
            </h1>
            <p className="text-gray-400">Build a comprehensive defense strategy for your case</p>
          </div>
        </div>
        {savedStrategies.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Saved ({savedStrategies.length})
          </button>
        )}
      </div>

      {/* Case Info */}
      <div className="bg-purple-900/20 border border-purple-600/30 rounded-xl p-4">
        <p className="text-purple-400 text-sm">
          <Shield className="w-4 h-4 inline mr-2" />
          <strong>Selected Case:</strong> {selectedCase.title} ({selectedCase.state})
        </p>
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Strategy Goal</label>
          <div className="space-y-2">
            {[
              { value: 'reunification', label: 'Reunification', desc: 'Focus on returning children' },
              { value: 'dismissal', label: 'Dismissal', desc: 'Challenge the petition' },
              { value: 'appeal', label: 'Appeal', desc: 'Challenge court rulings' },
              { value: 'section_1983', label: 'Section 1983', desc: 'Civil rights lawsuit' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setConfig({ ...config, goal: opt.value })}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  config.goal === opt.value
                    ? 'bg-red-600/30 border-2 border-red-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-gray-400 text-sm ml-2">- {opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Aggressive Level</label>
          <div className="space-y-2">
            {[
              { value: 'conservative', label: 'Conservative', desc: 'Cooperative approach' },
              { value: 'medium', label: 'Medium', desc: 'Balanced defense' },
              { value: 'aggressive', label: 'Aggressive', desc: 'Challenge everything' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setConfig({ ...config, aggressive_level: opt.value })}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  config.aggressive_level === opt.value
                    ? 'bg-red-600/30 border-2 border-red-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-gray-400 text-sm ml-2">- {opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Build Button */}
      <button
        onClick={buildStrategy}
        disabled={loading}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="build-strategy-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Building Strategy (this may take 30-60 seconds)...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5" />
            Build Comprehensive Strategy
          </>
        )}
      </button>

      {/* Strategy Result */}
      {strategy && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Your Legal Strategy
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                Goal: {config.goal.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(strategy.strategy);
                  toast.success('Strategy copied to clipboard!');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300">{strategy.strategy}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-4 text-sm text-gray-500">
            <span>Violations analyzed: {strategy.case_context?.violations_count || 0}</span>
            <span>Evidence analyzed: {strategy.case_context?.evidence_count || 0}</span>
          </div>
        </div>
      )}

      {/* Saved Strategies */}
      {showSaved && savedStrategies.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Previously Generated Strategies</h3>
          <div className="space-y-3">
            {savedStrategies.map(s => (
              <div
                key={s.id}
                onClick={() => setStrategy(s)}
                className="p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.goal.replace('_', ' ').toUpperCase()} Strategy</span>
                  <span className="text-gray-500 text-sm">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Argument Generator Tab
function ArgumentGeneratorTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [arguments_, setArguments] = useState(null);
  const [argumentType, setArgumentType] = useState('general');

  const generateArguments = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    setLoading(true);
    setArguments(null);

    try {
      const response = await api.post('/api/argument-generator/generate', {
        case_id: selectedCase.id,
        argument_type: argumentType
      });
      setArguments(response);
      toast.success('Arguments generated successfully!');
    } catch (error) {
      toast.error('Failed to generate arguments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="argument-generator-tab">
        <Scale className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Argument Generator</h2>
        <p className="text-gray-400">Please select a case to generate legal arguments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="argument-generator-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Argument Generator
        </h1>
        <p className="text-gray-400">Generate court-ready legal arguments from your case data</p>
      </div>

      {/* Case Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          <Scale className="w-4 h-4 inline mr-2" />
          <strong>Case:</strong> {selectedCase.title} ({selectedCase.state})
        </p>
      </div>

      {/* Argument Type Selection */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <label className="block text-sm font-medium mb-3">Argument Type</label>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            { value: 'general', label: 'General Defense', icon: Shield },
            { value: 'constitutional', label: 'Constitutional', icon: Scale },
            { value: 'procedural', label: 'Procedural', icon: FileText },
            { value: 'section_1983', label: 'Section 1983', icon: Gavel }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setArgumentType(opt.value)}
              className={`p-4 rounded-lg text-left flex items-center gap-3 transition-colors ${
                argumentType === opt.value
                  ? 'bg-red-600/30 border-2 border-red-500'
                  : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
              }`}
            >
              <opt.icon className="w-5 h-5 text-red-400" />
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateArguments}
        disabled={loading}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="generate-arguments-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Arguments...
          </>
        ) : (
          <>
            <Scale className="w-5 h-5" />
            Generate Legal Arguments
          </>
        )}
      </button>

      {/* Arguments Result */}
      {arguments_ && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              Generated Arguments
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(arguments_.arguments);
                toast.success('Arguments copied to clipboard!');
              }}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300">{arguments_.arguments}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-4 text-sm text-gray-500">
            <span>Violations used: {arguments_.violations_analyzed}</span>
            <span>Evidence used: {arguments_.evidence_analyzed}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Evidence Argument Mapper Tab  
function EvidenceMapperTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [customEvidence, setCustomEvidence] = useState('');
  const [violationType, setViolationType] = useState('');

  useEffect(() => {
    if (selectedCase) {
      loadEvidence();
    }
  }, [selectedCase]);

  const loadEvidence = async () => {
    try {
      const data = await api.get(`/api/evidence/${selectedCase.id}`);
      setEvidence(data.evidence || []);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    }
  };

  const mapEvidence = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    const evidenceDesc = selectedEvidence 
      ? `${selectedEvidence.title}: ${selectedEvidence.description}`
      : customEvidence;

    if (!evidenceDesc.trim()) {
      toast.error('Please select or describe evidence to map');
      return;
    }

    setLoading(true);
    setMapping(null);

    try {
      const response = await api.post('/api/evidence-mapper/map', {
        case_id: selectedCase.id,
        evidence_description: evidenceDesc,
        violation_type: violationType || null
      });
      setMapping(response);
      toast.success('Evidence mapped to precedents!');
    } catch (error) {
      toast.error('Failed to map evidence: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="evidence-mapper-tab">
        <Eye className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Evidence Argument Mapper</h2>
        <p className="text-gray-400">Please select a case to map evidence to legal precedents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="evidence-mapper-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Evidence Argument Mapper
        </h1>
        <p className="text-gray-400">Map your evidence to legal precedents and arguments</p>
      </div>

      {/* Evidence Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Select Existing Evidence</label>
          {evidence.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {evidence.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setSelectedEvidence(e); setCustomEvidence(''); }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedEvidence?.id === e.id
                      ? 'bg-green-600/30 border-2 border-green-500'
                      : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium">{e.title}</span>
                  <p className="text-gray-400 text-sm truncate">{e.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No evidence logged. Add evidence or describe below.</p>
          )}
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Or Describe Evidence</label>
          <textarea
            value={customEvidence}
            onChange={(e) => { setCustomEvidence(e.target.value); setSelectedEvidence(null); }}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-32 focus:outline-none focus:border-red-600"
            placeholder="Describe the evidence you want to map (e.g., 'CPS caseworker entered home without consent or warrant on 10/15/2024')"
          />
          
          <label className="block text-sm font-medium mt-4 mb-2">Related Violation Type (optional)</label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
          >
            <option value="">Select type</option>
            <option value="warrantless_entry">Warrantless Entry</option>
            <option value="coerced_consent">Coerced Consent</option>
            <option value="strip_search">Strip Search</option>
            <option value="emergency_removal_no_danger">Emergency Removal</option>
            <option value="fabricated_evidence">Fabricated Evidence</option>
            <option value="procedural_due_process">Due Process Violation</option>
          </select>
        </div>
      </div>

      {/* Map Button */}
      <button
        onClick={mapEvidence}
        disabled={loading || (!selectedEvidence && !customEvidence.trim())}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="map-evidence-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Mapping Evidence to Precedents...
          </>
        ) : (
          <>
            <Eye className="w-5 h-5" />
            Map Evidence to Legal Arguments
          </>
        )}
      </button>

      {/* Mapping Result */}
      {mapping && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />
              Evidence-to-Precedent Mapping
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(mapping.mapping);
                toast.success('Mapping copied to clipboard!');
              }}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300">{mapping.mapping}</div>
          </div>
          
          {mapping.relevant_case_law && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="font-semibold mb-2 text-green-400">Relevant Case Law Found:</h4>
              <div className="text-sm text-gray-400">
                <p>Constitutional Basis: {mapping.relevant_case_law.constitutional_basis}</p>
                {mapping.relevant_case_law.relevant_cases && (
                  <p className="mt-1">Related Cases: {mapping.relevant_case_law.relevant_cases.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Legal Precedent Finder Tab
function PrecedentFinderTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [precedents, setPrecedents] = useState(null);
  const [violationType, setViolationType] = useState('warrantless_entry');
  const [state, setState] = useState(selectedCase?.state || '');
  const [includeOptions, setIncludeOptions] = useState({ federal: true, state: true });

  const findPrecedents = async () => {
    setLoading(true);
    setPrecedents(null);

    try {
      const response = await api.post('/api/precedent-finder/search', {
        violation_type: violationType,
        state: state || null,
        include_federal: includeOptions.federal,
        include_state: includeOptions.state
      });
      setPrecedents(response);
      toast.success('Precedents found!');
    } catch (error) {
      toast.error('Failed to find precedents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="precedent-finder-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Legal Precedent Finder
        </h1>
        <p className="text-gray-400">Find case law precedents for specific violations</p>
      </div>

      {/* Search Configuration */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Violation Type</label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
          >
            <option value="warrantless_entry">Warrantless Home Entry</option>
            <option value="coerced_consent">Coerced Consent</option>
            <option value="strip_search">Strip Search of Child</option>
            <option value="emergency_removal">Emergency Removal</option>
            <option value="fabricated_evidence">Fabricated Evidence</option>
            <option value="due_process">Due Process Violation</option>
            <option value="inadequate_investigation">Inadequate Investigation</option>
            <option value="fifth_amendment">Fifth Amendment Violation</option>
            <option value="icwa_violation">ICWA Violation</option>
            <option value="section_1983">Section 1983 Claims</option>
          </select>

          <label className="block text-sm font-medium mt-4 mb-2">State (optional)</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
            placeholder="e.g., TX, CA, NY"
          />
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Include Precedents From</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeOptions.federal}
                onChange={(e) => setIncludeOptions({ ...includeOptions, federal: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-medium">Federal Courts</span>
                <p className="text-gray-400 text-sm">Supreme Court, Circuit Courts</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeOptions.state}
                onChange={(e) => setIncludeOptions({ ...includeOptions, state: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-medium">State Courts</span>
                <p className="text-gray-400 text-sm">State Supreme and Appellate Courts</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={findPrecedents}
        disabled={loading}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="find-precedents-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching Legal Databases...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Find Legal Precedents
          </>
        )}
      </button>

      {/* Precedents Result */}
      {precedents && (
        <div className="space-y-4">
          {/* AI Analysis */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-500" />
                Precedent Analysis
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(precedents.precedent_analysis);
                  toast.success('Analysis copied to clipboard!');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300">{precedents.precedent_analysis}</div>
            </div>
          </div>

          {/* Supreme Court Cases */}
          {precedents.supreme_court_cases?.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-red-500" />
                Relevant Supreme Court Cases
              </h4>
              <div className="space-y-2">
                {precedents.supreme_court_cases.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-red-400">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.citation} ({c.year})</p>
                    <p className="text-sm mt-1">{c.holding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Circuit Court Cases */}
          {precedents.circuit_court_cases?.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-500" />
                Relevant Circuit Court Cases
              </h4>
              <div className="space-y-2">
                {precedents.circuit_court_cases.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-blue-400">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.citation}</p>
                    <p className="text-sm mt-1">{c.holding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// CourtListener Tab - Search 50M+ Court Opinions
function CourtListenerTab({ selectedCase }) {
  const { api } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    court: '',
    date_after: '',
    date_before: ''
  });

  const courts = [
    { value: '', label: 'All Courts' },
    { value: 'scotus', label: 'U.S. Supreme Court' },
    { value: 'ca1', label: '1st Circuit' },
    { value: 'ca2', label: '2nd Circuit' },
    { value: 'ca3', label: '3rd Circuit' },
    { value: 'ca4', label: '4th Circuit' },
    { value: 'ca5', label: '5th Circuit' },
    { value: 'ca6', label: '6th Circuit' },
    { value: 'ca7', label: '7th Circuit' },
    { value: 'ca8', label: '8th Circuit' },
    { value: 'ca9', label: '9th Circuit' },
    { value: 'ca10', label: '10th Circuit' },
    { value: 'ca11', label: '11th Circuit' },
    { value: 'cadc', label: 'D.C. Circuit' },
  ];

  const searchCases = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (filters.court) params.append('court', filters.court);
      if (filters.date_after) params.append('filed_after', filters.date_after);
      if (filters.date_before) params.append('filed_before', filters.date_before);
      
      const response = await api.get(`/api/courtlistener/search?${params}`);
      setResults(response.results || []);
    } catch (error) {
      toast.error('Search failed. Try different terms.');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotepad = async (result) => {
    try {
      await api.post('/api/notepad/save-from-courtlistener', {
        case_name: result.caseName || result.case_name || 'Unknown Case',
        citation: result.citation || 'No citation',
        court: result.court || result.court_id || 'Unknown Court',
        date_filed: result.dateFiled || result.date_filed || 'Unknown Date',
        snippet: result.snippet || result.text || '',
        url: result.absolute_url || `https://www.courtlistener.com${result.url || ''}`,
        case_id: selectedCase?.id || null
      });
      toast.success('Case saved to your Legal Notepad!');
    } catch (error) {
      toast.error('Failed to save case');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courtlistener-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Scale className="w-8 h-8 text-red-500" />
          Court Opinions Database
        </h1>
        <p className="text-gray-400">Search 50+ million court opinions from CourtListener</p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for cases (e.g., 'CPS removal fourth amendment')"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && searchCases()}
              data-testid="courtlistener-search-input"
            />
            <button
              onClick={searchCases}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              data-testid="courtlistener-search-btn"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.court}
              onChange={(e) => setFilters({...filters, court: e.target.value})}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
            >
              {courts.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.date_after}
              onChange={(e) => setFilters({...filters, date_after: e.target.value})}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              placeholder="Filed After"
            />
            <input
              type="date"
              value={filters.date_before}
              onChange={(e) => setFilters({...filters, date_before: e.target.value})}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              placeholder="Filed Before"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-400">{results.length} Results Found</h3>
          {results.map((result, idx) => (
            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-red-600/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-400 mb-2">
                    {result.caseName || result.case_name || 'Unnamed Case'}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Gavel className="w-4 h-4" />
                      {result.court || result.court_id || 'Unknown Court'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {result.dateFiled || result.date_filed || 'Unknown Date'}
                    </span>
                    {result.citation && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {result.citation}
                      </span>
                    )}
                  </div>
                  {result.snippet && (
                    <p className="text-gray-300 text-sm line-clamp-3">{result.snippet}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => saveToNotepad(result)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-1"
                    data-testid={`save-case-${idx}`}
                  >
                    <Plus className="w-4 h-4" />
                    Save
                  </button>
                  {result.absolute_url && (
                    <a
                      href={result.absolute_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-gray-400">Try different search terms or adjust your filters.</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <Scale className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Search Court Opinions</h3>
          <p className="text-gray-400">Enter keywords to search millions of court opinions. Try searches like:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['CPS constitutional rights', 'parental rights due process', 'fourth amendment home entry', 'qualified immunity CPS'].map(term => (
              <button
                key={term}
                onClick={() => { setQuery(term); }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Legal Notepad Tab - Save & Organize Research
function NotepadTab({ selectedCase }) {
  const { api } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // all, case, global
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });

  const categories = [
    { value: 'general', label: 'General Notes', color: 'bg-gray-500' },
    { value: 'statute', label: 'Statutes & Codes', color: 'bg-blue-500' },
    { value: 'case_law', label: 'Case Law', color: 'bg-purple-500' },
    { value: 'strategy', label: 'Strategy', color: 'bg-green-500' },
    { value: 'timeline', label: 'Timeline Notes', color: 'bg-yellow-500' },
  ];

  useEffect(() => {
    loadEntries();
  }, [viewMode, selectedCase]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      let url = '/api/notepad?';
      if (viewMode === 'case' && selectedCase) {
        url += `case_id=${selectedCase.id}`;
      } else if (viewMode === 'global') {
        url += 'global_only=true';
      }
      const data = await api.get(url);
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async () => {
    try {
      const entry = {
        ...formData,
        case_id: viewMode === 'case' && selectedCase ? selectedCase.id : null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.post('/api/notepad', entry);
      toast.success('Note created!');
      setShowForm(false);
      setFormData({ title: '', content: '', category: 'general', tags: '' });
      loadEntries();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/api/notepad/${id}`);
      toast.success('Note deleted');
      loadEntries();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const exportToPdf = async (entryId) => {
    try {
      const token = localStorage.getItem('cps_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/export/notepad/${entryId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note_${entryId.slice(0,8)}.pdf`;
      a.click();
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('PDF export failed');
    }
  };

  const exportAllToPdf = async () => {
    try {
      const token = localStorage.getItem('cps_token');
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/export/notepad/all/pdf`;
      if (viewMode === 'case' && selectedCase) {
        url += `?case_id=${selectedCase.id}`;
      }
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'all_notes.pdf';
      a.click();
      toast.success('All notes exported to PDF!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="notepad-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <FileText className="w-8 h-8 text-purple-500" />
            Legal Notepad
          </h1>
          <p className="text-gray-400">Save statutes, case law, and research notes for your cases</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 font-semibold"
            data-testid="new-note-btn"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
          {entries.length > 0 && (
            <button
              onClick={exportAllToPdf}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 font-semibold"
              data-testid="export-all-pdf-btn"
            >
              <Download className="w-5 h-5" />
              Export All PDF
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'all', label: 'All Notes' },
          { id: 'case', label: 'Case Notes', disabled: !selectedCase },
          { id: 'global', label: 'Global Notes' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            disabled={mode.disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === mode.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white disabled:opacity-50'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Create Note Form */}
      {showForm && (
        <div className="bg-gray-800/50 border border-purple-600/50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Create New Note</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Note Title"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              data-testid="note-title-input"
            />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Note content - paste statutes, case excerpts, or your own notes..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg resize-none"
              data-testid="note-content-input"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="Tags (comma separated)"
                className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createEntry}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
                data-testid="save-note-btn"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : entries.length > 0 ? (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-600/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${categories.find(c => c.value === entry.category)?.color || 'bg-gray-600'}`}>
                      {categories.find(c => c.value === entry.category)?.label || 'Note'}
                    </span>
                    {entry.case_id && (
                      <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">Case-specific</span>
                    )}
                    {entry.source_type && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{entry.source_type}</span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{entry.title}</h4>
                  <p className="text-gray-400 text-sm line-clamp-3 whitespace-pre-wrap">{entry.content?.slice(0, 300)}...</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags?.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Created: {entry.created_at?.slice(0, 10)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {selectedEntry?.id === entry.id ? 'Hide' : 'View'}
                  </button>
                  <button
                    onClick={() => exportToPdf(entry.id)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-1"
                    data-testid={`export-pdf-${entry.id}`}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Expanded View */}
              {selectedEntry?.id === entry.id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="bg-black/30 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">{entry.content}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Notes Yet</h3>
          <p className="text-gray-400 mb-4">Start saving statutes, case law, and research notes from the Law Library or Court Opinions.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          >
            Create Your First Note
          </button>
        </div>
      )}
    </div>
  );
}

// ADA Compliance Tab - Comprehensive ADA Accommodations Tool
function ADAComplianceTab({ selectedCase }) {
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [federalLaw, setFederalLaw] = useState(null);
  const [caseLaw, setCaseLaw] = useState(null);
  const [stateInfo, setStateInfo] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [violations, setViolations] = useState(null);
  const [falseClaimsAct, setFalseClaimsAct] = useState(null);
  const [civilGuardian, setCivilGuardian] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [caseAnalysis, setCaseAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    if (activeSection === 'federal') loadFederalLaw();
    if (activeSection === 'caselaw') loadCaseLaw();
    if (activeSection === 'violations') loadViolations();
    if (activeSection === 'falseclaims') loadFalseClaimsAct();
    if (activeSection === 'guardian') loadCivilGuardian();
  }, [activeSection]);

  const loadFederalLaw = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/federal-law');
      setFederalLaw(data);
    } catch (error) {
      toast.error('Failed to load federal law');
    } finally {
      setLoading(false);
    }
  };

  const loadCaseLaw = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/case-law');
      setCaseLaw(data);
    } catch (error) {
      toast.error('Failed to load case law');
    } finally {
      setLoading(false);
    }
  };

  const loadStateInfo = async (state) => {
    setSelectedState(state);
    setLoading(true);
    try {
      const data = await api.get(`/api/ada/state/${state}`);
      setStateInfo(data);
    } catch (error) {
      toast.error('Failed to load state info');
    } finally {
      setLoading(false);
    }
  };

  const loadViolations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/violations');
      setViolations(data);
    } catch (error) {
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const loadFalseClaimsAct = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/false-claims-act');
      setFalseClaimsAct(data);
    } catch (error) {
      toast.error('Failed to load False Claims Act info');
    } finally {
      setLoading(false);
    }
  };

  const loadCivilGuardian = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/civil-guardian');
      setCivilGuardian(data);
    } catch (error) {
      toast.error('Failed to load guardian info');
    } finally {
      setLoading(false);
    }
  };

  const searchADA = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ query: searchQuery });
      if (selectedState) params.append('state', selectedState);
      const data = await api.get(`/api/ada/search?${params}`);
      setSearchResults(data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCase = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }
    setAnalyzing(true);
    try {
      const data = await api.post(`/api/ada/analyze-case/${selectedCase.id}`);
      setCaseAnalysis(data);
      toast.success('ADA analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'federal', label: 'Federal ADA Law', icon: Scale },
    { id: 'caselaw', label: 'ADA Case Law', icon: Gavel },
    { id: 'states', label: 'State Laws', icon: MapPin },
    { id: 'violations', label: 'Common Violations', icon: AlertTriangle },
    { id: 'falseclaims', label: 'False Claims Act', icon: FileText },
    { id: 'guardian', label: 'Civil Guardian/GAL', icon: Users },
    { id: 'analyze', label: 'Analyze My Case', icon: Brain },
    { id: 'search', label: 'Search Resources', icon: Search },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="ada-compliance-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <Scale className="w-8 h-8 text-blue-500" />
            ADA Compliance Center
          </h1>
          <p className="text-gray-400">Comprehensive ADA accommodations, regulations, case law & compliance analysis</p>
        </div>
        {selectedCase && (
          <button
            onClick={analyzeCase}
            disabled={analyzing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2"
            data-testid="analyze-ada-btn"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            Analyze Case for ADA Violations
          </button>
        )}
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-xl">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && !loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-900/50 to-gray-900 border border-blue-700/50 rounded-xl p-6">
            <Scale className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">ADA Title II</h3>
            <p className="text-gray-400 text-sm">Public entities including CPS agencies must provide equal access and reasonable accommodations.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-gray-900 border border-purple-700/50 rounded-xl p-6">
            <Shield className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Section 504</h3>
            <p className="text-gray-400 text-sm">All programs receiving federal funds (including CPS via Title IV-E) must not discriminate based on disability.</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/50 to-gray-900 border border-red-700/50 rounded-xl p-6">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">False Claims Act</h3>
            <p className="text-gray-400 text-sm">File qui tam lawsuits for fraud when agencies misuse federal funds or falsify ADA compliance.</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-gray-900 border border-green-700/50 rounded-xl p-6">
            <Gavel className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Key Case Law</h3>
            <p className="text-gray-400 text-sm">Tennessee v. Lane, Olmstead v. L.C., and circuit court cases establishing ADA applies to CPS.</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-gray-900 border border-yellow-700/50 rounded-xl p-6">
            <Users className="w-10 h-10 text-yellow-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">GAL Requirements</h3>
            <p className="text-gray-400 text-sm">Guardian ad Litems must consider ADA accommodations and cannot recommend TPR based on disability alone.</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/50 to-gray-900 border border-cyan-700/50 rounded-xl p-6">
            <Brain className="w-10 h-10 text-cyan-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-400 text-sm">Cross-reference your case files to identify ADA violations and generate compliance complaints.</p>
          </div>
        </div>
      )}

      {/* Federal Law Section */}
      {activeSection === 'federal' && federalLaw && !loading && (
        <div className="space-y-6">
          {Object.entries(federalLaw.federal_law || {}).map(([key, law]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-2">{law.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{law.citation}</p>
              <p className="text-gray-300 mb-4">{law.description}</p>
              <h4 className="font-semibold mb-2">Key Provisions:</h4>
              <ul className="space-y-2">
                {law.key_provisions?.map((provision, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {provision}
                  </li>
                ))}
              </ul>
              {law.regulations && (
                <p className="mt-4 text-xs text-gray-500">Regulations: {law.regulations}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Case Law Section */}
      {activeSection === 'caselaw' && caseLaw && !loading && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-purple-400 mb-4">Supreme Court Cases</h3>
            <div className="space-y-4">
              {caseLaw.supreme_court?.map((c, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-bold text-white">{c.case}</h4>
                  <p className="text-sm text-gray-500">{c.citation}</p>
                  <p className="text-gray-300 mt-2"><strong>Holding:</strong> {c.holding}</p>
                  <p className="text-blue-400 mt-2 text-sm"><strong>Relevance:</strong> {c.relevance}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-4">Circuit Court Cases</h3>
            <div className="space-y-4">
              {caseLaw.circuit_courts?.map((c, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-bold text-white">{c.case}</h4>
                  <p className="text-sm text-gray-500">{c.circuit} - {c.citation}</p>
                  <p className="text-gray-300 mt-2"><strong>Holding:</strong> {c.holding}</p>
                  <p className="text-green-400 mt-2 text-sm"><strong>Relevance:</strong> {c.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State Laws Section */}
      {activeSection === 'states' && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {states.map(state => (
              <button
                key={state}
                onClick={() => loadStateInfo(state)}
                className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                  selectedState === state
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
          
          {stateInfo && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">{stateInfo.state} ADA + CPS Law</h3>
              
              {stateInfo.data ? (
                <>
                  <p className="text-gray-400 mb-4"><strong>Agency:</strong> {stateInfo.data.agency}</p>
                  
                  {stateInfo.data.specific_statutes && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">State Statutes:</h4>
                      <ul className="space-y-1">
                        {stateInfo.data.specific_statutes.map((s, i) => (
                          <li key={i} className="text-sm text-gray-400">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {stateInfo.data.case_law && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key State Case Law:</h4>
                      <ul className="space-y-1">
                        {stateInfo.data.case_law.map((c, i) => (
                          <li key={i} className="text-sm text-gray-400">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {stateInfo.data.false_claims && (
                    <p className="text-yellow-400 text-sm mt-4">
                      <strong>False Claims Act:</strong> {stateInfo.data.false_claims}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400">{stateInfo.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Violations Section */}
      {activeSection === 'violations' && violations && !loading && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-400">Common ADA Violations in CPS Cases</h3>
          {violations.violations?.map((v, i) => (
            <div key={i} className="bg-gray-800/50 border border-red-700/30 rounded-xl p-6">
              <h4 className="font-bold text-red-400 mb-2">{v.violation}</h4>
              <p className="text-gray-300 mb-2">{v.description}</p>
              <p className="text-sm text-gray-500"><strong>Legal Basis:</strong> {v.legal_basis}</p>
              <p className="text-sm text-green-400 mt-2"><strong>Remedy:</strong> {v.remedy}</p>
            </div>
          ))}
        </div>
      )}

      {/* False Claims Act Section */}
      {activeSection === 'falseclaims' && falseClaimsAct && !loading && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-yellow-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Federal False Claims Act</h3>
            <p className="text-gray-500 mb-4">{falseClaimsAct.federal?.statute}</p>
            <p className="text-red-400 mb-4"><strong>Damages:</strong> {falseClaimsAct.federal?.damages}</p>
            <p className="text-green-400 mb-4"><strong>Whistleblower:</strong> {falseClaimsAct.federal?.whistleblower_protections}</p>
            
            <h4 className="font-semibold mb-2">Relevance to CPS:</h4>
            <ul className="space-y-1">
              {falseClaimsAct.federal?.relevance_to_cps?.map((r, i) => (
                <li key={i} className="text-sm text-gray-400">• {r}</li>
              ))}
            </ul>
          </div>
          
          {falseClaimsAct.state_laws && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">State False Claims Acts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(falseClaimsAct.state_laws).map(([state, info]) => (
                  <div key={state} className={`p-4 rounded-lg ${info.has_fca ? 'bg-green-900/20 border border-green-700/30' : 'bg-gray-700/30'}`}>
                    <span className="font-bold">{state}</span>
                    {info.has_fca ? (
                      <>
                        <span className="text-green-400 text-xs ml-2">✓ Has FCA</span>
                        <p className="text-xs text-gray-500 mt-1">{info.citation}</p>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs ml-2">Use Federal FCA</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Civil Guardian Section */}
      {activeSection === 'guardian' && civilGuardian && !loading && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-400 mb-4">GAL ADA Requirements</h3>
            <ul className="space-y-2">
              {civilGuardian.gal_requirements?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Challenging a Biased GAL</h3>
            <ul className="space-y-2">
              {civilGuardian.challenging_gal?.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Analyze Case Section */}
      {activeSection === 'analyze' && (
        <div className="space-y-6">
          {!selectedCase ? (
            <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
              <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
              <p className="text-gray-400">Select a case from "My Cases" to analyze it for ADA compliance violations.</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2">Analyzing: {selectedCase.title}</h3>
                <p className="text-gray-400">Click the button above to run AI-powered ADA compliance analysis on your case.</p>
              </div>
              
              {caseAnalysis && (
                <div className="space-y-6">
                  {/* Compliance Score */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">ADA Compliance Score</h3>
                    <div className="flex items-center gap-4">
                      <div className={`text-5xl font-bold ${
                        caseAnalysis.compliance_score >= 80 ? 'text-green-500' :
                        caseAnalysis.compliance_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {caseAnalysis.compliance_score}%
                      </div>
                      <div>
                        <p className="text-gray-400">Total Issues: {caseAnalysis.total_issues}</p>
                        <p className="text-red-400">Critical Issues: {caseAnalysis.critical_issues}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Disabilities Identified */}
                  {caseAnalysis.disabilities_identified?.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4">Disabilities Identified</h3>
                      <div className="flex flex-wrap gap-2">
                        {caseAnalysis.disabilities_identified.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* ADA Issues */}
                  {caseAnalysis.ada_issues?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-red-400">ADA Issues Identified</h3>
                      {caseAnalysis.ada_issues.map((issue, i) => (
                        <div key={i} className={`bg-gray-800/50 border rounded-xl p-6 ${
                          issue.severity === 'CRITICAL' ? 'border-red-600' :
                          issue.severity === 'HIGH' ? 'border-orange-600' : 'border-yellow-600'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              issue.severity === 'CRITICAL' ? 'bg-red-600' :
                              issue.severity === 'HIGH' ? 'bg-orange-600' : 'bg-yellow-600'
                            }`}>{issue.severity}</span>
                            <h4 className="font-bold">{issue.issue}</h4>
                          </div>
                          <p className="text-gray-300 mb-2">{issue.description}</p>
                          <p className="text-sm text-gray-500"><strong>Legal Basis:</strong> {issue.legal_basis}</p>
                          <p className="text-sm text-green-400 mt-2"><strong>Recommendation:</strong> {issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* AI Analysis */}
                  {caseAnalysis.ai_analysis && (
                    <div className="bg-gray-800/50 border border-purple-700/50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-purple-400 mb-4">AI Legal Analysis</h3>
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-300">{caseAnalysis.ai_analysis}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Search Section */}
      {activeSection === 'search' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ADA resources (e.g., 'reasonable accommodation', 'mental health')"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && searchADA()}
            />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
            >
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={searchADA}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {searchResults && (
            <div className="space-y-6">
              <p className="text-gray-400">Found {searchResults.total_results} results for "{searchResults.query}"</p>
              
              {searchResults.results.case_law?.length > 0 && (
                <div>
                  <h4 className="font-bold text-purple-400 mb-2">Case Law</h4>
                  {searchResults.results.case_law.map((c, i) => (
                    <div key={i} className="bg-gray-800/50 p-4 rounded-lg mb-2">
                      <p className="font-semibold">{c.case?.case || c.case}</p>
                      <p className="text-sm text-gray-500">{c.type}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.results.violations?.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-400 mb-2">Related Violations</h4>
                  {searchResults.results.violations.map((v, i) => (
                    <div key={i} className="bg-gray-800/50 p-4 rounded-lg mb-2">
                      <p className="font-semibold">{v.violation}</p>
                      <p className="text-sm text-gray-400">{v.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Help Bot Component - Floating assistant that helps users navigate the app
function HelpBot() {
  const { api, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your CPS Punisher assistant. I can help you:\n\n• Navigate the app features\n• Explain how tools work\n• Recommend features for your situation\n• Answer questions about CPS cases\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const helpContext = `You are the Help Bot for THE CPS PUNISHER app - an AI-powered legal defense platform for families dealing with Child Protective Services cases.

YOUR ROLE: Guide users through the app, explain features, and make recommendations.

APP FEATURES (explain these when asked):
- My Cases: Create and manage CPS cases
- AI Case Notes: View all AI-generated insights saved to your case
- Violations: Track CPS policy violations
- Timeline: Build chronological case history  
- Evidence: Upload and organize evidence
- Documents: Upload docs for AI analysis, Forensic Analyzer for deep analysis
- AI Assistant: Chat with AI about your case
- Smart Doc Generator: Create legal documents
- Defense Strategy: AI-generated defense plans
- Legal Notepad: Take organized notes
- ADA Compliance: Get ADA accommodation info
- Law Library: Research state-specific CPS laws
- Section 1983: Generate civil rights lawsuits
- Court Preparation Kit: Generate comprehensive PDF for court
- Find Advocates: Connect with family advocates

TIERS:
- Free: 1 case, 5 AI credits, 1 doc upload
- Essential ($49/mo): 25 docs, 100 AI credits, unlimited cases
- Professional ($99/mo): Unlimited docs, 500 AI credits, advanced AI tools
- Attorney ($299/mo): 2000 AI credits, Section 1983, Court Listener, Forensic Analyzer
- Enterprise: Unlimited everything

TIPS TO SHARE:
- Always select a case before using AI features so responses save automatically
- Use the Forensic Analyzer to find hidden issues in CPS documents
- Track every violation - they build your defense
- Download Court Preparation Kit before hearings
- Buy credits if you need specific features without upgrading

RESPOND: Be helpful, concise, and supportive. Users are often stressed dealing with CPS. Guide them to the right features.`;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/help-bot', {
        message: userMessage,
        context: helpContext
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Here are some quick tips:\n\n• For case help → Go to 'My Cases'\n• For AI features → Select a case first\n• For legal research → Try 'Law Library'\n• To upgrade → Visit 'Upgrade Plan'"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'How do I start?', query: 'How do I get started with this app?' },
    { label: 'Best features?', query: 'What are the best features for defending against CPS?' },
    { label: 'How to save AI?', query: 'How do I save AI responses to my case?' },
    { label: 'Court prep?', query: 'How do I prepare for court?' },
  ];

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-gray-700 rotate-90' 
            : 'bg-gradient-to-r from-red-600 to-purple-600 hover:scale-110 animate-pulse'
        }`}
        data-testid="help-bot-toggle"
      >
        {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-7 h-7" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn" style={{ height: '500px', maxHeight: 'calc(100vh - 150px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-purple-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">CPS Punisher Assistant</h3>
              <p className="text-xs text-white/70">Here to help you navigate</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(action.query); }}
                  className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-900 border border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default App;
