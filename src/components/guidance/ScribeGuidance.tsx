import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ScribeGuidanceProps {
  className?: string;
}

export const ScribeGuidance: React.FC<ScribeGuidanceProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Left Column */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            S
          </span>
          {t('dialectic.assistance.scribe.guidance.title')}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.scribe.guidance.listenCarefully')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.scribe.guidance.captureKey')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.scribe.guidance.noteThemes')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.scribe.guidance.recordQuestions')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {t('dialectic.assistance.scribe.guidance.notesWillBePassed')}
            </span>
          </li>
        </ul>
      </div>

      {/* Right Column */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            💭
          </span>
          {t('dialectic.assistance.scribe.tools.title')}
        </h3>
        <div className="space-y-2">
          <div className="text-indigo-700 dark:text-indigo-400 text-xs">
            {t('dialectic.assistance.scribe.tools.realTime')}
          </div>
          
          <div className="text-purple-700 dark:text-purple-400 text-xs">
            {t('dialectic.assistance.scribe.tools.focusOn')}
          </div>

          <div className="text-blue-700 dark:text-blue-400 text-xs">
            {t('dialectic.assistance.scribe.tools.avoidInterrupting')}
          </div>

          <div className="text-green-700 dark:text-green-400 text-xs">
            {t('dialectic.assistance.scribe.tools.readyToShare')}
          </div>
        </div>
      </div>
    </div>
  );
};
