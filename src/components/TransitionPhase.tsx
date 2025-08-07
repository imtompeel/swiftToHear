import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TransitionPhaseProps {
  currentRole?: string | null;
  nextRole?: string | null;
  roundNumber?: number;
}

export const TransitionPhase: React.FC<TransitionPhaseProps> = ({
  currentRole,
  nextRole,
  roundNumber,
}) => {
  const { t } = useTranslation();

  return (
    <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.switchingRoles')}
          </h1>
          <div data-testid="transition-guidance" className="space-y-4">
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              {t('dialectic.session.transitionMessage')}
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};