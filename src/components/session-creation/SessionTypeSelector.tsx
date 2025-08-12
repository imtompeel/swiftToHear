import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionTypeSelectorProps {
  sessionType: 'video' | 'in-person';
  onSessionTypeChange: (type: 'video' | 'in-person') => void;
}

const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({
  sessionType,
  onSessionTypeChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4" data-testid="session-type-selector">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Call Option */}
        <button
          onClick={() => onSessionTypeChange('video')}
          className={`p-8 rounded-xl border-2 text-center transition-all hover:scale-105 ${
            sessionType === 'video'
              ? 'border-accent-500 bg-accent-50 shadow-xl'
              : 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
          }`}
          data-testid="session-type-video"
        >
          {/* Large Icon Container */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              sessionType === 'video'
                ? 'bg-accent-500 text-white shadow-accent-500/50'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <div className={`text-xl font-bold mb-3 ${
            sessionType === 'video'
              ? 'text-gray-900'
              : 'text-primary-900 dark:text-primary-100'
          }`}>
            {t('shared.common.videoCall')}
          </div>
          
          {/* Description */}
          <div className={`text-sm leading-relaxed ${
            sessionType === 'video'
              ? 'text-gray-700'
              : 'text-secondary-600 dark:text-secondary-400'
          }`}>
            {t('dialectic.creation.sessionType.video.description')}
          </div>
        </button>

        {/* In-Person Option */}
        <button
          onClick={() => onSessionTypeChange('in-person')}
          className={`p-8 rounded-xl border-2 text-center transition-all hover:scale-105 ${
            sessionType === 'in-person'
              ? 'border-accent-500 bg-accent-50 shadow-xl'
              : 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
          }`}
          data-testid="session-type-in-person"
        >
          {/* Large Icon Container */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              sessionType === 'in-person'
                ? 'bg-accent-500 text-white shadow-accent-500/50'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <div className={`text-xl font-bold mb-3 ${
            sessionType === 'in-person'
              ? 'text-gray-900'
              : 'text-primary-900 dark:text-primary-100'
          }`}>
            {t('dialectic.creation.sessionType.inPerson.title')}
          </div>
          
          {/* Description */}
          <div className={`text-sm leading-relaxed ${
            sessionType === 'in-person'
              ? 'text-gray-700'
              : 'text-secondary-600 dark:text-secondary-400'
          }`}>
            {t('dialectic.creation.sessionType.inPerson.description')}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SessionTypeSelector;
