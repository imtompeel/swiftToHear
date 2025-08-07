import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionService, SessionData } from '../sessionService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SessionService.clearAllSessions();
  });

  describe('createSession', () => {
    it('should create a new session with correct data', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const session = await SessionService.createSession(sessionData);

      expect(session).toBeDefined();
      expect(session.sessionName).toBe('Test Session');
      expect(session.duration).toBe(15 * 60 * 1000);
      expect(session.topic).toBe('Test topic');
      expect(session.hostId).toBe('host-123');
      expect(session.hostName).toBe('Test Host');
      expect(session.status).toBe('waiting');
      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].id).toBe('host-123');
      expect(session.participants[0].role).toBe('host');
      expect(session.participants[0].status).toBe('ready');
      expect(session.sessionId).toMatch(/^session-/);
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    it('should store session in localStorage', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const session = await SessionService.createSession(sessionData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `session_${session.sessionId}`,
        expect.any(String)
      );
    });
  });

  describe('getSession', () => {
    it('should return null for non-existent session', async () => {
      const session = await SessionService.getSession('non-existent');
      expect(session).toBeNull();
    });

    it('should return session from memory', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const createdSession = await SessionService.createSession(sessionData);
      const retrievedSession = await SessionService.getSession(createdSession.sessionId);

      expect(retrievedSession).toEqual(createdSession);
    });

    it('should return session from localStorage', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const createdSession = await SessionService.createSession(sessionData);
      
      // Clear memory and simulate localStorage retrieval
      SessionService.clearAllSessions();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(createdSession));

      const retrievedSession = await SessionService.getSession(createdSession.sessionId);

      expect(retrievedSession).toEqual(createdSession);
    });
  });

  describe('joinSession', () => {
    it('should add participant to session', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const session = await SessionService.createSession(sessionData);
      
      const joinData = {
        sessionId: session.sessionId,
        userId: 'user-456',
        userName: 'Test User',
        role: 'listener'
      };

      const updatedSession = await SessionService.joinSession(joinData);

      expect(updatedSession).toBeDefined();
      expect(updatedSession!.participants).toHaveLength(2);
      expect(updatedSession!.participants.find(p => p.id === 'user-456')).toBeDefined();
      expect(updatedSession!.participants.find(p => p.id === 'user-456')!.role).toBe('listener');
    });

    it('should throw error for unavailable role', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const session = await SessionService.createSession(sessionData);
      
      // Add a listener
      await SessionService.joinSession({
        sessionId: session.sessionId,
        userId: 'user-456',
        userName: 'Test User',
        role: 'listener'
      });

      // Try to add another listener (should fail)
      await expect(SessionService.joinSession({
        sessionId: session.sessionId,
        userId: 'user-789',
        userName: 'Another User',
        role: 'listener'
      })).rejects.toThrow('Role not available');
    });
  });

  describe('updateReadyState', () => {
    it('should update participant ready state', async () => {
      const sessionData = {
        sessionName: 'Test Session',
        duration: 15 * 60 * 1000,
        topic: 'Test topic',
        hostId: 'host-123',
        hostName: 'Test Host',
        minParticipants: 2,
        maxParticipants: 4
      };

      const session = await SessionService.createSession(sessionData);
      
      // Add a participant
      const joinData = {
        sessionId: session.sessionId,
        userId: 'user-456',
        userName: 'Test User',
        role: 'listener'
      };

      await SessionService.joinSession(joinData);

      // Update ready state
      const updatedSession = await SessionService.updateReadyState(session.sessionId, 'user-456', true);

      expect(updatedSession).toBeDefined();
      const participant = updatedSession!.participants.find(p => p.id === 'user-456');
      expect(participant!.status).toBe('ready');
    });
  });

  describe('getAvailableRoles', () => {
    it('should return all roles for empty session', () => {
      const session: SessionData = {
        sessionId: 'test',
        sessionName: 'Test',
        duration: 15 * 60 * 1000,
        topic: 'Test',
        hostId: 'host-123',
        hostName: 'Host',
        createdAt: new Date(),
        participants: [],
        status: 'waiting',
        minParticipants: 2,
        maxParticipants: 4
      };

      const availableRoles = SessionService.getAvailableRoles(session);
      expect(availableRoles).toEqual(['listener', 'scribe', 'observer']);
    });

    it('should exclude taken roles', () => {
      const session: SessionData = {
        sessionId: 'test',
        sessionName: 'Test',
        duration: 15 * 60 * 1000,
        topic: 'Test',
        hostId: 'host-123',
        hostName: 'Host',
        createdAt: new Date(),
        participants: [
          { id: 'user-1', name: 'User 1', role: 'listener', status: 'ready' },
          { id: 'user-2', name: 'User 2', role: 'scribe', status: 'ready' }
        ],
        status: 'waiting',
        minParticipants: 2,
        maxParticipants: 4
      };

      const availableRoles = SessionService.getAvailableRoles(session);
      expect(availableRoles).toEqual(['observer']);
    });
  });
}); 