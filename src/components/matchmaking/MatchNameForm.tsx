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
    <div className="max-w-md mx-auto p-6 sm:p-10" data-testid="match-name-form">
      <div className="surface-panel p-6 sm:p-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2 text-center">
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
            className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-white/15 bg-white/90 dark:bg-secondary-900/60 text-secondary-900 dark:text-secondary-100"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            {t('shared.actions.back')}
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            data-testid="match-name-submit"
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? t('matchmaking.nameForm.joining') : t('matchmaking.nameForm.submit')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};
