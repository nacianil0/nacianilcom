import Fastify from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import fastifyStatic from '@fastify/static';
import simpleGit from 'simple-git';
import { InboxItemSchema } from '@nacianilcom/content-core';
import { resolveTargetPath, writeWithBackup, serializePayload, moveToUnresolved } from './router';

const HOST = '127.0.0.1';
const PORT = 3001;
const CWD = process.cwd(); // apps/studio when run via pnpm scripts
const REPO_ROOT = path.resolve(CWD, '../..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'content');
const PROMPTS_DIR = path.join(CWD, 'prompts');

const server = Fastify({ logger: true });

server.register(fastifyStatic, {
  root: path.join(CWD, 'dist', 'client'),
  prefix: '/',
});

server.get('/api/health', async () => ({ status: 'ok', host: HOST }));

// ─── Content API ─────────────────────────────────────────────────────────────

async function safeReadJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function listSeriesSlugs(): Promise<string[]> {
  const seriesDir = path.join(CONTENT_ROOT, 'series');
  const entries = await fs.readdir(seriesDir, { withFileTypes: true }).catch(() => []);
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

async function listArticleIds(seriesSlug: string): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles');
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

// GET /api/content/list
server.get('/api/content/list', async () => {
  const slugs = await listSeriesSlugs();
  const seriesList = [];

  for (const slug of slugs) {
    const seriesData = await safeReadJson(path.join(CONTENT_ROOT, 'series', slug, 'series.json'));
    if (!seriesData) continue;
    const ids = await listArticleIds(slug);
    const articles = [];
    for (const id of ids) {
      const meta = await safeReadJson(path.join(CONTENT_ROOT, 'series', slug, 'articles', id, 'meta.json'));
      if (meta) articles.push({ id, meta });
    }
    seriesList.push({ slug, series: seriesData, articles });
  }

  return seriesList;
});

// GET /api/content/:seriesSlug/:articleId
server.get<{ Params: { seriesSlug: string; articleId: string } }>(
  '/api/content/:seriesSlug/:articleId',
  async (req, reply) => {
    const { seriesSlug, articleId } = req.params;
    const basePath = path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId);
    const [meta, references, series] = await Promise.all([
      safeReadJson(path.join(basePath, 'meta.json')),
      safeReadJson(path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId, 'references.json')),
      safeReadJson(path.join(CONTENT_ROOT, 'series', seriesSlug, 'series.json')),
    ]);
    if (!meta) return reply.status(404).send({ error: 'Not found' });
    return { meta, references: references ?? [], series };
  }
);

// GET /api/content/:seriesSlug/:articleId/mdx/:lang
server.get<{ Params: { seriesSlug: string; articleId: string; lang: string } }>(
  '/api/content/:seriesSlug/:articleId/mdx/:lang',
  async (req, reply) => {
    const { seriesSlug, articleId, lang } = req.params;
    const filePath = path.join(
      CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId, `final.${lang}.mdx`
    );
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { content };
    } catch {
      return reply.status(404).send({ error: 'Not found' });
    }
  }
);

// GET /api/content/catalog  — full catalog for InternalLink QC
server.get('/api/content/catalog', async () => {
  const slugs = await listSeriesSlugs();
  const articles: unknown[] = [];
  const series: unknown[] = [];

  for (const slug of slugs) {
    series.push({ slug });
    const ids = await listArticleIds(slug);
    for (const id of ids) {
      const meta = await safeReadJson<Record<string, unknown>>(
        path.join(CONTENT_ROOT, 'series', slug, 'articles', id, 'meta.json')
      );
      if (meta) {
        articles.push({
          id: meta['id'],
          seriesSlug: slug,
          slugBase: meta['slugBase'],
          status: meta['status'],
          publishDate: meta['publishDate'],
        });
      }
    }
  }

  return { articles, series, cases: [] };
});

// GET /api/content/taxonomy
server.get('/api/content/taxonomy', async () => {
  return safeReadJson(path.join(CONTENT_ROOT, 'taxonomy.json')) ?? { categories: [], tags: [] };
});

// GET /api/content/redirects
server.get('/api/content/redirects', async () => {
  return safeReadJson(path.join(CONTENT_ROOT, 'redirects.json')) ?? [];
});

