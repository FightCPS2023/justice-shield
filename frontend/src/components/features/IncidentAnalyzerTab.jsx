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

function IncidentAnalyzerTab({ selectedCase }) {
  const { api } = useAuth();
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [facts, setFacts] = useState({});

  useEffect(() => {
    loadIncidentTypes();
  }, []);

  const loadIncidentTypes = async () => {
    try {
      const data = await api.get('/api/legal/incident-types');
      setIncidentTypes(data.incident_types || []);
    } catch (error) {
      console.error('Failed to load incident types');
    } finally {
      setLoading(false);
    }
  };

  const analyzeViolation = async () => {
    if (!selectedIncident) return;
    setAnalyzing(true);
    try {
      const data = await api.post('/api/legal/analyze-violation', {
        violation_type: selectedIncident.id,
        facts: facts,
        state: selectedCase?.state || 'TX'
      });
      setAnalysis(data);
    } catch (error) {
      toast.error('Failed to analyze violation');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="incidents-tab">
      <div className="bg-gradient-to-r from-orange-900/50 to-gray-900 border border-orange-800/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          Incident Analyzer
        </h1>
        <p className="text-gray-300 mt-2">
          Analyze CPS incidents for constitutional violations. Get case law citations, qualified immunity analysis, and Section 1983 viability assessment.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Incident Types */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Incident Type</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {incidentTypes.map(incident => (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    selectedIncident?.id === incident.id
                      ? 'bg-orange-600/20 border-orange-500'
                      : 'bg-gray-800/50 border-gray-700 hover:border-orange-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{incident.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{incident.description}</p>
                      <p className="text-xs text-orange-400 mt-2">{incident.constitutional_basis}</p>
                    </div>
                    {incident.section_1983_viable && (
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">§1983</span>
                    )}
                  </div>
                  {incident.key_case && (
                    <p className="text-xs text-gray-500 mt-2">Key Case: {incident.key_case}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            {selectedIncident ? (
              <>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">{selectedIncident.name}</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Constitutional Basis:</span>
                      <p className="text-orange-400">{selectedIncident.constitutional_basis}</p>
                    </div>
                    {selectedIncident.key_case && (
                      <div>
                        <span className="text-gray-400">Key Precedent:</span>
                        <p className="text-blue-400">{selectedIncident.key_case}</p>
                      </div>
                    )}
                    <div className="flex gap-4 pt-2">
                      {selectedIncident.section_1983_viable && (
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Section 1983 Viable</span>
                      )}
                      {selectedIncident.qualified_immunity_likely_defeated && (
                        <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs">QI Likely Defeated</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={analyzeViolation}
                  disabled={analyzing}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
                  ) : (
                    <><Brain className="w-5 h-5" /> Get Deep Legal Analysis</>
                  )}
                </button>

                {analysis && (
                  <div className="bg-gradient-to-r from-orange-900/30 to-gray-900 border border-orange-800/50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Legal Analysis</h3>
                    <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/50 p-4 rounded-lg overflow-auto max-h-[400px]">
                      {analysis.analysis}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Select an incident type to analyze</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Legal Knowledge Base Tab

export default IncidentAnalyzerTab;
