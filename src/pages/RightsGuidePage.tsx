import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { CPSEducation } from '../components/CPSEducation';
import { BookOpen } from 'lucide-react';

interface RightsGuidePageProps {
  onBackToMenu: () => void;
}

export function RightsGuidePage({ onBackToMenu }: RightsGuidePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Rights Guide"
        description="Comprehensive guide to your constitutional rights"
        onBackToMenu={onBackToMenu}
        icon={<BookOpen className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CPSEducation />
      </div>
    </div>
  );
}
