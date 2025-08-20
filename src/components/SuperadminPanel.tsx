import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getAllEmailSignups, EmailSignup } from '../services/emailService';
import { SuperadminService, SuperadminUser } from '../services/superadminService';
import SuperadminLogin from './SuperadminLogin';
import PlatformFeaturesGrid from './PlatformFeaturesGrid';
import { useTranslation } from '../hooks/useTranslation';

const SuperadminPanel: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [superadminUser, setSuperadminUser] = useState<SuperadminUser | null>(null);
  const [signups, setSignups] = useState<EmailSignup[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const superadmin = await SuperadminService.getSuperadminUser(user);
        setSuperadminUser(superadmin);
        if (superadmin?.isSuperadmin) {
          loadSignups();
        }
      } else {
        setSuperadminUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSignups = async () => {
    try {
      setLoading(true);
      const data = await getAllEmailSignups();
      setSignups(data);
    } catch (err) {
      setError(t('admin.dashboard.superadmin.emailSignups.loadingError'));
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(t('shared.common.logoutFailed'));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Show login form if not authenticated
  if (!user) {
    return <SuperadminLogin />;
  }

  // Show access denied if authenticated but not superadmin
  if (!superadminUser?.isSuperadmin) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-md w-full space-y-8">
                      <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {t('admin.dashboard.superadmin.accessDenied.title')}
              </h2>
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                {t('admin.dashboard.superadmin.accessDenied.description')}
              </p>
              <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-500">
                {t('shared.common.signedInAs')}: {user.email}
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Link
                to="/admin"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 dark:bg-accent-700 hover:bg-accent-700 dark:hover:bg-accent-600 transition-colors duration-200"
              >
                {t('admin.dashboard.superadmin.accessDenied.goToAdmin')}
              </Link>
                          <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-secondary-300 dark:border-secondary-600 text-sm font-medium rounded-md text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
              >
                {t('shared.actions.signOut')}
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              {t('admin.dashboard.superadmin.title')}
            </h1>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {t('admin.dashboard.superadmin.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-secondary-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400 truncate">
                  {t('admin.dashboard.superadmin.emailSignups.totalSignups')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-secondary-900 dark:text-secondary-100">
                  {signups.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <PlatformFeaturesGrid />

        {/* Email List */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-secondary-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-secondary-900 dark:text-secondary-100">
                {t('admin.dashboard.superadmin.emailSignups.title')}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-secondary-500 dark:text-secondary-400">
                {t('admin.dashboard.superadmin.emailSignups.description')}
              </p>
            </div>
            
            {loading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-secondary-600 dark:text-secondary-400">{t('admin.dashboard.superadmin.emailSignups.loading')}</p>
              </div>
            ) : signups.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-secondary-600 dark:text-secondary-400">{t('admin.dashboard.superadmin.emailSignups.noSignups')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {signups.map((signup) => (
                  <li key={signup.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-accent-100 dark:bg-accent-800 flex items-center justify-center">
                            <span className="text-accent-600 dark:text-accent-300 font-medium">
                              {signup.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                            {signup.email}
                          </div>
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">
                            {formatDate(signup.createdAt)}
                          </div>
                          <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                            {signup.involvementLevel === 'get-involved' ? t('admin.dashboard.superadmin.emailSignups.wantsToGetInvolved') : t('admin.dashboard.superadmin.emailSignups.keepUpdated')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          signup.status === 'confirmed' 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : signup.status === 'unsubscribed'
                            ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {signup.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminPanel;
