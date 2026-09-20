import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getRoleDisplayKey } from '../utils/nextRole';
import type { RoundChangeNotice } from '../hooks/useRoundChangeNotice';

export const ROUND_CHANGE_ENTER_MS = 400;
export const ROUND_CHANGE_HANG_MS = 3500;
export const ROUND_CHANGE_EXIT_MS = 400;

interface RoundChangePopupProps {
  notice: RoundChangeNotice;
  roundNumber: number;
  totalRounds: number;
  currentRole?: string | null;
  nextRole?: string | null;
  scribeName?: string;
  onDismiss: () => void;
}

export const RoundChangePopup: React.FC<RoundChangePopupProps> = ({
  notice,
  roundNumber,
  totalRounds,
  currentRole,
  nextRole,
  scribeName,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const roleKey = getRoleDisplayKey(currentRole);
  const nextRoleKey = getRoleDisplayKey(nextRole);
  const isPermanentObserver = currentRole === 'observer-permanent';
  const isFirstRound = roundNumber <= 1;
  const isLastRound = roundNumber >= totalRounds;

  useEffect(() => {
    const enterDelay = 30;
    const enterTimer = window.setTimeout(() => setVisible(true), enterDelay);
    const hideTimer = window.setTimeout(
      () => setVisible(false),
      enterDelay + ROUND_CHANGE_ENTER_MS + ROUND_CHANGE_HANG_MS
    );
    const doneTimer = window.setTimeout(
      () => onDismissRef.current(),
      enterDelay + ROUND_CHANGE_ENTER_MS + ROUND_CHANGE_HANG_MS + ROUND_CHANGE_EXIT_MS
    );

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(doneTimer);
    };
  }, [notice, roundNumber]);

  const title = notice === 'scribe-feedback'
    ? t('dialectic.session.roundChange.scribeFeedback.title')
    : isFirstRound
      ? t('dialectic.session.roundChange.round.firstTitle')
      : t('dialectic.session.roundChange.round.laterTitle');

  const headline = notice === 'scribe-feedback'
    ? currentRole === 'scribe'
      ? t('dialectic.session.roundChange.scribeFeedback.scribeHeadline')
      : t('dialectic.session.roundChange.scribeFeedback.otherHeadline', {
          scribe: scribeName || t('shared.roles.scribe'),
        })
    : t(
        isFirstRound
          ? 'dialectic.session.roundChange.round.youAre'
          : 'dialectic.session.roundChange.round.youAreNow',
        { role: t(`shared.roles.${roleKey}`) }
      );

  const body = notice === 'scribe-feedback'
    ? currentRole === 'scribe'
      ? t('dialectic.session.roundChange.scribeFeedback.scribeBody')
      : t('dialectic.session.roundChange.scribeFeedback.otherBody')
    : isPermanentObserver
      ? t('dialectic.session.roundChange.round.observerPermanent')
      : t(`dialectic.session.roundChange.round.${roleKey}`);

  const nextLine = notice === 'scribe-feedback'
    ? isPermanentObserver
      ? t('dialectic.session.roundChange.scribeFeedback.stayingObserver')
      : isLastRound
        ? t('dialectic.session.roundChange.scribeFeedback.lastRound')
        : t('dialectic.session.roundChange.scribeFeedback.nextRole', {
            role: t(`shared.roles.${nextRoleKey}`),
          })
    : null;

  const motionMs = visible ? ROUND_CHANGE_ENTER_MS : ROUND_CHANGE_EXIT_MS;
  const motionEase = visible ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.4, 0, 1, 1)';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center overflow-hidden p-4 pb-6 sm:pb-8 bg-black/40 transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDuration: `${motionMs}ms`, transitionTimingFunction: motionEase }}
      role="status"
      aria-live="polite"
      aria-labelledby="round-change-title"
      data-testid="round-change-popup"
      data-visible={visible ? 'true' : 'false'}
    >
      <div
        className={`bg-white dark:bg-secondary-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        data-testid="round-change-sheet"
        style={{
          transitionProperty: 'transform',
          transitionDuration: `${motionMs}ms`,
          transitionTimingFunction: motionEase,
        }}
      >
        <p className="text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
          {t('shared.common.roundProgress', { current: roundNumber, total: totalRounds })}
        </p>
        <h2
          id="round-change-title"
          className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-3"
        >
          {title}
        </h2>
        <p className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
          {headline}
        </p>
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
          {body}
        </p>
        {nextLine && (
          <p
            className="text-sm sm:text-base text-secondary-700 dark:text-secondary-300 mt-3"
            data-testid="round-change-next-role"
          >
            {nextLine}
          </p>
        )}
      </div>
    </div>
  );
};
