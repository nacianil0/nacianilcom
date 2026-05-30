import type { ReactNode } from 'react';

interface SectionRailProps {
  label: string;
  id?: string;
  /** Optional right-aligned label (e.g. a count) past the rail. */
  aside?: ReactNode;
  /** Strong top rule (spec-sheet section break). */
  dividerTop?: boolean;
  children: ReactNode;
  className?: string;
}

/** Section heading with a mono label and a hairline rail extending right (spec-sheet feel). */
export function SectionRail({ label, id, aside, dividerTop = false, children, className = '' }: SectionRailProps) {
  return (
    <section
      {...(id ? { 'aria-labelledby': id } : {})}
      className={[dividerTop ? 'border-t border-ink pt-10' : '', className].filter(Boolean).join(' ')}
    >
      <div className="mb-5 flex items-center gap-4">
        <h2
          {...(id ? { id } : {})}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary"
        >
          {label}
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
        {aside && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary tabular-nums">
            {aside}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
