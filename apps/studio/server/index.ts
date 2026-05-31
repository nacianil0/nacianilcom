import Fastify from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { watch } from 'fs';
import crypto from 'crypto';
import fastifyStatic from '@fastify/static';
import simpleGit from 'simple-git';
import { InboxItemSchema, MonthlyPlanSchema, sanitizeSvg } from '@nacianilcom/content-core';
import { autoRoutePendingInbox, routeInboxFile, safeInboxFilename } from './inboxRouter';
import { renderMermaidToSvg, listDiagramFiles } from './visual';
import { generatePlan, generateFilePrompt, analyzeContent } from './planner';
import { scaffoldFromPlan } from './planScaffolder';
import { generateAllCodexPrompts, getNextPrompt, getPendingSteps } from './promptGenerator';
import {
  buildSchedule,
  resolvePublishStatus,
  sortArticleIds,
  type ScheduleMode,
} from '../src/lib/publishScheduler';

async function loadDotEnv(): Promise<void> {
  const envPath = path.join(CWD, '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch { /* optional */ }
}

const HOST = '127.0.0.1';
const PORT = 3001;
const CWD = process.cwd(); // apps/studio when run via pnpm scripts
const REPO_ROOT = path.resolve(CWD, '../..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'content');
const PROMPTS_DIR = path.join(CWD, 'prompts');

void loadDotEnv();

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
    const seriesData = await safeReadJson<Record<string, unknown>>(
      path.join(CONTENT_ROOT, 'series', slug, 'series.json'),
    );
    const ids = await listArticleIds(slug);
    const articles = [];
    for (const id of ids) {
      const meta = await safeReadJson(path.join(CONTENT_ROOT, 'series', slug, 'articles', id, 'meta.json'));
      if (meta) articles.push({ id, meta });
    }
    if (articles.length === 0) continue;
    seriesList.push({
      slug,
      series: seriesData ?? {
        slug,
        title: { tr: slug, en: slug },
      },
      articles,
    });
  }

  return seriesList;
});

// GET /api/content/:seriesSlug/:articleId
server.get<{ Params: { seriesSlug: string; articleId: string } }>(
  '/api/content/:seriesSlug/:articleId',
  async (req, reply) => {
    const { seriesSlug, articleId } = req.params;
    const basePath = path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId);
    const [meta, brief, outline, references, series] = await Promise.all([
      safeReadJson(path.join(basePath, 'meta.json')),
      safeReadJson(path.join(basePath, 'brief.json')),
      safeReadJson(path.join(basePath, 'outline.json')),
      safeReadJson(path.join(basePath, 'references.json')),
      safeReadJson(path.join(CONTENT_ROOT, 'series', seriesSlug, 'series.json')),
    ]);
    if (!meta) return reply.status(404).send({ error: 'Not found' });

    const mdx = { tr: false, en: false };
    for (const lang of ['tr', 'en'] as const) {
      mdx[lang] = await fs.access(path.join(basePath, `final.${lang}.mdx`)).then(() => true).catch(() => false);
    }

    return {
      meta,
      brief: brief ?? null,
      outline: outline ?? null,
      references: references ?? [],
      series,
      files: { brief: brief != null, outline: outline != null, mdx },
    };
  },
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

interface ScheduleBatchBody {
  seriesSlug: string;
  articleIds?: string[];
  startDate: string;
  mode: ScheduleMode;
  commit?: boolean;
}

