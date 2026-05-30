import Link from 'next/link';
import { resolveInternalLink, isPublic } from '@nacianilcom/content-core';
import type { InternalLinkKind, Locale, ContentCatalog } from '@nacianilcom/content-core';

interface InternalLinkWebProps {
  kind: InternalLinkKind;
  id: string;
  label?: string;
  lang: Locale;
  catalog: ContentCatalog;
}

export function InternalLinkWeb({ kind, id, label, lang, catalog }: InternalLinkWebProps) {
  const resolved = resolveInternalLink(kind, id, lang, catalog);

  if (!resolved) {
    return (
      <span className="text-negative line-through" aria-label={`Broken internal link: ${id}`}>
        {label ?? id}
      </span>
    );
  }

  const now = new Date();
  if (!isPublic({ status: resolved.status, publishDate: resolved.publishDate }, now)) {
    return <span className="text-ink-secondary">{label ?? id}</span>;
  }

  return (
    <Link
      href={resolved.url}
      className="text-accent underline decoration-accent/30 transition-colors hover:decoration-accent"
    >
      {label ?? id}
    </Link>
  );
}
