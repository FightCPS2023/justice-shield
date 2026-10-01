import React, { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { AI_MODES, getAiMode, setAiMode, subscribeAiMode } from '../lib/aiMode';

export const AiModeSelector = ({ compact = false }) => {
  const [mode, setMode] = useState(getAiMode());
  useEffect(() => subscribeAiMode(setMode), []);
  const active = AI_MODES.find((m) => m.id === mode) || AI_MODES[0];

  return (
    <div className="flex flex-col gap-1" data-testid="ai-mode-selector">
      <div className="flex flex-wrap items-center gap-1">
        {!compact && (
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1 mr-1">
            <UserCog className="w-3 h-3" /> Mode
          </span>
        )}
        {AI_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setAiMode(m.id)}
            title={m.desc}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wide border transition-colors ${
              mode === m.id ? 'bg-slate-100 text-black border-slate-100' : 'bg-black text-slate-300 border-slate-600 hover:border-slate-300'
            }`}
            data-testid={`ai-mode-${m.id.toLowerCase()}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {!compact && <p className="text-[11px] text-slate-500 font-mono" data-testid="ai-mode-desc">{active.id} — {active.desc}</p>}
    </div>
  );
};

export default AiModeSelector;
