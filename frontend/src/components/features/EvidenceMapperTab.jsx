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

function EvidenceMapperTab({ selectedCase }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [customEvidence, setCustomEvidence] = useState('');
  const [violationType, setViolationType] = useState('');

  useEffect(() => {
    if (selectedCase) {
      loadEvidence();
    }
  }, [selectedCase]);

  const loadEvidence = async () => {
    try {
      const data = await api.get(`/api/evidence/${selectedCase.id}`);
      setEvidence(data.evidence || []);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    }
  };

  const mapEvidence = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    const evidenceDesc = selectedEvidence 
      ? `${selectedEvidence.title}: ${selectedEvidence.description}`
      : customEvidence;

    if (!evidenceDesc.trim()) {
      toast.error('Please select or describe evidence to map');
      return;
    }

    setLoading(true);
    setMapping(null);

    try {
      const response = await api.job('evidence-mapper', {
        case_id: selectedCase.id,
        evidence_description: evidenceDesc,
        violation_type: violationType || null
      });
      setMapping(response);
      toast.success('Evidence mapped to precedents!');
    } catch (error) {
      toast.error('Failed to map evidence: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="evidence-mapper-tab">
        <Eye className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Evidence Argument Mapper</h2>
        <p className="text-gray-400">Please select a case to map evidence to legal precedents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="evidence-mapper-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Evidence Argument Mapper
        </h1>
        <p className="text-gray-400">Map your evidence to legal precedents and arguments</p>
      </div>

      {/* Evidence Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Select Existing Evidence</label>
          {evidence.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {evidence.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setSelectedEvidence(e); setCustomEvidence(''); }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedEvidence?.id === e.id
                      ? 'bg-green-600/30 border-2 border-green-500'
                      : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium">{e.title}</span>
                  <p className="text-gray-400 text-sm truncate">{e.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No evidence logged. Add evidence or describe below.</p>
          )}
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium mb-3">Or Describe Evidence</label>
          <textarea
            value={customEvidence}
            onChange={(e) => { setCustomEvidence(e.target.value); setSelectedEvidence(null); }}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-32 focus:outline-none focus:border-red-600"
            placeholder="Describe the evidence you want to map (e.g., 'CPS caseworker entered home without consent or warrant on 10/15/2024')"
          />
          
          <label className="block text-sm font-medium mt-4 mb-2">Related Violation Type (optional)</label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
          >
            <option value="">Select type</option>
            <option value="warrantless_entry">Warrantless Entry</option>
            <option value="coerced_consent">Coerced Consent</option>
            <option value="strip_search">Strip Search</option>
            <option value="emergency_removal_no_danger">Emergency Removal</option>
            <option value="fabricated_evidence">Fabricated Evidence</option>
            <option value="procedural_due_process">Due Process Violation</option>
          </select>
        </div>
      </div>

      {/* Map Button */}
      <button
        onClick={mapEvidence}
        disabled={loading || (!selectedEvidence && !customEvidence.trim())}
        className="w-full btn-punisher py-4 text-lg flex items-center justify-center gap-2"
        data-testid="map-evidence-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Mapping Evidence to Precedents...
          </>
        ) : (
          <>
            <Eye className="w-5 h-5" />
            Map Evidence to Legal Arguments
          </>
        )}
      </button>

      {/* Mapping Result */}
      {mapping && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />
              Evidence-to-Precedent Mapping
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(mapping.mapping);
                toast.success('Mapping copied to clipboard!');
              }}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300">{mapping.mapping}</div>
          </div>
          
          {mapping.relevant_case_law && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="font-semibold mb-2 text-green-400">Relevant Case Law Found:</h4>
              <div className="text-sm text-gray-400">
                <p>Constitutional Basis: {mapping.relevant_case_law.constitutional_basis}</p>
                {mapping.relevant_case_law.relevant_cases && (
                  <p className="mt-1">Related Cases: {mapping.relevant_case_law.relevant_cases.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Legal Precedent Finder Tab

export default EvidenceMapperTab;
