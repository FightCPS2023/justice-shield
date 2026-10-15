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

function PrecedentFinderTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [precedents, setPrecedents] = useState(null);
  const [violationType, setViolationType] = useState('warrantless_entry');
  const [state, setState] = useState(selectedCase?.state || '');
  const [includeOptions, setIncludeOptions] = useState({ federal: true, state: true });

  const findPrecedents = async () => {
    setLoading(true);
    setPrecedents(null);

    try {
      const requestPromise = api.job('precedent-finder', {
        violation_type: violationType,
        state: state || null,
        include_federal: includeOptions.federal,
        include_state: includeOptions.state
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 300000)
      );

      const response = await Promise.race([requestPromise, timeoutPromise]);
      setPrecedents(response);
      if (response?.used_fallback) {
        toast.warning('AI analysis temporarily unavailable. Showing database precedents.');
      } else {
        toast.success('Precedents found!');
      }
    } catch (error) {
      toast.error('Failed to find precedents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="precedent-finder-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Legal Precedent Finder
        </h1>
        <div className="mt-2"><AiModeSelector /></div>
        <p className="text-gray-400">Find case law precedents for specific violations</p>
      </div>

      {/* Search Configuration */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Violation Type</label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
          >
            <option value="warrantless_entry">Warrantless Home Entry</option>
            <option value="coerced_consent">Coerced Consent</option>
            <option value="strip_search">Strip Search of Child</option>
            <option value="emergency_removal">Emergency Removal</option>
            <option value="fabricated_evidence">Fabricated Evidence</option>
            <option value="due_process">Due Process Violation</option>
            <option value="inadequate_investigation">Inadequate Investigation</option>
            <option value="fifth_amendment">Fifth Amendment Violation</option>
            <option value="icwa_violation">ICWA Violation</option>
            <option value="section_1983">Section 1983 Claims</option>
          </select>

          <label className="block text-sm font-medium mt-4 mb-2">State (optional)</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
            placeholder="e.g., TX, CA, NY"
          />
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Include Precedents From</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeOptions.federal}
                onChange={(e) => setIncludeOptions({ ...includeOptions, federal: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-medium">Federal Courts</span>
                <p className="text-gray-400 text-sm">Supreme Court, Circuit Courts</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeOptions.state}
                onChange={(e) => setIncludeOptions({ ...includeOptions, state: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-medium">State Courts</span>
                <p className="text-gray-400 text-sm">State Supreme and Appellate Courts</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={findPrecedents}
        disabled={loading}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="find-precedents-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching Legal Databases...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Find Legal Precedents
          </>
        )}
      </button>

      {/* Precedents Result */}
      {precedents && (
        <div className="space-y-4">
          {/* AI Analysis */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-500" />
                Precedent Analysis
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(precedents.citation_log?.sanitized_text || precedents.precedent_analysis);
                  toast.success('Analysis copied to clipboard!');
                }}
                disabled={!precedents.citation_log}
                className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-40"
                data-testid="precedent-copy-btn"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-4"><CitationLog log={precedents.citation_log} testId="precedent-citation-log" /></div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300">{precedents.citation_log?.sanitized_text || precedents.precedent_analysis}</div>
            </div>
          </div>

          {/* Supreme Court Cases */}
          {precedents.supreme_court_cases?.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-red-500" />
                Relevant Supreme Court Cases
              </h4>
              <div className="space-y-2">
                {precedents.supreme_court_cases.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-red-400">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.citation} ({c.year})</p>
                    <p className="text-sm mt-1">{c.holding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Circuit Court Cases */}
          {precedents.circuit_court_cases?.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-zinc-300" />
                Relevant Circuit Court Cases
              </h4>
              <div className="space-y-2">
                {precedents.circuit_court_cases.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-zinc-300">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.citation}</p>
                    <p className="text-sm mt-1">{c.holding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// CourtListener Tab - Search 50M+ Court Opinions

export default PrecedentFinderTab;
