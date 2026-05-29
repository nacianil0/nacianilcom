import type { ImagePrimitiveProps } from '@nacianilcom/ui';

/** Vite/Studio wrapper around the framework-light ImagePrimitive (§3). */
export function StudioImage({ src, alt, width, height, className, 'aria-hidden': ariaHidden }: ImagePrimitiveProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
