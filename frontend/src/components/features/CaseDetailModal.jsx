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

function CaseDetailModal({ caseData, onClose, api }) {
  const [loading, setLoading] = useState(true);
  const [caseDetails, setCaseDetails] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadCaseDetails();
  }, [caseData.id]);

  const loadCaseDetails = async () => {
    setLoading(true);
    try {
      // Load all case-related data
      const [violations, documents, timeline, evidence, communications, strategies] = await Promise.all([
        api.get(`/api/violations/${caseData.id}`).catch(() => ({ violations: [] })),
        api.get(`/api/documents/${caseData.id}`).catch(() => ({ documents: [] })),
        api.get(`/api/timeline/${caseData.id}`).catch(() => ({ events: [] })),
        api.get(`/api/evidence/${caseData.id}`).catch(() => ({ evidence: [] })),
        api.get(`/api/communications/${caseData.id}`).catch(() => ({ communications: [] })),
        api.get(`/api/strategies/${caseData.id}`).catch(() => ({ strategies: [] })),
      ]);

      setCaseDetails({
        violations: violations.violations || [],
        documents: documents.documents || [],
        timeline: timeline.events || [],
        evidence: evidence.evidence || [],
        communications: communications.communications || [],
        strategies: strategies.strategies || [],
      });
    } catch (error) {
      console.error('Failed to load case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'evidence', label: 'Evidence', icon: Eye },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'strategies', label: 'Strategies', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-5xl my-8 flex flex-col">
        {/* Header - sticky */}
        <div className="sticky top-0 p-6 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-red-900/30 to-gray-900 rounded-t-xl z-10">
          <div className="flex items-center gap-4">
            <img src="/images/shield-logo.png" alt="Logo" className="w-10 h-12" />
            <div>
              <h2 className="text-2xl font-bold">{caseData.title}</h2>
              <p className="text-gray-400 text-sm">State: {caseData.state} | Case #: {caseData.case_number || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('cps_token');
                  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/export/case/${caseData.id}/preparation-kit`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Court_Preparation_Kit_${caseData.title.replace(/\s+/g, '_')}.pdf`;
                    a.click();
                    toast.success('Court Preparation Kit downloaded!');
                  } else {
                    toast.error('Failed to generate kit');
                  }
                } catch (error) {
                  toast.error('Download failed');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-lg"
              data-testid="download-prep-kit-btn"
            >
              <Download className="w-4 h-4" />
              Court Prep Kit
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'border-b-2 border-red-500 text-red-500 bg-red-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
              {caseDetails && section.id !== 'overview' && (
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {caseDetails[section.id]?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="ml-3 text-gray-400">Loading case details...</span>
            </div>
          ) : (
            <>
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Case Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Title:</span> {caseData.title}</p>
                        <p><span className="text-gray-400">State:</span> {caseData.state}</p>
                        <p><span className="text-gray-400">Case Number:</span> {caseData.case_number || 'Not assigned'}</p>
                        <p><span className="text-gray-400">Status:</span> <span className="text-green-400">{caseData.status || 'Active'}</span></p>
                        <p><span className="text-gray-400">Created:</span> {new Date(caseData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Case Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-red-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-red-500">{caseDetails?.violations?.length || 0}</p>
                          <p className="text-xs text-gray-400">Violations</p>
                        </div>
                        <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-500">{caseDetails?.documents?.length || 0}</p>
                          <p className="text-xs text-gray-400">Documents</p>
                        </div>
                        <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-500">{caseDetails?.evidence?.length || 0}</p>
                          <p className="text-xs text-gray-400">Evidence</p>
                        </div>
                        <div className="text-center p-3 bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-500">{caseDetails?.timeline?.length || 0}</p>
                          <p className="text-xs text-gray-400">Events</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {caseData.description && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-300">{caseData.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'violations' && (
                <div className="space-y-4">
                  {caseDetails?.violations?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No violations recorded yet.</p>
                  ) : (
                    caseDetails?.violations?.map((v, i) => (
                      <div key={i} className="bg-gray-800/50 border border-red-900/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-red-400">{v.violation_type}</h4>
                            <p className="text-gray-300 text-sm mt-1">{v.description}</p>
                          </div>
                          <span className="text-xs text-gray-500">{v.date || 'No date'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'documents' && (
                <div className="space-y-4">
                  {caseDetails?.documents?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No documents uploaded yet.</p>
                  ) : (
                    caseDetails?.documents?.map((d, i) => (
                      <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-400" />
                            <div>
                              <h4 className="font-semibold">{d.title || d.filename}</h4>
                              <p className="text-gray-400 text-xs">{d.doc_type} • {d.file_type}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</span>
                        </div>
                        {d.content && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{d.content.substring(0, 200)}...</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'timeline' && (
                <div className="space-y-4">
                  {caseDetails?.timeline?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No timeline events yet.</p>
                  ) : (
                    <div className="relative border-l-2 border-gray-700 pl-6 space-y-6">
                      {caseDetails?.timeline?.map((e, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-8 w-4 h-4 bg-red-600 rounded-full border-2 border-gray-900"></div>
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <p className="text-red-400 text-sm font-semibold">{e.date}</p>
                            <h4 className="font-semibold mt-1">{e.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{e.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  {caseDetails?.evidence?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No evidence items logged yet.</p>
                  ) : (
                    caseDetails?.evidence?.map((e, i) => (
                      <div key={i} className="bg-gray-800/50 border border-purple-900/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-purple-400">{e.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">Type: {e.evidence_type} • Status: {e.status}</p>
                            <p className="text-gray-300 text-sm mt-2">{e.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'communications' && (
                <div className="space-y-4">
                  {caseDetails?.communications?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No communications logged yet.</p>
                  ) : (
                    caseDetails?.communications?.map((c, i) => (
                      <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{c.contact_name || 'Unknown Contact'}</h4>
                            <p className="text-gray-400 text-xs">{c.communication_type} • {c.date}</p>
                            <p className="text-gray-300 text-sm mt-2">{c.summary}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'strategies' && (
                <div className="space-y-4">
                  {caseDetails?.strategies?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No defense strategies saved yet.</p>
                  ) : (
                    caseDetails?.strategies?.map((s, i) => (
                      <div key={i} className="bg-gray-800/50 border border-green-900/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-green-400">{s.title}</h4>
                            <p className="text-gray-400 text-xs">{s.strategy_type} • Priority: {s.priority}</p>
                            <p className="text-gray-300 text-sm mt-2">{s.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Chat Tab

export default CaseDetailModal;
