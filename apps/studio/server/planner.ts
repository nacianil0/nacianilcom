import path from 'path';
import fs from 'fs/promises';
import type { Topic, MonthlyPlan, Scores } from '@nacianilcom/content-core';
import type { PlanQCIssue } from '@nacianilcom/content-core';
import { runPlanQC } from '@nacianilcom/content-core';

// ─── Content Analysis ─────────────────────────────────────────────────────────

export interface SeriesSummary {
  slug: string;
  title: string;
  articleCount: number;
  publishedCount: number;
  categories: string[];
  tags: string[];
}

export interface ContentAnalysis {
  series: SeriesSummary[];
  backlogCount: number;
  categoryDistribution: Record<string, number>;
  tagDistribution: Record<string, number>;
  publishedThisYear: number;
}

export async function analyzeContent(contentRoot: string): Promise<ContentAnalysis> {
  const seriesDir = path.join(contentRoot, 'series');
  let seriesDirs: string[] = [];
  try {
    const entries = await fs.readdir(seriesDir, { withFileTypes: true });
    seriesDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch { /* empty */ }

  const series: SeriesSummary[] = [];
  const categoryDistribution: Record<string, number> = {};
  const tagDistribution: Record<string, number> = {};
  let publishedThisYear = 0;

  const thisYear = new Date().getFullYear().toString();

  for (const slug of seriesDirs) {
    let seriesTitle = slug;
    try {
      const rawSeries = await fs.readFile(
        path.join(seriesDir, slug, 'series.json'), 'utf-8'
      );
      const seriesData = JSON.parse(rawSeries) as Record<string, unknown>;
      const titleObj = seriesData['title'] as Record<string, string> | undefined;
      seriesTitle = titleObj?.['tr'] ?? titleObj?.['en'] ?? slug;
    } catch { /* use slug */ }

    const articlesDir = path.join(seriesDir, slug, 'articles');
    let articleDirs: string[] = [];
    try {
      const entries = await fs.readdir(articlesDir, { withFileTypes: true });
      articleDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    } catch { /* empty */ }

    const categories: string[] = [];
    const tags: string[] = [];
    let publishedCount = 0;

    for (const articleId of articleDirs) {
      try {
        const rawMeta = await fs.readFile(
          path.join(articlesDir, articleId, 'meta.json'), 'utf-8'
        );
        const meta = JSON.parse(rawMeta) as Record<string, unknown>;
        const cat = meta['category'] as string | undefined;
        const metaTags = meta['tags'] as string[] | undefined;
        const status = meta['status'] as string | undefined;
        const publishDate = meta['publishDate'] as string | undefined;

        if (cat) {
          categories.push(cat);
          categoryDistribution[cat] = (categoryDistribution[cat] ?? 0) + 1;
        }
        if (metaTags) {
          for (const tag of metaTags) {
            tags.push(tag);
            tagDistribution[tag] = (tagDistribution[tag] ?? 0) + 1;
          }
        }
        if (status === 'published') {
          publishedCount++;
          if (publishDate?.startsWith(thisYear)) publishedThisYear++;
        }
      } catch { /* skip */ }
    }

    series.push({
      slug,
      title: seriesTitle,
      articleCount: articleDirs.length,
      publishedCount,
      categories: [...new Set(categories)],
      tags: [...new Set(tags)],
    });
  }

  // Count backlog ideas
  let backlogCount = 0;
  try {
    const ideasDir = path.join(contentRoot, '_ideas');
    const ideasEntries = await fs.readdir(ideasDir, { withFileTypes: true });
    backlogCount = ideasEntries.filter(e => e.isFile() && e.name.endsWith('.json')).length;
  } catch { /* empty */ }

  return { series, backlogCount, categoryDistribution, tagDistribution, publishedThisYear };
}

// ─── Candidate Pool Generation ───────────────────────────────────────────────

const CONTENT_TYPES = ['explainer', 'research', 'architecture', 'essay'] as const;
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

function makeBaseScores(overrides: Partial<Scores> = {}): Scores {
  return {
    relevance: 5,
    seriesFit: 5,
    novelty: 5,
    riskOfRepetition: 3,
    seoPotential: 5,
    geoPotential: 5,
    difficulty: 5,
    estimatedEffort: 5,
    visualPotential: 4,
    ...overrides,
  };
}

/**
 * Generates a 25-40 topic candidate pool from content analysis.
 * Deterministic — no LLM needed. Suggests series continuations + gap fillers.
 */
export function generateCandidatePool(
  analysis: ContentAnalysis,
  userNotes: string
): Topic[] {
  const candidates: Topic[] = [];
  const usedTitles = new Set<string>();

  // 1. Series continuation topics (each series → next article)
  for (const s of analysis.series) {
    const nextNum = s.articleCount + 1;
    const title = `${s.title} — Bölüm ${nextNum}`;
    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      candidates.push({
        title,
        angle: `${s.title} serisinin devamı (${nextNum}. bölüm)`,
        whyNow: `Seri devam ediyor; okuyucu yolculuğunu tamamlamak için`,
        targetAudience: 'mevcut seri okuyucuları',
        seriesFit: s.slug,
        difficulty: 'intermediate',
        estimatedReadingTime: 8,
        suggestedPublishWeek: 1,
        contentType: 'explainer',
        seoPotential: 'medium — seri içi bağlantı gücü',
        geoPotential: 'TR-first',
        visualPotential: 'diagram possible',
        riskOfRepetition: 'low — yeni bölüm',
        requiredResearch: 'existing knowledge',
        sourceBasis: 'own experience + seri planı',
        nextAction: 'brief',
        scores: makeBaseScores({ seriesFit: 9, novelty: 7, riskOfRepetition: 2 }),
      });
    }
  }

  // 2. Category gap fillers (underrepresented categories)
  const categoryGaps = findCategoryGaps(analysis);
  const difficultyRota = [...DIFFICULTIES] as string[];
  for (const cat of categoryGaps.slice(0, 8)) {
    const difficulty = difficultyRota[candidates.length % 3];
    const contentType = CONTENT_TYPES[candidates.length % 4];
    const title = `${cat}: Temel Kavramlar`;
    if (!usedTitles.has(title) && difficulty && contentType) {
      usedTitles.add(title);
      candidates.push({
        title,
        angle: `${cat} kategorisinde boşluk doldurma`,
        whyNow: `${cat} içeriği az; okuyucu talebi var`,
        targetAudience: 'meraklı yazılımcılar',
        seriesFit: 'standalone',
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimatedReadingTime: 10,
        suggestedPublishWeek: 2,
        contentType,
        seoPotential: 'high — kategori boşluğu',
        geoPotential: 'TR + EN',
        visualPotential: 'diagram possible',
        riskOfRepetition: 'low — yeni konu',
        requiredResearch: 'moderate',
        sourceBasis: '',
        nextAction: 'research',
        scores: makeBaseScores({ relevance: 7, novelty: 8, seoPotential: 7 }),
      });
    }
  }

  // 3. User notes → extract topic titles (simple line-by-line parse)
  if (userNotes.trim()) {
    const lines = userNotes.split('\n').filter(l => l.trim().length > 3);
    for (const line of lines.slice(0, 10)) {
      const title = line.replace(/^[-*•]\s*/, '').trim();
      if (title && !usedTitles.has(title)) {
        usedTitles.add(title);
        candidates.push({
          title,
          angle: 'Kullanıcı notundan',
          whyNow: 'Kullanıcı tarafından önerildi',
          targetAudience: 'genel',
          seriesFit: 'standalone',
          difficulty: 'intermediate',
          estimatedReadingTime: 7,
          suggestedPublishWeek: 3,
          contentType: 'explainer',
          seoPotential: 'unknown',
          geoPotential: 'TR',
          visualPotential: 'unknown',
          riskOfRepetition: 'unknown',
          requiredResearch: 'required',
          sourceBasis: '',
          nextAction: 'research',
          scores: makeBaseScores({ relevance: 8 }),
        });
      }
    }
  }

  // 4. Fill up to 25 with varied essays/deep-dives if pool is thin
  const essayTopics = [
    'Kod Kalitesi: Öznellikten Nesnel Metriklere',
    'Teknik Borç: Ne Zaman Öder, Ne Zaman Kabul Edersiniz?',
    'Mühendis Günlüğü: Karar Alırken Yazmak',
    'Açık Kaynak Katkısı: İlk PR\'dan Maintainer\'a',
    'Yazılım Mimarisi: Karar Belgelerini Neden Yazmalıyız?',
    'Performans Optimizasyonu: Erken mi, Gerekince mi?',
    'API Tasarımı: Geriye Dönük Uyumluluk Sanatı',
    'Bağımlılık Yönetimi: Supply Chain Güvenliği',
  ];
  for (const title of essayTopics) {
    if (candidates.length >= 35) break;
    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      candidates.push({
        title,
        angle: 'deneme / fikir yazısı',
        whyNow: 'evergreen konu',
        targetAudience: 'kıdemli yazılımcılar',
        seriesFit: 'standalone',
        difficulty: 'advanced',
        estimatedReadingTime: 12,
        suggestedPublishWeek: 4,
        contentType: 'essay',
        seoPotential: 'low-medium',
        geoPotential: 'TR',
        visualPotential: 'minimal',
        riskOfRepetition: 'medium',
        requiredResearch: 'own perspective',
        sourceBasis: 'own experience',
        nextAction: 'draft',
        scores: makeBaseScores({ novelty: 6, difficulty: 8, estimatedEffort: 7 }),
      });
    }
  }

  return candidates.slice(0, 40);
}

