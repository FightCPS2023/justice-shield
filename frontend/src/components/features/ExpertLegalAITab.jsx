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
import { AiModeSelector } from '../AiModeSelector';

function ExpertLegalAITab({ selectedCase }) {
  const { api } = useAuth();
  const [question, setQuestion] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const handleCancel = () => {
    setQuestion('');
    setResponse(null);
  };

  const handleBack = () => {
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const analysisTypes = [
    { id: 'comprehensive', label: 'Comprehensive Analysis', desc: 'Full legal analysis with citations' },
    { id: 'strategy', label: 'Strategy Focus', desc: 'Defense strategy recommendations' },
    { id: 'constitutional', label: 'Constitutional Analysis', desc: 'Focus on constitutional violations' },
    { id: 'procedural', label: 'Procedural Analysis', desc: 'CPS procedure violations' },
    { id: 'quick', label: 'Quick Answer', desc: 'Concise response' }
  ];

  const sampleQuestions = [
    "What are my rights if CPS shows up at my door without a warrant?",
    "How do I challenge an emergency removal in court?",
    "What constitutes a Fourth Amendment violation by CPS?",
    "How do I file a complaint against my caseworker?",
    "What are the deadlines for CPS to file their petition?",
    "Can CPS interview my child at school without my consent?",
    "What is the standard for termination of parental rights?",
    "How do I request discovery in my dependency case?"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedCase) return;

    setLoading(true);
    try {
      const data = await api.post('/api/ai/expert-analysis', {
        case_id: selectedCase.id,
        question: question,
        analysis_type: analysisType
      });
      setResponse(data);
      setHistory([{ question, response: data, timestamp: new Date() }, ...history]);
    } catch (error) {
      toast.error('Failed to get expert analysis');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="expert-tab">
        <img src="/images/chrome-logo.jpg" alt="CPS Punisher" className="w-48 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Expert Legal AI</h3>
        <p className="text-gray-400">Select a case to get expert legal analysis</p>
        <p className="text-sm text-red-400 mt-2">SMARTER than any other legal AI for CPS cases</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="expert-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Brain className="w-8 h-8 text-zinc-300" />
          Expert Legal AI
        </h1>
        <div className="mt-2"><AiModeSelector /></div>
        <p className="text-gray-400">The most knowledgeable CPS legal AI in existence - {selectedCase.title}</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Analysis Type</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {analysisTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAnalysisType(type.id)}
                className={`p-3 rounded-lg text-left transition-all ${
                  analysisType === type.id
                    ? 'bg-zinc-700 border-zinc-500'
                    : 'bg-gray-800 border-gray-700 hover:border-zinc-500'
                } border`}
              >
                <p className="font-medium text-sm">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Your Legal Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask any CPS legal question - I know more than any other legal AI..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 h-32 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400"
            required
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {sampleQuestions.slice(0, 4).map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuestion(q)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs hover:border-zinc-500 transition-colors"
              data-testid={`expert-sample-question-${i}`}
            >
              {q.substring(0, 40)}...
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="expert-back-btn"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="expert-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex-1 py-4 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-800 hover:to-zinc-900 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            data-testid="expert-submit-btn"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing (30-60 seconds)...</>
            ) : (
              <><Brain className="w-6 h-6" /> Get Expert Analysis</>
            )}
          </button>
        </div>
      </form>

      {/* Response */}
      {response && (
        <div className="bg-gradient-to-r from-zinc-800 to-gray-900 border border-zinc-500 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-zinc-300" />
              Expert Analysis
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(response.analysis)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg overflow-auto max-h-[600px]">
              {response.analysis}
            </pre>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span>Violations analyzed: {response.case_context?.violations_count || 0}</span>
            <span>Timeline events: {response.case_context?.timeline_events || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Section 1983 Civil Rights Lawsuit Tab

export default ExpertLegalAITab;
