import { useState } from 'react';
import { DraftReview } from './screens/DraftReview';
import { SeoCheck } from './screens/SeoCheck';
import { Publisher } from './screens/Publisher';
import { Prompts } from './screens/Prompts';
import { Inbox } from './screens/Inbox';
import { VisualStudio } from './screens/VisualStudio';
import { MonthlyPlan } from './screens/MonthlyPlan';
import { ResumeStudio } from './screens/ResumeStudio';

type Screen = 'review' | 'qc' | 'publish' | 'prompts' | 'inbox' | 'visual' | 'plan' | 'resume';

const NAV: Array<{ id: Screen; label: string; hint: string }> = [
  { id: 'review',  label: 'Draft Review',   hint: 'MDX önizleme + frontmatter' },
  { id: 'qc',      label: 'SEO / QC Check', hint: 'Blocking & uyarı raporu' },
  { id: 'publish', label: 'Publisher',       hint: 'QC geç → commit + revalidate' },
  { id: 'prompts', label: 'Prompts',         hint: 'Claude Code şablonları' },
  { id: 'inbox',   label: 'AI Inbox',        hint: 'JSON çıktılarını rotala' },
  { id: 'visual',  label: 'Visual Studio',   hint: 'Mermaid → SVG commit' },
  { id: 'plan',    label: 'Monthly Plan',    hint: 'Aylık editorial planlama' },
  { id: 'resume',  label: 'Resume Studio',   hint: 'PDF üret + JSON önizle' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('review');

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-hairline bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary/60">
            nacianil
          </span>
          <span className="font-serif text-base font-semibold text-ink">Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-ink-secondary/40">
            {NAV.find(n => n.id === screen)?.label}
          </span>
          <span className="font-mono text-[10px] text-negative">127.0.0.1</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <nav className="w-44 flex-shrink-0 border-r border-hairline bg-card py-4">
          <ul className="space-y-0.5 px-2">
            {NAV.map(({ id, label, hint }) => (
              <li key={id} title={hint}>
                <button
                  onClick={() => setScreen(id)}
                  className={`w-full rounded px-3 py-2 text-left font-sans text-sm transition-colors ${
                    screen === id
                      ? 'bg-accent/10 font-medium text-accent'
                      : 'text-ink-secondary hover:bg-hairline/50 hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {screen === 'review' && <DraftReview />}
          {screen === 'qc' && <SeoCheck />}
          {screen === 'publish' && <Publisher />}
          {screen === 'prompts' && <Prompts />}
          {screen === 'inbox' && <Inbox />}
          {screen === 'visual' && <VisualStudio />}
          {screen === 'plan' && <MonthlyPlan />}
          {screen === 'resume' && <ResumeStudio />}
        </main>
      </div>
    </div>
  );
}
