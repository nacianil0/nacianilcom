import { useState } from 'react';

interface PdfResult {
  ok: boolean;
  path?: string;
  error?: string;
}

export function ResumeStudio() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<'tr' | 'en'>('tr');

  async function loadPreview(l: 'tr' | 'en') {
    setPreviewLang(l);
    try {
      const res = await fetch(`/api/resume?lang=${l}`);
      if (!res.ok) {
        setResumePreview(null);
        return;
      }
      const data = await res.json();
      setResumePreview(JSON.stringify(data, null, 2));
    } catch {
      setResumePreview(null);
    }
  }

  async function generatePdf() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang }),
      });
      const data = await res.json() as PdfResult;
      setResult(data);
    } catch (err) {
      setResult({ ok: false, error: String(err) });
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

      {/* ── PDF Generator ── */}
      <section className="rounded-card border border-hairline bg-card p-6">
        <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
          Playwright PDF Üret
        </h3>
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
          className="rounded border border-accent bg-accent/10 px-4 py-2 font-sans text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
        >
          {loading ? 'PDF üretiliyor…' : `PDF Üret (${lang.toUpperCase()})`}
        </button>

        {result && (
          <div className={`mt-4 rounded border px-4 py-3 font-sans text-sm ${
            result.ok
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-negative/20 bg-negative/5 text-negative'
          }`}>
            {result.ok
              ? <>PDF kaydedildi: <code className="font-mono text-xs">{result.path}</code></>
              : <>Hata: {result.error}</>
            }
          </div>
        )}
      </section>

      {/* ── Resume JSON Preview ── */}
      <section className="rounded-card border border-hairline bg-card p-6">
        <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
          Resume JSON Önizleme (web visibility)
        </h3>

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

        {resumePreview ? (
          <pre className="max-h-80 overflow-auto rounded border border-hairline bg-surface p-4 font-mono text-[11px] leading-relaxed text-ink-secondary">
            {resumePreview}
          </pre>
        ) : (
          <p className="font-sans text-xs text-ink-secondary/60">
            Dil seçip önizlemeyi yükle.
          </p>
        )}
      </section>
    </div>
  );
}
