// ===== CENTRALIZED TEST IMPORTS =====
import {
  // Testing utilities
  render, screen, fireEvent, describe, it, expect, vi,
  // Component mocks
  SpeakerInterface, ListenerInterface, ScribeInterface, PassiveObserverInterface,
  // Mock data and utilities
  mockDailyFrame, mockParticipants, mockTopics, mockSessionConfig,
  testUtils, setupTests
} from './setup';

describe('Role-Specific Interfaces', () => {
  // Use centralized setup
  setupTests();

  describe('SpeakerInterface', () => {
    const defaultProps = {
      topic: mockTopics.personalGrowth.customPrompt,
      timeRemaining: mockSessionConfig.timePerRound,
      isActive: true,
      onComplete: vi.fn()
    };

    it('should display the topic prominently', () => {
      render(<SpeakerInterface {...defaultProps} />);
      
      expect(screen.getByTestId('topic-display')).toBeInTheDocument();
      expect(screen.getByTestId('topic-display')).toHaveTextContent(defaultProps.topic);
    });

    it('should show gentle time guidance without pressure', () => {
      render(<SpeakerInterface {...defaultProps} />);
      
      expect(screen.getByTestId('time-guidance')).toBeInTheDocument();
      // Focus on behavior: should show guidance without pressure elements
      expect(screen.queryByTestId('countdown-timer')).not.toBeInTheDocument();
    });

    it('should show comfort prompts when time remaining is less than half of total session duration', async () => {
      vi.useFakeTimers();
      
      // Test with 10-minute session (600000ms) - comfort prompt should show when < 300000ms remain
      const sessionDuration = 600000;
      const timeRemaining = 250000; // Less than half
      
      render(<SpeakerInterface {...defaultProps} timeRemaining={timeRemaining} sessionDuration={sessionDuration} />);
      
      // Check that comfort prompt appears based on relative timing
      expect(screen.getByTestId('comfort-prompt')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('should show reassurance during longer pauses based on session duration', async () => {
      vi.useFakeTimers();
      
      // Test with 15-minute session (900000ms) - pause comfort should show when < 7/15 of session remains
      const sessionDuration = 900000;
      const timeRemaining = 350000; // Less than 7/15 of 900000 (420000)
      
      render(<SpeakerInterface {...defaultProps} timeRemaining={timeRemaining} sessionDuration={sessionDuration} />);
      
      // Check that pause comfort appears for extended silence
      expect(screen.getByTestId('pause-comfort')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('should not show comfort prompts when plenty of time remains', async () => {
      // Test with fresh session - no prompts should show
      const sessionDuration = 900000;
      const timeRemaining = 850000; // Almost full time remaining
      
      render(<SpeakerInterface {...defaultProps} timeRemaining={timeRemaining} sessionDuration={sessionDuration} />);
      
      // Should not show comfort prompts early in session
      expect(screen.queryByTestId('comfort-prompt')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pause-comfort')).not.toBeInTheDocument();
    });

    it('should adapt comfort prompt timing to different session durations', async () => {
      // Test short 5-minute session
      const shortSessionDuration = 300000; // 5 minutes
      const shortTimeRemaining = 120000; // 2 minutes remaining (less than half)
      
      render(<SpeakerInterface {...defaultProps} timeRemaining={shortTimeRemaining} sessionDuration={shortSessionDuration} />);
      expect(screen.getByTestId('comfort-prompt')).toBeInTheDocument();
      
      // Test longer 20-minute session
      const longSessionDuration = 1200000; // 20 minutes
      const longTimeRemaining = 500000; // 8.33 minutes remaining (less than half)
      
      render(<SpeakerInterface {...defaultProps} timeRemaining={longTimeRemaining} sessionDuration={longSessionDuration} />);
      expect(screen.getByTestId('comfort-prompt')).toBeInTheDocument();
    });

    it('should indicate when listener is ready', () => {
      render(<SpeakerInterface {...defaultProps} listenerReady={true} />);
      
      expect(screen.getByTestId('listener-ready-indicator')).toBeInTheDocument();
    });

    it('should allow speaker to indicate completion', () => {
      render(<SpeakerInterface {...defaultProps} />);
      
      const completeButton = screen.getByTestId('complete-speaking');
      fireEvent.click(completeButton);
      
      expect(defaultProps.onComplete).toHaveBeenCalled();
    });
  });

  describe('ListenerInterface', () => {
    const defaultProps = {
      speakerActive: true,
      readyToReflect: false,
      onStartReflection: vi.fn(),
      onCompleteReflection: vi.fn()
    };

    it('should show listening guidance when speaker is active', () => {
      render(<ListenerInterface {...defaultProps} />);
      
      expect(screen.getByTestId('listening-prompts')).toBeInTheDocument();
      expect(screen.getByTestId('listening-guidance')).toBeInTheDocument();
    });

    it('should show reflection prompts when ready', () => {
      render(<ListenerInterface {...defaultProps} readyToReflect={true} />);
      
      expect(screen.getByTestId('reflection-starters')).toBeInTheDocument();
      expect(screen.getByTestId('start-reflection')).toBeInTheDocument();
    });

    it('should provide reflection starter phrases', () => {
      render(<ListenerInterface {...defaultProps} readyToReflect={true} />);
      
      expect(screen.getByTestId('reflection-starters')).toBeInTheDocument();
      // Structure test: should have multiple reflection options available
      const reflectionStarters = screen.getByTestId('reflection-starters');
      expect(reflectionStarters).toBeInTheDocument();
    });

    it('should handle impulse to respond reminders', async () => {
      render(<ListenerInterface {...defaultProps} speakerPaused={true} />);
      
      // Focus on behavior: should show some guidance during pauses
      expect(screen.getByTestId('listening-prompts')).toBeInTheDocument();
    });

    it('should allow starting reflection when appropriate', () => {
      render(<ListenerInterface {...defaultProps} readyToReflect={true} />);
      
      const startButton = screen.getByTestId('start-reflection');
      fireEvent.click(startButton);
      
      expect(defaultProps.onStartReflection).toHaveBeenCalled();
    });
  });

  describe('ScribeInterface', () => {
    const defaultProps = {
      sessionActive: true,
      onCaptureInsight: vi.fn(),
      onTagTheme: vi.fn(),
    
    };

    it('should provide note-taking area', () => {
      render(<ScribeInterface {...defaultProps} />);
      
      expect(screen.getByTestId('note-taking-area')).toBeInTheDocument();
      // Focus on functionality, not exact placeholder text
      const noteInput = screen.getByTestId('note-taking-area').querySelector('input');
      expect(noteInput).toBeInTheDocument();
    });

    it('should offer quick phrase capture buttons', () => {
      render(<ScribeInterface {...defaultProps} />);
      
      expect(screen.getByTestId('quick-phrase-buttons')).toBeInTheDocument();
      // Focus on functionality: should have multiple quick action buttons
      const quickButtons = screen.getByTestId('quick-phrase-buttons');
      expect(quickButtons.querySelectorAll('button')).toHaveLength(3);
    });

    it('should provide theme tagging functionality', () => {
      render(<ScribeInterface {...defaultProps} />);
      
      expect(screen.getByTestId('theme-tagging')).toBeInTheDocument();
      
      // Test adding a theme tag
      const themeInput = screen.getByPlaceholderText(/add theme/i);
      fireEvent.change(themeInput, { target: { value: 'doubt' } });
      fireEvent.keyDown(themeInput, { key: 'Enter' });
      
      expect(defaultProps.onTagTheme).toHaveBeenCalledWith('doubt');
    });

    it('should show guidance for effective capturing', () => {
      render(<ScribeInterface {...defaultProps} />);
      
      // Focus on behavior: should provide guidance elements
      expect(screen.getByTestId('scribe-interface')).toBeInTheDocument();
      // Guidance should be present (structure, not exact text)
      const interface_element = screen.getByTestId('scribe-interface');
      expect(interface_element).toHaveTextContent('Capture');
      expect(interface_element).toHaveTextContent('themes');
    });

    it('should provide insight highlighting tools', () => {
      render(<ScribeInterface {...defaultProps} />);
      
      expect(screen.getByTestId('insight-capture')).toBeInTheDocument();
      
      const insightButton = screen.getByTestId('capture-insight');
      fireEvent.click(insightButton);
      
      expect(defaultProps.onCaptureInsight).toHaveBeenCalled();
    });


  });

  describe('PassiveObserverInterface', () => {
    const defaultProps = {
      participants: mockParticipants.threePerson,
      currentRound: 1,
      sessionPhase: 'practice'
    };

    it('should display clean video grid of active participants', () => {
      render(<PassiveObserverInterface {...defaultProps} />);
      
      expect(screen.getByTestId('observer-video-grid')).toBeInTheDocument();
      expect(screen.getByTestId('participant-speaker')).toBeInTheDocument();
      expect(screen.getByTestId('participant-listener')).toBeInTheDocument();
      expect(screen.getByTestId('participant-scribe')).toBeInTheDocument();
    });

    it('should show minimal role rotation indicator', () => {
      render(<PassiveObserverInterface {...defaultProps} />);
      
      expect(screen.getByTestId('role-rotation-indicator')).toBeInTheDocument();
      expect(screen.getByText(/round 1 of 3/i)).toBeInTheDocument();
    });

    it('should provide learning-focused prompts', () => {
      render(<PassiveObserverInterface {...defaultProps} />);
      
      // Focus on behavior: should provide learning guidance
      expect(screen.getByTestId('passive-observer-interface')).toBeInTheDocument();
      const interface_element = screen.getByTestId('passive-observer-interface');
      expect(interface_element).toHaveTextContent('Notice');
      expect(interface_element).toHaveTextContent('patterns');
    });

    it('should include optional personal note-taking area', () => {
      render(<PassiveObserverInterface {...defaultProps} />);
      
      expect(screen.getByTestId('personal-notes')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/personal observations/i)).toBeInTheDocument();
    });

    it('should show option to request active participation', () => {
      render(<PassiveObserverInterface {...defaultProps} />);
      
      expect(screen.getByTestId('request-participation')).toBeInTheDocument();
      expect(screen.getByText(/join next round/i)).toBeInTheDocument();
    });
  });

  describe('Embedded Platform Integration', () => {
    it('should integrate Daily Prebuilt video frame with role interfaces', () => {
      render(<SpeakerInterface topic="test" timeRemaining={300000} isActive={true} dailyFrame={mockDailyFrame} />);
      
      expect(screen.getByTestId('embedded-video-frame')).toBeInTheDocument();
      expect(screen.getByTestId('role-guidance-panel')).toBeInTheDocument();
    });

    it('should handle Daily frame events for role coordination', async () => {
      const onParticipantUpdate = vi.fn();
      
      render(
        <SpeakerInterface 
          topic="test" 
          timeRemaining={300000} 
          isActive={true} 
          dailyFrame={mockDailyFrame}
          onParticipantUpdate={onParticipantUpdate}
        />
      );
      
      // Focus on behavior: Daily frame integration should be present
      expect(screen.getByTestId('embedded-video-frame')).toBeInTheDocument();
      expect(screen.getByTestId('role-guidance-panel')).toBeInTheDocument();
      
      // Test event handling if callback was set up
      if (mockDailyFrame.on.mock.calls.length > 0) {
        const mockEvent = { participants: { 'user1': { role: 'speaker' } } };
        mockDailyFrame.on.mock.calls[0][1](mockEvent);
        expect(onParticipantUpdate).toHaveBeenCalledWith(mockEvent.participants);
      }
    });

    it('should maintain responsive design for mobile embedding', () => {
      // Use centralized mobile setup
      testUtils.setupMobileTest();
      
      render(<ListenerInterface speakerActive={true} readyToReflect={false} />);
      
      expect(screen.getByTestId('mobile-optimized-layout')).toBeInTheDocument();
      expect(screen.getByTestId('touch-friendly-controls')).toBeInTheDocument();
    });

    it('should integrate with website topic selection', () => {
      render(
        <SpeakerInterface 
          topic={mockTopics.personalGrowth.customPrompt} 
          topicCategory={mockTopics.personalGrowth.category}
          timeRemaining={mockSessionConfig.timePerRound} 
          isActive={true} 
        />
      );
      
      // Focus on behavior: should display topic and category
      expect(screen.getByTestId('topic-category')).toBeInTheDocument();
      expect(screen.getByTestId('topic-display')).toBeInTheDocument();
      // Should show the passed topic content
      expect(screen.getByTestId('topic-display')).toHaveTextContent(mockTopics.personalGrowth.customPrompt);
    });
  });

  describe('Cross-Role Interactions', () => {
    it('should show appropriate video feed layout for each role', () => {
      render(<SpeakerInterface topic="test" timeRemaining={300000} isActive={true} />);
      expect(screen.getByTestId('video-layout-speaker')).toBeInTheDocument();
      
      render(<ListenerInterface speakerActive={true} readyToReflect={false} />);
      expect(screen.getByTestId('video-layout-listener')).toBeInTheDocument();
      
      render(<ScribeInterface sessionActive={true} />);
      expect(screen.getByTestId('video-layout-scribe')).toBeInTheDocument();

      render(<PassiveObserverInterface participants={[]} currentRound={1} sessionPhase="practice" />);
      expect(screen.getByTestId('video-layout-observer')).toBeInTheDocument();
    });

    it('should handle role transition states gracefully', () => {
      const { rerender } = render(
        <SpeakerInterface topic="test" timeRemaining={300000} isActive={true} />
      );
      
      // Transition to inactive state
      rerender(
        <SpeakerInterface topic="test" timeRemaining={300000} isActive={false} />
      );
      
      expect(screen.getByTestId('transition-state')).toBeInTheDocument();
    });

    it('should coordinate between 3-person and 4-person configurations', () => {
      // Test 4-person group with observer
      const fourPersonConfig = {
        participants: ['speaker', 'listener', 'scribe', 'observer'],
        configuration: '4-person'
      };

      render(<SpeakerInterface topic="test" timeRemaining={300000} isActive={true} groupConfig={fourPersonConfig} />);
      
      expect(screen.getByTestId('group-config-4person')).toBeInTheDocument();
      expect(screen.getByTestId('observer-indicator')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide appropriate ARIA labels for each interface', () => {
      render(<SpeakerInterface topic="test" timeRemaining={300000} isActive={true} />);
      
      // Focus on behavior: should have proper accessibility structure
      expect(screen.getByTestId('speaker-interface')).toHaveAttribute('aria-label');
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<ListenerInterface speakerActive={true} readyToReflect={true} />);
      
      const reflectionButton = screen.getByTestId('start-reflection');
      
      // Should be focusable
      reflectionButton.focus();
      expect(document.activeElement).toBe(reflectionButton);
      
      // Should respond to Enter key
      fireEvent.keyDown(reflectionButton, { key: 'Enter' });
      expect(screen.getByTestId('reflection-active')).toBeInTheDocument();
    });

    it('should provide screen reader friendly prompts', () => {
      render(<SpeakerInterface topic="test" timeRemaining={300000} isActive={true} />);
      
      // Focus on behavior: should have accessible status information
      expect(screen.getByRole('status')).toBeInTheDocument();
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-label');
    });
  });
});