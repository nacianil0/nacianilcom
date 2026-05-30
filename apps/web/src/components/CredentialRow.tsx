'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { specDateColClass } from '../lib/layout';

export interface CredentialRowProps {
  id: string;
  title: string;
  issuer: string;
  year?: number;
  pdfUrl: string;
  previewUrl: string;
  pdfFilename: string;
  variant?: 'default' | 'education';
  labels: {
    expand: string;
    collapse: string;
    download: string;
    previewAlt: string;
  };
}

export function CredentialRow({
  id,
  title,
  issuer,
  year,
  pdfUrl,
  previewUrl,
  pdfFilename,
  variant = 'default',
  labels,
}: CredentialRowProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const triggerId = `doc-${id}`;
  const titleClass =
    variant === 'education'
      ? 'font-serif text-[16px] font-medium leading-tight text-ink transition-colors group-hover:text-accent'
      : 'font-sans text-[14.5px] leading-snug text-ink transition-colors group-hover:text-accent';
  const issuerClass =
    variant === 'education'
      ? 'mt-0.5 font-sans text-[13.5px] leading-[1.5] text-ink-secondary'
      : 'mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-secondary';

  return (
    <li className="border-b border-hairline py-6 first:pt-0 last:border-b-0">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start sm:gap-x-8">
        <div className="min-w-0">
          <button
            type="button"
            id={triggerId}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="group w-full text-left"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-hairline font-mono text-[11px] text-ink-secondary transition-colors group-hover:border-ink group-hover:text-ink"
              >
                {open ? '−' : '+'}
              </span>
              <div className="min-w-0 flex-1">
                <p className={titleClass}>{title}</p>
                <p className={issuerClass}>
                  {issuer}
                  {year ? (
                    <span className="sm:hidden">
                      {' '}
                      · {year}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </button>

          {open && (
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="mt-4 pl-8"
            >
              <div className="overflow-hidden rounded-lg border border-hairline bg-surface-sunk">
                <div className="relative aspect-[4/3] max-h-[280px] w-full sm:max-h-[320px]">
                  <Image
                    src={previewUrl}
                    alt={labels.previewAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="object-contain object-center p-2"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface px-3 py-2.5">
                  <span className="sr-only">{labels.collapse}</span>
                  <a
                    href={pdfUrl}
                    download={pdfFilename}
                    className="ml-auto inline-flex items-center gap-1.5 border border-hairline bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-secondary transition-colors hover:border-ink hover:text-ink"
                  >
                    {labels.download}
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {year ? <span className={`${specDateColClass} hidden sm:block`}>{year}</span> : <span aria-hidden="true" className="hidden sm:block" />}
      </div>
    </li>
  );
}
