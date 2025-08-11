import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface SafetyTimeoutOtherParticipantsProps {
  requestedBy: string;
  className?: string;
}

export const SafetyTimeoutOtherParticipants: React.FC<SafetyTimeoutOtherParticipantsProps> = ({
  requestedBy,
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            {t('safety.timeout.otherParticipants.title')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-blue-800 dark:text-blue-200 mb-2">
                {t('safety.timeout.otherParticipants.message', { name: requestedBy })}
              </p>
            </div>

            <div className="bg-blue-100 dark:bg-blue-800/50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {t('safety.timeout.otherParticipants.whatToDo.title')}
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  {t('safety.timeout.otherParticipants.whatToDo.respect')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  {t('safety.timeout.otherParticipants.whatToDo.quiet')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  {t('safety.timeout.otherParticipants.whatToDo.support')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  {t('safety.timeout.otherParticipants.whatToDo.wait')}
                </li>
              </ul>
            </div>

            <div className="bg-blue-100 dark:bg-blue-800/50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {t('safety.timeout.otherParticipants.ifYouNeedHelp.title')}
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {t('safety.timeout.otherParticipants.ifYouNeedHelp.message')}
              </p>
              <Link
                to="/admin/safety"
                className="inline-flex items-center text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('safety.timeout.otherParticipants.viewProtocol')}
              </Link>
            </div>

            <div className="text-center pt-2">
              <div className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm">
                <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('safety.timeout.otherParticipants.waitingMessage')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
