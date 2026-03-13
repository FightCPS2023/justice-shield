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

export default OverviewTab;
