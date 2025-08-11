import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../types/sessionContext';

interface ReflectionPhaseProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete: () => void;
}

export const ReflectionPhase: React.FC<ReflectionPhaseProps> = ({
  session: _session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  onComplete
}) => {
  const { t } = useTranslation();

  const handleScheduleNext = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.sessionComplete')}
          </h1>
          <div data-testid="shared-debrief" className="space-y-6">
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              {t('dialectic.session.reflectionPrompt')}
            </p>
            <div className="bg-accent-50 dark:bg-accent-900 rounded-lg p-6">
              <h3 className="font-semibold text-accent-900 dark:text-accent-100 mb-4">
                What did we discover together?
              </h3>
              <div className="space-y-3 text-left">
                <p className="text-accent-800 dark:text-accent-200">• Share key insights from your practice</p>
                <p className="text-accent-800 dark:text-accent-200">• What surprised you about each role?</p>
                <p className="text-accent-800 dark:text-accent-200">• How did the listening quality change over time?</p>
              </div>
            </div>
            <div data-testid="schedule-next" className="border-t pt-6">
              <button 
                onClick={handleScheduleNext}
                className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium"
              >
                Schedule another session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};