import Link from 'next/link';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';

interface SiteNavProps {
  lang: Locale;
  altLangUrl: string;
}

export function SiteNav({ lang, altLangUrl }: SiteNavProps) {
  const altLang: Locale = lang === 'tr' ? 'en' : 'tr';

  return (
    <nav
      aria-label="Site navigasyonu"
      className="sticky top-0 z-10 border-b border-hairline bg-surface/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
        <Link
          href={buildUrl(lang, 'seriesList')}
          className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-secondary transition-colors hover:text-ink"
        >
          nacianil.com
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href={buildUrl(lang, 'seriesList')}
            className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
          >
            {lang === 'tr' ? 'Yazılar' : 'Articles'}
          </Link>
          <Link
            href={buildUrl(lang, 'work')}
            className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
          >
            {lang === 'tr' ? 'Projeler' : 'Work'}
          </Link>
          <Link
            href={buildUrl(lang, 'cv')}
            className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
          >
            CV
          </Link>
          <Link
            href={altLangUrl}
            lang={altLang}
            className="rounded border border-hairline px-2.5 py-1 font-sans text-xs font-medium uppercase tracking-wider text-ink-secondary transition-colors hover:border-ink-secondary hover:text-ink"
            aria-label={altLang === 'tr' ? 'Türkçeye geç' : 'Switch to English'}
          >
            {altLang.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
