export const TIMER_START_CHIME_AT_MS = 1000;
export const TIMER_WARNING_CHIME_AT_MS = 30_000;
/** Catch a delayed first tick without chiming for late joiners. */
export const TIMER_START_CATCHUP_MS = 5_000;
/** Remaining jumped up by at least this much → a new phase/round. */
export const TIMER_RESET_JUMP_MS = 1000;

export interface TimerBellFlags {
  start: boolean;
  warning: boolean;
  end: boolean;
}

export interface ResolveTimerBellsInput {
  previousRemaining: number;
  remaining: number;
  duration: number;
  alreadyPlayed: TimerBellFlags;
  /** Host (or equivalent) ended the phase while time was still on the clock. */
  endedEarly?: boolean;
}

export const SILENT_TIMER_BELLS: TimerBellFlags = {
  start: false,
  warning: false,
  end: false,
};

export function resolveTimerDuration(
  phaseDuration: number | undefined,
  remaining: number,
  previousRemaining = remaining
): number {
  if (phaseDuration && phaseDuration > 0) {
    return phaseDuration;
  }
  return Math.max(remaining, previousRemaining, 0);
}

export function isTimerReset(previousRemaining: number, remaining: number): boolean {
  return remaining > previousRemaining + TIMER_RESET_JUMP_MS;
}

/**
 * Decide which singing-bowl cues to fire for this tick.
 * Uses threshold crossing so 1s countdown jumps cannot miss a 50ms window.
 */
export function resolveTimerBells({
  previousRemaining,
  remaining,
  duration,
  alreadyPlayed,
  endedEarly = false,
}: ResolveTimerBellsInput): TimerBellFlags {
  if (duration <= 0) {
    return { ...SILENT_TIMER_BELLS };
  }

  const previousElapsed = duration - previousRemaining;
  const elapsed = duration - remaining;

  const start =
    !alreadyPlayed.start &&
    previousElapsed < TIMER_START_CHIME_AT_MS &&
    elapsed >= TIMER_START_CHIME_AT_MS &&
    elapsed < TIMER_START_CHIME_AT_MS + TIMER_START_CATCHUP_MS;

  const warning =
    !alreadyPlayed.warning &&
    previousRemaining > TIMER_WARNING_CHIME_AT_MS &&
    remaining <= TIMER_WARNING_CHIME_AT_MS;

  const end =
    !alreadyPlayed.end &&
    previousRemaining > 0 &&
    (remaining <= 0 || Boolean(endedEarly));

  return { start, warning, end };
}
