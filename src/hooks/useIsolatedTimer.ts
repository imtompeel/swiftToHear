import { useRef, useEffect, useState } from 'react';

export const useIsolatedTimer = (
  sessionPhase: string, 
  sessionStartTime: number | null, 
  sessionDuration: number, 
  isTimeoutActive: boolean = false
): number => {
  const [displayTime, setDisplayTime] = useState(sessionDuration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const isActivePhase = sessionPhase === 'listening';
    
    if (!isActivePhase || !sessionStartTime || isTimeoutActive) {
      setDisplayTime(sessionDuration);
      return;
    }

    const readRemaining = () =>
      Math.max(0, sessionDuration - (Date.now() - sessionStartTime));

    const tick = () => {
      const remaining = readRemaining();
      setDisplayTime(remaining);

      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick();
    if (readRemaining() > 0) {
      timerRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionPhase, sessionStartTime, sessionDuration, isTimeoutActive]);

  return displayTime;
};
