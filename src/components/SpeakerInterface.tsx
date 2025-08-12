import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeakingTimer } from '../hooks/useSpeakingTimer';
import { SessionContext, SessionParticipant } from '../types/sessionContext';
import { SpeakerGuidance } from './guidance/SpeakerGuidance';
import { RaisedHandIndicator } from './guidance/RaisedHandIndicator';
import { TransitionOverlay } from './common/TransitionOverlay';

interface SpeakerInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  videoCall: any;
  onComplete?: () => void;
}

export const SpeakerInterface: React.FC<SpeakerInterfaceProps> = ({
  session,
  participants,
}) => {
  const { t } = useTranslation();
  
  // Extract data from session context
  const topic = session.topic;
  const sessionDuration = session.duration * 60 * 1000; // Convert minutes to milliseconds
  const isActive = true; // Speaker interface is always active when shown
  const timeRemaining = sessionDuration; // This would need to be calculated based on actual time
  
  // Use the modularised speaking timer hook
  const {
    continuousSpeakingDuration,
    shouldShowTimer,
    formatDuration
  } = useSpeakingTimer({
    isActive,
    dailyFrame: null,
    onParticipantUpdate: () => {}
  });

  // Calculate relative timing thresholds based on session duration
  const comfortPromptThreshold = sessionDuration * 0.5; // 50% of session duration
  const pauseComfortThreshold = sessionDuration * (7/15); // 7/15 of session duration
  
  // Determine if we should show comfort prompts based on relative timing
  const showComfortPrompt = timeRemaining < comfortPromptThreshold;
  const showPauseComfort = timeRemaining < pauseComfortThreshold;


  return (
    <div 
      data-testid="speaker-interface"
      className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 rounded-xl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('shared.roles.speaker')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.speaker.mainGuidance')}
          </p>
        </div>

        {/* Topic Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {topic}
          </h2>
          
          {/* Time Remaining */}
          <div className="flex items-center justify-between">
            
            {/* Speaking Timer - only show after 35 seconds */}
            {shouldShowTimer && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">
                  {t('dialectic.assistance.speaker.continuousSpeaking', { 
                    duration: formatDuration()
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Raised Hand Indicator */}
        <RaisedHandIndicator participants={participants} />

        {/* Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-3 rounded-xl">
          <SpeakerGuidance 
            showComfortPrompt={showComfortPrompt}
            showPauseComfort={showPauseComfort}
            continuousSpeakingDuration={continuousSpeakingDuration}
            className="md:col-span-2"
          />
        </div>

        {/* Note: Session flow is controlled by the host via the "Complete Round" button */}
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
            {t('dialectic.assistance.speaker.sessionFlowNote')}
          </div>
        </div>

        {/* Transition State */}
        <TransitionOverlay isVisible={!isActive} />
      </div>
    </div>
  );
};