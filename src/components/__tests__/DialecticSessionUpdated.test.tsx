// ===== CENTRALIZED TEST IMPORTS =====
import {
  // Testing utilities
  render, screen, fireEvent, waitFor, describe, it, expect, vi,
  // Component mocks
  DialecticSession,
  // Mock data and utilities
  mockSessionConfig, testUtils, setupTests
} from './setup';

describe('DialecticSession Component - Updated Flow', () => {
  // Use centralized setup
  setupTests();

  const mockSessionData = {
    sessionId: 'test-session-123',
    sessionName: 'Community Deep Listening',
    duration: 20 * 60 * 1000, // 20 minutes - set by host
    topic: 'What transitions are we navigating right now?',
    hostId: 'host-user-id',
    participants: [
      { id: 'host-user-id', name: 'Alice', role: 'host', status: 'ready' },
      { id: 'user-2', name: 'Bob', role: 'speaker', status: 'ready' },
      { id: 'user-3', name: 'Charlie', role: 'listener', status: 'ready' },
      { id: 'user-4', name: 'Diana', role: 'scribe', status: 'ready' },
    ],
    status: 'active',
    startedAt: new Date()
  };

  describe('Session Configuration Inheritance', () => {
    it('should accept session configuration from props', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice" 
        />
      );
      
      // Should show the configured duration, not default
      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByText('What transitions are we navigating right now?')).toBeInTheDocument();
    });

    it('should not show duration selection when session data is provided', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="initialization"
        />
      );
      
      // Should NOT show duration selector
      expect(screen.queryByTestId('duration-selector')).not.toBeInTheDocument();
      
      // Should show only role selection
      expect(screen.getByTestId('role-assignment')).toBeInTheDocument();
    });

    it('should use session duration for all timing calculations', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={600000} // 10 minutes remaining of 20 minute session
        />
      );
      
      // Speaker interface should receive the correct timing
      expect(screen.getByText('10:00')).toBeInTheDocument();
      
      // Comfort prompts should be based on 20-minute session (50% = 10 minutes)
      expect(screen.getByTestId('comfort-prompt')).toBeInTheDocument();
    });

    it('should display session name and host information', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="practice"
          userRole="listener"
        />
      );
      
      expect(screen.getByText('Community Deep Listening')).toBeInTheDocument();
      expect(screen.getByText(/hosted by alice/i)).toBeInTheDocument();
    });
  });

  describe('Pre-Configured Session Setup', () => {
    it('should skip duration selection in setup phase', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="initialization"
        />
      );
      
      const sessionSetup = screen.getByTestId('practice-session-wrapper');
      
      // Should only show role selection, not duration
      expect(screen.getByTestId('role-assignment')).toBeInTheDocument();
      expect(screen.queryByTestId('duration-selector')).not.toBeInTheDocument();
    });

    it('should show session preview with configured settings', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="initialization"
        />
      );
      
      expect(screen.getByTestId('session-preview')).toBeInTheDocument();
      expect(screen.getByText(/20 minutes/i)).toBeInTheDocument();
      expect(screen.getByText('What transitions are we navigating right now?')).toBeInTheDocument();
    });

    it('should show participant information in setup', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="initialization"
        />
      );
      
      expect(screen.getByTestId('participant-info')).toBeInTheDocument();
      expect(screen.getByText('4 participants joined')).toBeInTheDocument();
    });

    it('should disable role selection for taken roles', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="initialization"
        />
      );
      
      // Speaker role is taken by Bob
      const speakerRole = screen.getByTestId('role-speaker');
      expect(speakerRole).toHaveAttribute('disabled');
      expect(speakerRole).toHaveTextContent(/taken by bob/i);
      
      // Available roles should be enabled
      const observerRole = screen.getByTestId('role-observer');
      expect(observerRole).not.toHaveAttribute('disabled');
    });
  });

  describe('Active Session with Pre-Configuration', () => {
    it('should use configured duration for session timing', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={1200000} // 20 minutes - full duration
        />
      );
      
      expect(screen.getByText('20:00')).toBeInTheDocument();
    });

    it('should pass session duration to speaker interface', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={900000} // 15 minutes remaining of 20
        />
      );
      
      // Should show 15 minutes remaining
      expect(screen.getByText('15:00')).toBeInTheDocument();
      
      // Comfort prompts should be based on 20-minute total (50% = 10 minutes)
      // With 15 minutes remaining, should NOT show comfort prompts yet
      expect(screen.queryByTestId('comfort-prompt')).not.toBeInTheDocument();
    });

    it('should show comfort prompts at correct relative timing', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={500000} // 8.33 minutes remaining of 20 (less than 50%)
        />
      );
      
      // Should show comfort prompts when less than 50% of 20 minutes remains
      expect(screen.getByTestId('comfort-prompt')).toBeInTheDocument();
    });

    it('should display configured topic prominently', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice"
        />
      );
      
      expect(screen.getByTestId('topic-display')).toHaveTextContent(
        'What transitions are we navigating right now?'
      );
    });

    it('should handle custom session durations correctly', () => {
      const customSession = {
        ...mockSessionData,
        duration: 12 * 60 * 1000 // 12 minutes
      };
      
      render(
        <DialecticSession 
          sessionData={customSession}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={720000} // 12 minutes - full time
        />
      );
      
      expect(screen.getByText('12:00')).toBeInTheDocument();
    });
  });

  describe('Session State Management with Pre-Configuration', () => {
    it('should not override configured session duration', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionDuration={900000} // 15 minutes - should be ignored
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={1200000} // 20 minutes
        />
      );
      
      // Should use session data duration (20 min), not prop duration (15 min)
      expect(screen.getByText('20:00')).toBeInTheDocument();
    });

    it('should maintain session configuration through phase changes', () => {
      const { rerender } = render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="preparation"
          userRole="speaker"
        />
      );
      
      // Move to practice phase
      rerender(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="practice"
          userRole="speaker"
          timeRemaining={1200000}
        />
      );
      
      // Should maintain the 20-minute duration
      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByText('What transitions are we navigating right now?')).toBeInTheDocument();
    });

    it('should pass session data to reflection phase', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="reflection"
        />
      );
      
      expect(screen.getByTestId('shared-debrief')).toBeInTheDocument();
      // Should show session summary with configured duration
      expect(screen.getByText(/20 minutes/i)).toBeInTheDocument();
    });
  });

  describe('Role Interface Updates', () => {
    it('should pass sessionDuration to SpeakerInterface', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={800000}
        />
      );
      
      // SpeakerInterface should receive sessionDuration prop
      const speakerInterface = screen.getByTestId('speaker-interface');
      expect(speakerInterface).toBeInTheDocument();
      
      // Timing should be relative to 20-minute session
      expect(screen.getByText(/13:20/)).toBeInTheDocument(); // 800000ms = 13:20
    });

    it('should handle different session durations for timing prompts', () => {
      // Test with short 5-minute session
      const shortSession = {
        ...mockSessionData,
        duration: 5 * 60 * 1000 // 5 minutes
      };
      
      render(
        <DialecticSession 
          sessionData={shortSession}
          userRole="speaker" 
          sessionPhase="practice"
          timeRemaining={120000} // 2 minutes remaining (less than 50% of 5 minutes)
        />
      );
      
      // Should show comfort prompts for short session
      expect(screen.getByTestId('comfort-prompt')).toBeInTheDocument();
    });
  });

  describe('Backwards Compatibility', () => {
    it('should fall back to default behavior when no session data provided', () => {
      render(
        <DialecticSession 
          sessionPhase="initialization"
        />
      );
      
      // Should show duration selector when no session data
      expect(screen.getByTestId('duration-selector')).toBeInTheDocument();
      expect(screen.getByTestId('role-assignment')).toBeInTheDocument();
    });

    it('should handle partial session data gracefully', () => {
      const partialSession = {
        sessionId: 'partial-session',
        duration: 15 * 60 * 1000,
        // Missing other fields
      };
      
      render(
        <DialecticSession 
          sessionData={partialSession}
          sessionPhase="practice"
          userRole="speaker"
          timeRemaining={900000}
        />
      );
      
      // Should work with available data
      expect(screen.getByText('15:00')).toBeInTheDocument();
      expect(screen.getByTestId('topic-display')).toHaveTextContent('dialectic.session.defaultTopic');
    });

    it('should validate session data integrity', () => {
      const invalidSession = {
        sessionId: 'invalid-session',
        duration: -1000, // Invalid duration
      };
      
      render(
        <DialecticSession 
          sessionData={invalidSession}
          sessionPhase="practice"
          userRole="speaker"
        />
      );
      
      // Should fall back to default duration
      expect(screen.getByText('15:00')).toBeInTheDocument(); // Default 15 minutes
    });
  });

  describe('Error Handling', () => {
    it('should handle missing session data gracefully', () => {
      render(
        <DialecticSession 
          sessionData={null}
          sessionPhase="practice"
          userRole="speaker"
        />
      );
      
      // Should show error state or fallback
      expect(
        screen.getByTestId('session-error') || 
        screen.getByTestId('duration-selector')
      ).toBeInTheDocument();
    });

    it('should handle corrupted session data', () => {
      const corruptedSession = {
        sessionId: null,
        duration: 'invalid',
        participants: 'not-an-array'
      };
      
      render(
        <DialecticSession 
          sessionData={corruptedSession}
          sessionPhase="practice"
          userRole="speaker"
        />
      );
      
      // Should handle gracefully and not crash
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
    });
  });

  describe('Integration with New Flow', () => {
    it('should integrate properly with SessionLobby flow', () => {
      // Simulate coming from lobby with full session context
      const lobbyToSessionData = {
        ...mockSessionData,
        status: 'active',
        startedAt: new Date(),
        lobbyDuration: 2 * 60 * 1000 // Time spent in lobby
      };
      
      render(
        <DialecticSession 
          sessionData={lobbyToSessionData}
          sessionPhase="practice"
          userRole="listener"
          timeRemaining={1200000} // Full 20 minutes
        />
      );
      
      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByTestId('listening-prompts')).toBeInTheDocument();
    });

    it('should maintain host context throughout session', () => {
      render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="practice"
          userRole="speaker"
          isHost={true}
        />
      );
      
      // Host should have additional controls
      expect(screen.getByTestId('host-session-controls')).toBeInTheDocument();
    });

    it('should handle real-time session updates', () => {
      const { rerender } = render(
        <DialecticSession 
          sessionData={mockSessionData}
          sessionPhase="practice"
          userRole="speaker"
          timeRemaining={1000000}
        />
      );
      
      // Update with new participant
      const updatedSession = {
        ...mockSessionData,
        participants: [
          ...mockSessionData.participants,
          { id: 'user-5', name: 'Eve', role: 'observer', status: 'ready' }
        ]
      };
      
      rerender(
        <DialecticSession 
          sessionData={updatedSession}
          sessionPhase="practice"
          userRole="speaker"
          timeRemaining={1000000}
        />
      );
      
      // Should reflect updated participant count
      expect(screen.getByText('5 participants')).toBeInTheDocument();
    });
  });
});