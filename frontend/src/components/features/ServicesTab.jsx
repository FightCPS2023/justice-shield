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

function ServicesTab({ selectedCase }) {
  const { api } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    provider: '',
    start_date: '',
    end_date: '',
    status: 'in_progress',
    notes: ''
  });

  const serviceTypes = [
    'Parenting Classes', 'Drug Testing', 'Counseling', 'Therapy', 'Anger Management',
    'Domestic Violence Classes', 'Substance Abuse Treatment', 'Mental Health Evaluation',
    'Home Study', 'Supervised Visitation', 'Family Therapy', 'Other'
  ];

  const statusTypes = [
    { id: 'not_started', label: 'Not Started', color: 'bg-gray-600/20 text-gray-400' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-600/20 text-blue-400' },
    { id: 'completed', label: 'Completed', color: 'bg-green-600/20 text-green-400' },
    { id: 'failed', label: 'Failed/Non-Compliant', color: 'bg-red-600/20 text-red-400' }
  ];

  useEffect(() => {
    if (selectedCase) loadServices();
  }, [selectedCase]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/services/${selectedCase.id}`);
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newService = await api.post('/api/services', {
        ...formData,
        case_id: selectedCase.id
      });
      setServices([newService, ...services]);
      setShowAdd(false);
      setFormData({ service_type: '', provider: '', start_date: '', end_date: '', status: 'in_progress', notes: '' });
      toast.success('Service added!');
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="services-tab">
        <Users className="w-12 h-12 mx-auto text-teal-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to track services</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="services-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Case Plan Services</h1>
          <p className="text-gray-400">Track required services for {selectedCase.title}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-punisher">
          <Plus className="w-5 h-5 inline mr-2" /> Add Service
        </button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Service Type</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                >
                  <option value="">Select service...</option>
                  {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Provider name/agency"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {statusTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-20"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-punisher">Add Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No services tracked yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map(service => {
            const statusInfo = statusTypes.find(s => s.id === service.status) || statusTypes[1];
            return (
              <div key={service.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
                <h3 className="font-semibold text-lg">{service.service_type}</h3>
                {service.provider && <p className="text-gray-400 text-sm">Provider: {service.provider}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {service.start_date && <span>Start: {service.start_date}</span>}
                  {service.end_date && <span>End: {service.end_date}</span>}
                </div>
                {service.notes && <p className="text-sm text-gray-400 mt-2">{service.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Forum Tab

export default ServicesTab;
