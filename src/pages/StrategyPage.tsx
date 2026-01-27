import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { DefenseStrategy } from '../components/DefenseStrategy';
import { Shield } from 'lucide-react';

interface StrategyPageProps {
  onBackToMenu: () => void;
  caseId: string;
  strategies: any[];
  onStrategiesChange: (strategies: any[]) => void;
  documents: any[];
  violations: any[];
}

export function StrategyPage({
  onBackToMenu,
  caseId,
  strategies,
  onStrategiesChange,
  documents,
  violations,
}: StrategyPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Defense Strategy"
        description="Generate legal defense strategies and arguments"
        onBackToMenu={onBackToMenu}
        icon={<Shield className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DefenseStrategy
          caseId={caseId}
          strategies={strategies}
          onStrategiesChange={onStrategiesChange}
          documents={documents}
          violations={violations}
        />
      </div>
    </div>
  );
}
