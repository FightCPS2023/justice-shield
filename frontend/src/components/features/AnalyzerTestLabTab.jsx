import React, { useState } from 'react';
import { Download, FlaskConical, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import api, { API_URL } from '../../lib/api';

function AnalyzerTestLabTab({ selectedCase, onNavigateToDocuments }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSamples = async () => {
    setDownloading(true);
    try {
      const token = api.getToken ? api.getToken() : localStorage.getItem('cps_token');
      if (!token) throw new Error('Session expired. Please log in again.');

      const response = await fetch(`${API_URL}/api/documents/test-samples/bundle`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Download failed' }));
        throw new Error(error.detail || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'cps_analyzer_test_samples.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Sample bundle downloaded');
    } catch (error) {
      toast.error(error.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="text-center py-12" data-testid="analyzer-test-lab">
        <FlaskConical className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Analyzer Test Lab</h3>
        <p className="text-gray-400">Select a case to run analyzer testing tools.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analyzer-test-lab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <FlaskConical className="w-8 h-8 text-red-500" />
          Analyzer Test Lab
        </h1>
        <p className="text-gray-400">Verify every file type for the Document Analyzer on case: {selectedCase.title}</p>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 space-y-4" data-testid="analyzer-test-actions">
        <div>
          <h2 className="text-xl font-semibold">Step 1 — Download Sample Bundle</h2>
          <p className="text-sm text-gray-400">Includes PDF, DOCX, ODT, HTML, MD, CSV, XLSX, PPTX, images, and WAV samples.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadSamples}
            disabled={downloading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2"
            data-testid="download-sample-bundle-btn"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download Sample Bundle'}
          </button>
          <button
            onClick={onNavigateToDocuments}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center gap-2"
            data-testid="open-documents-upload-btn"
          >
            <UploadCloud className="w-4 h-4" />
            Open Documents Upload
          </button>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-700 rounded-xl p-6" data-testid="analyzer-test-instructions">
        <h3 className="text-lg font-semibold mb-3">Testing Checklist</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
          <li>Upload the sample ZIP bundle using the Documents tab.</li>
          <li>Confirm each extracted file appears as a separate document entry.</li>
          <li>Verify OCR/transcription/analysis runs and completes without errors.</li>
          <li>Review the Processing Log panel in the document viewer for step-by-step status.</li>
          <li>Report any failures immediately with screenshot + file type.</li>
        </ol>
        <div className="mt-4 text-xs text-gray-500">
          Note: Legacy .doc/.ppt files may require conversion for best results. Use DOCX/PPTX when possible.
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6" data-testid="analyzer-test-supported">
        <h3 className="text-lg font-semibold mb-3">Supported Formats</h3>
        <p className="text-sm text-gray-400">Documents, images with OCR, spreadsheets, presentations, audio/video transcription, and ZIP archives.</p>
      </div>
    </div>
  );
}

export default AnalyzerTestLabTab;
