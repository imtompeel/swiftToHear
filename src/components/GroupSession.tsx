import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { useVideoCall } from '../hooks/useVideoCall';
import { GroupSessionData, GroupData } from '../types/groupSession';
import { FirestoreGroupSessionService } from '../services/firestoreGroupSessionService';
import { SpeakerInterface } from './SpeakerInterface';
import { ListenerInterface } from './ListenerInterface';
import { ScribeInterface } from './ScribeInterface';
import { PassiveObserverInterface } from './PassiveObserverInterface';
import { HelloCheckIn } from './HelloCheckIn';
import { ScribeFeedback } from './ScribeFeedback';
import { SessionCompletion } from './SessionCompletion';
import { FreeDialoguePhase } from './FreeDialoguePhase';
import { ReflectionPhase } from './ReflectionPhase';

interface GroupSessionProps {
  sessionId: string;
  groupId: string;
  currentUserId: string;
  currentUserName: string;
  onLeaveSession: () => void;
  onGroupComplete: () => void;
  // Optional props for test environment
  currentGroup?: GroupData | null;
  session?: GroupSessionData | null;
}

export const GroupSession: React.FC<GroupSessionProps> = ({
  sessionId,
  groupId,
  currentUserId,
  currentUserName,
  onLeaveSession,
  onGroupComplete,
  currentGroup: initialCurrentGroup,
  session: initialSession
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [session, setSession] = useState<GroupSessionData | null>(initialSession || null);
  const [currentGroup, setCurrentGroup] = useState<GroupData | null>(initialCurrentGroup || null);
  const [loading, setLoading] = useState(!initialSession && !initialCurrentGroup);
  const [error, setError] = useState<string | null>(null);

  // Get current user's role in this group
  const currentUserRole = useMemo(() => {
    if (!currentGroup) return '';
    const participant = currentGroup.participants.find(p => p.id === currentUserId);
    return participant?.role || '';
  }, [currentGroup, currentUserId]);

  // Check if current user is the host
  const isHost = useMemo(() => {
    return session?.hostId === currentUserId;
  }, [session, currentUserId]);

  // Video call setup - disabled for test environment to avoid Firebase permission issues
  const videoCall = initialSession && initialCurrentGroup 
    ? {
        localVideoRef: { current: null },
        peerStreams: {},
        isConnected: false,
        isConnecting: false,
        connectionState: 'disconnected' as const,
        peerCount: 0,
        error: null,
        localStreamRef: { current: null }
      }
    : useVideoCall({
        sessionId: `${sessionId}-${groupId}`,
        currentUserId,
        isActive: !!currentGroup && currentGroup.status === 'active',
        participants: currentGroup?.participants || []
      });

  // Load session and group data
  useEffect(() => {
    // If initial data was provided, use it and skip Firestore fetch
    if (initialSession && initialCurrentGroup) {
      setSession(initialSession);
      setCurrentGroup(initialCurrentGroup);
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        setLoading(true);
        const sessionData = await FirestoreGroupSessionService.getGroupSession(sessionId);
        if (!sessionData) {
          setError('Session not found');
          return;
        }

        const group = sessionData.groups.find(g => g.groupId === groupId);
        if (!group) {
          setError('Group not found');
          return;
        }

        setSession(sessionData);
        setCurrentGroup(group);
      } catch (err) {
        console.error('Error loading group session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, groupId, initialSession, initialCurrentGroup]);

  // Listen for session updates
  useEffect(() => {
    if (!sessionId) return;
    
    // Skip Firestore updates if using test data
    if (initialSession && initialCurrentGroup) return;

    const interval = setInterval(async () => {
      try {
        const sessionData = await FirestoreGroupSessionService.getGroupSession(sessionId);
        if (sessionData) {
          setSession(sessionData);
          const group = sessionData.groups.find(g => g.groupId === groupId);
          if (group) {
            setCurrentGroup(group);
          }
        }
      } catch (err) {
        console.error('Error updating session:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, groupId]);

  // Handle role completion
  const handleCompleteRound = async () => {
    if (!isHost || !currentGroup) return;

    // Skip Firestore calls in test environment
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Round completion would be handled by automation');
      return;
    }

    try {
      await FirestoreGroupSessionService.completeGroupRound(sessionId, groupId);
    } catch (err) {
      console.error('Error completing round:', err);
    }
  };

  // Handle scribe notes update
  const handleScribeNotesChange = async (notes: string) => {
    if (!currentGroup || currentUserRole !== 'scribe') return;

    // Skip Firestore calls in test environment
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Scribe notes update would be saved to Firestore');
      return;
    }

    try {
      await FirestoreGroupSessionService.updateGroupScribeNotes(
        sessionId,
        groupId,
        currentGroup.roundNumber,
        notes
      );
    } catch (err) {
      console.error('Error updating scribe notes:', err);
    }
  };

  // Handle session completion options
  const handleContinueRounds = async () => {
    if (!isHost) return;
    
    // Skip Firestore calls in test environment
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Continue rounds would be handled by automation');
      return;
    }
    
    // Reset to first round and continue
    try {
      await FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'listening');
    } catch (err) {
      console.error('Error continuing rounds:', err);
    }
  };

  const handleStartFreeDialogue = async () => {
    if (!isHost) return;
    
    // Skip Firestore calls in test environment
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Start free dialogue would be handled by automation');
      return;
    }
    
    try {
      await FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'free-dialogue');
    } catch (err) {
      console.error('Error starting free dialogue:', err);
    }
  };

  const handleEndSession = async () => {
    if (!isHost) return;
    
    // Skip Firestore calls in test environment
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: End session would be handled by automation');
      return;
    }
    
    try {
      await FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'reflection');
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4" role="status"></div>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('dialectic.session.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            {t('dialectic.session.sessionError')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {error}
          </p>
          <button
            onClick={onLeaveSession}
            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600"
          >
            {t('dialectic.session.leaveSession')}
          </button>
        </div>
      </div>
    );
  }

  if (!session || !currentGroup) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            {t('dialectic.session.sessionNotFound')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('dialectic.session.sessionNotFoundDescription')}
          </p>
          <button
            onClick={onLeaveSession}
            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600"
          >
            {t('dialectic.session.leaveSession')}
          </button>
        </div>
      </div>
    );
  }

  // Render based on group phase
  const renderPhaseContent = () => {
    switch (currentGroup.currentPhase) {
      case 'hello-checkin':
        return (
          <HelloCheckIn
            session={session}
            participants={currentGroup.participants}
            currentUserId={currentUserId}
            isHost={isHost}
            onComplete={() => {
              if (isHost) {
                FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'listening');
              }
            }}
            videoCall={videoCall}
          />
        );

      case 'listening':
        switch (currentUserRole) {
          case 'speaker':
            return (
              <SpeakerInterface
                session={session}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={currentGroup.participants}
                videoCall={videoCall}
              />
            );
          case 'listener':
            return (
              <ListenerInterface
                session={session}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={currentGroup.participants}
                videoCall={videoCall}
              />
            );
          case 'scribe':
            return (
              <ScribeInterface
                session={session}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={currentGroup.participants}
                videoCall={videoCall}
                onNotesChange={handleScribeNotesChange}
                initialNotes={currentGroup.scribeNotes?.[currentGroup.roundNumber] || ''}
                roundNumber={currentGroup.roundNumber}
              />
            );
          case 'observer':
          case 'observer-permanent':
          case 'observer-temporary':
            return (
              <PassiveObserverInterface
                session={session}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={currentGroup.participants}
                videoCall={videoCall}
              />
            );
          default:
            return (
              <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {t('dialectic.session.waitingForRoleAssignment')}
                  </p>
                </div>
              </div>
            );
        }

      case 'transition':
        return (
          <ScribeFeedback
            session={session}
            participants={currentGroup.participants}
            currentUserId={currentUserId}
            isHost={isHost}
            onComplete={() => {
              if (isHost) {
                FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'listening');
              }
            }}
            videoCall={videoCall}
            notes={currentGroup.scribeNotes?.[currentGroup.roundNumber] || ''}
          />
        );

      case 'completion':
        return (
          <SessionCompletion
            currentRound={currentGroup.roundNumber}
            totalRounds={currentGroup.participants.length === 3 ? 3 : 4}
            onContinueRounds={handleContinueRounds}
            onStartFreeDialogue={handleStartFreeDialogue}
            onEndSession={handleEndSession}
            isHost={isHost}
          />
        );

      case 'free-dialogue':
        return (
          <FreeDialoguePhase
            participants={currentGroup.participants}
            onEndSession={handleEndSession}
            isHost={isHost}
          />
        );

      case 'reflection':
        return (
          <ReflectionPhase
            session={session}
            participants={currentGroup.participants}
            currentUserId={currentUserId}
            onComplete={onGroupComplete}
          />
        );

      case 'completed':
        return (
          <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">
                {t('dialectic.session.sessionComplete')}
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                {t('dialectic.session.reflectionPrompt')}
              </p>
              <button
                onClick={onGroupComplete}
                className="px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600"
              >
                {t('dialectic.session.leaveSession')}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
            <div className="text-center">
              <p className="text-secondary-600 dark:text-secondary-400">
                {t('dialectic.session.waitingForParticipants')}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
                {session.sessionName} - {t('dialectic.dashboard.group.title', { name: groupId.replace('group-', '') })}
              </h1>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {t('dialectic.session.round', { current: currentGroup.roundNumber, total: currentGroup.participants.length === 3 ? 3 : 4 })}
              </p>
              {initialSession && initialCurrentGroup && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  🧪 Test Environment - Video Disabled
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t(`dialectic.roles.${currentUserRole}.title`)}
              </div>
              <button
                onClick={onLeaveSession}
                className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {t('dialectic.session.leaveSession')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPhaseContent()}
      </div>

      {/* Host controls */}
      {isHost && currentGroup.currentPhase === 'listening' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleCompleteRound}
            className="px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 shadow-lg"
          >
            {t('dialectic.session.completeRound')}
          </button>
        </div>
      )}
    </div>
  );
};

