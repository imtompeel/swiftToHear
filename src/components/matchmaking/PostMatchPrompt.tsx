import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { MatchMode } from '../../types/matchmaking';

interface PostMatchPromptProps {
  mode: MatchMode;
  onFindAnother: () => void;
  onLeave: () => void;
}

export const PostMatchPrompt: React.FC<PostMatchPromptProps> = ({
  mode,
  onFindAnother,
  onLeave,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="max-w-md mx-auto p-6 text-center"
      data-testid="post-match-prompt"
    >
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-3">
        {t('matchmaking.postMatch.title')}
      </h1>
      <p className="text-secondary-600 dark:text-secondary-400 mb-8">
        {t('matchmaking.postMatch.description', {
          mode: t(`matchmaking.modeChoice.${mode}.title`),
        })}
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          data-testid="post-match-find-another"
          onClick={onFindAnother}
          className="w-full px-6 py-3 rounded-lg bg-accent-600 text-white hover:bg-accent-700 font-medium"
        >
          {t('matchmaking.postMatch.findAnother')}
        </button>
        <button
          type="button"
          data-testid="post-match-leave"
          onClick={onLeave}
          className="w-full px-6 py-3 rounded-lg border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-200"
        >
          {t('matchmaking.postMatch.leave')}
        </button>
      </div>
    </div>
  );
};
