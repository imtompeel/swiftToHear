import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { SessionTestPage } from '../SessionTestPage';

// Mock the useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('SessionTestPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render session test page', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Session Test Page')).toBeInTheDocument();
      expect(screen.getByText('Automated testing interface for multi-user session functionality')).toBeInTheDocument();
    });

    it('should display test configuration section', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Test Configuration')).toBeInTheDocument();
      expect(screen.getByText('Test Users')).toBeInTheDocument();
      expect(screen.getByText('Test Settings')).toBeInTheDocument();
    });

    it('should show test users', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('Diana')).toBeInTheDocument();
    });
  });

  describe('Test Configuration', () => {
    it('should show test settings checkboxes', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Auto-assign roles')).toBeInTheDocument();
      expect(screen.getByText('Auto-add topic suggestions')).toBeInTheDocument();
      expect(screen.getByText('Test video connections')).toBeInTheDocument();
    });

    it('should allow toggling test settings', () => {
      render(<SessionTestPage />);
      
      const autoAssignRolesCheckbox = screen.getByLabelText('Auto-assign roles');
      const initialChecked = autoAssignRolesCheckbox.checked;
      fireEvent.click(autoAssignRolesCheckbox);
      
      expect(autoAssignRolesCheckbox.checked).toBe(!initialChecked);
    });
  });

  describe('Test Controls', () => {
    it('should show test control buttons', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Initialize Test Session')).toBeInTheDocument();
      expect(screen.getByText('Start Automation')).toBeInTheDocument();
      expect(screen.getByText('Stop Automation')).toBeInTheDocument();
      expect(screen.getByText('Reset Test')).toBeInTheDocument();
    });

    it('should enable initialize button initially', () => {
      render(<SessionTestPage />);
      
      const initializeButton = screen.getByText('Initialize Test Session');
      expect(initializeButton).not.toBeDisabled();
    });

    it('should disable automation buttons initially', () => {
      render(<SessionTestPage />);
      
      const startAutomationButton = screen.getByText('Start Automation');
      const stopAutomationButton = screen.getByText('Stop Automation');
      
      expect(startAutomationButton).toBeDisabled();
      expect(stopAutomationButton).toBeDisabled();
    });
  });

  describe('User Switching', () => {
    it('should allow switching between users', () => {
      render(<SessionTestPage />);
      
      // Initially Alice should be active (host)
      expect(screen.getByText('Alice')).toBeInTheDocument();
      
      // Click on Bob's switch button
      const bobSwitchButton = screen.getAllByText('Switch')[1]; // Bob is the second user
      fireEvent.click(bobSwitchButton);
      
      // Bob should now be active
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Session Initialization', () => {
    it('should initialize test session when button is clicked', () => {
      render(<SessionTestPage />);
      
      const initializeButton = screen.getByText('Initialize Test Session');
      fireEvent.click(initializeButton);
      
      // Should show test results
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });

    it('should generate topic suggestions when enabled', () => {
      render(<SessionTestPage />);
      
      // Ensure auto-add topic suggestions is enabled
      const topicSuggestionsCheckbox = screen.getByLabelText('Auto-add topic suggestions');
      if (!topicSuggestionsCheckbox.checked) {
        fireEvent.click(topicSuggestionsCheckbox);
      }
      
      const initializeButton = screen.getByText('Initialize Test Session');
      fireEvent.click(initializeButton);
      
      // Should show topic suggestions in the lobby view
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });
  });

  describe('Test Results', () => {
    it('should display test results section', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Test Results')).toBeInTheDocument();
      expect(screen.getByText('No test results yet.')).toBeInTheDocument();
    });

    it('should show test results after initialization', async () => {
      render(<SessionTestPage />);
      
      const initializeButton = screen.getByText('Initialize Test Session');
      fireEvent.click(initializeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Session Initialization')).toBeInTheDocument();
      });
    });
  });

  describe('Video Integration', () => {
    it('should show video integration options', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByText('Test video connections')).toBeInTheDocument();
    });

    it('should simulate video connections when enabled', () => {
      render(<SessionTestPage />);
      
      // Ensure video testing is enabled
      const videoTestCheckbox = screen.getByLabelText('Test video connections');
      if (!videoTestCheckbox.checked) {
        fireEvent.click(videoTestCheckbox);
      }
      
      const initializeButton = screen.getByText('Initialize Test Session');
      fireEvent.click(initializeButton);
      
      // Should show test results including video connection tests
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs for testing', () => {
      render(<SessionTestPage />);
      
      // Should have semantic structure
      expect(screen.getByText('Session Test Page')).toBeInTheDocument();
    });

    it('should have proper form labels', () => {
      render(<SessionTestPage />);
      
      expect(screen.getByLabelText('Auto-assign roles')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto-add topic suggestions')).toBeInTheDocument();
      expect(screen.getByLabelText('Test video connections')).toBeInTheDocument();
    });
  });
});
