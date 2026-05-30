import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { loadResume } from '../../../src/content/loader';
import { SiteNav } from '../../../src/components/SiteNav';
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
  const trUrl = `${SITE_URL}${buildUrl('tr', 'cv')}`;
  const enUrl = `${SITE_URL}${buildUrl('en', 'cv')}`;
  const canonicalUrl = locale === 'tr' ? trUrl : enUrl;
  const title = locale === 'tr' ? 'CV — Naci Anil Akman' : 'CV — Naci Anil Akman';
  const description =
    locale === 'tr'
      ? 'Full Stack Developer. .NET, React ve kurumsal portal/dashboard uzmanlığı.'
      : 'Full Stack Developer. .NET, React and enterprise portal/dashboard expertise.';

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

export default async function CvPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const resume = await loadResume(locale, 'web');
  if (!resume) notFound();

  const altLangUrl = buildUrl(locale === 'tr' ? 'en' : 'tr', 'cv');
  const canonicalUrl = `${SITE_URL}${buildUrl(locale, 'cv')}`;

  const personLd = {
    ...personJsonLd(),
    jobTitle: resume.basics.title,
    description: resume.basics.summary,
    email: resume.contact.find(c => c.key === 'email')?.value,
    url: canonicalUrl,
    sameAs: resume.links.map(l => l.url).filter(Boolean),
  };

  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Ana sayfa' : 'Home', url: `${SITE_URL}${buildUrl(locale, 'home')}` },
    { name: 'CV', url: canonicalUrl },
  ]);

  const publicEmail = resume.contact.find(c => c.key === 'email');
  const hasPublicContact = !!publicEmail?.value;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <main className="mx-auto max-w-[720px] px-6 py-16">
          {/* ── Profile header ── */}
          <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-start">
            {resume.basics.photo && (
              <div className="flex-shrink-0">
                <Image
                  src={resume.basics.photo}
                  alt={resume.basics.name}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
            )}
            <div className="flex-1">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
                nacianil.com
              </p>
              <h1 className="font-serif text-[2.125rem] font-semibold leading-[1.15] text-ink">
                {resume.basics.name}
              </h1>
              <p className="mt-1 font-sans text-base text-ink-secondary">{resume.basics.title}</p>
              <p className="mt-3 font-sans text-sm leading-[1.75] text-ink-secondary">
                {resume.basics.summary}
              </p>

              {/* Contact + links */}
              {hasPublicContact && (
                <p className="mt-3 font-sans text-xs text-ink-secondary/60">
                  {publicEmail!.value}
                </p>
              )}
              {resume.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {resume.links.map(l => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs font-medium text-accent hover:underline"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* ── Experience ── */}
          {resume.experience.length > 0 && (
            <section aria-labelledby="exp-heading" className="mb-10">
              <h2 id="exp-heading" className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
                {locale === 'tr' ? 'Deneyim' : 'Experience'}
              </h2>
              <div className="space-y-6">
                {resume.experience.map(exp => (
                  <article key={exp.id} className="border-l-2 border-hairline pl-5">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="font-sans text-[0.9375rem] font-semibold text-ink">{exp.company}</h3>
                      <span className="font-sans text-xs text-ink-secondary/60">
                        {exp.startDate} — {exp.endDate ?? (locale === 'tr' ? 'Halen' : 'Present')}
                        {exp.needsReview && (
                          <span className="ml-2 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700">
                            review
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="font-sans text-xs font-medium text-ink-secondary">{exp.role}</p>
                    <p className="mt-2 font-sans text-sm leading-[1.7] text-ink-secondary">
                      {exp.description}
                    </p>
                    {exp.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 font-sans text-sm leading-[1.6] text-ink-secondary">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.stack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {exp.stack.map(s => (
                          <span key={s} className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] text-ink-secondary/60">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── Skills ── */}
          {resume.skills.length > 0 && (
            <section aria-labelledby="skills-heading" className="mb-10">
              <h2 id="skills-heading" className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
                {locale === 'tr' ? 'Yetenekler' : 'Skills'}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {resume.skills.map(group => (
                  <div key={group.group}>
                    <p className="mb-2 font-sans text-xs font-semibold text-ink-secondary">{group.group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map(item => (
                        <span key={item} className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] text-ink-secondary/60">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Projects ── */}
          {resume.projects.length > 0 && (
            <section aria-labelledby="projects-heading" className="mb-10">
              <h2 id="projects-heading" className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
                {locale === 'tr' ? 'Projeler' : 'Projects'}
              </h2>
              <div className="space-y-4">
                {resume.projects.map(proj => (
                  <div key={proj.id} className="rounded-card border border-hairline bg-card px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-sans text-sm font-semibold text-ink">{proj.title}</h3>
                      {proj.caseSlug && (
                        <Link
                          href={buildUrl(locale, 'workCase', { caseSlug: proj.caseSlug })}
                          className="flex-shrink-0 font-sans text-xs font-medium text-accent hover:underline"
                        >
                          {locale === 'tr' ? 'Detay →' : 'Details →'}
                        </Link>
                      )}
                    </div>
                    <p className="mt-1 font-sans text-xs leading-[1.6] text-ink-secondary">{proj.summary}</p>
                    {proj.stack.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {proj.stack.map(s => (
                          <span key={s} className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] text-ink-secondary/60">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Education ── */}
          {resume.education.length > 0 && (
            <section aria-labelledby="edu-heading" className="mb-10">
              <h2 id="edu-heading" className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
                {locale === 'tr' ? 'Eğitim' : 'Education'}
              </h2>
              <div className="space-y-3">
                {resume.education.map(edu => (
                  <div key={edu.id} className="border-l-2 border-hairline pl-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-sans text-sm font-semibold text-ink">{edu.institution}</h3>
                      {edu.year && (
                        <span className="font-sans text-xs text-ink-secondary/60">{edu.year}</span>
                      )}
                      {edu.needsReview && (
                        <span className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px] font-medium text-amber-700">
                          review
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-ink-secondary">
                      {edu.degree} — {edu.field}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Credentials ── */}
          {resume.credentials.length > 0 && (
            <section aria-labelledby="cred-heading" className="mb-10">
              <h2 id="cred-heading" className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
                {locale === 'tr' ? 'Sertifikalar & Belgeler' : 'Certifications & Credentials'}
              </h2>
              <ul className="space-y-2">
                {resume.credentials.map(cred => (
                  <li key={cred.id} className="flex items-baseline gap-3 font-sans text-sm text-ink-secondary">
                    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-accent mt-2" aria-hidden="true" />
                    <span>
                      <span className="font-medium text-ink">{cred.title}</span>
                      {' — '}
                      <span className="text-ink-secondary/60">{cred.issuer}</span>
                      {cred.year && <span className="ml-2 text-ink-secondary/60">{cred.year}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Print link ── */}
          <div className="mt-8 border-t border-hairline pt-6">
            <Link
              href={buildUrl(locale, 'cvPrint')}
              className="font-sans text-sm text-ink-secondary transition-colors hover:text-ink"
              target="_blank"
              rel="noopener"
            >
              {locale === 'tr' ? 'PDF için baskı görünümü →' : 'Print view for PDF →'}
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
