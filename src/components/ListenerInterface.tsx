import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ListenerInterfaceProps {
  speakerActive: boolean;
  readyToReflect: boolean;
  speakerPaused?: boolean;
  speakerFinished?: boolean;
  onStartReflection: () => void;
  onCompleteReflection: () => void;
}

export const ListenerInterface: React.FC<ListenerInterfaceProps> = ({
  speakerActive,
  readyToReflect,
  speakerPaused = false,
  speakerFinished = false,
  onStartReflection,
}) => {
  const { t } = useTranslation();
  const [reflectionActive, setReflectionActive] = React.useState(false);

  const handleStartReflection = () => {
    setReflectionActive(true);
    if (onStartReflection) {
      onStartReflection();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleStartReflection();
    }
  };

  const reflectionStarters = [
    t('dialectic.assistance.listener.reflectionStarters.whatHeard'),
    t('dialectic.assistance.listener.reflectionStarters.whatSurprised'),
    t('dialectic.assistance.listener.reflectionStarters.whatImportant')
  ];

  return (
    <div 
      data-testid="listener-interface"
      className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.listener.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.listener.mainGuidance')}
          </p>
        </div>

        {/* Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${speakerActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {speakerActive ? 'Speaker is active' : 'Waiting for speaker'}
              </span>
            </div>
            
            {readyToReflect && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Ready to reflect
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Guidance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Listener Guidance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                L
              </span>
              {t('dialectic.assistance.listener.guidance.title')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.assistance.listener.guidance.listenWithout')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.assistance.listener.guidance.noticeImpulse')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.assistance.listener.guidance.offerPresence')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t('dialectic.assistance.listener.guidance.reflectBack')}
              </li>
            </ul>
          </div>

          {/* Current State & Prompts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                💭
              </span>
              {t('dialectic.assistance.listener.currentFocus.title')}
            </h3>
            <div className="space-y-3">
              {speakerActive && (
                <div className="text-green-700 dark:text-green-400 text-sm">
                  {t('dialectic.assistance.listener.listeningGuidance')}
                </div>
              )}
              
              {speakerPaused && (
                <div className="text-blue-700 dark:text-blue-400 text-sm">
                  {t('dialectic.assistance.listener.impulseReminder')}
                </div>
              )}

              {(readyToReflect || speakerFinished) && (
                <div className="text-purple-700 dark:text-purple-400 text-sm">
                  {t('dialectic.assistance.listener.reflectionPrompt')}
                </div>
              )}

              {reflectionActive && (
                <div className="text-amber-700 dark:text-amber-400 text-sm">
                  {t('dialectic.assistance.listener.reflectionActive')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reflection Section - show when ready to reflect */}
        {(readyToReflect || speakerFinished) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Reflection Starters
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {reflectionStarters.map((starter, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {starter}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button 
                data-testid="start-reflection"
                onClick={handleStartReflection}
                onKeyDown={handleKeyDown}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors duration-200 transform hover:scale-105"
              >
                {t('dialectic.assistance.listener.startReflection')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};