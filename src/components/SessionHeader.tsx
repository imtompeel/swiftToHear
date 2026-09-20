import React from 'react';
import { SafetyTimeoutButton } from './SafetyTimeoutButton';
import { HoverTimer } from './HoverTimer';

interface SessionHeaderProps {
  sessionState: any;
  roleRotation: any;
  videoCall: any;
  currentTimeRemaining: number;
  phaseDuration: number;
  t: (key: string, params?: any) => string;
  safetyTimeout: any;
  sessionPhase?: string;
  timerChimesActive?: boolean;
}

const TimerDisplay = React.memo<{
  timeRemaining: number;
  phaseDuration: number;
  isActive: boolean;
}>(({ timeRemaining, phaseDuration, isActive }) => {
  return (
    <HoverTimer 
      timeRemaining={timeRemaining}
      phaseDuration={phaseDuration}
      isActive={isActive}
      className="text-white"
    />
  );
});

TimerDisplay.displayName = 'TimerDisplay';

export const SessionHeader: React.FC<SessionHeaderProps> = React.memo(({ 
  sessionState, 
  roleRotation, 
  videoCall, 
  currentTimeRemaining,
  phaseDuration, 
  t, 
  safetyTimeout, 
  sessionPhase,
  timerChimesActive = false,
}) => {
  return (
    <div className="bg-accent-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {t('shared.common.dialecticSession')}
          </h1>
          <p className="text-accent-100">
            {sessionState.selectedRole && ['speaker', 'listener', 'scribe', 'observer'].includes(sessionState.selectedRole) 
              ? (sessionState.selectedRole === 'observer' ? t('shared.roles.observer') : t(`dialectic.roles.${sessionState.selectedRole}.title`))
              : 'No Role Selected'
            } • {t('shared.common.roundProgress', { current: sessionState.roundNumber, total: roleRotation.getTotalRounds() })}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-4">
            {/* Safety Timeout Button */}
            <SafetyTimeoutButton
              onRequestTimeout={safetyTimeout.requestTimeout}
              onEndTimeout={safetyTimeout.endTimeout}
              isTimeoutActive={safetyTimeout.isTimeoutActive}
              canEndTimeout={safetyTimeout.canEndTimeout}
              className="text-white"
              onToggleVideo={() => videoCall.setVideoEnabled(false)}
              onMute={() => videoCall.setMuted(true)}
            />
            
            {/* Video Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {videoCall.isConnected ? 'Video Connected' : videoCall.isConnecting ? 'Connecting...' : 'Video Disconnected'}
              </span>
            </div>
            {/* Keep the listening timer mounted so an early host end can still ring the bowl. */}
            <div className={sessionPhase === 'listening' ? undefined : 'hidden'}>
              <TimerDisplay
                timeRemaining={currentTimeRemaining}
                phaseDuration={phaseDuration}
                isActive={timerChimesActive}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SessionHeader.displayName = 'SessionHeader';
