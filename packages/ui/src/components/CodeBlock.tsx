"use client";

import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  /** Required per §16 — build will block if absent */
  language: string;
  isPseudoCode?: boolean;
  title?: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language,
  isPseudoCode = false,
  title,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <figure
      className={`my-6 overflow-hidden rounded-card border border-hairline bg-card ${className}`}
    >
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary shrink-0">
            {language}
          </span>
          {isPseudoCode && (
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider shrink-0"
              style={{ backgroundColor: 'rgba(155,35,53,0.10)', color: 'var(--color-accent)' }}
            >
              pseudo-code
            </span>
          )}
          {title && (
            <span className="font-sans text-xs text-ink-secondary truncate">{title}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? copiedLabel : copyLabel}
          className="font-mono text-[11px] text-ink-secondary hover:text-ink shrink-0"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      {/* overflow-x-auto: block scrolls horizontally; page does not */}
      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-sm leading-relaxed text-ink">
          <code>{children}</code>
        </pre>
      </div>
    </figure>
  );
}
