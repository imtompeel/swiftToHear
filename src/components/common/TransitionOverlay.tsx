import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from './LoadingSpinner';

interface TransitionOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  isVisible,
  message,
  className = ''
}) => {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 text-center mx-4">
        <LoadingSpinner size="md" color="blue" className="mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          {message || t('dialectic.assistance.speaker.transitioning')}
        </p>
      </div>
    </div>
  );
};
