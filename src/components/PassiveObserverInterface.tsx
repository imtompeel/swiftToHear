import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'listener' | 'scribe';
}

interface PassiveObserverInterfaceProps {
  participants: Participant[];
  currentRound: number;
  sessionPhase: string;
}

export const PassiveObserverInterface: React.FC<PassiveObserverInterfaceProps> = ({
  currentRound
}) => {
  const { t } = useTranslation();

  return (
    <div 
      data-testid="passive-observer-interface"
      className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.observer.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.observer.mainGuidance')}
          </p>
        </div>

        {/* Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Observing session dynamics
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Round {currentRound}
              </span>
            </div>
          </div>
        </div>

        {/* Guidance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Observer Guidance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                O
              </span>
              {t('dialectic.assistance.observer.guidance.title')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                {t('dialectic.assistance.observer.guidance.noticeDynamics')}
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                {t('dialectic.assistance.observer.guidance.observeRoles')}
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                {t('dialectic.assistance.observer.guidance.identifyPatterns')}
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                {t('dialectic.assistance.observer.guidance.learnProcess')}
              </li>
            </ul>
          </div>

          {/* Learning Focus */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                🎓
              </span>
              {t('dialectic.assistance.observer.learningFocus.title')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.groupFacilitation')}
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.communicationPatterns')}
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.beforeParticipation')}
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.culturalAccommodation')}
              </li>
            </ul>
          </div>
        </div>

        {/* Current Focus Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            {t('dialectic.assistance.observer.currentFocus.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
              <div className="text-amber-600 dark:text-amber-400 text-lg font-semibold mb-2">
                {t('dialectic.assistance.observer.currentFocus.listeningDynamics')}
              </div>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                {t('dialectic.assistance.observer.currentFocus.listeningDynamicsDesc')}
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <div className="text-orange-600 dark:text-orange-400 text-lg font-semibold mb-2">
                {t('dialectic.assistance.observer.currentFocus.roleShaping')}
              </div>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                {t('dialectic.assistance.observer.currentFocus.roleShapingDesc')}
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
              <div className="text-yellow-600 dark:text-yellow-400 text-lg font-semibold mb-2">
                {t('dialectic.assistance.observer.currentFocus.emergingPatterns')}
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                {t('dialectic.assistance.observer.currentFocus.emergingPatternsDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};