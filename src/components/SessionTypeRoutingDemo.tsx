import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';

export const SessionTypeRoutingDemo: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [sessionType, setSessionType] = useState<'video' | 'in-person' | 'hybrid'>('video');

  const getRoutingInfo = () => {
    switch (sessionType) {
      case 'video':
        return {
          title: 'Video Call Session',
          description: 'Traditional online sessions with video and audio',
          hostRoute: '/practice/lobby/{sessionId}',
          participantRoute: '/practice/join/{sessionId}',
          features: [
            'Real-time video and audio communication',
            'Screen sharing capabilities',
            'Online participant management',
            'Digital session controls'
          ]
        };
      case 'in-person':
        return {
          title: 'In-Person Session',
          description: 'Kahoot-style sessions with QR code joining',
          hostRoute: '/in-person/host/{sessionId}',
          participantRoute: '/in-person/join/{sessionId}',
          features: [
            'QR code generation for easy joining',
            'Mobile-optimized participant interfaces',
            'Face-to-face interaction without video',
            'Host controls session flow from main screen'
          ]
        };
      case 'hybrid':
        return {
          title: 'Hybrid Session',
          description: 'Mixed in-person and remote participants',
          hostRoute: '/practice/lobby/{sessionId}',
          participantRoute: '/practice/join/{sessionId}',
          features: [
            'Combines video call and in-person features',
            'Flexible participant joining methods',
            'Unified session management',
            'Adaptive interface based on participant type'
          ]
        };
    }
  };

  const routingInfo = getRoutingInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          Session Type Routing Demo
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          See how different session types lead to different routes
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

        {/* Routing Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
            {routingInfo.title}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            {routingInfo.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host Route */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Host Interface
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Route: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">
                  {routingInfo.hostRoute}
                </code>
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                The host will be directed to this interface after creating the session.
              </p>
            </div>

            {/* Participant Route */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Participant Interface
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Route: <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">
                  {routingInfo.participantRoute}
                </code>
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Participants will access this interface to join the session.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-3">
              Key Features
            </h3>
            <ul className="space-y-2">
              {routingInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Routing Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
            Routing Flow
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  Host creates session
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Selects session type and configuration
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  Automatic routing
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  System routes to appropriate interface based on session type
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  Session begins
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Host and participants use type-specific interfaces
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
