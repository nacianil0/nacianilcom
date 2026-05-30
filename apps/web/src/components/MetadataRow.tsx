import { formatDate, formatReadingTime } from '@nacianilcom/content-core';
import type { Locale, Meta } from '@nacianilcom/content-core';
import type { WebMessages } from '../lib/messages';

interface MetadataRowProps {
  meta: Meta;
  readingTimeMinutes: number;
  lang: Locale;
  messages: WebMessages;
}

const DIFFICULTY_KEY = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
} as const;

export function MetadataRow({ meta, readingTimeMinutes, lang, messages }: MetadataRowProps) {
  const difficultyLabel = messages.difficulty[DIFFICULTY_KEY[meta.difficulty]];
  const dateLabel = formatDate(meta.publishDate, lang);
  const timeLabel = formatReadingTime(readingTimeMinutes, lang);

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans text-xs text-ink-secondary"
      aria-label="Yazı bilgileri"
    >
      <span>{timeLabel}</span>
      <Hairline />
      <span>{difficultyLabel}</span>
      <Hairline />
      <time dateTime={meta.publishDate}>{dateLabel}</time>
      <Hairline />
      <span className="uppercase tracking-wider">{meta.category}</span>
    </div>
  );
}

function Hairline() {
  return <span aria-hidden="true" className="inline-block h-[10px] w-px bg-hairline" />;
}
