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

function CriminalCaseTab({ selectedCase }) {
  const { api } = useAuth();
  const [criminalCase, setCriminalCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    criminal_case_number: '',
    court: '',
    prosecutor: '',
    defense_attorney: '',
    bond_status: '',
    next_court_date: '',
    relation_to_cps: '',
    charges: []
  };
  const [formData, setFormData] = useState(initialFormState);
  const [chargeInput, setChargeInput] = useState({ charge: '', statute: '', severity: 'misdemeanor' });

  useEffect(() => {
    if (selectedCase) loadCriminalCase();
  }, [selectedCase]);

  const loadCriminalCase = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/criminal-case/${selectedCase.id}`);
      setCriminalCase(data.criminal_case);
    } catch (error) {
      console.error('Failed to load criminal case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post('/api/criminal-case', {
        ...formData,
        case_id: selectedCase.id
      });
      setCriminalCase(data);
      setShowAdd(false);
      setFormData(initialFormState);
      toast.success('Criminal case info saved!');
    } catch (error) {
      toast.error('Failed to save criminal case');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowAdd(false);
  };

  const handleBack = () => {
    setShowAdd(false);
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const addCharge = () => {
    if (chargeInput.charge.trim()) {
      setFormData({...formData, charges: [...formData.charges, {...chargeInput}]});
      setChargeInput({ charge: '', statute: '', severity: 'misdemeanor' });
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="criminal-tab">
        <AlertTriangle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to link criminal charges</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="criminal-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Criminal Case Link</h1>
          <p className="text-gray-400">Track related criminal charges for {selectedCase.title}</p>
        </div>
        {!criminalCase && (
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Link Criminal Case
          </button>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Link Criminal Case</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={formData.criminal_case_number}
                    onChange={(e) => setFormData({...formData, criminal_case_number: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Court</label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => setFormData({...formData, court: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prosecutor</label>
                  <input
                    type="text"
                    value={formData.prosecutor}
                    onChange={(e) => setFormData({...formData, prosecutor: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Defense Attorney</label>
                  <input
                    type="text"
                    value={formData.defense_attorney}
                    onChange={(e) => setFormData({...formData, defense_attorney: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bond Status</label>
                  <input
                    type="text"
                    value={formData.bond_status}
                    onChange={(e) => setFormData({...formData, bond_status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="e.g., $10,000 bond posted"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Next Court Date</label>
                  <input
                    type="date"
                    value={formData.next_court_date}
                    onChange={(e) => setFormData({...formData, next_court_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Relation to CPS Case</label>
                <textarea
                  value={formData.relation_to_cps}
                  onChange={(e) => setFormData({...formData, relation_to_cps: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20"
                  placeholder="How does this criminal case relate to the CPS case?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Charges</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={chargeInput.charge}
                    onChange={(e) => setChargeInput({...chargeInput, charge: e.target.value})}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Charge description"
                  />
                  <select
                    value={chargeInput.severity}
                    onChange={(e) => setChargeInput({...chargeInput, severity: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="infraction">Infraction</option>
                    <option value="misdemeanor">Misdemeanor</option>
                    <option value="felony">Felony</option>
                  </select>
                  <button type="button" onClick={addCharge} className="px-4 py-2 bg-gray-600 rounded-lg">Add</button>
                </div>
                {formData.charges.length > 0 && (
                  <div className="space-y-2">
                    {formData.charges.map((charge, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                        <span>{charge.charge}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            charge.severity === 'felony' ? 'bg-red-600' : 
                            charge.severity === 'misdemeanor' ? 'bg-yellow-600' : 'bg-gray-600'
                          }`}>{charge.severity}</span>
                          <button type="button" onClick={() => setFormData({...formData, charges: formData.charges.filter((_, j) => j !== i)})}
                            className="text-red-400">&times;</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="criminal-back-btn">Back</button>
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg" data-testid="criminal-cancel-btn">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher" data-testid="criminal-submit-btn">Save Criminal Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Criminal Case Display */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : criminalCase ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-900/30 to-gray-900 border border-orange-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  Criminal Case #{criminalCase.criminal_case_number || 'N/A'}
                </h2>
                {criminalCase.court && <p className="text-gray-400">{criminalCase.court}</p>}
              </div>
              <button onClick={() => { setFormData(criminalCase); setShowAdd(true); }} className="px-3 py-1 bg-gray-700 rounded text-sm">
                <Edit2 className="w-4 h-4 inline mr-1" /> Edit
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {criminalCase.prosecutor && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Prosecutor</p>
                  <p className="font-medium">{criminalCase.prosecutor}</p>
                </div>
              )}
              {criminalCase.defense_attorney && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Defense Attorney</p>
                  <p className="font-medium">{criminalCase.defense_attorney}</p>
                </div>
              )}
              {criminalCase.bond_status && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Bond Status</p>
                  <p className="font-medium">{criminalCase.bond_status}</p>
                </div>
              )}
              {criminalCase.next_court_date && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Next Court Date</p>
                  <p className="font-medium text-red-400">{criminalCase.next_court_date}</p>
                </div>
              )}
            </div>
          </div>

          {criminalCase.charges && criminalCase.charges.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Charges ({criminalCase.charges.length})</h3>
              <div className="space-y-2">
                {criminalCase.charges.map((charge, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3">
                    <span>{charge.charge}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      charge.severity === 'felony' ? 'bg-red-600' : 
                      charge.severity === 'misdemeanor' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>{charge.severity?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {criminalCase.relation_to_cps && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Relation to CPS Case</h3>
              <p className="text-gray-300">{criminalCase.relation_to_cps}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No linked criminal case</p>
          <button onClick={() => setShowAdd(true)} className="btn-punisher">
            <Plus className="w-5 h-5 inline mr-2" /> Link Criminal Case
          </button>
        </div>
      )}
    </div>
  );
}

// Services Tab

export default CriminalCaseTab;
