import { z } from 'zod';

export const InboxKindSchema = z.enum([
  'monthlyPlan', 'idea', 'seriesPlan', 'brief', 'outline',
  'finalMdx', 'visual', 'diagram', 'resume', 'caseStudy', 'seoQc', 'redirect',
]);

export const InboxStatusSchema = z.enum(['detected', 'routed', 'needsReview', 'failed']);

export const InboxItemSchema = z.object({
  kind: InboxKindSchema,
  target: z.string().optional(),
  payload: z.unknown(),
  source: z.string(),
  createdAt: z.string(),
  status: InboxStatusSchema,
});

export type InboxKind = z.infer<typeof InboxKindSchema>;
export type InboxStatus = z.infer<typeof InboxStatusSchema>;
export type InboxItem = z.infer<typeof InboxItemSchema>;
