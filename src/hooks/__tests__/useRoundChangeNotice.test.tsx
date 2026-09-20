import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRoundChangeNotice } from '../useRoundChangeNotice';

describe('useRoundChangeNotice', () => {
  it('does not open a popup on the first phase it sees', () => {
    const { result } = renderHook(() =>
      useRoundChangeNotice('hello-checkin', 1)
    );

    expect(result.current.notice).toBeNull();
  });

  it('opens a round popup when listening begins', () => {
    const { result, rerender } = renderHook(
      ({ phase, round }) => useRoundChangeNotice(phase, round),
      { initialProps: { phase: 'hello-checkin', round: 1 } }
    );

    rerender({ phase: 'listening', round: 1 });
    expect(result.current.notice).toBe('round');
  });

  it('opens a scribe-feedback popup when a speaking round ends', () => {
    const { result, rerender } = renderHook(
      ({ phase, round }) => useRoundChangeNotice(phase, round),
      { initialProps: { phase: 'listening', round: 1 } }
    );

    rerender({ phase: 'transition', round: 1 });
    expect(result.current.notice).toBe('scribe-feedback');
  });

  it('skips scribe-feedback popups when there is no scribe', () => {
    const { result, rerender } = renderHook(
      ({ phase, round }) => useRoundChangeNotice(phase, round, { hasScribe: false }),
      { initialProps: { phase: 'listening', round: 1 } }
    );

    rerender({ phase: 'transition', round: 1 });
    expect(result.current.notice).toBeNull();
  });

  it('can be dismissed', () => {
    const { result, rerender } = renderHook(
      ({ phase, round }) => useRoundChangeNotice(phase, round),
      { initialProps: { phase: 'hello-checkin', round: 1 } }
    );

    rerender({ phase: 'listening', round: 1 });
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.notice).toBeNull();
  });
});
