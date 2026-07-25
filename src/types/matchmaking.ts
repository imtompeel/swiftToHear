import { Timestamp, FieldValue } from 'firebase/firestore';
import type { AudiencePreference } from '../services/audiencePreference';

export type MatchMode = 'curious' | 'full';

export type MatchAudience = AudiencePreference;

export type MatchRoomStatus = 'filling' | 'matched' | 'expired';

export interface MatchRoomParticipant {
  id: string;
  name: string;
  joinedAt: Timestamp | FieldValue;
}

export interface MatchRoom {
  roomId: string;
  mode: MatchMode;
  /** Funnel pool — users only match within the same audience. */
  audience: MatchAudience;
  status: MatchRoomStatus;
  targetSize: number;
  participants: MatchRoomParticipant[];
  participantIds: string[];
  createdAt: Timestamp | FieldValue;
  lastHeartbeatAt: Timestamp | FieldValue;
  matchedSessionId?: string;
}

export const MATCH_TARGET_SIZE = 3;

export const MATCH_MODE_DURATION_MS: Record<MatchMode, number> = {
  curious: 2 * 60 * 1000,
  full: 5 * 60 * 1000,
};

export const MATCH_FREE_DIALOGUE_MS = 10 * 60 * 1000;

export const MATCH_DEFAULT_TOPIC = "What's alive for you right now?";

export const MATCH_HEARTBEAT_INTERVAL_MS = 20_000;
export const MATCH_STALE_MS = 60_000;

export const MATCH_ROLES = ['speaker', 'listener', 'scribe'] as const;
