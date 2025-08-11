import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SpeakerGuidanceProps {
  showComfortPrompt?: boolean;
  showPauseComfort?: boolean;
  continuousSpeakingDuration?: number;
  className?: string;
}

export const SpeakerGuidance: React.FC<SpeakerGuidanceProps> = ({
  showComfortPrompt = false,
  showPauseComfort = false,
  continuousSpeakingDuration = 0,
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
            {t('dialectic.assistance.speaker.guidance.speakSlowly')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.pauseBetween')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.allowSpace')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {t('dialectic.assistance.speaker.guidance.shareGenuine')}
          </li>
        </ul>
      </div>

      {/* Comfort Prompts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            💭
          </span>
          {t('dialectic.assistance.speaker.reminders.title')}
        </h3>
        <div className="space-y-2">
          {showComfortPrompt && (
            <div className="text-green-700 dark:text-green-400 text-xs">
              {t('dialectic.assistance.speaker.comfortPrompt')}
            </div>
          )}
          
          {showPauseComfort && (
            <div className="text-blue-700 dark:text-blue-400 text-xs">
              {t('dialectic.assistance.speaker.pauseComfort')}
            </div>
          )}

          {continuousSpeakingDuration > 45000 && (
            <div className="text-amber-700 dark:text-amber-400 text-xs">
              {t('dialectic.assistance.speaker.durationPrompt')}
            </div>
          )}

          {/* Listener ready status would be determined from participants */}
          <div className="text-purple-700 dark:text-purple-400 text-xs">
            {t('dialectic.assistance.speaker.listenerReady')}
          </div>
        </div>
      </div>
    </div>
  );
};
