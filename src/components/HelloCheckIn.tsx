import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { VideoCall } from './VideoCall';
import { HoverTimer } from './HoverTimer';

import { SessionContext, SessionParticipant } from '../types/sessionContext';

interface HelloCheckInProps {
  session: SessionContext;
  participants: SessionParticipant[];
  onComplete: () => void;
  currentUserId: string;
  currentUserName: string;
  isHost?: boolean;
  hideVideo?: boolean;
}

export const HelloCheckIn: React.FC<HelloCheckInProps> = ({
  session,
  participants,
  onComplete,
  currentUserId,
  currentUserName,
  isHost = false,
  hideVideo = false
}) => {
  const { t } = useTranslation();
  const duration = 2 * 60 * 1000; // 2 minutes default
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [, setIsComplete] = useState(false);

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