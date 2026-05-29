/** Supported UI locales (§23) */
export type Locale = 'tr' | 'en';

/** All message keys used across web and studio (§23). */
export type MessageKey =
  | 'readingTime'
  | 'readingTimeMinutes'
  | 'previousArticle'
  | 'nextArticle'
  | 'references'
  | 'seriesPosition'
  | 'publishDate'
  | 'updatedDate'
  | 'cv'
  | 'projects'
  | 'copyCode'
  | 'codeCopied'
  | 'backToSeries'
  | 'series';

export type Messages = Record<MessageKey, string>;

/**
 * Format a reading-time number using Intl.
 * e.g. formatReadingTime(5, 'tr') → "5 dk"
 */
export function formatReadingTime(minutes: number, locale: Locale): string {
  const rounded = Math.max(1, Math.round(minutes));
  return locale === 'tr' ? `${rounded} dk` : `${rounded} min`;
}

/**
 * Format a publish/update date using Intl.
 * e.g. formatDate('2025-03-01', 'tr') → "1 Mart 2025"
 */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

/**
 * Format a number with locale-appropriate separators.
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US').format(value);
}
