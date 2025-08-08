import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirestoreSessionService, SessionData, JoinData } from '../services/firestoreSessionService';
import { useAuth } from '../contexts/AuthContext';

export const useSession = () => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const previousSessionRef = useRef<string>('');

  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  // Get current user info from auth context
  const currentUserId = user?.uid || '';
  const currentUserName = user?.displayName || user?.email || 'Anonymous User';

  // Update host status when user or session changes
  useEffect(() => {
    if (session && currentUserId) {
      // Check if current user is the host by comparing with session.hostId
      setIsHost(session.hostId === currentUserId);
    }
  }, [session, currentUserId]);

  // Load session data
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionData = await FirestoreSessionService.getSession(sessionId);
      if (!sessionData) {
        setError('Session not found');
        return;
      }
      
      setSession(sessionData);
      
      // Check if current user is host (only if we have a currentUserId)
      if (currentUserId) {
        setIsHost(sessionData.hostId === currentUserId);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Poll session data (for background updates without loading states)
  const pollSession = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await FirestoreSessionService.getSession(sessionId);
      if (!sessionData) {
        return;
      }
      
      // Create a simple hash of the session data to detect changes
      const sessionHash = JSON.stringify({
        participants: sessionData.participants.map(p => ({ id: p.id, role: p.role, status: p.status })),
        status: sessionData.status,
        currentPhase: sessionData.currentPhase
      });
      
      // Only update if there are actual changes
      if (sessionHash !== previousSessionRef.current) {
        console.log('Session data changed, updating...');
        previousSessionRef.current = sessionHash;
        
        // Use a small delay to batch updates and prevent rapid re-renders
        setTimeout(() => {
          setSession(sessionData);
          
          // Check if current user is host (only if we have a currentUserId)
          if (currentUserId) {
            setIsHost(sessionData.hostId === currentUserId);
          }
        }, 100);
      }
      
    } catch (err) {
      console.error('Background polling error:', err);
      // Don't set error state for background polling failures
    }
  }, [currentUserId]);

  // Create session
  const createSession = useCallback(async (sessionData: Omit<SessionData, 'sessionId' | 'createdAt' | 'participants' | 'status'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newSession = await FirestoreSessionService.createSession({
        ...sessionData,
        hostId: currentUserId,
        hostName: currentUserName
      });
      
      setSession(newSession);
      setIsHost(true);
      
      // Navigate to lobby
      navigate(`/practice/lobby/${newSession.sessionId}`);
      
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUserName, navigate]);

  // Join session
  const joinSession = useCallback(async (joinData: JoinData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.joinSession(joinData);
      
      if (!updatedSession) {
        setError('Failed to join session');
        return;
      }
      
      setSession(updatedSession);
      
      // Navigate to lobby
      navigate(`/practice/lobby/${joinData.sessionId}`);
      
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Update ready state
  const updateReadyState = useCallback(async (isReady: boolean) => {
    if (!session) return;
    
    try {
      const updatedSession = await FirestoreSessionService.updateReadyState(session.sessionId, currentUserId, isReady);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ready state');
    }
  }, [session, currentUserId]);

  // Update participant role
  const updateParticipantRole = useCallback(async (role: string) => {
    if (!session) {
      console.error('updateParticipantRole: No session available');
      return;
    }
    
    console.log('updateParticipantRole called:', { role, currentUserId, sessionId: session.sessionId });
    
    try {
      const updatedSession = await FirestoreSessionService.updateParticipantRole(session.sessionId, currentUserId, role);
      if (updatedSession) {
        console.log('Role updated successfully:', updatedSession);
        setSession(updatedSession);
      } else {
        console.error('updateParticipantRole: No updated session returned');
      }
    } catch (err) {
      console.error('updateParticipantRole error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  }, [session, currentUserId]);

  // Add topic suggestion
  const addTopicSuggestion = useCallback(async (topic: string) => {
    if (!session) return;
    
    try {
      const updatedSession = await FirestoreSessionService.addTopicSuggestion(
        session.sessionId, 
        topic, 
        currentUserId, 
        currentUserName
      );
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add topic suggestion');
    }
  }, [session, currentUserId, currentUserName]);

  // Vote for topic suggestion
  const voteForTopic = useCallback(async (suggestionId: string) => {
    if (!session) return;
    
    try {
      const updatedSession = await FirestoreSessionService.voteForTopic(
        session.sessionId, 
        suggestionId, 
        currentUserId
      );
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote for topic');
    }
  }, [session, currentUserId]);

  // Start session
  const startSession = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.startSession(session.sessionId);
      if (updatedSession) {
        setSession(updatedSession);
        
        // Navigate to the main practice session
        navigate(`/practice?sessionId=${session.sessionId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, navigate]);

  // Complete hello check-in phase (only host can call this)
  const completeHelloCheckIn = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.completeHelloCheckIn(session.sessionId, currentUserId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete hello check-in');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, currentUserId]);

  // Complete scribe feedback phase (only host can call this)
  const completeScribeFeedback = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      console.log('Completing scribe feedback, current phase:', session.currentPhase);
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.completeScribeFeedback(session.sessionId, currentUserId);
      if (updatedSession) {
        console.log('Scribe feedback completed, new phase:', updatedSession.currentPhase);
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete scribe feedback');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, currentUserId]);

  // Complete round (only host can call this)
  const completeRound = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.completeRound(session.sessionId, currentUserId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete round');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, currentUserId]);

  // Continue with another round cycle (only host can call this)
  const continueRounds = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.continueRounds(session.sessionId, currentUserId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue rounds');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, currentUserId]);

  // Start free-flowing dialogue (only host can call this)
  const startFreeDialogue = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.startFreeDialogue(session.sessionId, currentUserId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start free dialogue');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, currentUserId]);

  // End session and move to reflection (only host can call this)
  const endSession = useCallback(async () => {
    if (!session || !isHost) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedSession = await FirestoreSessionService.endSession(session.sessionId, currentUserId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    } finally {
      setLoading(false);
    }
  }, [session, isHost, currentUserId]);

  // Leave session
  const leaveSession = useCallback(async () => {
    if (!session) return;
    
    try {
      const updatedSession = await FirestoreSessionService.leaveSession(session.sessionId, currentUserId);
      
      if (!updatedSession) {
        // Session was deleted (no participants left)
        setSession(null);
        setIsHost(false);
        navigate('/practice/create');
      } else {
        setSession(updatedSession);
        setIsHost(false);
        navigate('/practice/create');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave session');
    }
  }, [session, currentUserId, navigate]);

  // Update user name
  const updateUserName = useCallback((name: string) => {
    localStorage.setItem('currentUserName', name);
  }, []);

  // Get available roles for current session
  const getAvailableRoles = useCallback(() => {
    if (!session) return [];
    return FirestoreSessionService.getAvailableRoles(session);
  }, [session]);

  // Check if current user is in session
  const isCurrentUserInSession = useCallback(() => {
    if (!session) return false;
    return session.participants.some(p => p.id === currentUserId);
  }, [session, currentUserId]);

  // Get current user's participant data
  const getCurrentUserParticipant = useCallback(() => {
    if (!session) return null;
    return session.participants.find(p => p.id === currentUserId) || null;
  }, [session, currentUserId]);

  return {
    // State
    session,
    loading,
    error,
    currentUserId,
    currentUserName,
    isHost,
    
    // Actions
    loadSession,
    pollSession,
    createSession,
    joinSession,
    updateReadyState,
    updateParticipantRole,
    addTopicSuggestion,
    voteForTopic,
    startSession,
    completeHelloCheckIn,
    completeScribeFeedback,
    completeRound,
    continueRounds,
    startFreeDialogue,
    endSession,
    leaveSession,
    updateUserName,
    
    // Utilities
    getAvailableRoles,
    isCurrentUserInSession,
    getCurrentUserParticipant,
    
    // Clear error
    clearError: () => setError(null)
  };
}; 