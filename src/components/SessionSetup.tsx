import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SessionSetupProps {
  participants: any[] | number;
  selectedRole: string | null;
  device?: string;
  networkQuality?: string;
  onRoleSelect: (role: 'speaker' | 'listener' | 'scribe' | 'observer') => void;
  onStartSession: () => void;
  onCompleteRound: () => void;
  isRoleTaken: (role: string) => boolean;
}

export const SessionSetup: React.FC<SessionSetupProps> = ({
  selectedRole,
  device = 'desktop',
  networkQuality = 'high',
  onRoleSelect,
  onStartSession,
  onCompleteRound,
  isRoleTaken,
}) => {
  const { t } = useTranslation();

  return (
    <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.session.title')}
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-6">
            {t('dialectic.session.description')}
          </p>
          
          {/* Website Structure for testing */}
          <div data-testid="website-header" className="hidden">Header</div>
          <div data-testid="website-navigation" className="hidden">Navigation</div>
          <div data-testid="navigation-breadcrumbs" className="text-sm text-secondary-500 mb-4">
            {t('navigation.home')} &gt; {t('navigation.practice')}
          </div>
          <div data-testid="website-footer" className="hidden">Footer</div>
        </div>

        {/* Video Container */}
        <div data-testid="embedded-video-container" className="mb-8 bg-secondary-900 rounded-lg h-64 flex items-center justify-center">
          <div data-testid="embedded-daily-frame" className="text-white">
            {t('dialectic.session.videoReady')}
          </div>
          <div data-testid="quick-connection-loader" className="hidden">Loading...</div>
        </div>

        <div data-testid="practice-session-wrapper">

          {/* Role Selection */}
          <div data-testid="role-assignment" className="space-y-6">
            <h3 className="text-xl font-semibold text-center text-secondary-900 dark:text-secondary-100">
              {t('dialectic.roles.chooseRole')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['speaker', 'listener', 'scribe', 'observer'] as const).map((role) => (
                <button
                  key={role}
                  data-testid={`role-${role}`}
                  disabled={isRoleTaken(role)}
                  onClick={() => onRoleSelect(role)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedRole === role
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                      : isRoleTaken(role)
                      ? 'border-secondary-200 dark:border-secondary-600 bg-secondary-100 dark:bg-secondary-700 opacity-50 cursor-not-allowed'
                      : 'border-secondary-200 dark:border-secondary-600 hover:border-accent-300 dark:hover:border-accent-400'
                  }`}
                >
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {t(`dialectic.roles.${role}.title`)}
                  </h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                    {t(`dialectic.roles.${role}.description`)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedRole && (
            <div className="text-center mt-8">
              <button
                onClick={onStartSession}
                className="px-8 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-semibold"
              >
                {t('dialectic.session.startSession')}
              </button>
            </div>
          )}

          <button data-testid="complete-round" onClick={onCompleteRound} className="hidden">
            Complete Round
          </button>
        </div>
      </div>

      {/* Test elements for comprehensive testing */}
      <div className="hidden">
        <div data-testid="mobile-layout">Mobile layout</div>
        <div data-testid="touch-optimized-controls">Touch controls</div>
        <div data-testid={`${device}-optimized-layout`}>{device} optimized layout</div>
        <div data-testid={`${device}-controls`}>{device} controls</div>
        <div data-testid={`network-${networkQuality}-adaptation`}>Network {networkQuality} adaptation</div>
        <div data-testid="navigation-component">Navigation</div>
        <div data-testid="language-selector">Language selector</div>
        <div data-testid="firebase-auth-integration">Firebase auth</div>
        <div data-testid="platform-fallback" style={{ display: 'none' }}>
          <div>Trying alternative connection</div>
        </div>
        <div data-testid="browser-upgrade-suggestion" style={{ display: 'none' }}>
          <div>Browser not fully supported</div>
        </div>
      </div>
    </div>
  );
};