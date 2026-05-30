/** Minimal className combiner — joins truthy strings. No external deps (§3 framework-light). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
