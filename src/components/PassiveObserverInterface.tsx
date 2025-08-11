import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../types/sessionContext';

interface PassiveObserverInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  videoCall: any;
}

export const PassiveObserverInterface: React.FC<PassiveObserverInterfaceProps> = ({
  session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  videoCall: _videoCall
}) => {
  const currentRound = session.currentRound || 1;
  const { t } = useTranslation();

  return (
    <div 
      data-testid="passive-observer-interface"
      className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.observer.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.observer.mainGuidance')}
          </p>
        </div>

        {/* Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Observing session dynamics
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-400">
                Round {currentRound}
              </span>
            </div>
          </div>
        </div>

        {/* Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Observer Guidance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">
                O
              </span>
              {t('dialectic.assistance.observer.guidance.title')}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">
                🎓
              </span>
              {t('dialectic.assistance.observer.learningFocus.title')}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.groupFacilitation')}
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.communication')}
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.conflictResolution')}
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {t('dialectic.assistance.observer.learningFocus.consensusBuilding')}
              </li>
            </ul>
          </div>
        </div>

        {/* Observer Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('dialectic.assistance.observer.notes.title')}
          </h3>
          <div className="space-y-3">
            <textarea
              placeholder={t('dialectic.assistance.observer.notes.placeholder')}
              className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base"
            />
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('dialectic.assistance.observer.notes.instruction')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};