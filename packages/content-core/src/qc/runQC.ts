import { isPublic } from '../isPublic';
import { validateTaxonomy } from '../taxonomy/validator';
import { checkInternalLinks } from '../links/checker';
import { resolveRedirects } from '../redirects/resolver';
import { normalizeSlug } from '../url/normalizeSlug';
import { parseVisualBlocks, validateVisualBlocks } from '../visual/validator';
import type { Meta } from '../schemas/meta';
import type { Taxonomy } from '../schemas/taxonomy';
import type { References } from '../schemas/references';
import type { RedirectItem } from '../schemas/redirects';
import type { ContentCatalog, LinkRef } from '../links/resolver';
import type { ArticlePublicPath } from '../redirects/resolver';
import type { Locale } from '../i18n';

export type QCGroup =
  | 'taxonomy'
  | 'internal-link'
  | 'slug'
  | 'redirect'
  | 'hreflang'
  | 'canonical'
  | 'references'
  | 'content'
  | 'visual'
  | 'svg';

export interface SvgAsset {
  filename: string;
  exists: boolean;
  sanitized: boolean;
}

export type QCSeverity = 'blocking' | 'warning';

export interface QCIssue {
  code: string;
  message: string;
  group: QCGroup;
  severity: QCSeverity;
}

export interface QCReport {
  articleId: string;
  blocking: QCIssue[];
  warnings: QCIssue[];
}

export interface QCContext {
  meta: Meta;
  taxonomy: Taxonomy;
  references: References;
  internalLinks: LinkRef[];
  redirects: RedirectItem[];
  catalog: ContentCatalog;
  lang: Locale;
  articlePublicPaths: ArticlePublicPath[];
  // WP-10: optional visual/SVG context
  mdxContent?: string;
  svgAssets?: SvgAsset[];
}

export function runQC(ctx: QCContext, now: Date): QCReport {
  const issues: QCIssue[] = [];

  const blocking = (code: string, message: string, group: QCGroup) =>
    issues.push({ code, message, group, severity: 'blocking' });
  const warning = (code: string, message: string, group: QCGroup) =>
    issues.push({ code, message, group, severity: 'warning' });

  // Slug
  const normalized = normalizeSlug(ctx.meta.slugBase);
  if (normalized !== ctx.meta.slugBase) {
    blocking(
      'INVALID_SLUG',
      `slugBase "${ctx.meta.slugBase}" is not normalized (expected "${normalized}")`,
      'slug'
    );
  }

  // Taxonomy
  for (const issue of validateTaxonomy(ctx.meta.category, ctx.meta.tags, ctx.taxonomy)) {
    blocking(issue.code, issue.message, 'taxonomy');
  }

  // Internal links
  for (const issue of checkInternalLinks(ctx.internalLinks, ctx.lang, ctx.catalog, now)) {
    blocking(issue.code, issue.message, 'internal-link');
  }

  // Redirects
  for (const issue of resolveRedirects(ctx.redirects, ctx.articlePublicPaths, now)) {
    blocking(issue.code, issue.message, 'redirect');
  }

  // References
  const requiresRefsBlocking =
    (['research', 'explainer', 'architecture'] as string[]).includes(ctx.meta.contentType) ||
    ctx.meta.schemaType === 'TechArticle';
  const requiresRefsWarning = (['essay', 'cv', 'case-study'] as string[]).includes(
    ctx.meta.contentType
  );

  if (ctx.references.length === 0) {
    if (requiresRefsBlocking) {
      blocking(
        'NO_REFERENCES',
        `contentType "${ctx.meta.contentType}" (or TechArticle) requires at least one reference`,
        'references'
      );
    } else if (requiresRefsWarning) {
      warning(
        'NO_REFERENCES_WARNING',
        `contentType "${ctx.meta.contentType}" has no references (recommended)`,
        'references'
      );
    }
  }

  // Hreflang / Canonical
  // TODO(WP-04): verify canonical URL resolves correctly per language
  // TODO(WP-05): verify og:image and cover assets resolve to public URLs

  // SVG asset checks (WP-10)
  if (ctx.svgAssets) {
    for (const asset of ctx.svgAssets) {
      if (!asset.exists) {
        blocking(
          'SVG_MISSING',
          `Referenced SVG asset "${asset.filename}" does not exist`,
          'visual'
        );
      } else if (!asset.sanitized) {
        blocking(
          'SVG_SANITIZE_FAILURE',
          `SVG asset "${asset.filename}" failed sanitize check`,
          'svg'
        );
      }
    }
  }

  // Visual block validation (WP-10)
  if (ctx.mdxContent) {
    const blocks = parseVisualBlocks(ctx.mdxContent);
    const published = isPublic(ctx.meta, now);
    for (const issue of validateVisualBlocks(blocks, published)) {
      if (issue.severity === 'blocking') {
        blocking(issue.code, issue.message, 'visual');
      } else {
        warning(issue.code, issue.message, 'visual');
      }
    }
  }

  // Published content leak guard
  if (isPublic(ctx.meta, now)) {
    // All checks above must pass; leak detection (draft in public set) handled at call site
  }

  return {
    articleId: ctx.meta.id,
    blocking: issues.filter(i => i.severity === 'blocking'),
    warnings: issues.filter(i => i.severity === 'warning'),
  };
}
