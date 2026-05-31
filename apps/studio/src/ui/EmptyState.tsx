interface Step { label: string }

interface EmptyStateProps {
  title: string;
  steps?: Step[];
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
}

export function EmptyState({ title, steps, hint, actionLabel, onAction, actionLoading }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center px-4">
      <p className="font-sans text-sm font-medium text-ink-secondary">{title}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionLoading}
          className="inline-flex items-center justify-center gap-2 rounded bg-accent px-5 py-2.5 font-sans text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-40"
        >
          {actionLoading && <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {actionLoading ? 'Çalışıyor…' : actionLabel}
        </button>
      )}
      {steps && steps.length > 0 && (
        <ol className="space-y-1 text-left max-w-md">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 font-mono text-[10px] text-ink-secondary/40 w-4 text-right">
                {i + 1}.
              </span>
              <span className="font-sans text-xs text-ink-secondary/70">{s.label}</span>
            </li>
          ))}
        </ol>
      )}
      {hint && (
        <p className="font-mono text-[10px] text-ink-secondary/40">{hint}</p>
      )}
    </div>
  );
}
