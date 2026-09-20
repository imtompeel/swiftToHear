import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ROUND_CHANGE_ENTER_MS,
  ROUND_CHANGE_EXIT_MS,
  ROUND_CHANGE_HANG_MS,
  RoundChangePopup,
} from '../RoundChangePopup';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (!params) return key;
      return Object.entries(params).reduce(
        (result, [param, value]) => result.replace(`{{${param}}}`, String(value)),
        key
      );
    },
  }),
}));

const ENTER_DELAY_MS = 30;

describe('RoundChangePopup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prepares the next speaker before roles rotate', () => {
    render(
      <RoundChangePopup
        notice="scribe-feedback"
        roundNumber={1}
        totalRounds={3}
        currentRole="speaker"
        nextRole="listener"
        scribeName="Blair"
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByTestId('round-change-popup')).toBeInTheDocument();
    expect(screen.getByText('dialectic.session.roundChange.scribeFeedback.title')).toBeInTheDocument();
    expect(screen.getByTestId('round-change-next-role')).toHaveTextContent(
      'dialectic.session.roundChange.scribeFeedback.nextRole'
    );
  });

  it('tells the new speaker who they are at the start of a later round', () => {
    render(
      <RoundChangePopup
        notice="round"
        roundNumber={2}
        totalRounds={3}
        currentRole="speaker"
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText('dialectic.session.roundChange.round.laterTitle')).toBeInTheDocument();
    expect(screen.getByText('dialectic.session.roundChange.round.youAreNow')).toBeInTheDocument();
    expect(screen.getByText('dialectic.session.roundChange.round.speaker')).toBeInTheDocument();
  });

  it('uses last-round copy after the final speaker', () => {
    render(
      <RoundChangePopup
        notice="scribe-feedback"
        roundNumber={3}
        totalRounds={3}
        currentRole="listener"
        nextRole="scribe"
        scribeName="Blair"
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByTestId('round-change-next-role')).toHaveTextContent(
      'dialectic.session.roundChange.scribeFeedback.lastRound'
    );
  });

  it('appears, hangs, then dismisses itself', () => {
    const onDismiss = vi.fn();
    render(
      <RoundChangePopup
        notice="round"
        roundNumber={2}
        totalRounds={3}
        currentRole="listener"
        onDismiss={onDismiss}
      />
    );

    const popup = screen.getByTestId('round-change-popup');
    const sheet = screen.getByTestId('round-change-sheet');
    expect(popup).toHaveAttribute('data-visible', 'false');
    expect(sheet).toHaveClass('translate-y-full');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(ENTER_DELAY_MS);
    });
    expect(popup).toHaveAttribute('data-visible', 'true');
    expect(sheet).toHaveClass('translate-y-0');
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(ROUND_CHANGE_ENTER_MS + ROUND_CHANGE_HANG_MS);
    });
    expect(popup).toHaveAttribute('data-visible', 'false');
    expect(sheet).toHaveClass('translate-y-full');
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(ROUND_CHANGE_EXIT_MS);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
