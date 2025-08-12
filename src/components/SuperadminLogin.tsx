import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { SuperadminService } from '../services/superadminService';

const SuperadminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Then check if they are a superadmin
      try {
        const isSuperadmin = await SuperadminService.isSuperadmin(user);
        
        if (!isSuperadmin) {
          // Sign out the user if they're not a superadmin
          await auth.signOut();
          setError('Access denied. You do not have superadmin privileges. Please contact an administrator to be added to the superadmin list.');
          return;
        }
      } catch (superadminError: any) {
        console.error('Superadmin verification error:', superadminError);
        
        // Sign out the user if there's an error checking superadmin status
        await auth.signOut();
        
        if (superadminError.message?.includes('permission-denied')) {
          setError('Permission denied. Firestore rules may not be properly configured. Please check your Firebase setup.');
        } else if (superadminError.message?.includes('not-found')) {
          setError('Superadmin collection not found. Please ensure the superadmin collection exists in Firestore.');
        } else {
          setError(`Superadmin verification failed: ${superadminError.message || 'Unknown error'}. Please check your Firebase configuration.`);
        }
        return;
      }

      // If they are a superadmin, navigate to the superadmin panel
      navigate('/superadmin');
    } catch (err: any) {
      console.error('Superadmin login error:', err);
      
      // Handle specific Firebase Auth error codes
      switch (err.code) {
        case 'auth/user-not-found':
          setError('User not found. Please check your email address or create the user in Firebase Authentication first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please check your password and try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format. Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact an administrator.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please wait a few minutes before trying again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid credentials. Please check your email and password.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password sign-in is not enabled. Please contact an administrator.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please use a different email or sign in with existing account.');
          break;
        case 'auth/requires-recent-login':
          setError('This operation requires recent authentication. Please sign out and sign in again.');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with the same email address but different sign-in credentials.');
          break;
        case 'auth/invalid-verification-code':
          setError('Invalid verification code. Please check your code and try again.');
          break;
        case 'auth/invalid-verification-id':
          setError('Invalid verification ID. Please try again.');
          break;
        case 'auth/quota-exceeded':
          setError('Service temporarily unavailable due to quota exceeded. Please try again later.');
          break;
        case 'auth/app-not-authorized':
          setError('This app is not authorized to use Firebase Authentication.');
          break;
        case 'auth/captcha-check-failed':
          setError('CAPTCHA verification failed. Please try again.');
          break;
        case 'auth/invalid-app-credential':
          setError('Invalid app credential. Please try again.');
          break;
        case 'auth/session-expired':
          setError('Session expired. Please sign in again.');
          break;
        case 'auth/missing-verification-code':
          setError('Missing verification code. Please enter the code sent to your email.');
          break;
        case 'auth/missing-verification-id':
          setError('Missing verification ID. Please try again.');
          break;
        case 'auth/invalid-recipient-email':
          setError('Invalid recipient email. Please check the email address.');
          break;
        case 'auth/invalid-sender':
          setError('Invalid sender. Please contact support.');
          break;
        case 'auth/invalid-continue-uri':
          setError('Invalid continue URI. Please contact support.');
          break;
        case 'auth/unauthorized-continue-uri':
          setError('Unauthorized continue URI. Please contact support.');
          break;
        case 'auth/user-token-expired':
          setError('User token expired. Please sign in again.');
          break;
        case 'auth/user-mismatch':
          setError('User mismatch. Please sign in with the correct account.');
          break;
        case 'auth/credential-already-in-use':
          setError('Credential already in use. Please try a different sign-in method.');
          break;
        case 'auth/operation-not-supported-in-this-environment':
          setError('This operation is not supported in this environment.');
          break;
        case 'auth/timeout':
          setError('Request timeout. Please check your connection and try again.');
          break;
        default:
          // Handle non-Firebase errors or unknown Firebase errors
          if (err.message) {
            setError(`Login error: ${err.message}`);
          } else if (err.toString) {
            setError(`Login error: ${err.toString()}`);
          } else {
            setError('An unexpected error occurred during login. Please try again.');
          }
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-accent-100 dark:bg-accent-800">
            <svg className="h-8 w-8 text-accent-600 dark:text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Superadmin Access
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
            Swift to Hear - Email Signups Management
          </p>
          <p className="mt-1 text-center text-xs text-secondary-500 dark:text-secondary-500">
            Restricted access area
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500"
              placeholder="superadmin@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 dark:bg-accent-700 hover:bg-accent-700 dark:hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 focus:ring-accent-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying access...
                </div>
              ) : (
                'Sign in as Superadmin'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 underline"
          >
            ← Back to Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperadminLogin;
