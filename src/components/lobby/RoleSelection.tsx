import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Info } from '@mui/icons-material';

interface RoleSelectionProps {
  currentParticipant: any;
  availableRoles: string[];
  totalParticipants: number;
  onRoleSelect: (role: string) => void;
  hasRole: boolean;
}

const isObserverRole = (role: string) =>
  role === 'observer' || role === 'observer-temporary' || role === 'observer-permanent';

const roleIcon = (role: string) => {
  if (role === 'speaker') return '🗣️';
  if (role === 'listener') return '👂';
  if (role === 'scribe') return '✍️';
  if (isObserverRole(role)) return '👀';
  return '•';
};

const RoleSelection: React.FC<RoleSelectionProps> = ({
  currentParticipant,
  availableRoles,
  totalParticipants,
  onRoleSelect,
  hasRole
}) => {
  const { t } = useTranslation();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const roleTitle = (role: string) =>
    isObserverRole(role) ? t('shared.roles.observer') : t(`dialectic.roles.${role}.title`);

  const roleDescription = (role: string) =>
    isObserverRole(role) ? t('dialectic.roles.observer.description') : t(`dialectic.roles.${role}.description`);

  return (
    <div className="space-y-4" data-testid="role-selection">
      {hasRole && currentParticipant?.role && (
        <div className="text-sm text-center text-secondary-600 dark:text-secondary-400">
          {t('dialectic.session.helloCheckIn.youAreThe', {
            role: roleTitle(currentParticipant.role)
          })}
        </div>
      )}
        
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableRoles.map((role) => {
          const isCurrentRole = currentParticipant?.role === role;
          const isScribeDisabled = role === 'scribe' && totalParticipants < 3;
          const disabled = isScribeDisabled;
          const showDetails = expandedRole === role;
          
          return (
            <div key={role} className="relative">
              <button
                type="button"
                onClick={() => !disabled && onRoleSelect(role)}
                disabled={disabled}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isCurrentRole 
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 shadow-lg' 
                    : disabled
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                      : 'border-accent-200 dark:border-accent-700 bg-white dark:bg-secondary-800 hover:border-accent-400 hover:shadow-md'
                }`}
                data-testid={`role-select-${role}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center shadow-md ${
                    isCurrentRole
                      ? 'bg-accent-500 text-white'
                      : disabled
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-200'
                  }`}>
                    <span className="text-2xl" aria-hidden="true">{roleIcon(role)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-semibold text-primary-900 dark:text-primary-100"
                      data-testid={`role-select-label-${role}`}
                    >
                      {roleTitle(role)}
                    </div>
                    <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-0.5 line-clamp-2">
                      {roleDescription(role)}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="absolute top-2 right-2 w-7 h-7 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                aria-label={`${roleTitle(role)} details`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRole(showDetails ? null : role);
                }}
              >
                <Info className="text-sm" />
              </button>

              {showDetails && (
                <div className="mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                  <div className="font-semibold mb-1">{roleTitle(role)}</div>
                  <div className="text-gray-200">{roleDescription(role)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {availableRoles.length === 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          No roles available. This might be a bug. Available roles: {availableRoles.join(', ')}
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
