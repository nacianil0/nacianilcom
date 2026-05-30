import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Locale } from '@nacianilcom/content-core';
import { SectionRail, SpecRow, Chip } from '@nacianilcom/ui';
import { loadResume } from '../../../../src/content/loader';
import { fmtRange } from '../../../../src/lib/dateRange';
import { brandLabel } from '../../../../src/lib/brandLabel';
import { compactRowGridClass, specDateColClass } from '../../../../src/lib/layout';

const VALID_LANGS = new Set(['tr', 'en']);

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }];
}

export default async function CvPrintPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const locale = lang as Locale;
  const resume = await loadResume(locale, 'pdf');
  if (!resume) notFound();

  const tr = locale === 'tr';
  const publicEmail = resume.contact.find((c) => c.key === 'email')?.value;
  const role = resume.basics.title;
  const location = resume.basics.location;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <main className="mx-auto w-full max-w-[820px] px-[16mm] py-[14mm]">
        {/* Header */}
        <header className="border-b-2 border-ink pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary">
                {role}
                {location ? ` · ${location}` : ''}
              </p>
              <h1 className="mt-1.5 font-serif text-[30px] font-semibold leading-[1.05] text-ink">
                {resume.basics.name}
                <span className="text-accent">.</span>
              </h1>
            </div>
            {resume.basics.photo && (
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg border border-ink/15 bg-surface-sunk ring-1 ring-hairline">
                <Image src={resume.basics.photo} alt={resume.basics.name} fill sizes="76px" className="object-cover" priority />
              </div>
            )}
          </div>

          <p className="mt-4 max-w-[600px] font-sans text-[12.5px] leading-[1.7] text-ink-secondary">
            {resume.basics.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.03em] text-ink-secondary">
            {publicEmail && <span>{publicEmail}</span>}
            {resume.links.map((l) => (
              <span key={l.label}>
                {brandLabel(l.label)}: {l.url.replace(/^https?:\/\//, '')}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-8">
          {/* Experience */}
          {resume.experience.length > 0 && (
            <SectionRail label={tr ? 'Deneyim' : 'Experience'} id="print-experience">
              <div className="flex flex-col">
                {resume.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="break-inside-avoid border-b border-hairline py-4 first:pt-0 last:border-b-0"
                  >
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                      {exp.logo ? (
                        <div className="min-w-0">
                          <div className="relative mb-1.5 h-6 w-[4.5rem]">
                            <Image src={exp.logo} alt="" fill sizes="72px" className="object-contain object-left" />
                          </div>
                          <h3 className="font-serif text-[16px] font-medium text-ink">{exp.company}</h3>
                        </div>
                      ) : (
                        <h3 className="font-serif text-[16px] font-medium text-ink">{exp.company}</h3>
                      )}
                      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] tabular-nums text-ink-secondary">
                        {fmtRange(exp.startDate, exp.endDate, locale)}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent">
                      {exp.role}
                    </p>
                    <p className="mt-2 font-sans text-[12px] leading-[1.6] text-ink-secondary">{exp.description}</p>
                    {exp.highlights.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="flex gap-2.5 font-sans text-[11.5px] leading-[1.55] text-ink-secondary">
                            <span aria-hidden="true" className="mt-[8px] h-px w-2.5 shrink-0 bg-accent" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.stack.length > 0 && (
                      <p className="mt-2 font-mono text-[10px] tracking-[0.02em] text-ink-secondary/80">
                        {exp.stack.join('  ·  ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              </SectionRail>
            )}

          {resume.earlierExperience && resume.earlierExperience.entries.length > 0 && (
            <SectionRail label={tr ? 'Önceki Deneyimler' : 'Earlier Experience'} id="print-earlier">
              {resume.earlierExperience.summary && (
                <p className="mb-3 font-sans text-[11.5px] leading-[1.6] text-ink-secondary">
                  {resume.earlierExperience.summary}
                </p>
              )}
              <ul className="flex flex-col" role="list">
                {resume.earlierExperience.entries.map((entry) => (
                  <li key={`${entry.company}-${entry.startDate}`} className={compactRowGridClass}>
                    <div className="min-w-0">
                      <p className="font-sans text-[12px] leading-snug text-ink">{entry.company}</p>
                      <p className="mt-0.5 font-mono text-[9.5px] tracking-[0.12em] text-ink-secondary">
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
            <SectionRail label={tr ? 'Yetenekler' : 'Skills'} id="print-skills">
              <div className="break-inside-avoid">
                {resume.skills.map((group) => (
                  <SpecRow key={group.group} label={group.group}>
                    <p className="font-sans text-[12px] leading-[1.6] text-ink-secondary">{group.items.join('  ·  ')}</p>
                  </SpecRow>
                ))}
              </div>
            </SectionRail>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <SectionRail label={tr ? 'Projeler' : 'Projects'} id="print-projects">
              <div className="flex flex-col">
                {resume.projects.map((proj) => (
                  <div key={proj.id} className="break-inside-avoid border-b border-hairline py-3 first:pt-0 last:border-b-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-[14px] font-medium text-ink">{proj.title}</h3>
                      {proj.url && (
                        <span className="shrink-0 font-mono text-[10px] tracking-[0.02em] text-ink-secondary">
                          {proj.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-sans text-[11.5px] leading-[1.55] text-ink-secondary">{proj.summary}</p>
                  </div>
                ))}
              </div>
            </SectionRail>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <SectionRail label={tr ? 'Eğitim' : 'Education'} id="print-education">
              <div className="break-inside-avoid">
                {resume.education.map((edu) => (
                  <SpecRow key={edu.id} label={edu.year ? String(edu.year) : tr ? 'Eğitim' : 'Education'}>
                    <p className="font-serif text-[14px] font-medium text-ink">{edu.institution}</p>
                    <p className="mt-0.5 font-sans text-[11.5px] leading-[1.5] text-ink-secondary">
                      {edu.degree} · {edu.field}
                    </p>
                  </SpecRow>
                ))}
              </div>
            </SectionRail>
          )}

          {/* Credentials */}
          {resume.credentials.length > 0 && (
            <SectionRail label={tr ? 'Sertifikalar' : 'Certifications'} id="print-credentials">
              <ul className="break-inside-avoid flex flex-col" role="list">
                {resume.credentials.map((cred) => (
                  <li
                    key={cred.id}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-hairline py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <span className="font-sans text-[12px] text-ink">{cred.title}</span>
                      <span className="ml-2 font-sans text-[11px] text-ink-secondary">{cred.issuer}</span>
                    </div>
                    {cred.year && (
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-secondary">{cred.year}</span>
                    )}
                  </li>
                ))}
              </ul>
            </SectionRail>
          )}
        </div>
      </main>
    </div>
  );
}
