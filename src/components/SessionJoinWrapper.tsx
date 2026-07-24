import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SessionJoin } from './SessionJoin';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';

const SessionJoinWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading, ensureSignedIn } = useAuth();
  const [joinLoading, setJoinLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Ensure Firebase Auth (anonymous if needed) so participant id === auth.uid
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    (async () => {
      try {
        await ensureSignedIn();
        if (!cancelled) {
          setAuthReady(true);
        }
      } catch (err) {
        console.error('Failed to establish auth for session join:', err);
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : 'Failed to sign in');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, ensureSignedIn]);

  const currentUserId = user?.uid || '';
  const currentUserName = user?.displayName || user?.email || 'Guest';

  const { 
    session, 
    loadSession, 
    joinSession, 
    error, 
    clearError,
    loading: sessionLoading 
  } = useSession(currentUserId, currentUserName);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (sessionId && authReady && currentUserId) {
      loadSession(sessionId);
    }
  }, [sessionId, authReady, currentUserId, loadSession]);

  const handleJoinSession = async (joinData: any) => {
    setJoinLoading(true);
    try {
      const signedIn = await ensureSignedIn(joinData.userName);
      const finalJoinData = {
        ...joinData,
        userId: signedIn.uid,
        userName: joinData.userName || signedIn.displayName || signedIn.email || 'Guest'
      };
      
      await joinSession(finalJoinData);
    } catch (err) {
      console.error('Failed to join session:', err);
      setJoinLoading(false);
      throw err;
    }
  };

  if (authLoading || !authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preparing secure session…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 mb-4">{authError}</p>
          <p className="text-sm text-gray-600">
            Enable Anonymous Authentication in the Firebase console (Authentication → Sign-in method).
          </p>
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
        onRoleSelect={() => { /* role chosen in lobby after join */ }}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
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
