const WORDS_PER_MINUTE = 200;

export function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/);
  return Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
}
