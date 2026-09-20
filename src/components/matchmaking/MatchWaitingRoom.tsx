import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { TechCheck } from '../TechCheck';
import { PracticeDemoVideo } from '../PracticeDemoVideo';
import { stopTimerChimes } from '../../services/chimePlayer';
import type { AudiencePreference } from '../../services/audiencePreference';
import type { MatchMode, MatchRoom } from '../../types/matchmaking';
import { MATCH_TARGET_SIZE } from '../../types/matchmaking';

interface MatchWaitingRoomProps {
  mode: MatchMode;
  audience: AudiencePreference;
  room: MatchRoom | null;
  onCancel: () => void;
  broadenTo?: AudiencePreference | null;
  onBroaden?: () => void;
  broadening?: boolean;
}

export const MatchWaitingRoom: React.FC<MatchWaitingRoomProps> = ({
  mode,
  audience,
  room,
  onCancel,
  broadenTo = null,
  onBroaden,
  broadening = false,
}) => {
  const { t } = useTranslation();
  const count = room?.participants?.length ?? 1;

  useEffect(() => {
    stopTimerChimes();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10" data-testid="match-waiting-room">
      <div className="text-center mb-8">
        <div className="mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/15 dark:bg-accent-400/15 text-accent-700 dark:text-accent-300 text-xl font-display font-semibold ring-1 ring-accent-500/30 animate-pulse">
            {count}/{MATCH_TARGET_SIZE}
          </div>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2">
          {t('matchmaking.waiting.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mb-1">
          {t('matchmaking.waiting.subtitle', {
            mode: t(`matchmaking.modeChoice.${mode}.title`),
            count,
            total: MATCH_TARGET_SIZE,
          })}
        </p>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
          {t(`matchmaking.waiting.poolByAudience.${audience}`)}
        </p>
        <p className="text-sm text-secondary-500 dark:text-secondary-500">
          {t('matchmaking.waiting.hint')}
        </p>
      </div>

      {room && room.participants.length > 0 && (
        <ul className="mb-8 space-y-2" data-testid="match-waiting-participants">
          {room.participants.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl surface-panel"
            >
              <span className="w-2 h-2 rounded-full bg-accent-500" />
              <span className="text-secondary-800 dark:text-secondary-200">{p.name}</span>
            </li>
          ))}
        </ul>
      )}

      {broadenTo && onBroaden && (
        <div
          className="mb-8 rounded-2xl border border-accent-300/70 dark:border-accent-500/40 bg-accent-50/80 dark:bg-accent-950/40 px-4 py-4 text-left"
          data-testid="match-broaden-suggestion"
        >
          <p className="text-sm font-semibold text-accent-900 dark:text-accent-100 mb-1">
            {t('matchmaking.broaden.title')}
          </p>
          <p className="text-sm text-accent-900/90 dark:text-accent-100/90 mb-3 leading-relaxed">
            {t('matchmaking.broaden.body', {
              current: t(`matchmaking.audience.${audience}`),
              next: t(`matchmaking.audience.${broadenTo}`),
            })}
          </p>
          <button
            type="button"
            onClick={onBroaden}
            disabled={broadening}
            data-testid="match-broaden-action"
            className="btn-primary text-sm py-2.5 disabled:opacity-50"
          >
            {broadening
              ? t('matchmaking.broaden.switching')
              : t('matchmaking.broaden.action', {
                  audience: t(`matchmaking.audience.${broadenTo}`),
                })}
          </button>
        </div>
      )}

      <div className="mb-8 surface-panel p-4">
        <TechCheck waitingForOthers={count < MATCH_TARGET_SIZE} />
      </div>

      <div className="mb-8">
        <PracticeDemoVideo density="compact" />
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onCancel}
          data-testid="match-waiting-cancel"
          className="btn-secondary"
        >
          {t('matchmaking.waiting.cancel')}
        </button>
      </div>
    </div>
  );
};
