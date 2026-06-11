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

// Print-only highlight caps — keep the most-recent role rich, trim older ones so the
// CV body lands on a single A4. The web /cv view always shows every highlight.
const HIGHLIGHT_CAP = [3, 2, 1];
const HIGHLIGHT_CAP_FALLBACK = 2;

const SCREENSHOTS = [
  { src: '/screenshots/dashboard-login-cropped.png', key: 'login', alt: 'Eroğlu Portal — Login' },
  { src: '/screenshots/dashboard-cropped.png', key: 'dashboard', alt: 'Eroğlu Portal — Dashboard' },
  { src: '/screenshots/travel-yeni-cropped.png', key: 'travel', alt: 'Travel Management' },
] as const;

/** Accent mono section label with a hairline rail — echoes the web SectionRail. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-3">
      <h2 className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.24em] text-accent">
        {children}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
    </div>
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
  const publicPhone = resume.contact.find((c) => c.key === 'phone' && c.visibility === 'public')?.value;
  const role = resume.basics.title;
  const location = resume.basics.location;
  const year = new Date().getFullYear();

  const screenshotLabels: Record<string, string> = {
    login: 'Eroğlu Portal — Login',
    dashboard: 'Eroğlu Portal — Dashboard',
    travel: tr ? 'Seyahat Yönetimi' : 'Travel Management',
  };

  return (
    <div className="bg-surface text-ink">
      {/* ════════ PAGE 1 — Curriculum vitae ════════ */}
      <main className="mx-auto flex min-h-[296mm] w-full max-w-[210mm] flex-col bg-surface px-[15mm] pb-[12mm] pt-[13mm]">
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="flex items-end justify-between gap-6 border-b-[1.5px] border-ink pb-3.5">
          <div className="min-w-0">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink-secondary">
              {role}
              {location && <span className="mx-1.5 text-hairline">/</span>}
              {location}
            </p>
            <h1 className="mt-1 font-serif text-[27px] font-semibold leading-[1.0] tracking-[-0.01em] text-ink">
              {resume.basics.name}
              <span className="text-accent">.</span>
            </h1>
            {resume.basics.tagline && (
              <p className="mt-1.5 max-w-[148mm] font-serif text-[11px] leading-[1.4] text-ink-secondary">
                {resume.basics.tagline}
              </p>
            )}
          </div>
          {resume.basics.photo && (
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[6px] border border-ink/15 bg-surface-sunk ring-1 ring-hairline">
              <Image
                src={resume.basics.photo}
                alt={resume.basics.name}
                fill
                sizes="72px"
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Contact strip */}
        <div className="mt-2.5 flex flex-wrap items-center gap-y-1 font-mono text-[8.5px] tracking-[0.04em]">
          {publicEmail && <span className="text-ink">{publicEmail}</span>}
          {publicPhone && (
            <span className="text-ink before:mx-2.5 before:text-hairline before:content-['/']">
              {publicPhone}
            </span>
          )}
          {resume.links.map((l) => (
            <span key={l.label} className="before:mx-2.5 before:text-hairline before:content-['/']">
              <span className="text-ink-secondary/70">{brandLabel(l.label)}</span>{' '}
              <span className="text-ink">{l.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </span>
          ))}
        </div>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="mt-[13px] flex flex-1 flex-col gap-[11px]">
          {/* Experience */}
          {resume.experience.length > 0 && (
            <section>
              <SectionLabel>{tr ? 'Deneyim' : 'Experience'}</SectionLabel>
              <div className="flex flex-col gap-3">
                {resume.experience.map((exp, i) => {
                  const cap = HIGHLIGHT_CAP[i] ?? HIGHLIGHT_CAP_FALLBACK;
                  const shown = exp.highlights.slice(0, cap);
                  const dur = fmtDuration(exp.startDate, exp.endDate, locale);
                  return (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-serif text-[13px] font-medium leading-tight text-ink">
                          {exp.company}
                          <span className="ml-2 font-mono text-[8px] font-normal uppercase tracking-[0.14em] text-accent">
                            {exp.role}
                          </span>
                        </h3>
                        <div className="shrink-0 text-right font-mono uppercase tabular-nums text-ink-secondary">
                          <span className="block text-[8.5px] tracking-[0.1em]">
                            {fmtRange(exp.startDate, exp.endDate, locale)}
                          </span>
                          {dur && (
                            <span className="block text-[7px] tracking-[0.08em] text-ink-secondary/65">{dur}</span>
                          )}
                        </div>
                      </div>

                      {exp.description && i === 0 && (
                        <p className="mt-1 font-sans text-[9.5px] leading-[1.45] text-ink-secondary">
                          {exp.description}
                        </p>
                      )}

                      {shown.length > 0 && (
                        <ul className="mt-1.5 flex flex-col gap-1">
                          {shown.map((h, j) => (
                            <li
                              key={j}
                              className="flex gap-2 font-sans text-[9.5px] leading-[1.4] text-ink-secondary"
                            >
                              <span aria-hidden="true" className="mt-[5.5px] h-px w-2 shrink-0 bg-accent" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {exp.stack.length > 0 && (
                        <p className="mt-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-ink-secondary/70">
                          {exp.stack.join('  ·  ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Selected Projects — two columns to bank vertical space */}
          {resume.projects.length > 0 && (
            <section className="break-inside-avoid">
              <SectionLabel>{tr ? 'Seçili Projeler' : 'Selected Projects'}</SectionLabel>
              <div className="grid grid-cols-2 gap-x-7 gap-y-2">
                {resume.projects.map((proj) => (
                  <div key={proj.id} className="break-inside-avoid">
                    <h3 className="font-serif text-[10.5px] font-medium leading-tight text-ink">
                      {proj.title}
                    </h3>
                    {proj.summary && (
                      <p className="mt-0.5 line-clamp-2 font-sans text-[8.5px] leading-[1.4] text-ink-secondary">
                        {proj.summary}
                      </p>
                    )}
                    {proj.stack.length > 0 && (
                      <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.06em] text-ink-secondary/65">
                        {proj.stack.slice(0, 6).join('  ·  ')}
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
                  <div key={group.group} className="grid grid-cols-[32mm_1fr] gap-3">
                    <span className="font-mono text-[8px] uppercase leading-[1.5] tracking-[0.1em] text-ink/80">
                      {group.group}
                    </span>
                    <span className="font-sans text-[9px] leading-[1.45] text-ink-secondary">
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
                    <p className="font-serif text-[10.5px] font-medium leading-tight text-ink">
                      {edu.institution}
                    </p>
                    <p className="mt-0.5 font-sans text-[8.5px] leading-[1.4] text-ink-secondary">
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
                      className="flex items-baseline justify-between gap-2 font-sans text-[8.5px] leading-[1.35] text-ink-secondary"
                    >
                      <span className="min-w-0">{cred.title}</span>
                      {cred.year && (
                        <span className="shrink-0 font-mono text-[7.5px] tabular-nums text-ink-secondary/70">
                          {cred.year}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Earlier Experience — compact tail */}
          {resume.earlierExperience && resume.earlierExperience.entries.length > 0 && (
            <section className="break-inside-avoid">
              <SectionLabel>{tr ? 'Önceki Deneyimler' : 'Earlier Experience'}</SectionLabel>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {resume.earlierExperience.entries.map((entry, idx) => (
                  <div key={idx} className="font-sans text-[8.5px] text-ink-secondary">
                    <span className="font-medium text-ink">{entry.company}</span> · {entry.role}{' '}
                    <span className="font-mono text-[7.5px] tracking-[0.02em] text-ink-secondary/70">
                      ({fmtRange(entry.startDate, entry.endDate, locale)})
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Baseline footer — sits at the foot of the sheet via flex-1 above */}
        <footer className="mt-3 flex items-center justify-between border-t border-hairline pt-2 font-mono text-[7px] uppercase tracking-[0.18em] text-ink-secondary/55">
          <span>{resume.basics.name}</span>
          <span>{tr ? 'Özgeçmiş' : 'Curriculum Vitae'} · {year}</span>
        </footer>
      </main>

      {/* ════════ PAGE 2 — Project screenshots appendix ════════ */}
      <section className="mx-auto w-full max-w-[210mm] break-before-page bg-surface px-[15mm] pb-[14mm] pt-[14mm]">
        <header className="border-b-[1.5px] border-ink pb-3">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-accent">
            {tr ? 'Ek' : 'Appendix'}
          </p>
          <h2 className="mt-1.5 font-serif text-[19px] font-medium leading-tight text-ink">
            {tr ? 'Proje Ekran Görüntüleri' : 'Project Screenshots'}
          </h2>
          <p className="mt-1 max-w-[150mm] font-sans text-[9.5px] leading-[1.45] text-ink-secondary">
            {tr
              ? 'Eroğlu Global Holding için geliştirilen kurumsal portal ve seyahat yönetim sistemi arayüzlerinden seçili ekranlar.'
              : 'Selected screens from the enterprise portal and travel management system built for Eroğlu Global Holding.'}
          </p>
        </header>

        <div className="mt-6 flex flex-col gap-7">
          {SCREENSHOTS.map((shot) => (
            <figure key={shot.key} className="flex break-inside-avoid flex-col gap-2">
              <figcaption className="flex items-center gap-2.5">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink-secondary">
                  {screenshotLabels[shot.key]}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
              </figcaption>
              <div className="overflow-hidden rounded-[3px] border border-ink/15 bg-surface-sunk">
                {/* Raw img (not next/image) so the PDF renderer gets the asset directly. */}
                <img src={shot.src} alt={shot.alt} className="block w-full" />
              </div>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
