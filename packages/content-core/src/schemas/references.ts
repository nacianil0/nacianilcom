import { z } from 'zod';

export const ReferenceItemSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  author: z.string().optional(),
  year: z.number().optional(),
});

export const ReferencesSchema = z.array(ReferenceItemSchema);

export type ReferenceItem = z.infer<typeof ReferenceItemSchema>;
export type References = z.infer<typeof ReferencesSchema>;
