import { StudioSpinner } from './StudioSpinner';

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded bg-surface/80 backdrop-blur-[1px]">
      <StudioSpinner size="md" />
      {message && (
        <p className="font-sans text-sm text-ink-secondary">{message}</p>
      )}
    </div>
  );
}
