import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface MetaRowProps {
  /** Each entry becomes a meta cell; falsy entries are dropped. Hairlines are inserted between. */
  items: ReactNode[];
  className?: string;
}

/** Inline metadata row — mono uppercase cells separated by vertical hairlines (Portal detail header). */
export function MetaRow({ items, className = '' }: MetaRowProps) {
  const visible = items.filter((x) => x !== null && x !== undefined && x !== false && x !== '');
  if (visible.length === 0) return null;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-secondary',
        className,
      )}
    >
      {visible.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true" className="h-[10px] w-px bg-hairline" />}
          <span className="whitespace-nowrap tabular-nums">{item}</span>
        </Fragment>
      ))}
    </div>
  );
}
