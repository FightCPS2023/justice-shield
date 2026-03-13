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

function ForumTab() {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general' });

  const categories = [
    { id: 'general', label: 'General Discussion' },
    { id: 'legal', label: 'Legal Questions' },
    { id: 'victories', label: 'Victories & Success Stories' },
    { id: 'support', label: 'Support & Encouragement' },
    { id: 'resources', label: 'Resources & Tips' }
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await api.get('/api/forum/posts');
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPost = await api.post('/api/forum/posts', formData);
      setPosts([newPost, ...posts]);
      setShowAdd(false);
      setFormData({ title: '', content: '', category: 'general' });
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="forum-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Community Forum</h1>
          <p className="text-gray-400">Connect with other parents fighting CPS</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> New Post
        </button>
      </div>

      {/* Add Post Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{post.category}</span>
                <span className="text-gray-500 text-sm">{post.author_name}</span>
                <span className="text-gray-600 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-gray-400 mt-2">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Advocates Tab

export default ForumTab;
