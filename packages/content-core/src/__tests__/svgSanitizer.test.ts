import { describe, it, expect } from 'vitest';
import { sanitizeSvg } from '../svg/sanitizer';

describe('sanitizeSvg', () => {
  it('passes through clean SVG unchanged', () => {
    const clean = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>';
    const { sanitized, removals } = sanitizeSvg(clean);
    expect(sanitized).toBe(clean);
    expect(removals).toHaveLength(0);
  });

  it('removes <script> elements', () => {
    const svg = '<svg><script>alert(1)</script><circle r="5"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<circle');
    expect(removals.some(r => r.includes('script'))).toBe(true);
  });

  it('removes self-closing <script/>', () => {
    const svg = '<svg><script src="evil.js"/><rect width="10"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('<script');
    expect(removals.length).toBeGreaterThan(0);
  });

  it('removes onload attribute', () => {
    const svg = '<svg onload="alert(1)"><rect width="10"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('onload');
    expect(removals.some(r => r.includes('onload'))).toBe(true);
  });

  it('removes onclick attribute', () => {
    const svg = '<svg><circle onclick="doEvil()" r="5"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('onclick');
    expect(removals.some(r => r.includes('onclick'))).toBe(true);
  });

  it('removes <foreignObject> element', () => {
    const svg = '<svg><foreignObject><p>HTML inside SVG</p></foreignObject><circle r="5"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('foreignObject');
    expect(sanitized).not.toContain('<p>HTML inside SVG</p>');
    expect(removals.some(r => r.includes('foreignObject'))).toBe(true);
  });

  it('removes external href', () => {
    const svg = '<svg><a href="https://evil.com"><text>click</text></a></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('https://evil.com');
    expect(removals.some(r => r.includes('https://evil.com'))).toBe(true);
  });

  it('removes javascript: href', () => {
    const svg = '<svg><a href="javascript:alert(1)"><text>x</text></a></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('javascript:');
    expect(removals.length).toBeGreaterThan(0);
  });

  it('removes external xlink:href', () => {
    const svg = '<svg><use xlink:href="https://external.com/sprite.svg#icon"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('https://external.com');
    expect(removals.length).toBeGreaterThan(0);
  });

  it('preserves safe data:image href (inline image)', () => {
    const svg = '<svg><image href="data:image/png;base64,abc123"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).toContain('data:image/png;base64,abc123');
    expect(removals).toHaveLength(0);
  });

  it('preserves fragment references (#id)', () => {
    const svg = '<svg><use href="#arrow-icon"/></svg>';
    const { sanitized } = sanitizeSvg(svg);
    expect(sanitized).toContain('#arrow-icon');
  });

  it('removes data:text/html href', () => {
    const svg = '<svg><a href="data:text/html,<script>alert(1)</script>"><text>x</text></a></svg>';
    const { sanitized } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('data:text/html');
  });

  it('removes style with expression()', () => {
    const svg = '<svg><rect style="width:expression(alert(1))"/></svg>';
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('expression(');
    expect(removals.length).toBeGreaterThan(0);
  });

  it('handles multiple removals in one SVG', () => {
    const svg = [
      '<svg onload="bad()" xmlns="http://www.w3.org/2000/svg">',
      '<script>alert(1)</script>',
      '<foreignObject><p>html</p></foreignObject>',
      '<a href="https://evil.com"><text>click</text></a>',
      '<circle r="5"/>',
      '</svg>',
    ].join('');
    const { sanitized, removals } = sanitizeSvg(svg);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('foreignObject');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).not.toContain('https://evil.com');
    expect(sanitized).toContain('<circle r="5"/>');
    expect(removals.length).toBeGreaterThanOrEqual(4);
  });
});
