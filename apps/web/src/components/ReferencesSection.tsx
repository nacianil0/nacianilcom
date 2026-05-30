import type { References } from '@nacianilcom/content-core';
import type { WebMessages } from '../lib/messages';

interface ReferencesSectionProps {
  references: References;
  messages: WebMessages;
}

export function ReferencesSection({ references, messages }: ReferencesSectionProps) {
  if (references.length === 0) return null;

  return (
    <aside aria-label={messages.references} className="mt-12 border-t border-hairline pt-8">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary">
        {messages.references}
      </p>
      <ol className="space-y-2.5">
        {references.map((ref, i) => (
          <li
            key={i}
            className="grid grid-cols-[1.75rem_1fr] font-sans text-[13.5px] leading-[1.6] text-ink-secondary"
          >
            <span className="font-mono text-[11px] tabular-nums text-ink-secondary/60">
              [{i + 1}]
            </span>
            <span>
              {ref.url ? (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
                >
                  {ref.title}
                </a>
              ) : (
                <span className="text-ink">{ref.title}</span>
              )}
              {ref.author !== undefined && <span className="text-ink-secondary/70"> — {ref.author}</span>}
              {ref.year !== undefined && <span className="text-ink-secondary/60"> ({ref.year})</span>}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
