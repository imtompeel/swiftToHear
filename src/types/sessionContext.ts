import { Timestamp } from 'firebase/firestore';
import { SessionData } from '../services/firestoreSessionService';
import { GroupSessionData, GroupData } from './groupSession';

// Session context interface that works for both single and group sessions
export interface SessionContext {
  sessionId: string;
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostName: string;
  hostRole?: 'participant' | 'observer-permanent';
  createdAt: Timestamp;
  participants: SessionParticipant[];
  status: 'waiting' | 'active' | 'completed';
  minParticipants: number;
  maxParticipants: number;
  topicSuggestions: SessionTopicSuggestion[];
  currentPhase?: 'topic-selection' | 'hello-checkin' | 'listening' | 'transition' | 'reflection' | 'completion' | 'free-dialogue' | 'completed' | 'waiting' | 'round' | 'scribe-feedback' | 'round-complete' | undefined;
  phaseStartTime?: Timestamp;
  currentRound?: number;
  scribeNotes?: string; // Notes from the current scribe
  accumulatedScribeNotes?: string; // All scribe notes accumulated across rounds
  
  // Optional fields for different session types
  fivePersonChoice?: 'split' | 'together';
  groupMode?: 'single' | 'multi';
  groups?: GroupData[];
  groupConfiguration?: any;
  
  // Helper properties
  isGroupSession: boolean;
  currentGroupId?: string;
}

export interface SessionParticipant {
  id: string;
  name: string;
  role: string;
  status: 'ready' | 'not-ready' | 'connecting';
  connectionStatus?: 'good' | 'poor' | 'disconnected';
  handRaised?: boolean;
}

export interface SessionTopicSuggestion {
  id: string;
  topic: string;
  suggestedBy: string;
  suggestedByUserId: string;
  suggestedAt: Timestamp | Date;
  votes: number;
  voters: string[];
}

// Adapter functions to convert between different session types
export const createSessionContext = (session: SessionData): SessionContext => ({
  ...session,
  isGroupSession: false,
  participants: session.participants as SessionParticipant[],
  topicSuggestions: session.topicSuggestions as SessionTopicSuggestion[]
});

export const createGroupSessionContext = (
  session: GroupSessionData, 
  currentGroupId?: string
): SessionContext => ({
  ...session,
  isGroupSession: true,
  currentGroupId,
  participants: session.participants as SessionParticipant[],
  topicSuggestions: session.topicSuggestions as SessionTopicSuggestion[]
});

// Helper function to get current group data
export const getCurrentGroup = (context: SessionContext): GroupData | null => {
  if (!context.isGroupSession || !context.groups || !context.currentGroupId) {
    return null;
  }
  return context.groups.find(g => g.groupId === context.currentGroupId) || null;
};

// Helper function to get current participants (either from group or session)
export const getCurrentParticipants = (context: SessionContext): SessionParticipant[] => {
  if (context.isGroupSession && context.currentGroupId) {
    const currentGroup = getCurrentGroup(context);
    return currentGroup?.participants || [];
  }
  return context.participants;
};

// Helper function to get current phase
export const getCurrentPhase = (context: SessionContext): string => {
  if (context.isGroupSession && context.currentGroupId) {
    const currentGroup = getCurrentGroup(context);
    return currentGroup?.currentPhase || 'waiting';
  }
  return context.currentPhase || 'waiting';
};

// Helper function to get current round
export const getCurrentRound = (context: SessionContext): number => {
  if (context.isGroupSession && context.currentGroupId) {
    const currentGroup = getCurrentGroup(context);
    return currentGroup?.roundNumber || 1;
  }
  return context.currentRound || 1;
};
