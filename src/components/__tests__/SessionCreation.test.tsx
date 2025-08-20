// ===== CENTRALIZED TEST IMPORTS =====
import React from 'react';
import {
  // Testing utilities
  render, screen, fireEvent, waitFor, describe, it, expect, vi,
  // Mock data and utilities
  testUtils, setupTests, beforeEach
} from './setup';

// Import the real component
import { SessionCreation } from '../SessionCreation';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';

// Mock window.matchMedia for ThemeProvider
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Create a test wrapper with ThemeProvider and BrowserRouter
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </BrowserRouter>
  );
};

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

  describe('Component Rendering', () => {
    it('should render the session creation component', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('session-creation-component')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.title')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.description')).toBeInTheDocument();
    });

    it('should display session type selector', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('session-type-selector')).toBeInTheDocument();
      expect(screen.getByText('shared.common.sessionType')).toBeInTheDocument();
      expect(screen.getByTestId('session-type-video')).toBeInTheDocument();
      expect(screen.getByTestId('session-type-in-person')).toBeInTheDocument();
    });

    it('should display duration selector', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('duration-selector')).toBeInTheDocument();
      expect(screen.getByText('shared.common.roundLength')).toBeInTheDocument();
    });

    it('should display create session button', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByTestId('create-session-button')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.create')).toBeInTheDocument();
    });
  });

  describe('Session Type Selection', () => {
    it('should allow selecting video call session type', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      const videoButton = screen.getByTestId('session-type-video');
      expect(videoButton).toHaveClass('border-accent-500'); // Selected by default
    });

    it('should allow selecting in-person session type', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      const inPersonButton = screen.getByTestId('session-type-in-person');
      fireEvent.click(inPersonButton);
      
      expect(inPersonButton).toHaveClass('border-accent-500');
      expect(screen.getByTestId('session-type-video')).not.toHaveClass('border-accent-500');
    });
  });

  describe('Session Creation', () => {
    it('should call onSessionCreate when create button is clicked', async () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(mockOnSessionCreate).toHaveBeenCalled();
      });
    });

    it('should show loading state during creation', async () => {
      mockOnSessionCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      const createButton = screen.getByTestId('create-session-button');
      fireEvent.click(createButton);
      
      expect(screen.getByText('dialectic.creation.creating')).toBeInTheDocument();
      expect(createButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.queryByText('dialectic.creation.creating')).not.toBeInTheDocument();
      });
    });
  });

  describe('Safety Guidelines', () => {
    it('should display safety guidelines link', () => {
      renderWithProviders(<SessionCreation {...defaultProps} />);
      
      expect(screen.getByText('View Safety Guidelines')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view safety guidelines/i })).toHaveAttribute('href', '/admin/safety');
    });
  });
});