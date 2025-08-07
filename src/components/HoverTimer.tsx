import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface HoverTimerProps {
  timeRemaining: number; // in milliseconds
  className?: string;
}

export const HoverTimer: React.FC<HoverTimerProps> = ({
  timeRemaining,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isAlwaysVisible, setIsAlwaysVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shouldShow = isAlwaysVisible || isHovered;

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Eye Toggle Button */}
      <button
        onClick={() => setIsAlwaysVisible(!isAlwaysVisible)}
        className={`absolute -top-2 -right-2 z-10 p-1 rounded-full transition-all duration-200 ${
          isAlwaysVisible 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
        }`}
        title={isAlwaysVisible ? 'Hide timer' : 'Always show timer'}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isAlwaysVisible ? (
            // Eye with slash (hidden)
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
            />
          ) : (
            // Eye (visible)
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          )}
        </svg>
      </button>

      {/* Timer Display */}
      {shouldShow && (
        <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-3 py-2 min-w-[80px] text-center z-20">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('dialectic.session.timeRemaining')}
          </div>
        </div>
      )}
    </div>
  );
}; 