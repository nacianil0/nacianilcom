import type { ReactElement, ReactNode } from 'react';
import {
  Callout,
  Definition,
  Example,
  Warning,
  Takeaway,
  CodeBlock,
  VisualBlock,
  Comparison,
  LayeredModel,
  Pyramid,
} from '@nacianilcom/ui';
import { InternalLinkWeb } from '../ui/InternalLinkWeb';
import type { Locale, ContentCatalog, InternalLinkKind } from '@nacianilcom/content-core';

interface PreProps {
  children?: ReactElement<{ className?: string; children?: string }>;
  copyLabel?: string;
  copiedLabel?: string;
}

function MdxPre({ children, copyLabel, copiedLabel }: PreProps) {
  const codeEl = children;
  const className = codeEl?.props?.className ?? '';
  const langMatch = /language-(\w+)/.exec(className);
  const language = langMatch?.[1] ?? 'text';
  const code =
    typeof codeEl?.props?.children === 'string'
      ? codeEl.props.children.trimEnd()
      : '';
  return (
    <CodeBlock
      language={language}
      {...(copyLabel !== undefined && { copyLabel })}
      {...(copiedLabel !== undefined && { copiedLabel })}
    >
      {code}
    </CodeBlock>
  );
}

function MdxInlineCode({ children }: { children?: ReactNode }) {
  return (
    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-ink">
      {children}
    </code>
  );
}

export function getMdxComponents(lang: Locale, catalog: ContentCatalog) {
  const codeCopyProps =
    lang === 'tr'
      ? { copyLabel: 'Kopyala', copiedLabel: 'Kopyalandı' }
      : { copyLabel: 'Copy', copiedLabel: 'Copied' };

  return {
    // Markdown overrides
    pre: (props: PreProps) => <MdxPre {...props} {...codeCopyProps} />,
    code: MdxInlineCode,

    // Technical-writing components (§16)
    Callout,
    Definition,
    Example,
    Warning,
    Takeaway,
    CodeBlock: (props: Parameters<typeof CodeBlock>[0]) => (
      <CodeBlock {...codeCopyProps} {...props} />
    ),

    // Visual-block components (§15 MVP custom)
    VisualBlock,
    Comparison,
    LayeredModel,
    Pyramid,

    // Internal link (§17) — lang + catalog injected via closure
    InternalLink: ({
      kind,
      id,
      label,
    }: {
      kind: InternalLinkKind;
      id: string;
      label?: string;
    }) => (
      <InternalLinkWeb
        kind={kind}
        id={id}
        lang={lang}
        catalog={catalog}
        {...(label !== undefined && { label })}
      />
    ),
  };
}
