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

function LegalKnowledgeBaseTab() {
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('supreme');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [supreme, circuit, blacks, section1983, rooker] = await Promise.all([
        api.get('/api/legal/supreme-court-cases'),
        api.get('/api/legal/circuit-court-cases'),
        api.get('/api/legal/blacks-law'),
        api.get('/api/legal/section-1983-guide'),
        api.get('/api/legal/rooker-feldman')
      ]);
      setData({ supreme, circuit, blacks, section1983, rooker });
    } catch (error) {
      console.error('Failed to load legal data');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'supreme', label: 'Supreme Court Cases', icon: Scale },
    { id: 'circuit', label: 'Circuit Court Cases', icon: Gavel },
    { id: 'blacks', label: "Black's Law Definitions", icon: BookOpen },
    { id: 'section1983', label: 'Section 1983 Guide', icon: FileText },
    { id: 'rooker', label: 'Rooker-Feldman', icon: Shield }
  ];

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="legaldb-tab">
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <BookOpen className="w-8 h-8 text-blue-500" />
          Legal Knowledge Base
        </h1>
        <p className="text-gray-300 mt-2">
          Comprehensive legal database with Supreme Court cases, Circuit Court precedents, Black's Law definitions, and Section 1983 guidance.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'supreme' && data.supreme && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Landmark Supreme Court Cases ({data.supreme.count})</h2>
          {Object.entries(data.supreme.cases || {}).map(([key, caseInfo]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400">{caseInfo.citation}</h3>
              <p className="text-gray-300 mt-2"><strong>Holding:</strong> {caseInfo.holding}</p>
              <p className="text-gray-400 mt-2"><strong>Application:</strong> {caseInfo.application}</p>
              {caseInfo.key_quotes && (
                <div className="mt-3 pl-4 border-l-2 border-blue-500">
                  {caseInfo.key_quotes.map((quote, i) => (
                    <p key={i} className="text-sm text-gray-400 italic mb-2">"{quote}"</p>
                  ))}
                </div>
              )}
              {caseInfo.use_for && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {caseInfo.use_for.map((use, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{use}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'circuit' && data.circuit && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Federal Circuit Court Precedents ({data.circuit.count})</h2>
          {Object.entries(data.circuit.cases || {}).map(([key, caseInfo]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-purple-400">{caseInfo.citation}</h3>
                {caseInfo.section_1983 && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">§1983 Case</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{caseInfo.circuit}</p>
              <p className="text-gray-300 mt-2"><strong>Holding:</strong> {caseInfo.holding}</p>
              <p className="text-gray-400 mt-2"><strong>Application:</strong> {caseInfo.application}</p>
              {caseInfo.key_quotes && (
                <div className="mt-3 pl-4 border-l-2 border-purple-500">
                  {caseInfo.key_quotes.map((quote, i) => (
                    <p key={i} className="text-sm text-gray-400 italic mb-2">"{quote}"</p>
                  ))}
                </div>
              )}
              {caseInfo.use_for && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {caseInfo.use_for.map((use, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">{use}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'blacks' && data.blacks && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Black's Law Dictionary Definitions ({data.blacks.count})</h2>
          <p className="text-sm text-gray-500">Source: {data.blacks.source}</p>
          {Object.entries(data.blacks.definitions || {}).map(([term, info]) => (
            <div key={term} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-400">{term}</h3>
              <p className="text-gray-300 mt-2">{info.definition}</p>
              {info.application && (
                <p className="text-gray-400 mt-2"><strong>CPS Application:</strong> {info.application}</p>
              )}
              {info.key_requirements && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-400">Requirements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
                    {info.key_requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'section1983' && data.section1983 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Section 1983 Civil Rights Guide</h2>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-400">42 U.S.C. § 1983</h3>
            <div className="mt-4">
              <p className="font-medium">Required Elements:</p>
              <ul className="list-disc list-inside text-gray-400 mt-2">
                {data.section1983.guide?.elements?.map((el, i) => <li key={i}>{el}</li>)}
              </ul>
            </div>
            {data.section1983.guide?.defendants && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {Object.entries(data.section1983.guide.defendants).map(([key, info]) => (
                  <div key={key} className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-medium text-red-400 capitalize">{key.replace(/_/g, ' ')}</h4>
                    <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                  </div>
                ))}
              </div>
            )}
            {data.section1983.guide?.damages && (
              <div className="mt-4">
                <p className="font-medium">Available Damages:</p>
                <div className="grid md:grid-cols-2 gap-2 mt-2">
                  {Object.entries(data.section1983.guide.damages).map(([type, desc]) => (
                    <div key={type} className="bg-black/30 rounded-lg p-3">
                      <span className="text-green-400 capitalize">{type}:</span>
                      <span className="text-gray-400 text-sm ml-2">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'rooker' && data.rooker && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Rooker-Feldman Doctrine & Avoidance</h2>
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-400">Critical for Section 1983 Cases!</h3>
            <p className="text-gray-300 mt-2">{data.rooker.doctrine?.doctrine}</p>
            <p className="text-yellow-400 mt-2"><strong>Key Case:</strong> {data.rooker.doctrine?.key_case}</p>
            <p className="text-green-400 mt-2"><strong>Limitation:</strong> {data.rooker.doctrine?.limitation}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Avoidance Strategies</h3>
            {data.rooker.doctrine?.avoidance_strategies?.map((strategy, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="font-bold text-green-400">{strategy.strategy}</h4>
                <p className="text-gray-400 mt-2">{strategy.explanation}</p>
                {strategy.good_example && (
                  <div className="mt-3 bg-green-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500">GOOD:</p>
                    <p className="text-green-400 text-sm">{strategy.good_example}</p>
                  </div>
                )}
                {strategy.bad_example && (
                  <div className="mt-2 bg-red-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500">BAD:</p>
                    <p className="text-red-400 text-sm">{strategy.bad_example}</p>
                  </div>
                )}
                {strategy.good_claims && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">GOOD CLAIMS:</p>
                    <ul className="list-disc list-inside text-green-400 text-sm">
                      {strategy.good_claims.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {strategy.bad_claims && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">BAD CLAIMS:</p>
                    <ul className="list-disc list-inside text-red-400 text-sm">
                      {strategy.bad_claims.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Rights Guide Tab

export default LegalKnowledgeBaseTab;
