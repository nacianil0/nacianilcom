import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import type { MonthlyPlan } from '@nacianilcom/content-core';
import { SeriesSchema } from '@nacianilcom/content-core';
import { scaffoldFromPlan } from '../../server/planScaffolder';

const baseTopic = {
  angle: 'Test angle',
  whyNow: 'Test why',
  targetAudience: 'Developers',
  difficulty: 'beginner' as const,
  estimatedReadingTime: 8,
  suggestedPublishWeek: 1,
  contentType: 'explainer' as const,
  seoPotential: 'high',
  geoPotential: 'high',
  visualPotential: 'diagram',
  riskOfRepetition: 'low',
  requiredResearch: 'docs',
  sourceBasis: 'Paper 2020',
  nextAction: 'outline',
  scores: {
    relevance: 8,
    seriesFit: 8,
    novelty: 7,
    riskOfRepetition: 2,
    seoPotential: 7,
    geoPotential: 7,
    difficulty: 3,
    estimatedEffort: 4,
    visualPotential: 6,
  },
};

const samplePlan: MonthlyPlan = {
  month: '2026-07',
  targetCount: 10,
  candidatePool: [],
  selected: [
    { ...baseTopic, title: 'Token Nedir?', seriesFit: 'llm-nasil-calisir' },
    { ...baseTopic, title: 'Temperature ve Top-p', seriesFit: 'standalone', suggestedPublishWeek: 2 },
  ],
  status: 'draft',
  userDecisions: [],
};

describe('scaffoldFromPlan', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'plan-scaffold-'));
    await fs.mkdir(path.join(tmp, 'series'), { recursive: true });
    await fs.writeFile(
      path.join(tmp, 'taxonomy.json'),
      JSON.stringify({
        categories: [{ slug: 'programlama-temelleri', label: { tr: 'x', en: 'x' } }],
        tags: [{ slug: 'temel-kavramlar', label: { tr: 'x', en: 'x' } }],
      }),
      'utf-8',
    );
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('creates series + meta + brief for series and standalone topics', async () => {
    const result = await scaffoldFromPlan(tmp, samplePlan);

    expect(result.series).toHaveLength(2);
    expect(result.ideasWritten).toBe(2);

    const seriesRaw = await fs.readFile(path.join(tmp, 'series', 'llm-nasil-calisir', 'series.json'), 'utf-8');
    const series = SeriesSchema.parse(JSON.parse(seriesRaw));
    expect(series.articleOrder).toHaveLength(1);

    const metaRaw = await fs.readFile(
      path.join(tmp, 'series', 'llm-nasil-calisir', 'articles', series.articleOrder[0]!, 'meta.json'),
      'utf-8',
    );
    expect(JSON.parse(metaRaw).status).toBe('draft');

    const standaloneSeries = await fs.readFile(
      path.join(tmp, 'series', '2026-07-bagimsiz', 'series.json'),
      'utf-8',
    );
    expect(JSON.parse(standaloneSeries).slug).toBe('2026-07-bagimsiz');
  });

  it('is idempotent — second run does not overwrite meta', async () => {
    await scaffoldFromPlan(tmp, samplePlan);
    const result2 = await scaffoldFromPlan(tmp, samplePlan);
    const created = result2.series.flatMap(s => s.articles.filter(a => a.created));
    expect(created).toHaveLength(0);
  });
});
