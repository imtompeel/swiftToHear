import { useRef, useEffect, useState } from 'react';

export const useIsolatedTimer = (
  sessionPhase: string, 
  sessionStartTime: number | null, 
  sessionDuration: number, 
  isTimeoutActive: boolean = false
): number => {
  const [displayTime, setDisplayTime] = useState(sessionDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Only count down during active session phases and when not in timeout
    const isActivePhase = sessionPhase === 'listening' || 
                         sessionPhase === 'hello-checkin' || 
                         sessionPhase === 'free-dialogue';
    
    if (!isActivePhase || !sessionStartTime || isTimeoutActive) {
      setDisplayTime(sessionDuration);
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = Math.max(0, sessionDuration - elapsed);
      setDisplayTime(remaining);
      
      if (remaining === 0) {
        console.log('Session time is up');
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionPhase, sessionStartTime, sessionDuration, isTimeoutActive]);

  return displayTime;
};
