import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ObserverGuidanceProps {
  className?: string;
}

export const ObserverGuidance: React.FC<ObserverGuidanceProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Observer Guidance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            O
          </span>
          {t('dialectic.assistance.observer.guidance.title')}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.observer.guidance.noticeDynamics')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.observer.guidance.observeRoles')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.observer.guidance.identifyPatterns')}
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            {t('dialectic.assistance.observer.guidance.learnProcess')}
          </li>
        </ul>
      </div>

      {/* Learning Focus */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            🎯
          </span>
          {t('dialectic.assistance.observer.learningFocus.title')}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            {t('dialectic.assistance.observer.learningFocus.groupFacilitation')}
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            {t('dialectic.assistance.observer.learningFocus.communicationPatterns')}
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            {t('dialectic.assistance.observer.learningFocus.beforeParticipation')}
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            {t('dialectic.assistance.observer.learningFocus.culturalAccommodation')}
          </li>
        </ul>
      </div>


    </div>
  );
};
