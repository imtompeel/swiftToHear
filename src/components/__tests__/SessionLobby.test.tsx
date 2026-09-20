import { vi } from 'vitest';
import {
  render,
  screen,
  describe,
  it,
  expect,
  setupTests,
  renderWithProviders,
} from './setup';
import { SessionLobby } from '../SessionLobby';

vi.mock('../PracticeDemoVideo', () => ({
  PracticeDemoVideo: () => null,
}));

describe('SessionLobby Component', () => {
  setupTests();

  const mockSession = {
    sessionId: 'test-session',
    sessionName: 'Test Session',
    duration: 7 * 60 * 1000,
    topic: 'Test Topic',
    hostId: 'host-123',
    hostName: 'Test Host',
    hostRole: 'participant' as const,
    createdAt: new Date(),
    participants: [
      { id: 'host-123', name: 'Test Host', role: '', status: 'ready' as const },
      { id: 'participant-1', name: 'Participant 1', role: 'speaker', status: 'ready' as const },
    ],
    status: 'waiting' as const,
    topicSuggestions: [],
    minParticipants: 2,
    maxParticipants: 4,
    sessionType: 'video' as const,
  };

  const defaultProps = {
    session: mockSession,
    currentUserId: 'host-123',
    isHost: true,
    onStartSession: vi.fn(),
    onLeaveSession: vi.fn(),
    onUpdateReadyState: vi.fn(),
    onUpdateParticipantRole: vi.fn(),
  };

  it('should render session lobby with session name', () => {
    renderWithProviders(<SessionLobby {...defaultProps} />);
    expect(screen.getByText('Test Session')).toBeInTheDocument();
  });

  it('should show the host name', () => {
    renderWithProviders(<SessionLobby {...defaultProps} />);
    expect(screen.getAllByText('Test Host').length).toBeGreaterThan(0);
  });

  it('derives ready from the session, not a disconnected local toggle', () => {
    const session = {
      ...mockSession,
      participants: [
        { id: 'host-123', name: 'Test Host', role: '', status: 'ready' as const },
        { id: 'participant-1', name: 'Participant 1', role: 'speaker', status: 'ready' as const },
      ],
    };

    renderWithProviders(
      <SessionLobby {...defaultProps} session={session} currentUserId="participant-1" isHost={false} />
    );

    expect(screen.getByTestId('your-ready-status')).toHaveTextContent('dialectic.lobby.youAreReady');
  });

  it('names guests who still need to mark ready instead of a vague count', () => {
    const session = {
      ...mockSession,
      participants: [
        { id: 'host-123', name: 'Test Host', role: '', status: 'ready' as const },
        { id: 'participant-1', name: 'Alex', role: '', status: 'not-ready' as const },
        { id: 'participant-2', name: 'Blair', role: '', status: 'not-ready' as const },
      ],
    };

    renderWithProviders(<SessionLobby {...defaultProps} session={session} />);

    expect(screen.getByTestId('waiting-for-ready')).toBeInTheDocument();
    expect(screen.getByTestId('participant-ready-list')).toHaveTextContent('Alex');
    expect(screen.getByTestId('participant-ready-list')).toHaveTextContent('Blair');
    expect(screen.getByTestId('start-session-button')).toBeDisabled();
  });

  it('enables start once every guest is ready', () => {
    const session = {
      ...mockSession,
      participants: [
        { id: 'host-123', name: 'Test Host', role: '', status: 'ready' as const },
        { id: 'participant-1', name: 'Alex', role: '', status: 'ready' as const },
        { id: 'participant-2', name: 'Blair', role: '', status: 'ready' as const },
      ],
    };

    renderWithProviders(<SessionLobby {...defaultProps} session={session} />);

    expect(screen.queryByTestId('waiting-for-ready')).not.toBeInTheDocument();
    expect(screen.getByTestId('start-session-button')).toBeEnabled();
  });
});
