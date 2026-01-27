import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { CommunityHub } from '../components/CommunityHub';
import { Users } from 'lucide-react';

interface CommunityPageProps {
  onBackToMenu: () => void;
}

export function CommunityPage({ onBackToMenu }: CommunityPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Community Hub"
        description="Connect with other parents and advocates"
        onBackToMenu={onBackToMenu}
        icon={<Users className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CommunityHub />
      </div>
    </div>
  );
}
