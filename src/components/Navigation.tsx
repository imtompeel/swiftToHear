import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { SuperadminService } from '../services/superadminService';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSuperadmin, setIsSuperadmin] = React.useState(false);

  const isAdmin = Boolean(user && !user.isAnonymous);

  React.useEffect(() => {
    let cancelled = false;
    if (!user || user.isAnonymous) {
      setIsSuperadmin(false);
      return;
    }
    SuperadminService.isSuperadmin(user)
      .then((result) => {
        if (!cancelled) setIsSuperadmin(result);
      })
      .catch(() => {
        if (!cancelled) setIsSuperadmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active
        ? 'text-accent-700 dark:text-accent-400'
        : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
    }`;

  const mobileNavLinkClass = (active: boolean) =>
    `block px-3 py-2 text-base font-medium rounded-md transition-colors ${
      active
        ? 'text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
        : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700'
    }`;

  return (
    <nav className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-700 dark:bg-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                {t('shared.common.siteName')}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={navLinkClass(location.pathname === '/')}>
              {t('navigation.home')}
            </Link>

            {user ? (
              <Link
                to="/practice/match"
                data-testid="nav-matchmaking"
                className={navLinkClass(location.pathname.startsWith('/practice/match'))}
              >
                {t('navigation.findPracticeGroup')}
              </Link>
            ) : (
              <span className="text-sm font-medium text-secondary-400 dark:text-secondary-500">
                {t('shared.common.comingSoon')}
              </span>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                data-testid="nav-admin"
                className={navLinkClass(location.pathname === '/admin')}
              >
                {t('navigation.adminPanel')}
              </Link>
            )}

            {isSuperadmin && (
              <Link
                to="/superadmin"
                data-testid="nav-email-signups"
                className={navLinkClass(location.pathname.startsWith('/superadmin'))}
              >
                {t('navigation.emailSignups')}
              </Link>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="flex items-center space-x-2">
                <Link to="/test" className={navLinkClass(location.pathname === '/test')}>
                  Test
                </Link>
                <Link
                  to="/test/groups"
                  className={navLinkClass(location.pathname === '/test/groups')}
                >
                  Group Test
                </Link>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 transition-colors"
              >
                Sign in
              </Link>
            )}

            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 dark:border-secondary-700 py-3">
            <div className="space-y-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass(location.pathname === '/')}
              >
                {t('navigation.home')}
              </Link>

              {user ? (
                <Link
                  to="/practice/match"
                  data-testid="nav-matchmaking-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavLinkClass(location.pathname.startsWith('/practice/match'))}
                >
                  {t('navigation.findPracticeGroup')}
                </Link>
              ) : (
                <div className="px-3 py-2 text-base font-medium text-secondary-400 dark:text-secondary-500">
                  {t('shared.common.comingSoon')}
                </div>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  data-testid="nav-admin-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavLinkClass(location.pathname === '/admin')}
                >
                  {t('navigation.adminPanel')}
                </Link>
              )}

              {isSuperadmin && (
                <Link
                  to="/superadmin"
                  data-testid="nav-email-signups-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavLinkClass(location.pathname.startsWith('/superadmin'))}
                >
                  {t('navigation.emailSignups')}
                </Link>
              )}

              {process.env.NODE_ENV === 'development' && (
                <div className="px-3 py-2 space-y-2">
                  <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    Development
                  </div>
                  <Link
                    to="/test"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={mobileNavLinkClass(location.pathname === '/test')}
                  >
                    Test
                  </Link>
                  <Link
                    to="/test/groups"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={mobileNavLinkClass(location.pathname === '/test/groups')}
                  >
                    Group Test
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-secondary-200 dark:border-secondary-700">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-secondary-600 dark:text-secondary-400">
                      {user.displayName || user.email}
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700 rounded-md transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700 rounded-md transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
