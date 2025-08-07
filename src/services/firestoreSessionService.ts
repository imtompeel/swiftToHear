import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

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
  currentPhase?: 'topic-selection' | 'hello-checkin' | 'listening' | 'transition' | 'reflection' | 'completed' | undefined;
  phaseStartTime?: Timestamp;
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
}

export interface JoinData {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
}

export class FirestoreSessionService {
  private static COLLECTION_NAME = 'sessions';

  // Create a new session
  static async createSession(sessionData: Omit<SessionData, 'sessionId' | 'createdAt' | 'participants' | 'status' | 'topicSuggestions'>): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    
    const session: SessionData = {
      ...sessionData,
      sessionId,
      createdAt: serverTimestamp() as Timestamp,
      participants: [{
        id: sessionData.hostId,
        name: sessionData.hostName,
        role: '', // Host will choose their role later
        status: 'ready'
      }],
      status: 'waiting',
      topicSuggestions: []
    };

    await setDoc(doc(db, this.COLLECTION_NAME, sessionId), session);
    return session;
  }

  // Get session by ID
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as SessionData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  // Join a session
  static async joinSession(joinData: JoinData): Promise<SessionData | null> {
    try {
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

      const updatedParticipants = [...session.participants, participant];
      
      await updateDoc(doc(db, this.COLLECTION_NAME, joinData.sessionId), {
        participants: updatedParticipants
      });

      return {
        ...session,
        participants: updatedParticipants
      };
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  // Update participant ready state
  static async updateReadyState(sessionId: string, userId: string, isReady: boolean): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      const updatedParticipants: Participant[] = session.participants.map(p => 
        p.id === userId ? { ...p, status: isReady ? 'ready' : 'not-ready' } : p
      );

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: updatedParticipants
      });

      return {
        ...session,
        participants: updatedParticipants
      };
    } catch (error) {
      console.error('Error updating ready state:', error);
      return null;
    }
  }

  // Update participant role
  static async updateParticipantRole(sessionId: string, userId: string, role: string): Promise<SessionData | null> {
    console.log('FirestoreSessionService.updateParticipantRole called:', { sessionId, userId, role });
    
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        console.error('updateParticipantRole: Session not found');
        return null;
      }

      console.log('Current session participants:', session.participants);

      // Check if role is available
      const availableRoles = this.getAvailableRoles(session);
      console.log('Available roles:', availableRoles);
      
      if (!availableRoles.includes(role)) {
        console.error('updateParticipantRole: Role not available:', role);
        throw new Error('Role not available');
      }

      const updatedParticipants = session.participants.map(p => 
        p.id === userId ? { ...p, role } : p
      );

      console.log('Updated participants:', updatedParticipants);

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: updatedParticipants
      });

      const result = {
        ...session,
        participants: updatedParticipants
      };
      
      console.log('updateParticipantRole: Success, returning:', result);
      return result;
    } catch (error) {
      console.error('Error updating participant role:', error);
      return null;
    }
  }

  // Start session
  static async startSession(sessionId: string): Promise<SessionData | null> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        status: 'active',
        currentPhase: 'hello-checkin',
        phaseStartTime: serverTimestamp()
      });

      const session = await this.getSession(sessionId);
      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }

  // Complete hello check-in phase (only host can call this)
  static async completeHelloCheckIn(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can complete phases');
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        currentPhase: 'listening',
        phaseStartTime: serverTimestamp()
      });

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
    } catch (error) {
      console.error('Error completing hello check-in:', error);
      return null;
    }
  }

  // Complete scribe feedback phase (only host can call this)
  static async completeScribeFeedback(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can complete phases');
      }

      // Advance to the next round (listening phase)
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        currentPhase: 'listening',
        phaseStartTime: serverTimestamp()
      });

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
    } catch (error) {
      console.error('Error completing scribe feedback:', error);
      return null;
    }
  }

  // Complete round (only host can call this)
  static async completeRound(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can complete rounds');
      }

      // Rotate roles for all participants
      const roleOrder = ['speaker', 'listener', 'scribe', 'observer'];
      const updatedParticipants = session.participants.map(participant => {
        const currentRoleIndex = roleOrder.indexOf(participant.role);
        const nextRoleIndex = (currentRoleIndex + 1) % roleOrder.length;
        return {
          ...participant,
          role: roleOrder[nextRoleIndex]
        };
      });

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: updatedParticipants,
        currentPhase: 'transition',
        phaseStartTime: serverTimestamp()
      });

      return {
        ...session,
        participants: updatedParticipants
      };
    } catch (error) {
      console.error('Error completing round:', error);
      return null;
    }
  }

  // Leave session
  static async leaveSession(sessionId: string, userId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Remove participant
      const updatedParticipants = session.participants.filter(p => p.id !== userId);
      
      // If no participants left, delete session
      if (updatedParticipants.length === 0) {
        await deleteDoc(doc(db, this.COLLECTION_NAME, sessionId));
        return null;
      }
      
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: updatedParticipants
      });

      return {
        ...session,
        participants: updatedParticipants
      };
    } catch (error) {
      console.error('Error leaving session:', error);
      return null;
    }
  }

  // Get available roles for a session
  static getAvailableRoles(session: SessionData): string[] {
    const allRoles = ['speaker', 'listener', 'scribe', 'observer'];
    const takenRoles = session.participants.map(p => p.role).filter(role => role !== ''); // Filter out empty roles
    
    console.log('getAvailableRoles:', {
      allRoles,
      participants: session.participants.map(p => ({ id: p.id, name: p.name, role: p.role })),
      takenRoles,
      availableRoles: allRoles.filter(role => !takenRoles.includes(role))
    });
    
    return allRoles.filter(role => !takenRoles.includes(role));
  }

  // Get all sessions for a user
  static async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('participants', 'array-contains', { id: userId })
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as SessionData);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Get all active sessions
  static async getActiveSessions(): Promise<SessionData[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'waiting')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as SessionData);
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // Add topic suggestion
  static async addTopicSuggestion(sessionId: string, topic: string, userId: string, userName: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      const suggestionId = 'suggestion-' + Math.random().toString(36).substr(2, 9);
      const newSuggestion: TopicSuggestion = {
        id: suggestionId,
        topic: topic.trim(),
        suggestedBy: userName,
        suggestedByUserId: userId,
        suggestedAt: Timestamp.fromDate(new Date()),
        votes: 1,
        voters: [userId]
      };

      const updatedSuggestions = [...(session.topicSuggestions || []), newSuggestion];
      
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        topicSuggestions: updatedSuggestions
      });

      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error adding topic suggestion:', error);
      throw error;
    }
  }

  // Vote for a topic suggestion
  static async voteForTopic(sessionId: string, suggestionId: string, userId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      const suggestions = session.topicSuggestions || [];
      const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
      
      if (suggestionIndex === -1) return null;

      const suggestion = suggestions[suggestionIndex];
      const hasVoted = suggestion.voters.includes(userId);

      let updatedSuggestion;
      if (hasVoted) {
        // Remove vote
        updatedSuggestion = {
          ...suggestion,
          votes: suggestion.votes - 1,
          voters: suggestion.voters.filter(voterId => voterId !== userId)
        };
      } else {
        // Add vote
        updatedSuggestion = {
          ...suggestion,
          votes: suggestion.votes + 1,
          voters: [...suggestion.voters, userId]
        };
      }

      const updatedSuggestions = [...suggestions];
      updatedSuggestions[suggestionIndex] = updatedSuggestion;

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        topicSuggestions: updatedSuggestions
      });

      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error voting for topic:', error);
      throw error;
    }
  }

  // Get most popular topics (for word cloud)
  static getMostPopularTopics(session: SessionData, limit: number = 10): TopicSuggestion[] {
    const suggestions = session.topicSuggestions || [];
    return suggestions
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  // Delete a session
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Generate a unique session ID
  private static generateSessionId(): string {
    return `session-${Math.random().toString(36).substr(2, 9)}`;
  }

} 