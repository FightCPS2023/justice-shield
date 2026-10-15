import React, { useEffect, useState } from 'react';
import { Shield, Lock, Upload, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../lib/api';
import { VictoryCardPrompt } from '../VictoryCardPrompt';

function ImmutableVaultTab() {
  const { api } = useAuth();
  const [file, setFile] = useState(null);
  const [key, setKey] = useState('');
  const [gps, setGps] = useState({ latitude: '', longitude: '', altitude_m: '', accuracy_m: '' });
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [verify, setVerify] = useState({ certificate_hash: '', file_sha256: '', file_md5: '' });
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCertificates = async () => {
    try {
      const data = await api.get('/api/vault/certificates');
      setCertificates(data.certificates || []);
    } catch (err) {
      toast.error('Failed to load certificates');
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleGenerateKey = async () => {
    try {
      const data = await api.post('/api/vault/generate-key', {});
      toast.success('Key generated. Save it now.');
      setKey(data.key_b64);
    } catch (err) {
      toast.error('Unable to generate key');
    }
  };

  const handleSeal = async () => {
    if (!file || !key) {
      toast.error('File and key required');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('key_b64', key);
      Object.entries(gps).forEach(([k, v]) => {
        if (v) form.append(k, v);
      });
      const response = await fetch(`${API_URL}/api/vault/seal`, {
        method: 'POST',
        credentials: 'include',
        body: form
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Seal failed');
      toast.success('Evidence sealed');
      setSelectedCert(data);
      loadCertificates();
    } catch (err) {
      toast.error(err.message || 'Seal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const data = await api.post('/api/vault/verify', verify);
      setVerifyResult(data);
    } catch (err) {
      toast.error(err.message || 'Verify failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="immutable-vault-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Lock className="w-8 h-8 text-red-500" /> ⚔️ Hardened Storage — Immutable Vault
        </h1>
        <p className="text-gray-400">Seal evidence with AES-256 and generate immutable proof-of-custody certificates.</p>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3" data-testid="vault-seal-form">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Shield className="w-4 h-4 text-red-400" /> AES-256 Key (paste existing key)
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <input value={key} onChange={(e) => setKey(e.target.value)} className="flex-1 bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" placeholder="Paste AES key" data-testid="vault-key-input" />
          <button onClick={handleGenerateKey} className="px-3 py-2 bg-gray-700 rounded text-sm flex items-center gap-2" data-testid="vault-generate-key">
            <Key className="w-4 h-4" /> Generate Key
          </button>
        </div>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" data-testid="vault-file-input" />
        <div className="grid md:grid-cols-4 gap-2">
          {['latitude','longitude','altitude_m','accuracy_m'].map((field) => (
            <input key={field} value={gps[field]} onChange={(e) => setGps({ ...gps, [field]: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" placeholder={field} data-testid={`vault-gps-${field}`} />
          ))}
        </div>
        <button onClick={handleSeal} disabled={loading} className="px-4 py-2 bg-red-600 rounded-lg" data-testid="vault-seal-btn">
          {loading ? 'Sealing...' : 'Seal Evidence'}
        </button>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="vault-certificates">
        <h3 className="font-semibold">Vault Certificates</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          {certificates.map((c) => (
            <button key={c.vault_id} onClick={() => setSelectedCert(c)} className="text-left bg-black/40 border border-gray-700 rounded-lg p-3" data-testid={`vault-cert-${c.vault_id}`}>
              <p className="text-sm font-semibold">{c.proof_of_custody?.file_name || 'Evidence'}</p>
              <p className="text-xs text-gray-400">CID: {c.upload_result?.cid}</p>
              <p className="text-xs text-gray-400">Hash: {c.certificate_hash?.slice(0, 10)}...</p>
            </button>
          ))}
          {!certificates.length && (
            <p className="text-sm text-gray-400" data-testid="vault-empty-state">No evidence sealed yet.</p>
          )}
        </div>
      </div>

      {selectedCert && <VictoryCardPrompt triggerType="evidence_sealed" triggerData={{ case_id: selectedCase?.id || null, vault_id: selectedCert.vault_id || null }} label="Evidence sealed — share your victory?" testId="vault-victory-prompt" />}
      {selectedCert && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4" data-testid="vault-detail">
          <h3 className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Certificate Detail</h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-200 mt-3">{JSON.stringify(selectedCert, null, 2)}</pre>
        </div>
      )}

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="vault-verify">
        <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Verify Evidence</h3>
        <input value={verify.certificate_hash} onChange={(e) => setVerify({ ...verify, certificate_hash: e.target.value })} className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" placeholder="Certificate hash" data-testid="vault-verify-hash" />
        <input value={verify.file_sha256} onChange={(e) => setVerify({ ...verify, file_sha256: e.target.value })} className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" placeholder="SHA256" data-testid="vault-verify-sha" />
        <input value={verify.file_md5} onChange={(e) => setVerify({ ...verify, file_md5: e.target.value })} className="mt-2 w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" placeholder="MD5" data-testid="vault-verify-md5" />
        <button onClick={handleVerify} className="mt-3 px-4 py-2 bg-red-600/40 rounded" data-testid="vault-verify-btn">Verify</button>
        {verifyResult && (
          <div className="mt-3 text-sm" data-testid="vault-verify-result">
            {verifyResult.verified ? 'PASS: Evidence matches certificate.' : 'FAIL: Evidence mismatch.'}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400" data-testid="vault-disclaimer">
        Disclaimer: This tool provides preservation and documentation only. Key is never stored server-side.
      </div>
    </div>
  );
}

export default ImmutableVaultTab;
