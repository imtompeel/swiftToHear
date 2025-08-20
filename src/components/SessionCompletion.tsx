import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SessionCompletionProps {
  currentRound: number;
  totalRounds: number;
  onContinueRounds: () => void;
  onStartFreeDialogue: () => void;
  onEndSession: () => void;
  isHost: boolean;
}

export const SessionCompletion: React.FC<SessionCompletionProps> = ({
  currentRound,
  totalRounds,
  onContinueRounds,
  onStartFreeDialogue,
  onEndSession,
  isHost,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.completion.title')}
          </h1>
          
          <div className="mb-6">
            <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-2">
              {t('dialectic.session.completion.completedRounds', { 
                current: currentRound, 
                total: totalRounds 
              })}
            </p>
            <div className="w-full bg-secondary-200 dark:bg-secondary-600 rounded-full h-2 mb-4">
              <div 
                className="bg-accent-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              {t('dialectic.session.completion.whatNext')}
            </p>

            {isHost && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Continue with Rounds */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('dialectic.session.completion.continueRounds.title')}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    {t('dialectic.session.completion.continueRounds.description')}
                  </p>
                  <button
                    onClick={onContinueRounds}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {t('dialectic.session.completion.continueRounds.button')}
                  </button>
                </div>

                {/* Free-flowing Dialogue */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    {t('shared.common.freeFlowingDialogue')}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    {t('dialectic.session.completion.freeDialogue.description')}
                  </p>
                  <button
                    onClick={onStartFreeDialogue}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {t('dialectic.session.completion.freeDialogue.button')}
                  </button>
                </div>

                {/* End Session */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <div className="text-4xl mb-4">🏁</div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    {t('shared.actions.endSession')}
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                    {t('dialectic.session.completion.endSession.description')}
                  </p>
                  <button
                    onClick={onEndSession}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    {t('shared.actions.endSession')}
                  </button>
                </div>
              </div>
            )}

            {!isHost && (
              <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-6">
                <p className="text-secondary-600 dark:text-secondary-400">
                  {t('dialectic.session.completion.waitingForHost')}
                </p>
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

