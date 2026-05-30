import { describe, it, expect } from 'vitest';
import { parseVisualBlocks, validateVisualBlocks } from '../visual/validator';

describe('parseVisualBlocks', () => {
  it('returns empty array for content with no VisualBlock', () => {
    const mdx = '# Title\n\nSome text.\n';
    expect(parseVisualBlocks(mdx)).toHaveLength(0);
  });

  it('parses a single VisualBlock with all props', () => {
    const mdx = `
<VisualBlock title="My Title" alt="Alt text" caption="A caption" source="Author 2024">
  content
</VisualBlock>
    `;
    const blocks = parseVisualBlocks(mdx);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.title).toBe('My Title');
    expect(blocks[0]!.alt).toBe('Alt text');
    expect(blocks[0]!.caption).toBe('A caption');
    expect(blocks[0]!.source).toBe('Author 2024');
    expect(blocks[0]!.index).toBe(0);
  });

  it('parses multiple VisualBlocks', () => {
    const mdx = `
<VisualBlock title="A" alt="alt-a">content</VisualBlock>
<VisualBlock title="B" alt="alt-b" caption="cap">content</VisualBlock>
    `;
    const blocks = parseVisualBlocks(mdx);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]!.index).toBe(0);
    expect(blocks[1]!.index).toBe(1);
    expect(blocks[1]!.caption).toBe('cap');
  });

  it('handles missing optional props', () => {
    const mdx = '<VisualBlock title="T" alt="A">content</VisualBlock>';
    const blocks = parseVisualBlocks(mdx);
    expect(blocks[0]!.caption).toBeUndefined();
    expect(blocks[0]!.source).toBeUndefined();
  });
});

describe('validateVisualBlocks — published (blocking)', () => {
  it('is blocking when alt is missing (published)', () => {
    const blocks = [{ index: 0, title: 'T', caption: 'C', source: 'S' }];
    const issues = validateVisualBlocks(blocks, true);
    const altIssue = issues.find(i => i.code === 'VISUAL_BLOCK_MISSING_ALT');
    expect(altIssue).toBeDefined();
    expect(altIssue!.severity).toBe('blocking');
  });

  it('is blocking when title is missing (published)', () => {
    const blocks = [{ index: 0, alt: 'A', caption: 'C', source: 'S' }];
    const issues = validateVisualBlocks(blocks, true);
    const issue = issues.find(i => i.code === 'VISUAL_BLOCK_MISSING_TITLE');
    expect(issue!.severity).toBe('blocking');
  });

  it('is blocking when caption is missing (published)', () => {
    const blocks = [{ index: 0, title: 'T', alt: 'A', source: 'S' }];
    const issues = validateVisualBlocks(blocks, true);
    const issue = issues.find(i => i.code === 'VISUAL_BLOCK_MISSING_CAPTION');
    expect(issue!.severity).toBe('blocking');
  });

  it('is blocking when source is missing (published)', () => {
    const blocks = [{ index: 0, title: 'T', alt: 'A', caption: 'C' }];
    const issues = validateVisualBlocks(blocks, true);
    const issue = issues.find(i => i.code === 'VISUAL_BLOCK_MISSING_SOURCE');
    expect(issue!.severity).toBe('blocking');
  });

  it('returns no issues when all props present (published)', () => {
    const blocks = [{ index: 0, title: 'T', alt: 'A', caption: 'C', source: 'S' }];
    const issues = validateVisualBlocks(blocks, true);
    expect(issues).toHaveLength(0);
  });
});

describe('validateVisualBlocks — draft (warnings)', () => {
  it('is warning when alt is missing (draft)', () => {
    const blocks = [{ index: 0, title: 'T', caption: 'C', source: 'S' }];
    const issues = validateVisualBlocks(blocks, false);
    const altIssue = issues.find(i => i.code === 'VISUAL_BLOCK_MISSING_ALT');
    expect(altIssue!.severity).toBe('warning');
  });
});

describe('validateVisualBlocks — count limit', () => {
  it('warns when more than 4 blocks', () => {
    const blocks = [0, 1, 2, 3, 4].map(i => ({ index: i, title: 'T', alt: 'A', caption: 'C', source: 'S' }));
    const issues = validateVisualBlocks(blocks, false);
    const countIssue = issues.find(i => i.code === 'VISUAL_BLOCK_COUNT');
    expect(countIssue).toBeDefined();
    expect(countIssue!.severity).toBe('warning');
  });

  it('no count warning for exactly 4 blocks', () => {
    const blocks = [0, 1, 2, 3].map(i => ({ index: i, title: 'T', alt: 'A', caption: 'C', source: 'S' }));
    const issues = validateVisualBlocks(blocks, false);
    expect(issues.find(i => i.code === 'VISUAL_BLOCK_COUNT')).toBeUndefined();
  });
});
