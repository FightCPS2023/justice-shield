import React, { useState } from 'react';
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

function RealEstateCounselTab({ selectedCase }) {
  const { api } = useAuth();
  const [question, setQuestion] = useState('');
  const [focusArea, setFocusArea] = useState('tort_claims');
  const [propertyDetails, setPropertyDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const focusAreas = [
    { id: 'tort_claims', label: 'Tort Claims (Property Damage / Negligence)', desc: 'Injury, damage, nuisance, trespass, wrongful acts' },
    { id: 'deeds_titles', label: 'Deeds, Titles, Liens', desc: 'Chain of title, liens, quiet title' },
    { id: 'wills_probate', label: 'Wills, Probate, Property Transfers', desc: 'Inheritance, probate, transfers' },
    { id: 'foreclosure', label: 'Foreclosure Defense / Redemption', desc: 'Wrongful foreclosure, reinstatement' },
    { id: 'homestead', label: 'Homestead Exemptions', desc: 'State protections from forced sale' },
    { id: 'landlord_tenant', label: 'Landlord-Tenant / Eviction', desc: 'Habitability, unlawful eviction' },
    { id: 'partition', label: 'Partition / Co-Ownership', desc: 'Forced sale, co-owner disputes' },
    { id: 'eminent_domain', label: 'Eminent Domain / Takings', desc: 'Compensation challenges' },
    { id: 'zoning', label: 'Zoning / Code Enforcement', desc: 'Regulatory overreach defenses' },
    { id: 'mortgage', label: 'Mortgage Disputes (TILA/RESPA)', desc: 'Servicing errors, predatory lending' },
    { id: 'adverse_possession', label: 'Adverse Possession / Quiet Title', desc: 'Possessory rights claims' },
    { id: 'transactions_fraud', label: 'Transactions, Contracts, Fraud', desc: 'Misrepresentation, rescission' },
    { id: 'bankruptcy', label: 'Bankruptcy + Real Property', desc: 'Automatic stay, exemptions' },
    { id: 'cps_housing', label: 'CPS + Housing Stability', desc: 'Prevent housing instability claims' }
  ];

  const sampleQuestions = [
    'CPS is using “housing instability” to justify removal. How do I challenge that legally?',
    'The lender started foreclosure without proper notice. What real estate defenses apply in my state?',
    'A co-owner is trying to force a sale of the family home. What are my strongest options?',
    'The county is threatening code enforcement fines to pressure us out. How do I fight back?' 
  ];

  const handleCancel = () => {
    setQuestion('');
    setPropertyDetails('');
    setResponse(null);
  };

  const handleBack = () => {
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase || !question.trim()) return;

    setLoading(true);
    try {
      const selected = focusAreas.find((item) => item.id === focusArea);
      const focusLabel = selected ? `${selected.label} — ${selected.desc}` : focusArea;
      const data = await api.post('/api/ai/real-estate-counsel', {
        case_id: selectedCase.id,
        question: question.trim(),
        focus_area: focusLabel,
        property_details: propertyDetails.trim(),
        state: selectedCase?.state || ''
      });
      setResponse(data);
      setHistory([{ question, response: data, timestamp: new Date() }, ...history]);
    } catch (error) {
      toast.error(error.message || 'Real estate analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="real-estate-tab">
        <img src="/images/chrome-logo.jpg" alt="CPS Punisher" className="w-48 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Revenant Realty Counsel</h3>
        <p className="text-gray-400">Select a case to launch the Real Estate Law Attorney Agent</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="real-estate-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Building2 className="w-8 h-8 text-red-500" />
          Revenant Realty Counsel (RRC)
        </h1>
        <p className="text-gray-400">Aggressive real estate defense for CPS-related property battles — {selectedCase.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="real-estate-form">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2" data-testid="real-estate-focus-label">Focus Area</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3"
              data-testid="real-estate-focus-select"
            >
              {focusAreas.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2" data-testid="real-estate-property-label">Property Details</label>
            <textarea
              value={propertyDetails}
              onChange={(e) => setPropertyDetails(e.target.value)}
              placeholder="Address, ownership, deed status, lien info, foreclosure notices, landlord-tenant facts, etc."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 h-28"
              data-testid="real-estate-property-textarea"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2" data-testid="real-estate-question-label">Your Real Estate Legal Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your real estate + CPS question. Include deadlines, agency actions, or threats."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 h-32"
            required
            data-testid="real-estate-question-textarea"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuestion(q)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs hover:border-red-500 transition-colors"
              data-testid={`real-estate-sample-question-${i}`}
            >
              {q.substring(0, 48)}...
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="real-estate-back-btn"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="real-estate-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex-1 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            data-testid="real-estate-submit-btn"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Building Strategy...</>
            ) : (
              <><Building2 className="w-6 h-6" /> Get Real Estate Strategy</>
            )}
          </button>
        </div>
      </form>

      {response && (
        <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6" data-testid="real-estate-response">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-500" /> RRC Analysis
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(response.analysis)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
              data-testid="real-estate-copy-btn"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg overflow-auto max-h-[700px]" data-testid="real-estate-response-text">
            {response.analysis}
          </pre>
        </div>
      )}
    </div>
  );
}

export default RealEstateCounselTab;
