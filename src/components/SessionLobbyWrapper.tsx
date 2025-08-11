import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionLobby } from './SessionLobby';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';


const SessionLobbyWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { 
    session, 
    loadSession, 
    pollSession,
    startSession, 
    leaveSession, 
    updateReadyState, 
    updateParticipantRole,
    addTopicSuggestion,
    voteForTopic,
    isHost, 
    currentUserId,
    loading, 
    error, 
    clearError 
  } = useSession();
  const { user, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load session data only when user is authenticated
  useEffect(() => {
    console.log('SessionLobbyWrapper useEffect:', { sessionId, user: !!user, authLoading, currentUserId });
    if (sessionId && user && !authLoading) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession, user, authLoading]);

  // Check if user is a participant in the session, redirect to join if not
  useEffect(() => {
    if (session && currentUserId && !loading) {
      const isParticipant = session.participants.some(p => p.id === currentUserId);
      const isHostOfSession = session.hostId === currentUserId;
      
      console.log('Checking user participation:', {
        currentUserId,
        isParticipant,
        isHostOfSession,
        participants: session.participants.map(p => ({ id: p.id, name: p.name, role: p.role })),
        hostId: session.hostId
      });
      
      if (!isParticipant && !isHostOfSession) {
        console.log('User is not a participant, redirecting to join page');
        navigate(`/practice/join/${sessionId}`);
        return;
      }
    }
  }, [session, currentUserId, loading, navigate, sessionId]);

  // Poll for session status changes and redirect when session becomes active
  useEffect(() => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (!sessionId || !session) return;

    // Only poll if session is still waiting to start
    if (session.status !== 'waiting') return;

    // Don't poll if a modal is open (prevents flashing during user interactions)
    if (isModalOpen) {
      console.log('Polling paused - modal is open');
      return;
    }

    console.log('Starting polling for session updates');
    pollIntervalRef.current = setInterval(async () => {
      // Don't set loading state for background polling to prevent flickering
      try {
        await pollSession(sessionId);
      } catch (error) {
        console.error('Background polling failed:', error);
      }
    }, 5000); // Check every 5 seconds instead of 2

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [sessionId, session, pollSession, isModalOpen]);

  // Redirect to practice session when session becomes active
  useEffect(() => {
    if (session && session.status === 'active') {
      window.location.href = `/practice?sessionId=${session.sessionId}`;
    }
  }, [session]);

  // Log modal state changes for debugging
  useEffect(() => {
    console.log('Modal state changed:', isModalOpen);
  }, [isModalOpen]);

  const handleStartSession = async (_sessionId: string, fivePersonChoice?: 'split' | 'together') => {
    try {
      await startSession(fivePersonChoice);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleLeaveSession = async (_userId: string) => {
    try {
      await leaveSession();
    } catch (err) {
      console.error('Failed to leave session:', err);
    }
  };

  const handleUpdateReadyState = async (_userId: string, isReady: boolean) => {
    try {
      await updateReadyState(isReady);
    } catch (err) {
      console.error('Failed to update ready state:', err);
    }
  };

  const handleUpdateParticipantRole = async (_userId: string, role: string) => {
    try {
      await updateParticipantRole(role);
    } catch (err) {
      console.error('Failed to update participant role:', err);
    }
  };

  const handleAddTopicSuggestion = async (topic: string) => {
    try {
      await addTopicSuggestion(topic);
    } catch (err) {
      console.error('Failed to add topic suggestion:', err);
    }
  };

  const handleVoteForTopic = async (suggestionId: string) => {
    try {
      await voteForTopic(suggestionId);
    } catch (err) {
      console.error('Failed to vote for topic:', err);
    }
  };

  // Memoize the SessionLobby props to prevent unnecessary re-renders
  const sessionLobbyProps = useMemo(() => ({
    session: session!, // We know session is not null here due to the null check below
    currentUserId,
    isHost,
    onStartSession: handleStartSession,
    onLeaveSession: handleLeaveSession,
    onUpdateReadyState: handleUpdateReadyState,
    onUpdateParticipantRole: handleUpdateParticipantRole,
    onModalStateChange: setIsModalOpen,
    onAddTopicSuggestion: handleAddTopicSuggestion,
    onVoteForTopic: handleVoteForTopic
  }), [session, currentUserId, isHost]);

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access the session lobby.</p>
        </div>
      </div>
    );
  }

  if (!session || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={clearError}
            className="text-red-600 hover:text-red-800 underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <SessionLobby {...sessionLobbyProps} />
      
      {/* Only show loading overlay for user-initiated actions */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { SessionLobbyWrapper }; 