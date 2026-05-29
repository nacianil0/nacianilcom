import type { ReactNode } from 'react';

interface CalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Callout({ children, title, className = '' }: CalloutProps) {
  return (
    <aside
      role="note"
      className={`my-6 border-l-4 border-accent bg-card rounded-card px-5 py-4 ${className}`}
    >
      {title && (
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </p>
      )}
      <div className="font-sans text-sm leading-relaxed text-ink">{children}</div>
    </aside>
  );
}
