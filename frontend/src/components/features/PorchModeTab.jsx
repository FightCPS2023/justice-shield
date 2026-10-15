import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, Copy, Mic, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { CitationLog } from '../CitationLog';
import { HistoryList } from '../HistoryList';
import { VictoryCardPrompt } from '../VictoryCardPrompt';

function PorchModeTab({ selectedCase }) {
  const { api } = useAuth();
  const [transcription, setTranscription] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [agency, setAgency] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const loadSessions = useCallback(async (offset = 0) => {
    if (!selectedCase?.id) return;
    setSessionsLoading(true);
    try {
      const data = await api.get(`/api/porch-mode/sessions?case_id=${selectedCase.id}&limit=10&offset=${offset}`);
      setSessions((prev) => (offset === 0 ? data.sessions : [...prev, ...data.sessions]));
      setSessionsTotal(data.total || 0);
    } catch (err) {
      // history is non-blocking
    } finally {
      setSessionsLoading(false);
    }
  }, [api, selectedCase?.id]);

  useEffect(() => { loadSessions(0); }, [loadSessions]);

  const handleAnalyze = async () => {
    if (!transcription.trim()) {
      toast.error('Please enter the caseworker speech/transcription.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        transcription,
        officer_name: officerName || undefined,
        agency: agency || undefined,
        incident_location: incidentLocation || undefined,
        case_id: selectedCase?.id || undefined
      };
      const data = await api.post('/api/porch-mode/analyze', payload);
      setResult(data);
      toast.success('Porch Mode analysis complete');
      loadSessions(0);

      if (selectedCase?.id) {
        try {
          await api.post('/api/notepad', {
            case_id: selectedCase.id,
            title: 'Porch Mode — Constitutional Rebuttal',
            content: data.summary || 'Porch Mode analysis completed.',
            category: 'porch-mode'
          });
        } catch (err) {
          // non-blocking
        }
      }
    } catch (error) {
      toast.error(error.message || 'Porch Mode analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="porch-mode-tab">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Porch Mode</h3>
        <p className="text-gray-400">Select a case to activate porch mode defenses.</p>
      </div>
    );
  }

  const flagged = result?.flagged;

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="porch-mode-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Shield className="w-8 h-8 text-red-500" />
          Porch Mode — Violation Engine
        </h1>
        <p className="text-gray-400">Detect coercive caseworker language and deploy constitutional rebuttals instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Mic className="w-4 h-4 text-red-400" /> Caseworker Speech Input</h3>
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-sm h-40"
            placeholder="Paste or type what the caseworker said..."
            data-testid="porch-mode-transcription"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-lg p-2 text-sm"
              placeholder="Officer / Caseworker Name"
              data-testid="porch-mode-officer-name"
            />
            <input
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-lg p-2 text-sm"
              placeholder="Agency / Department"
              data-testid="porch-mode-agency"
            />
            <input
              value={incidentLocation}
              onChange={(e) => setIncidentLocation(e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-lg p-2 text-sm"
              placeholder="Incident Location"
              data-testid="porch-mode-location"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            data-testid="porch-mode-analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze Porch Mode'}
          </button>
        </div>

        <>
        {flagged && <VictoryCardPrompt triggerType="violation_detected" triggerData={{ case_id: selectedCase?.id || null, violation_type: result.detections?.[0]?.matched_phrase || null, amendment: '4th', violation_count: result.detections?.length || null, agency: agency || null, state: selectedCase?.state || null }} label="Violation detected — share your victory?" testId="porch-victory-prompt" />}
        <div className={`border rounded-xl p-4 ${flagged ? 'border-red-600/70 bg-red-900/20' : 'border-emerald-600/70 bg-emerald-900/10'}`}>
          <h3 className="font-semibold flex items-center gap-2">
            {flagged ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Shield className="w-4 h-4 text-emerald-400" />}
            Summary
          </h3>
          <p className="text-sm text-gray-300 whitespace-pre-line mt-3" data-testid="porch-mode-summary">
            {result?.summary || 'Run the analyzer to generate rebuttals and liability warnings.'}
          </p>
        </div>
        </>
      </div>

      {result?.citation_log && <CitationLog log={result.citation_log} testId="porch-citation-log" />}

      {result?.detections && result.detections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Violation Detections</h3>
          {result.detections.map((det, idx) => (
            <div key={idx} className="bg-gray-900/70 border border-red-700/50 rounded-xl p-4" data-testid={`porch-mode-detection-${idx}`}>
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-red-300">{det.matched_phrase}</h4>
                <button
                  onClick={() => copyText(det.rebuttal_script)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
                  data-testid={`porch-mode-copy-rebuttal-${idx}`}
                >
                  <Copy className="w-3 h-3" /> Copy Rebuttal
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {det.amendments.map((amend, aidx) => (
                  <span key={aidx} className="px-2 py-0.5 bg-red-600/20 text-red-200 text-xs rounded-full">
                    {amend}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-200 mt-3 whitespace-pre-line">{det.rebuttal_script}</p>
              <div className="text-xs text-gray-400 mt-3">
                {det.legal_citations.join(' • ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {result?.liability_warning && (
        <div className="bg-gray-900/70 border border-amber-600/60 rounded-xl p-4" data-testid="porch-mode-liability">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> 42 U.S.C. § 1983 Liability Notice
            </h3>
            <button
              onClick={() => copyText(result.liability_warning.notice_text)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
              data-testid="porch-mode-copy-liability"
            >
              <Copy className="w-3 h-3" /> Copy Notice
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-200 mt-3" data-testid="porch-mode-liability-text">
            {result.liability_warning.notice_text}
          </pre>
        </div>
      )}

      <HistoryList
        title="Session History"
        items={sessions}
        total={sessionsTotal}
        loading={sessionsLoading}
        emptyTitle="No sessions yet"
        emptyHint="Paste the caseworker's words above and run your first Porch Mode analysis."
        ctaLabel="Start first analysis"
        onCta={() => document.querySelector('[data-testid="porch-mode-transcription"]')?.focus()}
        onLoadMore={() => loadSessions(sessions.length)}
        testId="porch-session-history"
        renderItem={(sItem) => (
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-mono text-zinc-400">{new Date(sItem.created_at).toLocaleString()}</p>
              <p className="text-sm text-zinc-100 truncate max-w-xl">{sItem.transcript_snippet || sItem.summary}</p>
              {sItem.detections?.length > 0 && <p className="text-xs text-zinc-400 mt-1">{sItem.detections.slice(0, 3).join(' · ')}</p>}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 border ${sItem.status === 'flagged' ? 'border-red-500 text-red-300' : 'border-zinc-500 text-zinc-300'}`}>{sItem.status.toUpperCase()}</span>
              <span className="px-2 py-0.5 border border-zinc-600 text-zinc-200">{sItem.violation_count} violation{sItem.violation_count === 1 ? '' : 's'}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default PorchModeTab;
