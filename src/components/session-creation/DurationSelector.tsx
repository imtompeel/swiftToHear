import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { DurationOption } from './types';

interface DurationSelectorProps {
  selectedDuration: number;
  customDuration: string;
  validationError: string;
  onDurationSelect: (duration: number) => void;
  onCustomDurationChange: (value: string) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  customDuration,
  validationError,
  onDurationSelect,
  onCustomDurationChange
}) => {
  const { t } = useTranslation();

  const durationOptions: DurationOption[] = [
    { value: 2 * 60 * 1000, label: '2', description: t('dialectic.creation.duration.options.2') },
    { value: 5 * 60 * 1000, label: '5', description: t('dialectic.creation.duration.options.5') },
    { value: 7 * 60 * 1000, label: '7', description: t('dialectic.creation.duration.options.7') },
    { value: 10 * 60 * 1000, label: '10', description: t('dialectic.creation.duration.options.10') },
  ];

  return (
    <div className="space-y-4" data-testid="duration-selector">

      <div className="grid grid-cols-2 gap-4">
        {durationOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onDurationSelect(option.value)}
            className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 ${
              selectedDuration === option.value
                ? 'border-accent-500 bg-accent-50 shadow-xl'
                : 'border-secondary-200 hover:border-secondary-300 hover:shadow-lg'
            }`}
            data-testid={`duration-option-${option.label}`}
          >
            {/* Large Number Display */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                selectedDuration === option.value
                  ? 'bg-accent-500 text-white shadow-accent-500/50'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}>
                <span className="text-2xl font-bold">{option.label}</span>
              </div>
            </div>
            
            {/* Duration Label */}
            <div className={`text-lg font-semibold mb-2 ${
              selectedDuration === option.value
                ? 'text-gray-900'
                : 'text-primary-900 dark:text-primary-100'
            }`}>
              {option.label} {t('dialectic.creation.duration.minute')} {t('dialectic.creation.duration.rounds')}
            </div>
            
            {/* Description */}
            <div className={`text-sm leading-relaxed ${
              selectedDuration === option.value
                ? 'text-gray-700'
                : 'text-secondary-600 dark:text-secondary-400'
            }`}>
              {option.description}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300">
          {t('dialectic.creation.duration.custom')}
        </label>
        <input
          type="number"
          value={customDuration}
          onChange={(e) => onCustomDurationChange(e.target.value)}
          placeholder={t('dialectic.creation.duration.customPlaceholder')}
          className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
          data-testid="custom-duration-input"
          min="3"
          max="30"
        />
      </div>

      {validationError && (
        <div className="text-red-600 dark:text-red-400 text-sm" role="alert">
          {validationError}
        </div>
      )}
    </div>
  );
};

export default DurationSelector;
