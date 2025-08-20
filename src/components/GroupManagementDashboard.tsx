import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { GroupData, GroupProgress } from '../types/groupSession';

interface GroupManagementDashboardProps {
  session: {
    sessionId: string;
    sessionName: string;
    topic: string;
    duration: number;
  };
  groups: GroupData[];
  onStartGroup: (groupId: string) => void;
  onPauseGroup: (groupId: string) => void;
  onEndGroup: (groupId: string) => void;
  onStartAllGroups: () => void;
  onPauseAllGroups: () => void;
  onEndAllGroups: () => void;
  onMonitorGroup: (groupId: string) => void;
}

export const GroupManagementDashboard: React.FC<GroupManagementDashboardProps> = ({
  session,
  groups,
  onStartGroup,
  onPauseGroup,
  onEndGroup,
  onStartAllGroups,
  onPauseAllGroups,
  onEndAllGroups,
  onMonitorGroup,
}) => {
  const { t } = useTranslation();

  const getGroupStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getGroupStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('dialectic.dashboard.groupStatus.active');
      case 'paused':
        return t('dialectic.dashboard.groupStatus.paused');
      case 'completed':
        return t('dialectic.dashboard.groupStatus.completed');
      default:
        return t('dialectic.dashboard.groupStatus.waiting');
    }
  };

  const getGroupProgress = (group: GroupData): GroupProgress => {
            const totalRounds = group.participants.length === 2 ? 2 : group.participants.length === 3 ? 3 : 4;
    
    // Calculate completed rounds based on current phase and round number
    let completedRounds = 0;
    
    if (group.currentPhase === 'completion' || group.status === 'completed') {
      // Session is complete, all rounds done
      completedRounds = totalRounds;
    } else if (group.currentPhase === 'transition') {
      // In scribe feedback phase, current round is in progress
      completedRounds = group.roundNumber - 1;
    } else if (group.currentPhase === 'listening') {
      // In listening phase, previous rounds are complete
      completedRounds = group.roundNumber - 1;
    } else if (group.currentPhase === 'hello-checkin') {
      // Still in check-in, no rounds completed yet
      completedRounds = 0;
    } else {
      // Default fallback
      completedRounds = Math.max(0, group.roundNumber - 1);
    }
    

    
    return {
      groupId: group.groupId,
      completedRounds,
      totalRounds,
      averageSpeakingTime: 0, // This would be calculated from actual data
      participationRate: 1.0 // This would be calculated from actual data
    };
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.dashboard.title')}
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {session.sessionName} • {session.topic}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-primary-900 dark:text-primary-100">
                  {t('shared.common.duration')}:
                </span>
                <span className="text-secondary-600 dark:text-secondary-400 ml-2">
                  {formatTime(session.duration)}
                </span>
              </div>
              <div>
                <span className="font-medium text-primary-900 dark:text-primary-100">
                  {t('dialectic.dashboard.sessionInfo.groups')}:
                </span>
                <span className="text-secondary-600 dark:text-secondary-400 ml-2">
                  {groups.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-primary-900 dark:text-primary-100">
                  {t('shared.common.totalParticipants')}:
                </span>
                <span className="text-secondary-600 dark:text-secondary-400 ml-2">
                  {groups.reduce((total, group) => total + group.participants.length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Global Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onStartAllGroups}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              {t('dialectic.dashboard.actions.startAll')}
            </button>
            <button
              onClick={onPauseAllGroups}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              {t('dialectic.dashboard.actions.pauseAll')}
            </button>
            <button
              onClick={onEndAllGroups}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              {t('dialectic.dashboard.actions.endAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => {
          const progress = getGroupProgress(group);
          const groupLetter = String.fromCharCode(65 + index);
          
          return (
            <div key={group.groupId} className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getGroupStatusColor(group.status)}`}></div>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {t('dialectic.dashboard.group.title', { name: groupLetter })}
                  </h3>
                </div>
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {group.participants.length} {t('shared.common.participants')}
                </span>
              </div>

              {/* Group Status */}
              <div className="mb-4">
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                  {getGroupStatusText(group.status)}
                </p>
                {group.status === 'active' && (
                  <div className="space-y-2">
                    <p className="text-sm text-primary-900 dark:text-primary-100">
                      {t('dialectic.dashboard.group.phase', { phase: group.currentPhase })}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {t('dialectic.dashboard.group.round', { current: group.roundNumber, total: progress.totalRounds })}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-secondary-600 dark:text-secondary-400 mb-1">
                  <span>{t('dialectic.dashboard.group.progress')}</span>
                  <span>{progress.completedRounds}/{progress.totalRounds}</span>
                </div>
                <div className="w-full bg-secondary-200 dark:bg-secondary-600 rounded-full h-2">
                  <div 
                    className="bg-accent-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(progress.completedRounds / progress.totalRounds) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Participants */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
                  {t('shared.common.participants')}
                </h4>
                <div className="space-y-1">
                  {group.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between text-xs">
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

              {/* Group Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onMonitorGroup(group.groupId)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                >
                  {t('dialectic.dashboard.group.actions.monitor')}
                </button>
                
                {group.status === 'waiting' && (
                  <button
                    onClick={() => onStartGroup(group.groupId)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs"
                  >
                    {t('dialectic.dashboard.group.actions.start')}
                  </button>
                )}
                
                {group.status === 'active' && (
                  <button
                    onClick={() => onPauseGroup(group.groupId)}
                    className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs"
                  >
                    {t('dialectic.dashboard.group.actions.pause')}
                  </button>
                )}
                
                {group.status === 'paused' && (
                  <button
                    onClick={() => onStartGroup(group.groupId)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs"
                  >
                    {t('dialectic.dashboard.group.actions.resume')}
                  </button>
                )}
                
                <button
                  onClick={() => onEndGroup(group.groupId)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                >
                  {t('dialectic.dashboard.group.actions.end')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">
          {t('dialectic.dashboard.summary.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {groups.filter(g => g.status === 'active').length}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('dialectic.dashboard.summary.activeGroups')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {groups.filter(g => g.status === 'paused').length}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('dialectic.dashboard.summary.pausedGroups')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {groups.filter(g => g.status === 'completed').length}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('dialectic.dashboard.summary.completedGroups')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
              {groups.reduce((total, group) => total + group.participants.length, 0)}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('shared.common.totalParticipants')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

