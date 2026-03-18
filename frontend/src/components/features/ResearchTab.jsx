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

function ResearchTab() {
  const { api } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState('');
  const [researchType, setResearchType] = useState('comprehensive');
  const [searchTime, setSearchTime] = useState(null);

  const handleCancel = () => {
    setQuery('');
    setResults('');
    setSearchTime(null);
  };

  const handleBack = () => {
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

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
      <form onSubmit={handleSearch} className="space-y-3">
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
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" data-testid="research-clear-btn">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="btn-punisher px-6 flex items-center gap-2 disabled:opacity-50" data-testid="research-btn">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Research
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg" data-testid="research-back-btn">
            Back
          </button>
          <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg" data-testid="research-cancel-btn">
            Cancel
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

export default ResearchTab;