function findCategoryGaps(analysis: ContentAnalysis): string[] {
  const allCategories = ['engineering', 'frontend', 'backend', 'devops', 'architecture', 'career'];
  return allCategories.filter(
    cat => !analysis.categoryDistribution[cat] || (analysis.categoryDistribution[cat] ?? 0) < 3
  );
}

// ─── Balanced Plan Selection ──────────────────────────────────────────────────

/**
 * Selects targetCount topics from pool ensuring difficulty/contentType balance,
 * distributed across weeks 1-4.
 */
export function selectBalancedPlan(pool: Topic[], targetCount: number): Topic[] {
  if (pool.length === 0) return [];
  const count = Math.min(targetCount, pool.length);

  // Sort by score (relevance + novelty − repetition risk)
  const scored = pool.map(t => ({
    topic: t,
    score: t.scores.relevance + t.scores.novelty - t.scores.riskOfRepetition,
  }));
  scored.sort((a, b) => b.score - a.score);

  const selected: Topic[] = [];
  const usedSeries = new Set<string>();
  const usedDifficulties: Record<string, number> = {};
  const targetPerWeek = Math.ceil(count / 4);
  const weekCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (const { topic } of scored) {
    if (selected.length >= count) break;

    // Avoid >50% same series (unless standalone)
    if (topic.seriesFit !== 'standalone') {
      const seriesCount = usedSeries.size > 0
        ? Array.from(usedSeries).filter(s => s === topic.seriesFit).length
        : 0;
      if (seriesCount / Math.max(selected.length, 1) > 0.5) continue;
    }

    // Assign to least-filled week
    const targetWeek = getLeastFilledWeek(weekCounts, targetPerWeek);
    const assigned: Topic = { ...topic, suggestedPublishWeek: targetWeek };

    selected.push(assigned);
    if (topic.seriesFit !== 'standalone') usedSeries.add(topic.seriesFit);
    usedDifficulties[topic.difficulty] = (usedDifficulties[topic.difficulty] ?? 0) + 1;
    weekCounts[targetWeek] = (weekCounts[targetWeek] ?? 0) + 1;
  }

  return selected;
}

