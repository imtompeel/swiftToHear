import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';

interface SignInProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const { t } = useTranslation();
  const { signIn, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 surface-panel p-8">
        <div>
          <h2 className="font-display text-center text-3xl font-semibold text-secondary-900 dark:text-secondary-50">
            {t('auth.signIn.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
            {t('auth.signIn.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <GoogleSignInButton onSuccess={onSuccess} disabled={isLoading} />

        <AuthDivider />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {t('shared.common.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder={t('shared.placeholders.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {t('shared.common.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                placeholder={t('shared.placeholders.enterPassword')}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
            {isLoading ? t('shared.actions.signingIn') : t('shared.actions.signIn')}
          </button>

          <div className="text-center">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300 dark:hover:text-accent-200"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export { SignIn };
