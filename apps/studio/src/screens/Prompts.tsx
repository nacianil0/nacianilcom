import { useState, useEffect } from 'react';

interface PromptMeta { name: string; title: string }

export function Prompts() {
  const [list, setList] = useState<PromptMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const res = await fetch(`/api/prompts/${name}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json() as { content: string };
      setContent(data.content);
    }
    setLoading(false);
  }

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
      <div className="flex-1 overflow-auto rounded-card border border-hairline bg-card p-5">
        {!selected && (
          <p className="font-sans text-sm text-ink-secondary/60">Select a prompt template.</p>
        )}
        {loading && (
          <p className="font-sans text-sm text-ink-secondary">Loading…</p>
        )}
        {content && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-ink-secondary/60">
                {selected}
              </h3>
              <button
                onClick={() => navigator.clipboard.writeText(content ?? '')}
                className="rounded border border-hairline px-3 py-1 font-sans text-xs text-ink-secondary hover:border-ink-secondary/40 hover:text-ink transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-secondary overflow-auto">
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
