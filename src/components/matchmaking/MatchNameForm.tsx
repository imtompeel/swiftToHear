import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface MatchNameFormProps {
  defaultName?: string;
  onSubmit: (name: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export const MatchNameForm: React.FC<MatchNameFormProps> = ({
  defaultName = '',
  onSubmit,
  onBack,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  return (
    <div className="max-w-md mx-auto p-6" data-testid="match-name-form">
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2 text-center">
        {t('matchmaking.nameForm.title')}
      </h1>
      <p className="text-secondary-600 dark:text-secondary-400 mb-6 text-center">
        {t('matchmaking.nameForm.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="sr-only">{t('matchmaking.nameForm.label')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('matchmaking.nameForm.placeholder')}
            maxLength={40}
            required
            disabled={loading}
            autoFocus
            data-testid="match-name-input"
            className="w-full px-4 py-3 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-200"
          >
            {t('shared.actions.back')}
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            data-testid="match-name-submit"
            className="flex-1 px-4 py-3 rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? t('matchmaking.nameForm.joining') : t('matchmaking.nameForm.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
