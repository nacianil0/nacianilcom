export const SITE_URL = 'https://nacianil.com';
export const SITE_NAME = 'nacianil.com';
export const SITE_AUTHOR = 'Anil Akman';
export const SITE_TWITTER = '@nacianil';

export function localeToOgLocale(lang: string): string {
  return lang === 'tr' ? 'tr_TR' : 'en_US';
}
