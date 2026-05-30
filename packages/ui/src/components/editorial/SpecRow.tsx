import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SpecRowProps {
  /** Left mono label (spec-sheet key). */
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Spec-sheet row: mono label column on the left, content on the right, bottom hairline. */
export function SpecRow({ label, children, className = '' }: SpecRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-1.5 border-b border-hairline py-4 sm:grid-cols-[150px_1fr] sm:gap-6',
        className,
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary sm:pt-1">
        {label}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
