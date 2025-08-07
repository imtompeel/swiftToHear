import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { VideoCall } from './VideoCall';
import { HoverTimer } from './HoverTimer';

interface ScribeFeedbackProps {
  scribeName: string;
  roundNumber: number;
  onComplete: () => void;
  duration: number; // in milliseconds
  notes?: string; // Optional notes from the scribe
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    status: 'ready' | 'not-ready' | 'connecting';
  }>;
  isHost?: boolean;
  hideVideo?: boolean;
}

export const ScribeFeedback: React.FC<ScribeFeedbackProps> = ({
  scribeName,
  roundNumber,
  onComplete,
  duration = 2.5 * 60 * 1000, // 2.5 minutes default
  notes,
  sessionId,
  currentUserId,
  currentUserName,
  participants,
  isHost = false,
  hideVideo = false
}) => {
  const { t } = useTranslation();
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
    <div data-testid="scribe-feedback" className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Video Section - only show if not hidden */}
        {!hideVideo && (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              {t('dialectic.session.scribeFeedback.videoCall')}
            </h2>
            <VideoCall
              sessionId={sessionId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              participants={participants}
              isActive={true}
              className="h-96"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                  {t('dialectic.session.scribeFeedback.title')}
                </h1>
                <p className="text-lg text-secondary-600 dark:text-secondary-400">
                  {t('dialectic.session.scribeFeedback.description', { 
                    scribe: scribeName, 
                    round: roundNumber 
                  })}
                </p>
              </div>
              
              {/* Hover Timer */}
              <HoverTimer 
                timeRemaining={timeRemaining}
                className="ml-4"
              />
            </div>
          </div>

        {/* Scribe's Notes (if available) */}
        {notes && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              {t('dialectic.session.scribeFeedback.notesTitle')}
            </h2>
            <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4">
              <p className="text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          </div>
        )}

        {/* Guidelines for Scribe */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.scribeFeedback.guidelines.title')}
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
            <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <li>• {t('dialectic.session.scribeFeedback.guidelines.share')}</li>
              <li>• {t('dialectic.session.scribeFeedback.guidelines.highlight')}</li>
              <li>• {t('dialectic.session.scribeFeedback.guidelines.themes')}</li>
              <li>• {t('dialectic.session.scribeFeedback.guidelines.questions')}</li>
            </ul>
          </div>
        </div>

        {/* Guidelines for Listeners */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.scribeFeedback.listenerGuidelines.title')}
          </h2>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
            <ul className="space-y-3 text-sm text-green-800 dark:text-green-200">
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.listen')}</li>
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.reflect')}</li>
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.ask')}</li>
              <li>• {t('dialectic.session.scribeFeedback.listenerGuidelines.respect')}</li>
            </ul>
          </div>
        </div>

        {/* Complete button - only for host */}
        {isHost && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setIsComplete(true);
                onComplete();
              }}
              className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              {t('dialectic.session.scribeFeedback.complete')}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}; 