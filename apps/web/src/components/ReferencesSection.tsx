import type { References } from '@nacianilcom/content-core';
import type { WebMessages } from '../lib/messages';

interface ReferencesSectionProps {
  references: References;
  messages: WebMessages;
}

export function ReferencesSection({ references, messages }: ReferencesSectionProps) {
  if (references.length === 0) return null;

  return (
    <aside
      aria-label={messages.references}
      className="mt-12 border-t border-hairline pt-8"
    >
      <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-ink-secondary">
        {messages.references}
      </h2>
      <ol className="space-y-2">
        {references.map((ref, i) => (
          <li key={i} className="font-sans text-sm leading-relaxed text-ink-secondary">
            <span className="mr-2 text-xs text-ink-secondary/60">[{i + 1}]</span>
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline decoration-accent/30 transition-colors hover:decoration-accent"
              >
                {ref.title}
              </a>
            ) : (
              <span>{ref.title}</span>
            )}
            {ref.author !== undefined && <span className="text-ink-secondary/70"> — {ref.author}</span>}
            {ref.year !== undefined && (
              <span className="text-ink-secondary/60"> ({ref.year})</span>
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}
