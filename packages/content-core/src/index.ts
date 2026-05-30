// Schemas
export * from './schemas/index';

// i18n
export type { Locale, MessageKey, Messages } from './i18n';
export { formatReadingTime, formatDate, formatNumber } from './i18n';

// isPublic (single source of truth — §9 truth table)
export { isPublic } from './isPublic';

// URL helpers
export { normalizeSlug } from './url/normalizeSlug';
export { buildUrl } from './url/buildUrl';
export type { UrlKind, BuildUrlSlugs } from './url/buildUrl';

// Parse
export { parseMdx } from './parse/mdx';
export type { ParseMdxResult } from './parse/mdx';
export { parseJson } from './parse/json';
export type { ParseJsonResult } from './parse/json';

// Derive
export { calcReadingTime } from './derive/readingTime';
export { derivePrevNext, deriveSeriesPosition } from './derive/prevNext';
export type { PrevNext } from './derive/prevNext';
export { deriveCanonical } from './derive/canonical';
export type { CanonicalResult, CanonicalUrlInput, HreflangEntry } from './derive/canonical';

// Taxonomy
export { validateTaxonomy } from './taxonomy/validator';
export type { TaxonomyIssue } from './taxonomy/validator';

// Internal links
export { resolveInternalLink } from './links/resolver';
export type {
  InternalLinkKind,
  ArticleLookup,
  SeriesLookup,
  CaseLookup,
  ContentCatalog,
  LinkRef,
  ResolvedLink,
} from './links/resolver';
export { checkInternalLinks } from './links/checker';
export type { LinkIssue } from './links/checker';

// Redirects
export { resolveRedirects } from './redirects/resolver';
export type { RedirectIssue, ArticlePublicPath } from './redirects/resolver';

// QC
export { runQC } from './qc/runQC';
export type { QCContext, QCReport, QCIssue, QCGroup, QCSeverity, SvgAsset } from './qc/runQC';

// Plan QC (WP-11)
export { runPlanQC } from './qc/planQC';
export type { PlanQCIssue } from './qc/planQC';

// SVG sanitizer (WP-10)
export { sanitizeSvg } from './svg/sanitizer';
export type { SanitizeResult } from './svg/sanitizer';

// Visual block validator (WP-10)
export { parseVisualBlocks, validateVisualBlocks } from './visual/validator';
export type { VisualBlockRef, VisualBlockIssue } from './visual/validator';
