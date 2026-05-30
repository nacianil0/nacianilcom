import type { MetadataRoute } from 'next';
import { buildUrl, isPublic } from '@nacianilcom/content-core';
import { SITE_URL } from '../src/lib/site';
import { listSeriesSlugs, listArticleIds, loadMeta } from '../src/content/loader';

function alt(trPath: string, enPath: string): MetadataRoute.Sitemap[number]['alternates'] {
  return {
    languages: {
      tr: `${SITE_URL}${trPath}`,
      en: `${SITE_URL}${enPath}`,
      'x-default': `${SITE_URL}${trPath}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Root home pages (redirect targets — included for hreflang completeness)
  entries.push({
    url: `${SITE_URL}/tr`,
    lastModified: now,
    alternates: alt('/tr', '/en'),
  });

  // Series list
  entries.push({
    url: `${SITE_URL}/tr/series`,
    lastModified: now,
    alternates: alt('/tr/series', '/en/series'),
  });

  const seriesSlugs = await listSeriesSlugs();

  for (const seriesSlug of seriesSlugs) {
    const ids = await listArticleIds(seriesSlug);
    const publicIds: string[] = [];

    for (const id of ids) {
      const meta = await loadMeta(seriesSlug, id);
      if (meta && isPublic(meta, now)) publicIds.push(id);
    }

    if (publicIds.length === 0) continue;

    // Series landing
    const trSeries = buildUrl('tr', 'seriesLanding', { seriesSlug });
    const enSeries = buildUrl('en', 'seriesLanding', { seriesSlug });
    entries.push({
      url: `${SITE_URL}${trSeries}`,
      lastModified: now,
      alternates: alt(trSeries, enSeries),
    });

    // Articles
    for (const id of publicIds) {
      const meta = await loadMeta(seriesSlug, id);
      if (!meta) continue;
      const trArt = buildUrl('tr', 'article', { seriesSlug, articleSlug: meta.slugBase });
      const enArt = buildUrl('en', 'article', { seriesSlug, articleSlug: meta.slugBase });
      entries.push({
        url: `${SITE_URL}${trArt}`,
        lastModified: new Date(meta.updatedDate ?? meta.publishDate),
        alternates: alt(trArt, enArt),
      });
    }
  }

  return entries;
}
