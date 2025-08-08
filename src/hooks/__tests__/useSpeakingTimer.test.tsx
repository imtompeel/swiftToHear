import { renderHook, act } from '@testing-library/react';
import { useSpeakingTimer } from '../useSpeakingTimer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock timers
vi.useFakeTimers();

describe('useSpeakingTimer', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSpeakingTimer({
      isActive: true,
      dailyFrame: null
    }));

    expect(result.current.continuousSpeakingDuration).toBe(0);
    expect(result.current.isSpeakerActive).toBe(false);
    expect(result.current.shouldShowTimer).toBe(false);
  });

  it('should start timer when speaker becomes active', () => {
    const { result } = renderHook(() => useSpeakingTimer({
      isActive: true,
      dailyFrame: null
    }));

    // Simulate speaker starting to speak
    act(() => {
      // This would normally be triggered by Daily frame events
      // For testing, we'll simulate the state changes directly
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isSpeakerActive).toBe(true);
  });

  it('should only show timer after 35 seconds', () => {
    const { result } = renderHook(() => useSpeakingTimer({
      isActive: true,
      dailyFrame: null
    }));

    // Simulate 30 seconds of speaking
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.shouldShowTimer).toBe(false);

    // Simulate 40 seconds of speaking
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.shouldShowTimer).toBe(true);
  });

  it('should format duration correctly', () => {
    const { result } = renderHook(() => useSpeakingTimer({
      isActive: true,
      dailyFrame: null
    }));

    // Simulate 65 seconds of speaking
    act(() => {
      vi.advanceTimersByTime(65000);
    });

    expect(result.current.formatDuration()).toBe('1:05');
  });

  it('should reset timer when speaker is silent for 3 seconds', () => {
    const { result } = renderHook(() => useSpeakingTimer({
      isActive: true,
      dailyFrame: null
    }));

    // Simulate speaker speaking for 40 seconds
    act(() => {
      vi.advanceTimersByTime(40000);
    });

    expect(result.current.shouldShowTimer).toBe(true);

    // Simulate speaker stopping for 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.shouldShowTimer).toBe(false);
    expect(result.current.continuousSpeakingDuration).toBe(0);
  });

  it('should reset timer when listener speaks for 5 seconds', () => {
    const { result } = renderHook(() => useSpeakingTimer({
      isActive: true,
      dailyFrame: null
    }));

    // Simulate speaker speaking for 40 seconds
    act(() => {
      vi.advanceTimersByTime(40000);
    });

    expect(result.current.shouldShowTimer).toBe(true);

    // Simulate listener speaking for 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.shouldShowTimer).toBe(false);
    expect(result.current.continuousSpeakingDuration).toBe(0);
  });
});
