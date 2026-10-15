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

function RightsGuideTab() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    loadRightsGuide();
  }, []);

  const loadRightsGuide = async () => {
    try {
      const rights = await api.get('/api/rights-guide');
      setData(rights);
    } catch (error) {
      console.error('Failed to load rights guide');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="rights-tab">
      <div className="bg-gradient-to-r from-zinc-900 to-gray-900 border border-zinc-700 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Shield className="w-8 h-8 text-zinc-300" />
          Know Your Rights
        </h1>
        <p className="text-gray-300 mt-2">
          Your constitutional rights during CPS interactions. Know them. Assert them. Protect your family.
        </p>
      </div>

      {/* Quick Rights */}
      {data?.quick_rights && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.quick_rights.map((qr, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-400">{qr.question}</h3>
              <p className="text-gray-300 mt-2">{qr.answer}</p>
              <p className="text-xs text-zinc-300 mt-2">{qr.legal_basis}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      {data?.categories && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                  activeCategory === i ? 'bg-zinc-300 text-black' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                {cat.title}
              </button>
            ))}
          </div>

          {/* Rights List */}
          <div className="space-y-4">
            {data.categories[activeCategory]?.rights.map((right, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-zinc-300">{right.title}</h3>
                <p className="text-gray-300 mt-2">{right.description}</p>
                {right.details && (
                  <ul className="mt-4 space-y-2">
                    {right.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {right.key_case && (
                  <p className="text-sm text-zinc-300 mt-4">Key Case: {right.key_case}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Evidence Checklist Tab

export default RightsGuideTab;
