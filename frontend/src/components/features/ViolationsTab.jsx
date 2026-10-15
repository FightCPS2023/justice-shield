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
import { useAutosaveDraft } from '../../hooks/useAutosaveDraft';
import { DraftStatus } from '../DraftStatus';

function ViolationsTab({ selectedCase }) {
  const { api } = useAuth();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    violation_type: '',
    description: '',
    severity: 'medium',
    date: '',
    statute_reference: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const draft = useAutosaveDraft(`violations:${selectedCase?.id || 'global'}`, formData, setFormData, initialFormState, () => setShowAdd(true));

  const violationTypes = [
    '4th Amendment - Unreasonable Search',
    '5th Amendment - Due Process',
    '6th Amendment - Right to Counsel',
    '14th Amendment - Equal Protection',
    'Procedural Error',
    'Evidence Tampering',
    'False Statements',
    'Failure to Notify',
    'Improper Removal',
    'Policy Violation',
    'Discovery Violation',
    'Other'
  ];

  useEffect(() => {
    if (selectedCase) {
      loadViolations();
    }
  }, [selectedCase]);

  const loadViolations = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/violations/${selectedCase.id}`);
      setViolations(data.violations || []);
    } catch (error) {
      console.error('Failed to load violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }
    
    setLoading(true);
    try {
      const newViolation = await api.post('/api/violations', {
        ...formData,
        case_id: selectedCase.id
      });
      setViolations([...violations, newViolation]);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Violation added!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
      <div className="text-center py-12 animate-fadeIn" data-testid="violations-tab">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case from "My Cases" to track violations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="violations-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Violation Tracker</h1>
          <p className="text-gray-400">Case: {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Violation
        </button>
      </div>

      {/* Add Violation Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Violation</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <DraftStatus draft={draft} testId="violations-draft-status" />
              <div>
                <label className="block text-sm font-medium mb-2">Violation Type*</label>
                <select
                  value={formData.violation_type}
                  onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  required
                >
                  <option value="">Select Type</option>
                  {violationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date (if known)</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description*</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-24"
                  placeholder="Describe the violation in detail"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Statute Reference</label>
                <input
                  type="text"
                  value={formData.statute_reference}
                  onChange={(e) => setFormData({ ...formData, statute_reference: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="e.g., 4th Amendment, State Code § 123"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700" data-testid="violations-back-btn">
                  Back
                </button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700" data-testid="violations-cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-punisher" data-testid="violations-submit-btn">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Violation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Violations List */}
      {violations.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Violations Tracked</h3>
          <p className="text-gray-400 mb-4">Start tracking potential violations in your case</p>
        </div>
      ) : (
        <div className="space-y-4">
          {violations.map((v) => (
            <div key={v.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{v.violation_type}</h3>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  v.severity === 'critical' ? 'bg-red-600/20 text-red-400' :
                  v.severity === 'high' ? 'bg-orange-600/20 text-orange-400' :
                  v.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {v.severity}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{v.description}</p>
              {v.statute_reference && (
                <p className="text-sm text-zinc-300">📜 {v.statute_reference}</p>
              )}
              {v.date && (
                <p className="text-sm text-gray-500 mt-2">Date: {v.date}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Documents Tab

export default ViolationsTab;
