import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { HoverTimer } from '../HoverTimer';

describe('HoverTimer Component', () => {
  const defaultProps = {
    timeRemaining: 125000, // 2 minutes 5 seconds in milliseconds
    className: 'test-timer-class'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render hover timer component', () => {
      render(<HoverTimer {...defaultProps} />);
      
      expect(screen.getByTestId('hover-timer')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<HoverTimer {...defaultProps} />);
      
      const timerContainer = screen.getByTestId('hover-timer');
      expect(timerContainer).toHaveClass('test-timer-class');
    });

    it('should show eye icon by default', () => {
      render(<HoverTimer {...defaultProps} />);
      
      expect(screen.getByTestId('timer-eye-icon')).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    it('should format time correctly for minutes and seconds', () => {
      render(<HoverTimer {...defaultProps} />);
      
      // Should show 2:05 format
      expect(screen.getByText('2:05')).toBeInTheDocument();
    });

    it('should handle zero time remaining', () => {
      render(<HoverTimer timeRemaining={0} />);
      
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    it('should handle large time values', () => {
      render(<HoverTimer timeRemaining={3661000} />); // 1 hour 1 minute 1 second
      
      expect(screen.getByText('61:01')).toBeInTheDocument();
    });

    it('should handle negative time values', () => {
      render(<HoverTimer timeRemaining={-5000} />);
      
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  describe('Hover Functionality', () => {
    it('should show timer on hover', async () => {
      render(<HoverTimer {...defaultProps} />);
      
      const timerContainer = screen.getByTestId('hover-timer');
      
      // Initially timer should be hidden
      expect(screen.getByTestId('timer-display')).toHaveClass('opacity-0');
      
      // Hover to show timer
      fireEvent.mouseEnter(timerContainer);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-display')).toHaveClass('opacity-100');
      });
    });

    it('should hide timer when hover ends', async () => {
      render(<HoverTimer {...defaultProps} />);
      
      const timerContainer = screen.getByTestId('hover-timer');
      
      // Hover to show timer
      fireEvent.mouseEnter(timerContainer);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-display')).toHaveClass('opacity-100');
      });
      
      // Leave hover to hide timer
      fireEvent.mouseLeave(timerContainer);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-display')).toHaveClass('opacity-0');
      });
    });
  });

  describe('Eye Toggle Functionality', () => {
    it('should toggle timer visibility when eye icon is clicked', async () => {
      render(<HoverTimer {...defaultProps} />);
      
      const eyeButton = screen.getByTestId('timer-eye-button');
      
      // Initially timer should be hidden
      expect(screen.getByTestId('timer-display')).toHaveClass('opacity-0');
      
      // Click eye icon to show timer permanently
      fireEvent.click(eyeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-display')).toHaveClass('opacity-100');
      });
      
      // Click eye icon again to hide timer
      fireEvent.click(eyeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-display')).toHaveClass('opacity-0');
      });
    });

    it('should change eye icon when toggled', async () => {
      render(<HoverTimer {...defaultProps} />);
      
      const eyeButton = screen.getByTestId('timer-eye-button');
      
      // Initially should show eye-open icon
      expect(screen.getByTestId('timer-eye-icon')).toHaveClass('fa-eye');
      
      // Click to toggle
      fireEvent.click(eyeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-eye-icon')).toHaveClass('fa-eye-slash');
      });
      
      // Click again to toggle back
      fireEvent.click(eyeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('timer-eye-icon')).toHaveClass('fa-eye');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HoverTimer {...defaultProps} />);
      
      const eyeButton = screen.getByTestId('timer-eye-button');
      expect(eyeButton).toHaveAttribute('aria-label');
    });

    it('should have proper test IDs for testing', () => {
      render(<HoverTimer {...defaultProps} />);
      
      expect(screen.getByTestId('hover-timer')).toBeInTheDocument();
      expect(screen.getByTestId('timer-display')).toBeInTheDocument();
      expect(screen.getByTestId('timer-eye-button')).toBeInTheDocument();
      expect(screen.getByTestId('timer-eye-icon')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined timeRemaining', () => {
      render(<HoverTimer timeRemaining={undefined as any} />);
      
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    it('should handle null timeRemaining', () => {
      render(<HoverTimer timeRemaining={null as any} />);
      
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    it('should handle very small time values', () => {
      render(<HoverTimer timeRemaining={500} />); // 0.5 seconds
      
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });
});
