/** Shared horizontal grid — nav, masthead, main, footer share the same left/right edges. */
export const pageShellClass =
  'mx-auto w-full max-w-[1100px] px-6 sm:px-10 lg:px-14';

/** Narrow reading column (articles, case studies) nested inside the shell. */
export const readingColumnClass = 'mx-auto w-full max-w-[760px]';

/** Spec-sheet row: content left, dates/meta right — dates share one column width. */
export const specRowGridClass =
  'grid grid-cols-1 gap-2 border-b border-hairline py-6 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start sm:gap-x-8 first:pt-0 last:border-b-0';

export const specDateColClass =
  'font-mono text-[10px] uppercase tracking-[0.16em] tabular-nums text-ink-secondary sm:pt-0.5 sm:text-right';
