import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isPublic } from '@nacianilcom/content-core';
import { listSeriesSlugs, listArticleIds, loadMeta } from '../../../src/content/loader';
import { articleRevalidateTargets } from '../../../src/lib/revalidate-targets';

// Always server-rendered; never cached
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Vercel automatically passes Authorization: Bearer <CRON_SECRET> for cron invocations.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const revalidated: string[] = [];

  // Deduplicate across articles sharing the same series/list/feed paths
  const revalidatedTags = new Set<string>();
  const revalidatedPaths = new Set<string>();

  const seriesSlugs = await listSeriesSlugs();

  for (const seriesSlug of seriesSlugs) {
    const ids = await listArticleIds(seriesSlug);

    for (const id of ids) {
      const meta = await loadMeta(seriesSlug, id);
      if (!meta || !isPublic(meta, now)) continue;

      const targets = articleRevalidateTargets({
        articleId: meta.id,
        seriesSlug,
        articleSlug: meta.slugBase,
      });

      for (const tag of targets.tags) {
        if (!revalidatedTags.has(tag)) {
          revalidateTag(tag);
          revalidatedTags.add(tag);
        }
      }
      for (const path of targets.paths) {
        if (!revalidatedPaths.has(path)) {
          revalidatePath(path);
          revalidatedPaths.add(path);
        }
      }

      revalidated.push(`${seriesSlug}/${id}`);
    }
  }

  return NextResponse.json({ ok: true, revalidated });
}
