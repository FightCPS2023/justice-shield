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

function ForensicAnalyzerView({ selectedCase, documents, selectedDocument }) {
  const { api } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(selectedDocument?.id || '');
  const [analysisMode, setAnalysisMode] = useState('single'); // single or case

  useEffect(() => {
    if (selectedCase) {
      api.get(`/api/ai/forensic-analysis/${selectedCase.id}`).then(data => {
        setPastAnalyses(data.analyses || []);
      }).catch(() => {});
    }
  }, [selectedCase]);

  const runForensicAnalysis = async () => {
    setAnalyzing(true);
    setResults(null);
    try {
      const payload = analysisMode === 'case'
        ? { case_id: selectedCase.id }
        : { document_id: selectedDocId, case_id: selectedCase?.id };
      const data = await api.post('/api/ai/forensic-analysis', payload);
      setResults(data);
      setPastAnalyses(prev => [data, ...prev]);
      toast.success('Forensic analysis complete');
    } catch (error) {
      toast.error(error.message || 'Forensic analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const sections = [
    { id: 1, title: 'MOUs & Interagency Agreements', icon: FileText, color: 'text-zinc-300' },
    { id: 2, title: 'Stipulations & Contractual Terms', icon: Scale, color: 'text-zinc-300' },
    { id: 3, title: 'Void Ab Initio Issues', icon: AlertTriangle, color: 'text-red-500' },
    { id: 4, title: 'Child Welfare / Trafficking Indicators', icon: Shield, color: 'text-amber-500' },
    { id: 5, title: 'Structural Legal Issues', icon: Gavel, color: 'text-orange-500' },
    { id: 6, title: 'Legal Evidence Matrix', icon: BarChart3, color: 'text-green-500' },
    { id: 7, title: 'Final Assessment', icon: CheckCircle2, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6" data-testid="forensic-analyzer">
      <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Search className="w-7 h-7 text-red-500" />
          Legal Forensic Document Analyzer
        </h2>
        <p className="text-gray-400">AI-powered 7-point legal forensic analysis for government records, interagency agreements, and CPS documents</p>

        {/* Analysis Mode */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setAnalysisMode('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${analysisMode === 'single' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            data-testid="forensic-mode-single"
          >
            Single Document
          </button>
          <button
            onClick={() => setAnalysisMode('case')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${analysisMode === 'case' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            data-testid="forensic-mode-case"
          >
            Entire Case ({documents.length} docs)
          </button>
        </div>

        {/* Document Selector for single mode */}
        {analysisMode === 'single' && (
          <div className="mt-4">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm"
              data-testid="forensic-doc-select"
            >
              <option value="">Select a document to analyze...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.title || doc.filename}</option>
              ))}
            </select>
          </div>
        )}

        {/* Analysis Sections Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
          {sections.map((s) => (
            <div key={s.id} className="bg-gray-900/80 border border-gray-800 rounded-lg p-2 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-[10px] text-gray-400 leading-tight">{s.title}</p>
            </div>
          ))}
        </div>

        <button
          onClick={runForensicAnalysis}
          disabled={analyzing || (analysisMode === 'single' && !selectedDocId)}
          className="mt-4 btn-punisher px-8 py-3 flex items-center gap-2 disabled:opacity-50"
          data-testid="forensic-run-btn"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Running 7-Point Analysis...</>
          ) : (
            <><Search className="w-5 h-5" /> Run Forensic Analysis</>
          )}
        </button>
      </div>

      {/* Loading State */}
      {analyzing && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Performing Forensic Analysis...</p>
          <p className="text-sm text-gray-400">Scanning for MOUs, stipulations, void ab initio defects, trafficking indicators, and structural issues</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {sections.map((s) => (
              <span key={s.id} className="px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 flex items-center gap-1">
                <s.icon className="w-3 h-3" /> {s.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && !analyzing && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden" data-testid="forensic-results">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Forensic Analysis Complete
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{results.document_title} — {new Date(results.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(results.analysis); toast.success('Analysis copied'); }}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1.5"
                data-testid="forensic-copy-btn"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([results.analysis], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = window.document.createElement('a');
                  a.href = url;
                  a.download = `forensic-analysis-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Analysis downloaded');
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-1.5"
                data-testid="forensic-download-btn"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">{results.analysis}</pre>
          </div>
        </div>
      )}

      {/* Past Analyses */}
      {pastAnalyses.length > 0 && !results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Previous Forensic Analyses</h3>
          {pastAnalyses.map((a, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setResults(a)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors text-left"
              >
                <div>
                  <p className="font-medium">{a.document_title}</p>
                  <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// Legal Research Tab — Cetient-Style Smart Research Engine

export default ForensicAnalyzerView;
