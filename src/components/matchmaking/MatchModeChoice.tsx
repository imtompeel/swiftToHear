import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { PracticeDemoVideo } from '../PracticeDemoVideo';
import type { AudiencePreference } from '../../services/audiencePreference';
import type { MatchMode } from '../../types/matchmaking';

interface MatchModeChoiceProps {
  audience: AudiencePreference;
  onSelect: (mode: MatchMode) => void;
}

export const MatchModeChoice: React.FC<MatchModeChoiceProps> = ({ audience, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10" data-testid="match-mode-choice">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-secondary-900 dark:text-secondary-50 mb-4">
          {t('matchmaking.modeChoice.title')}
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-2">
          {t('matchmaking.modeChoice.subtitle')}
        </p>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          {t(`matchmaking.modeChoice.poolByAudience.${audience}`)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          data-testid="match-mode-curious"
          onClick={() => onSelect('curious')}
          className="choice-tile"
        >
          <h2 className="font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2">
            {t('matchmaking.modeChoice.curious.title')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-3 leading-relaxed">
            {t('matchmaking.modeChoice.curious.description')}
          </p>
          <p className="text-accent-700 dark:text-accent-300 text-sm font-semibold">
            {t('matchmaking.modeChoice.curious.detail')}
          </p>
        </button>

        <button
          type="button"
          data-testid="match-mode-full"
          onClick={() => onSelect('full')}
          className="choice-tile"
        >
          <h2 className="font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2">
            {t('matchmaking.modeChoice.full.title')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-3 leading-relaxed">
            {t('matchmaking.modeChoice.full.description')}
          </p>
          <p className="text-accent-700 dark:text-accent-300 text-sm font-semibold">
            {t('matchmaking.modeChoice.full.detail')}
          </p>
        </button>
      </div>

      <div className="mt-6">
        <PracticeDemoVideo variant="collapsible" density="compact" />
      </div>

      <aside
        className="mt-8 rounded-2xl border border-amber-300/80 dark:border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/40 px-4 py-4 text-left"
        role="note"
        data-testid="match-moderation-warning"
      >
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
          {t('matchmaking.moderationWarning.title')}
        </p>
        <p className="text-sm text-amber-900/90 dark:text-amber-100/90 leading-relaxed">
          {t('matchmaking.moderationWarning.body')}{' '}
          <Link
            to="/admin/safety"
            className="font-semibold underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-50"
          >
            {t('matchmaking.moderationWarning.safetyLink')}
          </Link>
        </p>
      </aside>
    </div>
  );
};
