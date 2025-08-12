import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { GroupData, Participant, GroupConfiguration } from '../types/groupSession';
import { GroupAssignmentService } from '../services/groupAssignmentService';

interface GroupSessionLobbyProps {
  session: {
    sessionId: string;
    sessionName: string;
    participants: Participant[];
    groupConfiguration?: GroupConfiguration;
  };
  currentUserId: string;
  isHost: boolean;
  onStartSession: (sessionId: string) => void;
  onLeaveSession: (userId: string) => void;
  onUpdateReadyState: (userId: string, isReady: boolean) => void;
  onUpdateParticipantRole: (userId: string, role: string) => void;
  onModalStateChange?: (isModalOpen: boolean) => void;
}

export const GroupSessionLobby: React.FC<GroupSessionLobbyProps> = ({
  session,
  currentUserId,
  isHost,
  onStartSession,
  onLeaveSession,
  onUpdateReadyState,
}) => {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [showHostLeaveConfirmation, setShowHostLeaveConfirmation] = useState(false);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  // Generate groups when component mounts or participants change
  React.useEffect(() => {
    // Use automatic session type detection based on participant count
    const participantCount = session.participants.length;
    
    if (participantCount <= 4) {
      // Single group for 2-4 participants
      setGroups([{
        groupId: 'group-1',
        participants: session.participants,
        status: 'waiting',
        currentPhase: 'waiting',
        roundNumber: 1,
        scribeNotes: {}
      }]);
    } else {
      // Multiple groups for 5+ participants
      if (session.groupConfiguration) {
        const generatedGroups = GroupAssignmentService.assignGroups(
          session.participants,
          session.groupConfiguration
        );
        setGroups(generatedGroups);
      }
    }
  }, [session.participants, session.groupConfiguration]);



  const readyParticipants = session.participants.filter(p => p.status === 'ready');
  const readyNonHostParticipants = session.participants.filter(p => p.status === 'ready' && p.id !== currentUserId);
  const nonHostParticipants = session.participants.filter(p => p.id !== currentUserId);
  const allNonHostParticipantsReady = readyNonHostParticipants.length === nonHostParticipants.length && nonHostParticipants.length > 0;
  const canStartSession = isHost && (allNonHostParticipantsReady || session.participants.length === 1);


  const handleReadyToggle = () => {
    setIsReady(!isReady);
    onUpdateReadyState(currentUserId, !isReady);
  };

  const handleStartSession = () => {
    setShowStartConfirmation(true);
  };

  const confirmStartSession = () => {
    onStartSession(session.sessionId);
    setShowStartConfirmation(false);
  };

  const handleLeaveSession = () => {
    if (isHost) {
      setShowHostLeaveConfirmation(true);
    } else {
      onLeaveSession(currentUserId);
    }
  };

  const confirmLeaveSession = () => {
    onLeaveSession(currentUserId);
    setShowHostLeaveConfirmation(false);
  };

  const handleShuffleGroups = () => {
    // Only allow shuffling for multiple groups (5+ participants)
    if (session.participants.length > 4 && session.groupConfiguration) {
      setIsShuffling(true);
      // Simulate shuffling delay
      setTimeout(() => {
        const shuffledGroups = GroupAssignmentService.shuffleGroups([...groups]);
        setGroups(shuffledGroups);
        setIsShuffling(false);
      }, 500);
    }
  };

  const copySessionLink = async () => {
    const link = `${window.location.origin}/practice/join/${session.sessionId}`;
    try {
      await navigator.clipboard.writeText(link);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          {t('dialectic.lobby.groupSession.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('dialectic.lobby.groupSession.description')}
        </p>
      </div>

      {/* Session Info */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.lobby.sessionInfo.title')}
            </h3>
            <div className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
              <p><strong>{t('dialectic.lobby.sessionInfo.name')}:</strong> {session.sessionName}</p>
              <p><strong>{t('dialectic.lobby.sessionInfo.participants')}:</strong> {session.participants.filter(p => p.id !== currentUserId).length}</p>
              <p><strong>{t('dialectic.lobby.sessionInfo.mode')}:</strong> {t('dialectic.creation.sessionType.adaptive.title')}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.lobby.participantStatus.title')}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-secondary-600 dark:text-secondary-400">
                {t('dialectic.lobby.participantStatus.ready', { 
                  count: readyParticipants.filter(p => p.id !== currentUserId).length, 
                  total: session.participants.filter(p => p.id !== currentUserId).length 
                })}
              </p>
              <div className="w-full bg-secondary-200 dark:bg-secondary-600 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(readyParticipants.filter(p => p.id !== currentUserId).length / Math.max(session.participants.filter(p => p.id !== currentUserId).length, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.lobby.actions.title')}
            </h3>
            <div className="space-y-2">
              <button
                onClick={copySessionLink}
                className="w-full px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-sm"
              >
                {t('dialectic.lobby.actions.copyLink')}
              </button>
              {isHost && session.participants.length > 4 && (
                <button
                  onClick={handleShuffleGroups}
                  disabled={isShuffling}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-secondary-300 transition-colors text-sm"
                >
                  {isShuffling ? t('dialectic.lobby.actions.shuffling') : t('dialectic.lobby.actions.shuffleGroups')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group Assignment Preview */}
      {session.participants.length > 4 && (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
            {t('dialectic.lobby.groupPreview.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups && groups.map((group, index) => (
              <div key={group.groupId} className="border border-secondary-200 dark:border-secondary-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                    {t('dialectic.lobby.groupPreview.groupName', { name: String.fromCharCode(65 + index) })}
                  </h3>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    {group.participants.length} {t('dialectic.lobby.groupPreview.participants')}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between text-sm">
                      <span className="text-secondary-700 dark:text-secondary-300">
                        {participant.name}
                      </span>
                      {participant.role && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          participant.role === 'speaker' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          participant.role === 'listener' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          participant.role === 'scribe' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {t(`dialectic.roles.${participant.role}.title`)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participant List */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
          {t('dialectic.lobby.participantList.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {session.participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-3 border border-secondary-200 dark:border-secondary-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  participant.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-primary-900 dark:text-primary-100">
                  {participant.name}
                </span>
                {participant.id === currentUserId && (
                  <span className="text-xs bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200 px-2 py-1 rounded">
                    {t('dialectic.lobby.participantList.you')}
                  </span>
                )}
              </div>
              {participant.role && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  participant.role === 'speaker' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  participant.role === 'listener' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  participant.role === 'scribe' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {t(`dialectic.roles.${participant.role}.title`)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isHost && (
          <button
            onClick={handleReadyToggle}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isReady
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-900 dark:text-secondary-100 hover:bg-secondary-300 dark:hover:bg-secondary-500'
            }`}
          >
            {isReady ? t('dialectic.lobby.actions.ready') : t('dialectic.lobby.actions.notReady')}
          </button>
        )}

        {isHost && canStartSession && (
          <button
            onClick={handleStartSession}
            className="px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-medium"
          >
            {t('shared.actions.startSession')}
          </button>
        )}

        <button
          onClick={handleLeaveSession}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
        >
          {isHost ? t('dialectic.lobby.actions.cancelSession') : t('shared.actions.leaveSession')}
        </button>
      </div>

      {/* Confirmation Modals */}
      {showStartConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">
              {t('shared.actions.startSession')}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {t('dialectic.lobby.confirmStart.description')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowStartConfirmation(false)}
                className="px-4 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
              >
                {t('dialectic.lobby.confirmStart.cancel')}
              </button>
              <button
                onClick={confirmStartSession}
                className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600"
              >
                {t('shared.actions.startSession')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHostLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
              {t('shared.actions.leaveSession')}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {t('dialectic.lobby.confirmLeave.description')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowHostLeaveConfirmation(false)}
                className="px-4 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
              >
                {t('dialectic.lobby.confirmLeave.cancel')}
              </button>
              <button
                onClick={confirmLeaveSession}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {t('dialectic.lobby.confirmLeave.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
