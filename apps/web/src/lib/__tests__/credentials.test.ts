import { describe, it, expect } from 'vitest';
import { credentialAssets, credentialPdfFilename } from '../credentials';

describe('credentialAssets', () => {
  it('returns public URLs for certificate source paths', () => {
    expect(
      credentialAssets({
        id: 'ms-20483',
        sourcePath: 'sources/8-sertifikalar/20483-microsoft-csharp.pdf',
      }),
    ).toEqual({
      pdfUrl: '/credentials/ms-20483.pdf',
      previewUrl: '/credentials/previews/ms-20483.webp',
    });
  });

  it('returns null for non-certificate sources', () => {
    expect(
      credentialAssets({
        id: 'ehliyet',
        sourcePath: 'sources/9-ehliyet-ve-kan-grubu/ehliyet.pdf',
      }),
    ).toBeNull();
  });
});

describe('credentialPdfFilename', () => {
  it('builds a safe download filename from title', () => {
    expect(credentialPdfFilename({ title: 'Programming in C# (Microsoft 20483)' })).toBe(
      'Programming-in-C-(Microsoft-20483).pdf',
    );
  });
});
