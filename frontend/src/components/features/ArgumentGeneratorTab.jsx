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

function ArgumentGeneratorTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [arguments_, setArguments] = useState(null);
  const [argumentType, setArgumentType] = useState('general');

  const generateArguments = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    setLoading(true);
    setArguments(null);

    try {
      const response = await api.job('argument-generator', {
        case_id: selectedCase.id,
        argument_type: argumentType
      });
      setArguments(response);
      toast.success('Arguments generated successfully!');
    } catch (error) {
      toast.error('Failed to generate arguments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="argument-generator-tab">
        <Scale className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Argument Generator</h2>
        <p className="text-gray-400">Please select a case to generate legal arguments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="argument-generator-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Argument Generator
        </h1>
        <div className="mt-2"><AiModeSelector /></div>
        <p className="text-gray-400">Generate court-ready legal arguments from your case data</p>
      </div>

      {/* Case Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          <Scale className="w-4 h-4 inline mr-2" />
          <strong>Case:</strong> {selectedCase.title} ({selectedCase.state})
        </p>
      </div>

      {/* Argument Type Selection */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <label className="block text-sm font-medium mb-3">Argument Type</label>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            { value: 'general', label: 'General Defense', icon: Shield },
            { value: 'constitutional', label: 'Constitutional', icon: Scale },
            { value: 'procedural', label: 'Procedural', icon: FileText },
            { value: 'section_1983', label: 'Section 1983', icon: Gavel }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setArgumentType(opt.value)}
              className={`p-4 rounded-lg text-left flex items-center gap-3 transition-colors ${
                argumentType === opt.value
                  ? 'bg-red-600/30 border-2 border-red-500'
                  : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
              }`}
            >
              <opt.icon className="w-5 h-5 text-red-400" />
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateArguments}
        disabled={loading}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="generate-arguments-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Arguments...
          </>
        ) : (
          <>
            <Scale className="w-5 h-5" />
            Generate Legal Arguments
          </>
        )}
      </button>

      {/* Arguments Result */}
      {arguments_ && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              Generated Arguments
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(arguments_.citation_log?.sanitized_text || arguments_.arguments);
                toast.success('Arguments copied to clipboard!');
              }}
              disabled={!arguments_.citation_log}
              className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-40"
              data-testid="argument-copy-btn"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-4"><CitationLog log={arguments_.citation_log} testId="argument-citation-log" /></div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300">{arguments_.citation_log?.sanitized_text || arguments_.arguments}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-4 text-sm text-gray-500">
            <span>Violations used: {arguments_.violations_analyzed}</span>
            <span>Evidence used: {arguments_.evidence_analyzed}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Evidence Argument Mapper Tab

export default ArgumentGeneratorTab;
