import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Ensure the local dev server is running before executing this script!
const LOCALES = ['tr', 'en'];

function createAuthCookie() {
  const secret = process.env.AUTH_COOKIE_SECRET || '863e2dd0bbda7793df6a2877e7836443e82920c738d97c1bc8937eea8488abdd';
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 3600000 })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${payload}.${signature}`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 794, height: 800 } // Normal height so content can expand scrollHeight naturally
  });
  
  await context.addCookies([{
    name: 'nacianil_auth',
    value: createAuthCookie(),
    domain: 'localhost',
    path: '/'
  }]);

  const page = await context.newPage();
  
  for (const locale of LOCALES) {
    const url = `http://localhost:3000/${locale}/cv/print`;
    const outPath = path.join(ROOT, 'apps', 'web', 'public', `Naci_Anil_Akman_CV_${locale.toUpperCase()}.pdf`);
    
    console.log(`Generating PDF for ${locale} from ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    await page.waitForSelector('main');
    await page.waitForTimeout(3000); // Give Next.js and fonts ample time to render

    console.log(`Generating A4 PDF...`);
    
    // Create a standard A4 PDF
    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    console.log(`Success! Saved ${locale} PDF to ${outPath}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
