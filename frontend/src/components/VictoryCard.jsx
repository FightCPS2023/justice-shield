import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const STYLE = {
  dark: { bg: '#000000', border: '#3f3f46', headline: '#ffffff', sub: '#a1a1aa' },
  chrome: { bg: '#000000', border: '#c0c0c0', headline: '#ffffff', sub: '#c0c0c0' },
  fire: { bg: '#050000', border: '#7f1d1d', headline: '#ffffff', sub: '#fca5a5' },
};

export const VictoryCard = forwardRef(({ card, format = 'square', scale = 1 }, ref) => {
  if (!card) return null;
  const s = STYLE[card.card_style] || STYLE.chrome;
  const accent = card.accent === 'gold' ? '#d4af37' : '#dc2626';
  const tall = format === 'story';
  const W = 1080;
  const H = tall ? 1920 : 1080;

  return (
    <div
      ref={ref}
      data-testid="victory-card-canvas"
      style={{
        width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left',
        background: s.bg, color: s.headline, border: `6px solid ${s.border}`, borderRadius: 0, boxShadow: 'none',
        fontFamily: 'Oswald, Impact, "Arial Narrow", sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 56px', borderBottom: `3px solid ${s.border}`, background: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 54, height: 54, border: `4px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900 }}>⚔</div>
          <div style={{ fontSize: 44, letterSpacing: 10, fontWeight: 800 }}>JUSTICE SHIELD</div>
        </div>
        <div style={{ fontSize: 22, letterSpacing: 4, color: s.sub, fontFamily: 'ui-monospace, Menlo, monospace' }}>thecpspunisher.com</div>
      </div>

      <div style={{ height: 16, background: `repeating-linear-gradient(135deg, ${accent} 0 28px, #000 28px 56px)` }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: tall ? '80px 72px' : '48px 72px', gap: tall ? 56 : 36 }}>
        <div style={{ fontSize: 26, letterSpacing: 8, color: accent, fontWeight: 700 }}>{card.accent === 'gold' ? 'VICTORY LOGGED' : 'VIOLATION ON RECORD'}</div>
        <div style={{ fontSize: tall ? 104 : 86, lineHeight: 1.02, fontWeight: 900, textTransform: 'uppercase', wordBreak: 'break-word' }}>{card.headline}</div>
        <div style={{ fontSize: tall ? 46 : 40, color: s.sub, lineHeight: 1.25, fontWeight: 500 }}>{card.subtext}</div>
        <div style={{ width: 220, height: 6, background: accent }} />
        <div style={{ fontSize: tall ? 38 : 32, color: '#e4e4e7', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 1 }}>{card.stats_line}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '40px 56px 48px', borderTop: `3px solid ${s.border}`, gap: 30 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', maxWidth: 760 }}>
          {(card.hashtags || []).map((h) => (
            <span key={h} style={{ fontSize: 28, color: s.sub, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#fff', padding: 10 }}>
            <QRCodeSVG value={card.share_url || 'https://thecpspunisher.com'} size={tall ? 170 : 140} level="M" />
          </div>
          <span style={{ fontSize: 18, color: s.sub, fontFamily: 'ui-monospace, Menlo, monospace' }}>SCAN · VERIFY</span>
        </div>
      </div>
    </div>
  );
});

VictoryCard.displayName = 'VictoryCard';
export default VictoryCard;
