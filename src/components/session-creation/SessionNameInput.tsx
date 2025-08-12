import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionNameInputProps {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
}

const SessionNameInput: React.FC<SessionNameInputProps> = ({
  sessionName,
  onSessionNameChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">

      <input
        type="text"
        value={sessionName}
        onChange={(e) => onSessionNameChange(e.target.value)}
        placeholder={t('dialectic.creation.sessionName.placeholder')}
        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
        data-testid="session-name-input"
      />

      {!sessionName.trim() && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          {t('dialectic.creation.sessionName.required')}
        </div>
      )}
    </div>
  );
};

export default SessionNameInput;
