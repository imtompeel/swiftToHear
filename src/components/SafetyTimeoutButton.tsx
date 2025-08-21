import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SafetyTimeoutButtonProps {
  onRequestTimeout: () => void;
  onEndTimeout: () => void;
  isTimeoutActive: boolean;
  canEndTimeout?: boolean;
  className?: string;
  onToggleVideo?: () => void; // Optional video toggle function
}

export const SafetyTimeoutButton: React.FC<SafetyTimeoutButtonProps> = ({
  onRequestTimeout,
  onEndTimeout,
  isTimeoutActive,
  canEndTimeout = false,
  className = '',
  onToggleVideo
}) => {
  const { t } = useTranslation();

  if (isTimeoutActive) {
    if (canEndTimeout) {
      return (
        <button
          onClick={onEndTimeout}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors duration-200 ${className}`}
          title={t('safety.timeout.endTooltip')}
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">
            {t('shared.actions.endTimeout')}
          </span>
        </button>
      );
    } else {
      return (
        <div className={`flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg ${className}`}>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">
            {t('shared.common.timeoutActive')}
          </span>
        </div>
      );
    }
  }

  const handleRequestTimeout = () => {
    // First toggle video off if function is provided
    if (onToggleVideo) {
      console.log('Safety timeout button: Toggling video off');
      onToggleVideo();
    }
    // Then request the timeout
    onRequestTimeout();
  };

  return (
    <button
      onClick={handleRequestTimeout}
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
