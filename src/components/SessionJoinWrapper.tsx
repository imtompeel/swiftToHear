import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SessionJoin } from './SessionJoin';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';

const SessionJoinWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [joinLoading, setJoinLoading] = useState(false);
  const [anonymousUserId, setAnonymousUserId] = useState<string>('');

  // Generate anonymous user ID for unauthenticated users
  useEffect(() => {
    if (!user && !anonymousUserId) {
      const anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setAnonymousUserId(anonymousId);
    }
  }, [user, anonymousUserId]);

  const { 
    session, 
    loadSession, 
    joinSession, 
    currentUserId, 
    currentUserName, 
    error, 
    clearError,
    loading: sessionLoading 
  } = useSession(user?.uid || anonymousUserId, user?.displayName || user?.email || 'Anonymous User');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load session data - allow both authenticated and anonymous users
  useEffect(() => {
    if (sessionId && !authLoading) {
      loadSession(sessionId);
    }
  }, [sessionId, authLoading, loadSession]);

  const handleJoinSession = async (joinData: any) => {
    setJoinLoading(true);
    try {
      // Use authenticated user info if available, otherwise use anonymous info
      const finalJoinData = {
        ...joinData,
        userId: user?.uid || anonymousUserId,
        userName: user?.displayName || user?.email || joinData.userName || 'Anonymous User'
      };
      
      await joinSession(finalJoinData);
    } catch (err) {
      console.error('Failed to join session:', err);
      setJoinLoading(false);
      throw err; // Re-throw so the SessionJoin component can handle it
    }
  };



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

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading session...</p>
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
      
      <SessionJoin 
        session={session}
        onJoinSession={handleJoinSession}
        currentUserId={user?.uid || anonymousUserId}
        currentUserName={user?.displayName || user?.email || 'Anonymous User'}
        isFirstTime={true}
      />
      
      {joinLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p>Joining session...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { SessionJoinWrapper }; 