import { buildUrl } from '../url/buildUrl';
import type { Locale } from '../i18n';
import type { UrlKind } from '../url/buildUrl';

export interface HreflangEntry {
  lang: string;
  url: string;
}

export interface CanonicalResult {
  canonical: string;
  hreflang: HreflangEntry[];
}

type ArticleInput = { kind: 'article'; seriesSlug: string; articleSlug: string };
type SeriesInput = { kind: 'seriesLanding'; seriesSlug: string };
type WorkCaseInput = { kind: 'workCase'; caseSlug: string };
type SimpleInput = { kind: Exclude<UrlKind, 'article' | 'seriesLanding' | 'workCase'> };

export type CanonicalUrlInput = ArticleInput | SeriesInput | WorkCaseInput | SimpleInput;

function getUrlForLang(lang: Locale, input: CanonicalUrlInput): string {
  if (input.kind === 'article') {
    return buildUrl(lang, 'article', {
      seriesSlug: input.seriesSlug,
      articleSlug: input.articleSlug,
    });
  }
  if (input.kind === 'seriesLanding') {
    return buildUrl(lang, 'seriesLanding', { seriesSlug: input.seriesSlug });
  }
  if (input.kind === 'workCase') {
    return buildUrl(lang, 'workCase', { caseSlug: input.caseSlug });
  }
  return buildUrl(lang, input.kind);
}

export function deriveCanonical(
  currentLang: Locale,
  input: CanonicalUrlInput,
  availableLangs: Locale[]
): CanonicalResult {
  const canonical = getUrlForLang(currentLang, input);
  const hreflang: HreflangEntry[] = availableLangs.map(lang => ({
    lang,
    url: getUrlForLang(lang, input),
  }));
  hreflang.push({ lang: 'x-default', url: getUrlForLang('tr', input) });
  return { canonical, hreflang };
}
