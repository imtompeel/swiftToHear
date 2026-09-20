import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import { playTimerChime, unlockTimerChime, armTimerChimes } from '../services/chimePlayer';
import { useTimerChimes } from '../hooks/useTimerChimes';

interface QuickTimerProps {
  initialDuration?: number; // in minutes
  customDuration?: number; // in minutes for custom timer
}

export const QuickTimer: React.FC<QuickTimerProps> = ({ 
  initialDuration = 2,
  customDuration 
}) => {
  const { duration } = useParams<{ duration: string }>();
  
  // Use URL parameter if available, otherwise use props
  const effectiveDuration = duration ? parseInt(duration) : (customDuration || initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useTimerChimes({
    timeRemaining,
    phaseDuration: totalDuration,
    isActive: isRunning && !isPaused,
    isMuted: !soundEnabled,
    skipStart: true,
  });

  // Set initial duration based on props or URL parameter
  useEffect(() => {
    const durationMs = effectiveDuration * 60 * 1000; // Convert to milliseconds
    setTimeRemaining(durationMs);
    setTotalDuration(durationMs);
  }, [effectiveDuration]);

  // Timer logic
  useEffect(() => {
    if (!(isRunning && !isPaused)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          setIsRunning(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  const startTimer = () => {
    if (timeRemaining === 0) {
      // Reset timer if it's finished
      const durationMs = effectiveDuration * 60 * 1000;
      setTimeRemaining(durationMs);
      setTotalDuration(durationMs);
    }
    setIsRunning(true);
    setIsPaused(false);
    setHasUserInteracted(true);
    unlockTimerChime();
    armTimerChimes();
    if (soundEnabled) {
      void playTimerChime();
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    const durationMs = effectiveDuration * 60 * 1000;
    setTimeRemaining(durationMs);
    setTotalDuration(durationMs);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (totalDuration === 0) return 0;
    return ((totalDuration - timeRemaining) / totalDuration) * 100;
  };

  const getTimerColor = () => {
    const percentage = getProgressPercentage();
    if (percentage > 80) return 'text-red-500';
    if (percentage > 60) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-4 ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-secondary-200 dark:bg-secondary-600 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          {/* Duration Label */}
          <div className="text-secondary-600 dark:text-secondary-400 text-lg">
            {effectiveDuration} minute{effectiveDuration !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isRunning && timeRemaining > 0 && (
            <button
              onClick={startTimer}
              className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
            >
              Start
            </button>
          )}
          
          {isRunning && !isPaused && (
            <button
              onClick={pauseTimer}
              className="px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-lg"
            >
              Pause
            </button>
          )}
          
          {isRunning && isPaused && (
            <button
              onClick={resumeTimer}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
            >
              Resume
            </button>
          )}
          
          {(isRunning || timeRemaining === 0) && (
            <button
              onClick={resetTimer}
              className="px-8 py-4 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors font-semibold text-lg"
            >
              Reset
            </button>
          )}
        </div>

        {/* Sound Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-full transition-colors ${
              soundEnabled 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? <VolumeUp className="w-6 h-6" /> : <VolumeOff className="w-6 h-6" />}
          </button>
          {!hasUserInteracted && (
            <div className="mt-2 text-xs text-gray-500">
              Tap "Start" to enable sounds
            </div>
          )}
        </div>

        {/* Timer Complete Message */}
        {timeRemaining === 0 && totalDuration > 0 && (
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Time's up!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
