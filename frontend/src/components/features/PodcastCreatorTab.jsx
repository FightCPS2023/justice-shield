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

function PodcastCreatorTab({ selectedCase }) {
  const { api } = useAuth();
  const [topics, setTopics] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    episode_type: 'educational',
    duration_minutes: 15,
    include_case_details: false
  });
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    loadTopics();
    loadScripts();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await api.get('/api/podcast/topics');
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics');
    }
  };

  const loadScripts = async () => {
    try {
      const data = await api.get('/api/podcast/scripts');
      setScripts(data.scripts || []);
    } catch (error) {
      console.error('Failed to load scripts');
    }
  };

  const generateScript = async () => {
    if (!formData.topic.trim()) {
      toast.error('Enter a podcast topic');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        ...formData,
        case_id: selectedCase?.id || null
      };
      const data = await api.post('/api/podcast/generate-script', payload);
      setScript(data);
      loadScripts();
      toast.success('Podcast script generated!');
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const episodeTypes = [
    { id: 'educational', label: 'Educational', desc: 'Deep-dive on legal concepts' },
    { id: 'case_analysis', label: 'Case Analysis', desc: 'Analyze legal strategies' },
    { id: 'interview_style', label: 'Interview', desc: 'Host + expert format' },
    { id: 'news_update', label: 'News Update', desc: 'Legal news and changes' },
    { id: 'legal_breakdown', label: 'Legal Breakdown', desc: 'Step-by-step procedures' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="podcast-tab">
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-500 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Mic className="w-8 h-8 text-zinc-300" />
          Podcast Script Creator
        </h1>
        <p className="text-gray-300 mt-2">
          Create professional podcast scripts about CPS defense, legal rights, and case strategies.
          Educate and empower parents through audio content.
        </p>
      </div>

      {/* Episode Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Episode Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="e.g., Understanding Your Fourth Amendment Rights"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Episode Type</label>
            <div className="grid grid-cols-2 gap-2">
              {episodeTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData({...formData, episode_type: type.id})}
                  className={`p-3 rounded-lg text-left border ${
                    formData.episode_type === type.id
                      ? 'bg-zinc-700/40 border-zinc-500'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Duration: {formData.duration_minutes} minutes</label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          {selectedCase && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.include_case_details}
                onChange={(e) => setFormData({...formData, include_case_details: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">Include case details (anonymized)</span>
            </label>
          )}

          <button
            onClick={generateScript}
            disabled={generating || !formData.topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-800 hover:to-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Script...</>
            ) : (
              <><Mic className="w-5 h-5" /> Generate Podcast Script</>
            )}
          </button>
        </div>

        {/* Topic Suggestions */}
        {topics && (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 max-h-[500px] overflow-y-auto">
            <h3 className="font-semibold mb-4">Suggested Topics</h3>
            {topics.categories.map((cat, i) => (
              <div key={i} className="mb-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">{cat.name}</p>
                <div className="space-y-1">
                  {cat.topics.map((topic, j) => (
                    <button
                      key={j}
                      onClick={() => setFormData({...formData, topic})}
                      className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-700 rounded text-sm"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Script */}
      {script && (
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-500 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Radio className="w-6 h-6 text-zinc-300" />
              {script.topic}
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-700 rounded text-sm">{script.duration_minutes} min</span>
              <span className="px-3 py-1 bg-gray-700 rounded text-sm">{script.word_count} words</span>
              <button
                onClick={() => navigator.clipboard.writeText(script.script)}
                className="px-4 py-1 bg-zinc-700 hover:bg-zinc-700 rounded flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-6 rounded-lg overflow-auto max-h-[600px]">
            {script.script}
          </pre>
        </div>
      )}

      {/* Previous Scripts */}
      {scripts.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Previous Scripts</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.slice(0, 6).map(s => (
              <div key={s.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <Mic className="w-5 h-5 text-zinc-300 mb-2" />
                <h4 className="font-medium text-sm line-clamp-2">{s.topic}</h4>
                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                  <span>{s.episode_type}</span>
                  <span>{s.duration_minutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Case Law Analysis Tab

export default PodcastCreatorTab;
