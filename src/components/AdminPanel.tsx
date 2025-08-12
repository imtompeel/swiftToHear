import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import PlatformFeaturesGrid from './PlatformFeaturesGrid';
import { useTranslation } from '../hooks/useTranslation';
import { PeriodicCleanupService } from '../services/periodicCleanupService';

const AdminPanel: React.FC = () => {
  const { t, isLoading } = useTranslation();
  
  // Debug: Check if translations are working
  console.log('AdminPanel - isLoading:', isLoading);
  console.log('AdminPanel - test translation:', t('admin.dashboard.title'));
  
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cleanupStats, setCleanupStats] = useState<any>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Load cleanup statistics when user is authenticated
  useEffect(() => {
    if (user) {
      loadCleanupStats();
    }
  }, [user]);

  const loadCleanupStats = async () => {
    try {
      const stats = await PeriodicCleanupService.getCleanupStats();
      setCleanupStats(stats);
    } catch (error) {
      console.error('Error loading cleanup stats:', error);
    }
  };

  const handleRunCleanup = async () => {
    setCleanupLoading(true);
    try {
      const results = await PeriodicCleanupService.runFullCleanup();
      setCleanupResults(results);
      // Reload stats after cleanup
      await loadCleanupStats();
    } catch (error) {
      console.error('Error running cleanup:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(t('admin.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };




  // Show loading state while i18n is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <p className="text-secondary-600 dark:text-secondary-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              {t('admin.login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
              {t('admin.login.subtitle')}
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
                {t('admin.login.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                placeholder={t('admin.login.emailPlaceholder')}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {t('admin.login.passwordLabel')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                placeholder={t('admin.login.passwordPlaceholder')}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 dark:bg-accent-700 hover:bg-accent-700 dark:hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 focus:ring-accent-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? t('admin.login.signingIn') : t('admin.login.signInButton')}
              </button>
            </div>
          </form>
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
              {t('admin.dashboard.title')}
            </h1>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
        </div>



        {/* Platform Features */}
        <PlatformFeaturesGrid />

        {/* Cleanup Management Section */}
        <div className="mt-8 px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-secondary-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Database Cleanup Management
            </h2>
            
            {/* Cleanup Statistics */}
            {cleanupStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Signaling Messages</h3>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{cleanupStats.totalSignalingMessages}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Completed Sessions</h3>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{cleanupStats.totalCompletedSessions}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Completed Group Sessions</h3>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{cleanupStats.totalCompletedGroupSessions}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Test Documents</h3>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{cleanupStats.totalTestDocuments}</p>
                </div>
              </div>
            )}

            {/* Cleanup Results */}
            {cleanupResults && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Last Cleanup Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div>Signaling: {cleanupResults.signalingMessages}</div>
                  <div>Sessions: {cleanupResults.oldSessions}</div>
                  <div>Group Sessions: {cleanupResults.oldGroupSessions}</div>
                  <div>Test Data: {cleanupResults.testData}</div>
                </div>
              </div>
            )}

            {/* Cleanup Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRunCleanup}
                disabled={cleanupLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md font-medium transition-colors duration-200"
              >
                {cleanupLoading ? 'Running Cleanup...' : 'Run Manual Cleanup'}
              </button>
              <button
                onClick={loadCleanupStats}
                className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md font-medium transition-colors duration-200"
              >
                Refresh Statistics
              </button>
            </div>

            {/* Cleanup Information */}
            <div className="mt-4 text-sm text-secondary-600 dark:text-secondary-400">
              <p className="mb-2">
                <strong>Automatic Cleanup:</strong> Sessions are automatically cleaned up when they end or when all participants leave.
              </p>
              <p className="mb-2">
                <strong>Manual Cleanup:</strong> Removes expired signaling messages (24h+), old completed sessions (7 days+), and test data (24h+).
              </p>
              <p>
                <strong>Note:</strong> Cleanup operations are safe and only remove data that is no longer needed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel; 