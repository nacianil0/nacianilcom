export type ScheduleMode = 'same-day' | 'daily' | 'weekly';

export interface ScheduleEntry {
  articleId: string;
  publishDate: string;
  status: 'published' | 'scheduled';
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function resolvePublishStatus(
  publishDate: string,
  now: Date = new Date(),
): 'published' | 'scheduled' {
  const today = now.toISOString().slice(0, 10);
  return publishDate <= today ? 'published' : 'scheduled';
}

export function computeScheduleDates(
  startDate: string,
  count: number,
  mode: ScheduleMode,
): string[] {
  if (count <= 0) return [];
  const step = mode === 'same-day' ? 0 : mode === 'daily' ? 1 : 7;
  return Array.from({ length: count }, (_, i) => addDays(startDate, i * step));
}

export function sortArticleIds(
  articleIds: string[],
  articleOrder?: string[],
): string[] {
  if (!articleOrder?.length) return [...articleIds].sort();
  const rank = new Map(articleOrder.map((id, i) => [id, i]));
  return [...articleIds].sort((a, b) => {
    const ra = rank.get(a);
    const rb = rank.get(b);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return a.localeCompare(b);
  });
}

export function buildSchedule(
  articleIds: string[],
  startDate: string,
  mode: ScheduleMode,
  now: Date = new Date(),
): ScheduleEntry[] {
  const dates = computeScheduleDates(startDate, articleIds.length, mode);
  return articleIds.map((articleId, i) => {
    const publishDate = dates[i]!;
    return {
      articleId,
      publishDate,
      status: resolvePublishStatus(publishDate, now),
    };
  });
}

export function formatScheduleMode(mode: ScheduleMode): string {
  switch (mode) {
    case 'same-day':
      return 'Hepsi aynı gün';
    case 'daily':
      return 'Günlük (art arda)';
    case 'weekly':
      return 'Haftalık';
  }
}
