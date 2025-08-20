import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SafetyTimeoutGuidanceProps {
  onEndTimeout: () => void;
  requestedByMe: boolean;
  className?: string;
}

export const SafetyTimeoutGuidance: React.FC<SafetyTimeoutGuidanceProps> = ({
  onEndTimeout,
  requestedByMe,
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {t('shared.common.timeoutActive')}
            </h3>
          </div>

                      <div className="space-y-4">
              {/* Immediate Actions */}
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {t('safety.timeout.takeCare.title')}
                </h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li>• <strong>{t('safety.timeout.takeCare.breathe.title')}:</strong> {t('safety.timeout.takeCare.breathe.description')}</li>
                  <li>• <strong>{t('safety.timeout.takeCare.move.title')}:</strong> {t('safety.timeout.takeCare.move.description')}</li>
                  <li>• <strong>{t('safety.timeout.takeCare.water.title')}:</strong> {t('safety.timeout.takeCare.water.description')}</li>
                  <li>• <strong>{t('safety.timeout.takeCare.stepAway.title')}:</strong> {t('safety.timeout.takeCare.stepAway.description')}</li>
                </ul>
              </div>

              {/* Personal Support */}
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {t('safety.timeout.personalSupport.title')}
                </h4>
                <div className="bg-white dark:bg-blue-800/30 rounded p-3 mb-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    {t('safety.timeout.personalSupport.question')}
                  </p>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>• {t('safety.timeout.personalSupport.friend')}</li>
                    <li>• {t('safety.timeout.personalSupport.family')}</li>
                    <li>• {t('safety.timeout.personalSupport.therapist')}</li>
                    <li>• {t('safety.timeout.personalSupport.support')}</li>
                  </ul>
                </div>
              </div>

              {/* Session Guidelines */}
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {t('safety.timeout.remember.title')}
                </h4>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>• {t('safety.timeout.remember.pass')}</li>
                  <li>• {t('safety.timeout.remember.boundaries')}</li>
                  <li>• {t('safety.timeout.remember.support')}</li>
                  <li>• {t('safety.timeout.remember.pressure')}</li>
                </ul>
              </div>
            </div>

                      {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {requestedByMe && (
                <button
                  onClick={onEndTimeout}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  {t('shared.actions.endTimeout')}
                </button>
              )}
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {requestedByMe 
                  ? t('safety.timeout.endEarlyMessage')
                  : t('safety.timeout.autoEndMessage')
                }
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
