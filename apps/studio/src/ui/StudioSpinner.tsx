export function StudioSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md'
    ? 'h-5 w-5 border-2'
    : 'h-3.5 w-3.5 border-[1.5px]';
  return (
    <span
      className={`inline-block rounded-full border-current border-r-transparent animate-spin ${cls}`}
      aria-hidden="true"
    />
  );
}
