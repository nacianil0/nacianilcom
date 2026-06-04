import { describe, expect, it } from 'vitest';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  buildSignedSession,
  getPasswordGateConfig,
  hashPassword,
  safeNextPath,
  verifyPasswordHash,
  verifySignedSession,
} from '../lib/password-gate';

describe('password gate auth core', () => {
  it('verifies a password against its SHA-256 hash', async () => {
    const expectedHash = await hashPassword('correct horse battery staple');

    await expect(verifyPasswordHash('correct horse battery staple', expectedHash)).resolves.toBe(
      true,
    );
    await expect(verifyPasswordHash('wrong password', expectedHash)).resolves.toBe(false);
  });

  it('rejects malformed password hashes', async () => {
    await expect(verifyPasswordHash('anything', 'not-a-sha256-hash')).resolves.toBe(false);
  });

  it('falls back to the bundled live gate config when env is missing', () => {
    const config = getPasswordGateConfig({});

    expect(config).not.toBeNull();
    expect(config?.passwordHash).toMatch(/^[a-f0-9]{64}$/);
    expect(config?.cookieSecret.length).toBeGreaterThanOrEqual(32);
  });

  it('creates a signed session that is valid for one hour', async () => {
    const now = Date.parse('2026-06-04T10:00:00.000Z');
    const secret = 'session-secret-with-enough-length';
    const cookie = await buildSignedSession(secret, now);

    expect(await verifySignedSession(cookie, secret, now + AUTH_COOKIE_MAX_AGE_SECONDS * 1000)).toBe(
      true,
    );
  });

  it('rejects expired and tampered signed sessions', async () => {
    const now = Date.parse('2026-06-04T10:00:00.000Z');
    const secret = 'session-secret-with-enough-length';
    const cookie = await buildSignedSession(secret, now);

    expect(await verifySignedSession(cookie, secret, now + AUTH_COOKIE_MAX_AGE_SECONDS * 1000 + 1)).toBe(
      false,
    );
    expect(await verifySignedSession(`${cookie.slice(0, -1)}x`, secret, now)).toBe(false);
    expect(await verifySignedSession(cookie, 'different-secret', now)).toBe(false);
  });

  it('keeps next redirects internal-only', () => {
    expect(safeNextPath('/tr/series?x=1')).toBe('/tr/series?x=1');
    expect(safeNextPath('https://evil.example/tr')).toBe('/tr');
    expect(safeNextPath('//evil.example/tr')).toBe('/tr');
    expect(safeNextPath('/login')).toBe('/tr');
    expect(safeNextPath(null)).toBe('/tr');
  });
});
