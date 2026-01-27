import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Settings } from '../components/Settings';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsPageProps {
  onBackToMenu: () => void;
  subscriptionTier: string;
  onUpgrade: () => void;
}

export function SettingsPage({
  onBackToMenu,
  subscriptionTier,
  onUpgrade,
}: SettingsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Settings & Profile"
        description="Manage your account and subscription"
        onBackToMenu={onBackToMenu}
        icon={<SettingsIcon className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Settings subscriptionTier={subscriptionTier} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
}
