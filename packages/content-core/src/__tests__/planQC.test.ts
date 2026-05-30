import { describe, it, expect } from 'vitest';
import { runPlanQC } from '../qc/planQC';
import type { MonthlyPlan, Topic } from '../schemas/plans';

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    title: 'Test Topic',
    angle: 'explanation',
    whyNow: 'relevant now',
    targetAudience: 'engineers',
    seriesFit: 'yazilimda-temel-kavramlar',
    difficulty: 'intermediate',
    estimatedReadingTime: 8,
    suggestedPublishWeek: 1,
    contentType: 'explainer',
    seoPotential: 'medium',
    geoPotential: 'TR',
    visualPotential: 'diagram',
    riskOfRepetition: 'low',
    requiredResearch: 'some',
    sourceBasis: 'own experience',
    nextAction: 'draft',
    scores: {
      relevance: 7,
      seriesFit: 8,
      novelty: 6,
      riskOfRepetition: 2,
      seoPotential: 5,
      geoPotential: 6,
      difficulty: 5,
      estimatedEffort: 5,
      visualPotential: 6,
    },
    ...overrides,
  };
}

function makePlan(selected: Topic[], overrides: Partial<MonthlyPlan> = {}): MonthlyPlan {
  return {
    month: '2026-06',
    targetCount: 10,
    candidatePool: selected,
    selected,
    status: 'draft',
    userDecisions: [],
    ...overrides,
  };
}

describe('runPlanQC', () => {
  it('returns no issues for balanced plan', () => {
    const selected = [
      makeTopic({ difficulty: 'beginner', suggestedPublishWeek: 1, seriesFit: 'series-a', contentType: 'explainer' }),
      makeTopic({ difficulty: 'intermediate', suggestedPublishWeek: 2, seriesFit: 'series-b', contentType: 'research' }),
      makeTopic({ difficulty: 'advanced', suggestedPublishWeek: 3, seriesFit: 'series-c', contentType: 'architecture' }),
      makeTopic({ difficulty: 'beginner', suggestedPublishWeek: 4, seriesFit: 'series-d', contentType: 'essay' }),
    ];
    const issues = runPlanQC(makePlan(selected));
    expect(issues).toHaveLength(0);
  });

  it('warns on missing sourceBasis', () => {
    const selected = [
      makeTopic({ sourceBasis: '' }),
      makeTopic({ suggestedPublishWeek: 2 }),
      makeTopic({ difficulty: 'advanced', suggestedPublishWeek: 3 }),
      makeTopic({ suggestedPublishWeek: 4 }),
    ];
    const issues = runPlanQC(makePlan(selected));
    const srcIssue = issues.filter(i => i.code === 'PLAN_MISSING_SOURCE_BASIS');
    expect(srcIssue.length).toBeGreaterThan(0);
    expect(srcIssue[0]!.severity).toBe('warning');
  });

  it('warns on difficulty imbalance (all same)', () => {
    const selected = [
      makeTopic({ difficulty: 'intermediate', suggestedPublishWeek: 1 }),
      makeTopic({ difficulty: 'intermediate', suggestedPublishWeek: 2 }),
      makeTopic({ difficulty: 'intermediate', suggestedPublishWeek: 3 }),
      makeTopic({ difficulty: 'intermediate', suggestedPublishWeek: 4 }),
    ];
    const issues = runPlanQC(makePlan(selected));
    const diffIssue = issues.find(i => i.code === 'PLAN_DIFFICULTY_IMBALANCE');
    expect(diffIssue).toBeDefined();
    expect(diffIssue!.severity).toBe('warning');
  });

  it('warns on empty week', () => {
    const selected = [
      makeTopic({ suggestedPublishWeek: 1 }),
      makeTopic({ suggestedPublishWeek: 1 }),
      makeTopic({ suggestedPublishWeek: 2, difficulty: 'advanced' }),
      // week 3 and 4 missing
    ];
    const issues = runPlanQC(makePlan(selected));
    const weekIssues = issues.filter(i => i.code === 'PLAN_EMPTY_WEEK');
    expect(weekIssues.length).toBeGreaterThanOrEqual(2);
  });

  it('warns on high repetition risk', () => {
    const selected = Array.from({ length: 4 }, (_, i) =>
      makeTopic({
        suggestedPublishWeek: (i + 1) as 1 | 2 | 3 | 4,
        difficulty: i % 2 === 0 ? 'beginner' : 'advanced',
        scores: {
          ...makeTopic().scores,
          riskOfRepetition: 8,
        },
      })
    );
    const issues = runPlanQC(makePlan(selected));
    expect(issues.find(i => i.code === 'PLAN_HIGH_REPETITION_RISK')).toBeDefined();
  });

  it('returns empty array when selected is empty', () => {
    const issues = runPlanQC(makePlan([]));
    expect(issues).toHaveLength(0);
  });
});
