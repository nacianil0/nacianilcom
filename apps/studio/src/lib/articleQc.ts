import { runQC, parseMdx } from '@nacianilcom/content-core';
import type { ContentCatalog } from '@nacianilcom/content-core';

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

export interface ArticleQcResult {
  blockingCount: number;
  issues: string[];
}

export async function runArticleQc(
  seriesSlug: string,
  articleId: string,
): Promise<ArticleQcResult> {
  const [articleData, catalog, taxonomy, redirects] = await Promise.all([
    fetch(`/api/content/${seriesSlug}/${articleId}`).then(r => r.json()),
    fetch('/api/content/catalog').then(r => r.json()) as Promise<ContentCatalog>,
    fetch('/api/content/taxonomy').then(r => r.json()),
    fetch('/api/content/redirects').then(r => r.json()),
  ]);

  const { meta, references } = articleData as { meta: Record<string, unknown>; references: unknown[] };
  const langs: string[] = Array.isArray(meta['languages']) ? (meta['languages'] as string[]) : ['tr', 'en'];
  const now = new Date();
  const articlePublicPaths = (
    catalog.articles as Array<{ seriesSlug: string; slugBase: string; status: string; publishDate: string }>
  ).map(a => ({
    path: `/tr/series/${a.seriesSlug}/${a.slugBase}`,
    status: a.status,
    publishDate: a.publishDate,
  }));

  let blockingCount = 0;
  const issues: string[] = [];

  for (const lang of langs) {
    const mdxRes = await fetch(`/api/content/${seriesSlug}/${articleId}/mdx/${lang}`);
    const { content: rawMdx } = mdxRes.ok
      ? ((await mdxRes.json()) as { content: string })
      : { content: '' };
    const parsed = parseMdx(rawMdx);
    const internalLinks = extractInternalLinks(parsed.content).map(l => ({
      kind: l.kind as 'article' | 'series' | 'case',
      id: l.id,
    }));
    const report = runQC(
      {
        meta: meta as Parameters<typeof runQC>[0]['meta'],
        taxonomy,
        references: references as Parameters<typeof runQC>[0]['references'],
        internalLinks,
        redirects,
        catalog,
        lang: lang as 'tr' | 'en',
        articlePublicPaths,
      },
      now,
    );
    blockingCount += report.blocking.length;
    for (const issue of report.blocking) {
      issues.push(`[${lang}] ${issue.code}: ${issue.message}`);
    }
  }

  return { blockingCount, issues };
}
