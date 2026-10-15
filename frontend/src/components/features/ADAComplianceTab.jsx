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

function ADAComplianceTab({ selectedCase }) {
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [federalLaw, setFederalLaw] = useState(null);
  const [caseLaw, setCaseLaw] = useState(null);
  const [stateInfo, setStateInfo] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [violations, setViolations] = useState(null);
  const [falseClaimsAct, setFalseClaimsAct] = useState(null);
  const [civilGuardian, setCivilGuardian] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [caseAnalysis, setCaseAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    if (activeSection === 'federal') loadFederalLaw();
    if (activeSection === 'caselaw') loadCaseLaw();
    if (activeSection === 'violations') loadViolations();
    if (activeSection === 'falseclaims') loadFalseClaimsAct();
    if (activeSection === 'guardian') loadCivilGuardian();
  }, [activeSection]);

  const loadFederalLaw = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/federal-law');
      setFederalLaw(data);
    } catch (error) {
      toast.error('Failed to load federal law');
    } finally {
      setLoading(false);
    }
  };

  const loadCaseLaw = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/case-law');
      setCaseLaw(data);
    } catch (error) {
      toast.error('Failed to load case law');
    } finally {
      setLoading(false);
    }
  };

  const loadStateInfo = async (state) => {
    setSelectedState(state);
    setLoading(true);
    try {
      const data = await api.get(`/api/ada/state/${state}`);
      setStateInfo(data);
    } catch (error) {
      toast.error('Failed to load state info');
    } finally {
      setLoading(false);
    }
  };

  const loadViolations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/violations');
      setViolations(data);
    } catch (error) {
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const loadFalseClaimsAct = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/false-claims-act');
      setFalseClaimsAct(data);
    } catch (error) {
      toast.error('Failed to load False Claims Act info');
    } finally {
      setLoading(false);
    }
  };

  const loadCivilGuardian = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ada/civil-guardian');
      setCivilGuardian(data);
    } catch (error) {
      toast.error('Failed to load guardian info');
    } finally {
      setLoading(false);
    }
  };

  const searchADA = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ query: searchQuery });
      if (selectedState) params.append('state', selectedState);
      const data = await api.get(`/api/ada/search?${params}`);
      setSearchResults(data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCase = async () => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }
    setAnalyzing(true);
    try {
      const data = await api.post(`/api/ada/analyze-case/${selectedCase.id}`);
      setCaseAnalysis(data);
      toast.success('ADA analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'federal', label: 'Federal ADA Law', icon: Scale },
    { id: 'caselaw', label: 'ADA Case Law', icon: Gavel },
    { id: 'states', label: 'State Laws', icon: MapPin },
    { id: 'violations', label: 'Common Violations', icon: AlertTriangle },
    { id: 'falseclaims', label: 'False Claims Act', icon: FileText },
    { id: 'guardian', label: 'Civil Guardian/GAL', icon: Users },
    { id: 'analyze', label: 'Analyze My Case', icon: Brain },
    { id: 'search', label: 'Search Resources', icon: Search },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="ada-compliance-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <Scale className="w-8 h-8 text-zinc-300" />
            ADA Compliance Center
          </h1>
          <p className="text-gray-400">Comprehensive ADA accommodations, regulations, case law & compliance analysis</p>
        </div>
        {selectedCase && (
          <button
            onClick={analyzeCase}
            disabled={analyzing}
            className="px-4 py-2 bg-zinc-300 text-black hover:bg-zinc-600 rounded-lg font-semibold flex items-center gap-2"
            data-testid="analyze-ada-btn"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            Analyze Case for ADA Violations
          </button>
        )}
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-xl">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              activeSection === section.id
                ? 'bg-zinc-300 text-black'
                : 'text-gray-400 hover:text-black hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && !loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-zinc-900 to-gray-900 border border-zinc-500 rounded-xl p-6">
            <Scale className="w-10 h-10 text-zinc-300 mb-4" />
            <h3 className="text-lg font-bold mb-2">ADA Title II</h3>
            <p className="text-gray-400 text-sm">Public entities including CPS agencies must provide equal access and reasonable accommodations.</p>
          </div>
          <div className="bg-gradient-to-br from-zinc-800 to-gray-900 border border-zinc-500 rounded-xl p-6">
            <Shield className="w-10 h-10 text-zinc-300 mb-4" />
            <h3 className="text-lg font-bold mb-2">Section 504</h3>
            <p className="text-gray-400 text-sm">All programs receiving federal funds (including CPS via Title IV-E) must not discriminate based on disability.</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/50 to-gray-900 border border-red-700/50 rounded-xl p-6">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">False Claims Act</h3>
            <p className="text-gray-400 text-sm">File qui tam lawsuits for fraud when agencies misuse federal funds or falsify ADA compliance.</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-gray-900 border border-green-700/50 rounded-xl p-6">
            <Gavel className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Key Case Law</h3>
            <p className="text-gray-400 text-sm">Tennessee v. Lane, Olmstead v. L.C., and circuit court cases establishing ADA applies to CPS.</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-gray-900 border border-yellow-700/50 rounded-xl p-6">
            <Users className="w-10 h-10 text-yellow-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">GAL Requirements</h3>
            <p className="text-gray-400 text-sm">Guardian ad Litems must consider ADA accommodations and cannot recommend TPR based on disability alone.</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/50 to-gray-900 border border-cyan-700/50 rounded-xl p-6">
            <Brain className="w-10 h-10 text-cyan-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-400 text-sm">Cross-reference your case files to identify ADA violations and generate compliance complaints.</p>
          </div>
        </div>
      )}

      {/* Federal Law Section */}
      {activeSection === 'federal' && federalLaw && !loading && (
        <div className="space-y-6">
          {Object.entries(federalLaw.federal_law || {}).map(([key, law]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-zinc-300 mb-2">{law.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{law.citation}</p>
              <p className="text-gray-300 mb-4">{law.description}</p>
              <h4 className="font-semibold mb-2">Key Provisions:</h4>
              <ul className="space-y-2">
                {law.key_provisions?.map((provision, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {provision}
                  </li>
                ))}
              </ul>
              {law.regulations && (
                <p className="mt-4 text-xs text-gray-500">Regulations: {law.regulations}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Case Law Section */}
      {activeSection === 'caselaw' && caseLaw && !loading && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-300 mb-4">Supreme Court Cases</h3>
            <div className="space-y-4">
              {caseLaw.supreme_court?.map((c, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-bold text-white">{c.case}</h4>
                  <p className="text-sm text-gray-500">{c.citation}</p>
                  <p className="text-gray-300 mt-2"><strong>Holding:</strong> {c.holding}</p>
                  <p className="text-zinc-300 mt-2 text-sm"><strong>Relevance:</strong> {c.relevance}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-4">Circuit Court Cases</h3>
            <div className="space-y-4">
              {caseLaw.circuit_courts?.map((c, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-bold text-white">{c.case}</h4>
                  <p className="text-sm text-gray-500">{c.circuit} - {c.citation}</p>
                  <p className="text-gray-300 mt-2"><strong>Holding:</strong> {c.holding}</p>
                  <p className="text-green-400 mt-2 text-sm"><strong>Relevance:</strong> {c.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State Laws Section */}
      {activeSection === 'states' && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {states.map(state => (
              <button
                key={state}
                onClick={() => loadStateInfo(state)}
                className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                  selectedState === state
                    ? 'bg-zinc-300 text-black'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
          
          {stateInfo && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-zinc-300 mb-4">{stateInfo.state} ADA + CPS Law</h3>
              
              {stateInfo.data ? (
                <>
                  <p className="text-gray-400 mb-4"><strong>Agency:</strong> {stateInfo.data.agency}</p>
                  
                  {stateInfo.data.specific_statutes && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">State Statutes:</h4>
                      <ul className="space-y-1">
                        {stateInfo.data.specific_statutes.map((s, i) => (
                          <li key={i} className="text-sm text-gray-400">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {stateInfo.data.case_law && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key State Case Law:</h4>
                      <ul className="space-y-1">
                        {stateInfo.data.case_law.map((c, i) => (
                          <li key={i} className="text-sm text-gray-400">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {stateInfo.data.false_claims && (
                    <p className="text-yellow-400 text-sm mt-4">
                      <strong>False Claims Act:</strong> {stateInfo.data.false_claims}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400">{stateInfo.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Violations Section */}
      {activeSection === 'violations' && violations && !loading && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-400">Common ADA Violations in CPS Cases</h3>
          {violations.violations?.map((v, i) => (
            <div key={i} className="bg-gray-800/50 border border-red-700/30 rounded-xl p-6">
              <h4 className="font-bold text-red-400 mb-2">{v.violation}</h4>
              <p className="text-gray-300 mb-2">{v.description}</p>
              <p className="text-sm text-gray-500"><strong>Legal Basis:</strong> {v.legal_basis}</p>
              <p className="text-sm text-green-400 mt-2"><strong>Remedy:</strong> {v.remedy}</p>
            </div>
          ))}
        </div>
      )}

      {/* False Claims Act Section */}
      {activeSection === 'falseclaims' && falseClaimsAct && !loading && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-yellow-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Federal False Claims Act</h3>
            <p className="text-gray-500 mb-4">{falseClaimsAct.federal?.statute}</p>
            <p className="text-red-400 mb-4"><strong>Damages:</strong> {falseClaimsAct.federal?.damages}</p>
            <p className="text-green-400 mb-4"><strong>Whistleblower:</strong> {falseClaimsAct.federal?.whistleblower_protections}</p>
            
            <h4 className="font-semibold mb-2">Relevance to CPS:</h4>
            <ul className="space-y-1">
              {falseClaimsAct.federal?.relevance_to_cps?.map((r, i) => (
                <li key={i} className="text-sm text-gray-400">• {r}</li>
              ))}
            </ul>
          </div>
          
          {falseClaimsAct.state_laws && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">State False Claims Acts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(falseClaimsAct.state_laws).map(([state, info]) => (
                  <div key={state} className={`p-4 rounded-lg ${info.has_fca ? 'bg-green-900/20 border border-green-700/30' : 'bg-gray-700/30'}`}>
                    <span className="font-bold">{state}</span>
                    {info.has_fca ? (
                      <>
                        <span className="text-green-400 text-xs ml-2">✓ Has FCA</span>
                        <p className="text-xs text-gray-500 mt-1">{info.citation}</p>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs ml-2">Use Federal FCA</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Civil Guardian Section */}
      {activeSection === 'guardian' && civilGuardian && !loading && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-zinc-300 mb-4">GAL ADA Requirements</h3>
            <ul className="space-y-2">
              {civilGuardian.gal_requirements?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-300 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Challenging a Biased GAL</h3>
            <ul className="space-y-2">
              {civilGuardian.challenging_gal?.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Analyze Case Section */}
      {activeSection === 'analyze' && (
        <div className="space-y-6">
          {!selectedCase ? (
            <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
              <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
              <p className="text-gray-400">Select a case from "My Cases" to analyze it for ADA compliance violations.</p>
            </div>
          ) : (
            <>
              <div className="bg-zinc-900/60 border border-zinc-500 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2">Analyzing: {selectedCase.title}</h3>
                <p className="text-gray-400">Click the button above to run AI-powered ADA compliance analysis on your case.</p>
              </div>
              
              {caseAnalysis && (
                <div className="space-y-6">
                  {/* Compliance Score */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">ADA Compliance Score</h3>
                    <div className="flex items-center gap-4">
                      <div className={`text-5xl font-bold ${
                        caseAnalysis.compliance_score >= 80 ? 'text-green-500' :
                        caseAnalysis.compliance_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {caseAnalysis.compliance_score}%
                      </div>
                      <div>
                        <p className="text-gray-400">Total Issues: {caseAnalysis.total_issues}</p>
                        <p className="text-red-400">Critical Issues: {caseAnalysis.critical_issues}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Disabilities Identified */}
                  {caseAnalysis.disabilities_identified?.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4">Disabilities Identified</h3>
                      <div className="flex flex-wrap gap-2">
                        {caseAnalysis.disabilities_identified.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-zinc-700/40 text-zinc-200 rounded-full text-sm">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* ADA Issues */}
                  {caseAnalysis.ada_issues?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-red-400">ADA Issues Identified</h3>
                      {caseAnalysis.ada_issues.map((issue, i) => (
                        <div key={i} className={`bg-gray-800/50 border rounded-xl p-6 ${
                          issue.severity === 'CRITICAL' ? 'border-red-600' :
                          issue.severity === 'HIGH' ? 'border-orange-600' : 'border-yellow-600'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              issue.severity === 'CRITICAL' ? 'bg-red-600' :
                              issue.severity === 'HIGH' ? 'bg-orange-600' : 'bg-yellow-600'
                            }`}>{issue.severity}</span>
                            <h4 className="font-bold">{issue.issue}</h4>
                          </div>
                          <p className="text-gray-300 mb-2">{issue.description}</p>
                          <p className="text-sm text-gray-500"><strong>Legal Basis:</strong> {issue.legal_basis}</p>
                          <p className="text-sm text-green-400 mt-2"><strong>Recommendation:</strong> {issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* AI Analysis */}
                  {caseAnalysis.ai_analysis && (
                    <div className="bg-gray-800/50 border border-zinc-500 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-zinc-300 mb-4">AI Legal Analysis</h3>
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-300">{caseAnalysis.ai_analysis}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Search Section */}
      {activeSection === 'search' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ADA resources (e.g., 'reasonable accommodation', 'mental health')"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && searchADA()}
            />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
            >
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={searchADA}
              className="px-6 py-3 bg-zinc-300 text-black hover:bg-zinc-600 rounded-lg font-semibold"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {searchResults && (
            <div className="space-y-6">
              <p className="text-gray-400">Found {searchResults.total_results} results for "{searchResults.query}"</p>
              
              {searchResults.results.case_law?.length > 0 && (
                <div>
                  <h4 className="font-bold text-zinc-300 mb-2">Case Law</h4>
                  {searchResults.results.case_law.map((c, i) => (
                    <div key={i} className="bg-gray-800/50 p-4 rounded-lg mb-2">
                      <p className="font-semibold">{c.case?.case || c.case}</p>
                      <p className="text-sm text-gray-500">{c.type}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.results.violations?.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-400 mb-2">Related Violations</h4>
                  {searchResults.results.violations.map((v, i) => (
                    <div key={i} className="bg-gray-800/50 p-4 rounded-lg mb-2">
                      <p className="font-semibold">{v.violation}</p>
                      <p className="text-sm text-gray-400">{v.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Help Bot Component - Floating assistant that helps users navigate the app

export default ADAComplianceTab;
