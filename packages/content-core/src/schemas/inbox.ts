import { z } from 'zod';

export const InboxKindSchema = z.enum([
  'monthlyPlan', 'idea', 'seriesPlan', 'brief', 'outline',
  'finalMdx', 'visual', 'diagram', 'resume', 'caseStudy', 'seoQc', 'redirect',
]);

export const InboxStatusSchema = z.enum(['detected', 'routed', 'needsReview', 'failed']);

export const InboxItemSchema = z.object({
  kind: InboxKindSchema,
  // Resolved target path after routing (set by auto-router)
  target: z.string().optional(),
  payload: z.unknown(),
  source: z.string(),
  createdAt: z.string(),
  status: InboxStatusSchema,
  // ── Routing metadata (§26) — filled by Claude Code or author before dropping ──
  // YYYY-MM for monthlyPlan kind
  targetMonth: z.string().optional(),
  // Series slug for brief/outline/finalMdx/visual/diagram/seoQc/seriesPlan
  seriesSlug: z.string().optional(),
  // Article ID for brief/outline/finalMdx/seoQc
  articleId: z.string().optional(),
  // Content language for finalMdx
  language: z.enum(['tr', 'en']).optional(),
  // Hint for downstream action (e.g., 'publish', 'review', 'translate')
  nextAction: z.string().optional(),
  // Human-readable reason when status is needsReview or failed
  reviewReason: z.string().optional(),
  // Path of backup file created when target already existed (set by router)
  backupPath: z.string().optional(),
});

export type InboxKind = z.infer<typeof InboxKindSchema>;
export type InboxStatus = z.infer<typeof InboxStatusSchema>;
export type InboxItem = z.infer<typeof InboxItemSchema>;
