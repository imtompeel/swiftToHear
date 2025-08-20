import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface MobileDialogosInterfaceProps {
  // Add any props if needed in the future
}

export const MobileDialogosInterface: React.FC<MobileDialogosInterfaceProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">💬</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">
            {t('dialectic.session.currentPhase.freeDialogue')}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
            <p className="text-green-800 dark:text-green-200 text-lg font-medium">
              {t('dialectic.session.dialogos.welcome')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {t('dialectic.session.dialogos.description')}
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.session.dialogos.benefits.shareInsights')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.session.dialogos.benefits.exploreTopics')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.session.dialogos.benefits.deepListening')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.session.dialogos.benefits.openConversation')}
              </li>
            </ul>
            <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>{t('dialectic.session.dialogos.noRestrictions')}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
