import type { ReactNode } from 'react';

interface WarningProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Warning({ children, title, className = '' }: WarningProps) {
  return (
    <aside
      role="note"
      aria-label={title ?? 'Warning'}
      className={`my-6 border-l-4 border-negative bg-card rounded-card px-5 py-4 ${className}`}
    >
      {title && (
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-negative">
          {title}
        </p>
      )}
      <div className="font-sans text-sm leading-relaxed text-ink">{children}</div>
    </aside>
  );
}
