import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { OrientationVideo } from './OrientationVideo';
import { PracticeExercise } from './PracticeExercise';
import { TechCheck } from './TechCheck';

interface PreparationPhaseProps {
  userRole?: 'speaker' | 'listener' | 'scribe' | 'observer';
  onComplete?: () => void;
}

type PreparationStep = 'orientation' | 'practice' | 'tech-check' | 'ready';

export const PreparationPhase: React.FC<PreparationPhaseProps> = ({
  userRole,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<PreparationStep>('orientation');
  const [completedSteps, setCompletedSteps] = useState<Set<PreparationStep>>(new Set());

  const markStepCompleted = (step: PreparationStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const handleOrientationComplete = () => {
    markStepCompleted('orientation');
    setCurrentStep('practice');
  };

  const handlePracticeComplete = () => {
    markStepCompleted('practice');
    setCurrentStep('tech-check');
  };

  const handleTechCheckComplete = () => {
    markStepCompleted('tech-check');
    setCurrentStep('ready');
  };

  const handleSessionStart = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const getStepStatus = (step: PreparationStep) => {
    if (completedSteps.has(step)) return 'completed';
    if (currentStep === step) return 'active';
    return 'pending';
  };

  return (
    <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            {t('dialectic.preparation.title')}
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            {t('dialectic.preparation.description')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { key: 'orientation', label: t('dialectic.preparation.steps.orientation') },
              { key: 'practice', label: t('dialectic.preparation.steps.practice') },
              { key: 'tech-check', label: t('dialectic.preparation.steps.techCheck') },
              { key: 'ready', label: t('dialectic.preparation.steps.ready') }
            ].map((step, index) => {
              const status = getStepStatus(step.key as PreparationStep);
              return (
                <React.Fragment key={step.key}>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    status === 'completed' ? 'bg-green-100 text-green-700' :
                    status === 'active' ? 'bg-accent-100 text-accent-700' :
                    'bg-secondary-100 text-secondary-500'
                  }`}>
                    <span className="text-lg">
                      {status === 'completed' ? '✅' : 
                       status === 'active' ? '🔄' : '⏳'}
                    </span>
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <div className="w-8 h-0.5 bg-secondary-200 dark:bg-secondary-600"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* All Preparation Components - Visible Simultaneously */}
        <div className="space-y-8">
          {userRole && (
            <OrientationVideo
              role={userRole}
              onComplete={handleOrientationComplete}
            />
          )}

          {userRole && (
            <PracticeExercise
              role={userRole}
              onComplete={handlePracticeComplete}
            />
          )}

          <TechCheck
            onComplete={handleTechCheckComplete}
          />

          {/* Ready State */}
          {completedSteps.size >= 3 && (
            <div className="text-center space-y-6 border-t pt-8">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                {t('dialectic.preparation.ready.title')}
              </h2>
              <button
                onClick={handleSessionStart}
                className="px-8 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-semibold"
              >
                {t('dialectic.preparation.ready.startSession')}
              </button>
            </div>
          )}
        </div>

        {/* Skip Options */}
        {currentStep !== 'ready' && (
          <div className="text-center mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-600">
            <button
              onClick={() => setCurrentStep('ready')}
              className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            >
              {t('dialectic.preparation.skipSteps')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};