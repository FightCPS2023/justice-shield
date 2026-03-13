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

function AICaseNotesTab({ selectedCase }) {
  const { api } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [featureCounts, setFeatureCounts] = useState({});
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (selectedCase) {
      loadNotes();
    }
  }, [selectedCase, filter]);

  const loadNotes = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `/api/cases/${selectedCase.id}/ai-notes`
        : `/api/cases/${selectedCase.id}/ai-notes?feature_type=${filter}`;
      const data = await api.get(url);
      setNotes(data.notes || []);
      setFeatureCounts(data.feature_counts || {});
    } catch (error) {
      console.error('Failed to load AI notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this AI note?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/cases/${selectedCase.id}/ai-notes/${noteId}`);
      toast.success('Note deleted');
      loadNotes();
      setSelectedNote(null);
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const featureLabels = {
    chat: { label: 'AI Chat', icon: MessageSquare, color: 'text-purple-400' },
    strategy: { label: 'Defense Strategy', icon: Shield, color: 'text-blue-400' },
    research: { label: 'Legal Research', icon: Search, color: 'text-green-400' },
    document: { label: 'Document Gen', icon: FileText, color: 'text-amber-400' },
    forensic: { label: 'Forensic Analysis', icon: Eye, color: 'text-red-400' },
    analysis: { label: 'AI Analysis', icon: Brain, color: 'text-cyan-400' },
  };

  const getFeatureInfo = (type) => featureLabels[type] || { label: type, icon: Brain, color: 'text-gray-400' };

  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn">
        <Brain className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Select a Case First</h2>
        <p className="text-gray-400">AI notes are automatically saved when you use AI features while a case is selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="ai-notes-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>AI Case Notes</h1>
          <p className="text-gray-400">All AI-generated insights for: <span className="text-red-400">{selectedCase.title}</span></p>
        </div>
        <button onClick={loadNotes} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          All ({Object.values(featureCounts).reduce((a, b) => a + b, 0) || notes.length})
        </button>
        {Object.entries(featureCounts).map(([type, count]) => {
          const info = getFeatureInfo(type);
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${filter === type ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <info.icon className="w-4 h-4" />
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Brain className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No AI notes yet for this case</p>
          <p className="text-sm text-gray-500">Use AI features (Chat, Strategy, Research, etc.) while this case is selected to generate notes.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map(note => {
            const info = getFeatureInfo(note.feature_type);
            return (
              <div 
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-gray-900 ${info.color}`}>
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm truncate">{note.prompt}</p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{note.response?.substring(0, 150)}...</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const info = getFeatureInfo(selectedNote.feature_type);
                  return (
                    <>
                      <div className={`p-2 rounded-lg bg-gray-800 ${info.color}`}>
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{info.label}</h2>
                        <p className="text-xs text-gray-500">{new Date(selectedNote.created_at).toLocaleString()}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedNote.response);
                    toast.success('Copied to clipboard');
                  }}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Copy response"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  disabled={deleting}
                  className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedNote(null)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedNote.prompt && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Your Prompt / Question</p>
                  <p className="text-gray-300">{selectedNote.prompt}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-2">AI Response</p>
                <div className="prose prose-invert max-w-none bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">{selectedNote.response}</pre>
                </div>
              </div>
              {selectedNote.metadata && Object.keys(selectedNote.metadata).length > 0 && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                  <p>Metadata: {JSON.stringify(selectedNote.metadata)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Smart Document Generator Tab — Cetient-Style

export default AICaseNotesTab;
