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
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedViolations, setSelectedViolations] = useState([]);
  const [caseFiles, setCaseFiles] = useState([]);
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

  const violationOptions = [
    { id: 'warrantless-entry', label: 'Warrantless home entry' },
    { id: 'lack-of-notice', label: 'Lack of proper notice' },
    { id: 'improper-removal', label: 'Improper removal without imminent danger' },
    { id: 'false-statements', label: 'False statements or misrepresentations' },
    { id: 'no-reasonable-efforts', label: 'No reasonable efforts to reunify' },
    { id: 'ada-accommodations', label: 'ADA accommodations not provided' }
  ];

  const handleCreate = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);
    try {
      const newCase = await api.post('/api/cases', formData);
      setCases([...cases, newCase]);
      setSelectedCase(newCase);
      setShowCreate(false);
      setFormData(initialFormState);
      setWizardStep(1);
      setSelectedViolations([]);
      setCaseFiles([]);
      toast.success('Case created successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setSelectedViolations([]);
    setCaseFiles([]);
    setWizardStep(1);
  };

  const handleBack = () => {
    setShowCreate(false);
    setWizardStep(1);
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" data-testid="cases-tab">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Case Home</h1>
          <p className="text-slate-600 mt-2 text-lg">
            We’re here to help you protect your family — one step at a time.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setWizardStep(1); }}
          className="btn-punisher flex items-center gap-2 text-lg h-14 px-8"
          data-testid="create-case-btn"
        >
          <Plus className="w-5 h-5" />
          Start a New Case
        </button>
      </div>

      {/* Guided Case Wizard */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" data-testid="case-wizard-modal">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>Let’s start your case gently</h2>
                <p className="text-slate-600 mt-2">
                  Take a breath. We’ll guide you step-by-step and save everything so you can come back anytime.
                </p>
              </div>
              <button
                onClick={() => { setShowCreate(false); handleCancel(); }}
                className="p-2 rounded-full hover:bg-slate-100"
                data-testid="wizard-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6" data-testid="case-wizard-progress">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Step {wizardStep} of 3</span>
                <span>Describe → Review → Generate</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(wizardStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {wizardStep === 1 && (
              <div className="mt-6 space-y-5">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700" data-testid="wizard-reassurance">
                  We’re here to help you protect your family — one step at a time.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Case Title*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-red-400 h-14"
                    placeholder="Example: NH CPS Removal — December 2024"
                    required
                    data-testid="case-title-input"
                  />
                  <p className="text-xs text-slate-500 mt-2">Example: “NH CPS Removal — December 2024”</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State*</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-red-400 h-14"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Case Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-red-400 h-14"
                    placeholder="If you know it, add the court case number"
                    data-testid="case-number-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Describe the situation</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-red-400 min-h-[140px]"
                    placeholder="Example: In New Hampshire, CPS removed my two children on Dec 19, 2024 without a warrant. They did not give me notice or a chance to respond..."
                    data-testid="case-description-input"
                  />
                  <p className="text-xs text-slate-500 mt-2">Share as much as you feel comfortable. You can edit later.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload documents (optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setCaseFiles(Array.from(e.target.files || []))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    data-testid="case-documents-upload"
                  />
                  <p className="text-xs text-slate-500 mt-2">Example uploads: court orders, CPS letters, police reports.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => { handleCancel(); setShowCreate(false); }}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50"
                    data-testid="wizard-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="flex-1 btn-punisher"
                    data-testid="wizard-next-step-btn"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-xl font-semibold">Review possible violations</h3>
                  <p className="text-slate-600 mt-2">
                    Select anything that feels relevant. We’ll help you confirm these later.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {violationOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4" data-testid={`wizard-violation-${option.id}`}>
                      <input
                        type="checkbox"
                        checked={selectedViolations.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedViolations([...selectedViolations, option.id]);
                          } else {
                            setSelectedViolations(selectedViolations.filter((id) => id !== option.id));
                          }
                        }}
                        className="h-5 w-5"
                        data-testid={`wizard-violation-checkbox-${option.id}`}
                      />
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600" data-testid="wizard-violation-tip">
                  Tip: If you’re unsure, leave it blank — we’ll guide you with the AI analysis once your case is created.
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50"
                    data-testid="wizard-back-step-btn"
                  >
                    Back to Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="flex-1 btn-punisher"
                    data-testid="wizard-next-to-generate-btn"
                  >
                    Continue to Generate
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-xl font-semibold">Generate your defense path</h3>
                  <p className="text-slate-600 mt-2">
                    We’ll create your case and guide you to violations, documents, and next steps.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2" data-testid="wizard-summary">
                  <p className="text-sm text-slate-500">Case Summary</p>
                  <p className="text-lg font-medium">{formData.title || 'Untitled Case'}</p>
                  <p className="text-sm text-slate-600">State: {formData.state || 'Not selected'}</p>
                  <p className="text-sm text-slate-600">Violations selected: {selectedViolations.length}</p>
                  <p className="text-sm text-slate-600">Documents attached: {caseFiles.length}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700" data-testid="wizard-next-steps-copy">
                  After creation, open “Violations” and “Defense Strategy” to build your plan with AI support.
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50"
                    data-testid="wizard-back-review-btn"
                  >
                    Back to Review
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={loading || !formData.title || !formData.state}
                    className="flex-1 btn-punisher"
                    data-testid="wizard-create-case-btn"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Case & Continue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm" data-testid="cases-empty-state">
          <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No cases yet</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            No worries — we’ll walk you through everything. Start your first case and we’ll guide you step by step.
          </p>
          <button onClick={() => { setShowCreate(true); setWizardStep(1); }} className="btn-punisher h-14 px-8" data-testid="cases-empty-create-btn">
            <Plus className="w-5 h-5 inline mr-2" />
            Start Your First Case
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className={`p-6 rounded-2xl transition-all border shadow-sm ${
                selectedCase?.id === caseItem.id
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-slate-200 hover:border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="cursor-pointer flex-1" onClick={() => setSelectedCase(caseItem)}>
                  <h3 className="text-xl font-semibold text-slate-900">{caseItem.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">State: {caseItem.state}</p>
                  {caseItem.case_number && (
                    <p className="text-slate-500 text-sm">Case #: {caseItem.case_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    caseItem.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {caseItem.status || 'Active'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCase(caseItem); setViewingCase(caseItem); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm font-semibold flex items-center gap-2"
                    data-testid={`open-case-${caseItem.id}`}
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </button>
                </div>
              </div>
              {caseItem.description && (
                <p className="text-slate-600 mt-3 text-sm line-clamp-2">{caseItem.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-xs text-slate-500">
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
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4" data-testid="selected-case-banner">
          <p className="text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            <strong>Selected Case:</strong> {selectedCase.title} — use the sidebar to access your next steps.
          </p>
        </div>
      )}
    </div>
  );
}

// Case Detail Modal - Shows all saved case information

export default CasesTab;
