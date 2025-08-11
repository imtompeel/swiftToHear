import { useState, useCallback, useRef, useEffect } from 'react';
import { FirestoreSessionService } from '../services/firestoreSessionService';

export interface TimeoutState {
  isActive: boolean;
  requestedBy: string | null;
  startTime: number | null;
  isVideoDisabled: boolean;
}

export interface UseSafetyTimeoutProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  sessionTimeoutState?: {
    isActive: boolean;
    requestedBy: string | null;
    requestedByUserName: string | null;
    startTime: any;
  };
  onTimeoutStateChange?: (state: TimeoutState) => void;
}

export const useSafetyTimeout = ({
  sessionId,
  currentUserId,
  currentUserName,
  sessionTimeoutState,
  onTimeoutStateChange
}: UseSafetyTimeoutProps) => {
  const [timeoutState, setTimeoutState] = useState<TimeoutState>({
    isActive: false,
    requestedBy: null,
    startTime: null,
    isVideoDisabled: false
  });

  // Sync with session timeout state
  useEffect(() => {
    if (sessionTimeoutState) {
      const newState: TimeoutState = {
        isActive: sessionTimeoutState.isActive,
        requestedBy: sessionTimeoutState.requestedBy,
        startTime: sessionTimeoutState.startTime ? new Date(sessionTimeoutState.startTime.seconds * 1000).getTime() : null,
        isVideoDisabled: sessionTimeoutState.requestedBy === currentUserId && sessionTimeoutState.isActive
      };
      setTimeoutState(newState);
    }
  }, [sessionTimeoutState, currentUserId]);

  const timeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update timeout state and notify parent
  const updateTimeoutState = useCallback((newState: Partial<TimeoutState>) => {
    setTimeoutState(prev => {
      const updatedState = { ...prev, ...newState };
      onTimeoutStateChange?.(updatedState);
      return updatedState;
    });
  }, [onTimeoutStateChange]);

  // Request a safety timeout
  const requestTimeout = useCallback(async () => {
    try {
      // Request timeout through session service
      await FirestoreSessionService.requestSafetyTimeout(sessionId, currentUserId, currentUserName);
      console.log('Safety timeout requested by:', currentUserName);

    } catch (error) {
      console.error('Failed to request safety timeout:', error);
    }
  }, [sessionId, currentUserId, currentUserName]);

  // End the timeout early
  const endTimeout = useCallback(async () => {
    try {
      // End timeout through session service
      await FirestoreSessionService.endSafetyTimeout(sessionId);
      console.log('Safety timeout ended by:', currentUserName);

    } catch (error) {
      console.error('Failed to end safety timeout:', error);
    }
  }, [sessionId, currentUserName]);

  // No automatic timer - timeout ends only when user chooses to end it
  const startTimeoutTimer = useCallback(() => {
    // Timer functionality removed - timeout is now untimed
    console.log('Safety timeout started - no automatic timer');
  }, []);

  // Handle timeout request from another participant
  const handleTimeoutRequest = useCallback((requestingUserId: string, requestingUserName: string) => {
    console.log('Safety timeout requested by:', requestingUserName);
    
    updateTimeoutState({
      isActive: true,
      requestedBy: requestingUserId,
      startTime: Date.now(),
      isVideoDisabled: requestingUserId === currentUserId // Only disable video for the requesting user
    });

    startTimeoutTimer();
  }, [currentUserId, updateTimeoutState, startTimeoutTimer]);

  // Handle timeout end from another participant
  const handleTimeoutEnd = useCallback(() => {
    console.log('Safety timeout ended by another participant');
    
    if (timeoutIntervalRef.current) {
      clearInterval(timeoutIntervalRef.current);
      timeoutIntervalRef.current = null;
    }

    updateTimeoutState({
      isActive: false,
      requestedBy: null,
      startTime: null,
      isVideoDisabled: false
    });
  }, [updateTimeoutState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
        timeoutIntervalRef.current = null;
      }
    };
  }, []);



  return {
    // State
    timeoutState,
    
    // Actions
    requestTimeout,
    endTimeout,
    
    // Event handlers (for external timeout events)
    handleTimeoutRequest,
    handleTimeoutEnd,
    
    // Utilities
    isTimeoutActive: timeoutState.isActive,
    isVideoDisabled: timeoutState.isVideoDisabled,
    requestedByMe: timeoutState.requestedBy === currentUserId
  };
};
