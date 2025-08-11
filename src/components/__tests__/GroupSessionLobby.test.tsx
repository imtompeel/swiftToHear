import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GroupSessionLobby } from '../GroupSessionLobby';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';

// Mock the hooks
vi.mock('../../hooks/useTranslation');
vi.mock('../../contexts/ThemeContext');
vi.mock('../../services/groupAssignmentService');

const mockUseTranslation = useTranslation as any;
const mockUseTheme = useTheme as any;

describe('GroupSessionLobby', () => {
  const mockSession = {
    sessionId: 'test-session-123',
    sessionName: 'Test Group Session',
    hostId: '1', // Add hostId property
    participants: [
      { id: '1', name: 'Alice', role: 'speaker', status: 'ready' as const },
      { id: '2', name: 'Bob', role: 'listener', status: 'ready' as const },
      { id: '3', name: 'Charlie', role: 'scribe', status: 'ready' as const },
      { id: '4', name: 'Diana', role: 'observer', status: 'ready' as const },
      { id: '5', name: 'Eve', role: 'speaker', status: 'ready' as const }, // Add 5th participant
    ],
    groupMode: 'multi' as const,
    groupConfiguration: {
      groupSize: 4 as const,
      autoAssignRoles: true,
      groupRotation: 'balanced' as const,
      observerStrategy: 'distribute' as const
    }
  };

  const mockProps = {
    session: mockSession,
    currentUserId: '1',
    isHost: true,
    onStartSession: vi.fn(),
    onLeaveSession: vi.fn(),
    onUpdateReadyState: vi.fn(),
    onUpdateParticipantRole: vi.fn(),
  };

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      locale: 'en'
    });
    
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn()
    });
  });

  it('renders the group session lobby title', () => {
    render(<GroupSessionLobby {...mockProps} />);
    
    expect(screen.getByText('dialectic.lobby.groupSession.title')).toBeInTheDocument();
  });

  it('displays session information', () => {
    render(<GroupSessionLobby {...mockProps} />);
    
    expect(screen.getByText('Test Group Session')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // participant count (excluding host)
  });

  it('shows group preview for multi-group mode', () => {
    render(<GroupSessionLobby {...mockProps} />);
    
    expect(screen.getByText('dialectic.lobby.groupPreview.title')).toBeInTheDocument();
  });

  it('shows participant list', () => {
    render(<GroupSessionLobby {...mockProps} />);
    
    expect(screen.getByText('dialectic.lobby.participantList.title')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
  });

  it('shows start session button for host when participants are ready', () => {
    render(<GroupSessionLobby {...mockProps} />);
    
    expect(screen.getByText('dialectic.lobby.actions.startSession')).toBeInTheDocument();
  });

  it('shows shuffle groups button for host in multi-group mode', () => {
    render(<GroupSessionLobby {...mockProps} />);
    
    expect(screen.getByText('dialectic.lobby.actions.shuffleGroups')).toBeInTheDocument();
  });
});
