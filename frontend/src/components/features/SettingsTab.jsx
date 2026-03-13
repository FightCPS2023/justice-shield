import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api, { API_URL } from '../../lib/api';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

export default SettingsTab;
