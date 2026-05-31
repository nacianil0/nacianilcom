import { useState, useEffect } from 'react';
import { StudioSpinner, StatusBanner, EmptyState } from '../ui';

interface DiagramList { mmd: string[]; svg: string[] }
interface RenderResult { svg: string; sanitized: string; removals: string[] }
type Step = 'edit' | 'preview' | 'commit';

export function VisualStudio() {
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [diagrams, setDiagrams] = useState<DiagramList>({ mmd: [], svg: [] });
  const [mmdContent, setMmdContent] = useState('');
  const [filename, setFilename] = useState('diagram-01');
  const [step, setStep] = useState<Step>('edit');
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ variant: 'success' | 'error'; title: string; detail?: string | undefined; path?: string | undefined } | null>(null);
  const [commitDone, setCommitDone] = useState(false);

  useEffect(() => {
    fetch('/api/content/list')
      .then(r => r.json())
      .then((list: Array<{ slug: string }>) => setSeriesList(list.map(s => s.slug)))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedSeries) return;
    fetch(`/api/visual/list/${selectedSeries}`)
      .then(r => r.json())
      .then((d: DiagramList) => setDiagrams(d))
      .catch(() => null);
  }, [selectedSeries]);

  async function loadMmdFile(name: string) {
    const res = await fetch(`/api/visual/file/${selectedSeries}/${name}`);
    if (res.ok) {
      const data = (await res.json()) as { content: string };
      setMmdContent(data.content);
      setFilename(name.replace(/\.mmd$/, ''));
      setStep('edit');
      setRenderResult(null);
      setBanner(null);
    }
  }

  async function handleRender() {
    if (!mmdContent.trim()) return;
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch('/api/visual/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mmdContent, seriesSlug: selectedSeries, filename }),
      });
      const data = (await res.json()) as RenderResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Render failed');
      setRenderResult(data);
      setStep('preview');
    } catch (e) {
      setBanner({ variant: 'error', title: 'Render hatası', detail: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    if (!renderResult || !selectedSeries) return;
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch('/api/visual/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesSlug: selectedSeries, filename: `${filename}.svg`, svgContent: renderResult.sanitized, mmdContent }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Commit failed');
      setCommitDone(true);
      setStep('commit');
      const svgPath = `content/series/${selectedSeries}/diagrams/${filename}.svg`;
      setBanner({ variant: 'success', title: `${filename}.svg kaydedildi`, path: svgPath });
      const listRes = await fetch(`/api/visual/list/${selectedSeries}`);
      if (listRes.ok) setDiagrams((await listRes.json()) as DiagramList);
    } catch (e) {
      setBanner({ variant: 'error', title: 'Commit hatası', detail: String(e) });
    } finally {
      setLoading(false);
    }
  }

  const defaultMmd = `flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`;

  return (
    <div className="flex h-full gap-4">
      {/* Left panel */}
      <div className="w-52 flex-shrink-0 space-y-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">Series</label>
          <select
            value={selectedSeries}
            onChange={e => { setSelectedSeries(e.target.value); setStep('edit'); setRenderResult(null); setBanner(null); }}
            className="w-full rounded border border-hairline bg-surface px-2 py-1.5 font-sans text-sm text-ink"
          >
            <option value="">— seri seç —</option>
            {seriesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {diagrams.mmd.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">.mmd files</p>
            <ul className="space-y-0.5">
              {diagrams.mmd.map(f => (
                <li key={f}>
                  <button onClick={() => loadMmdFile(f)} className="w-full truncate rounded px-2 py-1 text-left font-mono text-xs text-ink-secondary hover:bg-hairline/50 hover:text-ink">
                    {f}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {diagrams.svg.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">.svg files</p>
            <ul className="space-y-0.5">
              {diagrams.svg.map(f => (
                <li key={f} className="font-mono text-xs text-positive px-2">{f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded border border-hairline bg-card p-3">
          <p className="font-mono text-[9px] uppercase tracking-wider text-ink-secondary/50 mb-2">§15 MVP scope</p>
          <ul className="space-y-0.5 font-sans text-[11px] text-ink-secondary">
            <li className="text-accent">Mermaid types:</li>
            <li>• flowchart (Flow)</li>
            <li>• stateDiagram (Cycle)</li>
            <li>• timeline</li>
            <li>• graph (ConceptMap)</li>
          </ul>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          {(['edit', 'preview', 'commit'] as Step[]).map((s, i) => (
            <span key={s} className={`${step === s ? 'text-accent font-semibold' : 'text-ink-secondary/40'}`}>
              {i + 1}. {s}
            </span>
          ))}
        </div>

        {/* Banner */}
        {banner && (
          <StatusBanner
            variant={banner.variant}
            title={banner.title}
            detail={banner.detail}
            path={banner.path}
            onDismiss={() => setBanner(null)}
          />
        )}

        {/* Edit */}
        {step === 'edit' && (
          <div className="flex flex-1 flex-col gap-3">
            {!selectedSeries && (
              <EmptyState
                title="Önce seri seç"
                steps={[
                  { label: 'Soldan seri seç' },
                  { label: 'Mermaid syntax ile diyagram yaz' },
                  { label: 'Render → Preview → Commit' },
                ]}
                hint="SVG sanitized olarak content/series/.../diagrams/ klasörüne kaydedilir"
              />
            )}
            {selectedSeries && (
              <>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">Filename (without .svg)</label>
                    <input
                      type="text"
                      value={filename}
                      onChange={e => setFilename(e.target.value)}
                      placeholder="diagram-01"
                      className="rounded border border-hairline bg-surface px-2 py-1 font-mono text-sm text-ink w-48"
                    />
                  </div>
                  <button
                    onClick={handleRender}
                    disabled={loading || !mmdContent.trim()}
                    className="mt-5 flex items-center gap-1.5 rounded bg-accent px-4 py-1.5 font-sans text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-40"
                  >
                    {loading && <StudioSpinner />}
                    {loading ? 'Render ediliyor…' : 'Render →'}
                  </button>
                </div>
                <textarea
                  value={mmdContent || defaultMmd}
                  onChange={e => setMmdContent(e.target.value)}
                  placeholder={defaultMmd}
                  rows={20}
                  className="flex-1 rounded border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink resize-none"
                />
              </>
            )}
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && renderResult && (
          <div className="flex flex-1 flex-col gap-4">
            {renderResult.removals.length > 0 && (
              <div className="rounded border border-accent/30 bg-accent/5 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent mb-1">
                  SVG Sanitize — {renderResult.removals.length} removal(s)
                </p>
                <ul className="space-y-0.5">
                  {renderResult.removals.map((r, i) => (
                    <li key={i} className="font-mono text-xs text-ink-secondary">• {r}</li>
                  ))}
                </ul>
              </div>
            )}
            {renderResult.removals.length === 0 && (
              <div className="rounded border border-positive/30 bg-positive/5 px-3 py-2 font-mono text-xs text-positive">
                SVG temiz — tehlikeli içerik kaldırılmadı.
              </div>
            )}
            <div className="flex-1 overflow-auto rounded border border-hairline bg-card p-4">
              <div className="max-w-full" dangerouslySetInnerHTML={{ __html: renderResult.sanitized }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('edit'); setRenderResult(null); }} className="rounded border border-hairline px-4 py-1.5 font-sans text-sm text-ink-secondary hover:text-ink">
                ← Edit
              </button>
              <button
                onClick={handleCommit}
                disabled={loading || !selectedSeries}
                className="flex items-center gap-1.5 rounded bg-positive px-4 py-1.5 font-sans text-sm font-medium text-white hover:bg-positive/90 disabled:opacity-40"
              >
                {loading && <StudioSpinner />}
                {loading ? 'Kaydediliyor…' : `Commit ${filename}.svg →`}
              </button>
            </div>
          </div>
        )}

        {/* Commit done */}
        {step === 'commit' && commitDone && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <button
              onClick={() => { setStep('edit'); setRenderResult(null); setCommitDone(false); setMmdContent(''); setFilename('diagram-01'); setBanner(null); }}
              className="rounded border border-hairline px-4 py-1.5 font-sans text-sm text-ink-secondary hover:text-ink"
            >
              Yeni diyagram
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
