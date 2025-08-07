import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSessionState } from '../useSessionState';

describe('useSessionState Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));
      
      expect(result.current.currentPhase).toBe('initialization');
      expect(result.current.selectedRole).toBeNull();
      expect(result.current.currentTopic).toBe('');
      expect(result.current.roundNumber).toBe(1);
      expect(result.current.sessionActive).toBe(false);
      expect(result.current.sessionStarted).toBe(false);
      expect(result.current.isPassiveObserver).toBe(false);
    });

    it('should initialize with provided props', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'practice',
        sessionPhase: 'practice',
        userRole: 'speaker',
        selectedTopic: 'Test topic',
        currentRound: 2,
      }));
      
      expect(result.current.currentPhase).toBe('practice');
      expect(result.current.selectedRole).toBe('speaker');
      expect(result.current.currentTopic).toBe('Test topic');
      expect(result.current.roundNumber).toBe(2);
      expect(result.current.sessionActive).toBe(true);
      expect(result.current.sessionStarted).toBe(true);
    });

    it('should update state when props change', () => {
      const { result, rerender } = renderHook(
        (props) => useSessionState(props),
        {
          initialProps: {
            phase: 'initialization',
            currentRound: 1,
          }
        }
      );

      expect(result.current.currentPhase).toBe('initialization');
      expect(result.current.roundNumber).toBe(1);

      rerender({
        phase: 'initialization',
        sessionPhase: 'practice',
        userRole: 'listener' as const,
        selectedTopic: 'New topic',
        currentRound: 3,
      });

      expect(result.current.currentPhase).toBe('practice');
      expect(result.current.selectedRole).toBe('listener');
      expect(result.current.currentTopic).toBe('New topic');
      expect(result.current.roundNumber).toBe(3);
    });
  });

  describe('Role Management', () => {
    it('should handle role selection', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      act(() => {
        result.current.handleRoleSelection('speaker');
      });

      expect(result.current.selectedRole).toBe('speaker');
      expect(result.current.isPassiveObserver).toBe(false);
    });

    it('should mark passive observer when observer role selected', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      act(() => {
        result.current.handleRoleSelection('observer-permanent');
      });

      expect(result.current.selectedRole).toBe('observer');
      expect(result.current.isPassiveObserver).toBe(true);
    });
  });

  describe('Session Flow', () => {
    it('should handle session start', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionStarted).toBe(true);
      expect(result.current.sessionActive).toBe(true);
      expect(result.current.currentPhase).toBe('practice');
    });

    it('should handle topic changes', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      act(() => {
        result.current.setCurrentTopic('New topic');
      });

      expect(result.current.currentTopic).toBe('New topic');
    });

    it('should handle phase transitions', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      act(() => {
        result.current.setCurrentPhase('topic-selection');
      });

      expect(result.current.currentPhase).toBe('topic-selection');
    });
  });

  describe('State Setters', () => {
    it('should expose all necessary setters', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      expect(typeof result.current.setCurrentPhase).toBe('function');
      expect(typeof result.current.setSelectedRole).toBe('function');
      expect(typeof result.current.setCurrentTopic).toBe('function');
      expect(typeof result.current.setRoundNumber).toBe('function');
    });

    it('should update round number', () => {
      const { result } = renderHook(() => useSessionState({
        phase: 'initialization',
        currentRound: 1,
      }));

      act(() => {
        result.current.setRoundNumber(3);
      });

      expect(result.current.roundNumber).toBe(3);
    });
  });
});