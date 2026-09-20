import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useTranslation } from '../hooks/useTranslation';
import { useSessionState } from '../hooks/useSessionState';
import { useRoleRotation } from '../hooks/useRoleRotation';
import { useSession } from '../hooks/useSession';
import { useVideoCall } from '../hooks/useVideoCall';
import { useResizablePanels } from '../hooks/useResizablePanels';
import { useIsolatedTimer } from '../hooks/useIsolatedTimer';
import { TopicSelection } from './TopicSelection';
import { ReflectionPhase } from './ReflectionPhase';
import { HelloCheckIn } from './HelloCheckIn';
import { ScribeFeedback } from './ScribeFeedback';
import { createSessionContext } from '../types/sessionContext';
import { SessionCompletion } from './SessionCompletion';
import { FreeDialoguePhase } from './FreeDialoguePhase';
import { PostMatchPrompt } from './matchmaking/PostMatchPrompt';
import type { MatchMode } from '../types/matchmaking';
import WordCloud from './WordCloud';
import { SafetyTimeoutGuidance } from './SafetyTimeoutGuidance';
import { SafetyTimeoutOtherParticipants } from './SafetyTimeoutOtherParticipants';
import { useSafetyTimeout } from '../hooks/useSafetyTimeout';
import { SessionHeader } from './SessionHeader';
import { SessionControls } from './SessionControls';
import { SessionVideo } from './SessionVideo';
import { RoleInterface } from './RoleInterface';
import { SessionErrorDisplay } from './SessionErrorDisplay';
import { RoundChangePopup } from './RoundChangePopup';
import { WebRTCService } from '../services/webrtcService';
import { useRoundChangeNotice } from '../hooks/useRoundChangeNotice';
import { getNextRole, getTotalRounds } from '../utils/nextRole';
// MUI Icons
import { 
  DragIndicator
} from '@mui/icons-material';











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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [showPostMatchPrompt, setShowPostMatchPrompt] = React.useState(false);
  
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
    leaveSession,
    completeHelloCheckIn,
    completeScribeFeedback,
    updateParticipantRole,
    selectTopic,
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

  // Matchmaking sessions: skip completion screen and enter free dialogue automatically
  React.useEffect(() => {
    if (
      session?.matchMode &&
      session.currentPhase === 'completion' &&
      isHost
    ) {
      void startFreeDialogue();
    }
  }, [session?.matchMode, session?.currentPhase, isHost, startFreeDialogue]);




  
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
  
  // Host topic picker: shown after the lobby so they can choose from lobby votes
  const [showHostTopicPicker, setShowHostTopicPicker] = React.useState(true);
  const [sessionStartTime, setSessionStartTime] = React.useState<number | null>(null);
  
  const currentUserNeedsRole =
    session?.currentPhase === 'hello-checkin' &&
    Boolean(currentUser) &&
    !Boolean(currentUser?.role && currentUser.role.trim() !== '');

  // Mobile video/guidance toggle. Role selection lives in the guidance pane,
  // so open that first when the current user still needs a role.
  const [showVideoOnMobile, setShowVideoOnMobile] = React.useState(!currentUserNeedsRole);

  React.useEffect(() => {
    setShowVideoOnMobile(!currentUserNeedsRole);
  }, [currentUserNeedsRole]);
  
  // Self video visibility toggle state
  const [showSelfVideo, setShowSelfVideo] = React.useState(true);
  
  // Fresh countdown (and bells) for each listening round
  React.useEffect(() => {
    if (session?.currentPhase === 'listening') {
      setSessionStartTime((current) => current ?? Date.now());
      return;
    }

    setSessionStartTime(null);
  }, [session?.currentPhase]);

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
      // The completeRound function sets the phase to 'transition' so the current scribe can feed back
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

  // Update video call participants when session participants change (e.g., when roles are selected)
  React.useEffect(() => {
    if (videoCall.updateParticipants && memoisedParticipants.length > 0) {
      console.log('Updating video call participants:', memoisedParticipants.length, 'participants');
      videoCall.updateParticipants(memoisedParticipants);
    }
  }, [memoisedParticipants, videoCall.updateParticipants]);

  // Safety timeout functionality
  const safetyTimeout = useSafetyTimeout({
    sessionId: session?.sessionId || '',
    currentUserId: currentUser?.id || '',
    currentUserName: currentUser?.name || 'Unknown',
    isHost: isHost,
    sessionTimeoutState: session?.safetyTimeout
  });

  // Function to get user name from user ID
  const getUserNameById = React.useCallback((userId: string | null): string => {
    if (!userId || !session?.participants) return 'A participant';
    
    const participant = session.participants.find(p => p.id === userId);
    return participant?.name || 'A participant';
  }, [session?.participants]);

  const handleHostTopicSelect = React.useCallback(async (topic: string) => {
    try {
      await selectTopic(topic);
    } catch (error) {
      console.error('Failed to select topic:', error);
    } finally {
      setShowHostTopicPicker(false);
    }
  }, [selectTopic]);

  const showTopicPicker =
    isHost &&
    showHostTopicPicker &&
    (session?.currentPhase === 'hello-checkin' || session?.currentPhase === 'listening') &&
    (session?.topicSuggestions?.length || 0) > 0;

  // Silence the requester's camera and microphone for the duration of a safety timeout
  const timeoutMediaAppliedRef = React.useRef(false);
  React.useEffect(() => {
    const isOwnTimeout =
      safetyTimeout.isTimeoutActive &&
      safetyTimeout.timeoutState.requestedBy === currentUser?.id;

    if (!isOwnTimeout && !timeoutMediaAppliedRef.current) {
      return;
    }

    const shouldSilence = isOwnTimeout;
    timeoutMediaAppliedRef.current = shouldSilence;

    if (videoCall.isConnected && videoCall.setVideoEnabled && videoCall.setMuted) {
      videoCall.setVideoEnabled(!shouldSilence);
      videoCall.setMuted(shouldSilence);
      return;
    }

    try {
      const webrtcService = WebRTCService.getInstance();
      if (webrtcService) {
        webrtcService.toggleVideo(!shouldSilence);
        webrtcService.toggleAudio(!shouldSilence);
      }
    } catch (error) {
      console.error('Safety timeout: Failed to update media via WebRTC service:', error);
    }
  }, [
    safetyTimeout.isTimeoutActive,
    safetyTimeout.timeoutState.requestedBy,
    videoCall.isConnected,
    videoCall.isMuted,
    videoCall.isVideoEnabled,
    videoCall.setMuted,
    videoCall.setVideoEnabled,
    currentUser?.id
  ]);

  // Use the isolated timer hook
  const currentTimeRemaining = useIsolatedTimer(
    session?.currentPhase || 'initialization',
    sessionStartTime,
    sessionDuration,
    safetyTimeout.isTimeoutActive
  );

  // Use resizable panels hook
  const { videoWidth, isDragging, startResize, containerRef } = useResizablePanels(60);

  const participantCount = session?.participants?.length || 0;
  const roundChange = useRoundChangeNotice(
    session?.currentPhase,
    session?.currentRound,
    { hasScribe: participantCount >= 3 }
  );
  const nextRole = getNextRole(
    currentUserRole,
    participantCount,
    currentUserRole === 'observer-permanent'
  );
  const scribeName = session?.participants.find(p => p.role === 'scribe')?.name;

  // Main session container with persistent video
  if (session?.currentPhase === 'hello-checkin' || session?.currentPhase === 'listening' || session?.currentPhase === 'transition' || session?.currentPhase === 'completion' || session?.currentPhase === 'free-dialogue') {
    return (
      <div data-testid="dialectic-session" className="w-full max-w-none mx-auto p-2 sm:p-3 lg:p-6 xl:px-12 2xl:px-16">
        {roundChange.notice && currentUserRole && !safetyTimeout.isTimeoutActive && (
          <RoundChangePopup
            key={`${roundChange.notice}-${session?.currentRound || 1}`}
            notice={roundChange.notice}
            roundNumber={session?.currentRound || 1}
            totalRounds={getTotalRounds(participantCount)}
            currentRole={currentUserRole}
            nextRole={nextRole}
            scribeName={scribeName}
            onDismiss={roundChange.dismiss}
          />
        )}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
          
          {/* Session Header */}
          <SessionHeader
            sessionState={sessionState}
            roleRotation={roleRotation}
            videoCall={videoCall}
            currentTimeRemaining={currentTimeRemaining}
            phaseDuration={sessionDuration}
            t={t}
            safetyTimeout={safetyTimeout}
            sessionPhase={session?.currentPhase}
            timerChimesActive={
              session?.currentPhase === 'listening' && !showTopicPicker
            }
          />

          {/* Mobile Toggle Controls - Only visible on small screens */}
          <div className="lg:hidden bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-600 p-3" data-testid="mobile-session-tabs">
            <div className="flex items-center justify-center space-x-1">
              <button
                type="button"
                onClick={() => setShowVideoOnMobile(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showVideoOnMobile 
                    ? 'bg-accent-600 text-white' 
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}
              >
                <span>📹</span>
                <span>{t('dialectic.session.helloCheckIn.mobileTabs.video')}</span>
                {!showVideoOnMobile && (
                  <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowVideoOnMobile(false)}
                data-testid="mobile-tab-guidance"
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showVideoOnMobile 
                    ? 'bg-accent-600 text-white' 
                    : currentUserNeedsRole
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400'
                      : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}
              >
                <span>{currentUserNeedsRole ? '🎭' : '💬'}</span>
                <span>
                  {currentUserNeedsRole
                    ? t('dialectic.session.helloCheckIn.mobileTabs.chooseRole')
                    : t('dialectic.session.helloCheckIn.mobileTabs.guidance')}
                </span>
                {currentUserNeedsRole && showVideoOnMobile && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Responsive Layout - Conditional rendering on mobile, resizable on desktop */}
          <div 
            ref={containerRef}
            className="lg:flex lg:flex-row lg:gap-0 p-2 sm:p-3 lg:p-6 overflow-hidden"
          >
            {/* Video Section - Conditional on mobile, resizable on desktop */}
            <div 
              className={`${showVideoOnMobile ? 'block' : 'hidden'} lg:block`}
              style={{ 
                width: '100%',
                ...(window.innerWidth >= 1024 && { width: `${videoWidth}%` })
              }}
            >
              <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 xl:p-8 overflow-hidden h-full">
                {currentUserNeedsRole && (
                  <div
                    className="lg:hidden mb-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700 p-3"
                    data-testid="mobile-choose-role-banner"
                  >
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                      {t('dialectic.session.helloCheckIn.chooseRoleBanner')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowVideoOnMobile(false)}
                      className="w-full px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 text-sm font-medium"
                    >
                      {t('dialectic.session.helloCheckIn.chooseRoleAction')}
                    </button>
                  </div>
                )}
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

            {/* Resizable Divider - Only visible on desktop when both panels are shown */}
            <div className="hidden lg:block">
              <div
                className="w-1 bg-secondary-200 dark:bg-secondary-600 hover:bg-secondary-300 dark:hover:bg-secondary-500 cursor-col-resize transition-colors relative group"
                onMouseDown={startResize}
                style={{ 
                  minHeight: '100%',
                  background: isDragging ? 'var(--accent-600)' : undefined
                }}
              >
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                  <DragIndicator 
                    className="text-secondary-400 dark:text-secondary-500 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </div>

            {/* Phase-specific content - Conditional on mobile, resizable on desktop */}
            <div 
              className={`${!showVideoOnMobile ? 'block' : 'hidden'} lg:block`}
              style={{ 
                width: '100%',
                ...(window.innerWidth >= 1024 && { width: `${100 - videoWidth}%` })
              }}
            >
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
                    requestedBy={safetyTimeout.timeoutState.requestedByUserName || getUserNameById(safetyTimeout.timeoutState.requestedBy)}
                  />
                )}
              </div>
            )}
            

              
              {!safetyTimeout.isTimeoutActive && showTopicPicker && (
                <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                  <WordCloud
                    suggestions={session?.topicSuggestions || []}
                    currentTopic={session?.topic}
                    onTopicSelect={handleHostTopicSelect}
                    maxWords={10}
                  />
                  <div className="text-center mt-3 sm:mt-4">
                    <button
                      type="button"
                      onClick={() => setShowHostTopicPicker(false)}
                      className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-500 transition-colors"
                    >
                      {t('dialectic.wordCloud.skip')}
                    </button>
                  </div>
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
                  onUpdateParticipantRole={(role) => {
                    void updateParticipantRole(role);
                    setShowVideoOnMobile(true);
                  }}
                />
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'listening' && (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
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

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'completion' && !session?.matchMode && (
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

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'completion' && session?.matchMode && (
                <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6 text-center">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {t('matchmaking.freeDialogue.starting')}
                  </p>
                </div>
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'free-dialogue' && showPostMatchPrompt && session?.matchMode && (
                <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <PostMatchPrompt
                    mode={session.matchMode as MatchMode}
                    onFindAnother={async () => {
                      const mode = session.matchMode as MatchMode;
                      await leaveSession();
                      navigate(`/practice/match?mode=${mode}`, { replace: true });
                    }}
                    onLeave={async () => {
                      await leaveSession();
                      navigate('/', { replace: true });
                    }}
                  />
                </div>
              )}

              {!safetyTimeout.isTimeoutActive && session?.currentPhase === 'free-dialogue' && !(showPostMatchPrompt && session?.matchMode) && (
                <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <FreeDialoguePhase
                    onEndSession={endSession}
                    onLeave={async () => {
                      await leaveSession();
                      navigate('/', { replace: true });
                    }}
                    onFreeDialogueEnded={() => setShowPostMatchPrompt(true)}
                    isHost={isHost}
                    participants={session?.participants || []}
                    isMatchmaking={Boolean(session?.matchMode)}
                    phaseStartTimeMs={
                      session?.phaseStartTime &&
                      typeof (session.phaseStartTime as Timestamp).toMillis === 'function'
                        ? (session.phaseStartTime as Timestamp).toMillis()
                        : null
                    }
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
    return <SessionErrorDisplay type="sessionError" error={sessionError} t={t} />;
  }

  // Show error if no session found
  if (!session) {
    return <SessionErrorDisplay type="sessionNotFound" t={t} />;
  }

  // Show error if session is not active
  if (session.status !== 'active') {
    return <SessionErrorDisplay type="sessionNotStarted" sessionId={session.sessionId} t={t} />;
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