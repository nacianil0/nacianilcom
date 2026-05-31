import { useState, useEffect, useCallback, type ComponentType } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { parseMdx } from '@nacianilcom/content-core';
import {
  Callout, Definition, Example, Warning, Takeaway,
  CodeBlock, VisualBlock, Comparison, LayeredModel, Pyramid,
} from '@nacianilcom/ui';
import { StudioSpinner, StatusBanner, EmptyState } from '../ui';

const MDX_COMPONENTS = {
  Callout, Definition, Example, Warning, Takeaway,
  CodeBlock, VisualBlock, Comparison, LayeredModel, Pyramid,
};

interface ArticleRef { id: string; meta: Record<string, unknown> }
interface SeriesItem {
  slug: string;
  series: { title: { tr: string; en: string } };
  articles: ArticleRef[];
}

interface ArticleBundle {
  meta: Record<string, unknown>;
  brief: Record<string, unknown> | null;
  outline: Record<string, unknown> | null;
  files: { brief: boolean; outline: boolean; mdx: { tr: boolean; en: boolean } };
}

interface CodexPrompt {
  step: string;
  title: string;
  content: string;
  path: string;
}

export function DraftReview() {
  const [list, setList] = useState<SeriesItem[]>([]);
  const [selected, setSelected] = useState<{ seriesSlug: string; articleId: string } | null>(null);
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [preview, setPreview] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null);
  const [bundle, setBundle] = useState<ArticleBundle | null>(null);
  const [codexPrompt, setCodexPrompt] = useState<CodexPrompt | null>(null);
  const [pendingSteps, setPendingSteps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingPrompts, setGeneratingPrompts] = useState(false);
  const [banner, setBanner] = useState<{ variant: 'success' | 'error' | 'info'; title: string; detail?: string | undefined; path?: string | undefined } | null>(null);

  useEffect(() => {
    fetch('/api/content/list')
      .then(r => r.json())
      .then((data: SeriesItem[]) => setList(data))
      .catch(() => setBanner({ variant: 'error', title: 'İçerik listesi yüklenemedi' }));
  }, []);

  const loadCodexPrompt = useCallback(async (seriesSlug: string, articleId: string) => {
    const res = await fetch(`/api/prompts/codex/${seriesSlug}/${articleId}/next`);
    if (res.ok) {
      const data = (await res.json()) as { pending: string[]; prompt: CodexPrompt };
      setPendingSteps(data.pending);
      setCodexPrompt(data.prompt);
    } else {
      setPendingSteps([]);
      setCodexPrompt(null);
    }
  }, []);

  const loadArticle = useCallback(async (seriesSlug: string, articleId: string, nextLang: 'tr' | 'en') => {
    setLoading(true);
    setBanner(null);
    setPreview(null);
    setFrontmatter(null);
    setBundle(null);
    setCodexPrompt(null);

    try {
      const bundleRes = await fetch(`/api/content/${seriesSlug}/${articleId}`);
      if (!bundleRes.ok) throw new Error('Makale bulunamadı');
      const article = (await bundleRes.json()) as ArticleBundle;
      setBundle(article);

      await loadCodexPrompt(seriesSlug, articleId);

      const mdxRes = await fetch(`/api/content/${seriesSlug}/${articleId}/mdx/${nextLang}`);
      if (!mdxRes.ok) {
        setBanner({
          variant: 'info',
          title: 'Sıradaki adım: Codex prompt',
          detail: 'Aşağıdaki promptu kopyala → Codex\'e yapıştır → çıktı repoya yazılsın → sayfayı yenile.',
          path: `content/series/${seriesSlug}/articles/${articleId}/`,
        });
        return;
      }

      const { content } = (await mdxRes.json()) as { content: string };
      const parsed = parseMdx(content);
      if (parsed.frontmatter) setFrontmatter(parsed.frontmatter as unknown as Record<string, unknown>);

      const { default: MDXContent } = await evaluate(parsed.content, {
        ...(runtime as Parameters<typeof evaluate>[1]),
      });

      setPreview(() => MDXContent as ComponentType<Record<string, unknown>>);
      setBanner({
        variant: 'success',
        title: `Önizleme — ${articleId} [${nextLang}]`,
        path: `content/series/${seriesSlug}/articles/${articleId}/final.${nextLang}.mdx`,
      });
    } catch (e) {
      setBanner({ variant: 'error', title: 'Yüklenemedi', detail: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  }, [loadCodexPrompt]);

  function selectArticle(seriesSlug: string, articleId: string) {
    setSelected({ seriesSlug, articleId });
    setLang('tr');
    void loadArticle(seriesSlug, articleId, 'tr');
  }

  function switchLang(nextLang: 'tr' | 'en') {
    if (!selected) return;
    setLang(nextLang);
    void loadArticle(selected.seriesSlug, selected.articleId, nextLang);
  }

  async function generateAllPrompts() {
    setGeneratingPrompts(true);
    setBanner({ variant: 'info', title: 'Codex promptları üretiliyor…', detail: 'content/_prompts/ altına yazılıyor' });
    try {
      const res = await fetch('/api/prompts/codex/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = (await res.json()) as { prompts?: unknown[]; skipped?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Üretim başarısız');
      setBanner({
        variant: 'success',
        title: `${data.prompts?.length ?? 0} Codex promptu hazır`,
        detail: `${data.skipped ?? 0} makale zaten tamam. Dosyalar: content/_prompts/`,
        path: 'content/_prompts/',
      });
      if (selected) void loadCodexPrompt(selected.seriesSlug, selected.articleId);
    } catch (e) {
      setBanner({ variant: 'error', title: 'Prompt üretimi hatası', detail: String(e) });
    } finally {
      setGeneratingPrompts(false);
    }
  }

  async function copyPrompt() {
    if (!codexPrompt) return;
    try {
      await navigator.clipboard.writeText(codexPrompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setBanner({ variant: 'error', title: 'Kopyalanamadı', detail: 'Textarea\'dan manuel kopyala' });
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <aside className="w-64 flex-shrink-0 flex flex-col gap-3">
        <div>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">Select Article</h2>
          <button
            type="button"
            onClick={() => void generateAllPrompts()}
            disabled={generatingPrompts || loading}
            className="w-full flex items-center justify-center gap-2 rounded bg-accent px-3 py-2 font-sans text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-40"
          >
            {generatingPrompts && <StudioSpinner />}
            Tüm Codex promptları üret
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto flex-1">
          {list.map(({ slug, series, articles }) => (
            <div key={slug}>
              <p className="mb-1 font-sans text-xs font-semibold text-ink-secondary">{series.title.tr}</p>
              <ul className="space-y-1">
                {articles.map(({ id, meta }) => {
                  const status = meta['status'] as string;
                  const isActive = selected?.seriesSlug === slug && selected?.articleId === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => selectArticle(slug, id)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left font-sans text-xs transition-colors ${
                          isActive ? 'bg-accent/10 text-accent' : 'text-ink-secondary hover:bg-hairline/40 hover:text-ink'
                        }`}
                      >
                        <span className="truncate pr-1">{id}</span>
                        <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                          status === 'published' ? 'bg-positive/10 text-positive'
                          : status === 'scheduled' ? 'bg-accent/10 text-accent'
                          : 'bg-hairline text-ink-secondary'
                        }`}>
                          {status}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 overflow-auto rounded-card border border-hairline bg-card p-6 flex flex-col gap-4 min-w-0">
        {!selected && (
          <EmptyState
            title="Önizlemek veya Codex prompt almak için makale seç"
            steps={[
              { label: 'Soldan makale seç — sıradaki Codex promptu görünür' },
              { label: 'Copy → Codex → çıktı repoya' },
              { label: 'Veya "Tüm Codex promptları üret" → content/_prompts/' },
            ]}
          />
        )}

        {selected && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {(['tr', 'en'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                className={`rounded px-3 py-1 font-mono text-xs uppercase ${
                  lang === l ? 'bg-accent text-white' : 'border border-hairline text-ink-secondary hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-ink-secondary">
            <StudioSpinner />
            <span className="font-sans text-sm">Yükleniyor…</span>
          </div>
        )}

        {banner && !loading && (
          <StatusBanner variant={banner.variant} title={banner.title} detail={banner.detail} path={banner.path} onDismiss={() => setBanner(null)} />
        )}

        {bundle && (
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {[
              { label: 'brief', ok: bundle.files.brief },
              { label: 'outline', ok: bundle.files.outline },
              { label: `mdx.${lang}`, ok: bundle.files.mdx[lang] },
            ].map(({ label, ok }) => (
              <span key={label} className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${ok ? 'bg-positive/10 text-positive' : 'bg-hairline text-ink-secondary/60'}`}>
                {label} {ok ? '✓' : '—'}
              </span>
            ))}
            {pendingSteps.length > 0 && (
              <span className="rounded-full px-2 py-0.5 font-mono text-[10px] bg-accent/10 text-accent">
                sırada: {pendingSteps.join(' → ')}
              </span>
            )}
          </div>
        )}

        {codexPrompt && !preview && !loading && (
          <div className="flex flex-col gap-2 flex-shrink-0 min-h-[280px]">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">
                Codex prompt · {codexPrompt.title} ({codexPrompt.step})
              </p>
              <button
                type="button"
                onClick={() => void copyPrompt()}
                className={`rounded border px-3 py-1 font-mono text-[10px] ${
                  copied ? 'border-positive/40 text-positive' : 'border-accent/40 text-accent hover:bg-accent/5'
                }`}
              >
                {copied ? 'Kopyalandı ✓' : 'Copy → Codex'}
              </button>
            </div>
            <textarea
              readOnly
              value={codexPrompt.content}
              className="flex-1 min-h-[240px] rounded border border-hairline bg-surface px-3 py-2 font-mono text-[11px] text-ink-secondary resize-none"
            />
            <p className="font-mono text-[10px] text-ink-secondary/50">{codexPrompt.path}</p>
          </div>
        )}

        {preview && (
          <div className="prose prose-sm max-w-none">
            {(() => {
              const Preview = preview;
              return <Preview components={MDX_COMPONENTS} />;
            })()}
          </div>
        )}

        {frontmatter && (
          <div className="rounded-card border border-hairline bg-surface p-4 flex-shrink-0">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">Frontmatter</p>
            <pre className="font-mono text-xs text-ink-secondary overflow-auto">{JSON.stringify(frontmatter, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
