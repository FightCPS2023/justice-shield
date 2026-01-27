import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  onBackToMenu: () => void;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, onBackToMenu, icon }: PageHeaderProps) {
  return (
    <div className="bg-black/50 backdrop-blur-sm border-b border-red-900/30 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {icon && <div className="text-red-600">{icon}</div>}
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {description && <p className="text-sm text-gray-400">{description}</p>}
            </div>
          </div>
          <Button
            onClick={onBackToMenu}
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
