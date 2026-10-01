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

function VisitationLogTab({ selectedCase }) {
  const { api } = useAuth();
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    location: '',
    supervisor: '',
    child_emotional_state: 'happy',
    what_happened: '',
    child_quotes: '',
    supervisor_issues: '',
    visit_allowed: true,
    reason_denied: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const draft = useAutosaveDraft(`visitation:${selectedCase?.id || 'global'}`, formData, setFormData, initialFormState, () => setShowAdd(true));

  const emotionalStates = [
    { id: 'happy', label: 'Happy', icon: '😊', color: 'text-green-400' },
    { id: 'neutral', label: 'Neutral', icon: '😐', color: 'text-yellow-400' },
    { id: 'sad', label: 'Sad', icon: '😢', color: 'text-blue-400' },
    { id: 'distressed', label: 'Distressed', icon: '😰', color: 'text-red-400' }
  ];

  useEffect(() => {
    if (selectedCase) loadVisits();
  }, [selectedCase]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/visitation/${selectedCase.id}`);
      setVisits(data.visits || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newVisit = await api.post('/api/visitation', {
        ...formData,
        case_id: selectedCase.id
      });
      setVisits([newVisit, ...visits]);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Visit logged!');
    } catch (error) {
      toast.error('Failed to log visit');
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
      <div className="text-center py-12" data-testid="visitation-tab">
        <Users className="w-12 h-12 mx-auto text-pink-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to log visitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="visitation-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Visitation Log</h1>
          <DraftStatus draft={draft} testId="visitation-draft-status" />
          <p className="text-gray-400">Track visits with your children - {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Log Visit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{stats.total_visits || 0}</p>
          <p className="text-sm text-gray-400">Total Visits</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{stats.total_hours || 0}h</p>
          <p className="text-sm text-gray-400">Total Time</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{stats.denied_visits || 0}</p>
          <p className="text-sm text-gray-400">Denied Visits</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{stats.denial_rate || 0}%</p>
          <p className="text-sm text-gray-400">Denial Rate</p>
        </div>
      </div>

      {/* Add Visit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Log Visitation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (min)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.visit_allowed} onChange={(e) => setFormData({...formData, visit_allowed: e.target.checked})}
                    className="w-4 h-4" />
                  <span>Visit Allowed</span>
                </label>
              </div>

              {!formData.visit_allowed && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason Denied</label>
                  <input type="text" value={formData.reason_denied} onChange={(e) => setFormData({...formData, reason_denied: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" placeholder="Why was visit denied?" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Supervisor</label>
                  <input type="text" value={formData.supervisor} onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Child's Emotional State</label>
                <div className="flex gap-2">
                  {emotionalStates.map(state => (
                    <button key={state.id} type="button"
                      onClick={() => setFormData({...formData, child_emotional_state: state.id})}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                        formData.child_emotional_state === state.id ? 'bg-gray-600 ring-2 ring-blue-500' : 'bg-gray-700'
                      }`}>
                      <span className="text-xl">{state.icon}</span>
                      <span className="text-sm">{state.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">What Happened</label>
                <textarea value={formData.what_happened} onChange={(e) => setFormData({...formData, what_happened: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24" placeholder="Describe the visit..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Child Quotes (important for court!)</label>
                <textarea value={formData.child_quotes} onChange={(e) => setFormData({...formData, child_quotes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-16" placeholder="Exact quotes from your child..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Supervisor Issues</label>
                <textarea value={formData.supervisor_issues} onChange={(e) => setFormData({...formData, supervisor_issues: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-16" placeholder="Any problems with supervisor?" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="visitation-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="visitation-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="visitation-submit-btn">Log Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visits List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No visits logged yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map(visit => {
            const emotionInfo = emotionalStates.find(e => e.id === visit.child_emotional_state) || emotionalStates[0];
            return (
              <div key={visit.id} className={`bg-gray-800/50 border-l-4 rounded-r-xl p-4 ${
                visit.visit_allowed ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{visit.date}</span>
                    <span className="text-gray-400">{visit.time}</span>
                    <span className="text-gray-400">{visit.duration} min</span>
                    <span className={emotionInfo.color}>{emotionInfo.icon} {emotionInfo.label}</span>
                  </div>
                  {!visit.visit_allowed && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">DENIED</span>
                  )}
                </div>
                {visit.location && <p className="text-sm text-gray-400">Location: {visit.location}</p>}
                {visit.supervisor && <p className="text-sm text-gray-400">Supervisor: {visit.supervisor}</p>}
                {visit.what_happened && <p className="text-gray-300 mt-2">{visit.what_happened}</p>}
                {visit.child_quotes && (
                  <p className="text-blue-400 mt-2 italic">"{visit.child_quotes}"</p>
                )}
                {visit.supervisor_issues && (
                  <p className="text-red-400 mt-2">Issues: {visit.supervisor_issues}</p>
                )}
                {visit.reason_denied && (
                  <p className="text-red-400 mt-2">Reason Denied: {visit.reason_denied}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Court Hearings Tab with Countdown

export default VisitationLogTab;
