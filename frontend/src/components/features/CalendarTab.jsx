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

function CalendarTab() {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: 'general'
  };
  const [formData, setFormData] = useState(initialFormState);

  const eventTypes = [
    { value: 'court_hearing', label: 'Court Hearing', color: 'bg-red-500' },
    { value: 'deadline', label: 'Filing Deadline', color: 'bg-orange-500' },
    { value: 'meeting', label: 'Meeting', color: 'bg-zinc-300 text-black' },
    { value: 'reminder', label: 'Reminder', color: 'bg-zinc-700' },
    { value: 'general', label: 'General', color: 'bg-gray-500' },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.get('/api/calendar');
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newEvent = await api.post('/api/calendar', formData);
      setEvents([...events, newEvent].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Event added to calendar!');
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

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/calendar/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getEventColor = (type) => eventTypes.find(t => t.value === type)?.color || 'bg-gray-500';

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="calendar-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Calendar</h1>
          <p className="text-gray-400">Track court dates, deadlines, and important events</p>
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
            <h2 className="text-2xl font-bold mb-4">Add Calendar Event</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="e.g., Court Hearing"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date*</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 h-20"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700" data-testid="calendar-back-btn">
                  Back
                </button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700" data-testid="calendar-cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-punisher" data-testid="calendar-submit-btn">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
          <p className="text-gray-400 mb-4">Add court dates, deadlines, and reminders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`w-2 rounded-full ${getEventColor(event.event_type)}`} />
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-red-400 text-sm">
                    {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {event.event_time && ` at ${event.event_time}`}
                  </p>
                  {event.description && <p className="text-gray-400 text-sm mt-1">{event.description}</p>}
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-700 rounded text-xs">
                    {eventTypes.find(t => t.value === event.event_type)?.label || 'General'}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(event.id)} className="text-gray-500 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Pricing Tab

export default CalendarTab;
