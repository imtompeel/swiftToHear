import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileParticipantInterface } from './MobileParticipantInterface';
import { InPersonRoleSelection } from './InPersonRoleSelection';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';
import { SessionParticipant, createSessionContext } from '../types/sessionContext';

const MobileParticipantWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading, ensureSignedIn } = useAuth();
  const [participantName, setParticipantName] = useState<string>('');
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const participantId = user?.uid || '';

  const { 
    session, 
    loadSession, 
    pollSession,
    currentUserId,
    loading, 
    error, 
    clearError 
  } = useSession(participantId, participantName || user?.displayName || 'Guest');
  const [, setSelectedRole] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    (async () => {
      try {
        await ensureSignedIn();
        if (!cancelled) setAuthReady(true);
      } catch (err) {
        console.error('Failed to establish auth for mobile join:', err);
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : 'Failed to sign in');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, ensureSignedIn]);

  useEffect(() => {
    if (sessionId && authReady) {
      loadSession(sessionId);
    }
  }, [sessionId, authReady, loadSession]);

  useEffect(() => {
    if (!sessionId || !session) return;

    const pollInterval = setInterval(async () => {
      try {
        await pollSession(sessionId);
      } catch (pollError) {
        console.error('MobileParticipantWrapper polling error:', pollError);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [sessionId, session, pollSession]);

  // Restore joined state when auth uid is already in the session
  useEffect(() => {
    if (session && participantId && !hasJoined) {
      const existingParticipant = session.participants.find(p => p.id === participantId);
      if (existingParticipant) {
        setParticipantName(existingParticipant.name);
        setSelectedRole(existingParticipant.role);
        setHasJoined(true);
        localStorage.setItem(`participant-${session.sessionId}`, participantId);
      }
    }
  }, [session, participantId, hasJoined]);

  const handleRoleSelected = (role: string) => {
    setSelectedRole(role);
    if (participantId && session) {
      localStorage.setItem(`participant-${session.sessionId}`, participantId);
    }
  };

  const handleNameChange = (name: string) => {
    setParticipantName(name);
  };

  const handleReady = () => {
    console.log('User is ready for the session');
  };

  if (authLoading || !authReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preparing secure session…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 dark:text-red-400 mb-4">{authError}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enable Anonymous Authentication in the Firebase console (Authentication → Sign-in method).
          </p>
        </div>
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error === 'Session is full' 
              ? 'This session has reached its maximum number of participants. Please contact the host to join.' 
              : error}
          </p>
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

  if (!hasJoined || session.status === 'waiting') {
    return (
      <InPersonRoleSelection
        session={session}
        currentUserId={participantId}
        currentUserName={participantName}
        onRoleSelected={handleRoleSelected}
        onNameChange={handleNameChange}
        onReady={handleReady}
      />
    );
  }

  const participants: SessionParticipant[] = session.participants.map(p => ({
    id: p.id,
    name: p.name,
    role: p.role || 'observer',
    status: p.status
  }));

  const sessionContext = createSessionContext(session);
  const actualCurrentUserId = participantId || currentUserId || '';

  return (
    <MobileParticipantInterface
      session={sessionContext}
      currentUserId={actualCurrentUserId}
      currentUserName={participantName}
      participants={participants}
    />
  );
};

export { MobileParticipantWrapper };
