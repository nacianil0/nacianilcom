/**
 * Copies public resume PDFs into apps/web/public/credentials/
 * and renders first-page WebP previews for inline CV display.
 *
 * Run: pnpm credentials:generate
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, Image } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RESUME_SOURCES = path.join(ROOT, 'content', 'resume', 'sources');
const OUT_DIR = path.join(ROOT, 'apps', 'web', 'public', 'credentials');
const PREVIEW_DIR = path.join(OUT_DIR, 'previews');
const STANDARD_FONTS = path.join(
  ROOT,
  'node_modules',
  'pdfjs-dist',
  'standard_fonts',
);

/** Resume item id → source PDF (public web documents only). */
const PUBLIC_DOCUMENTS = [
  { id: 'ms-20483', dir: '8-sertifikalar', file: '20483-microsoft-csharp.pdf' },
  { id: 'ms-20486', dir: '8-sertifikalar', file: '20486-microsoft-aspnet.pdf' },
  { id: 'ms-20480', dir: '8-sertifikalar', file: '20480-microsoft-web.pdf' },
  { id: 'bilgeadam-proje', dir: '8-sertifikalar', file: 'bilgeadam-proje-bitirme.pdf' },
  { id: 'bilgeadam-katilim', dir: '8-sertifikalar', file: 'bilgeadam-katilim.pdf' },
  { id: 'iu-betoo', dir: '7-diploma', file: 'diploma.pdf' },
];

const PREVIEW_MAX_WIDTH = 720;

if (!globalThis.Image) globalThis.Image = Image;

async function renderPreview(pdfPath, outPath) {
  const data = new Uint8Array(await fs.readFile(pdfPath));
  const doc = await getDocument({
    data,
    disableFontFace: true,
    standardFontDataUrl: `${STANDARD_FONTS}/`,
  }).promise;
  const page = await doc.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = PREVIEW_MAX_WIDTH / baseViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  await fs.writeFile(outPath, await canvas.encode('webp', 82));
}

async function main() {
  await fs.mkdir(PREVIEW_DIR, { recursive: true });

  for (const { id, dir, file } of PUBLIC_DOCUMENTS) {
    const src = path.join(RESUME_SOURCES, dir, file);
    const pdfOut = path.join(OUT_DIR, `${id}.pdf`);
    const previewOut = path.join(PREVIEW_DIR, `${id}.webp`);

    try {
      await fs.access(src);
    } catch {
      console.warn(`skip (missing source): ${dir}/${file}`);
      continue;
    }

    await fs.copyFile(src, pdfOut);
    await renderPreview(src, previewOut);
    console.log(`ok: ${id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
