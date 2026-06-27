import React, { useEffect, useState } from 'react';
import { FileText, Download, Copy, Mail, MapPin, Send, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

function FoiaRequestsTab({ selectedCase }) {
  const { api } = useAuth();
  const [states, setStates] = useState([]);
  const [form, setForm] = useState({
    user_name: '',
    state: '',
    caseworker_name: '',
    agency_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const data = await api.get('/api/foia/states');
        setStates(data.states || []);
      } catch (err) {
        toast.error('Failed to load FOIA states');
      }
    };
    const loadStatus = async () => {
      try {
        const status = await api.get('/api/foia/email/status');
        setGmailConnected(status.connected);
      } catch (err) {
        setGmailConnected(false);
      }
    };
    loadStates();
    loadStatus();
    if (selectedCase?.id) {
      api.post('/api/foia/reminders/dispatch', {}).catch(() => {});
    }
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const connectGmail = async () => {
    try {
      const data = await api.get('/api/oauth/gmail/login');
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err) {
      toast.error('Unable to start Gmail authorization');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.user_name || !form.state || !form.caseworker_name || !form.agency_name) {
      toast.error('Please complete all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/api/foia/generate', {
        ...form,
        case_id: selectedCase?.id || undefined
      });
      setPackageData(data);
      setRecipientEmail(data.target_email || '');
      toast.success('FOIA request generated');
    } catch (error) {
      toast.error(error.message || 'FOIA generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!packageData) return;
    if (!recipientEmail) {
      toast.error('Recipient email is required');
      return;
    }
    setSending(true);
    try {
      const payload = {
        ...form,
        recipient_email: recipientEmail,
        case_id: selectedCase?.id || undefined
      };
      await api.post('/api/foia/send', payload);
      toast.success('FOIA request sent');
    } catch (error) {
      toast.error(error.message || 'FOIA send failed');
    } finally {
      setSending(false);
    }
  };

  const copyText = () => {
    if (!packageData) return;
    navigator.clipboard.writeText(packageData.document_markdown || '');
    toast.success('Copied to clipboard');
  };

  const downloadPdf = () => {
    if (!packageData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>FOIA Request</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1, h2, h3 { margin-top: 24px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${packageData.document_markdown}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="foia-requests-tab">
        <FileText className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">FOIA Requests</h3>
        <p className="text-gray-400">Select a case to generate FOIA requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="foia-requests-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <FileText className="w-8 h-8 text-red-500" />
          FOIA Requests
        </h1>
        <p className="text-gray-400">Generate bond & oath-of-office requests with one click.</p>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-300">Gmail status: <span className={gmailConnected ? 'text-emerald-400' : 'text-red-400'}>{gmailConnected ? 'Connected' : 'Not connected'}</span></p>
          <p className="text-xs text-gray-500">Connect Gmail to send FOIA requests directly from the app.</p>
        </div>
        <button
          onClick={connectGmail}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
          data-testid="foia-connect-gmail"
        >
          <Link2 className="w-4 h-4" />
          Connect Gmail
        </button>
      </div>

      <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-4">
        <input
          className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm"
          placeholder="Your Name"
          value={form.user_name}
          onChange={handleChange('user_name')}
          data-testid="foia-user-name"
        />
        <select
          className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm"
          value={form.state}
          onChange={handleChange('state')}
          data-testid="foia-state"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <input
          className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm"
          placeholder="Caseworker Name"
          value={form.caseworker_name}
          onChange={handleChange('caseworker_name')}
          data-testid="foia-caseworker-name"
        />
        <input
          className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm"
          placeholder="Agency Name"
          value={form.agency_name}
          onChange={handleChange('agency_name')}
          data-testid="foia-agency-name"
        />
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          data-testid="foia-generate-btn"
        >
          {loading ? 'Generating...' : 'Generate FOIA Request'}
        </button>
      </form>

      {packageData && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 space-y-4" data-testid="foia-output">
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /> {packageData.target_address}</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-red-400" /> {packageData.target_email}</div>
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-red-400" /> {packageData.statute}</div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                className="flex-1 bg-black/40 border border-gray-700 rounded-lg p-2 text-sm"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Recipient email"
                data-testid="foia-recipient-email"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !gmailConnected}
              className="py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold flex items-center justify-center gap-2"
              data-testid="foia-send-btn"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send via Gmail'}
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={copyText} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded" data-testid="foia-copy-btn"><Copy className="w-4 h-4" /> Copy</button>
            <button onClick={downloadPdf} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded" data-testid="foia-download-btn"><Download className="w-4 h-4" /> Download PDF</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-black/40 p-4 rounded" data-testid="foia-document">
            {packageData.document_markdown}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FoiaRequestsTab;
