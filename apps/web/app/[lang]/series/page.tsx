import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { Masthead, MonoLabel } from '@nacianilcom/ui';
import { loadPublicSeriesWithArticles } from '../../../src/content/loader';
import { SiteNav } from '../../../src/components/SiteNav';
import { SiteFooter } from '../../../src/components/SiteFooter';
import { Crumbs } from '../../../src/components/Crumbs';
import { ListRow } from '../../../src/components/ListRow';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../src/lib/site';

const VALID_LANGS = new Set(['tr', 'en']);

export const revalidate = 3600;

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
  const seriesList = await loadPublicSeriesWithArticles(lang, now);

  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'seriesList');

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteNav lang={locale} altLangUrl={altLangUrl} />

      <Masthead
        crumbs={<Crumbs items={[{ label: locale === 'tr' ? 'Ana sayfa' : 'Home', href: buildUrl(locale, 'home') }]} />}
        aside={
          <MonoLabel>
            {seriesList.length} {locale === 'tr' ? 'seri' : 'series'}
          </MonoLabel>
        }
        title={locale === 'tr' ? 'Yazılar' : 'Writing'}
        lead={
          locale === 'tr'
            ? 'Teknik kavramları seri yapısında, adım adım inceleyen yazılar.'
            : 'Technical concepts explored step by step, organized as series.'
        }
      />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-14 sm:px-10 lg:px-14">
        {seriesList.length === 0 ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            {locale === 'tr' ? 'Henüz yayınlanmış içerik yok.' : 'No published content yet.'}
          </p>
        ) : (
          <ul className="border-t border-hairline" role="list">
            {seriesList.map(({ series, slug, articleCount }, i) => (
              <ListRow
                key={slug}
                href={buildUrl(locale, 'seriesLanding', { seriesSlug: slug })}
                index={String(i + 1).padStart(2, '0')}
                title={series.title[locale]}
                description={series.description[locale]}
                meta={
                  <MonoLabel>
                    {articleCount} {locale === 'tr' ? 'yazı' : 'articles'}
                  </MonoLabel>
                }
              />
            ))}
          </ul>
        )}
      </main>

      <SiteFooter lang={locale} />
    </div>
  );
}
