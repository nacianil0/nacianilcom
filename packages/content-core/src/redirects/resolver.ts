import { isPublic } from '../isPublic';
import type { RedirectItem } from '../schemas/redirects';

const KNOWN_STATIC_ROUTES = new Set([
  '/tr', '/en',
  '/tr/cv', '/en/cv',
  '/tr/cv/print', '/en/cv/print',
  '/tr/work', '/en/work',
  '/tr/series', '/en/series',
  '/tr/feed.xml', '/en/feed.xml',
]);

const DYNAMIC_ROUTE_RE = /^\/(tr|en)\/(series\/[a-z0-9-]+(\/[a-z0-9-]+)?|work\/[a-z0-9-]+)$/;

export interface ArticlePublicPath {
  path: string;
  status: string;
  publishDate: string;
}

export interface RedirectIssue {
  code: string;
  message: string;
  redirect: RedirectItem;
}

function detectCycles(redirects: RedirectItem[]): Set<string> {
  const graph = new Map<string, string>();
  for (const r of redirects) {
    graph.set(r.from, r.to);
  }
  const inCycle = new Set<string>();
  for (const start of graph.keys()) {
    const visited = new Set<string>();
    let cur: string | undefined = start;
    while (cur !== undefined && !inCycle.has(cur)) {
      if (visited.has(cur)) {
        for (const v of visited) inCycle.add(v);
        break;
      }
      visited.add(cur);
      cur = graph.get(cur);
    }
  }
  return inCycle;
}

export function resolveRedirects(
  redirects: RedirectItem[],
  articlePaths: ArticlePublicPath[],
  now: Date
): RedirectIssue[] {
  const issues: RedirectIssue[] = [];
  const cycleNodes = detectCycles(redirects);

  for (const redirect of redirects) {
    const { from, to } = redirect;

    if (/^https?:\/\//i.test(to) || /^\/\//.test(to)) {
      issues.push({ code: 'OPEN_REDIRECT', message: `External redirect target: "${to}"`, redirect });
      continue;
    }

    if (/^https?:\/\//i.test(from)) {
      issues.push({ code: 'INVALID_FROM', message: `"from" must be relative: "${from}"`, redirect });
      continue;
    }

    if (cycleNodes.has(from)) {
      issues.push({ code: 'REDIRECT_LOOP', message: `Redirect loop detected at: "${from}"`, redirect });
      continue;
    }

    const isKnown = KNOWN_STATIC_ROUTES.has(to) || DYNAMIC_ROUTE_RE.test(to);
    if (!isKnown) {
      issues.push({
        code: 'UNKNOWN_REDIRECT_TARGET',
        message: `Redirect target is not a recognized public route: "${to}"`,
        redirect,
      });
      continue;
    }

    const article = articlePaths.find(a => a.path === to);
    if (article && !isPublic({ status: article.status, publishDate: article.publishDate }, now)) {
      issues.push({
        code: 'REDIRECT_TO_NON_PUBLIC',
        message: `Redirect target is not public (${article.status}): "${to}"`,
        redirect,
      });
    }
  }

  return issues;
}
