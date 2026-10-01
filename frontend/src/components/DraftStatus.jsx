import React from 'react';
import { Save, History } from 'lucide-react';

export const DraftStatus = ({ draft, testId = 'draft-status' }) => {
  if (!draft?.savedAt) return null;
  const time = new Date(draft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="inline-flex items-center gap-2 border border-slate-600 bg-black px-2.5 py-1 text-[11px] font-mono text-slate-300" data-testid={testId}>
      {draft.restored ? <History className="w-3 h-3 text-amber-300" /> : <Save className="w-3 h-3 text-emerald-300" />}
      {draft.restored ? `Unsaved draft restored (${time})` : `Draft auto-saved ${time}`}
      <button type="button" onClick={draft.clearDraft} className="text-slate-500 hover:text-red-300 underline" data-testid={`${testId}-discard`}>
        discard
      </button>
    </div>
  );
};

export default DraftStatus;
