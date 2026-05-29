export interface PrevNext {
  prev: string | null;
  next: string | null;
}

export function derivePrevNext(articleId: string, seriesArticleOrder: string[]): PrevNext {
  const idx = seriesArticleOrder.indexOf(articleId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? (seriesArticleOrder[idx - 1] ?? null) : null,
    next: idx < seriesArticleOrder.length - 1 ? (seriesArticleOrder[idx + 1] ?? null) : null,
  };
}

export function deriveSeriesPosition(articleId: string, seriesArticleOrder: string[]): number {
  return seriesArticleOrder.indexOf(articleId) + 1;
}
