import Link from 'next/link';
import type { LinkPrimitiveProps } from '@nacianilcom/ui';

/** Next.js wrapper around the framework-light LinkPrimitive (§3). */
export function WebLink({ href, children, className, 'aria-label': ariaLabel, target, rel }: LinkPrimitiveProps) {
  return (
    <Link href={href} className={className} aria-label={ariaLabel} target={target} rel={rel}>
      {children}
    </Link>
  );
}
