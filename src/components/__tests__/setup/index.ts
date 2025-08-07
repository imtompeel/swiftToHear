// ===== CENTRALIZED TEST SETUP =====
// Import all mocks and utilities in one place

// Import jest-dom matchers for toBeInTheDocument, etc.
import '@testing-library/jest-dom';

// Mock useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      // Simple mock that returns the key for testing
      if (params) {
        let result = key;
        Object.keys(params).forEach(param => {
          result = result.replace(`{{${param}}}`, params[param]);
        });
        return result;
      }
      return key;
    }
  })
}));

// Platform mocks
export * from './mocks';

// Component mocks  
export * from './componentMocks';

// Export the new mock components specifically
export { SessionCreation, SessionJoin, SessionLobby } from './componentMocks';

// Re-export commonly used testing utilities
export { render, screen, fireEvent, waitFor } from '@testing-library/react';
export { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import mock data and utilities directly
import { mockViewport, mockBrowser, mockParticipants, createMockEvent, mockDailyFrame, simulateNetworkConditions } from './mocks';

// Test utilities
export const testUtils = {
  // Quick setup for common test scenarios
  setupMobileTest: () => {
    mockViewport.mobile();
  },
  
  setupDesktopTest: () => {
    mockViewport.desktop();
  },
  
  setupThreeUserSession: () => {
    return mockParticipants.threePerson;
  },
  
  setupFourUserSession: () => {
    return mockParticipants.fourPerson;
  },
  
  setupLargeGroup: () => {
    return mockParticipants.largeGroup;
  },
  
  // Performance testing utilities
  measureConnectionTime: async (testFn: () => Promise<void>) => {
    const startTime = Date.now();
    await testFn();
    return Date.now() - startTime;
  },
  
  // Mock Daily events
  triggerParticipantEvent: (participants: any[]) => {
    const event = createMockEvent(participants);
    if (mockDailyFrame.on.mock.calls.length > 0) {
      mockDailyFrame.on.mock.calls[0][1](event);
    }
    return event;
  },
  
  // Simulate network conditions
  simulateNetworkCondition: (condition: 'high' | 'medium' | 'low') => {
    return simulateNetworkConditions[condition]();
  },
  
  // Utility functions for tests
  resetViewport: () => {
    mockViewport.reset();
  },
  
  resetUserAgent: () => {
    mockBrowser.chrome();
  }
};



// Global test setup
export const setupTests = () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up any test-specific state
    vi.clearAllTimers();
    vi.useRealTimers();
  });
};