import { describe, it, expect } from 'vitest';
import { resumeDocumentAssets, resumeDocumentPdfFilename } from '../credentials';

describe('resumeDocumentAssets', () => {
  it('returns public URLs for certificate source paths', () => {
    expect(
      resumeDocumentAssets({
        id: 'ms-20483',
        sourcePath: 'sources/8-sertifikalar/20483-microsoft-csharp.pdf',
      }),
    ).toEqual({
      pdfUrl: '/credentials/ms-20483.pdf',
      previewUrl: '/credentials/previews/ms-20483.webp',
    });
  });

  it('returns public URLs for diploma source paths', () => {
    expect(
      resumeDocumentAssets({
        id: 'iu-betoo',
        sourcePath: 'sources/7-diploma/diploma.pdf',
      }),
    ).toEqual({
      pdfUrl: '/credentials/iu-betoo.pdf',
      previewUrl: '/credentials/previews/iu-betoo.webp',
    });
  });

  it('returns null for non-document sources', () => {
    expect(
      resumeDocumentAssets({
        id: 'ehliyet',
        sourcePath: 'sources/9-ehliyet-ve-kan-grubu/ehliyet.pdf',
      }),
    ).toBeNull();
  });
});

describe('resumeDocumentPdfFilename', () => {
  it('builds a safe download filename from title', () => {
    expect(resumeDocumentPdfFilename('Programming in C# (Microsoft 20483)')).toBe(
      'Programming-in-C-(Microsoft-20483).pdf',
    );
  });
});
