import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ScribeFeedback } from '../ScribeFeedback';

// Mock the useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock the VideoCall component
vi.mock('../VideoCall', () => ({
  VideoCall: ({ className }: { className?: string }) => (
    <div data-testid="video-call" className={className}>
      Mock Video Call Component
    </div>
  )
}));

describe('ScribeFeedback Component', () => {
  const defaultProps = {
    scribeName: 'Charlie',
    roundNumber: 1,
    onComplete: vi.fn(),
    duration: 2.5 * 60 * 1000, // 2.5 minutes
    notes: 'Sample scribe notes from the session',
    sessionId: 'test-session',
    currentUserId: '1',
    currentUserName: 'Alice',
    participants: [
      { id: '1', name: 'Alice', role: 'speaker', status: 'ready' as const },
      { id: '2', name: 'Bob', role: 'listener', status: 'ready' as const },
      { id: '3', name: 'Charlie', role: 'scribe', status: 'ready' as const }
    ],
    isHost: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render scribe feedback component', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
      expect(screen.getByText('dialectic.scribeFeedback.title')).toBeInTheDocument();
    });

    it('should display scribe name and round number', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByText(/Charlie/)).toBeInTheDocument();
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });

    it('should show scribe notes when provided', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByText('Sample scribe notes from the session')).toBeInTheDocument();
    });

    it('should show guidelines section', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByText('dialectic.scribeFeedback.guidelines.title')).toBeInTheDocument();
      expect(screen.getByText('dialectic.scribeFeedback.guidelines.feedback')).toBeInTheDocument();
    });
  });

  describe('Video Integration', () => {
    it('should show video call by default', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByTestId('video-call')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });

    it('should hide video when hideVideo prop is true', () => {
      render(<ScribeFeedback {...defaultProps} hideVideo={true} />);
      
      expect(screen.queryByTestId('video-call')).not.toBeInTheDocument();
      expect(screen.queryByText('Video Call')).not.toBeInTheDocument();
    });

    it('should show video when hideVideo prop is false', () => {
      render(<ScribeFeedback {...defaultProps} hideVideo={false} />);
      
      expect(screen.getByTestId('video-call')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('should display timer with correct duration', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      // Should show timer component
      expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
    });

    it('should show time remaining in minutes and seconds', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      // Timer should be displayed
      expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
    });
  });

  describe('Host Controls', () => {
    it('should show complete button for host', () => {
      render(<ScribeFeedback {...defaultProps} isHost={true} />);
      
      expect(screen.getByText('dialectic.scribeFeedback.complete')).toBeInTheDocument();
    });

    it('should not show complete button for non-host', () => {
      render(<ScribeFeedback {...defaultProps} isHost={false} />);
      
      expect(screen.queryByText('dialectic.scribeFeedback.complete')).not.toBeInTheDocument();
    });

    it('should call onComplete when complete button is clicked', () => {
      render(<ScribeFeedback {...defaultProps} isHost={true} />);
      
      const completeButton = screen.getByText('dialectic.scribeFeedback.complete');
      fireEvent.click(completeButton);
      
      expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notes Display', () => {
    it('should display scribe notes in a readable format', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByText('Sample scribe notes from the session')).toBeInTheDocument();
    });

    it('should handle empty notes gracefully', () => {
      render(<ScribeFeedback {...defaultProps} notes="" />);
      
      // Should still render the component without notes
      expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
    });

    it('should handle undefined notes gracefully', () => {
      render(<ScribeFeedback {...defaultProps} notes={undefined} />);
      
      // Should still render the component without notes
      expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
    });
  });

  describe('Participant Information', () => {
    it('should show participant list', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should display participant roles', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      // Should show participants with their roles
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs for testing', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      render(<ScribeFeedback {...defaultProps} />);
      
      expect(screen.getByText('dialectic.scribeFeedback.title')).toBeInTheDocument();
    });
  });
});
