/**
 * Christadelphian hymn-book gate.
 * Clue format: CHB{hymn} V{verse} L{line} W{word}
 * (Christadelphian Hymn Book — verse, line, word)
 *
 * Rotation: one clue per ISO week (cycles every 6 weeks).
 */

export interface ChristadelphianChallenge {
  id: number;
  clue: string;
  /** Exact hymn word; compared case-insensitively after trim. */
  answer: string;
}

export const CHRISTELPHIAN_CHALLENGES: readonly ChristadelphianChallenge[] = [
  { id: 0, clue: 'CHB245 V1 L2 W3', answer: 'battle' },
  { id: 1, clue: 'CHB163 V1 L2 W1', answer: 'consecrated' },
  { id: 2, clue: 'CHB212 V2 L2 W2', answer: 'share' },
  { id: 3, clue: 'CHB131 V2 L3 W2', answer: 'draws' },
  { id: 4, clue: 'CHB327 V2 L3 W2', answer: 'loving' },
  { id: 5, clue: 'CHB87 V2 L1 W4', answer: 'round' },
] as const;

export const CHRISTELPHIAN_GATE_STORAGE_KEY = 'swiftToHear.christadelphianGate';

function getUtcWeekIndex(date: Date = new Date()): number {
  // ISO-ish week number, stable across timezones for rotation
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

export function getCurrentChallengeIndex(date: Date = new Date()): number {
  return getUtcWeekIndex(date) % CHRISTELPHIAN_CHALLENGES.length;
}

export function getCurrentChallenge(date: Date = new Date()): ChristadelphianChallenge {
  return CHRISTELPHIAN_CHALLENGES[getCurrentChallengeIndex(date)];
}

export function normalizeGateAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}'’-]/gu, '');
}

export function verifyChristadelphianAnswer(
  attempt: string,
  date: Date = new Date()
): boolean {
  const challenge = getCurrentChallenge(date);
  if (!challenge.answer) return false;
  return normalizeGateAnswer(attempt) === normalizeGateAnswer(challenge.answer);
}

interface GateUnlockRecord {
  challengeId: number;
  unlockedAt: string;
}

export function isChristadelphianUnlocked(date: Date = new Date()): boolean {
  try {
    const raw = localStorage.getItem(CHRISTELPHIAN_GATE_STORAGE_KEY);
    if (!raw) return false;
    const record = JSON.parse(raw) as GateUnlockRecord;
    return record.challengeId === getCurrentChallenge(date).id;
  } catch {
    return false;
  }
}

export function unlockChristadelphianGate(date: Date = new Date()): void {
  const record: GateUnlockRecord = {
    challengeId: getCurrentChallenge(date).id,
    unlockedAt: date.toISOString(),
  };
  try {
    localStorage.setItem(CHRISTELPHIAN_GATE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore quota / private mode
  }
}

export function clearChristadelphianGate(): void {
  try {
    localStorage.removeItem(CHRISTELPHIAN_GATE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
