import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  runTransaction,
  type Transaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SessionData, Participant } from '../types/sessionTypes';
import {
  MatchMode,
  MatchRoom,
  MatchRoomParticipant,
  MATCH_TARGET_SIZE,
  MATCH_MODE_DURATION_MS,
  MATCH_DEFAULT_TOPIC,
  MATCH_STALE_MS,
  MATCH_ROLES,
} from '../types/matchmaking';

export function durationForMode(mode: MatchMode): number {
  return MATCH_MODE_DURATION_MS[mode];
}

export function assignMatchRoles(
  participants: Array<{ id: string; name: string }>
): Participant[] {
  return participants.map((p, index) => ({
    id: p.id,
    name: p.name,
    role: MATCH_ROLES[index % MATCH_ROLES.length],
    status: 'ready' as const,
  }));
}

export function isRoomStale(
  room: MatchRoom,
  nowMs: number = Date.now()
): boolean {
  const heartbeat = room.lastHeartbeatAt;
  if (!heartbeat || typeof (heartbeat as Timestamp).toMillis !== 'function') {
    // serverTimestamp pending or FieldValue — treat as fresh
    return false;
  }
  return nowMs - (heartbeat as Timestamp).toMillis() > MATCH_STALE_MS;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildMatchedSession(
  sessionId: string,
  room: MatchRoom,
  participants: Participant[]
): SessionData {
  const host = participants[0];
  return {
    sessionId,
    sessionName: room.mode === 'curious' ? 'Curious practice' : 'Full practice',
    duration: durationForMode(room.mode),
    topic: MATCH_DEFAULT_TOPIC,
    hostId: host.id,
    hostName: host.name,
    hostRole: 'participant',
    createdAt: serverTimestamp() as Timestamp,
    participants,
    participantIds: participants.map((p) => p.id),
    status: 'active',
    minParticipants: MATCH_TARGET_SIZE,
    maxParticipants: MATCH_TARGET_SIZE,
    topicSuggestions: [],
    sessionType: 'video',
    matchMode: room.mode,
    currentPhase: 'hello-checkin',
    currentRound: 1,
    phaseStartTime: serverTimestamp() as Timestamp,
    groupConfiguration: {
      autoAssignRoles: true,
    },
  };
}

export class MatchmakingService {
  private static COLLECTION = 'matchRooms';
  private static SESSIONS = 'sessions';

  static async joinQueue(params: {
    mode: MatchMode;
    userId: string;
    userName: string;
  }): Promise<{ roomId: string }> {
    const { mode, userId, userName } = params;

    // Leave any existing filling rooms for this user first
    await this.leaveAllQueuesForUser(userId);

    const candidate = await this.findJoinableRoom(mode);

    if (candidate) {
      try {
        await this.joinExistingRoom(candidate.roomId, userId, userName);
        return { roomId: candidate.roomId };
      } catch (err) {
        // Room filled or expired under us — create a new one
        console.warn('Failed to join existing match room, creating new:', err);
      }
    }

    const roomId = await this.createRoom(mode, userId, userName);
    return { roomId };
  }

  private static async findJoinableRoom(mode: MatchMode): Promise<MatchRoom | null> {
    const q = query(
      collection(db, this.COLLECTION),
      where('mode', '==', mode),
      where('status', '==', 'filling'),
      orderBy('createdAt', 'asc'),
      limit(10)
    );

    const snap = await getDocs(q);
    const now = Date.now();

    for (const d of snap.docs) {
      const room = d.data() as MatchRoom;
      if (isRoomStale(room, now)) {
        // Opportunistic cleanup — best effort
        void this.expireRoom(room.roomId);
        continue;
      }
      if (room.participants.length >= MATCH_TARGET_SIZE) {
        continue;
      }
      return room;
    }

    return null;
  }

  private static async createRoom(
    mode: MatchMode,
    userId: string,
    userName: string
  ): Promise<string> {
    const roomId = generateId('match');
    const participant: MatchRoomParticipant = {
      id: userId,
      name: userName,
      joinedAt: Timestamp.now(),
    };

    const room: MatchRoom = {
      roomId,
      mode,
      status: 'filling',
      targetSize: MATCH_TARGET_SIZE,
      participants: [participant],
      participantIds: [userId],
      createdAt: serverTimestamp() as Timestamp,
      lastHeartbeatAt: serverTimestamp() as Timestamp,
    };

    await setDoc(doc(db, this.COLLECTION, roomId), room);
    return roomId;
  }

  private static async joinExistingRoom(
    roomId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const roomRef = doc(db, this.COLLECTION, roomId);
    const sessionId = generateId('session');

    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists()) {
        throw new Error('Match room no longer exists');
      }

      const room = roomSnap.data() as MatchRoom;
      if (room.status !== 'filling') {
        throw new Error('Match room is not open');
      }
      if (room.participantIds.includes(userId)) {
        return; // already in room
      }
      if (room.participants.length >= MATCH_TARGET_SIZE) {
        throw new Error('Match room is full');
      }

      const newParticipant: MatchRoomParticipant = {
        id: userId,
        name: userName,
        joinedAt: Timestamp.now(),
      };

      const updatedParticipants = [...room.participants, newParticipant];
      const updatedIds = [...room.participantIds, userId];

      if (updatedParticipants.length < MATCH_TARGET_SIZE) {
        transaction.update(roomRef, {
          participants: updatedParticipants,
          participantIds: updatedIds,
          lastHeartbeatAt: serverTimestamp(),
        });
        return;
      }

      // Form the session with all three participants
      this.formSessionInTransaction(
        transaction,
        roomRef,
        { ...room, participants: updatedParticipants, participantIds: updatedIds },
        sessionId
      );
    });
  }

  private static formSessionInTransaction(
    transaction: Transaction,
    roomRef: ReturnType<typeof doc>,
    room: MatchRoom,
    sessionId: string
  ): void {
    const roleParticipants = assignMatchRoles(
      room.participants.map((p) => ({ id: p.id, name: p.name }))
    );
    const session = buildMatchedSession(sessionId, room, roleParticipants);
    const sessionRef = doc(db, this.SESSIONS, sessionId);

    transaction.set(sessionRef, session);
    transaction.update(roomRef, {
      participants: room.participants,
      participantIds: room.participantIds,
      status: 'matched',
      matchedSessionId: sessionId,
      lastHeartbeatAt: serverTimestamp(),
    });
  }

  static async leaveQueue(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(db, this.COLLECTION, roomId);

    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists()) return;

      const room = roomSnap.data() as MatchRoom;
      if (room.status !== 'filling') return;

      const updatedParticipants = room.participants.filter((p) => p.id !== userId);
      const updatedIds = room.participantIds.filter((id) => id !== userId);

      if (updatedParticipants.length === 0) {
        transaction.delete(roomRef);
        return;
      }

      transaction.update(roomRef, {
        participants: updatedParticipants,
        participantIds: updatedIds,
        lastHeartbeatAt: serverTimestamp(),
      });
    });
  }

  static async leaveAllQueuesForUser(userId: string): Promise<void> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'filling'),
      where('participantIds', 'array-contains', userId),
      limit(5)
    );

    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => this.leaveQueue(d.id, userId)));
  }

  static async heartbeat(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(db, this.COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const room = snap.data() as MatchRoom;
    if (room.status !== 'filling') return;
    if (!room.participantIds.includes(userId)) return;

    await updateDoc(roomRef, {
      lastHeartbeatAt: serverTimestamp(),
    });
  }

  static subscribeToRoom(
    roomId: string,
    callback: (room: MatchRoom | null) => void
  ): () => void {
    return onSnapshot(
      doc(db, this.COLLECTION, roomId),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as MatchRoom);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to match room:', error);
        callback(null);
      }
    );
  }

  private static async expireRoom(roomId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION, roomId), {
        status: 'expired',
      });
    } catch {
      // ignore — room may already be gone
    }
  }

  /** Test helper: form a session payload without writing (for unit tests). */
  static buildSessionForTest(
    mode: MatchMode,
    people: Array<{ id: string; name: string }>
  ): SessionData {
    const participants = assignMatchRoles(people);
    const room: MatchRoom = {
      roomId: 'test-room',
      mode,
      status: 'filling',
      targetSize: MATCH_TARGET_SIZE,
      participants: people.map((p) => ({
        id: p.id,
        name: p.name,
        joinedAt: Timestamp.now(),
      })),
      participantIds: people.map((p) => p.id),
      createdAt: Timestamp.now(),
      lastHeartbeatAt: Timestamp.now(),
    };
    return buildMatchedSession('test-session', room, participants);
  }
}
