import { isPublic } from '../isPublic';
import { resolveInternalLink } from './resolver';
import type { Locale } from '../i18n';
import type { ContentCatalog, LinkRef } from './resolver';

export type { ContentCatalog, LinkRef, InternalLinkKind } from './resolver';

export interface LinkIssue {
  code: string;
  message: string;
}

export function checkInternalLinks(
  links: LinkRef[],
  lang: Locale,
  catalog: ContentCatalog,
  now: Date
): LinkIssue[] {
  const issues: LinkIssue[] = [];
  for (const link of links) {
    const resolved = resolveInternalLink(link.kind, link.id, lang, catalog);
    if (!resolved) {
      issues.push({
        code: 'BROKEN_INTERNAL_LINK',
        message: `Internal link not found: kind="${link.kind}" id="${link.id}"`,
      });
      continue;
    }
    if (!isPublic({ status: resolved.status, publishDate: resolved.publishDate }, now)) {
      issues.push({
        code: 'LINK_TO_NON_PUBLIC',
        message: `Internal link target is not public (${resolved.status}): kind="${link.kind}" id="${link.id}"`,
      });
    }
  }
  return issues;
}
