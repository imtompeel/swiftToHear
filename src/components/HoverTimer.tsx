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

// Global mute state
let isMuted = false;

// Function to toggle mute state
const toggleMute = () => {
  isMuted = !isMuted;
  // Store in localStorage for persistence
  localStorage.setItem('timerMuted', isMuted.toString());
};

// Function to get mute state
const getMuteState = () => {
  const stored = localStorage.getItem('timerMuted');
  if (stored !== null) {
    isMuted = stored === 'true';
  }
  return isMuted;
};

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
  isActive = true
}) => {
  const { t } = useTranslation();
  const [isAlwaysVisible, setIsAlwaysVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasPlayedStart, setHasPlayedStart] = useState(false);
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false);
  const [hasPlayedEnd, setHasPlayedEnd] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());
  const prevTimeRemaining = useRef(timeRemaining);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Auto-show timer when 10 seconds or less remain and handle sound notifications
  useEffect(() => {
    const tenSeconds = 10 * 1000; // 10 seconds in milliseconds
    if (timeRemaining <= tenSeconds && timeRemaining > 0) {
      setIsAlwaysVisible(true);
    }

    // Track when session starts (when timer first becomes active)
    if (timeRemaining > 0 && sessionStartTimeRef.current === null) {
      sessionStartTimeRef.current = Date.now();
    }

    // Only play chimes if timer is active and not muted
    if (!isActive || isMuted) {
      return;
    }

    // Check for start chime (1 second into the timer)
    const oneSecond = 1000;
    const sessionDuration = phaseDuration || (7 * 60 * 1000);
    const timeElapsed = sessionDuration - timeRemaining;
    
    if (timeElapsed >= oneSecond && timeElapsed < oneSecond + 100 && !hasPlayedStart) {
      console.log('Playing start chime at', timeElapsed, 'ms');
      chimePlayer.play();
      setHasPlayedStart(true);
    }

    // Check for 30-second warning (exactly at 30 seconds remaining)
    if (timeRemaining <= 30000 && timeRemaining > 29950 && !hasPlayedWarning) {
      console.log('Playing 30-second warning chime');
      chimePlayer.play();
      setHasPlayedWarning(true);
    }

    // Check for timer end (when timer reaches 0)
    if (timeRemaining <= 0 && timeRemaining > -500 && !hasPlayedEnd) {
      console.log('Playing end chime');
      chimePlayer.play();
      setHasPlayedEnd(true);
    }

    // Reset flags when timer resets (when time increases, indicating a new session)
    if (timeRemaining > prevTimeRemaining.current + 1000) {
      console.log('Timer reset detected, clearing chime flags');
      setHasPlayedStart(false);
      setHasPlayedWarning(false);
      setHasPlayedEnd(false);
      sessionStartTimeRef.current = null;
    }

    prevTimeRemaining.current = timeRemaining;
  }, [timeRemaining, hasPlayedStart, hasPlayedWarning, hasPlayedEnd, isMuted, phaseDuration, isActive]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shouldShow = isAlwaysVisible || isHovered;

  // Handle mute toggle
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    toggleMute();
  };

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
          
          {/* Mute Toggle Button - Always visible */}
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
              // Muted bell icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              // Unmuted bell icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Timer Display - Replaces the button when shown */}
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
          
          {/* Mute Toggle Button */}
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
              // Muted bell icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              // Unmuted bell icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}; 