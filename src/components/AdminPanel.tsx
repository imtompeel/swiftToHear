import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import PlatformFeaturesGrid from './PlatformFeaturesGrid';
import AdminLoginForm from './AdminLoginForm';
import { useTranslation } from '../hooks/useTranslation';
import { PeriodicCleanupService } from '../services/periodicCleanupService';

const AdminPanel: React.FC = () => {
  const { t, isLoading } = useTranslation();
  
  // Debug: Check if translations are working
  console.log('AdminPanel - isLoading:', isLoading);
  console.log('AdminPanel - test translation:', t('shared.common.adminDashboard'));
  
  const [user, setUser] = useState<User | null>(null);
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



  // Show loading state while i18n is initializing
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 surface-panel p-8">
          <div>
            <h2 className="font-display text-center text-3xl font-semibold text-secondary-900 dark:text-secondary-50">
              {t('shared.common.adminLogin')}
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
              {t('admin.login.subtitle')}
            </p>
          </div>
          
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div>
            <h1 className="font-display text-3xl font-semibold text-secondary-900 dark:text-secondary-50">
              {t('shared.common.adminDashboard')}
            </h1>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {t('shared.common.platformGuide')}
            </p>
          </div>
        </div>

        {/* Platform Features */}
        <PlatformFeaturesGrid />

        {/* Cleanup Management Section */}
        <div className="mt-8 px-4 py-6 sm:px-0">
          <div className="card">
            <h2 className="font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-4">
              Database Cleanup Management
            </h2>
            
            {/* Cleanup Statistics */}
            {cleanupStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary-50 dark:bg-primary-900/40 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
                  <h3 className="text-sm font-medium text-primary-800 dark:text-primary-200">Signaling Messages</h3>
                  <p className="text-2xl font-display font-semibold text-primary-900 dark:text-primary-100">{cleanupStats.totalSignalingMessages}</p>
                </div>
                <div className="bg-accent-50 dark:bg-accent-950/50 p-4 rounded-xl border border-accent-100 dark:border-accent-900">
                  <h3 className="text-sm font-medium text-accent-800 dark:text-accent-200">Completed Sessions</h3>
                  <p className="text-2xl font-display font-semibold text-accent-900 dark:text-accent-100">{cleanupStats.totalCompletedSessions}</p>
                </div>
                <div className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-xl border border-secondary-200 dark:border-secondary-700">
                  <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Completed Group Sessions</h3>
                  <p className="text-2xl font-display font-semibold text-secondary-900 dark:text-secondary-100">{cleanupStats.totalCompletedGroupSessions}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-100 dark:border-amber-900">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Test Documents</h3>
                  <p className="text-2xl font-display font-semibold text-amber-900 dark:text-amber-100">{cleanupStats.totalTestDocuments}</p>
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