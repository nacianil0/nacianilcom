import { z } from 'zod';

export const AssetSchema = z.object({
  cover: z.string().optional(),
  og: z.string().optional(),
  diagrams: z.array(z.string()).default([]),
});

export const MetaSchema = z.object({
  id: z.string(),
  series: z.string(),
  order: z.number().int().min(1).max(10),
  slugBase: z.string(),
  category: z.string(),
  tags: z.array(z.string()).max(5),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'scheduled', 'published']),
  publishDate: z.string(),
  updatedDate: z.string().optional(),
  schemaType: z.enum(['Article', 'BlogPosting', 'TechArticle']).default('TechArticle'),
  contentType: z.enum(['research', 'explainer', 'architecture', 'essay', 'cv', 'case-study']),
  languages: z.array(z.enum(['tr', 'en'])).min(1),
  assets: AssetSchema,
});

export type Meta = z.infer<typeof MetaSchema>;
export type AssetConfig = z.infer<typeof AssetSchema>;
