const TR_MAP: Array<[RegExp, string]> = [
  [/[Çç]/g, 'c'],
  [/[Şş]/g, 's'],
  [/[Ğğ]/g, 'g'],
  [/[Üü]/g, 'u'],
  [/[Öö]/g, 'o'],
  [/ı/g, 'i'],
  [/İ/g, 'i'],
];

export function normalizeSlug(input: string): string {
  let s = input;
  for (const [pattern, replacement] of TR_MAP) {
    s = s.replace(pattern, replacement);
  }
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
