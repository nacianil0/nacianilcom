import { VisualBlock } from './VisualBlock';

interface Layer {
  label: string;
  description?: string;
}

interface LayeredModelProps {
  title: string;
  caption?: string;
  alt: string;
  source?: string;
  layers: Layer[];
}

export function LayeredModel({ title, caption, alt, source, layers }: LayeredModelProps) {
  return (
    <VisualBlock
      title={title}
      alt={alt}
      {...(caption !== undefined && { caption })}
      {...(source !== undefined && { source })}
    >
      <div className="space-y-1.5">
        {layers.map((layer, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-[10px] border border-hairline/60 bg-surface/80 px-4 py-2.5"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent/70"
            />
            <div>
              <p className="font-sans text-sm font-medium text-ink">{layer.label}</p>
              {layer.description !== undefined && (
                <p className="mt-0.5 font-sans text-xs leading-relaxed text-ink-secondary">
                  {layer.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </VisualBlock>
  );
}
