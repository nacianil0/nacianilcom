import path from 'path';
import fs from 'fs/promises';

export type CodexPromptStep = 'outline' | 'tr-draft' | 'tr-final-mdx';

const STEP_TEMPLATES: Record<CodexPromptStep, string> = {
  outline: 'outline.md',
  'tr-draft': 'tr-draft.md',
  'tr-final-mdx': 'tr-final-mdx.md',
};

export interface ArticleRef {
  seriesSlug: string;
  articleId: string;
}

export interface GeneratedPrompt {
  seriesSlug: string;
  articleId: string;
  step: CodexPromptStep;
  title: string;
  content: string;
  path: string;
}

export interface GeneratePromptsResult {
  prompts: GeneratedPrompt[];
  skipped: number;
}

async function readJson(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(() => true).catch(() => false);
}

export async function listScaffoldedArticles(contentRoot: string): Promise<ArticleRef[]> {
  const seriesDir = path.join(contentRoot, 'series');
  const entries = await fs.readdir(seriesDir, { withFileTypes: true }).catch(() => []);
  const refs: ArticleRef[] = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const articlesDir = path.join(seriesDir, e.name, 'articles');
    const articleEntries = await fs.readdir(articlesDir, { withFileTypes: true }).catch(() => []);
    for (const a of articleEntries) {
      if (!a.isDirectory()) continue;
      const briefPath = path.join(articlesDir, a.name, 'brief.json');
      if (await fileExists(briefPath)) {
        refs.push({ seriesSlug: e.name, articleId: a.name });
      }
    }
  }
  return refs;
}

export async function getPendingSteps(
  contentRoot: string,
  seriesSlug: string,
  articleId: string,
): Promise<CodexPromptStep[]> {
  const base = path.join(contentRoot, 'series', seriesSlug, 'articles', articleId);
  const pending: CodexPromptStep[] = [];

  const hasBrief = await fileExists(path.join(base, 'brief.json'));
  if (!hasBrief) return pending;

  const hasOutline = await fileExists(path.join(base, 'outline.json'));
  const mdxPath = path.join(base, 'final.tr.mdx');
  const hasMdx = await fileExists(mdxPath);

  let mdxHasFrontmatter = false;
  if (hasMdx) {
    const raw = await fs.readFile(mdxPath, 'utf-8').catch(() => '');
    mdxHasFrontmatter = raw.trimStart().startsWith('---');
  }

  if (!hasOutline) pending.push('outline');
  if (hasOutline && (!hasMdx || (await fs.readFile(mdxPath, 'utf-8')).trim().length < 100)) {
    pending.push('tr-draft');
  }
  if (hasMdx && !mdxHasFrontmatter) pending.push('tr-final-mdx');

  return pending;
}

