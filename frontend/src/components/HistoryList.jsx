import React from 'react';
import { History, Loader2 } from 'lucide-react';

export const HistoryList = ({
  title,
  items,
  loading,
  total,
  emptyTitle,
  emptyHint,
  ctaLabel,
  onCta,
  renderItem,
  onLoadMore,
  testId,
}) => (
  <section className="border border-zinc-600 bg-black" data-testid={testId}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
      <h2 className="text-base md:text-lg font-bold uppercase tracking-wide flex items-center gap-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
        <History className="w-4 h-4 text-zinc-300" /> {title}
      </h2>
      <span className="text-xs font-mono text-zinc-400" data-testid={`${testId}-count`}>{total ?? items.length} total</span>
    </div>
    {loading && items.length === 0 ? (
      <div className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-zinc-400 font-mono" data-testid={`${testId}-loading`}>
        <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
      </div>
    ) : items.length === 0 ? (
      <div className="px-4 py-10 text-center" data-testid={`${testId}-empty`}>
        <p className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">{emptyTitle}</p>
        <p className="text-xs text-zinc-500 mt-1 font-mono">{emptyHint}</p>
        {onCta && (
          <button type="button" onClick={onCta} className="mt-4 px-4 py-2 bg-zinc-200 text-black text-xs font-bold uppercase tracking-wide hover:bg-white" data-testid={`${testId}-cta`}>
            {ctaLabel}
          </button>
        )}
      </div>
    ) : (
      <div className="divide-y divide-zinc-800">
        {items.map((item, i) => (
          <div key={item.session_id || item.request_id || item.id || i} className="px-4 py-3 hover:bg-zinc-900/60" data-testid={`${testId}-item-${i}`}>
            {renderItem(item)}
          </div>
        ))}
        {onLoadMore && total > items.length && (
          <button type="button" onClick={onLoadMore} className="w-full py-2 text-xs font-mono text-zinc-300 hover:bg-zinc-900 border-t border-zinc-700" data-testid={`${testId}-more`}>
            Load more ({total - items.length} remaining)
          </button>
        )}
      </div>
    )}
  </section>
);

export default HistoryList;
