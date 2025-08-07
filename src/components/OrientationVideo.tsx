import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface OrientationVideoProps {
  role: 'speaker' | 'listener' | 'scribe' | 'observer';
  onComplete?: () => void;
}

export const OrientationVideo: React.FC<OrientationVideoProps> = ({
  role,
  onComplete,
}) => {
  const { t } = useTranslation();

  const handleVideoComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const getTips = (role: string) => {
    const tipKeys = {
      speaker: ['noPerform', 'pausesWelcome', 'listenerWitness', 'trustEmergence'],
      listener: ['noAgenda', 'noticeMind', 'presenceGift', 'reflectBack'],
      scribe: ['captureEssence', 'noticePatterns', 'helpReflection', 'trustIntuition'],
      observer: ['watchQuality', 'observeSupport', 'rhythmFlow', 'learnWatching']
    };
    
    return tipKeys[role as keyof typeof tipKeys]?.map(key => 
      t(`dialectic.preparation.orientation.${role}.tips.${key}`)
    ) || [];
  };

  return (
    <div data-testid={`orientation-video-${role}`} className="bg-white dark:bg-secondary-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t(`dialectic.preparation.orientation.${role}.title`)}
        </h2>
        <p className="text-lg text-secondary-600 dark:text-secondary-400">
          {t(`dialectic.preparation.orientation.${role}.description`)}
        </p>
      </div>

      {/* Video Placeholder */}
      <div className="bg-secondary-900 rounded-lg h-48 flex items-center justify-center mb-6">
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🎥</div>
          <div className="text-sm">{t('dialectic.preparation.orientation.videoTitle')}</div>
          <div className="text-xs opacity-75">{t('dialectic.preparation.orientation.videoSubtitle')}</div>
        </div>
      </div>

      {/* Role-Specific Tips */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
          {t('dialectic.preparation.orientation.keyPoints')}
        </h3>
        <ul className="space-y-2">
          {getTips(role).map((tip, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-accent-600 font-bold">•</span>
              <span className="text-secondary-700 dark:text-secondary-300">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={handleVideoComplete}
          className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium"
        >
          {t('dialectic.preparation.orientation.understand')}
        </button>
      </div>
    </div>
  );
};