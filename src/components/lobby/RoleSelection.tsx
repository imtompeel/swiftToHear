import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleSelectionProps {
  currentParticipant: any;
  availableRoles: string[];
  totalParticipants: number;
  onRoleSelect: (role: string) => void;
  hasRole: boolean;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({
  currentParticipant,
  availableRoles,
  totalParticipants,
  onRoleSelect,
  hasRole
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4" data-testid="role-selection">
      <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
        {hasRole ? 'Change Your Role' : 'Choose Your Role'}
      </h3>
      
      {hasRole && currentParticipant?.role && (
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          Current role: <span className="font-medium text-primary-700 dark:text-primary-300">
            {t(`dialectic.roles.${currentParticipant.role}.title`)}
          </span>
        </div>
      )}
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['speaker', 'listener', 'scribe', 'observer'].map((role) => {
          const isCurrentRole = currentParticipant?.role === role;
          const isAvailable = availableRoles.includes(role);
          const isScribeDisabled = role === 'scribe' && totalParticipants < 3;
          
          return (
            <button
              key={role}
              onClick={() => onRoleSelect(role)}
              disabled={!isAvailable || isScribeDisabled}
              className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 flex flex-col h-full ${
                isCurrentRole 
                  ? 'border-accent-500 bg-accent-50 shadow-xl' 
                  : isAvailable && !isScribeDisabled
                    ? 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
              }`}
              data-testid={`role-select-${role}`}
            >
              {/* Large Icon Container - Fixed height */}
              <div className="flex justify-center mb-4 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isCurrentRole
                    ? 'bg-accent-500 text-white shadow-accent-500/50'
                    : isAvailable && !isScribeDisabled
                      ? 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  <span className="text-3xl">
                    {role === 'speaker' && '🗣️'}
                    {role === 'listener' && '👂'}
                    {role === 'scribe' && '✍️'}
                    {role === 'observer' && '👀'}
                  </span>
                </div>
              </div>
              
              {/* Role Title - Fixed height */}
              <div className={`text-lg font-bold mb-2 flex-shrink-0 ${
                isCurrentRole
                  ? 'text-gray-900'
                  : 'text-primary-900 dark:text-primary-100'
              }`}>
                {t(`dialectic.roles.${role}.title`)}
              </div>
              
              {/* Role Description - Flexible height */}
              <div className={`text-sm leading-relaxed flex-grow ${
                isCurrentRole
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t(`dialectic.roles.${role}.description`)}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Debug info for role selection */}
      {availableRoles.length === 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          No roles available. This might be a bug. Available roles: {['speaker', 'listener', 'scribe', 'observer'].join(', ')}
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
