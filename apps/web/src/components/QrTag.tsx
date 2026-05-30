import { cn } from '@nacianilcom/ui';
import { qrSvg } from '../lib/qr';

interface QrTagProps {
  /** URL (or text) to encode. */
  value: string;
  /** Rendered square size in px. */
  size?: number;
  className?: string;
}

/**
 * Server component: a small, flat QR code for `value` rendered as inline SVG.
 * Used on the printable CV so a recruiter can jump to the live page.
 */
export async function QrTag({ value, size = 60, className }: QrTagProps) {
  const svg = await qrSvg(value);
  if (!svg) return null;
  return (
    <div
      className={cn('shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full', className)}
      style={{ width: size, height: size }}
      // The SVG is produced by the qrcode lib from our own resolved origin; its
      // output is numeric <path> data (the URL is encoded as modules, never
      // echoed as markup), so inlining it carries no injection risk.
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
      aria-label={value}
    />
  );
}
