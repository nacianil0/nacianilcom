import { z } from 'zod';

const BilingualLabelSchema = z.object({
  tr: z.string(),
  en: z.string(),
});

const CategorySchema = z.object({
  slug: z.string(),
  label: BilingualLabelSchema,
  description: z.string().optional(),
});

const TagSchema = z.object({
  slug: z.string(),
  label: BilingualLabelSchema,
});

export const TaxonomySchema = z.object({
  categories: z.array(CategorySchema),
  tags: z.array(TagSchema),
});

export type Taxonomy = z.infer<typeof TaxonomySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Tag = z.infer<typeof TagSchema>;
