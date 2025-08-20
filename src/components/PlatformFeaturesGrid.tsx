import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const PlatformFeaturesGrid: React.FC = () => {
  const { t, isLoading } = useTranslation();
  
  // Debug: Check if translations are working
  console.log('PlatformFeaturesGrid - isLoading:', isLoading);
  console.log('PlatformFeaturesGrid - test translation:', t('admin.dashboard.platformFeatures.title'));

  const features = [
    {
      id: 'dialectic-session',
      title: t('shared.common.dialecticSession'),
      description: t('admin.dashboard.platformFeatures.dialecticSession.description'),
      link: '/practice/create',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900 dark:to-primary-900',
      border: 'border-accent-200 dark:border-accent-700',
      iconBg: 'bg-accent-600 dark:bg-accent-500',
      hoverColor: 'group-hover:text-accent-600 dark:group-hover:text-accent-400',
      linkColor: 'text-accent-600 dark:text-accent-400 group-hover:text-accent-500',
      actionText: t('admin.dashboard.platformFeatures.dialecticSession.action')
    },
    {
      id: 'platform-guide',
      title: t('shared.common.platformGuide'),
      description: t('admin.dashboard.platformFeatures.platformGuide.description'),
      link: '/admin/guide',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900',
      border: 'border-green-200 dark:border-green-700',
      iconBg: 'bg-green-600 dark:bg-green-500',
      hoverColor: 'group-hover:text-green-600 dark:group-hover:text-green-400',
      linkColor: 'text-green-600 dark:text-green-400 group-hover:text-green-500',
      actionText: t('admin.dashboard.platformFeatures.platformGuide.action')
    },
    {
      id: 'safety-guidelines',
      title: t('admin.dashboard.platformFeatures.safetyGuidelines.title'),
      description: t('admin.dashboard.platformFeatures.safetyGuidelines.description'),
      link: '/admin/safety',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      gradient: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900',
      border: 'border-red-200 dark:border-red-700',
      iconBg: 'bg-red-600 dark:bg-red-500',
      hoverColor: 'group-hover:text-red-600 dark:group-hover:text-red-400',
      linkColor: 'text-red-600 dark:text-red-400 group-hover:text-red-500',
      actionText: t('admin.dashboard.platformFeatures.safetyGuidelines.action')
    },
    {
      id: 'analytics-dashboard',
      title: t('admin.dashboard.platformFeatures.analyticsDashboard.title'),
      description: t('admin.dashboard.platformFeatures.analyticsDashboard.description'),
      link: null, // Disabled for now
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      gradient: 'bg-secondary-50 dark:bg-secondary-700',
      border: 'border-secondary-200 dark:border-secondary-600',
      iconBg: 'bg-secondary-400 dark:bg-secondary-600',
      hoverColor: 'text-secondary-500 dark:text-secondary-400',
      linkColor: 'text-secondary-400 dark:text-secondary-500',
      actionText: t('admin.dashboard.platformFeatures.analyticsDashboard.action'),
      disabled: true
    }
  ];

  // Show loading state while i18n is initializing
  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white dark:bg-secondary-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
          <div className="px-4 py-5 sm:px-6">
            <p className="text-secondary-600 dark:text-secondary-400">Loading platform features...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-secondary-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-900 dark:text-secondary-100">
            {t('admin.dashboard.platformFeatures.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-secondary-500 dark:text-secondary-400">
            {t('admin.dashboard.platformFeatures.description')}
          </p>
        </div>
        
        <div className="border-t border-secondary-200 dark:border-secondary-700">
          <div className="px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const content = (
                  <>
                    <div>
                      <span className={`rounded-lg inline-flex p-3 ${feature.iconBg} text-white ring-4 ring-white dark:ring-secondary-800`}>
                        {feature.icon}
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className={`text-lg font-medium text-secondary-900 dark:text-secondary-100 ${feature.hoverColor}`}>
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        {feature.description}
                      </p>
                      <span className={`mt-4 text-sm font-medium ${feature.linkColor}`}>
                        {feature.actionText}
                      </span>
                    </div>
                  </>
                );

                if (feature.disabled) {
                  return (
                    <div
                      key={feature.id}
                      className={`relative group ${feature.gradient} p-6 rounded-lg border ${feature.border} hover:shadow-md transition-all duration-200 opacity-50`}
                    >
                      {content}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={feature.id}
                    to={feature.link!}
                    className={`relative group ${feature.gradient} p-6 rounded-lg border ${feature.border} hover:shadow-md transition-all duration-200 hover:scale-105`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformFeaturesGrid;
