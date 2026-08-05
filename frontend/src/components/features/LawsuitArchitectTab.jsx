import React, { useEffect, useState } from 'react';
import { Gavel, FileText, Copy, Download, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const defaultPlaintiff = { name: '', address: '', city: '', state: '', zip: '', phone: '', email: '' };
const defaultDefendant = { name: '', badge: '', title: '', employer: '' };
const defaultAgency = { name: '', address: '', city: '', state: '', zip: '' };
const defaultIncident = { date: '', location: '', district: '' };
const defaultBond = { bond_number: '', surety_company: '', coverage_amount: '', effective_dates: '', oath_on_file: false };
const defaultChildren = { count: '', ages: '' };

function LawsuitArchitectTab({ selectedCase }) {
  const { api } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [generated, setGenerated] = useState(null);

  const [plaintiff, setPlaintiff] = useState(defaultPlaintiff);
  const [defendant, setDefendant] = useState(defaultDefendant);
  const [agency, setAgency] = useState(defaultAgency);
  const [incident, setIncident] = useState(defaultIncident);
  const [violations, setViolations] = useState([{ matched_phrase: '', amendments: '', legal_citations: '', description: '' }]);
  const [bondDetails, setBondDetails] = useState(defaultBond);
  const [children, setChildren] = useState(defaultChildren);

  const loadComplaints = async () => {
    try {
      const data = await api.get('/api/lawsuit-architect/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const addViolation = () => {
    setViolations((prev) => [...prev, { matched_phrase: '', amendments: '', legal_citations: '', description: '' }]);
  };

  const removeViolation = (idx) => {
    setViolations((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateViolation = (idx, field, value) => {
    setViolations((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const handleGenerate = async () => {
    if (!plaintiff.name || !defendant.name || !incident.date || !incident.location) {
      toast.error('Please complete required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        plaintiff,
        defendant,
        agency,
        incident,
        violations: violations.map((v) => ({
          matched_phrase: v.matched_phrase,
          amendments: v.amendments ? v.amendments.split(',').map((a) => a.trim()) : [],
          legal_citations: v.legal_citations ? v.legal_citations.split(',').map((c) => c.trim()) : [],
          description: v.description
        })),
        bond_details: bondDetails,
        children: {
          count: children.count ? Number(children.count) : undefined,
          ages: children.ages ? children.ages.split(',').map((a) => a.trim()) : []
        },
        output_format: 'pdf'
      };

      const data = await api.post('/api/lawsuit-architect/generate', payload);
      setGenerated(data);
      toast.success('Complaint generated');
      loadComplaints();
      setStep(6);
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generated?.generated_document) return;
    navigator.clipboard.writeText(generated.generated_document);
    toast.success('Copied');
  };

  const handleDownloadMarkdown = () => {
    if (!generated?.generated_document) return;
    const blob = new Blob([generated.generated_document], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '1983-complaint.md';
    link.click();
  };

  const handleDownloadPdf = () => {
    if (!generated?.pdf_base64) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${generated.pdf_base64}`;
    link.download = '1983-complaint.pdf';
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="lawsuit-architect-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Gavel className="w-8 h-8 text-red-500" /> ⚔️ The Executioner — 1983 Lawsuit Architect
        </h1>
        <p className="text-gray-400">Forge court-ready federal §1983 complaints from documented violations.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300" data-testid="lawsuit-architect-steps">
        {[1,2,3,4,5,6].map((s) => (
          <span key={s} className={`px-3 py-1 rounded-full ${step === s ? 'bg-red-600/30 text-red-200' : 'bg-slate-800'}`}>
            Step {s}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3" data-testid="lawsuit-step-plaintiff">
          <h3 className="font-semibold">Plaintiff Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={plaintiff.name} onChange={(e) => setPlaintiff({ ...plaintiff, name: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Full Name" data-testid="lawsuit-plaintiff-name" />
            <input value={plaintiff.phone} onChange={(e) => setPlaintiff({ ...plaintiff, phone: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Phone" data-testid="lawsuit-plaintiff-phone" />
            <input value={plaintiff.email} onChange={(e) => setPlaintiff({ ...plaintiff, email: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Email" data-testid="lawsuit-plaintiff-email" />
            <input value={plaintiff.address} onChange={(e) => setPlaintiff({ ...plaintiff, address: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Address" data-testid="lawsuit-plaintiff-address" />
            <input value={plaintiff.city} onChange={(e) => setPlaintiff({ ...plaintiff, city: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="City" data-testid="lawsuit-plaintiff-city" />
            <input value={plaintiff.state} onChange={(e) => setPlaintiff({ ...plaintiff, state: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="State" data-testid="lawsuit-plaintiff-state" />
            <input value={plaintiff.zip} onChange={(e) => setPlaintiff({ ...plaintiff, zip: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="ZIP" data-testid="lawsuit-plaintiff-zip" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3" data-testid="lawsuit-step-defendant">
          <h3 className="font-semibold">Defendant Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={defendant.name} onChange={(e) => setDefendant({ ...defendant, name: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Caseworker Name" data-testid="lawsuit-defendant-name" />
            <input value={defendant.badge} onChange={(e) => setDefendant({ ...defendant, badge: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Badge / ID" data-testid="lawsuit-defendant-badge" />
            <input value={defendant.title} onChange={(e) => setDefendant({ ...defendant, title: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Title" data-testid="lawsuit-defendant-title" />
            <input value={defendant.employer} onChange={(e) => setDefendant({ ...defendant, employer: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Employer" data-testid="lawsuit-defendant-employer" />
          </div>
          <h4 className="font-semibold mt-4">Agency</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={agency.name} onChange={(e) => setAgency({ ...agency, name: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Agency Name" data-testid="lawsuit-agency-name" />
            <input value={agency.address} onChange={(e) => setAgency({ ...agency, address: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Agency Address" data-testid="lawsuit-agency-address" />
            <input value={agency.city} onChange={(e) => setAgency({ ...agency, city: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="City" data-testid="lawsuit-agency-city" />
            <input value={agency.state} onChange={(e) => setAgency({ ...agency, state: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="State" data-testid="lawsuit-agency-state" />
            <input value={agency.zip} onChange={(e) => setAgency({ ...agency, zip: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="ZIP" data-testid="lawsuit-agency-zip" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3" data-testid="lawsuit-step-incident">
          <h3 className="font-semibold">Incident Details</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={incident.date} onChange={(e) => setIncident({ ...incident, date: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Incident Date" data-testid="lawsuit-incident-date" />
            <input value={incident.location} onChange={(e) => setIncident({ ...incident, location: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Location" data-testid="lawsuit-incident-location" />
            <input value={incident.district} onChange={(e) => setIncident({ ...incident, district: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="District" data-testid="lawsuit-incident-district" />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4" data-testid="lawsuit-step-violations">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Violations</h3>
            <button onClick={addViolation} className="px-3 py-1 bg-red-600/40 rounded text-xs flex items-center gap-1" data-testid="lawsuit-add-violation">
              <Plus className="w-3 h-3" /> Add Violation
            </button>
          </div>
          {violations.map((v, idx) => (
            <div key={idx} className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-red-200">Violation {idx + 1}</h4>
                {violations.length > 1 && (
                  <button onClick={() => removeViolation(idx)} className="text-xs text-red-300 flex items-center gap-1" data-testid={`lawsuit-remove-violation-${idx}`}>
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
              <input value={v.matched_phrase} onChange={(e) => updateViolation(idx, 'matched_phrase', e.target.value)} className="bg-black/40 border border-gray-700 rounded-lg p-2 w-full" placeholder="Matched phrase" data-testid={`lawsuit-violation-phrase-${idx}`} />
              <input value={v.amendments} onChange={(e) => updateViolation(idx, 'amendments', e.target.value)} className="bg-black/40 border border-gray-700 rounded-lg p-2 w-full" placeholder="Amendments (comma-separated)" data-testid={`lawsuit-violation-amendments-${idx}`} />
              <input value={v.legal_citations} onChange={(e) => updateViolation(idx, 'legal_citations', e.target.value)} className="bg-black/40 border border-gray-700 rounded-lg p-2 w-full" placeholder="Legal citations (comma-separated)" data-testid={`lawsuit-violation-citations-${idx}`} />
              <textarea value={v.description} onChange={(e) => updateViolation(idx, 'description', e.target.value)} className="bg-black/40 border border-gray-700 rounded-lg p-2 w-full h-24" placeholder="Violation description" data-testid={`lawsuit-violation-description-${idx}`} />
            </div>
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3" data-testid="lawsuit-step-bond">
          <h3 className="font-semibold">Bond & Children</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={bondDetails.bond_number} onChange={(e) => setBondDetails({ ...bondDetails, bond_number: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Bond Number" data-testid="lawsuit-bond-number" />
            <input value={bondDetails.surety_company} onChange={(e) => setBondDetails({ ...bondDetails, surety_company: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Surety Company" data-testid="lawsuit-bond-company" />
            <input value={bondDetails.coverage_amount} onChange={(e) => setBondDetails({ ...bondDetails, coverage_amount: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Coverage Amount" data-testid="lawsuit-bond-coverage" />
            <input value={bondDetails.effective_dates} onChange={(e) => setBondDetails({ ...bondDetails, effective_dates: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Effective Dates" data-testid="lawsuit-bond-dates" />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={bondDetails.oath_on_file} onChange={(e) => setBondDetails({ ...bondDetails, oath_on_file: e.target.checked })} data-testid="lawsuit-bond-oath" /> Oath on File
            </label>
          </div>
          <h4 className="font-semibold">Children</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={children.count} onChange={(e) => setChildren({ ...children, count: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Number of Children" data-testid="lawsuit-children-count" />
            <input value={children.ages} onChange={(e) => setChildren({ ...children, ages: e.target.value })} className="bg-black/40 border border-gray-700 rounded-lg p-2" placeholder="Ages (comma-separated)" data-testid="lawsuit-children-ages" />
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4" data-testid="lawsuit-step-review">
          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Generated Complaint</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={handleCopy} className="px-3 py-1 bg-gray-700 rounded text-xs flex items-center gap-1" data-testid="lawsuit-copy-btn"><Copy className="w-3 h-3" /> Copy</button>
              <button onClick={handleDownloadMarkdown} className="px-3 py-1 bg-gray-700 rounded text-xs flex items-center gap-1" data-testid="lawsuit-download-md"><Download className="w-3 h-3" /> Download Markdown</button>
              <button onClick={handleDownloadPdf} className="px-3 py-1 bg-red-600/40 rounded text-xs flex items-center gap-1" data-testid="lawsuit-download-pdf"><Download className="w-3 h-3" /> Download PDF</button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-200 mt-4" data-testid="lawsuit-output">{generated?.generated_document || 'Generate a complaint to view output.'}</pre>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button disabled={step === 1} onClick={() => setStep((prev) => Math.max(1, prev - 1))} className="px-4 py-2 bg-gray-800 rounded-lg text-sm flex items-center gap-2" data-testid="lawsuit-prev-step">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < 6 && (
          <button onClick={() => setStep((prev) => prev + 1)} className="px-4 py-2 bg-gray-700 rounded-lg text-sm flex items-center gap-2" data-testid="lawsuit-next-step">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {step === 5 && (
          <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-red-600 rounded-lg text-sm flex items-center gap-2" data-testid="lawsuit-generate">
            {loading ? 'Generating...' : 'Generate Complaint'}
          </button>
        )}
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="lawsuit-complaint-list">
        <h3 className="font-semibold">Previous Complaints</h3>
        <div className="mt-3 space-y-2">
          {complaints.map((c) => (
            <div key={c.complaint_id} className="flex items-center justify-between bg-black/40 border border-gray-700 rounded-lg p-3">
              <div>
                <p className="text-sm font-semibold">{c.plaintiff?.name || 'Complaint'} ({c.created_at?.slice(0,10)})</p>
                <p className="text-xs text-gray-400">Complaint ID: {c.complaint_id}</p>
              </div>
            </div>
          ))}
          {!complaints.length && <p className="text-sm text-gray-400">No complaints generated yet.</p>}
        </div>
      </div>

      <div className="text-xs text-slate-400" data-testid="lawsuit-disclaimer">
        Disclaimer: This tool generates templates for self-advocacy. Consult a licensed attorney before filing.
      </div>
    </div>
  );
}

export default LawsuitArchitectTab;
