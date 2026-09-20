import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { HoverTimer } from './HoverTimer';
import RoleSelection from './lobby/RoleSelection';

import { SessionContext, SessionParticipant } from '../types/sessionContext';

interface HelloCheckInProps {
  session: SessionContext;
  participants: SessionParticipant[];
  onComplete: () => void;
  currentUserId: string;
  currentUserName: string;
  isHost?: boolean;
  hideVideo?: boolean;
  onUpdateParticipantRole?: (role: string) => void;
}

const hasAssignedRole = (role?: string | null) => Boolean(role && role.trim() !== '');

export const HelloCheckIn: React.FC<HelloCheckInProps> = ({
  session,
  participants,
  onComplete,
  currentUserId,
  isHost = false,
  onUpdateParticipantRole,
}) => {
  const { t } = useTranslation();
  const duration = 2 * 60 * 1000; // 2 minutes default
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [, setIsComplete] = useState(false);
  const completedRef = useRef(false);

  // Get current participant
  const currentParticipant = participants.find(p => p.id === currentUserId);
  const hasRole = hasAssignedRole(currentParticipant?.role);
  const participantsWithoutRoles = participants.filter(p => !hasAssignedRole(p.role));
  const allParticipantsHaveRoles = participantsWithoutRoles.length === 0 && participants.length > 0;
  const waitingRoleNames = participantsWithoutRoles.map(p => p.name).join(', ');

  // Get available roles based on actual participant count and session type
  const getAvailableRoles = () => {
    const participantCount = participants.length;
    let baseRoles: string[] = [];
    
    // Use the same logic as FirestoreSessionService but simplified
    if ((session as any).sessionType === 'in-person') {
      // For in-person sessions, use observer-temporary
      if (participantCount === 2) {
        baseRoles = ['speaker', 'listener'];
      } else if (participantCount === 3) {
        baseRoles = ['speaker', 'listener', 'scribe'];
      } else {
        baseRoles = ['speaker', 'listener', 'scribe', 'observer-temporary'];
      }
    } else {
      // For video sessions, use regular observer
      if (participantCount === 2) {
        baseRoles = ['speaker', 'listener'];
      } else if (participantCount === 3) {
        baseRoles = ['speaker', 'listener', 'scribe'];
      } else {
        baseRoles = ['speaker', 'listener', 'scribe', 'observer'];
      }
    }

    const taken = new Set(participants.map(p => p.role).filter(role => hasAssignedRole(role)));
    const available = baseRoles.filter(role => !taken.has(role));
    const observerRole = (session as any).sessionType === 'in-person' ? 'observer-temporary' : 'observer';
    if (
      participantsWithoutRoles.length > 0 &&
      participantCount > baseRoles.length &&
      !available.includes(observerRole)
    ) {
      available.push(observerRole);
    }

    return available;
  };

  const availableRoles = getAvailableRoles();

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    if (onUpdateParticipantRole) {
      onUpdateParticipantRole(role);
    }
  };

  const completeCheckIn = useCallback(() => {
    if (!allParticipantsHaveRoles || completedRef.current) {
      return;
    }

    completedRef.current = true;
    setIsComplete(true);
    onComplete();
  }, [allParticipantsHaveRoles, onComplete]);

  // Countdown starts only after every participant has a role
  useEffect(() => {
    if (!allParticipantsHaveRoles) {
      return;
    }

    if (timeRemaining <= 0) {
      completeCheckIn();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, allParticipantsHaveRoles, completeCheckIn]);


  // Stay on role selection until every participant has chosen
  if (!allParticipantsHaveRoles) {
    return (
      <div 
        data-testid="role-selection-phase"
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 rounded-xl"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('shared.common.chooseRole')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              {t('dialectic.session.helloCheckIn.chooseRoleDescription')}
            </p>
            {waitingRoleNames && (
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-3" data-testid="waiting-for-roles">
                {t('dialectic.session.helloCheckIn.waitingForNamedRoles', {
                  names: waitingRoleNames
                })}
              </p>
            )}
          </div>

          {!hasRole ? (
            <div className="mb-6">
              <RoleSelection
                currentParticipant={currentParticipant}
                availableRoles={availableRoles}
                totalParticipants={participants.length}
                onRoleSelect={handleRoleSelect}
                hasRole={!!hasRole}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-6 text-center">
              <div className="text-green-600 dark:text-green-400 text-4xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('dialectic.session.helloCheckIn.roleSelected')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('dialectic.session.helloCheckIn.youAreThe', {
                  role: currentParticipant?.role === 'observer'
                    ? t('shared.roles.observer')
                    : t(`dialectic.roles.${currentParticipant?.role}.title`)
                })}
              </p>
            </div>
          )}

          {/* Participants Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('shared.common.participants')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 flex items-center space-x-3"
                >
                  <div className={`w-3 h-3 rounded-full ${hasAssignedRole(participant.role) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {participant.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {hasAssignedRole(participant.role)
                        ? (participant.role === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${participant.role}.title`))
                        : t('dialectic.session.helloCheckIn.selectingRole')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-testid="hello-checkin"
      className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 rounded-xl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-start mb-4">
            {/* Timer - Top Right */}
            <div className="flex-1"></div>
            <HoverTimer 
              timeRemaining={timeRemaining}
              className="text-gray-900 dark:text-white"
              isActive={false}
            />
          </div>
          
          {/* Title and Description - Below Timer */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dialectic.session.helloCheckIn.title')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              {t('dialectic.session.helloCheckIn.description')}
            </p>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('shared.common.participants')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 flex items-center space-x-3"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {participant.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {participant.role ? (participant.role === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${participant.role}.title`)) : t('dialectic.session.helloCheckIn.noRole')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4 sm:p-6 md:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              {t('dialectic.session.helloCheckIn.guidelines.title')}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <li>• {t('dialectic.session.helloCheckIn.guidelines.introduce')}</li>
              <li>• {t('shared.guidance.shareWhatIsAlive')}</li>
              <li>• {t('dialectic.session.helloCheckIn.guidelines.listen')}</li>
              <li>• {t('dialectic.session.helloCheckIn.guidelines.respect')}</li>
            </ul>
          </div>
        </div>

        {/* Complete button - only for host, and only once everyone has a role */}
        {isHost && (
          <div className="text-center">
            <button
              onClick={completeCheckIn}
              disabled={!allParticipantsHaveRoles}
              className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
            >
              {t('dialectic.session.helloCheckIn.complete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
