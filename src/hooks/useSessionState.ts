import React from 'react';

interface UseSessionStateProps {
  phase?: string;
  sessionPhase?: string;
  userRole?: 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent';
  selectedTopic?: string;
  currentRound?: number;
  sessionDuration?: number;
}

export const useSessionState = ({
  phase = 'initialization',
  sessionPhase,
  userRole,
  selectedTopic,
  currentRound = 1,
  sessionDuration: initialSessionDuration,
}: UseSessionStateProps) => {
  const [currentPhase, setCurrentPhase] = React.useState(sessionPhase || phase);
  const [selectedRole, setSelectedRole] = React.useState<string | null>(userRole || null);
  const [currentTopic, setCurrentTopic] = React.useState(selectedTopic || '');
  const [sessionActive, setSessionActive] = React.useState(sessionPhase === 'practice');
  const [sessionStarted, setSessionStarted] = React.useState(sessionPhase === 'practice');
  const [roundNumber, setRoundNumber] = React.useState(currentRound);
  const [isPassiveObserver, setIsPassiveObserver] = React.useState(false);
  
  // New phase states for hello check-in and scribe feedback
  const [showHelloCheckIn, setShowHelloCheckIn] = React.useState(false);
  const [showScribeFeedback, setShowScribeFeedback] = React.useState(false);
  const [scribeNotes, setScribeNotes] = React.useState<string>('');
  
  // Round-based scribe notes storage
  const [roundScribeNotes, setRoundScribeNotes] = React.useState<Record<number, string>>({});
  
  // Duration management
  const [sessionDuration, setSessionDuration] = React.useState(
    initialSessionDuration || 15 * 60 * 1000 // Default 15 minutes
  );
  const [sessionStartTime, setSessionStartTime] = React.useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = React.useState(sessionDuration);

  // Update timeRemaining when session is active
  React.useEffect(() => {
    if (!sessionActive || !sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = Math.max(0, sessionDuration - elapsed);
      setTimeRemaining(remaining);
      
      // Auto-complete session when time runs out
      if (remaining === 0) {
        setSessionActive(false);
        setCurrentPhase('reflection');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionStartTime, sessionDuration]);

  // Update state when props change (for testing)
  React.useEffect(() => {
    if (sessionPhase) {
      setCurrentPhase(sessionPhase);
      // If session is active and we haven't started yet, trigger hello check-in
      if (sessionPhase === 'listening' && !sessionStarted && !showHelloCheckIn) {
        setSessionStarted(true);
        setShowHelloCheckIn(true);
        setSessionStartTime(Date.now());
      }
    }
    if (userRole) {
      setSelectedRole(userRole);
    }
    if (selectedTopic) {
      setCurrentTopic(selectedTopic);
    }
    setRoundNumber(currentRound);
  }, [sessionPhase, userRole, selectedTopic, currentRound, sessionStarted, showHelloCheckIn]);

  const handleRoleSelection = (role: 'speaker' | 'listener' | 'scribe' | 'observer-temporary' | 'observer-permanent') => {
    setSelectedRole(role);
    // Track if user chooses to be permanent passive observer
    if (role === 'observer-permanent') {
      setIsPassiveObserver(true);
    }
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    setShowHelloCheckIn(true); // Start with hello check-in
    setSessionStartTime(Date.now());
  };

  const handleCompleteHelloCheckIn = () => {
    setShowHelloCheckIn(false);
    setSessionActive(true);
    setCurrentPhase('listening'); // Changed from 'practice' to 'listening'
    setTimeRemaining(sessionDuration);
  };

  const handleCompleteScribeFeedback = () => {
    setShowScribeFeedback(false);
    setCurrentPhase('transition');
  };

  // Save current scribe notes for the current round
  const saveCurrentRoundNotes = () => {
    if (scribeNotes.trim()) {
      setRoundScribeNotes(prev => ({
        ...prev,
        [roundNumber]: scribeNotes
      }));
    }
  };

  // Get scribe notes for a specific round
  const getRoundScribeNotes = (round: number): string => {
    return roundScribeNotes[round] || '';
  };

  // Get all scribe notes as a combined string
  const getAllScribeNotes = (): string => {
    return Object.entries(roundScribeNotes)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([round, notes]) => `Round ${round}:\n${notes}`)
      .join('\n\n');
  };

  const setTopicAndTriggerSelection = (topic: string) => {
    setCurrentTopic(topic);
  };

  const handleDurationChange = (newDuration: number) => {
    setSessionDuration(newDuration);
    if (!sessionActive) {
      setTimeRemaining(newDuration);
    }
  };

  // Duration utility functions
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = () => {
    if (!sessionStartTime) return 0;
    const elapsed = Date.now() - sessionStartTime;
    return Math.min(100, (elapsed / sessionDuration) * 100);
  };

  return {
    // State
    currentPhase,
    selectedRole,
    currentTopic,
    sessionActive,
    sessionStarted,
    roundNumber,
    isPassiveObserver,
    
    // New phase states
    showHelloCheckIn,
    showScribeFeedback,
    scribeNotes,
    roundScribeNotes,
    
    // Duration state
    sessionDuration,
    timeRemaining,
    sessionStartTime,
    
    // Setters
    setCurrentPhase,
    setSelectedRole,
    setCurrentTopic,
    setRoundNumber,
    setSessionDuration,
    setScribeNotes,
    setShowScribeFeedback,
    setRoundScribeNotes,
    
    // Handlers
    handleRoleSelection,
    handleStartSession,
    handleCompleteHelloCheckIn,
    handleCompleteScribeFeedback,
    handleDurationChange,
    setTopicAndTriggerSelection,
    saveCurrentRoundNotes,
    getRoundScribeNotes,
    getAllScribeNotes,
    
    // Duration utilities
    formatTimeRemaining,
    getSessionProgress,
  };
};