function getLeastFilledWeek(
  weekCounts: Record<number, number>,
  targetPerWeek: number
): 1 | 2 | 3 | 4 {
  const weeks: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
  // prefer weeks under target
  const under = weeks.filter(w => (weekCounts[w] ?? 0) < targetPerWeek);
  if (under.length > 0) {
    return under.reduce((a, b) => ((weekCounts[a] ?? 0) <= (weekCounts[b] ?? 0) ? a : b));
  }
  return weeks.reduce((a, b) => ((weekCounts[a] ?? 0) <= (weekCounts[b] ?? 0) ? a : b));
}

// ─── File-Based Prompt Generation ────────────────────────────────────────────

/**
 * Generates a structured Claude Code prompt for file-based mode (§25).
 * Output of this prompt (a MonthlyPlan JSON) should be imported via Auto Routing.
 */
export function generateFilePrompt(
  analysis: ContentAnalysis,
  targetMonth: string,
  userNotes: string
): string {
  const seriesSummary = analysis.series
    .map(s => `  - ${s.slug}: "${s.title}" (${s.articleCount} articles, ${s.publishedCount} published)`)
    .join('\n');

  const topCats = Object.entries(analysis.categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(', ');

  return `# Monthly Editorial Plan Request — ${targetMonth}

## Content State
- Series:
${seriesSummary || '  (no series yet)'}
- Published this year: ${analysis.publishedThisYear}
- Ideas in backlog: ${analysis.backlogCount}
- Top categories: ${topCats || 'none yet'}

## User Notes
${userNotes || '(no specific notes)'}

## Task
Generate a monthly editorial plan for ${targetMonth} with exactly 10 topics.

Return ONLY valid JSON matching this schema:
{
  "month": "${targetMonth}",
  "targetCount": 10,
  "candidatePool": [...],  // 25-40 candidates
  "selected": [...],       // exactly 10 balanced picks
  "status": "draft",
  "userDecisions": []
}

Each topic in candidatePool and selected MUST have these fields:
- title (string), angle (string), whyNow (string), targetAudience (string)
- seriesFit (string: series slug or "standalone")
- difficulty ("beginner" | "intermediate" | "advanced")
- estimatedReadingTime (number, minutes)
- suggestedPublishWeek (1-4)
- contentType ("research" | "explainer" | "architecture" | "essay" | "cv" | "case-study")
- seoPotential (string), geoPotential (string), visualPotential (string)
- riskOfRepetition (string), requiredResearch (string)
- sourceBasis (string — REQUIRED, cite specific sources)
- nextAction (string)
- scores: { relevance, seriesFit, novelty, riskOfRepetition, seoPotential, geoPotential, difficulty, estimatedEffort, visualPotential } (all 0-10)

Balance rules for selected 10:
- Mix difficulty levels (not all same)
- Mix content types (explainer/research/architecture/essay)
- Distribute across weeks 1-4 (~2-3 per week)
- Avoid >50% in same series
- Never fabricate trend data — use only what's in the content state above

Return only the JSON, no explanation.

After generation, drop the file into content/_inbox/ as:
{ "kind": "monthlyPlan", "targetMonth": "${targetMonth}", "payload": <the JSON>, "source": "claude-code-file-mode", "createdAt": "<ISO date>", "status": "detected" }
`;
}

// ─── Full Plan Generation (no LLM needed) ────────────────────────────────────

export async function generatePlan(
  contentRoot: string,
  targetMonth: string,
  userNotes: string,
  targetCount: number = 10
): Promise<{ plan: MonthlyPlan; qcIssues: PlanQCIssue[] }> {
  const analysis = await analyzeContent(contentRoot);
  const candidatePool = generateCandidatePool(analysis, userNotes);
  const selected = selectBalancedPlan(candidatePool, targetCount);

  const plan: MonthlyPlan = {
    month: targetMonth,
    targetCount,
    candidatePool,
    selected,
    status: 'draft',
    userDecisions: [],
  };

  const qcIssues = runPlanQC(plan);
  return { plan, qcIssues };
}
