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

function CommunicationsTab({ selectedCase }) {
  const { api } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    contact_type: 'phone',
    contact_with: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    favorable: null
  };
  const [formData, setFormData] = useState(initialFormState);
  const draft = useAutosaveDraft(`communications:${selectedCase?.id || 'global'}`, formData, setFormData, initialFormState, () => setShowAdd(true));

  const contactTypes = [
    { id: 'phone', label: 'Phone Call' },
    { id: 'email', label: 'Email' },
    { id: 'in_person', label: 'In Person' },
    { id: 'text', label: 'Text Message' },
    { id: 'letter', label: 'Letter' },
    { id: 'court', label: 'Court Proceeding' }
  ];

  useEffect(() => {
    if (selectedCase) loadCommunications();
  }, [selectedCase]);

  const loadCommunications = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/communications/${selectedCase.id}`);
      setCommunications(data.communications || []);
    } catch (error) {
      console.error('Failed to load communications:', error);
      toast.error(error.message || 'Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newComm = await api.post('/api/communications', {
        ...formData,
        case_id: selectedCase.id
      });
      setCommunications([newComm, ...communications]);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Communication logged!');
    } catch (error) {
      toast.error(error.message || 'Failed to log communication');
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
      <div className="text-center py-12" data-testid="communications-tab">
        <MessageSquare className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to log communications</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="communications-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Communication Log</h1>
          <p className="text-gray-400">Track all communications for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Log Communication
        </button>
      </div>

      {/* Add Communication Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Log Communication</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DraftStatus draft={draft} testId="communications-draft-status" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={formData.contact_type}
                    onChange={(e) => setFormData({...formData, contact_type: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {contactTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contact With</label>
                <input
                  type="text"
                  value={formData.contact_with}
                  onChange={(e) => setFormData({...formData, contact_with: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="e.g., Caseworker Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  placeholder="What was discussed?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Was this favorable?</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, favorable: true})}
                    className={`flex-1 py-2 rounded-lg ${formData.favorable === true ? 'bg-green-600' : 'bg-gray-700'}`}>
                    Favorable
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, favorable: false})}
                    className={`flex-1 py-2 rounded-lg ${formData.favorable === false ? 'bg-red-600' : 'bg-gray-700'}`}>
                    Unfavorable
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, favorable: null})}
                    className={`flex-1 py-2 rounded-lg ${formData.favorable === null ? 'bg-gray-600' : 'bg-gray-700'}`}>
                    Neutral
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="communications-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="communications-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="communications-submit-btn">Log Communication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communications List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : communications.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No communications logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {communications.map(comm => (
            <div key={comm.id} className={`bg-gray-800/50 border-l-4 rounded-r-xl p-4 ${
              comm.favorable === true ? 'border-green-500' : comm.favorable === false ? 'border-red-500' : 'border-gray-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{comm.contact_type}</span>
                  <span className="text-gray-400">{comm.date}</span>
                </div>
                {comm.favorable !== null && (
                  <span className={`px-2 py-1 rounded text-xs ${comm.favorable ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    {comm.favorable ? 'FAVORABLE' : 'UNFAVORABLE'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{comm.contact_with}</h3>
              <p className="text-gray-400 text-sm mt-1">{comm.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Court Filings Tab

export default CommunicationsTab;
