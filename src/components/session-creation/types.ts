import { GroupConfiguration } from '../../types/groupSession';

export interface SessionData {
  sessionId: string;
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostRole: 'participant' | 'observer-permanent';
  createdAt: Date;
  participants: any[];
  status: 'waiting';
  topicSuggestions: TopicSuggestion[];
  groupMode?: 'single' | 'multi' | 'auto';
  groupConfiguration?: GroupConfiguration;
  minParticipants: number;
  maxParticipants: number;
  sessionType: 'video' | 'in-person';
}

export interface TopicSuggestion {
  id: string;
  topic: string;
  suggestedBy: string;
  suggestedByUserId: string;
  suggestedAt: Date;
  votes: number;
  voters: string[];
}

export interface SessionCreationProps {
  onSessionCreate: (sessionData: SessionData) => Promise<any>;
}

export interface SessionCreationState {
  selectedDuration: number;
  customDuration: string;
  sessionName: string;
  topic: string;
  hostTopicSuggestions: string[];
  newTopicSuggestion: string;
  validationError: string;
  isCreating: boolean;
  sessionCreated: boolean;
  sessionLink: string;
  hostRole: 'participant' | 'observer-permanent';
  sessionType: 'video' | 'in-person';
  maxParticipants: number;
  customMaxParticipants: string;
  groupConfiguration: GroupConfiguration;
}

export interface DurationOption {
  value: number;
  label: string;
  description: string;
}
