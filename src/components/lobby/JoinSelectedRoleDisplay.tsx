import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface JoinSelectedRoleDisplayProps {
  selectedRole: string;
  onRoleChange: () => void;
}

const JoinSelectedRoleDisplay: React.FC<JoinSelectedRoleDisplayProps> = ({
  selectedRole,
  onRoleChange
}) => {
  const { t } = useTranslation();

  if (!selectedRole) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'speaker': return '🗣️';
      case 'listener': return '👂';
      case 'scribe': return '✍️';
      case 'observer-temporary':
      case 'observer-permanent': return '👀';
      default: return '❓';
    }
  };

  const getRoleTitle = (role: string) => {
    if (role === 'observer-temporary') {
      return t('dialectic.roles.observer.temporary.title');
    } else if (role === 'observer-permanent') {
      return t('dialectic.roles.observer.permanent.title');
    }
    return t(`dialectic.roles.${role}.title`);
  };

  const getRoleDescription = (role: string) => {
    if (role === 'observer-temporary') {
      return t('dialectic.roles.observer.temporary.description');
    } else if (role === 'observer-permanent') {
      return t('dialectic.roles.observer.permanent.description');
    }
    return t(`dialectic.roles.${role}.description`);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'observer-temporary') {
      return t('dialectic.roles.observer.temporary.badge');
    } else if (role === 'observer-permanent') {
      return t('dialectic.roles.observer.permanent.badge');
    }
    return null;
  };

  return (
    <div className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-6 border-2 border-accent-200" data-testid="join-selected-role-display">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-lg">
            <span className="text-xl">{getRoleIcon(selectedRole)}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-accent-900 dark:text-accent-100">
                {getRoleTitle(selectedRole)}
              </h3>
              {getRoleBadge(selectedRole) && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedRole === 'observer-temporary' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {getRoleBadge(selectedRole)}
                </span>
              )}
            </div>
            <p className="text-sm text-accent-700 dark:text-accent-300">
              {getRoleDescription(selectedRole)}
            </p>
          </div>
        </div>
        <button
          onClick={onRoleChange}
          className="px-4 py-2 text-sm bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
        >
          Change Role
        </button>
      </div>
    </div>
  );
};

export default JoinSelectedRoleDisplay;
