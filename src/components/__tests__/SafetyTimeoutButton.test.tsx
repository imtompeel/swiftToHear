import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { SafetyTimeoutButton } from '../SafetyTimeoutButton';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

describe('SafetyTimeoutButton', () => {
  it('mutes the requester immediately when a timeout is requested', () => {
    const onMute = vi.fn();
    const onToggleVideo = vi.fn();
    const onRequestTimeout = vi.fn();

    render(
      <SafetyTimeoutButton
        onRequestTimeout={onRequestTimeout}
        onEndTimeout={vi.fn()}
        isTimeoutActive={false}
        onToggleVideo={onToggleVideo}
        onMute={onMute}
      />
    );

    fireEvent.click(screen.getByTitle('safety.timeout.requestTooltip'));

    expect(onToggleVideo).toHaveBeenCalledTimes(1);
    expect(onMute).toHaveBeenCalledTimes(1);
    expect(onRequestTimeout).toHaveBeenCalledTimes(1);
    expect(onMute.mock.invocationCallOrder[0]).toBeLessThan(
      onRequestTimeout.mock.invocationCallOrder[0]
    );
  });
});
