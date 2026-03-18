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

function CourtFilingsTab({ selectedCase }) {
  const { api } = useAuth();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    filing_type: 'motion',
    title: '',
    date_filed: '',
    status: 'pending',
    content: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const filingTypes = [
    { id: 'motion', label: 'Motion' },
    { id: 'petition', label: 'Petition' },
    { id: 'answer', label: 'Answer/Response' },
    { id: 'objection', label: 'Objection' },
    { id: 'brief', label: 'Brief' },
    { id: 'order', label: 'Court Order' },
    { id: 'subpoena', label: 'Subpoena' },
    { id: 'notice', label: 'Notice' },
    { id: 'appeal', label: 'Appeal' },
    { id: 'other', label: 'Other' }
  ];

  const statusTypes = [
    { id: 'pending', label: 'Pending', color: 'bg-yellow-600/20 text-yellow-400' },
    { id: 'filed', label: 'Filed', color: 'bg-blue-600/20 text-blue-400' },
    { id: 'granted', label: 'Granted', color: 'bg-green-600/20 text-green-400' },
    { id: 'denied', label: 'Denied', color: 'bg-red-600/20 text-red-400' },
    { id: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-600/20 text-gray-400' }
  ];

  useEffect(() => {
    if (selectedCase) loadFilings();
  }, [selectedCase]);

  const loadFilings = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/court-filings/${selectedCase.id}`);
      setFilings(data.filings || []);
    } catch (error) {
      console.error('Failed to load filings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newFiling = await api.post('/api/court-filings', {
        ...formData,
        case_id: selectedCase.id
      });
      setFilings([newFiling, ...filings]);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Court filing added!');
    } catch (error) {
      toast.error('Failed to add filing');
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
      <div className="text-center py-12" data-testid="courtfilings-tab">
        <Gavel className="w-12 h-12 mx-auto text-purple-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to manage court filings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courtfilings-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Court Filings</h1>
          <p className="text-gray-400">Track all filings for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Filing
        </button>
      </div>

      {/* Add Filing Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Court Filing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Filing Type</label>
                  <select
                    value={formData.filing_type}
                    onChange={(e) => setFormData({...formData, filing_type: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {filingTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {statusTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Motion to Dismiss"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date Filed</label>
                <input
                  type="date"
                  value={formData.date_filed}
                  onChange={(e) => setFormData({...formData, date_filed: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content/Notes</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  placeholder="Filing content or notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="filings-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="filings-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="filings-submit-btn">Add Filing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filings List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : filings.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Gavel className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No court filings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filings.map(filing => {
            const statusInfo = statusTypes.find(s => s.id === filing.status) || statusTypes[0];
            return (
              <div key={filing.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Gavel className="w-5 h-5 text-purple-500" />
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs uppercase">{filing.filing_type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
                <h3 className="font-semibold text-lg">{filing.title}</h3>
                {filing.date_filed && <p className="text-sm text-gray-400 mt-1">Filed: {filing.date_filed}</p>}
                {filing.content && <p className="text-gray-400 text-sm mt-2">{filing.content}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Judge Watch Tab

export default CourtFilingsTab;
