import { cn } from '../../lib/cn';

interface RuleProps {
  orientation?: 'horizontal' | 'vertical';
  tone?: 'hairline' | 'ink';
  className?: string;
}

/** Hairline (default) or strong ink rule. Vertical variant is the inline meta separator. */
export function Rule({ orientation = 'horizontal', tone = 'hairline', className = '' }: RuleProps) {
  const color = tone === 'ink' ? 'bg-ink' : 'bg-hairline';
  if (orientation === 'vertical') {
    return <span aria-hidden="true" className={cn('inline-block h-[10px] w-px', color, className)} />;
  }
  return <span aria-hidden="true" className={cn('block h-px w-full', color, className)} />;
}
