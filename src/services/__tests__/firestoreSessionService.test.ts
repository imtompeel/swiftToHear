import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runTransaction, getDoc, updateDoc } from 'firebase/firestore';
import { FirestoreSessionService } from '../firestoreSessionService';
import type { SessionData, Participant } from '../../types/sessionTypes';

vi.unmock('../firestoreSessionService');

function makeSession(participants: Participant[]): SessionData {
  return {
    sessionId: 'session-1',
    sessionName: 'Lobby',
    duration: 420000,
    topic: 'Listening',
    hostId: 'host',
    hostName: 'Host',
    createdAt: { seconds: 0, nanoseconds: 0 } as SessionData['createdAt'],
    participants,
    participantIds: participants.map(p => p.id),
    status: 'waiting',
    minParticipants: 2,
    maxParticipants: 4,
    topicSuggestions: [],
    sessionType: 'video',
  };
}

describe('FirestoreSessionService ready state', () => {
  let stored: SessionData;

  beforeEach(() => {
    stored = makeSession([
      { id: 'host', name: 'Host', role: '', status: 'ready' },
      { id: 'guest-a', name: 'Alex', role: '', status: 'not-ready' },
      { id: 'guest-b', name: 'Blair', role: '', status: 'ready' },
    ]);

    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const tx = {
        get: vi.fn(async () => ({
          exists: () => true,
          data: () => structuredClone(stored),
        })),
        update: vi.fn((_ref: unknown, payload: Partial<SessionData>) => {
          stored = { ...stored, ...payload } as SessionData;
        }),
        set: vi.fn(),
        delete: vi.fn(),
      };
      return fn(tx);
    });
  });

  it('updates one participant without clobbering another ready flag', async () => {
    const result = await FirestoreSessionService.updateReadyState('session-1', 'guest-a', true);

    expect(result?.participants.find(p => p.id === 'guest-a')?.status).toBe('ready');
    expect(result?.participants.find(p => p.id === 'guest-b')?.status).toBe('ready');
    expect(runTransaction).toHaveBeenCalled();
  });

  it('keeps an earlier ready write when a second guest marks ready afterwards', async () => {
    await FirestoreSessionService.updateReadyState('session-1', 'guest-a', true);
    const result = await FirestoreSessionService.updateReadyState('session-1', 'guest-b', true);

    expect(result?.participants.map(p => p.status)).toEqual(['ready', 'ready', 'ready']);
  });
});

describe('FirestoreSessionService hello check-in roles', () => {
  let stored: SessionData;

  beforeEach(() => {
    vi.mocked(getDoc).mockReset();
    vi.mocked(updateDoc).mockReset();
  });

  it('refuses to leave hello check-in while a participant has no role', async () => {
    stored = makeSession([
      { id: 'host', name: 'Host', role: 'speaker', status: 'ready' },
      { id: 'guest-a', name: 'Alex', role: '', status: 'ready' },
    ]);
    stored.status = 'active';
    stored.currentPhase = 'hello-checkin';

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => structuredClone(stored),
    } as never);

    await expect(
      FirestoreSessionService.completeHelloCheckIn('session-1', 'host')
    ).rejects.toThrow('All participants must choose a role before continuing');

    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('advances to listening once every participant has a role', async () => {
    stored = makeSession([
      { id: 'host', name: 'Host', role: 'speaker', status: 'ready' },
      { id: 'guest-a', name: 'Alex', role: 'listener', status: 'ready' },
    ]);
    stored.status = 'active';
    stored.currentPhase = 'hello-checkin';

    vi.mocked(getDoc).mockImplementation(async () => ({
      exists: () => true,
      data: () => structuredClone(stored),
    }) as never);
    vi.mocked(updateDoc).mockImplementation(async (_ref, payload) => {
      stored = { ...stored, ...(payload as Partial<SessionData>) };
    });

    const result = await FirestoreSessionService.completeHelloCheckIn('session-1', 'host');

    expect(updateDoc).toHaveBeenCalled();
    expect(result?.currentPhase).toBe('listening');
  });

  it('keeps observer available when extra people still need a role', () => {
    const session = makeSession([
      { id: 'a', name: 'A', role: 'speaker', status: 'ready' },
      { id: 'b', name: 'B', role: 'listener', status: 'ready' },
      { id: 'c', name: 'C', role: 'scribe', status: 'ready' },
      { id: 'd', name: 'D', role: 'observer', status: 'ready' },
      { id: 'e', name: 'E', role: '', status: 'ready' },
    ]);

    expect(FirestoreSessionService.getAvailableRoles(session)).toContain('observer');
  });
});

