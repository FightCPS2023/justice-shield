import React, { useEffect, useMemo, useState } from 'react';
import { Shield, AlertTriangle, Search, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const violationTypes = [
  'Unlawful Home Entry (4th)',
  'Warrantless Child Removal (4th/14th)',
  'Coerced Consent',
  'Denial of Counsel (6th)',
  'False Report',
  'Failure to Identify',
  'Retaliation (1st)',
  'Due Process Violation (14th)',
  'Equal Protection (14th)',
  'Perjury',
  'Evidence Tampering',
  'Privacy Violation (4th)',
  'Bond Default',
  '§1983 Notice Ignored',
  'Other'
];

function IntegrityDatabaseTab() {
  const { api } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({ name: '', badge_number: '', agency: '', region: '', supervisor: '', phone: '', email: '', notes: '' });
  const [violationForm, setViolationForm] = useState({ violation_type: violationTypes[0], incident_date: '', description: '', section_1983_link: '', evidence_hash: '' });
  const [metrics, setMetrics] = useState(null);

  const loadProfiles = async () => {
    try {
      const data = query
        ? await api.get(`/api/integrity-db/search?q=${encodeURIComponent(query)}`)
        : await api.get('/api/integrity-db/profiles');
      setProfiles(data.profiles || []);
    } catch (err) {
      toast.error('Failed to load profiles');
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [query]);

  const handleCreate = async () => {
    if (!newProfile.name) {
      toast.error('Name is required');
      return;
    }
    try {
      const data = await api.post('/api/integrity-db/profiles', newProfile);
      toast.success('Profile created');
      setProfiles((prev) => [data.profile, ...prev]);
      setNewProfile({ name: '', badge_number: '', agency: '', region: '', supervisor: '', phone: '', email: '', notes: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to create profile');
    }
  };

  const handleSelect = async (profile) => {
    setSelectedProfile(profile);
    try {
      const data = await api.get(`/api/integrity-db/profiles/${profile.profile_id}/risk-metrics`);
      setMetrics(data);
    } catch (err) {
      setMetrics(null);
    }
  };

  const handleLogViolation = async () => {
    if (!selectedProfile) return;
    if (!violationForm.description || !violationForm.incident_date) {
      toast.error('Incident date and description required');
      return;
    }
    try {
      const data = await api.post(`/api/integrity-db/profiles/${selectedProfile.profile_id}/violations`, violationForm);
      toast.success('Violation logged');
      setSelectedProfile((prev) => ({ ...prev, violations: [...(prev.violations || []), data.violation] }));
      setViolationForm({ violation_type: violationTypes[0], incident_date: '', description: '', section_1983_link: '', evidence_hash: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to log violation');
    }
  };

  const riskBadge = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600/60 text-red-100';
      case 'HIGH': return 'bg-orange-600/60 text-orange-100';
      case 'MODERATE': return 'bg-yellow-500/60 text-yellow-100';
      default: return 'bg-emerald-600/60 text-emerald-100';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="integrity-db-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Shield className="w-8 h-8 text-red-500" /> The Blacklist — Integrity Database
        </h1>
        <p className="text-gray-400">Track caseworker misconduct, log violations, and compute risk scores.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4" data-testid="integrity-db-metrics">
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400">Profiles</p>
          <p className="text-2xl font-semibold">{profiles.length}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400">High Risk</p>
          <p className="text-2xl font-semibold">{profiles.filter((p) => (p.violations || []).length >= 4).length}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400">Recent Violations</p>
          <p className="text-2xl font-semibold">{profiles.reduce((acc, p) => acc + (p.violations || []).length, 0)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2" data-testid="integrity-db-search">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-black/40 border border-gray-700 rounded-lg p-2 w-full"
          placeholder="Search by name, badge, agency"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="integrity-db-create">
          <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Profile</h3>
          <div className="grid gap-2 mt-3">
            {Object.keys(newProfile).map((field) => (
              <input
                key={field}
                value={newProfile[field]}
                onChange={(e) => setNewProfile({ ...newProfile, [field]: e.target.value })}
                className="bg-black/40 border border-gray-700 rounded-lg p-2 text-sm"
                placeholder={field.replace('_', ' ')}
                data-testid={`integrity-profile-${field}`}
              />
            ))}
          </div>
          <button onClick={handleCreate} className="mt-3 px-3 py-2 bg-red-600/40 rounded" data-testid="integrity-create-btn">Create Profile</button>
        </div>

        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="integrity-db-list">
          <h3 className="font-semibold">Profiles</h3>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {profiles.map((p) => (
              <button key={p.profile_id} onClick={() => handleSelect(p)} className="w-full text-left bg-black/40 border border-gray-700 rounded-lg p-3" data-testid={`integrity-profile-${p.profile_id}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${riskBadge(metrics?.risk_level || 'LOW')}`}>
                    {metrics?.risk_level || 'LOW'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{p.agency || 'Agency'} • {p.badge_number || 'No badge'}</p>
              </button>
            ))}
            {!profiles.length && <p className="text-sm text-gray-400">No profiles yet.</p>}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 space-y-4" data-testid="integrity-db-detail">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{selectedProfile.name}</h3>
              <p className="text-xs text-gray-400">{selectedProfile.agency || 'Agency'} • {selectedProfile.region || 'Region'}</p>
            </div>
            {metrics && (
              <div className={`px-3 py-1 rounded ${riskBadge(metrics.risk_level)}`} data-testid="integrity-risk-level">{metrics.risk_level}</div>
            )}
          </div>

          {metrics && (
            <div className="grid md:grid-cols-4 gap-3 text-xs" data-testid="integrity-risk-metrics">
              <div className="bg-black/40 border border-gray-700 rounded-lg p-3">Total: {metrics.total_violations}</div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-3">Verified: {metrics.verified_violations}</div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-3">Strike Rate: {metrics.constitutional_strike_rate}%</div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-3">Recency: {metrics.recency_score}</div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Violations</h4>
              <div className="mt-2 space-y-2">
                {(selectedProfile.violations || []).map((v, idx) => (
                  <div key={idx} className="bg-black/40 border border-red-700/50 rounded-lg p-3" data-testid={`integrity-violation-${idx}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{v.violation_type}</p>
                      {v.verified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-gray-400">{v.incident_date}</p>
                    <p className="text-sm text-gray-200 mt-2">{v.description}</p>
                  </div>
                ))}
                {!(selectedProfile.violations || []).length && <p className="text-sm text-gray-400">No violations logged.</p>}
              </div>
            </div>
            <div className="bg-black/40 border border-gray-700 rounded-lg p-3" data-testid="integrity-log-violation">
              <h4 className="font-semibold">Log Violation</h4>
              <select className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2" value={violationForm.violation_type} onChange={(e) => setViolationForm({ ...violationForm, violation_type: e.target.value })} data-testid="integrity-violation-type">
                {violationTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Incident Date (YYYY-MM-DD)" value={violationForm.incident_date} onChange={(e) => setViolationForm({ ...violationForm, incident_date: e.target.value })} data-testid="integrity-incident-date" />
              <textarea className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 h-24" placeholder="Description" value={violationForm.description} onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })} data-testid="integrity-violation-description" />
              <input className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="§1983 link (optional)" value={violationForm.section_1983_link} onChange={(e) => setViolationForm({ ...violationForm, section_1983_link: e.target.value })} data-testid="integrity-1983-link" />
              <input className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Evidence hash (optional)" value={violationForm.evidence_hash} onChange={(e) => setViolationForm({ ...violationForm, evidence_hash: e.target.value })} data-testid="integrity-evidence-hash" />
              <button onClick={handleLogViolation} className="mt-3 px-3 py-2 bg-red-600/40 rounded" data-testid="integrity-log-btn">Log Violation</button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400" data-testid="integrity-disclaimer">
        Disclaimer: The Integrity Database is for documentation and advocacy. Verification does not constitute legal adjudication.
      </div>
    </div>
  );
}

export default IntegrityDatabaseTab;
