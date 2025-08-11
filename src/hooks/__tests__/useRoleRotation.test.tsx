import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRoleRotation } from '../useRoleRotation';

describe('useRoleRotation', () => {
  const mockSetSelectedRole = vi.fn();
  const mockSetRoundNumber = vi.fn();
  const mockSetCurrentPhase = vi.fn();

  const defaultProps = {
    isPassiveObserver: false,
    selectedRole: null,
    roundNumber: 1,
    setSelectedRole: mockSetSelectedRole,
    setRoundNumber: mockSetRoundNumber,
    setCurrentPhase: mockSetCurrentPhase,
  };

  describe('2-person sessions', () => {
    it('should return 2 total rounds for 2-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' }
          ]
        })
      );

      expect(result.current.getTotalRounds()).toBe(2);
    });

    it('should rotate speaker to listener for 2-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' }
          ]
        })
      );

      const nextRole = result.current.getNextRole('speaker');
      expect(nextRole).toBe('listener');
    });

    it('should rotate listener to speaker for 2-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' }
          ]
        })
      );

      const nextRole = result.current.getNextRole('listener');
      expect(nextRole).toBe('speaker');
    });

    it('should default to speaker for invalid roles in 2-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' }
          ]
        })
      );

      const nextRole = result.current.getNextRole('scribe'); // Invalid role for 2-person
      expect(nextRole).toBe('speaker');
    });
  });

  describe('3-person sessions', () => {
    it('should return 3 total rounds for 3-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' },
            { id: '3', name: 'User 3', role: 'scribe' }
          ]
        })
      );

      expect(result.current.getTotalRounds()).toBe(3);
    });

    it('should rotate roles correctly for 3-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' },
            { id: '3', name: 'User 3', role: 'scribe' }
          ]
        })
      );

      expect(result.current.getNextRole('speaker')).toBe('listener');
      expect(result.current.getNextRole('listener')).toBe('scribe');
      expect(result.current.getNextRole('scribe')).toBe('speaker');
    });
  });

  describe('4-person sessions', () => {
    it('should return 4 total rounds for 4-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' },
            { id: '3', name: 'User 3', role: 'scribe' },
            { id: '4', name: 'User 4', role: 'observer-temporary' }
          ]
        })
      );

      expect(result.current.getTotalRounds()).toBe(4);
    });

    it('should rotate roles correctly for 4-person sessions', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' },
            { id: '3', name: 'User 3', role: 'scribe' },
            { id: '4', name: 'User 4', role: 'observer-temporary' }
          ]
        })
      );

      expect(result.current.getNextRole('speaker')).toBe('listener');
      expect(result.current.getNextRole('listener')).toBe('scribe');
      expect(result.current.getNextRole('scribe')).toBe('observer-temporary');
      expect(result.current.getNextRole('observer-temporary')).toBe('speaker');
    });
  });

  describe('Passive observer', () => {
    it('should always return observer-permanent for passive observers', () => {
      const { result } = renderHook(() => 
        useRoleRotation({
          ...defaultProps,
          isPassiveObserver: true,
          participants: [
            { id: '1', name: 'User 1', role: 'speaker' },
            { id: '2', name: 'User 2', role: 'listener' }
          ]
        })
      );

      const nextRole = result.current.getNextRole('speaker');
      expect(nextRole).toBe('observer-permanent');
    });
  });
});
