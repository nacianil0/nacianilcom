import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { spawn } from 'child_process';
import { sanitizeSvg } from '@nacianilcom/content-core';

// Path to mmdc binary installed as devDependency
const MMDC = path.resolve(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc'
);

export interface RenderResult {
  svg: string;
  sanitized: string;
  removals: string[];
}

/**
 * Renders a Mermaid .mmd string to sanitized SVG.
 * Spawns mmdc (from @mermaid-js/mermaid-cli) locally.
 * Throws if mmdc is unavailable or diagram has a syntax error.
 */
export async function renderMermaidToSvg(mmdContent: string): Promise<RenderResult> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-mmd-'));
  const inputPath = path.join(tmpDir, 'diagram.mmd');
  const outputPath = path.join(tmpDir, 'diagram.svg');

  try {
    await fs.writeFile(inputPath, mmdContent, 'utf-8');
    await spawnMmdc(inputPath, outputPath);

    const raw = await fs.readFile(outputPath, 'utf-8');
    const { sanitized, removals } = sanitizeSvg(raw);

    return { svg: raw, sanitized, removals };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

function spawnMmdc(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(MMDC, ['-i', inputPath, '-o', outputPath, '--quiet'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stderr: Buffer[] = [];
    proc.stderr?.on('data', (chunk: Buffer) => stderr.push(chunk));

    proc.on('error', (err) => {
      reject(new Error(`mmdc not found: ${err.message}. Install @mermaid-js/mermaid-cli.`));
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        const msg = Buffer.concat(stderr).toString().trim();
        reject(new Error(`mmdc exited with code ${String(code)}: ${msg}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Lists all .mmd and .svg files in content/series/<seriesSlug>/diagrams/.
 */
export async function listDiagramFiles(
  contentRoot: string,
  seriesSlug: string
): Promise<{ mmd: string[]; svg: string[] }> {
  const dir = path.join(contentRoot, 'series', seriesSlug, 'diagrams');
  let entries: { name: string; isFile: () => boolean }[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    // directory doesn't exist yet
  }
  const files = entries.filter(e => e.isFile()).map(e => e.name);
  return {
    mmd: files.filter(f => f.endsWith('.mmd')),
    svg: files.filter(f => f.endsWith('.svg')),
  };
}

/**
 * Reads and sanitizes an existing SVG file.
 */
export async function sanitizeSvgFile(filePath: string): Promise<RenderResult | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { sanitized, removals } = sanitizeSvg(raw);
    return { svg: raw, sanitized, removals };
  } catch {
    return null;
  }
}
