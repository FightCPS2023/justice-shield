import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { ViolationChecker } from '../components/ViolationChecker';
import { AlertTriangle } from 'lucide-react';

interface ViolationsPageProps {
  onBackToMenu: () => void;
  caseId: string;
  violations: any[];
  onViolationsChange: (violations: any[]) => void;
}

export function ViolationsPage({
  onBackToMenu,
  caseId,
  violations,
  onViolationsChange,
}: ViolationsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Violation Checker"
        description="Identify constitutional and procedural violations in your case"
        onBackToMenu={onBackToMenu}
        icon={<AlertTriangle className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ViolationChecker
          caseId={caseId}
          violations={violations}
          onViolationsChange={onViolationsChange}
        />
      </div>
    </div>
  );
}
