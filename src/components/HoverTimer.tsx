import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface HoverTimerProps {
  timeRemaining: number; // in milliseconds
  phaseDuration?: number; // in milliseconds - for calculating color percentages
  className?: string;
}

export const HoverTimer: React.FC<HoverTimerProps> = ({
  timeRemaining,
  phaseDuration,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isAlwaysVisible, setIsAlwaysVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-show timer when 10 seconds or less remain
  useEffect(() => {
    const tenSeconds = 10 * 1000; // 10 seconds in milliseconds
    if (timeRemaining <= tenSeconds && timeRemaining > 0) {
      setIsAlwaysVisible(true);
    }
  }, [timeRemaining]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shouldShow = isAlwaysVisible || isHovered;

  // Calculate color based on time remaining
  const getBackgroundColor = () => {
    if (timeRemaining <= 0) return 'bg-red-500'; // No time left
    
    // Use provided phase duration or default to 7 minutes
    const duration = phaseDuration || (7 * 60 * 1000);
    const percentage = (timeRemaining / duration) * 100;
    
    if (percentage > 50) {
      return 'bg-green-500'; // Green: >50% remaining
    } else if (percentage > 10) {
      return 'bg-amber-500'; // Amber: 10-50% remaining
    } else {
      return 'bg-red-500'; // Red: <10% remaining
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timer Toggle Button - Only show when not hovering and not always visible */}
      {!shouldShow && (
        <button
          onClick={() => setIsAlwaysVisible(!isAlwaysVisible)}
          className={`w-16 h-16 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 ${getBackgroundColor()} text-white`}
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
          <span className="text-xs font-medium">Timer</span>
        </button>
      )}

      {/* Timer Display - Replaces the button when shown */}
      {shouldShow && (
        <button
          onClick={() => setIsAlwaysVisible(!isAlwaysVisible)}
          className={`w-16 h-16 rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-center ${getBackgroundColor()} text-white shadow-lg`}
          title={isAlwaysVisible ? 'Hide timer' : 'Always show timer'}
        >
          <div className="text-sm font-bold leading-tight">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs opacity-90 leading-tight">
            {t('dialectic.session.timeRemaining')}
          </div>
        </button>
      )}
    </div>
  );
}; 