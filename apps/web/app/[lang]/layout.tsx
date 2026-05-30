import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildUrl } from '@nacianilcom/content-core';
import type { Locale } from '@nacianilcom/content-core';
import { SITE_URL, SITE_NAME, localeToOgLocale } from '../../src/lib/site';

const VALID_LANGS = new Set(['tr', 'en']);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) return {};

  const locale = lang as Locale;
  const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
  const trHome = `${SITE_URL}${buildUrl('tr', 'home')}`;
  const enHome = `${SITE_URL}${buildUrl('en', 'home')}`;
  const localeHome = locale === 'tr' ? trHome : enHome;

  return {
    alternates: {
      canonical: localeHome,
      languages: {
        tr: trHome,
        en: enHome,
        'x-default': trHome,
      },
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: localeToOgLocale(locale),
      alternateLocale: localeToOgLocale(altLocale),
      url: localeHome,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();
  return <>{children}</>;
}
