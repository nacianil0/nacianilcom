import QRCode from 'qrcode';

// Match the design tokens so the code blends into the warm-paper CV.
const INK = '#1b1a18';
const SURFACE = '#f7f5f2';

/**
 * Render `text` as an inline QR-code SVG string (server-only).
 * Ink modules on a paper-toned quiet zone. Returns null on any failure so
 * callers can omit the code gracefully rather than breaking the page.
 */
export async function qrSvg(text: string): Promise<string | null> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark: INK, light: SURFACE },
    });
  } catch {
    return null;
  }
}
