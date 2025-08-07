import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { TopicSuggestion } from '../services/firestoreSessionService';

interface SessionLobbyProps {
  session: SessionData;
  currentUserId: string;
  isHost: boolean;
  onStartSession: (sessionId: string) => void;
  onLeaveSession: (userId: string) => void;
  onUpdateReadyState: (userId: string, isReady: boolean) => void;
  onUpdateParticipantRole: (userId: string, role: string) => void;
  onModalStateChange?: (isModalOpen: boolean) => void;
  onAddTopicSuggestion?: (topic: string) => void;
  onVoteForTopic?: (suggestionId: string) => void;
}

interface SessionData {
  sessionId: string;
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostName: string;
  hostRole?: 'participant' | 'observer-permanent';
  createdAt: Date;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  minParticipants: number;
  maxParticipants: number;
  topicSuggestions?: TopicSuggestion[];
}

interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'ready' | 'not-ready' | 'connecting';
  connectionStatus?: 'good' | 'poor' | 'disconnected';
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
  const [, setSelectedRole] = useState<string>('');
  
  // Topic suggestion state
  const [newTopicSuggestion, setNewTopicSuggestion] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // Get current participant
  const currentParticipant = session.participants.find(p => p.id === currentUserId);
  const hasRole = currentParticipant?.role && currentParticipant.role !== '';

  // Get available roles - handle both temporary and permanent observers
  const baseRoles = ['speaker', 'listener', 'scribe'];
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
  const canStartSession = isHost && (allNonHostParticipantsReady || session.participants.length === 1);

  // Sample topics for quick addition
  const sampleTopics = [
    'What is alive in you right now?',
    'What challenge are you facing?',
    'What transition are you navigating?',
    'What are you learning about yourself?',
    'What matters most to you in this moment?'
  ];

  // Debug logging
  console.log('SessionLobby Debug:', {
    currentUserId,
    currentParticipant,
    hasRole,
    availableRoles,
    isHost,
    sessionHostId: session.hostId,
    participants: session.participants.map(p => ({ id: p.id, name: p.name, role: p.role, status: p.status })),
    readyParticipants: readyParticipants.length,
    readyNonHostParticipants: readyNonHostParticipants.length,
    nonHostParticipants: nonHostParticipants.length,
    allNonHostParticipantsReady,
    canStartSession
  });

  const handleRoleSelect = (role: string) => {
    console.log('Role selected:', role, 'for user:', currentUserId);
    setSelectedRole(role);
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
    onStartSession(session.sessionId);
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

  // Topic suggestion handlers
  const handleAddTopicSuggestion = async () => {
    if (!newTopicSuggestion.trim()) return;

    const currentParticipant = session.participants.find(p => p.id === currentUserId);
    if (!currentParticipant) return;

    setIsAddingTopic(true);
    try {
      if (onAddTopicSuggestion) {
        await onAddTopicSuggestion(newTopicSuggestion.trim());
      }
      
      setNewTopicSuggestion('');
    } catch (error) {
      console.error('Failed to add topic suggestion:', error);
    } finally {
      setIsAddingTopic(false);
    }
  };

  const handleVoteForTopic = async (suggestionId: string) => {
    try {
      if (onVoteForTopic) {
        await onVoteForTopic(suggestionId);
      }
    } catch (error) {
      console.error('Failed to vote for topic:', error);
    }
  };

  const handleSampleTopicClick = async (sampleTopic: string) => {
    // Check if this topic is already suggested
    const existingSuggestion = session.topicSuggestions?.find(
      s => s.topic.toLowerCase() === sampleTopic.toLowerCase()
    );
    
    if (existingSuggestion) {
      // If it exists, just vote for it
      await handleVoteForTopic(existingSuggestion.id);
    } else {
      // If it doesn't exist, add it
      setNewTopicSuggestion(sampleTopic);
      await handleAddTopicSuggestion();
    }
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
        return t('dialectic.lobby.observerTips');
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
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{formatDuration(session.duration)} minutes</span>
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

      {/* Topic Suggestions Section */}
      <div className="space-y-4" data-testid="topic-suggestions-section">
        <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
          {t('dialectic.lobby.topicSuggestions.title')}
        </h3>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 p-4 space-y-4">
          {/* Add new topic suggestion */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTopicSuggestion}
                onChange={(e) => setNewTopicSuggestion(e.target.value)}
                placeholder={t('dialectic.lobby.topicSuggestions.placeholder')}
                className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTopicSuggestion()}
                disabled={isAddingTopic}
              />
              <button
                onClick={handleAddTopicSuggestion}
                disabled={!newTopicSuggestion.trim() || isAddingTopic}
                className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingTopic ? t('dialectic.lobby.topicSuggestions.adding') : t('dialectic.lobby.topicSuggestions.add')}
              </button>
            </div>
          </div>

          {/* Sample topics for quick addition */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {t('dialectic.lobby.topicSuggestions.sampleTopics')}
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleTopics.map((sampleTopic, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleTopicClick(sampleTopic)}
                  className="px-3 py-1 text-sm rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-600 transition-colors"
                >
                  {sampleTopic}
                </button>
              ))}
            </div>
          </div>

          {/* Current topic suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {t('dialectic.lobby.topicSuggestions.currentSuggestions')}
            </p>
            
            {session.topicSuggestions && session.topicSuggestions.length > 0 ? (
              <div className="space-y-2">
                {session.topicSuggestions
                  .sort((a, b) => b.votes - a.votes)
                  .map((suggestion) => {
                    const hasVoted = suggestion.voters.includes(currentUserId);
                    return (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-secondary-900 dark:text-secondary-100">
                            {suggestion.topic}
                          </div>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400">
                            {suggestion.votes} {t('dialectic.lobby.topicSuggestions.votes')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleVoteForTopic(suggestion.id)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            hasVoted
                              ? 'bg-accent-500 text-white'
                              : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300 dark:bg-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-500'
                          }`}
                        >
                          {hasVoted ? '✓' : 'Vote'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-secondary-500 dark:text-secondary-400">
                  {t('dialectic.lobby.topicSuggestions.noSuggestions')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Countdown and Status */}
      <div className="text-center space-y-4">
        <div className="text-sm text-secondary-600 dark:text-secondary-400" data-testid="participants-readiness">
          {readyNonHostParticipants.length} participants ready
        </div>
      </div>

      {/* Participant List */}
      <div className="space-y-4" data-testid="participant-list" aria-label={t('dialectic.lobby.participantList')}>
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
            {session.participants.length} of {session.minParticipants} participants joined
          </p>
        </div>
      )}

      {/* Role Selection */}
      <div className="space-y-4" data-testid="role-selection">
        <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
          {hasRole ? 'Change Your Role' : 'Choose Your Role'}
        </h3>
        
        {hasRole && currentParticipant?.role && (
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            Current role: <span className="font-medium text-primary-700 dark:text-primary-300">
              {t(`dialectic.roles.${currentParticipant.role}.title`)}
            </span>
          </div>
        )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['speaker', 'listener', 'scribe', 'observer'].map((role) => {
              const isCurrentRole = currentParticipant?.role === role;
              const isAvailable = availableRoles.includes(role);
              
              return (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  disabled={!isAvailable}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    isCurrentRole 
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900' 
                      : isAvailable
                        ? 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                  data-testid={`role-select-${role}`}
                >
                <div className="text-2xl mb-2">
                  {role === 'speaker' && '🗣️'}
                  {role === 'listener' && '👂'}
                  {role === 'scribe' && '✍️'}
                  {role === 'observer' && '👁️'}
                </div>
                <div className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
                  {t(`dialectic.roles.${role}.title`)}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  {t(`dialectic.roles.${role}.description`)}
                </div>
              </button>
            );
            })}
          </div>
          
          {/* Debug info for role selection */}
          {availableRoles.length === 0 && (
            <div className="text-sm text-red-600 dark:text-red-400">
              No roles available. This might be a bug. Available roles: {['speaker', 'listener', 'scribe', 'observer'].join(', ')}
            </div>
          )}
        </div>





      {/* Host Controls */}
      {isHost && (
        <div className="space-y-4" data-testid="host-controls">
          <div className="text-center">
            <button
              onClick={handleStartSession}
              disabled={!canStartSession}
              className="px-8 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
              data-testid="start-session-button"
            >
              {t('dialectic.lobby.startSession')}
            </button>
            
            {!allNonHostParticipantsReady && nonHostParticipants.length > 0 && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                Waiting for {nonHostParticipants.length - readyNonHostParticipants.length} more participant{nonHostParticipants.length - readyNonHostParticipants.length === 1 ? '' : 's'} to be ready
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

      {/* Preparation Tips */}
      <div className="space-y-4">
        <div className="bg-accent-50 dark:bg-accent-900 rounded-lg p-4" data-testid="role-preparation-tips">
          <h4 className="font-medium text-accent-900 dark:text-accent-100 mb-2">Preparation Tips</h4>
          <p className="text-sm text-accent-700 dark:text-accent-200">{getRoleTips()}</p>
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4" data-testid="tech-check-option">
          <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            {t('dialectic.lobby.testAudioVideo')}
          </h4>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Make sure your microphone and camera are working properly before we begin.
          </p>
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-2" data-testid="session-preview">
          <h4 className="font-medium text-primary-900 dark:text-primary-100">
            {t('dialectic.lobby.sessionPreview.title')}
          </h4>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
            <p>{t('dialectic.lobby.sessionPreview.totalTime', { duration: formatDuration(session.duration) })}</p>
            <p>{t('dialectic.lobby.sessionPreview.rounds', { rounds: 3, roundDuration: 5 })}</p>
            <p>{t('dialectic.lobby.sessionPreview.format')}</p>
          </div>
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4" data-testid="session-guidelines">
          <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            {t('dialectic.lobby.guidelines')}
          </h4>
          <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
            <li>• Listen with full attention and presence</li>
            <li>• Speak from your heart and experience</li>
            <li>• Respect the time limits for each round</li>
            <li>• Maintain confidentiality of what's shared</li>
          </ul>
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4" data-testid="contextual-help">
          <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            {t('dialectic.lobby.firstTimeHere')}
          </h4>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            This is a structured practice for deep listening and authentic sharing. Each participant will have the opportunity to speak and listen in different roles.
          </p>
        </div>
      </div>

      {/* Duration Breakdown */}
      <div className="text-center text-sm text-secondary-600 dark:text-secondary-400" data-testid="duration-breakdown">
        {t('dialectic.lobby.sessionPreview.rounds', { rounds: 3, roundDuration: 5 })}
      </div>

      {/* Leave Session */}
      <div className="text-center">
        <button
          onClick={handleLeaveSession}
          className="px-6 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 transition-colors"
          data-testid="leave-session-button"
        >
          {t('dialectic.lobby.leaveSession')}
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
              {t('dialectic.lobby.confirmStart')}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Are you ready to begin the practice session? This will start the timer and begin the first round.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmStartSession}
                className="flex-1 px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors"
                data-testid="confirm-start-button"
              >
                Start Session
              </button>
              <button
                onClick={() => setShowStartConfirmation(false)}
                className="flex-1 px-4 py-2 bg-secondary-200 text-secondary-700 rounded hover:bg-secondary-300 transition-colors"
              >
                Cancel
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

      {/* Status announcements for screen readers */}
      <div className="sr-only" role="status">
        Participant status changed
      </div>
    </div>
  );
};

export { SessionLobby }; 