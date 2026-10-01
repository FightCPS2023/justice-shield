import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Search } from 'lucide-react';

const STATUS_STYLE = {
  VERIFIED: 'text-emerald-300 border-emerald-700 bg-emerald-950/40',
  EXISTS: 'text-amber-300 border-amber-700 bg-amber-950/40',
  UNVERIFIED: 'text-red-300 border-red-700 bg-red-950/50',
  STRIKE: 'text-red-200 border-red-500 bg-red-900/70',
};

const statusKey = (status) => (status || '').split(' ')[0];

export const useCitationGate = (log) => {
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const ready = Boolean(log);
  const exportText = (text) => {
    if (!log) return text;
    return verifiedOnly ? log.verified_only_text : log.sanitized_text;
  };
  return { ready, verifiedOnly, setVerifiedOnly, exportText, blockedReason: ready ? null : 'Citation log pending — copy/download unlocks when Cite-Guard finishes.' };
};

export const CitationLog = ({ log, pending = false, verifiedOnly, onVerifiedOnlyChange, testId = 'citation-log' }) => {
  const [open, setOpen] = useState(true);
  if (pending && !log) {
    return (
      <div className="border border-slate-600 bg-black px-4 py-3 text-xs text-slate-300 font-mono" data-testid={`${testId}-pending`}>
        CITE-GUARD: verifying authorities against law library + CourtListener…
      </div>
    );
  }
  if (!log) return null;
  const counts = log.counts || {};
  const body = (log.entries || []).filter((e) => statusKey(e.status) !== 'STRIKE');
  const struck = (log.entries || []).filter((e) => statusKey(e.status) === 'STRIKE');
  const bad = !log.release_grade;

  return (
    <div className={`border ${bad ? 'border-red-600' : 'border-slate-600'} bg-black`} data-testid={testId}>
      {bad && (
        <div className="bg-red-700 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide flex items-center gap-2" data-testid={`${testId}-banner`}>
          <ShieldAlert className="w-4 h-4" /> {log.headline || 'Analysis is not release-grade. Do not file.'}
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left" data-testid={`${testId}-toggle`}>
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          {bad ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          CITATION LOG — Cite-Guard
          <span className="text-xs font-mono text-slate-400">
            {log.total || 0} authorities · {counts.VERIFIED || 0} verified · {counts.EXISTS || 0} exists · {counts.UNVERIFIED || 0} unverified · {counts.STRIKE || 0} struck
          </span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {onVerifiedOnlyChange && (
            <label className="flex items-center gap-2 text-xs text-slate-300 font-mono" data-testid={`${testId}-verified-only`}>
              <input type="checkbox" checked={Boolean(verifiedOnly)} onChange={(e) => onVerifiedOnlyChange(e.target.checked)} />
              VERIFIED-ONLY MODE for court export (strips every non-verified authority from copies/downloads)
            </label>
          )}
          {!body.length && !struck.length && <p className="text-xs text-slate-400 font-mono">No case or statute citations detected in this output.</p>}
          {body.map((e, i) => (
            <div key={`${e.raw}-${i}`} className={`border px-3 py-2 text-xs font-mono ${STATUS_STYLE[statusKey(e.status)] || STATUS_STYLE.UNVERIFIED}`} data-testid={`${testId}-entry-${i}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">[{e.status}]</span>
                <span className="text-slate-100">{e.raw}</span>
              </div>
              <div className="text-slate-400 mt-1">{e.source}{e.holding ? ` — ${e.holding}` : ''}</div>
              {statusKey(e.status) !== 'VERIFIED' && (
                <div className="text-slate-500 mt-1 flex items-start gap-1"><Search className="w-3 h-3 mt-0.5" /> Run: {e.search_string}</div>
              )}
            </div>
          ))}
          {struck.length > 0 && (
            <div className="border border-red-600 bg-red-950/60 px-3 py-2 text-xs font-mono" data-testid={`${testId}-struck`}>
              <p className="font-bold text-red-200 mb-1">REMOVED FROM BODY (STRIKE)</p>
              {struck.map((e, i) => (
                <div key={`${e.raw}-s${i}`} className="text-red-200/90">✕ {e.raw} — {e.source}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitationLog;
