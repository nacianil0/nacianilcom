"use client";

import { useMemo, useState } from 'react';
import { cn } from '../lib/cn';

type SyntaxLanguage = 'javascript' | 'typescript' | 'csharp' | 'json' | 'text';
type TokenKind = 'plain' | 'keyword' | 'string' | 'comment' | 'number';

interface CodeToken {
  kind: TokenKind;
  text: string;
}

export interface CodeBlockProps {
  children: string;
  /** Required per §16 - build will block if absent */
  language: string;
  isPseudoCode?: boolean;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  copyLabel?: string;
  copiedLabel?: string;
  showAllLabel?: string;
  className?: string;
}

const JS_KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'interface',
  'let',
  'new',
  'null',
  'of',
  'return',
  'throw',
  'true',
  'try',
  'type',
  'undefined',
  'var',
  'while',
]);

const CSHARP_KEYWORDS = new Set([
  'async',
  'await',
  'bool',
  'class',
  'const',
  'decimal',
  'double',
  'else',
  'false',
  'get',
  'if',
  'int',
  'interface',
  'namespace',
  'new',
  'null',
  'private',
  'protected',
  'public',
  'readonly',
  'record',
  'return',
  'set',
  'static',
  'string',
  'true',
  'using',
  'var',
  'void',
]);

const JSON_KEYWORDS = new Set(['true', 'false', 'null']);

const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: '',
  keyword: 'font-semibold text-accent',
  string: 'text-positive',
  comment: 'italic text-ink-secondary/70',
  number: 'text-accent/85',
};

function normalizeLanguage(language: string): SyntaxLanguage {
  const normalized = language.toLowerCase().replace(/^language-/, '');

  if (['js', 'jsx', 'javascript'].includes(normalized)) return 'javascript';
  if (['ts', 'tsx', 'typescript'].includes(normalized)) return 'typescript';
  if (['cs', 'csharp', 'c#'].includes(normalized)) return 'csharp';
  if (normalized === 'json') return 'json';

  return 'text';
}

function keywordsFor(language: SyntaxLanguage): Set<string> {
  if (language === 'javascript' || language === 'typescript') return JS_KEYWORDS;
  if (language === 'csharp') return CSHARP_KEYWORDS;
  if (language === 'json') return JSON_KEYWORDS;
  return new Set();
}

function pushToken(tokens: CodeToken[], kind: TokenKind, text: string) {
  if (!text) return;

  const previous = tokens[tokens.length - 1];
  if (previous?.kind === kind) {
    previous.text += text;
    return;
  }

  tokens.push({ kind, text });
}

function readQuotedString(line: string, start: number, quote: string): number {
  let index = start + 1;

  while (index < line.length) {
    if (line[index] === '\\') {
      index += 2;
      continue;
    }

    if (line[index] === quote) {
      return index + 1;
    }

    index += 1;
  }

  return line.length;
}

