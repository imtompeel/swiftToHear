import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { GroupConfiguration as GroupConfigType } from '../../types/groupSession';

interface GroupConfigurationProps {
  groupConfiguration: GroupConfigType;
  onGroupConfigurationChange: (config: GroupConfigType) => void;
}

const GroupConfiguration: React.FC<GroupConfigurationProps> = ({
  groupConfiguration,
  onGroupConfigurationChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">

      {/* Auto-assign Roles */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
            {t('dialectic.creation.groupConfig.autoAssign.label')}
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6">
            {t('dialectic.creation.groupConfig.autoAssign.description')}
          </p>
        </div>
        
        <div className="flex justify-center">
          <label className="flex flex-col items-center space-y-4 p-6 border-2 border-secondary-200 rounded-xl hover:border-secondary-300 transition-all cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={groupConfiguration.autoAssignRoles}
                onChange={(e) => onGroupConfigurationChange({ 
                  ...groupConfiguration, 
                  autoAssignRoles: e.target.checked 
                })}
                className="sr-only"
              />
              <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                groupConfiguration.autoAssignRoles
                  ? 'bg-accent-500 border-accent-500 shadow-lg'
                  : 'bg-white border-secondary-300 hover:border-secondary-400'
              }`}>
                {groupConfiguration.autoAssignRoles && (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${
                groupConfiguration.autoAssignRoles
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-secondary-700 dark:text-secondary-300'
              }`}>
                {groupConfiguration.autoAssignRoles ? 'Enabled' : 'Disabled'}
              </div>

            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GroupConfiguration;
