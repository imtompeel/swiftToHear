import { SessionCrudService } from './sessionCrudService';
import { SessionData } from '../types/sessionTypes';
import { serverTimestamp } from 'firebase/firestore';

export class SessionPhaseService {
  private static crudService = new SessionCrudService();



  // Start session
  static async startSession(sessionId: string, fivePersonChoice?: 'split' | 'together'): Promise<SessionData | null> {
    try {
      // Get the current session to check participant count
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Auto-assign roles if enabled
      if (session.groupConfiguration?.autoAssignRoles) {
        await this.autoAssignRoles(sessionId, session);
      }

      // Handle 5-person case with choice
      if (session.participants.length === 5 && fivePersonChoice) {
        // Store the choice in the session for later use
        await this.crudService.update(sessionId, {
          status: 'active',
          currentPhase: 'hello-checkin',
          currentRound: 1,
          phaseStartTime: serverTimestamp(),
          fivePersonChoice: fivePersonChoice
        });
      } else {
        // Normal session start
        await this.crudService.update(sessionId, {
          status: 'active',
          currentPhase: 'hello-checkin',
          currentRound: 1,
          phaseStartTime: serverTimestamp()
        });
      }

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }



  // Complete hello check-in phase (only host can call this)
  static async completeHelloCheckIn(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can complete phases');
      }

      await this.crudService.update(sessionId, {
        currentPhase: 'listening',
        phaseStartTime: serverTimestamp()
      });

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error completing hello check-in:', error);
      return null;
    }
  }

  // Complete scribe feedback phase (only host can call this)
  static async completeScribeFeedback(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can complete phases');
      }

      // Advance to the next round (listening phase)
      await this.crudService.update(sessionId, {
        currentPhase: 'listening',
        phaseStartTime: serverTimestamp()
      });

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error completing scribe feedback:', error);
      return null;
    }
  }

  // Complete round (only host can call this)
  static async completeRound(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can complete rounds');
      }

      // Get current round (default to 1 if not set)
      const currentRound = session.currentRound || 1;
      
      // Check if this was the final round (calculate based on participant count)
      const participantCount = session.participants.length;
      let totalRounds: number;
      
      if (participantCount === 2) {
        totalRounds = 2; // 2-person sessions: speaker ↔ listener
      } else if (participantCount === 3) {
        totalRounds = 3; // 3-person sessions: speaker → listener → scribe
      } else {
        totalRounds = 4; // 4+ person sessions: speaker → listener → scribe → observer
      }
      
      if (currentRound >= totalRounds) {
        // Move to completion phase instead of transition
        await this.crudService.update(sessionId, {
          currentPhase: 'completion',
          phaseStartTime: serverTimestamp()
        });
      } else {
        // Rotate roles for all participants based on participant count
        let updatedParticipants;
        
        if (participantCount === 2) {
          // 2-person rotation: speaker ↔ listener
          updatedParticipants = session.participants.map(participant => ({
            ...participant,
            role: participant.role === 'speaker' ? 'listener' : 'speaker'
          }));
        } else if (participantCount === 3) {
          // 3-person rotation: speaker → listener → scribe
          const roleOrder = ['speaker', 'listener', 'scribe'];
          updatedParticipants = session.participants.map(participant => {
            const currentRoleIndex = roleOrder.indexOf(participant.role);
            const nextRoleIndex = (currentRoleIndex + 1) % roleOrder.length;
            return {
              ...participant,
              role: roleOrder[nextRoleIndex]
            };
          });
        } else {
          // 4+ person rotation: speaker → listener → scribe → observer
          const roleOrder = ['speaker', 'listener', 'scribe', 'observer'];
          updatedParticipants = session.participants.map(participant => {
            const currentRoleIndex = roleOrder.indexOf(participant.role);
            const nextRoleIndex = (currentRoleIndex + 1) % roleOrder.length;
            return {
              ...participant,
              role: roleOrder[nextRoleIndex]
            };
          });
        }

        await this.crudService.update(sessionId, {
          participants: updatedParticipants,
          currentPhase: 'transition',
          currentRound: currentRound + 1,
          phaseStartTime: serverTimestamp()
        });
      }

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error completing round:', error);
      return null;
    }
  }

  // Continue with another round cycle for in-person sessions (only host can call this)
  static async continueInPersonRounds(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can continue rounds');
      }

      // For in-person sessions, accumulate current notes first, then rotate roles
      console.log('SessionPhaseService.continueInPersonRounds: Accumulating current notes before role rotation');
      await this.accumulateScribeNotes(sessionId);
      
      console.log('SessionPhaseService.continueInPersonRounds: Rotating roles for new round set');      
      // Reset to round 1
      await this.crudService.update(sessionId, {
        currentPhase: 'round',
        currentRound: 1,
        phaseStartTime: serverTimestamp()
      });

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error continuing in-person rounds:', error);
      return null;
    }
  }

  // Continue with another round cycle (only host can call this)
  static async continueRounds(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can continue rounds');
      }

      // Reset to listening phase to start new round cycle
      await this.crudService.update(sessionId, {
        currentPhase: 'listening',
        currentRound: 1,
        phaseStartTime: serverTimestamp()
      });

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error continuing rounds:', error);
      return null;
    }
  }

  // Start free-flowing dialogue (only host can call this)
  static async startFreeDialogue(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can start free dialogue');
      }

      // Move to free dialogue phase
      await this.crudService.update(sessionId, {
        currentPhase: 'free-dialogue',
        phaseStartTime: serverTimestamp()
      });

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error starting free dialogue:', error);
      return null;
    }
  }

  // End session and move to reflection (only host can call this)
  static async endSession(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.crudService.get(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can end the session');
      }

      // Move to reflection phase
      await this.crudService.update(sessionId, {
        currentPhase: 'reflection',
        phaseStartTime: serverTimestamp()
      });

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
      return null;
    }
  }

  // Update session phase and round (for in-person sessions)
  static async updateSessionPhase(sessionId: string, phase: string, round?: number): Promise<SessionData | null> {
    try {
      const updateData: any = {
        currentPhase: phase,
        phaseStartTime: serverTimestamp()
      };
      
      if (round !== undefined) {
        updateData.currentRound = round;
      }
      
      await this.crudService.update(sessionId, updateData);
      
      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error updating session phase:', error);
      throw error;
    }
  }

  // Accumulate scribe notes when moving to a new round
  static async accumulateScribeNotes(sessionId: string): Promise<SessionData | null> {
    try {
      console.log('SessionPhaseService.accumulateScribeNotes: Accumulating scribe notes for session', sessionId);
      
      const session = await this.crudService.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Only accumulate if there are current notes to add
      if (session.scribeNotes && session.scribeNotes.trim()) {
        const existingAccumulatedNotes = session.accumulatedScribeNotes || '';
        const newAccumulatedNotes = existingAccumulatedNotes 
          ? `${existingAccumulatedNotes}\n\n--- Round ${session.currentRound || 1} ---\n${session.scribeNotes}`
          : `--- Round ${session.currentRound || 1} ---\n${session.scribeNotes}`;

        await this.crudService.updateAccumulatedScribeNotes(sessionId, newAccumulatedNotes);
      }

      return await this.crudService.get(sessionId);
    } catch (error) {
      console.error('Error accumulating scribe notes:', error);
      throw error;
    }
  }

  // Auto-assign roles to participants
  private static async autoAssignRoles(sessionId: string, session: SessionData): Promise<void> {
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
      await this.crudService.updateParticipants(sessionId, participantsToUpdate);

      console.log('Auto-assigned roles:', participantsToUpdate.map(p => `${p.name}: ${p.role}`));
    } catch (error) {
      console.error('Error auto-assigning roles:', error);
      throw error;
    }
  }
}
