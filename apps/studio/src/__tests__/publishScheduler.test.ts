import { describe, it, expect } from 'vitest';
import {
  addDays,
  buildSchedule,
  computeScheduleDates,
  resolvePublishStatus,
  sortArticleIds,
} from '../lib/publishScheduler';

describe('publishScheduler', () => {
  it('addDays advances calendar dates', () => {
    expect(addDays('2026-06-01', 1)).toBe('2026-06-02');
    expect(addDays('2026-06-01', 7)).toBe('2026-06-08');
  });

  it('computeScheduleDates for modes', () => {
    expect(computeScheduleDates('2026-06-01', 3, 'same-day')).toEqual([
      '2026-06-01',
      '2026-06-01',
      '2026-06-01',
    ]);
    expect(computeScheduleDates('2026-06-01', 3, 'daily')).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
    expect(computeScheduleDates('2026-06-01', 2, 'weekly')).toEqual([
      '2026-06-01',
      '2026-06-08',
    ]);
  });

  it('resolvePublishStatus compares dates only', () => {
    const now = new Date('2026-06-05T10:00:00.000Z');
    expect(resolvePublishStatus('2026-06-05', now)).toBe('published');
    expect(resolvePublishStatus('2026-06-04', now)).toBe('published');
    expect(resolvePublishStatus('2026-06-06', now)).toBe('scheduled');
  });

  it('sortArticleIds respects series articleOrder', () => {
    const order = ['03-c', '01-a', '02-b'];
    expect(sortArticleIds(['02-b', '01-a', '03-c'], order)).toEqual(['03-c', '01-a', '02-b']);
  });

  it('buildSchedule assigns status per date', () => {
    const now = new Date('2026-06-01T10:00:00.000Z');
    const plan = buildSchedule(['a', 'b'], '2026-06-01', 'daily', now);
    expect(plan).toEqual([
      { articleId: 'a', publishDate: '2026-06-01', status: 'published' },
      { articleId: 'b', publishDate: '2026-06-02', status: 'scheduled' },
    ]);
  });
});
