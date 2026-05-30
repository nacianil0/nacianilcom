import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { loadCase, listCaseSlugs } from '../../../../src/content/loader';
import { SiteNav } from '../../../../src/components/SiteNav';
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
    title: `${c.title} — Naci Anil Akman`,
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

  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'workCase', { caseSlug });
  const workUrl = buildUrl(locale, 'work');
  const canonicalUrl = `${SITE_URL}${buildUrl(locale, 'workCase', { caseSlug })}`;

  const personLd = personJsonLd();
  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Ana sayfa' : 'Home', url: `${SITE_URL}${buildUrl(locale, 'home')}` },
    { name: locale === 'tr' ? 'Projeler' : 'Work', url: `${SITE_URL}${workUrl}` },
    { name: c.title, url: canonicalUrl },
  ]);

  const sections: Array<{ key: string; label: string; content: string }> = [
    { key: 'problem', label: locale === 'tr' ? 'Problem' : 'Problem', content: c.problem },
    { key: 'context', label: locale === 'tr' ? 'Bağlam' : 'Context', content: c.context },
    { key: 'role', label: locale === 'tr' ? 'Rol' : 'Role', content: c.role },
    ...(c.constraints ? [{ key: 'constraints', label: locale === 'tr' ? 'Kısıtlar' : 'Constraints', content: c.constraints }] : []),
    { key: 'solution', label: locale === 'tr' ? 'Çözüm' : 'Solution', content: c.solution },
    { key: 'impact', label: locale === 'tr' ? 'Etki' : 'Impact', content: c.impact },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <main className="mx-auto max-w-[720px] px-6 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 font-sans text-xs text-ink-secondary/60">
              <li>
                <Link href={workUrl} className="transition-colors hover:text-ink-secondary">
                  {locale === 'tr' ? 'Projeler' : 'Work'}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-secondary">{c.title}</li>
            </ol>
          </nav>

          {/* Hero */}
          <header className="mb-10 border-l-[3px] border-accent pl-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
              {locale === 'tr' ? 'Case Study' : 'Case Study'}
            </p>
            <h1 className="font-serif text-[2.125rem] font-semibold leading-[1.15] text-ink">
              {c.title}
            </h1>
            <p className="mt-3 font-sans text-base leading-[1.75] text-ink-secondary border-l-2 border-hairline pl-4 ml-[-21px] ml-0">
              {c.summary}
            </p>
          </header>

          {/* Stack */}
          {c.stack.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {c.stack.map(s => (
                <span key={s} className="rounded border border-hairline px-2.5 py-1 font-mono text-[10px] text-ink-secondary/60">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-8" data-reading>
            {sections.map(({ key, label, content }) => (
              <section key={key} aria-labelledby={`section-${key}`}>
                <h2
                  id={`section-${key}`}
                  className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60"
                >
                  {label}
                </h2>
                <p className="font-sans text-[14.5px] leading-[1.7] text-ink-secondary">{content}</p>
              </section>
            ))}
          </div>

          {/* Back */}
          <div className="mt-10 border-t border-hairline pt-6">
            <Link
              href={workUrl}
              className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
            >
              ← {locale === 'tr' ? 'Projelere dön' : 'Back to Work'}
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
