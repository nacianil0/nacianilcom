import { useState, useEffect } from 'react';
import { runQC, parseMdx } from '@nacianilcom/content-core';
import type { ContentCatalog } from '@nacianilcom/content-core';

interface ArticleRef { id: string; meta: Record<string, unknown> }
interface SeriesItem { slug: string; series: { title: { tr: string } }; articles: ArticleRef[] }

function extractInternalLinks(content: string): Array<{ kind: string; id: string }> {
  const re = /<InternalLink\s+[^>]*/g;
  const links: Array<{ kind: string; id: string }> = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    const tag = m[0];
    const kind = /kind="([^"]+)"/.exec(tag)?.[1];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    if (kind && id) links.push({ kind, id });
  }
  return links;
}

export function Publisher() {
  const [list, setList] = useState<SeriesItem[]>([]);
  const [selected, setSelected] = useState<{ seriesSlug: string; articleId: string } | null>(null);
  const [blockingCount, setBlockingCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetch('/api/content/list').then(r => r.json()).then(setList).catch(() => null);
  }, []);

  async function checkAndSelect(seriesSlug: string, articleId: string) {
    setSelected({ seriesSlug, articleId });
    setBlockingCount(null);
    setResult(null);
    setChecking(true);

    try {
      const [articleData, catalog, taxonomy, redirects] = await Promise.all([
        fetch(`/api/content/${seriesSlug}/${articleId}`).then(r => r.json()),
        fetch('/api/content/catalog').then(r => r.json()) as Promise<ContentCatalog>,
        fetch('/api/content/taxonomy').then(r => r.json()),
        fetch('/api/content/redirects').then(r => r.json()),
      ]);

      const { meta, references } = articleData as { meta: Record<string, unknown>; references: unknown[] };
      const langs: string[] = Array.isArray(meta['languages']) ? meta['languages'] as string[] : ['tr', 'en'];
      const now = new Date();
      const articlePublicPaths = (catalog.articles as Array<{ seriesSlug: string; slugBase: string; status: string; publishDate: string }>).map(a => ({
        path: `/tr/series/${a.seriesSlug}/${a.slugBase}`,
        status: a.status,
        publishDate: a.publishDate,
      }));

      let totalBlocking = 0;
      for (const lang of langs) {
        const mdxRes = await fetch(`/api/content/${seriesSlug}/${articleId}/mdx/${lang}`);
        const { content: rawMdx } = mdxRes.ok ? (await mdxRes.json() as { content: string }) : { content: '' };
        const parsed = parseMdx(rawMdx);
        const internalLinks = extractInternalLinks(parsed.content).map(l => ({
          kind: l.kind as 'article' | 'series' | 'case',
          id: l.id,
        }));

        const report = runQC({
          meta: meta as Parameters<typeof runQC>[0]['meta'],
          taxonomy,
          references: references as Parameters<typeof runQC>[0]['references'],
          internalLinks,
          redirects,
          catalog,
          lang: lang as 'tr' | 'en',
          articlePublicPaths,
        }, now);

        totalBlocking += report.blocking.length;
      }

      setBlockingCount(totalBlocking);
    } catch {
      setBlockingCount(99);
    } finally {
      setChecking(false);
    }
  }

  async function publish() {
    if (!selected) return;
    setPublishing(true);
    setResult(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesSlug: selected.seriesSlug,
          articleId: selected.articleId,
          publishDate,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      setResult(data);
    } catch {
      setResult({ error: 'Publish request failed' });
    } finally {
      setPublishing(false);
    }
  }

  const canPublish = blockingCount === 0 && !checking && !publishing;

  return (
    <div className="flex gap-6 h-full">
      {/* Article selector */}
      <aside className="w-64 flex-shrink-0">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">Select Draft</h2>
        <div className="space-y-4">
          {list.map(({ slug, series, articles }) => (
            <div key={slug}>
              <p className="mb-1 font-sans text-xs font-semibold text-ink-secondary">{series.title.tr}</p>
              <ul className="space-y-0.5">
                {articles
                  .filter(a => a.meta['status'] !== 'published')
                  .map(({ id, meta }) => (
                    <li key={id}>
                      <button
                        onClick={() => checkAndSelect(slug, id)}
                        className={`w-full rounded px-2 py-1.5 text-left font-sans text-xs transition-colors ${
                          selected?.seriesSlug === slug && selected?.articleId === id
                            ? 'bg-accent/10 text-accent'
                            : 'text-ink-secondary hover:bg-hairline/40 hover:text-ink'
                        }`}
                      >
                        {id}
                        <span className="ml-1 text-ink-secondary/40">[{meta['status'] as string}]</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Publisher pane */}
      <div className="flex-1">
        {!selected && (
          <p className="font-sans text-sm text-ink-secondary/60">Select a draft article to publish.</p>
        )}

        {selected && (
          <div className="max-w-md rounded-card border border-hairline bg-card p-6 space-y-5">
            <h3 className="font-serif text-lg font-semibold text-ink">
              {selected.seriesSlug} / {selected.articleId}
            </h3>

            {/* QC status */}
            <div className="rounded bg-surface px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60 mb-1">
                QC Status
              </p>
              {checking && <p className="font-sans text-sm text-ink-secondary">Running checks…</p>}
              {!checking && blockingCount === null && (
                <p className="font-sans text-sm text-ink-secondary/60">—</p>
              )}
              {!checking && blockingCount !== null && (
                <p className={`font-sans text-sm font-medium ${blockingCount === 0 ? 'text-positive' : 'text-negative'}`}>
                  {blockingCount === 0 ? '✓ All QC checks passed' : `✗ ${blockingCount} blocking issue(s) — fix before publishing`}
                </p>
              )}
            </div>

            {/* Publish date */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60 mb-1">
                Publish Date
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={e => setPublishDate(e.target.value)}
                className="rounded border border-hairline bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Publish button */}
            <button
              onClick={publish}
              disabled={!canPublish}
              className={`w-full rounded-card px-5 py-2.5 font-sans text-sm font-medium transition-opacity ${
                canPublish
                  ? 'bg-accent text-card hover:opacity-90'
                  : 'bg-hairline text-ink-secondary cursor-not-allowed opacity-60'
              }`}
            >
              {publishing ? 'Publishing…' : 'Publish → Commit → Revalidate'}
            </button>

            {/* Result */}
            {result && (
              <p className={`font-sans text-sm ${result.ok ? 'text-positive' : 'text-negative'}`}>
                {result.ok ? '✓ Published successfully' : `✗ ${result.error ?? 'Unknown error'}`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
