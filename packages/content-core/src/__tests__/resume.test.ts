import { describe, it, expect } from 'vitest';
import { ResumeSchema, BilingualCaseStudySchema } from '../schemas/resume';
import { filterResumeByVisibility } from '../resume/visibility';
import type { Resume } from '../schemas/resume';

const makeResume = (): Resume => ({
  basics: { name: 'Test User', title: 'Developer', summary: 'Summary' },
  contact: [
    { key: 'email', value: 'test@example.com', visibility: 'public' },
    { key: 'phone', value: '+90 555 000 0000', visibility: 'private' },
    { key: 'address', value: 'Istanbul', visibility: 'pdf' },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Acme',
      role: 'Dev',
      startDate: '2020-01',
      description: 'Worked on things',
      highlights: [],
      stack: ['React'],
      visibility: 'public',
    },
  ],
  education: [
    { id: 'edu-1', institution: 'Uni', degree: 'BS', field: 'CS', visibility: 'public' },
  ],
  skills: [{ group: 'Languages', items: ['TypeScript'] }],
  projects: [
    { id: 'proj-1', title: 'Dashboard', summary: 'Enterprise hub', stack: ['React', '.NET'], visibility: 'public' },
  ],
  links: [
    { label: 'GitHub', url: 'https://github.com/test', visibility: 'public' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/test', visibility: 'pdf' },
  ],
  credentials: [
    { id: 'cred-1', title: 'Microsoft Cert', issuer: 'Microsoft', visibility: 'public' },
    { id: 'cred-2', title: 'Drivers License', issuer: 'Govt', visibility: 'private' },
    { id: 'cred-3', title: 'Military Doc', issuer: 'Govt', visibility: 'private' },
  ],
});

describe('ResumeSchema — Zod validation', () => {
  it('accepts a valid resume', () => {
    const result = ResumeSchema.safeParse(makeResume());
    expect(result.success).toBe(true);
  });

  it('rejects missing basics.name', () => {
    const bad = { ...makeResume(), basics: { title: 'Dev', summary: 'S' } };
    expect(ResumeSchema.safeParse(bad).success).toBe(false);
  });
});

describe('filterResumeByVisibility — web mode', () => {
  const filtered = filterResumeByVisibility(makeResume(), 'web');

  it('includes public contact', () => {
    expect(filtered.contact.find(c => c.key === 'email')).toBeDefined();
  });

  it('excludes private contact (phone)', () => {
    expect(filtered.contact.find(c => c.key === 'phone')).toBeUndefined();
  });

  it('excludes pdf-only contact (address) in web mode', () => {
    expect(filtered.contact.find(c => c.key === 'address')).toBeUndefined();
  });

  it('excludes private credentials (drivers license, military)', () => {
    const ids = filtered.credentials.map(c => c.id);
    expect(ids).not.toContain('cred-2');
    expect(ids).not.toContain('cred-3');
  });

  it('includes public credentials', () => {
    expect(filtered.credentials.find(c => c.id === 'cred-1')).toBeDefined();
  });

  it('excludes pdf-only links in web mode', () => {
    expect(filtered.links.find(l => l.label === 'LinkedIn')).toBeUndefined();
  });

  it('excludes private earlierExperience in web mode', () => {
    const withEarlier = filterResumeByVisibility(
      {
        ...makeResume(),
        earlierExperience: {
          summary: 'Earlier roles',
          entries: [{ company: 'Acme', role: 'Dev', startDate: '2019-01' }],
          visibility: 'private',
        },
      },
      'web',
    );
    expect(withEarlier.earlierExperience).toBeUndefined();
  });
});

describe('filterResumeByVisibility — pdf mode', () => {
  const filtered = filterResumeByVisibility(makeResume(), 'pdf');

  it('includes public + pdf fields in pdf mode', () => {
    const addressItem = filtered.contact.find(c => c.key === 'address');
    expect(addressItem).toBeDefined();
  });

  it('still excludes private in pdf mode', () => {
    expect(filtered.contact.find(c => c.key === 'phone')).toBeUndefined();
  });

  it('includes pdf-only links in pdf mode', () => {
    expect(filtered.links.find(l => l.label === 'LinkedIn')).toBeDefined();
  });
});

describe('BilingualCaseStudySchema — Zod validation', () => {
  const makeCase = () => ({
    slug: 'test-case',
    title: 'Test Case',
    summary: 'Short summary',
    problem: 'The problem',
    context: 'The context',
    role: 'Lead Developer',
    stack: ['React', '.NET'],
    solution: 'We solved it',
    impact: 'Big impact',
    assets: [],
    visibility: 'public' as const,
  });

  it('accepts valid bilingual case study', () => {
    const result = BilingualCaseStudySchema.safeParse({ tr: makeCase(), en: makeCase() });
    expect(result.success).toBe(true);
  });
});
