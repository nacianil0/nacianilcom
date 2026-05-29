import type { Taxonomy } from '../schemas/taxonomy';

const KEBAB_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface TaxonomyIssue {
  code: string;
  message: string;
}

export function validateTaxonomy(
  category: string,
  tags: string[],
  taxonomy: Taxonomy
): TaxonomyIssue[] {
  const issues: TaxonomyIssue[] = [];

  if (!taxonomy.categories.some(c => c.slug === category)) {
    issues.push({
      code: 'UNKNOWN_CATEGORY',
      message: `Category "${category}" not found in taxonomy`,
    });
  }

  if (tags.length > 5) {
    issues.push({
      code: 'TOO_MANY_TAGS',
      message: `Too many tags: ${tags.length} (max 5)`,
    });
  }

  for (const tag of tags) {
    if (!KEBAB_RE.test(tag)) {
      issues.push({
        code: 'INVALID_TAG_FORMAT',
        message: `Tag "${tag}" is not kebab-case`,
      });
    }
  }

  return issues;
}
