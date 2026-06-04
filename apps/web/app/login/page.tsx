import type { Metadata } from 'next';
import { login } from './actions';
import { getPasswordGateConfig, safeNextPath } from '../../src/lib/password-gate';
import { SITE_NAME } from '../../src/lib/site';

type SearchParams = Promise<{
  error?: string | string[];
  next?: string | string[];
}>;

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function errorMessage(error: string | undefined): string | undefined {
  if (error === 'config') {
    return 'Login env eksik. SITE_PASSWORD_SHA256 ve AUTH_COOKIE_SECRET set edilmeli.';
  }
  if (error === 'invalid') {
    return 'Sifre yanlis.';
  }
  return undefined;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNextPath(firstParam(params.next));
  const message = errorMessage(firstParam(params.error));
  const isConfigured = Boolean(getPasswordGateConfig(process.env));

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 py-12 text-ink">
      <section className="w-full max-w-[360px] border border-hairline bg-paper p-6 shadow-[0_20px_60px_rgb(27_26_24/0.08)]">
        <div className="border-b border-hairline pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Private
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-none">{SITE_NAME}</h1>
        </div>

        <form action={login} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Sifre
            </span>
            <input
              autoComplete="current-password"
              autoFocus
              className="h-11 border border-hairline bg-surface px-3 font-sans text-sm text-ink outline-none transition-colors focus:border-accent"
              disabled={!isConfigured}
              name="password"
              required
              type="password"
            />
          </label>

          {message && (
            <p className="border-l-2 border-accent bg-surface px-3 py-2 text-sm text-muted">
              {message}
            </p>
          )}

          <button
            className="h-11 border border-ink bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-surface transition-colors hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:border-hairline disabled:bg-muted disabled:text-surface"
            disabled={!isConfigured}
            type="submit"
          >
            Gir
          </button>
        </form>
      </section>
    </main>
  );
}
