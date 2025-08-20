import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSpeakingTimer } from '../../hooks/useSpeakingTimer';
import { SessionContext, SessionParticipant } from '../../types/sessionContext';
import { HoverTimer } from '../HoverTimer';
import { RaisedHandIndicator } from '../guidance/RaisedHandIndicator';
import { SpeakerGuidance } from '../guidance/SpeakerGuidance';
import { TransitionOverlay } from '../common/TransitionOverlay';

interface MobileSpeakerInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete?: () => void;
  timeRemaining?: number; // in milliseconds
  phaseDuration?: number; // in milliseconds
}

export const MobileSpeakerInterface: React.FC<MobileSpeakerInterfaceProps> = ({
  session,
  participants,
  timeRemaining = 0,
  phaseDuration = 0
}) => {
  const { t } = useTranslation();
  
  // Extract data from session context
  const topic = session.topic;
  const sessionDuration = session.duration * 60 * 1000; // Convert minutes to milliseconds
  const isActive = true; // Speaker interface is always active when shown
  
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <div></div> {/* Spacer */}
            {timeRemaining > 0 && (
              <HoverTimer 
                timeRemaining={timeRemaining}
                phaseDuration={phaseDuration}
                className="text-gray-600 dark:text-gray-300"
              />
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('shared.roles.speaker')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.speaker.mainGuidance')}
          </p>
        </div>

        {/* Scribe Feedback Phase Indicator */}
        {session.currentPhase === 'scribe-feedback' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg border-2 border-orange-300">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <h2 className="text-lg font-bold text-white mb-1">
                {t('dialectic.session.scribeFeedback.title')}
              </h2>
              <p className="text-orange-100 text-sm">
                {t('dialectic.session.scribeFeedback.speakerMessage', { round: session.currentRound || 1 })}
              </p>
            </div>
          </div>
        )}

        {/* Topic Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {topic}
          </h2>
          
          {/* Time Remaining */}
          <div className="flex items-center justify-between">
            {/* Speaking Timer - only show after 35 seconds */}
            {shouldShowTimer && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  {t('dialectic.assistance.speaker.continuousSpeaking', { 
                    duration: formatDuration()
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Raised Hand Indicator */}
        <RaisedHandIndicator participants={participants} showForRole="speaker" />

        {/* Guidance Cards - Stacked for mobile */}
        <div className="space-y-4 mb-4">
          <SpeakerGuidance 
            showComfortPrompt={showComfortPrompt}
            showPauseComfort={showPauseComfort}
            continuousSpeakingDuration={continuousSpeakingDuration}
          />
        </div>

        {/* Session Flow Note */}
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            {t('dialectic.assistance.speaker.sessionFlowNote')}
          </div>
        </div>

        {/* Transition State */}
        <TransitionOverlay isVisible={!isActive} />
      </div>
    </div>
  );
};
