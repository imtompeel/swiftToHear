import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SafetyTimeoutButtonProps {
  onRequestTimeout: () => void;
  isTimeoutActive: boolean;
  className?: string;
}

export const SafetyTimeoutButton: React.FC<SafetyTimeoutButtonProps> = ({
  onRequestTimeout,
  isTimeoutActive,
  className = ''
}) => {
  const { t } = useTranslation();

  if (isTimeoutActive) {
    return (
      <div className={`flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg ${className}`}>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
          {t('safety.timeout.active')}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onRequestTimeout}
      className={`flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 ${className}`}
      title={t('safety.timeout.requestTooltip')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="text-sm font-medium">
        {t('safety.timeout.button')}
      </span>
    </button>
  );
};
