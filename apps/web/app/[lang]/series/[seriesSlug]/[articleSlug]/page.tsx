import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import {
  buildUrl,
  calcReadingTime,
  derivePrevNext,
  deriveSeriesPosition,
  deriveCanonical,
  isPublic,
} from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import {
  loadSeries,
  loadMeta,
  loadMdx,
  loadReferences,
  findArticleIdBySlug,
  buildContentCatalog,
  listArticleIds,
  listSeriesSlugs,
} from '../../../../../src/content/loader';
import { getMdxComponents } from '../../../../../src/mdx/components';
import { SiteNav } from '../../../../../src/components/SiteNav';
import { MetadataRow } from '../../../../../src/components/MetadataRow';
import { SeriesPositionBadge } from '../../../../../src/components/SeriesPositionBadge';
import { ReferencesSection } from '../../../../../src/components/ReferencesSection';
import { PrevNextNav } from '../../../../../src/components/PrevNextNav';
import { TOC } from '../../../../../src/components/TOC';
import { getMessages } from '../../../../../src/lib/messages';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../../../src/lib/site';
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '../../../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

// Allow on-demand ISR for future-scheduled articles that become public after build
export const dynamicParams = true;
// Re-render at most once per hour; explicit revalidation overrides this
export const revalidate = 3600;

