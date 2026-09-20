import { useCallback, useEffect, useRef, useState } from 'react';

export type RoundChangeNotice = 'round' | 'scribe-feedback';

export function useRoundChangeNotice(
  phase: string | undefined,
  round: number | undefined,
  options?: { hasScribe?: boolean }
) {
  const hasScribe = options?.hasScribe ?? true;
  const [notice, setNotice] = useState<RoundChangeNotice | null>(null);
  const previousKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!phase) return;

    const key = `${phase}:${round || 1}`;
    if (previousKeyRef.current === null) {
      previousKeyRef.current = key;
      return;
    }

    if (previousKeyRef.current !== key) {
      if (phase === 'listening') {
        setNotice('round');
      } else if (phase === 'transition' && hasScribe) {
        setNotice('scribe-feedback');
      } else {
        setNotice(null);
      }
    }

    previousKeyRef.current = key;
  }, [phase, round, hasScribe]);

  const dismiss = useCallback(() => setNotice(null), []);

  return {
    notice,
    dismiss,
  };
}