function tokenizeLine(line: string, language: SyntaxLanguage): CodeToken[] {
  const tokens: CodeToken[] = [];
  const keywords = keywordsFor(language);
  const supportsComments = language === 'javascript' || language === 'typescript' || language === 'csharp';
  let index = 0;

  while (index < line.length) {
    const rest = line.slice(index);

    if (supportsComments && rest.startsWith('//')) {
      pushToken(tokens, 'comment', rest);
      break;
    }

    const char = line[index] ?? '';
    if (char === '"' || char === "'" || (char === '`' && language !== 'json')) {
      const end = readQuotedString(line, index, char);
      pushToken(tokens, 'string', line.slice(index, end));
      index = end;
      continue;
    }

    const numberMatch = rest.match(/^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (numberMatch) {
      pushToken(tokens, 'number', numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const wordMatch = rest.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      pushToken(tokens, keywords.has(word) ? 'keyword' : 'plain', word);
      index += word.length;
      continue;
    }

    pushToken(tokens, 'plain', char);
    index += 1;
  }

  return tokens.length > 0 ? tokens : [{ kind: 'plain', text: '' }];
}

function inferIndentUnit(lines: string[]): number {
  const indents = lines
    .map((line) => line.match(/^ +/)?.[0].length ?? 0)
    .filter((indent) => indent > 0);

  if (indents.some((indent) => indent % 2 === 0 && indent % 4 !== 0)) {
    return 2;
  }

  return 4;
}

function indentGuides(line: string, indentUnit: number): number[] {
  const indent = line.match(/^ +/)?.[0].length ?? 0;
  const guideCount = Math.min(6, Math.floor(indent / indentUnit));

  return Array.from({ length: guideCount }, (_, index) => index + 1);
}

function defaultShowAllLabel(copyLabel: string): string {
  return copyLabel.toLocaleLowerCase('tr-TR') === 'kopyala' ? 'Tümünü göster' : 'Show all';
}

function writeClipboardText(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    return Promise.reject(new Error('Clipboard API unavailable'));
  }

  return Promise.race([
    navigator.clipboard.writeText(text),
    new Promise<void>((_, reject) => {
      window.setTimeout(() => reject(new Error('Clipboard API timeout')), 250);
    }),
  ]);
}

export function CodeBlock({
  children,
  language,
  isPseudoCode = false,
  title,
  filename,
  showLineNumbers = true,
  highlightLines = [],
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  showAllLabel,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const normalizedCode = useMemo(() => children.replace(/\r\n?/g, '\n').trimEnd(), [children]);
  const lines = useMemo(
    () => (normalizedCode.length > 0 ? normalizedCode.split('\n') : ['']),
    [normalizedCode],
  );
  const syntaxLanguage = useMemo(() => normalizeLanguage(language), [language]);
  const indentUnit = useMemo(() => inferIndentUnit(lines), [lines]);
  const highlightedLines = useMemo(() => new Set(highlightLines), [highlightLines]);
  const isCollapsible = lines.length > 20;
  const visibleLines = isCollapsible && !expanded ? lines.slice(0, 15) : lines;
  const hiddenLineCount = lines.length - visibleLines.length;

  const markCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = () => {
    writeClipboardText(children)
      .then(markCopied)
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = children;
        textarea.setAttribute('readonly', '');
        textarea.style.left = '-9999px';
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand('copy');
          markCopied();
        } finally {
          document.body.removeChild(textarea);
        }
      });
  };

  return (
    <figure
      className={cn(
        'my-6 overflow-hidden rounded-card border border-hairline bg-card',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
            {language}
          </span>
          {isPseudoCode && (
            <span
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(155,35,53,0.10)', color: 'var(--color-accent)' }}
            >
              pseudo-code
            </span>
          )}
          {filename && (
            <span className="truncate font-mono text-[11px] text-ink-secondary">
              {filename}
            </span>
          )}
          {title && (
            <span className="truncate font-sans text-xs text-ink-secondary">{title}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWrap((value) => !value)}
            aria-pressed={wrap}
            className={cn(
              'min-h-8 px-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:text-ink',
              wrap && 'text-accent',
            )}
          >
            Wrap
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? copiedLabel : copyLabel}
            className={cn(
              'inline-flex min-h-8 items-center gap-1.5 px-2 font-mono text-[11px] text-ink-secondary hover:text-ink',
              copied && 'text-accent',
            )}
          >
            <span aria-hidden="true" className={cn('text-accent', copied ? 'opacity-100' : 'opacity-0')}>
              ✓
            </span>
            {copied ? copiedLabel : copyLabel}
          </button>
        </div>
      </div>
      {/* overflow-x-auto: block scrolls horizontally; page does not */}
      <div className="overflow-x-auto">
        <pre
          className={cn(
            'min-w-full py-3 font-mono text-[13px] leading-6 text-ink',
            wrap ? 'w-full' : 'w-max',
          )}
        >
          <code
            className={cn(
              'table min-w-full border-collapse',
              wrap ? 'w-full table-fixed' : 'w-max table-auto',
            )}
          >
            {visibleLines.map((line, index) => {
              const lineNumber = index + 1;
              const highlighted = highlightedLines.has(lineNumber);

              return (
                <span
                  key={lineNumber}
                  className={cn(
                    'table-row transition-colors',
                    highlighted
                      ? 'bg-accent/10 hover:bg-accent/15'
                      : lineNumber % 2 === 0
                        ? 'bg-surface-sunk/45 hover:bg-surface-raised'
                        : 'hover:bg-surface-raised/70',
                  )}
                >
                  {showLineNumbers && (
                    <span
                      aria-hidden="true"
                      className="table-cell h-6 w-10 select-none pr-2 text-right align-top tabular-nums text-ink-secondary/55 sm:w-[3.25rem] sm:pr-3"
                    >
                      {lineNumber}
                    </span>
                  )}
                  <span
                    className={cn(
                      'relative table-cell h-6 pr-4 align-top',
                      wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
                    )}
                  >
                    {indentGuides(line, indentUnit).map((guide) => (
                      <span
                        key={guide}
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 top-0 w-px bg-hairline/80"
                        style={{ left: `${guide * indentUnit}ch` }}
                      />
                    ))}
                    <span className="relative">
                      {tokenizeLine(line, syntaxLanguage).map((token, tokenIndex) => (
                        <span
                          key={`${lineNumber}-${tokenIndex}`}
                          className={TOKEN_CLASS[token.kind]}
                        >
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
      {isCollapsible && !expanded && (
        <div className="border-t border-hairline bg-card px-4 py-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={expanded}
            className="min-h-8 font-mono text-[11px] uppercase tracking-wider text-accent hover:text-ink"
          >
            {showAllLabel ?? defaultShowAllLabel(copyLabel)}
            <span className="ml-2 text-ink-secondary">+{hiddenLineCount}</span>
          </button>
        </div>
      )}
    </figure>
  );
}
