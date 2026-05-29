import type { ReactNode } from 'react';

interface ExampleProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Example({ children, title, className = '' }: ExampleProps) {
  return (
    <figure
      className={`my-6 overflow-hidden rounded-card border border-hairline bg-card ${className}`}
    >
      <div className="border-b border-hairline px-4 py-2">
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          {title ?? 'Example'}
        </span>
      </div>
      <div className="px-5 py-4 font-sans text-sm leading-relaxed text-ink">{children}</div>
    </figure>
  );
}
