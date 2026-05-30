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

interface YearMonth {
  y: number;
  m: number;
}

function parseYearMonth(ym: string): YearMonth | null {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  return { y, m };
}

/** Whole months from `start` to `end` (or now if ongoing). Null on bad/missing data. */
function monthsBetween(start: string, end: string | undefined, now: Date): number | null {
  const s = parseYearMonth(start);
  if (!s) return null;
  const e = end ? parseYearMonth(end) : { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 };
  if (!e) return null;
  return (e.y - s.y) * 12 + (e.m - s.m);
}

/**
 * Human-readable length of a single role, computed from the dates — never typed
 * by hand. Ongoing roles (no end) are measured to today.
 *   TR: "4 yıl 5 ay" · "1 yıl" · "3 ay" · "1 aydan az"
 *   EN: "4 yrs 5 mos" · "1 yr" · "3 mos" · "less than 1 mo"
 * Returns null when the dates are missing/invalid so callers can hide it safely.
 */
export function fmtDuration(
  start: string,
  end: string | undefined,
  locale: Locale,
  now: Date = new Date(),
): string | null {
  const months = monthsBetween(start, end, now);
  if (months === null) return null;
  if (months < 1) return locale === 'tr' ? '1 aydan az' : 'less than 1 mo';

  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];

  if (locale === 'tr') {
    if (years) parts.push(`${years} yıl`);
    if (rem) parts.push(`${rem} ay`);
  } else {
    if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
    if (rem) parts.push(`${rem} ${rem === 1 ? 'mo' : 'mos'}`);
  }
  return parts.join(' ');
}

/**
 * Floored total professional experience, summed across roles so gaps don't
 * inflate it, e.g. "5+ yıl" / "5+ yrs". Null if it can't be computed or < 1y.
 */
export function fmtTotalExperience(
  ranges: ReadonlyArray<{ startDate: string; endDate?: string | undefined }>,
  locale: Locale,
  now: Date = new Date(),
): string | null {
  let totalMonths = 0;
  let counted = 0;
  for (const r of ranges) {
    const m = monthsBetween(r.startDate, r.endDate, now);
    if (m !== null && m > 0) {
      totalMonths += m;
      counted += 1;
    }
  }
  if (counted === 0) return null;
  const years = Math.floor(totalMonths / 12);
  if (years < 1) return null;
  return locale === 'tr' ? `${years}+ yıl` : `${years}+ yrs`;
}
