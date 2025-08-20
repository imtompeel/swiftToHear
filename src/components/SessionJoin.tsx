import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionData, JoinData } from '../types/sessionTypes';

interface SessionJoinProps {
  session: SessionData | null;
  onJoinSession: (joinData: JoinData) => void;
  currentUserId: string;
  currentUserName: string;
  isFirstTime?: boolean;
}

const SessionJoin: React.FC<SessionJoinProps> = ({ 
  session, 
  onJoinSession, 
  currentUserId, 
  currentUserName,
  isFirstTime = false 
}) => {
  const { t } = useTranslation();
  const [nameInput, setNameInput] = useState(currentUserName);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string>('');

  // Handle case where session doesn't exist
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('shared.common.sessionNotFound')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('shared.common.sessionNotFoundDescription')}
            </p>
            <a 
              href="/practice/create" 
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('shared.actions.createNewSession')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleJoinSession = async () => {
    if (!nameInput || nameInput.trim() === '' || !session) {
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const joinData: JoinData = {
        sessionId: session.sessionId,
        userId: currentUserId,
        userName: nameInput.trim(),
        role: '' // No role - will be chosen in the lobby
      };

      await onJoinSession(joinData);
    } catch (error) {
      setJoinError(t('dialectic.join.error'));
    } finally {
      setIsJoining(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    return Math.floor(milliseconds / 60000);
  };

  const formatDate = (date: Date | any) => {
    // Handle Firestore Timestamp
    const dateObj = date?.toDate ? date.toDate() : date;
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate participant count for display
  const mobileParticipants = session.sessionType === 'in-person' 
    ? session.participants.filter(p => p.id !== session.hostId)
    : session.participants;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('shared.actions.joinPracticeSession')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {session.sessionName}
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {mobileParticipants.length} of {session.maxParticipants} participants
          </div>
        </div>

        {/* First-time user guidance */}
        {isFirstTime && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {t('shared.common.welcomeToDialectic')}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              {t('dialectic.join.firstTimeDescription')}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Step 1:</strong> Enter your name and join the session.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              You'll choose your role in the lobby.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('shared.common.name')}
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
              data-testid="name-input"
            />
          </div>

          <button
            onClick={handleJoinSession}
            disabled={!nameInput || nameInput.trim() === '' || isJoining}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            data-testid="join-session-button"
          >
            {isJoining ? t('dialectic.join.joining') : t('shared.actions.joinSession')}
          </button>
          
          {joinError && (
            <div className="text-red-600 dark:text-red-400 text-sm" data-testid="join-error">
              {joinError}
            </div>
          )}
        </div>

        {/* Session Information */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Session Details
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">{t('shared.common.duration')}:</span>
              <span className="ml-2">{formatDuration(session.duration)} {t('shared.common.minutes')}</span>
            </div>
            <div>
              <span className="font-medium">{t('shared.common.host')}:</span>
              <span className="ml-2">{session.hostName}</span>
            </div>
            {session.topic && (
              <div>
                <span className="font-medium">{t('shared.common.topic')}:</span>
                <span className="ml-2">{session.topic}</span>
              </div>
            )}
            <div>
              <span className="font-medium">{t('shared.common.created')}:</span>
              <span className="ml-2">{formatDate(session.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SessionJoin }; 