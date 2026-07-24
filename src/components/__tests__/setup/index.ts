// ===== CENTRALIZED TEST SETUP =====
import { vi } from 'vitest';

// jsdom does not implement HTMLMediaElement.play (used by HoverTimer module init)
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.pause = vi.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import '@testing-library/jest-dom';

const mockT = (key: string, params?: Record<string, unknown>) => {
  if (params) {
    return Object.entries(params).reduce(
      (result, [param, value]) => result.replace(`{{${param}}}`, String(value)),
      key
    );
  }
  return key;
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
      isInitialized: true,
    },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: mockT,
    changeLanguage: vi.fn(),
    getCurrentLanguage: () => 'en',
    getAvailableLanguages: () => ['en', 'es', 'fr'],
    getLanguageNames: () => ({ en: 'English', es: 'Español', fr: 'Français' }),
    isLoading: false,
  }),
}));

vi.mock('../../../hooks/useSession', () => ({
  useSession: () => ({
    session: null,
    loading: true,
    error: null,
    isHost: false,
    loadSession: vi.fn(),
    setupRealTimeListener: vi.fn(() => vi.fn()),
    getCurrentUserParticipant: vi.fn(() => null),
    completeRound: vi.fn(),
    continueRounds: vi.fn(),
    startFreeDialogue: vi.fn(),
    endSession: vi.fn(),
    completeHelloCheckIn: vi.fn(),
    completeScribeFeedback: vi.fn(),
    updateParticipantRole: vi.fn(),
  }),
}));

// Platform mocks (includes Firebase mocks)
export * from './mocks';

// Component mocks
export * from './componentMocks';

// Test helpers
export * from './testHelpers';

export { SessionCreation, SessionJoin, SessionLobby } from './componentMocks';

export { render, screen, fireEvent, waitFor } from '@testing-library/react';
export { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  mockViewport,
  mockBrowser,
  mockParticipants,
  createMockEvent,
  mockDailyFrame,
  simulateNetworkConditions,
} from './mocks';

export const testUtils = {
  setupMobileTest: () => {
    mockViewport.mobile();
  },

  setupDesktopTest: () => {
    mockViewport.desktop();
  },

  setupThreeUserSession: () => mockParticipants.threePerson,

  setupFourUserSession: () => mockParticipants.fourPerson,

  setupLargeGroup: () => mockParticipants.largeGroup,

  measureConnectionTime: async (testFn: () => Promise<void>) => {
    const startTime = Date.now();
    await testFn();
    return Date.now() - startTime;
  },

  triggerParticipantEvent: (participants: { id: string }[]) => {
    const event = createMockEvent(participants);
    if (mockDailyFrame.on.mock.calls.length > 0) {
      mockDailyFrame.on.mock.calls[0][1](event);
    }
    return event;
  },

  simulateNetworkCondition: (condition: 'high' | 'medium' | 'low') =>
    simulateNetworkConditions[condition](),

  resetViewport: () => {
    mockViewport.reset();
  },

  resetUserAgent: () => {
    mockBrowser.chrome();
  },
};

export const setupTests = () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });
};
