import { SessionCrudService } from './sessionCrudService';
import { SessionData, Participant, JoinData } from '../types/sessionTypes';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export class SessionLifecycleService {
  private static crudService = new SessionCrudService();

  // Create a new session
  static async createSession(sessionData: Omit<SessionData, 'sessionId' | 'createdAt' | 'participants' | 'status' | 'topicSuggestions'>): Promise<SessionData> {
    return this.crudService.createSession(sessionData);
  }

  // Get session by ID
  static async getSession(sessionId: string): Promise<SessionData | null> {
    return this.crudService.get(sessionId);
  }

  // Listen to session updates in real-time
  static listenToSession(sessionId: string, callback: (session: SessionData | null) => void): () => void {
    return this.crudService.listenToSession(sessionId, callback);
  }

  // Join a session
  static async joinSession(joinData: JoinData): Promise<SessionData | null> {
    try {
      const session = await this.getSession(joinData.sessionId);
      if (!session) return null;

      // Check if session is full
      if (session.sessionType === 'in-person') {
        // For in-person sessions, exclude the host from participant count
        const mobileParticipants = session.participants.filter(p => p.id !== session.hostId);
        if (mobileParticipants.length >= session.maxParticipants) {
          throw new Error('Session is full');
        }
      } else {
        // For video/hybrid sessions, include host in participant count
        if (session.participants.length >= session.maxParticipants) {
          throw new Error('Session is full');
        }
      }

      // For in-person sessions, handle participant limits and observer assignment
      if (session.sessionType === 'in-person') {
        const mobileParticipants = session.participants.filter(p => p.id !== session.hostId);
        const participantCount = mobileParticipants.length;
        let assignedRole = joinData.role || '';

        // First 3 participants get active roles (speaker, listener, scribe)
        if (participantCount < 3) {
          if (!assignedRole) {
            // Auto-assign active roles for first 3 participants
            const activeRoles = ['speaker', 'listener', 'scribe'];
            assignedRole = activeRoles[participantCount];
          }
        } else {
          // 4th participant onwards becomes observer
          assignedRole = 'observer';
        }

        const participant: Participant = {
          id: joinData.userId,
          name: joinData.userName,
          role: assignedRole,
          status: 'not-ready'
        };

        const updatedParticipants = [...session.participants, participant];
        
        await this.crudService.updateParticipants(joinData.sessionId, updatedParticipants);

        return {
          ...session,
          participants: updatedParticipants
        };
      }

      // For video/hybrid sessions, allow joining without a role (participants will choose in lobby)
      // This matches the simplified in-person approach
      const participant: Participant = {
        id: joinData.userId,
        name: joinData.userName,
        role: joinData.role || '', // Allow empty role - will be chosen in lobby
        status: 'not-ready'
      };

      const updatedParticipants = [...session.participants, participant];
      
      await this.crudService.updateParticipants(joinData.sessionId, updatedParticipants);

      return {
        ...session,
        participants: updatedParticipants
      };
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  // Complete session cleanup - removes all session-related data
  static async cleanupSessionData(sessionId: string): Promise<void> {
    try {
      console.log(`🧹 Starting comprehensive cleanup for session: ${sessionId}`);
      
      // 1. Clean up signaling messages for this session
      await this.cleanupSignalingMessages(sessionId);
      
      // 2. Delete the session document itself
      await this.crudService.delete(sessionId);
      
      console.log(`✅ Session cleanup completed for: ${sessionId}`);
    } catch (error) {
      console.error(`❌ Error during session cleanup for ${sessionId}:`, error);
      throw error;
    }
  }

  // Clean up signaling messages for a specific session
  private static async cleanupSignalingMessages(sessionId: string): Promise<void> {
    try {
      const signalingQuery = query(
        collection(db, 'signaling'),
        where('sessionId', '==', sessionId)
      );
      
      const querySnapshot = await getDocs(signalingQuery);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      console.log(`🧹 Cleaned up ${querySnapshot.docs.length} signaling messages for session: ${sessionId}`);
    } catch (error) {
      console.error(`❌ Error cleaning up signaling messages for session ${sessionId}:`, error);
      // Don't throw here - we want to continue with other cleanup even if signaling cleanup fails
    }
  }

  // Enhanced leave session method with cleanup
  static async leaveSession(sessionId: string, userId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Remove participant
      const updatedParticipants = session.participants.filter(p => p.id !== userId);
      
      // If no participants left, perform complete cleanup
      if (updatedParticipants.length === 0) {
        await this.cleanupSessionData(sessionId);
        return null;
      }
      
      await this.crudService.updateParticipants(sessionId, updatedParticipants);

      return {
        ...session,
        participants: updatedParticipants
      };
    } catch (error) {
      console.error('Error leaving session:', error);
      return null;
    }
  }

  // Enhanced delete session method with cleanup
  static async deleteSession(sessionId: string): Promise<void> {
    await this.cleanupSessionData(sessionId);
  }

  // Complete a session and optionally clean up data
  static async completeSession(sessionId: string, cleanupData: boolean = true): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Update session status to completed
      const updatedSession = await this.crudService.updateSessionStatus(sessionId, 'completed');
      
      // If cleanup is requested, remove all session data after a short delay
      if (cleanupData) {
        // Delay cleanup to allow for any final data processing
        setTimeout(async () => {
          try {
            await this.cleanupSessionData(sessionId);
          } catch (error) {
            console.error(`❌ Error during delayed cleanup for session ${sessionId}:`, error);
          }
        }, 5000); // 5 second delay
      }

      return updatedSession;
    } catch (error) {
      console.error('Error completing session:', error);
      return null;
    }
  }

  // Get available roles for a session
  static getAvailableRoles(session: SessionData): string[] {
    return this.crudService.getAvailableRoles(session);
  }
}
