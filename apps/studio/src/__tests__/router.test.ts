import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { InboxItemSchema } from '@nacianilcom/content-core';
import { resolveTargetPath, writeWithBackup, serializePayload } from '../../server/router';

const ROOT = '/content';

// ─── Schema Validation ────────────────────────────────────────────────────────

describe('InboxItemSchema validation', () => {
  it('accepts a minimal valid item', () => {
    const item = InboxItemSchema.parse({
      kind: 'idea',
      payload: { text: 'test idea' },
      source: 'claude-code',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(item.kind).toBe('idea');
    expect(item.status).toBe('detected');
  });

  it('rejects unknown kind → throws ZodError', () => {
    expect(() =>
      InboxItemSchema.parse({
        kind: 'unknown-kind',
        payload: {},
        source: 'test',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'detected',
      }),
    ).toThrow();
  });

  it('rejects invalid status → throws ZodError', () => {
    expect(() =>
      InboxItemSchema.parse({
        kind: 'idea',
        payload: {},
        source: 'test',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'bad-status',
      }),
    ).toThrow();
  });

  it('accepts all routing metadata fields', () => {
    const item = InboxItemSchema.parse({
      kind: 'finalMdx',
      seriesSlug: 'my-series',
      articleId: '01-intro',
      language: 'tr',
      nextAction: 'publish',
      payload: '---\ntitle: T\n---\n# Body',
      source: 'claude-code',
      createdAt: '2024-06-01T10:00:00Z',
      status: 'detected',
    });
    expect(item.seriesSlug).toBe('my-series');
    expect(item.language).toBe('tr');
  });
});

// ─── Router Map ───────────────────────────────────────────────────────────────

describe('resolveTargetPath — router map', () => {
  it('monthlyPlan → plans/YYYY-MM.json', () => {
    const item = InboxItemSchema.parse({
      kind: 'monthlyPlan',
      targetMonth: '2024-03',
      payload: {},
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'plans', '2024-03.json'),
    );
  });

  it('monthlyPlan without targetMonth → null (needsReview)', () => {
    const item = InboxItemSchema.parse({
      kind: 'monthlyPlan',
      payload: {},
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBeNull();
  });

  it('idea with target → _ideas/{target}.json', () => {
    const item = InboxItemSchema.parse({
      kind: 'idea',
      target: 'caching-patterns',
      payload: { text: 'idea' },
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, '_ideas', 'caching-patterns.json'),
    );
  });

  it('idea without target → _ideas/idea-YYYY-MM-DD.json (date-based)', () => {
    const item = InboxItemSchema.parse({
      kind: 'idea',
      payload: { text: 'idea' },
      source: 'test',
      createdAt: '2024-06-15T10:30:00Z',
      status: 'detected',
    });
    const result = resolveTargetPath(item, ROOT);
    expect(result).toContain('_ideas');
    expect(result).toContain('2024-06-15');
  });

  it('brief → series/{slug}/articles/{id}/brief.json', () => {
    const item = InboxItemSchema.parse({
      kind: 'brief',
      seriesSlug: 'temel-kavramlar',
      articleId: '04-async',
      payload: {},
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'series', 'temel-kavramlar', 'articles', '04-async', 'brief.json'),
    );
  });

  it('brief without articleId → null', () => {
    const item = InboxItemSchema.parse({
      kind: 'brief',
      seriesSlug: 'my-series',
      payload: {},
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBeNull();
  });

  it('outline → series/{slug}/articles/{id}/outline.json', () => {
    const item = InboxItemSchema.parse({
      kind: 'outline',
      seriesSlug: 'my-series',
      articleId: '01-intro',
      payload: {},
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'series', 'my-series', 'articles', '01-intro', 'outline.json'),
    );
  });

  it('finalMdx TR → series/{slug}/articles/{id}/final.tr.mdx', () => {
    const item = InboxItemSchema.parse({
      kind: 'finalMdx',
      seriesSlug: 'my-series',
      articleId: '01-intro',
      language: 'tr',
      payload: '---\ntitle: T\n---\n',
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'series', 'my-series', 'articles', '01-intro', 'final.tr.mdx'),
    );
  });

  it('finalMdx EN → series/{slug}/articles/{id}/final.en.mdx', () => {
    const item = InboxItemSchema.parse({
      kind: 'finalMdx',
      seriesSlug: 'my-series',
      articleId: '01-intro',
      language: 'en',
      payload: '---\ntitle: T\n---\n',
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'series', 'my-series', 'articles', '01-intro', 'final.en.mdx'),
    );
  });

  it('finalMdx without language → null', () => {
    const item = InboxItemSchema.parse({
      kind: 'finalMdx',
      seriesSlug: 'my-series',
      articleId: '01-intro',
      payload: 'mdx',
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBeNull();
  });

  it('visual with seriesSlug → series/{slug}/diagrams/{name}.svg', () => {
    const item = InboxItemSchema.parse({
      kind: 'visual',
      seriesSlug: 'my-series',
      target: 'call-stack',
      payload: '<svg/>',
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'series', 'my-series', 'diagrams', 'call-stack.svg'),
    );
  });

  it('diagram without seriesSlug → diagrams/{name}.mmd (root)', () => {
    const item = InboxItemSchema.parse({
      kind: 'diagram',
      target: 'flow',
      payload: 'graph TD',
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'diagrams', 'flow.mmd'),
    );
  });

  it('resume → resume/resume.json', () => {
    const item = InboxItemSchema.parse({
      kind: 'resume',
      payload: { name: 'Anil' },
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(
      path.join(ROOT, 'resume', 'resume.json'),
    );
  });

  it('redirect → redirects.json', () => {
    const item = InboxItemSchema.parse({
      kind: 'redirect',
      payload: [{ from: '/old', to: '/tr/series', permanent: true }],
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(resolveTargetPath(item, ROOT)).toBe(path.join(ROOT, 'redirects.json'));
  });
});

// ─── Payload Serialization ────────────────────────────────────────────────────

describe('serializePayload', () => {
  it('string payload returned as-is', () => {
    const item = InboxItemSchema.parse({
      kind: 'finalMdx',
      payload: '---\ntitle: T\n---\n# Body',
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    expect(serializePayload(item)).toBe('---\ntitle: T\n---\n# Body');
  });

  it('object payload serialized as JSON', () => {
    const item = InboxItemSchema.parse({
      kind: 'idea',
      payload: { text: 'idea text' },
      source: 'test',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'detected',
    });
    const result = serializePayload(item);
    expect(JSON.parse(result)).toEqual({ text: 'idea text' });
  });
});

// ─── writeWithBackup — no silent overwrite ────────────────────────────────────

describe('writeWithBackup', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'inbox-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes file when target does not exist, no backup', async () => {
    const targetPath = path.join(tmpDir, 'new.json');
    const result = await writeWithBackup(targetPath, '{"created":true}');

    const content = await fs.readFile(targetPath, 'utf-8');
    expect(content).toBe('{"created":true}');
    expect(result.backupPath).toBeNull();
  });

  it('backs up existing file before overwriting', async () => {
    const targetPath = path.join(tmpDir, 'existing.json');
    await fs.writeFile(targetPath, '{"original":true}', 'utf-8');

    const result = await writeWithBackup(targetPath, '{"new":true}');

    const current = await fs.readFile(targetPath, 'utf-8');
    const backup = await fs.readFile(result.backupPath!, 'utf-8');

    expect(current).toBe('{"new":true}');
    expect(backup).toBe('{"original":true}');
    expect(result.backupPath).toBe(`${targetPath}.bak`);
  });

  it('creates parent directories automatically', async () => {
    const targetPath = path.join(tmpDir, 'deep', 'nested', 'file.json');
    await writeWithBackup(targetPath, '{"deep":true}');

    const content = await fs.readFile(targetPath, 'utf-8');
    expect(content).toBe('{"deep":true}');
  });
});
