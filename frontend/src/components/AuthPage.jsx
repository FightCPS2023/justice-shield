import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api, { API_URL } from '../lib/api';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthPage({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const { login, signup } = useAuth();
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        if (!API_URL) {
          setConnectionStatus('error');
          return;
        }
        const response = await fetch(`${API_URL}/api/health`, {
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
    setLoading(true);
    setErrorMessage('');
    try {
      if (!isLogin && !acceptedPolicies) {
        setErrorMessage('You must accept the Terms of Service and Privacy Policy to create an account.');
        setLoading(false);
        return;
      }
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password, {
          accepted_terms: true,
          accepted_privacy: true
        });
      }
      setRetryCount(0);
      setConnectionStatus('connected');
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
      if (!API_URL) {
        setConnectionStatus('error');
        setErrorMessage('Server configuration missing. Please refresh the page.');
        return;
      }
      const response = await fetch(`${API_URL}/api/health`);
      if (response.ok) {
        setConnectionStatus('connected');
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
    <>
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/images/cracked-logo.jpg" 
            alt="CPS Punisher" 
            className="w-64 mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))' }}
          />
          <p className="text-slate-300 mt-2">
            {isLogin ? 'Welcome back. We’ll keep everything organized for you.' : 'Create your free account and we’ll guide you through your first case.'}
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
          className="w-full mb-4 flex items-center justify-center gap-3 bg-slate-900 text-white font-semibold py-3.5 px-4 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
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
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 py-1 bg-black text-slate-400 border border-slate-700 rounded-full">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500"
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
              className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500"
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
              className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500"
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

          {!isLogin && (
            <div className="bg-black/40 border border-slate-700 rounded-xl p-4" data-testid="policies-acceptance-block">
              <label className="flex items-start gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptedPolicies}
                  onChange={(e) => setAcceptedPolicies(e.target.checked)}
                  className="mt-1"
                  data-testid="policies-accept-checkbox"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy.
                  <button
                    type="button"
                    onClick={() => setShowPoliciesModal(true)}
                    className="ml-2 text-red-400 hover:text-red-300 underline"
                    data-testid="policies-view-link"
                  >
                    View Policies
                  </button>
                </span>
              </label>
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

        <p className="text-center mt-6 text-slate-300">
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
          className="block mx-auto mt-4 text-slate-300 hover:text-white"
        >
          ← Back to home
        </button>
      </div>
    </div>

    {showPoliciesModal && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" data-testid="policies-modal">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Terms of Service & Privacy Policy</h2>
              <p className="text-sm text-slate-300">Effective Date: {effectiveDate}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPoliciesModal(false)}
              className="text-slate-300 hover:text-white"
              data-testid="policies-modal-close"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <h3 className="text-lg font-semibold mb-2">Terms of Service</h3>
              <p><strong>Acceptance:</strong> By downloading or using “The CPS Punisher,” you agree to these Terms.</p>
              <p><strong>Intellectual Property:</strong> All content, features, and functionalities are owned by Darren Guay and protected by IP laws. Users are granted a limited, non-exclusive license for personal use only. No reproduction, modification, or reverse engineering is permitted.</p>
              <p><strong>User Conduct:</strong> Users must not copy, distribute, or use the app for illegal purposes.</p>
              <p><strong>Disclaimer:</strong> The app provides analysis for informational purposes only, not legal advice.</p>
              <p><strong>Termination:</strong> Violation may result in account termination and legal action.</p>
              <p><strong>Governing Law:</strong> State of Maine.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
              <p><strong>Information Collected:</strong> We collect user-provided data (e.g., CPS case details) and device information.</p>
              <p><strong>Use of Information:</strong> Data is used solely for app functionality and analysis; not shared with third parties without consent.</p>
              <p><strong>Security:</strong> We implement reasonable measures to protect data.</p>
              <p><strong>User Rights:</strong> Users may request data access or deletion via <span className="text-purple-300">punisher@cpsbreakingnews.com</span>.</p>
              <p><strong>Changes:</strong> We may update this policy; continued use constitutes acceptance.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowPoliciesModal(false)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full"
              data-testid="policies-modal-close-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

// Dashboard Component

export default AuthPage;
