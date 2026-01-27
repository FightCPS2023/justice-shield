import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { EvidenceChecklist } from '../components/EvidenceChecklist';
import { CheckSquare } from 'lucide-react';

interface EvidencePageProps {
  onBackToMenu: () => void;
  caseId: string;
}

export function EvidencePage({ onBackToMenu, caseId }: EvidencePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Evidence Checklist"
        description="Track evidence collection and case preparation"
        onBackToMenu={onBackToMenu}
        icon={<CheckSquare className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EvidenceChecklist caseId={caseId} />
      </div>
    </div>
  );
}
