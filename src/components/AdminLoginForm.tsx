import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useTranslation } from '../hooks/useTranslation';

interface AdminLoginFormProps {
  variant?: 'page' | 'footer';
  onSuccess?: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ variant = 'page', onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFooter = variant === 'footer';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin');
      }
    } catch {
      setError(t('shared.common.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const labelClass = isFooter
    ? 'block text-sm font-medium text-secondary-300'
    : 'block text-sm font-medium text-secondary-700 dark:text-secondary-300';

  const inputClass = isFooter
    ? 'mt-1 block w-full px-3 py-2 border border-secondary-600 rounded-md shadow-sm bg-secondary-800 text-white placeholder-secondary-500 focus:outline-none focus:ring-accent-500 focus:border-accent-500'
    : 'mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500';

  const errorClass = isFooter
    ? 'bg-red-900/50 border border-red-700 rounded-md p-4'
    : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4';

  const errorTextClass = isFooter ? 'text-red-200 text-sm' : 'text-red-800 dark:text-red-200 text-sm';

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      {error && (
        <div className={errorClass}>
          <p className={errorTextClass}>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor={`admin-email-${variant}`} className={labelClass}>
          {t('admin.login.emailLabel')}
        </label>
        <input
          id={`admin-email-${variant}`}
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder={t('shared.placeholders.adminEmail')}
        />
      </div>

      <div>
        <label htmlFor={`admin-password-${variant}`} className={labelClass}>
          {t('admin.login.passwordLabel')}
        </label>
        <input
          id={`admin-password-${variant}`}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder={t('shared.placeholders.passwordDots')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-900 focus:ring-accent-500 disabled:opacity-50 transition-colors duration-200"
      >
        {loading ? t('admin.login.signingIn') : t('admin.login.signInButton')}
      </button>
    </form>
  );
};

export default AdminLoginForm;
