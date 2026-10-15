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
import { CitationLog } from '../CitationLog';
import { AiModeSelector } from '../AiModeSelector';

function CaseLawAnalysisTab({ selectedCase }) {
  const { api } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [focusAreas, setFocusAreas] = useState(['fourth_amendment', 'due_process']);
  const [jurisdiction, setJurisdiction] = useState('federal');

  const focusOptions = [
    { id: 'fourth_amendment', label: 'Fourth Amendment' },
    { id: 'due_process', label: 'Due Process' },
    { id: 'equal_protection', label: 'Equal Protection' },
    { id: 'qualified_immunity', label: 'Qualified Immunity' },
    { id: 'emergency_removal', label: 'Emergency Removal' },
    { id: 'tpr', label: 'Termination of Parental Rights' }
  ];

  const runAnalysis = async () => {
    if (!selectedCase) {
      toast.error('Select a case first');
      return;
    }

    setAnalyzing(true);
    try {
      const data = await api.job('case-law', {
        case_id: selectedCase.id,
        focus_areas: focusAreas,
        jurisdiction
      });
      setAnalysis(data);
      toast.success('Case law analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze case law');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="caselaw-tab">
        <BookOpen className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Deep Case Law Analysis</h3>
        <p className="text-gray-400">Select a case to find relevant precedents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="caselaw-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <BookOpen className="w-8 h-8 text-zinc-300" />
          Deep Case Law Analysis
        </h1>
        <div className="mt-2"><AiModeSelector /></div>
        <p className="text-gray-400">AI-powered analysis of relevant precedents for {selectedCase.title}</p>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Focus Areas</label>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (focusAreas.includes(opt.id)) {
                    setFocusAreas(focusAreas.filter(f => f !== opt.id));
                  } else {
                    setFocusAreas([...focusAreas, opt.id]);
                  }
                }}
                className={`px-3 py-2 rounded-lg border ${
                  focusAreas.includes(opt.id)
                    ? 'bg-zinc-300 text-black border-zinc-400'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Jurisdiction</label>
          <div className="flex gap-2">
            {[
              { id: 'federal', label: 'Federal Courts' },
              { id: 'state', label: 'State Courts' },
              { id: 'both', label: 'Both' }
            ].map(j => (
              <button
                key={j.id}
                onClick={() => setJurisdiction(j.id)}
                className={`px-4 py-2 rounded-lg border ${
                  jurisdiction === j.id
                    ? 'bg-zinc-300 text-black border-zinc-400'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runAnalysis}
          disabled={analyzing || focusAreas.length === 0}
          className="w-full py-4 bg-gradient-to-r from-zinc-800 to-cyan-600 hover:from-zinc-800 hover:to-cyan-700 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Case Law (60-90 seconds)...</>
          ) : (
            <><Search className="w-5 h-5" /> Find Relevant Precedents</>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-gradient-to-r from-zinc-800 to-gray-900 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Case Law Analysis</h3>
            <button
              onClick={() => navigator.clipboard.writeText(analysis.citation_log?.sanitized_text || analysis.analysis)}
              disabled={!analysis.citation_log}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 disabled:opacity-40"
              data-testid="caselaw-copy-btn"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="mb-4"><CitationLog log={analysis.citation_log} testId="caselaw-citation-log" /></div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-6 rounded-lg overflow-auto max-h-[800px]">
            {analysis.citation_log?.sanitized_text || analysis.analysis}
          </pre>
          <p className="text-xs text-gray-500 mt-4">
            Analyzed: {analysis.violations_analyzed} violations | Focus: {analysis.focus_areas?.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Incident Analyzer Tab - Comprehensive Violation Analysis

export default CaseLawAnalysisTab;
