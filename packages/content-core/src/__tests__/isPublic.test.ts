import { describe, it, expect } from 'vitest';
import { isPublic } from '../isPublic';

const PAST = new Date('2024-01-01T00:00:00Z');
const NOW = new Date('2025-06-01T12:00:00Z');
const FUTURE = new Date('2026-12-31T00:00:00Z');

describe('isPublic — §9 truth table', () => {
  it('draft + past publishDate → false', () => {
    expect(isPublic({ status: 'draft', publishDate: PAST.toISOString() }, NOW)).toBe(false);
  });

  it('draft + same-as-now publishDate → false', () => {
    expect(isPublic({ status: 'draft', publishDate: NOW.toISOString() }, NOW)).toBe(false);
  });

  it('draft + future publishDate → false', () => {
    expect(isPublic({ status: 'draft', publishDate: FUTURE.toISOString() }, NOW)).toBe(false);
  });

  it('scheduled + future publishDate → false', () => {
    expect(isPublic({ status: 'scheduled', publishDate: FUTURE.toISOString() }, NOW)).toBe(false);
  });

  it('scheduled + past publishDate → true', () => {
    expect(isPublic({ status: 'scheduled', publishDate: PAST.toISOString() }, NOW)).toBe(true);
  });

  it('scheduled + same-as-now publishDate → true', () => {
    expect(isPublic({ status: 'scheduled', publishDate: NOW.toISOString() }, NOW)).toBe(true);
  });

  it('published + future publishDate → false', () => {
    expect(isPublic({ status: 'published', publishDate: FUTURE.toISOString() }, NOW)).toBe(false);
  });

  it('published + past publishDate → true', () => {
    expect(isPublic({ status: 'published', publishDate: PAST.toISOString() }, NOW)).toBe(true);
  });

  it('published + same-as-now publishDate → true', () => {
    expect(isPublic({ status: 'published', publishDate: NOW.toISOString() }, NOW)).toBe(true);
  });
});
