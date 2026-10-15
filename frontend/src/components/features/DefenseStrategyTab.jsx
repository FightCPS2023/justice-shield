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
import { useAutosaveDraft } from '../../hooks/useAutosaveDraft';
import { DraftStatus } from '../DraftStatus';
import { AiModeSelector } from '../AiModeSelector';

function DefenseStrategyTab({ selectedCase }) {
  const { api } = useAuth();
  const [strategies, setStrategies] = useState([]);
  const [generatedStrategy, setGeneratedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    title: '',
    description: '',
    priority: 'medium',
    legal_basis: '',
    case_law_support: []
  };
  const [formData, setFormData] = useState(initialFormState);
  const draft = useAutosaveDraft(`strategy:${selectedCase?.id || 'global'}`, formData, setFormData, initialFormState, () => setShowAdd(true));

  useEffect(() => {
    if (selectedCase) loadStrategies();
  }, [selectedCase]);

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/strategies/${selectedCase.id}`);
      setStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    setGenerating(true);
    try {
      const data = await api.job('defense-strategy', { case_id: selectedCase.id });
      setGeneratedStrategy(data);
      toast.success('Defense strategy generated!');
    } catch (error) {
      toast.error('Failed to generate strategy');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStrategy = await api.post('/api/strategies', {
        ...formData,
        case_id: selectedCase.id
      });
      setStrategies([newStrategy, ...strategies]);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Strategy added!');
    } catch (error) {
      toast.error('Failed to add strategy');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowAdd(false);
  };

  const handleBack = () => {
    setShowAdd(false);
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="strategy-tab">
        <Shield className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to build defense strategies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="strategy-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Defense Strategy</h1>
          <div className="mt-2"><AiModeSelector /></div>
          <p className="text-gray-400">Build your defense for {selectedCase.title}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateStrategy} disabled={generating} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-700 rounded-lg flex items-center gap-2">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            AI Generate Strategy
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Add Strategy
          </button>
        </div>
      </div>

      {/* AI Generated Strategy */}
      {generatedStrategy && (
        <div className="bg-gradient-to-r from-zinc-800 to-gray-900 border border-zinc-500 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-zinc-300" />
            AI-Generated Defense Strategy
          </h3>
          <div className="mb-4"><CitationLog log={generatedStrategy.citation_log} testId="defense-citation-log" /></div>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg overflow-auto max-h-96">
              {generatedStrategy.citation_log?.sanitized_text || generatedStrategy.strategy}
            </pre>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Generated: {new Date(generatedStrategy.generated_at).toLocaleString()} | 
            Analyzed: {generatedStrategy.violations_analyzed} violations, {generatedStrategy.events_analyzed} events
          </p>
        </div>
      )}

      {/* Add Strategy Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Defense Strategy</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DraftStatus draft={draft} testId="strategy-draft-status" />
              <div>
                <label className="block text-sm text-gray-400 mb-1">Strategy Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Fourth Amendment Challenge"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24"
                  placeholder="Describe the strategy..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Legal Basis</label>
                <input
                  type="text"
                  value={formData.legal_basis}
                  onChange={(e) => setFormData({...formData, legal_basis: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Fourth Amendment, State Statute §123.45"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="strategy-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="strategy-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="strategy-submit-btn">Add Strategy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Strategies List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : strategies.length === 0 && !generatedStrategy ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Shield className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No defense strategies yet</p>
          <button onClick={generateStrategy} disabled={generating} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-700 rounded-lg">
            {generating ? <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> : <Brain className="w-5 h-5 inline mr-2" />}
            Generate AI Strategy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map(strategy => (
            <div key={strategy.id} className={`bg-gray-800/50 border-l-4 rounded-r-xl p-4 ${
              strategy.priority === 'high' ? 'border-red-500' : strategy.priority === 'medium' ? 'border-yellow-500' : 'border-gray-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  strategy.priority === 'high' ? 'bg-red-600/20 text-red-400' : 
                  strategy.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {strategy.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <h3 className="font-semibold text-lg">{strategy.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{strategy.description}</p>
              {strategy.legal_basis && (
                <p className="text-sm text-green-400 mt-2">Legal Basis: {strategy.legal_basis}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Criminal Case Tab

export default DefenseStrategyTab;
