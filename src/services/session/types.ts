import { Timestamp } from 'firebase/firestore';

export interface SessionData {
  sessionId: string;
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostName: string;
  hostRole?: 'participant' | 'observer-permanent';
  createdAt: Timestamp;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  minParticipants: number;
  maxParticipants: number;
  topicSuggestions: TopicSuggestion[];
  sessionType?: 'video' | 'in-person' | 'hybrid';
  currentPhase?: 'topic-selection' | 'hello-checkin' | 'listening' | 'transition' | 'reflection' | 'completion' | 'free-dialogue' | 'completed' | undefined;
  phaseStartTime?: Timestamp;
  currentRound?: number;
  fivePersonChoice?: 'split' | 'together';
  groupConfiguration?: {
    autoAssignRoles: boolean;
  };
  scribeNotes?: string; // Notes from the current scribe
  accumulatedScribeNotes?: string; // All scribe notes accumulated across rounds
  safetyTimeout?: {
    isActive: boolean;
    requestedBy: string | null;
    requestedByUserName: string | null;
    startTime: Timestamp | null;
  };
}

export interface TopicSuggestion {
  id: string;
  topic: string;
  suggestedBy: string;
  suggestedByUserId: string;
  suggestedAt: Timestamp | Date;
  votes: number;
  voters: string[]; // Array of user IDs who voted for this topic
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'ready' | 'not-ready' | 'connecting';
  connectionStatus?: 'good' | 'poor' | 'disconnected';
  handRaised?: boolean;
}

export interface JoinData {
  sessionId: string;
  userId: string;
  userName: string;
  role?: string; // Optional when auto-assign is enabled
}
