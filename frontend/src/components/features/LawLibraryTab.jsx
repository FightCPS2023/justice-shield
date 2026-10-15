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

function LawLibraryTab() {
  const { api } = useAuth();
  const [selectedState, setSelectedState] = useState('');
  const [stateInfo, setStateInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const states = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  ];

  const loadStateInfo = async (code) => {
    setSelectedState(code);
    setLoading(true);
    try {
      const response = await api.get(`/api/law-library/${code}`);
      setStateInfo(response.law_info);
    } catch (error) {
      toast.error('Failed to load state information');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotepad = async () => {
    if (!selectedState) return;
    setSaving(true);
    try {
      await api.post('/api/notepad/save-from-library', { state_code: selectedState });
      toast.success(`${states.find(s => s.code === selectedState)?.name} CPS Law saved to your Legal Notepad!`);
    } catch (error) {
      toast.error('Failed to save to notepad');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="library-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Law Library</h1>
        <p className="text-gray-400">CPS statutes, codes, and policies for all 50 states</p>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {states.map((state) => (
          <button
            key={state.code}
            onClick={() => loadStateInfo(state.code)}
            className={`p-3 rounded-lg text-sm font-semibold transition-all ${
              selectedState === state.code
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={state.name}
          >
            {state.code}
          </button>
        ))}
      </div>

      {/* State Info */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="ml-3 text-gray-400">Loading state CPS law information...</span>
        </div>
      )}

      {!selectedState && !loading && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Select a State</h3>
          <p className="text-gray-400">Click on a state abbreviation above to view CPS laws, statutes, timelines, and procedures for that state.</p>
        </div>
      )}

      {stateInfo && !loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-red-500" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {states.find(s => s.code === selectedState)?.name} CPS Law Guide
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-600/20 border border-green-500 text-green-400 text-xs rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Instant Access
              </span>
              <button
                onClick={saveToNotepad}
                disabled={saving}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50"
                data-testid="save-to-notepad-btn"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save to Notepad
              </button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none bg-black/30 rounded-lg p-6 border border-gray-700/50">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">{stateInfo}</pre>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              State-specific statutes & timelines
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4" />
              Key case law included
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar Tab

export default LawLibraryTab;
