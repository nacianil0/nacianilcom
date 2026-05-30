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
import { Masthead } from '@nacianilcom/ui';
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
import { SiteFooter } from '../../../../../src/components/SiteFooter';
import { Crumbs } from '../../../../../src/components/Crumbs';
import { MetadataRow } from '../../../../../src/components/MetadataRow';
import { SeriesPositionBadge } from '../../../../../src/components/SeriesPositionBadge';
import { ReferencesSection } from '../../../../../src/components/ReferencesSection';
import { PrevNextNav } from '../../../../../src/components/PrevNextNav';
import { TOC } from '../../../../../src/components/TOC';
import { getMessages } from '../../../../../src/lib/messages';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../../../src/lib/site';
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '../../../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

export const dynamicParams = true;
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

      <div className="flex min-h-screen flex-col bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <Masthead
          crumbs={
            <Crumbs
              items={[
                { label: locale === 'tr' ? 'Yazılar' : 'Writing', href: buildUrl(locale, 'seriesList') },
                { label: seriesTitle, href: seriesUrl },
              ]}
            />
          }
        />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-12 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,760px)_180px]">
            <article data-reading aria-labelledby="article-title">
              <header>
                <SeriesPositionBadge
                  position={position}
                  total={series.articleOrder.length}
                  seriesTitle={seriesTitle}
                />
                <h1
                  id="article-title"
                  className="mt-3 font-serif text-[34px] font-semibold leading-[1.08] tracking-[-0.01em] text-ink sm:text-[44px]"
                >
                  {mdxData.frontmatter.title}
                  <span className="text-accent">.</span>
                </h1>
              </header>

              <div className="mt-5">
                <MetadataRow
                  meta={meta}
                  readingTimeMinutes={readingTimeMinutes}
                  lang={locale}
                  messages={messages}
                />
              </div>

              <p className="mt-6 border-l-2 border-accent pl-4 font-sans text-[15.5px] leading-[1.7] text-ink-secondary">
                {mdxData.frontmatter.summary}
              </p>

              <div className="prose mt-8 max-w-none">
                <MDXRemote
                  source={mdxData.content}
                  components={components}
                  options={{
                    // Author-controlled MDX in git; CodeBlock uses `{`…`}` children.
                    blockJS: false,
                    mdxOptions: {
                      rehypePlugins: [rehypeSlug],
                    },
                  }}
                />
              </div>

              <ReferencesSection references={references} messages={messages} />

              <PrevNextNav
                prev={prevRef}
                next={nextRef}
                seriesSlug={seriesSlug}
                lang={locale}
                messages={messages}
              />

              <div className="mt-10 border-t border-hairline pt-6">
                <Link
                  href={seriesUrl}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink"
                >
                  ← {messages.backToSeries}: {seriesTitle}
                </Link>
              </div>
            </article>

            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <TOC label={locale === 'tr' ? 'İçindekiler' : 'Contents'} />
              </div>
            </aside>
          </div>
        </main>

        <SiteFooter lang={locale} />
      </div>
    </>
  );
}
