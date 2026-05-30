import type { ReactNode } from 'react';

interface VisualBlockProps {
  title: string;
  caption?: string;
  alt: string;
  source?: string;
  children: ReactNode;
  className?: string;
}

export function VisualBlock({ title, caption, alt, source, children, className = '' }: VisualBlockProps) {
  return (
    <figure
      aria-label={alt}
      role="figure"
      className={`my-8 rounded-card border border-hairline bg-card overflow-hidden ${className}`}
    >
      <div className="px-5 pt-4 pb-3">
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </p>
        {children}
      </div>
      {(caption !== undefined || source !== undefined) && (
        <figcaption className="border-t border-hairline px-5 py-3">
          {caption !== undefined && (
            <p className="font-sans text-xs leading-relaxed text-ink-secondary">{caption}</p>
          )}
          {source !== undefined && (
            <p className="mt-1 font-sans text-xs text-ink-secondary/60">Kaynak: {source}</p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
