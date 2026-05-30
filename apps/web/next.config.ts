import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

function loadRedirects(): Array<{ source: string; destination: string; permanent: boolean }> {
  const filePath = path.join(process.cwd(), '..', '..', 'content', 'redirects.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(raw) as Array<{ from: string; to: string; permanent: boolean }>;
    return items
      .filter(item => {
        // Open redirect guard: external destinations are never allowed (§29/§20)
        const isExternal = /^https?:\/\//i.test(item.to) || item.to.startsWith('//');
        return !isExternal;
      })
      .map(item => ({
        source: item.from,
        destination: item.to,
        permanent: item.permanent,
      }));
  } catch {
    return [];
  }
}

// CSP in Report-Only mode for initial rollout (§29).
// Switch to Content-Security-Policy once violations are cleared.
//
// unsafe-inline rationale: Next.js static/ISR injects small hydration scripts
// that cannot use nonce without full SSR. This is the accepted MVP trade-off (§29).
// Tighten with sha256 hashes or migrate to SSR nonce after identifying fingerprints.
// Dev intentionally omits this header via the IS_DEV guard below.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = [
  // CSP: Report-Only during rollout — switch header name to enforce in production
  { key: 'Content-Security-Policy-Report-Only', value: CSP_DIRECTIVES },
  // Clickjacking: X-Frame-Options enforced immediately (belt + suspenders with frame-ancestors)
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  trailingSlash: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },

  async redirects() {
    return loadRedirects();
  },

  images: {
    // Allow HTTPS images from any host; restrict to specific domains once CDN is finalized
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
