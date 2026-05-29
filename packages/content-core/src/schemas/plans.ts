import { z } from 'zod';

const ScoresSchema = z.object({
  relevance: z.number(),
  seriesFit: z.number(),
  novelty: z.number(),
  riskOfRepetition: z.number(),
  seoPotential: z.number(),
  geoPotential: z.number(),
  difficulty: z.number(),
  estimatedEffort: z.number(),
  visualPotential: z.number(),
});

export const TopicSchema = z.object({
  title: z.string(),
  angle: z.string(),
  whyNow: z.string(),
  targetAudience: z.string(),
  seriesFit: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadingTime: z.number(),
  suggestedPublishWeek: z.number().int().min(1).max(5),
  contentType: z.enum(['research', 'explainer', 'architecture', 'essay', 'cv', 'case-study']),
  seoPotential: z.string(),
  geoPotential: z.string(),
  visualPotential: z.string(),
  riskOfRepetition: z.string(),
  requiredResearch: z.string(),
  sourceBasis: z.string(),
  nextAction: z.string(),
  scores: ScoresSchema,
});

export const MonthlyPlanSchema = z.object({
  month: z.string(),
  targetCount: z.number().int().default(10),
  editorialTheme: z.string().optional(),
  candidatePool: z.array(TopicSchema),
  selected: z.array(TopicSchema),
  status: z.enum(['draft', 'approved', 'in-progress', 'completed']),
  userDecisions: z.array(z.unknown()),
});

export type Topic = z.infer<typeof TopicSchema>;
export type MonthlyPlan = z.infer<typeof MonthlyPlanSchema>;
export type Scores = z.infer<typeof ScoresSchema>;
