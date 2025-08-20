import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface FreeDialoguePhaseProps {
  onEndSession: () => void;
  isHost: boolean;
  participants: any[];
}

export const FreeDialoguePhase: React.FC<FreeDialoguePhaseProps> = ({
  onEndSession,
  isHost,
  participants,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('shared.common.freeFlowingDialogue')}
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            {t('dialectic.session.freeDialogue.description')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Guidance Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
              {t('dialectic.session.freeDialogue.guidance.title')}
            </h3>
            <div className="space-y-3 text-green-800 dark:text-green-200">
              <p>• {t('dialectic.session.freeDialogue.guidance.shareInsights')}</p>
              <p>• {t('dialectic.session.freeDialogue.guidance.exploreTopics')}</p>
              <p>• {t('dialectic.session.freeDialogue.guidance.practiceListening')}</p>
              <p>• {t('dialectic.session.freeDialogue.guidance.bePresent')}</p>
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              {t('dialectic.session.freeDialogue.participants.title')}
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-blue-800 dark:text-blue-200">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Notes */}
        <div className="mt-8 bg-secondary-50 dark:bg-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.freeDialogue.notes.title')}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('dialectic.session.freeDialogue.notes.description')}
          </p>
          <textarea
            className="w-full h-32 p-4 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 resize-none"
            placeholder={t('dialectic.session.freeDialogue.notes.placeholder')}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          {isHost && (
            <button
              onClick={onEndSession}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {t('dialectic.session.freeDialogue.endSession')}
            </button>
          )}
        </div>

        {!isHost && (
          <div className="mt-8 text-center">
            <p className="text-secondary-600 dark:text-secondary-400">
              {t('dialectic.session.freeDialogue.hostControl')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

