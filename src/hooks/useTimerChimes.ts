import { useEffect, useRef } from 'react';
import {
  armTimerChimes,
  playTimerChime,
  stopTimerChimes,
  unlockTimerChime,
} from '../services/chimePlayer';
import {
  isTimerReset,
  resolveTimerBells,
  resolveTimerDuration,
  SILENT_TIMER_BELLS,
  type TimerBellFlags,
} from '../utils/timerBells';

interface UseTimerChimesOptions {
  timeRemaining: number;
  phaseDuration?: number;
  isActive?: boolean;
  isMuted?: boolean;
  /** Skip the start cue when the caller already chimed on an explicit Start click. */
  skipStart?: boolean;
  /** Play the end bell if the timer is stopped while time remains (host ends the round early). */
  endOnInactive?: boolean;
  playChime?: () => void | Promise<boolean>;
}

export function useTimerChimes({
  timeRemaining,
  phaseDuration,
  isActive = false,
  isMuted = false,
  skipStart = false,
  endOnInactive = false,
  playChime = playTimerChime,
}: UseTimerChimesOptions): void {
  const previousRemainingRef = useRef(timeRemaining);
  const previousActiveRef = useRef(isActive);
  const playedRef = useRef<TimerBellFlags>({
    ...SILENT_TIMER_BELLS,
    start: skipStart,
  });

  useEffect(() => {
    if (isActive) {
      armTimerChimes();
      unlockTimerChime();
    }
  }, [isActive]);

  useEffect(() => {
    return () => stopTimerChimes();
  }, []);

  useEffect(() => {
    if (skipStart) {
      playedRef.current.start = true;
    }
  }, [skipStart]);

  useEffect(() => {
    const previousRemaining = previousRemainingRef.current;
    const becameInactive = previousActiveRef.current && !isActive;

    if (isTimerReset(previousRemaining, timeRemaining) && !becameInactive) {
      playedRef.current = {
        ...SILENT_TIMER_BELLS,
        start: skipStart,
      };
    }

    const duration = resolveTimerDuration(
      phaseDuration,
      timeRemaining,
      previousRemaining
    );
    const bells = resolveTimerBells({
      previousRemaining,
      remaining: timeRemaining,
      duration,
      alreadyPlayed: playedRef.current,
      endedEarly: Boolean(endOnInactive && becameInactive),
    });

    playedRef.current = {
      start: playedRef.current.start || bells.start,
      warning: playedRef.current.warning || bells.warning,
      end: playedRef.current.end || bells.end,
    };

    const shouldSound =
      !isMuted && (isActive || Boolean(endOnInactive && becameInactive));
    const shouldPlay = shouldSound && (bells.start || bells.warning || bells.end);

    const playThenMaybeStop = async () => {
      if (shouldPlay) {
        await playChime();
      }
      if (!isActive) {
        stopTimerChimes();
      }
    };
    void playThenMaybeStop();

    previousRemainingRef.current = timeRemaining;
    previousActiveRef.current = isActive;
  }, [timeRemaining, phaseDuration, isActive, isMuted, skipStart, endOnInactive, playChime]);
}
