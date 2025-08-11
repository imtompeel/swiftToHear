// ===== CENTRALIZED TEST IMPORTS =====
import {
  // Testing utilities
  render, screen, fireEvent, waitFor, describe, it, expect, 
  setupTests
} from './setup';

import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import React from 'react';

describe('App Routing for Session Management', () => {
  // Use centralized setup
  setupTests();

  describe('Practice Route Structure', () => {
    it('should redirect /practice to /practice/create', () => {
      render(
        <MemoryRouter initialEntries={['/practice']}>
          <App />
        </MemoryRouter>
      );
      
      // Should automatically redirect to session creation
      expect(screen.getByTestId('session-creation-component')).toBeInTheDocument();
    });

    it('should render SessionCreation component at /practice/create', () => {
      render(
        <MemoryRouter initialEntries={['/practice/create']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-creation-component')).toBeInTheDocument();
      expect(screen.getByText('dialectic.creation.title')).toBeInTheDocument();
    });

    it('should render SessionJoin component at /practice/join/:sessionId', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-join-component')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.title')).toBeInTheDocument();
    });

    it('should render SessionLobby component at /practice/lobby/:sessionId', () => {
      render(
        <MemoryRouter initialEntries={['/practice/lobby/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-lobby-component')).toBeInTheDocument();
    });

    it('should render DialecticSession component at /practice/session/:sessionId', () => {
      render(
        <MemoryRouter initialEntries={['/practice/session/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
    });
  });

  describe('Session Flow Navigation', () => {
    it('should navigate from creation to lobby after session created', async () => {
      render(
        <MemoryRouter initialEntries={['/practice/create']}>
          <App />
        </MemoryRouter>
      );
      
      // Create a session
      fireEvent.click(screen.getByTestId('duration-option-15'));
      fireEvent.click(screen.getByTestId('create-session-button'));
      
      // Should navigate to lobby
      await waitFor(() => {
        expect(screen.getByTestId('session-lobby-component')).toBeInTheDocument();
      });
      
      // Check URL changed
      expect(window.location.pathname).toMatch(/\/practice\/lobby\/[a-z0-9-]+/);
    });

    it('should navigate from join to lobby after successful join', async () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      // Join a session
      fireEvent.click(screen.getByTestId('role-listener'));
      fireEvent.click(screen.getByTestId('join-session-button'));
      
      // Should navigate to lobby
      await waitFor(() => {
        expect(screen.getByTestId('session-lobby-component')).toBeInTheDocument();
      });
    });

    it('should navigate from lobby to active session when started', async () => {
      render(
        <MemoryRouter initialEntries={['/practice/lobby/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      // Start session (as host)
      fireEvent.click(screen.getByTestId('start-session-button'));
      fireEvent.click(screen.getByTestId('confirm-start-button'));
      
      // Should navigate to active session
      await waitFor(() => {
        expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
      });
      
      expect(window.location.pathname).toBe('/practice/session/test-session-123');
    });
  });

  describe('Route Parameters and State', () => {
    it('should pass sessionId parameter to components', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/my-custom-session']}>
          <App />
        </MemoryRouter>
      );
      
      // Should receive the sessionId parameter
      expect(screen.getByTestId('session-join-component')).toBeInTheDocument();
      expect(screen.getByTestId('session-id-display')).toHaveTextContent('my-custom-session');
    });

    it('should handle URL changes and maintain session state', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/practice/lobby/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-lobby-component')).toBeInTheDocument();
      
      // Navigate to different route with same session
      rerender(
        <MemoryRouter initialEntries={['/practice/session/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
    });

    it('should handle invalid session IDs gracefully', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/invalid-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-not-found')).toBeInTheDocument();
      expect(screen.getByText('dialectic.join.sessionNotFound')).toBeInTheDocument();
    });
  });

  describe('Session State Management Across Routes', () => {
    it('should maintain session configuration across navigation', async () => {
      render(
        <MemoryRouter initialEntries={['/practice/create']}>
          <App />
        </MemoryRouter>
      );
      
      // Create session with specific settings
      fireEvent.click(screen.getByTestId('duration-option-20'));
      const topicInput = screen.getByTestId('custom-topic-input');
      fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
      fireEvent.click(screen.getByTestId('create-session-button'));
      
      // Should be in lobby with same settings
      await waitFor(() => {
        expect(screen.getByTestId('session-lobby-component')).toBeInTheDocument();
        expect(screen.getByText(/20 minutes/i)).toBeInTheDocument();
        expect(screen.getByText('Test Topic')).toBeInTheDocument();
      });
    });

    it('should restore session state from localStorage', () => {
      // Pre-populate localStorage with session data
      const sessionData = {
        sessionId: 'restored-session-123',
        sessionName: 'Restored Session',
        duration: 10 * 60 * 1000,
        topic: 'Restored Topic',
        status: 'waiting'
      };
      localStorage.setItem('currentSession', JSON.stringify(sessionData));
      
      render(
        <MemoryRouter initialEntries={['/practice/lobby/restored-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByText('Restored Session')).toBeInTheDocument();
      expect(screen.getByText(/10 minutes/i)).toBeInTheDocument();
      expect(screen.getByText('Restored Topic')).toBeInTheDocument();
    });

    it('should clear session state when session ends', async () => {
      render(
        <MemoryRouter initialEntries={['/practice/session/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      // Complete session
      fireEvent.click(screen.getByTestId('complete-session-button'));
      
      await waitFor(() => {
        expect(localStorage.getItem('currentSession')).toBeNull();
      });
    });
  });

  describe('URL Generation and Sharing', () => {
    it('should generate correct join URLs for sessions', async () => {
      render(
        <MemoryRouter initialEntries={['/practice/create']}>
          <App />
        </MemoryRouter>
      );
      
      fireEvent.click(screen.getByTestId('create-session-button'));
      
      await waitFor(() => {
        const sessionLink = screen.getByTestId('session-link');
        expect(sessionLink).toHaveTextContent(
          expect.stringMatching(/practice\/join\/[a-z0-9-]+$/)
        );
      });
    });

    it('should handle deep linking to join URLs', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/shared-session-456']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-join-component')).toBeInTheDocument();
      // Should attempt to load session data for shared-session-456
    });

    it('should preserve query parameters for tracking', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/test-session-123?ref=email&source=invitation']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('session-join-component')).toBeInTheDocument();
      // Should track the referral source
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle navigation to non-existent routes', () => {
      render(
        <MemoryRouter initialEntries={['/practice/invalid-route']}>
          <App />
        </MemoryRouter>
      );
      
      // Should redirect to creation or show 404
      expect(
        screen.getByTestId('session-creation-component') || 
        screen.getByTestId('not-found-page')
      ).toBeInTheDocument();
    });

    it('should handle malformed session IDs', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/malformed-id-!@#$%']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('invalid-session-id')).toBeInTheDocument();
    });

    it('should provide back navigation when session not found', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/nonexistent-session']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('back-to-creation')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('back-to-creation'));
      
      expect(screen.getByTestId('session-creation-component')).toBeInTheDocument();
    });
  });

  describe('Authentication and Permissions', () => {
    it('should require user identification before joining sessions', () => {
      render(
        <MemoryRouter initialEntries={['/practice/join/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      // Should show name input if user not identified
      expect(screen.getByTestId('user-identification')).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
    });

    it('should handle host permissions in lobby', () => {
      // Mock user as host
      localStorage.setItem('userId', 'host-user-id');
      localStorage.setItem('currentSession', JSON.stringify({
        sessionId: 'test-session-123',
        hostId: 'host-user-id'
      }));
      
      render(
        <MemoryRouter initialEntries={['/practice/lobby/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('host-controls')).toBeInTheDocument();
      expect(screen.getByTestId('start-session-button')).toBeInTheDocument();
    });

    it('should restrict participant actions appropriately', () => {
      // Mock user as regular participant
      localStorage.setItem('userId', 'participant-user-id');
      
      render(
        <MemoryRouter initialEntries={['/practice/lobby/test-session-123']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.queryByTestId('host-controls')).not.toBeInTheDocument();
      expect(screen.queryByTestId('start-session-button')).not.toBeInTheDocument();
    });
  });
});