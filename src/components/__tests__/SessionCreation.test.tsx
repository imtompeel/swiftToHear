// ===== CENTRALIZED TEST IMPORTS =====
import {
  // Testing utilities
  render, screen, fireEvent, waitFor, describe, it, expect, vi,
  // Mock data and utilities
  testUtils, setupTests, beforeEach
} from './setup';

// Import the real component
import { SessionCreation } from '../SessionCreation';

describe('SessionCreation Component', () => {
  // Use centralized setup
  setupTests();

  const mockOnSessionCreate = vi.fn();
  const defaultProps = {
    onSessionCreate: mockOnSessionCreate
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock crypto.randomUUID for session ID generation
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn(() => 'test-session-id-123')
      },
      configurable: true
    });
  });

  describe('Session Duration Selection', () => {
    it('should display duration selection as the primary option', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('session-creation-form')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.duration.label')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.duration.description')).toBeInTheDocument();
    });

    it('should offer preset duration options', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('duration-option-5')).toBeInTheDocument();
      expect(screen.getByTestId('duration-option-10')).toBeInTheDocument();
      expect(screen.getByTestId('duration-option-15')).toBeInTheDocument();
      expect(screen.getByTestId('duration-option-20')).toBeInTheDocument();
    });

    it('should default to 15-minute duration', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const fifteenMinOption = screen.getByTestId('duration-option-15');
      expect(fifteenMinOption).toHaveClass('border-accent-500'); // Selected state
    });

    it('should allow selection of different durations', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const tenMinOption = screen.getByTestId('duration-option-10');
      fireEvent.click(tenMinOption);
      
      expect(tenMinOption).toHaveClass('border-accent-500');
      expect(screen.getByTestId('duration-option-15')).not.toHaveClass('border-accent-500');
    });

    it('should support custom duration input', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const customInput = screen.getByTestId('custom-duration-input');
      fireEvent.change(customInput, { target: { value: '12' } });
      
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });

    it('should validate custom duration bounds', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const customInput = screen.getByTestId('custom-duration-input');
      
      // Test minimum boundary
      fireEvent.change(customInput, { target: { value: '2' } });
      expect(screen.getByText('dialectic.creation.duration.minError')).toBeInTheDocument();
      
      // Test maximum boundary  
      fireEvent.change(customInput, { target: { value: '65' } });
      expect(screen.getByText('dialectic.creation.duration.maxError')).toBeInTheDocument();
      
      // Test valid value
      fireEvent.change(customInput, { target: { value: '25' } });
      expect(screen.queryByText('dialectic.creation.duration.minError')).not.toBeInTheDocument();
      expect(screen.queryByText('dialectic.creation.duration.maxError')).not.toBeInTheDocument();
    });
  });

  describe('Topic Selection', () => {
    it('should provide topic input section', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('topic-selection-section')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.topic.label')).toBeInTheDocument();
    });

    it('should offer sample topic suggestions', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByText('dialectic.creation.topic.suggestions')).toBeInTheDocument();
      expect(screen.getByTestId('sample-topic-1')).toBeInTheDocument();
      expect(screen.getByTestId('sample-topic-2')).toBeInTheDocument();
      expect(screen.getByTestId('sample-topic-3')).toBeInTheDocument();
    });

    it('should allow custom topic input', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const topicInput = screen.getByTestId('custom-topic-input');
      fireEvent.change(topicInput, { 
        target: { value: 'What challenges are we navigating in our community?' } 
      });
      
      expect(screen.getByDisplayValue(/what challenges are we navigating/i)).toBeInTheDocument();
    });

    it('should allow selecting suggested topics', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const suggestedTopic = screen.getByTestId('sample-topic-1');
      fireEvent.click(suggestedTopic);
      
      const topicInput = screen.getByTestId('custom-topic-input');
      expect(topicInput).toHaveValue(expect.stringContaining('alive'));
    });

    it('should make topic optional', () => {
      render(<SessionCreation {...defaultProps} />);
      
      // Should be able to create session without topic
      const createButton = screen.getByTestId('create-session-button');
      expect(createButton).not.toBeDisabled();
    });
  });

  describe('Session Configuration', () => {
    it('should provide session name input', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('session-name-input')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.sessionName.label')).toBeInTheDocument();
    });

    it('should generate default session name with timestamp', () => {
      const mockDate = new Date('2024-01-15T10:30:00');
      vi.setSystemTime(mockDate);
      
      render(<SessionCreation {...defaultProps} />);
      
      const nameInput = screen.getByTestId('session-name-input');
      expect(nameInput).toHaveValue('Dialectic Session - 15 Jan 2024');
    });

    it('should allow custom session name', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const nameInput = screen.getByTestId('session-name-input');
      fireEvent.change(nameInput, { target: { value: 'Community Deep Listening' } });
      
      expect(screen.getByDisplayValue('Community Deep Listening')).toBeInTheDocument();
    });

    it('should show expected participant count', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('participant-info')).toBeInTheDocument();
      expect(screen.getByText(/3-4 participants/i)).toBeInTheDocument();
    });
  });

  describe('Session Creation Process', () => {
    it('should generate unique session ID when creating', async () => {
      render(<SessionCreation {...defaultProps} />);
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(mockOnSessionCreate).toHaveBeenCalledWith({
          sessionId: 'test-session-id-123',
          sessionName: expect.any(String),
          duration: 15 * 60 * 1000, // Default 15 minutes
          topic: '',
          hostId: expect.any(String),
          createdAt: expect.any(Date),
          participants: [],
          status: 'waiting'
        });
      });
    });

    it('should create session with custom configuration', async () => {
      render(<SessionCreation {...defaultProps} />);
      
      // Wait for component to be ready
      await waitFor(() => {
        const createButton = screen.getByTestId('create-session-button');
        expect(createButton).not.toBeDisabled();
        expect(createButton).toHaveTextContent('dialectic.creation.create');
      });
      
      // Set custom duration
      fireEvent.click(screen.getByTestId('duration-option-10'));
      
      // Set custom topic
      const topicInput = screen.getByTestId('custom-topic-input');
      fireEvent.change(topicInput, { target: { value: 'Test topic' } });
      
      // Set custom name
      const nameInput = screen.getByTestId('session-name-input');
      fireEvent.change(nameInput, { target: { value: 'Custom Session' } });
      
      // Create session
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(mockOnSessionCreate).toHaveBeenCalledWith({
          sessionId: 'test-session-id-123',
          sessionName: 'Custom Session',
          duration: 10 * 60 * 1000, // 10 minutes
          topic: 'Test topic',
          hostId: expect.any(String),
          createdAt: expect.any(Date),
          participants: [],
          status: 'waiting'
        });
      });
    });

    it('should show loading state during creation', async () => {
      mockOnSessionCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<SessionCreation {...defaultProps} />);
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      expect(screen.getByText('dialectic.creation.creating')).toBeInTheDocument();
      expect(createButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.queryByText('dialectic.creation.creating')).not.toBeInTheDocument();
      });
    });

    it('should display shareable link after creation', async () => {
      render(<SessionCreation {...defaultProps} />);
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('session-link')).toBeInTheDocument();
        expect(screen.getByText(/practice\/join\/test-session-id-123/)).toBeInTheDocument();
      });
    });

    it('should provide copy link functionality', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText }
      });
      
      render(<SessionCreation {...defaultProps} />);
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        const copyButton = screen.getByTestId('copy-link-button');
        fireEvent.click(copyButton);
        
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining('practice/join/test-session-id-123')
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should require valid session name', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const nameInput = screen.getByTestId('session-name-input');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      expect(screen.getByText('dialectic.creation.sessionName.required')).toBeInTheDocument();
    });

    it('should disable create button during validation errors', () => {
      render(<SessionCreation {...defaultProps} />);
      
      // Trigger validation error
      const customInput = screen.getByTestId('custom-duration-input');
      fireEvent.change(customInput, { target: { value: '100' } });
      
      const createButton = screen.getByTestId('create-session-button');
      expect(createButton).toBeDisabled();
    });
  });

  describe('User Experience', () => {
    it('should show preview of session configuration', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('session-preview')).toBeInTheDocument();
      expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
    });

    it('should update preview when settings change', () => {
      render(<SessionCreation {...defaultProps} />);
      
      // Change duration
      fireEvent.click(screen.getByTestId('duration-option-20'));
      
      const preview = screen.getByTestId('session-preview');
      expect(preview).toHaveTextContent(/20 minutes/i);
    });

    it('should provide help text for each section', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByText('dialectic.creation.duration.help')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.topic.help')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.sessionName.help')).toBeInTheDocument();
    });

    it('should be mobile responsive', () => {
      testUtils.setupMobileTest();
      
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('mobile-optimized-layout')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA labels', () => {
      render(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByLabelText('dialectic.creation.duration.label')).toBeInTheDocument();
      expect(screen.getByLabelText('dialectic.creation.topic.label')).toBeInTheDocument();
      expect(screen.getByLabelText('dialectic.creation.sessionName.label')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const durationOptions = screen.getAllByRole('button');
      durationOptions.forEach(option => {
        expect(option).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should announce validation errors to screen readers', () => {
      render(<SessionCreation {...defaultProps} />);
      
      const customInput = screen.getByTestId('custom-duration-input');
      fireEvent.change(customInput, { target: { value: '100' } });
      
      expect(screen.getByRole('alert')).toHaveTextContent('dialectic.creation.duration.maxError');
    });
  });
});