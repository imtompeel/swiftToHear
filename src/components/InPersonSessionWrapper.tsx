import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InPersonSession } from './InPersonSession';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';
import { createSessionContext } from '../types/sessionContext';

const InPersonSessionWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { 
    session, 
    loadSession,
    pollSession,
    currentUserId,
    loading, 
    error, 
    clearError 
  } = useSession();
  const { user, loading: authLoading } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load session data only when user is authenticated
  useEffect(() => {
    console.log('InPersonSessionWrapper: Loading session', { sessionId, user: !!user, authLoading });
    if (sessionId && user && !authLoading) {
      loadSession(sessionId);
    }
  }, [sessionId, user, authLoading, loadSession]);

  // Set up polling for real-time updates when session is loaded
  useEffect(() => {
    if (!sessionId || !session) return;

    console.log('InPersonSessionWrapper: Setting up polling for session updates');
    
    // Poll every 2 seconds for updates (balanced frequency for updates vs blinking)
    const pollInterval = setInterval(async () => {
      try {
        await pollSession(sessionId);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return () => {
      console.log('InPersonSessionWrapper: Cleaning up polling');
      clearInterval(pollInterval);
    };
  }, [sessionId, session, pollSession]);

  // Check if user is the host of this session
  useEffect(() => {
    console.log('InPersonSessionWrapper: Checking host status', { 
      session: !!session, 
      currentUserId, 
      loading, 
      sessionHostId: session?.hostId 
    });
    
    if (session && currentUserId && !loading) {
      const isHostOfSession = session.hostId === currentUserId;
      
      if (!isHostOfSession) {
        console.log('User is not the host, redirecting to join page');
        navigate(`/in-person/join/${sessionId}`);
        return;
      }
    }
  }, [session, currentUserId, loading, navigate, sessionId]);

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
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access the in-person session.</p>
        </div>
      </div>
    );
  }

  // Show loading while session is being loaded
  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading session...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Session ID: {sessionId}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show error if session loading failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={clearError}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Convert session data to SessionContext format
  const sessionContext = createSessionContext(session);

  return (
    <InPersonSession
      session={sessionContext}
      currentUserId={currentUserId || ''}
      currentUserName={user.displayName || user.email || 'Anonymous'}
      participants={sessionContext.participants}
    />
  );
};

export { InPersonSessionWrapper };
