import { MonoLabel } from '@nacianilcom/ui';

interface SeriesPositionBadgeProps {
  position: number;
  total: number;
  seriesTitle: string;
}

export function SeriesPositionBadge({ position, total, seriesTitle }: SeriesPositionBadgeProps) {
  return (
    <span aria-label={`${seriesTitle} — ${position} / ${total}`}>
      <MonoLabel tone="accent">
        {seriesTitle} <span className="text-ink-secondary">· {position}/{total}</span>
      </MonoLabel>
    </span>
  );
}
