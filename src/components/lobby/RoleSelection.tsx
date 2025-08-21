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

const RoleSelection: React.FC<RoleSelectionProps> = ({
  currentParticipant,
  availableRoles,
  totalParticipants,
  onRoleSelect,
  hasRole
}) => {
  const { t } = useTranslation();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <div className="space-y-4" data-testid="role-selection">
      <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
        {hasRole ? 'Change Your Role' : 'Choose Your Role'}
      </h3>
      
      {hasRole && currentParticipant?.role && (
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          Current role: <span className="font-medium text-primary-700 dark:text-primary-300">
            {currentParticipant.role === 'observer' || currentParticipant.role === 'observer-temporary' || currentParticipant.role === 'observer-permanent' ? t('shared.roles.observer') : t(`dialectic.roles.${currentParticipant.role}.title`)}
          </span>
        </div>
      )}
        
      <div className="flex flex-wrap gap-4 justify-center">
        {availableRoles.map((role) => {
          const isCurrentRole = currentParticipant?.role === role;
          const isAvailable = true; // If it's in availableRoles, it's available
          const isScribeDisabled = role === 'scribe' && totalParticipants < 3;
          
          return (
            <div
              key={role}
              className="relative group"
              onMouseEnter={() => setHoveredRole(role)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <button
                onClick={() => onRoleSelect(role)}
                disabled={!isAvailable || isScribeDisabled}
                className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  isCurrentRole 
                    ? 'border-accent-500 bg-accent-50 shadow-xl' 
                    : isAvailable && !isScribeDisabled
                      ? 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg bg-white dark:bg-secondary-800'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
                data-testid={`role-select-${role}`}
              >
                {/* Role Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isCurrentRole
                    ? 'bg-accent-500 text-white shadow-accent-500/50'
                    : isAvailable && !isScribeDisabled
                      ? 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  <span className="text-2xl">
                    {(role === 'speaker') && '🗣️'}
                    {(role === 'listener') && '👂'}
                    {(role === 'scribe') && '✍️'}
                    {(role === 'observer' || role === 'observer-temporary' || role === 'observer-permanent') && '👀'}
                  </span>
                </div>
                
                {/* Info Button */}
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredRole(hoveredRole === role ? null : role);
                  }}
                >
                  <Info className="text-sm" />
                </button>
              </button>
              
              {/* Tooltip */}
              {hoveredRole === role && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 max-w-xs">
                  <div className="font-semibold mb-1">
                    {(role === 'observer' || role === 'observer-temporary' || role === 'observer-permanent') ? t('shared.roles.observer') : t(`dialectic.roles.${role}.title`)}
                  </div>
                  <div className="text-gray-200">
                    {(role === 'observer' || role === 'observer-temporary' || role === 'observer-permanent') ? t('dialectic.roles.observer.description') : t(`dialectic.roles.${role}.description`)}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Debug info for role selection */}
      {availableRoles.length === 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          No roles available. This might be a bug. Available roles: {availableRoles.join(', ')}
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
