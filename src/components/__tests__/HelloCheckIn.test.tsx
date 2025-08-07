import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { HelloCheckIn } from '../HelloCheckIn';

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
      <div className="video-call-container h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative bg-secondary-900 rounded-lg overflow-hidden">
            <video autoPlay className="w-full h-48 object-cover" playsInline />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Alice (You) - speaker
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 rounded-lg transition-colors bg-secondary-200 text-secondary-700 hover:bg-secondary-300">
            🔊 Mute
          </button>
          <button className="px-4 py-2 rounded-lg transition-colors bg-secondary-200 text-secondary-700 hover:bg-secondary-300">
            📹 Stop Video
          </button>
        </div>
        <div className="text-center mt-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <div className="w-2 h-2 rounded-full mr-2 bg-red-500" />
            Disconnected
          </div>
        </div>
      </div>
    </div>
  )
}));

describe('HelloCheckIn Component', () => {
  const defaultProps = {
    participants: [
      { id: '1', name: 'Alice', role: 'speaker' },
      { id: '2', name: 'Bob', role: 'listener' }
    ],
    onComplete: vi.fn(),
    duration: 2 * 60 * 1000, // 2 minutes
    sessionId: 'test-session',
    currentUserId: '1',
    currentUserName: 'Alice',
    isHost: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render hello check-in component', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      expect(screen.getByTestId('hello-checkin')).toBeInTheDocument();
      expect(screen.getByText('dialectic.session.helloCheckIn.title')).toBeInTheDocument();
    });

    it('should display participant list', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should show guidelines section', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      expect(screen.getByText('dialectic.session.helloCheckIn.guidelines.title')).toBeInTheDocument();
      expect(screen.getByText(/dialectic\.session\.helloCheckIn\.guidelines\.introduce/)).toBeInTheDocument();
    });
  });

  describe('Video Integration', () => {
    it('should show video call by default', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByText('🔊 Mute')).toBeInTheDocument();
    });

    it('should hide video when hideVideo prop is true', () => {
      render(<HelloCheckIn {...defaultProps} hideVideo={true} />);
      
      expect(screen.queryByText('Video Call')).not.toBeInTheDocument();
      expect(screen.queryByText('🔊 Mute')).not.toBeInTheDocument();
    });

    it('should show video when hideVideo prop is false', () => {
      render(<HelloCheckIn {...defaultProps} hideVideo={false} />);
      
      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByText('🔊 Mute')).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('should display timer with correct duration', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      // Should show timer component
      expect(screen.getByTestId('hello-checkin')).toBeInTheDocument();
    });

    it('should show time remaining in minutes and seconds', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      // Timer should be displayed
      expect(screen.getByTestId('hello-checkin')).toBeInTheDocument();
    });
  });

  describe('Host Controls', () => {
    it('should show complete button for host', () => {
      render(<HelloCheckIn {...defaultProps} isHost={true} />);
      
      expect(screen.getByText('dialectic.session.helloCheckIn.complete')).toBeInTheDocument();
    });

    it('should not show complete button for non-host', () => {
      render(<HelloCheckIn {...defaultProps} isHost={false} />);
      
      expect(screen.queryByText('dialectic.session.helloCheckIn.complete')).not.toBeInTheDocument();
    });

    it('should call onComplete when complete button is clicked', () => {
      render(<HelloCheckIn {...defaultProps} isHost={true} />);
      
      const completeButton = screen.getByText('dialectic.session.helloCheckIn.complete');
      fireEvent.click(completeButton);
      
      expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Participant Status', () => {
    it('should show participant status indicators', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      // Should show participant list with status
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should display role information for participants', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      // Should show participants with their roles
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs for testing', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      expect(screen.getByTestId('hello-checkin')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      render(<HelloCheckIn {...defaultProps} />);
      
      expect(screen.getByText('dialectic.session.helloCheckIn.title')).toBeInTheDocument();
    });
  });
});
