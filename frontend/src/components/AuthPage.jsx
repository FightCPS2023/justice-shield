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

export default AuthPage;
