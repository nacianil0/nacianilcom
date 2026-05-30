import Link from 'next/link';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { pageShellClass } from '../lib/layout';

interface SiteNavProps {
  lang: Locale;
  altLangUrl: string;
}

export function SiteNav({ lang, altLangUrl }: SiteNavProps) {
  const altLang: Locale = lang === 'tr' ? 'en' : 'tr';
  const nav = [
    { href: buildUrl(lang, 'seriesList'), label: lang === 'tr' ? 'Yazılar' : 'Writing' },
    { href: buildUrl(lang, 'work'), label: lang === 'tr' ? 'Projeler' : 'Work' },
    { href: buildUrl(lang, 'cv'), label: 'CV' },
  ];

  return (
    <nav
      aria-label={lang === 'tr' ? 'Site navigasyonu' : 'Site navigation'}
      className="sticky top-0 z-20 border-b border-hairline bg-surface/90 backdrop-blur-sm print:hidden"
    >
      <div className={`${pageShellClass} flex items-center justify-between gap-3 py-3.5 sm:gap-5`}>
        <Link
          href={buildUrl(lang, 'home')}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:text-accent"
        >
          Naci Anıl Akman
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={altLangUrl}
            lang={altLang}
            hrefLang={altLang}
            className="border border-hairline px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:border-ink hover:text-ink"
            aria-label={altLang === 'tr' ? 'Türkçeye geç' : 'Switch to English'}
          >
            {altLang.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
