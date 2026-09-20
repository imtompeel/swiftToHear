import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const AuthDivider: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3" role="separator" aria-label={t('auth.google.or')}>
      <div className="flex-1 border-t border-secondary-200 dark:border-secondary-700" />
      <span className="text-sm text-secondary-500 dark:text-secondary-400">
        {t('auth.google.or')}
      </span>
      <div className="flex-1 border-t border-secondary-200 dark:border-secondary-700" />
    </div>
  );
};

export { AuthDivider };
