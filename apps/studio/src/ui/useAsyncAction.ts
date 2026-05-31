import { useState, useRef, useCallback } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState {
  status: Status;
  message: string | null;
  reset: () => void;
}

export function useAsyncAction(resetAfterMs = 0): [AsyncState, (fn: () => Promise<string | void>) => Promise<void>] {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('idle');
    setMessage(null);
  }, []);

  const run = useCallback(async (fn: () => Promise<string | void>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('loading');
    setMessage(null);
    try {
      const msg = await fn();
      setStatus('success');
      setMessage(msg ?? null);
      if (resetAfterMs > 0) {
        timerRef.current = setTimeout(reset, resetAfterMs);
      }
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }, [reset, resetAfterMs]);

  return [{ status, message, reset }, run];
}
