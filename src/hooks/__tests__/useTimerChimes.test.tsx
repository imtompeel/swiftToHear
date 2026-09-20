import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimerChimes } from '../useTimerChimes';

describe('useTimerChimes', () => {
  const playChime = vi.fn();

  beforeEach(() => {
    playChime.mockReset();
  });

  it('plays a chime when remaining crosses the 30-second warning', () => {
    const { rerender } = renderHook(
      ({ remaining }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive: true,
          isMuted: false,
          playChime,
        }),
      { initialProps: { remaining: 31_000 } }
    );

    rerender({ remaining: 29_000 });
    expect(playChime).toHaveBeenCalledTimes(1);
  });

  it('does not play while inactive, including lobby and check-in timers', () => {
    const { rerender } = renderHook(
      ({ remaining }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive: false,
          playChime,
        }),
      { initialProps: { remaining: 120_000 } }
    );

    rerender({ remaining: 119_000 });
    rerender({ remaining: 29_000 });
    rerender({ remaining: 0 });
    expect(playChime).not.toHaveBeenCalled();
  });

  it('does not play when muted, and does not replay after unmute', () => {
    const { rerender } = renderHook(
      ({ remaining, isMuted }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive: true,
          isMuted,
          playChime,
        }),
      { initialProps: { remaining: 31_000, isMuted: true } }
    );

    rerender({ remaining: 29_000, isMuted: true });
    expect(playChime).not.toHaveBeenCalled();

    rerender({ remaining: 28_000, isMuted: false });
    expect(playChime).not.toHaveBeenCalled();
  });

  it('plays the end chime when an active timer is stopped early', () => {
    const { rerender } = renderHook(
      ({ remaining, isActive }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive,
          endOnInactive: true,
          playChime,
        }),
      { initialProps: { remaining: 90_000, isActive: true } }
    );

    rerender({ remaining: 90_000, isActive: false });
    expect(playChime).toHaveBeenCalledTimes(1);
  });

  it('does not play the end chime on pause when endOnInactive is off', () => {
    const { rerender } = renderHook(
      ({ remaining, isActive }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive,
          playChime,
        }),
      { initialProps: { remaining: 90_000, isActive: true } }
    );

    rerender({ remaining: 90_000, isActive: false });
    expect(playChime).not.toHaveBeenCalled();
  });

  it('does not replay the end chime if the timer already reached zero', async () => {
    const { rerender } = renderHook(
      ({ remaining, isActive }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive,
          endOnInactive: true,
          playChime,
        }),
      { initialProps: { remaining: 1000, isActive: true } }
    );

    rerender({ remaining: 0, isActive: true });
    expect(playChime).toHaveBeenCalledTimes(1);

    rerender({ remaining: 0, isActive: false });
    expect(playChime).toHaveBeenCalledTimes(1);
  });

  it('replays bells after the timer resets for a new round', () => {
    const { rerender } = renderHook(
      ({ remaining }) =>
        useTimerChimes({
          timeRemaining: remaining,
          phaseDuration: 120_000,
          isActive: true,
          playChime,
        }),
      { initialProps: { remaining: 120_000 } }
    );

    rerender({ remaining: 119_000 });
    expect(playChime).toHaveBeenCalledTimes(1);

    playChime.mockClear();
    rerender({ remaining: 50_000 });
    rerender({ remaining: 120_000 });
    rerender({ remaining: 119_000 });
    expect(playChime).toHaveBeenCalledTimes(1);
  });
});
