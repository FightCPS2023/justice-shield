import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Megaphone, Download, Copy, Trash2, Share2, Link2, Loader2, Smartphone, Square } from 'lucide-react';
import { toast } from 'sonner';
import { toPng, toBlob } from 'html-to-image';
import { api } from '../../lib/api';
import { VictoryCard } from '../VictoryCard';

const TRIGGERS = [
  ['violation_detected', 'Violation Detected'], ['lawsuit_drafted', 'Lawsuit Drafted'], ['foia_filed', 'FOIA Filed'],
  ['evidence_sealed', 'Evidence Sealed'], ['dossier_dispatched', 'Dossier Dispatched'], ['caseworker_flagged', 'Caseworker Flagged'],
];

function VictoryCardsTab({ selectedCase }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [format, setFormat] = useState('square');
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({ trigger_type: 'violation_detected', card_style: 'chrome', violation_count: '', amendment: '', agency: '', state: selectedCase?.state || '' });
  const canvasRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/victory-cards');
      setCards(data.cards || []);
      setSelected((prev) => prev || data.cards?.[0] || null);
    } catch (e) {
      toast.error('Could not load Victory Cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async (e) => {
    e.preventDefault();
    try {
      const card = await api.post('/api/victory-cards/generate', {
        trigger_type: form.trigger_type,
        card_style: form.card_style,
        trigger_data: {
          case_id: selectedCase?.id || null,
          violation_count: form.violation_count ? Number(form.violation_count) : null,
          amendment: form.amendment || null,
          agency: form.agency || null,
          state: form.state || null,
        },
      });
      setCards((prev) => [card, ...prev]);
      setSelected(card);
      toast.success('Victory Card generated');
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    }
  };

  const renderPng = async () => {
    if (!canvasRef.current) throw new Error('Card not rendered');
    return toPng(canvasRef.current, { pixelRatio: 1, cacheBust: true, style: { transform: 'scale(1)' } });
  };

  const downloadPng = async () => {
    setExporting(true);
    try {
      const dataUrl = await renderPng();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `victory-card-${selected.card_id.slice(0, 8)}-${format}.png`;
      a.click();
      api.put(`/api/victory-cards/${selected.card_id}/image`, { share_image_data: dataUrl }).catch(() => {});
      toast.success('PNG downloaded');
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const copyImage = async () => {
    setExporting(true);
    try {
      const blob = await toBlob(canvasRef.current, { pixelRatio: 1, cacheBust: true, style: { transform: 'scale(1)' } });
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      toast.success('Image copied to clipboard');
    } catch (e) {
      toast.error('Clipboard image copy not supported here — use Download PNG');
    } finally {
      setExporting(false);
    }
  };

  const shareText = (c) => `${c.headline.replace(/^[^\w⚔]*\s*/, '')} — ${c.subtext}. ${c.stats_line}. ${c.hashtags.join(' ')}`;
  const shareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(selected))}&url=${encodeURIComponent(selected.share_url)}`, '_blank', 'noopener');
  const shareFb = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selected.share_url)}&quote=${encodeURIComponent(shareText(selected))}`, '_blank', 'noopener');
  const copyLink = () => { navigator.clipboard.writeText(selected.share_url); toast.success('Share link copied'); };

  const remove = async (card) => {
    try {
      await api.delete(`/api/victory-cards/${card.card_id}`);
      setCards((prev) => prev.filter((c) => c.card_id !== card.card_id));
      if (selected?.card_id === card.card_id) setSelected(null);
      toast.success('Card deleted');
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const previewScale = format === 'story' ? 0.28 : 0.45;

  useEffect(() => {
    if (!selected || selected.share_image_data || format !== 'square' || !canvasRef.current) return undefined;
    const t = setTimeout(async () => {
      try {
        const dataUrl = await toPng(canvasRef.current, { pixelRatio: 1, cacheBust: true, style: { transform: 'scale(1)' } });
        await api.put(`/api/victory-cards/${selected.card_id}/image`, { share_image_data: dataUrl });
        setCards((prev) => prev.map((c) => (c.card_id === selected.card_id ? { ...c, share_image_data: 'published' } : c)));
        setSelected((prev) => (prev && prev.card_id === selected.card_id ? { ...prev, share_image_data: 'published' } : prev));
      } catch (e) {
        // preview publish is best-effort
      }
    }, 900);
    return () => clearTimeout(t);
  }, [selected, format]);

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="victory-cards-tab">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <Megaphone className="w-8 h-8 text-red-500" /> Viral Victory Cards
        </h1>
        <p className="text-gray-400">Turn every legal strike into a shareable, chrome-on-black graphic for X, Facebook, Instagram and TikTok.</p>
      </div>

      <form onSubmit={generate} className="border border-zinc-600 bg-black p-4 grid md:grid-cols-6 gap-3" data-testid="victory-generate-form">
        <select value={form.trigger_type} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })} className="bg-black border border-zinc-600 p-2 text-sm md:col-span-2" data-testid="victory-trigger-select">
          {TRIGGERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={form.card_style} onChange={(e) => setForm({ ...form, card_style: e.target.value })} className="bg-black border border-zinc-600 p-2 text-sm" data-testid="victory-style-select">
          <option value="chrome">Chrome</option><option value="dark">Dark</option><option value="fire">Fire</option>
        </select>
        <input value={form.violation_count} onChange={(e) => setForm({ ...form, violation_count: e.target.value })} placeholder="# violations" type="number" min="0" className="bg-black border border-zinc-600 p-2 text-sm" data-testid="victory-count-input" />
        <input value={form.amendment} onChange={(e) => setForm({ ...form, amendment: e.target.value })} placeholder="Amendment (4th)" className="bg-black border border-zinc-600 p-2 text-sm" data-testid="victory-amendment-input" />
        <input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} placeholder="Agency" className="bg-black border border-zinc-600 p-2 text-sm" data-testid="victory-agency-input" />
        <button type="submit" className="md:col-span-6 py-2 bg-zinc-200 text-black font-bold uppercase tracking-wide hover:bg-white" data-testid="victory-generate-btn">Generate Victory Card</button>
      </form>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 border border-zinc-600 bg-black" data-testid="victory-card-list">
          <div className="px-4 py-3 border-b border-zinc-700 text-xs font-mono text-zinc-400">{cards.length} card{cards.length === 1 ? '' : 's'}</div>
          {loading ? (
            <div className="p-6 flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
          ) : cards.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-400" data-testid="victory-empty">No Victory Cards yet. Generate your first one above — or fire one from any weapon page after a strike.</div>
          ) : (
            <div className="divide-y divide-zinc-800 max-h-[640px] overflow-auto">
              {cards.map((c, i) => (
                <button type="button" key={c.card_id} onClick={() => setSelected(c)} className={`w-full text-left px-4 py-3 hover:bg-zinc-900 ${selected?.card_id === c.card_id ? 'bg-zinc-900 border-l-4 border-zinc-200' : ''}`} data-testid={`victory-card-item-${i}`}>
                  <p className="text-sm font-semibold text-zinc-100 truncate">{c.headline}</p>
                  <p className="text-xs text-zinc-400 truncate">{c.subtext}</p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">{new Date(c.created_at).toLocaleString()} · {c.card_style}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2" data-testid="victory-share-bar">
                <button type="button" onClick={() => setFormat('square')} className={`px-3 py-1.5 text-xs font-mono border ${format === 'square' ? 'bg-zinc-200 text-black border-zinc-200' : 'border-zinc-600 text-zinc-300'}`} data-testid="victory-format-square"><Square className="w-3 h-3 inline mr-1" />1080×1080</button>
                <button type="button" onClick={() => setFormat('story')} className={`px-3 py-1.5 text-xs font-mono border ${format === 'story' ? 'bg-zinc-200 text-black border-zinc-200' : 'border-zinc-600 text-zinc-300'}`} data-testid="victory-format-story"><Smartphone className="w-3 h-3 inline mr-1" />1080×1920</button>
                <span className="flex-1" />
                <button type="button" onClick={copyImage} disabled={exporting} className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-800 text-zinc-100 hover:bg-zinc-700 flex items-center gap-1 disabled:opacity-50" data-testid="victory-copy-image"><Copy className="w-3 h-3" /> Copy image</button>
                <button type="button" onClick={downloadPng} disabled={exporting} className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-200 text-black hover:bg-white flex items-center gap-1 disabled:opacity-50" data-testid="victory-download-png">{exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Download PNG</button>
                <button type="button" onClick={shareX} className="px-3 py-1.5 text-xs font-bold uppercase bg-black border border-zinc-500 text-zinc-100 hover:bg-zinc-900 flex items-center gap-1" data-testid="victory-share-x"><Share2 className="w-3 h-3" /> Share to X</button>
                <button type="button" onClick={shareFb} className="px-3 py-1.5 text-xs font-bold uppercase bg-black border border-zinc-500 text-zinc-100 hover:bg-zinc-900 flex items-center gap-1" data-testid="victory-share-fb"><Share2 className="w-3 h-3" /> Facebook</button>
                <button type="button" onClick={copyLink} className="px-3 py-1.5 text-xs font-bold uppercase bg-black border border-zinc-500 text-zinc-100 hover:bg-zinc-900 flex items-center gap-1" data-testid="victory-copy-link"><Link2 className="w-3 h-3" /> Link</button>
                <button type="button" onClick={() => remove(selected)} className="px-3 py-1.5 text-xs font-bold uppercase bg-black border border-red-700 text-red-300 hover:bg-red-950 flex items-center gap-1" data-testid="victory-delete"><Trash2 className="w-3 h-3" /></button>
              </div>
              <div className="border border-zinc-600 bg-zinc-950 p-3 overflow-auto" style={{ height: (format === 'story' ? 1920 : 1080) * previewScale + 24 }} data-testid="victory-card-preview">
                <div style={{ width: 1080 * previewScale, height: (format === 'story' ? 1920 : 1080) * previewScale }}>
                  <VictoryCard ref={canvasRef} card={selected} format={format} scale={previewScale} />
                </div>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">Share link: <span className="text-zinc-300" data-testid="victory-share-url">{selected.share_url}</span></p>
            </>
          ) : (
            <div className="border border-zinc-600 bg-black p-10 text-center text-sm text-zinc-400" data-testid="victory-no-selection">Select a card to preview and share it.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VictoryCardsTab;
