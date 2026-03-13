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

function CourtListenerTab({ selectedCase }) {
  const { api } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    court: '',
    date_after: '',
    date_before: ''
  });

  const courts = [
    { value: '', label: 'All Courts' },
    { value: 'scotus', label: 'U.S. Supreme Court' },
    { value: 'ca1', label: '1st Circuit' },
    { value: 'ca2', label: '2nd Circuit' },
    { value: 'ca3', label: '3rd Circuit' },
    { value: 'ca4', label: '4th Circuit' },
    { value: 'ca5', label: '5th Circuit' },
    { value: 'ca6', label: '6th Circuit' },
    { value: 'ca7', label: '7th Circuit' },
    { value: 'ca8', label: '8th Circuit' },
    { value: 'ca9', label: '9th Circuit' },
    { value: 'ca10', label: '10th Circuit' },
    { value: 'ca11', label: '11th Circuit' },
    { value: 'cadc', label: 'D.C. Circuit' },
  ];

  const searchCases = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (filters.court) params.append('court', filters.court);
      if (filters.date_after) params.append('filed_after', filters.date_after);
      if (filters.date_before) params.append('filed_before', filters.date_before);
      
      const response = await api.get(`/api/courtlistener/search?${params}`);
      setResults(response.results || []);
    } catch (error) {
      toast.error('Search failed. Try different terms.');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotepad = async (result) => {
    try {
      await api.post('/api/notepad/save-from-courtlistener', {
        case_name: result.caseName || result.case_name || 'Unknown Case',
        citation: result.citation || 'No citation',
        court: result.court || result.court_id || 'Unknown Court',
        date_filed: result.dateFiled || result.date_filed || 'Unknown Date',
        snippet: result.snippet || result.text || '',
        url: result.absolute_url || `https://www.courtlistener.com${result.url || ''}`,
        case_id: selectedCase?.id || null
      });
      toast.success('Case saved to your Legal Notepad!');
    } catch (error) {
      toast.error('Failed to save case');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courtlistener-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Scale className="w-8 h-8 text-red-500" />
          Court Opinions Database
        </h1>
        <p className="text-gray-400">Search 50+ million court opinions from CourtListener</p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for cases (e.g., 'CPS removal fourth amendment')"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && searchCases()}
              data-testid="courtlistener-search-input"
            />
            <button
              onClick={searchCases}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              data-testid="courtlistener-search-btn"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.court}
              onChange={(e) => setFilters({...filters, court: e.target.value})}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
            >
              {courts.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.date_after}
              onChange={(e) => setFilters({...filters, date_after: e.target.value})}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              placeholder="Filed After"
            />
            <input
              type="date"
              value={filters.date_before}
              onChange={(e) => setFilters({...filters, date_before: e.target.value})}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              placeholder="Filed Before"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-400">{results.length} Results Found</h3>
          {results.map((result, idx) => (
            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-red-600/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-400 mb-2">
                    {result.caseName || result.case_name || 'Unnamed Case'}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Gavel className="w-4 h-4" />
                      {result.court || result.court_id || 'Unknown Court'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {result.dateFiled || result.date_filed || 'Unknown Date'}
                    </span>
                    {result.citation && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {result.citation}
                      </span>
                    )}
                  </div>
                  {result.snippet && (
                    <p className="text-gray-300 text-sm line-clamp-3">{result.snippet}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => saveToNotepad(result)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-1"
                    data-testid={`save-case-${idx}`}
                  >
                    <Plus className="w-4 h-4" />
                    Save
                  </button>
                  {result.absolute_url && (
                    <a
                      href={result.absolute_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-gray-400">Try different search terms or adjust your filters.</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <Scale className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Search Court Opinions</h3>
          <p className="text-gray-400">Enter keywords to search millions of court opinions. Try searches like:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['CPS constitutional rights', 'parental rights due process', 'fourth amendment home entry', 'qualified immunity CPS'].map(term => (
              <button
                key={term}
                onClick={() => { setQuery(term); }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Legal Notepad Tab - Save & Organize Research

export default CourtListenerTab;
