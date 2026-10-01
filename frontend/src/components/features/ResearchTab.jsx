import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { CitationLog, useCitationGate } from '../CitationLog';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';

function ResearchTab({ selectedCase }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState('');
  const [researchType, setResearchType] = useState('comprehensive');
  const [searchTime, setSearchTime] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [nextSteps, setNextSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [citationLog, setCitationLog] = useState(null);
  const gate = useCitationGate(citationLog);

  const handleCancel = () => {
    setQuery('');
    setResults('');
    setSearchTime(null);
    setStreamingContent('');
    setNextSteps([]);
    setErrorMessage('');
    setCitationLog(null);
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
    setCitationLog(null);
    setSearchTime(null);
    const startTime = Date.now();

    try {
      const data = await api.job('smart-research', {
        query,
        state: state || null,
        research_type: researchType,
        case_id: selectedCase?.id || null
      }, { onTick: (secs) => setStreamingContent(`Cite-Guard research engine working… ${secs}s elapsed. Long briefs can take 1–3 minutes.`) });

      const fullContent = data.results || '';
      setResults(fullContent);
      setStreamingContent('');
      setNextSteps(Array.isArray(data.next_steps) && data.next_steps.length ? data.next_steps : parseNextSteps(fullContent));
      setCitationLog(data.citation_log || { entries: [], counts: {}, total: 0, release_grade: false, headline: 'Citation log unavailable. Do not file until citations are confirmed.', sanitized_text: fullContent, verified_only_text: fullContent });
      setSearchTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (error) {
      const message = error.message || 'Research failed';
      toast.error(message);
      setErrorMessage(message);
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
        <p className="text-slate-300 mt-1">AI-powered research engine — ask any legal question in plain English</p>
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
                : 'border-slate-700 bg-slate-900/70 hover:border-red-200'
            }`}
            data-testid={`research-type-${rt.id}`}
          >
            <rt.icon className={`w-5 h-5 mb-2 ${researchType === rt.id ? 'text-red-500' : 'text-slate-400'}`} />
            <p className="font-semibold text-sm">{rt.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-3">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 w-32"
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
              className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-red-600 text-base text-white placeholder:text-slate-400"
              data-testid="research-input"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" data-testid="research-clear-btn">
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
          <button type="button" onClick={handleBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200" data-testid="research-back-btn">
            Back
          </button>
          <button type="button" onClick={handleCancel} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200" data-testid="research-cancel-btn">
            Cancel
          </button>
        </div>
      </form>

      {/* Quick Searches */}
      <div>
        <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Quick searches</p>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((q, i) => (
            <button
              key={i}
              onClick={() => { setQuery(q); }}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-xs text-slate-200 hover:text-white transition-colors"
              data-testid={`research-quick-${i}-btn`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-8 text-center" data-testid="research-loading">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-lg font-semibold">Researching legal databases...</p>
          <p className="text-sm text-slate-300 mt-1">Searching statutes, case law, and CPS policies across all jurisdictions</p>
          {streamingContent && (
            <div className="mt-4 bg-black/40 border border-slate-700 rounded-lg p-4 text-left" data-testid="research-streaming-output">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{streamingContent}<span className="animate-pulse">▊</span></pre>
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
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl overflow-hidden" data-testid="research-results">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/70">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Research Complete
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
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
              onClick={() => { navigator.clipboard.writeText(gate.exportText(results)); toast.success(gate.verifiedOnly ? 'Copied (verified-only)' : 'Copied to clipboard'); }}
              disabled={!gate.ready}
              title={gate.blockedReason || ''}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="copy-results-btn"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="p-6 space-y-4">
            <CitationLog log={citationLog} pending={!citationLog} verifiedOnly={gate.verifiedOnly} onVerifiedOnlyChange={gate.setVerifiedOnly} testId="research-citation-log" />
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{citationLog ? citationLog.sanitized_text : results}</pre>
            </div>
          </div>
        </div>
      )}

      {nextSteps.length > 0 && !loading && (
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-6" data-testid="research-next-steps">
          <h3 className="text-lg font-semibold mb-3">Next Steps & Strategy</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
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
