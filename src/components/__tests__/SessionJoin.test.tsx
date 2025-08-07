// ===== CENTRALIZED TEST IMPORTS =====
import {
  // Testing utilities
  render, screen, fireEvent, waitFor, describe, it, expect, vi,
  // Mock data and utilities
  mockSessionConfig, testUtils, setupTests
} from './setup';

// Import the real component
import { SessionJoin } from '../SessionJoin';

describe('SessionJoin Component', () => {
  // Use centralized setup
  setupTests();

  const mockSession = {
    sessionId: 'test-session-123',
    sessionName: 'Community Deep Listening',
    duration: 15 * 60 * 1000, // 15 minutes
    topic: 'What transitions are we navigating right now?',
    hostId: 'host-user-id',
    hostName: 'Alice',
    createdAt: new Date('2024-01-15T10:30:00'),
    participants: [
      { id: 'host-user-id', name: 'Alice', role: 'host', status: 'connected' },
      { id: 'user-2', name: 'Bob', role: 'speaker', status: 'connected' },
    ],
    status: 'waiting' as const,
    availableRoles: ['listener', 'scribe', 'observer']
  };

  const mockOnJoinSession = vi.fn();
  const mockOnRoleSelect = vi.fn();
  
  const defaultProps = {
    session: mockSession,
    onJoinSession: mockOnJoinSession,
    onRoleSelect: mockOnRoleSelect,
    currentUserId: 'current-user-id',
    currentUserName: 'Charlie'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Information Display', () => {
    it('should display session details as read-only', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('session-info-display')).toBeInTheDocument();
      expect(screen.getByText('Community Deep Listening')).toBeInTheDocument();
      expect(screen.getByText('15 minutes')).toBeInTheDocument();
      expect(screen.getByText('What transitions are we navigating right now?')).toBeInTheDocument();
      const hostInfo = screen.getByTestId('host-info');
      expect(hostInfo).toHaveTextContent('Host:');
      expect(hostInfo).toHaveTextContent('Alice');
    });

    it('should show session duration prominently', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('session-duration-display')).toBeInTheDocument();
      expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
    });

    it('should display topic when provided', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('session-topic-display')).toBeInTheDocument();
      expect(screen.getByText('What transitions are we navigating right now?')).toBeInTheDocument();
    });

    it('should show appropriate message when no topic is set', () => {
      const sessionWithoutTopic = { ...mockSession, topic: '' };
      render(<SessionJoin {...defaultProps} session={sessionWithoutTopic} />);
      
      expect(screen.getByText('dialectic.join.noTopicSet')).toBeInTheDocument();
    });

    it('should display host information', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('host-info')).toBeInTheDocument();
      expect(screen.getByText(/hosted by alice/i)).toBeInTheDocument();
    });

    it('should show session creation time', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('session-created-time')).toBeInTheDocument();
      expect(screen.getByText(/created at/i)).toBeInTheDocument();
    });
  });

  describe('Current Participants Display', () => {
    it('should show current participants list', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('current-participants')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.currentParticipants')).toBeInTheDocument();
      expect(screen.getByText('Alice (Host)')).toBeInTheDocument();
      expect(screen.getByText('Bob (Speaker)')).toBeInTheDocument();
    });

    it('should show participant count', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('participant-count')).toBeInTheDocument();
      expect(screen.getByText('2 of 4 participants')).toBeInTheDocument();
    });

    it('should update when participants join/leave', () => {
      const { rerender } = render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByText('2 of 4 participants')).toBeInTheDocument();
      
      const updatedSession = {
        ...mockSession,
        participants: [
          ...mockSession.participants,
          { id: 'user-3', name: 'Diana', role: 'listener', status: 'connected' }
        ]
      };
      
      rerender(<SessionJoin {...defaultProps} session={updatedSession} />);
      
      expect(screen.getByText('3 of 4 participants')).toBeInTheDocument();
      expect(screen.getByText('Diana (Listener)')).toBeInTheDocument();
    });

    it('should show participant connection status', () => {
      const sessionWithMixedStatus = {
        ...mockSession,
        participants: [
          { id: 'host-user-id', name: 'Alice', role: 'host', status: 'connected' },
          { id: 'user-2', name: 'Bob', role: 'speaker', status: 'connecting' },
        ]
      };
      
      render(<SessionJoin {...defaultProps} session={sessionWithMixedStatus} />);
      
      expect(screen.getByTestId('participant-status-connected')).toBeInTheDocument();
      expect(screen.getByTestId('participant-status-connecting')).toBeInTheDocument();
    });
  });

  describe('Role Selection', () => {
    it('should show available roles for selection', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('role-selection-section')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.chooseRole')).toBeInTheDocument();
      
      expect(screen.getByTestId('role-listener')).toBeInTheDocument();
      expect(screen.getByTestId('role-scribe')).toBeInTheDocument();
      expect(screen.getByTestId('role-observer')).toBeInTheDocument();
    });

    it('should not show taken roles as options', () => {
      render(<SessionJoin {...defaultProps} />);
      
      // Speaker role is taken by Bob
      expect(screen.queryByTestId('role-speaker')).not.toBeInTheDocument();
      
      // Available roles should be shown
      expect(screen.getByTestId('role-listener')).toBeInTheDocument();
      expect(screen.getByTestId('role-scribe')).toBeInTheDocument();
      expect(screen.getByTestId('role-observer')).toBeInTheDocument();
    });

    it('should allow role selection', () => {
      render(<SessionJoin {...defaultProps} />);
      
      const listenerRole = screen.getByTestId('role-listener');
      fireEvent.click(listenerRole);
      
      expect(mockOnRoleSelect).toHaveBeenCalledWith('listener');
      expect(listenerRole).toHaveClass('border-accent-500'); // Selected state
    });

    it('should show role descriptions', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByText('dialectic.roles.listener.description')).toBeInTheDocument();
      expect(screen.getByText('dialectic.roles.scribe.description')).toBeInTheDocument();
      expect(screen.getByText('dialectic.roles.observer.description')).toBeInTheDocument();
    });

    it('should handle when all primary roles are taken', () => {
      const fullSession = {
        ...mockSession,
        participants: [
          { id: 'host-user-id', name: 'Alice', role: 'host', status: 'connected' },
          { id: 'user-2', name: 'Bob', role: 'speaker', status: 'connected' },
          { id: 'user-3', name: 'Charlie', role: 'listener', status: 'connected' },
          { id: 'user-4', name: 'Diana', role: 'scribe', status: 'connected' },
        ],
        availableRoles: ['observer']
      };
      
      render(<SessionJoin {...defaultProps} session={fullSession} />);
      
      expect(screen.getByTestId('role-observer')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.onlyObserverAvailable')).toBeInTheDocument();
    });
  });

  describe('Session Status Handling', () => {
    it('should show waiting state when session is not started', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('session-status-waiting')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.waitingToStart')).toBeInTheDocument();
    });

    it('should show different status for session in progress', () => {
      const activeSession = { ...mockSession, status: 'active' as const };
      render(<SessionJoin {...defaultProps} session={activeSession} />);
      
      expect(screen.getByTestId('session-status-active')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.sessionInProgress')).toBeInTheDocument();
    });

    it('should handle session that is full', () => {
      const fullSession = {
        ...mockSession,
        participants: [
          { id: 'host-user-id', name: 'Alice', role: 'host', status: 'connected' },
          { id: 'user-2', name: 'Bob', role: 'speaker', status: 'connected' },
          { id: 'user-3', name: 'Charlie', role: 'listener', status: 'connected' },
          { id: 'user-4', name: 'Diana', role: 'scribe', status: 'connected' },
        ],
        availableRoles: []
      };
      
      render(<SessionJoin {...defaultProps} session={fullSession} />);
      
      expect(screen.getByTestId('session-full-message')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.sessionFull')).toBeInTheDocument();
    });

    it('should handle session that does not exist', () => {
      render(<SessionJoin {...defaultProps} session={null} />);
      
      expect(screen.getByTestId('session-not-found')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.sessionNotFound')).toBeInTheDocument();
    });
  });

  describe('Join Process', () => {
    it('should enable join button when role is selected', () => {
      render(<SessionJoin {...defaultProps} />);
      
      const joinButton = screen.getByTestId('join-session-button');
      expect(joinButton).toBeDisabled();
      
      // Select a role
      fireEvent.click(screen.getByTestId('role-listener'));
      
      expect(joinButton).not.toBeDisabled();
    });

    it('should call onJoinSession with correct parameters', async () => {
      render(<SessionJoin {...defaultProps} />);
      
      // Select role
      fireEvent.click(screen.getByTestId('role-listener'));
      
      // Join session
      const joinButton = screen.getByTestId('join-session-button');
      fireEvent.click(joinButton);
      
      await waitFor(() => {
        expect(mockOnJoinSession).toHaveBeenCalledWith({
          sessionId: 'test-session-123',
          userId: 'current-user-id',
          userName: 'Charlie',
          role: 'listener'
        });
      });
    });

    it('should show loading state during join process', async () => {
      mockOnJoinSession.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<SessionJoin {...defaultProps} />);
      
      // Select role and join
      fireEvent.click(screen.getByTestId('role-listener'));
      const joinButton = screen.getByTestId('join-session-button');
      fireEvent.click(joinButton);
      
      expect(screen.getByText('dialectic.join.joining')).toBeInTheDocument();
      expect(joinButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.queryByText('dialectic.join.joining')).not.toBeInTheDocument();
      });
    });

    it('should handle join errors gracefully', async () => {
      mockOnJoinSession.mockRejectedValue(new Error('Network error'));
      
      render(<SessionJoin {...defaultProps} />);
      
      // Select role and join
      fireEvent.click(screen.getByTestId('role-listener'));
      const joinButton = screen.getByTestId('join-session-button');
      fireEvent.click(joinButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('join-error')).toBeInTheDocument();
        expect(screen.getByText('dialectic.join.error')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update when new participants join', () => {
      const { rerender } = render(<SessionJoin {...defaultProps} />);
      
      const updatedSession = {
        ...mockSession,
        participants: [
          ...mockSession.participants,
          { id: 'user-3', name: 'Eve', role: 'listener', status: 'connected' }
        ],
        availableRoles: ['scribe', 'observer']
      };
      
      rerender(<SessionJoin {...defaultProps} session={updatedSession} />);
      
      expect(screen.getByText('Eve')).toBeInTheDocument();
      expect(screen.getByText('(listener)')).toBeInTheDocument();
      expect(screen.queryByTestId('role-listener')).not.toBeInTheDocument(); // No longer available
    });

    it('should handle host starting the session', () => {
      const { rerender } = render(<SessionJoin {...defaultProps} />);
      
      const startedSession = { ...mockSession, status: 'active' as const };
      rerender(<SessionJoin {...defaultProps} session={startedSession} />);
      
      expect(screen.getByText('dialectic.join.sessionStarted')).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should show helpful onboarding for first-time users', () => {
      const newUserProps = { ...defaultProps, isFirstTime: true };
      render(<SessionJoin {...newUserProps} />);
      
      expect(screen.getByTestId('first-time-guidance')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.firstTimeWelcome')).toBeInTheDocument();
    });

    it('should provide role guidance and tips', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('role-guidance')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.roleGuidance')).toBeInTheDocument();
    });

    it('should be mobile responsive', () => {
      testUtils.setupMobileTest();
      
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('mobile-optimized-layout')).toBeInTheDocument();
    });

    it('should show estimated session start time', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByTestId('estimated-start-time')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA labels and roles', () => {
      render(<SessionJoin {...defaultProps} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText('dialectic.join.chooseRole')).toBeInTheDocument();
    });

    it('should support keyboard navigation for role selection', () => {
      render(<SessionJoin {...defaultProps} />);
      
      const roleButtons = screen.getAllByRole('button');
      roleButtons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should announce status changes to screen readers', () => {
      const { rerender } = render(<SessionJoin {...defaultProps} />);
      
      const startedSession = { ...mockSession, status: 'active' as const };
      rerender(<SessionJoin {...defaultProps} session={startedSession} />);
      
      expect(screen.getByRole('status')).toHaveTextContent('dialectic.join.sessionStarted');
    });
  });
});