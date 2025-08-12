import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface JoinRoleSelectionProps {
  availableRoles: string[];
  totalParticipants: number;
  onRoleSelect: (role: string) => void;
  selectedRole: string;
}

const JoinRoleSelection: React.FC<JoinRoleSelectionProps> = ({
  availableRoles,
  totalParticipants,
  onRoleSelect,
  selectedRole
}) => {
  const { t } = useTranslation();

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
      title: 'Observer',
      description: t('dialectic.roles.observer.temporary.description'),
      icon: '👀',
      badge: t('dialectic.roles.observer.temporary.badge')
    },
    {
      id: 'observer-permanent',
      title: 'Observer',
      description: t('dialectic.roles.observer.permanent.description'),
      icon: '👀',
      badge: t('dialectic.roles.observer.permanent.badge')
    }
  ];

  return (
    <div className="space-y-4" data-testid="join-role-selection">
      <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
        {t('dialectic.join.chooseRole')}
      </h3>
      
      {availableRoles.length === 1 && (availableRoles[0] === 'observer-temporary' || availableRoles[0] === 'observer-permanent') && (
        <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-100">
            {t('dialectic.join.onlyObserverAvailable')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {roles.map((role) => {
          const isAvailable = availableRoles.includes(role.id);
          const isSelected = selectedRole === role.id;
          const isScribeDisabled = role.id === 'scribe' && totalParticipants < 3;
          const isTemporaryObserverDisabled = role.id === 'observer-temporary' && totalParticipants < 4;
          const isPermanentObserverDisabled = role.id === 'observer-permanent' && totalParticipants < 3;
          
          return (
            <button
              key={role.id}
              onClick={() => isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled && !isPermanentObserverDisabled && onRoleSelect(role.id)}
              disabled={!isAvailable || isScribeDisabled || isTemporaryObserverDisabled || isPermanentObserverDisabled}
              className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 flex flex-col h-full ${
                isSelected 
                  ? 'border-accent-500 bg-accent-50 shadow-xl' 
                  : isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled && !isPermanentObserverDisabled
                    ? 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
              }`}
              data-testid={`role-${role.id}`}
            >
              {/* Large Icon Container - Fixed height */}
              <div className="flex justify-center mb-4 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isSelected
                    ? 'bg-accent-500 text-white shadow-accent-500/50'
                    : isAvailable && !isScribeDisabled && !isTemporaryObserverDisabled && !isPermanentObserverDisabled
                      ? 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  <span className="text-3xl">{role.icon}</span>
                </div>
              </div>
              
              {/* Badge for observer roles - Fixed height */}
              <div className="flex justify-center mb-2 flex-shrink-0" style={{ minHeight: role.badge ? '24px' : '0px' }}>
                {role.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    role.id === 'observer-temporary' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {role.badge}
                  </span>
                )}
              </div>
              
              {/* Role Title - Fixed height */}
              <div className={`text-lg font-bold mb-2 flex-shrink-0 ${
                isSelected
                  ? 'text-gray-900'
                  : 'text-primary-900 dark:text-primary-100'
              }`}>
                {role.title}
              </div>
              
              {/* Role Description - Flexible height */}
              <div className={`text-sm leading-relaxed flex-grow ${
                isSelected
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {role.description}
              </div>
              
              {/* Disabled reason - Fixed height */}
              {!isAvailable && (
                <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-2 flex-shrink-0">
                  {role.id === 'scribe' && totalParticipants < 3 ? 'Only available in 3+ person sessions' :
                   role.id === 'observer-temporary' && totalParticipants < 4 ? 'Only available in 4+ person sessions' :
                   role.id === 'observer-permanent' && totalParticipants < 3 ? 'Only available in 3+ person sessions' :
                   t('dialectic.join.roleTaken')}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Debug info for role selection */}
      {availableRoles.length === 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          No roles available. This might be a bug. Available roles: {['speaker', 'listener', 'scribe', 'observer-temporary', 'observer-permanent'].join(', ')}
        </div>
      )}
    </div>
  );
};

export default JoinRoleSelection;
