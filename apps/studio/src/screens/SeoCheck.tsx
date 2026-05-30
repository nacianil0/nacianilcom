import { useState, useEffect } from 'react';
import { runQC, parseMdx } from '@nacianilcom/content-core';
import type { QCReport, QCContext, ContentCatalog } from '@nacianilcom/content-core';

interface ArticleRef { id: string; meta: Record<string, unknown> }
interface SeriesItem { slug: string; series: { title: { tr: string } }; articles: ArticleRef[] }

function extractInternalLinks(content: string): Array<{ kind: string; id: string }> {
  const links: Array<{ kind: string; id: string }> = [];
  const re = /<InternalLink\s+[^>]*/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const tag = m[0];
    const kind = /kind="([^"]+)"/.exec(tag)?.[1];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    if (kind && id) links.push({ kind, id });
  }
  return links;
}

function Pill({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[9px] uppercase font-medium ${
        severity === 'blocking' ? 'bg-negative/10 text-negative' : 'bg-accent/10 text-accent'
      }`}
    >
      {severity}
    </span>
  );
}

export function SeoCheck() {
  const [list, setList] = useState<SeriesItem[]>([]);
  const [selected, setSelected] = useState<{ seriesSlug: string; articleId: string } | null>(null);
  const [reports, setReports] = useState<Record<string, QCReport>>({});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/list').then(r => r.json()).then(setList).catch(() => null);
  }, []);

  async function runCheck(seriesSlug: string, articleId: string) {
    setRunning(true);
    setError(null);
    setReports({});
    setSelected({ seriesSlug, articleId });

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

      const newReports: Record<string, QCReport> = {};

      for (const lang of langs) {
        const mdxRes = await fetch(`/api/content/${seriesSlug}/${articleId}/mdx/${lang}`);
        const { content: rawMdx } = mdxRes.ok
          ? (await mdxRes.json() as { content: string })
          : { content: '' };

        const parsed = parseMdx(rawMdx);
        const rawLinks = extractInternalLinks(parsed.content);
        const internalLinks = rawLinks.map(l => ({ kind: l.kind as 'article' | 'series' | 'case', id: l.id }));

        const ctx: QCContext = {
          meta: meta as Parameters<typeof runQC>[0]['meta'],
          taxonomy,
          references: references as Parameters<typeof runQC>[0]['references'],
          internalLinks,
          redirects,
          catalog,
          lang: lang as 'tr' | 'en',
          articlePublicPaths,
        };

        newReports[lang] = runQC(ctx, now);
      }

      setReports(newReports);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'QC check failed');
    } finally {
      setRunning(false);
    }
  }

  const groups = ['slug', 'taxonomy', 'internal-link', 'redirect', 'hreflang', 'canonical', 'references', 'content'] as const;

  return (
    <div className="flex gap-6 h-full">
      {/* Article selector */}
      <aside className="w-64 flex-shrink-0">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">Select Article</h2>
        <div className="space-y-4">
          {list.map(({ slug, series, articles }) => (
            <div key={slug}>
              <p className="mb-1 font-sans text-xs font-semibold text-ink-secondary">{series.title.tr}</p>
              <ul className="space-y-0.5">
                {articles.map(({ id }) => (
                  <li key={id}>
                    <button
                      onClick={() => runCheck(slug, id)}
                      className={`w-full rounded px-2 py-1.5 text-left font-sans text-xs transition-colors ${
                        selected?.seriesSlug === slug && selected?.articleId === id
                          ? 'bg-accent/10 text-accent'
                          : 'text-ink-secondary hover:bg-hairline/40 hover:text-ink'
                      }`}
                    >
                      {id}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Report */}
      <div className="flex-1 overflow-auto">
        {!selected && <p className="font-sans text-sm text-ink-secondary/60">Select an article to run QC.</p>}
        {running && <p className="font-sans text-sm text-ink-secondary">Running QC…</p>}
        {error && <p className="font-sans text-sm text-negative">{error}</p>}

        {Object.entries(reports).map(([lang, report]) => {
          const allIssues = [...report.blocking, ...report.warnings];
          const hasIssues = allIssues.length > 0;
          return (
            <div key={lang} className="mb-6 rounded-card border border-hairline bg-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink">
                  [{lang.toUpperCase()}]
                </h3>
                {report.blocking.length === 0 ? (
                  <span className="font-sans text-xs text-positive">✓ No blocking issues</span>
                ) : (
                  <span className="font-sans text-xs text-negative">{report.blocking.length} blocking</span>
                )}
                {report.warnings.length > 0 && (
                  <span className="font-sans text-xs text-accent">{report.warnings.length} warnings</span>
                )}
              </div>

              {hasIssues ? (
                <div className="space-y-4">
                  {groups.map(group => {
                    const issues = allIssues.filter(i => i.group === group);
                    if (issues.length === 0) return null;
                    return (
                      <div key={group}>
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60">{group}</p>
                        <ul className="space-y-1">
                          {issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 rounded bg-surface px-3 py-2">
                              <Pill severity={issue.severity} />
                              <span className="font-sans text-xs text-ink">{issue.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-sans text-xs text-ink-secondary/60">All checks passed.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
