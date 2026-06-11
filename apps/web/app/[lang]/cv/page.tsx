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
import { fmtRange, fmtDuration, fmtTotalExperience } from '../../../src/lib/dateRange';
import { pageShellClass, specRowGridClass, specDateColClass, compactRowGridClass } from '../../../src/lib/layout';
import { brandLabel } from '../../../src/lib/brandLabel';
import { resumeDocumentAssets, resumeDocumentPdfFilename } from '../../../src/lib/credentials';
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
      ? 'Full Stack Developer. .NET ve React ile kurumsal portal/dashboard sistemleri ve ürünleşebilir web uygulamaları; uçtan uca ürün sahipliği.'
      : 'Full Stack Developer. Enterprise portal/dashboard systems and productizable web apps with .NET and React; end-to-end product ownership.';

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
  const publicPhone = resume.contact.find((c) => c.key === 'phone' && c.visibility === 'public')?.value;
  const role = resume.basics.title;
  const location = resume.basics.location;
  const currentCompany = resume.experience[0]?.company;
  const totalExperience = fmtTotalExperience(
    [
      ...resume.experience.map((e) => ({ startDate: e.startDate, endDate: e.endDate })),
      ...(resume.earlierExperience?.entries ?? []).map((e) => ({ startDate: e.startDate, endDate: e.endDate })),
    ],
    locale,
  );

  const tr = locale === 'tr';

  const actionClass =
    'inline-flex items-center gap-1.5 border border-hairline bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-secondary transition-colors hover:border-ink hover:text-ink';
  const contactClass =
    'inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.04em] text-ink-secondary transition-colors hover:text-accent';

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
          className="pb-10 sm:pb-12"
        >
          <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-9 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-12">
            <div className="min-w-0">
              <MonoLabel>
                {role}
                {location ? ` · ${location}` : ''}
              </MonoLabel>
              <h1 className="mt-3 font-serif text-[33px] font-semibold leading-[1.03] tracking-[-0.01em] text-ink sm:text-[44px]">
                {resume.basics.name}
                <span className="text-accent">.</span>
              </h1>
              {resume.basics.tagline && (
                <p className="mt-4 max-w-[660px] font-serif text-[18px] leading-[1.4] text-ink sm:text-[20px]">
                  {resume.basics.tagline}
                </p>
              )}
              <p className="mt-4 max-w-[620px] font-sans text-[14.5px] leading-[1.75] text-ink-secondary">
                {resume.basics.summary}
              </p>

              {resume.basics.primaryStack && resume.basics.primaryStack.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {resume.basics.primaryStack.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <a href={`/Naci_Anil_Akman_CV_${locale.toUpperCase()}.pdf`} download target="_blank" rel="noopener noreferrer" className={actionClass}>
                  {tr ? 'PDF indir' : 'Download PDF'}
                  <span aria-hidden="true">↓</span>
                </a>
                <Link href={buildUrl(locale, 'work')} className={actionClass}>
                  {tr ? 'Projeler' : 'Selected work'}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {publicEmail && (
                  <a href={`mailto:${publicEmail}`} className={contactClass}>
                    {publicEmail}
                  </a>
                )}
                {publicPhone && (
                  <a href={`tel:${publicPhone.replace(/\s/g, '')}`} className={contactClass}>
                    {publicPhone}
                  </a>
                )}
                {resume.links.map((l) => (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className={contactClass}>
                    {brandLabel(l.label)}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>

            {(resume.basics.photo || currentCompany || totalExperience) && (
              <div className="flex shrink-0 flex-row items-start gap-6 sm:flex-col sm:items-end sm:gap-5">
                {resume.basics.photo && (
                  <div className="relative h-[7.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-surface-sunk shadow-[0_1px_3px_rgba(27,26,24,0.07)] ring-1 ring-hairline sm:h-[8.75rem] sm:w-[8.75rem]">
                    <Image
                      src={resume.basics.photo}
                      alt={resume.basics.name}
                      fill
                      sizes="140px"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                {(currentCompany || totalExperience) && (
                  <dl className="flex flex-col divide-y divide-hairline border-t border-hairline text-left sm:w-[8.75rem] sm:text-right">
                    {currentCompany && (
                      <div className="py-2.5">
                        <dt>
                          <MonoLabel>{tr ? 'Şu an' : 'Currently'}</MonoLabel>
                        </dt>
                        <dd className="mt-1 font-serif text-[14.5px] leading-[1.25] text-ink">{currentCompany}</dd>
                      </div>
                    )}
                    {totalExperience && (
                      <div className="py-2.5">
                        <dt>
                          <MonoLabel>{tr ? 'Deneyim' : 'Experience'}</MonoLabel>
                        </dt>
                        <dd className="mt-1 font-serif text-[14.5px] leading-[1.25] text-ink">{totalExperience}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            )}
          </div>
        </Masthead>

        <main className={`${pageShellClass} flex-1 py-12 sm:py-14`}>
          <div className="flex flex-col gap-14">
            {/* Experience */}
            {resume.experience.length > 0 && (
              <SectionRail
                dividerTop
                label={tr ? 'Deneyim' : 'Experience'}
                id="cv-experience"
                aside={String(resume.experience.length).padStart(2, '0')}
              >
                <div className="flex flex-col">
                  {resume.experience.map((exp) => {
                    const dur = fmtDuration(exp.startDate, exp.endDate, locale);
                    return (
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
                      <div className={specDateColClass}>
                        <span className="block">{fmtRange(exp.startDate, exp.endDate, locale)}</span>
                        {dur && <span className="mt-1 block text-ink-secondary/60">{dur}</span>}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </SectionRail>
            )}

            {/* Selected Projects — promoted above skills for visibility */}
            {resume.projects.length > 0 && (
              <SectionRail
                dividerTop
                label={tr ? 'Seçili Projeler' : 'Selected Projects'}
                id="cv-projects"
                aside={String(resume.projects.length).padStart(2, '0')}
              >
                <div className="flex flex-col">
                  {resume.projects.map((proj) => {
                    const external = proj.url ? proj.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
                    return (
                      <div key={proj.id} className={specRowGridClass}>
                        <div className="min-w-0">
                          <h3 className="font-serif text-[18px] font-medium leading-tight text-ink">{proj.title}</h3>
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
                              className="group/link inline-flex items-center gap-1 text-accent transition-colors hover:text-ink"
                            >
                              <span>{tr ? 'Vaka çalışması' : 'Case study'}</span>
                              <span aria-hidden="true" className="transition-transform duration-200 group-hover/link:translate-x-0.5">
                                →
                              </span>
                            </Link>
                          ) : proj.url ? (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link inline-flex items-center gap-1 normal-case tracking-normal text-accent transition-colors hover:text-ink"
                            >
                              <span>{external}</span>
                              <span aria-hidden="true" className="transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                                ↗
                              </span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
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

            {resume.earlierExperience && resume.earlierExperience.entries.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Önceki Deneyimler' : 'Earlier Experience'} id="cv-earlier">
                {resume.earlierExperience.summary && (
                  <p className="mb-4 max-w-[640px] font-sans text-[13.5px] leading-[1.65] text-ink-secondary">
                    {resume.earlierExperience.summary}
                  </p>
                )}
                <ul className="flex flex-col" role="list">
                  {resume.earlierExperience.entries.map((entry) => {
                    const dur = fmtDuration(entry.startDate, entry.endDate, locale);
                    return (
                    <li key={`${entry.company}-${entry.startDate}`} className={compactRowGridClass}>
                      <div className="min-w-0">
                        <p className="font-sans text-[14px] leading-snug text-ink">{entry.company}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-secondary">
                          {entry.role}
                          {entry.note ? ` · ${entry.note}` : ''}
                        </p>
                      </div>
                      <div className={specDateColClass}>
                        <span className="block">{fmtRange(entry.startDate, entry.endDate, locale)}</span>
                        {dur && <span className="mt-0.5 block text-ink-secondary/60">{dur}</span>}
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </SectionRail>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Eğitim' : 'Education'} id="cv-education">
                <ul className="flex flex-col" role="list">
                  {resume.education.map((edu) => {
                    const assets = resumeDocumentAssets(edu);
                    const docLabels = {
                      expand: tr ? 'Belgeyi göster' : 'Show document',
                      collapse: tr ? 'Belgeyi gizle' : 'Hide document',
                      download: tr ? 'PDF indir' : 'Download PDF',
                      previewAlt: edu.institution,
                    };
                    if (assets) {
                      return (
                        <CredentialRow
                          key={edu.id}
                          id={edu.id}
                          title={edu.institution}
                          issuer={`${edu.degree} · ${edu.field}`}
                          variant="education"
                          {...(edu.year != null ? { year: edu.year } : {})}
                          pdfUrl={assets.pdfUrl}
                          previewUrl={assets.previewUrl}
                          pdfFilename={resumeDocumentPdfFilename(edu.institution)}
                          labels={docLabels}
                        />
                      );
                    }
                    return (
                      <li key={edu.id} className={specRowGridClass}>
                        <div className="min-w-0">
                          <p className="font-serif text-[16px] font-medium leading-tight text-ink">{edu.institution}</p>
                          <p className="mt-0.5 font-sans text-[13.5px] leading-[1.5] text-ink-secondary">
                            {edu.degree} · {edu.field}
                          </p>
                        </div>
                        {edu.year ? <span className={specDateColClass}>{edu.year}</span> : <span aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ul>
              </SectionRail>
            )}

            {/* Credentials */}
            {resume.credentials.length > 0 && (
              <SectionRail dividerTop label={tr ? 'Sertifikalar' : 'Certifications'} id="cv-credentials">
                <ul className="flex flex-col" role="list">
                  {resume.credentials.map((cred) => {
                    const assets = resumeDocumentAssets(cred);
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
                          pdfFilename={resumeDocumentPdfFilename(cred.title)}
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
