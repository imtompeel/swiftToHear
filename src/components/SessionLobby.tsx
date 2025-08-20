import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { SessionData } from '../types/sessionTypes';
import { FivePersonGroupingChoice } from './FivePersonGroupingChoice';
import { RoleSelection, SelectedRoleDisplay, TopicSuggestions } from './lobby';

interface SessionLobbyProps {
  session: SessionData;
  currentUserId: string;
  isHost: boolean;
  onStartSession: (sessionId: string, fivePersonChoice?: 'split' | 'together') => void;
  onLeaveSession: (userId: string) => void;
  onUpdateReadyState: (userId: string, isReady: boolean) => void;
  onUpdateParticipantRole: (userId: string, role: string) => void;
  onModalStateChange?: (isModalOpen: boolean) => void;
  onAddTopicSuggestion?: (topic: string) => void;
  onVoteForTopic?: (suggestionId: string) => void;
}



const SessionLobby: React.FC<SessionLobbyProps> = ({
  session,
  currentUserId,
  isHost,
  onStartSession,
  onLeaveSession,
  onUpdateReadyState,
  onUpdateParticipantRole,
  onModalStateChange,
  onAddTopicSuggestion,
  onVoteForTopic
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [showHostLeaveConfirmation, setShowHostLeaveConfirmation] = useState(false);
  const [showFivePersonChoice, setShowFivePersonChoice] = useState(false);
  const [isClearingRole, setIsClearingRole] = useState(false);

  // Get current participant
  const currentParticipant = session.participants.find(p => p.id === currentUserId);
  
  // Use session data for role state, but respect the clearing flag
  const hasRole = isClearingRole ? false : (currentParticipant?.role && currentParticipant.role !== '');
  
  // Reset clearing flag when session data updates
  React.useEffect(() => {
    if (isClearingRole && currentParticipant?.role === '') {
      setIsClearingRole(false);
    }
  }, [currentParticipant?.role, isClearingRole]);

  // Get available roles - handle both temporary and permanent observers
  const totalParticipants = session.participants.length + (session.hostRole === 'participant' ? 1 : 0);
  
  // For 2-person sessions, only speaker and listener roles are available (no scribe)
  const baseRoles = totalParticipants === 2 ? ['speaker', 'listener'] : ['speaker', 'listener', 'scribe'];
  const observerRoles = ['observer-temporary', 'observer-permanent'];
  
  // Check if any observer role is taken (including host if they're an observer)
  const hasObserver = session.participants.some(p => 
    p.role === 'observer' || p.role === 'observer-temporary' || p.role === 'observer-permanent'
  ) || session.hostRole === 'observer-permanent';
  
  const availableRoles = [
    ...baseRoles.filter(role => !session.participants.some(p => p.role === role && p.role !== '')),
    ...(hasObserver ? [] : observerRoles)
  ];

  const readyParticipants = session.participants.filter(p => p.status === 'ready');
  // For hosts, we only count non-host participants as ready
  const readyNonHostParticipants = session.participants.filter(p => p.status === 'ready' && p.id !== session.hostId);
  const nonHostParticipants = session.participants.filter(p => p.id !== session.hostId);
  // Host can start session if all non-host participants are ready, or if they're the only participant
  const allNonHostParticipantsReady = readyNonHostParticipants.length === nonHostParticipants.length && nonHostParticipants.length > 0;
  
  // For in-person sessions, check if there's at least one speaker and one listener
  const hasSpeaker = session.participants.some(p => p.role === 'speaker');
  const hasListener = session.participants.some(p => p.role === 'listener');
  const hasRequiredRoles = session.sessionType === 'in-person' ? (hasSpeaker && hasListener) : true;
  
  const canStartSession = isHost && hasRole && hasRequiredRoles && (allNonHostParticipantsReady || session.participants.length === 1);


  // Debug logging
  console.log('SessionLobby Debug:', {
    currentUserId,
    currentParticipant,
    hasRole,
    isClearingRole,
    availableRoles,
    isHost,
    sessionHostId: session.hostId,
    sessionType: session.sessionType,
    participants: session.participants.map(p => ({ id: p.id, name: p.name, role: p.role, status: p.status })),
    readyParticipants: readyParticipants.length,
    readyNonHostParticipants: readyNonHostParticipants.length,
    nonHostParticipants: nonHostParticipants.length,
    allNonHostParticipantsReady,
    hasSpeaker,
    hasListener,
    hasRequiredRoles,
    canStartSession,
    hostHasRole: hasRole
  });

  const handleRoleSelect = (role: string) => {
    console.log('Role selected:', role, 'for user:', currentUserId);
    setIsClearingRole(false);
    onUpdateParticipantRole(currentUserId, role);
  };

  const handleReadyToggle = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    onUpdateReadyState(currentUserId, newReadyState);
  };

  const handleStartSession = () => {
    setShowStartConfirmation(true);
    onModalStateChange?.(true);
  };

  const confirmStartSession = () => {
    setShowStartConfirmation(false);
    onModalStateChange?.(false);
    
    // Check if we have exactly 5 participants and need to show the choice
    const totalParticipants = session.participants.length + (session.hostRole === 'participant' ? 1 : 0);
    
    if (totalParticipants === 5) {
      setShowFivePersonChoice(true);
      onModalStateChange?.(true);
    } else {
      onStartSession(session.sessionId);
    }
  };

  const handleFivePersonChoice = (choice: 'split' | 'together') => {
    setShowFivePersonChoice(false);
    onModalStateChange?.(false);
    // Pass the choice to the start session function
    onStartSession(session.sessionId, choice);
  };

  const handleFivePersonChoiceCancel = () => {
    setShowFivePersonChoice(false);
    onModalStateChange?.(false);
  };

  const handleLeaveSession = () => {
    if (isHost) {
      setShowHostLeaveConfirmation(true);
      onModalStateChange?.(true);
    } else {
      onLeaveSession(currentUserId);
    }
  };

  const confirmLeaveSession = () => {
    setShowHostLeaveConfirmation(false);
    onModalStateChange?.(false);
    onLeaveSession(currentUserId);
  };

  const copySessionLink = async () => {
    const link = `${window.location.origin}/practice/join/${session.sessionId}`;
    try {
      await navigator.clipboard.writeText(link);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const formatDuration = (milliseconds: number) => {
    return Math.floor(milliseconds / 60000);
  };

  // Calculate total session time including check-in and feedback periods
  const calculateTotalSessionTime = (roundLengthMinutes: number) => {
    // For a typical session with 3 rounds:
    // - 3 rounds × round length
    // - 2 minutes total check-in time
    // - 3 × 2.5 minutes feedback time
    const totalRoundTime = roundLengthMinutes * 3;
    const totalCheckInTime = 2; // minutes total
    const totalFeedbackTime = 2.5 * 3; // 2.5 minutes per round × 3 rounds
    return Math.round(totalRoundTime + totalCheckInTime + totalFeedbackTime);
  };



  const getRoleTips = () => {
    const currentParticipant = session.participants.find(p => p.id === currentUserId);
    if (!currentParticipant) return '';

    switch (currentParticipant.role) {
      case 'speaker':
        return t('dialectic.lobby.speakerTips');
      case 'listener':
        return t('dialectic.lobby.listenerTips');
      case 'scribe':
        return t('dialectic.lobby.scribeTips');
      case 'observer':
        return t('shared.guidance.observeDynamics');
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" data-testid="session-lobby-component">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          {t('dialectic.lobby.title')}
        </h1>
      </div>

      {/* Host Controls - Moved to top */}
      {isHost && (
        <div className="space-y-4" data-testid="host-controls">
          <div className="text-center">
            <button
              onClick={handleStartSession}
              disabled={!canStartSession}
              className="px-8 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
              data-testid="start-session-button"
            >
              {t('shared.actions.startSession')}
            </button>
            
            {!hasRole && isHost && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                Please select your role before starting the session
              </p>
            )}
            {!allNonHostParticipantsReady && nonHostParticipants.length > 0 && hasRole && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                Waiting for {nonHostParticipants.length - readyNonHostParticipants.length} more participant{nonHostParticipants.length - readyNonHostParticipants.length === 1 ? '' : 's'} to be ready
              </p>
            )}
            {session.sessionType === 'in-person' && !hasRequiredRoles && hasRole && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                {!hasSpeaker && !hasListener ? 'Need at least one speaker and one listener to start' :
                 !hasSpeaker ? 'Need at least one speaker to start' :
                 !hasListener ? 'Need at least one listener to start' : ''}
              </p>
            )}
          </div>

          {/* Session Sharing */}
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-primary-900 dark:text-primary-100">
              {t('dialectic.lobby.shareSession')}
            </h4>
            
            <div className="flex items-center space-x-3">
              <div 
                className="flex-1 text-sm px-3 py-2 rounded border break-all font-mono"
                style={{
                  backgroundColor: `${theme === 'dark' ? '#1f2937' : '#f9fafb'} !important`,
                  color: `${theme === 'dark' ? '#f3f4f6' : '#111827'} !important`
                }}
              >
                {`${window.location.origin}/practice/join/${session.sessionId}`}
              </div>
              <button
                onClick={copySessionLink}
                className="px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors"
                data-testid="copy-session-link"
              >
                {t('dialectic.lobby.copyLink')}
              </button>
            </div>
            
            <div className="text-center" data-testid="session-qr-code">
              <p className="text-sm text-secondary-500 dark:text-secondary-400">QR Code for easy sharing</p>
              {/* QR code component could be added here */}
            </div>
          </div>
        </div>
      )}

      {/* Ready State Toggle - Only for non-hosts */}
      {!isHost && (
        <div className="text-center space-y-4" data-testid="ready-state-toggle">
          <button
            onClick={handleReadyToggle}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isReady 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
            }`}
          >
            {isReady ? '✓ Ready' : t('dialectic.lobby.markAsReady')}
          </button>
          
          <div className="text-sm text-secondary-600 dark:text-secondary-400" data-testid="your-ready-status">
            {isReady ? 'You are ready' : 'You are not ready'}
          </div>
        </div>
      )}

      {/* Session Information */}
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6 space-y-4" data-testid="session-lobby-info">
        <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
          {session.sessionName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-primary-700 dark:text-primary-300">Duration:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{calculateTotalSessionTime(formatDuration(session.duration))} minutes</span>
          </div>
          
          <div>
            <span className="font-medium text-primary-700 dark:text-primary-300">Topic:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{session.topic}</span>
          </div>
          
          <div>
            <span className="font-medium text-primary-700 dark:text-primary-300">Host:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{session.hostName}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Layout: Role Selection or Topic Suggestions */}
      {(session.groupConfiguration?.autoAssignRoles !== true || !session.groupConfiguration) && (
        <>
          {/* Show Role Selection when no role is selected */}
          {!hasRole && (
            <RoleSelection
              currentParticipant={currentParticipant}
              availableRoles={availableRoles}
              totalParticipants={session.participants.length + (session.hostRole === 'participant' ? 1 : 0)}
              onRoleSelect={handleRoleSelect}
              hasRole={!!hasRole}
            />
          )}

          {/* Show Topic Suggestions when role is selected */}
          {hasRole && (
            <TopicSuggestions
              session={session}
              currentUserId={currentUserId}
              onAddTopicSuggestion={onAddTopicSuggestion}
              onVoteForTopic={onVoteForTopic}
            />
          )}
        </>
      )}

      {/* Auto-assign roles message */}
      {session.groupConfiguration?.autoAssignRoles && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 space-y-2" data-testid="auto-assign-message">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🤖</span>
            <div>
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Roles will be automatically assigned
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Your role will be assigned when the session starts
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Countdown and Status */}
      <div className="text-center space-y-4">
        <div className="text-sm text-secondary-600 dark:text-secondary-400" data-testid="participants-readiness">
          {readyNonHostParticipants.length} participants ready
        </div>
      </div>

      {/* Selected Role Display - Show above participants when role is selected */}
      {(session.groupConfiguration?.autoAssignRoles !== true || !session.groupConfiguration) && hasRole && (
        <SelectedRoleDisplay
          currentParticipant={currentParticipant}
          onRoleChange={() => {
            console.log('Change role clicked - clearing role');
            // Clear the role to go back to role selection
            setIsClearingRole(true);
            onUpdateParticipantRole(currentUserId, '');
          }}
        />
      )}

      {/* Participant List */}
      <div className="space-y-4" data-testid="participant-list" aria-label={t('shared.common.participants')}>
        <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
          Participants
        </h3>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 p-4 space-y-3">
          {session.participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-primary-900 dark:text-primary-100">{participant.name}</span>
                <span className="text-secondary-500 dark:text-secondary-400">
                  ({participant.role || 'No role selected'})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    participant.status === 'ready' ? 'bg-green-500' : 
                    participant.status === 'not-ready' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  data-testid={`participant-${participant.status}-${participant.id}`}
                />
                
                {participant.connectionStatus && (
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      participant.connectionStatus === 'good' ? 'bg-green-400' : 
                      participant.connectionStatus === 'poor' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    data-testid={`connection-status-${participant.connectionStatus}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waiting for Participants */}
      {session.participants.length < session.minParticipants && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-2" data-testid="waiting-for-participants">
          <p className="text-blue-800 font-medium">
            {t('dialectic.lobby.waitingForParticipants')}
          </p>
          <p className="text-blue-700 text-sm">
            {(() => {
              // Count non-host participants
              const nonHostParticipants = session.participants.filter(p => p.id !== session.hostId);
              const participantCount = nonHostParticipants.length;
              return `${participantCount} participant${participantCount === 1 ? '' : 's'} joined`;
            })()}
            {session.minParticipants > 2 && (
              <span> • Need at least {session.minParticipants} to start</span>
            )}
          </p>
        </div>
      )}









      {/* Preparation Tips - Improved Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Preparation Tips */}
        <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 rounded-xl p-6 border border-accent-200 dark:border-accent-700" data-testid="role-preparation-tips">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">💡</span>
            <h4 className="font-semibold text-accent-900 dark:text-accent-100">Preparation Tips</h4>
          </div>
          <p className="text-sm text-accent-700 dark:text-accent-200 leading-relaxed">{getRoleTips()}</p>
        </div>

        {/* Tech Check */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 border border-blue-200 dark:border-blue-700" data-testid="tech-check-option">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🎤</span>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              {t('dialectic.lobby.testAudioVideo')}
            </h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
            Make sure your microphone and camera are working properly before we begin.
          </p>
        </div>

        {/* Session Preview */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-6 border border-green-200 dark:border-green-700" data-testid="session-preview">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">⏱️</span>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              {t('dialectic.lobby.sessionPreview.title')}
            </h4>
          </div>
          <div className="text-sm text-green-700 dark:text-green-200 space-y-2">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span>{t('dialectic.lobby.sessionPreview.totalTime', { duration: calculateTotalSessionTime(formatDuration(session.duration)) })}</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span>{t('dialectic.lobby.sessionPreview.rounds', { rounds: 3, roundDuration: formatDuration(session.duration) })}</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span>{t('dialectic.lobby.sessionPreview.format')}</span>
            </div>
          </div>
        </div>

        {/* First Time Here */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 border border-purple-200 dark:border-purple-700" data-testid="contextual-help">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🌟</span>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              {t('dialectic.lobby.firstTimeHere')}
            </h4>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-200 leading-relaxed">
            This is a structured practice for deep listening and authentic sharing. Each participant will have the opportunity to speak and listen in different roles.
          </p>
        </div>
      </div>

      {/* Duration Breakdown */}
      <div className="text-center text-sm text-secondary-600 dark:text-secondary-400" data-testid="duration-breakdown">
        {t('dialectic.lobby.sessionPreview.rounds', { rounds: 3, roundDuration: formatDuration(session.duration) })}
      </div>

      {/* Leave Session */}
      <div className="text-center">
        <button
          onClick={handleLeaveSession}
          className="px-6 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 transition-colors"
          data-testid="leave-session-button"
        >
          {t('shared.actions.leaveSession')}
        </button>
      </div>

      {/* Mobile Layout */}
      <div className="hidden md:block" data-testid="mobile-optimized-layout">
        {/* Mobile-specific layout adjustments */}
      </div>

      {/* Confirmation Dialogs */}
      {showStartConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
              {t('shared.actions.startSession')}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              {t('dialectic.lobby.confirmStart.description')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmStartSession}
                className="flex-1 px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors"
                data-testid="confirm-start-button"
              >
                {t('shared.actions.startSession')}
              </button>
              <button
                onClick={() => setShowStartConfirmation(false)}
                className="flex-1 px-4 py-2 bg-secondary-200 text-secondary-700 rounded hover:bg-secondary-300 transition-colors"
              >
                {t('shared.actions.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHostLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
              Leave Session?
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              {t('dialectic.lobby.hostLeaveWarning')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmLeaveSession}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                data-testid="host-leave-confirmation"
              >
                Leave Session
              </button>
              <button
                onClick={() => setShowHostLeaveConfirmation(false)}
                className="flex-1 px-4 py-2 bg-secondary-200 text-secondary-700 rounded hover:bg-secondary-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Five Person Choice Modal */}
      {showFivePersonChoice && (
        <FivePersonGroupingChoice
          onChoice={handleFivePersonChoice}
          onCancel={handleFivePersonChoiceCancel}
        />
      )}

      {/* Status announcements for screen readers */}
      <div className="sr-only" role="status">
        Participant status changed
      </div>
    </div>
  );
};

export { SessionLobby }; 