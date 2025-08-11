import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileParticipantInterface } from './MobileParticipantInterface';
import { useSession } from '../hooks/useSession';
import { SessionParticipant, createSessionContext } from '../types/sessionContext';
import { useTranslation } from '../hooks/useTranslation';

const MobileParticipantWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    session, 
    loadSession, 
    pollSession,
    joinSession,
    currentUserId,
    loading, 
    error, 
    clearError 
  } = useSession();
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
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
          setHasJoined(true);
          return;
        } else {
          console.warn('Stored participant ID not found in session:', storedParticipantId);
        }
      }
    }
  }, [session, hasJoined]);

  // Auto-join if session is loaded and we have participant info
  useEffect(() => {
    if (session && participantName && selectedRole && !hasJoined) {
      handleJoinSession();
    }
  }, [session, participantName, selectedRole, hasJoined]);

  const handleJoinSession = async () => {
    if (!session || !participantName || !selectedRole) return;

    setIsJoining(true);
    try {
      // Generate a unique participant ID
      const participantId = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Joining session with:', {
        sessionId: session.sessionId,
        participantId,
        userName: participantName,
        role: selectedRole
      });
      
      await joinSession({
        sessionId: session.sessionId,
        userId: participantId,
        userName: participantName,
        role: selectedRole
      }, { skipNavigation: true });
      
      // Store participant ID in localStorage for persistence across refreshes
      localStorage.setItem(`participant-${session.sessionId}`, participantId);
      
      console.log('Successfully joined session, stored participant ID:', participantId);
      setHasJoined(true);
    } catch (err) {
      console.error('Failed to join session:', err);
    } finally {
      setIsJoining(false);
    }
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

  // Show join form if not joined yet
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join Session
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {session.sessionName}
            </p>
          </div>

          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dialectic.session.inPerson.roleSelection.title')}
              </label>
              <div className="space-y-2">
                {['speaker', 'listener', 'scribe'].map((role) => {
                  // Check if this role is already taken by another participant
                  const isRoleTaken = session.participants.some(p => p.role === role);
                  const isRoleSelected = selectedRole === role;
                  
                  return (
                    <button
                      key={role}
                      onClick={() => !isRoleTaken && setSelectedRole(role)}
                      disabled={isRoleTaken}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                        isRoleSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isRoleTaken
                          ? 'border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className={`font-medium capitalize ${
                        isRoleTaken 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {t(`dialectic.session.inPerson.roleSelection.${role}.title`)}
                        {isRoleTaken && (
                          <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                            {t('dialectic.session.inPerson.roleSelection.taken')}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${
                        isRoleTaken 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {t(`dialectic.session.inPerson.roleSelection.${role}.description`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinSession}
              disabled={!participantName || !selectedRole || isJoining}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isJoining ? 'Joining...' : 'Join Session'}
            </button>
            
            {/* Warning if all roles are taken */}
            {(() => {
              const takenRoles = session.participants.map(p => p.role).filter(role => role && ['speaker', 'listener', 'scribe'].includes(role));
              const allRolesTaken = takenRoles.length >= 3;
              
              console.log('MobileParticipantWrapper Role Check:', {
                participants: session.participants.map(p => ({ name: p.name, role: p.role })),
                takenRoles,
                allRolesTaken,
                selectedRole
              });
              
              return allRolesTaken && !selectedRole ? (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('dialectic.session.inPerson.roleSelection.allRolesTaken')}
                  </p>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
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
