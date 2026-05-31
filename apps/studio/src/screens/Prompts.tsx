import { useState, useEffect } from 'react';
import { StudioSpinner, StatusBanner, EmptyState } from '../ui';

interface PromptMeta { name: string; title: string }

export function Prompts() {
  const [list, setList] = useState<PromptMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then((data: PromptMeta[]) => setList(data))
      .catch(() => null);
  }, []);

  async function loadPrompt(name: string) {
    setSelected(name);
    setLoading(true);
    setContent(null);
    setBanner(null);
    const res = await fetch(`/api/prompts/${name}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json() as { content: string };
      setContent(data.content);
    } else {
      setBanner({ ok: false, msg: 'Prompt yüklenemedi' });
    }
    setLoading(false);
  }

  async function handleCopy() {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setBanner({ ok: true, msg: 'Kopyalandı ✓' });
      setTimeout(() => setBanner(null), 2000);
    } catch {
      setBanner({ ok: false, msg: 'Kopyalama başarısız — manuel kopyalayın' });
    }
  }

  const selectedMeta = list.find(p => p.name === selected);

  return (
    <div className="flex gap-6 h-full">
      {/* Prompt list */}
      <aside className="w-56 flex-shrink-0">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">
          Prompt Templates
        </h2>
        <ul className="space-y-0.5">
          {list.map(({ name, title }) => (
            <li key={name}>
              <button
                onClick={() => loadPrompt(name)}
                className={`w-full rounded px-3 py-1.5 text-left font-sans text-xs transition-colors ${
                  selected === name
                    ? 'bg-accent/10 font-medium text-accent'
                    : 'text-ink-secondary hover:bg-hairline/40 hover:text-ink'
                }`}
              >
                {title}
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="font-sans text-xs text-ink-secondary/60 px-3 py-1.5">No prompts found</li>
          )}
        </ul>
      </aside>

      {/* Content pane */}
      <div className="flex-1 overflow-auto rounded-card border border-hairline bg-card p-5 flex flex-col gap-3">
        {!selected && (
          <EmptyState
            title="Soldan bir prompt şablonu seç"
            steps={[
              { label: 'Listeden istediğin şablona tıkla' },
              { label: 'Copy ile panoya al' },
              { label: 'Claude Code\'a yapıştır' },
            ]}
            hint="Kaynak: apps/studio/prompts/"
          />
        )}

        {loading && (
          <div className="flex items-center gap-2 text-ink-secondary">
            <StudioSpinner />
            <span className="font-sans text-sm">Yükleniyor…</span>
          </div>
        )}

        {banner && (
          <StatusBanner
            variant={banner.ok ? 'success' : 'error'}
            title={banner.msg}
            onDismiss={() => setBanner(null)}
          />
        )}

        {content && (
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-ink-secondary/60">
                  {selectedMeta?.title ?? selected}
                </h3>
                <p className="font-mono text-[10px] text-ink-secondary/40">
                  Kaynak: apps/studio/prompts/{selected}.md
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="rounded border border-hairline px-3 py-1 font-sans text-xs text-ink-secondary hover:border-ink-secondary/40 hover:text-ink transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-secondary overflow-auto flex-1">
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
