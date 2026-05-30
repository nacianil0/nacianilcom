import { formatDate, formatReadingTime } from '@nacianilcom/content-core';
import type { Locale, Meta } from '@nacianilcom/content-core';
import { MetaRow } from '@nacianilcom/ui';
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
    <MetaRow
      items={[
        <time key="date" dateTime={meta.publishDate}>
          {dateLabel}
        </time>,
        timeLabel,
        difficultyLabel,
        meta.category,
      ]}
    />
  );
}
