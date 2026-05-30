import { describe, it, expect } from 'vitest';
import {
  articleRevalidateTargets,
  articleTag,
  seriesTag,
  feedTag,
  LIST_TAG,
  SITEMAP_TAG,
} from '../lib/revalidate-targets';

describe('tag helpers', () => {
  it('articleTag returns correct format', () => {
    expect(articleTag('abc-123')).toBe('article:abc-123');
  });

  it('seriesTag returns correct format', () => {
    expect(seriesTag('my-series')).toBe('series:my-series');
  });

  it('feedTag returns correct format', () => {
    expect(feedTag('tr')).toBe('feed:tr');
    expect(feedTag('en')).toBe('feed:en');
  });

  it('LIST_TAG and SITEMAP_TAG are defined', () => {
    expect(LIST_TAG).toBe('list');
    expect(SITEMAP_TAG).toBe('sitemap');
  });
});

describe('articleRevalidateTargets', () => {
  const params = {
    articleId: 'test-article-id',
    seriesSlug: 'my-series',
    articleSlug: 'my-article',
  };

  const targets = articleRevalidateTargets(params);

  it('tags include article, series, list, sitemap, and both feeds', () => {
    expect(targets.tags).toContain(articleTag('test-article-id'));
    expect(targets.tags).toContain(seriesTag('my-series'));
    expect(targets.tags).toContain(LIST_TAG);
    expect(targets.tags).toContain(SITEMAP_TAG);
    expect(targets.tags).toContain(feedTag('tr'));
    expect(targets.tags).toContain(feedTag('en'));
  });

  it('paths include TR and EN article URLs', () => {
    const trArticle = targets.paths.find(p => p.includes('/tr/') && p.includes('my-article'));
    const enArticle = targets.paths.find(p => p.includes('/en/') && p.includes('my-article'));
    expect(trArticle).toBeDefined();
    expect(enArticle).toBeDefined();
  });

  it('paths include series landing for both languages', () => {
    const trSeries = targets.paths.find(p => p.includes('/tr/') && p.includes('my-series'));
    const enSeries = targets.paths.find(p => p.includes('/en/') && p.includes('my-series'));
    expect(trSeries).toBeDefined();
    expect(enSeries).toBeDefined();
  });

  it('paths include series list, home, sitemap, and per-lang feeds', () => {
    expect(targets.paths.some(p => p.endsWith('/series'))).toBe(true);
    expect(targets.paths).toContain('/tr');
    expect(targets.paths).toContain('/en');
    expect(targets.paths).toContain('/sitemap.xml');
    expect(targets.paths).toContain('/tr/feed.xml');
    expect(targets.paths).toContain('/en/feed.xml');
  });

  it('different articles produce different article tags and paths', () => {
    const other = articleRevalidateTargets({
      articleId: 'other-id',
      seriesSlug: 'my-series',
      articleSlug: 'other-article',
    });
    expect(other.tags).toContain(articleTag('other-id'));
    expect(other.tags).not.toContain(articleTag('test-article-id'));
  });
});

// isPublic truth table — ensures scheduled/draft content stays private.
// Tests here exercise the filtering logic used by loader, cron, and all pages.
describe('isPublic — scheduled content visibility', () => {
  // Dynamic import avoids Next.js module resolution in vitest
  it('published + past date is public', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'published', publishDate: '2000-01-01' }, new Date())).toBe(true);
  });

  it('scheduled + past date is public (time has come)', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'scheduled', publishDate: '2000-01-01' }, new Date())).toBe(true);
  });

  it('scheduled + future date is NOT public', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'scheduled', publishDate: '2099-01-01' }, new Date())).toBe(false);
  });

  it('draft is never public regardless of date', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'draft', publishDate: '2000-01-01' }, new Date())).toBe(false);
    expect(isPublic({ status: 'draft', publishDate: '2099-01-01' }, new Date())).toBe(false);
  });
});
