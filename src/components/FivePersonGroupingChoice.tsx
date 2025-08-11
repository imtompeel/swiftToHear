import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface FivePersonGroupingChoiceProps {
  onChoice: (choice: 'split' | 'together') => void;
  onCancel: () => void;
}

export const FivePersonGroupingChoice: React.FC<FivePersonGroupingChoiceProps> = ({
  onChoice,
  onCancel
}) => {
  const { t } = useTranslation();
  const [selectedChoice, setSelectedChoice] = useState<'split' | 'together' | null>(null);

  const handleConfirm = () => {
    if (selectedChoice) {
      onChoice(selectedChoice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.fivePersonChoice.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dialectic.fivePersonChoice.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Option 1: Split into 2+3 */}
          <button
            onClick={() => setSelectedChoice('split')}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              selectedChoice === 'split'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🔀</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {t('dialectic.fivePersonChoice.split.title')}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {t('dialectic.fivePersonChoice.split.badge')}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('dialectic.fivePersonChoice.split.description')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div>• {t('dialectic.fivePersonChoice.split.benefit1')}</div>
              <div>• {t('dialectic.fivePersonChoice.split.benefit2')}</div>
            </div>
          </button>

          {/* Option 2: Stay together with observers */}
          <button
            onClick={() => setSelectedChoice('together')}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              selectedChoice === 'together'
                ? 'border-green-500 bg-green-50 dark:bg-green-900'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {t('dialectic.fivePersonChoice.together.title')}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {t('dialectic.fivePersonChoice.together.badge')}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('dialectic.fivePersonChoice.together.description')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div>• {t('dialectic.fivePersonChoice.together.benefit1')}</div>
              <div>• {t('dialectic.fivePersonChoice.together.benefit2')}</div>
            </div>
          </button>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {t('dialectic.fivePersonChoice.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedChoice}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('dialectic.fivePersonChoice.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
