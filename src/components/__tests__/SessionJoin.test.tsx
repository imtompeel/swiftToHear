import {
  render,
  screen,
  fireEvent,
  describe,
  it,
  expect,
  vi,
  setupTests,
} from './setup';
import { SessionJoin } from '../SessionJoin';

describe('SessionJoin Component', () => {
  setupTests();

  const mockSession = {
    sessionId: 'test-session-123',
    sessionName: 'Community Deep Listening',
    duration: 15 * 60 * 1000,
    topic: 'What transitions are we navigating right now?',
    hostId: 'host-user-id',
    hostName: 'Alice',
    createdAt: new Date('2024-01-15T10:30:00'),
    participants: [
      { id: 'host-user-id', name: 'Alice', role: 'host', status: 'ready' as const },
      { id: 'user-2', name: 'Bob', role: 'speaker', status: 'ready' as const },
    ],
    status: 'waiting' as const,
    minParticipants: 2,
    maxParticipants: 4,
    topicSuggestions: [],
  };

  const defaultProps = {
    session: mockSession,
    onJoinSession: vi.fn().mockResolvedValue(undefined),
    onRoleSelect: vi.fn(),
    currentUserId: 'current-user-id',
    currentUserName: 'Charlie',
  };

  it('should display session details and join controls', () => {
    render(<SessionJoin {...defaultProps} />);

    expect(screen.getByText('shared.actions.joinPracticeSession')).toBeInTheDocument();
    expect(screen.getByText('Community Deep Listening')).toBeInTheDocument();
    expect(screen.getByText('What transitions are we navigating right now?')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('join-session-button')).toBeInTheDocument();
  });

  it('should call onJoinSession when join is submitted', async () => {
    render(<SessionJoin {...defaultProps} />);

    fireEvent.click(screen.getByTestId('join-session-button'));

    expect(defaultProps.onJoinSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: mockSession.sessionId,
        userId: defaultProps.currentUserId,
        userName: 'Charlie',
      })
    );
  });

  it('should show not-found state when session is null', () => {
    render(<SessionJoin {...defaultProps} session={null} />);

    expect(screen.getByText('shared.common.sessionNotFound')).toBeInTheDocument();
  });
});
