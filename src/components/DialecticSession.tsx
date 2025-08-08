import React, { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useSessionState } from '../hooks/useSessionState';
import { useRoleRotation } from '../hooks/useRoleRotation';
import { useSession } from '../hooks/useSession';
import { useVideoCall } from '../hooks/useVideoCall';
import { SpeakerInterface } from './SpeakerInterface';
import { ListenerInterface } from './ListenerInterface';
import { ScribeInterface } from './ScribeInterface';
import { PassiveObserverInterface } from './PassiveObserverInterface';
import { TopicSelection } from './TopicSelection';
import { ReflectionPhase } from './ReflectionPhase';
import { HelloCheckIn } from './HelloCheckIn';
import { ScribeFeedback } from './ScribeFeedback';
import { SessionCompletion } from './SessionCompletion';
import { FreeDialoguePhase } from './FreeDialoguePhase';
import { HoverTimer } from './HoverTimer';
import WordCloud from './WordCloud';

interface DialecticSessionProps {
  phase?: string;
  sessionPhase?: string;
  userRole?: 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent';
  participants?: any[] | number;
  currentRound?: number;
  selectedTopic?: string;
  groups?: number;
  connectionStatus?: string;
  enableAnalytics?: boolean;
  testVariant?: string;
  trackPerformance?: boolean;
  betaGroup?: string;
  device?: string;
  networkQuality?: string;
  timeRemaining?: number;
  speakerFinished?: boolean;
  groupConfig?: string;

}

