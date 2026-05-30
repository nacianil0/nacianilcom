import { isPublic, buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import {
  listSeriesSlugs,
  listArticleIds,
  loadMeta,
  loadMdx,
} from '../../../src/content/loader';
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from '../../../src/lib/site';

const VALID_LANGS = new Set(['tr', 'en']);

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string }> }
): Promise<Response> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) {
    return new Response('Not Found', { status: 404 });
  }

  const locale = lang as Locale;
  const now = new Date();
  const itemXmls: string[] = [];

  const seriesSlugs = await listSeriesSlugs();
  for (const seriesSlug of seriesSlugs) {
    const ids = await listArticleIds(seriesSlug);
    for (const id of ids) {
      const meta = await loadMeta(seriesSlug, id);
      if (!meta || !isPublic(meta, now)) continue;
      if (!meta.languages.includes(locale)) continue;

      const mdx = await loadMdx(seriesSlug, id, lang);
      if (!mdx) continue;

      const articleUrl = `${SITE_URL}${buildUrl(locale, 'article', {
        seriesSlug,
        articleSlug: meta.slugBase,
      })}`;

      itemXmls.push(
        `    <item>\n` +
          `      <title>${esc(mdx.frontmatter.title)}</title>\n` +
          `      <link>${articleUrl}</link>\n` +
          `      <description>${esc(mdx.frontmatter.summary)}</description>\n` +
          `      <pubDate>${rfc822(meta.publishDate)}</pubDate>\n` +
          `      <guid isPermaLink="true">${articleUrl}</guid>\n` +
          `    </item>`
      );
    }
  }

  const feedUrl = `${SITE_URL}${buildUrl(locale, 'feed')}`;
  const homeUrl = `${SITE_URL}${buildUrl(locale, 'home')}`;
  const chanDesc = locale === 'tr' ? `${SITE_NAME} — Yazılar` : `${SITE_NAME} — Articles`;

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${esc(SITE_NAME)}</title>\n` +
    `    <link>${homeUrl}</link>\n` +
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />\n` +
    `    <description>${esc(chanDesc)}</description>\n` +
    `    <language>${locale}</language>\n` +
    `    <managingEditor>${SITE_AUTHOR}</managingEditor>\n` +
    (itemXmls.length > 0 ? itemXmls.join('\n') + '\n' : '') +
    `  </channel>\n` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
