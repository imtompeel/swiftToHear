import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsolatedTimer } from '../useIsolatedTimer';

describe('useIsolatedTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T09:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks immediately rather than waiting a full second', () => {
    const start = Date.now() - 5_000;
    const { result } = renderHook(() =>
      useIsolatedTimer('listening', start, 60_000)
    );

    expect(result.current).toBe(55_000);
  });

  it('resets to the full duration outside an active listening phase', () => {
    const start = Date.now();
    const { result, rerender } = renderHook(
      ({ phase, startTime }) => useIsolatedTimer(phase, startTime, 60_000),
      { initialProps: { phase: 'listening', startTime: start as number | null } }
    );

    act(() => {
      vi.setSystemTime(start + 5000);
      vi.advanceTimersByTime(5000);
    });

    rerender({ phase: 'transition', startTime: null });
    expect(result.current).toBe(60_000);
  });
});
