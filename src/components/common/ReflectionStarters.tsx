import React from 'react';
import { useTranslation } from 'react-i18next';

interface ReflectionStartersProps {
  onStartReflection: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  className?: string;
}

export const ReflectionStarters: React.FC<ReflectionStartersProps> = ({
  onStartReflection,
  onKeyDown,
  className = ''
}) => {
  const { t } = useTranslation();

  const reflectionStarters = [
    "What I heard you say was...",
    "It sounds like you're feeling...",
    "What I'm understanding is...",
    "You seem to be saying that...",
    "I'm hearing that..."
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4 ${className}`}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 text-center">
        {t('dialectic.assistance.listener.reflectionStarters.title')}
      </h2>
      
      <div className="space-y-3 mb-4">
        {reflectionStarters.map((starter, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {starter}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button 
          data-testid="start-reflection"
          onClick={onStartReflection}
          onKeyDown={onKeyDown}
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 text-sm"
        >
          {t('dialectic.assistance.listener.startReflection')}
        </button>
      </div>
    </div>
  );
};
