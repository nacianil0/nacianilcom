import { useState, useEffect, useCallback } from 'react';

interface InboxEntry {
  filename: string;
  kind?: string;
  status?: string;
  source?: string;
  createdAt?: string;
  target?: string;
  backupPath?: string;
  reviewReason?: string;
  targetMonth?: string;
  seriesSlug?: string;
  articleId?: string;
  language?: string;
}

const STATUS_ORDER: Record<string, number> = {
  needsReview: 0,
  detected: 1,
  failed: 2,
  routed: 3,
};

const STATUS_BADGE: Record<string, string> = {
  detected: 'bg-amber-100 text-amber-800',
  routed: 'bg-green-100 text-green-800',
  needsReview: 'bg-red-100 text-red-800',
  failed: 'bg-red-200 text-red-900',
};

export function Inbox() {
  const [items, setItems] = useState<InboxEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [routingId, setRoutingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/inbox').catch(() => null);
    if (res?.ok) {
      const data = (await res.json()) as InboxEntry[];
      const sorted = [...data].sort((a, b) => {
        const ao = STATUS_ORDER[a.status ?? 'detected'] ?? 99;
        const bo = STATUS_ORDER[b.status ?? 'detected'] ?? 99;
        return ao - bo;
      });
      setItems(sorted);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => { void refresh(); }, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function route(filename: string) {
    setRoutingId(filename);
    setMessage(null);
    const bare = filename.replace(/^unresolved\//, '');
    const endpoint = filename.startsWith('unresolved/')
      ? `/api/inbox/unresolved/${bare}/route`
      : `/api/inbox/${filename}/route`;
    const res = await fetch(endpoint, { method: 'POST' }).catch(() => null);
    if (res?.ok) {
      const data = (await res.json()) as { target?: string; backup?: string };
      let text = `Routed → ${data.target ?? '?'}`;
      if (data.backup) text += `  (backup: ${data.backup})`;
      setMessage({ text, ok: true });
    } else {
      const err = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
      setMessage({ text: err.error ?? 'Routing failed', ok: false });
    }
    setRoutingId(null);
    void refresh();
  }

  async function discard(filename: string) {
    await fetch(`/api/inbox/${filename}`, { method: 'DELETE' }).catch(() => null);
    void refresh();
  }

  const count = {
    needsReview: items.filter(i => i.status === 'needsReview').length,
    detected: items.filter(i => i.status === 'detected').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink">AI Output Inbox</h2>
          <p className="font-sans text-xs text-ink-secondary/60">
            Drop JSON files into{' '}
            <code className="font-mono text-[11px] bg-hairline/40 px-1 rounded">content/_inbox/</code>
            {' '}— router classifies and routes automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {count.needsReview > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-mono text-[10px] text-red-700">
              {count.needsReview} needs review
            </span>
          )}
          {count.detected > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] text-amber-700">
              {count.detected} pending
            </span>
          )}
          <button
            onClick={() => { void refresh(); }}
            disabled={loading}
            className="rounded border border-hairline px-3 py-1 font-sans text-xs text-ink-secondary hover:border-ink-secondary/40 hover:text-ink transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Flash message */}
      {message && (
        <div
          className={`rounded border px-3 py-2 font-sans text-xs ${
            message.ok
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Item list */}
      {items.length === 0 && !loading && (
        <div className="rounded-card border border-hairline bg-card p-8 text-center">
          <p className="font-sans text-sm text-ink-secondary/60">
            Inbox is empty. Drop a JSON file into{' '}
            <code className="font-mono text-xs">content/_inbox/</code> to get started.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {items.map(item => (
          <li
            key={item.filename}
            className="rounded-card border border-hairline bg-card p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Kind + filename */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-ink">
                    {item.kind ?? '?'}
                  </span>
                  <span className="font-mono text-[10px] text-ink-secondary/50 truncate max-w-[240px]">
                    {item.filename}
                  </span>
                  {item.status && (
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                        STATUS_BADGE[item.status] ?? 'bg-hairline text-ink-secondary'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>

                {/* Routing hints */}
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[10px] text-ink-secondary/60">
                  {item.targetMonth && <span>month: {item.targetMonth}</span>}
                  {item.seriesSlug && <span>series: {item.seriesSlug}</span>}
                  {item.articleId && <span>article: {item.articleId}</span>}
                  {item.language && <span>lang: {item.language}</span>}
                  {item.source && <span>src: {item.source}</span>}
                  {item.createdAt && <span>{item.createdAt.slice(0, 10)}</span>}
                </div>

                {/* Target / backup / review reason */}
                {item.target && (
                  <p className="mt-1 font-mono text-[10px] text-green-700 truncate">
                    → {item.target}
                  </p>
                )}
                {item.backupPath && (
                  <p className="font-mono text-[10px] text-amber-700 truncate">
                    backup: {item.backupPath}
                  </p>
                )}
                {item.reviewReason && (
                  <p className="mt-1 font-sans text-xs text-red-700">{item.reviewReason}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status !== 'routed' && (
                  <button
                    onClick={() => { void route(item.filename); }}
                    disabled={routingId === item.filename}
                    className="rounded border border-accent/40 px-2.5 py-1 font-sans text-xs text-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
                  >
                    {routingId === item.filename ? 'Routing…' : 'Route'}
                  </button>
                )}
                {item.status !== 'routed' && (
                  <button
                    onClick={() => { void discard(item.filename); }}
                    className="rounded border border-hairline px-2.5 py-1 font-sans text-xs text-ink-secondary/60 hover:border-negative/40 hover:text-negative transition-colors"
                  >
                    Discard
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
