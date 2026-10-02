import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Brain, Plus, Trash2, Loader2, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAutosaveDraft } from '../../hooks/useAutosaveDraft';
import { DraftStatus } from '../DraftStatus';

function CaseMemoryTab({ selectedCase }) {
  const { api } = useAuth();
  const [memoryEntries, setMemoryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = { title: "", content: "", tags: "" };
  const [formData, setFormData] = useState(initialFormState);
  const draft = useAutosaveDraft(`memory:${selectedCase?.id || 'global'}`, formData, setFormData, initialFormState, () => setShowAdd(true));

  useEffect(() => {
    if (selectedCase) {
      loadMemory();
    }
  }, [selectedCase]);

  const loadMemory = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/cases/${selectedCase.id}/memory`);
      setMemoryEntries(data.memory || []);
    } catch (error) {
      toast.error("Failed to load case memory");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and memory content are required");
      return;
    }
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      };
      const newEntry = await api.post(`/api/cases/${selectedCase.id}/memory`, payload);
      setMemoryEntries([newEntry, ...memoryEntries]);
      setFormData(initialFormState);
      setShowAdd(false);
      toast.success("Memory saved");
    } catch (error) {
      toast.error("Failed to save memory");
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await api.delete(`/api/cases/${selectedCase.id}/memory/${entryId}`);
      setMemoryEntries(memoryEntries.filter((entry) => entry.id !== entryId));
      toast.success("Memory deleted");
    } catch (error) {
      toast.error("Failed to delete memory");
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowAdd(false);
  };

  const handleBack = () => {
    setShowAdd(false);
    const referrer = document.referrer || "";
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="case-memory-empty">
        <Brain className="w-12 h-12 mx-auto text-purple-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Select a Case</h3>
        <p className="text-gray-400">Choose a case to view and build memory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="case-memory-tab">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Case Memory
          </h2>
          <p className="text-gray-400">This memory is used by AI tools to get smarter over time.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
          data-testid="case-memory-add-btn"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4" data-testid="case-memory-form">
          <DraftStatus draft={draft} testId="memory-draft-status" />
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
              data-testid="case-memory-title-input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Memory Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 min-h-[120px]"
              data-testid="case-memory-content-input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
              data-testid="case-memory-tags-input"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg" data-testid="case-memory-back-btn">Back</button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg" data-testid="case-memory-cancel-btn">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg" data-testid="case-memory-save-btn">Save Memory</button>
          </div>
        </form>
      )}

      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6" data-testid="case-memory-list">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400" data-testid="case-memory-loading">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading memory...
          </div>
        ) : memoryEntries.length === 0 ? (
          <p className="text-gray-400" data-testid="case-memory-empty-state">No memory entries yet. Add key facts to improve AI accuracy.</p>
        ) : (
          <div className="space-y-4">
            {memoryEntries.map((entry, idx) => (
              <div key={entry.id} className="bg-black/30 border border-gray-700 rounded-lg p-4" data-testid={`case-memory-entry-${idx}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-white" data-testid={`case-memory-title-${idx}`}>{entry.title}</h4>
                    <p className="text-xs text-gray-500" data-testid={`case-memory-meta-${idx}`}>
                      {entry.source || "manual"} • {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg"
                    data-testid={`case-memory-delete-${idx}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-300 mt-3 whitespace-pre-wrap" data-testid={`case-memory-content-${idx}`}>{entry.content}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3" data-testid={`case-memory-tags-${idx}`}>
                    {entry.tags.map((tag, tagIdx) => (
                      <span key={tagIdx} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-600/20 text-purple-300 rounded-full">
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseMemoryTab;
