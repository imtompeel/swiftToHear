import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useVideoCall } from '../hooks/useVideoCall';
import { GroupSessionData, GroupData } from '../types/groupSession';
import { FirestoreGroupSessionService } from '../services/firestoreGroupSessionService';
import { createGroupSessionContext, getCurrentParticipants } from '../types/sessionContext';
import { SpeakerInterface } from './SpeakerInterface';
import { ListenerInterface } from './ListenerInterface';
import { ScribeInterface } from './ScribeInterface';
import { PassiveObserverInterface } from './PassiveObserverInterface';
import { HelloCheckIn } from './HelloCheckIn';
import { ScribeFeedback } from './ScribeFeedback';
import { SessionCompletion } from './SessionCompletion';
import { FreeDialoguePhase } from './FreeDialoguePhase';
import { ReflectionPhase } from './ReflectionPhase';
import { GroupManagementDashboard } from './GroupManagementDashboard';

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
  const [session, setSession] = useState<GroupSessionData | null>(initialSession || null);
  const [currentGroup, setCurrentGroup] = useState<GroupData | null>(initialCurrentGroup || null);
  const [loading, setLoading] = useState(!initialSession && !initialCurrentGroup);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Create session context for components
  const sessionContext = useMemo(() => {
    if (!session) return null;
    return createGroupSessionContext(session, groupId);
  }, [session, groupId]);

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
        currentUserName,
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

  // Dashboard handlers
  const handleStartGroup = async (groupId: string) => {
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Starting group would be handled by automation');
      return;
    }
    
    try {
      await FirestoreGroupSessionService.startGroup(sessionId, groupId);
    } catch (error) {
      console.error('Failed to start group:', error);
    }
  };

  const handlePauseGroup = async (groupId: string) => {
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Pausing group would be handled by automation');
      return;
    }
    
    try {
      await FirestoreGroupSessionService.pauseGroup(sessionId, groupId);
    } catch (error) {
      console.error('Failed to pause group:', error);
    }
  };

  const handleEndGroup = async (groupId: string) => {
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Ending group would be handled by automation');
      return;
    }
    
    try {
      await FirestoreGroupSessionService.endGroup(sessionId, groupId);
    } catch (error) {
      console.error('Failed to end group:', error);
    }
  };

  const handleStartAllGroups = async () => {
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Starting all groups would be handled by automation');
      return;
    }
    
    try {
      // Start all waiting groups
      const waitingGroups = session?.groups.filter(g => g.status === 'waiting') || [];
      for (const group of waitingGroups) {
        await FirestoreGroupSessionService.startGroup(sessionId, group.groupId);
      }
    } catch (error) {
      console.error('Failed to start all groups:', error);
    }
  };

  const handlePauseAllGroups = async () => {
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Pausing all groups would be handled by automation');
      return;
    }
    
    try {
      // Pause all active groups
      const activeGroups = session?.groups.filter(g => g.status === 'active') || [];
      for (const group of activeGroups) {
        await FirestoreGroupSessionService.pauseGroup(sessionId, group.groupId);
      }
    } catch (error) {
      console.error('Failed to pause all groups:', error);
    }
  };

  const handleEndAllGroups = async () => {
    if (initialSession && initialCurrentGroup) {
      console.log('🧪 Test mode: Ending all groups would be handled by automation');
      return;
    }
    
    try {
      // End all groups
      for (const group of session?.groups || []) {
        await FirestoreGroupSessionService.endGroup(sessionId, group.groupId);
      }
    } catch (error) {
      console.error('Failed to end all groups:', error);
    }
  };



  const handleMonitorGroup = (groupId: string) => {
    // For now, just log - in a real implementation, this might navigate to the group
    console.log('Monitoring group:', groupId);
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
            {t('shared.actions.leaveSession')}
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
            {t('shared.common.sessionNotFound')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('shared.common.sessionNotFoundDescription')}
          </p>
          <button
            onClick={onLeaveSession}
            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600"
          >
            {t('shared.actions.leaveSession')}
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
              session={sessionContext!}
              participants={getCurrentParticipants(sessionContext!)}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isHost={isHost}
              onComplete={() => {
                if (isHost) {
                  FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'listening');
                }
              }}
              hideVideo={!!(initialSession && initialCurrentGroup)}
            />
        );

      case 'listening':
        switch (currentUserRole) {
          case 'speaker':
            return (
              <SpeakerInterface
                session={sessionContext!}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={getCurrentParticipants(sessionContext!)}
                videoCall={videoCall}
              />
            );
          case 'listener':
            return (
              <ListenerInterface
                session={sessionContext!}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={getCurrentParticipants(sessionContext!)}
                videoCall={videoCall}
              />
            );
          case 'scribe':
            return (
              <ScribeInterface
                session={sessionContext!}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                participants={getCurrentParticipants(sessionContext!)}
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
              session={sessionContext!}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              participants={getCurrentParticipants(sessionContext!)}
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
        // Skip scribe feedback for 2-person groups (no scribe role)
        if (currentGroup.participants.length === 2) {
          // For 2-person groups, transition directly to next round or completion
          const totalRounds = 2;
          if (currentGroup.roundNumber >= totalRounds) {
            // Session complete
            if (isHost) {
              FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'completion');
            }
            return (
              <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Session complete! Moving to completion phase...
                  </p>
                </div>
              </div>
            );
          } else {
            // Continue to next round
            if (isHost) {
              FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'listening');
            }
            return (
              <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Moving to next round...
                  </p>
                </div>
              </div>
            );
          }
        }
        
        // For 3+ person groups, show scribe feedback
        return (
          <ScribeFeedback
            session={sessionContext!}
            participants={currentGroup.participants}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onComplete={() => {
              if (isHost) {
                FirestoreGroupSessionService.updateGroupPhase(sessionId, groupId, 'listening');
              }
            }}
            isHost={isHost}
            notes={currentGroup.scribeNotes?.[currentGroup.roundNumber] || ''}
          />
        );

      case 'completion':
        return (
          <SessionCompletion
            currentRound={currentGroup.roundNumber}
            totalRounds={currentGroup.participants.length === 2 ? 2 : currentGroup.participants.length === 3 ? 3 : 4}
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
            session={sessionContext!}
            participants={currentGroup.participants}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
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
                {t('shared.actions.leaveSession')}
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-primary-900 dark:text-primary-100 truncate">
                {session.sessionName} - {t('dialectic.dashboard.group.title', { name: groupId.replace('group-', '') })}
              </h1>
              <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                {t('shared.common.roundProgress', { current: currentGroup.roundNumber, total: currentGroup.participants.length === 2 ? 2 : currentGroup.participants.length === 3 ? 3 : 4 })}
              </p>
              {initialSession && initialCurrentGroup && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  🧪 Test Environment - Video Disabled
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                {t(`dialectic.roles.${currentUserRole}.title`)}
              </div>
              {isHost && session.groupMode === 'multi' && (
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
                >
                  {showDashboard ? t('dialectic.dashboard.hideDashboard') : t('dialectic.dashboard.showDashboard')}
                </button>
              )}
              <button
                onClick={onLeaveSession}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
              >
                {t('shared.actions.leaveSession')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderPhaseContent()}
      </div>

      {/* Host controls */}
      {isHost && currentGroup.currentPhase === 'listening' && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6">
          <button
            onClick={handleCompleteRound}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 shadow-lg text-sm sm:text-base"
          >
            {t('dialectic.session.completeRound')}
          </button>
        </div>
      )}

      {/* Dashboard Overlay */}
      {showDashboard && isHost && session.groupMode === 'multi' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('dialectic.dashboard.title')} - {session.sessionName}
              </h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
              <GroupManagementDashboard
                session={{
                  sessionId: session.sessionId,
                  sessionName: session.sessionName,
                  topic: session.topic,
                  duration: session.duration
                }}
                groups={session.groups}
                onStartGroup={handleStartGroup}
                onPauseGroup={handlePauseGroup}
                onEndGroup={handleEndGroup}
                onStartAllGroups={handleStartAllGroups}
                onPauseAllGroups={handlePauseAllGroups}
                onEndAllGroups={handleEndAllGroups}
                onMonitorGroup={handleMonitorGroup}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

