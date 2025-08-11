import React from 'react';
import { SessionParticipant } from '../../types/sessionContext';
import { useTranslation } from '../../hooks/useTranslation';

interface RaisedHandIndicatorProps {
  participants: SessionParticipant[];
  className?: string;
  showForRole?: 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent';
}

export const RaisedHandIndicator: React.FC<RaisedHandIndicatorProps> = ({
  participants,
  className = '',
  showForRole = 'speaker'
}) => {
  const { t } = useTranslation();
  const hasRaisedHand = participants.some(p => p.role === 'listener' && p.handRaised);

  // Only show for speakers (and optionally other roles, but not for listeners)
  if (!hasRaisedHand || showForRole === 'listener') {
    return null;
  }

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-lg p-4 mb-4 border border-amber-200 dark:border-amber-700 ${className}`}>
      <div className="flex items-center justify-center space-x-3">
        <span className="text-2xl">🤚</span>
        <div className="text-center">
          <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200">
            {t('dialectic.assistance.speaker.raisedHand.title')}
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t('dialectic.assistance.speaker.raisedHand.description')}
          </p>
        </div>
      </div>
    </div>
  );
};
