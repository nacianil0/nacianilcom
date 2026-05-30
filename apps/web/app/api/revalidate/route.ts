import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';

const WINDOW_SECONDS = 30;

const BodySchema = z.object({
  ts: z.number().int(),
  path: z.string().optional(),
  tag: z.string().optional(),
});

type SafeError = { error: string };

function denied(msg: string, status: 401 | 400 | 500): NextResponse<SafeError> {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse<SafeError | { ok: true }>> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return denied('Server error', 500);

  const sig = req.headers.get('x-signature') ?? '';
  const rawBody = await req.text();

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  // Constant-time comparison (both must be same length for timingSafeEqual)
  let valid = sig.length === expected.length;
  if (valid) {
    try {
      valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      valid = false;
    }
  }
  if (!valid) return denied('Unauthorized', 401);

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(JSON.parse(rawBody));
  } catch {
    return denied('Bad request', 400);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - parsed.ts) > WINDOW_SECONDS) {
    return denied('Request expired', 401);
  }

  if (parsed.tag) revalidateTag(parsed.tag);
  if (parsed.path) revalidatePath(parsed.path);

  return NextResponse.json({ ok: true as const });
}
