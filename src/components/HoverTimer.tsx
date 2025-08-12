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
          className={`w-16 h-16 rounded-lg transition-all duration-200 flex items-center justify-center ${getBackgroundColor()} text-white`}
          title={isAlwaysVisible ? 'Hide timer' : 'Always show timer'}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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