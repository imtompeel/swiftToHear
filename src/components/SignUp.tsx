import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

interface SignUpProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const { t } = useTranslation();
  const { signUp, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = t('auth.signUp.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('auth.signUp.validation.emailInvalid');
    }

    if (!displayName.trim()) {
      errors.displayName = t('auth.signUp.validation.displayNameRequired');
    } else if (displayName.trim().length < 2) {
      errors.displayName = t('auth.signUp.validation.displayNameTooShort');
    }

    if (!password) {
      errors.password = t('auth.signUp.validation.passwordRequired');
    } else if (password.length < 6) {
      errors.password = t('auth.signUp.validation.passwordTooShort');
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.signUp.validation.passwordsDoNotMatch');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, displayName.trim());
      onSuccess?.();
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = (hasError?: string) =>
    `input-field mt-1 ${hasError ? 'border-red-400 dark:border-red-500' : ''}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 surface-panel p-8">
        <div>
          <h2 className="font-display text-center text-3xl font-semibold text-secondary-900 dark:text-secondary-50">
            {t('auth.signUp.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
            {t('auth.signUp.subtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {t('auth.signUp.displayName')}
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={fieldClass(validationErrors.displayName)}
                placeholder={t('auth.signUp.displayNamePlaceholder')}
              />
              {validationErrors.displayName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.displayName}</p>
              )}
            </div>

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
                className={fieldClass(validationErrors.email)}
                placeholder={t('shared.placeholders.enterEmail')}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
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
                className={fieldClass(validationErrors.password)}
                placeholder={t('shared.placeholders.enterPassword')}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {t('auth.signUp.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={fieldClass(validationErrors.confirmPassword)}
                placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
            {isLoading ? t('auth.signUp.creating') : t('auth.signUp.submit')}
          </button>

          <div className="text-center">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300 dark:hover:text-accent-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export { SignUp };
