import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../types/sessionContext';
import { FirestoreSessionService } from '../services/firestoreSessionService';
import { MobileSpeakerInterface } from './mobile/MobileSpeakerInterface';
import { MobileListenerInterface } from './mobile/MobileListenerInterface';
import { MobileScribeInterface } from './mobile/MobileScribeInterface';

interface MobileParticipantInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete?: () => void;
}

export const MobileParticipantInterface: React.FC<MobileParticipantInterfaceProps> = ({
  session,
  currentUserId,
  currentUserName,
  participants,
  onComplete
}) => {
  // Debug logging for participant updates
  useEffect(() => {
    console.log('MobileParticipantInterface: Participants updated:', participants.map(p => ({ id: p.id, name: p.name, role: p.role })));
  }, [participants]);
  const { t } = useTranslation();
  const [currentRole, setCurrentRole] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [liveSession, setLiveSession] = useState<SessionContext>(session);



  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Calculate phase duration for color coding
  const getPhaseDuration = () => {
    if (liveSession.currentPhase === 'scribe-feedback') {
      return 2.5 * 60 * 1000; // 2.5 minutes in milliseconds
    } else if (liveSession.currentPhase === 'round') {
      return liveSession.duration || (7 * 60 * 1000); // Session duration (already in milliseconds)
    } else {
      return 7 * 60 * 1000; // Default fallback
    }
  };
  
  const phaseDuration = getPhaseDuration();

  // Update timer every second
  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Get the appropriate duration based on current phase
      let phaseDurationMs: number;
      
      if (liveSession.currentPhase === 'scribe-feedback') {
        // Scribe feedback phase is 2.5 minutes
        phaseDurationMs = 2.5 * 60 * 1000; // 2.5 minutes in milliseconds
      } else if (liveSession.currentPhase === 'round') {
        // Round phase uses the session duration (already in milliseconds)
        phaseDurationMs = liveSession.duration || (7 * 60 * 1000); // Default to 7 minutes if not set
      } else {
        // Other phases (waiting, etc.) - no timer needed
        return 0;
      }
      
      // Calculate actual time remaining based on phase start time
      if (liveSession.phaseStartTime) {
        let startTime: number;
        if (liveSession.phaseStartTime.toMillis) {
          startTime = liveSession.phaseStartTime.toMillis();
        } else if (typeof liveSession.phaseStartTime === 'number') {
          startTime = liveSession.phaseStartTime;
        } else {
          // If we can't determine start time, return full duration
          return phaseDurationMs;
        }
        
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, phaseDurationMs - elapsed);
        return remaining;
      }
      
      // If no phase start time, return full duration
      return phaseDurationMs;
    };

    // Update timer immediately
    setTimeRemaining(calculateTimeRemaining());

    // Set up interval to update timer every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [liveSession.currentPhase, liveSession.phaseStartTime, liveSession.duration]);

  // Auto-progress round when timer reaches zero
  useEffect(() => {
    if (timeRemaining <= 0 && liveSession.currentPhase && liveSession.currentPhase !== 'waiting') {
      console.log('MobileParticipantInterface: Timer reached zero, auto-progressing round');
      
      // Only auto-progress if we're in an active phase (round or scribe-feedback)
      if (liveSession.currentPhase === 'round' || liveSession.currentPhase === 'scribe-feedback') {
        // Check if current user is the host
        if (currentUserId === liveSession.hostId) {
          console.log('MobileParticipantInterface: Host detected, auto-progressing phase');
          
          const autoProgressPhase = async () => {
            try {
              if (liveSession.currentPhase === 'round') {
                // Move from round to scribe feedback
                console.log('MobileParticipantInterface: Auto-progressing from round to scribe feedback');
                await FirestoreSessionService.completeScribeFeedback(liveSession.sessionId, currentUserId);
              } else if (liveSession.currentPhase === 'scribe-feedback') {
                // Move from scribe feedback to next round or completion
                console.log('MobileParticipantInterface: Auto-progressing from scribe feedback to next round');
                await FirestoreSessionService.completeRound(liveSession.sessionId, currentUserId);
              }
            } catch (error) {
              console.error('MobileParticipantInterface: Error auto-progressing phase:', error);
            }
          };
          
          // Add a small delay to ensure the timer has fully reached zero
          setTimeout(autoProgressPhase, 100);
        } else {
          console.log('MobileParticipantInterface: Not host, waiting for host to progress');
        }
      }
    }
  }, [timeRemaining, liveSession.currentPhase, currentUserId, liveSession.hostId, liveSession.sessionId]);


  // Update scribe notes in the session
  const updateScribeNotes = async (notes: string) => {
    try {
      await FirestoreSessionService.updateScribeNotes(liveSession.sessionId, notes);
    } catch (error) {
      console.error('Failed to update scribe notes:', error);
    }
  };

  // Find current participant
  const currentParticipant = participants.find(p => p.id === currentUserId);

  // Debug logging
  console.log('MobileParticipantInterface Debug:', {
    currentUserId,
    currentParticipant,
    participants: participants.map(p => ({ id: p.id, name: p.name, role: p.role })),
    currentRole
  });

  useEffect(() => {
    if (currentParticipant) {
      // Update role if it has changed
      if (currentParticipant.role !== currentRole) {
        console.log('MobileParticipantInterface: Role changed from', currentRole, 'to', currentParticipant.role);
        setCurrentRole(currentParticipant.role);
      }
      setIsConnected(true);
    } else {
      console.warn('Current participant not found:', { currentUserId, participants });
    }
  }, [currentParticipant, participants, currentRole]); // Also depend on participants array to catch role changes

  // Real-time session updates from Firestore
  useEffect(() => {
    console.log('MobileParticipantInterface: Setting up real-time listener for session:', session.sessionId);
    
    const unsubscribe = FirestoreSessionService.listenToSession(session.sessionId, (updatedSession) => {
      if (updatedSession) {
        console.log('MobileParticipantInterface: Received real-time session update:', {
          currentPhase: updatedSession.currentPhase,
          currentRound: updatedSession.currentRound,
          participants: updatedSession.participants?.length || 0
        });
        setLiveSession(updatedSession as SessionContext);
      } else {
        console.log('MobileParticipantInterface: Session not found or deleted');
      }
    });

    return () => {
      console.log('MobileParticipantInterface: Cleaning up real-time listener');
      unsubscribe();
    };
  }, [session.sessionId]);

  const renderInterfaceByRole = () => {
    if (!currentParticipant) return null;

    const commonProps = {
      session: liveSession,
      currentUserId,
      currentUserName,
      participants: liveSession.participants || participants,
      onComplete,
      timeRemaining,
      phaseDuration
    };

    // Show Dialogos interface if in free-dialogue phase
    if (liveSession.currentPhase === 'free-dialogue') {
      return <DialogosInterface />;
    }

    switch (currentParticipant.role) {
      case 'speaker':
        return <MobileSpeakerInterface {...commonProps} />;
      case 'listener':
        return <MobileListenerInterface {...commonProps} />;
      case 'scribe':
        return (
          <MobileScribeInterface 
            {...commonProps} 
            onNotesChange={updateScribeNotes}
            initialNotes={liveSession.accumulatedScribeNotes || ''}
            roundNumber={liveSession.currentRound || 1}
          />
        );
      default:
        return <WaitingInterface />;
    }
  };

  const DialogosInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">💬</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">
            Free Dialogue (Dialogos)
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
            <p className="text-green-800 dark:text-green-200 text-lg font-medium">
              Welcome to Dialogos!
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              You've completed the structured dialectic practice. Now you're entering a free-flowing conversation where you can:
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Share insights from your structured practice
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Explore topics that emerged during the session
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Continue practising deep listening together
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Have open, unstructured conversation
              </li>
            </ul>
            <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>No more role restrictions!</strong> Everyone can speak freely and naturally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WaitingInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dialectic.session.mobile.waiting.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('dialectic.session.mobile.waiting.message')}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dialectic.session.mobile.waiting.role')}: {currentRole ? t(`dialectic.roles.${currentRole}.title`) : 'No Role'}
            </p>
            {/* Show current phase and round if session is active */}
            {liveSession.currentPhase && liveSession.currentPhase !== 'waiting' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {liveSession.currentPhase === 'round' && `Round ${liveSession.currentRound || 1}`}
                  {liveSession.currentPhase === 'scribe-feedback' && `Round ${liveSession.currentRound || 1} - Scribe Feedback`}
                  {liveSession.currentPhase === 'round-complete' && 'All Rounds Completed'}
                  {liveSession.currentPhase === 'free-dialogue' && 'Free Dialogue (Dialogos)'}
                  {liveSession.currentPhase === 'completed' && 'Session Completed'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isConnected) {
    return <WaitingInterface />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUserName}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentRole ? t(`dialectic.roles.${currentRole}.title`) : 'No Role'}
              </div>
              {/* Show current phase and round */}
              {liveSession.currentPhase && liveSession.currentPhase !== 'waiting' && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {liveSession.currentPhase === 'round' && `Round ${liveSession.currentRound || 1}`}
                  {liveSession.currentPhase === 'scribe-feedback' && `Scribe Feedback`}
                  {liveSession.currentPhase === 'free-dialogue' && `Dialogos`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div>
        {renderInterfaceByRole()}
      </div>


    </div>
  );
};
