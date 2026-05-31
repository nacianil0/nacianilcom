type Variant = 'success' | 'error' | 'info';

interface StatusBannerProps {
  variant: Variant;
  title: string;
  detail?: string | undefined;
  path?: string | undefined;
  onDismiss?: (() => void) | undefined;
}

const STYLES: Record<Variant, { wrapper: string; icon: string }> = {
  success: { wrapper: 'border-positive/30 bg-positive/5 text-positive', icon: '✓' },
  error:   { wrapper: 'border-negative/30 bg-negative/5 text-negative',   icon: '✗' },
  info:    { wrapper: 'border-accent/30 bg-accent/5 text-accent',           icon: 'i' },
};

export function StatusBanner({ variant, title, detail, path, onDismiss }: StatusBannerProps) {
  const s = STYLES[variant];
  return (
    <div className={`rounded border px-3 py-2 ${s.wrapper}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 font-mono text-[11px] font-semibold">{s.icon}</span>
          <div className="min-w-0 space-y-0.5">
            <p className="font-sans text-xs font-medium">{title}</p>
            {detail && <p className="font-sans text-xs opacity-80">{detail}</p>}
            {path && (
              <p className="font-mono text-[10px] opacity-70 truncate">{path}</p>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 font-mono text-[10px] opacity-50 hover:opacity-100"
            aria-label="Kapat"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
