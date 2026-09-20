import { describe, expect, it } from 'vitest';
import {
  resolveTimerBells,
  resolveTimerDuration,
  isTimerReset,
  SILENT_TIMER_BELLS,
} from '../timerBells';

const duration = 7 * 60 * 1000;

describe('resolveTimerBells', () => {
  it('plays the start chime when elapsed crosses one second on a 1s tick', () => {
    expect(
      resolveTimerBells({
        previousRemaining: duration,
        remaining: duration - 1000,
        duration,
        alreadyPlayed: SILENT_TIMER_BELLS,
      })
    ).toEqual({ start: true, warning: false, end: false });
  });

  it('still plays start when the first tick overshoots the old 100ms window', () => {
    expect(
      resolveTimerBells({
        previousRemaining: duration,
        remaining: duration - 1500,
        duration,
        alreadyPlayed: SILENT_TIMER_BELLS,
      }).start
    ).toBe(true);
  });

  it('does not play start for a late joiner', () => {
    expect(
      resolveTimerBells({
        previousRemaining: duration - 120_000,
        remaining: duration - 121_000,
        duration,
        alreadyPlayed: SILENT_TIMER_BELLS,
      })
    ).toEqual(SILENT_TIMER_BELLS);
  });

  it('plays the warning when remaining crosses 30 seconds, even if the tick skips 29950ms', () => {
    expect(
      resolveTimerBells({
        previousRemaining: 31_000,
        remaining: 29_000,
        duration,
        alreadyPlayed: { start: true, warning: false, end: false },
      })
    ).toEqual({ start: false, warning: true, end: false });
  });

  it('plays the end chime when remaining crosses zero', () => {
    expect(
      resolveTimerBells({
        previousRemaining: 1000,
        remaining: 0,
        duration,
        alreadyPlayed: { start: true, warning: true, end: false },
      })
    ).toEqual({ start: false, warning: false, end: true });
  });

  it('does not replay bells that already sounded', () => {
    expect(
      resolveTimerBells({
        previousRemaining: 1000,
        remaining: 0,
        duration,
        alreadyPlayed: { start: true, warning: true, end: true },
      })
    ).toEqual(SILENT_TIMER_BELLS);
  });

  it('does not chime on first paint at zero remaining', () => {
    expect(
      resolveTimerBells({
        previousRemaining: 0,
        remaining: 0,
        duration,
        alreadyPlayed: SILENT_TIMER_BELLS,
      })
    ).toEqual(SILENT_TIMER_BELLS);
  });

  it('plays the end chime when the round is ended early', () => {
    expect(
      resolveTimerBells({
        previousRemaining: 90_000,
        remaining: 90_000,
        duration,
        alreadyPlayed: { start: true, warning: false, end: false },
        endedEarly: true,
      })
    ).toEqual({ start: false, warning: false, end: true });
  });

  it('does not replay the end chime if the timer already reached zero', () => {
    expect(
      resolveTimerBells({
        previousRemaining: 0,
        remaining: 0,
        duration,
        alreadyPlayed: { start: true, warning: true, end: true },
        endedEarly: true,
      })
    ).toEqual(SILENT_TIMER_BELLS);
  });
});

describe('resolveTimerDuration', () => {
  it('prefers an explicit phase duration', () => {
    expect(resolveTimerDuration(15 * 60 * 1000, 60_000)).toBe(15 * 60 * 1000);
  });

  it('treats zero as missing and infers from remaining', () => {
    expect(resolveTimerDuration(0, 120_000)).toBe(120_000);
  });
});

describe('isTimerReset', () => {
  it('detects a new round when remaining jumps up', () => {
    expect(isTimerReset(0, duration)).toBe(true);
    expect(isTimerReset(60_000, 59_000)).toBe(false);
  });
});