export async function generateStaticParams() {
  const now = new Date();
  const params: { lang: string; seriesSlug: string; articleSlug: string }[] = [];
  const seriesSlugs = await listSeriesSlugs();

  for (const lang of ['tr', 'en']) {
    for (const seriesSlug of seriesSlugs) {
      const ids = await listArticleIds(seriesSlug);
      for (const id of ids) {
        const meta = await loadMeta(seriesSlug, id);
        if (meta && isPublic(meta, now)) {
          params.push({ lang, seriesSlug, articleSlug: meta.slugBase });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; seriesSlug: string; articleSlug: string }>;
}): Promise<Metadata> {
  const { lang, seriesSlug, articleSlug } = await params;
  if (!VALID_LANGS.has(lang)) return {};

  const locale = lang as Locale;
  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
  const now = new Date();

  const articleInfo = await findArticleIdBySlug(seriesSlug, articleSlug);
  if (!articleInfo) return { title: 'Not found' };

  const { id: articleId, meta } = articleInfo;
  if (!isPublic(meta, now)) return { title: 'Not found' };

  const [series, mdxData] = await Promise.all([
    loadSeries(seriesSlug),
    loadMdx(seriesSlug, articleId, lang),
  ]);
  if (!series || !mdxData) return { title: 'Not found' };

  const { canonical, hreflang } = deriveCanonical(
    locale,
    { kind: 'article', seriesSlug, articleSlug },
    ['tr', 'en']
  );
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const langs: Record<string, string> = {};
  for (const h of hreflang) langs[h.lang] = `${SITE_URL}${h.url}`;

  const title = mdxData.frontmatter.title;
  const description = mdxData.frontmatter.summary;
  const ogImageUrl = `/og?${new URLSearchParams({ title, description, lang: locale, kind: 'article' })}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl, languages: langs },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: localeToOgLocale(locale),
      alternateLocale: localeToOgLocale(altLocale),
      publishedTime: meta.publishDate,
      modifiedTime: meta.updatedDate,
      tags: meta.tags,
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; seriesSlug: string; articleSlug: string }>;
}) {
  const { lang, seriesSlug, articleSlug } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const now = new Date();

  const articleInfo = await findArticleIdBySlug(seriesSlug, articleSlug);
  if (!articleInfo) notFound();

  const { id: articleId, meta } = articleInfo;

  if (!isPublic(meta, now)) notFound();

  const series = await loadSeries(seriesSlug);
  if (!series) notFound();

  const mdxData = await loadMdx(seriesSlug, articleId, lang);
  if (!mdxData) notFound();

  const references = await loadReferences(seriesSlug, articleId);
  const readingTimeMinutes = calcReadingTime(mdxData.content);
  const position = deriveSeriesPosition(articleId, series.articleOrder);
  const { prev: prevId, next: nextId } = derivePrevNext(articleId, series.articleOrder);

  const [prevMeta, nextMeta, prevMdx, nextMdx] = await Promise.all([
    prevId ? loadMeta(seriesSlug, prevId) : null,
    nextId ? loadMeta(seriesSlug, nextId) : null,
    prevId ? loadMdx(seriesSlug, prevId, lang) : null,
    nextId ? loadMdx(seriesSlug, nextId, lang) : null,
  ]);

  const catalog = await buildContentCatalog();
  const messages = getMessages(locale);
  const components = getMdxComponents(locale, catalog);

  const altLang: Locale = locale === 'tr' ? 'en' : 'tr';
  const altLangUrl = buildUrl(altLang, 'article', { seriesSlug, articleSlug });
  const seriesTitle = series.title[locale];
  const seriesUrl = buildUrl(locale, 'seriesLanding', { seriesSlug });

  const prevRef =
    prevMeta && prevMdx
      ? { slugBase: prevMeta.slugBase, title: prevMdx.frontmatter.title }
      : null;
  const nextRef =
    nextMeta && nextMdx
      ? { slugBase: nextMeta.slugBase, title: nextMdx.frontmatter.title }
      : null;

  // JSON-LD
  const { canonical } = deriveCanonical(locale, { kind: 'article', seriesSlug, articleSlug }, ['tr', 'en']);
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const seriesCanonicalUrl = `${SITE_URL}${buildUrl(locale, 'seriesLanding', { seriesSlug })}`;

  const artLd = articleJsonLd({
    schemaType: meta.schemaType,
    title: mdxData.frontmatter.title,
    description: mdxData.frontmatter.summary,
    url: canonicalUrl,
    publishDate: meta.publishDate,
    ...(meta.updatedDate ? { updatedDate: meta.updatedDate } : {}),
    lang: locale,
    tags: meta.tags,
    seriesTitle,
    seriesUrl: seriesCanonicalUrl,
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Yazılar' : 'Articles', url: `${SITE_URL}${buildUrl(locale, 'seriesList')}` },
    { name: seriesTitle, url: seriesCanonicalUrl },
    { name: mdxData.frontmatter.title, url: canonicalUrl },
  ]);

  const faqs = mdxData.frontmatter.faq;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(artLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqs && faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      )}
      <div className="min-h-screen bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,720px)_200px]">
            {/* Article column */}
            <article data-reading aria-labelledby="article-title">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center gap-2 font-sans text-xs text-ink-secondary/60">
                  <li>
                    <Link
                      href={buildUrl(locale, 'seriesList')}
                      className="transition-colors hover:text-ink-secondary"
                    >
                      {locale === 'tr' ? 'Yazılar' : 'Articles'}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={seriesUrl}
                      className="transition-colors hover:text-ink-secondary"
                    >
                      {seriesTitle}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-ink-secondary">
                    {mdxData.frontmatter.title}
                  </li>
                </ol>
              </nav>

              {/* Hero */}
              <header className="mb-8 border-l-[3px] border-accent pl-5">
                <SeriesPositionBadge
                  position={position}
                  total={series.articleOrder.length}
                  seriesTitle={seriesTitle}
                />
                <h1
                  id="article-title"
                  className="mt-2 font-serif text-[2.125rem] font-semibold leading-[1.15] text-ink"
                >
                  {mdxData.frontmatter.title}
                </h1>
              </header>

              {/* Metadata row */}
              <MetadataRow
                meta={meta}
                readingTimeMinutes={readingTimeMinutes}
                lang={locale}
                messages={messages}
              />

              {/* Summary */}
              <p className="mt-6 font-sans text-base leading-[1.75] text-ink-secondary border-l-2 border-hairline pl-4">
                {mdxData.frontmatter.summary}
              </p>

              {/* MDX content */}
              <div className="prose prose-sm mt-8 max-w-none sm:prose">
                <MDXRemote
                  source={mdxData.content}
                  components={components}
                  options={{
                    mdxOptions: {
                      rehypePlugins: [rehypeSlug],
                    },
                  }}
                />
              </div>

              {/* References */}
              <ReferencesSection references={references} messages={messages} />

              {/* Prev / Next */}
              <PrevNextNav
                prev={prevRef}
                next={nextRef}
                seriesSlug={seriesSlug}
                lang={locale}
                messages={messages}
              />

              {/* Back to series */}
              <div className="mt-8 border-t border-hairline pt-6">
                <Link
                  href={seriesUrl}
                  className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
                >
                  ← {messages.backToSeries}: {seriesTitle}
                </Link>
              </div>
            </article>

            {/* Optional sticky TOC — desktop only */}
            <aside className="hidden xl:block">
              <div className="sticky top-20">
                <TOC />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
