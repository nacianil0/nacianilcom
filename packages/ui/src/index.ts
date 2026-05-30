// packages/ui — framework-light design tokens + component core (§3)
// next/link | next/image | next/font must NEVER be imported here.

// Technical-writing components (§16)
export { Callout } from './components/Callout';
export { Definition } from './components/Definition';
export { Example } from './components/Example';
export { Warning } from './components/Warning';
export { Takeaway } from './components/Takeaway';
export { CodeBlock } from './components/CodeBlock';

// Visual-block presentational components (§15 MVP custom)
export { VisualBlock } from './components/VisualBlock';
export { Comparison } from './components/Comparison';
export { LayeredModel } from './components/LayeredModel';
export { Pyramid } from './components/Pyramid';

export type { LinkPrimitiveProps, ImagePrimitiveProps } from './primitives/index';
