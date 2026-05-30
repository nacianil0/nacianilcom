import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Locale } from '@nacianilcom/content-core';
import { loadResume } from '../../../../src/content/loader';

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

  const publicEmail = resume.contact.find(c => c.key === 'email');

  return (
    <div className="bg-white text-black" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <main
        className="mx-auto px-12 py-10"
        style={{ maxWidth: '800px', minHeight: '100vh' }}
      >
        {/* ── Header ── */}
        <header className="mb-8 flex items-start gap-6 border-b border-gray-200 pb-8">
          {resume.basics.photo && (
            <Image
              src={resume.basics.photo}
              alt={resume.basics.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
              style={{ flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.15, margin: 0 }}>
              {resume.basics.name}
            </h1>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
              {resume.basics.title}
            </p>
            {publicEmail?.value && (
              <p style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                {publicEmail.value}
              </p>
            )}
            {resume.links.length > 0 && (
              <div style={{ marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {resume.links.map(l => (
                  <span key={l.label} style={{ fontSize: '11px', color: '#555' }}>
                    {l.label}: {l.url}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ── Summary ── */}
        <section style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#333' }}>
            {resume.basics.summary}
          </p>
        </section>

        {/* ── Experience ── */}
        {resume.experience.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '12px' }}>
              {locale === 'tr' ? 'Deneyim' : 'Experience'}
            </h2>
            {resume.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: '16px', borderLeft: '2px solid #e5e7eb', paddingLeft: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '13px' }}>{exp.company}</strong>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    {exp.startDate} — {exp.endDate ?? (locale === 'tr' ? 'Halen' : 'Present')}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 4px' }}>{exp.role}</p>
                <p style={{ fontSize: '12px', lineHeight: 1.65, color: '#444' }}>{exp.description}</p>
                {exp.highlights.length > 0 && (
                  <ul style={{ margin: '6px 0 0', paddingLeft: '16px' }}>
                    {exp.highlights.map((h, i) => (
                      <li key={i} style={{ fontSize: '12px', color: '#444', lineHeight: 1.6, marginBottom: '3px' }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                {exp.stack.length > 0 && (
                  <p style={{ fontSize: '10px', color: '#999', marginTop: '6px' }}>
                    {exp.stack.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── Skills ── */}
        {resume.skills.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '12px' }}>
              {locale === 'tr' ? 'Yetenekler' : 'Skills'}
            </h2>
            {resume.skills.map(group => (
              <div key={group.group} style={{ marginBottom: '8px', display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#444', minWidth: '80px' }}>
                  {group.group}
                </span>
                <span style={{ fontSize: '11px', color: '#555' }}>{group.items.join(', ')}</span>
              </div>
            ))}
          </section>
        )}

        {/* ── Education ── */}
        {resume.education.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '12px' }}>
              {locale === 'tr' ? 'Eğitim' : 'Education'}
            </h2>
            {resume.education.map(edu => (
              <div key={edu.id} style={{ marginBottom: '8px', borderLeft: '2px solid #e5e7eb', paddingLeft: '14px' }}>
                <strong style={{ fontSize: '13px' }}>{edu.institution}</strong>
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0' }}>
                  {edu.degree} — {edu.field}
                  {edu.year && <span style={{ marginLeft: '8px', color: '#999' }}>{edu.year}</span>}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* ── Credentials ── */}
        {resume.credentials.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '12px' }}>
              {locale === 'tr' ? 'Sertifikalar & Belgeler' : 'Certifications & Credentials'}
            </h2>
            <ul style={{ paddingLeft: '16px', margin: 0 }}>
              {resume.credentials.map(cred => (
                <li key={cred.id} style={{ fontSize: '12px', color: '#444', lineHeight: 1.7, marginBottom: '4px' }}>
                  <strong>{cred.title}</strong>{' — '}<span style={{ color: '#888' }}>{cred.issuer}</span>
                  {cred.year && <span style={{ marginLeft: '6px', color: '#aaa' }}>{cred.year}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
