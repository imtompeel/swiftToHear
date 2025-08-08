import { 
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
  collection
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { GroupSessionData, GroupData, GroupConfiguration } from '../types/groupSession';
import { GroupAssignmentService } from './groupAssignmentService';

export interface GroupSessionCreateData {
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostName: string;
  hostRole?: 'participant' | 'observer-permanent';
  minParticipants: number;
  maxParticipants: number;
  groupMode: 'single' | 'multi';
  groupConfiguration: GroupConfiguration;
}

export class FirestoreGroupSessionService {
  private static COLLECTION_NAME = 'groupSessions';

  // Create a new group session
  static async createGroupSession(sessionData: GroupSessionCreateData): Promise<GroupSessionData> {
    const sessionId = this.generateSessionId();
    
    const session: GroupSessionData = {
      sessionId,
      sessionName: sessionData.sessionName,
      duration: sessionData.duration,
      topic: sessionData.topic,
      hostId: sessionData.hostId,
      hostName: sessionData.hostName,
      hostRole: sessionData.hostRole,
      createdAt: serverTimestamp() as Timestamp,
      participants: [{
        id: sessionData.hostId,
        name: sessionData.hostName,
        role: '',
        status: 'ready'
      }],
      status: 'waiting',
      minParticipants: sessionData.minParticipants,
      maxParticipants: sessionData.maxParticipants,
      topicSuggestions: [],
      currentPhase: 'topic-selection',
      currentRound: 1,
      groupMode: sessionData.groupMode,
      groups: [],
      groupConfiguration: sessionData.groupConfiguration
    };

    await setDoc(doc(db, this.COLLECTION_NAME, sessionId), session);
    return session;
  }

  // Get group session by ID
  static async getGroupSession(sessionId: string): Promise<GroupSessionData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as GroupSessionData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting group session:', error);
      throw error;
    }
  }

  // Join a group session
  static async joinGroupSession(sessionId: string, userId: string, userName: string, role: string): Promise<GroupSessionData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if user is already in the session
      const existingParticipant = session.participants.find(p => p.id === userId);
      if (existingParticipant) {
        // Update existing participant's role and status
        existingParticipant.role = role;
        existingParticipant.status = 'ready';
      } else {
        // Add new participant
        session.participants.push({
          id: userId,
          name: userName,
          role,
          status: 'ready'
        });
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: session.participants
      });

      return session;
    } catch (error) {
      console.error('Error joining group session:', error);
      throw error;
    }
  }

  // Assign participants to groups
  static async assignParticipantsToGroups(sessionId: string): Promise<GroupData[]> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.groupMode === 'single') {
        // Single group mode - create one group with all participants
        const singleGroup: GroupData = {
          groupId: 'group-1',
          participants: session.participants,
          status: 'waiting',
          currentPhase: 'waiting',
          roundNumber: 1,
          scribeNotes: {}
        };
        
        const groups = [singleGroup];
        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
          groups
        });
        
        return groups;
      } else {
        // Multi-group mode - use GroupAssignmentService
        const groups = GroupAssignmentService.assignGroups(
          session.participants,
          session.groupConfiguration
        );

        await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
          groups
        });

        return groups;
      }
    } catch (error) {
      console.error('Error assigning participants to groups:', error);
      throw error;
    }
  }

  // Start a group session
  static async startGroupSession(sessionId: string): Promise<GroupSessionData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Assign participants to groups if not already done
      if (session.groups.length === 0) {
        await this.assignParticipantsToGroups(sessionId);
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        status: 'active',
        currentPhase: 'hello-checkin'
      });

      return await this.getGroupSession(sessionId);
    } catch (error) {
      console.error('Error starting group session:', error);
      throw error;
    }
  }

  // Start a specific group
  static async startGroup(sessionId: string, groupId: string): Promise<GroupData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const groupIndex = session.groups.findIndex(g => g.groupId === groupId);
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      session.groups[groupIndex].status = 'active';
      session.groups[groupIndex].currentPhase = 'hello-checkin';
      session.groups[groupIndex].startTime = Timestamp.now();

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        groups: session.groups
      });

      return session.groups[groupIndex];
    } catch (error) {
      console.error('Error starting group:', error);
      throw error;
    }
  }

  // Update group phase
  static async updateGroupPhase(sessionId: string, groupId: string, phase: string): Promise<GroupData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const groupIndex = session.groups.findIndex(g => g.groupId === groupId);
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      session.groups[groupIndex].currentPhase = phase;

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        groups: session.groups
      });

      return session.groups[groupIndex];
    } catch (error) {
      console.error('Error updating group phase:', error);
      throw error;
    }
  }

  // Complete a group round
  static async completeGroupRound(sessionId: string, groupId: string): Promise<GroupData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const groupIndex = session.groups.findIndex(g => g.groupId === groupId);
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      const group = session.groups[groupIndex];
      const totalRounds = group.participants.length === 3 ? 3 : 4;

      if (group.roundNumber >= totalRounds) {
        // Group has completed all rounds
        group.status = 'completed';
        group.currentPhase = 'completed';
      } else {
        // Move to next round
        group.roundNumber += 1;
        group.currentPhase = 'transition';
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        groups: session.groups
      });

      return group;
    } catch (error) {
      console.error('Error completing group round:', error);
      throw error;
    }
  }

  // Update group scribe notes
  static async updateGroupScribeNotes(sessionId: string, groupId: string, roundNumber: number, notes: string): Promise<void> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const groupIndex = session.groups.findIndex(g => g.groupId === groupId);
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      if (!session.groups[groupIndex].scribeNotes) {
        session.groups[groupIndex].scribeNotes = {};
      }

      session.groups[groupIndex].scribeNotes![roundNumber] = notes;

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        groups: session.groups
      });
    } catch (error) {
      console.error('Error updating group scribe notes:', error);
      throw error;
    }
  }

  // Pause a group
  static async pauseGroup(sessionId: string, groupId: string): Promise<GroupData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const groupIndex = session.groups.findIndex(g => g.groupId === groupId);
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      session.groups[groupIndex].status = 'paused';

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        groups: session.groups
      });

      return session.groups[groupIndex];
    } catch (error) {
      console.error('Error pausing group:', error);
      throw error;
    }
  }

  // End a group
  static async endGroup(sessionId: string, groupId: string): Promise<GroupData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const groupIndex = session.groups.findIndex(g => g.groupId === groupId);
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      session.groups[groupIndex].status = 'completed';
      session.groups[groupIndex].currentPhase = 'completed';

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        groups: session.groups
      });

      return session.groups[groupIndex];
    } catch (error) {
      console.error('Error ending group:', error);
      throw error;
    }
  }

  // Get all group sessions for a user
  static async getUserGroupSessions(userId: string): Promise<GroupSessionData[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('participants', 'array-contains', { id: userId })
      );
      
      const querySnapshot = await getDocs(q);
      const sessions: GroupSessionData[] = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push(doc.data() as GroupSessionData);
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting user group sessions:', error);
      throw error;
    }
  }

  // Delete a group session
  static async deleteGroupSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, sessionId));
    } catch (error) {
      console.error('Error deleting group session:', error);
      throw error;
    }
  }

  // Update participant ready state
  static async updateParticipantReadyState(sessionId: string, userId: string, isReady: boolean): Promise<GroupSessionData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const participantIndex = session.participants.findIndex(p => p.id === userId);
      if (participantIndex === -1) {
        throw new Error('Participant not found');
      }

      session.participants[participantIndex].status = isReady ? 'ready' : 'not-ready';

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: session.participants
      });

      return session;
    } catch (error) {
      console.error('Error updating participant ready state:', error);
      throw error;
    }
  }

  // Update participant role
  static async updateParticipantRole(sessionId: string, userId: string, role: string): Promise<GroupSessionData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const participantIndex = session.participants.findIndex(p => p.id === userId);
      if (participantIndex === -1) {
        throw new Error('Participant not found');
      }

      session.participants[participantIndex].role = role;

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: session.participants
      });

      return session;
    } catch (error) {
      console.error('Error updating participant role:', error);
      throw error;
    }
  }

  // Leave group session
  static async leaveGroupSession(sessionId: string, userId: string): Promise<GroupSessionData | null> {
    try {
      const session = await this.getGroupSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Remove participant from session
      session.participants = session.participants.filter(p => p.id !== userId);

      // Remove participant from all groups
      session.groups.forEach(group => {
        group.participants = group.participants.filter(p => p.id !== userId);
      });

      // Remove empty groups
      session.groups = session.groups.filter(group => group.participants.length > 0);

      await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), {
        participants: session.participants,
        groups: session.groups
      });

      return session;
    } catch (error) {
      console.error('Error leaving group session:', error);
      throw error;
    }
  }

  private static generateSessionId(): string {
    return `group-session-${Date.now()}`;
  }
}
