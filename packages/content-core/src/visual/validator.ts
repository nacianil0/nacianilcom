export interface VisualBlockRef {
  index: number;
  title?: string | undefined;
  caption?: string | undefined;
  alt?: string | undefined;
  source?: string | undefined;
}

export interface VisualBlockIssue {
  code: string;
  message: string;
  severity: 'blocking' | 'warning';
}

/**
 * Extracts <VisualBlock ...> usages from raw MDX content.
 */
export function parseVisualBlocks(mdxContent: string): VisualBlockRef[] {
  const blocks: VisualBlockRef[] = [];
  // Match opening VisualBlock tags (handles both self-closing and paired)
  const re = /<VisualBlock\b([^>]*?)(?:\/>|>)/g;
  let m: RegExpExecArray | null;
  let index = 0;

  const getAttr = (attrs: string, name: string): string | undefined => {
    // Matches: name="value" or name='value'
    const r = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`);
    const match = r.exec(attrs);
    if (!match) return undefined;
    return match[1] ?? match[2];
  };

  while ((m = re.exec(mdxContent)) !== null) {
    const attrs = m[1] ?? '';
    blocks.push({
      index: index++,
      title: getAttr(attrs, 'title'),
      caption: getAttr(attrs, 'caption'),
      alt: getAttr(attrs, 'alt'),
      source: getAttr(attrs, 'source'),
    });
  }

  return blocks;
}

/**
 * Validates visual blocks per §15.
 * - ≤4 blocks per article → warning
 * - title/alt required: published → blocking, draft → warning
 * - caption/source required: published → blocking, draft → warning
 */
export function validateVisualBlocks(blocks: VisualBlockRef[], isPublished: boolean): VisualBlockIssue[] {
  const issues: VisualBlockIssue[] = [];
  const severity: 'blocking' | 'warning' = isPublished ? 'blocking' : 'warning';

  if (blocks.length > 4) {
    issues.push({
      code: 'VISUAL_BLOCK_COUNT',
      message: `${blocks.length} visual blocks exceed the ≤4 per article limit`,
      severity: 'warning',
    });
  }

  for (const block of blocks) {
    const n = block.index + 1;

    if (!block.title) {
      issues.push({
        code: 'VISUAL_BLOCK_MISSING_TITLE',
        message: `Visual block #${n}: missing required "title" prop`,
        severity,
      });
    }
    if (!block.alt) {
      issues.push({
        code: 'VISUAL_BLOCK_MISSING_ALT',
        message: `Visual block #${n}: missing required "alt" prop`,
        severity,
      });
    }
    if (!block.caption) {
      issues.push({
        code: 'VISUAL_BLOCK_MISSING_CAPTION',
        message: `Visual block #${n}: missing "caption" prop`,
        severity,
      });
    }
    if (!block.source) {
      issues.push({
        code: 'VISUAL_BLOCK_MISSING_SOURCE',
        message: `Visual block #${n}: missing "source" prop`,
        severity,
      });
    }
  }

  return issues;
}
