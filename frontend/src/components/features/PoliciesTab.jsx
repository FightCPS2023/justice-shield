import React from "react";
import { FileText, ShieldCheck } from "lucide-react";

function PoliciesTab() {
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8" data-testid="policies-tab">
      <div className="text-center" data-testid="policies-header">
        <h1 className="text-3xl font-bold mb-2">Policies & Legal</h1>
        <p className="text-gray-400">Review the Terms of Service and Privacy Policy for The CPS Punisher.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6" data-testid="terms-section">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-semibold">Terms of Service</h2>
        </div>
        <p className="text-sm text-gray-400 mb-3">Effective Date: {effectiveDate}</p>
        <div className="space-y-3 text-gray-300 text-sm leading-6">
          <p><strong>Acceptance:</strong> By downloading or using “The CPS Punisher,” you agree to these Terms.</p>
          <p><strong>Intellectual Property:</strong> All content, features, and functionality are owned by Darren Guay and protected by IP laws. Users are granted a limited, non-exclusive license for personal use only. No reproduction, modification, or reverse engineering is permitted.</p>
          <p><strong>User Conduct:</strong> Users must not copy, distribute, or use the app for illegal purposes.</p>
          <p><strong>Disclaimer:</strong> The app provides analysis for informational purposes only and does not constitute legal advice.</p>
          <p><strong>Termination:</strong> Violations may result in account termination and legal action.</p>
          <p><strong>Governing Law:</strong> State of Maine.</p>
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6" data-testid="privacy-section">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-zinc-300" />
          <h2 className="text-xl font-semibold">Privacy Policy</h2>
        </div>
        <p className="text-sm text-gray-400 mb-3">Effective Date: {effectiveDate}</p>
        <div className="space-y-3 text-gray-300 text-sm leading-6">
          <p><strong>Information Collected:</strong> We collect user-provided data (e.g., CPS case details) and limited device information.</p>
          <p><strong>Use of Information:</strong> Data is used solely for app functionality and analysis; not shared with third parties without consent.</p>
          <p><strong>Security:</strong> We implement reasonable measures to protect data.</p>
          <p><strong>User Rights:</strong> Users may request data access or deletion via <span className="text-zinc-300">punisher@cpsbreakingnews.com</span>.</p>
          <p><strong>Changes:</strong> We may update this policy; continued use constitutes acceptance.</p>
        </div>
      </div>
    </div>
  );
}

export default PoliciesTab;
