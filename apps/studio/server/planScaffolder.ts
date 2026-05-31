import path from 'path';
import fs from 'fs/promises';
import type { Topic, MonthlyPlan, Meta, Series } from '@nacianilcom/content-core';
import { MetaSchema, SeriesSchema } from '@nacianilcom/content-core';

const TR_ASCII: Record<string, string> = {
  ş: 's', ç: 'c', ö: 'o', ü: 'u', ğ: 'g', ı: 'i', Ş: 's', Ç: 'c', Ö: 'o', Ü: 'u', Ğ: 'g', İ: 'i',
};

export interface ScaffoldArticle {
  seriesSlug: string;
  articleId: string;
  path: string;
  created: boolean;
}

export interface ScaffoldSeries {
  slug: string;
  created: boolean;
  articles: ScaffoldArticle[];
}

export interface ScaffoldResult {
  series: ScaffoldSeries[];
  ideasWritten: number;
}

const SERIES_PRESETS: Record<string, { title: Series['title']; description: Series['description'] }> = {
  'llm-nasil-calisir': {
    title: { tr: "LLM'ler Nasıl Çalışır", en: 'How LLMs Work' },
    description: {
      tr: 'Token\'dan transformer\'a: büyük dil modellerinin nasıl çalıştığını adım adım inceliyoruz.',
      en: 'From tokens to transformers: a step-by-step look at how large language models work.',
    },
  },
};

function slugify(text: string, maxLen = 48): string {
  let s = text.trim();
  for (const [from, to] of Object.entries(TR_ASCII)) s = s.split(from).join(to);
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen)
    .replace(/-$/, '');
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function standaloneSeriesSlug(planMonth: string): string {
  return `${planMonth}-bagimsiz`;
}

function schemaTypeFor(contentType: Topic['contentType']): Meta['schemaType'] {
  if (contentType === 'essay') return 'BlogPosting';
  return 'TechArticle';
}

function defaultTags(contentType: Topic['contentType']): string[] {
  void contentType;
  return ['temel-kavramlar'];
}

function draftStructureFromTopic(topic: Topic): string[] {
  const base = topic.title.split(/[?:—–-]/)[0]?.trim() ?? topic.title;
  return [
    `${base}: Giriş`,
    topic.angle.split(/[.;]/)[0]?.trim() ?? 'Ana kavram',
    'Somut örnek',
    'Pratikte ne anlama geliyor?',
    'Özet ve sonraki adım',
  ].filter(Boolean);
}

function briefFromTopic(topic: Topic, seriesContext: string) {
  return {
    topic: topic.title,
    seriesContext,
    targetAudience: topic.targetAudience,
    learningObjectives: [
      topic.angle,
      `Kaynak temeli: ${topic.sourceBasis}`,
    ],
    readerQuestions: [
      `${topic.title.replace(/\?$/, '')} ne demek?`,
      'Bu kavram neden önemli?',
      'Pratikte nerede karşıma çıkar?',
    ],
    outOfScope: [topic.riskOfRepetition],
    suggestedExamples: [topic.visualPotential, topic.requiredResearch],
    draftStructure: draftStructureFromTopic(topic),
    estimatedReadingTime: topic.estimatedReadingTime,
    planRef: {
      whyNow: topic.whyNow,
      sourceBasis: topic.sourceBasis,
      nextAction: topic.nextAction,
      suggestedPublishWeek: topic.suggestedPublishWeek,
    },
  };
}

function metaFromTopic(
  topic: Topic,
  seriesSlug: string,
  order: number,
  articleId: string,
  publishDate: string,
): Meta {
  const slugBase = slugify(topic.title, 60);
  return MetaSchema.parse({
    id: articleId,
    series: seriesSlug,
    order,
    slugBase,
    category: 'programlama-temelleri',
    tags: defaultTags(topic.contentType),
    difficulty: topic.difficulty,
    status: 'draft',
    publishDate,
    schemaType: schemaTypeFor(topic.contentType),
    contentType: topic.contentType,
    languages: ['tr', 'en'],
    assets: { diagrams: [] },
  });
}

async function readSeriesOrder(contentRoot: string): Promise<number> {
  const seriesDir = path.join(contentRoot, 'series');
  const entries = await fs.readdir(seriesDir, { withFileTypes: true }).catch(() => []);
  let maxOrder = 0;
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    try {
      const raw = await fs.readFile(path.join(seriesDir, e.name, 'series.json'), 'utf-8');
      const data = SeriesSchema.parse(JSON.parse(raw));
      if (data.order > maxOrder) maxOrder = data.order;
    } catch { /* skip */ }
  }
  return maxOrder + 1;
}

