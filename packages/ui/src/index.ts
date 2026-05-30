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

// Editorial layout primitives — Portal-aligned Swiss-Industrial system (CV / work / series)
export { Masthead } from './components/editorial/Masthead';
export { MonoLabel } from './components/editorial/MonoLabel';
export { MetaRow } from './components/editorial/MetaRow';
export { SectionRail } from './components/editorial/SectionRail';
export { SpecRow } from './components/editorial/SpecRow';
export { Chip } from './components/editorial/Chip';
export { Frame } from './components/editorial/Frame';
export { Rule } from './components/editorial/Rule';
export { cn } from './lib/cn';

export type { LinkPrimitiveProps, ImagePrimitiveProps } from './primitives/index';