function substituteVars(template: string, vars: { SERI_SLUG: string; YAZI_ID: string; KONU: string }): string {
  return template
    .replace(/SERI_SLUG=[^\n\r]+/g, `SERI_SLUG=${vars.SERI_SLUG}`)
    .replace(/YAZI_ID=[^\n\r]+/g, `YAZI_ID=${vars.YAZI_ID}`)
    .replace(/KONU="[^"]*"/g, `KONU="${vars.KONU.replace(/"/g, '\\"')}"`);
}

async function buildContextBlock(
  contentRoot: string,
  seriesSlug: string,
  articleId: string,
  step: CodexPromptStep,
): Promise<string> {
  const base = path.join(contentRoot, 'series', seriesSlug, 'articles', articleId);
  const brief = await readJson(path.join(base, 'brief.json'));
  const meta = await readJson(path.join(base, 'meta.json'));
  const outline = await readJson(path.join(base, 'outline.json'));
  const series = await readJson(path.join(contentRoot, 'series', seriesSlug, 'series.json'));

  const parts = [
    '---',
    '## Studio — otomatik doldurulmuş bağlam',
    '',
    `\`SERI_SLUG=${seriesSlug}\``,
    `\`YAZI_ID=${articleId}\``,
    '',
    'Bu blok Studio tarafından eklendi. Yukarıdaki prompt talimatlarını uygula; dosyaları repoya yaz.',
    '',
  ];

  if (series) {
    parts.push('### series.json', '```json', JSON.stringify(series, null, 2), '```', '');
  }
  if (meta) {
    parts.push('### meta.json', '```json', JSON.stringify(meta, null, 2), '```', '');
  }
  if (brief) {
    parts.push('### brief.json', '```json', JSON.stringify(brief, null, 2), '```', '');
  }
  if (outline && step !== 'outline') {
    parts.push('### outline.json', '```json', JSON.stringify(outline, null, 2), '```', '');
  }
  if (step === 'tr-final-mdx') {
    const mdx = await fs.readFile(path.join(base, 'final.tr.mdx'), 'utf-8').catch(() => null);
    if (mdx) {
      parts.push('### Mevcut final.tr.mdx (taslak)', '```markdown', mdx.trim(), '```', '');
    }
  }

  parts.push(
    '### Hedef dosyalar',
    `- outline → \`content/series/${seriesSlug}/articles/${articleId}/outline.json\``,
    `- tr-draft → \`content/series/${seriesSlug}/articles/${articleId}/final.tr.mdx\` (frontmatter yok)`,
    `- tr-final-mdx → aynı \`final.tr.mdx\` (frontmatter + MDX bileşenleri)`,
  );

  return parts.join('\n');
}

export async function generatePromptForStep(
  contentRoot: string,
  promptsDir: string,
  seriesSlug: string,
  articleId: string,
  step: CodexPromptStep,
  writeToDisk: boolean,
): Promise<GeneratedPrompt> {
  const templateFile = path.join(promptsDir, STEP_TEMPLATES[step]);
  const template = await fs.readFile(templateFile, 'utf-8');
  const base = path.join(contentRoot, 'series', seriesSlug, 'articles', articleId);
  const brief = await readJson(path.join(base, 'brief.json'));
  const meta = await readJson(path.join(base, 'meta.json'));
  const konu = String(brief?.['topic'] ?? meta?.['slugBase'] ?? articleId);

  const filled = substituteVars(template, { SERI_SLUG: seriesSlug, YAZI_ID: articleId, KONU: konu });
  const content = `${filled}\n${await buildContextBlock(contentRoot, seriesSlug, articleId, step)}`;

  const relPath = `_prompts/${seriesSlug}/${articleId}/${step}.md`;
  const absPath = path.join(contentRoot, relPath);

  if (writeToDisk) {
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, content, 'utf-8');
  }

  const titles: Record<CodexPromptStep, string> = {
    outline: 'Outline',
    'tr-draft': 'TR Draft',
    'tr-final-mdx': 'TR Final MDX',
  };

  return {
    seriesSlug,
    articleId,
    step,
    title: titles[step],
    content,
    path: `content/${relPath}`,
  };
}

export async function generateAllCodexPrompts(
  contentRoot: string,
  promptsDir: string,
  options: { seriesSlug?: string; writeToDisk?: boolean } = {},
): Promise<GeneratePromptsResult> {
  let refs = await listScaffoldedArticles(contentRoot);
  if (options.seriesSlug) refs = refs.filter(r => r.seriesSlug === options.seriesSlug);

  const writeToDisk = options.writeToDisk ?? true;
  const prompts: GeneratedPrompt[] = [];
  let skipped = 0;

  for (const { seriesSlug, articleId } of refs) {
    const pending = await getPendingSteps(contentRoot, seriesSlug, articleId);
    if (pending.length === 0) {
      skipped++;
      continue;
    }
    for (const step of pending) {
      prompts.push(await generatePromptForStep(contentRoot, promptsDir, seriesSlug, articleId, step, writeToDisk));
    }
  }

  return { prompts, skipped };
}

export async function getNextPrompt(
  contentRoot: string,
  promptsDir: string,
  seriesSlug: string,
  articleId: string,
): Promise<GeneratedPrompt | null> {
  const pending = await getPendingSteps(contentRoot, seriesSlug, articleId);
  const step = pending[0];
  if (!step) return null;
  return generatePromptForStep(contentRoot, promptsDir, seriesSlug, articleId, step, false);
}
