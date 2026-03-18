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

function EvidenceTab({ selectedCase }) {
  const { api } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    title: '',
    description: '',
    evidence_type: 'document',
    date_obtained: '',
    source: '',
    supports_defense: true
  };
  const [formData, setFormData] = useState(initialFormState);

  const evidenceTypes = [
    { id: 'document', label: 'Document' },
    { id: 'photo', label: 'Photo/Image' },
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio Recording' },
    { id: 'testimony', label: 'Testimony/Statement' },
    { id: 'medical', label: 'Medical Record' },
    { id: 'school', label: 'School Record' },
    { id: 'character', label: 'Character Reference' },
    { id: 'expert', label: 'Expert Opinion' },
    { id: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (selectedCase) loadEvidence();
  }, [selectedCase]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/evidence/${selectedCase.id}`);
      setEvidence(data.evidence || []);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newEvidence = await api.post('/api/evidence', {
        ...formData,
        case_id: selectedCase.id
      });
      setEvidence([newEvidence, ...evidence]);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Evidence added!');
    } catch (error) {
      toast.error('Failed to add evidence');
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
      <div className="text-center py-12" data-testid="evidence-tab">
        <Eye className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to manage evidence</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="evidence-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Evidence Tracker</h1>
          <p className="text-gray-400">Manage evidence for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Evidence
        </button>
      </div>

      {/* Add Evidence Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Evidence</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={formData.evidence_type}
                  onChange={(e) => setFormData({...formData, evidence_type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {evidenceTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date Obtained</label>
                  <input
                    type="date"
                    value={formData.date_obtained}
                    onChange={(e) => setFormData({...formData, date_obtained: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Source</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Where from?"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.supports_defense}
                  onChange={(e) => setFormData({...formData, supports_defense: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm">This evidence supports the defense</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="evidence-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="evidence-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="evidence-submit-btn">Add Evidence</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : evidence.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Eye className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No evidence added yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {evidence.map(item => (
            <div key={item.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${item.supports_defense ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    {item.supports_defense ? 'SUPPORTS DEFENSE' : 'AGAINST'}
                  </span>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{item.evidence_type}</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{item.description}</p>
              {item.source && <p className="text-xs text-gray-500 mt-2">Source: {item.source}</p>}
              {item.date_obtained && <p className="text-xs text-gray-500">Obtained: {item.date_obtained}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Communications Tab

export default EvidenceTab;
