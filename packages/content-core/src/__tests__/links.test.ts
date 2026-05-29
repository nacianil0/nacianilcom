import { describe, it, expect } from 'vitest';
import { resolveInternalLink } from '../links/resolver';
import { checkInternalLinks } from '../links/checker';
import type { ContentCatalog } from '../links/resolver';

const NOW = new Date('2025-06-01T12:00:00Z');
const PAST = '2024-01-01T00:00:00Z';
const FUTURE = '2026-12-31T00:00:00Z';

const catalog: ContentCatalog = {
  articles: [
    { id: 'article-1', seriesSlug: 'my-series', slugBase: 'article-one', status: 'published', publishDate: PAST },
    { id: 'article-2', seriesSlug: 'my-series', slugBase: 'article-two', status: 'draft', publishDate: PAST },
    { id: 'article-3', seriesSlug: 'my-series', slugBase: 'article-three', status: 'scheduled', publishDate: FUTURE },
  ],
  series: [{ slug: 'my-series' }],
  cases: [{ slug: 'my-case' }],
};

describe('resolveInternalLink', () => {
  it('resolves published article to correct URL', () => {
    const result = resolveInternalLink('article', 'article-1', 'tr', catalog);
    expect(result?.url).toBe('/tr/series/my-series/article-one');
    expect(result?.status).toBe('published');
  });

  it('resolves published article in EN', () => {
    const result = resolveInternalLink('article', 'article-1', 'en', catalog);
    expect(result?.url).toBe('/en/series/my-series/article-one');
  });

  it('returns null for unknown article id', () => {
    expect(resolveInternalLink('article', 'nonexistent', 'tr', catalog)).toBeNull();
  });

  it('resolves series landing page', () => {
    const result = resolveInternalLink('series', 'my-series', 'tr', catalog);
    expect(result?.url).toBe('/tr/series/my-series');
  });

  it('resolves case study URL', () => {
    const result = resolveInternalLink('case', 'my-case', 'tr', catalog);
    expect(result?.url).toBe('/tr/work/my-case');
  });

  it('returns null for unknown series slug', () => {
    expect(resolveInternalLink('series', 'unknown-series', 'tr', catalog)).toBeNull();
  });
});

describe('checkInternalLinks — draft/scheduled target blocking (§17)', () => {
  it('link to published article → no issues', () => {
    const issues = checkInternalLinks(
      [{ kind: 'article', id: 'article-1' }],
      'tr',
      catalog,
      NOW
    );
    expect(issues).toHaveLength(0);
  });

  it('link to draft article → blocking issue', () => {
    const issues = checkInternalLinks(
      [{ kind: 'article', id: 'article-2' }],
      'tr',
      catalog,
      NOW
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('LINK_TO_NON_PUBLIC');
  });

  it('link to scheduled future article → blocking issue', () => {
    const issues = checkInternalLinks(
      [{ kind: 'article', id: 'article-3' }],
      'tr',
      catalog,
      NOW
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('LINK_TO_NON_PUBLIC');
  });

  it('link to nonexistent article → BROKEN_INTERNAL_LINK', () => {
    const issues = checkInternalLinks(
      [{ kind: 'article', id: 'ghost-article' }],
      'tr',
      catalog,
      NOW
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('BROKEN_INTERNAL_LINK');
  });

  it('multiple links — mixed issues', () => {
    const issues = checkInternalLinks(
      [
        { kind: 'article', id: 'article-1' },
        { kind: 'article', id: 'article-2' },
        { kind: 'article', id: 'ghost-article' },
      ],
      'tr',
      catalog,
      NOW
    );
    expect(issues).toHaveLength(2);
  });

  it('link to series always resolves (series have no publish status)', () => {
    const issues = checkInternalLinks(
      [{ kind: 'series', id: 'my-series' }],
      'tr',
      catalog,
      NOW
    );
    expect(issues).toHaveLength(0);
  });
});
