import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MATCH_FREE_DIALOGUE_MS } from '../types/matchmaking';
import { HoverTimer } from './HoverTimer';

interface FreeDialoguePhaseProps {
  onEndSession: () => void;
  onLeave?: () => void;
  onFreeDialogueEnded?: () => void;
  isHost: boolean;
  participants: Array<{ id: string; name: string }>;
  /** When set, show a 10-minute stay timer and allow any participant to leave */
  isMatchmaking?: boolean;
  phaseStartTimeMs?: number | null;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const FreeDialoguePhase: React.FC<FreeDialoguePhaseProps> = ({
  onEndSession,
  onLeave,
  onFreeDialogueEnded,
  isHost,
  participants,
  isMatchmaking = false,
  phaseStartTimeMs = null,
}) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    isMatchmaking ? MATCH_FREE_DIALOGUE_MS : null
  );
  const endedRef = React.useRef(false);

  useEffect(() => {
    if (!isMatchmaking) return;

    const start =
      phaseStartTimeMs && phaseStartTimeMs > 0
        ? phaseStartTimeMs
        : Date.now();

    const tick = () => {
      const remaining = MATCH_FREE_DIALOGUE_MS - (Date.now() - start);
      setTimeRemaining(Math.max(0, remaining));
      if (remaining <= 0 && !endedRef.current) {
        endedRef.current = true;
        onFreeDialogueEnded?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isMatchmaking, phaseStartTimeMs, onFreeDialogueEnded]);

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid="free-dialogue-phase">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('shared.common.freeFlowingDialogue')}
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            {isMatchmaking
              ? t('matchmaking.freeDialogue.description')
              : t('dialectic.session.freeDialogue.description')}
          </p>
          {isMatchmaking && timeRemaining !== null && (
            <div className="mt-4" data-testid="free-dialogue-timer">
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                {t('matchmaking.freeDialogue.timeRemaining', {
                  time: formatMs(timeRemaining),
                })}
              </p>
              <HoverTimer
                timeRemaining={timeRemaining}
                phaseDuration={MATCH_FREE_DIALOGUE_MS}
                isActive={isMatchmaking}
                className="justify-center"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
              {t('dialectic.session.freeDialogue.guidance.title')}
            </h3>
            <div className="space-y-3 text-green-800 dark:text-green-200">
              <p>• {t('dialectic.session.freeDialogue.guidance.shareInsights')}</p>
              <p>• {t('dialectic.session.freeDialogue.guidance.exploreTopics')}</p>
              <p>• {t('dialectic.session.freeDialogue.guidance.practiceListening')}</p>
              <p>• {t('dialectic.session.freeDialogue.guidance.bePresent')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-primary-100 dark:from-accent-950 dark:to-primary-900 rounded-2xl p-6 border border-accent-200/70 dark:border-accent-700/40">
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              {t('dialectic.session.freeDialogue.participants.title')}
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-blue-800 dark:text-blue-200">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-secondary-50 dark:bg-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.freeDialogue.notes.title')}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {t('dialectic.session.freeDialogue.notes.description')}
          </p>
          <textarea
            className="w-full h-32 p-4 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 resize-none"
            placeholder={t('dialectic.session.freeDialogue.notes.placeholder')}
          />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          {isMatchmaking ? (
            <>
              <button
                type="button"
                data-testid="free-dialogue-done-early"
                onClick={() => onFreeDialogueEnded?.()}
                className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium"
              >
                {t('matchmaking.freeDialogue.done')}
              </button>
              {onLeave && (
                <button
                  type="button"
                  data-testid="free-dialogue-leave"
                  onClick={onLeave}
                  className="px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-200 rounded-lg"
                >
                  {t('shared.actions.leaveSession')}
                </button>
              )}
            </>
          ) : (
            isHost && (
              <button
                type="button"
                onClick={onEndSession}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {t('shared.actions.endSession')}
              </button>
            )
          )}
        </div>

        {!isMatchmaking && !isHost && (
          <div className="mt-8 text-center">
            <p className="text-secondary-600 dark:text-secondary-400">
              {t('dialectic.session.freeDialogue.hostControl')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
