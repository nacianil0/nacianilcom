import type { Locale } from '../i18n';

export type UrlKind =
  | 'home'
  | 'seriesList'
  | 'seriesLanding'
  | 'article'
  | 'cv'
  | 'cvPrint'
  | 'work'
  | 'workCase'
  | 'feed';

export interface BuildUrlSlugs {
  seriesSlug?: string;
  articleSlug?: string;
  caseSlug?: string;
}

export function buildUrl(lang: Locale, kind: UrlKind, slugs?: BuildUrlSlugs): string {
  const base = `/${lang}`;
  switch (kind) {
    case 'home':
      return base;
    case 'seriesList':
      return `${base}/series`;
    case 'seriesLanding': {
      const s = slugs?.seriesSlug;
      if (!s) throw new Error('seriesSlug required for seriesLanding');
      return `${base}/series/${s}`;
    }
    case 'article': {
      const s = slugs?.seriesSlug;
      const a = slugs?.articleSlug;
      if (!s || !a) throw new Error('seriesSlug and articleSlug required for article');
      return `${base}/series/${s}/${a}`;
    }
    case 'cv':
      return `${base}/cv`;
    case 'cvPrint':
      return `${base}/cv/print`;
    case 'work':
      return `${base}/work`;
    case 'workCase': {
      const c = slugs?.caseSlug;
      if (!c) throw new Error('caseSlug required for workCase');
      return `${base}/work/${c}`;
    }
    case 'feed':
      return `${base}/feed.xml`;
  }
}
