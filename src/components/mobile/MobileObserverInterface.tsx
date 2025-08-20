import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../../types/sessionContext';
import { HoverTimer } from '../HoverTimer';
import { ObserverGuidance } from '../guidance/ObserverGuidance';

interface MobileObserverInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete?: () => void;
  timeRemaining?: number; // in milliseconds
  phaseDuration?: number; // in milliseconds
}

export const MobileObserverInterface: React.FC<MobileObserverInterfaceProps> = ({
  session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  timeRemaining = 0,
  phaseDuration = 0
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
            {t('shared.roles.observer')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.observer.mainGuidance')}
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
                {t('dialectic.session.scribeFeedback.listenerMessage', { round: session.currentRound || 1 })}
              </p>
            </div>
          </div>
        )}

        {/* Observer Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Observing Round {session.currentRound || 1}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                Learning Mode
              </span>
            </div>
          </div>
        </div>

        {/* Active Participants Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Active Participants
          </h3>
          <div className="space-y-2">
            {_participants.filter(p => p.role && p.role !== 'observer' && p.role !== 'observer-temporary' && p.role !== 'observer-permanent').map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {participant.name}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  participant.role === 'speaker' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  participant.role === 'listener' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  participant.role === 'scribe' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {participant.role === 'speaker' ? t('shared.roles.speaker') :
                   participant.role === 'listener' ? t('shared.roles.listener') :
                   participant.role === 'scribe' ? t('shared.roles.scribe') :
                   participant.role === 'observer' || participant.role === 'observer-temporary' || participant.role === 'observer-permanent' ? t('shared.roles.observer') :
                   participant.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observer Guidance */}
        <div className="space-y-4">
          <ObserverGuidance />
        </div>
      </div>
    </div>
  );
};
