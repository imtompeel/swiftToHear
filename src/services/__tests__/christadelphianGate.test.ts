import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CHRISTELPHIAN_CHALLENGES,
  clearChristadelphianGate,
  getCurrentChallenge,
  getCurrentChallengeIndex,
  isChristadelphianUnlocked,
  normalizeGateAnswer,
  unlockChristadelphianGate,
  verifyChristadelphianAnswer,
} from '../christadelphianGate';

describe('christadelphianGate', () => {
  beforeEach(() => {
    clearChristadelphianGate();
  });

  afterEach(() => {
    clearChristadelphianGate();
    vi.restoreAllMocks();
  });

  it('exposes six rotating clues', () => {
    expect(CHRISTELPHIAN_CHALLENGES).toHaveLength(6);
    expect(CHRISTELPHIAN_CHALLENGES.every((c) => c.clue.startsWith('CHB'))).toBe(true);
  });

  it('rotates challenge index across weeks', () => {
    // Fixed Mondays in different ISO weeks
    const weekA = getCurrentChallengeIndex(new Date('2026-01-05T12:00:00Z'));
    const weekB = getCurrentChallengeIndex(new Date('2026-01-12T12:00:00Z'));
    expect(weekA).not.toBe(weekB);
    expect(weekA).toBeGreaterThanOrEqual(0);
    expect(weekA).toBeLessThan(6);
  });

  it('normalises answers for comparison', () => {
    expect(normalizeGateAnswer('  Grace, ')).toBe('grace');
    expect(normalizeGateAnswer("Lord's")).toBe("lord's");
  });

  it('accepts the configured answer for a fixed week', () => {
    const date = new Date('2026-01-05T12:00:00Z');
    const challenge = getCurrentChallenge(date);
    expect(challenge.answer.length).toBeGreaterThan(0);
    expect(verifyChristadelphianAnswer(challenge.answer, date)).toBe(true);
    expect(verifyChristadelphianAnswer('wrong-word', date)).toBe(false);
  });

  it('unlocks only for the current challenge id', () => {
    unlockChristadelphianGate(new Date('2026-01-05T12:00:00Z'));
    expect(isChristadelphianUnlocked(new Date('2026-01-05T12:00:00Z'))).toBe(true);
    // A week later is a different challenge — prior unlock should not carry over
    expect(isChristadelphianUnlocked(new Date('2026-01-12T12:00:00Z'))).toBe(false);
  });
});
