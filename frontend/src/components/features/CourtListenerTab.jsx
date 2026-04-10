import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
  const [selectedResult, setSelectedResult] = useState(null);
  const [filters, setFilters] = useState({
    court: '',
    date_after: '',
    date_before: '',
    judge: '',
    docket_number: '',
    citation: '',
    order_by: 'score desc'
  });
  const [opinionModalOpen, setOpinionModalOpen] = useState(false);
  const [opinionLoading, setOpinionLoading] = useState(false);
  const [opinionDetail, setOpinionDetail] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

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
      if (filters.judge) params.append('judge', filters.judge);
      if (filters.docket_number) params.append('docket_number', filters.docket_number);
      if (filters.citation) params.append('citation', filters.citation);
      if (filters.order_by) params.append('order_by', filters.order_by);
      
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

  const openOpinion = async (result) => {
    const opinionId = result.opinion_id || result.id;
    if (!opinionId) {
      toast.error('Opinion details are not available for this result.');
      return;
    }
    setSelectedResult(result);
    setOpinionModalOpen(true);
    setOpinionLoading(true);
    setOpinionDetail(null);
    try {
      const data = await api.get(`/api/courtlistener/opinion/${opinionId}`);
      setOpinionDetail(data);
    } catch (error) {
      toast.error('Failed to load full opinion text');
    } finally {
      setOpinionLoading(false);
    }
  };

  const analyzeOpinion = async (result) => {
    if (!selectedCase) {
      toast.error('Select a case to save analysis.');
      return;
    }
    setAnalysisLoading(true);
    try {
      const payload = {
        case_id: selectedCase.id,
        opinion_id: result.opinion_id || result.id,
        case_name: result.caseName || result.case_name,
        citation: result.citation,
        court: result.court || result.court_id,
        date_filed: result.dateFiled || result.date_filed,
        url: result.absolute_url,
        snippet: result.snippet,
        opinion_text: opinionDetail?.plain_text || ''
      };
      const data = await api.post('/api/courtlistener/analyze', payload);
      setAnalysisData(data);
      toast.success('Analysis saved to Case Notes + Case Memory');
    } catch (error) {
      toast.error('Analysis failed. Try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="courtlistener-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Scale className="w-8 h-8 text-red-500" />
          Court Opinions Database
        </h1>
        <p className="text-slate-600">Search 50+ million court opinions from CourtListener</p>
      </div>

      {/* Search Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for cases (e.g., 'CPS removal fourth amendment')"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-red-500 focus:outline-none"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={filters.court}
              onChange={(e) => setFilters({...filters, court: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              data-testid="courtlistener-filter-court"
            >
              {courts.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={filters.judge}
              onChange={(e) => setFilters({...filters, judge: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              placeholder="Judge name"
              data-testid="courtlistener-filter-judge"
            />
            <input
              type="text"
              value={filters.docket_number}
              onChange={(e) => setFilters({...filters, docket_number: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              placeholder="Docket number"
              data-testid="courtlistener-filter-docket"
            />
            <input
              type="text"
              value={filters.citation}
              onChange={(e) => setFilters({...filters, citation: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              placeholder="Citation"
              data-testid="courtlistener-filter-citation"
            />
            <input
              type="date"
              value={filters.date_after}
              onChange={(e) => setFilters({...filters, date_after: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              placeholder="Filed After"
              data-testid="courtlistener-filter-after"
            />
            <input
              type="date"
              value={filters.date_before}
              onChange={(e) => setFilters({...filters, date_before: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              placeholder="Filed Before"
              data-testid="courtlistener-filter-before"
            />
            <select
              value={filters.order_by}
              onChange={(e) => setFilters({...filters, order_by: e.target.value})}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg"
              data-testid="courtlistener-filter-order"
            >
              <option value="score desc">Relevance</option>
              <option value="dateFiled desc">Newest</option>
              <option value="dateFiled asc">Oldest</option>
              <option value="citeCount desc">Most Cited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-600">{results.length} Results Found</h3>
          {results.map((result, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-red-600/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-400 mb-2">
                    {result.caseName || result.case_name || 'Unnamed Case'}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Gavel className="w-4 h-4" />
                      {result.court || result.court_id || 'Unknown Court'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {result.dateFiled || result.date_filed || 'Unknown Date'}
                    </span>
                    {result.citation && (
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                        {result.citation}
                      </span>
                    )}
                  </div>
                  {result.snippet && (
                    <p className="text-slate-600 text-sm line-clamp-3">{result.snippet}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openOpinion(result)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm flex items-center gap-1"
                    data-testid={`courtlistener-opinion-${idx}`}
                  >
                    <Eye className="w-4 h-4" />
                    Opinion
                  </button>
                  <button
                    onClick={() => analyzeOpinion(result)}
                    disabled={analysisLoading}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
                    data-testid={`courtlistener-analyze-${idx}`}
                  >
                    {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Analyze & Save
                  </button>
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
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-1"
                      data-testid={`courtlistener-view-${idx}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisData && (
        <div className="bg-white border border-slate-200 rounded-xl p-6" data-testid="courtlistener-analysis-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">AI Analysis & Strategy</h3>
            <button
              onClick={() => setAnalysisData(null)}
              className="text-xs text-slate-600 hover:text-slate-700"
              data-testid="courtlistener-analysis-close"
            >
              Close
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-sans">{analysisData.analysis}</pre>
          {analysisData.next_steps?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-emerald-300 mb-2">Next Steps</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {analysisData.next_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {opinionModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="courtlistener-opinion-modal">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold" data-testid="courtlistener-opinion-title">
                  {opinionDetail?.case_name || selectedResult?.caseName || 'Court Opinion'}
                </h3>
                <p className="text-xs text-slate-500">
                  {opinionDetail?.citation || selectedResult?.citation || 'Citation unavailable'}
                </p>
              </div>
              <button
                onClick={() => setOpinionModalOpen(false)}
                className="text-slate-600 hover:text-slate-700"
                data-testid="courtlistener-opinion-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {opinionLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading full opinion...
                </div>
              )}
              {!opinionLoading && (
                <pre className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-sans" data-testid="courtlistener-opinion-text">
                  {opinionDetail?.plain_text || 'Full opinion text not available for this result.'}
                </pre>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => selectedResult && analyzeOpinion(selectedResult)}
                disabled={analysisLoading || !selectedCase}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                data-testid="courtlistener-opinion-analyze"
              >
                {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Analyze & Save
              </button>
              {opinionDetail?.absolute_url && (
                <a
                  href={opinionDetail.absolute_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-2"
                  data-testid="courtlistener-opinion-source"
                >
                  <ArrowRight className="w-4 h-4" /> Source
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Search className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-slate-600">Try different search terms or adjust your filters.</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Scale className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Search Court Opinions</h3>
          <p className="text-slate-600">Enter keywords to search millions of court opinions. Try searches like:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['CPS constitutional rights', 'parental rights due process', 'fourth amendment home entry', 'qualified immunity CPS'].map((term, idx) => (
              <button
                key={term}
                onClick={() => { setQuery(term); }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-sm"
                data-testid={`courtlistener-suggestion-${idx}`}
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
