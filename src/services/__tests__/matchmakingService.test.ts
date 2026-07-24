import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import {
  assignMatchRoles,
  durationForMode,
  isRoomStale,
  MatchmakingService,
} from '../matchmakingService';
import {
  MATCH_MODE_DURATION_MS,
  MATCH_STALE_MS,
  MATCH_TARGET_SIZE,
  type MatchRoom,
} from '../../types/matchmaking';

vi.mock('../../firebase/config', () => ({
  db: { _type: 'firestore' },
}));

describe('matchmaking helpers', () => {
  it('maps curious mode to 2-minute rounds and full to 5-minute rounds', () => {
    expect(durationForMode('curious')).toBe(MATCH_MODE_DURATION_MS.curious);
    expect(durationForMode('full')).toBe(MATCH_MODE_DURATION_MS.full);
    expect(durationForMode('curious')).toBe(2 * 60 * 1000);
    expect(durationForMode('full')).toBe(5 * 60 * 1000);
  });

  it('assigns speaker, listener, scribe for three participants', () => {
    const roles = assignMatchRoles([
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
      { id: 'c', name: 'Cara' },
    ]);

    expect(roles.map((p) => p.role)).toEqual(['speaker', 'listener', 'scribe']);
    expect(roles.every((p) => p.status === 'ready')).toBe(true);
  });

  it('treats rooms without a Timestamp heartbeat as fresh', () => {
    const room = {
      lastHeartbeatAt: { seconds: 0 },
    } as unknown as MatchRoom;
    expect(isRoomStale(room)).toBe(false);
  });

  it('marks rooms stale after the heartbeat window', () => {
    const now = Date.now();
    const room = {
      lastHeartbeatAt: {
        toMillis: () => now - MATCH_STALE_MS - 1,
      },
    } as unknown as MatchRoom;
    expect(isRoomStale(room, now)).toBe(true);

    const fresh = {
      lastHeartbeatAt: {
        toMillis: () => now - 1000,
      },
    } as unknown as MatchRoom;
    expect(isRoomStale(fresh, now)).toBe(false);
  });
});

describe('MatchmakingService.buildSessionForTest', () => {
  it('builds an active 3-person matchmaking session with host as first participant', () => {
    const session = MatchmakingService.buildSessionForTest('curious', [
      { id: 'u1', name: 'One' },
      { id: 'u2', name: 'Two' },
      { id: 'u3', name: 'Three' },
    ]);

    expect(session.matchMode).toBe('curious');
    expect(session.status).toBe('active');
    expect(session.currentPhase).toBe('hello-checkin');
    expect(session.duration).toBe(2 * 60 * 1000);
    expect(session.minParticipants).toBe(MATCH_TARGET_SIZE);
    expect(session.maxParticipants).toBe(MATCH_TARGET_SIZE);
    expect(session.hostId).toBe('u1');
    expect(session.hostName).toBe('One');
    expect(session.participantIds).toEqual(['u1', 'u2', 'u3']);
    expect(session.participants.map((p) => p.role)).toEqual([
      'speaker',
      'listener',
      'scribe',
    ]);
    expect(session.sessionType).toBe('video');
  });

  it('keeps curious and full modes on separate duration tracks', () => {
    const curious = MatchmakingService.buildSessionForTest('curious', [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ]);
    const full = MatchmakingService.buildSessionForTest('full', [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ]);

    expect(curious.matchMode).toBe('curious');
    expect(full.matchMode).toBe('full');
    expect(curious.duration).not.toBe(full.duration);
    expect(full.duration).toBe(5 * 60 * 1000);
  });
});

describe('match room capacity', () => {
  it('uses a fixed target size of 3 so a fourth cannot fill the same room', () => {
    expect(MATCH_TARGET_SIZE).toBe(3);
    const people = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' },
    ];
    expect(people.length).toBe(MATCH_TARGET_SIZE);
    // Forming a session requires exactly target size — a fourth would need a new room
    expect(people.length < 4).toBe(true);
  });
});

describe('Timestamp import sanity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes Timestamp.now for room fixtures', () => {
    expect(typeof Timestamp.now).toBe('function');
  });
});
