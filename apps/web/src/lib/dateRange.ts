import type { Locale } from '@nacianilcom/content-core';

/** Format a "YYYY-MM" (or "YYYY") string as a short localized month-year. */
export function fmtMonth(ym: string, locale: Locale): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y) return ym;
  if (!m) return String(y);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/** Format an experience date range, e.g. "May 2021 — Oct 2025" / "Mar 2026 — Present". */
export function fmtRange(start: string, end: string | undefined, locale: Locale): string {
  const present = locale === 'tr' ? 'Halen' : 'Present';
  return `${fmtMonth(start, locale)} — ${end ? fmtMonth(end, locale) : present}`;
}
