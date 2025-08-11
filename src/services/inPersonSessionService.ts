import { SessionParticipant } from '../types/sessionContext';

export interface InPersonSessionState {
  sessionId: string;
  currentPhase: 'waiting' | 'speaking' | 'listening' | 'reflection' | 'feedback';
  currentSpeaker: string | null;
  currentListener: string | null;
  currentScribe: string | null;
  participants: SessionParticipant[];
  roundNumber: number;
  sessionNotes: Record<string, string>; // scribe notes by participant ID
}

export interface ParticipantConnection {
  participantId: string;
  participantName: string;
  role: string;
  isConnected: boolean;
  lastSeen: Date;
}

export class InPersonSessionService {
  private participants: Map<string, ParticipantConnection> = new Map();
  private stateListeners: ((state: InPersonSessionState) => void)[] = [];
  private connectionListeners: ((connections: ParticipantConnection[]) => void)[] = [];
  private currentState: InPersonSessionState;

  constructor(sessionId: string, _hostId: string, initialParticipants: SessionParticipant[] = []) {
    
    this.currentState = {
      sessionId,
      currentPhase: 'waiting',
      currentSpeaker: null,
      currentListener: null,
      currentScribe: null,
      participants: initialParticipants,
      roundNumber: 1,
      sessionNotes: {}
    };

    // Initialize participants map
    initialParticipants.forEach(participant => {
      this.participants.set(participant.id, {
        participantId: participant.id,
        participantName: participant.name,
        role: participant.role,
        isConnected: false,
        lastSeen: new Date()
      });
    });
  }

  // Host methods
  async startSession(): Promise<void> {
    this.currentState.currentPhase = 'speaking';
    const firstSpeaker = this.currentState.participants.find(p => p.role === 'speaker');
    if (firstSpeaker) {
      this.currentState.currentSpeaker = firstSpeaker.id;
    }
    this.notifyStateListeners();
  }

  async nextPhase(): Promise<void> {
    switch (this.currentState.currentPhase) {
      case 'speaking':
        this.currentState.currentPhase = 'listening';
        break;
      case 'listening':
        this.currentState.currentPhase = 'reflection';
        break;
      case 'reflection':
        this.currentState.currentPhase = 'feedback';
        break;
      case 'feedback':
        this.currentState.currentPhase = 'speaking';
        this.currentState.roundNumber++;
        // Rotate roles for next round
        this.rotateRoles();
        break;
    }
    this.notifyStateListeners();
  }

  async pauseSession(): Promise<void> {
    this.currentState.currentPhase = 'waiting';
    this.notifyStateListeners();
  }

  async updateScribeNotes(participantId: string, notes: string): Promise<void> {
    this.currentState.sessionNotes[participantId] = notes;
    this.notifyStateListeners();
  }

  // Participant methods
  async joinSession(participantId: string, participantName: string, role: string): Promise<void> {
    const connection: ParticipantConnection = {
      participantId,
      participantName,
      role,
      isConnected: true,
      lastSeen: new Date()
    };
    
    this.participants.set(participantId, connection);
    
    // Add to participants list if not already there
    const existingParticipant = this.currentState.participants.find(p => p.id === participantId);
    if (!existingParticipant) {
      this.currentState.participants.push({
        id: participantId,
        name: participantName,
        role,
        status: 'ready'
      });
    }
    
    this.notifyConnectionListeners();
    this.notifyStateListeners();
  }

  async leaveSession(participantId: string): Promise<void> {
    const connection = this.participants.get(participantId);
    if (connection) {
      connection.isConnected = false;
      connection.lastSeen = new Date();
      this.participants.set(participantId, connection);
    }
    
    this.notifyConnectionListeners();
  }

  async updateParticipantStatus(participantId: string, status: 'ready' | 'not-ready'): Promise<void> {
    const participant = this.currentState.participants.find(p => p.id === participantId);
    if (participant) {
      participant.status = status;
      this.notifyStateListeners();
    }
  }

  // Listener methods
  onStateChange(listener: (state: InPersonSessionState) => void): () => void {
    this.stateListeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.stateListeners.indexOf(listener);
      if (index > -1) {
        this.stateListeners.splice(index, 1);
      }
    };
  }

  onConnectionChange(listener: (connections: ParticipantConnection[]) => void): () => void {
    this.connectionListeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  getCurrentState(): InPersonSessionState {
    return { ...this.currentState };
  }

  getConnectedParticipants(): ParticipantConnection[] {
    return Array.from(this.participants.values()).filter(p => p.isConnected);
  }

  private rotateRoles(): void {
    // Simple role rotation - in a real implementation, this would be more sophisticated
    const participants = this.currentState.participants;
    const roles = ['speaker', 'listener', 'scribe'];
    
    participants.forEach((participant) => {
      const currentRoleIndex = roles.indexOf(participant.role);
      const nextRoleIndex = (currentRoleIndex + 1) % roles.length;
      participant.role = roles[nextRoleIndex];
    });
  }

  private notifyStateListeners(): void {
    this.stateListeners.forEach(listener => {
      try {
        listener({ ...this.currentState });
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  private notifyConnectionListeners(): void {
    const connections = this.getConnectedParticipants();
    this.connectionListeners.forEach(listener => {
      try {
        listener(connections);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Cleanup
  destroy(): void {
    this.stateListeners = [];
    this.connectionListeners = [];
    this.participants.clear();
  }
}

// Singleton instance for the current session
let currentSessionService: InPersonSessionService | null = null;

export const getInPersonSessionService = (): InPersonSessionService | null => {
  return currentSessionService;
};

export const createInPersonSessionService = (
  sessionId: string, 
  hostId: string, 
  initialParticipants: SessionParticipant[] = []
): InPersonSessionService => {
  if (currentSessionService) {
    currentSessionService.destroy();
  }
  
  currentSessionService = new InPersonSessionService(sessionId, hostId, initialParticipants);
  return currentSessionService;
};

export const destroyInPersonSessionService = (): void => {
  if (currentSessionService) {
    currentSessionService.destroy();
    currentSessionService = null;
  }
};
