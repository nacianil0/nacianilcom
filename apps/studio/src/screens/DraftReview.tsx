import { useState, useEffect, useCallback, type ComponentType } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { parseMdx } from '@nacianilcom/content-core';
import {
  Callout,
  Definition,
  Example,
  Warning,
  Takeaway,
  CodeBlock,
  VisualBlock,
  Comparison,
  LayeredModel,
  Pyramid,
} from '@nacianilcom/ui';

const MDX_COMPONENTS = {
  Callout,
  Definition,
  Example,
  Warning,
  Takeaway,
  CodeBlock,
  VisualBlock,
  Comparison,
  LayeredModel,
  Pyramid,
};

interface ArticleRef {
  id: string;
  meta: Record<string, unknown>;
}

interface SeriesItem {
  slug: string;
  series: { title: { tr: string; en: string } };
  articles: ArticleRef[];
}

export function DraftReview() {
  const [list, setList] = useState<SeriesItem[]>([]);
  const [selected, setSelected] = useState<{ seriesSlug: string; articleId: string; lang: 'tr' | 'en' } | null>(null);
  const [preview, setPreview] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/list')
      .then(r => r.json())
      .then((data: SeriesItem[]) => setList(data))
      .catch(() => setError('Failed to load content list'));
  }, []);

  const loadPreview = useCallback(async (seriesSlug: string, articleId: string, lang: 'tr' | 'en') => {
    setLoading(true);
    setError(null);
    setPreview(null);
    setFrontmatter(null);

    try {
      const res = await fetch(`/api/content/${seriesSlug}/${articleId}/mdx/${lang}`);
      if (!res.ok) throw new Error('MDX file not found');
      const { content } = await res.json() as { content: string };

      const parsed = parseMdx(content);
      if (parsed.frontmatter) setFrontmatter(parsed.frontmatter as unknown as Record<string, unknown>);

      const { default: MDXContent } = await evaluate(parsed.content, {
        ...(runtime as Parameters<typeof evaluate>[1]),
      });

      setPreview(() => MDXContent as ComponentType<Record<string, unknown>>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex gap-6 h-full">
      {/* Article selector */}
      <aside className="w-64 flex-shrink-0">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">
          Select Article
        </h2>
        <div className="space-y-4">
          {list.map(({ slug, series, articles }) => (
            <div key={slug}>
              <p className="mb-1 font-sans text-xs font-semibold text-ink-secondary">{series.title.tr}</p>
              <ul className="space-y-1">
                {articles.map(({ id, meta }) => {
                  const status = meta['status'] as string;
                  return (
                    <li key={id}>
                      {(['tr', 'en'] as const).map(lang => {
                        const isActive =
                          selected?.seriesSlug === slug &&
                          selected?.articleId === id &&
                          selected?.lang === lang;
                        return (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelected({ seriesSlug: slug, articleId: id, lang });
                              loadPreview(slug, id, lang);
                            }}
                            className={`flex w-full items-center justify-between rounded px-2 py-1 text-left font-sans text-xs transition-colors ${
                              isActive
                                ? 'bg-accent/10 text-accent'
                                : 'text-ink-secondary hover:bg-hairline/40 hover:text-ink'
                            }`}
                          >
                            <span className="truncate">{id} [{lang}]</span>
                            <span
                              className={`ml-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                                status === 'published'
                                  ? 'bg-positive/10 text-positive'
                                  : status === 'scheduled'
                                    ? 'bg-accent/10 text-accent'
                                    : 'bg-hairline text-ink-secondary'
                              }`}
                            >
                              {status}
                            </span>
                          </button>
                        );
                      })}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Preview pane */}
      <div className="flex-1 overflow-auto rounded-card border border-hairline bg-card p-6">
        {!selected && (
          <p className="font-sans text-sm text-ink-secondary/60">Select an article to preview.</p>
        )}
        {loading && (
          <p className="font-sans text-sm text-ink-secondary">Loading preview…</p>
        )}
        {error && (
          <p className="font-sans text-sm text-negative">{error}</p>
        )}
        {frontmatter && (
          <div className="mb-6 rounded-card border border-hairline bg-surface p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary/60">
              Frontmatter
            </p>
            <pre className="font-mono text-xs text-ink-secondary overflow-auto">
              {JSON.stringify(frontmatter, null, 2)}
            </pre>
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
      </div>
    </div>
  );
}
