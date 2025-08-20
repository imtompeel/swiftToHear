import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionData } from '../types/sessionTypes';
import { FirestoreSessionService } from '../services/firestoreSessionService';

interface InPersonRoleSelectionProps {
  session: SessionData;
  currentUserId: string;
  currentUserName: string;
  onRoleSelected: (role: string) => void;
  onNameChange?: (name: string) => void;
  onReady?: () => void;
}

export const InPersonRoleSelection: React.FC<InPersonRoleSelectionProps> = ({
  session,
  currentUserId,
  currentUserName,
  onRoleSelected,
  onNameChange,
  onReady
}) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [joinError, setJoinError] = useState<string>('');
  const [nameInput, setNameInput] = useState(currentUserName);

  // Check if user is already a participant
  useEffect(() => {
    const existingParticipant = session.participants.find(p => p.id === currentUserId);
    
    if (existingParticipant) {
      setHasJoined(true);
      setSelectedRole(existingParticipant.role || '');

    }
  }, [session.participants, currentUserId]);





  const handleRoleSelect = async (role: string) => {
    if (!session || !hasJoined) return;

    try {
      // Update the participant's role
      await FirestoreSessionService.updateParticipantRole(session.sessionId, currentUserId, role);
          setSelectedRole(role);
      onRoleSelected(role);
      if (onReady) {
        onReady();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      setJoinError(t('dialectic.join.error'));
    }
  };

  // Calculate available roles based on participant count (excluding host)
  const mobileParticipants = session.participants.filter(p => p.id !== session.hostId);
  const totalParticipants = mobileParticipants.length; // Don't add +1 since we're already in the participants list
  
  // For in-person sessions, only show active roles (no permanent observer needed)
  // For 2-person sessions, only speaker and listener roles are available (no scribe)
  const baseRoles = totalParticipants === 2 ? ['speaker', 'listener'] : ['speaker', 'listener', 'scribe'];

  // Check if any observer role is taken
  const hasObserver = mobileParticipants.some(p => 
    p.role === 'observer' || p.role === 'observer-temporary' || p.role === 'observer-permanent'
  );
  
  // Get available base roles (speaker, listener, scribe)
  const availableBaseRoles = baseRoles.filter(role => !mobileParticipants.some(p => p.role && p.role === role));
  
  // Debug logging
  console.log('InPersonRoleSelection Debug:', {
    mobileParticipants: mobileParticipants.map(p => ({ id: p.id, name: p.name, role: p.role })),
    totalParticipants,
    baseRoles,
    hasObserver,
    availableBaseRoles,
    currentUserId
  });
  
  // For in-person sessions, only show temporary observer if:
  // 1. No observer exists yet, AND
  // 2. Either: 4+ participants OR all base roles are taken
  const shouldShowTemporaryObserver = !hasObserver && (totalParticipants >= 4 || availableBaseRoles.length === 0);
  
  const availableObserverRoles = shouldShowTemporaryObserver ? ['observer-temporary'] : [];
  
  const availableRoles = [
    ...availableBaseRoles,
    ...availableObserverRoles
  ];

  const roles = [
    {
      id: 'speaker',
      title: t('dialectic.roles.speaker.title'),
      description: t('dialectic.roles.speaker.description'),
      icon: '🗣️'
    },
    {
      id: 'listener',
      title: t('dialectic.roles.listener.title'),
      description: t('dialectic.roles.listener.description'),
      icon: '👂'
    },
    {
      id: 'scribe',
      title: t('dialectic.roles.scribe.title'),
      description: t('dialectic.roles.scribe.description'),
      icon: '✍️'
    },
    {
      id: 'observer-temporary',
      title: t('shared.roles.observer'),
      description: t('dialectic.roles.observer.temporary.description'),
      icon: '👀',
      badge: t('dialectic.roles.observer.temporary.badge')
    }
  ];

  // Show join form if not joined yet
  if (!hasJoined) {
    const handleJoinWithName = async () => {
      if (!nameInput || nameInput.trim() === '') return;
      
      setIsJoining(true);
      setJoinError('');

      try {
        // Update the name first
        if (onNameChange) {
          onNameChange(nameInput.trim());
        }
        
        // Join without a role first
        await FirestoreSessionService.joinSession({
          sessionId: session.sessionId,
          userId: currentUserId,
          userName: nameInput.trim(),
          role: '' // No role - will be chosen later
        });
        
        setHasJoined(true);
      } catch (error) {
        console.error('Failed to join session:', error);
        setJoinError(t('dialectic.join.error'));
      } finally {
        setIsJoining(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join Session
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {session.sessionName}
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {mobileParticipants.length} of {session.maxParticipants} participants
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Step 1:</strong> Enter your name and join the session.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinWithName()}
              />
            </div>

            <button
              onClick={handleJoinWithName}
              disabled={!nameInput || nameInput.trim() === '' || isJoining}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isJoining ? 'Joining...' : 'Join Session'}
            </button>
            
            {joinError && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {joinError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show role selection after joining
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Role
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {session.sessionName}
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {totalParticipants} participants
          </div>
        </div>

        {/* Show I'm Ready button at top if role is selected */}
        {selectedRole && (
          <div className="mb-6">
            <div className={`rounded-lg p-4 mb-4 ${
              isReady 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' 
                : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    isReady 
                      ? 'text-blue-800 dark:text-blue-200' 
                      : 'text-green-800 dark:text-green-200'
                  }`}>
                    <strong>Selected Role:</strong> {selectedRole === 'observer-temporary' ? t('shared.roles.observer') : t(`dialectic.roles.${selectedRole}.title`)}
                  </p>
                  {isReady && (
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      ✓ You're ready! Waiting for host to start the session...
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsReady(!isReady);
                    if (onReady) {
                      onReady();
                    }
                  }}
                  className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                    isReady
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                                  >
                    {isReady ? 'Waiting...' : 'I\'m Ready'}
                  </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Step 2:</strong> Choose your role for this session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((role) => {
              const isAvailable = availableRoles.includes(role.id);
              const isSelected = selectedRole === role.id;
              const isScribeDisabled = role.id === 'scribe' && totalParticipants < 3;
              const isTemporaryObserverDisabled = role.id === 'observer-temporary' && totalParticipants < 4;
              
              return (
                <button
                  key={role.id}
                  onClick={() => isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled && handleRoleSelect(role.id)}
                  disabled={!isAvailable || isScribeDisabled || isTemporaryObserverDisabled}
                  className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 flex flex-col h-full ${
                    isSelected 
                      ? 'border-accent-500 bg-accent-50 shadow-xl' 
                      : isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled
                        ? 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isSelected
                        ? 'bg-accent-500 text-white shadow-accent-500/50'
                        : isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled
                          ? 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      <span className="text-2xl">{role.icon}</span>
                    </div>
                  </div>
                  
                  {/* Badge for observer roles */}
                  {role.badge && (
                    <div className="flex justify-center mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        role.id === 'observer-temporary' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {role.badge}
                      </span>
                    </div>
                  )}
                  
                  {/* Title */}
                  <div className={`text-lg font-bold mb-2 ${
                    isSelected
                      ? 'text-gray-900'
                      : 'text-primary-900 dark:text-primary-100'
                  }`}>
                    {role.title}
                  </div>
                  
                  {/* Description */}
                  <div className={`text-sm leading-relaxed flex-grow ${
                    isSelected
                      ? 'text-gray-700'
                      : 'text-secondary-600 dark:text-secondary-400'
                  }`}>
                    {role.description}
                  </div>
                  
                  {/* Disabled reason */}
                  {!isAvailable && (
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                      {role.id === 'scribe' && totalParticipants < 3 ? 'Only available in 3+ person sessions' :
                       role.id === 'observer-temporary' && totalParticipants < 4 ? 'Only available in 4+ person sessions' :
                       t('shared.common.taken')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Show current participants and their roles */}
          {mobileParticipants.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Participants ({totalParticipants}):
              </h3>
              <div className="space-y-2">
                {mobileParticipants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {participant.name}
                      {participant.id === currentUserId && isReady && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You - Ready)</span>
                      )}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {participant.role ? (participant.role === 'observer-temporary' ? t('shared.roles.observer') : t(`dialectic.roles.${participant.role}.title`)) : 'No role selected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          

          
          {joinError && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {joinError}
            </div>
          )}
        </div>
      </div>
    </div>
  );


};
