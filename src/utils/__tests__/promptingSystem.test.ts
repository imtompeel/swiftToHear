import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptingSystem } from '../promptingSystem';

describe('PromptingSystem', () => {
  let promptingSystem: PromptingSystem;
  let mockCallbacks: {
    onPromptDisplay: ReturnType<typeof vi.fn>;
    onPromptHide: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallbacks = {
      onPromptDisplay: vi.fn(),
      onPromptHide: vi.fn()
    };
    promptingSystem = new PromptingSystem(mockCallbacks);
  });

  describe('Silence-Based Prompting', () => {
    it('should trigger comfort prompts after 10 seconds of silence', () => {
      vi.useFakeTimers();
      
      promptingSystem.startSilenceMonitoring('speaker');
      
      // Simulate 10 seconds of silence
      vi.advanceTimersByTime(10000);
      
      expect(mockCallbacks.onPromptDisplay).toHaveBeenCalledWith({
        type: 'comfort',
        role: 'speaker',
        message: 'Take time to think',
        priority: 'low',
        duration: 3000
      });
      
      vi.useRealTimers();
    });

    it('should escalate prompts after longer silence periods', () => {
      vi.useFakeTimers();
      
      promptingSystem.startSilenceMonitoring('speaker');
      
      // Simulate 30 seconds of silence
      vi.advanceTimersByTime(30000);
      
      expect(mockCallbacks.onPromptDisplay).toHaveBeenCalledWith({
        type: 'reassurance',
        role: 'speaker',
        message: 'Pauses are welcome - the group is with you',
        priority: 'medium',
        duration: 5000
      });
      
      vi.useRealTimers();
    });

    it('should reset silence timer when audio activity detected', () => {
      vi.useFakeTimers();
      
      promptingSystem.startSilenceMonitoring('speaker');
      
      // Simulate 8 seconds of silence, then activity
      vi.advanceTimersByTime(8000);
      promptingSystem.onAudioActivity();
      
      // Continue for another 8 seconds (total 16, but should reset)
      vi.advanceTimersByTime(8000);
      
      // Should not trigger 10-second prompt since it was reset
      expect(mockCallbacks.onPromptDisplay).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'comfort' })
      );
      
      vi.useRealTimers();
    });
  });

  describe('Role-Specific Prompting', () => {
    it('should provide appropriate speaker prompts', () => {
      const speakerPrompts = promptingSystem.getRolePrompts('speaker');
      
      expect(speakerPrompts).toContain({
        trigger: 'silence-10s',
        message: 'Take time to think',
        type: 'comfort'
      });
      
      expect(speakerPrompts).toContain({
        trigger: 'silence-30s',
        message: 'Pauses are welcome - the group is with you',
        type: 'reassurance'
      });
    });

    it('should provide appropriate listener prompts', () => {
      const listenerPrompts = promptingSystem.getRolePrompts('listener');
      
      expect(listenerPrompts).toContain({
        trigger: 'speaker-pause',
        message: 'Notice your impulse to respond',
        type: 'guidance'
      });
      
      expect(listenerPrompts).toContain({
        trigger: 'speaker-finished',
        message: 'What did you hear?',
        type: 'reflection-starter'
      });
    });

    it('should provide appropriate scribe prompts', () => {
      const scribePrompts = promptingSystem.getRolePrompts('scribe');
      
      expect(scribePrompts).toContain({
        trigger: 'session-start',
        message: 'Capture key phrases, not everything',
        type: 'guidance'
      });
      
      expect(scribePrompts).toContain({
        trigger: 'theme-detected',
        message: 'Consider tagging this theme',
        type: 'suggestion'
      });
    });
  });

  describe('Contextual Prompting', () => {
    it('should adjust prompts based on session phase', () => {
      promptingSystem.setSessionContext({
        phase: 'practice',
        round: 1,
        userExperience: 'first-time'
      });
      
      const prompts = promptingSystem.getContextualPrompts('speaker');
      
      expect(prompts).toContain(
        expect.objectContaining({
          message: expect.stringContaining('first time'),
          type: 'encouragement'
        })
      );
    });

    it('should reduce prompting for experienced users', () => {
      promptingSystem.setSessionContext({
        phase: 'practice',
        round: 2,
        userExperience: 'experienced'
      });
      
      const prompts = promptingSystem.getContextualPrompts('speaker');
      
      // Should have fewer prompts for experienced users
      expect(prompts.length).toBeLessThan(5);
      expect(prompts.every(p => p.priority !== 'low')).toBe(true);
    });

    it('should provide encouragement during difficult moments', () => {
      promptingSystem.setSessionContext({
        phase: 'practice',
        round: 1,
        emotionalState: 'struggling'
      });
      
      promptingSystem.triggerPrompt('difficulty-detected', 'speaker');
      
      expect(mockCallbacks.onPromptDisplay).toHaveBeenCalledWith({
        type: 'encouragement',
        message: 'This is part of the learning process',
        priority: 'high',
        duration: 5000
      });
    });
  });

  describe('Adaptive Prompting', () => {
    it('should learn from user interactions and adapt', () => {
      // User consistently dismisses comfort prompts quickly
      promptingSystem.recordInteraction('comfort', 'dismissed-quickly');
      promptingSystem.recordInteraction('comfort', 'dismissed-quickly');
      promptingSystem.recordInteraction('comfort', 'dismissed-quickly');
      
      // Should adapt to show fewer comfort prompts
      const adaptedPrompts = promptingSystem.getAdaptedPrompts('speaker');
      const comfortPrompts = adaptedPrompts.filter(p => p.type === 'comfort');
      
      expect(comfortPrompts.length).toBeLessThan(2);
    });

    it('should increase prompting frequency if user engages positively', () => {
      // User engages well with guidance prompts
      promptingSystem.recordInteraction('guidance', 'engaged-positively');
      promptingSystem.recordInteraction('guidance', 'engaged-positively');
      
      const adaptedPrompts = promptingSystem.getAdaptedPrompts('listener');
      const guidancePrompts = adaptedPrompts.filter(p => p.type === 'guidance');
      
      expect(guidancePrompts.length).toBeGreaterThan(3);
    });
  });

  describe('Non-Disruptive Display', () => {
    it('should queue prompts to avoid overwhelming users', () => {
      promptingSystem.displayPrompt({
        type: 'comfort',
        message: 'First prompt',
        priority: 'low'
      });
      
      promptingSystem.displayPrompt({
        type: 'guidance',
        message: 'Second prompt',
        priority: 'medium'
      });
      
      // Should only display one at a time
      expect(mockCallbacks.onPromptDisplay).toHaveBeenCalledTimes(1);
      expect(promptingSystem.promptQueue).toHaveLength(1);
    });

    it('should prioritize high-priority prompts', () => {
      promptingSystem.displayPrompt({
        type: 'comfort',
        message: 'Low priority',
        priority: 'low'
      });
      
      promptingSystem.displayPrompt({
        type: 'error',
        message: 'High priority',
        priority: 'high'
      });
      
      // Should display high priority prompt first
      expect(mockCallbacks.onPromptDisplay).toHaveBeenLastCalledWith(
        expect.objectContaining({
          message: 'High priority',
          priority: 'high'
        })
      );
    });

    it('should respect minimum time between prompts', () => {
      vi.useFakeTimers();
      
      promptingSystem.displayPrompt({
        type: 'comfort',
        message: 'First prompt',
        priority: 'low'
      });
      
      // Try to display another prompt immediately
      promptingSystem.displayPrompt({
        type: 'guidance',
        message: 'Second prompt',
        priority: 'low'
      });
      
      // Should not display second prompt yet
      expect(mockCallbacks.onPromptDisplay).toHaveBeenCalledTimes(1);
      
      // Advance time past minimum interval
      vi.advanceTimersByTime(3000);
      
      // Now second prompt should display
      expect(mockCallbacks.onPromptDisplay).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('Progress-Aware Prompting', () => {
    it('should reduce prompting as user gains confidence', () => {
      // Simulate user progress through multiple rounds
      promptingSystem.updateUserProgress({
        sessionsCompleted: 3,
        rolesExperienced: ['speaker', 'listener', 'scribe'],
        confidenceLevel: 'high'
      });
      
      const prompts = promptingSystem.getProgressAwarePrompts('speaker');
      
      // Should have minimal prompts for confident users
      expect(prompts.length).toBeLessThan(3);
      expect(prompts.every(p => p.type !== 'basic-guidance')).toBe(true);
    });

    it('should provide extra support for new users', () => {
      promptingSystem.updateUserProgress({
        sessionsCompleted: 0,
        rolesExperienced: [],
        confidenceLevel: 'low'
      });
      
      const prompts = promptingSystem.getProgressAwarePrompts('speaker');
      
      // Should have comprehensive prompts for new users
      expect(prompts.length).toBeGreaterThan(5);
      expect(prompts.some(p => p.type === 'encouragement')).toBe(true);
    });
  });

  describe('Accessibility Features', () => {
    it('should provide screen reader compatible prompts', () => {
      promptingSystem.setAccessibilityMode('screen-reader');
      
      const prompt = promptingSystem.formatPrompt({
        type: 'comfort',
        message: 'Take time to think',
        role: 'speaker'
      });
      
      expect(prompt.ariaLabel).toBeDefined();
      expect(prompt.ariaLive).toBe('polite');
      expect(prompt.role).toBe('status');
    });

    it('should respect reduced motion preferences', () => {
      promptingSystem.setAccessibilityMode('reduced-motion');
      
      const prompt = promptingSystem.formatPrompt({
        type: 'comfort',
        message: 'Take time to think'
      });
      
      expect(prompt.animation).toBe('none');
      expect(prompt.transition).toBe('instant');
    });
  });
});