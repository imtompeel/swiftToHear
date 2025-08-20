import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionPreviewProps {
  sessionType: 'video' | 'in-person';
  selectedDuration: number;
  hostRole: 'participant' | 'observer-permanent';
  maxParticipants: number;
}

const SessionPreview: React.FC<SessionPreviewProps> = ({
  sessionType,
  selectedDuration,
  hostRole,
  maxParticipants
}) => {
  const { t } = useTranslation();

  const formatDuration = (milliseconds: number) => {
    return Math.floor(milliseconds / 60000);
  };

  const calculateTotalSessionTime = (roundLengthMinutes: number) => {
    const checkInTime = 2.5;
    const feedbackTime = 2.5;
    const totalPerRound = roundLengthMinutes + checkInTime + feedbackTime;
    const estimatedRounds = 3;
    return Math.round(totalPerRound * estimatedRounds);
  };

  return (
    <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-2" data-testid="session-preview">
      <h3 className="font-medium text-primary-900 dark:text-primary-100">
        {t('dialectic.creation.preview.title')}
      </h3>
      <div className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
        <p><strong>{t('dialectic.creation.preview.sessionType', { type: t(`dialectic.creation.sessionType.${sessionType === 'video' ? 'video' : 'inPerson'}.title`) })}</strong></p>
        <p>{t('dialectic.creation.preview.roundLength', { minutes: formatDuration(selectedDuration) })}</p>
        <p>{t('dialectic.creation.preview.estimatedTotal', { minutes: Math.round(calculateTotalSessionTime(formatDuration(selectedDuration)) * (sessionType === 'in-person' ? maxParticipants / 3 : 1)) })}</p>
        <p>{t('dialectic.creation.preview.format')}</p>
        <p>{t('dialectic.creation.preview.hostRole', { role: hostRole === 'participant' ? t('dialectic.creation.hostRole.participant.title') : t('shared.common.permanentObserver') })}</p>
        <p>{t('dialectic.creation.preview.groupConfig', { 
          size: t('dialectic.creation.groupConfig.groupSize.mixed'),
          strategy: t('dialectic.creation.groupConfig.observerStrategy.distribute.title')
        })}</p>
        {sessionType === 'in-person' && (
          <p><strong>{t('dialectic.creation.participantLimits.preview', { count: maxParticipants })}</strong></p>
        )}
      </div>
    </div>
  );
};

export default SessionPreview;
