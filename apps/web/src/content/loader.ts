import fs from 'fs/promises';
import path from 'path';
import {
  parseJson,
  parseMdx,
  MetaSchema,
  SeriesSchema,
  ReferencesSchema,
  isPublic,
  BilingualResumeSchema,
  BilingualCaseStudySchema,
  filterResumeByVisibility,
} from '@nacianilcom/content-core';
import type {
  Meta,
  Series,
  References,
  Frontmatter,
  ContentCatalog,
  ArticleLookup,
  SeriesLookup,
  Resume,
  CaseStudy,
} from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';

function contentRoot(): string {
  // process.cwd() = apps/web during Next.js dev/build
  return path.join(process.cwd(), '..', '..', 'content');
}

function seriesDir(seriesSlug: string): string {
  return path.join(contentRoot(), 'series', seriesSlug);
}

function articleDir(seriesSlug: string, articleId: string): string {
  return path.join(seriesDir(seriesSlug), 'articles', articleId);
}

async function readFile(filePath: string): Promise<string | null> {
  return fs.readFile(filePath, 'utf-8').catch(() => null);
}

export async function loadSeries(seriesSlug: string): Promise<Series | null> {
  const raw = await readFile(path.join(seriesDir(seriesSlug), 'series.json'));
  if (!raw) return null;
  return parseJson(raw, SeriesSchema).data;
}

export async function loadMeta(seriesSlug: string, articleId: string) {
  const raw = await readFile(path.join(articleDir(seriesSlug, articleId), 'meta.json'));
  if (!raw) return null;
  return parseJson(raw, MetaSchema).data;
}

export interface MdxData {
  frontmatter: Frontmatter;
  content: string;
}

export async function loadMdx(
  seriesSlug: string,
  articleId: string,
  lang: string
): Promise<MdxData | null> {
  const raw = await readFile(
    path.join(articleDir(seriesSlug, articleId), `final.${lang}.mdx`)
  );
  if (!raw) return null;
  const result = parseMdx(raw);
  if (!result.frontmatter) return null;
  return { frontmatter: result.frontmatter, content: result.content };
}

export async function loadReferences(
  seriesSlug: string,
  articleId: string
): Promise<References> {
  const raw = await readFile(
    path.join(articleDir(seriesSlug, articleId), 'references.json')
  );
  if (!raw) return [];
  return parseJson(raw, ReferencesSchema).data ?? [];
}

export async function listSeriesSlugs(): Promise<string[]> {
  const dir = path.join(contentRoot(), 'series');
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

export async function listArticleIds(seriesSlug: string): Promise<string[]> {
  const dir = path.join(seriesDir(seriesSlug), 'articles');
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

export async function findArticleIdBySlug(
  seriesSlug: string,
  slugBase: string
): Promise<{ id: string; meta: Meta } | null> {
  const ids = await listArticleIds(seriesSlug);
  for (const id of ids) {
    const meta = await loadMeta(seriesSlug, id);
    if (meta && meta.slugBase === slugBase) return { id, meta };
  }
  return null;
}

export async function buildContentCatalog(): Promise<ContentCatalog> {
  const seriesSlugs = await listSeriesSlugs();
  const articles: ArticleLookup[] = [];
  const seriesList: SeriesLookup[] = [];

  for (const slug of seriesSlugs) {
    seriesList.push({ slug });
    const ids = await listArticleIds(slug);
    for (const id of ids) {
      const meta = await loadMeta(slug, id);
      if (meta) {
        articles.push({
          id: meta.id,
          seriesSlug: slug,
          slugBase: meta.slugBase,
          status: meta.status,
          publishDate: meta.publishDate,
        });
      }
    }
  }

  return { articles, series: seriesList, cases: [] };
}

// ─── Resume + Portfolio loaders (WP-12) ──────────────────────────────────────

function resumeDir(): string {
  return path.join(contentRoot(), 'resume');
}

export async function loadResume(lang: Locale, mode: 'web' | 'pdf'): Promise<Resume | null> {
  const raw = await readFile(path.join(resumeDir(), 'resume.json'));
  if (!raw) return null;
  const result = parseJson(raw, BilingualResumeSchema);
  if (!result.data) return null;
  return filterResumeByVisibility(result.data[lang], mode);
}

export async function listCaseSlugs(): Promise<string[]> {
  const dir = path.join(resumeDir(), 'portfolio');
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries.filter(e => e.isDirectory()).map(e => e.name).sort();
}

export async function loadCase(slug: string, lang: Locale): Promise<CaseStudy | null> {
  const raw = await readFile(path.join(resumeDir(), 'portfolio', slug, 'case.json'));
  if (!raw) return null;
  const result = parseJson(raw, BilingualCaseStudySchema);
  if (!result.data) return null;
  const c = result.data[lang];
  if (c.visibility === 'private') return null;
  return c;
}

export async function loadPublicCases(lang: Locale): Promise<CaseStudy[]> {
  const slugs = await listCaseSlugs();
  const results: CaseStudy[] = [];
  for (const slug of slugs) {
    const c = await loadCase(slug, lang);
    if (c) results.push(c);
  }
  return results;
}

export async function loadPublicSeriesWithArticles(
  lang: string,
  now: Date
): Promise<
  Array<{
    series: Series;
    slug: string;
    articleCount: number;
    firstSlugBase: string | null;
  }>
> {
  const slugs = await listSeriesSlugs();
  const results = [];

  for (const slug of slugs) {
    const series = await loadSeries(slug);
    if (!series) continue;

    const ids = await listArticleIds(slug);
    let count = 0;
    let firstSlugBase: string | null = null;

    for (const id of ids) {
      const meta = await loadMeta(slug, id);
      if (!meta) continue;
      if (!isPublic(meta, now)) continue;
      const mdx = await loadMdx(slug, id, lang);
      if (!mdx) continue;
      count++;
      if (firstSlugBase === null) firstSlugBase = meta.slugBase;
    }

    if (count > 0) {
      results.push({ series, slug, articleCount: count, firstSlugBase });
    }
  }

  return results;
}

export async function loadSeriesArticles(
  seriesSlug: string,
  lang: string,
  now: Date
): Promise<
  Array<{
    id: string;
    meta: Meta;
    frontmatter: Frontmatter;
    readingTimeMinutes: number;
  }>
> {
  const series = await loadSeries(seriesSlug);
  if (!series) return [];

  const { calcReadingTime } = await import('@nacianilcom/content-core');
  const results = [];

  for (const id of series.articleOrder) {
    const meta = await loadMeta(seriesSlug, id);
    if (!meta) continue;
    if (!isPublic(meta, now)) continue;
    const mdx = await loadMdx(seriesSlug, id, lang);
    if (!mdx) continue;
    results.push({
      id,
      meta,
      frontmatter: mdx.frontmatter,
      readingTimeMinutes: calcReadingTime(mdx.content),
    });
  }

  return results;
}
