import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SpeakerGuidanceProps {
  showComfortPrompt?: boolean;
  showPauseComfort?: boolean;
  continuousSpeakingDuration?: number;
  className?: string;
}

export const SpeakerGuidance: React.FC<SpeakerGuidanceProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Speaker Guidance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            S
          </span>
          {t('dialectic.assistance.speaker.guidance.title')}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.exploreIdeas')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.whatIsAlive')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.startWrongPlace')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.embraceSilence')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.listenToYourself')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.respectBoundaries')}
          </li>
        </ul>
      </div>
    </div>
  );
};
