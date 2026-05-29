import { z } from 'zod';

const FaqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
});

export const FrontmatterSchema = z.object({
  title: z.string().max(70),
  description: z.string(),
  summary: z.string(),
  faq: z.array(FaqItemSchema).optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
