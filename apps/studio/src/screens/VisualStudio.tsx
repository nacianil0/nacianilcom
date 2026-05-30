import { useState, useEffect } from 'react';

interface DiagramList { mmd: string[]; svg: string[] }

interface RenderResult {
  svg: string;
  sanitized: string;
  removals: string[];
}

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
  const [error, setError] = useState<string | null>(null);
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
    }
  }

  async function handleRender() {
    if (!mmdContent.trim()) return;
    setLoading(true);
    setError(null);
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
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    if (!renderResult || !selectedSeries) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/visual/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesSlug: selectedSeries,
          filename: `${filename}.svg`,
          svgContent: renderResult.sanitized,
          mmdContent,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Commit failed');
      setCommitDone(true);
      setStep('commit');
      // Refresh diagram list
      const listRes = await fetch(`/api/visual/list/${selectedSeries}`);
      if (listRes.ok) setDiagrams((await listRes.json()) as DiagramList);
    } catch (e) {
      setError(String(e));
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
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">
            Series
          </label>
          <select
            value={selectedSeries}
            onChange={e => { setSelectedSeries(e.target.value); setStep('edit'); setRenderResult(null); }}
            className="w-full rounded border border-hairline bg-surface px-2 py-1.5 font-sans text-sm text-ink"
          >
            <option value="">— pick series —</option>
            {seriesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {diagrams.mmd.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">.mmd files</p>
            <ul className="space-y-0.5">
              {diagrams.mmd.map(f => (
                <li key={f}>
                  <button
                    onClick={() => loadMmdFile(f)}
                    className="w-full truncate rounded px-2 py-1 text-left font-mono text-xs text-ink-secondary hover:bg-hairline/50 hover:text-ink"
                  >
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

        {/* Diagram type reference */}
        <div className="rounded border border-hairline bg-card p-3">
          <p className="font-mono text-[9px] uppercase tracking-wider text-ink-secondary/50 mb-2">§15 MVP scope</p>
          <ul className="space-y-0.5 font-sans text-[11px] text-ink-secondary">
            <li className="text-accent">Mermaid types:</li>
            <li>• flowchart (Flow)</li>
            <li>• stateDiagram (Cycle)</li>
            <li>• timeline</li>
            <li>• graph (ConceptMap)</li>
            <li className="text-accent mt-1">Custom (WP-04):</li>
            <li>• Comparison</li>
            <li>• LayeredModel</li>
            <li>• Pyramid</li>
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

        {/* Edit step */}
        {step === 'edit' && (
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">
                  Filename (without .svg)
                </label>
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
                className="mt-5 rounded bg-accent px-4 py-1.5 font-sans text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-40"
              >
                {loading ? 'Rendering…' : 'Render →'}
              </button>
            </div>

            <textarea
              value={mmdContent || defaultMmd}
              onChange={e => setMmdContent(e.target.value)}
              placeholder={defaultMmd}
              rows={20}
              className="flex-1 rounded border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink resize-none"
            />

            {error && (
              <div className="rounded border border-negative/30 bg-negative/5 px-3 py-2 font-mono text-xs text-negative">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview step */}
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
                SVG clean — no dangerous content removed.
              </div>
            )}

            {/* SVG preview */}
            <div className="flex-1 overflow-auto rounded border border-hairline bg-card p-4">
              <div
                className="max-w-full"
                dangerouslySetInnerHTML={{ __html: renderResult.sanitized }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('edit'); setRenderResult(null); }}
                className="rounded border border-hairline px-4 py-1.5 font-sans text-sm text-ink-secondary hover:text-ink"
              >
                ← Edit
              </button>
              <button
                onClick={handleCommit}
                disabled={loading || !selectedSeries}
                className="rounded bg-positive px-4 py-1.5 font-sans text-sm font-medium text-white hover:bg-positive/90 disabled:opacity-40"
              >
                {loading ? 'Committing…' : `Commit ${filename}.svg →`}
              </button>
            </div>
            {error && (
              <div className="rounded border border-negative/30 bg-negative/5 px-3 py-2 font-mono text-xs text-negative">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Commit done step */}
        {step === 'commit' && commitDone && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="rounded border border-positive/30 bg-positive/5 px-6 py-4 text-center">
              <p className="font-sans text-base font-medium text-positive mb-1">
                {filename}.svg committed ✓
              </p>
              <p className="font-sans text-sm text-ink-secondary">
                Sanitized SVG committed to content/series/{selectedSeries}/diagrams/
              </p>
            </div>
            <button
              onClick={() => { setStep('edit'); setRenderResult(null); setCommitDone(false); setMmdContent(''); setFilename('diagram-01'); }}
              className="rounded border border-hairline px-4 py-1.5 font-sans text-sm text-ink-secondary hover:text-ink"
            >
              New diagram
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
