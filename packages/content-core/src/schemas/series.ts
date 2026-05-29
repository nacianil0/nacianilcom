import { z } from 'zod';

const BilingualTextSchema = z.object({
  tr: z.string(),
  en: z.string(),
});

export const SeriesSchema = z.object({
  slug: z.string(),
  title: BilingualTextSchema,
  description: BilingualTextSchema,
  order: z.number(),
  cover: z.string().optional(),
  articleOrder: z.array(z.string()),
});

export type Series = z.infer<typeof SeriesSchema>;
export type BilingualText = z.infer<typeof BilingualTextSchema>;
