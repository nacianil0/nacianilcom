import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { generatePromptForStep, getPendingSteps } from '../../server/promptGenerator';

describe('promptGenerator', () => {
  let tmp: string;
  let promptsDir: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'prompt-gen-'));
    promptsDir = path.join(tmp, 'studio-prompts');
    await fs.mkdir(promptsDir, { recursive: true });
    await fs.writeFile(
      path.join(promptsDir, 'outline.md'),
      '# Outline\n\nSERI_SLUG=old\nYAZI_ID=old\nKONU="old"\n',
      'utf-8',
    );

    const articleDir = path.join(tmp, 'series', 'llm-nasil-calisir', 'articles', '01-token-nedir');
    await fs.mkdir(articleDir, { recursive: true });
    await fs.writeFile(
      path.join(articleDir, 'brief.json'),
      JSON.stringify({ topic: 'Token Nedir?', draftStructure: ['Giriş'] }),
      'utf-8',
    );
    await fs.writeFile(
      path.join(articleDir, 'meta.json'),
      JSON.stringify({ id: '01-token-nedir', series: 'llm-nasil-calisir', slugBase: 'token-nedir' }),
      'utf-8',
    );
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('detects outline as next pending step', async () => {
    const pending = await getPendingSteps(tmp, 'llm-nasil-calisir', '01-token-nedir');
    expect(pending[0]).toBe('outline');
  });

  it('fills SERI_SLUG and YAZI_ID in generated prompt', async () => {
    const prompt = await generatePromptForStep(
      tmp,
      promptsDir,
      'llm-nasil-calisir',
      '01-token-nedir',
      'outline',
      true,
    );
    expect(prompt.content).toContain('SERI_SLUG=llm-nasil-calisir');
    expect(prompt.content).toContain('YAZI_ID=01-token-nedir');
    expect(prompt.content).toContain('Token Nedir?');
    await fs.access(path.join(tmp, '_prompts', 'llm-nasil-calisir', '01-token-nedir', 'outline.md'));
  });
});
