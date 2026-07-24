import { renderHook, act } from '@testing-library/react';
import { useSpeakingTimer } from '../useSpeakingTimer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useSpeakingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values when inactive', () => {
    const { result } = renderHook(() =>
      useSpeakingTimer({
        isActive: false,
        dailyFrame: null,
      })
    );

    expect(result.current.continuousSpeakingDuration).toBe(0);
    expect(result.current.isSpeakerActive).toBe(false);
    expect(result.current.shouldShowTimer).toBe(false);
  });

  it('should mark the speaker active when the session is active without Daily', () => {
    const { result } = renderHook(() =>
      useSpeakingTimer({
        isActive: true,
        dailyFrame: null,
      })
    );

    expect(result.current.isSpeakerActive).toBe(true);
  });

  it('should clear timer state when resetTimer is called', () => {
    const { result } = renderHook(() =>
      useSpeakingTimer({
        isActive: true,
        dailyFrame: null,
      })
    );

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.shouldShowTimer).toBe(false);
    expect(result.current.continuousSpeakingDuration).toBe(0);
  });
});
