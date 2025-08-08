import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreGroupSessionService, GroupSessionCreateData } from '../firestoreGroupSessionService';
import { GroupSessionData, GroupData } from '../../types/groupSession';

// Mock Firebase
vi.mock('../../firebase/config', () => ({
  db: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date() })
  }
}));

// Import mocked functions
import { 
  setDoc as mockSetDoc, 
  getDoc as mockGetDoc, 
  updateDoc as mockUpdateDoc, 
  deleteDoc as mockDeleteDoc,
  query as mockQuery,
  where as mockWhere,
  getDocs as mockGetDocs,
  serverTimestamp as mockServerTimestamp,
  collection as mockCollection,
  doc as mockDoc
} from 'firebase/firestore';

describe('FirestoreGroupSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServerTimestamp.mockReturnValue({ toDate: () => new Date() });
    mockDoc.mockImplementation((db, collection, id) => ({ db, collection, id }));
  });

  describe('createGroupSession', () => {
    it('should create a new group session', async () => {
      const sessionData: GroupSessionCreateData = {
        sessionName: 'Test Group Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        hostRole: 'participant',
        minParticipants: 3,
        maxParticipants: 12,
        groupMode: 'multi',
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockSetDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.createGroupSession(sessionData);

      expect(result).toMatchObject({
        sessionName: 'Test Group Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        hostRole: 'participant',
        status: 'waiting',
        groupMode: 'multi',
        participants: [{
          id: 'host123',
          name: 'Host User',
          role: '',
          status: 'ready'
        }]
      });

      expect(mockSetDoc).toHaveBeenCalled();
    });
  });

  describe('getGroupSession', () => {
    it('should return session data when session exists', async () => {
      const mockSessionData: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockSessionData
      });

      const result = await FirestoreGroupSessionService.getGroupSession('test-session');

      expect(result).toEqual(mockSessionData);
      expect(mockGetDoc).toHaveBeenCalled();
    });

    it('should return null when session does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await FirestoreGroupSessionService.getGroupSession('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('joinGroupSession', () => {
    it('should add new participant to session', async () => {
      const existingSession: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [{
          id: 'host123',
          name: 'Host User',
          role: 'speaker',
          status: 'ready'
        }],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingSession
      });

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.joinGroupSession(
        'test-session',
        'user456',
        'New User',
        'listener'
      );

      expect(result?.participants).toHaveLength(2);
      expect(result?.participants).toContainEqual({
        id: 'user456',
        name: 'New User',
        role: 'listener',
        status: 'ready'
      });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should update existing participant', async () => {
      const existingSession: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [{
          id: 'user456',
          name: 'Existing User',
          role: '',
          status: 'not-ready'
        }],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingSession
      });

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.joinGroupSession(
        'test-session',
        'user456',
        'Existing User',
        'scribe'
      );

      expect(result?.participants[0]).toEqual({
        id: 'user456',
        name: 'Existing User',
        role: 'scribe',
        status: 'ready'
      });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('assignParticipantsToGroups', () => {
    it('should create single group for single mode', async () => {
      const session: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [
          { id: 'user1', name: 'User 1', role: 'speaker', status: 'ready' },
          { id: 'user2', name: 'User 2', role: 'listener', status: 'ready' },
          { id: 'user3', name: 'User 3', role: 'scribe', status: 'ready' }
        ],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => session
      });

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.assignParticipantsToGroups('test-session');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        groupId: 'group-1',
        participants: session.participants,
        status: 'waiting',
        currentPhase: 'waiting',
        roundNumber: 1
      });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('startGroupSession', () => {
    it('should start group session and assign groups', async () => {
      const session: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [
          { id: 'user1', name: 'User 1', role: 'speaker', status: 'ready' },
          { id: 'user2', name: 'User 2', role: 'listener', status: 'ready' },
          { id: 'user3', name: 'User 3', role: 'scribe', status: 'ready' }
        ],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => session
      });

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.startGroupSession('test-session');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'active',
          currentPhase: 'hello-checkin'
        })
      );
    });
  });

  describe('updateParticipantReadyState', () => {
    it('should update participant ready state', async () => {
      const session: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [
          { id: 'user1', name: 'User 1', role: 'speaker', status: 'not-ready' }
        ],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => session
      });

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.updateParticipantReadyState(
        'test-session',
        'user1',
        true
      );

      expect(result?.participants[0].status).toBe('ready');
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('leaveGroupSession', () => {
    it('should remove participant from session and groups', async () => {
      const session: GroupSessionData = {
        sessionId: 'test-session',
        sessionName: 'Test Session',
        duration: 30,
        topic: 'Test Topic',
        hostId: 'host123',
        hostName: 'Host User',
        createdAt: { toDate: () => new Date() } as any,
        participants: [
          { id: 'user1', name: 'User 1', role: 'speaker', status: 'ready' },
          { id: 'user2', name: 'User 2', role: 'listener', status: 'ready' }
        ],
        status: 'waiting',
        minParticipants: 3,
        maxParticipants: 12,
        topicSuggestions: [],
        groupMode: 'single',
        groups: [
          {
            groupId: 'group-1',
            participants: [
              { id: 'user1', name: 'User 1', role: 'speaker', status: 'ready' },
              { id: 'user2', name: 'User 2', role: 'listener', status: 'ready' }
            ],
            status: 'waiting',
            currentPhase: 'waiting',
            roundNumber: 1,
            scribeNotes: {}
          }
        ],
        groupConfiguration: {
          groupSize: 4,
          autoAssignRoles: true,
          groupRotation: 'balanced',
          observerStrategy: 'distribute'
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => session
      });

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await FirestoreGroupSessionService.leaveGroupSession(
        'test-session',
        'user1'
      );

      expect(result?.participants).toHaveLength(1);
      expect(result?.participants[0].id).toBe('user2');
      expect(result?.groups[0].participants).toHaveLength(1);
      expect(result?.groups[0].participants[0].id).toBe('user2');

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });
});
