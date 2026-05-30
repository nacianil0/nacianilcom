import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { loadPublicCases } from '../../../src/content/loader';
import { SiteNav } from '../../../src/components/SiteNav';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../src/lib/site';
import { personJsonLd, breadcrumbJsonLd } from '../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) return {};
  const locale = lang as Locale;
  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
  const trUrl = `${SITE_URL}${buildUrl('tr', 'work')}`;
  const enUrl = `${SITE_URL}${buildUrl('en', 'work')}`;
  const canonicalUrl = locale === 'tr' ? trUrl : enUrl;
  const title = locale === 'tr' ? 'Projeler — Naci Anil Akman' : 'Work — Naci Anil Akman';
  const description =
    locale === 'tr'
      ? 'Holding ölçeğinde kurumsal portal ve dashboard case study\'leri.'
      : 'Case studies for enterprise portal and dashboard systems at holding scale.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { tr: trUrl, en: enUrl, 'x-default': trUrl },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: localeToOgLocale(locale),
      alternateLocale: localeToOgLocale(altLocale),
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const cases = await loadPublicCases(locale);
  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'work');

  const canonicalUrl = `${SITE_URL}${buildUrl(locale, 'work')}`;

  const personLd = personJsonLd();
  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Ana sayfa' : 'Home', url: `${SITE_URL}${buildUrl(locale, 'home')}` },
    { name: locale === 'tr' ? 'Projeler' : 'Work', url: canonicalUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <main className="mx-auto max-w-[720px] px-6 py-16">
          <header className="mb-12">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
              nacianil.com
            </p>
            <h1 className="font-serif text-3xl font-semibold text-ink">
              {locale === 'tr' ? 'Projeler' : 'Work'}
            </h1>
            <p className="mt-3 font-sans text-base leading-relaxed text-ink-secondary">
              {locale === 'tr'
                ? 'Kurumsal sistemlerde uçtan uca ürün geliştirme case study\'leri.'
                : 'End-to-end product development case studies in enterprise systems.'}
            </p>
          </header>

          {cases.length === 0 && (
            <p className="font-sans text-sm text-ink-secondary">
              {locale === 'tr' ? 'Henüz yayınlanmış proje yok.' : 'No published case studies yet.'}
            </p>
          )}

          <ul className="space-y-4" role="list">
            {cases.map(c => (
              <li key={c.slug}>
                <Link
                  href={buildUrl(locale, 'workCase', { caseSlug: c.slug })}
                  className="group block rounded-card border border-hairline bg-card px-6 py-5 transition-colors hover:border-ink-secondary/40"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h2 className="font-serif text-xl font-semibold text-ink transition-colors group-hover:text-accent">
                      {c.title}
                    </h2>
                  </div>
                  <p className="font-sans text-sm leading-relaxed text-ink-secondary">{c.summary}</p>
                  {c.stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.stack.map(s => (
                        <span key={s} className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] text-ink-secondary/60">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 font-sans text-xs font-medium text-accent">
                    {locale === 'tr' ? 'Case study →' : 'Case study →'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-hairline pt-6">
            <Link
              href={buildUrl(locale, 'cv')}
              className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
            >
              {locale === 'tr' ? '← CV\'ye git' : '← Back to CV'}
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
