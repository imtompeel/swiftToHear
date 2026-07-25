import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

type PracticeEntryTone = 'onDark' | 'onLight';

interface PracticeEntryCTAsProps {
  /** onDark: invitation band; onLight: mesh / light surfaces */
  tone?: PracticeEntryTone;
}

/**
 * Shared entry actions shown on every audience path:
 * roulette matching + invited (host/join) groups.
 */
export const PracticeEntryCTAs: React.FC<PracticeEntryCTAsProps> = ({
  tone = 'onDark',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const onDark = tone === 'onDark';

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = sessionId.trim();
    if (!id) return;
    navigate(`/practice/join/${encodeURIComponent(id)}`);
  };

  const tileClass = onDark
    ? 'rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 p-5 transition-all duration-200 text-left backdrop-blur-sm'
    : 'choice-tile';

  const titleClass = onDark
    ? 'font-display text-xl font-semibold text-white mb-2'
    : 'font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2';

  const bodyClass = onDark
    ? 'text-sm text-accent-100/90 mb-3 leading-relaxed'
    : 'text-sm text-secondary-600 dark:text-secondary-400 mb-3 leading-relaxed';

  const actionClass = onDark
    ? 'text-sm font-semibold text-white'
    : 'text-sm font-semibold text-accent-700 dark:text-accent-300';

  return (
    <div className="space-y-6" data-testid="practice-entry-ctas">
      <div className="grid sm:grid-cols-2 gap-4 text-left">
        <Link to="/practice/match" data-testid="cta-roulette" className={`block ${tileClass}`}>
          <h3 className={titleClass}>{t('audience.ctas.roulette.title')}</h3>
          <p className={bodyClass}>{t('audience.ctas.roulette.description')}</p>
          <span className={actionClass}>{t('audience.ctas.roulette.action')} →</span>
        </Link>

        <div className={tileClass}>
          <h3 className={titleClass}>{t('audience.ctas.invited.title')}</h3>
          <p className={`${bodyClass} mb-4`}>{t('audience.ctas.invited.description')}</p>
          <div className="flex flex-col gap-2">
            <Link
              to="/practice/create"
              data-testid="cta-invited-start"
              className={
                onDark
                  ? 'inline-flex justify-center px-4 py-2.5 rounded-xl bg-white text-accent-800 font-semibold text-sm hover:bg-accent-50 transition-colors'
                  : 'btn-primary text-sm py-2.5'
              }
            >
              {t('audience.ctas.invited.start')}
            </Link>
            <button
              type="button"
              data-testid="cta-invited-join-toggle"
              onClick={() => setShowJoin((v) => !v)}
              className={
                onDark
                  ? 'inline-flex justify-center px-4 py-2.5 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors'
                  : 'btn-secondary text-sm py-2.5'
              }
            >
              {t('audience.ctas.invited.join')}
            </button>
          </div>
        </div>
      </div>

      {showJoin && (
        <form
          onSubmit={handleJoin}
          className={
            onDark
              ? 'rounded-2xl border border-white/20 bg-black/25 p-4 text-left backdrop-blur-sm'
              : 'surface-panel p-4 text-left'
          }
          data-testid="cta-invited-join-form"
        >
          <label
            className={
              onDark
                ? 'block text-sm text-accent-100 mb-2'
                : 'block text-sm text-secondary-600 dark:text-secondary-300 mb-2'
            }
            htmlFor="invite-session-id"
          >
            {t('audience.ctas.invited.sessionIdLabel')}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="invite-session-id"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder={t('audience.ctas.invited.sessionIdPlaceholder')}
              className="flex-1 px-3 py-2.5 rounded-xl text-secondary-900 border border-transparent focus:border-accent-500"
              required
            />
            <button
              type="submit"
              className={
                onDark
                  ? 'px-4 py-2.5 rounded-xl bg-white text-accent-800 font-semibold text-sm'
                  : 'btn-primary text-sm py-2.5'
              }
            >
              {t('audience.ctas.invited.joinSubmit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
