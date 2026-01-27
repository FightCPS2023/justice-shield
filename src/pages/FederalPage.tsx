import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { FederalCivilRights } from '../components/FederalCivilRights';
import { Scale } from 'lucide-react';

interface FederalPageProps {
  onBackToMenu: () => void;
  caseId: string;
  documents: any[];
  violations: any[];
}

export function FederalPage({
  onBackToMenu,
  caseId,
  documents,
  violations,
}: FederalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Federal Civil Rights"
        description="Section 1983 lawsuits and federal litigation tools"
        onBackToMenu={onBackToMenu}
        icon={<Scale className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <FederalCivilRights
          caseId={caseId}
          documents={documents}
          violations={violations}
        />
      </div>
    </div>
  );
}
