import { useState, useEffect, useMemo, useCallback } from 'react';
import { runArticleQc } from '../lib/articleQc';
import {
  buildSchedule,
  formatScheduleMode,
  resolvePublishStatus,
  sortArticleIds,
  type ScheduleMode,
} from '../lib/publishScheduler';
import { StudioSpinner, StatusBanner, EmptyState } from '../ui';

interface ArticleRef {
  id: string;
  meta: Record<string, unknown>;
}

interface SeriesItem {
  slug: string;
  series: { title: { tr: string }; articleOrder?: string[] };
  articles: ArticleRef[];
}

type PublisherTab = 'single' | 'plan';

interface PlanRow {
  articleId: string;
  publishDate: string;
  status: 'published' | 'scheduled';
  selected: boolean;
  blockingCount: number | null;
  currentStatus: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function shortId(id: string): string {
  const parts = id.split('-');
  return parts.length > 1 ? `${parts[0]}-…` : id.slice(0, 12);
}

function seriesTitle(item: SeriesItem): string {
  const title = item.series?.title;
  if (title && typeof title === 'object' && 'tr' in title) {
    return String((title as { tr: string }).tr);
  }
  return item.slug;
}

function countUnpublished(item: SeriesItem): number {
  return item.articles.filter(a => a.meta['status'] !== 'published').length;
}

async function loadContentList(): Promise<SeriesItem[]> {
  const res = await fetch('/api/content/list');
  if (!res.ok) throw new Error(`Liste alınamadı (${res.status})`);
  return res.json() as Promise<SeriesItem[]>;
}

export function Publisher() {
  const [list, setList] = useState<SeriesItem[]>([]);
  const [tab, setTab] = useState<PublisherTab>('plan');

  // Single publish
  const [selected, setSelected] = useState<{ seriesSlug: string; articleId: string } | null>(null);
  const [blockingCount, setBlockingCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishDate, setPublishDate] = useState(todayIso());

  // Batch plan
  const [planSeriesSlug, setPlanSeriesSlug] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('daily');
  const [planRows, setPlanRows] = useState<PlanRow[]>([]);
  const [planChecking, setPlanChecking] = useState(false);
  const [planApplying, setPlanApplying] = useState(false);
  const [selectedInPlan, setSelectedInPlan] = useState<Set<string>>(new Set());

  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [banner, setBanner] = useState<{
    variant: 'success' | 'error' | 'info';
    title: string;
    detail?: string;
    path?: string;
  } | null>(null);

  const reloadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await loadContentList();
      setList(data);
    } catch (e) {
      setList([]);
      setListError(e instanceof Error ? e.message : 'İçerik listesi yüklenemedi');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadList();
  }, [reloadList]);

  const planSeriesOptions = useMemo(
    () => list.filter(s => s.articles.length > 0),
    [list],
  );

  useEffect(() => {
    if (planSeriesOptions.length === 0) return;
    const currentValid = planSeriesOptions.some(s => s.slug === planSeriesSlug);
    if (currentValid) return;
    const preferred = planSeriesOptions.find(s => countUnpublished(s) > 0) ?? planSeriesOptions[0];
    if (preferred) setPlanSeriesSlug(preferred.slug);
  }, [planSeriesOptions, planSeriesSlug]);

  const planSeries = useMemo(
    () => list.find(s => s.slug === planSeriesSlug) ?? null,
    [list, planSeriesSlug],
  );

  const unpublishedArticles = useMemo(() => {
    if (!planSeries) return [];
    const ids = planSeries.articles
      .filter(a => a.meta['status'] !== 'published')
      .map(a => a.id);
    return sortArticleIds(ids, planSeries.series.articleOrder);
  }, [planSeries]);

  const refreshPlanPreview = useCallback(() => {
    if (!planSeries || unpublishedArticles.length === 0) {
      setPlanRows([]);
      return;
    }

    const selectedIds = sortArticleIds(
      unpublishedArticles.filter(id => selectedInPlan.has(id)),
      planSeries.series.articleOrder,
    );
    const schedule = buildSchedule(selectedIds, startDate, scheduleMode);
    const scheduleById = new Map(schedule.map(s => [s.articleId, s]));

    setPlanRows(prev => {
      const prevQc = new Map(prev.map(r => [r.articleId, r.blockingCount]));
      return unpublishedArticles.map(articleId => {
        const meta = planSeries.articles.find(a => a.id === articleId)?.meta;
        const entry = scheduleById.get(articleId);
        const selected = selectedInPlan.has(articleId);
        return {
          articleId,
          publishDate: entry?.publishDate ?? '—',
          status: entry?.status ?? 'scheduled',
          selected,
          blockingCount: prevQc.get(articleId) ?? null,
          currentStatus: String(meta?.['status'] ?? 'draft'),
        };
      });
    });
  }, [planSeries, unpublishedArticles, selectedInPlan, startDate, scheduleMode]);

  useEffect(() => {
    refreshPlanPreview();
  }, [refreshPlanPreview]);

  useEffect(() => {
    if (!planSeries) return;
    setSelectedInPlan(new Set(unpublishedArticles));
  }, [planSeriesSlug, planSeries, unpublishedArticles]);

  async function checkAndSelect(seriesSlug: string, articleId: string) {
    setTab('single');
    setSelected({ seriesSlug, articleId });
    setBlockingCount(null);
    setBanner(null);
    setChecking(true);

    try {
      const qc = await runArticleQc(seriesSlug, articleId);
      setBlockingCount(qc.blockingCount);
    } catch {
      setBlockingCount(99);
    } finally {
      setChecking(false);
    }
  }

  async function runPlanQc() {
    if (planRows.length === 0) return;
    setPlanChecking(true);
    setBanner(null);
    try {
      const updated = await Promise.all(
        planRows.map(async row => {
          try {
            const qc = await runArticleQc(planSeriesSlug, row.articleId);
            return { ...row, blockingCount: qc.blockingCount };
          } catch {
            return { ...row, blockingCount: 99 };
          }
        }),
      );
      setPlanRows(updated);
      const blockers = updated.filter(r => (r.blockingCount ?? 0) > 0).length;
      setBanner({
        variant: blockers > 0 ? 'info' : 'success',
        title: blockers > 0
          ? `${blockers} makalede QC blocker var`
          : 'Tüm seçili makaleler QC geçti',
        ...(blockers > 0
          ? { detail: 'Plan yine de kaydedilebilir; yayın tarihinden önce SEO/QC Check ile düzelt.' }
          : {}),
      });
    } finally {
      setPlanChecking(false);
    }
  }

  async function publishSingle() {
    if (!selected) return;
    setPublishing(true);
    setBanner(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesSlug: selected.seriesSlug,
          articleId: selected.articleId,
          publishDate,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        status?: string;
        publishDate?: string;
      };
      if (!res.ok) throw new Error(data.error ?? 'Publish failed');

      const statusLabel = data.status === 'scheduled' ? 'Zamanlandı' : 'Yayınlandı';
      setBanner({
        variant: 'success',
        title: `${statusLabel} — ${data.publishDate}`,
        detail: 'meta.json güncellendi + git commit',
        path: `content/series/${selected.seriesSlug}/articles/${selected.articleId}/meta.json`,
      });
      const listRes = await loadContentList();
      setList(listRes);
    } catch (e) {
      setBanner({ variant: 'error', title: 'Yayın hatası', detail: String(e) });
    } finally {
      setPublishing(false);
    }
  }

  async function applyPlan() {
    const toApply = planRows.filter(r => r.selected);
    if (!planSeriesSlug || toApply.length === 0) return;
    setPlanApplying(true);
    setBanner(null);
    try {
      const res = await fetch('/api/publish/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesSlug: planSeriesSlug,
          articleIds: toApply.map(r => r.articleId),
          startDate,
          mode: scheduleMode,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        scheduled?: Array<{ articleId: string; publishDate: string; status: string }>;
        commitSha?: string;
      };
      if (!res.ok) throw new Error(data.error ?? 'Schedule failed');

      const published = data.scheduled?.filter(s => s.status === 'published').length ?? 0;
      const scheduled = data.scheduled?.filter(s => s.status === 'scheduled').length ?? 0;
      setBanner({
        variant: 'success',
        title: `Yayın planı uygulandı — ${toApply.length} makale`,
        detail: `${published} hemen yayında, ${scheduled} zamanlandı.${data.commitSha ? ` Commit: ${data.commitSha.slice(0, 7)}` : ''}`,
        path: `content/series/${planSeriesSlug}/`,
      });
      const listRes = await loadContentList();
      setList(listRes);
    } catch (e) {
      setBanner({ variant: 'error', title: 'Plan uygulanamadı', detail: String(e) });
    } finally {
      setPlanApplying(false);
    }
  }

  function togglePlanArticle(articleId: string) {
    setSelectedInPlan(prev => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  }

  const singleStatus = resolvePublishStatus(publishDate);
  const canPublishSingle = blockingCount === 0 && !checking && !publishing;
  const selectedSeries = useMemo(
    () => (selected ? list.find(s => s.slug === selected.seriesSlug) : null),
    [list, selected],
  );

  const planBlockerCount = planRows.filter(r => r.selected && (r.blockingCount ?? 0) > 0).length;
  const selectedPlanCount = planRows.filter(r => r.selected).length;
  const planHasQc = planRows.some(r => r.blockingCount !== null);

  return (
    <div className="flex gap-6 h-full min-h-0">
      <aside className="w-72 flex-shrink-0 flex flex-col min-h-0">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">
          Taslaklar
        </h2>
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {list.map(({ slug, series, articles }) => {
            const drafts = articles.filter(a => a.meta['status'] !== 'published');
            if (drafts.length === 0) return null;
            return (
              <div key={slug}>
                <button
                  type="button"
                  onClick={() => {
                    setPlanSeriesSlug(slug);
                    setTab('plan');
                  }}
                  className={`mb-1 w-full text-left font-sans text-xs font-semibold transition-colors ${
                    tab === 'plan' && planSeriesSlug === slug
                      ? 'text-accent'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {series.title.tr}
                  <span className="ml-1 font-normal text-ink-secondary/50">({drafts.length})</span>
                </button>
                <ul className="space-y-0.5">
                  {drafts.map(({ id, meta }) => {
                    const status = meta['status'] as string;
                    const pubDate = meta['publishDate'] as string | undefined;
                    const isActive = selected?.seriesSlug === slug && selected?.articleId === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => void checkAndSelect(slug, id)}
                          className={`flex w-full flex-col rounded px-2 py-1.5 text-left font-sans text-xs transition-colors ${
                            isActive && tab === 'single'
                              ? 'bg-accent/10 text-accent'
                              : 'text-ink-secondary hover:bg-hairline/40 hover:text-ink'
                          }`}
                        >
                          <span className="truncate font-mono text-[10px]">{shortId(id)}</span>
                          <span className="flex items-center gap-1.5 mt-0.5">
                            <span className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                              status === 'scheduled'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-hairline text-ink-secondary/70'
                            }`}>
                              {status}
                            </span>
                            {pubDate && (
                              <span className="font-mono text-[9px] text-ink-secondary/50">{pubDate}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-auto flex flex-col gap-4">
        <div className="flex gap-2 flex-shrink-0">
          {([
            ['plan', 'Yayın planı'],
            ['single', 'Tek makale'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-card px-4 py-2 font-sans text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-accent text-card'
                  : 'border border-hairline text-ink-secondary hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {banner && (
          <StatusBanner
            variant={banner.variant}
            title={banner.title}
            detail={banner.detail}
            path={banner.path}
            onDismiss={() => setBanner(null)}
          />
        )}

        {tab === 'plan' && (
          <div className="rounded-card border border-hairline bg-card p-6 space-y-6 max-w-3xl">
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink">Yayın planı</h3>
              <p className="mt-1 font-sans text-sm text-ink-secondary">
                Başlangıç tarihini seç; makaleler seri sırasına göre otomatik tarihlensin.
                Gelecek tarihler <strong className="font-medium text-ink">scheduled</strong>, bugün ve geçmiş <strong className="font-medium text-ink">published</strong> olur.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60 mb-1">
                  Seri
                </label>
                <select
                  value={planSeriesSlug}
                  onChange={e => setPlanSeriesSlug(e.target.value)}
                  disabled={listLoading || planSeriesOptions.length === 0}
                  className="w-full rounded border border-hairline bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-60"
                >
                  {listLoading && <option value="">Yükleniyor…</option>}
                  {!listLoading && planSeriesOptions.length === 0 && (
                    <option value="">Seri bulunamadı</option>
                  )}
                  {planSeriesOptions.map(s => {
                    const drafts = countUnpublished(s);
                    return (
                      <option key={s.slug} value={s.slug}>
                        {seriesTitle(s)}
                        {drafts > 0 ? ` (${drafts} taslak)` : ' (hepsi yayında)'}
                      </option>
                    );
                  })}
                </select>
                {listError && (
                  <p className="mt-1.5 font-sans text-xs text-negative">
                    {listError} — Studio sunucusu çalışıyor mu?
                    {' '}
                    <button type="button" onClick={() => void reloadList()} className="underline">
                      Yeniden dene
                    </button>
                  </p>
                )}
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60 mb-1">
                  Başlangıç tarihi
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full rounded border border-hairline bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60">
                Sıklık
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  ['same-day', 'Hepsi aynı gün'],
                  ['daily', 'Günlük'],
                  ['weekly', 'Haftalık'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setScheduleMode(mode)}
                    className={`rounded-full px-3 py-1.5 font-sans text-xs transition-colors ${
                      scheduleMode === mode
                        ? 'bg-accent text-card'
                        : 'border border-hairline text-ink-secondary hover:border-accent/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 font-sans text-xs text-ink-secondary/70">
                {formatScheduleMode(scheduleMode)}
                {planSeries?.series.articleOrder?.length
                  ? ' · Seri sırası: series.json articleOrder'
                  : ' · Alfabetik sıra'}
              </p>
            </div>

            {listLoading ? (
              <div className="flex items-center gap-2 text-ink-secondary py-4">
                <StudioSpinner />
                <span className="font-sans text-sm">Seriler yükleniyor…</span>
              </div>
            ) : planRows.length === 0 ? (
              <EmptyState
                title={
                  planSeriesOptions.length === 0
                    ? 'Yüklenecek seri yok'
                    : unpublishedArticles.length === 0
                      ? 'Bu seride yayınlanacak taslak yok'
                      : 'Plan önizlemesi hazırlanıyor'
                }
                steps={
                  planSeriesOptions.length === 0
                    ? [
                        { label: 'pnpm --filter @nacianilcom/studio dev çalıştır' },
                        { label: 'content/series/ altında seri + meta.json olduğundan emin ol' },
                      ]
                    : [{ label: 'Tüm makaleler zaten published olabilir — başka seri seç' }]
                }
              />
            ) : (
              <>
                <div className="rounded border border-hairline overflow-hidden">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-surface font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">
                      <tr>
                        <th className="px-3 py-2 w-8">#</th>
                        <th className="px-3 py-2">Makale</th>
                        <th className="px-3 py-2">Tarih</th>
                        <th className="px-3 py-2">Durum</th>
                        <th className="px-3 py-2">QC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {planRows.map((row, i) => (
                        <tr key={row.articleId} className={`hover:bg-surface/50 ${!row.selected ? 'opacity-50' : ''}`}>
                          <td className="px-3 py-2 text-ink-secondary/50">{i + 1}</td>
                          <td className="px-3 py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedInPlan.has(row.articleId)}
                                onChange={() => togglePlanArticle(row.articleId)}
                                className="rounded border-hairline"
                              />
                              <span className="font-mono text-[10px] text-ink truncate max-w-[200px]" title={row.articleId}>
                                {shortId(row.articleId)}
                              </span>
                            </label>
                          </td>
                          <td className="px-3 py-2 font-mono text-ink">
                            {row.selected ? row.publishDate : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {!row.selected ? (
                              <span className="text-ink-secondary/40">atlandı</span>
                            ) : (
                              <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase ${
                                row.status === 'published'
                                  ? 'bg-positive/10 text-positive'
                                  : 'bg-accent/10 text-accent'
                              }`}>
                                {row.status === 'published' ? 'hemen yayın' : 'zamanlandı'}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {row.blockingCount === null && (
                              <span className="text-ink-secondary/40">—</span>
                            )}
                            {row.blockingCount === 0 && (
                              <span className="text-positive">✓</span>
                            )}
                            {row.blockingCount !== null && row.blockingCount > 0 && (
                              <span className="text-negative">{row.blockingCount} blocker</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void runPlanQc()}
                    disabled={planChecking || planApplying}
                    className="rounded-card border border-hairline px-4 py-2 font-sans text-sm text-ink-secondary hover:border-accent/40 hover:text-ink disabled:opacity-50"
                  >
                    {planChecking ? 'QC çalışıyor…' : 'QC kontrol et'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyPlan()}
                    disabled={planApplying || planChecking || selectedPlanCount === 0}
                    className="flex items-center gap-2 rounded-card bg-accent px-5 py-2 font-sans text-sm font-medium text-card hover:opacity-90 disabled:opacity-50"
                  >
                    {planApplying && <StudioSpinner />}
                    {planApplying ? 'Uygulanıyor…' : 'Planı uygula → Git commit'}
                  </button>
                </div>

                {planHasQc && planBlockerCount > 0 && (
                  <p className="font-sans text-xs text-ink-secondary">
                    {planBlockerCount} makalede blocker var — plan kaydedilir ama yayın öncesi SEO/QC Check ile düzeltmen önerilir.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'single' && !selected && (
          <EmptyState
            title="Tek makale yayını"
            steps={[
              { label: 'Soldan bir taslak seç' },
              { label: 'QC otomatik çalışır' },
              { label: 'Tarih seç — bugün = yayın, gelecek = zamanlama' },
              { label: 'Veya "Yayın planı" sekmesiyle seriyi toplu planla' },
            ]}
          />
        )}

        {tab === 'single' && selected && (
          <div className="max-w-lg rounded-card border border-hairline bg-card p-6 space-y-5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink">
                {selectedSeries?.series.title.tr ?? selected.seriesSlug}
              </h3>
              <p className="mt-1 font-mono text-[10px] text-ink-secondary/60 break-all">
                {selected.articleId}
              </p>
            </div>

            <div className="rounded bg-surface px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60 mb-1">
                QC
              </p>
              {checking && (
                <div className="flex items-center gap-2">
                  <StudioSpinner />
                  <span className="font-sans text-sm text-ink-secondary">Kontroller…</span>
                </div>
              )}
              {!checking && blockingCount !== null && (
                <p className={`font-sans text-sm font-medium ${blockingCount === 0 ? 'text-positive' : 'text-negative'}`}>
                  {blockingCount === 0
                    ? '✓ QC geçti — yayınlayabilirsin'
                    : `✗ ${blockingCount} blocker — SEO/QC Check ile düzelt`}
                </p>
              )}
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-ink-secondary/60 mb-1">
                Yayın tarihi
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={e => setPublishDate(e.target.value)}
                className="w-full rounded border border-hairline bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none"
              />
              <p className="mt-1.5 font-sans text-xs text-ink-secondary/70">
                {singleStatus === 'published'
                  ? 'Bugün veya geçmiş → hemen published olur + site revalidate'
                  : 'Gelecek tarih → scheduled (cron ile otomatik görünür)'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void publishSingle()}
              disabled={!canPublishSingle}
              className={`w-full flex items-center justify-center gap-2 rounded-card px-5 py-2.5 font-sans text-sm font-medium transition-opacity ${
                canPublishSingle
                  ? 'bg-accent text-card hover:opacity-90'
                  : 'bg-hairline text-ink-secondary cursor-not-allowed opacity-60'
              }`}
            >
              {publishing && <StudioSpinner />}
              {publishing
                ? 'Kaydediliyor…'
                : singleStatus === 'published'
                  ? 'Yayınla → Commit → Revalidate'
                  : 'Zamanla → Commit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
