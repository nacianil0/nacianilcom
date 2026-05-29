import Image from 'next/image';
import type { ImagePrimitiveProps } from '@nacianilcom/ui';

/** Next.js wrapper around the framework-light ImagePrimitive (§3). */
export function WebImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  'aria-hidden': ariaHidden,
}: ImagePrimitiveProps) {
  return (
    <Image
      src={src}
      alt={alt}
      {...(width !== undefined ? { width } : undefined)}
      {...(height !== undefined ? { height } : undefined)}
      {...(className !== undefined ? { className } : undefined)}
      {...(priority !== undefined ? { priority } : undefined)}
      {...(ariaHidden !== undefined ? { 'aria-hidden': ariaHidden } : undefined)}
    />
  );
}
