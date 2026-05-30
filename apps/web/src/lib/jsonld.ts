import { SITE_URL, SITE_NAME, SITE_AUTHOR } from './site';
import type { Locale } from '@nacianilcom/content-core';

const INLANG: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US' };

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    author: personRef(),
  };
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    ...personRef(),
  };
}

function personRef() {
  return { '@type': 'Person', name: SITE_AUTHOR, url: SITE_URL };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleJsonLdOptions {
  schemaType: 'Article' | 'BlogPosting' | 'TechArticle';
  title: string;
  description: string;
  url: string;
  publishDate: string;
  updatedDate?: string;
  lang: Locale;
  tags: string[];
  seriesTitle: string;
  seriesUrl: string;
}

export function articleJsonLd(o: ArticleJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': o.schemaType,
    headline: o.title,
    description: o.description,
    url: o.url,
    datePublished: o.publishDate,
    dateModified: o.updatedDate ?? o.publishDate,
    inLanguage: INLANG[o.lang],
    author: personRef(),
    publisher: personRef(),
    isPartOf: { '@type': 'CollectionPage', name: o.seriesTitle, url: o.seriesUrl },
    keywords: o.tags.join(', '),
  };
}

export interface SeriesJsonLdOptions {
  title: string;
  description: string;
  url: string;
  lang: Locale;
  articleUrls: string[];
}

export function seriesJsonLd(o: SeriesJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: o.title,
    description: o.description,
    url: o.url,
    inLanguage: INLANG[o.lang],
    hasPart: o.articleUrls.map(url => ({ '@type': 'Article', url })),
    author: personRef(),
  };
}

export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}
