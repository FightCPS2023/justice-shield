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

function CourtHearingsTab({ selectedCase }) {
  const { api } = useAuth();
  const [hearings, setHearings] = useState([]);
  const [nextHearing, setNextHearing] = useState(null);
  const [hearingTypes, setHearingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    date: '',
    time: '09:00',
    hearing_type: 'adjudication',
    judge: '',
    location: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadHearingTypes();
    if (selectedCase) loadHearings();
  }, [selectedCase]);

  const loadHearingTypes = async () => {
    try {
      const data = await api.get('/api/court-hearings/types');
      setHearingTypes(data.hearing_types || []);
    } catch (error) {
      console.error('Failed to load hearing types');
    }
  };

  const loadHearings = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/court-hearings/${selectedCase.id}`);
      setHearings(data.hearings || []);
      setNextHearing(data.next_hearing);
    } catch (error) {
      console.error('Failed to load hearings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newHearing = await api.post('/api/court-hearings', {
        ...formData,
        case_id: selectedCase.id
      });
      setHearings([...hearings, newHearing].sort((a, b) => new Date(a.date) - new Date(b.date)));
      if (!nextHearing || newHearing.days_until < nextHearing.days_until) {
        setNextHearing(newHearing);
      }
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Hearing added!');
    } catch (error) {
      toast.error('Failed to add hearing');
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
      <div className="text-center py-12" data-testid="courthearings-tab">
        <Calendar className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to manage court hearings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courthearings-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Court Hearings</h1>
          <p className="text-gray-400">Upcoming hearings for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Hearing
        </button>
      </div>

      {/* Countdown Timer */}
      {nextHearing && (
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-800/50 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">NEXT HEARING IN</p>
          <p className="text-6xl font-bold text-red-400 my-4">{nextHearing.days_until}</p>
          <p className="text-2xl text-gray-300">DAYS</p>
          <div className="mt-4">
            <p className="text-xl font-semibold">{hearingTypes.find(t => t.value === nextHearing.hearing_type)?.label || nextHearing.hearing_type}</p>
            <p className="text-gray-400">{nextHearing.date} at {nextHearing.time}</p>
            {nextHearing.location && <p className="text-gray-500">{nextHearing.location}</p>}
          </div>
        </div>
      )}

      {/* Add Hearing Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Court Hearing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hearing Type</label>
                <select value={formData.hearing_type} onChange={(e) => setFormData({...formData, hearing_type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
                  {hearingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Judge</label>
                <input type="text" value={formData.judge} onChange={(e) => setFormData({...formData, judge: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" placeholder="Judge name" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2" placeholder="Courtroom address" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="hearings-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="hearings-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="hearings-submit-btn">Add Hearing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hearings List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : hearings.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No hearings scheduled yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hearings.map(hearing => {
            const typeInfo = hearingTypes.find(t => t.value === hearing.hearing_type);
            return (
              <div key={hearing.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{typeInfo?.label || hearing.hearing_type}</h3>
                    <p className="text-gray-400">{hearing.date} at {hearing.time}</p>
                    {hearing.location && <p className="text-gray-500 text-sm">{hearing.location}</p>}
                    {hearing.judge && <p className="text-gray-500 text-sm">Judge: {hearing.judge}</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">{hearing.days_until}</p>
                    <p className="text-xs text-gray-500">DAYS</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============== ADVANCED LEGAL STRATEGY COMPONENTS ===============

// Legal Strategy Builder Tab

export default CourtHearingsTab;
