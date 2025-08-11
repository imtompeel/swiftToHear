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
    <div data-testid="hello-checkin" className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Video Section - only show if not hidden */}
        {!hideVideo && (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-4 sm:p-6 order-2 lg:order-1">
            <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3 sm:mb-4">
              {t('dialectic.session.helloCheckIn.videoCall')}
            </h2>
            <VideoCall
              sessionId={session.sessionId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              participants={participants}
              isActive={true}
              className="h-64 sm:h-80 md:h-96"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 sm:p-8 order-1 lg:order-2">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                  {t('dialectic.session.helloCheckIn.title')}
                </h1>
                <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400">
                  {t('dialectic.session.helloCheckIn.description')}
                </p>
              </div>
              
              {/* Hover Timer */}
              <HoverTimer 
                timeRemaining={timeRemaining}
                className="mt-4 sm:mt-0 sm:ml-4"
              />
            </div>
          </div>

        {/* Participants */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3 sm:mb-4">
            {t('dialectic.session.helloCheckIn.participants')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-3 sm:p-4 flex items-center space-x-3"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-secondary-900 dark:text-secondary-100 text-sm sm:text-base truncate">
                    {participant.name}
                  </div>
                  <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 truncate">
                    {participant.role ? t(`dialectic.roles.${participant.role}.title`) : 'No Role'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            {t('dialectic.session.helloCheckIn.guidelines.title')}
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <li>• {t('dialectic.session.helloCheckIn.guidelines.introduce')}</li>
            <li>• {t('dialectic.session.helloCheckIn.guidelines.share')}</li>
            <li>• {t('dialectic.session.helloCheckIn.guidelines.listen')}</li>
            <li>• {t('dialectic.session.helloCheckIn.guidelines.respect')}</li>
          </ul>
        </div>

        {/* Complete button - only for host */}
        {isHost && (
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={() => {
                setIsComplete(true);
                onComplete();
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm sm:text-base"
            >
              {t('dialectic.session.helloCheckIn.complete')}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}; 