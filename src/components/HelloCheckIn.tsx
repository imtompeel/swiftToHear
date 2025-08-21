import React, { useState, useEffect } from 'react';
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
  const [showRoleSelection, setShowRoleSelection] = useState(true);

  // Get current participant
  const currentParticipant = participants.find(p => p.id === currentUserId);
  const hasRole = currentParticipant?.role && currentParticipant.role !== '';

  // Check if all participants have roles
  const allParticipantsHaveRoles = participants.every(p => p.role && p.role !== '');

  // Get available roles based on actual participant count and session type
  const getAvailableRoles = () => {
    const participantCount = participants.length;
    let baseRoles = [];
    
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

    // Filter out roles that are already taken
    return baseRoles.filter(role => !participants.some(p => p.role === role));
  };

  const availableRoles = getAvailableRoles();

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    if (onUpdateParticipantRole) {
      onUpdateParticipantRole(role);
    }
  };

  // Auto-hide role selection when all participants have roles
  useEffect(() => {
    if (allParticipantsHaveRoles) {
      setShowRoleSelection(false);
    }
  }, [allParticipantsHaveRoles]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsComplete(true);
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onComplete]);


  // Show role selection if not all participants have roles
  if (showRoleSelection && !allParticipantsHaveRoles) {
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
              Select your role for this session. Each participant needs a different role.
            </p>
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
                Role Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You are the <strong>{currentParticipant?.role === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${currentParticipant?.role}.title`)}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Waiting for other participants to select their roles...
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
                  <div className={`w-3 h-3 rounded-full ${participant.role ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {participant.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {participant.role ? (participant.role === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${participant.role}.title`)) : 'Selecting role...'}
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
                    {participant.role ? (participant.role === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${participant.role}.title`)) : 'No Role'}
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

        {/* Complete button - only for host */}
        {isHost && (
          <div className="text-center">
            <button
              onClick={() => {
                setIsComplete(true);
                onComplete();
              }}
              className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm sm:text-base font-medium"
            >
              {t('dialectic.session.helloCheckIn.complete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 