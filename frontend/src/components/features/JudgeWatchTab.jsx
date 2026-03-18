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

function JudgeWatchTab({ selectedCase }) {
  const { api } = useAuth();
  const [judgeResearch, setJudgeResearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    judge_name: '',
    court: '',
    research_notes: '',
    judicial_philosophy: '',
    known_rulings: []
  };
  const [formData, setFormData] = useState(initialFormState);
  const [rulingInput, setRulingInput] = useState('');

  useEffect(() => {
    if (selectedCase) loadJudgeResearch();
  }, [selectedCase]);

  const loadJudgeResearch = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/judge-research/${selectedCase.id}`);
      setJudgeResearch(data.judge_research);
    } catch (error) {
      console.error('Failed to load judge research:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchJudge = async (name) => {
    if (!name || name.length < 3) return;
    setSearching(true);
    try {
      const data = await api.get(`/api/courtlistener/judges?name=${encodeURIComponent(name)}`);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const research = await api.post('/api/judge-research', {
        ...formData,
        case_id: selectedCase.id
      });
      setJudgeResearch(research);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Judge research saved!');
    } catch (error) {
      toast.error('Failed to save research');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowAdd(false);
  };

  const handleBack = () => {
    setShowAdd(false);
    window.history.back();
  };

  const addRuling = () => {
    if (rulingInput.trim()) {
      setFormData({...formData, known_rulings: [...formData.known_rulings, rulingInput.trim()]});
      setRulingInput('');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="judgewatch-tab">
        <Scale className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to research the judge</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="judgewatch-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Judge Watch</h1>
          <p className="text-gray-400">Research your judge for {selectedCase.title}</p>
        </div>
        {!judgeResearch && (
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Add Judge Research
          </button>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Judge Research</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Judge Name</label>
                  <input
                    type="text"
                    value={formData.judge_name}
                    onChange={(e) => { setFormData({...formData, judge_name: e.target.value}); searchJudge(e.target.value); }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Full name"
                    required
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
                      {searchResults.slice(0, 5).map((judge, i) => (
                        <button key={i} type="button"
                          onClick={() => { setFormData({...formData, judge_name: judge.name_full || judge.name}); setSearchResults([]); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm">
                          {judge.name_full || judge.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Court</label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => setFormData({...formData, court: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="e.g., Travis County Family Court"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Judicial Philosophy</label>
                <textarea
                  value={formData.judicial_philosophy}
                  onChange={(e) => setFormData({...formData, judicial_philosophy: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20"
                  placeholder="What is their general approach? Pro-CPS? Pro-reunification?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Research Notes</label>
                <textarea
                  value={formData.research_notes}
                  onChange={(e) => setFormData({...formData, research_notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  placeholder="Any important information about this judge..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Known Rulings</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rulingInput}
                    onChange={(e) => setRulingInput(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Add a known ruling..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRuling())}
                  />
                  <button type="button" onClick={addRuling} className="px-4 py-2 bg-gray-600 rounded-lg">Add</button>
                </div>
                {formData.known_rulings.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.known_rulings.map((ruling, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm flex items-center gap-1">
                        {ruling}
                        <button type="button" onClick={() => setFormData({...formData, known_rulings: formData.known_rulings.filter((_, j) => j !== i)})}
                          className="text-red-400 hover:text-red-300">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="judgewatch-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="judgewatch-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="judgewatch-submit-btn">Save Research</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Judge Research Display */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : judgeResearch ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-900/30 to-gray-900 border border-yellow-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Scale className="w-8 h-8 text-yellow-500" />
                  {judgeResearch.judge_name}
                </h2>
                {judgeResearch.court && <p className="text-gray-400 mt-1">{judgeResearch.court}</p>}
              </div>
              <button onClick={() => { setFormData(judgeResearch); setShowAdd(true); }} className="px-3 py-1 bg-gray-700 rounded text-sm">
                <Edit2 className="w-4 h-4 inline mr-1" /> Edit
              </button>
            </div>
          </div>

          {judgeResearch.judicial_philosophy && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> Judicial Philosophy
              </h3>
              <p className="text-gray-300">{judgeResearch.judicial_philosophy}</p>
            </div>
          )}

          {judgeResearch.research_notes && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Research Notes
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">{judgeResearch.research_notes}</p>
            </div>
          )}

          {judgeResearch.known_rulings && judgeResearch.known_rulings.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-500" /> Known Rulings
              </h3>
              <ul className="space-y-2">
                {judgeResearch.known_rulings.map((ruling, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span className="text-gray-300">{ruling}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Scale className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No judge research yet for this case</p>
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Add Judge Research
          </button>
        </div>
      )}
    </div>
  );
}


// Person Lookup / Background Check Tab

export default JudgeWatchTab;
