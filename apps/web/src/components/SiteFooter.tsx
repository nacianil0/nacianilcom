import Link from 'next/link';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { pageShellClass } from '../lib/layout';
import { brandLabel } from '../lib/brandLabel';

interface SiteFooterProps {
  lang: Locale;
}

export function SiteFooter({ lang }: SiteFooterProps) {
  const nav = [
    { href: buildUrl(lang, 'seriesList'), label: lang === 'tr' ? 'Yazılar' : 'Writing' },
    { href: buildUrl(lang, 'work'), label: lang === 'tr' ? 'Projeler' : 'Work' },
    { href: buildUrl(lang, 'cv'), label: 'CV' },
  ];
  const year = new Date().getFullYear();

  const linkClass =
    'font-mono text-[10px] tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink';

  return (
    <footer className="mt-24 border-t border-ink bg-surface print:hidden">
      <div className={`${pageShellClass} flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between`}>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">Naci Anıl Akman</p>
          <p className="mt-2 max-w-[340px] font-sans text-[13px] leading-[1.6] text-ink-secondary">
            {lang === 'tr'
              ? 'Full Stack Developer — .NET & React. Kurumsal portal ve dashboard sistemleri.'
              : 'Full Stack Developer — .NET & React. Enterprise portal and dashboard systems.'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <nav aria-label={lang === 'tr' ? 'Alt navigasyon' : 'Footer navigation'} className="flex flex-wrap gap-x-5 gap-y-2">
            {nav.map((n) => (
              <Link key={n.label} href={n.href} className={linkClass}>
                {n.label}
              </Link>
            ))}
            <a href="https://github.com/nacianilakman" target="_blank" rel="noopener noreferrer" className={linkClass}>
              {brandLabel('GitHub')}
            </a>
            <a href="https://www.linkedin.com/in/nacianilakman" target="_blank" rel="noopener noreferrer" className={linkClass}>
              {brandLabel('LinkedIn')}
            </a>
          </nav>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/70">
            © {year} · nacianil.com
          </p>
        </div>
      </div>
    </footer>
  );
}
