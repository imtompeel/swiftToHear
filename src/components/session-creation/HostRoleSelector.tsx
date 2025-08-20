import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface HostRoleSelectorProps {
  hostRole: 'participant' | 'observer-permanent';
  onHostRoleChange: (role: 'participant' | 'observer-permanent') => void;
}

const HostRoleSelector: React.FC<HostRoleSelectorProps> = ({
  hostRole,
  onHostRoleChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Participant Option */}
        <button
          onClick={() => onHostRoleChange('participant')}
          className={`p-8 rounded-xl border-2 text-center transition-all hover:scale-105 ${
            hostRole === 'participant'
              ? 'border-accent-500 bg-accent-50 shadow-xl'
              : 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
          }`}
          data-testid="host-role-participant"
        >
          {/* Large Icon Container */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              hostRole === 'participant'
                ? 'bg-accent-500 text-white shadow-accent-500/50'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}>
              <span className="text-3xl">👥</span>
            </div>
          </div>
          
          {/* Title */}
          <div className={`text-xl font-bold mb-2 ${
            hostRole === 'participant'
              ? 'text-gray-900'
              : 'text-primary-900 dark:text-primary-100'
          }`}>
            {t('dialectic.creation.hostRole.participant.title')}
          </div>
          
          {/* Badge */}
          <div className="text-xs text-accent-600 dark:text-accent-400 mb-3">
            {t('shared.roles.participant')}
          </div>
          
          {/* Description */}
          <div className={`text-sm leading-relaxed ${
            hostRole === 'participant'
              ? 'text-gray-700'
              : 'text-secondary-600 dark:text-secondary-400'
          }`}>
            {t('dialectic.creation.hostRole.participant.description')}
          </div>
        </button>

        {/* Permanent Observer Option */}
        <button
          onClick={() => onHostRoleChange('observer-permanent')}
          className={`p-8 rounded-xl border-2 text-center transition-all hover:scale-105 ${
            hostRole === 'observer-permanent'
              ? 'border-accent-500 bg-accent-50 shadow-xl'
              : 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
          }`}
          data-testid="host-role-observer"
        >
          {/* Large Icon Container */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              hostRole === 'observer-permanent'
                ? 'bg-accent-500 text-white shadow-accent-500/50'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}>
              <span className="text-3xl">👀</span>
            </div>
          </div>
          
          {/* Title */}
          <div className={`text-xl font-bold mb-2 ${
            hostRole === 'observer-permanent'
              ? 'text-gray-900'
              : 'text-primary-900 dark:text-primary-100'
          }`}>
            {t('shared.common.permanentObserver')}
          </div>
          
          {/* Badge */}
          <div className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-3">
            {t('shared.roles.observer')}
          </div>
          
          {/* Description */}
          <div className={`text-sm leading-relaxed ${
            hostRole === 'observer-permanent'
              ? 'text-gray-700'
              : 'text-secondary-600 dark:text-secondary-400'
          }`}>
            {t('dialectic.creation.hostRole.observer.description')}
          </div>
        </button>
      </div>
    </div>
  );
};

export default HostRoleSelector;
