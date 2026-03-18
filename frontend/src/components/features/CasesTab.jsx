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
import CaseDetailModal from './CaseDetailModal';

function CasesTab({ cases, setCases, selectedCase, setSelectedCase }) {
  const { api } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingCase, setViewingCase] = useState(null);
  const initialFormState = {
    title: '',
    description: '',
    state: '',
    case_number: '',
    children_names: []
  };
  const [formData, setFormData] = useState(initialFormState);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCase = await api.post('/api/cases', formData);
      setCases([...cases, newCase]);
      setSelectedCase(newCase);
      setShowCreate(false);
      setFormData(initialFormState);
      toast.success('Case created successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
  };

  const handleBack = () => {
    setShowCreate(false);
    window.history.back();
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="cases-tab">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>My Cases</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-punisher flex items-center gap-2"
          data-testid="create-case-btn"
        >
          <Plus className="w-5 h-5" />
          New Case
        </button>
      </div>

      {/* Create Case Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Case</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  placeholder="e.g., Smith Family CPS Case"
                  required
                  data-testid="case-title-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State*</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  required
                  data-testid="case-state-select"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Case Number (Optional)</label>
                <input
                  type="text"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  placeholder="Court case number if known"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 h-24"
                  placeholder="Brief description of your case"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700"
                  data-testid="case-back-btn"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleCancel(); setShowCreate(false); }}
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700"
                  data-testid="case-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-punisher"
                  data-testid="submit-case-btn"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Cases Yet</h3>
          <p className="text-gray-400 mb-4">Create your first case to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" />
            Create Case
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className={`p-6 rounded-xl transition-all ${
                selectedCase?.id === caseItem.id
                  ? 'bg-red-600/20 border-2 border-red-600'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="cursor-pointer flex-1" onClick={() => setSelectedCase(caseItem)}>
                  <h3 className="text-xl font-semibold">{caseItem.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">State: {caseItem.state}</p>
                  {caseItem.case_number && (
                    <p className="text-gray-500 text-sm">Case #: {caseItem.case_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    caseItem.status === 'active' ? 'bg-green-600/20 text-green-500' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {caseItem.status || 'Active'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCase(caseItem); setViewingCase(caseItem); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold flex items-center gap-2"
                    data-testid={`open-case-${caseItem.id}`}
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </button>
                </div>
              </div>
              {caseItem.description && (
                <p className="text-gray-400 mt-3 text-sm line-clamp-2">{caseItem.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>{caseItem.violation_count || 0} violations</span>
                <span>{caseItem.document_count || 0} documents</span>
                <span>{caseItem.event_count || 0} events</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {viewingCase && (
        <CaseDetailModal 
          caseData={viewingCase} 
          onClose={() => setViewingCase(null)}
          api={api}
        />
      )}

      {selectedCase && !viewingCase && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-4">
          <p className="text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            <strong>Selected Case:</strong> {selectedCase.title} - Use the sidebar to access case features
          </p>
        </div>
      )}
    </div>
  );
}

// Case Detail Modal - Shows all saved case information

export default CasesTab;
