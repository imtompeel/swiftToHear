import {
  Auth,
  GoogleAuthProvider,
  User,
  linkWithPopup,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const CANCELLED_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

const ACCOUNT_IN_USE_CODES = new Set([
  'auth/credential-already-in-use',
  'auth/email-already-in-use',
]);

export function getAuthErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

export function isGoogleSignInCancelled(code?: string): boolean {
  return Boolean(code && CANCELLED_CODES.has(code));
}

export function getGoogleAuthErrorMessage(code?: string, fallback?: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for Google sign-in.';
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked. Please allow popups and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return fallback || 'Failed to sign in with Google';
  }
}

export async function signInWithGoogleAccount(authInstance: Auth = auth): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const currentUser = authInstance.currentUser;
  if (currentUser?.isAnonymous) {
    try {
      const linked = await linkWithPopup(currentUser, provider);
      return linked.user;
    } catch (error) {
      const code = getAuthErrorCode(error);
      if (isGoogleSignInCancelled(code)) {
        return null;
      }

      if (ACCOUNT_IN_USE_CODES.has(code ?? '')) {
        const credential = GoogleAuthProvider.credentialFromError(error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]);
        if (credential) {
          const signedIn = await signInWithCredential(authInstance, credential);
          return signedIn.user;
        }
      } else if (code !== 'auth/popup-blocked') {
        throw error;
      }
    }
  }

  try {
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
  } catch (error) {
    const code = getAuthErrorCode(error);
    if (isGoogleSignInCancelled(code)) {
      return null;
    }

    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(authInstance, provider);
      return null;
    }

    throw error;
  }
}
