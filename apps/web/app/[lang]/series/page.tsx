import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildUrl, formatReadingTime } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { loadPublicSeriesWithArticles } from '../../../src/content/loader';
import { SiteNav } from '../../../src/components/SiteNav';
import { getMessages } from '../../../src/lib/messages';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../src/lib/site';

const VALID_LANGS = new Set(['tr', 'en']);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) return {};

  const locale = lang as Locale;
  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
  const trUrl = `${SITE_URL}${buildUrl('tr', 'seriesList')}`;
  const enUrl = `${SITE_URL}${buildUrl('en', 'seriesList')}`;
  const canonicalUrl = locale === 'tr' ? trUrl : enUrl;
  const title = locale === 'tr' ? 'Yazılar' : 'Articles';
  const description =
    locale === 'tr'
      ? 'Teknik kavramları seri yapısında, adım adım inceleyen yazılar.'
      : 'Technical concepts explored step by step, organized as series.';
  const ogImageUrl = `/og?${new URLSearchParams({ title, description, lang: locale, kind: 'page' })}`;

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
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SeriesListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const now = new Date();
  const messages = getMessages(locale);
  const seriesList = await loadPublicSeriesWithArticles(lang, now);

  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'seriesList');

  return (
    <div className="min-h-screen bg-surface">
      <SiteNav lang={locale} altLangUrl={altLangUrl} />

      <main className="mx-auto max-w-[720px] px-6 py-16">
        <header className="mb-12">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
            nacianil.com
          </p>
          <h1 className="font-serif text-3xl font-semibold text-ink">
            {locale === 'tr' ? 'Yazılar' : 'Articles'}
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-secondary">
            {locale === 'tr'
              ? 'Teknik kavramları seri yapısında, adım adım inceleyen yazılar.'
              : 'Technical concepts explored step by step, organized as series.'}
          </p>
        </header>

        {seriesList.length === 0 && (
          <p className="font-sans text-sm text-ink-secondary">
            {locale === 'tr' ? 'Henüz yayınlanmış içerik yok.' : 'No published content yet.'}
          </p>
        )}

        <ul className="space-y-4" role="list">
          {seriesList.map(({ series, slug, articleCount, firstSlugBase }) => {
            const title = series.title[locale];
            const description = series.description[locale];
            const href = buildUrl(locale, 'seriesLanding', { seriesSlug: slug });

            return (
              <li key={slug}>
                <Link
                  href={href}
                  className="group block rounded-card border border-hairline bg-card px-6 py-5 transition-colors hover:border-ink-secondary/40"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h2 className="font-serif text-xl font-semibold text-ink transition-colors group-hover:text-accent">
                      {title}
                    </h2>
                    <span className="mt-1 flex-shrink-0 font-sans text-xs text-ink-secondary/60">
                      {articleCount} {locale === 'tr' ? 'yazı' : 'articles'}
                    </span>
                  </div>
                  <p className="font-sans text-sm leading-relaxed text-ink-secondary">
                    {description}
                  </p>
                  {firstSlugBase && (
                    <p className="mt-3 font-sans text-xs font-medium text-accent">
                      {locale === 'tr' ? 'Okumaya başla →' : 'Start reading →'}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
