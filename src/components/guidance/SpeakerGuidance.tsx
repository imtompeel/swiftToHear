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

  // Convert milliseconds to seconds for easier comparison
  const speakingSeconds = Math.floor(continuousSpeakingDuration / 1000);
  
  // Show different guidance based on speaking duration
  const showLongSpeakingGuidance = speakingSeconds > 60; // After 1 minute
  const showExtendedGuidance = speakingSeconds > 120; // After 2 minutes

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
        
        {/* Conditional comfort prompts */}
        {showComfortPrompt && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              {t('dialectic.assistance.speaker.durationPrompt')}
            </p>
          </div>
        )}
        
        {showPauseComfort && (
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              {t('dialectic.assistance.speaker.pauseComfort')}
            </p>
          </div>
        )}

        {/* Long speaking duration guidance */}
        {showLongSpeakingGuidance && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              You've been speaking for {Math.floor(speakingSeconds / 60)}m {speakingSeconds % 60}s. Consider pausing to let the listener reflect.
            </p>
          </div>
        )}

        {/* Extended speaking guidance */}
        {showExtendedGuidance && (
          <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
              You've been speaking for an extended time. This might be a good moment to pause and allow the listener to share their reflections.
            </p>
          </div>
        )}
        
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
