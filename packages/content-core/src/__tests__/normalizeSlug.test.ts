import { describe, it, expect } from 'vitest';
import { normalizeSlug } from '../url/normalizeSlug';

describe('normalizeSlug — TR character conversion (§20)', () => {
  it('ç → c', () => expect(normalizeSlug('çay')).toBe('cay'));
  it('Ç → c', () => expect(normalizeSlug('Çay')).toBe('cay'));
  it('ş → s', () => expect(normalizeSlug('şeker')).toBe('seker'));
  it('Ş → s', () => expect(normalizeSlug('Şeker')).toBe('seker'));
  it('ğ → g', () => expect(normalizeSlug('ağaç')).toBe('agac'));
  it('Ğ → g', () => expect(normalizeSlug('Ğ')).toBe('g'));
  it('ü → u', () => expect(normalizeSlug('üzüm')).toBe('uzum'));
  it('Ü → u', () => expect(normalizeSlug('Üzüm')).toBe('uzum'));
  it('ö → o', () => expect(normalizeSlug('öğretmen')).toBe('ogretmen'));
  it('Ö → o', () => expect(normalizeSlug('Öğretmen')).toBe('ogretmen'));
  it('ı (dotless i) → i', () => expect(normalizeSlug('ışık')).toBe('isik'));
  it('İ (dotted I) → i', () => expect(normalizeSlug('İstanbul')).toBe('istanbul'));

  it('spaces → hyphens', () => expect(normalizeSlug('hello world')).toBe('hello-world'));
  it('multiple spaces → single hyphen', () => expect(normalizeSlug('hello  world')).toBe('hello-world'));
  it('uppercase → lowercase', () => expect(normalizeSlug('HELLO')).toBe('hello'));
  it('removes punctuation', () => expect(normalizeSlug('hello, world!')).toBe('hello-world'));
  it('removes emoji', () => expect(normalizeSlug('hello 🌍 world')).toBe('hello-world'));
  it('collapses multiple hyphens', () => expect(normalizeSlug('hello---world')).toBe('hello-world'));
  it('trims leading/trailing hyphens', () => expect(normalizeSlug('-hello-')).toBe('hello'));

  it('full TR phrase', () =>
    expect(normalizeSlug('Türkçe Öğreniyorum')).toBe('turkce-ogreniyorum'));

  it('already valid slug is unchanged', () =>
    expect(normalizeSlug('my-article-slug')).toBe('my-article-slug'));
});