async function loadSeries(contentRoot: string, slug: string): Promise<Series | null> {
  try {
    const raw = await fs.readFile(path.join(contentRoot, 'series', slug, 'series.json'), 'utf-8');
    return SeriesSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function seriesMetaForSlug(slug: string, plan: MonthlyPlan): { title: Series['title']; description: Series['description'] } {
  if (SERIES_PRESETS[slug]) return SERIES_PRESETS[slug];
  if (slug.endsWith('-bagimsiz')) {
    return {
      title: { tr: 'Bağımsız Yazılar', en: 'Standalone Articles' },
      description: {
        tr: `${plan.month} editoryal planındaki seriye bağlı olmayan konular.`,
        en: `Topics from the ${plan.month} editorial plan that are not part of a named series.`,
      },
    };
  }
  const label = humanizeSlug(slug);
  const theme = plan.editorialTheme?.trim();
  return {
    title: { tr: label, en: label },
    description: {
      tr: theme ?? `${plan.month} planından türetilen içerik serisi.`,
      en: theme ?? `Content series scaffolded from the ${plan.month} plan.`,
    },
  };
}

function groupTopicsBySeries(plan: MonthlyPlan): Map<string, Topic[]> {
  const groups = new Map<string, Topic[]>();
  for (const topic of plan.selected) {
    const key = topic.seriesFit === 'standalone' ? standaloneSeriesSlug(plan.month) : topic.seriesFit;
    const list = groups.get(key) ?? [];
    list.push(topic);
    groups.set(key, list);
  }
  for (const [key, topics] of groups) {
    topics.sort((a, b) => {
      if (a.suggestedPublishWeek !== b.suggestedPublishWeek) {
        return a.suggestedPublishWeek - b.suggestedPublishWeek;
      }
      return plan.selected.indexOf(a) - plan.selected.indexOf(b);
    });
    groups.set(key, topics);
  }
  return groups;
}

/**
 * On plan approve: create series.json (if missing), meta.json + brief.json per selected topic.
 * Idempotent — existing files are not overwritten.
 */
export async function scaffoldFromPlan(contentRoot: string, plan: MonthlyPlan): Promise<ScaffoldResult> {
  const groups = groupTopicsBySeries(plan);
  const publishDate = `${plan.month}-01`;
  const result: ScaffoldResult = { series: [], ideasWritten: 0 };

  let nextOrder = await readSeriesOrder(contentRoot);

  for (const [seriesSlug, topics] of groups) {
    const seriesDir = path.join(contentRoot, 'series', seriesSlug);
    const articlesDir = path.join(seriesDir, 'articles');
    await fs.mkdir(articlesDir, { recursive: true });

    let series = await loadSeries(contentRoot, seriesSlug);
    let seriesCreated = false;

    if (!series) {
      const { title, description } = seriesMetaForSlug(seriesSlug, plan);
      series = SeriesSchema.parse({
        slug: seriesSlug,
        title,
        description,
        order: nextOrder++,
        articleOrder: [],
      });
      await fs.writeFile(
        path.join(seriesDir, 'series.json'),
        JSON.stringify(series, null, 2) + '\n',
        'utf-8',
      );
      seriesCreated = true;
    }

    const seriesEntry: ScaffoldSeries = { slug: seriesSlug, created: seriesCreated, articles: [] };
    const articleOrder = [...series.articleOrder];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]!;
      const order = i + 1;
      const articleId = `${String(order).padStart(2, '0')}-${slugify(topic.title)}`;
      const articleDir = path.join(articlesDir, articleId);
      await fs.mkdir(articleDir, { recursive: true });

      const metaPath = path.join(articleDir, 'meta.json');
      const briefPath = path.join(articleDir, 'brief.json');
      let created = false;

      try {
        await fs.access(metaPath);
      } catch {
        const meta = metaFromTopic(topic, seriesSlug, order, articleId, publishDate);
        await fs.writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');
        created = true;
      }

      try {
        await fs.access(briefPath);
      } catch {
        const seriesContext = seriesSlug.endsWith('-bagimsiz')
          ? `${plan.month} planındaki bağımsız yazı — ${topic.whyNow}`
          : `${series.title.tr} serisinin ${order}. yazısı — ${topic.whyNow}`;
        await fs.writeFile(
          briefPath,
          JSON.stringify(briefFromTopic(topic, seriesContext), null, 2) + '\n',
          'utf-8',
        );
        created = true;
      }

      if (!articleOrder.includes(articleId)) articleOrder.push(articleId);

      seriesEntry.articles.push({
        seriesSlug,
        articleId,
        path: `content/series/${seriesSlug}/articles/${articleId}`,
        created,
      });
    }

    const updatedSeries = { ...series, articleOrder };
    await fs.writeFile(
      path.join(seriesDir, 'series.json'),
      JSON.stringify(updatedSeries, null, 2) + '\n',
      'utf-8',
    );

    result.series.push(seriesEntry);
  }

  const ideasDir = path.join(contentRoot, '_ideas');
  await fs.mkdir(ideasDir, { recursive: true });
  for (const topic of plan.selected) {
    const slug = slugify(topic.title, 60);
    const filename = `${plan.month}-${slug}.json`;
    await fs.writeFile(
      path.join(ideasDir, filename),
      JSON.stringify({ month: plan.month, topic }, null, 2) + '\n',
      'utf-8',
    );
    result.ideasWritten++;
  }

  return result;
}
