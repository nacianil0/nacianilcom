import type { ReactNode } from 'react';

export interface LinkPrimitiveProps {
  href: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

export interface ImagePrimitiveProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  'aria-hidden'?: boolean | 'true' | 'false';
}
