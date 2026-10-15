import React, { useEffect, useState } from 'react';
import { API_URL } from '../lib/api';
import { VictoryCard } from './VictoryCard';

export default function VictoryPublicPage({ token }) {
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState(Math.min(window.innerWidth - 32, 720));

  useEffect(() => {
    fetch(`${API_URL}/api/victory-cards/public/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Card not found'))))
      .then(setCard)
      .catch((e) => setError(e.message));
    const onResize = () => setWidth(Math.min(window.innerWidth - 32, 720));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [token]);

  const scale = width / 1080;
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8 gap-6" data-testid="victory-public-page">
      <div className="text-xs font-mono tracking-[0.4em] text-zinc-400">JUSTICE SHIELD · THE CPS PUNISHER</div>
      {error && <p className="text-red-400 font-mono" data-testid="victory-public-error">{error}</p>}
      {card && (
        <div style={{ width, height: 1080 * scale }}>
          <VictoryCard card={card} format="square" scale={scale} />
        </div>
      )}
      <a href="/" className="px-5 py-2 bg-zinc-200 text-black text-sm font-bold uppercase tracking-wide hover:bg-white" data-testid="victory-public-cta">
        Defend your family — thecpspunisher.com
      </a>
    </div>
  );
}
