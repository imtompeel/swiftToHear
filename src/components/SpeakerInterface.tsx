import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeakingTimer } from '../hooks/useSpeakingTimer';

interface SpeakerInterfaceProps {
  topic: string;
  topicCategory?: string;
  timeRemaining: number;
  sessionDuration?: number;
  isActive: boolean;
  listenerReady?: boolean;
  dailyFrame?: any;
  groupConfig?: {
    participants: string[];
    configuration: string;
  };
  onComplete?: () => void;
  onParticipantUpdate?: (participants: any) => void;
}

export const SpeakerInterface: React.FC<SpeakerInterfaceProps> = ({
  topic,
  topicCategory,
  timeRemaining,
  sessionDuration = 15 * 60 * 1000, // Default 15 minutes
  isActive,
  listenerReady = false,
  dailyFrame,
  onParticipantUpdate
}) => {
  const { t } = useTranslation();
  
  // Use the modularised speaking timer hook
  const {
    continuousSpeakingDuration,

    shouldShowTimer,
    formatDuration
  } = useSpeakingTimer({
    isActive,
    dailyFrame,
    onParticipantUpdate
  });



  // Calculate relative timing thresholds based on session duration
  const comfortPromptThreshold = sessionDuration * 0.5; // 50% of session duration
  const pauseComfortThreshold = sessionDuration * (7/15); // 7/15 of session duration (equivalent to old 420000/900000)
  
  // Determine if we should show comfort prompts based on relative timing
  const showComfortPrompt = timeRemaining < comfortPromptThreshold;
  const showPauseComfort = timeRemaining < pauseComfortThreshold;


  return (
    <div 
      data-testid="speaker-interface"
      className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.speaker.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.speaker.mainGuidance')}
          </p>
        </div>

        {/* Topic Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          {topicCategory && (
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full mb-4">
              {topicCategory}
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {topic}
          </h2>
          
          {/* Time Remaining */}
          <div className="flex items-center justify-between">
            
            {/* Speaking Timer - only show after 35 seconds */}
            {shouldShowTimer && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t('dialectic.assistance.speaker.continuousSpeaking', { 
                    duration: formatDuration()
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Guidance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-3 rounded-xl">
          {/* Speaker Guidance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                S
              </span>
              {t('dialectic.assistance.speaker.guidance.title')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                💭
              </span>
              {t('dialectic.assistance.speaker.reminders.title')}
            </h3>
            <div className="space-y-3">
              {showComfortPrompt && (
                <div className="text-green-700 dark:text-green-400 text-sm">
                  {t('dialectic.assistance.speaker.comfortPrompt')}
                </div>
              )}
              
              {showPauseComfort && (
                <div className="text-blue-700 dark:text-blue-400 text-sm">
                  {t('dialectic.assistance.speaker.pauseComfort')}
                </div>
              )}

              {continuousSpeakingDuration > 45000 && (
                <div className="text-amber-700 dark:text-amber-400 text-sm">
                  {t('dialectic.assistance.speaker.durationPrompt')}
                </div>
              )}

              {listenerReady && (
                <div className="text-purple-700 dark:text-purple-400 text-sm">
                  {t('dialectic.assistance.speaker.listenerReady')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note: Session flow is controlled by the host via the "Complete Round" button */}
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            {t('dialectic.assistance.speaker.sessionFlowNote')}
          </div>
        </div>

        {/* Transition State */}
        {!isActive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 dark:text-gray-300">
                {t('dialectic.assistance.speaker.transitioning')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};