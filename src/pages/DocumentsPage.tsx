import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { CaseDocuments } from '../components/CaseDocuments';
import { FileText } from 'lucide-react';

interface DocumentsPageProps {
  onBackToMenu: () => void;
  caseId: string;
  documents: any[];
  onDocumentsChange: (docs: any[]) => void;
}

export function DocumentsPage({
  onBackToMenu,
  caseId,
  documents,
  onDocumentsChange,
}: DocumentsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <PageHeader
        title="Case Documents"
        description="Upload and manage your case documents with AI analysis"
        onBackToMenu={onBackToMenu}
        icon={<FileText className="w-8 h-8" />}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CaseDocuments
          caseId={caseId}
          documents={documents}
          onDocumentsChange={onDocumentsChange}
        />
      </div>
    </div>
  );
}
