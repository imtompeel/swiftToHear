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
import { RaisedHandIndicator } from './guidance/RaisedHandIndicator';
import { ListenerInteractions } from './guidance/ListenerInteractions';
import { PassiveObserverInterface } from './PassiveObserverInterface';
import { TopicSelection } from './TopicSelection';
import { ReflectionPhase } from './ReflectionPhase';
import { HelloCheckIn } from './HelloCheckIn';
import { ScribeFeedback } from './ScribeFeedback';
import { createSessionContext } from '../types/sessionContext';
import { SessionCompletion } from './SessionCompletion';
import { FreeDialoguePhase } from './FreeDialoguePhase';
import { HoverTimer } from './HoverTimer';
import WordCloud from './WordCloud';
import { SafetyTimeoutButton } from './SafetyTimeoutButton';
import { SafetyTimeoutGuidance } from './SafetyTimeoutGuidance';
import { SafetyTimeoutOtherParticipants } from './SafetyTimeoutOtherParticipants';
import { useSafetyTimeout } from '../hooks/useSafetyTimeout';
// MUI Icons
import { 
  Mic, 
  MicOff, 
  Videocam, 
  VideocamOff, 
  Visibility, 
  VisibilityOff,
  CameraAlt 
} from '@mui/icons-material';

// Custom hook for isolated timer that doesn't cause re-renders
const useIsolatedTimer = (sessionPhase: string, sessionStartTime: number | null, sessionDuration: number, isTimeoutActive: boolean = false) => {
  const [displayTime, setDisplayTime] = React.useState(sessionDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  React.useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Only count down during active session phases and when not in timeout
    const isActivePhase = sessionPhase === 'listening' || 
                         sessionPhase === 'hello-checkin' || 
                         sessionPhase === 'free-dialogue';
    
    if (!isActivePhase || !sessionStartTime || isTimeoutActive) {
      setDisplayTime(sessionDuration);
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = Math.max(0, sessionDuration - elapsed);
      setDisplayTime(remaining);
      
      if (remaining === 0) {
        console.log('Session time is up');
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionPhase, sessionStartTime, sessionDuration, isTimeoutActive]);

  return displayTime;
};

// Separate timer display component that only re-renders when time changes
const TimerDisplay = React.memo<{ timeRemaining: number }>(({ timeRemaining }) => {
  return (
    <HoverTimer 
      timeRemaining={timeRemaining}
      className="text-white"
    />
  );
});

TimerDisplay.displayName = 'TimerDisplay';

// Session Header Component
const SessionHeader = React.memo<{
  sessionState: any;
  roleRotation: any;
  videoCall: any;
  currentTimeRemaining: number;
  t: (key: string, params?: any) => string;
  safetyTimeout: any;
  sessionPhase?: string;
}>(({ sessionState, roleRotation, videoCall, currentTimeRemaining, t, safetyTimeout, sessionPhase }) => {
  return (
    <div className="bg-accent-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {t('shared.common.dialecticSession')}
          </h1>
          <p className="text-accent-100">
            {sessionState.selectedRole && ['speaker', 'listener', 'scribe', 'observer'].includes(sessionState.selectedRole) 
              ? (sessionState.selectedRole === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${sessionState.selectedRole}.title`))
              : 'No Role Selected'
            } • {t('shared.common.roundProgress', { current: sessionState.roundNumber, total: roleRotation.getTotalRounds() })}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-4">
            {/* Safety Timeout Button */}
            <SafetyTimeoutButton
              onRequestTimeout={safetyTimeout.requestTimeout}
              onEndTimeout={safetyTimeout.endTimeout}
              isTimeoutActive={safetyTimeout.isTimeoutActive}
              className="text-white"
            />
            
            {/* Video Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {videoCall.isConnected ? 'Video Connected' : videoCall.isConnecting ? 'Connecting...' : 'Video Disconnected'}
              </span>
            </div>
            {/* Hide main timer during check-in and transition (scribe feedback) phases */}
            {sessionPhase !== 'hello-checkin' && sessionPhase !== 'transition' && (
              <TimerDisplay timeRemaining={currentTimeRemaining} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SessionHeader.displayName = 'SessionHeader';

// Video Component
const SessionVideo = React.memo<{
  session: any;
  videoCall: any;
  showSelfVideo: boolean;
  onToggleSelfVideo: () => void;
  currentUserRole?: 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent';
  currentUserId?: string;
  safetyTimeout?: any;
}>(({ session, videoCall, showSelfVideo, onToggleSelfVideo, currentUserRole, currentUserId, safetyTimeout }) => {
  if (!session) return null;
  
  // Convert peer streams Map to array for rendering
  const peerStreams = Array.from(videoCall.peerStreams.entries()) as [string, MediaStream][];
  
  // Calculate total participants (local + peers)
  const totalParticipants = 1 + peerStreams.length;
  
  // Calculate visible participants based on self-video visibility
  const visibleParticipants = showSelfVideo ? totalParticipants : peerStreams.length;
  
  // Determine optimal grid layout based on visible participant count
  const getGridClasses = () => {
    if (visibleParticipants === 0) {
      return "grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4"; // Fallback for edge case
    } else if (visibleParticipants === 1) {
      return "grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4";
    } else if (visibleParticipants === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3 lg:gap-4";
    } else if (visibleParticipants === 3) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4";
    } else if (visibleParticipants === 4) {
      return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4";
    } else {
      return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4";
    }
  };
  
  return (
    <div className="w-full max-w-full overflow-hidden">
      {videoCall.error ? (
        <div className="w-full aspect-video bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
          <div className="text-center p-2 sm:p-4">
            <div className="text-red-600 dark:text-red-400 text-sm sm:text-lg font-semibold mb-2">
              Video Connection Error
            </div>
            <div className="text-red-500 dark:text-red-300 text-xs sm:text-sm mb-3">
              {videoCall.error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Restore self-video button when hidden - positioned above video grid */}
          {!showSelfVideo && (
            <div className="mb-3 flex justify-center">
              <button
                onClick={onToggleSelfVideo}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-lg transition-colors"
                title="Show your video to yourself"
              >
                <Visibility className="text-sm" />
                <span>Show Self Video</span>
              </button>
            </div>
          )}

          {/* Raised Hand Indicator - Show when any listener has raised their hand (only for speakers) */}
          <RaisedHandIndicator 
            participants={session?.participants || []} 
            className="mb-3"
            showForRole={currentUserRole}
          />

          {/* Listener Interactions - Show when current user is a listener (only on mobile) */}
          {currentUserRole === 'listener' && (
            <div className="mb-3 lg:hidden">
              <ListenerInteractions 
                sessionId={session?.sessionId || ''}
                currentUserId={currentUserId || ''}
                className="mb-3"
              />
            </div>
          )}

          {/* Adaptive Video Grid - Constrained to container */}
          <div className={`${getGridClasses()} max-w-full overflow-hidden`}>
            {/* Local Video - Only render in grid when visible to user */}
            {showSelfVideo && (
              <div className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
              {/* Video element always exists for stream continuity */}
              <video
                ref={videoCall.localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-lg bg-gray-200 dark:bg-gray-700 max-w-full ${showSelfVideo && videoCall.isVideoEnabled ? 'block' : 'hidden'}`}
              />
              
              {/* Overlay when video is hidden from self */}
              {!showSelfVideo && videoCall.isVideoEnabled && (
                <div className="absolute inset-0 w-full h-full bg-gray-600 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-300 dark:text-gray-400">
                    <div className="text-2xl mb-2">📹</div>
                    <div className="text-sm font-medium">Video Hidden</div>
                    <div className="text-xs mt-1">Others can still see you</div>
                  </div>
                </div>
              )}
              
              {/* Overlay when camera is turned off */}
              {!videoCall.isVideoEnabled && (
                <div className="absolute inset-0 w-full h-full bg-gray-800 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-300 dark:text-gray-400">
                    <CameraAlt className="text-4xl mb-2 mx-auto" />
                    <div className="text-sm font-medium">Camera Off</div>
                    <div className="text-xs mt-1">Your camera is disabled</div>
                  </div>
                </div>
              )}
              
              {/* Overlay during safety timeout */}
              {safetyTimeout?.isTimeoutActive && safetyTimeout?.requestedByMe && (
                <div className="absolute inset-0 w-full h-full bg-blue-900 bg-opacity-90 rounded-lg flex items-center justify-center">
                  <div className="text-center text-blue-100">
                    <svg className="w-12 h-12 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-lg font-semibold mb-1">Safety Timeout</div>
                    <div className="text-sm">Your video is paused</div>
                    <div className="text-xs mt-2">Take care of yourself</div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-50 text-white text-xs px-1 sm:px-2 py-1 rounded z-10">
                You
              </div>
              
              {/* Audio/Video Controls */}
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex space-x-1 z-10">
                {/* Microphone Toggle */}
                <button
                  onClick={videoCall.toggleMute}
                  className={`p-1 sm:p-2 lg:p-3 rounded transition-all duration-200 flex items-center justify-center ${
                    videoCall.isMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
                  }`}
                  title={videoCall.isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {videoCall.isMuted ? (
                    <MicOff className="text-sm sm:text-base lg:text-lg" />
                  ) : (
                    <Mic className="text-sm sm:text-base lg:text-lg" />
                  )}
                </button>
                
                {/* Camera Toggle */}
                <button
                  onClick={videoCall.toggleVideo}
                  className={`p-1 sm:p-2 lg:p-3 rounded transition-all duration-200 flex items-center justify-center ${
                    !videoCall.isVideoEnabled 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
                  }`}
                  title={videoCall.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {videoCall.isVideoEnabled ? (
                    <Videocam className="text-sm sm:text-base lg:text-lg" />
                  ) : (
                    <VideocamOff className="text-sm sm:text-base lg:text-lg" />
                  )}
                </button>
              </div>
              
              {/* Self Video Visibility Toggle */}
              <button
                onClick={onToggleSelfVideo}
                className="absolute top-1 right-1 sm:top-2 sm:right-2 lg:top-3 lg:right-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 sm:p-2 lg:p-3 rounded transition-all duration-200 z-10 flex items-center justify-center"
                title={showSelfVideo ? "Hide your video from yourself" : "Show your video to yourself"}
              >
                {showSelfVideo ? (
                  <Visibility className="text-sm sm:text-base lg:text-lg" />
                ) : (
                  <VisibilityOff className="text-sm sm:text-base lg:text-lg" />
                )}
              </button>
              </div>
            )}
            
            {/* Hidden local video for stream continuity when self-video is hidden */}
            {!showSelfVideo && (
              <video
                ref={videoCall.localVideoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />
            )}
            
            {/* Peer Videos - Show actual videos when available */}
            {peerStreams.map(([participantId, stream]: [string, MediaStream]) => {
              const participant = session.participants.find((p: any) => p.id === participantId);
              return (
                <div key={participantId} className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg bg-gray-200 dark:bg-gray-700 max-w-full"
                    ref={(el) => {
                      if (el && el.srcObject !== stream) {
                        el.srcObject = stream;
                      }
                    }}
                    onError={(e) => {
                      console.error('Peer video error:', e);
                    }}
                  />
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-50 text-white text-xs px-1 sm:px-2 py-1 rounded max-w-[80%] truncate">
                    {participant?.name || 'Unknown'}
                  </div>
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-500 w-2 h-2 rounded-full"></div>
                </div>
              );
            })}
            
            {/* Show placeholders only when we have less than 4 visible participants, more than 2 participants expected, and there's room in the grid */}
            {visibleParticipants < 4 && totalParticipants > 2 && Array.from({ length: Math.min(2, 4 - visibleParticipants) }).map((_, index) => (
              <div key={`placeholder-${index}`} className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  <div className="text-center text-gray-500 dark:text-gray-400 p-1 sm:p-2 lg:p-4">
                    <div className="text-xs sm:text-sm font-medium">
                      Empty
                    </div>
                    <div className="text-xs mt-1 hidden lg:block">
                      Available slot
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show single waiting placeholder only when we have exactly 1 visible participant (waiting for others) */}
            {visibleParticipants === 1 && totalParticipants === 1 && (
              <div key="waiting-placeholder" className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  <div className="text-center text-gray-500 dark:text-gray-400 p-1 sm:p-2 lg:p-4">
                    <div className="text-xs sm:text-sm font-medium">
                      Waiting...
                    </div>
                    <div className="text-xs mt-1 hidden lg:block">
                      Other participants will appear here
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Compact Status Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-secondary-600 dark:text-secondary-400">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
              <span className="truncate">
                {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}{!showSelfVideo ? ' (self-video hidden)' : ''}
                {videoCall.isConnecting ? ' • Connecting...' : videoCall.isConnected ? ' • Connected' : ' • Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {!videoCall.localVideoRef.current?.srcObject && (
                <button
                  onClick={() => {
                    // Force re-initialisation of local stream
                    if (videoCall.localVideoRef.current && videoCall.localStreamRef?.current) {
                      videoCall.localVideoRef.current.srcObject = videoCall.localStreamRef.current;
                    }
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Restore Video
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

SessionVideo.displayName = 'SessionVideo';

// Role Interface Component
const RoleInterface = React.memo<{
  sessionState: any;
  sessionContext: any;
  currentUser: any;
  session: any;
  videoCall: any;
  onNotesChange: (notes: string) => void;
  initialNotes: string;
  roundNumber: number;
}>(({ sessionState, sessionContext, currentUser, session, videoCall, onNotesChange, initialNotes, roundNumber }) => {
  if (sessionState.selectedRole === 'speaker') {
    return (
      <SpeakerInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
      />
    );
  }

  if (sessionState.selectedRole === 'listener') {
    return (
      <ListenerInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
      />
    );
  }

  if (sessionState.selectedRole === 'scribe' && session?.participants?.length > 2) {
    return (
      <ScribeInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
        onNotesChange={onNotesChange}
        initialNotes={initialNotes}
        roundNumber={roundNumber}
      />
    );
  }

  // Fallback for scribe role in 2-person sessions
  if (sessionState.selectedRole === 'scribe' && session?.participants?.length <= 2) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Scribe Role Not Available
        </h3>
        <p className="text-blue-700 dark:text-blue-200 mb-4">
          The scribe role is not available in 2-person sessions. You should be assigned either Speaker or Listener role.
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Please contact the host if you believe this is an error.
        </p>
      </div>
    );
  }

  if (sessionState.selectedRole === 'observer' || sessionState.selectedRole === 'observer-temporary' || sessionState.selectedRole === 'observer-permanent') {
    return (
      <PassiveObserverInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
      />
    );
  }

  // Fallback for participants without roles
  return (
    <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
        Waiting for Role Assignment
      </h3>
      <p className="text-secondary-600 dark:text-secondary-400 mb-4">
        You are currently in the session but don't have a role assigned yet. 
        The host will assign roles or you can select one from the available options.
      </p>
      <div className="space-y-2">
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Current participants:
        </p>
        {session?.participants.map((participant: any) => (
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
  );
});

RoleInterface.displayName = 'RoleInterface';

// Session Controls Component
const SessionControls = React.memo<{
  sessionState: any;
  isHost: boolean;
  session: any;
  onCompleteRound: () => void;
  t: (key: string) => string;
}>(({ sessionState, isHost, session, onCompleteRound, t }) => {
  return (
    <div className="border-t border-secondary-200 dark:border-secondary-600 p-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => sessionState.setCurrentPhase('initialization')}
          className="px-4 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100"
        >
          {t('shared.actions.leaveSession')}
        </button>
        
        <div className="flex space-x-2">
          {isHost && session?.currentPhase !== 'transition' && session?.currentPhase !== 'hello-checkin' && (
            <button
              onClick={onCompleteRound}
              className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700"
            >
              {t('dialectic.session.completeRound')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

SessionControls.displayName = 'SessionControls';

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
  speakerFinished?: boolean;
  groupConfig?: string;

}

export const DialecticSession: React.FC<DialecticSessionProps> = ({
  phase = 'initialization',
  sessionPhase,
  participants = [],
  currentRound = 1,
  selectedTopic,
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  // Get session data from useSession hook
  const { 
    session, 
    loadSession, 
    setupRealTimeListener,
    loading: sessionLoading, 
    error: sessionError,
    getCurrentUserParticipant,
    completeRound,
    continueRounds,
    startFreeDialogue,
    endSession,
    completeHelloCheckIn,
    completeScribeFeedback,
    updateParticipantRole,
    isHost
  } = useSession();
  
  // Load session data when component mounts
  React.useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Real-time session updates from Firestore
  React.useEffect(() => {
    if (!sessionId) return;

    console.log('DialecticSession: Setting up real-time listener for session:', sessionId);
    
    const unsubscribe = setupRealTimeListener(sessionId);

    return () => {
      console.log('DialecticSession: Cleaning up real-time listener');
      unsubscribe();
    };
  }, [sessionId, setupRealTimeListener]);




  
  // Get current user's role from session
  const currentUser = getCurrentUserParticipant();
  let currentUserRole = currentUser?.role as 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent' | undefined;
  
  // If user is host and chose to be an observer, override their role
  if (isHost && session?.hostRole === 'observer-permanent') {
    currentUserRole = 'observer-permanent';
  }
  
  // CRITICAL FIX: For 2-person sessions, ignore scribe/observer roles from session data
  // and let the role rotation logic handle it instead
  if (session?.participants && session.participants.length <= 2 && (currentUserRole === 'scribe' || currentUserRole?.includes('observer'))) {
    console.warn('Ignoring scribe/observer role from session data in 2-person session, will use role rotation logic instead');
    currentUserRole = undefined; // Let role rotation logic determine the role
  }
  
  // Session duration from session data
  const sessionDuration = session?.duration || 15 * 60 * 1000;
  
  // Use isolated timer hook to prevent re-renders
  const [showWordCloud, setShowWordCloud] = React.useState(true); // Show word cloud when session starts
  const [sessionStartTime, setSessionStartTime] = React.useState<number | null>(null);
  
  // Mobile video/guidance toggle state
  const [showVideoOnMobile, setShowVideoOnMobile] = React.useState(true);
  
  // Self video visibility toggle state
  const [showSelfVideo, setShowSelfVideo] = React.useState(true);
  
  // Initialise timer when session becomes active
  React.useEffect(() => {
    if (session?.currentPhase === 'listening' && !sessionStartTime) {
      // Session just started, record the start time
      setSessionStartTime(Date.now());
      console.log('Session started, recording start time:', Date.now());
    } else if (session?.currentPhase === 'completion' || session?.currentPhase === 'reflection') {
      // Session ended, reset timer
      setSessionStartTime(null);
    }
  }, [session?.currentPhase, sessionStartTime]);

  // Custom hooks for state management and role rotation
  const sessionState = useSessionState({
    phase: session?.currentPhase || phase,
    sessionPhase: session?.currentPhase || sessionPhase,
    userRole: currentUserRole,
    selectedTopic: session?.topic || selectedTopic,
    currentRound,
  });



  // Handle session start - record start time

  // Memoise the participants array to prevent roleRotation from being recreated
  const memoisedParticipantsForRoleRotation = React.useMemo(() => 
    session?.participants || participants, 
    [session?.participants, participants]
  );

  const roleRotation = useRoleRotation({
    participants: memoisedParticipantsForRoleRotation,
    isPassiveObserver: sessionState.isPassiveObserver,
    selectedRole: sessionState.selectedRole,
    roundNumber: sessionState.roundNumber,
    setSelectedRole: sessionState.setSelectedRole,
    setRoundNumber: sessionState.setRoundNumber,
    setCurrentPhase: sessionState.setCurrentPhase,
  });




  // Role selection is now handled in SessionJoin, so this is simplified

  // Mock functions for role interfaces




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

  // Create session context for components
  const sessionContext = React.useMemo(() => {
    if (!session) return null;
    return createSessionContext(session);
  }, [session]);

  // Memoise the session phase to prevent unnecessary re-renders
  
  // Memoise the participant count to prevent repeated calculations
  const memoisedParticipantCount = React.useMemo(() => {
    const count = session?.participants?.length || 0;
    return count;
  }, [session?.participants?.length]);
  


  const videoCall = useVideoCall({
    sessionId: session?.sessionId || '',
    currentUserId: currentUser?.id || '',
    currentUserName: currentUser?.name || 'Unknown',
    participants: memoisedParticipants,
    isActive: isVideoActive
  });

  // Safety timeout functionality
  const safetyTimeout = useSafetyTimeout({
    sessionId: session?.sessionId || '',
    currentUserId: currentUser?.id || '',
    currentUserName: currentUser?.name || 'Unknown',
    sessionTimeoutState: session?.safetyTimeout,
    onTimeoutStateChange: (timeoutState) => {
      // Handle timeout state changes - could integrate with video call to disable video
      console.log('Safety timeout state changed:', timeoutState);
      
      // Disable video for the requesting user during timeout
      if (timeoutState.isVideoDisabled && videoCall.toggleVideo) {
        videoCall.toggleVideo();
      }
    }
  });

  // Use the isolated timer hook
  const currentTimeRemaining = useIsolatedTimer(
    session?.currentPhase || 'initialization',
    sessionStartTime,
    sessionDuration,
    safetyTimeout.isTimeoutActive
  );

  // Main session container with persistent video
  if (session?.currentPhase === 'hello-checkin' || session?.currentPhase === 'listening' || session?.currentPhase === 'transition' || session?.currentPhase === 'completion' || session?.currentPhase === 'free-dialogue') {
    return (
      <div data-testid="dialectic-session" className="w-full max-w-none mx-auto p-2 sm:p-3 lg:p-6 xl:px-12 2xl:px-16">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
          
          {/* Session Header */}
          <SessionHeader
            sessionState={sessionState}
            roleRotation={roleRotation}
            videoCall={videoCall}
            currentTimeRemaining={currentTimeRemaining}
            t={t}
            safetyTimeout={safetyTimeout}
            sessionPhase={session?.currentPhase}
          />

          {/* Mobile Toggle Controls - Only visible on small screens */}
          <div className="lg:hidden bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-600 p-3">
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => setShowVideoOnMobile(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showVideoOnMobile 
                    ? 'bg-accent-600 text-white' 
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}
              >
                <span>📹</span>
                <span>Video</span>
                {!showVideoOnMobile && (
                  <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                )}
              </button>
              <button
                onClick={() => setShowVideoOnMobile(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showVideoOnMobile 
                    ? 'bg-accent-600 text-white' 
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}
              >
                <span>💬</span>
                <span>Guidance</span>
              </button>
            </div>
          </div>

          {/* Responsive Layout - Conditional rendering on mobile, side-by-side on desktop */}
          <div className="lg:flex lg:flex-row lg:gap-6 p-2 sm:p-3 lg:p-6 overflow-hidden">
            {/* Video Section - Conditional on mobile, always visible on desktop */}
            <div className={`w-full lg:w-3/5 xl:w-2/3 ${showVideoOnMobile ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 xl:p-8 overflow-hidden">
                <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3 sm:mb-4">
                  {t('shared.common.videoCall')}
                </h2>
                <div className="w-full overflow-hidden">
                  <SessionVideo 
                    session={session} 
                    videoCall={videoCall} 
                    showSelfVideo={showSelfVideo}
                    onToggleSelfVideo={() => setShowSelfVideo(!showSelfVideo)}
                    currentUserRole={currentUserRole}
                    currentUserId={currentUser?.id}
                    safetyTimeout={safetyTimeout}
                  />
                </div>
              </div>
            </div>

            {/* Phase-specific content - Conditional on mobile, takes remaining space on desktop */}
            <div className={`w-full lg:flex-1 lg:w-2/5 xl:w-1/3 ${!showVideoOnMobile ? 'block' : 'hidden'} lg:block`}>
                          {/* Safety Timeout Guidance Panel */}
            {safetyTimeout.isTimeoutActive && (
              <div className="mb-4">
                {safetyTimeout.requestedByMe ? (
                  <SafetyTimeoutGuidance
                    onEndTimeout={safetyTimeout.endTimeout}
                    requestedByMe={safetyTimeout.requestedByMe}
                  />
                ) : (
                  <SafetyTimeoutOtherParticipants
                    requestedBy={safetyTimeout.timeoutState.requestedBy || 'A participant'}
                  />
                )}
              </div>
            )}
            

              
              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'hello-checkin' && (
                <HelloCheckIn
                  session={sessionContext!}
                  participants={session?.participants || []}
                  currentUserId={currentUser?.id || ''}
                  currentUserName={currentUser?.name || 'Unknown'}
                  isHost={isHost}
                  onComplete={completeHelloCheckIn}
                  hideVideo={true} // Hide video since it's now in the persistent area
                  onUpdateParticipantRole={(userId, role) => updateParticipantRole(role)}
                />
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'listening' && (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Word Cloud - Show when session starts and there are topic suggestions */}
                  {showWordCloud && session?.topicSuggestions && session.topicSuggestions.length > 0 && (
                    <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 p-3 sm:p-4 lg:p-6">
                      <WordCloud
                        suggestions={session.topicSuggestions}
                        onTopicSelect={(topic) => {
                          console.log('Selected topic:', topic);
                          setShowWordCloud(false);
                        }}
                        maxWords={10}
                      />
                      <div className="text-center mt-3 sm:mt-4">
                        <button
                          onClick={() => setShowWordCloud(false)}
                          className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-500 transition-colors"
                        >
                          {t('shared.actions.continueToSession')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Role-Specific Interface */}
                  <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 min-h-[300px] sm:min-h-[400px]">
                    <RoleInterface
                      sessionState={sessionState}
                      sessionContext={sessionContext}
                      currentUser={currentUser}
                      session={session}
                      videoCall={videoCall}
                      onNotesChange={sessionState.setScribeNotes}
                      initialNotes={sessionState.getRoundScribeNotes(sessionState.roundNumber)}
                      roundNumber={sessionState.roundNumber}
                    />
                  </div>
                </div>
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'transition' && (
                // Skip scribe feedback for 2-person groups (no scribe role)
                session?.participants?.length === 2 ? (
                  <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                        Round Complete
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                        Moving to the next round...
                      </p>
                      <button
                        onClick={completeScribeFeedback}
                        className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6">
                    <ScribeFeedback
                      session={sessionContext!}
                      currentUserId={currentUser?.id || ''}
                      currentUserName={currentUser?.name || 'Unknown'}
                      participants={session?.participants || []}
                      onComplete={completeScribeFeedback}
                      isHost={isHost}
                      notes={sessionState.getAllScribeNotes()}
                    />
                  </div>
                )
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'completion' && (
                <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <SessionCompletion
                    currentRound={session?.currentRound || 1}
                    totalRounds={roleRotation.getTotalRounds()}
                    onContinueRounds={continueRounds}
                    onStartFreeDialogue={startFreeDialogue}
                    onEndSession={endSession}
                    isHost={isHost}
                  />
                </div>
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'free-dialogue' && (
                <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <FreeDialoguePhase
                    onEndSession={endSession}
                    isHost={isHost}
                    participants={session?.participants || []}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Session Controls */}
          <SessionControls
            sessionState={sessionState}
            isHost={isHost}
            session={session}
            onCompleteRound={handleCompleteRound}
            t={t}
          />
        </div>
      </div>
    );
  }



  // Early phases: Topic Selection
  if (session?.currentPhase === 'topic-selection') {
    return (
      <TopicSelection
        currentTopic={sessionState.currentTopic}
        participantCount={memoisedParticipantCount}
        onTopicChange={sessionState.setCurrentTopic}
        onTopicConfirm={sessionState.setCurrentTopic}
      />
    );
  }



  // Reflection phase: Session completion and debrief
  if (session?.currentPhase === 'reflection') {
    return (
      <ReflectionPhase
        session={sessionContext!}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        onComplete={() => console.log('Schedule next session')}
      />
    );
  }

  // Show loading while session is being loaded
  if (sessionLoading) {
    return (
      <div data-testid="dialectic-session" className="max-w-none mx-auto p-6 xl:px-12 2xl:px-16">
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
      <div data-testid="dialectic-session" className="max-w-none mx-auto p-6 xl:px-12 2xl:px-16">
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
            {t('shared.actions.createNewSession')}
          </button>
        </div>
      </div>
    );
  }

  // Show error if no session found
  if (!session) {
    return (
      <div data-testid="dialectic-session" className="max-w-none mx-auto p-6 xl:px-12 2xl:px-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('shared.common.sessionNotFound')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('shared.common.sessionNotFoundDescription')}
          </p>
                      <button 
              onClick={() => window.location.href = '/practice/create'}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t('shared.actions.createNewSession')}
            </button>
        </div>
      </div>
    );
  }

  // Show error if session is not active
  if (session.status !== 'active') {
    return (
      <div data-testid="dialectic-session" className="max-w-none mx-auto p-6 xl:px-12 2xl:px-16">
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