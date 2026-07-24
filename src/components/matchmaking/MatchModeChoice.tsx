import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { MatchMode } from '../../types/matchmaking';

interface MatchModeChoiceProps {
  onSelect: (mode: MatchMode) => void;
}

export const MatchModeChoice: React.FC<MatchModeChoiceProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto p-6" data-testid="match-mode-choice">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          {t('matchmaking.modeChoice.title')}
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400">
          {t('matchmaking.modeChoice.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          data-testid="match-mode-curious"
          onClick={() => onSelect('curious')}
          className="text-left p-6 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:border-accent-500 dark:hover:border-accent-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            {t('matchmaking.modeChoice.curious.title')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-3">
            {t('matchmaking.modeChoice.curious.description')}
          </p>
          <p className="text-accent-700 dark:text-accent-300 text-sm font-medium">
            {t('matchmaking.modeChoice.curious.detail')}
          </p>
        </button>

        <button
          type="button"
          data-testid="match-mode-full"
          onClick={() => onSelect('full')}
          className="text-left p-6 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:border-accent-500 dark:hover:border-accent-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            {t('matchmaking.modeChoice.full.title')}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-3">
            {t('matchmaking.modeChoice.full.description')}
          </p>
          <p className="text-accent-700 dark:text-accent-300 text-sm font-medium">
            {t('matchmaking.modeChoice.full.detail')}
          </p>
        </button>
      </div>
    </div>
  );
};
