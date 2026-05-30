import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { Masthead, MonoLabel } from '@nacianilcom/ui';
import { loadResume } from '../../../src/content/loader';
import { SiteNav } from '../../../src/components/SiteNav';
import { SiteFooter } from '../../../src/components/SiteFooter';
import { Crumbs } from '../../../src/components/Crumbs';
import { ListRow } from '../../../src/components/ListRow';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../../src/lib/site';
import { personJsonLd, breadcrumbJsonLd } from '../../../src/lib/jsonld';

const VALID_LANGS = new Set(['tr', 'en']);

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) return {};
  const locale = lang as Locale;
  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
  const trUrl = `${SITE_URL}${buildUrl('tr', 'work')}`;
  const enUrl = `${SITE_URL}${buildUrl('en', 'work')}`;
  const canonicalUrl = locale === 'tr' ? trUrl : enUrl;
  const title = locale === 'tr' ? 'Projeler — Naci Anıl Akman' : 'Work — Naci Anıl Akman';
  const description =
    locale === 'tr'
      ? 'Kurumsal portal, seyahat, avans ve müşteri ürünlerinde seçili projeler.'
      : 'Selected projects across enterprise portals, travel, advance workflows, and client products.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { tr: trUrl, en: enUrl, 'x-default': trUrl },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: localeToOgLocale(locale),
      alternateLocale: localeToOgLocale(altLocale),
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const resume = await loadResume(locale, 'web');
  if (!resume) notFound();
  const projects = resume.projects;
  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'work');

  const canonicalUrl = `${SITE_URL}${buildUrl(locale, 'work')}`;

  const personLd = personJsonLd();
  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Ana sayfa' : 'Home', url: `${SITE_URL}${buildUrl(locale, 'home')}` },
    { name: locale === 'tr' ? 'Projeler' : 'Work', url: canonicalUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="flex min-h-screen flex-col bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <Masthead
          crumbs={<Crumbs items={[{ label: locale === 'tr' ? 'Ana sayfa' : 'Home', href: buildUrl(locale, 'home') }]} />}
          aside={
            <MonoLabel>
              {projects.length} {locale === 'tr' ? 'proje' : 'projects'}
            </MonoLabel>
          }
          title={locale === 'tr' ? 'Projeler' : 'Work'}
          lead={
            locale === 'tr'
              ? 'Holding içi kurumsal sistemlerden müşteri ürünlerine — seçili projeler ve vaka çalışmaları.'
              : 'From in-house enterprise systems to client products — selected projects and case studies.'
          }
        />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-14 sm:px-10 lg:px-14">
          {projects.length === 0 ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              {locale === 'tr' ? 'Henüz yayınlanmış proje yok.' : 'No published projects yet.'}
            </p>
          ) : (
            <ul className="border-t border-hairline" role="list">
              {projects.map((proj, i) => {
                const externalUrl = proj.url;
                const caseHref = proj.caseSlug
                  ? buildUrl(locale, 'workCase', { caseSlug: proj.caseSlug })
                  : null;
                const href = caseHref ?? externalUrl;
                if (!href) return null;

                const externalLabel = externalUrl
                  ? externalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
                  : null;

                return (
                  <ListRow
                    key={proj.id}
                    href={href}
                    external={Boolean(!caseHref && externalUrl)}
                    index={String(i + 1).padStart(2, '0')}
                    title={proj.title}
                    description={proj.summary}
                    meta={
                      caseHref ? (
                        <MonoLabel>{locale === 'tr' ? 'Vaka çalışması →' : 'Case study →'}</MonoLabel>
                      ) : externalLabel ? (
                        <MonoLabel>{externalLabel} ↗</MonoLabel>
                      ) : null
                    }
                  />
                );
              })}
            </ul>
          )}
        </main>

        <SiteFooter lang={locale} />
      </div>
    </>
  );
}
