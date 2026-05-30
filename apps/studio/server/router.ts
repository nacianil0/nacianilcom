import path from 'path';
import fs from 'fs/promises';
import type { InboxItem } from '@nacianilcom/content-core';

// ─── Target path resolution ───────────────────────────────────────────────────

/**
 * Maps an InboxItem to its target file path in the content tree.
 * Returns null when required routing metadata is missing.
 */
export function resolveTargetPath(item: InboxItem, contentRoot: string): string | null {
  const { kind, targetMonth, seriesSlug, articleId, language, target } = item;

  switch (kind) {
    case 'monthlyPlan':
      return targetMonth
        ? path.join(contentRoot, 'plans', `${targetMonth}.json`)
        : null;

    case 'idea': {
      const slug = target ?? `idea-${item.createdAt.slice(0, 10)}`;
      return path.join(contentRoot, '_ideas', `${slug}.json`);
    }

    case 'seriesPlan':
      return seriesSlug
        ? path.join(contentRoot, 'series', seriesSlug, 'series.json')
        : null;

    case 'brief':
      return seriesSlug && articleId
        ? path.join(contentRoot, 'series', seriesSlug, 'articles', articleId, 'brief.json')
        : null;

    case 'outline':
      return seriesSlug && articleId
        ? path.join(contentRoot, 'series', seriesSlug, 'articles', articleId, 'outline.json')
        : null;

    case 'finalMdx':
      return seriesSlug && articleId && language
        ? path.join(contentRoot, 'series', seriesSlug, 'articles', articleId, `final.${language}.mdx`)
        : null;

    case 'visual': {
      const name = target ?? 'unnamed';
      return seriesSlug
        ? path.join(contentRoot, 'series', seriesSlug, 'diagrams', `${name}.svg`)
        : path.join(contentRoot, 'diagrams', `${name}.svg`);
    }

    case 'diagram': {
      const name = target ?? 'unnamed';
      return seriesSlug
        ? path.join(contentRoot, 'series', seriesSlug, 'diagrams', `${name}.mmd`)
        : path.join(contentRoot, 'diagrams', `${name}.mmd`);
    }

    case 'resume':
    case 'caseStudy':
      return path.join(contentRoot, 'resume', 'resume.json');

    case 'seoQc':
      return seriesSlug && articleId
        ? path.join(contentRoot, 'series', seriesSlug, 'articles', articleId, 'seo-qc.json')
        : null;

    case 'redirect':
      return path.join(contentRoot, 'redirects.json');
  }
}

// ─── Backup + write ───────────────────────────────────────────────────────────

export interface WriteResult {
  targetPath: string;
  backupPath: string | null;
}

/**
 * Writes content to targetPath.
 * If targetPath already exists, backs it up to targetPath + '.bak' first.
 * Never silently overwrites (§26).
 */
export async function writeWithBackup(targetPath: string, content: string): Promise<WriteResult> {
  let backupPath: string | null = null;

  // Check for existing file and back it up
  try {
    const existing = await fs.readFile(targetPath, 'utf-8');
    backupPath = `${targetPath}.bak`;
    await fs.writeFile(backupPath, existing, 'utf-8');
  } catch {
    // File does not exist — no backup needed
  }

  // Ensure parent directory exists
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, 'utf-8');

  return { targetPath, backupPath };
}

// ─── Payload serialization ────────────────────────────────────────────────────

/** Serializes the InboxItem payload to a string suitable for writing to disk. */
export function serializePayload(item: InboxItem): string {
  if (typeof item.payload === 'string') return item.payload;
  return JSON.stringify(item.payload, null, 2) + '\n';
}

// ─── Unresolved handling ──────────────────────────────────────────────────────

/**
 * Moves an inbox item to content/_inbox/unresolved/ with a reason attached.
 * Ensures the item is never silently lost (§26).
 */
export async function moveToUnresolved(
  filename: string,
  inboxDir: string,
  item: InboxItem,
  reason: string,
): Promise<void> {
  const unresolvedDir = path.join(inboxDir, 'unresolved');
  await fs.mkdir(unresolvedDir, { recursive: true });

  const updated: InboxItem = {
    ...item,
    status: 'needsReview',
    reviewReason: reason,
  };

  await fs.writeFile(
    path.join(unresolvedDir, filename),
    JSON.stringify(updated, null, 2) + '\n',
    'utf-8',
  );
  // Remove from inbox root
  await fs.unlink(path.join(inboxDir, filename)).catch(() => null);
}
