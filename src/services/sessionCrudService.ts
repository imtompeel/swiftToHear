import { CrudService } from './crudService';
import { SessionData } from '../types/sessionTypes';
import { where } from 'firebase/firestore';

export class SessionCrudService extends CrudService<SessionData> {
  constructor() {
    super({
      collectionName: 'sessions',
      idField: 'sessionId',
      timestampFields: ['createdAt', 'phaseStartTime']
    });
  }

  // Session-specific query methods
  async getSessionsByStatus(status: SessionData['status']): Promise<SessionData[]> {
    return this.query([where('status', '==', status)]);
  }

  async getSessionsByHost(hostId: string): Promise<SessionData[]> {
    return this.query([where('hostId', '==', hostId)]);
  }

  async getSessionsByParticipant(userId: string): Promise<SessionData[]> {
    // Note: This is a simplified query. For complex array queries, you might need a different approach
    return this.query([where('participants', 'array-contains', { id: userId })]);
  }

  async getActiveSessions(): Promise<SessionData[]> {
    return this.getSessionsByStatus('active');
  }

  async getWaitingSessions(): Promise<SessionData[]> {
    return this.getSessionsByStatus('waiting');
  }

  async getCompletedSessions(): Promise<SessionData[]> {
    return this.getSessionsByStatus('completed');
  }

  // Session-specific update methods
  async updateSessionPhase(sessionId: string, phase: SessionData['currentPhase'], round?: number): Promise<SessionData | null> {
    const updateData: Partial<SessionData> = {
      currentPhase: phase,
      phaseStartTime: new Date() as any // Will be converted to Timestamp by Firestore
    };
    
    if (round !== undefined) {
      updateData.currentRound = round;
    }
    
    return this.update(sessionId, updateData);
  }

  async updateSessionStatus(sessionId: string, status: SessionData['status']): Promise<SessionData | null> {
    return this.update(sessionId, { status });
  }

  async updateParticipants(sessionId: string, participants: SessionData['participants']): Promise<SessionData | null> {
    return this.update(sessionId, { participants });
  }

  async updateTopicSuggestions(sessionId: string, topicSuggestions: SessionData['topicSuggestions']): Promise<SessionData | null> {
    return this.update(sessionId, { topicSuggestions });
  }

  async updateScribeNotes(sessionId: string, scribeNotes: string): Promise<SessionData | null> {
    return this.update(sessionId, { scribeNotes });
  }

  async updateAccumulatedScribeNotes(sessionId: string, accumulatedScribeNotes: string): Promise<SessionData | null> {
    return this.update(sessionId, { accumulatedScribeNotes });
  }

  async updateSafetyTimeout(sessionId: string, safetyTimeout: SessionData['safetyTimeout']): Promise<SessionData | null> {
    return this.update(sessionId, { safetyTimeout });
  }

  // Session-specific create method with proper typing
  async createSession(sessionData: Omit<SessionData, 'sessionId' | 'createdAt' | 'participants' | 'status' | 'topicSuggestions'>): Promise<SessionData> {
    const session = {
      ...sessionData,
      participants: [{
        id: sessionData.hostId,
        name: sessionData.hostName,
        role: '', // Host will choose their role later
        status: 'ready'
      }],
      status: 'waiting',
      topicSuggestions: []
    };

    return this.create(session as any);
  }

  // Real-time listeners for sessions
  listenToSession(sessionId: string, callback: (session: SessionData | null) => void): () => void {
    return this.listenToDocument(sessionId, callback);
  }

  listenToActiveSessions(callback: (sessions: SessionData[]) => void): () => void {
    return this.listenToQuery([where('status', '==', 'active')], callback);
  }

  listenToWaitingSessions(callback: (sessions: SessionData[]) => void): () => void {
    return this.listenToQuery([where('status', '==', 'waiting')], callback);
  }

  // Utility methods
  generateSessionId(): string {
    return `session-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get available roles for a session
  getAvailableRoles(session: SessionData): string[] {
    const allRoles = ['speaker', 'listener', 'scribe', 'observer'];
    
    // For in-person sessions, exclude the host from role availability calculation
    const relevantParticipants = session.sessionType === 'in-person' 
      ? session.participants.filter(p => p.id !== session.hostId)
      : session.participants;
    
    const takenRoles = relevantParticipants.map(p => p.role).filter(role => role !== ''); // Filter out empty roles
    
    console.log('getAvailableRoles:', {
      sessionType: session.sessionType,
      allRoles,
      participants: relevantParticipants.map(p => ({ id: p.id, name: p.name, role: p.role })),
      takenRoles,
      availableRoles: allRoles.filter(role => !takenRoles.includes(role))
    });
    
    return allRoles.filter(role => !takenRoles.includes(role));
  }
}
