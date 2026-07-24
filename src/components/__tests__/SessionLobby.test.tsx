import {
  render,
  screen,
  describe,
  it,
  expect,
  vi,
  setupTests,
  renderWithProviders,
} from './setup';
import { SessionLobby } from '../SessionLobby';

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
});
