import type { LinkPrimitiveProps } from '@nacianilcom/ui';

/** Vite/Studio wrapper around the framework-light LinkPrimitive (§3). */
export function StudioLink({ href, children, className, 'aria-label': ariaLabel, target, rel }: LinkPrimitiveProps) {
  return (
    <a href={href} className={className} aria-label={ariaLabel} target={target} rel={rel}>
      {children}
    </a>
  );
}
