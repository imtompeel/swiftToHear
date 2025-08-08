import { Timestamp } from 'firebase/firestore';

// Enhanced data models for group sessions
export interface GroupSessionData {
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
  currentPhase?: 'topic-selection' | 'hello-checkin' | 'listening' | 'transition' | 'reflection' | 'completion' | 'free-dialogue' | 'completed' | undefined;
  phaseStartTime?: Timestamp;
  currentRound?: number;
  
  // Group session specific fields
  groupMode: 'single' | 'multi';
  groups: GroupData[];
  groupConfiguration: GroupConfiguration;
}

export interface GroupData {
  groupId: string;
  participants: Participant[];
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentPhase: string;
  roundNumber: number;
  startTime?: Timestamp;
  scribeNotes?: Record<number, string>;
}

export interface GroupConfiguration {
  groupSize: 3 | 4 | 'mixed';
  autoAssignRoles: boolean;
  groupRotation: 'random' | 'balanced' | 'manual';
  observerStrategy: 'distribute' | 'central';
  maxGroups?: number;
}

export interface GroupStatus {
  groupId: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentPhase: string;
  roundNumber: number;
  participants: Participant[];
  timeRemaining?: number;
}

export interface GroupProgress {
  groupId: string;
  completedRounds: number;
  totalRounds: number;
  averageSpeakingTime: number;
  participationRate: number;
}

// Re-export existing types for convenience
export interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'ready' | 'not-ready' | 'connecting';
  connectionStatus?: 'good' | 'poor' | 'disconnected';
}

export interface TopicSuggestion {
  id: string;
  topic: string;
  suggestedBy: string;
  suggestedByUserId: string;
  suggestedAt: Timestamp | Date;
  votes: number;
  voters: string[];
}

