import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { Masthead, MonoLabel, Chip } from '@nacianilcom/ui';
import { loadCase, listCaseSlugs } from '../../../../src/content/loader';
import { SiteNav } from '../../../../src/components/SiteNav';
import { SiteFooter } from '../../../../src/components/SiteFooter';
import { Crumbs } from '../../../../src/components/Crumbs';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../../src/lib/site';
import { personJsonLd, breadcrumbJsonLd } from '../../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listCaseSlugs();
  const params: { lang: string; caseSlug: string }[] = [];
  for (const lang of ['tr', 'en']) {
    for (const caseSlug of slugs) {
      params.push({ lang, caseSlug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; caseSlug: string }>;
}): Promise<Metadata> {
  const { lang, caseSlug } = await params;
  if (!VALID_LANGS.has(lang)) return {};
  const locale = lang as Locale;
  const c = await loadCase(caseSlug, locale);
  if (!c) return { title: 'Not found' };

  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
  const trUrl = `${SITE_URL}${buildUrl('tr', 'workCase', { caseSlug })}`;
  const enUrl = `${SITE_URL}${buildUrl('en', 'workCase', { caseSlug })}`;
  const canonicalUrl = locale === 'tr' ? trUrl : enUrl;

  return {
    title: `${c.title} — Naci Anıl Akman`,
    description: c.summary,
    alternates: {
      canonical: canonicalUrl,
      languages: { tr: trUrl, en: enUrl, 'x-default': trUrl },
    },
    openGraph: {
      title: c.title,
      description: c.summary,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: localeToOgLocale(locale),
      alternateLocale: localeToOgLocale(altLocale),
    },
    twitter: { card: 'summary', title: c.title, description: c.summary },
  };
}

/** Small, low-key section marker — keeps the page reading like a story, not a form. */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{children}</p>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; caseSlug: string }>;
}) {
  const { lang, caseSlug } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const c = await loadCase(caseSlug, locale);
  if (!c) notFound();

  const tr = locale === 'tr';
  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'workCase', { caseSlug });
  const workUrl = buildUrl(locale, 'work');
  const canonicalUrl = `${SITE_URL}${buildUrl(locale, 'workCase', { caseSlug })}`;

  const personLd = personJsonLd();
  const breadcrumbLd = breadcrumbJsonLd([
    { name: tr ? 'Ana sayfa' : 'Home', url: `${SITE_URL}${buildUrl(locale, 'home')}` },
    { name: tr ? 'Projeler' : 'Work', url: `${SITE_URL}${workUrl}` },
    { name: c.title, url: canonicalUrl },
  ]);

  const bodyClass = 'font-sans text-[15.5px] leading-[1.8] text-ink-secondary';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="flex min-h-screen flex-col bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <Masthead crumbs={<Crumbs items={[{ label: tr ? 'Projeler' : 'Work', href: workUrl }]} />} />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-12 sm:px-10 lg:px-14">
          <article data-reading className="mx-auto max-w-[720px]" aria-labelledby="case-title">
            <header>
              <MonoLabel tone="accent">{tr ? 'Vaka Çalışması' : 'Case Study'}</MonoLabel>
              <h1
                id="case-title"
                className="mt-3 font-serif text-[32px] font-semibold leading-[1.08] tracking-[-0.01em] text-ink sm:text-[42px]"
              >
                {c.title}
                <span className="text-accent">.</span>
              </h1>
              <p className="mt-5 font-serif text-[19px] leading-[1.5] text-ink sm:text-[21px]">{c.summary}</p>
            </header>

            {/* Quick facts — compact, not a labelled wall */}
            <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-5 border-y border-hairline py-6 sm:grid-cols-[auto_1fr]">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary">
                  {tr ? 'Rol' : 'Role'}
                </dt>
                <dd className="mt-1.5 max-w-[420px] font-sans text-[14px] leading-[1.6] text-ink">{c.role}</dd>
              </div>
              {c.stack.length > 0 && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary">
                    {tr ? 'Teknolojiler' : 'Stack'}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {c.stack.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            {/* Narrative */}
            <div className="mt-10 flex flex-col gap-9">
              <section>
                <Kicker>{tr ? 'Arka plan' : 'Background'}</Kicker>
                <p className={bodyClass}>{c.problem}</p>
                <p className={`mt-4 ${bodyClass}`}>{c.context}</p>
              </section>

              <section>
                <Kicker>{tr ? 'Ne yaptım' : 'What I did'}</Kicker>
                <p className={bodyClass}>{c.solution}</p>
                {c.constraints && (
                  <p className="mt-5 border-l-2 border-hairline pl-4 font-sans text-[14px] leading-[1.65] text-ink-secondary">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-secondary/80">
                      {tr ? 'Kısıt' : 'Constraint'}
                    </span>
                    <span className="mt-1 block">{c.constraints}</span>
                  </p>
                )}
              </section>

              <section className="border-l-2 border-accent pl-5">
                <Kicker>{tr ? 'Sonuç' : 'Outcome'}</Kicker>
                <p className="font-serif text-[17px] leading-[1.6] text-ink">{c.impact}</p>
              </section>
            </div>

            <div className="mt-12 border-t border-hairline pt-6">
              <Link
                href={workUrl}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink"
              >
                ← {tr ? 'Projelere dön' : 'Back to Work'}
              </Link>
            </div>
          </article>
        </main>

        <SiteFooter lang={locale} />
      </div>
    </>
  );
}
