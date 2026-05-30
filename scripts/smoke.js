#!/usr/bin/env node
// nacianilcom smoke test — run after build: node scripts/smoke.js [BASE_URL]
// Checks basic health of a running nacianilcom web instance.

const BASE = process.argv[2] ?? 'http://localhost:3000';
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';

let failures = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`${PASS} ${label}`);
  } catch (err) {
    console.error(`${FAIL} ${label}: ${err.message}`);
    failures++;
  }
}

async function expectStatus(url, expected, label) {
  const res = await fetch(url, { redirect: 'manual' });
  if (res.status !== expected) {
    throw new Error(`expected ${expected}, got ${res.status}`);
  }
  return res;
}

async function expectRedirect(url, expectedLocation) {
  const res = await fetch(url, { redirect: 'manual' });
  if (res.status < 300 || res.status >= 400) {
    throw new Error(`expected redirect, got ${res.status}`);
  }
  const loc = res.headers.get('location') ?? '';
  if (!loc.includes(expectedLocation)) {
    throw new Error(`expected location to contain "${expectedLocation}", got "${loc}"`);
  }
}

async function expectNoSecret(url, secrets) {
  const res = await fetch(url);
  const text = await res.text();
  for (const s of secrets) {
    if (text.includes(s)) {
      throw new Error(`secret leaked: "${s}" found in response`);
    }
  }
}

async function main() {
  console.log(`\nnacianilcom smoke — ${BASE}\n`);

  // ── Routing ──
  await check('/ → /tr redirect', () => expectRedirect(`${BASE}/`, '/tr'));
  await check('/tr returns 200', () => expectStatus(`${BASE}/tr`, 200));
  await check('/en returns 200', () => expectStatus(`${BASE}/en`, 200));

  // ── Static assets ──
  await check('/sitemap.xml returns 200', () => expectStatus(`${BASE}/sitemap.xml`, 200));
  await check('/robots.txt returns 200', () => expectStatus(`${BASE}/robots.txt`, 200));

  // ── RSS feeds ──
  await check('/tr/feed.xml returns 200', () => expectStatus(`${BASE}/tr/feed.xml`, 200));
  await check('/en/feed.xml returns 200', () => expectStatus(`${BASE}/en/feed.xml`, 200));

  // ── Series / articles ──
  await check('/tr/series returns 200', () => expectStatus(`${BASE}/tr/series`, 200));
  await check('/en/series returns 200', () => expectStatus(`${BASE}/en/series`, 200));

  // ── CV + Work ──
  await check('/tr/cv returns 200', () => expectStatus(`${BASE}/tr/cv`, 200));
  await check('/en/cv returns 200', () => expectStatus(`${BASE}/en/cv`, 200));
  await check('/tr/work returns 200', () => expectStatus(`${BASE}/tr/work`, 200));
  await check('/en/work returns 200', () => expectStatus(`${BASE}/en/work`, 200));

  // ── Protected API ──
  await check('/api/revalidate rejects unauthorized', async () => {
    const res = await fetch(`${BASE}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ts: 0, path: '/tr' }),
    });
    if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
  });

  // ── Private field leak check (CV page must not expose private credentials) ──
  await check('CV page has no private-tagged content', async () => {
    const res = await fetch(`${BASE}/tr/cv`);
    const html = await res.text();
    // ehliyet/askerlik credential IDs must not appear in HTML
    if (html.includes('ehliyet') && html.includes('visibility') && html.includes('private')) {
      throw new Error('private credential data may have leaked');
    }
    if (html.includes('askerlik') && html.toLowerCase().includes('private')) {
      throw new Error('private credential data may have leaked');
    }
  });

  // ── Security headers ──
  await check('Security headers present', async () => {
    const res = await fetch(`${BASE}/tr`);
    const csp = res.headers.get('content-security-policy') ?? res.headers.get('content-security-policy-report-only');
    const xct = res.headers.get('x-content-type-options');
    if (!csp) throw new Error('CSP header missing');
    if (xct !== 'nosniff') throw new Error('X-Content-Type-Options missing or wrong');
  });

  // ── No secret leak in HTML ──
  await check('No REVALIDATE_SECRET in HTML', () =>
    expectNoSecret(`${BASE}/tr`, ['REVALIDATE_SECRET', 'CRON_SECRET', 'sk-ant-'])
  );

  console.log(`\n${failures === 0 ? '✓ All checks passed' : `${failures} check(s) FAILED`}\n`);
  if (failures > 0) process.exit(1);
}

main().catch(err => {
  console.error('Smoke test runner error:', err);
  process.exit(1);
});
