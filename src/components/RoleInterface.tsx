import React from 'react';
import { SpeakerInterface } from './SpeakerInterface';
import { ListenerInterface } from './ListenerInterface';
import { ScribeInterface } from './ScribeInterface';
import { PassiveObserverInterface } from './PassiveObserverInterface';

interface RoleInterfaceProps {
  sessionState: any;
  sessionContext: any;
  currentUser: any;
  session: any;
  videoCall: any;
  onNotesChange: (notes: string) => void;
  initialNotes: string;
  roundNumber: number;
}

export const RoleInterface: React.FC<RoleInterfaceProps> = React.memo(({ 
  sessionState, 
  sessionContext, 
  currentUser, 
  session, 
  videoCall, 
  onNotesChange, 
  initialNotes, 
  roundNumber 
}) => {
  if (sessionState.selectedRole === 'speaker') {
    return (
      <SpeakerInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
      />
    );
  }

  if (sessionState.selectedRole === 'listener') {
    return (
      <ListenerInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
      />
    );
  }

  if (sessionState.selectedRole === 'scribe' && session?.participants?.length > 2) {
    return (
      <ScribeInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
        onNotesChange={onNotesChange}
        initialNotes={initialNotes}
        roundNumber={roundNumber}
      />
    );
  }

  // Fallback for scribe role in 2-person sessions
  if (sessionState.selectedRole === 'scribe' && session?.participants?.length <= 2) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Scribe Role Not Available
        </h3>
        <p className="text-blue-700 dark:text-blue-200 mb-4">
          The scribe role is not available in 2-person sessions. You should be assigned either Speaker or Listener role.
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Please contact the host if you believe this is an error.
        </p>
      </div>
    );
  }

  if (sessionState.selectedRole === 'observer' || sessionState.selectedRole === 'observer-temporary' || sessionState.selectedRole === 'observer-permanent') {
    return (
      <PassiveObserverInterface
        session={sessionContext}
        currentUserId={currentUser?.id || ''}
        currentUserName={currentUser?.name || 'Unknown'}
        participants={session?.participants || []}
        videoCall={videoCall}
      />
    );
  }

  // Fallback for participants without roles
  return (
    <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
        Waiting for Role Assignment
      </h3>
      <p className="text-secondary-600 dark:text-secondary-400 mb-4">
        You are currently in the session but don't have a role assigned yet. 
        The host will assign roles or you can select one from the available options.
      </p>
      <div className="space-y-2">
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Current participants:
        </p>
        {session?.participants.map((participant: any) => (
          <div key={participant.id} className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-secondary-700 dark:text-secondary-300">
              {participant.name}
            </span>
            <span className="text-secondary-500 dark:text-secondary-400">
              ({participant.role || 'No role'})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

RoleInterface.displayName = 'RoleInterface';
