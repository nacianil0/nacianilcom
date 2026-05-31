import { useState, useEffect, useCallback } from 'react';
import type { Topic } from '@nacianilcom/content-core';
import type { PlanQCIssue } from '@nacianilcom/content-core';
import { StudioSpinner, StatusBanner, LoadingOverlay, EmptyState } from '../ui';

interface PlanSummary { filename: string; month: string; status: string; selectedCount: number }
interface PlanData {
  month: string;
  targetCount: number;
  candidatePool: Topic[];
  selected: Topic[];
  status: string;
  qcIssues?: PlanQCIssue[] | undefined;
}

type Mode = 'generate' | 'file-prompt';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'text-positive',
  intermediate: 'text-accent',
  advanced: 'text-negative',
};

const MODE_INFO: Record<Mode, string> = {
  'generate': 'Studio analiz eder, 25-40 aday havuzundan 10 konu seçer. Approve ile iskelet + Codex promptları otomatik üretilir — sen Codex\'e yapıştırırsın.',
  'file-prompt': 'Mod seçildiğinde Claude Code prompt\'u otomatik üretilir. Claude çıktısını content/_inbox/ bırak — Studio otomatik route eder, plan bu sayfada görünür.',
};

function TopicCard({
  topic,
  onAction,
  isSelected,
  actions,
}: {
  topic: Topic;
  onAction?: (action: string, topic: Topic) => void;
  isSelected?: boolean;
  actions?: string[];
}) {
  return (
    <div className={`rounded border ${isSelected ? 'border-accent/40 bg-accent/5' : 'border-hairline bg-card'} p-3 space-y-1.5`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-sm font-medium text-ink leading-tight">{topic.title}</p>
        <span className={`flex-shrink-0 font-mono text-[10px] ${DIFFICULTY_COLOR[topic.difficulty] ?? ''}`}>
          {topic.difficulty}
        </span>
      </div>
      <p className="font-sans text-xs text-ink-secondary">{topic.angle}</p>
      <div className="flex flex-wrap gap-2 font-mono text-[10px] text-ink-secondary/60">
        <span>week {topic.suggestedPublishWeek}</span>
        <span>·</span>
        <span>{topic.contentType}</span>
        <span>·</span>
        <span>~{topic.estimatedReadingTime}min</span>
        {topic.seriesFit !== 'standalone' && (
          <>
            <span>·</span>
            <span className="text-accent/70 truncate max-w-[120px]">{topic.seriesFit}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="font-mono text-[10px] text-ink-secondary/50">score:</span>
        <span className="font-mono text-[10px] text-accent">
          {Math.round((topic.scores.relevance + topic.scores.novelty) / 2 * 10) / 10}
        </span>
        {topic.scores.riskOfRepetition >= 6 && (
          <span className="font-mono text-[10px] text-negative">(rep risk!)</span>
        )}
      </div>
      {topic.whyNow && (
        <p className="font-sans text-[11px] text-ink-secondary/70 italic">{topic.whyNow}</p>
      )}
      {actions && onAction && (
        <div className="flex flex-wrap gap-1 pt-1">
          {actions.map(a => (
            <button
              key={a}
              onClick={() => onAction(a, topic)}
              className="rounded bg-hairline/60 px-1.5 py-0.5 font-mono text-[9px] text-ink-secondary hover:bg-hairline hover:text-ink"
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function MonthlyPlan() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('generate');
  const [targetMonth, setTargetMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 2).padStart(2, '0')}`;
  });
  const [userNotes, setUserNotes] = useState('');
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [filePrompt, setFilePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ variant: 'success' | 'error' | 'info'; title: string; detail?: string | undefined; path?: string | undefined } | null>(null);
  const [saved, setSaved] = useState(false);
  const [approved, setApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'pool' | 'selected'>('selected');
  const [copied, setCopied] = useState(false);

  const loadPlan = useCallback(async (month: string) => {
    setLoadingPlanId(month);
    setBanner(null);
    setMode('generate');
    setLoading(true);
    setSaved(false);
    setApproved(false);
    setPlanData(null);
    try {
      const res = await fetch(`/api/plans/${month}`);
      if (!res.ok) throw new Error('Plan bulunamadı');
      const data = (await res.json()) as PlanData;
      setPlanData(data);
      setSaved(true);
      setApproved(data.status === 'approved');
      setActiveTab('selected');
      setBanner({ variant: 'success', title: `Yüklendi: ${month}`, detail: `${data.selected.length} konu, ${data.candidatePool.length} aday`, path: `content/plans/${month}.json` });
    } catch (e) {
      setBanner({ variant: 'error', title: 'Yüklenemedi', detail: String(e) });
    } finally {
      setLoading(false);
      setLoadingPlanId(null);
    }
  }, []);

  const loadPlanList = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) setPlans((await res.json()) as PlanSummary[]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => { void loadPlanList(); }, [loadPlanList]);

  useEffect(() => {
    setFilePrompt('');
  }, [targetMonth]);

  const savedPlanForMonth = plans.find(p => p.month === targetMonth);

  // Poll for inbox → plans auto-route while waiting for Claude output
  useEffect(() => {
    if (planData?.month === targetMonth) return;
    const id = setInterval(() => { void loadPlanList(); }, 4000);
    return () => clearInterval(id);
  }, [targetMonth, planData, loadPlanList]);

  // Auto-load when plan appears for selected month
  useEffect(() => {
    if (savedPlanForMonth && !planData && loadingPlanId !== targetMonth) {
      void loadPlan(targetMonth);
    }
  }, [savedPlanForMonth, planData, loadingPlanId, targetMonth, loadPlan]);

  async function handleGenerate() {
    setLoading(true);
    setBanner(null);
    setSaved(false);
    setApproved(false);
    try {
      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMonth, userNotes, targetCount: 10 }),
      });
      const data = (await res.json()) as { plan?: PlanData; error?: string; qcIssues?: PlanQCIssue[] };
      if (!res.ok) throw new Error(data.error ?? 'Generate failed');
      if (data.plan) {
        setPlanData({ ...data.plan, qcIssues: data.qcIssues });
        setActiveTab('selected');
        setBanner({ variant: 'success', title: `Plan üretildi — Week 1–4 görünümü hazır`, detail: `${data.plan.selected.length} konu seçildi, ${data.plan.candidatePool.length} aday havuzda` });
      }
    } catch (e) {
      setBanner({ variant: 'error', title: 'Üretim hatası', detail: String(e) });
    } finally {
      setLoading(false);
    }
  }

  const handleGeneratePrompt = useCallback(async () => {
    setLoading(true);
    setBanner({ variant: 'info', title: 'Prompt hazırlanıyor…', detail: `${targetMonth} için Claude Code metni üretiliyor` });
    setFilePrompt('');
    try {
      const res = await fetch('/api/plans/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMonth, userNotes }),
      });
      const data = (await res.json()) as { prompt?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      if (data.prompt) {
        setFilePrompt(data.prompt);
        const lines = data.prompt.split('\n').length;
        setBanner({
          variant: 'success',
          title: `Prompt hazır (${lines} satır)`,
          detail: '① Copy → ② Claude Code\'a yapıştır → ③ JSON → content/_inbox/ (Studio otomatik yükler)',
        });
        void copyToClipboard(data.prompt).then(ok => {
          if (ok) setBanner(prev => prev ? { ...prev, detail: '✓ Panoya kopyalandı — Claude Code\'a yapıştır → JSON çıktısını AI Inbox\'a aktar' } : prev);
        });
      }
    } catch (e) {
      setBanner({ variant: 'error', title: 'Prompt üretilemedi', detail: String(e) });
    } finally {
      setLoading(false);
    }
  }, [targetMonth, userNotes]);

  const selectMode = useCallback((next: Mode) => {
    if (next === 'file-prompt') {
      setMode('file-prompt');
      void handleGeneratePrompt();
      return;
    }
    setMode('generate');
    setBanner({
      variant: 'info',
      title: 'Local generate modu seçildi',
      detail: 'Sol alttaki veya sağdaki "Generate plan" butonuna bas.',
    });
  }, [handleGeneratePrompt]);

  async function handleSave() {
    if (!planData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/plans/${targetMonth}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (res.ok) {
        setSaved(true);
        setBanner({ variant: 'success', title: 'Kaydedildi', path: `content/plans/${targetMonth}.json` });
        await loadPlanList();
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      setBanner({ variant: 'error', title: 'Kayıt hatası', detail: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(generateCodexPrompts = true) {
    setLoading(true);
    setBanner(generateCodexPrompts
      ? { variant: 'info', title: 'Codex promptları üretiliyor…', detail: 'Iskelet + her makale için outline/draft/final prompt dosyaları hazırlanıyor.' }
      : null);
    try {
      const saveRes = await fetch(`/api/plans/${targetMonth}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!saveRes.ok) throw new Error('Save failed before approve');

      const res = await fetch(`/api/plans/${targetMonth}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateCodexPrompts }),
      });
      const data = (await res.json()) as {
        summary?: { seriesCreated?: string[]; articlesScaffolded?: number; totalSelected?: number };
        promptSummary?: { total?: number; articlesSkipped?: number };
        error?: string;
      };
      if (res.ok) {
        setApproved(true);
        if (planData) setPlanData({ ...planData, status: 'approved' });
        await loadPlanList();
        const summary = data.summary;
        const ps = data.promptSummary;
        const seriesList = summary?.seriesCreated?.join(', ') ?? '';
        const scaffolded = summary?.articlesScaffolded ?? 0;
        const total = summary?.totalSelected ?? planData?.selected.length ?? 0;
        setBanner({
          variant: 'success',
          title: generateCodexPrompts
            ? `Onaylandı — ${ps?.total ?? 0} Codex promptu hazır`
            : `Onaylandı — ${total} konu iskeletlendi`,
          detail: generateCodexPrompts
            ? `Promptlar: content/_prompts/ — Draft Review'dan kopyala → Codex'e yapıştır.`
            : seriesList
              ? `Yeni seriler: ${seriesList}. ${scaffolded} makale dizini (meta + brief).`
              : `${scaffolded} makale dizini güncellendi.`,
          path: generateCodexPrompts ? 'content/_prompts/' : 'content/series/',
        });
      } else {
        throw new Error(data.error ?? 'Approve failed');
      }
    } catch (e) {
      setBanner({ variant: 'error', title: 'Onay hatası', detail: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!filePrompt) return;
    const ok = await copyToClipboard(filePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (!ok) setBanner({ variant: 'error', title: 'Kopyalama başarısız', detail: 'Textarea\'dan manuel kopyalayın' });
  }

  function handleTopicAction(action: string, topic: Topic) {
    if (!planData) return;
    if (action === 'avoid') {
      setPlanData({
        ...planData,
        selected: planData.selected.filter(t => t.title !== topic.title),
        candidatePool: planData.candidatePool.filter(t => t.title !== topic.title),
      });
    } else if (action === '→ selected') {
      if (!planData.selected.find(t => t.title === topic.title)) {
        setPlanData({ ...planData, selected: [...planData.selected, topic] });
      }
    } else if (action === '← remove') {
      setPlanData({ ...planData, selected: planData.selected.filter(t => t.title !== topic.title) });
    }
  }

  const byWeek = (topics: Topic[]): Record<number, Topic[]> => {
    const result: Record<number, Topic[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const t of topics) {
      const w = t.suggestedPublishWeek;
      if (w >= 1 && w <= 4) (result[w] ??= []).push(t);
    }
    return result;
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left sidebar — scrollable, generate sticky at bottom */}
      <div className="w-52 flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div className="flex-1 space-y-4 pb-2">
          {/* Month */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">Month</label>
            <input
              type="month"
              value={targetMonth}
              onChange={e => setTargetMonth(e.target.value)}
              className="w-full rounded border border-hairline bg-surface px-2 py-1.5 font-mono text-sm text-ink"
            />
          </div>

          {/* Mode */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">Mode</p>
            <div className="flex flex-col gap-1">
              {(['generate', 'file-prompt'] as Mode[]).map(m => {
                const isActive = mode === m;
                const isWorking = loading && isActive && m === 'file-prompt';
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectMode(m)}
                    disabled={isWorking}
                    className={`rounded px-3 py-1.5 text-left font-sans text-xs transition-colors ${
                      isActive ? 'bg-accent/10 text-accent font-medium ring-1 ring-accent/30' : 'text-ink-secondary hover:bg-hairline/50'
                    } disabled:opacity-60`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isWorking && <StudioSpinner />}
                      {m === 'generate' ? '⚡ Generate (local)' : '📄 File prompt (Claude)'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">Notes / trends</label>
            <textarea
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              placeholder="- İlgilenilen konu 1&#10;- Trend: X&#10;- Seri devamı: Y"
              rows={5}
              className="w-full rounded border border-hairline bg-surface px-2 py-1.5 font-mono text-[11px] text-ink resize-none"
            />
          </div>

          {/* Saved plans */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">Saved plans</p>
              <button onClick={loadPlanList} className="font-mono text-[9px] text-ink-secondary/50 hover:text-ink-secondary">
                {loadingPlans ? <StudioSpinner /> : '↻'}
              </button>
            </div>
            {plans.length === 0 && !loadingPlans && (
              <p className="font-mono text-[10px] text-ink-secondary/40 px-1">Henüz plan yok — Generate ile başla</p>
            )}
            {plans.map(p => (
              <button
                key={p.filename}
                onClick={() => void loadPlan(p.month)}
                disabled={loadingPlanId === p.month}
                className={`flex items-center justify-between w-full text-left px-2 py-1 rounded font-mono text-[10px] hover:bg-hairline/50 ${
                  planData?.month === p.month ? 'text-accent bg-accent/5' : 'text-ink-secondary'
                }`}
              >
                <span>{p.month} ({p.selectedCount})</span>
                {loadingPlanId === p.month
                  ? <StudioSpinner />
                  : <span className="opacity-50">{p.status}</span>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Sticky actions */}
        <div className="sticky bottom-0 pt-2 bg-surface border-t border-hairline space-y-2">
          {mode === 'generate' && planData && !approved && (
            <>
              <button
                type="button"
                onClick={() => void handleApprove(true)}
                disabled={loading || planData.selected.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded bg-positive px-3 py-2.5 font-sans text-sm font-semibold text-white hover:bg-positive/90 disabled:opacity-40 shadow-sm"
              >
                {loading && <StudioSpinner />}
                Onayla + Codex promptları
              </button>
              <button
                type="button"
                onClick={() => void handleApprove(false)}
                disabled={loading || planData.selected.length === 0}
                className="w-full rounded border border-hairline px-3 py-1.5 font-sans text-[11px] text-ink-secondary hover:text-ink disabled:opacity-40"
              >
                Sadece iskelet (meta + brief)
              </button>
            </>
          )}
          {mode === 'generate' && planData && approved && (
            <p className="text-center font-mono text-[10px] text-positive px-1 py-1">
              Onaylandı ✓ — Draft Review&apos;a geç
            </p>
          )}
          <button
            onClick={mode === 'generate' ? handleGenerate : handleGeneratePrompt}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded bg-accent px-3 py-2 font-sans text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-40"
          >
            {loading && <StudioSpinner />}
            {loading
              ? (mode === 'generate' ? 'Üretiliyor…' : 'Prompt hazırlanıyor…')
              : (mode === 'generate' ? 'Generate plan' : 'Generate prompt')
            }
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col gap-3 min-w-0">
        {/* Mode info */}
        <div className={`rounded border px-3 py-2 transition-colors ${mode === 'file-prompt' ? 'border-accent/30 bg-accent/5' : 'border-hairline/60 bg-hairline/20'}`}>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-0.5">
            {mode === 'file-prompt' ? 'Mod · File prompt (Claude)' : 'Mod · Generate (local)'}
          </p>
          <p className="font-sans text-[11px] text-ink-secondary/80">{MODE_INFO[mode]}</p>
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

        {/* File prompt mode */}
        {mode === 'file-prompt' && (
          <div className="flex flex-1 flex-col gap-2 relative min-h-0">
            {loading && <LoadingOverlay message="Prompt hazırlanıyor…" />}

            {!filePrompt && !loading && (
              <EmptyState
                title="Claude Code prompt burada görünecek"
                actionLabel="Generate prompt"
                onAction={handleGeneratePrompt}
                actionLoading={loading}
                steps={[
                  { label: 'Mod seçildiğinde prompt otomatik üretilir' },
                  { label: 'Copy ile panoya al (veya otomatik kopyalanır)' },
                  { label: 'Claude Code\'a yapıştır, çalıştır' },
                  { label: 'JSON → content/_inbox/ — Studio otomatik plana yükler' },
                ]}
                hint={`Hedef: content/plans/${targetMonth}.json`}
              />
            )}

            {filePrompt && (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">
                    Claude Code prompt — dosyaya kaydedilmez
                  </p>
                  <button
                    onClick={handleCopy}
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                      copied
                        ? 'border-positive/40 text-positive'
                        : 'border-hairline text-ink-secondary hover:text-ink'
                    }`}
                  >
                    {copied ? 'Kopyalandı ✓' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={filePrompt}
                  className="flex-1 rounded border border-hairline bg-surface px-3 py-2 font-mono text-xs text-ink-secondary resize-none min-h-0"
                />
              </>
            )}
          </div>
        )}

        {/* Generate mode */}
        {mode === 'generate' && (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden relative min-h-0">
            {loading && <LoadingOverlay message="Plan üretiliyor…" />}

            {!planData && !loading && (
              <EmptyState
                title="Ay seç ve plan üret"
                actionLabel="Generate plan"
                onAction={handleGenerate}
                actionLoading={loading}
                steps={[
                  { label: 'Studio mevcut içeriği analiz eder, ~10 konu seçer' },
                  { label: 'Week 1–4 görünümünde konuları düzenle' },
                  { label: 'Approve → iskelet + Codex promptları (content/_prompts/)' },
                  { label: 'Promptu kopyala → Codex → çıktı repoya' },
                ]}
                hint="Studio önerir — sen karar verirsin"
              />
            )}

            {planData && (
              <>
                {/* Header row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between flex-shrink-0">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg font-semibold text-ink">
                      {planData.month} — {planData.selected.length} konu
                    </h2>
                    <p className="font-mono text-[10px] text-ink-secondary/60">
                      Havuz: {planData.candidatePool.length} aday · Durum: {planData.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button
                      onClick={handleSave}
                      disabled={loading || saved}
                      className="flex items-center gap-1.5 rounded border border-hairline px-3 py-1.5 font-sans text-sm text-ink-secondary hover:text-ink disabled:opacity-40"
                    >
                      {loading && saved === false && <StudioSpinner />}
                      {saved ? 'Saved ✓' : 'Save draft'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleApprove(true)}
                      disabled={loading || approved || planData.selected.length === 0}
                      className="flex items-center gap-1.5 rounded bg-positive px-3 py-1.5 font-sans text-sm font-medium text-white hover:bg-positive/90 disabled:opacity-40"
                    >
                      {loading && !saved && <StudioSpinner />}
                      {approved ? 'Onaylandı ✓' : 'Onayla + promptlar'}
                    </button>
                  </div>
                </div>

                {!approved && (
                  <div className="flex-shrink-0 rounded border border-positive/30 bg-positive/5 px-3 py-2">
                    <p className="font-sans text-xs text-positive">
                      Plan hazır — seri + meta + brief için{' '}
                      <strong>sol alttaki yeşil &quot;Onayla → iskelet oluştur&quot;</strong> butonuna bas.
                    </p>
                  </div>
                )}

                {/* QC issues */}
                {planData.qcIssues && planData.qcIssues.length > 0 && (
                  <div className="flex-shrink-0 rounded border border-accent/30 bg-accent/5 p-3 space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent mb-2">Plan QC issues</p>
                    {planData.qcIssues.map((issue, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className={`flex-shrink-0 font-mono text-[9px] uppercase px-1 rounded ${issue.severity === 'blocking' ? 'bg-negative/10 text-negative' : 'bg-accent/10 text-accent'}`}>
                          {issue.severity}
                        </span>
                        <span className="font-sans text-xs text-ink-secondary">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 border-b border-hairline pb-2 flex-shrink-0">
                  {(['selected', 'pool'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`font-sans text-sm ${activeTab === tab ? 'text-accent font-medium border-b-2 border-accent -mb-2 pb-2' : 'text-ink-secondary hover:text-ink'}`}
                    >
                      {tab === 'selected'
                        ? `Selected (${planData.selected.length})`
                        : `Candidate pool (${planData.candidatePool.length})`}
                    </button>
                  ))}
                </div>

                {/* Selected — weekly view */}
                {activeTab === 'selected' && (
                  <div className="flex-1 overflow-auto grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(w => {
                      const weekTopics = byWeek(planData.selected)[w] ?? [];
                      return (
                        <div key={w} className="space-y-2">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 sticky top-0 bg-surface pb-1">
                            Week {w} ({weekTopics.length})
                          </p>
                          {weekTopics.length === 0 && (
                            <p className="font-mono text-[10px] text-ink-secondary/30 px-1">Boş</p>
                          )}
                          {weekTopics.map(t => (
                            <TopicCard key={t.title} topic={t} isSelected onAction={handleTopicAction} actions={['← remove', 'avoid']} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Candidate pool */}
                {activeTab === 'pool' && (
                  <div className="flex-1 overflow-auto grid grid-cols-2 gap-3">
                    {planData.candidatePool
                      .filter(t => !planData.selected.find(s => s.title === t.title))
                      .map(t => (
                        <TopicCard key={t.title} topic={t} onAction={handleTopicAction} actions={['→ selected', 'avoid']} />
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
