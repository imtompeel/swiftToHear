import React from 'react';

interface SessionErrorDisplayProps {
  type: 'sessionError' | 'sessionNotFound' | 'sessionNotStarted';
  error?: string;
  sessionId?: string;
  t: (key: string) => string;
}

export const SessionErrorDisplay: React.FC<SessionErrorDisplayProps> = React.memo(({ 
  type, 
  error, 
  sessionId, 
  t 
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'sessionError':
        return {
          title: t('dialectic.session.sessionError'),
          description: error,
          buttonText: t('shared.actions.createNewSession'),
          buttonAction: () => window.location.href = '/practice/create',
          titleColor: 'text-red-900 dark:text-red-100',
          descriptionColor: 'text-red-600 dark:text-red-400'
        };
      case 'sessionNotFound':
        return {
          title: t('shared.common.sessionNotFound'),
          description: t('shared.common.sessionNotFoundDescription'),
          buttonText: t('shared.actions.createNewSession'),
          buttonAction: () => window.location.href = '/practice/create',
          titleColor: 'text-secondary-900 dark:text-secondary-100',
          descriptionColor: 'text-secondary-600 dark:text-secondary-400'
        };
      case 'sessionNotStarted':
        return {
          title: t('dialectic.session.sessionNotStarted'),
          description: t('dialectic.session.sessionNotStartedDescription'),
          buttonText: t('dialectic.session.returnToLobby'),
          buttonAction: () => window.location.href = `/practice/lobby/${sessionId}`,
          titleColor: 'text-secondary-900 dark:text-secondary-100',
          descriptionColor: 'text-secondary-600 dark:text-secondary-400'
        };
      default:
        return {
          title: 'Unknown Error',
          description: 'An unknown error occurred',
          buttonText: 'Go Home',
          buttonAction: () => window.location.href = '/',
          titleColor: 'text-secondary-900 dark:text-secondary-100',
          descriptionColor: 'text-secondary-600 dark:text-secondary-400'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div data-testid="dialectic-session" className="max-w-none mx-auto p-6 xl:px-12 2xl:px-16">
      <div className="text-center">
        <h1 className={`text-3xl font-bold mb-4 ${config.titleColor}`}>
          {config.title}
        </h1>
        <p className={`mb-4 ${config.descriptionColor}`}>
          {config.description}
        </p>
        <button 
          onClick={config.buttonAction}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {config.buttonText}
        </button>
      </div>
    </div>
  );
});

SessionErrorDisplay.displayName = 'SessionErrorDisplay';
