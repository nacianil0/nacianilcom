import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface FrameProps {
  children: ReactNode;
  /** Aspect-ratio utility, e.g. 'aspect-[16/9]'. Omit for intrinsic height. */
  ratioClassName?: string;
  className?: string;
}

/** Bordered media container on sunk paper — the editorial cover/photo frame (no-crop contain). */
export function Frame({ children, ratioClassName = '', className = '' }: FrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border border-hairline bg-surface-sunk',
        ratioClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
