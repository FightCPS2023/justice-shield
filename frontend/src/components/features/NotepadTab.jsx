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

function NotepadTab({ selectedCase }) {
  const { api } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // all, case, global
  const [selectedEntry, setSelectedEntry] = useState(null);
  const initialFormState = {
    title: '',
    content: '',
    category: 'general',
    tags: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const draft = useAutosaveDraft(`notepad:${selectedCase?.id || 'global'}`, formData, setFormData, initialFormState, () => setShowForm(true));

  const categories = [
    { value: 'general', label: 'General Notes', color: 'bg-gray-500' },
    { value: 'statute', label: 'Statutes & Codes', color: 'bg-zinc-300 text-black' },
    { value: 'case_law', label: 'Case Law', color: 'bg-zinc-700' },
    { value: 'strategy', label: 'Strategy', color: 'bg-green-500' },
    { value: 'timeline', label: 'Timeline Notes', color: 'bg-yellow-500' },
  ];

  useEffect(() => {
    loadEntries();
  }, [viewMode, selectedCase]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      let url = '/api/notepad?';
      if (viewMode === 'case' && selectedCase) {
        url += `case_id=${selectedCase.id}`;
      } else if (viewMode === 'global') {
        url += 'global_only=true';
      }
      const data = await api.get(url);
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async () => {
    try {
      const entry = {
        ...formData,
        case_id: viewMode === 'case' && selectedCase ? selectedCase.id : null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.post('/api/notepad', entry);
      toast.success('Note created!');
      setShowForm(false);
      setFormData(initialFormState);
      loadEntries();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowForm(false);
  };

  const handleBack = () => {
    setShowForm(false);
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/api/notepad/${id}`);
      toast.success('Note deleted');
      loadEntries();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const exportToPdf = async (entryId) => {
    try {
      const response = await fetch(`${API_URL}/api/export/notepad/${entryId}/pdf`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note_${entryId.slice(0,8)}.pdf`;
      a.click();
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('PDF export failed');
    }
  };

  const exportAllToPdf = async () => {
    try {
      let url = `${API_URL}/api/export/notepad/all/pdf`;
      if (viewMode === 'case' && selectedCase) {
        url += `?case_id=${selectedCase.id}`;
      }
      const response = await fetch(url, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'all_notes.pdf';
      a.click();
      toast.success('All notes exported to PDF!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="notepad-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <FileText className="w-8 h-8 text-zinc-300" />
            Legal Notepad
          </h1>
          <p className="text-gray-400">Save statutes, case law, and research notes for your cases</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-700 rounded-lg flex items-center gap-2 font-semibold"
            data-testid="new-note-btn"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
          {entries.length > 0 && (
            <button
              onClick={exportAllToPdf}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 font-semibold"
              data-testid="export-all-pdf-btn"
            >
              <Download className="w-5 h-5" />
              Export All PDF
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'all', label: 'All Notes' },
          { id: 'case', label: 'Case Notes', disabled: !selectedCase },
          { id: 'global', label: 'Global Notes' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            disabled={mode.disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === mode.id
                ? 'bg-zinc-700 text-white'
                : 'text-gray-400 hover:text-white disabled:opacity-50'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Create Note Form */}
      {showForm && (
        <div className="bg-gray-800/50 border border-zinc-500 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Create New Note</h3>
          <DraftStatus draft={draft} testId="notepad-draft-status" />
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Note Title"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              data-testid="note-title-input"
            />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Note content - paste statutes, case excerpts, or your own notes..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg resize-none"
              data-testid="note-content-input"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="Tags (comma separated)"
                className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                data-testid="notepad-back-btn"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                data-testid="notepad-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={createEntry}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-700 rounded-lg font-semibold"
                data-testid="save-note-btn"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        </div>
      ) : entries.length > 0 ? (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-zinc-500 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${categories.find(c => c.value === entry.category)?.color || 'bg-gray-600'}`}>
                      {categories.find(c => c.value === entry.category)?.label || 'Note'}
                    </span>
                    {entry.case_id && (
                      <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">Case-specific</span>
                    )}
                    {entry.source_type && (
                      <span className="px-2 py-1 bg-zinc-700/40 text-zinc-300 rounded text-xs">{entry.source_type}</span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{entry.title}</h4>
                  <p className="text-gray-400 text-sm line-clamp-3 whitespace-pre-wrap">{entry.content?.slice(0, 300)}...</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags?.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Created: {entry.created_at?.slice(0, 10)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {selectedEntry?.id === entry.id ? 'Hide' : 'View'}
                  </button>
                  <button
                    onClick={() => exportToPdf(entry.id)}
                    className="px-3 py-2 bg-zinc-300 text-black hover:bg-white rounded-lg text-sm flex items-center gap-1"
                    data-testid={`export-pdf-${entry.id}`}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Expanded View */}
              {selectedEntry?.id === entry.id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="bg-black/30 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">{entry.content}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
          <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Notes Yet</h3>
          <p className="text-gray-400 mb-4">Start saving statutes, case law, and research notes from the Law Library or Court Opinions.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-700 rounded-lg font-semibold"
          >
            Create Your First Note
          </button>
        </div>
      )}
    </div>
  );
}

// ADA Compliance Tab - Comprehensive ADA Accommodations Tool

export default NotepadTab;
