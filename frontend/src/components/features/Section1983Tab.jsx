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

function Section1983Tab({ selectedCase }) {
  const { api } = useAuth();
  const [templates, setTemplates] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [defendants, setDefendants] = useState(['']);
  const [violations, setViolations] = useState(['fourth_amendment', 'fourteenth_substantive_dp']);
  const [includeMonell, setIncludeMonell] = useState(true);
  const [includeConspiracy, setIncludeConspiracy] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await api.get('/api/section-1983/templates');
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

  const generateComplaint = async () => {
    if (!selectedCase) {
      toast.error('Select a case first');
      return;
    }

    setGenerating(true);
    try {
      const data = await api.post('/api/section-1983/generate', {
        case_id: selectedCase.id,
        defendants: defendants.filter(d => d.trim()),
        constitutional_violations: violations,
        include_monell: includeMonell,
        include_conspiracy: includeConspiracy,
        relief_sought: ['Compensatory damages', 'Punitive damages', 'Declaratory relief', 'Injunctive relief', 'Attorney fees']
      });
      setComplaint(data);
      toast.success('Section 1983 Complaint generated!');
    } catch (error) {
      toast.error('Failed to generate complaint');
    } finally {
      setGenerating(false);
    }
  };

  const addDefendant = () => setDefendants([...defendants, '']);
  const updateDefendant = (index, value) => {
    const updated = [...defendants];
    updated[index] = value;
    setDefendants(updated);
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="section1983-tab">
        <img src="/images/shield-logo.png" alt="CPS Punisher" className="w-24 h-28 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Section 1983 Lawsuit Generator</h3>
        <p className="text-gray-400">Select a case to generate a federal civil rights complaint</p>
        <p className="text-sm text-red-400 mt-2">Turn CPS violations into federal lawsuits</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="section1983-tab">
      <div className="bg-gradient-to-r from-red-900/50 to-gray-900 border border-red-800/50 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <img src="/images/shield-logo.png" alt="Logo" className="w-16 h-20 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
              <Gavel className="w-8 h-8 text-red-500" />
              Section 1983 Civil Rights Lawsuit
            </h1>
            <p className="text-gray-300 mt-2">
              42 U.S.C. § 1983 allows you to sue government officials who violate your constitutional rights.
              This is YOUR most powerful weapon against CPS overreach.
            </p>
          </div>
        </div>
      </div>

      {/* Claim Types Reference */}
      {templates && (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.claim_types.map(claim => (
            <div key={claim.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={violations.includes(claim.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setViolations([...violations, claim.id]);
                    } else {
                      setViolations(violations.filter(v => v !== claim.id));
                    }
                  }}
                  className="w-4 h-4"
                />
                <h3 className="font-semibold text-red-400">{claim.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-2">{claim.description}</p>
              <div className="text-xs text-gray-500">
                <p className="font-medium">Elements:</p>
                <ul className="list-disc list-inside">
                  {claim.elements.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Defendants */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Defendants to Sue</h3>
        {defendants.map((defendant, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={defendant}
              onChange={(e) => updateDefendant(i, e.target.value)}
              placeholder="e.g., Jane Smith, CPS Caseworker (Individual Capacity)"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
            {defendants.length > 1 && (
              <button onClick={() => setDefendants(defendants.filter((_, j) => j !== i))} className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addDefendant} className="mt-2 px-4 py-2 bg-gray-700 rounded-lg text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Defendant
        </button>
        
        {templates && (
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium">Common defendants:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {templates.common_defendants.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDefendants([...defendants.filter(x => x), d])}
                  className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
          <input type="checkbox" checked={includeMonell} onChange={(e) => setIncludeMonell(e.target.checked)} className="w-4 h-4" />
          <span>Include Monell Claim (Sue the Agency)</span>
        </label>
        <label className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
          <input type="checkbox" checked={includeConspiracy} onChange={(e) => setIncludeConspiracy(e.target.checked)} className="w-4 h-4" />
          <span>Include §1985 Conspiracy Claim</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateComplaint}
        disabled={generating || violations.length === 0}
        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
      >
        {generating ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> Generating Federal Lawsuit (60-90 seconds)...</>
        ) : (
          <><Gavel className="w-6 h-6" /> Generate Section 1983 Complaint</>
        )}
      </button>

      {/* Generated Complaint */}
      {complaint && (
        <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-500" />
              Generated Section 1983 Complaint
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(complaint.complaint)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-6 rounded-lg overflow-auto max-h-[800px] font-mono">
            {complaint.complaint}
          </pre>
          <p className="text-xs text-gray-500 mt-4">
            Generated: {new Date(complaint.generated_at).toLocaleString()} | 
            Violations analyzed: {complaint.violations_analyzed}
          </p>
        </div>
      )}
    </div>
  );
}

// Podcast Creator Tab

export default Section1983Tab;
