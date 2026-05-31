import { useState } from 'react';
import { StudioSpinner, StatusBanner } from '../ui';

interface PdfResult { ok: boolean; path?: string | undefined; error?: string }

export function ResumeStudio() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [banner, setBanner] = useState<{ variant: 'success' | 'error'; title: string; detail?: string | undefined; path?: string | undefined } | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<'tr' | 'en'>('tr');

  async function loadPreview(l: 'tr' | 'en') {
    setPreviewLang(l);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/resume?lang=${l}`);
      if (!res.ok) { setResumePreview(null); return; }
      const data = await res.json();
      setResumePreview(JSON.stringify(data, null, 2));
    } catch {
      setResumePreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function generatePdf() {
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch('/api/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang }),
      });
      const data = await res.json() as PdfResult;
      if (data.ok) {
        setBanner({
          variant: 'success',
          title: 'PDF kaydedildi',
          path: data.path ?? 'repo root',
        });
      } else {
        throw new Error(data.error ?? 'PDF üretilemedi');
      }
    } catch (err) {
      setBanner({ variant: 'error', title: 'PDF hatası', detail: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl font-semibold text-ink">Resume Studio</h2>
        <p className="mt-1 font-sans text-sm text-ink-secondary">
          PDF üretimi (local Playwright) + resume.json önizleme
        </p>
      </div>

      {/* Banner */}
      {banner && (
        <StatusBanner
          variant={banner.variant}
          title={banner.title}
          detail={banner.detail}
          path={banner.path}
          onDismiss={() => setBanner(null)}
        />
      )}

      {/* PDF Generator */}
      <section className="rounded-card border border-hairline bg-card p-6">
        <h3 className="mb-1 font-sans text-sm font-semibold text-ink">Playwright PDF Üret</h3>
        <p className="mb-4 font-sans text-xs text-ink-secondary/60">
          Web sunucusunun çalıştığını (localhost:3000) doğrula, ardından PDF üret.
          Playwright /cv/print sayfasına gidip PDF kaydeder.
        </p>

        <div className="mb-4 flex items-center gap-3">
          <span className="font-sans text-xs text-ink-secondary">Dil:</span>
          {(['tr', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded border px-3 py-1 font-sans text-xs transition-colors ${
                lang === l
                  ? 'border-accent bg-accent/10 font-medium text-accent'
                  : 'border-hairline text-ink-secondary hover:border-ink-secondary/40'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={generatePdf}
          disabled={loading}
          className="flex items-center gap-2 rounded border border-accent bg-accent/10 px-4 py-2 font-sans text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
        >
          {loading && <StudioSpinner />}
          {loading ? 'PDF üretiliyor…' : `PDF Üret (${lang.toUpperCase()})`}
        </button>
      </section>

      {/* Resume JSON Preview */}
      <section className="rounded-card border border-hairline bg-card p-6">
        <h3 className="mb-4 font-sans text-sm font-semibold text-ink">Resume JSON Önizleme (web visibility)</h3>
        <div className="mb-4 flex items-center gap-3">
          {(['tr', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => loadPreview(l)}
              className={`rounded border px-3 py-1 font-sans text-xs transition-colors ${
                previewLang === l && resumePreview
                  ? 'border-accent bg-accent/10 font-medium text-accent'
                  : 'border-hairline text-ink-secondary hover:border-ink-secondary/40'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {previewLoading && (
          <div className="flex items-center gap-2 text-ink-secondary">
            <StudioSpinner />
            <span className="font-sans text-xs">Yükleniyor…</span>
          </div>
        )}

        {resumePreview && !previewLoading ? (
          <pre className="max-h-80 overflow-auto rounded border border-hairline bg-surface p-4 font-mono text-[11px] leading-relaxed text-ink-secondary">
            {resumePreview}
          </pre>
        ) : !previewLoading ? (
          <p className="font-sans text-xs text-ink-secondary/60">Dil seçip önizlemeyi yükle.</p>
        ) : null}
      </section>
    </div>
  );
}
