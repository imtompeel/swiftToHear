// Session state management service
// This is a simple in-memory implementation that can be replaced with a real backend

export interface SessionData {
  sessionId: string;
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostName: string;
  createdAt: Date;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  minParticipants: number;
  maxParticipants: number;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'ready' | 'not-ready' | 'connecting';
  connectionStatus?: 'good' | 'poor' | 'disconnected';
}

export interface JoinData {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
}

// In-memory storage (replace with real backend)
const sessions = new Map<string, SessionData>();

export class SessionService {
  // Create a new session
  static async createSession(sessionData: Omit<SessionData, 'sessionId' | 'createdAt' | 'participants' | 'status'>): Promise<SessionData> {
    const session: SessionData = {
      ...sessionData,
      sessionId: this.generateSessionId(),
      createdAt: new Date(),
      participants: [{
        id: sessionData.hostId,
        name: sessionData.hostName,
        role: 'host',
        status: 'ready'
      }],
      status: 'waiting'
    };

    sessions.set(session.sessionId, session);
    
    // Store in localStorage for persistence
    localStorage.setItem(`session_${session.sessionId}`, JSON.stringify(session));
    
    return session;
  }

  // Get session by ID
  static async getSession(sessionId: string): Promise<SessionData | null> {
    // Try memory first
    let session = sessions.get(sessionId);
    
    if (!session) {
      // Try localStorage
      const stored = localStorage.getItem(`session_${sessionId}`);
      if (stored) {
        const parsedSession = JSON.parse(stored);
        // Convert createdAt string back to Date object
        parsedSession.createdAt = new Date(parsedSession.createdAt);
        session = parsedSession;
        sessions.set(sessionId, session);
      }
    }
    
    return session || null;
  }

  // Join a session
  static async joinSession(joinData: JoinData): Promise<SessionData | null> {
    const session = await this.getSession(joinData.sessionId);
    if (!session) return null;

    // Check if role is available
    const availableRoles = this.getAvailableRoles(session);
    if (!availableRoles.includes(joinData.role)) {
      throw new Error('Role not available');
    }

    // Add participant
    const participant: Participant = {
      id: joinData.userId,
      name: joinData.userName,
      role: joinData.role,
      status: 'not-ready'
    };

    session.participants.push(participant);
    
    // Update storage
    sessions.set(session.sessionId, session);
    localStorage.setItem(`session_${session.sessionId}`, JSON.stringify(session));
    
    return session;
  }

  // Update participant ready state
  static async updateReadyState(sessionId: string, userId: string, isReady: boolean): Promise<SessionData | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const participant = session.participants.find(p => p.id === userId);
    if (participant) {
      participant.status = isReady ? 'ready' : 'not-ready';
      
      // Update storage
      sessions.set(sessionId, session);
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    }
    
    return session;
  }

  // Start session
  static async startSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.status = 'active';
    
    // Update storage
    sessions.set(sessionId, session);
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    
    return session;
  }

  // Leave session
  static async leaveSession(sessionId: string, userId: string): Promise<SessionData | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    // Remove participant
    session.participants = session.participants.filter(p => p.id !== userId);
    
    // If no participants left, delete session
    if (session.participants.length === 0) {
      sessions.delete(sessionId);
      localStorage.removeItem(`session_${sessionId}`);
      return null;
    }
    
    // Update storage
    sessions.set(sessionId, session);
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    
    return session;
  }

  // Get available roles for a session
  static getAvailableRoles(session: SessionData): string[] {
    const allRoles = ['listener', 'scribe', 'observer'];
    const takenRoles = session.participants.map(p => p.role);
    return allRoles.filter(role => !takenRoles.includes(role));
  }

  // Generate unique session ID
  private static generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  }

  // Get all sessions (for admin/debugging)
  static getAllSessions(): SessionData[] {
    return Array.from(sessions.values());
  }

  // Clear all sessions (for testing)
  static clearAllSessions(): void {
    sessions.clear();
    // Clear localStorage sessions
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('session_')) {
        localStorage.removeItem(key);
      }
    });
  }
} 