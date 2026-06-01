#!/usr/bin/env node
// Block .env commits and scan for common API key / token patterns.
// Usage:
//   node scripts/check-secrets.js          — pre-commit (staged files)
//   node scripts/check-secrets.js --ci     — CI (all tracked files)

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CI_MODE = process.argv.includes('--ci');

const SECRET_PATTERNS = [
  { name: 'Anthropic API key', re: /sk-ant-api\d{2}-[A-Za-z0-9_-]{20,}/ },
  { name: 'OpenAI project key', re: /sk-proj-[A-Za-z0-9_-]{20,}/ },
  { name: 'OpenAI API key', re: /sk-[a-zA-Z0-9]{48,}/ },
  { name: 'GitHub PAT', re: /ghp_[A-Za-z0-9]{36,}/ },
  { name: 'GitHub OAuth token', re: /gho_[A-Za-z0-9]{36,}/ },
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
];

const PLACEHOLDER_HINTS = [
  'replace-with',
  'your-',
  'changeme',
  'example',
  'xxx',
  '...',
  'min-32-chars',
  'smoke-test-secret',
];

/** @param {string} filePath */
function isForbiddenEnvFile(filePath) {
  const base = path.basename(filePath);
  if (base === '.env') return true;
  if (base.startsWith('.env.') && !base.endsWith('.example')) return true;
  return false;
}

/** @param {string} filePath */
function shouldSkipContentScan(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.endsWith('.env.example') || norm.includes('/.env.example')) return true;
  if (norm.endsWith('scripts/check-secrets.js')) return true;
  if (norm.endsWith('pnpm-lock.yaml')) return true;
  if (norm.includes('/node_modules/')) return true;
  if (norm.endsWith('.png') || norm.endsWith('.jpg') || norm.endsWith('.pdf')) return true;
  return false;
}

/** @param {string} line */
function isBenignLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return PLACEHOLDER_HINTS.some(h => trimmed.includes(h));
  }
  return PLACEHOLDER_HINTS.some(h => line.includes(h));
}

function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8' }).trim();
}

function getStagedFiles() {
  const out = git('diff --cached --name-only --diff-filter=ACMR');
  return out ? out.split('\n').filter(Boolean) : [];
}

function getTrackedFiles() {
  const out = git('ls-files');
  return out ? out.split('\n').filter(Boolean) : [];
}

/** @param {string} filePath @param {string} content */
function scanContent(filePath, content) {
  if (shouldSkipContentScan(filePath)) return [];

  const findings = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isBenignLine(line)) continue;

    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(line)) {
        findings.push({ filePath, line: i + 1, kind: name });
        break;
      }
    }
  }

  return findings;
}

/** @param {string} filePath */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/** @param {string} filePath */
function readStagedContent(filePath) {
  try {
    return git(`show :${filePath}`);
  } catch {
    return null;
  }
}

function main() {
  const errors = [];
  const files = CI_MODE ? getTrackedFiles() : getStagedFiles();

  if (!CI_MODE && files.length === 0) {
    process.exit(0);
  }

  for (const file of files) {
    if (isForbiddenEnvFile(file)) {
      errors.push(`Forbidden env file: ${file} (use .env.example for templates)`);
      continue;
    }

    const content = CI_MODE ? readFileSafe(file) : readStagedContent(file);
    if (content == null) continue;

    for (const finding of scanContent(file, content)) {
      errors.push(`${finding.kind} in ${finding.filePath}:${finding.line}`);
    }
  }

  if (errors.length === 0) {
    const scope = CI_MODE ? 'tracked files' : 'staged files';
    console.log(`✓ Secret scan passed (${scope})`);
    process.exit(0);
  }

  console.error('\n✗ Secret scan failed:\n');
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  console.error('\nRemove secrets from the commit. Real keys belong in .env (gitignored) or Vercel env.\n');
  process.exit(1);
}

main();
