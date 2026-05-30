import Link from 'next/link';
import type { ReactNode } from 'react';

interface ListRowProps {
  href: string;
  /** Open in a new tab (external URL). */
  external?: boolean;
  /** Left mono rail cell — a 2-digit index or short date. */
  index: string;
  title: string;
  description?: string;
  /** Right-aligned meta (reading time, count, arrow). */
  meta?: ReactNode;
  /** Small label above the title. */
  kicker?: ReactNode;
}

const rowClass =
  'group grid grid-cols-[2.75rem_1fr] items-baseline gap-x-5 gap-y-1 py-5 transition-colors hover:bg-surface-raised sm:grid-cols-[3rem_1fr_auto] sm:gap-x-6';

function ListRowContent({
  index,
  title,
  description,
  meta,
  kicker,
}: {
  index: string;
  title: string;
  description?: string | undefined;
  meta?: ReactNode;
  kicker?: ReactNode;
}) {
  return (
    <>
      <span className="pt-1 font-mono text-[11px] tabular-nums text-ink-secondary transition-colors group-hover:text-accent">
        {index}
      </span>
      <div className="min-w-0">
        {kicker && <div className="mb-1.5">{kicker}</div>}
        <h3 className="font-serif text-[19px] font-medium leading-[1.25] text-ink transition-colors group-hover:text-accent">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 line-clamp-2 font-sans text-[13.5px] leading-[1.6] text-ink-secondary">
            {description}
          </p>
        )}
      </div>
      {meta && (
        <div className="col-span-2 mt-2 flex items-center gap-3 sm:col-span-1 sm:mt-0 sm:justify-end sm:pt-1.5">
          {meta}
        </div>
      )}
    </>
  );
}

/** Ruled editorial list row (Portal announcement list pattern). */
export function ListRow({ href, external, index, title, description, meta, kicker }: ListRowProps) {
  return (
    <li className="border-b border-hairline">
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${rowClass} block`}
        >
          <ListRowContent index={index} title={title} description={description} meta={meta} kicker={kicker} />
        </a>
      ) : (
        <Link href={href} className={rowClass}>
          <ListRowContent index={index} title={title} description={description} meta={meta} kicker={kicker} />
        </Link>
      )}
    </li>
  );
}
