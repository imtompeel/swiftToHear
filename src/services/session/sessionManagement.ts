import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SessionData } from './types';

export class SessionManagement {
  private static COLLECTION_NAME = 'sessions';

  // Create a new session
  static async createSession(sessionData: Omit<SessionData, 'sessionId' | 'createdAt' | 'participants' | 'status' | 'topicSuggestions'>): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    
    const session: SessionData = {
      ...sessionData,
      sessionId,
      createdAt: serverTimestamp() as any,
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
