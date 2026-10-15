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

function AdminBoardTab() {
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [passcodes, setPasscodes] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSection === 'dashboard') {
        const data = await api.get('/api/admin/stats');
        setStats(data);
      } else if (activeSection === 'users') {
        const data = await api.get('/api/admin/users');
        setUsers(data.users || []);
      } else if (activeSection === 'advocates') {
        const data = await api.get('/api/admin/advocates');
        setAdvocates(data.advocates || []);
      } else if (activeSection === 'passcodes') {
        const data = await api.get('/api/admin/passcodes');
        setPasscodes(data.passcodes || []);
      } else if (activeSection === 'redemptions') {
        const data = await api.get('/api/admin/redemptions');
        setRedemptions(data.redemptions || []);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const togglePasscode = async (code, active) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/passcodes/toggle', { passcode: code, active });
      toast.success(`Passcode ${active ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update passcode');
    } finally {
      setActionLoading(false);
    }
  };

  const updateUserTier = async (userId, tier) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/users/update-tier', { user_id: userId, tier });
      toast.success('User tier updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update user tier');
    } finally {
      setActionLoading(false);
    }
  };

  const updateAdvocateStatus = async (advocateId, status) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/advocates/update-status', { advocate_id: advocateId, status });
      toast.success(`Advocate ${status}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update advocate status');
    } finally {
      setActionLoading(false);
    }
  };

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'advocates', label: 'Advocates', icon: Users },
    { id: 'passcodes', label: 'Passcodes', icon: Key },
    { id: 'redemptions', label: 'Redemptions', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="admin-board-tab">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-500" style={{ fontFamily: 'Oswald, sans-serif' }}>Admin Board</h1>
          <p className="text-gray-400">Manage users, advocates, and passcodes</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <>
          {/* Dashboard */}
          {activeSection === 'dashboard' && stats && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-white">{stats.total_users}</p>
                <p className="text-gray-400">Total Users</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-zinc-300">{stats.total_cases}</p>
                <p className="text-gray-400">Total Cases</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-zinc-300">{stats.total_documents}</p>
                <p className="text-gray-400">Documents</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-amber-400">{stats.total_redemptions}</p>
                <p className="text-gray-400">Passcode Redemptions</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-green-400">{stats.approved_advocates}</p>
                <p className="text-gray-400">Approved Advocates</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-yellow-400">{stats.pending_advocates}</p>
                <p className="text-gray-400">Pending Advocates</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 col-span-2">
                <p className="text-lg font-semibold mb-3">Tier Breakdown</p>
                <div className="grid grid-cols-5 gap-2">
                  {['free', 'essential', 'professional', 'attorney', 'enterprise'].map(tier => (
                    <div key={tier} className="text-center">
                      <p className="text-2xl font-bold">{stats.tier_breakdown[tier] || 0}</p>
                      <p className="text-xs text-gray-400 capitalize">{tier}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeSection === 'users' && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={user.tier}
                          onChange={(e) => updateUserTier(user.id, e.target.value)}
                          disabled={actionLoading}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="free">Free</option>
                          <option value="essential">Essential</option>
                          <option value="professional">Professional</option>
                          <option value="attorney">Attorney</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.is_admin && <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded text-xs">Admin</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Advocates */}
          {activeSection === 'advocates' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => loadData()} className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600">All</button>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">State</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Experience</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {advocates.map(adv => (
                      <tr key={adv.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">{adv.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{adv.email}</td>
                        <td className="px-4 py-3 text-sm">{adv.state}</td>
                        <td className="px-4 py-3 text-sm">{adv.experience_years} yrs</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            adv.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                            adv.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {adv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          {adv.status !== 'approved' && (
                            <button
                              onClick={() => updateAdvocateStatus(adv.id, 'approved')}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {adv.status !== 'rejected' && (
                            <button
                              onClick={() => updateAdvocateStatus(adv.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {advocates.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No advocate applications yet</div>
                )}
              </div>
            </div>
          )}

          {/* Passcodes */}
          {activeSection === 'passcodes' && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Passcode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Redemptions</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {passcodes.map(pc => (
                    <tr key={pc.code} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-mono">{pc.code}</td>
                      <td className="px-4 py-3 text-sm">{pc.redemptions}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${pc.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {pc.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => togglePasscode(pc.code, !pc.active)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded text-xs disabled:opacity-50 ${
                            pc.active 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {pc.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Redemptions */}
          {activeSection === 'redemptions' && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Passcode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier Granted</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {redemptions.map(r => (
                    <tr key={r.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm">{r.email}</td>
                      <td className="px-4 py-3 text-sm font-mono">{r.passcode}</td>
                      <td className="px-4 py-3 text-sm capitalize">{r.tier_granted}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {r.redeemed_at ? new Date(r.redeemed_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {redemptions.length === 0 && (
                <div className="text-center py-8 text-gray-400">No redemptions yet</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}


// AI Case Notes Tab - View all AI-generated content for a case

export default AdminBoardTab;
