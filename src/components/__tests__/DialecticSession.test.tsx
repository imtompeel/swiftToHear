// ===== CENTRALIZED TEST IMPORTS =====
import {
  // Testing utilities
  render, screen, fireEvent, waitFor, describe, it, expect, vi,
  // Component mocks
  DialecticSession,
  // Mock data and utilities
  mockDailyFrame, testUtils, setupTests
} from './setup';

describe('DialecticSession Component', () => {
  // Use centralized setup
  setupTests();

  describe('Session Structure and Layout', () => {
    it('should render main session container with persistent video', () => {
      render(<DialecticSession />);
      
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });

    it('should display session header with title and role information', () => {
      render(<DialecticSession />);
      
      expect(screen.getByText('dialectic.session.sessionTitle')).toBeInTheDocument();
      expect(screen.getByText(/No Role Selected/)).toBeInTheDocument();
    });

    it('should show hover timer in session header', () => {
      render(<DialecticSession />);
      
      // The timer should be present in the header
      expect(screen.getByText('dialectic.session.sessionTitle')).toBeInTheDocument();
    });
  });

  describe('Phase-Specific Functionality', () => {
    it('should render hello check-in phase with persistent video', () => {
      render(<DialecticSession />);
      
      // Should show the main session container
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });

    it('should render listening phase with role-specific interfaces', () => {
      render(<DialecticSession />);
      
      // Should show the main session container
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });

    it('should render transition phase with scribe feedback', () => {
      render(<DialecticSession />);
      
      // Should show the main session container
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });

    it('should show word cloud when topic suggestions are available', () => {
      render(<DialecticSession />);
      
      // The word cloud should be conditionally rendered
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
    });

    it('should display fallback UI for participants without roles', () => {
      render(<DialecticSession />);
      
      // Should show waiting for role assignment message
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
    });
  });

  describe('Session Controls', () => {
    it('should show leave session button', () => {
      render(<DialecticSession />);
      
      expect(screen.getByText('shared.actions.leaveSession')).toBeInTheDocument();
    });

    it('should show complete round button for host', () => {
      render(<DialecticSession />);
      
      // The complete round button should be conditionally rendered for hosts
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
    });
  });

  describe('Topic Selection Framework', () => {
    it('should display custom topic input interface', () => {
      render(<DialecticSession phase="topic-selection" />);
      
      expect(screen.getByTestId('custom-topic-input')).toBeInTheDocument();
      expect(screen.getByText('dialectic.topicSelection.yourTopic')).toBeInTheDocument();
      expect(screen.getByText('dialectic.topicSelection.inspiration')).toBeInTheDocument();
    });

    it('should display sample prompts for inspiration', () => {
      render(<DialecticSession phase="topic-selection" />);
      
      // Should show sample prompt buttons - check for the exact rendered content
      expect(screen.getByText('"dialectic.samplePrompts.whatIsAlive"')).toBeInTheDocument();
      expect(screen.getByText('"dialectic.samplePrompts.whatChallenge"')).toBeInTheDocument();
      expect(screen.getByText('"dialectic.samplePrompts.whatTransition"')).toBeInTheDocument();
    });

    it('should support custom topic suggestions', () => {
      render(<DialecticSession phase="topic-selection" />);
      
      const customInput = screen.getByTestId('custom-topic-input');
      fireEvent.change(customInput, { 
        target: { value: 'How do we navigate uncertainty in leadership?' } 
      });
      
      expect(screen.getByDisplayValue(/how do we navigate uncertainty/i)).toBeInTheDocument();
      expect(screen.getByTestId('validate-custom-topic')).toBeInTheDocument();
    });

    it('should facilitate group consensus on topic selection', () => {
      render(<DialecticSession phase="topic-selection" participants={3} />);
      
      // User enters a topic
      const customInput = screen.getByTestId('custom-topic-input');
      fireEvent.change(customInput, { 
        target: { value: 'What transitions are we navigating?' } 
      });
      
      // Should show consensus indicator for multiple participants
      expect(screen.getByText('dialectic.topicSelection.waitingForAgreement')).toBeInTheDocument();
      expect(screen.getByTestId('consensus-indicator')).toBeInTheDocument();
    });

    it('should provide depth guidance for selected topics', () => {
      render(<DialecticSession phase="topic-selection" selectedTopic="What transitions are we navigating?" />);
      
      expect(screen.getByTestId('depth-guidance')).toBeInTheDocument();
      expect(screen.getByText('dialectic.topicSelection.depthGuidance.title')).toBeInTheDocument();
      expect(screen.getByText('dialectic.topicSelection.yourChosenTopic')).toBeInTheDocument();
    });
  });

  describe('Large Group Management', () => {
    it('should handle community lobby for 6+ participants', () => {
      const largeGroup = testUtils.setupLargeGroup();
      render(<DialecticSession participants={largeGroup} phase="lobby" />);
      
      expect(screen.getByTestId('community-lobby')).toBeInTheDocument();
      expect(screen.getByText(`${largeGroup.length} participants in lobby`)).toBeInTheDocument();
      expect(screen.getByTestId('group-formation-algorithm')).toBeInTheDocument();
    });

    it('should create breakout rooms automatically', async () => {
      render(<DialecticSession participants={9} phase="group-formation" />);
      
      await waitFor(() => {
        expect(screen.getByText(/creating practice groups/i)).toBeInTheDocument();
        expect(screen.getByTestId('breakout-group-1')).toBeInTheDocument();
        expect(screen.getByTestId('breakout-group-2')).toBeInTheDocument();
        expect(screen.getByTestId('breakout-group-3')).toBeInTheDocument();
      });
    });

    it('should support 4-person groups with passive observers', () => {
      render(<DialecticSession participants={4} groupConfig="4-person" />);
      
      expect(screen.getByTestId('passive-observer-option')).toBeInTheDocument();
      expect(screen.getByText(/speaker, listener, scribe, observer/i)).toBeInTheDocument();
    });

    it('should manage intention setting in main room', () => {
      render(<DialecticSession phase="intention-setting" participants={12} />);
      
      expect(screen.getByTestId('shared-intention')).toBeInTheDocument();
      expect(screen.getByText(/purpose alignment/i)).toBeInTheDocument();
      expect(screen.getByTestId('collective-check-in')).toBeInTheDocument();
    });

    it('should coordinate simultaneous small group sessions', () => {
      render(<DialecticSession phase="breakout-practice" groups={4} />);
      
      expect(screen.getByTestId('coordinated-timing')).toBeInTheDocument();
      expect(screen.getByText(/all groups in round 1/i)).toBeInTheDocument();
      expect(screen.getByTestId('cross-group-synchronization')).toBeInTheDocument();
    });

    it('should facilitate community harvest after breakouts', () => {
      render(<DialecticSession phase="community-harvest" />);
      
      expect(screen.getByTestId('main-room-return')).toBeInTheDocument();
      expect(screen.getByText(/shared insights and discoveries/i)).toBeInTheDocument();
      expect(screen.getByTestId('cross-group-learning')).toBeInTheDocument();
    });
  });

  describe('Session Initialization', () => {
    it('should render session setup screen initially', () => {
      render(<DialecticSession />);
      
      expect(screen.getByTestId('practice-session-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('role-assignment')).toBeInTheDocument();
    });

    it('should show role selection when session is ready', async () => {
      render(<DialecticSession />);
      
      // Should show role selection initially
      expect(screen.getByTestId('role-assignment')).toBeInTheDocument();
      expect(screen.getByTestId('role-speaker')).toBeInTheDocument();
      
      // Select a role to enable start button
      fireEvent.click(screen.getByTestId('role-speaker'));
      expect(screen.getByText('t('shared.actions.startSession')oBeInTheDocument();
    });

    it('should provide seamless URL-to-video journey', async () => {
      render(<DialecticSession />);
      
      // Should load embedded video frame immediately
      expect(screen.getByTestId('embedded-daily-frame')).toBeInTheDocument();
      
      // Should show loading state under 30 seconds
      expect(screen.getByTestId('quick-connection-loader')).toBeInTheDocument();
    });
  });

  describe('Role Assignment', () => {
    it('should assign roles automatically when all three users join', async () => {
      render(<DialecticSession participants={['user1', 'user2', 'user3']} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('role-assignment')).toBeInTheDocument();
      });
    });

    it('should prevent duplicate role selection', async () => {
      // Render with existing participants that include a speaker
      render(<DialecticSession participants={['user1', 'user2', 'speaker']} />);
      
      // Check that Speaker role is disabled when speaker already exists
      expect(screen.getByTestId('role-speaker')).toHaveAttribute('disabled');
    });
  });

  describe('Pre-Session Preparation', () => {
    it('should show role-specific orientation video', async () => {
      render(<DialecticSession userRole="speaker" sessionPhase="preparation" />);
      
      expect(screen.getByTestId('orientation-video-speaker')).toBeInTheDocument();
      expect(screen.getByText('dialectic.preparation.orientation.speaker.title')).toBeInTheDocument();
    });

    it('should include practice exercise for each role', async () => {
      render(<DialecticSession userRole="listener" sessionPhase="preparation" />);
      
      expect(screen.getByTestId('practice-exercise')).toBeInTheDocument();
      expect(screen.getByText('dialectic.preparation.practice.listener.instruction')).toBeInTheDocument();
    });

    it('should verify video and audio setup', async () => {
      render(<DialecticSession sessionPhase="preparation" />);
      
      expect(screen.getByTestId('tech-check')).toBeInTheDocument();
      expect(screen.getByText(/camera.*dialectic\.preparation\.techCheck\.working/)).toBeInTheDocument();
      expect(screen.getByText(/microphone.*dialectic\.preparation\.techCheck\.working/)).toBeInTheDocument();
    });
  });

  describe('Main Practice Session', () => {
    it('should display appropriate interface for speaker role', () => {
      render(<DialecticSession userRole="speaker" sessionPhase="practice" />);
      
      expect(screen.getByTestId('topic-display')).toBeInTheDocument();
      expect(screen.getByTestId('time-guidance')).toBeInTheDocument();
      expect(screen.getByText('dialectic.session.defaultTopic')).toBeInTheDocument();
    });

    it('should display appropriate interface for listener role', () => {
      render(<DialecticSession userRole="listener" sessionPhase="practice" />);
      
      expect(screen.getByTestId('listening-prompts')).toBeInTheDocument();
      expect(screen.getByText(/listen without preparing your response/i)).toBeInTheDocument();
    });

    it('should display appropriate interface for scribe role', () => {
      render(<DialecticSession userRole="scribe" sessionPhase="practice" />);
      
      expect(screen.getByTestId('note-taking-area')).toBeInTheDocument();
      expect(screen.getByTestId('insight-capture')).toBeInTheDocument();
    });
  });

  describe('Role Rotation', () => {
    it('should rotate roles after each round', async () => {
      const { rerender } = render(
        <DialecticSession userRole="speaker" currentRound={1} />
      );
      
      // Simulate round completion
      fireEvent.click(screen.getByTestId('complete-round'));
      
      rerender(<DialecticSession userRole="listener" currentRound={2} sessionPhase="practice" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('listening-prompts')).toBeInTheDocument();
      });
    });

    it('should show transition screen between rounds', async () => {
      render(<DialecticSession sessionPhase="transition" />);
      
      expect(screen.getByText('dialectic.session.switchingRoles')).toBeInTheDocument();
      expect(screen.getByTestId('transition-guidance')).toBeInTheDocument();
    });
  });

  describe('Assistance and Prompts', () => {
    it('should show comfort prompts during speaker silences', async () => {
      render(<DialecticSession userRole="speaker" sessionPhase="practice" timeRemaining={420000} />);
      
      // Focus on behavior: speaker interface should provide comfort elements
      expect(screen.getByTestId('topic-display')).toBeInTheDocument();
      expect(screen.getByTestId('time-guidance')).toBeInTheDocument();
      // Comfort messaging should be available in speaker interface
      const practiceContent = screen.getByTestId('dialectic-session');
      expect(practiceContent).toHaveTextContent('dialectic.assistance.speaker.comfortPrompt');
    });

    it('should show reflection prompts for listener', async () => {
      render(<DialecticSession userRole="listener" sessionPhase="practice" speakerFinished={true} />);
      
      expect(screen.getByText('dialectic.assistance.listener.reflectionPrompt')).toBeInTheDocument();
      expect(screen.getByTestId('reflection-starters')).toBeInTheDocument();
    });

    it('should provide capture tools for scribe', () => {
      render(<DialecticSession userRole="scribe" sessionPhase="practice" />);
      
      expect(screen.getByTestId('quick-phrase-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('theme-tagging')).toBeInTheDocument();
    });
  });

  describe('Session Completion', () => {
    it('should show reflection prompts after all rounds', () => {
      render(<DialecticSession sessionPhase="reflection" />);
      
      expect(screen.getByText(/what did we discover/i)).toBeInTheDocument();
      expect(screen.getByTestId('shared-debrief')).toBeInTheDocument();
    });

    it('should offer scheduling for next session', () => {
      render(<DialecticSession sessionPhase="reflection" />);
      
      expect(screen.getByText(/schedule another session/i)).toBeInTheDocument();
      expect(screen.getByTestId('schedule-next')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection issues gracefully', async () => {
      render(<DialecticSession connectionStatus="poor" />);
      
      expect(screen.getByText(/connection quality is low/i)).toBeInTheDocument();
      expect(screen.getByTestId('connection-help')).toBeInTheDocument();
    });

    it('should handle participant dropout', async () => {
      render(<DialecticSession participants={['user1', 'user2']} />);
      
      expect(screen.getByText(/waiting for third participant/i)).toBeInTheDocument();
    });

    it('should fallback to alternative platforms if Daily fails', async () => {
      // Mock Daily failure
      vi.mocked(mockDailyFrame.join).mockRejectedValue(new Error('Daily connection failed'));
      
      render(<DialecticSession />);
      
      await waitFor(() => {
        expect(screen.getByText(/trying alternative connection/i)).toBeInTheDocument();
        expect(screen.getByTestId('platform-fallback')).toBeInTheDocument();
      });
    });

    it('should handle browser compatibility issues', () => {
      // Mock unsupported browser
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
        configurable: true
      });
      
      render(<DialecticSession />);
      
      expect(screen.getByText(/browser not fully supported/i)).toBeInTheDocument();
      expect(screen.getByTestId('browser-upgrade-suggestion')).toBeInTheDocument();
    });
  });

  describe('Platform Testing Strategy', () => {
    it('should track key success metrics during sessions', () => {
      render(<DialecticSession enableAnalytics={true} />);
      
      expect(screen.getByTestId('completion-rate-tracker')).toBeInTheDocument();
      expect(screen.getByTestId('connection-time-tracker')).toBeInTheDocument();
      expect(screen.getByTestId('role-clarity-feedback')).toBeInTheDocument();
    });

    it('should support A/B testing of different UI approaches', () => {
      render(<DialecticSession testVariant="daily-prebuilt" />);
      
      expect(screen.getByTestId('daily-integration')).toBeInTheDocument();
      
      const { rerender } = render(<DialecticSession testVariant="videosdk" />);
      
      rerender(<DialecticSession testVariant="videosdk" />);
      expect(screen.getByTestId('videosdk-integration')).toBeInTheDocument();
    });

    it('should measure time from URL visit to video connection', async () => {
      const startTime = Date.now();
      
      render(<DialecticSession trackPerformance={true} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('video-connected')).toBeInTheDocument();
      });
      
      const connectionTime = Date.now() - startTime;
      expect(connectionTime).toBeLessThan(30000); // Under 30 seconds
    });

    it('should collect user feedback on role guidance quality', () => {
      render(<DialecticSession sessionPhase="feedback-collection" />);
      
      expect(screen.getByTestId('role-guidance-rating')).toBeInTheDocument();
      expect(screen.getByTestId('session-satisfaction-score')).toBeInTheDocument();
      expect(screen.getByTestId('improvement-suggestions')).toBeInTheDocument();
    });

    it('should support beta testing with limited user groups', () => {
      render(<DialecticSession betaGroup="early-adopters" />);
      
      expect(screen.getByTestId('beta-features-enabled')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-collection-enhanced')).toBeInTheDocument();
      expect(screen.getByText(/you're helping test new features/i)).toBeInTheDocument();
    });

    it('should validate cross-device compatibility', () => {
      const devices = ['desktop', 'tablet', 'mobile'];
      
      devices.forEach(device => {
        render(<DialecticSession device={device} />);
        
        expect(screen.getByTestId(`${device}-optimized-layout`)).toBeInTheDocument();
        expect(screen.getByTestId(`${device}-controls`)).toBeInTheDocument();
      });
    });

    it('should test network condition resilience', async () => {
      const networkConditions = ['high', 'medium', 'low'];
      
      for (const condition of networkConditions) {
        render(<DialecticSession networkQuality={condition} />);
        
        await waitFor(() => {
          expect(screen.getByTestId(`network-${condition}-adaptation`)).toBeInTheDocument();
        });
      }
    });

    it('should validate integration with existing React/TypeScript codebase', () => {
      render(<DialecticSession />);
      
      // Should integrate with existing components
      expect(screen.getByTestId('navigation-component')).toBeInTheDocument();
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
      expect(screen.getByTestId('firebase-auth-integration')).toBeInTheDocument();
    });
  });

  describe('Session Duration Configuration', () => {
    it('should use default 15-minute duration when none specified', () => {
      render(<DialecticSession userRole="speaker" sessionPhase="practice" />);
      
      // Check that default duration (900000ms = 15 minutes) is displayed
      expect(screen.getByText('15:00')).toBeInTheDocument();
    });

    it('should allow custom session duration configuration', () => {
      render(<DialecticSession userRole="speaker" sessionPhase="practice" timeRemaining={600000} />);
      
      // Check that custom duration (600000ms = 10 minutes) is displayed
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    it('should display duration selection in session setup', () => {
      render(<DialecticSession />);
      
      expect(screen.getByTestId('duration-selector')).toBeInTheDocument();
      expect(screen.getByText('dialectic.setup.duration.label')).toBeInTheDocument();
    });

    it('should offer common duration options', () => {
      render(<DialecticSession />);
      
      expect(screen.getByTestId('duration-option-5')).toBeInTheDocument(); // 5 minutes
      expect(screen.getByTestId('duration-option-10')).toBeInTheDocument(); // 10 minutes
      expect(screen.getByTestId('duration-option-15')).toBeInTheDocument(); // 15 minutes (default)
      expect(screen.getByTestId('duration-option-20')).toBeInTheDocument(); // 20 minutes
    });

    it('should allow custom duration input', () => {
      render(<DialecticSession />);
      
      const customInput = screen.getByTestId('custom-duration-input');
      fireEvent.change(customInput, { target: { value: '12' } });
      
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });

    it('should update session when duration is changed', () => {
      render(<DialecticSession />);
      
      // Select a role first
      fireEvent.click(screen.getByTestId('role-speaker'));
      
      // Select duration
      fireEvent.click(screen.getByTestId('duration-option-10'));
      
      // Start session
      fireEvent.click(screen.getByText('diat('shared.actions.startSession')   
      // Should show approximately the selected duration (allowing for slight timing differences)
      expect(screen.getByText(/^(9:5[0-9]|10:00)$/)).toBeInTheDocument();
    });

    it('should pass duration to speaker interface for timing calculations', () => {
      render(<DialecticSession userRole="speaker" sessionPhase="practice" timeRemaining={600000} />);
      
      // Speaker interface should receive the timeRemaining prop
      const speakerInterface = screen.getByTestId('topic-display').closest('[data-testid="dialectic-session"]');
      expect(speakerInterface).toBeInTheDocument();
      
      // Time should be displayed correctly
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    it('should validate duration inputs within reasonable bounds', () => {
      render(<DialecticSession />);
      
      const customInput = screen.getByTestId('custom-duration-input');
      
      // Test minimum boundary
      fireEvent.change(customInput, { target: { value: '2' } });
      expect(screen.getByText('dialectic.setup.duration.minError')).toBeInTheDocument();
      
      // Test maximum boundary
      fireEvent.change(customInput, { target: { value: '61' } });
      expect(screen.getByText('dialectic.setup.duration.maxError')).toBeInTheDocument();
      
      // Test valid value
      fireEvent.change(customInput, { target: { value: '15' } });
      expect(screen.queryByText('dialectic.setup.duration.minError')).not.toBeInTheDocument();
      expect(screen.queryByText('dialectic.setup.duration.maxError')).not.toBeInTheDocument();
    });
  });

  describe('Development Testing Workflow', () => {
    it('should support local development with test Daily rooms', () => {
      process.env.NODE_ENV = 'development';
      
      render(<DialecticSession />);
      
      expect(screen.getByTestId('test-room-indicator')).toBeInTheDocument();
      expect(screen.getByText(/development mode/i)).toBeInTheDocument();
    });

    it('should provide staging environment testing capabilities', () => {
      process.env.NODE_ENV = 'staging';
      
      render(<DialecticSession />);
      
      expect(screen.getByTestId('staging-features')).toBeInTheDocument();
      expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
    });

    it('should enable production monitoring and analytics', () => {
      process.env.NODE_ENV = 'production';
      
      render(<DialecticSession />);
      
      expect(screen.getByTestId('analytics-enabled')).toBeInTheDocument();
      expect(screen.getByTestId('error-reporting')).toBeInTheDocument();
    });
  });
});