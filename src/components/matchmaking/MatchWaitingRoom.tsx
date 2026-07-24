import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { TechCheck } from '../TechCheck';
import type { MatchMode, MatchRoom } from '../../types/matchmaking';
import { MATCH_TARGET_SIZE } from '../../types/matchmaking';

interface MatchWaitingRoomProps {
  mode: MatchMode;
  room: MatchRoom | null;
  onCancel: () => void;
}

export const MatchWaitingRoom: React.FC<MatchWaitingRoomProps> = ({
  mode,
  room,
  onCancel,
}) => {
  const { t } = useTranslation();
  const count = room?.participants?.length ?? 1;

  return (
    <div className="max-w-2xl mx-auto p-6" data-testid="match-waiting-room">
      <div className="text-center mb-8">
        <div className="animate-pulse mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-200 text-xl font-bold">
            {count}/{MATCH_TARGET_SIZE}
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t('matchmaking.waiting.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mb-1">
          {t('matchmaking.waiting.subtitle', {
            mode: t(`matchmaking.modeChoice.${mode}.title`),
            count,
            total: MATCH_TARGET_SIZE,
          })}
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
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700"
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-secondary-800 dark:text-secondary-200">{p.name}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-8 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-4">
        <TechCheck waitingForOthers={count < MATCH_TARGET_SIZE} />
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onCancel}
          data-testid="match-waiting-cancel"
          className="px-6 py-3 rounded-lg border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800"
        >
          {t('matchmaking.waiting.cancel')}
        </button>
      </div>
    </div>
  );
};
