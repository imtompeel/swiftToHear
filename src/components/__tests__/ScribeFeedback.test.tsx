import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ScribeFeedback } from '../ScribeFeedback';
import { createSessionContext } from '../../types/sessionContext';

// Mock the useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the HoverTimer component
vi.mock('../HoverTimer', () => ({
  HoverTimer: ({ timeRemaining }: { timeRemaining: number }) => (
    <div data-testid="hover-timer">Timer: {timeRemaining}</div>
  ),
}));

describe('ScribeFeedback Component', () => {
  const mockSession = createSessionContext({
    sessionId: 'test-session',
    currentRound: 1,
    currentPhase: 'transition',
    participants: [
      { id: '1', name: 'Speaker', role: 'speaker' },
      { id: '2', name: 'Listener', role: 'listener' },
      { id: '3', name: 'Scribe', role: 'scribe' },
    ],
  });

  const defaultProps = {
    session: mockSession,
    currentUserId: '1',
    currentUserName: 'Speaker',
    participants: mockSession.participants,
    onComplete: vi.fn(),
    isHost: false,
    notes: 'Test scribe notes',
  };

  it('should render without video components', () => {
    render(<ScribeFeedback {...defaultProps} />);
    
    // Should render the main component
    expect(screen.getByTestId('scribe-feedback')).toBeInTheDocument();
    
    // Should render the title
    expect(screen.getByText('dialectic.session.scribeFeedback.title')).toBeInTheDocument();
    
    // Should render the notes
    expect(screen.getByText('Test scribe notes')).toBeInTheDocument();
    
    // Should NOT render any video-related elements
    expect(screen.queryByText('shared.common.videoCall')).not.toBeInTheDocument();
  });

  it('should render guidelines for scribe and listeners', () => {
    render(<ScribeFeedback {...defaultProps} />);
    
    // Should render scribe guidelines
    expect(screen.getByText('dialectic.session.scribeFeedback.guidelines.title')).toBeInTheDocument();
    
    // Should render listener guidelines
    expect(screen.getByText('dialectic.session.scribeFeedback.listenerGuidelines.title')).toBeInTheDocument();
  });

  it('should show complete button only for host', () => {
    const { rerender } = render(<ScribeFeedback {...defaultProps} />);
    
    // Should not show complete button for non-host
    expect(screen.queryByText('dialectic.session.scribeFeedback.complete')).not.toBeInTheDocument();
    
    // Should show complete button for host
    rerender(<ScribeFeedback {...defaultProps} isHost={true} />);
    expect(screen.getByText('dialectic.session.scribeFeedback.complete')).toBeInTheDocument();
  });

  it('should not render notes section when notes are not provided', () => {
    render(<ScribeFeedback {...defaultProps} notes={undefined} />);
    
    // Should not render notes title
    expect(screen.queryByText('dialectic.session.scribeFeedback.notesTitle')).not.toBeInTheDocument();
  });
});
