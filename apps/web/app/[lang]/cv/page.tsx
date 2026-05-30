import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@nacianilcom/content-core';
import { buildUrl } from '@nacianilcom/content-core';
import { Masthead, MonoLabel, SectionRail, SpecRow, Chip } from '@nacianilcom/ui';
import { loadResume } from '../../../src/content/loader';
import { SiteNav } from '../../../src/components/SiteNav';
import { SiteFooter } from '../../../src/components/SiteFooter';
import { Crumbs } from '../../../src/components/Crumbs';
import { fmtRange } from '../../../src/lib/dateRange';
import { pageShellClass, specRowGridClass, specDateColClass, compactRowGridClass } from '../../../src/lib/layout';
import { brandLabel } from '../../../src/lib/brandLabel';
import { credentialAssets, credentialPdfFilename } from '../../../src/lib/credentials';
import { CredentialRow } from '../../../src/components/CredentialRow';
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
  const title = 'CV — Naci Anıl Akman';
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
    email: resume.contact.find((c) => c.key === 'email')?.value,
    url: canonicalUrl,
    sameAs: resume.links.map((l) => l.url).filter(Boolean),
  };
  const breadcrumbLd = breadcrumbJsonLd([
    { name: locale === 'tr' ? 'Ana sayfa' : 'Home', url: `${SITE_URL}${buildUrl(locale, 'home')}` },
    { name: 'CV', url: canonicalUrl },
  ]);

  const publicEmail = resume.contact.find((c) => c.key === 'email')?.value;
  const role = resume.basics.title;
  const location = resume.basics.location;

  const tr = locale === 'tr';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="flex min-h-screen flex-col bg-surface">
        <SiteNav lang={locale} altLangUrl={altLangUrl} />

        <Masthead
          crumbs={<Crumbs items={[{ label: tr ? 'Ana sayfa' : 'Home', href: buildUrl(locale, 'home') }]} />}
          badge="CV"
          aside={
            <Link
              href={buildUrl(locale, 'cvPrint')}
              target="_blank"
              rel="noopener"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-ink"
            >
              {tr ? 'PDF ↓' : 'PDF ↓'}
            </Link>
          }
          lead={resume.basics.summary}
        >
          <div className="mt-5">
            <MonoLabel>
              {role}
              {location ? ` · ${location}` : ''}
            </MonoLabel>
          </div>
        </Masthead>

        <main className={`${pageShellClass} flex-1 py-14`}>
          {/* Profile band — photo + contact left, name right */}
          <div className="grid grid-cols-1 gap-6 border-b border-hairline pb-8 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-8">
            {resume.basics.photo && (
              <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-ink/15 bg-surface-sunk shadow-sm ring-1 ring-hairline sm:mx-0 sm:h-[7.5rem] sm:w-[7.5rem]">
                <Image
                  src={resume.basics.photo}
                  alt={resume.basics.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
              {publicEmail && (
                <a
                  href={`mailto:${publicEmail}`}
                  className="font-mono text-[11px] tracking-[0.04em] text-ink-secondary transition-colors hover:text-accent"
                >
                  {publicEmail}
                </a>
              )}
              {resume.links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {resume.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-hairline bg-surface px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-ink-secondary transition-colors hover:border-ink hover:text-ink"
                    >
                      {brandLabel(l.label)}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <h1 className="text-center font-serif text-[30px] font-semibold leading-[1.05] tracking-[-0.01em] text-ink sm:text-right sm:text-[34px]">
              {resume.basics.name}
              <span className="text-accent">.</span>
            </h1>
          </div>

          <div className="mt-12 flex flex-col gap-16">
            {/* Experience */}
            {resume.experience.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Deneyim' : 'Experience'} id="cv-experience">
                <div className="flex flex-col">
                  {resume.experience.map((exp) => (
                    <div key={exp.id} className={specRowGridClass}>
                      <div className="min-w-0">
                        {exp.logo ? (
                          <div className="mb-2 flex flex-col gap-2">
                            <div className="relative h-8 w-[5.5rem]">
                              <Image
                                src={exp.logo}
                                alt=""
                                fill
                                sizes="88px"
                                className="object-contain object-left"
                              />
                            </div>
                            <h3 className="font-serif text-[19px] font-medium leading-tight text-ink">{exp.company}</h3>
                          </div>
                        ) : (
                          <h3 className="font-serif text-[19px] font-medium leading-tight text-ink">{exp.company}</h3>
                        )}
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{exp.role}</p>
                        <p className="mt-3 font-sans text-[14.5px] leading-[1.7] text-ink-secondary">{exp.description}</p>
                        {exp.highlights.length > 0 && (
                          <ul className="mt-3 flex flex-col gap-2">
                            {exp.highlights.map((h, j) => (
                              <li key={j} className="flex gap-3 font-sans text-[14px] leading-[1.6] text-ink-secondary">
                                <span aria-hidden="true" className="mt-[10px] h-px w-3 shrink-0 bg-accent" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {exp.stack.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {exp.stack.map((s) => (
                              <Chip key={s}>{s}</Chip>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={specDateColClass}>{fmtRange(exp.startDate, exp.endDate, locale)}</span>
                    </div>
                  ))}
                </div>
              </SectionRail>
            )}

            {resume.earlierExperience && resume.earlierExperience.entries.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Önceki Deneyimler' : 'Earlier Experience'} id="cv-earlier">
                {resume.earlierExperience.summary && (
                  <p className="mb-4 max-w-[640px] font-sans text-[13.5px] leading-[1.65] text-ink-secondary">
                    {resume.earlierExperience.summary}
                  </p>
                )}
                <ul className="flex flex-col" role="list">
                  {resume.earlierExperience.entries.map((entry) => (
                    <li key={`${entry.company}-${entry.startDate}`} className={compactRowGridClass}>
                      <div className="min-w-0">
                        <p className="font-sans text-[14px] leading-snug text-ink">{entry.company}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-secondary">
                          {entry.role}
                          {entry.note ? ` · ${entry.note}` : ''}
                        </p>
                      </div>
                      <span className={specDateColClass}>{fmtRange(entry.startDate, entry.endDate, locale)}</span>
                    </li>
                  ))}
                </ul>
              </SectionRail>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Yetenekler' : 'Skills'} id="cv-skills">
                <div>
                  {resume.skills.map((group) => (
                    <SpecRow key={group.group} label={group.group}>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <Chip key={item}>{item}</Chip>
                        ))}
                      </div>
                    </SpecRow>
                  ))}
                </div>
              </SectionRail>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Projeler' : 'Projects'} id="cv-projects">
                <div className="flex flex-col">
                  {resume.projects.map((proj) => {
                    const external = proj.url ? proj.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
                    return (
                      <div key={proj.id} className={specRowGridClass}>
                        <div className="min-w-0">
                          <h3 className="font-serif text-[17px] font-medium leading-tight text-ink">{proj.title}</h3>
                          <p className="mt-2 font-sans text-[14px] leading-[1.6] text-ink-secondary">{proj.summary}</p>
                          {proj.stack.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {proj.stack.map((s) => (
                                <Chip key={s}>{s}</Chip>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`${specDateColClass} flex flex-col items-start gap-1 sm:items-end`}>
                          {proj.caseSlug ? (
                            <Link
                              href={buildUrl(locale, 'workCase', { caseSlug: proj.caseSlug })}
                              className="text-accent transition-opacity hover:opacity-70"
                            >
                              {tr ? 'Detay →' : 'Details →'}
                            </Link>
                          ) : proj.url ? (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="normal-case tracking-normal text-accent transition-opacity hover:opacity-70"
                            >
                              {external} ↗
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionRail>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Eğitim' : 'Education'} id="cv-education">
                <div className="flex flex-col">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className={specRowGridClass}>
                      <div className="min-w-0">
                        <p className="font-serif text-[16px] font-medium leading-tight text-ink">{edu.institution}</p>
                        <p className="mt-0.5 font-sans text-[13.5px] leading-[1.5] text-ink-secondary">
                          {edu.degree} · {edu.field}
                        </p>
                      </div>
                      {edu.year ? <span className={specDateColClass}>{edu.year}</span> : <span aria-hidden="true" />}
                    </div>
                  ))}
                </div>
              </SectionRail>
            )}

            {/* Credentials */}
            {resume.credentials.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Sertifikalar' : 'Certifications'} id="cv-credentials">
                <ul className="flex flex-col" role="list">
                  {resume.credentials.map((cred) => {
                    const assets = credentialAssets(cred);
                    if (assets) {
                      return (
                        <CredentialRow
                          key={cred.id}
                          id={cred.id}
                          title={cred.title}
                          issuer={cred.issuer}
                          {...(cred.year != null ? { year: cred.year } : {})}
                          pdfUrl={assets.pdfUrl}
                          previewUrl={assets.previewUrl}
                          pdfFilename={credentialPdfFilename(cred)}
                          labels={{
                            expand: tr ? 'Belgeyi göster' : 'Show document',
                            collapse: tr ? 'Belgeyi gizle' : 'Hide document',
                            download: tr ? 'PDF indir' : 'Download PDF',
                            previewAlt: cred.title,
                          }}
                        />
                      );
                    }
                    return (
                      <li key={cred.id} className={specRowGridClass}>
                        <div className="min-w-0">
                          <p className="font-sans text-[14.5px] leading-snug text-ink">{cred.title}</p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-secondary">
                            {cred.issuer}
                          </p>
                        </div>
                        {cred.year ? <span className={specDateColClass}>{cred.year}</span> : <span aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ul>
              </SectionRail>
            )}
          </div>
        </main>

        <SiteFooter lang={locale} />
      </div>
    </>
  );
}
