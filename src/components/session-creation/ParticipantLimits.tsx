import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ParticipantLimitsProps {
  maxParticipants: number;
  customMaxParticipants: string;
  selectedDuration: number;
  onMaxParticipantsChange: (count: number) => void;
  onCustomMaxParticipantsChange: (value: string) => void;
}

const ParticipantLimits: React.FC<ParticipantLimitsProps> = ({
  maxParticipants,
  customMaxParticipants,
  selectedDuration,
  onMaxParticipantsChange,
  onCustomMaxParticipantsChange
}) => {
  const { t } = useTranslation();

  const formatDuration = (milliseconds: number) => {
    return Math.floor(milliseconds / 60000);
  };

  const calculateInPersonSessionTime = (participantCount: number, roundLengthMinutes: number) => {
    const totalRounds = participantCount;
    const checkInTime = 2.5;
    const feedbackTime = 2.5;
    const totalPerRound = roundLengthMinutes + checkInTime + feedbackTime;
    return Math.round(totalPerRound * totalRounds);
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>💡 Tip:</strong> {t('dialectic.creation.participantLimits.tip')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[3, 4, 5, 6].map((num) => {
          const roundLengthMinutes = formatDuration(selectedDuration);
          const totalTimeMinutes = calculateInPersonSessionTime(num, roundLengthMinutes);
          
          return (
            <button
              key={num}
              onClick={() => onMaxParticipantsChange(num)}
              className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                maxParticipants === num
                  ? 'border-accent-500 bg-accent-50 shadow-xl'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
              }`}
            >
              {/* Large Number Display */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  maxParticipants === num
                    ? 'bg-accent-500 text-white shadow-accent-500/50'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}>
                  <span className="text-2xl font-bold">{num}</span>
                </div>
              </div>
              
              {/* Label */}
              <div className={`text-sm font-semibold mb-2 ${
                maxParticipants === num
                  ? 'text-gray-900'
                  : 'text-primary-900 dark:text-primary-100'
              }`}>
                {num === 4 ? t('dialectic.creation.participantLimits.recommended') : num === 5 ? t('dialectic.creation.participantLimits.maximum') : num === 6 ? t('dialectic.creation.participantLimits.splitSessions') : t('dialectic.creation.participantLimits.participants')}
              </div>
              
              {/* Time Estimate */}
              <div className={`text-xs leading-relaxed ${
                maxParticipants === num
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                ~{Math.round(totalTimeMinutes)} min
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom participant count */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {t('dialectic.creation.participantLimits.custom.label')}:
          </span>
          <input
            type="number"
            value={customMaxParticipants}
            onChange={(e) => {
              const value = e.target.value;
              onCustomMaxParticipantsChange(value);
              const numValue = parseInt(value);
              if (numValue >= 3 && numValue <= 10) {
                onMaxParticipantsChange(numValue);
              }
            }}
            placeholder={t('dialectic.creation.participantLimits.custom.placeholder')}
            className="w-24 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
            min="3"
            max="10"
          />
          {customMaxParticipants && parseInt(customMaxParticipants) >= 3 && (
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              ~{calculateInPersonSessionTime(parseInt(customMaxParticipants), formatDuration(selectedDuration))} min
            </div>
          )}
        </div>
        {customMaxParticipants && parseInt(customMaxParticipants) > 5 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>⚠️ Warning:</strong> {t('dialectic.creation.participantLimits.custom.warning')}
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> {t('dialectic.creation.participantLimits.howItWorks')}
        </p>
      </div>
    </div>
  );
};

export default ParticipantLimits;
