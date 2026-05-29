import { buildUrl } from '../url/buildUrl';
import type { Locale } from '../i18n';

export type InternalLinkKind = 'article' | 'series' | 'case';

export interface ArticleLookup {
  id: string;
  seriesSlug: string;
  slugBase: string;
  status: string;
  publishDate: string;
}

export interface SeriesLookup {
  slug: string;
}

export interface CaseLookup {
  slug: string;
}

export interface ContentCatalog {
  articles: ArticleLookup[];
  series: SeriesLookup[];
  cases: CaseLookup[];
}

export interface LinkRef {
  kind: InternalLinkKind;
  id: string;
}

export interface ResolvedLink {
  url: string;
  status: string;
  publishDate: string;
}

export function resolveInternalLink(
  kind: InternalLinkKind,
  id: string,
  lang: Locale,
  catalog: ContentCatalog
): ResolvedLink | null {
  if (kind === 'article') {
    const article = catalog.articles.find(a => a.id === id);
    if (!article) return null;
    return {
      url: buildUrl(lang, 'article', {
        seriesSlug: article.seriesSlug,
        articleSlug: article.slugBase,
      }),
      status: article.status,
      publishDate: article.publishDate,
    };
  }
  if (kind === 'series') {
    const series = catalog.series.find(s => s.slug === id);
    if (!series) return null;
    return {
      url: buildUrl(lang, 'seriesLanding', { seriesSlug: series.slug }),
      status: 'published',
      publishDate: '2000-01-01',
    };
  }
  if (kind === 'case') {
    const cas = catalog.cases.find(c => c.slug === id);
    if (!cas) return null;
    return {
      url: buildUrl(lang, 'workCase', { caseSlug: cas.slug }),
      status: 'published',
      publishDate: '2000-01-01',
    };
  }
  return null;
}
