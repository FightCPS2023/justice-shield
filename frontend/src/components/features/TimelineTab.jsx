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

function TimelineTab({ selectedCase }) {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    event_type: 'general'
  });

  useEffect(() => {
    if (selectedCase) {
      loadEvents();
    }
  }, [selectedCase]);

  const loadEvents = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/timeline/${selectedCase.id}`);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    
    setLoading(true);
    try {
      const newEvent = await api.post('/api/timeline', {
        ...formData,
        case_id: selectedCase.id
      });
      setEvents([...events, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowAdd(false);
      setFormData({ title: '', description: '', date: '', event_type: 'general' });
      toast.success('Timeline event added!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="timeline-tab">
        <Clock className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to build your timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="timeline-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Case Timeline</h1>
          <p className="text-gray-400">{selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add Timeline Event</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="e.g., Initial CPS Contact"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date*</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  <option value="general">General</option>
                  <option value="contact">CPS Contact</option>
                  <option value="hearing">Court Hearing</option>
                  <option value="filing">Court Filing</option>
                  <option value="violation">Violation</option>
                  <option value="removal">Removal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-24"
                  placeholder="Describe what happened"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-punisher">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <Clock className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
          <p className="text-gray-400">Start building your case timeline</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />
          <div className="space-y-6">
            {events.map((event, i) => (
              <div key={event.id} className="relative flex gap-6 pl-4">
                <div className="absolute left-6 w-4 h-4 rounded-full bg-red-600 border-4 border-gray-900" />
                <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl p-4 ml-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-red-400">{event.date}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{event.event_type}</span>
                  </div>
                  {event.description && (
                    <p className="text-gray-400 mt-2 text-sm">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Forensic Analyzer View — 7-Point Legal Forensic Analysis

export default TimelineTab;
