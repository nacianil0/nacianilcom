import type { ReactNode } from 'react';

interface TakeawayProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Takeaway({ children, title, className = '' }: TakeawayProps) {
  return (
    <aside
      role="note"
      className={`my-6 border-l-4 border-positive bg-card rounded-card px-5 py-4 ${className}`}
    >
      {title && (
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-positive">
          {title}
        </p>
      )}
      <div className="font-sans text-sm leading-relaxed text-ink">{children}</div>
    </aside>
  );
}
