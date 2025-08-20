import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Audio player for singing bowl chime
class ChimePlayer {
  private audio: HTMLAudioElement | null = null;
  private isLoaded = false;
  private hasUserInteracted = false;
  private isPlaying = false;

  constructor() {
    this.loadAudio();
    this.setupUserInteraction();
  }

  private loadAudio() {
    this.audio = new Audio('/48325__monkay__singingbowl.wav');
    this.audio.preload = 'auto';
    this.audio.volume = 0.6;
    
    // Mobile-specific audio settings
    this.audio.muted = false;
    this.audio.autoplay = false;
    
    this.audio.addEventListener('canplaythrough', () => {
      this.isLoaded = true;
    });
    
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
    });
    
    this.audio.addEventListener('error', (e) => {
      console.error('Failed to load audio file:', e);
      this.isPlaying = false;
    });
  }

  private setupUserInteraction() {
    // Listen for any user interaction to enable audio
    const enableAudio = () => {
      this.hasUserInteracted = true;
      // Try to play and immediately pause to unlock audio context
      if (this.audio) {
        this.audio.play().then(() => {
          this.audio!.pause();
          this.audio!.currentTime = 0;
        }).catch(() => {
          // Ignore errors, just trying to unlock audio
        });
      }
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('click', enableAudio);
    };

    document.addEventListener('touchstart', enableAudio, { once: true });
    document.addEventListener('click', enableAudio, { once: true });
  }

  play() {
    if (this.audio && this.isLoaded && this.hasUserInteracted && !this.isPlaying) {
      this.isPlaying = true;
      // Reset to beginning and play
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.log('Audio play failed:', error);
        this.isPlaying = false;
      });
    }
  }
}

// Create a single instance to reuse
const chimePlayer = new ChimePlayer();

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
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false);
  const [hasPlayedEnd, setHasPlayedEnd] = useState(false);
  const prevTimeRemaining = useRef(timeRemaining);

  // Auto-show timer when 10 seconds or less remain and handle sound notifications
  useEffect(() => {
    const tenSeconds = 10 * 1000; // 10 seconds in milliseconds
    if (timeRemaining <= tenSeconds && timeRemaining > 0) {
      setIsAlwaysVisible(true);
    }

    // Check for 30-second warning (more precise timing)
    if (timeRemaining <= 30000 && timeRemaining > 29900 && !hasPlayedWarning) {
      setTimeout(() => {
        chimePlayer.play();
      }, 100); // Small delay to ensure stable state
      setHasPlayedWarning(true);
    }

    // Check for timer end (more precise timing)
    if (timeRemaining <= 0 && timeRemaining > -1000 && !hasPlayedEnd) {
      setTimeout(() => {
        chimePlayer.play();
      }, 100); // Small delay to ensure stable state
      setHasPlayedEnd(true);
    }

    // Reset flags when timer resets
    if (timeRemaining > prevTimeRemaining.current) {
      setHasPlayedWarning(false);
      setHasPlayedEnd(false);
    }

    prevTimeRemaining.current = timeRemaining;
  }, [timeRemaining, hasPlayedWarning, hasPlayedEnd]);

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
            {t('shared.common.timeRemaining')}
          </div>
        </button>
      )}
    </div>
  );
}; 