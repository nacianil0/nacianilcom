import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Locale } from '@nacianilcom/content-core';
import { loadResume } from '../../../../src/content/loader';
import { fmtRange, fmtDuration } from '../../../../src/lib/dateRange';
import { brandLabel } from '../../../../src/lib/brandLabel';

const VALID_LANGS = new Set(['tr', 'en']);

// A print/source view rendered straight from resume.json.
export const dynamic = 'force-dynamic';

// A print/source view — keep it out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Accent mono section label — replaces the web's left rail to save print width. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 font-mono text-[8.5px] uppercase tracking-[0.24em] text-accent">
      {children}
    </h2>
  );
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

  // Canonical label for the printed CV — never the deploy/preview host.
  const siteLabel = 'nacianil.com';

  return (
    <div className="min-h-screen bg-surface text-ink">
      <main className="mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col bg-surface px-[15mm] py-[11mm]">
        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="border-b-2 border-ink pb-3">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-secondary">
                {role}
                {location ? ` · ${location}` : ''}
              </p>
              <h1 className="mt-1 font-serif text-[26px] font-semibold leading-[1.02] text-ink">
                {resume.basics.name}
                <span className="text-accent">.</span>
              </h1>
              {resume.basics.tagline && (
                <p className="mt-1.5 max-w-[150mm] font-serif text-[11.5px] leading-[1.4] text-ink">
                  {resume.basics.tagline}
                </p>
              )}
            </div>
            {resume.basics.photo && (
              <div className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-lg border border-ink/15 bg-surface-sunk ring-1 ring-hairline">
                <Image
                  src={resume.basics.photo}
                  alt={resume.basics.name}
                  fill
                  sizes="66px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[8.5px] tracking-[0.04em] text-ink-secondary">
            {publicEmail && <span className="text-ink">{publicEmail}</span>}
            {resume.links.map((l) => (
              <span
                key={l.label}
                className="before:mr-3 before:text-hairline before:content-['/']"
              >
                {brandLabel(l.label)} {l.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
            ))}
            <span className="text-ink before:mr-3 before:text-hairline before:content-['/']">
              {siteLabel}
            </span>
          </div>
        </header>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-1 flex-col gap-5">
          {/* Experience */}
          {resume.experience.length > 0 && (
            <section className="break-inside-avoid">
              <SectionLabel>{tr ? 'Deneyim' : 'Experience'}</SectionLabel>
              <div className="flex flex-col gap-4">
                {resume.experience.map((exp) => {
                  const shown = exp.highlights;
                  const dur = fmtDuration(exp.startDate, exp.endDate, locale);
                  return (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-serif text-[13.5px] font-medium leading-tight text-ink">
                          {exp.company}
                          <span className="ml-2 font-sans text-[9px] font-normal text-ink-secondary">
                            {exp.role}
                          </span>
                        </h3>
                        <div className="shrink-0 text-right font-mono uppercase tabular-nums text-ink-secondary">
                          <span className="block text-[8.5px] tracking-[0.12em]">
                            {fmtRange(exp.startDate, exp.endDate, locale)}
                          </span>
                          {dur && (
                            <span className="block text-[7.5px] tracking-[0.1em] text-ink-secondary/70">{dur}</span>
                          )}
                        </div>
                      </div>

                      {exp.description && (
                        <p className="mt-1.5 font-sans text-[10px] leading-[1.4] text-ink-secondary">
                          {exp.description}
                        </p>
                      )}

                      {shown.length > 0 && (
                        <ul className="mt-1.5 flex flex-col gap-0.5">
                          {shown.map((h, j) => (
                            <li
                              key={j}
                              className="flex gap-2 font-sans text-[10px] leading-[1.4] text-ink-secondary"
                            >
                              <span aria-hidden="true" className="mt-[6px] h-px w-2 shrink-0 bg-accent" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {exp.stack.length > 0 && (
                        <p className="mt-1.5 font-mono text-[8px] tracking-[0.02em] text-ink-secondary/75">
                          {exp.stack.join('  ·  ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Earlier Experience */}
          {resume.earlierExperience && resume.earlierExperience.entries.length > 0 && (
            <section className="break-inside-avoid">
              <SectionLabel>{tr ? 'Önceki Deneyimler' : 'Earlier Experience'}</SectionLabel>
              <div className="flex flex-col gap-1.5">
                <p className="font-sans text-[10px] leading-[1.4] text-ink-secondary">
                  {resume.earlierExperience.summary}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                  {resume.earlierExperience.entries.map((entry, idx) => (
                    <div key={idx} className="font-sans text-[9px] text-ink-secondary">
                      <span className="font-medium text-ink">{entry.company}</span> · {entry.role}{' '}
                      <span className="font-mono text-[8px] tracking-[0.02em] text-ink-secondary/80">
                        ({fmtRange(entry.startDate, entry.endDate, locale)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Selected Projects */}
          {resume.projects.length > 0 && (
            <section className="break-inside-avoid">
              <SectionLabel>{tr ? 'Seçili Projeler' : 'Selected Projects'}</SectionLabel>
              <div className="flex flex-col gap-3">
                {resume.projects.map((proj) => (
                  <div key={proj.id} className="break-inside-avoid">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-serif text-[11px] font-medium text-ink">
                        {proj.title}
                      </span>
                      <span className="shrink-0 font-mono text-[8px] tracking-[0.02em] text-ink-secondary/80">
                        {proj.stack.join(' · ')}
                      </span>
                    </div>
                    {proj.summary && (
                      <p className="mt-0.5 font-sans text-[10px] leading-[1.4] text-ink-secondary">
                        {proj.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <section className="break-inside-avoid">
              <SectionLabel>{tr ? 'Yetenekler' : 'Skills'}</SectionLabel>
              <div className="flex flex-col gap-0.5">
                {resume.skills.map((group) => (
                  <div key={group.group} className="grid grid-cols-[34mm_1fr] gap-3">
                    <span className="font-mono text-[8.5px] uppercase leading-[1.45] tracking-[0.1em] text-ink-secondary">
                      {group.group}
                    </span>
                    <span className="font-sans text-[9.5px] leading-[1.45] text-ink-secondary">
                      {group.items.join('  ·  ')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education + Certifications — paired to save vertical space */}
          <section className="grid grid-cols-2 gap-x-8 break-inside-avoid">
            {resume.education.length > 0 && (
              <div>
                <SectionLabel>{tr ? 'Eğitim' : 'Education'}</SectionLabel>
                {resume.education.map((edu) => (
                  <div key={edu.id} className="mb-1">
                    <p className="font-serif text-[11px] font-medium leading-tight text-ink">
                      {edu.institution}
                    </p>
                    <p className="mt-0.5 font-sans text-[9px] leading-[1.4] text-ink-secondary">
                      {edu.degree} · {edu.field}
                      {edu.year ? ` · ${edu.year}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {resume.credentials.length > 0 && (
              <div>
                <SectionLabel>{tr ? 'Sertifikalar' : 'Certifications'}</SectionLabel>
                <ul className="flex flex-col gap-0.5" role="list">
                  {resume.credentials.map((cred) => (
                    <li
                      key={cred.id}
                      className="flex items-baseline justify-between gap-2 font-sans text-[9px] leading-[1.35] text-ink-secondary"
                    >
                      <span className="min-w-0">{cred.title}</span>
                      {cred.year && (
                        <span className="shrink-0 font-mono text-[8px] tabular-nums text-ink-secondary/80">
                          {cred.year}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* ── Footer: live link ────────────────────────────────────── */}
        <footer className="mt-3 flex items-end justify-between gap-4 border-t-2 border-ink pt-2">
          <div className="font-mono text-[8px] uppercase leading-[1.6] tracking-[0.14em] text-ink-secondary">
            <p className="text-[9px] tracking-[0.1em] text-ink">{siteLabel}</p>
            <p>{tr ? 'Güncel CV için siteyi ziyaret edin' : 'Visit the site for the live CV'}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
