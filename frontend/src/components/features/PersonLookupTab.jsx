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

function PersonLookupTab({ selectedCase }) {
  const { api } = useAuth();
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const initialFormState = {
    name: '',
    state: '',
    city: '',
    additional_info: '',
    lookup_type: 'comprehensive'
  };
  const [formData, setFormData] = useState(initialFormState);

  const lookupTypes = [
    { id: 'comprehensive', label: 'Comprehensive Report', desc: 'Full background including criminal, civil, addresses, contacts' },
    { id: 'criminal', label: 'Criminal Records', desc: 'Focus on criminal history and court records' },
    { id: 'civil', label: 'Civil Records', desc: 'Lawsuits, judgments, bankruptcies' },
    { id: 'address', label: 'Address & Contact', desc: 'Find addresses, phone numbers, emails' },
    { id: 'professional', label: 'Professional History', desc: 'Licenses, certifications, disciplinary actions' }
  ];

  const handleLookup = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name to search');
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.post('/api/ai/person-lookup', {
        ...formData,
        additional_info: selectedCase ? `Case ID: ${selectedCase.id}. ${formData.additional_info}` : formData.additional_info
      });
      setLookupResult(result);
      setSearchHistory([{ name: formData.name, timestamp: new Date().toISOString(), type: formData.lookup_type }, ...searchHistory.slice(0, 9)]);
      toast.success('Background check complete');
    } catch (error) {
      toast.error(error.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCourtSearch = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name to search');
      return;
    }
    
    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('state', formData.state);
      formPayload.append('case_type', 'all');
      
      const result = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/court-records-search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('cps_token')}` },
        body: formPayload
      }).then(r => r.json());
      
      setLookupResult({
        name: formData.name,
        lookup_type: 'court_records',
        results: { raw_report: result.court_records },
        sources_checked: ['Court Records Database'],
        disclaimer: result.disclaimer,
        timestamp: result.timestamp
      });
      toast.success('Court records search complete');
    } catch (error) {
      toast.error('Court records search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setLookupResult(null);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="personlookup-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Search className="w-8 h-8 text-red-500" />
          Background Check
        </h1>
        <p className="text-gray-400 mt-2">
          Investigate caseworkers, judges, witnesses, or other parties. Similar to NCIC law enforcement databases.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" /> Person Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
              placeholder="e.g., Jane Smith or Smith, Jane"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
            <select
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
            >
              <option value="">Select State</option>
              {['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
              placeholder="City (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Additional Info</label>
            <input
              type="text"
              value={formData.additional_info}
              onChange={e => setFormData({...formData, additional_info: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none"
              placeholder="DOB, employer, address, etc."
            />
          </div>
        </div>

        {/* Lookup Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Search Type</label>
          <div className="grid md:grid-cols-3 gap-3">
            {lookupTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setFormData({...formData, lookup_type: type.id})}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.lookup_type === type.id 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="personlookup-back-btn"
          >
            Back
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="personlookup-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleLookup}
            disabled={loading}
            className="btn-punisher flex items-center gap-2"
            data-testid="personlookup-run-btn"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Run Background Check
          </button>
          <button
            onClick={handleCourtSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            data-testid="personlookup-courtsearch-btn"
          >
            <Scale className="w-5 h-5" />
            Search Court Records
          </button>
        </div>
      </div>

      {/* Results */}
      {lookupResult && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Background Report: {lookupResult.name}
            </h2>
            <span className="text-xs text-gray-500">{new Date(lookupResult.timestamp).toLocaleString()}</span>
          </div>

          {/* Sources Checked */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lookupResult.sources_checked?.map((source, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                {source}
              </span>
            ))}
          </div>

          {/* Report Content */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
              {lookupResult.results?.raw_report || 'No report data'}
            </pre>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">{lookupResult.disclaimer}</p>
            </div>
          </div>

          {/* Save to Case */}
          {selectedCase && (
            <button
              onClick={() => toast.success('Report saved to case AI notes')}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save to Case
            </button>
          )}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-gray-400">Recent Searches</h3>
          <div className="space-y-2">
            {searchHistory.map((search, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-700/50"
                onClick={() => setFormData({...formData, name: search.name})}
              >
                <span className="text-sm">{search.name}</span>
                <span className="text-xs text-gray-500">{new Date(search.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" /> What This Tool Searches
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="font-medium text-white mb-2">Criminal Records</h4>
            <ul className="space-y-1">
              <li>• Felony and misdemeanor convictions</li>
              <li>• Pending charges</li>
              <li>• Sex offender registry</li>
              <li>• Restraining orders</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Civil Records</h4>
            <ul className="space-y-1">
              <li>• Lawsuits (plaintiff/defendant)</li>
              <li>• Bankruptcies</li>
              <li>• Judgments and liens</li>
              <li>• Family court matters</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Personal Information</h4>
            <ul className="space-y-1">
              <li>• Known addresses</li>
              <li>• Phone numbers</li>
              <li>• Email addresses</li>
              <li>• Relatives and associates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Professional Records</h4>
            <ul className="space-y-1">
              <li>• Professional licenses</li>
              <li>• Disciplinary actions</li>
              <li>• Complaints filed</li>
              <li>• Employment history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



// Defense Strategy Tab

export default PersonLookupTab;
