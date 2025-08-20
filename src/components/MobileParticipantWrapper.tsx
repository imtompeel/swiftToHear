import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileParticipantInterface } from './MobileParticipantInterface';
import { InPersonRoleSelection } from './InPersonRoleSelection';
import { useSession } from '../hooks/useSession';
import { SessionParticipant, createSessionContext } from '../types/sessionContext';

const MobileParticipantWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [participantName, setParticipantName] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');
  
  const { 
    session, 
    loadSession, 
    pollSession,
    currentUserId,
    loading, 
    error, 
    clearError 
  } = useSession(participantId, participantName);
  const [, setSelectedRole] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Set up polling for real-time updates when session is loaded
  useEffect(() => {
    if (!sessionId || !session) return;

    console.log('MobileParticipantWrapper: Setting up polling for session updates');
    
    // Poll every 2 seconds for updates
    const pollInterval = setInterval(async () => {
      try {
        await pollSession(sessionId);
      } catch (error) {
        console.error('MobileParticipantWrapper polling error:', error);
      }
    }, 2000);

    return () => {
      console.log('MobileParticipantWrapper: Cleaning up polling');
      clearInterval(pollInterval);
    };
  }, [sessionId, session, pollSession]);

  // Check if user is already a participant when session loads
  useEffect(() => {
    if (session && !hasJoined) {
      // Check if we have stored participant info in localStorage
      const storedParticipantId = localStorage.getItem(`participant-${session.sessionId}`);
      console.log('MobileParticipantWrapper Debug:', {
        sessionId: session.sessionId,
        storedParticipantId,
        participants: session.participants.map(p => ({ id: p.id, name: p.name, role: p.role })),
        hasJoined
      });
      
      if (storedParticipantId) {
        // Check if this participant exists in the session
        const existingParticipant = session.participants.find(p => p.id === storedParticipantId);
        if (existingParticipant) {
          // User is already a participant, restore their state
          console.log('Restoring participant state:', existingParticipant);
          setParticipantName(existingParticipant.name);
          setSelectedRole(existingParticipant.role);
          setParticipantId(storedParticipantId);
                  setHasJoined(true);
          return;
        } else {
          console.warn('Stored participant ID not found in session:', storedParticipantId);
        }
      }
    }
  }, [session, hasJoined]);

  const handleRoleSelected = (role: string) => {
    setSelectedRole(role);
    
    // Generate a unique participant ID if not already set
    if (!participantId && session) {
      const newParticipantId = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setParticipantId(newParticipantId);
      localStorage.setItem(`participant-${session.sessionId}`, newParticipantId);
    }
  };

  const handleNameChange = (name: string) => {
    setParticipantName(name);
  };

  const handleReady = () => {
    // User has clicked "I'm Ready" but we'll stay on the ready screen
    // until the session actually starts (status changes from 'waiting')
    console.log('User is ready for the session');
  };

  // Show loading while session is being loaded
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

  // Show error if session loading failed
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

  // Show role selection if not joined yet or session is still waiting
  console.log('MobileParticipantWrapper: Checking conditions:', {
    hasJoined,
    sessionStatus: session.status,
    sessionPhase: session.currentPhase,
    shouldShowRoleSelection: !hasJoined || session.status === 'waiting'
  });
  
  if (!hasJoined || session.status === 'waiting') {
    // Use a stable participant ID
    const stableParticipantId = participantId || (() => {
      const storedId = localStorage.getItem(`participant-${session.sessionId}`);
      if (storedId) return storedId;
      const newId = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(`participant-${session.sessionId}`, newId);
      return newId;
    })();
    
    return (
      <InPersonRoleSelection
        session={session}
        currentUserId={stableParticipantId}
        currentUserName={participantName}
        onRoleSelected={handleRoleSelected}
        onNameChange={handleNameChange}
        onReady={handleReady}
      />
    );
  }

  // Show mobile participant interface after joining
  const participants: SessionParticipant[] = session.participants.map(p => ({
    id: p.id,
    name: p.name,
    role: p.role || 'observer',
    status: p.status
  }));

  // Convert session data to SessionContext format
  const sessionContext = createSessionContext(session);

  // Get the stored participant ID for the current user
  const storedParticipantId = localStorage.getItem(`participant-${session.sessionId}`);
  const actualCurrentUserId = storedParticipantId || currentUserId || '';

  console.log('MobileParticipantWrapper rendering interface:', {
    storedParticipantId,
    currentUserId,
    actualCurrentUserId,
    participants: participants.map(p => ({ id: p.id, name: p.name, role: p.role }))
  });

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
