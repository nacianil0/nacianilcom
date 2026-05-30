import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface MastheadProps {
  /** Breadcrumb / back-link slot (left of the rule). */
  crumbs?: ReactNode;
  /** Small badge after crumbs (e.g. a kind or index). */
  badge?: string;
  /** Right-aligned content past the rule (e.g. record count). */
  aside?: ReactNode;
  /** Big serif title. Omit for a breadcrumb-only bar (reading pages). */
  title?: string;
  /** Trailing accent period after the title. */
  accent?: boolean;
  /** Lead paragraph under the title. */
  lead?: ReactNode;
  /** Extra content under the title (meta row, actions). */
  children?: ReactNode;
  size?: 'lg' | 'md';
  className?: string;
}

/**
 * Signature page masthead — strong ink bottom rule, mono breadcrumb bar, serif display title.
 * Adapted from the Portal dashboard announcement header into the warm-paper palette.
 */
export function Masthead({
  crumbs,
  badge,
  aside,
  title,
  accent = true,
  lead,
  children,
  size = 'lg',
  className = '',
}: MastheadProps) {
  const hasBar = Boolean(crumbs || badge || aside);
  return (
    <header
      className={cn(
        'border-b border-ink bg-surface',
        title ? 'pt-11 pb-9' : 'pt-9 pb-6',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1100px] px-6 sm:px-10 lg:px-14">
        {hasBar && (
          <div className="flex items-center gap-3">
            {crumbs}
            {badge && (
              <>
                <span aria-hidden="true" className="h-[10px] w-px bg-hairline" />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-secondary">
                  {badge}
                </span>
              </>
            )}
            <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
            {aside && <div className="shrink-0">{aside}</div>}
          </div>
        )}
        {title && (
          <h1
            className={cn(
              'font-serif font-semibold leading-[1.05] tracking-[-0.01em] text-ink',
              hasBar ? 'mt-8' : '',
              size === 'lg' ? 'text-[38px] sm:text-[50px]' : 'text-[30px] sm:text-[40px]',
            )}
          >
            {title}
            {accent && <span className="text-accent">.</span>}
          </h1>
        )}
        {lead && (
          <div className="mt-4 max-w-[640px] font-sans text-[15px] leading-[1.7] text-ink-secondary">
            {lead}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}
