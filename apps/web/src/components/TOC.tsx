'use client';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  label?: string;
}

export function TOC({ label = 'İçindekiler' }: TOCProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const article = document.querySelector('article[data-reading]');
    if (!article) return;
    const headings = article.querySelectorAll('h2[id], h3[id]');
    const collected: TocItem[] = [];
    headings.forEach((h) => {
      const id = h.getAttribute('id');
      if (!id) return;
      collected.push({
        id,
        text: h.textContent ?? '',
        level: h.tagName === 'H2' ? 2 : 3,
      });
    });
    setItems(collected);
  }, []);

  if (items.length < 2) return null;

  return (
    <nav aria-label={label}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary">{label}</p>
      <ul className="space-y-1 border-l border-hairline">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`-ml-px block border-l border-transparent py-0.5 font-sans text-[12px] leading-snug text-ink-secondary transition-colors hover:border-accent hover:text-ink ${
                item.level === 3 ? 'pl-6' : 'pl-3'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
