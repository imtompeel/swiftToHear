import { 
  doc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SessionData } from '../types/sessionTypes';
import { SessionLifecycleService } from './sessionLifecycleService';

export class ParticipantManagementService {
  private static COLLECTION_NAME = 'sessions';

  // Update participant ready state
  static async updateReadyState(sessionId: string, userId: string, isReady: boolean): Promise<SessionData | null> {
    try {
      const session = await SessionLifecycleService.getSession(sessionId);
      if (!session) return null;

      const updatedParticipants = session.participants.map(p => 
        p.id === userId ? { ...p, status: (isReady ? 'ready' : 'not-ready') as 'ready' | 'not-ready' } : p
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
    console.log('ParticipantManagementService.updateParticipantRole called:', { sessionId, userId, role });
    
    try {
      const session = await SessionLifecycleService.getSession(sessionId);
      if (!session) {
        console.error('updateParticipantRole: Session not found');
        return null;
      }

      console.log('Current session participants:', session.participants);

      // Check if role is available
      const availableRoles = SessionLifecycleService.getAvailableRoles(session);
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

  // Auto-assign roles to participants
  static async autoAssignRoles(sessionId: string, session: SessionData): Promise<void> {
    try {
      const participantCount = session.participants.length;
      const totalParticipants = participantCount + (session.hostRole === 'participant' ? 1 : 0);
      
      // Define available roles based on participant count
      let availableRoles: string[];
      if (totalParticipants === 2) {
        availableRoles = ['speaker', 'listener'];
      } else if (totalParticipants === 3) {
        availableRoles = ['speaker', 'listener', 'scribe'];
      } else if (totalParticipants === 4) {
        availableRoles = ['speaker', 'listener', 'scribe', 'observer'];
      } else {
        // For 5+ participants, use a mix of roles
        availableRoles = ['speaker', 'listener', 'scribe', 'observer'];
      }

      // Create a copy of participants to assign roles
      const participantsToUpdate = [...session.participants];
      
      // Assign roles to participants who don't have roles yet
      let roleIndex = 0;
      for (let i = 0; i < participantsToUpdate.length; i++) {
        if (!participantsToUpdate[i].role || participantsToUpdate[i].role === '') {
          participantsToUpdate[i].role = availableRoles[roleIndex % availableRoles.length];
          roleIndex++;
        }
      }

      // Update the session with assigned roles
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: participantsToUpdate
      });

      console.log('Auto-assigned roles:', participantsToUpdate.map(p => `${p.name}: ${p.role}`));
    } catch (error) {
      console.error('Error auto-assigning roles:', error);
      throw error;
    }
  }

  // Signal raised hand from listener to speaker
  static async signalRaisedHand(sessionId: string, listenerId: string, isRaised: boolean): Promise<SessionData | null> {
    try {
      console.log('ParticipantManagementService.signalRaisedHand: Signaling raised hand for session', sessionId, 'listener:', listenerId, 'raised:', isRaised);
      
      const session = await SessionLifecycleService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update the participant's raised hand status
      const updatedParticipants = session.participants.map(participant => {
        if (participant.id === listenerId) {
          return {
            ...participant,
            handRaised: isRaised
          };
        }
        return participant;
      });

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: updatedParticipants
      });

      return await SessionLifecycleService.getSession(sessionId);
    } catch (error) {
      console.error('Error signaling raised hand:', error);
      throw error;
    }
  }
}
