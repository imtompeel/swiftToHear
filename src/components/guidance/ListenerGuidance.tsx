import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ListenerGuidanceProps {
  className?: string;
}

export const ListenerGuidance: React.FC<ListenerGuidanceProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Listener Guidance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            L
          </span>
          {t('dialectic.assistance.listener.guidance.title')}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            {t('dialectic.assistance.listener.guidance.fullPresence')}
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            {t('dialectic.assistance.listener.guidance.noticeImpulse')}
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            {t('dialectic.assistance.listener.guidance.reflectBack')}
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            {t('dialectic.assistance.listener.guidance.notMemoryTest')}
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            {t('dialectic.assistance.listener.guidance.interruptIfNeeded')}
          </li>
        </ul>
      </div>
    </div>
  );
};