// ─── Publish API ─────────────────────────────────────────────────────────────

interface PublishBody {
  seriesSlug: string;
  articleId: string;
  publishDate?: string;
}

server.post<{ Body: PublishBody }>('/api/publish', async (req, reply) => {
  const { seriesSlug, articleId, publishDate } = req.body;
  if (!seriesSlug || !articleId) {
    return reply.status(400).send({ error: 'seriesSlug and articleId required' });
  }

  const metaPath = path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId, 'meta.json');
  const raw = await fs.readFile(metaPath, 'utf-8').catch(() => null);
  if (!raw) return reply.status(404).send({ error: 'Article not found' });

  const meta = JSON.parse(raw) as Record<string, unknown>;
  const date = publishDate ?? new Date().toISOString().slice(0, 10);
  meta['status'] = 'published';
  meta['publishDate'] = date;

  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');

  // Git commit + push
  try {
    const git = simpleGit(REPO_ROOT);
    const relPath = path.relative(REPO_ROOT, metaPath).replace(/\\/g, '/');
    await git.add(relPath);
    await git.commit(`feat(content): publish ${seriesSlug}/${articleId} [${date}]`);
    await git.push();
  } catch (err) {
    server.log.error({ err }, 'git commit/push failed');
    return reply.status(500).send({ error: 'git operation failed' });
  }

  // Call /api/revalidate (best-effort)
  const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const ts = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ ts, path: '/' });
    const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
    await fetch(`${webUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': sig },
      body,
    }).catch(e => server.log.warn({ e }, 'revalidate call failed (non-fatal)'));
  }

  return { ok: true, publishDate: date };
});

// ─── Inbox API (§26 — Auto Output Routing) ───────────────────────────────────

const INBOX_DIR = path.join(CONTENT_ROOT, '_inbox');

function safeFilename(name: string): boolean {
  return /^[a-z0-9_.-]+\.json$/.test(name);
}

// GET /api/inbox — scan and list all items (root + unresolved/)
server.get('/api/inbox', async () => {
  const readDir = async (dir: string, prefix = '') => {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const items: unknown[] = [];
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.json')) continue;
      const filePath = path.join(dir, e.name);
      const raw = await fs.readFile(filePath, 'utf-8').catch(() => null);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        items.push({ filename: prefix + e.name, ...parsed });
      } catch {
        items.push({ filename: prefix + e.name, status: 'failed', reviewReason: 'Invalid JSON' });
      }
    }
    return items;
  };

  const root = await readDir(INBOX_DIR);
  const unresolved = await readDir(path.join(INBOX_DIR, 'unresolved'), 'unresolved/');
  return [...root, ...unresolved];
});

// POST /api/inbox — drop a new item (Claude Code or external output)
server.post<{ Body: Record<string, unknown> }>('/api/inbox', async (req, reply) => {
  let item;
  try {
    item = InboxItemSchema.parse({ ...req.body, status: 'detected' });
  } catch (err) {
    return reply.status(400).send({ error: 'Invalid inbox item schema', detail: String(err) });
  }

  await fs.mkdir(INBOX_DIR, { recursive: true });
  const filename = `${item.kind}-${item.createdAt.replace(/[T:.Z]/g, '-').slice(0, 19)}.json`;
  const filePath = path.join(INBOX_DIR, filename);

  // Idempotency: if file already exists with same content, skip
  const existing = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (existing) {
    try {
      const existingItem = InboxItemSchema.parse(JSON.parse(existing));
      if (existingItem.status === 'routed') {
        return { ok: true, filename, status: 'already-routed', target: existingItem.target };
      }
    } catch { /* re-write */ }
  }

  await fs.writeFile(filePath, JSON.stringify(item, null, 2) + '\n', 'utf-8');
  return { ok: true, filename, status: 'detected' };
});

// POST /api/inbox/:filename/route — trigger routing for a specific file
server.post<{ Params: { filename: string } }>('/api/inbox/:filename/route', async (req, reply) => {
  const { filename } = req.params;
  if (!safeFilename(filename)) return reply.status(400).send({ error: 'Invalid filename' });

  const filePath = path.join(INBOX_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (!raw) return reply.status(404).send({ error: 'File not found' });

  let item;
  try {
    item = InboxItemSchema.parse(JSON.parse(raw));
  } catch (err) {
    // Mark as failed
    const failed = { ...(JSON.parse(raw) as Record<string, unknown>), status: 'failed', reviewReason: 'Schema validation failed' };
    await fs.writeFile(filePath, JSON.stringify(failed, null, 2) + '\n', 'utf-8');
    return reply.status(400).send({ error: 'Schema validation failed', detail: String(err) });
  }

  // Idempotency: already routed → skip
  if (item.status === 'routed') {
    return { ok: true, filename, status: 'already-routed', target: item.target };
  }

  const targetPath = resolveTargetPath(item, CONTENT_ROOT);

  if (!targetPath) {
    await moveToUnresolved(filename, INBOX_DIR, item, 'Missing required routing fields');
    return reply.status(422).send({
      error: 'Cannot determine target path',
      reason: 'Missing required routing fields (targetMonth / seriesSlug / articleId / language)',
    });
  }

  const content = serializePayload(item);
  const writeResult = await writeWithBackup(targetPath, content);

  // Update inbox item to routed
  const routed = {
    ...item,
    status: 'routed' as const,
    target: targetPath,
    backupPath: writeResult.backupPath,
  };
  await fs.writeFile(filePath, JSON.stringify(routed, null, 2) + '\n', 'utf-8');

  return {
    ok: true,
    filename,
    status: 'routed',
    target: targetPath,
    backup: writeResult.backupPath,
  };
});

// POST /api/inbox/unresolved/:filename/route — retry routing for an unresolved item
server.post<{ Params: { filename: string } }>(
  '/api/inbox/unresolved/:filename/route',
  async (req, reply) => {
    const { filename } = req.params;
    if (!safeFilename(filename)) return reply.status(400).send({ error: 'Invalid filename' });

    const filePath = path.join(INBOX_DIR, 'unresolved', filename);
    const raw = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (!raw) return reply.status(404).send({ error: 'File not found' });

    // Move back to inbox root and re-route
    await fs.mkdir(INBOX_DIR, { recursive: true });
    await fs.copyFile(filePath, path.join(INBOX_DIR, filename));
    await fs.unlink(filePath).catch(() => null);

    // Delegate to the main route handler via recursive logic
    const raw2 = await fs.readFile(path.join(INBOX_DIR, filename), 'utf-8').catch(() => null);
    if (!raw2) return reply.status(500).send({ error: 'Move failed' });

    let item;
    try {
      item = InboxItemSchema.parse({ ...JSON.parse(raw2), status: 'detected' });
    } catch {
      return reply.status(400).send({ error: 'Schema validation failed' });
    }

    await fs.writeFile(
      path.join(INBOX_DIR, filename),
      JSON.stringify(item, null, 2) + '\n',
      'utf-8',
    );
    return reply.redirect(`/api/inbox/${filename}/route`);
  },
);

// DELETE /api/inbox/:filename — discard an item (explicit user action)
server.delete<{ Params: { filename: string } }>('/api/inbox/:filename', async (req, reply) => {
  const { filename } = req.params;
  if (!safeFilename(filename)) return reply.status(400).send({ error: 'Invalid filename' });
  await fs.unlink(path.join(INBOX_DIR, filename)).catch(() => null);
  return { ok: true };
});

// ─── Prompts API ─────────────────────────────────────────────────────────────

server.get('/api/prompts', async () => {
  const entries = await fs.readdir(PROMPTS_DIR, { withFileTypes: true }).catch(() => []);
  const prompts = entries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => {
      const name = e.name.replace('.md', '');
      const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return { name, title };
    });
  return prompts;
});

server.get<{ Params: { name: string } }>('/api/prompts/:name', async (req, reply) => {
  const { name } = req.params;
  // Sanitize: only allow alphanumeric + hyphens
  if (!/^[a-z0-9-]+$/.test(name)) return reply.status(400).send({ error: 'Invalid name' });
  const filePath = path.join(PROMPTS_DIR, `${name}.md`);
  const content = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (!content) return reply.status(404).send({ error: 'Not found' });
  return { name, content };
});

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen({ host: HOST, port: PORT }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
