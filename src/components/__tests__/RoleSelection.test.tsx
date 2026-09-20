import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoleSelection from '../lobby/RoleSelection';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

describe('RoleSelection', () => {
  const defaultProps = {
    currentParticipant: { id: 'user-1', name: 'Alex', role: '', status: 'ready' as const },
    availableRoles: ['speaker', 'listener'],
    totalParticipants: 2,
    onRoleSelect: vi.fn(),
    hasRole: false,
  };

  it('shows role names on the buttons, not only in a tooltip', () => {
    render(<RoleSelection {...defaultProps} />);

    expect(screen.getByTestId('role-select-label-speaker')).toHaveTextContent('dialectic.roles.speaker.title');
    expect(screen.getByTestId('role-select-label-listener')).toHaveTextContent('dialectic.roles.listener.title');
  });

  it('calls onRoleSelect when a labelled role card is pressed', () => {
    const onRoleSelect = vi.fn();
    render(<RoleSelection {...defaultProps} onRoleSelect={onRoleSelect} />);

    fireEvent.click(screen.getByTestId('role-select-speaker'));
    expect(onRoleSelect).toHaveBeenCalledWith('speaker');
  });
});
