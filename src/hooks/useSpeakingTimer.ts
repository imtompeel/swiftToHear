import { useState, useEffect, useRef } from 'react';

interface UseSpeakingTimerProps {
  isActive: boolean;
  dailyFrame?: any;
  onParticipantUpdate?: (participants: any) => void;
}

interface SpeakingTimerState {
  continuousSpeakingStart: number | null;
  continuousSpeakingDuration: number;
  isSpeakerActive: boolean;
  lastSpeakerActivity: number | null;
  listenerSpeakingStart: number | null;
  isListenerSpeaking: boolean;
  shouldShowTimer: boolean;
}

export const useSpeakingTimer = ({
  isActive,
  dailyFrame,
  onParticipantUpdate
}: UseSpeakingTimerProps) => {
  const [state, setState] = useState<SpeakingTimerState>({
    continuousSpeakingStart: null,
    continuousSpeakingDuration: 0,
    isSpeakerActive: false,
    lastSpeakerActivity: null,
    listenerSpeakingStart: null,
    isListenerSpeaking: false,
    shouldShowTimer: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer function
  const resetTimer = () => {
    setState(prev => ({
      ...prev,
      continuousSpeakingStart: null,
      continuousSpeakingDuration: 0,
      isSpeakerActive: false,
      lastSpeakerActivity: null
    }));
  };

  // Set up Daily frame event listeners for speech detection
  useEffect(() => {
    if (!dailyFrame) return;

    const handleParticipantUpdate = (event: any) => {
      if (onParticipantUpdate) {
        onParticipantUpdate(event.participants);
      }
    };

    const handleTrackStarted = (event: any) => {
      const { participant, track } = event;
      if (track.kind !== 'audio') return;

      const currentTime = Date.now();
      
      // Speaker started speaking
      if (participant.user_id === 'speaker') {
        setState(prev => ({
          ...prev,
          isSpeakerActive: true,
          lastSpeakerActivity: currentTime,
          continuousSpeakingStart: prev.continuousSpeakingStart || currentTime,
          isListenerSpeaking: false,
          listenerSpeakingStart: null
        }));
      }
      // Listener started speaking
      else if (participant.user_id === 'listener') {
        setState(prev => ({
          ...prev,
          isListenerSpeaking: true,
          listenerSpeakingStart: currentTime
        }));
      }
    };

    const handleTrackStopped = (event: any) => {
      const { participant, track } = event;
      if (track.kind !== 'audio') return;

      if (participant.user_id === 'speaker') {
        setState(prev => ({
          ...prev,
          isSpeakerActive: false,
          lastSpeakerActivity: Date.now()
        }));
      } else if (participant.user_id === 'listener') {
        setState(prev => ({
          ...prev,
          isListenerSpeaking: false,
          listenerSpeakingStart: null
        }));
      }
    };
    
    dailyFrame.on('participant-updated', handleParticipantUpdate);
    dailyFrame.on('track-started', handleTrackStarted);
    dailyFrame.on('track-stopped', handleTrackStopped);
    
    return () => {
      dailyFrame.off('participant-updated', handleParticipantUpdate);
      dailyFrame.off('track-started', handleTrackStarted);
      dailyFrame.off('track-stopped', handleTrackStopped);
    };
  }, [dailyFrame, onParticipantUpdate]);

  // Enhanced continuous speaking duration tracking with reset conditions
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (!state.isSpeakerActive || !state.continuousSpeakingStart) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      
      // Check for 3-second silence reset condition
      if (state.lastSpeakerActivity && (currentTime - state.lastSpeakerActivity) > 3000) {
        resetTimer();
        return;
      }
      
      // Check for listener speaking for 5+ seconds reset condition
      if (state.isListenerSpeaking && state.listenerSpeakingStart && 
          (currentTime - state.listenerSpeakingStart) > 5000) {
        resetTimer();
        return;
      }
      
      // Update continuous speaking duration
      // We know continuousSpeakingStart is not null here due to the guard clause above
      const startTime = state.continuousSpeakingStart!;
      const duration = currentTime - startTime;
      const shouldShowTimer = duration > 35000; // Only show after 35 seconds
      
      setState(prev => ({
        ...prev,
        continuousSpeakingDuration: duration,
        shouldShowTimer
      }));
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isSpeakerActive, state.continuousSpeakingStart, state.lastSpeakerActivity, 
      state.isListenerSpeaking, state.listenerSpeakingStart]);

  // Simulate speech detection when no Daily frame available (for testing/development)
  useEffect(() => {
    if (isActive && !dailyFrame && !state.continuousSpeakingStart) {
      const currentTime = Date.now();
      setState(prev => ({
        ...prev,
        continuousSpeakingStart: currentTime,
        isSpeakerActive: true,
        lastSpeakerActivity: currentTime
      }));
    }
  }, [isActive, dailyFrame, state.continuousSpeakingStart]);

  // Format duration for display
  const formatDuration = (duration: number): string => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return {
    // State
    continuousSpeakingDuration: state.continuousSpeakingDuration,
    isSpeakerActive: state.isSpeakerActive,
    shouldShowTimer: state.shouldShowTimer,
    
    // Actions
    resetTimer,
    
    // Utilities
    formatDuration: () => formatDuration(state.continuousSpeakingDuration)
  };
};
