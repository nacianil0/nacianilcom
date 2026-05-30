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
      aria-label={lang === 'tr' ? 'Yazı navigasyonu' : 'Article navigation'}
      className="mt-12 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2"
    >
      <div className="bg-surface">
        {prev && (
          <Link
            href={buildUrl(lang, 'article', { seriesSlug, articleSlug: prev.slugBase })}
            className="group flex h-full flex-col gap-2 px-5 py-4 transition-colors hover:bg-surface-raised"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary">
              ← {messages.previousArticle}
            </span>
            <span className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="bg-surface">
        {next && (
          <Link
            href={buildUrl(lang, 'article', { seriesSlug, articleSlug: next.slugBase })}
            className="group flex h-full flex-col items-end gap-2 px-5 py-4 text-right transition-colors hover:bg-surface-raised"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary">
              {messages.nextArticle} →
            </span>
            <span className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
