import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { AdvocateDirectory } from '../components/AdvocateDirectory';
import { MapPin } from 'lucide-react';

interface DirectoryPageProps {
  onBackToMenu: () => void;
}

export function DirectoryPage({ onBackToMenu }: DirectoryPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Advocate & Attorney Directory"
        description="Find advocates and attorneys in your area"
        onBackToMenu={onBackToMenu}
        icon={<MapPin className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdvocateDirectory />
      </div>
    </div>
  );
}
