import { VisualBlock } from './VisualBlock';

interface ComparisonColumn {
  label: string;
  items: string[];
  variant?: 'positive' | 'negative' | 'neutral';
}

interface ComparisonProps {
  title: string;
  caption?: string;
  alt: string;
  source?: string;
  left: ComparisonColumn;
  right: ComparisonColumn;
}

const COLUMN_VARIANT_CLASS: Record<string, string> = {
  positive: 'border-positive/30 bg-positive/5',
  negative: 'border-negative/30 bg-negative/5',
  neutral: 'border-hairline bg-surface/60',
};

export function Comparison({ title, caption, alt, source, left, right }: ComparisonProps) {
  return (
    <VisualBlock
      title={title}
      alt={alt}
      {...(caption !== undefined && { caption })}
      {...(source !== undefined && { source })}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[left, right].map((col, i) => {
          const variantClass = COLUMN_VARIANT_CLASS[col.variant ?? 'neutral'] ?? COLUMN_VARIANT_CLASS['neutral'];
          return (
            <div key={i} className={`rounded-[10px] border px-4 py-3 ${variantClass}`}>
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                {col.label}
              </p>
              <ul className="space-y-1.5">
                {col.items.map((item, j) => (
                  <li key={j} className="flex gap-2 font-sans text-sm leading-relaxed text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-secondary/40"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </VisualBlock>
  );
}
