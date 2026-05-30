import type { MonthlyPlan } from '../schemas/plans';

export interface PlanQCIssue {
  code: string;
  message: string;
  severity: 'blocking' | 'warning';
}

/**
 * Runs QC on a monthly plan per §25.
 * Checks: repetition risk, category/difficulty balance, weekly distribution, missing sourceBasis.
 */
export function runPlanQC(plan: MonthlyPlan): PlanQCIssue[] {
  const issues: PlanQCIssue[] = [];
  const selected = plan.selected;

  if (selected.length === 0) return issues;

  // Missing sourceBasis
  for (const topic of selected) {
    if (!topic.sourceBasis || topic.sourceBasis.trim() === '') {
      issues.push({
        code: 'PLAN_MISSING_SOURCE_BASIS',
        message: `Topic "${topic.title}" has no sourceBasis — research basis required`,
        severity: 'warning',
      });
    }
  }

  // Difficulty balance: all same difficulty → warning
  const difficulties = new Set(selected.map(t => t.difficulty));
  if (difficulties.size === 1 && selected.length >= 3) {
    const [d] = [...difficulties];
    issues.push({
      code: 'PLAN_DIFFICULTY_IMBALANCE',
      message: `All ${selected.length} selected topics have the same difficulty: "${d}". Mix beginner/intermediate/advanced.`,
      severity: 'warning',
    });
  }

  // Repetition risk: high riskOfRepetition score (>= 7) on multiple topics
  const highRepetition = selected.filter(t => t.scores.riskOfRepetition >= 7);
  if (highRepetition.length >= 3) {
    issues.push({
      code: 'PLAN_HIGH_REPETITION_RISK',
      message: `${highRepetition.length} topics have high repetition risk (score ≥7). Review for duplicates.`,
      severity: 'warning',
    });
  }

  // Weekly distribution: check all weeks are used (1-4)
  const weeks = new Set(selected.map(t => t.suggestedPublishWeek));
  for (let w = 1; w <= 4; w++) {
    if (!weeks.has(w)) {
      issues.push({
        code: 'PLAN_EMPTY_WEEK',
        message: `Week ${w} has no topics assigned. Distribute selected topics across all 4 weeks.`,
        severity: 'warning',
      });
    }
  }

  // Series concentration: >60% of selected in same series → imbalance
  const seriesCounts = countBy(selected, t => t.seriesFit);
  for (const [series, count] of Object.entries(seriesCounts)) {
    if (series && count / selected.length > 0.6) {
      issues.push({
        code: 'PLAN_SERIES_CONCENTRATION',
        message: `${count} of ${selected.length} topics belong to series "${series}" (>60%). Diversify across series.`,
        severity: 'warning',
      });
    }
  }

  // Category concentration: check via topic title/content type spread
  const contentTypes = countBy(selected, t => t.contentType);
  const dominant = Object.entries(contentTypes).find(([, c]) => c / selected.length > 0.7);
  if (dominant) {
    issues.push({
      code: 'PLAN_CONTENT_TYPE_CONCENTRATION',
      message: `${dominant[1]} of ${selected.length} topics are "${dominant[0]}" type (>70%). Mix content types.`,
      severity: 'warning',
    });
  }

  return issues;
}

function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of arr) {
    const k = key(item);
    result[k] = (result[k] ?? 0) + 1;
  }
  return result;
}
