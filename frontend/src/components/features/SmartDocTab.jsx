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

function SmartDocTab({ selectedCase }) {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState(selectedCase?.state || '');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [genTime, setGenTime] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [nextSteps, setNextSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [citationLog, setCitationLog] = useState(null);
  const gate = useCitationGate(citationLog);

  const parseNextSteps = (text) => {
    if (!text) return [];
    const match = text.match(/(?:^|\n)(?:#+\s*)?(NEXT STEPS(?: \u0026 STRATEGY)?|Next Steps(?: \u0026 Strategy)?|Recommended Next Steps)[:\s]*\n/i);
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

  const splitDocument = (text) => {
    if (!text) return { documentText: '', steps: [] };
    const match = text.match(/(?:^|\n)(?:#+\s*)?NEXT STEPS/i);
    if (!match) return { documentText: text.trim(), steps: [] };
    const index = text.indexOf(match[0]);
    const documentText = text.slice(0, index).trim();
    const steps = parseNextSteps(text);
    return { documentText, steps };
  };

  useEffect(() => {
    if (selectedCase?.state) setState(selectedCase.state);
  }, [selectedCase]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setDocument('');
    setStreamingContent('');
    setNextSteps([]);
    setErrorMessage('');
    setCitationLog(null);
    setGenTime(null);
    const startTime = Date.now();

    try {
      const data = await api.job('smart-document', {
        prompt,
        case_id: selectedCase?.id || null,
        state: state || null
      }, { onTick: (secs) => setStreamingContent(`Drafting under Document Perfection Mode… ${secs}s elapsed. Court-ready drafts can take 1–3 minutes.`) });

      const { documentText, steps } = splitDocument(data.document || '');
      const finalText = documentText || data.document || '';
      setDocument(finalText);
      setNextSteps(Array.isArray(data.next_steps) && data.next_steps.length ? data.next_steps : steps);
      setCitationLog(data.citation_log || { entries: [], counts: {}, total: 0, release_grade: false, headline: 'Citation log unavailable. Do not file until citations are confirmed.', sanitized_text: finalText, verified_only_text: finalText });
      setStreamingContent('');
      setGenTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (error) {
      const message = error.message || 'Document generation failed';
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
        <p className="text-slate-300 mt-1">
          Describe what you need in plain English — get a complete, court-ready legal document with citations
          {selectedCase && <span className="text-red-400 font-medium"> — Auto-linked to: {selectedCase.title}</span>}
        </p>
      </div>

      {/* Template Quick Buttons */}
      <div>
        <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">One-Click Templates</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => setPrompt(t.prompt)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm text-left transition-colors text-slate-200"
              data-testid={`template-${i}`}
            >
              <FileText className="w-4 h-4 text-amber-500 mb-1" />
              <span className="font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-5 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the document you need in plain English... e.g., 'Write a motion to dismiss the CPS case because they violated my 4th Amendment rights during the home investigation'"
          className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:border-red-600 text-base text-white placeholder:text-slate-400 resize-y"
          data-testid="smartdoc-input"
        />
        <div className="flex items-center gap-3">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2.5 text-sm"
            data-testid="smartdoc-state"
          >
            <option value="">Select State</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {selectedCase && (
            <span className="text-xs text-slate-400 bg-slate-900/70 px-3 py-2 rounded-lg flex items-center gap-1">
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

      {errorMessage && !loading && (
        <div
          className="rounded-xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-200"
          data-testid="smartdoc-error-alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-8 text-center" data-testid="smartdoc-loading">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-lg font-semibold">Generating your legal document...</p>
          <p className="text-sm text-slate-300 mt-1">Pulling case data, statutes, and precedents for your jurisdiction</p>
          {streamingContent && (
            <div className="mt-4 bg-black/40 border border-slate-700 rounded-lg p-4 text-left" data-testid="smartdoc-streaming-output">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{streamingContent}<span className="animate-pulse">▊</span></pre>
            </div>
          )}
        </div>
      )}

      {/* Generated Document */}
      {document && !loading && (
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl overflow-hidden" data-testid="smartdoc-result">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/70">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Document Generated
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {state && `${state} Jurisdiction — `}Court-ready with citations
                {genTime && ` — ${genTime}s`}
              </p>
              {selectedCase && (
                <p className="text-xs text-emerald-400 mt-1" data-testid="smartdoc-autosave-indicator">
                  Auto-saved to {selectedCase.title} (Case Notes + Case Memory)
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(gate.exportText(document)); toast.success(gate.verifiedOnly ? 'Copied (verified-only)' : 'Document copied'); }}
                disabled={!gate.ready}
                title={gate.blockedReason || ''}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm flex items-center gap-1.5 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="copy-doc-btn"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([gate.exportText(document)], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = window.document.createElement('a');
                  a.href = url;
                  a.download = 'legal-document.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Document downloaded');
                }}
                disabled={!gate.ready}
                title={gate.blockedReason || ''}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="download-doc-btn"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <CitationLog log={citationLog} pending={!citationLog} verifiedOnly={gate.verifiedOnly} onVerifiedOnlyChange={gate.setVerifiedOnly} testId="smartdoc-citation-log" />
            <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{citationLog ? citationLog.sanitized_text : document}</pre>
          </div>
        </div>
      )}

      {nextSteps.length > 0 && !loading && (
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-6" data-testid="smartdoc-next-steps">
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


// Evidence Tab

export default SmartDocTab;
