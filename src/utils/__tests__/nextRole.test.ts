import { describe, expect, it } from 'vitest';
import { getNextRole, getRoleDisplayKey, getTotalRounds } from '../nextRole';

describe('nextRole', () => {
  it('rotates two-person roles', () => {
    expect(getNextRole('speaker', 2)).toBe('listener');
    expect(getNextRole('listener', 2)).toBe('speaker');
  });

  it('rotates three-person roles', () => {
    expect(getNextRole('speaker', 3)).toBe('listener');
    expect(getNextRole('listener', 3)).toBe('scribe');
    expect(getNextRole('scribe', 3)).toBe('speaker');
  });

  it('rotates four-person roles including observer', () => {
    expect(getNextRole('scribe', 4)).toBe('observer');
    expect(getNextRole('observer', 4)).toBe('speaker');
    expect(getNextRole('observer-temporary', 4)).toBe('speaker');
  });

  it('keeps a permanent observer in place', () => {
    expect(getNextRole('observer-permanent', 4, true)).toBe('observer-permanent');
  });

  it('maps observer variants to a display key', () => {
    expect(getRoleDisplayKey('observer-temporary')).toBe('observer');
    expect(getRoleDisplayKey('scribe')).toBe('scribe');
  });

  it('returns the expected number of rounds', () => {
    expect(getTotalRounds(2)).toBe(2);
    expect(getTotalRounds(3)).toBe(3);
    expect(getTotalRounds(4)).toBe(4);
  });
});
