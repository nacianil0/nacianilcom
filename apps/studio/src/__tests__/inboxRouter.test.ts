import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { autoRoutePendingInbox, routeInboxFile, safeInboxFilename } from '../../server/inboxRouter';

describe('safeInboxFilename', () => {
  it('accepts camelCase inbox filenames', () => {
    expect(safeInboxFilename('monthlyPlan-2026-07.json')).toBe(true);
  });

  it('rejects path traversal', () => {
    expect(safeInboxFilename('../evil.json')).toBe(false);
  });
});

describe('autoRoutePendingInbox', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'inbox-auto-'));
    await fs.mkdir(path.join(tmp, 'plans'), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('routes detected monthlyPlan to content/plans/', async () => {
    const inboxDir = path.join(tmp, '_inbox');
    await fs.mkdir(inboxDir, { recursive: true });
    const item = {
      kind: 'monthlyPlan',
      targetMonth: '2026-07',
      payload: {
        month: '2026-07',
        targetCount: 10,
        candidatePool: [],
        selected: [],
        status: 'draft',
        userDecisions: [],
      },
      source: 'claude-code-file-mode',
      createdAt: '2026-05-31T12:00:00Z',
      status: 'detected',
    };
    await fs.writeFile(
      path.join(inboxDir, 'monthlyPlan-2026-07.json'),
      JSON.stringify(item, null, 2),
      'utf-8',
    );

    const results = await autoRoutePendingInbox(inboxDir, tmp);
    expect(results).toHaveLength(1);
    expect(results[0]?.ok).toBe(true);
    if (results[0]?.ok) {
      expect(results[0].status).toBe('routed');
      expect(results[0].target).toBe(path.join(tmp, 'plans', '2026-07.json'));
    }

    const planRaw = await fs.readFile(path.join(tmp, 'plans', '2026-07.json'), 'utf-8');
    expect(JSON.parse(planRaw).month).toBe('2026-07');

    const routedRaw = await fs.readFile(path.join(inboxDir, 'monthlyPlan-2026-07.json'), 'utf-8');
    expect(JSON.parse(routedRaw).status).toBe('routed');
  });

  it('routeInboxFile is idempotent for already-routed items', async () => {
    const inboxDir = path.join(tmp, '_inbox');
    await fs.mkdir(inboxDir, { recursive: true });
    const item = {
      kind: 'monthlyPlan',
      targetMonth: '2026-08',
      payload: { month: '2026-08', targetCount: 10, candidatePool: [], selected: [], status: 'draft', userDecisions: [] },
      source: 'test',
      createdAt: '2026-05-31T12:00:00Z',
      status: 'detected',
    };
    const filename = 'monthlyPlan-2026-08.json';
    await fs.writeFile(path.join(inboxDir, filename), JSON.stringify(item, null, 2), 'utf-8');

    const first = await routeInboxFile(inboxDir, filename, tmp);
    const second = await routeInboxFile(inboxDir, filename, tmp);
    expect(first.ok && first.status).toBe('routed');
    expect(second.ok && second.status).toBe('already-routed');
  });
});
