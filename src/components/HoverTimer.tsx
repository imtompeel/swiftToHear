import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTimerChimes } from '../hooks/useTimerChimes';
import { getTimerMuted, setTimerMuted, unlockTimerChime } from '../services/chimePlayer';
import { resolveTimerDuration } from '../utils/timerBells';

interface HoverTimerProps {
  timeRemaining: number; // in milliseconds
  phaseDuration?: number; // in milliseconds - for calculating color percentages
  className?: string;
  isActive?: boolean; // whether the timer is in an active session
}

export const HoverTimer: React.FC<HoverTimerProps> = ({
  timeRemaining,
  phaseDuration,
  className = '',
  isActive = false
}) => {
  const { t } = useTranslation();
  const [isAlwaysVisible, setIsAlwaysVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(getTimerMuted);

  useTimerChimes({
    timeRemaining,
    phaseDuration,
    isActive,
    isMuted,
    endOnInactive: true,
  });

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shouldShow = isAlwaysVisible || isHovered;

  const handleMuteToggle = () => {
    unlockTimerChime();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setTimerMuted(nextMuted);
  };

  const duration = resolveTimerDuration(phaseDuration, timeRemaining);
  const getBackgroundColor = () => {
    if (timeRemaining <= 0) return 'bg-red-500';
    
    const percentage = duration > 0 ? (timeRemaining / duration) * 100 : 0;
    
    if (percentage > 50) {
      return 'bg-green-500';
    } else if (percentage > 10) {
      return 'bg-amber-500';
    } else {
      return 'bg-red-500';
    }
  };

  const muteButton = (
    <button
      onClick={handleMuteToggle}
      className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center ${
        isMuted 
          ? 'bg-gray-500 hover:bg-gray-600 text-white' 
          : 'bg-green-500 hover:bg-green-600 text-white'
      } shadow-lg`}
      title={isMuted ? 'Unmute timer bells' : 'Mute timer bells'}
    >
      {isMuted ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!shouldShow && (
        <div className="flex items-center space-x-2">
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
          
          {muteButton}
        </div>
      )}

      {shouldShow && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAlwaysVisible(!isAlwaysVisible)}
            className={`w-16 h-16 rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-center ${getBackgroundColor()} text-white shadow-lg`}
            title={isAlwaysVisible ? 'Hide timer' : 'Always show timer'}
          >
            <div className="text-sm font-bold leading-tight">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs opacity-90 leading-tight">
              {t('shared.common.timeRemaining')}
            </div>
          </button>
          
          {muteButton}
        </div>
      )}
    </div>
  );
};
