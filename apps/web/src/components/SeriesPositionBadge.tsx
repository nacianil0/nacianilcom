interface SeriesPositionBadgeProps {
  position: number;
  total: number;
  seriesTitle: string;
}

export function SeriesPositionBadge({ position, total, seriesTitle }: SeriesPositionBadgeProps) {
  return (
    <p
      className="font-sans text-xs font-medium uppercase tracking-wider text-accent"
      aria-label={`${seriesTitle} — ${position}. bölüm / ${total}`}
    >
      {seriesTitle} &mdash; {position} / {total}
    </p>
  );
}
