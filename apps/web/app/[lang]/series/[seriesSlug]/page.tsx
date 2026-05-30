import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildUrl, formatReadingTime, deriveCanonical } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import {
  loadSeries,
  loadSeriesArticles,
  listSeriesSlugs,
} from '../../../../src/content/loader';
import { SiteNav } from '../../../../src/components/SiteNav';
import { getMessages } from '../../../../src/lib/messages';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../../src/lib/site';
import { seriesJsonLd, breadcrumbJsonLd } from '../../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

export async function generateStaticParams() {
  const slugs = await listSeriesSlugs();
  const params: { lang: string; seriesSlug: string }[] = [];
  for (const lang of ['tr', 'en']) {
    for (const seriesSlug of slugs) {
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
  const messages = getMessages(locale);

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <main className="mx-auto max-w-[720px] px-6 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 font-sans text-xs text-ink-secondary/60">
              <li>
                <Link href={buildUrl(locale, 'seriesList')} className="hover:text-ink-secondary transition-colors">
                  {locale === 'tr' ? 'Yazılar' : 'Articles'}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-secondary">{title}</li>
            </ol>
          </nav>

          {/* Hero */}
          <header className="mb-10 border-l-[3px] border-accent pl-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent/80">
              {messages.series}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight text-ink">
              {title}
            </h1>
            <p className="mt-3 font-sans text-base leading-relaxed text-ink-secondary">
              {description}
            </p>
            <p className="mt-3 font-sans text-xs text-ink-secondary/60">
              {articles.length} {locale === 'tr' ? 'yazı' : 'articles'}
            </p>
          </header>

          {/* Article list */}
          <ol className="space-y-3" role="list">
            {articles.map((article, i) => {
              const articleTitle = article.frontmatter.title;
              const href = buildUrl(locale, 'article', {
                seriesSlug,
                articleSlug: article.meta.slugBase,
              });
              const timeLabel = formatReadingTime(article.readingTimeMinutes, locale);

              return (
                <li key={article.id}>
                  <Link
                    href={href}
                    className="group flex items-start gap-4 rounded-card border border-hairline bg-card px-5 py-4 transition-colors hover:border-ink-secondary/40"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface font-mono text-xs font-medium text-ink-secondary/60"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-base font-semibold text-ink transition-colors group-hover:text-accent line-clamp-2">
                        {articleTitle}
                      </p>
                      <p className="mt-1 font-sans text-xs text-ink-secondary/70">{timeLabel}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mt-1 flex-shrink-0 text-ink-secondary/30 transition-colors group-hover:text-accent"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {/* Start reading CTA */}
          {articles[0] && (
            <div className="mt-8">
              <Link
                href={buildUrl(locale, 'article', {
                  seriesSlug,
                  articleSlug: articles[0].meta.slugBase,
                })}
                className="inline-flex items-center gap-2 rounded-card border border-accent bg-accent px-5 py-2.5 font-sans text-sm font-medium text-card transition-opacity hover:opacity-90"
              >
                {locale === 'tr' ? 'İlk yazıdan başla' : 'Start from the first article'}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
