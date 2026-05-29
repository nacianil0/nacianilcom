import { z } from 'zod';

export const RedirectItemSchema = z.object({
  from: z.string(),
  to: z.string(),
  permanent: z.literal(true),
  reason: z.string().optional(),
});

export const RedirectsSchema = z.array(RedirectItemSchema);

export type RedirectItem = z.infer<typeof RedirectItemSchema>;
export type Redirects = z.infer<typeof RedirectsSchema>;