describe('FirestoreSessionService round and scribe feedback', () => {
  let stored: SessionData;

  const threeParticipants: Participant[] = [
    { id: 'host', name: 'Host', role: 'speaker', status: 'ready' },
    { id: 'guest-a', name: 'Alex', role: 'listener', status: 'ready' },
    { id: 'guest-b', name: 'Blair', role: 'scribe', status: 'ready' },
  ];

  function mockStoredSession(session: SessionData) {
    stored = session;
    vi.mocked(getDoc).mockImplementation(async () => ({
      exists: () => true,
      data: () => structuredClone(stored),
    }) as never);
    vi.mocked(updateDoc).mockImplementation(async (_ref, payload) => {
      stored = { ...stored, ...(payload as Partial<SessionData>) };
    });
  }

  beforeEach(() => {
    vi.mocked(getDoc).mockReset();
    vi.mocked(updateDoc).mockReset();
  });

  it('opens scribe feedback after the final speaker without rotating roles', async () => {
    const session = makeSession(threeParticipants);
    session.status = 'active';
    session.currentPhase = 'listening';
    session.currentRound = 3;
    mockStoredSession(session);

    const result = await FirestoreSessionService.completeRound('session-1', 'host');

    expect(result?.currentPhase).toBe('transition');
    expect(result?.currentRound).toBe(3);
    expect(result?.participants.map(p => p.role)).toEqual(['speaker', 'listener', 'scribe']);
  });

  it('moves to completion after the final scribe feedback', async () => {
    const session = makeSession(threeParticipants);
    session.status = 'active';
    session.currentPhase = 'transition';
    session.currentRound = 3;
    mockStoredSession(session);

    const result = await FirestoreSessionService.completeScribeFeedback('session-1', 'host');

    expect(result?.currentPhase).toBe('completion');
    expect(result?.currentRound).toBe(3);
    expect(result?.participants.map(p => p.role)).toEqual(['speaker', 'listener', 'scribe']);
  });

  it('keeps the current scribe in place for mid-session feedback, then rotates into the next listening round', async () => {
    const session = makeSession(threeParticipants);
    session.status = 'active';
    session.currentPhase = 'listening';
    session.currentRound = 1;
    mockStoredSession(session);

    const afterRound = await FirestoreSessionService.completeRound('session-1', 'host');
    expect(afterRound?.currentPhase).toBe('transition');
    expect(afterRound?.currentRound).toBe(1);
    expect(afterRound?.participants.map(p => p.role)).toEqual(['speaker', 'listener', 'scribe']);

    const afterFeedback = await FirestoreSessionService.completeScribeFeedback('session-1', 'host');
    expect(afterFeedback?.currentPhase).toBe('listening');
    expect(afterFeedback?.currentRound).toBe(2);
    expect(afterFeedback?.participants.map(p => p.role)).toEqual(['listener', 'scribe', 'speaker']);
  });

  it('skips scribe feedback after the final speaker in a 2-person session', async () => {
    const session = makeSession([
      { id: 'host', name: 'Host', role: 'speaker', status: 'ready' },
      { id: 'guest-a', name: 'Alex', role: 'listener', status: 'ready' },
    ]);
    session.status = 'active';
    session.currentPhase = 'listening';
    session.currentRound = 2;
    mockStoredSession(session);

    const result = await FirestoreSessionService.completeRound('session-1', 'host');

    expect(result?.currentPhase).toBe('completion');
  });
});
