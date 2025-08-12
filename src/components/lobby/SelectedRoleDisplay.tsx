import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SelectedRoleDisplayProps {
  currentParticipant: any;
  onRoleChange: () => void;
}

const SelectedRoleDisplay: React.FC<SelectedRoleDisplayProps> = ({
  currentParticipant,
  onRoleChange
}) => {
  const { t } = useTranslation();

  if (!currentParticipant?.role) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'speaker': return '🗣️';
      case 'listener': return '👂';
      case 'scribe': return '✍️';
      case 'observer': return '👀';
      default: return '❓';
    }
  };

  return (
    <div className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-6 border-2 border-accent-200" data-testid="selected-role-display">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-lg">
            <span className="text-xl">{getRoleIcon(currentParticipant.role)}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-accent-900 dark:text-accent-100">
              {t(`dialectic.roles.${currentParticipant.role}.title`)}
            </h3>
            <p className="text-sm text-accent-700 dark:text-accent-300">
              {t(`dialectic.roles.${currentParticipant.role}.description`)}
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

export default SelectedRoleDisplay;
