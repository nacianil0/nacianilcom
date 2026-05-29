import { z } from 'zod';

export interface ParseJsonResult<T> {
  data: T | null;
  error: string | null;
}

export function parseJson<T>(content: string, schema: z.ZodType<T>): ParseJsonResult<T> {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (e) {
    return { data: null, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { data: null, error: `Schema validation failed: ${result.error.message}` };
  }
  return { data: result.data, error: null };
}
