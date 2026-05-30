import { headers } from 'next/headers';
import { SITE_URL } from './site';

const LOCAL_HOST_RE = /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?)/i;

/**
 * Resolve the origin to advertise inside the printable CV (link + QR).
 *
 * Priority (per spec):
 *   1. runtime / export origin — request headers, when it is a real public host
 *   2. NEXT_PUBLIC_SITE_URL — public by contract, never a server secret
 *   3. SITE_URL — canonical fallback
 *
 * Localhost / loopback origins are skipped so a PDF exported during local dev
 * never ships a useless link; set NEXT_PUBLIC_SITE_URL to pin one in that case.
 */
export async function resolveSiteOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host && !LOCAL_HOST_RE.test(host)) {
      const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // headers() is unavailable outside a request scope — fall through.
  }

  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, '');

  return SITE_URL;
}

/** Strip protocol + trailing slash for compact display, e.g. "nacianil.com". */
export function displayOrigin(origin: string): string {
  return origin.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
