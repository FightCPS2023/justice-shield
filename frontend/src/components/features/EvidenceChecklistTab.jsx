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

function EvidenceChecklistTab({ selectedCase }) {
  const { api } = useAuth();
  const [checklist, setChecklist] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
    if (selectedCase) loadSavedChecklist();
  }, [selectedCase]);

  const loadChecklist = async () => {
    try {
      const data = await api.get('/api/evidence-checklist');
      setChecklist(data);
    } catch (error) {
      console.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedChecklist = async () => {
    if (!selectedCase) return;
    try {
      const data = await api.get(`/api/evidence-checklist/${selectedCase.id}`);
      setCheckedItems(data.checked_items || {});
    } catch (error) {
      console.error('Failed to load saved checklist');
    }
  };

  const toggleItem = async (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newChecked = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(newChecked);
    
    if (selectedCase) {
      try {
        await api.post(`/api/evidence-checklist/${selectedCase.id}`, { checked_items: newChecked });
      } catch (error) {
        console.error('Failed to save');
      }
    }
  };

  const totalItems = checklist?.categories?.reduce((sum, cat) => sum + cat.items.length, 0) || 0;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="evidencelist-tab">
      <div className="bg-gradient-to-r from-green-900/50 to-gray-900 border border-green-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          Evidence Checklist
        </h1>
        <p className="text-gray-300 mt-2">
          Build the strongest possible case. Check off evidence as you gather it.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Your Progress</span>
          <span className="text-green-400">{checkedCount} / {totalItems} ({progress}%)</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {checklist?.categories?.map((category, catIndex) => {
          const catChecked = category.items.filter((_, i) => checkedItems[`${catIndex}-${i}`]).length;
          return (
            <div key={catIndex} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  {category.title}
                </h3>
                <span className="text-sm text-gray-400">{catChecked}/{category.items.length}</span>
              </div>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => {
                  const key = `${catIndex}-${itemIndex}`;
                  const isChecked = checkedItems[key];
                  return (
                    <label key={itemIndex} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-gray-700/50">
                      <input
                        type="checkbox"
                        checked={isChecked || false}
                        onChange={() => toggleItem(catIndex, itemIndex)}
                        className="w-4 h-4 mt-0.5"
                      />
                      <span className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Visitation Log Tab

export default EvidenceChecklistTab;
