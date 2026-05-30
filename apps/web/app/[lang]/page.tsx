import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { Masthead, SectionRail, MonoLabel } from '@nacianilcom/ui';
import {
  loadResume,
  loadPublicSeriesWithArticles,
  loadPublicCases,
} from '../../src/content/loader';
import { SiteNav } from '../../src/components/SiteNav';
import { SiteFooter } from '../../src/components/SiteFooter';
import { ListRow } from '../../src/components/ListRow';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../src/lib/site';

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
  const trUrl = `${SITE_URL}${buildUrl('tr', 'home')}`;
  const enUrl = `${SITE_URL}${buildUrl('en', 'home')}`;
  const canonicalUrl = locale === 'tr' ? trUrl : enUrl;
  const title = 'Naci Anıl Akman — Full Stack Developer';
  const description =
    locale === 'tr'
      ? '.NET ve React ile kurumsal portal ve dashboard sistemleri. Teknik yazılar ve proje case study’leri.'
      : '.NET and React enterprise portal and dashboard systems. Technical writing and project case studies.';

  return {
    title: { absolute: title },
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

export default async function LangHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const now = new Date();

  const [resume, seriesList, cases] = await Promise.all([
    loadResume(locale, 'web'),
    loadPublicSeriesWithArticles(lang, now),
    loadPublicCases(locale),
  ]);

  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'home');

  const name = resume?.basics.name ?? 'Naci Anıl Akman';
  const role = resume?.basics.title ?? 'Full Stack Developer';
  const location = resume?.basics.location;
  const summary = resume?.basics.summary ?? '';

  const writingLabel = locale === 'tr' ? 'Yazılar' : 'Writing';
  const workLabel = locale === 'tr' ? 'Projeler' : 'Work';
  const allLabel = locale === 'tr' ? 'Tümü →' : 'All →';

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteNav lang={locale} altLangUrl={altLangUrl} />

      <Masthead
        crumbs={
          <MonoLabel>
            {role}
            {location ? ` · ${location}` : ''}
          </MonoLabel>
        }
        title={name}
        lead={summary}
      />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-16 sm:px-10 lg:px-14">
        <div className="flex flex-col gap-16">
          {seriesList.length > 0 && (
            <SectionRail
              label={writingLabel}
              id="home-writing"
              aside={
                <Link href={buildUrl(locale, 'seriesList')} className="transition-colors hover:text-ink">
                  {allLabel}
                </Link>
              }
            >
              <ul className="border-t border-hairline" role="list">
                {seriesList.slice(0, 4).map((s, i) => (
                  <ListRow
                    key={s.slug}
                    href={buildUrl(locale, 'seriesLanding', { seriesSlug: s.slug })}
                    index={String(i + 1).padStart(2, '0')}
                    title={s.series.title[locale]}
                    description={s.series.description[locale]}
                    meta={
                      <MonoLabel>
                        {s.articleCount} {locale === 'tr' ? 'yazı' : 'articles'}
                      </MonoLabel>
                    }
                  />
                ))}
              </ul>
            </SectionRail>
          )}

          {cases.length > 0 && (
            <SectionRail
              label={workLabel}
              id="home-work"
              aside={
                <Link href={buildUrl(locale, 'work')} className="transition-colors hover:text-ink">
                  {allLabel}
                </Link>
              }
            >
              <ul className="border-t border-hairline" role="list">
                {cases.slice(0, 4).map((c, i) => (
                  <ListRow
                    key={c.slug}
                    href={buildUrl(locale, 'workCase', { caseSlug: c.slug })}
                    index={String(i + 1).padStart(2, '0')}
                    title={c.title}
                    description={c.summary}
                    meta={<MonoLabel>{locale === 'tr' ? 'Case study →' : 'Case study →'}</MonoLabel>}
                  />
                ))}
              </ul>
            </SectionRail>
          )}
        </div>
      </main>

      <SiteFooter lang={locale} />
    </div>
  );
}
