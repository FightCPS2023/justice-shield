import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { DashboardOverview } from '../components/DashboardOverview';
import { LayoutDashboard } from 'lucide-react';

interface DashboardPageProps {
  onBackToMenu: () => void;
  caseId: string;
  documents: any[];
  timelineEvents: any[];
  violations: any[];
  strategies: any[];
}

export function DashboardPage({
  onBackToMenu,
  caseId,
  documents,
  timelineEvents,
  violations,
  strategies,
}: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Dashboard Overview"
        description="Your case summary and quick statistics"
        onBackToMenu={onBackToMenu}
        icon={<LayoutDashboard className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardOverview
          caseId={caseId}
          documents={documents}
          timelineEvents={timelineEvents}
          violations={violations}
          strategies={strategies}
        />
      </div>
    </div>
  );
}
