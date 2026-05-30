import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

/** Portal-style breadcrumb trail for the masthead bar. First link carries a back-arrow. */
export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
      {items.map((c, i) => (
        <span key={i} className="flex min-w-0 items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="font-mono text-[10px] text-ink-secondary/50">/</span>}
          {c.href ? (
            <Link
              href={c.href}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink"
            >
              {i === 0 && <span aria-hidden="true" className="text-[11px] leading-none">←</span>}
              <span className="truncate">{c.label}</span>
            </Link>
          ) : (
            <span
              aria-current="page"
              className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink"
            >
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
