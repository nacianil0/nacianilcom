import { buildUrl } from '@nacianilcom/content-core';

export function articleTag(id: string): string {
  return `article:${id}`;
}

export function seriesTag(slug: string): string {
  return `series:${slug}`;
}

export const LIST_TAG = 'list';
export const SITEMAP_TAG = 'sitemap';

export function feedTag(lang: string): string {
  return `feed:${lang}`;
}

export interface RevalidateTargets {
  tags: string[];
  paths: string[];
}

/**
 * Explicit tag/path matrix for a published article.
 * Used by both Publisher (Studio) and the daily cron — single source of truth.
 * Tags are defined for future unstable_cache integration; paths drive revalidatePath today.
 */
export function articleRevalidateTargets(params: {
  articleId: string;
  seriesSlug: string;
  articleSlug: string;
}): RevalidateTargets {
  const { articleId, seriesSlug, articleSlug } = params;

  return {
    tags: [
      articleTag(articleId),
      seriesTag(seriesSlug),
      LIST_TAG,
      SITEMAP_TAG,
      feedTag('tr'),
      feedTag('en'),
    ],
    paths: [
      buildUrl('tr', 'article', { seriesSlug, articleSlug }),
      buildUrl('en', 'article', { seriesSlug, articleSlug }),
      buildUrl('tr', 'seriesLanding', { seriesSlug }),
      buildUrl('en', 'seriesLanding', { seriesSlug }),
      buildUrl('tr', 'seriesList'),
      buildUrl('en', 'seriesList'),
      '/tr',
      '/en',
      '/sitemap.xml',
      '/tr/feed.xml',
      '/en/feed.xml',
    ],
  };
}
