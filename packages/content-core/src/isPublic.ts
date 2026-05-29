export function isPublic(
  meta: { status: string; publishDate: string },
  now: Date
): boolean {
  return meta.status !== 'draft' && new Date(meta.publishDate) <= now;
}
