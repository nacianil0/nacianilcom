import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'muted' | 'ink' | 'accent';

interface MonoLabelProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const TONE: Record<Tone, string> = {
  muted: 'text-ink-secondary',
  ink: 'text-ink',
  accent: 'text-accent',
};

/** Swiss-Industrial mono uppercase label — the project's signature meta voice. */
export function MonoLabel({ children, tone = 'muted', className = '' }: MonoLabelProps) {
  return (
    <span className={cn('font-mono text-[10px] uppercase tracking-[0.22em]', TONE[tone], className)}>
      {children}
    </span>
  );
}
