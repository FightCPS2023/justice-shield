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

function AdvocatesTab() {
  const { api } = useAuth();
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    website: '',
    photo_url: '',
    bio: '',
    experience_years: '',
    specialties: [],
    state: '',
    city: '',
    organization: '',
    certifications: '',
    languages: 'English'
  };
  const [formData, setFormData] = useState(initialFormState);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const specialtyOptions = [
    'CPS Defense', 'Family Law', 'Parental Rights', 'Child Welfare',
    'Dependency Cases', 'Termination of Parental Rights', 'Foster Care',
    'ADA Accommodations', 'Civil Rights', 'Appeals', 'Mediation'
  ];

  useEffect(() => {
    loadAdvocates();
  }, [stateFilter]);

  const loadAdvocates = async () => {
    setLoading(true);
    try {
      const url = stateFilter ? `/api/advocates?state=${stateFilter}` : '/api/advocates';
      const data = await api.get(url);
      setAdvocates(data.advocates || []);
    } catch (error) {
      console.error('Failed to load advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const applicationData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l)
      };
      await api.post('/api/advocates/apply', applicationData);
      toast.success('Application submitted! We will review it and get back to you soon.');
      setShowApplyForm(false);
      setFormData(initialFormState);
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowApplyForm(false);
  };

  const handleBack = () => {
    setShowApplyForm(false);
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="advocates-tab">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Find Advocates</h1>
          <p className="text-gray-400">Connect with family advocates and attorneys in your state</p>
        </div>
        <div className="flex gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setShowApplyForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="become-advocate-btn"
          >
            Become an Advocate
          </button>
        </div>
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900">
              <h2 className="text-xl font-bold">Become an Advocate</h2>
              <button onClick={() => setShowApplyForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitApplication} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="advocate@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Los Angeles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Law Firm or Organization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Specialties *</label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.specialties.includes(specialty)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio / Background *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Tell us about your background, experience, and how you help families..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Bar License, Mediation Cert"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="English, Spanish"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  data-testid="advocate-back-btn"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  data-testid="advocate-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.specialties.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  data-testid="advocate-submit-btn"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advocate Detail Modal */}
      {selectedAdvocate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  {selectedAdvocate.photo_url ? (
                    <img src={selectedAdvocate.photo_url} alt={selectedAdvocate.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedAdvocate.name}</h2>
                    <p className="text-gray-400">{selectedAdvocate.organization}</p>
                    <p className="text-sm text-gray-500">{selectedAdvocate.city}, {selectedAdvocate.state}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAdvocate(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience</p>
                  <p>{selectedAdvocate.experience_years} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAdvocate.specialties?.map(s => (
                      <span key={s} className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">About</p>
                  <p className="text-gray-300">{selectedAdvocate.bio}</p>
                </div>
                {selectedAdvocate.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <p className="text-blue-400">{selectedAdvocate.phone}</p>
                  </div>
                )}
                {selectedAdvocate.website && (
                  <a href={selectedAdvocate.website} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-400 hover:underline">
                    Visit Website →
                  </a>
                )}
                {selectedAdvocate.languages?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Languages</p>
                    <p>{selectedAdvocate.languages.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : advocates.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No advocates listed yet for {stateFilter || 'any state'}</p>
          <p className="text-sm text-gray-500 mb-4">Check back soon as we grow our directory</p>
          <button
            onClick={() => setShowApplyForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-medium hover:opacity-90"
          >
            Be the First - Apply Now
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advocates.map(advocate => (
            <div 
              key={advocate.id} 
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-red-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedAdvocate(advocate)}
            >
              <div className="flex items-start gap-3">
                {advocate.photo_url ? (
                  <img src={advocate.photo_url} alt={advocate.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{advocate.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{advocate.organization || advocate.city}</p>
                  <p className="text-xs text-gray-500">{advocate.state} • {advocate.experience_years} yrs exp</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {advocate.specialties?.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{s}</span>
                ))}
                {advocate.specialties?.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">+{advocate.specialties.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Expert Legal AI Tab - SMARTER THAN ANY OTHER LEGAL AI

export default AdvocatesTab;
