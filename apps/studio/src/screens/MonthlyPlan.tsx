import { useState } from 'react';
import type { Topic } from '@nacianilcom/content-core';
import type { PlanQCIssue } from '@nacianilcom/content-core';

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

export function MonthlyPlan() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [mode, setMode] = useState<Mode>('generate');
  const [targetMonth, setTargetMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 2).padStart(2, '0')}`;
  });
  const [userNotes, setUserNotes] = useState('');
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [filePrompt, setFilePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [approved, setApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'pool' | 'selected'>('selected');

  async function loadPlanList() {
    setLoadingPlans(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) setPlans((await res.json()) as PlanSummary[]);
    } finally {
      setLoadingPlans(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
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
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePrompt() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plans/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMonth, userNotes }),
      });
      const data = (await res.json()) as { prompt?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      if (data.prompt) setFilePrompt(data.prompt);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!planData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/plans/${targetMonth}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (res.ok) { setSaved(true); await loadPlanList(); }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    setLoading(true);
    try {
      const saveRes = await fetch(`/api/plans/${targetMonth}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!saveRes.ok) throw new Error('Save failed before approve');

      const res = await fetch(`/api/plans/${targetMonth}/approve`, { method: 'POST' });
      if (res.ok) {
        setApproved(true);
        if (planData) setPlanData({ ...planData, status: 'approved' });
        await loadPlanList();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
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

  // Group selected by week
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
      {/* Left sidebar */}
      <div className="w-52 flex-shrink-0 space-y-4">
        {/* Month + mode */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">
            Month
          </label>
          <input
            type="month"
            value={targetMonth}
            onChange={e => setTargetMonth(e.target.value)}
            className="w-full rounded border border-hairline bg-surface px-2 py-1.5 font-mono text-sm text-ink"
          />
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">Mode</p>
          <div className="flex flex-col gap-1">
            {(['generate', 'file-prompt'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded px-3 py-1.5 text-left font-sans text-xs ${
                  mode === m ? 'bg-accent/10 text-accent font-medium' : 'text-ink-secondary hover:bg-hairline/50'
                }`}
              >
                {m === 'generate' ? '⚡ Generate (local)' : '📄 File prompt (Claude)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 mb-1">
            Notes / trends
          </label>
          <textarea
            value={userNotes}
            onChange={e => setUserNotes(e.target.value)}
            placeholder="- İlgilenilen konu 1&#10;- Trend: X&#10;- Seri devamı: Y"
            rows={6}
            className="w-full rounded border border-hairline bg-surface px-2 py-1.5 font-mono text-[11px] text-ink resize-none"
          />
        </div>

        <button
          onClick={mode === 'generate' ? handleGenerate : handleGeneratePrompt}
          disabled={loading}
          className="w-full rounded bg-accent px-3 py-2 font-sans text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-40"
        >
          {loading ? 'Working…' : mode === 'generate' ? 'Generate plan' : 'Generate prompt'}
        </button>

        {/* Existing plans list */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">Saved plans</p>
            <button onClick={loadPlanList} className="font-mono text-[9px] text-ink-secondary/50 hover:text-ink-secondary">
              {loadingPlans ? '…' : '↻'}
            </button>
          </div>
          {plans.length === 0 && (
            <p className="font-mono text-[10px] text-ink-secondary/40">None yet</p>
          )}
          {plans.map(p => (
            <button
              key={p.filename}
              onClick={() => setTargetMonth(p.month)}
              className="block w-full text-left px-2 py-1 rounded font-mono text-[10px] text-ink-secondary hover:bg-hairline/50"
            >
              {p.month} ({p.selectedCount}) — {p.status}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4">
        {error && (
          <div className="rounded border border-negative/30 bg-negative/5 px-3 py-2 font-mono text-xs text-negative">
            {error}
          </div>
        )}

        {/* File prompt mode */}
        {mode === 'file-prompt' && filePrompt && (
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60">
                Claude Code prompt — paste into Claude, then import result via AI Inbox
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(filePrompt)}
                className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] text-ink-secondary hover:text-ink"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={filePrompt}
              rows={30}
              className="flex-1 rounded border border-hairline bg-surface px-3 py-2 font-mono text-xs text-ink-secondary resize-none"
            />
          </div>
        )}

        {/* Generate mode results */}
        {planData && mode === 'generate' && (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-ink">
                  {planData.month} — {planData.selected.length} topics selected
                </h2>
                <p className="font-mono text-[10px] text-ink-secondary/60">
                  Pool: {planData.candidatePool.length} candidates | Status: {planData.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading || saved}
                  className="rounded border border-hairline px-3 py-1.5 font-sans text-sm text-ink-secondary hover:text-ink disabled:opacity-40"
                >
                  {saved ? 'Saved ✓' : 'Save draft'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading || approved || planData.selected.length === 0}
                  className="rounded bg-positive px-3 py-1.5 font-sans text-sm font-medium text-white hover:bg-positive/90 disabled:opacity-40"
                >
                  {approved ? 'Approved ✓' : 'Approve → _ideas/'}
                </button>
              </div>
            </div>

            {/* QC issues */}
            {planData.qcIssues && planData.qcIssues.length > 0 && (
              <div className="rounded border border-accent/30 bg-accent/5 p-3 space-y-1">
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
            <div className="flex gap-4 border-b border-hairline pb-2">
              {(['selected', 'pool'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-sans text-sm ${activeTab === tab ? 'text-accent font-medium border-b-2 border-accent pb-2' : 'text-ink-secondary hover:text-ink'}`}
                >
                  {tab === 'selected'
                    ? `Selected (${planData.selected.length})`
                    : `Candidate pool (${planData.candidatePool.length})`}
                </button>
              ))}
            </div>

            {/* Selected topics — weekly view */}
            {activeTab === 'selected' && (
              <div className="flex-1 overflow-auto grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(w => {
                  const weekTopics = byWeek(planData.selected)[w] ?? [];
                  return (
                    <div key={w} className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary/60 sticky top-0 bg-surface pb-1">
                        Week {w} ({weekTopics.length})
                      </p>
                      {weekTopics.map(t => (
                        <TopicCard
                          key={t.title}
                          topic={t}
                          isSelected
                          onAction={handleTopicAction}
                          actions={['← remove', 'avoid']}
                        />
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
                    <TopicCard
                      key={t.title}
                      topic={t}
                      onAction={handleTopicAction}
                      actions={['→ selected', 'avoid']}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!planData && !filePrompt && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-ink-secondary/50">
              <p className="font-sans text-sm mb-1">Select a month and generate a plan</p>
              <p className="font-mono text-[10px]">Studio suggests — you decide</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