async function revalidatePublishedArticles(
  items: Array<{ seriesSlug: string; articleId: string; slugBase: string; status: string }>,
): Promise<void> {
  const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;

  const published = items.filter(i => i.status === 'published');
  if (published.length === 0) return;

  const paths = new Set<string>();
  const tags = new Set<string>(['list', 'sitemap', 'feed:tr', 'feed:en']);

  for (const item of published) {
    paths.add(`/tr/series/${item.seriesSlug}/${item.slugBase}`);
    paths.add(`/en/series/${item.seriesSlug}/${item.slugBase}`);
    paths.add(`/tr/series/${item.seriesSlug}`);
    paths.add(`/en/series/${item.seriesSlug}`);
    tags.add(`article:${item.articleId}`);
    tags.add(`series:${item.seriesSlug}`);
  }

  const ts = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({ ts, paths: [...paths], tags: [...tags] });
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
  await fetch(`${webUrl}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-signature': sig },
    body,
  }).catch(e => server.log.warn({ e }, 'revalidate call failed (non-fatal)'));
}

async function writeArticleSchedule(
  seriesSlug: string,
  articleId: string,
  publishDate: string,
): Promise<{ status: 'published' | 'scheduled'; slugBase: string }> {
  const metaPath = path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId, 'meta.json');
  const raw = await fs.readFile(metaPath, 'utf-8').catch(() => null);
  if (!raw) throw new Error(`Article not found: ${seriesSlug}/${articleId}`);

  const meta = JSON.parse(raw) as Record<string, unknown>;
  const status = resolvePublishStatus(publishDate);
  meta['status'] = status;
  meta['publishDate'] = publishDate;
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');
  return { status, slugBase: (meta['slugBase'] as string) || articleId };
}

server.post<{ Body: PublishBody }>('/api/publish', async (req, reply) => {
  const { seriesSlug, articleId, publishDate } = req.body;
  if (!seriesSlug || !articleId) {
    return reply.status(400).send({ error: 'seriesSlug and articleId required' });
  }

  const date = publishDate ?? new Date().toISOString().slice(0, 10);
  let result: { status: 'published' | 'scheduled'; slugBase: string };
  try {
    result = await writeArticleSchedule(seriesSlug, articleId, date);
  } catch {
    return reply.status(404).send({ error: 'Article not found' });
  }

  const metaPath = path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', articleId, 'meta.json');

  try {
    const git = simpleGit(REPO_ROOT);
    const relPath = path.relative(REPO_ROOT, metaPath).replace(/\\/g, '/');
    await git.add(relPath);
    const verb = result.status === 'published' ? 'publish' : 'schedule';
    await git.commit(`feat(content): ${verb} ${seriesSlug}/${articleId} [${date}]`);
    await git.push();
  } catch (err) {
    server.log.error({ err }, 'git commit/push failed');
    return reply.status(500).send({ error: 'git operation failed' });
  }

  await revalidatePublishedArticles([
    { seriesSlug, articleId, slugBase: result.slugBase, status: result.status },
  ]);

  return { ok: true, publishDate: date, status: result.status };
});

server.post<{ Body: ScheduleBatchBody }>('/api/publish/schedule', async (req, reply) => {
  const { seriesSlug, startDate, mode } = req.body;
  const shouldCommit = req.body.commit !== false;

  if (!seriesSlug || !startDate || !mode) {
    return reply.status(400).send({ error: 'seriesSlug, startDate and mode required' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return reply.status(400).send({ error: 'startDate must be YYYY-MM-DD' });
  }
  if (!['same-day', 'daily', 'weekly'].includes(mode)) {
    return reply.status(400).send({ error: 'mode must be same-day, daily or weekly' });
  }

  const seriesData = await safeReadJson<{ articleOrder?: string[] }>(
    path.join(CONTENT_ROOT, 'series', seriesSlug, 'series.json'),
  );
  if (!seriesData) return reply.status(404).send({ error: 'Series not found' });

  const allIds = await listArticleIds(seriesSlug);
  let candidateIds = req.body.articleIds?.length
    ? req.body.articleIds.filter(id => allIds.includes(id))
    : [];

  if (candidateIds.length === 0) {
    for (const id of allIds) {
      const meta = await safeReadJson<Record<string, unknown>>(
        path.join(CONTENT_ROOT, 'series', seriesSlug, 'articles', id, 'meta.json'),
      );
      if (meta && meta['status'] !== 'published') candidateIds.push(id);
    }
  }

  candidateIds = sortArticleIds(candidateIds, seriesData.articleOrder);
  if (candidateIds.length === 0) {
    return reply.status(400).send({ error: 'No articles to schedule' });
  }

  const plan = buildSchedule(candidateIds, startDate, mode);
  const applied: Array<{
    articleId: string;
    publishDate: string;
    status: 'published' | 'scheduled';
    slugBase: string;
  }> = [];

  for (const entry of plan) {
    const { status, slugBase } = await writeArticleSchedule(seriesSlug, entry.articleId, entry.publishDate);
    applied.push({
      articleId: entry.articleId,
      publishDate: entry.publishDate,
      status,
      slugBase,
    });
  }

  let commitSha: string | undefined;
  if (shouldCommit) {
    try {
      const git = simpleGit(REPO_ROOT);
      for (const item of applied) {
        const metaPath = path.join(
          CONTENT_ROOT,
          'series',
          seriesSlug,
          'articles',
          item.articleId,
          'meta.json',
        );
        const relPath = path.relative(REPO_ROOT, metaPath).replace(/\\/g, '/');
        await git.add(relPath);
      }
      const summary = `${applied.length} articles, ${mode}, from ${startDate}`;
      const commit = await git.commit(`feat(content): schedule ${seriesSlug} (${summary})`);
      commitSha = commit.commit;
      await git.push();
    } catch (err) {
      server.log.error({ err }, 'git commit/push failed');
      return reply.status(500).send({ error: 'git operation failed', applied });
    }
  }

  await revalidatePublishedArticles(
    applied.map(item => ({ seriesSlug, articleId: item.articleId, slugBase: item.slugBase, status: item.status })),
  );

  return {
    ok: true,
    seriesSlug,
    mode,
    startDate,
    scheduled: applied,
    commitSha,
  };
});

// ─── Inbox API (§26 — Auto Output Routing) ───────────────────────────────────

const INBOX_DIR = path.join(CONTENT_ROOT, '_inbox');

async function syncInboxRoutes(): Promise<void> {
  await autoRoutePendingInbox(INBOX_DIR, CONTENT_ROOT);
}

function startInboxWatcher(): void {
  let debounce: ReturnType<typeof setTimeout> | null = null;
  void fs.mkdir(INBOX_DIR, { recursive: true });
  watch(INBOX_DIR, (_, filename) => {
    if (!filename?.endsWith('.json')) return;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      void syncInboxRoutes().catch(err => server.log.warn({ err }, 'inbox auto-route failed'));
    }, 400);
  });
}

// GET /api/inbox — scan and list all items (root + unresolved/)
server.get('/api/inbox', async () => {
  await syncInboxRoutes();
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
  await syncInboxRoutes();
  return { ok: true, filename, status: 'detected' };
});

// POST /api/inbox/:filename/route — trigger routing for a specific file
server.post<{ Params: { filename: string } }>('/api/inbox/:filename/route', async (req, reply) => {
  const { filename } = req.params;
  const result = await routeInboxFile(INBOX_DIR, filename, CONTENT_ROOT);
  if (!result.ok) {
    if (result.status === 'needsReview') {
      return reply.status(422).send({ error: result.error, reason: result.error });
    }
    return reply.status(result.error === 'File not found' ? 404 : 400).send({ error: result.error });
  }
  return {
    ok: true,
    filename: result.filename,
    status: result.status,
    target: result.target,
    backup: result.backup,
  };
});

// POST /api/inbox/unresolved/:filename/route — retry routing for an unresolved item
server.post<{ Params: { filename: string } }>(
  '/api/inbox/unresolved/:filename/route',
  async (req, reply) => {
    const { filename } = req.params;
    if (!safeInboxFilename(filename)) return reply.status(400).send({ error: 'Invalid filename' });

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
  if (!safeInboxFilename(filename)) return reply.status(400).send({ error: 'Invalid filename' });
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

// ─── Visual Studio API (WP-10) ───────────────────────────────────────────────

// GET /api/visual/list/:seriesSlug — list .mmd and .svg files
server.get<{ Params: { seriesSlug: string } }>(
  '/api/visual/list/:seriesSlug',
  async (req) => {
    const { seriesSlug } = req.params;
    return listDiagramFiles(CONTENT_ROOT, seriesSlug);
  }
);

// POST /api/visual/render — render .mmd content → sanitized SVG
interface RenderBody { mmdContent: string; seriesSlug?: string; filename?: string }
server.post<{ Body: RenderBody }>('/api/visual/render', async (req, reply) => {
  const { mmdContent, seriesSlug, filename } = req.body;
  if (!mmdContent) return reply.status(400).send({ error: 'mmdContent required' });

  try {
    const result = await renderMermaidToSvg(mmdContent);
    return { ...result, seriesSlug, filename };
  } catch (err) {
    return reply.status(503).send({ error: String(err) });
  }
});

// POST /api/visual/sanitize — sanitize existing SVG content
interface SanitizeBody { svgContent: string }
server.post<{ Body: SanitizeBody }>('/api/visual/sanitize', async (req, reply) => {
  const { svgContent } = req.body;
  if (!svgContent) return reply.status(400).send({ error: 'svgContent required' });
  return sanitizeSvg(svgContent);
});

// GET /api/visual/file/:seriesSlug/:filename — serve a diagram file (mmd or svg)
server.get<{ Params: { seriesSlug: string; filename: string } }>(
  '/api/visual/file/:seriesSlug/:filename',
  async (req, reply) => {
    const { seriesSlug, filename } = req.params;
    if (!/^[a-zA-Z0-9_-]+\.(mmd|svg)$/.test(filename)) {
      return reply.status(400).send({ error: 'Invalid filename' });
    }
    const filePath = path.join(CONTENT_ROOT, 'series', seriesSlug, 'diagrams', filename);
    const content = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (!content) return reply.status(404).send({ error: 'File not found' });
    return { filename, content };
  }
);

// POST /api/visual/commit — save sanitized SVG and commit
interface CommitBody { seriesSlug: string; filename: string; svgContent: string; mmdContent?: string }
server.post<{ Body: CommitBody }>('/api/visual/commit', async (req, reply) => {
  const { seriesSlug, filename, svgContent, mmdContent } = req.body;
  if (!seriesSlug || !filename || !svgContent) {
    return reply.status(400).send({ error: 'seriesSlug, filename, svgContent required' });
  }
  if (!/^[a-zA-Z0-9_-]+\.svg$/.test(filename)) {
    return reply.status(400).send({ error: 'Invalid filename — must be *.svg' });
  }

  // Sanitize before commit (mandatory per §15/§29)
  const { sanitized, removals } = sanitizeSvg(svgContent);

  const diagramsDir = path.join(CONTENT_ROOT, 'series', seriesSlug, 'diagrams');
  await fs.mkdir(diagramsDir, { recursive: true });

  const svgPath = path.join(diagramsDir, filename);
  await fs.writeFile(svgPath, sanitized, 'utf-8');

  // Optionally save .mmd source alongside
  if (mmdContent) {
    const mmdFilename = filename.replace(/\.svg$/, '.mmd');
    await fs.writeFile(path.join(diagramsDir, mmdFilename), mmdContent, 'utf-8');
  }

  // Git commit
  try {
    const git = simpleGit(REPO_ROOT);
    const relSvg = path.relative(REPO_ROOT, svgPath).replace(/\\/g, '/');
    await git.add(relSvg);
    if (mmdContent) {
      const mmdFilename = filename.replace(/\.svg$/, '.mmd');
      const relMmd = path.relative(REPO_ROOT, path.join(diagramsDir, mmdFilename)).replace(/\\/g, '/');
      await git.add(relMmd);
    }
    await git.commit(`feat(content): add diagram ${seriesSlug}/${filename} (sanitized)`);
  } catch (err) {
    server.log.error({ err }, 'git commit failed for diagram');
    return reply.status(500).send({ error: 'git commit failed' });
  }

  return { ok: true, filename, removals, sanitized: true };
});

// ─── Monthly Plan API (WP-11) ─────────────────────────────────────────────────

const PLANS_DIR = path.join(CONTENT_ROOT, 'plans');

// GET /api/plans — list all YYYY-MM.json plans
server.get('/api/plans', async () => {
  await syncInboxRoutes();
  const entries = await fs.readdir(PLANS_DIR, { withFileTypes: true }).catch(() => []);
  const plans: unknown[] = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(PLANS_DIR, e.name), 'utf-8').catch(() => null);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      plans.push({ filename: e.name, month: parsed['month'], status: parsed['status'], selectedCount: (parsed['selected'] as unknown[])?.length ?? 0 });
    } catch { /* skip corrupt files */ }
  }
  return plans;
});

// GET /api/plans/:month — get a specific plan
server.get<{ Params: { month: string } }>('/api/plans/:month', async (req, reply) => {
  const { month } = req.params;
  if (!/^\d{4}-\d{2}$/.test(month)) return reply.status(400).send({ error: 'Invalid month format (YYYY-MM)' });
  const raw = await fs.readFile(path.join(PLANS_DIR, `${month}.json`), 'utf-8').catch(() => null);
  if (!raw) return reply.status(404).send({ error: 'Plan not found' });
  return JSON.parse(raw);
});

// POST /api/plans/generate — generate a new plan (deterministic + optional LLM)
interface GenerateBody { targetMonth: string; userNotes?: string; targetCount?: number }
server.post<{ Body: GenerateBody }>('/api/plans/generate', async (req, reply) => {
  const { targetMonth, userNotes = '', targetCount = 10 } = req.body;
  if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
    return reply.status(400).send({ error: 'targetMonth required (YYYY-MM)' });
  }

  const { plan, qcIssues } = await generatePlan(CONTENT_ROOT, targetMonth, userNotes, targetCount);
  return { plan, qcIssues };
});

// POST /api/plans/generate-prompt — file-based mode: generate Claude prompt
interface PromptBody { targetMonth: string; userNotes?: string }
server.post<{ Body: PromptBody }>('/api/plans/generate-prompt', async (req, reply) => {
  const { targetMonth, userNotes = '' } = req.body;
  if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
    return reply.status(400).send({ error: 'targetMonth required (YYYY-MM)' });
  }
  const analysis = await analyzeContent(CONTENT_ROOT);
  const prompt = generateFilePrompt(analysis, targetMonth, userNotes);
  return { prompt };
});

// PUT /api/plans/:month — save (create or update) a plan
server.put<{ Params: { month: string }; Body: Record<string, unknown> }>(
  '/api/plans/:month',
  async (req, reply) => {
    const { month } = req.params;
    if (!/^\d{4}-\d{2}$/.test(month)) return reply.status(400).send({ error: 'Invalid month format' });

    let plan;
    try {
      plan = MonthlyPlanSchema.parse(req.body);
    } catch (err) {
      return reply.status(400).send({ error: 'Invalid plan schema', detail: String(err) });
    }

    await fs.mkdir(PLANS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(PLANS_DIR, `${month}.json`),
      JSON.stringify(plan, null, 2) + '\n',
      'utf-8'
    );
    return { ok: true, month };
  }
);

// POST /api/plans/:month/approve — scaffold (+ optional Codex prompts)
server.post<{ Params: { month: string }; Body: { generateCodexPrompts?: boolean } }>(
  '/api/plans/:month/approve',
  async (req, reply) => {
  const { month } = req.params;
  const generateCodexPrompts = req.body?.generateCodexPrompts ?? false;
  if (!/^\d{4}-\d{2}$/.test(month)) return reply.status(400).send({ error: 'Invalid month format' });

  const raw = await fs.readFile(path.join(PLANS_DIR, `${month}.json`), 'utf-8').catch(() => null);
  if (!raw) return reply.status(404).send({ error: 'Plan not found' });

  let plan;
  try {
    plan = MonthlyPlanSchema.parse(JSON.parse(raw));
  } catch {
    return reply.status(400).send({ error: 'Invalid plan data' });
  }

  const scaffold = await scaffoldFromPlan(CONTENT_ROOT, plan);

  const updated = { ...plan, status: 'approved' as const };
  await fs.writeFile(
    path.join(PLANS_DIR, `${month}.json`),
    JSON.stringify(updated, null, 2) + '\n',
    'utf-8'
  );

  const newArticles = scaffold.series.flatMap(s => s.articles.filter(a => a.created));
  const newSeries = scaffold.series.filter(s => s.created).map(s => s.slug);

  let promptResults;
  if (generateCodexPrompts) {
    promptResults = await generateAllCodexPrompts(CONTENT_ROOT, PROMPTS_DIR, { writeToDisk: true });
  }

  const promptSummary = promptResults
    ? {
        total: promptResults.prompts.length,
        articlesSkipped: promptResults.skipped,
      }
    : undefined;

  return {
    ok: true,
    month,
    scaffold,
    promptResults,
    promptSummary,
    summary: {
      seriesCreated: newSeries,
      articlesScaffolded: newArticles.length,
      totalSelected: plan.selected.length,
    },
  };
});

// POST /api/prompts/codex/generate-all — filled Codex prompts for all pending articles
server.post<{ Body: { seriesSlug?: string } }>('/api/prompts/codex/generate-all', async (req) => {
  const { seriesSlug } = req.body ?? {};
  const result = await generateAllCodexPrompts(CONTENT_ROOT, PROMPTS_DIR, { seriesSlug, writeToDisk: true });
  return { ok: true, ...result };
});

// GET /api/prompts/codex/:seriesSlug/:articleId/next — next Codex prompt for one article
server.get<{ Params: { seriesSlug: string; articleId: string } }>(
  '/api/prompts/codex/:seriesSlug/:articleId/next',
  async (req, reply) => {
    const { seriesSlug, articleId } = req.params;
    const pending = await getPendingSteps(CONTENT_ROOT, seriesSlug, articleId);
    const prompt = await getNextPrompt(CONTENT_ROOT, PROMPTS_DIR, seriesSlug, articleId);
    if (!prompt) return reply.status(404).send({ error: 'Tüm adımlar tamam', pending: [] });
    return { pending, prompt };
  },
);

// ─── Resume API (WP-12) ──────────────────────────────────────────────────────

const RESUME_PATH = path.join(CONTENT_ROOT, 'resume', 'resume.json');

// GET /api/resume?lang=tr|en  — filtered for web (public only)
server.get<{ Querystring: { lang?: string } }>('/api/resume', async (req, reply) => {
  const lang = req.query.lang === 'en' ? 'en' : 'tr';
  const raw = await fs.readFile(RESUME_PATH, 'utf-8').catch(() => null);
  if (!raw) return reply.status(404).send({ error: 'resume.json not found' });
  const bilingual = JSON.parse(raw) as Record<string, unknown>;
  const resume = bilingual[lang];
  if (!resume) return reply.status(400).send({ error: 'Invalid lang' });
  // Return full (for studio preview — not public-facing, local only)
  return resume;
});

// POST /api/resume/pdf  — generate PDF via Playwright from /cv/print
interface PdfBody { lang?: string }
server.post<{ Body: PdfBody }>('/api/resume/pdf', async (req, reply) => {
  const lang = req.body?.lang === 'en' ? 'en' : 'tr';
  const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
  const printUrl = `${webUrl}/${lang}/cv/print`;

  // playwright is an optional devDependency — load at runtime to avoid hard dep
  // Install with: pnpm --filter @nacianilcom/studio add -D playwright
  type PwPage = { goto(u: string, o?: Record<string, unknown>): Promise<unknown>; pdf(o?: Record<string, unknown>): Promise<Buffer> };
  type PwBrowser = { newPage(): Promise<PwPage>; close(): Promise<void> };
  type PwModule = { chromium: { launch(o?: Record<string, unknown>): Promise<PwBrowser> } };

  const pwModuleName = 'playwright';
  let pw: PwModule | null = null;
  try {
    pw = (await import(pwModuleName)) as PwModule;
  } catch {
    return reply.status(503).send({ error: 'playwright not installed — run: pnpm --filter @nacianilcom/studio add -D playwright' });
  }

  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    const outputPath = path.join(REPO_ROOT, `naci-anil-akman-cv-${lang}.pdf`);
    await fs.writeFile(outputPath, pdfBuffer);
    return { ok: true, path: outputPath };
  } finally {
    await browser.close();
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen({ host: HOST, port: PORT }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  void loadDotEnv().then(() => {
    void syncInboxRoutes().catch(e => server.log.warn({ e }, 'startup inbox sync failed'));
    startInboxWatcher();
  });
});
