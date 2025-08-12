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
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SessionData, TopicSuggestion, Participant, JoinData } from '../types/sessionTypes';

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

  // Listen to session updates in real-time
  static listenToSession(sessionId: string, callback: (session: SessionData | null) => void): () => void {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, sessionId);
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const sessionData = doc.data() as SessionData;
          callback(sessionData);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error listening to session:', error);
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up session listener:', error);
      return () => {}; // Return empty function if setup fails
    }
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

        // Check what roles are currently taken
        const takenRoles = mobileParticipants.map(p => p.role);
        const activeRoles = ['speaker', 'listener', 'scribe'];
        const availableActiveRoles = activeRoles.filter(role => !takenRoles.includes(role));

        // If user selected a role, validate it's available
        if (assignedRole) {
          if (availableActiveRoles.includes(assignedRole)) {
            // User's selected role is available, use it
          } else if (takenRoles.includes(assignedRole)) {
            // User's selected role is taken, assign an available active role
            assignedRole = availableActiveRoles[0] || 'observer';
          } else {
            // User selected an invalid role, assign an available active role
            assignedRole = availableActiveRoles[0] || 'observer';
          }
        } else {
          // No role selected, assign an available active role
          if (availableActiveRoles.length > 0) {
            assignedRole = availableActiveRoles[0];
          } else {
            // All active roles are taken, assign observer
            assignedRole = 'observer';
          }
        }

        const participant: Participant = {
          id: joinData.userId,
          name: joinData.userName,
          role: assignedRole,
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
      }

      // For video/hybrid sessions, use existing logic
      if (session.groupConfiguration?.autoAssignRoles) {
        // Add participant without role (will be assigned later)
        const participant: Participant = {
          id: joinData.userId,
          name: joinData.userName,
          role: '', // Empty role - will be auto-assigned when session starts
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
      } else {
        // Manual role assignment - check if role is available
        if (!joinData.role) {
          throw new Error('Role is required when auto-assign is disabled');
        }
        
        const availableRoles = this.getAvailableRoles(session);
        if (!availableRoles.includes(joinData.role)) {
          throw new Error('Role not available');
        }

        // Add participant with specified role
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
      }
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
  static async startSession(sessionId: string, fivePersonChoice?: 'split' | 'together'): Promise<SessionData | null> {
    try {
      // Get the current session to check participant count
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Auto-assign roles if enabled
      if (session.groupConfiguration?.autoAssignRoles) {
        await this.autoAssignRoles(sessionId, session);
      }

      // Handle 5-person case with choice
      if (session.participants.length === 5 && fivePersonChoice) {
        // Store the choice in the session for later use
        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
          status: 'active',
          currentPhase: 'hello-checkin',
          currentRound: 1,
          phaseStartTime: serverTimestamp(),
          fivePersonChoice: fivePersonChoice
        });
      } else {
        // Normal session start
        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
          status: 'active',
          currentPhase: 'hello-checkin',
          currentRound: 1,
          phaseStartTime: serverTimestamp()
        });
      }

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
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
        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
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

        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
          participants: updatedParticipants,
          currentPhase: 'transition',
          currentRound: currentRound + 1,
          phaseStartTime: serverTimestamp()
        });
      }

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
    } catch (error) {
      console.error('Error completing round:', error);
      return null;
    }
  }

  // Continue with another round cycle for in-person sessions (only host can call this)
  static async continueInPersonRounds(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can continue rounds');
      }

      // For in-person sessions, accumulate current notes first, then rotate roles
      console.log('FirestoreSessionService.continueInPersonRounds: Accumulating current notes before role rotation');
      await this.accumulateScribeNotes(sessionId);
      
      console.log('FirestoreSessionService.continueInPersonRounds: Rotating roles for new round set');      
      // Reset to round 1
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        currentPhase: 'round',
        currentRound: 1,
        phaseStartTime: serverTimestamp()
      });

      const finalSession = await this.getSession(sessionId);
      return finalSession;
    } catch (error) {
      console.error('Error continuing in-person rounds:', error);
      return null;
    }
  }

  // Continue with another round cycle (only host can call this)
  static async continueRounds(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can continue rounds');
      }

      // Reset to listening phase to start new round cycle
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        currentPhase: 'listening',
        currentRound: 1,
        phaseStartTime: serverTimestamp()
      });

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
    } catch (error) {
      console.error('Error continuing rounds:', error);
      return null;
    }
  }

  // Start free-flowing dialogue (only host can call this)
  static async startFreeDialogue(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can start free dialogue');
      }

      // Move to free dialogue phase
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        currentPhase: 'free-dialogue',
        phaseStartTime: serverTimestamp()
      });

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
    } catch (error) {
      console.error('Error starting free dialogue:', error);
      return null;
    }
  }

  // End session and move to reflection (only host can call this)
  static async endSession(sessionId: string, hostId: string): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      // Verify the caller is the host
      if (session.hostId !== hostId) {
        throw new Error('Only the host can end the session');
      }

      // Move to reflection phase
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        currentPhase: 'reflection',
        phaseStartTime: serverTimestamp()
      });

      const updatedSession = await this.getSession(sessionId);
      return updatedSession;
    } catch (error) {
      console.error('Error ending session:', error);
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
      
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), updateData);
      
      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error updating session phase:', error);
      throw error;
    }
  }

  // Update scribe notes for in-person sessions (only updates current round's notes)
  static async updateScribeNotes(sessionId: string, notes: string): Promise<SessionData | null> {
    try {
      console.log('FirestoreSessionService.updateScribeNotes: Updating current round scribe notes for session', sessionId);
      
      // Only update the current round's notes, don't accumulate here
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        scribeNotes: notes // Current round's notes only
      });

      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error updating scribe notes:', error);
      throw error;
    }
  }

  // Signal raised hand from listener to speaker
  static async signalRaisedHand(sessionId: string, listenerId: string, isRaised: boolean): Promise<SessionData | null> {
    try {
      console.log('FirestoreSessionService.signalRaisedHand: Signaling raised hand for session', sessionId, 'listener:', listenerId, 'raised:', isRaised);
      
      const session = await this.getSession(sessionId);
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

      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error signaling raised hand:', error);
      throw error;
    }
  }

  // Accumulate scribe notes when moving to a new round
  static async accumulateScribeNotes(sessionId: string): Promise<SessionData | null> {
    try {
      console.log('FirestoreSessionService.accumulateScribeNotes: Accumulating scribe notes for session', sessionId);
      
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Only accumulate if there are current notes to add
      if (session.scribeNotes && session.scribeNotes.trim()) {
        const existingAccumulatedNotes = session.accumulatedScribeNotes || '';
        const newAccumulatedNotes = existingAccumulatedNotes 
          ? `${existingAccumulatedNotes}\n\n--- Round ${session.currentRound || 1} ---\n${session.scribeNotes}`
          : `--- Round ${session.currentRound || 1} ---\n${session.scribeNotes}`;

        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
          accumulatedScribeNotes: newAccumulatedNotes // All accumulated notes
        });
      }

      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error accumulating scribe notes:', error);
      throw error;
    }
  }

  // Request a safety timeout
  static async requestSafetyTimeout(sessionId: string, userId: string, userName: string): Promise<SessionData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      // Update the session with timeout information
      await updateDoc(docRef, {
        safetyTimeout: {
          isActive: true,
          requestedBy: userId,
          requestedByUserName: userName,
          startTime: serverTimestamp()
        }
      });
      
      // Return updated session
      const updatedDocSnap = await getDoc(docRef);
      return updatedDocSnap.exists() ? updatedDocSnap.data() as SessionData : null;
      
    } catch (error) {
      console.error('Error requesting safety timeout:', error);
      return null;
    }
  }

  // End a safety timeout
  static async endSafetyTimeout(sessionId: string): Promise<SessionData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      // Clear the timeout information
      await updateDoc(docRef, {
        safetyTimeout: {
          isActive: false,
          requestedBy: null,
          requestedByUserName: null,
          startTime: null
        }
      });
      
      // Return updated session
      const updatedDocSnap = await getDoc(docRef);
      return updatedDocSnap.exists() ? updatedDocSnap.data() as SessionData : null;
      
    } catch (error) {
      console.error('Error ending safety timeout:', error);
      return null;
    }
  }

  // Rotate roles for in-person sessions
  static async rotateRoles(sessionId: string): Promise<SessionData | null> {
    try {
      console.log('FirestoreSessionService.rotateRoles: Starting role rotation for session', sessionId);
      
      const session = await this.getSession(sessionId);
      if (!session) {
        console.log('FirestoreSessionService.rotateRoles: Session not found');
        return null;
      }

      const participants = session.participants || [];
      console.log('FirestoreSessionService.rotateRoles: All participants:', participants.map(p => ({ id: p.id, name: p.name, role: p.role })));
      
      if (participants.length < 2) {
        console.log('FirestoreSessionService.rotateRoles: Not enough participants to rotate (need at least 2)');
        return session; // Need at least 2 participants to rotate
      }

      // Get participants with roles (excluding observers)
      const roleParticipants = participants.filter(p => p.role && p.role !== 'observer');
      console.log('FirestoreSessionService.rotateRoles: Role participants:', roleParticipants.map(p => ({ id: p.id, name: p.name, role: p.role })));
      
      if (roleParticipants.length < 2) {
        console.log('FirestoreSessionService.rotateRoles: Not enough role participants to rotate (need at least 2)');
        return session;
      }

      // Create a copy of participants to modify
      const updatedParticipants = [...participants];

      // Rotate roles based on number of participants
      if (roleParticipants.length === 2) {
        console.log('FirestoreSessionService.rotateRoles: Performing 2-person rotation');
        // Two-person rotation: speaker ↔ listener
        const speaker = roleParticipants.find(p => p.role === 'speaker');
        const listener = roleParticipants.find(p => p.role === 'listener');
        
        console.log('FirestoreSessionService.rotateRoles: Found speaker:', speaker?.name, 'listener:', listener?.name);
        
        if (speaker && listener) {
          const speakerIndex = updatedParticipants.findIndex(p => p.id === speaker.id);
          const listenerIndex = updatedParticipants.findIndex(p => p.id === listener.id);
          
          console.log('FirestoreSessionService.rotateRoles: Speaker index:', speakerIndex, 'Listener index:', listenerIndex);
          
          if (speakerIndex !== -1 && listenerIndex !== -1) {
            updatedParticipants[speakerIndex] = { ...speaker, role: 'listener' };
            updatedParticipants[listenerIndex] = { ...listener, role: 'speaker' };
            console.log('FirestoreSessionService.rotateRoles: Roles swapped successfully');
          }
        }
      } else if (roleParticipants.length === 3) {
        console.log('FirestoreSessionService.rotateRoles: Performing 3-person rotation');
        // Three-person rotation: speaker → listener → scribe → speaker
        const speaker = roleParticipants.find(p => p.role === 'speaker');
        const listener = roleParticipants.find(p => p.role === 'listener');
        const scribe = roleParticipants.find(p => p.role === 'scribe');
        
        console.log('FirestoreSessionService.rotateRoles: Found speaker:', speaker?.name, 'listener:', listener?.name, 'scribe:', scribe?.name);
        
        if (speaker && listener && scribe) {
          const speakerIndex = updatedParticipants.findIndex(p => p.id === speaker.id);
          const listenerIndex = updatedParticipants.findIndex(p => p.id === listener.id);
          const scribeIndex = updatedParticipants.findIndex(p => p.id === scribe.id);
          
          console.log('FirestoreSessionService.rotateRoles: Indices - Speaker:', speakerIndex, 'Listener:', listenerIndex, 'Scribe:', scribeIndex);
          
          if (speakerIndex !== -1 && listenerIndex !== -1 && scribeIndex !== -1) {
            updatedParticipants[speakerIndex] = { ...speaker, role: 'listener' };
            updatedParticipants[listenerIndex] = { ...listener, role: 'scribe' };
            updatedParticipants[scribeIndex] = { ...scribe, role: 'speaker' };
            console.log('FirestoreSessionService.rotateRoles: 3-person rotation completed successfully');
            
            // Accumulate the current scribe's notes before rotating roles
            console.log('FirestoreSessionService.rotateRoles: Accumulating current scribe notes before role rotation');
            await this.accumulateScribeNotes(sessionId);
            
            // Pass accumulated scribe notes to the new scribe (the previous listener)
            // This happens when moving to a new round, not during scribe feedback
            if (session.accumulatedScribeNotes) {
              console.log('FirestoreSessionService.rotateRoles: Passing accumulated scribe notes to new scribe:', listener.name);
              // The accumulated notes will be available to the new scribe
            }
          }
        }
      }

      console.log('FirestoreSessionService.rotateRoles: Updated participants before saving:', updatedParticipants.map(p => ({ id: p.id, name: p.name, role: p.role })));
      
      // Update the session with new participant roles
      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: updatedParticipants
      });

      console.log('FirestoreSessionService.rotateRoles: Roles updated in Firestore successfully');
      
      const finalSession = await this.getSession(sessionId);
      console.log('FirestoreSessionService.rotateRoles: Final session participants:', finalSession?.participants?.map(p => ({ id: p.id, name: p.name, role: p.role })));
      
      return finalSession;
    } catch (error) {
      console.error('Error rotating roles:', error);
      throw error;
    }
  }

  // Generate a unique session ID
  private static generateSessionId(): string {
    return `session-${Math.random().toString(36).substr(2, 9)}`;
  }

} 