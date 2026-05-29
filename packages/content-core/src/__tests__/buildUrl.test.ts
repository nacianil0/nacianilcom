import { describe, it, expect } from 'vitest';
import { buildUrl } from '../url/buildUrl';

describe('buildUrl — TR/EN stable URLs (§20)', () => {
  it('home TR', () => expect(buildUrl('tr', 'home')).toBe('/tr'));
  it('home EN', () => expect(buildUrl('en', 'home')).toBe('/en'));

  it('seriesList TR', () => expect(buildUrl('tr', 'seriesList')).toBe('/tr/series'));
  it('seriesList EN', () => expect(buildUrl('en', 'seriesList')).toBe('/en/series'));

  it('seriesLanding TR uses same slug', () =>
    expect(buildUrl('tr', 'seriesLanding', { seriesSlug: 'my-series' })).toBe(
      '/tr/series/my-series'
    ));
  it('seriesLanding EN uses same slug', () =>
    expect(buildUrl('en', 'seriesLanding', { seriesSlug: 'my-series' })).toBe(
      '/en/series/my-series'
    ));

  it('article TR uses same slugBase', () =>
    expect(
      buildUrl('tr', 'article', { seriesSlug: 'my-series', articleSlug: 'my-article' })
    ).toBe('/tr/series/my-series/my-article'));
  it('article EN uses same slugBase', () =>
    expect(
      buildUrl('en', 'article', { seriesSlug: 'my-series', articleSlug: 'my-article' })
    ).toBe('/en/series/my-series/my-article'));

  it('TR/EN article slugBase is identical (§20 ortak slugBase)', () => {
    const slug = { seriesSlug: 'my-series', articleSlug: 'my-article' };
    const trUrl = buildUrl('tr', 'article', slug);
    const enUrl = buildUrl('en', 'article', slug);
    const trParts = trUrl.split('/').slice(2);
    const enParts = enUrl.split('/').slice(2);
    expect(trParts).toEqual(enParts);
  });

  it('cv TR', () => expect(buildUrl('tr', 'cv')).toBe('/tr/cv'));
  it('cv EN', () => expect(buildUrl('en', 'cv')).toBe('/en/cv'));
  it('cvPrint TR', () => expect(buildUrl('tr', 'cvPrint')).toBe('/tr/cv/print'));
  it('work TR', () => expect(buildUrl('tr', 'work')).toBe('/tr/work'));

  it('workCase TR', () =>
    expect(buildUrl('tr', 'workCase', { caseSlug: 'my-case' })).toBe('/tr/work/my-case'));
  it('workCase EN', () =>
    expect(buildUrl('en', 'workCase', { caseSlug: 'my-case' })).toBe('/en/work/my-case'));

  it('feed TR', () => expect(buildUrl('tr', 'feed')).toBe('/tr/feed.xml'));
  it('feed EN', () => expect(buildUrl('en', 'feed')).toBe('/en/feed.xml'));

  it('throws when seriesLanding missing seriesSlug', () =>
    expect(() => buildUrl('tr', 'seriesLanding', {})).toThrow());
  it('throws when article missing slugs', () =>
    expect(() => buildUrl('tr', 'article', { seriesSlug: 'x' })).toThrow());
  it('throws when workCase missing caseSlug', () =>
    expect(() => buildUrl('tr', 'workCase', {})).toThrow());
});
