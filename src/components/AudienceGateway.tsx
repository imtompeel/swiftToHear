import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAudiencePreference } from '../hooks/useAudiencePreference';
import {
  AudiencePreference,
  pathForAudience,
} from '../services/audiencePreference';

const CHOICES: Array<{
  id: AudiencePreference;
  titleKey: string;
  descriptionKey: string;
}> = [
  {
    id: 'church',
    titleKey: 'audience.gateway.church.title',
    descriptionKey: 'audience.gateway.church.description',
  },
  {
    id: 'open',
    titleKey: 'audience.gateway.open.title',
    descriptionKey: 'audience.gateway.open.description',
  },
];

export const AudienceGateway: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { preference, setPreference, clearPreference } = useAudiencePreference();
  const forceChooser = searchParams.get('choose') === '1';

  useEffect(() => {
    if (forceChooser) return;
    if (preference) {
      navigate(pathForAudience(preference), { replace: true });
    }
  }, [preference, forceChooser, navigate]);

  useEffect(() => {
    if (forceChooser && preference) {
      clearPreference();
    }
  }, [forceChooser, preference, clearPreference]);

  const choose = (next: AudiencePreference) => {
    // Christadelphian path is hymn-book gated; only set preference after unlock.
    if (next !== 'christadelphian') {
      setPreference(next);
    }
    navigate(pathForAudience(next));
  };

  if (preference && !forceChooser) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8" data-testid="audience-gateway-redirect">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-500/30 border-t-accent-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] px-4 py-16 sm:py-24 overflow-hidden" data-testid="audience-gateway">
      <div
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-50"
        aria-hidden
      >
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-accent-300/40 dark:bg-accent-600/20 blur-3xl animate-fade-up" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-primary-300/40 dark:bg-primary-600/20 blur-3xl animate-fade-up [animation-delay:120ms]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-secondary-900 dark:text-secondary-50 mb-5 animate-fade-up">
          {t('shared.common.siteName')}
        </h1>
        <p className="text-xl sm:text-2xl text-secondary-600 dark:text-secondary-300 mb-3 animate-fade-up [animation-delay:80ms]">
          {t('audience.gateway.title')}
        </p>
        <p className="text-base sm:text-lg text-secondary-500 dark:text-secondary-400 mb-12 max-w-2xl mx-auto animate-fade-up [animation-delay:140ms]">
          {t('audience.gateway.subtitle')}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
          {CHOICES.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              data-testid={`audience-choice-${choice.id}`}
              onClick={() => choose(choice.id)}
              className="choice-tile animate-fade-up"
              style={{ animationDelay: `${180 + index * 60}ms` }}
            >
              <h2 className="font-display text-2xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2">
                {t(choice.titleKey)}
              </h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                {t(choice.descriptionKey)}
              </p>
              <span className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                {t('audience.gateway.continue')} →
              </span>
            </button>
          ))}
        </div>

        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          {t('audience.gateway.delphPrompt')}{' '}
          <button
            type="button"
            data-testid="audience-choice-christadelphian"
            onClick={() => choose('christadelphian')}
            className="text-accent-700 dark:text-accent-300 font-medium underline-offset-2 hover:underline"
          >
            {t('audience.gateway.delphLink')}
          </button>
        </p>

        <p className="mt-8 text-xs text-secondary-400 dark:text-secondary-500">
          {t('audience.gateway.rememberHint')}
        </p>

        <p className="mt-6">
          <Link
            to="/welcome"
            onClick={() => setPreference('open')}
            className="text-xs text-secondary-400 dark:text-secondary-500 hover:text-accent-600 dark:hover:text-accent-300 underline-offset-2 hover:underline"
          >
            {t('audience.gateway.skipOpen')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AudienceGateway;