export const DialecticSession: React.FC<DialecticSessionProps> = ({
  phase = 'initialization',
  sessionPhase,
  participants = [],
  currentRound = 1,
  selectedTopic,
  timeRemaining,
  speakerFinished = false,
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  // Get session data from useSession hook
  const { 
    session, 
    loadSession, 
    pollSession,
    loading: sessionLoading, 
    error: sessionError,
    getCurrentUserParticipant,
    completeRound,
    continueRounds,
    startFreeDialogue,
    endSession,
    completeHelloCheckIn,
    completeScribeFeedback,
    isHost
  } = useSession();

  // Polling state
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load session data when component mounts
  React.useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Poll for session updates (same stable method as lobby)
  React.useEffect(() => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (!sessionId || !session) return;

    // Poll for active sessions to detect phase changes
    if (session.status === 'active') {
      console.log('Starting polling for active session updates');
      pollIntervalRef.current = setInterval(async () => {
        try {
          console.log('Polling for session updates...');
          await pollSession(sessionId);
        } catch (error) {
          console.error('Background polling failed:', error);
        }
      }, 2000); // Check every 2 seconds

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [sessionId, session, pollSession]);




  
  // Get current user's role from session
  const currentUser = getCurrentUserParticipant();
  let currentUserRole = currentUser?.role as 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent' | undefined;
  
  // If user is host and chose to be an observer, override their role
  if (isHost && session?.hostRole === 'observer-permanent') {
    currentUserRole = 'observer-permanent';
  }
  
  // Session duration from session data
  const sessionDuration = session?.duration || 15 * 60 * 1000;
  
  // Calculate time remaining if not provided
  const [currentTimeRemaining, setCurrentTimeRemaining] = React.useState(timeRemaining || sessionDuration);
  const [showWordCloud, setShowWordCloud] = React.useState(true); // Show word cloud when session starts
  const [sessionStartTime, setSessionStartTime] = React.useState<number | null>(null);
  
  // Update timeRemaining from prop
  React.useEffect(() => {
    if (timeRemaining !== undefined) {
      setCurrentTimeRemaining(timeRemaining);
    }
  }, [timeRemaining]);

  // Initialise timer when session becomes active
  React.useEffect(() => {
    if (session?.currentPhase === 'listening' && !sessionStartTime) {
      // Session just started, record the start time
      setSessionStartTime(Date.now());
      console.log('Session started, recording start time:', Date.now());
    } else if (session?.currentPhase === 'completion' || session?.currentPhase === 'reflection') {
      // Session ended, reset timer
      setSessionStartTime(null);
      setCurrentTimeRemaining(sessionDuration);
    }
  }, [session?.currentPhase, sessionStartTime, sessionDuration]);

  // Custom hooks for state management and role rotation
  const sessionState = useSessionState({
    phase: session?.currentPhase || phase,
    sessionPhase: session?.currentPhase || sessionPhase,
    userRole: currentUserRole,
    selectedTopic: session?.topic || selectedTopic,
    currentRound,
  });

  // Countdown timer effect - only run during active session phases
  React.useEffect(() => {
    // Only count down during active session phases
    const isActivePhase = session?.currentPhase === 'listening' || 
                         session?.currentPhase === 'hello-checkin' || 
                         session?.currentPhase === 'transition' ||
                         session?.currentPhase === 'free-dialogue';
    
    console.log('Timer effect triggered:', {
      phase: session?.currentPhase,
      isActivePhase,
      sessionStartTime,
      currentTimeRemaining: Math.floor(currentTimeRemaining / 1000)
    });
    
    if (!isActivePhase || !sessionStartTime) {
      console.log('Timer not running - inactive phase or no start time');
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = Math.max(0, sessionDuration - elapsed);
      setCurrentTimeRemaining(remaining);
      
      // Debug logging (remove in production)
      console.log('Timer tick:', {
        elapsed: Math.floor(elapsed / 1000),
        remaining: Math.floor(remaining / 1000),
        phase: session?.currentPhase
      });
      
      if (remaining === 0) {
        // Session time is up
        console.log('Session time is up');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.currentPhase, sessionStartTime, sessionDuration]);

  // Handle session start - record start time

  const roleRotation = useRoleRotation({
    participants: session?.participants || participants,
    isPassiveObserver: sessionState.isPassiveObserver,
    selectedRole: sessionState.selectedRole,
    roundNumber: sessionState.roundNumber,
    setSelectedRole: sessionState.setSelectedRole,
    setRoundNumber: sessionState.setRoundNumber,
    setCurrentPhase: sessionState.setCurrentPhase,
  });




  // Role selection is now handled in SessionJoin, so this is simplified

  // Mock functions for role interfaces
  const handleStartReflection = () => {
    console.log('Listener starting reflection');
  };

  const handleCompleteReflection = () => {
    console.log('Listener completed reflection');
  };



  // Handle round completion - trigger scribe feedback
  const handleCompleteRound = async () => {
    try {
      console.log('Completing round, current phase:', session?.currentPhase);
      
      // Save current scribe notes before completing the round
      sessionState.saveCurrentRoundNotes();
      
      await completeRound();
      console.log('Round completed, new phase:', session?.currentPhase);
      // The completeRound function now sets the phase to 'transition' which triggers scribe feedback
    } catch (error) {
      console.error('Failed to complete round:', error);
    }
  };



  // Use the useVideoCall hook for better state management
  const isVideoActive = session?.status === 'active' && ['hello-checkin', 'listening', 'transition'].includes(session?.currentPhase || '');
  
  // Memoise participants to prevent unnecessary re-renders
  const memoisedParticipants = React.useMemo(() => 
    session?.participants.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role || 'observer',
      status: 'ready' as const
    })) || [], 
    [session?.participants]
  );
  


  const videoCall = useVideoCall({
    sessionId: session?.sessionId || '',
    currentUserId: currentUser?.id || '',
    currentUserName: currentUser?.name || 'Unknown',
    participants: memoisedParticipants,
    isActive: isVideoActive
  });

  // Persistent Video Component - stays mounted throughout session
  const PersistentVideo = () => {
    if (!session) return null;
    
    // Convert peer streams Map to array for rendering
    const peerStreams = Array.from(videoCall.peerStreams.entries());
    
    return (
      <div className="h-96">
        {videoCall.error ? (
          <div className="w-full h-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                Video Connection Error
              </div>
              <div className="text-red-500 dark:text-red-300 text-sm">
                {videoCall.error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className={`grid gap-4 h-full ${
              peerStreams.length === 0 ? 'grid-cols-1' :
              peerStreams.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
              peerStreams.length === 2 ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {/* Local Video */}
              <div className="relative">
                <video
                  ref={videoCall.localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  You
                </div>
              </div>
              
              {/* Peer Videos */}
              {peerStreams.map(([participantId, stream]) => {
                const participant = session.participants.find(p => p.id === participantId);
                return (
                  <div key={participantId} className="relative">
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                      ref={(el) => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                        }
                      }}
                      onError={(e) => {
                        console.error('Peer video error:', e);
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {participant?.name || 'Unknown'}
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 w-2 h-2 rounded-full"></div>
                  </div>
                );
              })}
              
              {/* Placeholder for empty slots */}
              {peerStreams.length === 0 && (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="text-sm font-medium">Waiting for participants...</div>
                    <div className="text-xs">Other participants will appear here when they join</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Bar */}
            <div className="mt-2 flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400">
              <span>
                {videoCall.isConnected ? 'Connected' : videoCall.isConnecting ? 'Connecting...' : 'Disconnected'}
                {!videoCall.localVideoRef.current?.srcObject && ' - No video stream'}
                {peerStreams.length > 0 && ` - ${peerStreams.length} peer${peerStreams.length > 1 ? 's' : ''} connected`}
              </span>
              {!videoCall.localVideoRef.current?.srcObject && (
                <button
                  onClick={() => {
                    // Force re-initialisation of local stream
                    if (videoCall.localVideoRef.current && videoCall.localStreamRef?.current) {
                      videoCall.localVideoRef.current.srcObject = videoCall.localStreamRef.current;
                    }
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Restore Video
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Main session container with persistent video
  if (session?.currentPhase === 'hello-checkin' || session?.currentPhase === 'listening' || session?.currentPhase === 'transition' || session?.currentPhase === 'completion' || session?.currentPhase === 'free-dialogue') {
    return (
      <div data-testid="dialectic-session" className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
          
          {/* Session Header */}
          <div className="bg-accent-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  {t('dialectic.session.sessionTitle')}
                </h1>
                <p className="text-accent-100">
                  {sessionState.selectedRole && ['speaker', 'listener', 'scribe', 'observer'].includes(sessionState.selectedRole) 
                    ? t(`dialectic.roles.${sessionState.selectedRole}.title`)
                    : 'No Role Selected'
                  } • {t('dialectic.session.round', { current: sessionState.roundNumber, total: roleRotation.getTotalRounds() })}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  {/* Video Connection Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm">
                      {videoCall.isConnected ? 'Video Connected' : videoCall.isConnecting ? 'Connecting...' : 'Video Disconnected'}
                    </span>
                  </div>
                  <HoverTimer 
                    timeRemaining={currentTimeRemaining}
                    className="text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Persistent Video Area - stays mounted across all phases */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 p-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  {t('dialectic.session.videoCall')}
                </h2>
                <PersistentVideo />
              </div>
            </div>

            {/* Phase-specific content */}
            <div className="lg:col-span-1">
              {session?.currentPhase === 'hello-checkin' && (
                <HelloCheckIn
                  participants={session?.participants || []}
                  onComplete={completeHelloCheckIn}
                  duration={2 * 60 * 1000} // 2 minutes
                  sessionId={session?.sessionId || ''}
                  currentUserId={currentUser?.id || ''}
                  currentUserName={currentUser?.name || 'Unknown'}
                  isHost={isHost}
                  hideVideo={true} // Hide video since it's now in the persistent area
                />
              )}

              {session?.currentPhase === 'listening' && (
                <div className="space-y-6">
                  {/* Word Cloud - Show when session starts and there are topic suggestions */}
                  {showWordCloud && session?.topicSuggestions && session.topicSuggestions.length > 0 && (
                    <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 p-4">
                      <WordCloud
                        suggestions={session.topicSuggestions}
                        onTopicSelect={(topic) => {
                          console.log('Selected topic:', topic);
                          setShowWordCloud(false);
                        }}
                        maxWords={10}
                      />
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setShowWordCloud(false)}
                          className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-500 transition-colors"
                        >
                          {t('dialectic.wordCloud.continue')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Role-Specific Interface */}
                  <div className="bg-white dark:bg-secondary-800 rounded-lg p-6">
                    {sessionState.selectedRole === 'speaker' && (
                      <SpeakerInterface
                        topic={sessionState.currentTopic || t('dialectic.session.defaultTopic')}
                        timeRemaining={currentTimeRemaining}
                        sessionDuration={sessionDuration}
                        isActive={true}
                      />
                    )}

                    {sessionState.selectedRole === 'listener' && (
                      <ListenerInterface
                        speakerActive={true}
                        readyToReflect={false}
                        speakerFinished={speakerFinished}
                        onStartReflection={handleStartReflection}
                        onCompleteReflection={handleCompleteReflection}
                      />
                    )}

                    {sessionState.selectedRole === 'scribe' && (
                      <ScribeInterface
                        onNotesChange={sessionState.setScribeNotes}
                        initialNotes={sessionState.getRoundScribeNotes(sessionState.roundNumber)}
                        roundNumber={sessionState.roundNumber}
                      />
                    )}

                    {(sessionState.selectedRole === 'observer' || sessionState.selectedRole === 'observer-temporary' || sessionState.selectedRole === 'observer-permanent') && (
                      <PassiveObserverInterface
                        participants={[
                          { id: '1', name: 'Alice', role: 'speaker' },
                          { id: '2', name: 'Bob', role: 'listener' },
                          { id: '3', name: 'Charlie', role: 'scribe' }
                        ]}
                        currentRound={sessionState.roundNumber}
                        sessionPhase="practice"
                      />
                    )}

                    {/* Fallback for participants without roles */}
                    {!sessionState.selectedRole && (
                      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                          {t('dialectic.session.waitingForRoleAssignment')}
                        </h3>
                        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                          You are currently in the session but don't have a role assigned yet. 
                          The host will assign roles or you can select one from the available options.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            Current participants:
                          </p>
                          {session?.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-secondary-700 dark:text-secondary-300">
                                {participant.name}
                              </span>
                              <span className="text-secondary-500 dark:text-secondary-400">
                                ({participant.role || 'No role'})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {session?.currentPhase === 'transition' && (
                <ScribeFeedback
                  scribeName={session?.participants.find(p => p.role === 'scribe')?.name || 'Scribe'}
                  roundNumber={sessionState.roundNumber}
                  onComplete={completeScribeFeedback}
                  duration={2.5 * 60 * 1000} // 2.5 minutes
                  notes={sessionState.getAllScribeNotes()}
                  sessionId={session?.sessionId || ''}
                  currentUserId={currentUser?.id || ''}
                  currentUserName={currentUser?.name || 'Unknown'}
                  participants={session?.participants || []}
                  isHost={isHost}
                  hideVideo={true} // Hide video since it's now in the persistent area
                />
              )}

              {session?.currentPhase === 'completion' && (
                <SessionCompletion
                  currentRound={session?.currentRound || 1}
                  totalRounds={roleRotation.getTotalRounds()}
                  onContinueRounds={continueRounds}
                  onStartFreeDialogue={startFreeDialogue}
                  onEndSession={endSession}
                  isHost={isHost}
                />
              )}

              {session?.currentPhase === 'free-dialogue' && (
                <FreeDialoguePhase
                  onEndSession={endSession}
                  isHost={isHost}
                  participants={session?.participants || []}
                />
              )}
            </div>
          </div>

          {/* Session Controls */}
          <div className="border-t border-secondary-200 dark:border-secondary-600 p-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => sessionState.setCurrentPhase('initialization')}
                className="px-4 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100"
              >
                {t('dialectic.session.leaveSession')}
              </button>
              
              <div className="flex space-x-2">
                {isHost && session?.currentPhase !== 'transition' && (
                  <button
                    onClick={handleCompleteRound}
                    className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700"
                  >
                    {t('dialectic.session.completeRound')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Early phases: Topic Selection
  if (session?.currentPhase === 'topic-selection') {
    return (
      <TopicSelection
        currentTopic={sessionState.currentTopic}
        participantCount={roleRotation.getParticipantCount()}
        onTopicChange={sessionState.setCurrentTopic}
        onTopicConfirm={sessionState.setCurrentTopic}
      />
    );
  }



  // Reflection phase: Session completion and debrief
  if (session?.currentPhase === 'reflection') {
    return (
      <ReflectionPhase
        totalRounds={roleRotation.getTotalRounds()}
        participantCount={roleRotation.getParticipantCount()}
        sessionDuration={sessionDuration}
        onScheduleNext={() => console.log('Schedule next session')}
      />
    );
  }

  // Show loading while session is being loaded
  if (sessionLoading) {
    return (
      <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.title')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('dialectic.session.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Show error if session failed to load
  if (sessionError) {
    return (
      <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-4">
            {t('dialectic.session.sessionError')}
          </h1>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {sessionError}
          </p>
          <button 
            onClick={() => window.location.href = '/practice/create'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t('dialectic.session.createNewSession')}
          </button>
        </div>
      </div>
    );
  }

  // Show error if no session found
  if (!session) {
    return (
      <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.sessionNotFound')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('dialectic.session.sessionNotFoundDescription')}
          </p>
                      <button 
              onClick={() => window.location.href = '/practice/create'}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t('dialectic.session.createNewSession')}
            </button>
        </div>
      </div>
    );
  }

  // Show error if session is not active
  if (session.status !== 'active') {
    return (
      <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.sessionNotStarted')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('dialectic.session.sessionNotStartedDescription')}
          </p>
                      <button 
              onClick={() => window.location.href = `/practice/lobby/${session.sessionId}`}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t('dialectic.session.returnToLobby')}
            </button>
        </div>
      </div>
    );
  }



  // Default fallback
  return (
    <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          {t('dialectic.session.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('dialectic.session.loading')}
        </p>
      </div>
    </div>
  );
};