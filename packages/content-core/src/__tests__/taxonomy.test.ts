import { describe, it, expect } from 'vitest';
import { validateTaxonomy } from '../taxonomy/validator';
import type { Taxonomy } from '../schemas/taxonomy';

const taxonomy: Taxonomy = {
  categories: [
    { slug: 'engineering', label: { tr: 'Mühendislik', en: 'Engineering' } },
    { slug: 'design', label: { tr: 'Tasarım', en: 'Design' } },
  ],
  tags: [
    { slug: 'typescript', label: { tr: 'TypeScript', en: 'TypeScript' } },
    { slug: 'react', label: { tr: 'React', en: 'React' } },
  ],
};

describe('validateTaxonomy (§17)', () => {
  it('valid category and tags → no issues', () => {
    const issues = validateTaxonomy('engineering', ['typescript', 'react'], taxonomy);
    expect(issues).toHaveLength(0);
  });

  it('unknown category → UNKNOWN_CATEGORY blocking', () => {
    const issues = validateTaxonomy('unknown-cat', [], taxonomy);
    expect(issues.some(i => i.code === 'UNKNOWN_CATEGORY')).toBe(true);
  });

  it('more than 5 tags → TOO_MANY_TAGS blocking', () => {
    const issues = validateTaxonomy('engineering', ['a', 'b', 'c', 'd', 'e', 'f'], taxonomy);
    expect(issues.some(i => i.code === 'TOO_MANY_TAGS')).toBe(true);
  });

  it('exactly 5 tags → no TOO_MANY_TAGS', () => {
    const issues = validateTaxonomy('engineering', ['a', 'b', 'c', 'd', 'e'], taxonomy);
    expect(issues.some(i => i.code === 'TOO_MANY_TAGS')).toBe(false);
  });

  it('tag with uppercase → INVALID_TAG_FORMAT blocking', () => {
    const issues = validateTaxonomy('engineering', ['TypeScript'], taxonomy);
    expect(issues.some(i => i.code === 'INVALID_TAG_FORMAT')).toBe(true);
  });

  it('tag with spaces → INVALID_TAG_FORMAT blocking', () => {
    const issues = validateTaxonomy('engineering', ['hello world'], taxonomy);
    expect(issues.some(i => i.code === 'INVALID_TAG_FORMAT')).toBe(true);
  });

  it('tag with underscore → INVALID_TAG_FORMAT blocking', () => {
    const issues = validateTaxonomy('engineering', ['my_tag'], taxonomy);
    expect(issues.some(i => i.code === 'INVALID_TAG_FORMAT')).toBe(true);
  });

  it('valid kebab-case multi-word tag → no issue', () => {
    const issues = validateTaxonomy('engineering', ['my-tag', 'another-tag'], taxonomy);
    expect(issues.some(i => i.code === 'INVALID_TAG_FORMAT')).toBe(false);
  });

  it('empty tags array → no issues', () => {
    const issues = validateTaxonomy('design', [], taxonomy);
    expect(issues).toHaveLength(0);
  });
});
