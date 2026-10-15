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

function LegalStrategyBuilderTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [config, setConfig] = useState({
    goal: 'reunification',
    aggressive_level: 'medium'
  });

  useEffect(() => {
    if (selectedCase) {
      loadSavedStrategies();
    }
  }, [selectedCase]);

  const loadSavedStrategies = async () => {
    if (!selectedCase) return;
    try {
      const data = await api.get(`/api/strategy-builder/saved/${selectedCase.id}`);
      setSavedStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  };

  const buildStrategy = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    setLoading(true);
    setStrategy(null);

    try {
      const response = await api.job('strategy-builder', {
        case_id: selectedCase.id,
        goal: config.goal,
        aggressive_level: config.aggressive_level
      });
      setStrategy(response);
      loadSavedStrategies();
      toast.success('Strategy built successfully!');
    } catch (error) {
      toast.error('Failed to build strategy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="strategy-builder-tab">
        <img src="/images/shield-logo.png" alt="CPS Punisher" className="w-20 h-24 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Legal Strategy Builder</h2>
        <p className="text-gray-400">Please select a case to build a comprehensive legal strategy</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="strategy-builder-tab">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/images/shield-logo.png" alt="Logo" className="w-12 h-14 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
              Legal Strategy Builder
            </h1>
            <div className="mt-2"><AiModeSelector /></div>
            <p className="text-gray-400">Build a comprehensive defense strategy for your case</p>
          </div>
        </div>
        {savedStrategies.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Saved ({savedStrategies.length})
          </button>
        )}
      </div>

      {/* Case Info */}
      <div className="bg-zinc-900 border border-zinc-500 rounded-xl p-4">
        <p className="text-zinc-300 text-sm">
          <Shield className="w-4 h-4 inline mr-2" />
          <strong>Selected Case:</strong> {selectedCase.title} ({selectedCase.state})
        </p>
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Strategy Goal</label>
          <div className="space-y-2">
            {[
              { value: 'reunification', label: 'Reunification', desc: 'Focus on returning children' },
              { value: 'dismissal', label: 'Dismissal', desc: 'Challenge the petition' },
              { value: 'appeal', label: 'Appeal', desc: 'Challenge court rulings' },
              { value: 'section_1983', label: 'Section 1983', desc: 'Civil rights lawsuit' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setConfig({ ...config, goal: opt.value })}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  config.goal === opt.value
                    ? 'bg-red-600/30 border-2 border-red-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-gray-400 text-sm ml-2">- {opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Aggressive Level</label>
          <div className="space-y-2">
            {[
              { value: 'conservative', label: 'Conservative', desc: 'Cooperative approach' },
              { value: 'medium', label: 'Medium', desc: 'Balanced defense' },
              { value: 'aggressive', label: 'Aggressive', desc: 'Challenge everything' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setConfig({ ...config, aggressive_level: opt.value })}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  config.aggressive_level === opt.value
                    ? 'bg-red-600/30 border-2 border-red-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-gray-400 text-sm ml-2">- {opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Build Button */}
      <button
        onClick={buildStrategy}
        disabled={loading}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="build-strategy-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Building Strategy (this may take 30-60 seconds)...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5" />
            Build Comprehensive Strategy
          </>
        )}
      </button>

      {/* Strategy Result */}
      {strategy && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Your Legal Strategy
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-zinc-700/40 text-zinc-300 rounded-full text-sm">
                Goal: {config.goal.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(strategy.citation_log?.sanitized_text || strategy.strategy);
                  toast.success('Strategy copied to clipboard!');
                }}
                disabled={!strategy.citation_log}
                className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-40"
                data-testid="strategy-copy-btn"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mb-4"><CitationLog log={strategy.citation_log} testId="strategy-citation-log" /></div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300">{strategy.citation_log?.sanitized_text || strategy.strategy}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-4 text-sm text-gray-500">
            <span>Violations analyzed: {strategy.case_context?.violations_count || 0}</span>
            <span>Evidence analyzed: {strategy.case_context?.evidence_count || 0}</span>
          </div>
        </div>
      )}

      {/* Saved Strategies */}
      {showSaved && savedStrategies.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Previously Generated Strategies</h3>
          <div className="space-y-3">
            {savedStrategies.map(s => (
              <div
                key={s.id}
                onClick={() => setStrategy(s)}
                className="p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.goal.replace('_', ' ').toUpperCase()} Strategy</span>
                  <span className="text-gray-500 text-sm">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Argument Generator Tab

export default LegalStrategyBuilderTab;
