import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
// import { WebRTCMessage } from './webrtcService';

export interface SignalingMessage {
  id?: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to?: string;
  data: any;
  sessionId: string;
  /** Firestore sessions/groupSessions doc id used for ACL (may differ from lobby room id) */
  baseSessionId: string;
  timestamp: Timestamp;
  expiresAt: Timestamp;
}

export class FirebaseSignalingService {
  private static instance: FirebaseSignalingService;
  private sessionId: string | null = null;
  private baseSessionId: string | null = null;
  private currentUserId: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map();

  static getInstance(): FirebaseSignalingService {
    if (!FirebaseSignalingService.instance) {
      FirebaseSignalingService.instance = new FirebaseSignalingService();
    }
    return FirebaseSignalingService.instance;
  }

  // Initialize the signaling service for a session
  async initialize(
    sessionId: string,
    currentUserId: string,
    baseSessionId: string = sessionId
  ): Promise<void> {
    // If already initialized for the same session, don't reinitialize
    if (this.sessionId === sessionId && this.currentUserId === currentUserId) {
      console.log('🟢 FIREBASE SIGNALING - Already initialized for session:', sessionId);
      return;
    }
    
    // If initialized for a different session, disconnect first
    if (this.sessionId && this.sessionId !== sessionId) {
      console.log('🟢 FIREBASE SIGNALING - Disconnecting from previous session:', this.sessionId);
      await this.disconnect();
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    this.sessionId = sessionId;
    this.baseSessionId = baseSessionId;
    this.currentUserId = currentUserId;
    
    console.log('🟢 FIREBASE SIGNALING - Initializing for session:', sessionId, 'base:', baseSessionId, 'user:', currentUserId);
    
    await this.startListening();
    await this.cleanupOldMessages();
  }

  // Send a signaling message
  async sendMessage(message: Omit<SignalingMessage, 'timestamp' | 'expiresAt' | 'baseSessionId'>): Promise<void> {
    if (!this.sessionId || !this.currentUserId || !this.baseSessionId) {
      console.warn('🟡 FIREBASE SIGNALING - Cannot send message, service not fully initialized');
      return;
    }

    const now = Timestamp.now();
    const expiresAt = new Timestamp(now.seconds + 3600, now.nanoseconds); // 1 hour from now

    const signalingMessage: Omit<SignalingMessage, 'id'> = {
      ...message,
      baseSessionId: this.baseSessionId,
      timestamp: now,
      expiresAt
    };

    try {
      await addDoc(collection(db, 'signaling'), signalingMessage);
      console.log('🟢 FIREBASE SIGNALING - Sent message:', {
        type: message.type,
        from: message.from,
        to: message.to,
        sessionId: message.sessionId,
        baseSessionId: this.baseSessionId
      });
    } catch (error) {
      console.error('🔴 FIREBASE SIGNALING - Failed to send message:', error);
      throw error;
    }
  }

  // Start listening for incoming messages
  private async startListening(): Promise<void> {
    if (!this.sessionId || !this.currentUserId || !this.baseSessionId) {
      throw new Error('Signaling service not initialized');
    }

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Query must constrain baseSessionId so Firestore can evaluate session membership.
    const messagesQuery = query(
      collection(db, 'signaling'),
      where('sessionId', '==', this.sessionId),
      where('baseSessionId', '==', this.baseSessionId),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    this.unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = change.doc.data() as SignalingMessage;
          message.id = change.doc.id;
          
          // Only process messages that are for this user or from other users
          if (message.from !== this.currentUserId && 
              (!message.to || message.to === this.currentUserId)) {
            
            console.log('🟢 FIREBASE SIGNALING - Received message:', {
              type: message.type,
              from: message.from,
              to: message.to,
              sessionId: message.sessionId
            });

            // Notify handlers
            this.notifyHandlers(message);
          }
        }
      });
    }, (error) => {
      console.error('🔴 FIREBASE SIGNALING - Error listening for messages:', error);
    });
  }

  // Register a message handler
  onMessage(type: string, handler: (message: SignalingMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  // Notify handlers of new messages
  private notifyHandlers(message: SignalingMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  // Clean up old messages
  private async cleanupOldMessages(): Promise<void> {
    try {
      // This would ideally be done with a Cloud Function, but for now we'll just log
      console.log('🟢 FIREBASE SIGNALING - Cleanup would remove old messages');
    } catch (error) {
      console.error('🔴 FIREBASE SIGNALING - Error cleaning up messages:', error);
    }
  }

  // Send a join message
  async sendJoinMessage(participants: Array<{ id: string; name: string }>): Promise<void> {
    await this.sendMessage({
      type: 'join',
      from: this.currentUserId!,
      data: { participants },
      sessionId: this.sessionId!
    });
  }

  // Send a leave message
  async sendLeaveMessage(): Promise<void> {
    await this.sendMessage({
      type: 'leave',
      from: this.currentUserId!,
      data: {},
      sessionId: this.sessionId!
    });
  }

  // Send an offer
  async sendOffer(to: string, offer: RTCSessionDescriptionInit): Promise<void> {
    await this.sendMessage({
      type: 'offer',
      from: this.currentUserId!,
      to,
      data: { offer },
      sessionId: this.sessionId!
    });
  }

  // Send an answer
  async sendAnswer(to: string, answer: RTCSessionDescriptionInit): Promise<void> {
    await this.sendMessage({
      type: 'answer',
      from: this.currentUserId!,
      to,
      data: { answer },
      sessionId: this.sessionId!
    });
  }

  // Send an ICE candidate
  async sendIceCandidate(to: string, candidate: RTCIceCandidateInit): Promise<void> {
    // Convert RTCIceCandidateInit to a plain object for Firestore
    const candidateData = {
      candidate: candidate.candidate || '',
      sdpMLineIndex: candidate.sdpMLineIndex || 0,
      sdpMid: candidate.sdpMid || ''
    };
    
    await this.sendMessage({
      type: 'ice-candidate',
      from: this.currentUserId!,
      to,
      data: { candidate: candidateData },
      sessionId: this.sessionId!
    });
  }

  // Disconnect and cleanup
  async disconnect(options: { skipLeave?: boolean } = {}): Promise<void> {
    console.log('🟢 FIREBASE SIGNALING - Disconnecting from session:', this.sessionId);
    
    // Send leave message unless caller already did (avoids duplicate leave on full teardown)
    if (!options.skipLeave && this.sessionId && this.currentUserId) {
      try {
        await this.sendLeaveMessage();
      } catch (error) {
        console.error('🔴 FIREBASE SIGNALING - Error sending leave message:', error);
      }
    }

    // Unsubscribe from Firestore listener
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Clear handlers
    this.messageHandlers.clear();

    // Reset state
    this.sessionId = null;
    this.baseSessionId = null;
    this.currentUserId = null;
  }
} 