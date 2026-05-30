import { describe, it, expect } from 'vitest';
import { createHmac, timingSafeEqual } from 'crypto';

// ─── Open Redirect Guard ──────────────────────────────────────────────────────

describe('open-redirect guard (resolveRedirects)', () => {
  it('flags http:// destination as OPEN_REDIRECT', async () => {
    const { resolveRedirects } = await import('@nacianilcom/content-core');
    const issues = resolveRedirects(
      [{ from: '/old', to: 'https://evil.com', permanent: true }],
      [],
      new Date(),
    );
    expect(issues.some(i => i.code === 'OPEN_REDIRECT')).toBe(true);
  });

  it('flags protocol-relative // destination as OPEN_REDIRECT', async () => {
    const { resolveRedirects } = await import('@nacianilcom/content-core');
    const issues = resolveRedirects(
      [{ from: '/bad', to: '//evil.com/steal', permanent: true }],
      [],
      new Date(),
    );
    expect(issues.some(i => i.code === 'OPEN_REDIRECT')).toBe(true);
  });

  it('allows internal relative destination', async () => {
    const { resolveRedirects } = await import('@nacianilcom/content-core');
    const issues = resolveRedirects(
      [{ from: '/old-path', to: '/tr/series', permanent: true }],
      [],
      new Date(),
    );
    expect(issues.find(i => i.code === 'OPEN_REDIRECT')).toBeUndefined();
  });
});

// ─── /api/revalidate HMAC Smoke ───────────────────────────────────────────────
// Mirrors the verification logic in apps/web/app/api/revalidate/route.ts

describe('/api/revalidate HMAC smoke', () => {
  const SECRET = 'smoke-test-secret-32-chars-padding';
  const BODY = JSON.stringify({ ts: 1700000000, path: '/tr' });
  const EXPECTED = createHmac('sha256', SECRET).update(BODY).digest('hex');

  function verify(sig: string): boolean {
    if (sig.length !== EXPECTED.length) return false;
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(EXPECTED));
    } catch {
      return false;
    }
  }

  it('accepts correct HMAC signature', () => {
    expect(verify(EXPECTED)).toBe(true);
  });

  it('rejects empty signature', () => {
    expect(verify('')).toBe(false);
  });

  it('rejects wrong signature of correct length', () => {
    expect(verify('a'.repeat(EXPECTED.length))).toBe(false);
  });

  it('rejects signature computed over different secret', () => {
    const wrongSig = createHmac('sha256', 'wrong-secret').update(BODY).digest('hex');
    expect(verify(wrongSig)).toBe(false);
  });

  it('rejects signature computed over tampered body', () => {
    const tamperedSig = createHmac('sha256', SECRET).update('tampered-body').digest('hex');
    expect(verify(tamperedSig)).toBe(false);
  });
});

// ─── Draft / Scheduled Content Visibility ─────────────────────────────────────

describe('draft/scheduled content visibility (isPublic gate)', () => {
  it('blocks draft regardless of date', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    const now = new Date();
    expect(isPublic({ status: 'draft', publishDate: '2000-01-01' }, now)).toBe(false);
    expect(isPublic({ status: 'draft', publishDate: '2099-01-01' }, now)).toBe(false);
  });

  it('blocks scheduled content with future publish date', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'scheduled', publishDate: '2099-12-31' }, new Date())).toBe(false);
  });

  it('allows scheduled content whose publish date has passed', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'scheduled', publishDate: '2000-06-01' }, new Date())).toBe(true);
  });

  it('allows published content with past publish date', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    expect(isPublic({ status: 'published', publishDate: '2020-01-01' }, new Date())).toBe(true);
  });

  it('blocks published content with future publish date (defensive)', async () => {
    const { isPublic } = await import('@nacianilcom/content-core');
    // Edge case: published status but future date should NOT be public
    expect(isPublic({ status: 'published', publishDate: '2099-01-01' }, new Date())).toBe(false);
  });
});
