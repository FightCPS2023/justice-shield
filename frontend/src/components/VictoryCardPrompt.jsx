import React, { useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

export const navigateTo = (tab) => window.dispatchEvent(new CustomEvent('punisher-navigate', { detail: tab }));

export const VictoryCardPrompt = ({ triggerType, triggerData = {}, label = 'Share your victory?', testId = 'victory-card-prompt' }) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const generate = async () => {
    setBusy(true);
    try {
      const card = await api.post('/api/victory-cards/generate', { trigger_type: triggerType, trigger_data: triggerData, card_style: 'chrome' });
      setDone(card);
      toast.success('Victory Card generated');
    } catch (e) {
      toast.error(e.message || 'Could not generate Victory Card');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-amber-600 bg-black px-4 py-3 flex flex-wrap items-center justify-between gap-3" data-testid={testId}>
      <div className="flex items-center gap-2 text-sm">
        <Flame className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-amber-200">🔥 {label}</span>
        <span className="text-zinc-400 text-xs font-mono hidden md:inline">Generate a shareable Victory Card for X / Facebook / TikTok</span>
      </div>
      {done ? (
        <button type="button" onClick={() => navigateTo('victory-cards')} className="px-3 py-1.5 bg-amber-400 text-black text-xs font-bold uppercase tracking-wide hover:bg-amber-300" data-testid={`${testId}-view`}>
          View card →
        </button>
      ) : (
        <button type="button" onClick={generate} disabled={busy} className="px-3 py-1.5 bg-zinc-200 text-black text-xs font-bold uppercase tracking-wide hover:bg-white disabled:opacity-50 flex items-center gap-1" data-testid={`${testId}-generate`}>
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flame className="w-3 h-3" />} Generate Victory Card
        </button>
      )}
    </div>
  );
};

export default VictoryCardPrompt;
