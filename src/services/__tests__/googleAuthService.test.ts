import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import {
  getAuthErrorCode,
  getGoogleAuthErrorMessage,
  isGoogleSignInCancelled,
  signInWithGoogleAccount,
} from '../googleAuthService';

const mockedSignInWithPopup = vi.mocked(signInWithPopup);
const mockedLinkWithPopup = vi.mocked(linkWithPopup);
const mockedSignInWithCredential = vi.mocked(signInWithCredential);
const mockedSignInWithRedirect = vi.mocked(signInWithRedirect);
const mockedCredentialFromError = vi.mocked(GoogleAuthProvider.credentialFromError);

const googleUser = { uid: 'google-user', isAnonymous: false } as User;

const createAuth = (currentUser: User | null): Auth =>
  ({ currentUser } as Auth);

beforeEach(() => {
  vi.clearAllMocks();
  mockedSignInWithPopup.mockResolvedValue({ user: googleUser } as Awaited<ReturnType<typeof signInWithPopup>>);
  mockedLinkWithPopup.mockResolvedValue({ user: googleUser } as Awaited<ReturnType<typeof linkWithPopup>>);
  mockedSignInWithCredential.mockResolvedValue({ user: googleUser } as Awaited<ReturnType<typeof signInWithCredential>>);
  mockedSignInWithRedirect.mockResolvedValue(undefined as never);
  mockedCredentialFromError.mockReturnValue(null);
});

describe('googleAuthService helpers', () => {
  it('reads Firebase error codes from unknown errors', () => {
    expect(getAuthErrorCode({ code: 'auth/popup-blocked' })).toBe('auth/popup-blocked');
    expect(getAuthErrorCode(new Error('nope'))).toBeUndefined();
  });

  it('treats popup dismissals as cancelled sign-ins', () => {
    expect(isGoogleSignInCancelled('auth/popup-closed-by-user')).toBe(true);
    expect(isGoogleSignInCancelled('auth/cancelled-popup-request')).toBe(true);
    expect(isGoogleSignInCancelled('auth/popup-blocked')).toBe(false);
  });

  it('maps Google auth errors to user-facing messages', () => {
    expect(getGoogleAuthErrorMessage('auth/unauthorized-domain')).toMatch(/not authorised/i);
    expect(getGoogleAuthErrorMessage('auth/unknown', 'Fallback')).toBe('Fallback');
  });
});

describe('signInWithGoogleAccount', () => {
  it('signs in with a Google popup when there is no current user', async () => {
    const user = await signInWithGoogleAccount(createAuth(null));

    expect(user).toEqual(googleUser);
    expect(mockedSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockedLinkWithPopup).not.toHaveBeenCalled();
  });

  it('links Google to an anonymous session so the uid is preserved', async () => {
    const anonymousUser = { uid: 'anon', isAnonymous: true } as User;

    const user = await signInWithGoogleAccount(createAuth(anonymousUser));

    expect(user).toEqual(googleUser);
    expect(mockedLinkWithPopup).toHaveBeenCalledWith(anonymousUser, expect.any(Object));
    expect(mockedSignInWithPopup).not.toHaveBeenCalled();
  });

  it('signs in with the existing Google credential when linking is not possible', async () => {
    const anonymousUser = { uid: 'anon', isAnonymous: true } as User;
    const existingCredential = { providerId: 'google.com' };
    mockedLinkWithPopup.mockRejectedValue({ code: 'auth/credential-already-in-use' });
    mockedCredentialFromError.mockReturnValue(existingCredential as never);

    const user = await signInWithGoogleAccount(createAuth(anonymousUser));

    expect(mockedSignInWithCredential).toHaveBeenCalledWith(expect.anything(), existingCredential);
    expect(user).toEqual(googleUser);
  });

  it('returns null when the user closes the popup', async () => {
    mockedSignInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' });

    await expect(signInWithGoogleAccount(createAuth(null))).resolves.toBeNull();
  });

  it('falls back to redirect when the popup is blocked', async () => {
    mockedSignInWithPopup.mockRejectedValue({ code: 'auth/popup-blocked' });

    await expect(signInWithGoogleAccount(createAuth(null))).resolves.toBeNull();
    expect(mockedSignInWithRedirect).toHaveBeenCalledTimes(1);
  });
});
