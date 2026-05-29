import matter from 'gray-matter';
import { FrontmatterSchema } from '../schemas/frontmatter';
import type { Frontmatter } from '../schemas/frontmatter';

export interface ParseMdxResult {
  frontmatter: Frontmatter | null;
  content: string;
  error: string | null;
}

export function parseMdx(raw: string): ParseMdxResult {
  let parsed: ReturnType<typeof matter>;
  try {
    parsed = matter(raw);
  } catch (e) {
    return {
      frontmatter: null,
      content: '',
      error: `Failed to parse MDX frontmatter: ${(e as Error).message}`,
    };
  }
  const result = FrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    return {
      frontmatter: null,
      content: parsed.content,
      error: `Frontmatter validation failed: ${result.error.message}`,
    };
  }
  return { frontmatter: result.data, content: parsed.content, error: null };
}
