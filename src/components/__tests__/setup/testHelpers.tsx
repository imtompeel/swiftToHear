import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { SessionContext, SessionParticipant } from '../../../types/sessionContext';
import { mockTopics } from './mocks';

export const createMockSessionContext = (
  overrides: Partial<SessionContext> = {}
): SessionContext => ({
  sessionId: 'test-session-123',
  sessionName: 'Test Session',
  duration: 15,
  topic: mockTopics.personalGrowth.customPrompt,
  hostId: 'host-user-id',
  hostName: 'Test Host',
  createdAt: { seconds: 0, nanoseconds: 0 } as SessionContext['createdAt'],
  participants: [
    { id: 'host-user-id', name: 'Test Host', role: 'host', status: 'ready' },
    { id: 'user-2', name: 'Bob', role: 'speaker', status: 'ready' },
    { id: 'user-3', name: 'Charlie', role: 'listener', status: 'ready' },
  ] as SessionParticipant[],
  status: 'active',
  minParticipants: 2,
  maxParticipants: 4,
  topicSuggestions: [],
  currentRound: 1,
  isGroupSession: false,
  ...overrides,
});

export const defaultRoleInterfaceProps = (sessionOverrides?: Partial<SessionContext>) => ({
  session: createMockSessionContext(sessionOverrides),
  currentUserId: 'user-2',
  currentUserName: 'Bob',
  participants: createMockSessionContext(sessionOverrides).participants,
  videoCall: null,
});

export const renderWithRouter = (
  ui: ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {}
) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>, options);

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {}
) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>,
    options
  );
