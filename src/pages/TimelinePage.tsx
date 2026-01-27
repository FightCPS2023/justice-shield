import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { TimelineBuilder } from '../components/TimelineBuilder';
import { Calendar } from 'lucide-react';

interface TimelinePageProps {
  onBackToMenu: () => void;
  caseId: string;
  events: any[];
  onEventsChange: (events: any[]) => void;
}

export function TimelinePage({
  onBackToMenu,
  caseId,
  events,
  onEventsChange,
}: TimelinePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Timeline Builder"
        description="Create a detailed timeline of events in your case"
        onBackToMenu={onBackToMenu}
        icon={<Calendar className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TimelineBuilder
          caseId={caseId}
          events={events}
          onEventsChange={onEventsChange}
        />
      </div>
    </div>
  );
}
