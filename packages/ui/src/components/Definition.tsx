import type { ReactNode } from 'react';

interface DefinitionProps {
  term: string;
  children: ReactNode;
  className?: string;
}

export function Definition({ term, children, className = '' }: DefinitionProps) {
  return (
    <dl className={`my-4 ${className}`}>
      <dt className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1">
        {term}
      </dt>
      <dd className="border-l-2 border-hairline pl-4 font-sans text-sm leading-relaxed text-ink">
        {children}
      </dd>
    </dl>
  );
}
