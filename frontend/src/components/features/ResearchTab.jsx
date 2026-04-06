import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../../lib/api';
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

function ResearchTab({ selectedCase }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState('');
  const [researchType, setResearchType] = useState('comprehensive');
  const [searchTime, setSearchTime] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [nextSteps, setNextSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCancel = () => {
    setQuery('');
    setResults('');
    setSearchTime(null);
    setStreamingContent('');
    setNextSteps([]);
    setErrorMessage('');
  };

  const handleBack = () => {
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const parseNextSteps = (text) => {
    if (!text) return [];
    const match = text.match(/(?:^|\n)(?:#+\s*)?(NEXT STEPS(?: & STRATEGY)?|Next Steps(?: & Strategy)?|Recommended Next Steps)[:\s]*\n/i);
    if (!match) return [];
    const startIndex = text.indexOf(match[0]) + match[0].length;
    const segment = text.slice(startIndex);
    const lines = segment.split('\n');
    const steps = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (steps.length) break;
        continue;
      }
      if (trimmed.startsWith('#') || /^[A-Z][A-Z\s]{3,}[:\-]/.test(trimmed)) break;
      const bulletMatch = trimmed.match(/^(\d+\.|[-•])\s+(.*)/);
      if (bulletMatch) {
        steps.push(bulletMatch[2]);
      } else if (steps.length) {
        steps[steps.length - 1] = `${steps[steps.length - 1]} ${trimmed}`.trim();
      }
      if (steps.length >= 8) break;
    }
    return steps;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResults('');
    setStreamingContent('');
    setNextSteps([]);
    setErrorMessage('');
    setSearchTime(null);
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${API_URL}/api/ai/smart-research/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          state: state || null,
          research_type: researchType,
          case_id: selectedCase?.id || null
        }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Research stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let collectedNextSteps = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value);
        const lines = chunkText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.chunk) {
                fullContent += data.chunk;
                setStreamingContent(fullContent);
              }
              if (data.done) {
                if (Array.isArray(data.next_steps)) {
                  collectedNextSteps = data.next_steps;
                }
              }
            } catch (parseError) {
              // ignore chunk parse errors
            }
          }
        }
      }

      if (!collectedNextSteps.length) {
        collectedNextSteps = parseNextSteps(fullContent);
      }

      setResults(fullContent);
      setStreamingContent('');
      setNextSteps(collectedNextSteps);
      setSearchTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'Research timed out. Please try again.'
        : (error.message || 'Research failed');
      toast.error(message);
      setErrorMessage(message);
    } finally {
      clearTimeout(timeoutId);
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
              data-testid={`research-quick-${i}-btn`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center" data-testid="research-loading">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-lg font-semibold">Researching legal databases...</p>
          <p className="text-sm text-gray-400 mt-1">Searching statutes, case law, and CPS policies across all jurisdictions</p>
          {streamingContent && (
            <div className="mt-4 bg-black/40 border border-gray-700 rounded-lg p-4 text-left" data-testid="research-streaming-output">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">{streamingContent}<span className="animate-pulse">▊</span></pre>
            </div>
          )}
        </div>
      )}

      {errorMessage && !loading && (
        <div className="rounded-xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-200" data-testid="research-error-alert">
          {errorMessage}
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
              {selectedCase && (
                <p className="text-xs text-emerald-400 mt-1" data-testid="research-autosave-indicator">
                  Auto-saved to {selectedCase.title} (Case Notes + Case Memory)
                </p>
              )}
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

      {nextSteps.length > 0 && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6" data-testid="research-next-steps">
          <h3 className="text-lg font-semibold mb-3">Next Steps & Strategy</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
            {nextSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Law Library Tab

export default ResearchTab;
