import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { HoverTimer } from './HoverTimer';
import { SessionContext, SessionParticipant } from '../types/sessionContext';

interface ScribeFeedbackProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete: () => void;
  isHost?: boolean;
  notes?: string; // Optional notes from the scribe
}

export const ScribeFeedback: React.FC<ScribeFeedbackProps> = ({
  session,
  currentUserId,
  currentUserName,
  participants,
  onComplete,
  isHost = false,
  notes
}) => {
  const { t } = useTranslation();
  const duration = 2.5 * 60 * 1000; // 2.5 minutes default
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [, setIsComplete] = useState(false);

  // Extract data from session context
  const roundNumber = session.currentRound || 1;
  const scribeName = participants.find(p => p.role === 'scribe')?.name || 'Scribe';

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
    <div data-testid="scribe-feedback" className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                  {t('dialectic.session.scribeFeedback.title')}
                </h1>
                <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400">
                  {t('dialectic.session.scribeFeedback.description', { 
                    scribe: scribeName, 
                    round: roundNumber 
                  })}
                </p>
              </div>
              
              {/* Hover Timer */}
              <HoverTimer 
                timeRemaining={timeRemaining}
                className="mt-4 sm:mt-0 sm:ml-4"
                isActive={false}
              />
            </div>
          </div>

        {/* Scribe's Notes (if available) */}
        {notes && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3 sm:mb-4">
              {t('dialectic.session.scribeFeedback.notesTitle')}
            </h2>
            <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-3 sm:p-4">
              <p className="text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap text-sm sm:text-base">
                {notes}
              </p>
            </div>
          </div>
        )}

        {/* Guidelines for Scribe */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3 sm:mb-4">
            {t('dialectic.session.scribeFeedback.guidelines.title')}
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 sm:p-6">
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <li>• {t('dialectic.session.scribeFeedback.guidelines.share')}</li>
              <li>• {t('dialectic.session.scribeFeedback.guidelines.highlight')}</li>
              <li>• {t('dialectic.session.scribeFeedback.guidelines.themes')}</li>
              <li>• {t('dialectic.session.scribeFeedback.guidelines.questions')}</li>
            </ul>
          </div>
        </div>

        {/* Guidelines for Listeners */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3 sm:mb-4">
            {t('dialectic.session.scribeFeedback.listenerGuidelines.title')}
          </h2>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 sm:p-6">
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-800 dark:text-green-200">
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.listen')}</li>
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.reflect')}</li>
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.ask')}</li>
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.respect')}</li>
            </ul>
          </div>
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
              {t('dialectic.session.scribeFeedback.complete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 