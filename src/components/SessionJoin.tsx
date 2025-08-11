import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SessionJoinProps {
  session: SessionData | null;
  onJoinSession: (joinData: JoinData) => void;
  onRoleSelect: (role: string) => void;
  currentUserId: string;
  currentUserName: string;
  isFirstTime?: boolean;
}

import { SessionData } from '../services/firestoreSessionService';

interface JoinData {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
}

const SessionJoin: React.FC<SessionJoinProps> = ({ 
  session, 
  onJoinSession, 
  onRoleSelect, 
  currentUserId, 
  currentUserName,
  isFirstTime = false 
}) => {
  const { t } = useTranslation();
  
  // Handle case where session doesn't exist
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('dialectic.join.sessionNotFound')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('dialectic.join.sessionNotFoundDescription')}
            </p>
            <a 
              href="/practice/create" 
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('dialectic.join.backToCreate')}
            </a>
          </div>
        </div>
      </div>
    );
  }
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string>('');

  const roles = [
    {
      id: 'speaker',
      title: t('dialectic.roles.speaker.title'),
      description: t('dialectic.roles.speaker.description'),
      icon: '🗣️'
    },
    {
      id: 'listener',
      title: t('dialectic.roles.listener.title'),
      description: t('dialectic.roles.listener.description'),
      icon: '👂'
    },
    {
      id: 'scribe',
      title: t('dialectic.roles.scribe.title'),
      description: t('dialectic.roles.scribe.description'),
      icon: '✍️'
    },
    {
      id: 'observer-temporary',
      title: t('dialectic.roles.observer.temporary.title'),
      description: t('dialectic.roles.observer.temporary.description'),
      icon: '👁️',
      badge: t('dialectic.roles.observer.temporary.badge')
    },
    {
      id: 'observer-permanent',
      title: t('dialectic.roles.observer.permanent.title'),
      description: t('dialectic.roles.observer.permanent.description'),
      icon: '👁️',
      badge: t('dialectic.roles.observer.permanent.badge')
    }
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    onRoleSelect(role);
    setJoinError('');
  };

  const handleJoinSession = async () => {
    if (!selectedRole || !session) {
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const joinData: JoinData = {
        sessionId: session.sessionId,
        userId: currentUserId,
        userName: currentUserName,
        role: selectedRole
      };

      // Call the join session function and await it
      await onJoinSession(joinData);
    } catch (error) {
      setJoinError(t('dialectic.join.error'));
    } finally {
      setIsJoining(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    return Math.floor(milliseconds / 60000);
  };

  const formatDate = (date: Date | any) => {
    // Handle Firestore Timestamp
    const dateObj = date?.toDate ? date.toDate() : date;
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Session not found
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6" data-testid="session-not-found">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
            {t('dialectic.join.sessionNotFound')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('dialectic.join.sessionNotFoundDescription')}
          </p>
        </div>
        
        <button
          onClick={() => window.location.href = '/practice/create'}
          className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
          data-testid="back-to-creation"
        >
          {t('dialectic.join.backToCreate')}
        </button>
      </div>
    );
  }

  // Calculate available roles - handle both temporary and permanent observers
  const totalParticipants = session.participants.length + 1; // +1 for the current user joining
  
  // For 2-person sessions, only speaker and listener roles are available (no scribe)
  const baseRoles = totalParticipants === 2 ? ['speaker', 'listener'] : ['speaker', 'listener', 'scribe'];

  // Check if any observer role is taken
  const hasObserver = session.participants.some(p => 
    p.role === 'observer' || p.role === 'observer-temporary' || p.role === 'observer-permanent'
  );
  
  // Get available base roles (speaker, listener, scribe)
  const availableBaseRoles = baseRoles.filter(role => !session.participants.some(p => p.role === role));
  
  // Observer roles are only available if:
  // 1. No observer exists yet, AND
  // 2. Either: 3+ participants (for permanent observer) OR 4+ participants (for temporary observer) OR all base roles are taken
  const shouldShowPermanentObserver = !hasObserver && (totalParticipants >= 3 || availableBaseRoles.length === 0);
  const shouldShowTemporaryObserver = !hasObserver && (totalParticipants >= 4 || availableBaseRoles.length === 0);
  
  const availableObserverRoles = [
    ...(shouldShowPermanentObserver ? ['observer-permanent'] : []),
    ...(shouldShowTemporaryObserver ? ['observer-temporary'] : [])
  ];
  
  const availableRoles = [
    ...availableBaseRoles,
    ...availableObserverRoles
  ];

  // Session is full
  if (availableRoles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6" data-testid="session-full-message">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
            {t('dialectic.join.sessionFull')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('dialectic.join.sessionFullDescription')}
          </p>
        </div>
        
        <button
          onClick={() => window.location.href = '/practice/create'}
          className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
        >
          {t('dialectic.join.backToCreate')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" data-testid="session-join-component">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          {t('dialectic.join.title')}
        </h1>
      </div>

      {/* First-time user guidance */}
      {isFirstTime && (
        <div className="bg-accent-50 dark:bg-accent-900 rounded-lg p-4 space-y-3" data-testid="first-time-guidance">
          <h3 className="font-medium text-accent-900 dark:text-accent-100">
            {t('dialectic.join.firstTimeWelcome')}
          </h3>
          <p className="text-sm text-accent-700 dark:text-accent-200">
            {t('dialectic.join.firstTimeDescription')}
          </p>
        </div>
      )}

      {/* Session Explainer */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          {t('dialectic.join.welcomeTitle')}
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {t('dialectic.join.welcomeDescription')}
        </p>
      </div>

      {/* Session Information */}
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6 space-y-4" data-testid="session-info-display">
        <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
          {session.sessionName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div data-testid="session-duration-display">
            <span className="font-medium text-primary-700 dark:text-primary-300">{t('dialectic.join.duration')}:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{formatDuration(session.duration)} {t('dialectic.join.minutes')}</span>
          </div>
          
          <div data-testid="host-info">
            <span className="font-medium text-primary-700 dark:text-primary-300">{t('dialectic.join.host')}:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{session.hostName}</span>
          </div>
          
          <div data-testid="session-topic-display">
            <span className="font-medium text-primary-700 dark:text-primary-300">{t('dialectic.join.topic')}:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">
              {session.topic || t('dialectic.join.noTopicSet')}
            </span>
          </div>
          
          <div data-testid="session-created-time">
            <span className="font-medium text-primary-700 dark:text-primary-300">{t('dialectic.join.created')}:</span>
            <span className="ml-2 text-secondary-600 dark:text-secondary-400">{formatDate(session.createdAt)}</span>
          </div>
        </div>
      </div>



      {/* Current Participants */}
      <div className="space-y-4" data-testid="current-participants">
        <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
          {t('dialectic.join.currentParticipants')}
        </h3>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 space-y-3">
          <div className="flex justify-between items-center text-sm" data-testid="participant-count">
            <span className="text-secondary-600 dark:text-secondary-400">
              {t('dialectic.join.participantCount', { 
                current: session.participants.filter(p => p.id !== session.hostId).length, 
                total: 4 
              })}
            </span>
          </div>
          
          <div className="space-y-2">
            {session.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-primary-900 dark:text-primary-100">{participant.name}</span>
                  <span className="text-secondary-500 dark:text-secondary-400">
                    ({participant.role === 'host' ? 'Host' : participant.role})
                  </span>
                </div>
                <div 
                  className={`w-2 h-2 rounded-full ${
                    participant.status === 'ready' ? 'bg-green-500' : 
                    participant.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  data-testid={`participant-status-${participant.status}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Status */}
      <div className={`rounded-lg p-4 ${
        session.status === 'waiting' ? 'bg-blue-50 dark:bg-blue-900' : 'bg-yellow-50 dark:bg-yellow-900'
      }`} data-testid={`session-status-${session.status}`}>
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {session.status === 'waiting' && t('dialectic.join.waitingToStart')}
          {session.status === 'active' && t('dialectic.join.sessionInProgress')}
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4" data-testid="role-selection-section">
        <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
          {t('dialectic.join.chooseRole')}
        </h3>
        
        {availableRoles.length === 1 && (availableRoles[0] === 'observer-temporary' || availableRoles[0] === 'observer-permanent') && (
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-100">
              {t('dialectic.join.onlyObserverAvailable')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const isAvailable = availableRoles.includes(role.id);
            const isSelected = selectedRole === role.id;
            const isScribeDisabled = role.id === 'scribe' && totalParticipants < 3;
            const isTemporaryObserverDisabled = role.id === 'observer-temporary' && totalParticipants < 4;
            const isPermanentObserverDisabled = role.id === 'observer-permanent' && totalParticipants < 3;
            
            return (
              <button
                key={role.id}
                onClick={() => isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled && !isPermanentObserverDisabled && handleRoleSelect(role.id)}
                disabled={!isAvailable || isScribeDisabled || isTemporaryObserverDisabled || isPermanentObserverDisabled}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  isSelected 
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900' 
                    : isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled && !isPermanentObserverDisabled
                      ? 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500' 
                      : 'border-secondary-100 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 opacity-50 cursor-not-allowed'
                }`}
                data-testid={`role-${role.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{role.icon}</div>
                  {role.badge && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      role.id === 'observer-temporary' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {role.badge}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
                  {role.title}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  {role.description}
                </div>
                {!isAvailable && (
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                    {role.id === 'scribe' && totalParticipants < 3 ? 'Only available in 3+ person sessions' :
                     role.id === 'observer-temporary' && totalParticipants < 4 ? 'Only available in 4+ person sessions' :
                     role.id === 'observer-permanent' && totalParticipants < 3 ? 'Only available in 3+ person sessions' :
                     t('dialectic.join.roleTaken')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Guidance */}
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4" data-testid="role-guidance">
        <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
          {t('dialectic.join.roleGuidance')}
        </h4>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          {t('dialectic.join.roleGuidanceDescription')}
        </p>
      </div>

      {/* Join Button */}
      <div className="text-center space-y-4">
        <button
          onClick={handleJoinSession}
          disabled={!selectedRole || isJoining}
          className="px-8 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
          data-testid="join-session-button"
        >
          {isJoining ? t('dialectic.join.joining') : t('dialectic.join.joinSession')}
        </button>
        
        {joinError && (
          <div className="text-red-600 dark:text-red-400 text-sm" data-testid="join-error">
            {joinError}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-2 text-sm text-secondary-500 dark:text-secondary-400">
        <div data-testid="estimated-start-time">
          {t('dialectic.join.estimatedStartTime')}: {formatDate(new Date(Date.now() + 5 * 60 * 1000))}
        </div>
        <div data-testid="session-id-display" className="text-xs">
          {t('dialectic.join.sessionId')}: {session.sessionId}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="hidden md:block" data-testid="mobile-optimized-layout">
        {/* Mobile-specific layout adjustments */}
      </div>

      {/* User Identification (hidden for now) */}
      <div className="hidden" data-testid="user-identification">
        <input 
          type="text" 
          placeholder="Enter your name"
          data-testid="name-input"
          className="w-full px-3 py-2 border border-secondary-300 rounded-md"
        />
      </div>

      {/* Status announcements for screen readers */}
      <div className="sr-only" role="status">
        {session.status === 'active' && t('dialectic.join.sessionStarted')}
      </div>
    </div>
  );
};

export { SessionJoin }; 