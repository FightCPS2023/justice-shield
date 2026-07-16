import React, { useEffect, useState } from 'react';
import { Megaphone, Shield, FileText, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

function PoliticalStrikeTab() {
  const { api } = useAuth();
  const [state, setState] = useState('TX');
  const [role, setRole] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [currentDossier, setCurrentDossier] = useState(null);
  const [dispatchReport, setDispatchReport] = useState(null);
  const [form, setForm] = useState({
    case_title: '',
    caseworker_name: '',
    agency: '',
    violations: '',
    vault_refs: '',
    foia_status: '',
    section_1983_status: '',
    narrative: ''
  });

  const loadContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (role) params.append('role', role);
      const data = await api.get(`/api/political-strike/contacts?${params.toString()}`);
      setContacts(data.contacts || []);
    } catch (err) {
      toast.error('Failed to load contacts');
    }
  };

  const loadDossiers = async () => {
    try {
      const data = await api.get('/api/political-strike/dossiers');
      setDossiers(data.dossiers || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadContacts();
  }, [state, role]);

  useEffect(() => {
    loadDossiers();
  }, []);

  const toggleTarget = (contactId) => {
    setSelectedTargets((prev) => prev.includes(contactId) ? prev.filter((c) => c !== contactId) : [...prev, contactId]);
  };

  const handleGenerate = async () => {
    if (!form.case_title || !form.caseworker_name) {
      toast.error('Case title and caseworker name required');
      return;
    }
    try {
      const payload = {
        ...form,
        violations: form.violations ? form.violations.split('\n').filter(Boolean) : [],
        vault_refs: form.vault_refs ? form.vault_refs.split('\n').filter(Boolean) : []
      };
      const data = await api.post('/api/political-strike/generate-dossier', payload);
      setCurrentDossier(data);
      toast.success('Dossier generated');
      loadDossiers();
    } catch (err) {
      toast.error(err.message || 'Failed to generate dossier');
    }
  };

  const handleDispatch = async () => {
    if (!currentDossier?.dossier_id || selectedTargets.length === 0) {
      toast.error('Select targets first');
      return;
    }
    try {
      const data = await api.post('/api/political-strike/dispatch', {
        dossier_id: currentDossier.dossier_id,
        target_ids: selectedTargets
      });
      setDispatchReport(data);
      toast.success('Dispatch simulated');
    } catch (err) {
      toast.error(err.message || 'Dispatch failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="political-strike-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Megaphone className="w-8 h-8 text-red-500" /> Mass Escalation — Political Strike
        </h1>
        <p className="text-gray-400">Generate systemic corruption dossiers and simulate dispatch to public officials.</p>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="political-dossier-form">
        <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Generate Dossier</h3>
        <div className="grid md:grid-cols-2 gap-2 mt-3">
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Case title" value={form.case_title} onChange={(e) => setForm({ ...form, case_title: e.target.value })} data-testid="political-case-title" />
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Caseworker name" value={form.caseworker_name} onChange={(e) => setForm({ ...form, caseworker_name: e.target.value })} data-testid="political-caseworker" />
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Agency" value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} data-testid="political-agency" />
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="FOIA status" value={form.foia_status} onChange={(e) => setForm({ ...form, foia_status: e.target.value })} data-testid="political-foia" />
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="§1983 status" value={form.section_1983_status} onChange={(e) => setForm({ ...form, section_1983_status: e.target.value })} data-testid="political-1983" />
        </div>
        <textarea className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 h-24" placeholder="Violations (one per line)" value={form.violations} onChange={(e) => setForm({ ...form, violations: e.target.value })} data-testid="political-violations" />
        <textarea className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 h-20" placeholder="Vault refs (CIDs, one per line)" value={form.vault_refs} onChange={(e) => setForm({ ...form, vault_refs: e.target.value })} data-testid="political-vault-refs" />
        <textarea className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 h-20" placeholder="Narrative / certification" value={form.narrative} onChange={(e) => setForm({ ...form, narrative: e.target.value })} data-testid="political-narrative" />
        <button onClick={handleGenerate} className="mt-3 px-3 py-2 bg-red-600/40 rounded" data-testid="political-generate">Generate Dossier</button>
      </div>

      {currentDossier && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4" data-testid="political-dossier-preview">
          <h3 className="font-semibold">Dossier Preview</h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-200 mt-3">{currentDossier.document}</pre>
        </div>
      )}

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="political-contacts">
        <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Contacts</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" value={state} onChange={(e) => setState(e.target.value)} data-testid="political-state" placeholder="State" />
          <input className="bg-black/40 border border-gray-700 rounded-lg p-2" value={role} onChange={(e) => setRole(e.target.value)} data-testid="political-role" placeholder="Role filter" />
        </div>
        <div className="mt-3 grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {contacts.map((c) => (
            <button key={c.contact_id} onClick={() => toggleTarget(c.contact_id)} className={`text-left border rounded-lg p-3 ${selectedTargets.includes(c.contact_id) ? 'border-red-500 bg-red-900/30' : 'border-gray-700 bg-black/40'}`} data-testid={`political-contact-${c.contact_id}`}>
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-gray-400">{c.role} • {c.state}</p>
              <p className="text-xs text-gray-400">{c.email}</p>
            </button>
          ))}
        </div>
        <button onClick={handleDispatch} className="mt-3 px-3 py-2 bg-red-600/40 rounded flex items-center gap-2" data-testid="political-dispatch">
          <Send className="w-4 h-4" /> Dispatch (Simulated)
        </button>
      </div>

      {dispatchReport && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4" data-testid="political-dispatch-report">
          <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Dispatch Report</h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-200 mt-3">{JSON.stringify(dispatchReport, null, 2)}</pre>
        </div>
      )}

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="political-dossier-list">
        <h3 className="font-semibold">Previous Dossiers</h3>
        <div className="mt-2 space-y-2">
          {dossiers.map((d) => (
            <div key={d.dossier_id} className="bg-black/40 border border-gray-700 rounded-lg p-3">
              <p className="text-sm font-semibold">{d.payload?.case_title}</p>
              <p className="text-xs text-gray-400">{d.dossier_id}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-400" data-testid="political-disclaimer">
        Disclaimer: Political Strike dispatch is SIMULATED ONLY. No real emails are sent.
      </div>
    </div>
  );
}

export default PoliticalStrikeTab;
