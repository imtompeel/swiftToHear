import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import {
  getCurrentChallenge,
  unlockChristadelphianGate,
  verifyChristadelphianAnswer,
} from '../services/christadelphianGate';

interface ChristadelphianGateFormProps {
  onUnlocked: () => void;
}

export const ChristadelphianGateForm: React.FC<ChristadelphianGateFormProps> = ({
  onUnlocked,
}) => {
  const { t } = useTranslation();
  const challenge = getCurrentChallenge();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge.answer) {
      setError(t('christadelphianGate.notConfigured'));
      return;
    }
    if (verifyChristadelphianAnswer(answer)) {
      unlockChristadelphianGate();
      onUnlocked();
      return;
    }
    setError(t('christadelphianGate.incorrect'));
  };

  return (
    <div className="min-h-[70vh] px-4 py-16 sm:py-24" data-testid="christadelphian-gate">
      <div className="max-w-md mx-auto surface-panel p-8">
        <h1 className="font-display text-3xl font-semibold text-secondary-900 dark:text-secondary-50 mb-3 text-center">
          {t('christadelphianGate.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 text-center mb-8 leading-relaxed">
          {t('christadelphianGate.subtitle')}
        </p>

        <div className="rounded-xl border border-accent-200/80 dark:border-accent-700/50 bg-accent-50/60 dark:bg-accent-950/30 px-4 py-3 mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-accent-700 dark:text-accent-300 mb-1">
            {t('christadelphianGate.clueLabel')}
          </p>
          <p
            className="font-mono text-lg font-semibold text-secondary-900 dark:text-secondary-50"
            data-testid="christadelphian-gate-clue"
          >
            {challenge.clue}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
              {t('christadelphianGate.answerLabel')}
            </span>
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError(null);
              }}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              data-testid="christadelphian-gate-answer"
              className="input-field"
              placeholder={t('christadelphianGate.answerPlaceholder')}
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" data-testid="christadelphian-gate-submit">
            {t('christadelphianGate.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
          <Link
            to="/christadelphian"
            className="underline-offset-2 hover:underline hover:text-accent-600 dark:hover:text-accent-300"
          >
            {t('christadelphianGate.back')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChristadelphianGateForm;
