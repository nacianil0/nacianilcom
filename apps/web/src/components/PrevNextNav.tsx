import Link from 'next/link';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import type { WebMessages } from '../lib/messages';

interface ArticleRef {
  slugBase: string;
  title: string;
}

interface PrevNextNavProps {
  prev: ArticleRef | null;
  next: ArticleRef | null;
  seriesSlug: string;
  lang: Locale;
  messages: WebMessages;
}

export function PrevNextNav({ prev, next, seriesSlug, lang, messages }: PrevNextNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Yazı navigasyonu"
      className="mt-10 grid grid-cols-1 gap-3 border-t border-hairline pt-8 sm:grid-cols-2"
    >
      <div>
        {prev && (
          <Link
            href={buildUrl(lang, 'article', { seriesSlug, articleSlug: prev.slugBase })}
            className="group flex flex-col gap-1 rounded-card border border-hairline bg-card px-4 py-3 transition-colors hover:border-ink-secondary/40"
          >
            <span className="font-sans text-xs text-ink-secondary/60">
              ← {messages.previousArticle}
            </span>
            <span className="font-sans text-sm font-medium text-ink group-hover:text-accent transition-colors line-clamp-2">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="flex justify-end">
        {next && (
          <Link
            href={buildUrl(lang, 'article', { seriesSlug, articleSlug: next.slugBase })}
            className="group flex w-full flex-col gap-1 rounded-card border border-hairline bg-card px-4 py-3 text-right transition-colors hover:border-ink-secondary/40"
          >
            <span className="font-sans text-xs text-ink-secondary/60">
              {messages.nextArticle} →
            </span>
            <span className="font-sans text-sm font-medium text-ink group-hover:text-accent transition-colors line-clamp-2">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
