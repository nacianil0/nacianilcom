'use client';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TOC() {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const article = document.querySelector('article[data-reading]');
    if (!article) return;
    const headings = article.querySelectorAll('h2[id], h3[id]');
    const collected: TocItem[] = [];
    headings.forEach(h => {
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
    <nav aria-label="İçindekiler">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-secondary/60">
        İçindekiler
      </p>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block font-sans text-xs leading-relaxed text-ink-secondary transition-colors hover:text-ink ${item.level === 3 ? 'pl-3' : ''}`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
