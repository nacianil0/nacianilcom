import { describe, it, expect } from 'vitest';
import { resolveRedirects } from '../redirects/resolver';
import type { ArticlePublicPath } from '../redirects/resolver';
import type { RedirectItem } from '../schemas/redirects';

const NOW = new Date('2025-06-01T12:00:00Z');
const PAST = '2024-01-01T00:00:00Z';
const FUTURE = '2026-12-31T00:00:00Z';

const publicArticles: ArticlePublicPath[] = [
  { path: '/tr/series/my-series/article-one', status: 'published', publishDate: PAST },
  { path: '/tr/series/my-series/article-draft', status: 'draft', publishDate: PAST },
  { path: '/tr/series/my-series/article-future', status: 'scheduled', publishDate: FUTURE },
];

function makeRedirect(from: string, to: string): RedirectItem {
  return { from, to, permanent: true };
}

describe('resolveRedirects (§20)', () => {
  it('valid redirect to known static route → no issues', () => {
    const issues = resolveRedirects([makeRedirect('/old-path', '/tr')], [], NOW);
    expect(issues).toHaveLength(0);
  });

  it('valid redirect to published article → no issues', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', '/tr/series/my-series/article-one')],
      publicArticles,
      NOW
    );
    expect(issues).toHaveLength(0);
  });

  it('external absolute URL → OPEN_REDIRECT blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', 'https://evil.com/steal')],
      [],
      NOW
    );
    expect(issues.some(i => i.code === 'OPEN_REDIRECT')).toBe(true);
  });

  it('protocol-relative URL → OPEN_REDIRECT blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', '//evil.com')],
      [],
      NOW
    );
    expect(issues.some(i => i.code === 'OPEN_REDIRECT')).toBe(true);
  });

  it('direct loop A→A → REDIRECT_LOOP blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/path', '/path')],
      [],
      NOW
    );
    expect(issues.some(i => i.code === 'REDIRECT_LOOP')).toBe(true);
  });

  it('chain loop A→B→A → REDIRECT_LOOP blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/a', '/tr/series/my-series/article-one'), makeRedirect('/tr/series/my-series/article-one', '/a')],
      publicArticles,
      NOW
    );
    expect(issues.some(i => i.code === 'REDIRECT_LOOP')).toBe(true);
  });

  it('redirect to draft article → REDIRECT_TO_NON_PUBLIC blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', '/tr/series/my-series/article-draft')],
      publicArticles,
      NOW
    );
    expect(issues.some(i => i.code === 'REDIRECT_TO_NON_PUBLIC')).toBe(true);
  });

  it('redirect to future-scheduled article → REDIRECT_TO_NON_PUBLIC blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', '/tr/series/my-series/article-future')],
      publicArticles,
      NOW
    );
    expect(issues.some(i => i.code === 'REDIRECT_TO_NON_PUBLIC')).toBe(true);
  });

  it('unrecognized target path → UNKNOWN_REDIRECT_TARGET blocking', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', '/some/random/path')],
      [],
      NOW
    );
    expect(issues.some(i => i.code === 'UNKNOWN_REDIRECT_TARGET')).toBe(true);
  });

  it('redirect to /en/series/my-series (known dynamic) → no issues', () => {
    const issues = resolveRedirects(
      [makeRedirect('/old', '/en/series/my-series')],
      [],
      NOW
    );
    expect(issues).toHaveLength(0);
  });

  it('empty redirects → no issues', () => {
    const issues = resolveRedirects([], [], NOW);
    expect(issues).toHaveLength(0);
  });
});
