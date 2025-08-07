import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface PracticeExerciseProps {
  role: 'speaker' | 'listener' | 'scribe' | 'observer';
  onComplete?: () => void;
}

export const PracticeExercise: React.FC<PracticeExerciseProps> = ({
  role,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };



  return (
    <div data-testid="practice-exercise" className="bg-accent-50 dark:bg-accent-900 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-accent-900 dark:text-accent-100 mb-2">
          {t(`dialectic.preparation.practice.${role}.title`)}
        </h3>
        <p className="text-accent-800 dark:text-accent-200">
          {t(`dialectic.preparation.practice.${role}.instruction`)}
        </p>
      </div>

      {/* Exercise Content */}
      <div className="space-y-4 mb-6">
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            {t('dialectic.preparation.practice.practicePrompt')}
          </h4>
          <p className="text-secondary-700 dark:text-secondary-300 italic">
            "{t(`dialectic.preparation.practice.${role}.prompt`)}"
          </p>
        </div>

        <div className="text-sm text-accent-700 dark:text-accent-300">
          <strong>{t('dialectic.preparation.practice.guidanceLabel')}</strong> {t(`dialectic.preparation.practice.${role}.guidance`)}
        </div>

        {/* Timer for practice */}
        <div className="bg-secondary-100 dark:bg-secondary-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-mono text-secondary-900 dark:text-secondary-100 mb-2">
            0:30
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {t('dialectic.preparation.practice.timeRemaining')}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {/* Start practice timer */}}
          className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
          disabled={completed}
        >
          {t('dialectic.preparation.practice.startPractice')}
        </button>
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
        >
          {completed ? t('dialectic.preparation.practice.practiceComplete') : t('dialectic.preparation.practice.skipPractice')}
        </button>
      </div>
    </div>
  );
};