import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { HoverTimer } from '../HoverTimer';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

describe('HoverTimer Component', () => {
  const defaultProps = {
    timeRemaining: 125000,
    className: 'test-timer-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('timerMuted');
  });

  it('should render the timer toggle button', () => {
    render(<HoverTimer {...defaultProps} />);
    expect(screen.getByTitle('Always show timer')).toBeInTheDocument();
  });

  it('should apply custom className to the container', () => {
    const { container } = render(<HoverTimer {...defaultProps} />);
    expect(container.firstChild).toHaveClass('test-timer-class');
  });

  it('should reveal formatted time when the timer is pinned open', () => {
    render(<HoverTimer {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Always show timer'));
    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('shared.common.timeRemaining')).toBeInTheDocument();
  });

  it('should handle zero time remaining', () => {
    render(<HoverTimer timeRemaining={0} />);
    fireEvent.click(screen.getByTitle('Always show timer'));
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should toggle mute state', () => {
    render(<HoverTimer {...defaultProps} />);
    const muteButton = screen.getByTitle('Mute timer bells');
    fireEvent.click(muteButton);
    expect(screen.getByTitle('Unmute timer bells')).toBeInTheDocument();
    expect(localStorage.getItem('timerMuted')).toBe('true');
  });
});
