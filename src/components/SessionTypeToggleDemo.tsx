import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';

export const SessionTypeToggleDemo: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [sessionType, setSessionType] = useState<'video' | 'in-person' | 'hybrid'>('video');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          Session Type Toggle Demo
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Showcasing the new prominent session type selection in session creation
        </p>
      </div>

      <div className="space-y-8">
        {/* Session Type Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.sessionType.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.sessionType.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Video Call Option */}
            <button
              onClick={() => setSessionType('video')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                sessionType === 'video'
                  ? 'border-accent-500 bg-accent-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  sessionType === 'video'
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <div className={`font-semibold ${
                  sessionType === 'video'
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {t('dialectic.creation.sessionType.video.title')}
                </div>
              </div>
              <div className={`text-sm ${
                sessionType === 'video'
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t('dialectic.creation.sessionType.video.description')}
              </div>
            </button>

            {/* In-Person Option */}
            <button
              onClick={() => setSessionType('in-person')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                sessionType === 'in-person'
                  ? 'border-accent-500 bg-accent-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  sessionType === 'in-person'
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`font-semibold ${
                  sessionType === 'in-person'
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {t('dialectic.creation.sessionType.inPerson.title')}
                </div>
              </div>
              <div className={`text-sm ${
                sessionType === 'in-person'
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t('dialectic.creation.sessionType.inPerson.description')}
              </div>
            </button>

            {/* Hybrid Option */}
            <button
              onClick={() => setSessionType('hybrid')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                sessionType === 'hybrid'
                  ? 'border-accent-500 bg-accent-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  sessionType === 'hybrid'
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className={`font-semibold ${
                  sessionType === 'hybrid'
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {t('dialectic.creation.sessionType.hybrid.title')}
                </div>
              </div>
              <div className={`text-sm ${
                sessionType === 'hybrid'
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t('dialectic.creation.sessionType.hybrid.description')}
              </div>
            </button>
          </div>
        </div>

        {/* Session Preview */}
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-primary-900 dark:text-primary-100">
            Session Preview
          </h3>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
            <p><strong>Selected Session Type:</strong> {t(`dialectic.creation.sessionType.${sessionType === 'video' ? 'video' : sessionType === 'in-person' ? 'inPerson' : 'hybrid'}.title`)}</p>
            <p><strong>Description:</strong> {t(`dialectic.creation.sessionType.${sessionType === 'video' ? 'video' : sessionType === 'in-person' ? 'inPerson' : 'hybrid'}.description`)}</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
              Key Features
            </h3>
            <ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
              <li>• <strong>Prominent placement</strong> - Session type is the first option after the title</li>
              <li>• <strong>Visual icons</strong> - Each option has a distinctive icon</li>
              <li>• <strong>Clear descriptions</strong> - Explains how each type works</li>
              <li>• <strong>Responsive design</strong> - Works on mobile and desktop</li>
              <li>• <strong>Internationalized</strong> - Supports multiple languages</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
              Session Types
            </h3>
            <div className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
              <div>
                <strong>Video Call:</strong> Traditional online sessions with real-time video and audio
              </div>
              <div>
                <strong>In-Person:</strong> Kahoot-style sessions where participants scan QR codes with mobile devices
              </div>
              <div>
                <strong>Hybrid:</strong> Mixed sessions supporting both in-person and remote participants
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
