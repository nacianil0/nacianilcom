import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Ensure the local dev server is running before executing this script!
const LOCALES = ['tr', 'en'];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 794, height: 3000 } // A4 width at 96 DPI, very tall height
  });
  
  for (const locale of LOCALES) {
    const url = `http://localhost:3000/${locale}/cv/print`;
    const outPath = path.join(ROOT, 'apps', 'web', 'public', `Naci_Anil_Akman_CV_${locale.toUpperCase()}.pdf`);
    
    console.log(`Generating PDF for ${locale} from ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    await page.waitForSelector('main');
    await page.waitForTimeout(3000); // Give Next.js and fonts ample time to render

    // Get the full scroll height to make a single continuous page
    const height = await page.evaluate(() => {
      const container = document.querySelector('.min-h-screen');
      return container ? container.scrollHeight : document.body.scrollHeight;
    });
    console.log(`Document height is ${height}px. Generating single-page PDF...`);
    
    // Create a continuous single-page PDF
    await page.pdf({
      path: outPath,
      width: '210mm',
      height: `${height}px`,
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
