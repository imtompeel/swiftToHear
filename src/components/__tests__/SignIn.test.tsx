import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignIn } from '../SignIn';

const signIn = vi.fn();
const signInWithGoogle = vi.fn();
const clearError = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn,
    signInWithGoogle,
    signOut: vi.fn(),
    signUp: vi.fn(),
    ensureSignedIn: vi.fn(),
    error: null,
    clearError,
  }),
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

describe('SignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('offers Google sign-in alongside email and password', () => {
    render(<SignIn />);

    expect(screen.getByTestId('google-sign-in-button')).toBeInTheDocument();
    expect(screen.getByLabelText('shared.common.email')).toBeInTheDocument();
    expect(screen.getByLabelText('shared.common.password')).toBeInTheDocument();
  });

  it('completes Google sign-in and reports success', async () => {
    const onSuccess = vi.fn();
    signInWithGoogle.mockResolvedValue({ uid: 'google-user', isAnonymous: false });

    render(<SignIn onSuccess={onSuccess} />);
    fireEvent.click(screen.getByTestId('google-sign-in-button'));

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('does not continue when the Google popup is dismissed', async () => {
    const onSuccess = vi.fn();
    signInWithGoogle.mockResolvedValue(null);

    render(<SignIn onSuccess={onSuccess} />);
    fireEvent.click(screen.getByTestId('google-sign-in-button'));

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
