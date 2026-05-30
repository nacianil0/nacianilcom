import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { Masthead, MonoLabel, SectionRail, Chip } from '@nacianilcom/ui';
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
    ...(c.constraints
      ? [{ key: 'constraints', label: locale === 'tr' ? 'Kısıtlar' : 'Constraints', content: c.constraints }]
      : []),
    { key: 'solution', label: locale === 'tr' ? 'Çözüm' : 'Solution', content: c.solution },
    { key: 'impact', label: locale === 'tr' ? 'Etki' : 'Impact', content: c.impact },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="flex min-h-screen flex-col bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <Masthead
          crumbs={<Crumbs items={[{ label: locale === 'tr' ? 'Projeler' : 'Work', href: workUrl }]} />}
        />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-12 sm:px-10 lg:px-14">
          <article data-reading className="mx-auto max-w-[760px]" aria-labelledby="case-title">
            <header>
              <MonoLabel tone="accent">Case Study</MonoLabel>
              <h1
                id="case-title"
                className="mt-3 font-serif text-[32px] font-semibold leading-[1.08] tracking-[-0.01em] text-ink sm:text-[42px]"
              >
                {c.title}
                <span className="text-accent">.</span>
              </h1>
            </header>

            <p className="mt-6 border-l-2 border-accent pl-4 font-sans text-[16px] leading-[1.7] text-ink-secondary">
              {c.summary}
            </p>

            {c.stack.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {c.stack.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            )}

            <div className="mt-12 flex flex-col gap-12">
              {sections.map(({ key, label, content }) => (
                <SectionRail key={key} label={label} id={`case-${key}`}>
                  <p className="font-sans text-[15.5px] leading-[1.75] text-ink-secondary">{content}</p>
                </SectionRail>
              ))}
            </div>

            <div className="mt-12 border-t border-hairline pt-6">
              <Link
                href={workUrl}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink"
              >
                ← {locale === 'tr' ? 'Projelere dön' : 'Back to Work'}
              </Link>
            </div>
          </article>
        </main>

        <SiteFooter lang={locale} />
      </div>
    </>
  );
}
