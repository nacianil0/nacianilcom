import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildUrl, formatReadingTime, deriveCanonical, isPublic } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { Masthead, MonoLabel } from '@nacianilcom/ui';
import {
  loadSeries,
  loadSeriesArticles,
  listSeriesSlugs,
  listArticleIds,
  loadMeta,
} from '../../../../src/content/loader';
import { SiteNav } from '../../../../src/components/SiteNav';
import { SiteFooter } from '../../../../src/components/SiteFooter';
import { Crumbs } from '../../../../src/components/Crumbs';
import { ListRow } from '../../../../src/components/ListRow';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../../src/lib/site';
import { seriesJsonLd, breadcrumbJsonLd } from '../../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const now = new Date();
  const slugs = await listSeriesSlugs();
  const params: { lang: string; seriesSlug: string }[] = [];

  for (const seriesSlug of slugs) {
    const ids = await listArticleIds(seriesSlug);
    let hasPublic = false;
    for (const id of ids) {
      const meta = await loadMeta(seriesSlug, id);
      if (meta && isPublic(meta, now)) { hasPublic = true; break; }
    }
    if (!hasPublic) continue;
    for (const lang of ['tr', 'en']) {
      params.push({ lang, seriesSlug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; seriesSlug: string }>;
}): Promise<Metadata> {
  const { lang, seriesSlug } = await params;
  if (!VALID_LANGS.has(lang)) return {};

  const locale = lang as Locale;
  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';

  const series = await loadSeries(seriesSlug);
  if (!series) return { title: 'Not found' };

  const now = new Date();
  const articles = await loadSeriesArticles(seriesSlug, lang, now);
  if (articles.length === 0) return { title: 'Not found' };

  const title = series.title[locale];
  const description = series.description[locale];
  const { canonical, hreflang } = deriveCanonical(locale, { kind: 'seriesLanding', seriesSlug }, ['tr', 'en']);
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const langs: Record<string, string> = {};
  for (const h of hreflang) langs[h.lang] = `${SITE_URL}${h.url}`;

  const ogImageUrl = `/og?${new URLSearchParams({ title, description, lang: locale, kind: 'series' })}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl, languages: langs },
    openGraph: {
      type: 'website',
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

export default async function SeriesLandingPage({
  params,
}: {
  params: Promise<{ lang: string; seriesSlug: string }>;
}) {
  const { lang, seriesSlug } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const now = new Date();

  const series = await loadSeries(seriesSlug);
  if (!series) notFound();

  const articles = await loadSeriesArticles(seriesSlug, lang, now);
  if (articles.length === 0) notFound();

  const title = series.title[locale];
  const description = series.description[locale];
  const altLang: Locale = locale === 'tr' ? 'en' : 'tr';
  const altLangUrl = buildUrl(altLang, 'seriesLanding', { seriesSlug });

  const { canonical } = deriveCanonical(locale, { kind: 'seriesLanding', seriesSlug }, ['tr', 'en']);
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const articleUrls = articles.map(
    a => `${SITE_URL}${buildUrl(locale, 'article', { seriesSlug, articleSlug: a.meta.slugBase })}`
  );

  const seriesLd = seriesJsonLd({ title, description, url: canonicalUrl, lang: locale, articleUrls });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Yazılar' : 'Articles', url: `${SITE_URL}${buildUrl(locale, 'seriesList')}` },
    { name: title, url: canonicalUrl },
  ]);

  const firstArticle = articles[0];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="flex min-h-screen flex-col bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <Masthead
          crumbs={<Crumbs items={[{ label: locale === 'tr' ? 'Yazılar' : 'Writing', href: buildUrl(locale, 'seriesList') }]} />}
          badge={locale === 'tr' ? 'SERİ' : 'SERIES'}
          aside={
            <MonoLabel>
              {articles.length} {locale === 'tr' ? 'yazı' : 'articles'}
            </MonoLabel>
          }
          title={title}
          lead={description}
        />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-14 sm:px-10 lg:px-14">
          <ol className="border-t border-hairline" role="list">
            {articles.map((article, i) => (
              <ListRow
                key={article.id}
                href={buildUrl(locale, 'article', { seriesSlug, articleSlug: article.meta.slugBase })}
                index={String(i + 1).padStart(2, '0')}
                title={article.frontmatter.title}
                {...(article.frontmatter.summary ? { description: article.frontmatter.summary } : {})}
                meta={<MonoLabel>{formatReadingTime(article.readingTimeMinutes, locale)}</MonoLabel>}
              />
            ))}
          </ol>

          {firstArticle && (
            <div className="mt-10">
              <Link
                href={buildUrl(locale, 'article', { seriesSlug, articleSlug: firstArticle.meta.slugBase })}
                className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-surface transition-colors hover:border-accent hover:bg-accent"
              >
                {locale === 'tr' ? 'İlk yazıdan başla' : 'Start from the first article'}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </main>

        <SiteFooter lang={locale} />
      </div>
    </>
  );
}
