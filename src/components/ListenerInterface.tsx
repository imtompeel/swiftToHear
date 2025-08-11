import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../types/sessionContext';
import { ListenerGuidance } from './guidance/ListenerGuidance';
import { ListenerInteractions } from './guidance/ListenerInteractions';
import { ReflectionStarters } from './common/ReflectionStarters';

interface ListenerInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  videoCall: any;
  onComplete?: () => void;
}

export const ListenerInterface: React.FC<ListenerInterfaceProps> = ({
  session: _session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  videoCall: _videoCall,
  onComplete
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
    <div 
      data-testid="listener-interface"
      className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.listener.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.listener.mainGuidance')}
          </p>
        </div>

        {/* Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${speakerActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {speakerActive ? 'Speaker is active' : 'Waiting for speaker'}
              </span>
            </div>
            
            {readyToReflect && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400">
                  Ready to reflect
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ListenerGuidance className="md:col-span-2" />
        </div>

        {/* Listener Interactions */}
        <div className="mb-6 sm:mb-8">
          <ListenerInteractions 
            sessionId={_session.sessionId}
            currentUserId={_currentUserId}
            className="md:col-span-2"
          />
        </div>

        {/* Reflection Section - show when ready to reflect */}
        {readyToReflect && (
          <ReflectionStarters 
            onStartReflection={handleStartReflection}
            onKeyDown={handleKeyDown}
            className="mb-4 sm:mb-6"
          />
        )}
      </div>
    </div>
  );
};