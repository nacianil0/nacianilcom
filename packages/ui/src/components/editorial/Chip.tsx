import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ChipProps {
  children: ReactNode;
  className?: string;
}

/** Square mono tag chip for stacks / tags (no radius — Swiss-Industrial). */
export function Chip({ children, className = '' }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border border-hairline bg-surface px-2 py-0.5 font-mono text-[10px] tracking-[0.02em] text-ink-secondary',
        className,
      )}
    >
      {children}
    </span>
  );
}
