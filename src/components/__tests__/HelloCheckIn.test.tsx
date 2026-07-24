import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { HelloCheckIn } from '../HelloCheckIn';
import { createMockSessionContext } from './setup/testHelpers';

vi.mock('../VideoCall', () => ({
  VideoCall: () => <div data-testid="video-call">Video Call</div>,
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

describe('HelloCheckIn Component', () => {
  const session = createMockSessionContext({
    participants: [
      { id: 'host-user-id', name: 'Test Host', role: 'speaker', status: 'ready' },
      { id: 'user-2', name: 'Bob', role: 'listener', status: 'ready' },
      { id: 'user-3', name: 'Charlie', role: 'scribe', status: 'ready' },
    ],
  });

  const defaultProps = {
    session,
    participants: session.participants,
    onComplete: vi.fn(),
    currentUserId: 'host-user-id',
    currentUserName: 'Test Host',
    isHost: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render hello check-in when all participants have roles', () => {
    render(<HelloCheckIn {...defaultProps} />);
    expect(screen.getByTestId('hello-checkin')).toBeInTheDocument();
    expect(screen.getByText('dialectic.session.helloCheckIn.title')).toBeInTheDocument();
  });

  it('should display participant names', () => {
    render(<HelloCheckIn {...defaultProps} />);
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should show role selection when participants still need roles', () => {
    const waitingSession = createMockSessionContext({
      participants: [
        { id: 'host-user-id', name: 'Test Host', role: '', status: 'ready' },
        { id: 'user-2', name: 'Bob', role: 'listener', status: 'ready' },
      ],
    });

    render(
      <HelloCheckIn
        {...defaultProps}
        session={waitingSession}
        participants={waitingSession.participants}
      />
    );

    expect(screen.getByTestId('role-selection-phase')).toBeInTheDocument();
  });

  it('should show complete button for host', () => {
    render(<HelloCheckIn {...defaultProps} isHost={true} />);
    expect(screen.getByText('dialectic.session.helloCheckIn.complete')).toBeInTheDocument();
  });

  it('should not show complete button for non-host', () => {
    render(<HelloCheckIn {...defaultProps} isHost={false} currentUserId="user-2" />);
    expect(screen.queryByText('dialectic.session.helloCheckIn.complete')).not.toBeInTheDocument();
  });

  it('should call onComplete when complete button is clicked', () => {
    render(<HelloCheckIn {...defaultProps} isHost={true} />);
    fireEvent.click(screen.getByText('dialectic.session.helloCheckIn.complete'));
    expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
  });
});
