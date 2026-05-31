import path from 'path';
import fs from 'fs/promises';
import { InboxItemSchema, type InboxItem } from '@nacianilcom/content-core';
import { resolveTargetPath, writeWithBackup, serializePayload, moveToUnresolved } from './router';

export function safeInboxFilename(name: string): boolean {
  return /^[a-zA-Z0-9_.-]+\.json$/.test(name) && !name.includes('..') && !name.includes('/');
}

export type RouteInboxResult =
  | { ok: true; filename: string; status: 'routed' | 'already-routed'; target: string; backup?: string | null }
  | { ok: false; filename: string; status: 'failed' | 'needsReview'; error: string };

function enrichRoutingFields(item: InboxItem): InboxItem {
  if (item.kind !== 'monthlyPlan' || item.targetMonth) return item;
  const payload = item.payload;
  if (payload && typeof payload === 'object' && 'month' in payload) {
    const month = (payload as { month?: string }).month;
    if (month) return { ...item, targetMonth: month };
  }
  return item;
}

/** Route a single inbox JSON file from the inbox root directory. */
export async function routeInboxFile(
  inboxDir: string,
  filename: string,
  contentRoot: string,
): Promise<RouteInboxResult> {
  if (!safeInboxFilename(filename)) {
    return { ok: false, filename, status: 'failed', error: 'Invalid filename' };
  }

  const filePath = path.join(inboxDir, filename);
  const raw = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (!raw) return { ok: false, filename, status: 'failed', error: 'File not found' };

  let item: InboxItem;
  try {
    item = InboxItemSchema.parse(JSON.parse(raw));
  } catch (err) {
    const failed = { ...(JSON.parse(raw) as Record<string, unknown>), status: 'failed', reviewReason: 'Schema validation failed' };
    await fs.writeFile(filePath, JSON.stringify(failed, null, 2) + '\n', 'utf-8');
    return { ok: false, filename, status: 'failed', error: `Schema validation failed: ${String(err)}` };
  }

  if (item.status === 'routed') {
    return { ok: true, filename, status: 'already-routed', target: item.target ?? '' };
  }

  if (item.status !== 'detected') {
    return { ok: false, filename, status: 'failed', error: `Cannot auto-route status: ${item.status}` };
  }

  item = enrichRoutingFields(item);

  const targetPath = resolveTargetPath(item, contentRoot);
  if (!targetPath) {
    await moveToUnresolved(filename, inboxDir, item, 'Missing required routing fields');
    return {
      ok: false,
      filename,
      status: 'needsReview',
      error: 'Missing required routing fields (targetMonth / seriesSlug / articleId / language)',
    };
  }

  const content = serializePayload(item);
  const writeResult = await writeWithBackup(targetPath, content);

  const routed: InboxItem = {
    ...item,
    status: 'routed',
    target: targetPath,
    backupPath: writeResult.backupPath ?? undefined,
  };
  await fs.writeFile(filePath, JSON.stringify(routed, null, 2) + '\n', 'utf-8');

  return {
    ok: true,
    filename,
    status: 'routed',
    target: targetPath,
    backup: writeResult.backupPath,
  };
}

/** Auto-route all `detected` items in the inbox root (not unresolved/). */
export async function autoRoutePendingInbox(
  inboxDir: string,
  contentRoot: string,
): Promise<RouteInboxResult[]> {
  await fs.mkdir(inboxDir, { recursive: true });
  const entries = await fs.readdir(inboxDir, { withFileTypes: true }).catch(() => []);
  const results: RouteInboxResult[] = [];

  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(inboxDir, e.name), 'utf-8').catch(() => null);
    if (!raw) continue;
    let status: string | undefined;
    try {
      status = (JSON.parse(raw) as { status?: string }).status;
    } catch {
      continue;
    }
    if (status !== 'detected') continue;
    results.push(await routeInboxFile(inboxDir, e.name, contentRoot));
  }

  return results;
}
