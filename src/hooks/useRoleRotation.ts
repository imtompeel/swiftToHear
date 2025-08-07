interface UseRoleRotationProps {
  participants: any[] | number;
  isPassiveObserver: boolean;
  selectedRole: string | null;
  roundNumber: number;
  setSelectedRole: (role: string | null) => void;
  setRoundNumber: (value: number | ((prev: number) => number)) => void;
  setCurrentPhase: (phase: string) => void;
}

export const useRoleRotation = ({
  participants,
  isPassiveObserver,
  selectedRole,
  roundNumber,
  setSelectedRole,
  setRoundNumber,
  setCurrentPhase,
}: UseRoleRotationProps) => {
  
  // Helper to get participant count
  const getParticipantCount = () => {
    return typeof participants === 'number' ? participants : participants.length;
  };

  // Calculate total rounds based on participant configuration
  const getTotalRounds = () => {
    const participantCount = getParticipantCount();
    
    if (participantCount === 3) {
      return 3; // Everyone rotates through 3 active roles
    } else if (participantCount === 4) {
      // Check if there's a permanent passive observer
      const hasPassiveObserver = Array.isArray(participants) && 
        participants.some(p => p.role === 'observer' && p.permanent === true);
      
      return hasPassiveObserver ? 3 : 4; // 3 if passive observer, 4 if all active
    }
    
    return Math.min(participantCount, 4); // Default fallback
  };

  // Check if role is already taken
  const isRoleTaken = (role: string) => {
    if (typeof participants === 'number') {
      return participants >= 3;
    }
    return Array.isArray(participants) && 
           (participants.includes(role) || participants.length >= 3);
  };

  // Enhanced role rotation helper
  const getNextRole = (currentRole: string | null): string | null => {
    // If user is permanent passive observer, they never rotate
    if (isPassiveObserver) {
      return 'observer-permanent';
    }

    const participantCount = getParticipantCount();
    
    if (participantCount === 3) {
      // 3-person rotation: speaker → listener → scribe → speaker
      const roleOrder = ['speaker', 'listener', 'scribe'];
      if (!currentRole || !roleOrder.includes(currentRole)) {
        return 'speaker';
      }
      const currentIndex = roleOrder.indexOf(currentRole);
      const nextIndex = (currentIndex + 1) % roleOrder.length;
      return roleOrder[nextIndex];
    } else if (participantCount === 4) {
      // 4-person rotation: includes temporary observer role
      const roleOrder = ['speaker', 'listener', 'scribe', 'observer-temporary'];
      if (!currentRole || !roleOrder.includes(currentRole)) {
        return 'speaker';
      }
      const currentIndex = roleOrder.indexOf(currentRole);
      const nextIndex = (currentIndex + 1) % roleOrder.length;
      return roleOrder[nextIndex];
    }
    
    return 'speaker'; // Default fallback
  };

  const handleCompleteRound = () => {
    const totalRounds = getTotalRounds();
    
    // Check if session is complete
    if (roundNumber >= totalRounds) {
      setCurrentPhase('reflection');
      return;
    }

    setCurrentPhase('transition');
    // Auto-advance after transition with role rotation
    setTimeout(() => {
      const nextRole = getNextRole(selectedRole);
      setSelectedRole(nextRole);
      setRoundNumber(prev => prev + 1);
      setCurrentPhase('practice');
    }, 3000);
  };

  return {
    getParticipantCount,
    getTotalRounds,
    isRoleTaken,
    getNextRole,
    handleCompleteRound,
  };
};