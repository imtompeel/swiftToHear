import React from 'react';

interface SessionControlsProps {
  sessionState: any;
  isHost: boolean;
  session: any;
  onCompleteRound: () => void;
  t: (key: string) => string;
}

export const SessionControls: React.FC<SessionControlsProps> = React.memo(({ 
  sessionState, 
  isHost, 
  session, 
  onCompleteRound, 
  t 
}) => {
  return (
    <div className="border-t border-secondary-200 dark:border-secondary-600 p-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => sessionState.setCurrentPhase('initialization')}
          className="px-4 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100"
        >
          {t('shared.actions.leaveSession')}
        </button>
        
        <div className="flex space-x-2">
          {isHost && session?.currentPhase !== 'transition' && session?.currentPhase !== 'hello-checkin' && (
            <button
              onClick={onCompleteRound}
              className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700"
            >
              {t('dialectic.session.completeRound')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

SessionControls.displayName = 'SessionControls';
