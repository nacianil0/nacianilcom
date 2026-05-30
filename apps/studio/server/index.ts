import Fastify from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import fastifyStatic from '@fastify/static';
import simpleGit from 'simple-git';
import { InboxItemSchema, MonthlyPlanSchema, sanitizeSvg } from '@nacianilcom/content-core';
import { resolveTargetPath, writeWithBackup, serializePayload, moveToUnresolved } from './router';
import { renderMermaidToSvg, listDiagramFiles } from './visual';
import { generatePlan, generateFilePrompt, analyzeContent } from './planner';

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

// POST /api/plans/:month/approve — approve plan and route selected topics to _ideas/
server.post<{ Params: { month: string } }>('/api/plans/:month/approve', async (req, reply) => {
  const { month } = req.params;
  if (!/^\d{4}-\d{2}$/.test(month)) return reply.status(400).send({ error: 'Invalid month format' });

  const raw = await fs.readFile(path.join(PLANS_DIR, `${month}.json`), 'utf-8').catch(() => null);
  if (!raw) return reply.status(404).send({ error: 'Plan not found' });

  let plan;
  try {
    plan = MonthlyPlanSchema.parse(JSON.parse(raw));
  } catch {
    return reply.status(400).send({ error: 'Invalid plan data' });
  }

  const ideasDir = path.join(CONTENT_ROOT, '_ideas');
  await fs.mkdir(ideasDir, { recursive: true });

  const routed: string[] = [];
  for (const topic of plan.selected) {
    const slug = topic.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    const filename = `${month}-${slug}.json`;
    const filePath = path.join(ideasDir, filename);
    await fs.writeFile(filePath, JSON.stringify({ month, topic }, null, 2) + '\n', 'utf-8');
    routed.push(filename);
  }

  // Mark plan as approved
  const updated = { ...plan, status: 'approved' as const };
  await fs.writeFile(
    path.join(PLANS_DIR, `${month}.json`),
    JSON.stringify(updated, null, 2) + '\n',
    'utf-8'
  );

  return { ok: true, month, routed };
});

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
});
