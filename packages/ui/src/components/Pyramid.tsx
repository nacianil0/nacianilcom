import { VisualBlock } from './VisualBlock';

interface PyramidLevel {
  label: string;
  description?: string;
}

interface PyramidProps {
  title: string;
  caption?: string;
  alt: string;
  source?: string;
  levels: PyramidLevel[];
}

export function Pyramid({ title, caption, alt, source, levels }: PyramidProps) {
  const total = levels.length;
  return (
    <VisualBlock
      title={title}
      alt={alt}
      {...(caption !== undefined && { caption })}
      {...(source !== undefined && { source })}
    >
      <div className="flex flex-col items-stretch gap-1.5">
        {levels.map((level, i) => {
          const widthPct = Math.round(40 + ((i + 1) / total) * 60);
          return (
            <div key={i} className="flex justify-center">
              <div
                className="rounded-[8px] border border-hairline/60 bg-surface/80 px-4 py-2.5 text-center"
                style={{ width: `${widthPct}%` }}
              >
                <p className="font-sans text-sm font-medium text-ink">{level.label}</p>
                {level.description !== undefined && (
                  <p className="mt-0.5 font-sans text-xs leading-relaxed text-ink-secondary">
                    {level.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </VisualBlock>
  );
}
