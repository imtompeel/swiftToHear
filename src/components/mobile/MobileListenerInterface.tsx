import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../../types/sessionContext';
import { HoverTimer } from '../HoverTimer';

import { ListenerGuidance } from '../guidance/ListenerGuidance';
import { ListenerInteractions } from '../guidance/ListenerInteractions';
import { ReflectionStarters } from '../common/ReflectionStarters';

interface MobileListenerInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete?: () => void;
  timeRemaining?: number; // in milliseconds
  phaseDuration?: number; // in milliseconds
}

export const MobileListenerInterface: React.FC<MobileListenerInterfaceProps> = ({
  session: _session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  onComplete,
  timeRemaining = 0,
  phaseDuration = 0
}) => {
  const { t } = useTranslation();
  const [, setReflectionActive] = React.useState(false);

  // Extract data from session context
  const speakerActive = true; // This would be determined from session state
  const readyToReflect = false; // This would be determined from session state

  const handleStartReflection = () => {
    setReflectionActive(true);
    if (onComplete) {
      onComplete();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleStartReflection();
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
            {t('shared.roles.listener')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.listener.mainGuidance')}
          </p>
        </div>

        {/* Scribe Feedback Phase Indicator */}
        {_session.currentPhase === 'scribe-feedback' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg border-2 border-orange-300">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <h2 className="text-lg font-bold text-white mb-1">
                {t('dialectic.session.scribeFeedback.title')}
              </h2>
              <p className="text-orange-100 text-sm">
                {t('dialectic.session.scribeFeedback.listenerMessage', { round: _session.currentRound || 1 })}
              </p>
            </div>
          </div>
        )}

        {/* Listener Round Transition Guidance - Show during scribe feedback, but not on the last round */}
        {_session.currentPhase === 'scribe-feedback' && (() => {
          // Calculate max rounds based on participants with roles (excluding observers)
          const roleParticipants = _participants.filter(p => p.role && p.role !== 'observer');
          const maxRounds = roleParticipants.length;
          const currentRound = _session.currentRound || 1;
          const isLastRound = currentRound >= maxRounds;
          
          return !isLastRound ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                  L
                </span>
                {t('dialectic.assistance.listener.roundTransition.title')}
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {t('dialectic.assistance.listener.roundTransition.guidance')}
              </div>
            </div>
          ) : null;
        })()}

        {/* Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${speakerActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {speakerActive ? 'Speaker is active' : 'Waiting for speaker'}
              </span>
            </div>
            
            {readyToReflect && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  Ready to reflect
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Guidance Cards - Stacked for mobile */}
        <div className="space-y-4 mb-6">
          <ListenerGuidance />
          <ListenerInteractions 
            sessionId={_session.sessionId}
            currentUserId={_currentUserId}
          />
        </div>

        {/* Reflection Section - show when ready to reflect */}
        {readyToReflect && (
          <ReflectionStarters 
            onStartReflection={handleStartReflection}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
    </div>
  );
};
