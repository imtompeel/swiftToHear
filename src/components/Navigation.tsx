import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

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
                {t('navigation.siteName')}
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-accent-700 dark:text-accent-400' 
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
              }`}
            >
              {t('navigation.home')}
            </Link>
            <Link 
              to="/practice"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/practice' 
                  ? 'text-accent-700 dark:text-accent-400' 
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
              }`}
            >
              {t('navigation.practice')}
            </Link>
            <span className="text-sm font-medium text-secondary-400 dark:text-secondary-500">
              {t('navigation.comingSoon')}
            </span>
            
            {/* Test Links - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/test"
                  className={`text-xs font-medium transition-colors ${
                    location.pathname === '/test' 
                      ? 'text-accent-700 dark:text-accent-400' 
                      : 'text-secondary-500 dark:text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
                  }`}
                >
                  Test
                </Link>
                <Link 
                  to="/test/groups"
                  className={`text-xs font-medium transition-colors ${
                    location.pathname === '/test/groups' 
                      ? 'text-accent-700 dark:text-accent-400' 
                      : 'text-secondary-500 dark:text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
                  }`}
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 